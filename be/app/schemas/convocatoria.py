"""Schemas Pydantic para convocatorias, postulaciones y evaluaciones."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ConvCreate(BaseModel):
    nombre: str
    glue: Optional[str] = None


class ConvUpdate(BaseModel):
    nombre: Optional[str] = None
    glue: Optional[str] = None


class ConvResponse(BaseModel):
    id_conv: int
    nombre: str
    glue: Optional[str] = None
    id_usr: str
    empresa_nombre: Optional[str] = None
    empresa_sector: Optional[str] = None
    created_at: datetime
    total_inscritos: int = 0

    model_config = ConfigDict(from_attributes=True)


class InscripcionResponse(BaseModel):
    id_i: int
    id_conv: int
    id_usr: str
    artista_nombre: Optional[str] = None
    artista_area: Optional[str] = None
    artista_email: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedConvResponse(BaseModel):
    items: List[ConvResponse]
    total: int
    page: int
    size: int
    pages: int
