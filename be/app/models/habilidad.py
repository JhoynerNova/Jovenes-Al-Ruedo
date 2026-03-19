"""
Módulo: models/habilidad.py
Descripción: Modelo ORM para la tabla `habilidades` — catálogo de habilidades artísticas.
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from app.database import Base


class Habilidad(Base):
    __tablename__ = "habilidades"

    id_hab: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    usuarios: Mapped[List["RelUsrHab"]] = relationship(back_populates="habilidad", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"Habilidad(id={self.id_hab}, nombre={self.nombre})"