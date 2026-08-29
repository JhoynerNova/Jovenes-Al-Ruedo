"""
Módulo: models/rating.py
Descripción: Modelo ORM para la tabla `calificaciones` (Ratings & Reviews).
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, Integer, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Calificacion(Base):
    """Modelo ORM para la tabla `calificaciones`.
    
    ¿Qué? Almacena valoraciones de 1 a 5 estrellas y reseñas hechas por empresas a los artistas.
    ¿Para qué? Calcular el promedio de reputación y mostrar opiniones comprobadas.
    """
    __tablename__ = "calificaciones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    empresa_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    artista_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    convocatoria_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("conv.id_conv", ondelete="SET NULL"),
        nullable=True,
    )
    puntuacion: Mapped[int] = mapped_column(Integer, nullable=False)
    comentario: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    empresa: Mapped["User"] = relationship("User", foreign_keys=[empresa_id])
    artista: Mapped["User"] = relationship("User", foreign_keys=[artista_id])
    convocatoria: Mapped[Optional["Conv"]] = relationship("Conv")

    def __repr__(self) -> str:
        return f"Calificacion(id={self.id}, puntuacion={self.puntuacion}, artista={self.artista_id})"
