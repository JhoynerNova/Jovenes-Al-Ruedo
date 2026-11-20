"""
Módulo: schemas/conv.py
Descripción: Schemas Pydantic para convocatorias, inscripciones y evaluaciones.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

class ConvCreate(BaseModel):
    """Schema para crear una nueva convocatoria artística.
    """

    nombre: str

    glue: str | None = None
    nivel_experiencia: str | None = None
    tipo_jornada: str | None = None
    rango_salarial: str | None = None
    ubicacion: str | None = None

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        """Valida que el nombre de la convocatoria sea suficientemente descriptivo.
        """
        v = v.strip()
        if len(v) < 5:
            raise ValueError("El nombre de la convocatoria debe tener al menos 5 caracteres")
        if len(v) > 150:
            raise ValueError("El nombre de la convocatoria no puede exceder 150 caracteres")
        return v

class ConvResponse(BaseModel):
    """Schema de respuesta para una convocatoria.
    """

    id_conv: int
    nombre: str
    glue: str | None
    nivel_experiencia: str | None = None
    tipo_jornada: str | None = None
    rango_salarial: str | None = None
    ubicacion: str | None = None
    id_usr: str
    empresa_nombre: str | None = None
    empresa_sector: str | None = None
    total_inscritos: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InscripcionCreate(BaseModel):
    """Schema para que un artista se postule a una convocatoria.
    """

    carta_presentacion: str | None = None
    id_portafolio_interno: int | None = None
    cv_url: str | None = None

class InscripcionResponse(BaseModel):
    """Schema de respuesta para una inscripción.
    """

    id_i: int
    id_conv: int
    id_usr: str
    estado: str = "Enviada"
    carta_presentacion: str | None = None
    id_portafolio_interno: int | None = None
    cv_url: str | None = None
    artista_nombre: str | None = None
    artista_area: str | None = None
    artista_email: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InscripcionUpdateStatus(BaseModel):
    estado: str

class DetConvCreate(BaseModel):
    """Schema para registrar una evaluación de un candidato en una convocatoria.
    """

    id_conv: int

    id_usr: uuid.UUID

    obsr: str | None = None
