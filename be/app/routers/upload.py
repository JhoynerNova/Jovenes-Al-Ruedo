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
        
    # Validar extensión
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    allowed_image_pdf = ["jpg", "jpeg", "png", "webp", "pdf"]
    allowed_audio = ["mp3", "wav", "ogg", "m4a"]
    allowed_video = ["mp4", "mov", "avi", "mkv"]
    
    if ext not in (allowed_image_pdf + allowed_audio + allowed_video):
        raise HTTPException(
            status_code=400, 
            detail="Tipo de archivo no permitido. Solo imágenes, PDFs, audios y videos."
        )
        
    # Validar tamaño del archivo
    file_size = file.size
    if ext in allowed_video:
        max_size = 50 * 1024 * 1024  # 50MB
        if file_size > max_size:
            raise HTTPException(status_code=400, detail="El video excede el tamaño máximo permitido (50MB).")
    elif ext in allowed_audio:
        max_size = 15 * 1024 * 1024  # 15MB
        if file_size > max_size:
            raise HTTPException(status_code=400, detail="El audio excede el tamaño máximo permitido (15MB).")
    else:
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            raise HTTPException(status_code=400, detail="El archivo excede el tamaño máximo permitido (10MB).")
        
    # Generar un nombre único para evitar colisiones
    unique_filename = f"{uuid.uuid4().hex}_{file.filename.replace(' ', '_')}"
    file_path = UPLOAD_DIR / unique_filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/uploads/{unique_filename}"}
