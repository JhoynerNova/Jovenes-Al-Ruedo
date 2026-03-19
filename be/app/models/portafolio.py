"""
Módulo: models/portafolio.py
Descripción: Portafolios de artistas y sus archivos.
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, ForeignKey, CheckConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Portafolio(Base):
    __tablename__ = "portafolio"

    id_port:    Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    nombre:     Mapped[str]      = mapped_column(String(150), nullable=False)
    id_usr:     Mapped[str]      = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    archivos: Mapped[List["DetPortafolio"]] = relationship(back_populates="portafolio", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"Portafolio(id={self.id_port}, nombre={self.nombre})"


class DetPortafolio(Base):
    __tablename__ = "det_portafolio"
    __table_args__ = (
        CheckConstraint("estado IN ('G', 'P')", name="chk_estado_port"),
    )

    id_det_p:   Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    id_port:    Mapped[int]      = mapped_column(ForeignKey("portafolio.id_port", ondelete="CASCADE"), nullable=False)
    archivo:    Mapped[str]      = mapped_column(String(255), nullable=False)
    estado:     Mapped[str]      = mapped_column(String(1), nullable=False, default="G")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    portafolio: Mapped["Portafolio"] = relationship(back_populates="archivos")

    def __repr__(self) -> str:
        return f"DetPortafolio(archivo={self.archivo}, estado={self.estado})"