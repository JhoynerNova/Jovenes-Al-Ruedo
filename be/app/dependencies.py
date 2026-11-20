"""
Módulo: dependencies.py
Descripción: Dependencias inyectables de FastAPI — funciones reutilizables que se
             inyectan en los endpoints usando Depends().
           obtener usuario autenticado, etc.) para evitar duplicación.
"""

from collections.abc import Generator
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import decode_token
from app.utils.token_blacklist import is_token_revoked

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db() -> Generator[Session, None, None]:
    """Provee una sesión de base de datos para cada request.

    Yields:
        Session: Sesión de SQLAlchemy lista para hacer queries.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Obtiene el usuario autenticado a partir del access token JWT.

              Cualquier endpoint que use Depends(get_current_user) requiere un token válido.

    Args:
        token: Access token JWT extraído automáticamente del header Authorization.
        db: Sesión de base de datos.

    Returns:
        Objeto User del usuario autenticado.

    Raises:
        HTTPException 401: Si el token es inválido, expirado, o el usuario no existe.
        HTTPException 403: Si la cuenta del usuario está desactivada.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if not payload:
        raise credentials_exception

    if payload.get("type") != "access":
        raise credentials_exception

    jti = payload.get("jti")
    if jti and is_token_revoked(db, jti):
        raise credentials_exception

    email: str | None = payload.get("sub")
    if not email:
        raise credentials_exception

    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalar_one_or_none()

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada",
        )

    iat = payload.get("iat")
    if user.sessions_invalidated_at and iat:
        issued_at = datetime.fromtimestamp(iat, tz=timezone.utc)
        if issued_at < user.sessions_invalidated_at:
            raise credentials_exception

    return user

def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verifica que el usuario autenticado tenga el rol de administrador.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador para realizar esta acción",
        )
    return current_user
