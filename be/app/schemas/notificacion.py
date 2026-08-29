"""Schemas Pydantic para el módulo de Notificaciones."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificacionCreate(BaseModel):
    id_usr: uuid.UUID
    titulo: str
    mensaje: str
    tipo: str = "sistema"
    enlace: Optional[str] = None


class NotificacionResponse(BaseModel):
    id: uuid.UUID
    id_usr: uuid.UUID
    titulo: str
    mensaje: str
    tipo: str
    leida: bool
    enlace: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UnreadCountResponse(BaseModel):
    unread_count: int
