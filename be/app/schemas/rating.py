"""
Módulo: schemas/rating.py
Descripción: Esquemas de validación Pydantic para el sistema de Calificaciones (Ratings).
"""
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class CalificacionCreate(BaseModel):
    """Esquema de entrada para crear una calificación."""
    artista_id: uuid.UUID
    convocatoria_id: Optional[int] = None
    puntuacion: int = Field(..., ge=1, le=5, description="Puntuación de 1 a 5 estrellas")
    comentario: Optional[str] = Field(None, max_length=1000)


class CalificacionOut(BaseModel):
    """Esquema de respuesta para una calificación individual."""
    id: uuid.UUID
    empresa_id: uuid.UUID
    artista_id: uuid.UUID
    convocatoria_id: Optional[int] = None
    puntuacion: int
    comentario: Optional[str] = None
    created_at: datetime
    empresa_nombre: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RatingSummaryOut(BaseModel):
    """Esquema de respuesta para el resumen de reputación de un artista."""
    artista_id: uuid.UUID
    promedio: float
    total_calificaciones: int
    calificaciones: List[CalificacionOut] = []
