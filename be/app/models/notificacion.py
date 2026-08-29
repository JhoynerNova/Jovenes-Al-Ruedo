"""
Módulo: models/notificacion.py
Descripción: Modelo ORM que representa las notificaciones de los usuarios.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Notificacion(Base):
    """Modelo ORM para la tabla `notificaciones`."""

    __tablename__ = "notificaciones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    id_usr: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    tipo: Mapped[str] = mapped_column(String(50), default="sistema", nullable=False)
    leida: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    enlace: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    usuario: Mapped["User"] = relationship("User", backref="notificaciones")

    def __repr__(self) -> str:
        return f"Notificacion(id={self.id}, id_usr={self.id_usr}, titulo={self.titulo}, leida={self.leida})"
