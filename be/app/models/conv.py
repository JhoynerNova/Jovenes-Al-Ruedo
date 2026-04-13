"""
Módulo: models/conv.py
Descripción: Convocatorias, evaluaciones e inscripciones.
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Conv(Base):
    __tablename__ = "conv"

    id_conv:    Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    nombre:     Mapped[str]           = mapped_column(String(150), nullable=False)
    glue:       Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    nivel_experiencia: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    tipo_jornada: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    rango_salarial: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ubicacion:  Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    id_usr:     Mapped[str]           = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    evaluaciones: Mapped[List["DetConv"]]   = relationship(back_populates="convocatoria", cascade="all, delete-orphan")
    inscritos:    Mapped[List["Inscripcion"]]= relationship(back_populates="convocatoria", cascade="all, delete-orphan")

    # ¿Qué? Relación hacia el usuario (empresa) que creó la convocatoria.
    # ¿Para qué? Acceder a los datos de la empresa con conv.empresa.
    # ¿Impacto? Permite mostrar el nombre de la empresa junto a la convocatoria.
    empresa: Mapped["User"] = relationship(
        foreign_keys=[id_usr], back_populates="convocatorias"
    )

    def __repr__(self) -> str:
        return f"Conv(id={self.id_conv}, nombre={self.nombre})"


class DetConv(Base):
    __tablename__ = "det_conv"

    id_dc:      Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    id_conv:    Mapped[int]           = mapped_column(ForeignKey("conv.id_conv",  ondelete="CASCADE"), nullable=False)
    id_usr:     Mapped[str]           = mapped_column(ForeignKey("users.id",      ondelete="CASCADE"), nullable=False)
    obsr:       Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    convocatoria: Mapped["Conv"] = relationship(back_populates="evaluaciones")

    # ¿Qué? Relación hacia el usuario evaluado en esta entrada de det_conv.
    # ¿Para qué? Acceder a los datos del artista evaluado con det_conv.usuario.
    # ¿Impacto? Permite navegar desde una evaluación hasta el perfil del artista.
    usuario: Mapped["User"] = relationship(
        foreign_keys=[id_usr], back_populates="evaluaciones"
    )

    def __repr__(self) -> str:
        return f"DetConv(conv={self.id_conv}, usr={self.id_usr})"


class Inscripcion(Base):
    __tablename__ = "inscripcion"
    __table_args__ = (
        UniqueConstraint("id_conv", "id_usr", name="uq_inscripcion"),
    )

    id_i:       Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    id_conv:    Mapped[int]      = mapped_column(ForeignKey("conv.id_conv", ondelete="CASCADE"), nullable=False)
    id_usr:     Mapped[str]      = mapped_column(ForeignKey("users.id",     ondelete="CASCADE"), nullable=False)
    estado:     Mapped[str]      = mapped_column(String(50), default="Enviada", server_default="Enviada", nullable=False)
    carta_presentacion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    id_portafolio_interno: Mapped[Optional[int]] = mapped_column(ForeignKey("portafolio.id_port", ondelete="SET NULL"), nullable=True)
    cv_url:     Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    convocatoria: Mapped["Conv"] = relationship(back_populates="inscritos")
    portafolio_adjunto: Mapped[Optional["Portafolio"]] = relationship("Portafolio")
    conversaciones: Mapped[list["Conversacion"]] = relationship("Conversacion", foreign_keys="Conversacion.id_i", cascade="all, delete-orphan")

    # ¿Qué? Relación hacia el artista inscrito en la convocatoria.
    # ¿Para qué? Acceder al perfil del artista postulado con inscripcion.usuario.
    # ¿Impacto? Permite a la empresa ver el perfil completo del artista inscrito.
    usuario: Mapped["User"] = relationship(
        foreign_keys=[id_usr], back_populates="inscripciones"
    )

    def __repr__(self) -> str:
        return f"Inscripcion(conv={self.id_conv}, usr={self.id_usr})"