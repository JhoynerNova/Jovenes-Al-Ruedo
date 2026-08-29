from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import uuid
import os
from pathlib import Path

router = APIRouter(prefix="/api/v1/upload", tags=["Uploads"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_PDF = ["jpg", "jpeg", "png", "webp", "pdf"]
ALLOWED_AUDIO = ["mp3", "wav", "ogg", "m4a"]
ALLOWED_VIDEO = ["mp4", "mov", "avi", "mkv"]

# ¿Qué? Límite de archivos por request en la carga masiva.
# ¿Para qué? Evitar que un usuario suba cientos de archivos en un solo request y sature
#            el disco o la memoria del servidor.
MAX_BULK_FILES = 10


def _validate_and_save(file: UploadFile) -> str:
    """Valida extensión/tamaño y guarda un archivo. Retorna su URL relativa.

    ¿Qué? Lógica compartida entre la subida individual y la subida masiva.
    ¿Para qué? Evitar duplicar las reglas de validación en dos endpoints — si cambia
              un límite de tamaño o una extensión permitida, solo se edita aquí.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in (ALLOWED_IMAGE_PDF + ALLOWED_AUDIO + ALLOWED_VIDEO):
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido: '{file.filename}'. Solo imágenes, PDFs, audios y videos.",
        )

    file_size = file.size
    if ext in ALLOWED_VIDEO:
        max_size = 50 * 1024 * 1024  # 50MB
        if file_size > max_size:
            raise HTTPException(status_code=400, detail=f"'{file.filename}' excede el tamaño máximo de video (50MB).")
    elif ext in ALLOWED_AUDIO:
        max_size = 15 * 1024 * 1024  # 15MB
        if file_size > max_size:
            raise HTTPException(status_code=400, detail=f"'{file.filename}' excede el tamaño máximo de audio (15MB).")
    else:
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            raise HTTPException(status_code=400, detail=f"'{file.filename}' excede el tamaño máximo permitido (10MB).")

    unique_filename = f"{uuid.uuid4().hex}_{file.filename.replace(' ', '_')}"
    file_path = UPLOAD_DIR / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/{unique_filename}"


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    return {"url": _validate_and_save(file)}


@router.post("/bulk", summary="Carga masiva de archivos")
async def upload_files_bulk(files: list[UploadFile] = File(...)):
    """Sube varios archivos en un solo request (ej: varias piezas de un portafolio).

    ¿Qué? Valida y guarda cada archivo individualmente; si uno falla, los demás igual
          se procesan — la respuesta reporta éxitos y fallos por separado.
    ¿Para qué? El usuario no pierde toda la carga por un solo archivo inválido
              (ej: subir 8 fotos válidas + 1 video demasiado pesado).
    ¿Impacto? MAX_BULK_FILES limita el abuso — sin esto, un request con cientos de
              archivos podría saturar disco/memoria del servidor.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No se enviaron archivos")
    if len(files) > MAX_BULK_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Máximo {MAX_BULK_FILES} archivos por carga masiva (se enviaron {len(files)})",
        )

    resultados = []
    errores = []
    for file in files:
        try:
            url = _validate_and_save(file)
            resultados.append({"filename": file.filename, "url": url})
        except HTTPException as exc:
            errores.append({"filename": file.filename, "error": exc.detail})

    return {"subidos": resultados, "errores": errores, "total": len(files), "exitosos": len(resultados)}
