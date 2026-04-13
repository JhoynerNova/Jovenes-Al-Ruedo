"""
Módulo: models/chat.py
Descripción: Modelo para los mensajes del chat.
Los mensajes están vinculados a una Conversacion (no directamente a una inscripción).
"""
from sqlalchemy import ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import uuid
from app.database import Base


class Mensaje(Base):
    __tablename__ = "mensaje"

    id_msg: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_conversacion: Mapped[int] = mapped_column(
        ForeignKey("conversacion.id_conversacion", ondelete="CASCADE"),
        nullable=False,
    )
    remitente_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    contenido: Mapped[str] = mapped_column(Text, nullable=False)
    leido: Mapped[bool] = mapped_column(
        default=False, server_default="false", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    conversacion = relationship("Conversacion", back_populates="mensajes")
    remitente = relationship("User")

    def __repr__(self) -> str:
        return (
            f"Mensaje(id={self.id_msg}, conv={self.id_conversacion}, "
            f"remit={self.remitente_id})"
        )
