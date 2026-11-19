from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import uuid
import os
import re
from pathlib import Path

router = APIRouter(prefix="/api/v1/upload", tags=["Uploads"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_PDF = ["jpg", "jpeg", "png", "webp", "pdf"]
ALLOWED_AUDIO = ["mp3", "wav", "ogg", "m4a"]
ALLOWED_VIDEO = ["mp4", "mov", "avi", "mkv"]

MAX_BULK_FILES = 10


def _sanitize_filename(filename: str) -> str:
    """Elimina secuencias de path traversal (../, ..\\, etc.) y caracteres no alfanuméricos peligrosos."""
    base = os.path.basename(filename)
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
    clean = clean.lstrip(".")
    return clean if clean else "archivo_sin_nombre"


def _is_valid_magic_bytes(header: bytes, ext: str) -> bool:
    """Valida la firma binaria real del contenido (magic bytes) para evitar suplantación de tipo MIME."""
    if ext in ["jpg", "jpeg"]:
        return header.startswith(b"\xff\xd8\xff")
    elif ext == "png":
        return header.startswith(b"\x89PNG\r\n\x1a\n")
    elif ext == "webp":
        return len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP"
    elif ext == "pdf":
        return header.startswith(b"%PDF-")
    elif ext == "mp3":
        return header.startswith(b"ID3") or header.startswith(b"\xff\xfb") or header.startswith(b"\xff\xf3") or header.startswith(b"\xff\xf2")
    elif ext == "wav":
        return len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WAVE"
    elif ext == "ogg":
        return header.startswith(b"OggS")
    elif ext in ["mp4", "m4a", "mov"]:
        return len(header) >= 8 and (b"ftyp" in header[:16] or b"moov" in header[:32])
    elif ext in ["mkv"]:
        return header.startswith(b"\x1aE\xdf\xa3")
    elif ext == "avi":
        return len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"AVI "
    return False


def _validate_and_save(file: UploadFile) -> str:
    """Valida extensión, tamaño real y firma MIME (magic bytes); sanitiza el nombre y guarda el archivo."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    safe_base = _sanitize_filename(file.filename)
    ext = safe_base.split(".")[-1].lower() if "." in safe_base else ""
    if ext not in (ALLOWED_IMAGE_PDF + ALLOWED_AUDIO + ALLOWED_VIDEO):
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido: '{file.filename}'. Solo imágenes, PDFs, audios y videos.",
        )

    # Validar tamaño real sin depender exclusivamente de Content-Length/file.size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

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

    # Validación de magic bytes si el archivo contiene datos
    if file_size > 0:
        header = file.file.read(64)
        file.file.seek(0)
        if not _is_valid_magic_bytes(header, ext):
            raise HTTPException(
                status_code=400,
                detail=f"El contenido del archivo '{file.filename}' no coincide con su extensión '{ext}' (firma MIME inválida).",
            )

    unique_filename = f"{uuid.uuid4().hex}_{safe_base}"
    file_path = UPLOAD_DIR / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/{unique_filename}"


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    return {"url": _validate_and_save(file)}


@router.post("/bulk", summary="Carga masiva de archivos")
async def upload_files_bulk(files: list[UploadFile] = File(...)):
    """Sube varios archivos en un solo request (ej: varias piezas de un portafolio)."""
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
