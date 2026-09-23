"""
Módulo: models/revoked_token.py
Descripción: Modelo ORM que representa la tabla `revoked_tokens` en PostgreSQL.
¿Para qué? Los JWT son "stateless" — el servidor no sabe si un token sigue siendo válido
           hasta que expira por su cuenta. Esta tabla guarda el identificador (jti) de los
           tokens que fueron invalidados manualmente (logout, rotación de refresh token),
           para poder rechazarlos aunque su firma y expiración sigan siendo válidas.
¿Impacto? Sin esta tabla, hacer logout solo borra las cookies del navegador — un token
          robado antes del logout seguiría siendo aceptado por la API hasta que expire.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RevokedToken(Base):
    """Modelo ORM para la tabla `revoked_tokens`.

    ¿Qué? Cada fila representa un JWT (access o refresh) invalidado antes de su expiración.
    ¿Para qué? Permitir que get_current_user y refresh_access_token rechacen tokens
              que fueron revocados, aunque técnicamente sigan "vigentes" según su exp.
    ¿Impacto? Se limpia por sí sola: solo importa mientras expires_at no haya pasado,
              después el propio JWT ya sería rechazado por expiración.
    """

    __tablename__ = "revoked_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ¿Qué? "jti" (JWT ID) — claim único generado al crear cada token.
    # ¿Para qué? Identificar un token específico sin guardar el JWT completo (que puede
    #            contener datos sensibles) — solo su identificador único.
    # ¿Impacto? UNIQUE + INDEX: búsqueda O(1) al validar cada request.
    jti: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        nullable=False,
    )

    # ¿Qué? Fecha de expiración original del token (copiada del claim "exp").
    # ¿Para qué? Permite limpiar filas viejas de la tabla con un job de mantenimiento
    #            (no implementado aún) sin arriesgar borrar tokens todavía vigentes.
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
