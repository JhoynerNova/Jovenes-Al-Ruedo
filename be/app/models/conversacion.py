"""
Módulo: models/conversacion.py
Descripción: Modelo para la tabla 'conversacion', eje central del sistema de chat.
Soporta dos tipos de conversación:
  - "postulacion": se crea automáticamente al aceptar una postulación
  - "directo": la empresa inicia contacto con un artista sin convocatoria
"""
from datetime import datetime
from typing import Optional, List
import uuid

from sqlalchemy import String, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Conversacion(Base):
    __tablename__ = "conversacion"
    __table_args__ = (
        # Evita que se creen múltiples conversaciones para la misma inscripción
        UniqueConstraint("id_i", name="uq_conversacion_inscripcion"),
    )

    id_conversacion: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )

    # "postulacion" o "directo"
    tipo: Mapped[str] = mapped_column(
        String(20), nullable=False, default="postulacion"
    )

    # Solo se llena para tipo="postulacion"
    id_i: Mapped[Optional[int]] = mapped_column(
        ForeignKey("inscripcion.id_i", ondelete="CASCADE"), nullable=True
    )

    # Participantes
    empresa_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    artista_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relaciones
    inscripcion = relationship("Inscripcion", foreign_keys=[id_i])
    empresa = relationship("User", foreign_keys=[empresa_id])
    artista = relationship("User", foreign_keys=[artista_id])
    mensajes: Mapped[List["Mensaje"]] = relationship(
        back_populates="conversacion", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"Conversacion(id={self.id_conversacion}, tipo={self.tipo}, "
            f"empresa={self.empresa_id}, artista={self.artista_id})"
        )
