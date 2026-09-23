"""
Módulo: utils/token_blacklist.py
Descripción: Funciones para revocar y verificar tokens JWT contra la tabla revoked_tokens.
¿Para qué? Los JWT son válidos por su firma y expiración, sin importar si el usuario hizo
           logout. Este módulo permite invalidar tokens específicos antes de su expiración
           natural (logout, rotación de refresh token).
¿Impacto? Sin esto, un token robado seguiría siendo válido hasta expirar, incluso si el
          dueño ya cerró sesión.
"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.revoked_token import RevokedToken


def revoke_token(db: Session, jti: str, expires_at: datetime) -> None:
    """Marca un token (por su jti) como revocado.

    ¿Qué? Inserta una fila en revoked_tokens con el jti y la expiración original del token.
    ¿Para qué? Usado en logout (revoca access + refresh actuales) y en la rotación de
              refresh tokens (revoca el refresh anterior para que no pueda reutilizarse).
    ¿Impacto? Si el jti ya estaba revocado, no falla — es una operación idempotente.

    Args:
        db: Sesión de base de datos.
        jti: Identificador único del token a revocar.
        expires_at: Fecha de expiración original del token (claim "exp").
    """
    stmt = select(RevokedToken).where(RevokedToken.jti == jti)
    if db.execute(stmt).scalar_one_or_none():
        return

    db.add(RevokedToken(jti=jti, expires_at=expires_at))
    db.commit()


def is_token_revoked(db: Session, jti: str) -> bool:
    """Verifica si un token (por su jti) fue revocado.

    ¿Qué? Consulta si existe una fila en revoked_tokens con ese jti.
    ¿Para qué? get_current_user y refresh_access_token la llaman en cada request para
              rechazar tokens revocados aunque su firma y expiración sigan siendo válidas.

    Args:
        db: Sesión de base de datos.
        jti: Identificador único del token a verificar.

    Returns:
        True si el token fue revocado, False en caso contrario.
    """
    stmt = select(RevokedToken).where(RevokedToken.jti == jti)
    return db.execute(stmt).scalar_one_or_none() is not None


def exp_to_datetime(exp_claim: float) -> datetime:
    """Convierte el claim "exp" (timestamp UNIX) de un JWT a datetime con timezone.

    ¿Qué? El claim "exp" de un JWT es un número (segundos desde epoch), no un datetime.
    ¿Para qué? RevokedToken.expires_at necesita un datetime timezone-aware para
              guardarse correctamente en PostgreSQL.
    """
    return datetime.fromtimestamp(exp_claim, tz=timezone.utc)
