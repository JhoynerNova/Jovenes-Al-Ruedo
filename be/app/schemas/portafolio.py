"""
Módulo: schemas/portafolio.py
Descripción: Schemas Pydantic para portafolios y archivos artísticos.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

EXTENSIONES_PERMITIDAS = {".mp3", ".mp4", ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".wav"}

class DetPortafolioCreate(BaseModel):
    """Schema para agregar un archivo a un portafolio.
    """

    archivo: str
    titulo: str | None = None
    descripcion: str | None = None
    portada_url: str | None = None
    etiquetas: str | None = None
    estado: str = "G"

    @field_validator("archivo")
    @classmethod
    def validate_archivo(cls, v: str) -> str:
        """Valida que el archivo tenga una extensión permitida.
        """
        import os
        ext = os.path.splitext(v.lower())[1]
        if ext not in EXTENSIONES_PERMITIDAS:
            raise ValueError(
                f"Extensión no permitida. Formatos aceptados: {', '.join(sorted(EXTENSIONES_PERMITIDAS))}"
            )
        return v

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, v: str) -> str:
        """Valida que el estado sea 'G' (Guardado) o 'P' (Publicado).
        """
        if v not in ("G", "P"):
            raise ValueError("El estado debe ser 'G' (Guardado) o 'P' (Publicado)")
        return v

class DetPortafolioResponse(BaseModel):
    """Schema de respuesta para un archivo de portafolio.
    """

    id_det_p: int
    id_port: int
    titulo: str | None = None
    descripcion: str | None = None
    portada_url: str | None = None
    etiquetas: str | None = None
    archivo: str
    estado: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PortafolioCreate(BaseModel):
    """Schema para crear un nuevo portafolio artístico.
    """

    nombre: str
    descripcion: str | None = None
    visibilidad: str = "Publico"

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        """Valida que el nombre del portafolio sea válido.
        """
        v = v.strip()
        if len(v) < 3:
            raise ValueError("El nombre del portafolio debe tener al menos 3 caracteres")
        if len(v) > 150:
            raise ValueError("El nombre del portafolio no puede exceder 150 caracteres")
        return v

class PortafolioResponse(BaseModel):
    """Schema de respuesta para un portafolio completo con sus archivos.
    """

    id_port: int
    nombre: str
    descripcion: str | None = None
    visibilidad: str
    id_usr: uuid.UUID
    created_at: datetime
    archivos: list[DetPortafolioResponse] = []

    model_config = ConfigDict(from_attributes=True)
