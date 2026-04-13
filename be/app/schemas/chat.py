"""
Schemas Pydantic para el sistema de chat.
Soporta conversaciones de tipo "postulacion" y "directo".
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid


class MensajeCreate(BaseModel):
    contenido: str


class MensajeResponse(BaseModel):
    id_msg: int
    id_conversacion: int
    remitente_id: uuid.UUID
    contenido: str
    leido: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversacionResponse(BaseModel):
    id_conversacion: int
    tipo: str  # "postulacion" | "directo"
    conv_nombre: str | None = None  # nombre de la convocatoria (solo para tipo postulacion)
    otro_usuario_id: str
    otro_usuario_nombre: str
    otro_usuario_avatar: str | None = None
    otro_usuario_role: str | None = None
    ultimo_mensaje_texto: str | None = None
    ultimo_mensaje_fecha: datetime | None = None
    no_leidos: int = 0


class ConversacionDirectaCreate(BaseModel):
    artista_id: uuid.UUID
