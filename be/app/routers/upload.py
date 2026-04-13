from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import uuid
import os
from pathlib import Path

router = APIRouter(prefix="/api/v1/upload", tags=["Uploads"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
        
    # Validar extensión (opcional, por seguridad)
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ["jpg", "jpeg", "png", "webp", "pdf"]:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido. Solo imágenes y PDFs.")
        
    # Generar un nombre único para evitar colisiones
    unique_filename = f"{uuid.uuid4().hex}_{file.filename.replace(' ', '_')}"
    file_path = UPLOAD_DIR / unique_filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/uploads/{unique_filename}"}
