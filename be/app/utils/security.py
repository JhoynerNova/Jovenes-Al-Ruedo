"""
Módulo: utils/security.py
Descripción: Utilidades de seguridad — hashing de contraseñas y manejo de tokens JWT.
"""

import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashea una contraseña en texto plano usando bcrypt.

              queda en texto plano = vulnerabilidad CRÍTICA.

    Args:
        password: Contraseña en texto plano ingresada por el usuario.

    Returns:
        Hash bcrypt de la contraseña (~60 caracteres).
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con su hash.

    Args:
        plain_password: Contraseña en texto plano ingresada por el usuario.
        hashed_password: Hash bcrypt almacenado en la base de datos.

    Returns:
        True si la contraseña coincide, False en caso contrario.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Crea un token JWT de acceso (access token).

              en cada petición para identificarse (header Authorization: Bearer <token>).
              El token contiene el "sub" (subject = email del usuario) y "exp" (expiración).

    Args:
        data: Diccionario con los datos a incluir en el token (mínimo {"sub": email}).
        expires_delta: Tiempo de vida del token. Si no se especifica, usa el valor de config.

    Returns:
        Token JWT como string codificado.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now, "type": "access", "jti": str(uuid.uuid4())})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Crea un token JWT de refresco (refresh token).

              Por eso es importante protegerlo (httpOnly cookies en producción).

    Args:
        data: Diccionario con los datos a incluir (mínimo {"sub": email}).
        expires_delta: Tiempo de vida. Si no se especifica, usa el valor de config.

    Returns:
        Token JWT de refresco como string.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": now, "type": "refresh", "jti": str(uuid.uuid4())})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt

def decode_token(token: str) -> dict | None:
    """Decodifica y verifica un token JWT.

    Args:
        token: Token JWT como string.

    Returns:
        Diccionario con los datos del token (payload) si es válido, None si no lo es.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        return None
