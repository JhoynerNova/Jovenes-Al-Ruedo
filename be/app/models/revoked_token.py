"""
Módulo: models/revoked_token.py
Descripción: Modelo ORM que representa la tabla `revoked_tokens` en PostgreSQL.
           hasta que expira por su cuenta. Esta tabla guarda el identificador (jti) de los
           tokens que fueron invalidados manualmente (logout, rotación de refresh token),
           para poder rechazarlos aunque su firma y expiración sigan siendo válidas.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class RevokedToken(Base):
    """Modelo ORM para la tabla `revoked_tokens`.
    """

    __tablename__ = "revoked_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    jti: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        nullable=False,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    revoked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"RevokedToken(jti={self.jti}, expires_at={self.expires_at})"
