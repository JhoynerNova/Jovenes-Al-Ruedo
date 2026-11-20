"""
Módulo: models/user.py
Descripción: Modelo ORM que representa la tabla `users` en PostgreSQL.
"""

import uuid
from datetime import datetime, date
from typing import List

from sqlalchemy import JSON, Boolean, Date, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class User(Base):
    """Modelo ORM para la tabla `users`.

              SQLAlchemy traduce operaciones Python (crear User, query, update)
              a sentencias SQL automáticamente.
              La contraseña se guarda como hash bcrypt (columna hashed_password),
              NUNCA en texto plano.
    """

    __tablename__ = "users"

    # ────────────────────────────
    # Columnas
    # ────────────────────────────

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    first_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    birth_date: Mapped[date] = mapped_column(
        Date,
        nullable=True,
    )

    artistic_area: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )
    
    sector: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )
    
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    profile_pic_url: Mapped[str] = mapped_column(String(500), nullable=True)
    cover_pic_url: Mapped[str] = mapped_column(String(500), nullable=True)

    social_links: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    artistic_disciplines: Mapped[list | None] = mapped_column(JSON, nullable=True)

    looking_for_disciplines: Mapped[list | None] = mapped_column(JSON, nullable=True)

    company_legal_name: Mapped[str] = mapped_column(String(200), nullable=True)

    company_nit: Mapped[str] = mapped_column(String(30), nullable=True)

    company_size: Mapped[str] = mapped_column(String(30), nullable=True)

    onboarding_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        default="artista",
        server_default="artista",
        nullable=False,
    )

    color_palette: Mapped[str] = mapped_column(String(50), nullable=True)

    customization: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    profile_views: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    sessions_invalidated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    privacy_accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ════════════════════════════════════════
    # Relaciones ORM
    # ════════════════════════════════════════

    habilidades: Mapped[List["RelUsrHab"]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )

    portafolios: Mapped[List["Portafolio"]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )

    convocatorias: Mapped[List["Conv"]] = relationship(
        foreign_keys="Conv.id_usr", back_populates="empresa", cascade="all, delete-orphan"
    )

    inscripciones: Mapped[List["Inscripcion"]] = relationship(
        foreign_keys="Inscripcion.id_usr", back_populates="usuario", cascade="all, delete-orphan"
    )

    evaluaciones: Mapped[List["DetConv"]] = relationship(
        foreign_keys="DetConv.id_usr", back_populates="usuario", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """Representación legible del usuario para debugging."""
        return f"User(id={self.id}, email={self.email}, is_active={self.is_active})"

    @property
    def full_name(self) -> str:
        """Propiedad calculada para compatibilidad con el frontend."""
        return f"{self.first_name} {self.last_name}".strip()
