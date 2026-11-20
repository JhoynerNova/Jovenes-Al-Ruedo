"""
Módulo: services/auth_service.py
Descripción: Lógica de negocio para todas las operaciones de autenticación —
             registro, login, cambio de contraseña y recuperación.
           reciben requests y llaman al service; el service contiene TODA la lógica.
          Separar esta lógica facilita testing (se puede testear sin HTTP) y reutilización.
"""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.user import (
    ChangePasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
)
from app.utils.email import send_password_reset_email
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.utils.token_blacklist import exp_to_datetime, is_token_revoked, revoke_token

def register_user(db: Session, user_data: UserCreate) -> User:
    """Registra un nuevo usuario en el sistema.

    Args:
        db: Sesión de base de datos.
        user_data: Datos validados del usuario (email, full_name, password).

    Returns:
        Objeto User creado y persistido en la BD.

    Raises:
        HTTPException 400: Si el email ya está registrado.
    """
    # Buscar si ya existe un usuario con ese email a través del repositorio
    existing_user = user_repository.get_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    default_palette = "blue" # Color por defecto para empresas o sin área
    if user_data.role == "artista" and user_data.artistic_area:
        area_colors = {
            "música": "blue",
            "danza": "purple",
            "teatro": "red",
            "artes plásticas": "green",
            "literatura": "amber",
            "artes audiovisuales": "pink"
        }
        # Buscar color o usar azul por defecto si no coincide exactamente
        default_palette = area_colors.get(user_data.artistic_area.lower(), "blue")

    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name.upper(),
        last_name=user_data.last_name.upper(),
        color_palette=default_palette,
        role=user_data.role,
        sector=user_data.sector,
        birth_date=user_data.birth_date,
        artistic_area=user_data.artistic_area,
        hashed_password=hash_password(user_data.password),
        privacy_accepted_at=datetime.now(timezone.utc),
    )

    return user_repository.create(db, new_user)

def login_user(db: Session, login_data: UserLogin) -> TokenResponse:
    """Autentica un usuario y retorna tokens JWT.

              Los mensajes de error son GENÉRICOS ("credenciales inválidas") para no revelar
              si el email existe o no (previene enumeración de usuarios).

    Args:
        db: Sesión de base de datos.
        login_data: Credenciales del usuario (email, password).

    Returns:
        TokenResponse con access_token, refresh_token y token_type.

    Raises:
        HTTPException 401: Si las credenciales son inválidas.
    """
    # Buscar usuario por email mediante UserRepository
    user = user_repository.get_by_email(db, login_data.email)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada. Contacte al administrador.",
        )

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )

def refresh_access_token(db: Session, refresh_token: str) -> TokenResponse:
    """Genera un nuevo access token usando un refresh token válido.

              Se genera un NUEVO refresh token (rotación) para mayor seguridad.

    Args:
        db: Sesión de base de datos.
        refresh_token: Token JWT de refresco.

    Returns:
        TokenResponse con nuevos access_token y refresh_token.

    Raises:
        HTTPException 401: Si el refresh token es inválido o expirado.
    """
    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    old_jti = payload.get("jti")
    if old_jti and is_token_revoked(db, old_jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str | None = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin identificador de usuario",
        )

    # Verificar que el usuario aún existe y está activo vía UserRepository
    user = user_repository.get_by_email(db, email)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o cuenta desactivada",
        )

    iat = payload.get("iat")
    if user.sessions_invalidated_at and iat:
        issued_at = datetime.fromtimestamp(iat, tz=timezone.utc)
        if issued_at < user.sessions_invalidated_at:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido o expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )

    new_access = create_access_token(data={"sub": user.email})
    new_refresh = create_refresh_token(data={"sub": user.email})

    if old_jti and (exp := payload.get("exp")):
        revoke_token(db, old_jti, exp_to_datetime(exp))

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
    )

def change_password(db: Session, user: User, password_data: ChangePasswordRequest) -> None:
    """Cambia la contraseña de un usuario autenticado.

    Args:
        db: Sesión de base de datos.
        user: Objeto User del usuario autenticado (obtenido vía get_current_user).
        password_data: Contraseña actual y nueva contraseña.

    Raises:
        HTTPException 400: Si la contraseña actual es incorrecta.
    """
    if not verify_password(password_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta",
        )

    user.hashed_password = hash_password(password_data.new_password)
    db.commit()

async def request_password_reset(db: Session, email: str) -> None:
    """Solicita un email de recuperación de contraseña.

              Esto previene la enumeración de usuarios (un atacante no puede saber
              si un email está registrado basándose en la respuesta).

    Args:
        db: Sesión de base de datos.
        email: Email del usuario que solicita la recuperación.
    """
    user = user_repository.get_by_email(db, email)

    if not user:
        return

    reset_token = str(uuid.uuid4())

    token_record = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )

    db.add(token_record)
    db.commit()

    await send_password_reset_email(email=user.email, token=reset_token)

def reset_password(db: Session, reset_data: ResetPasswordRequest) -> None:
    """Restablece la contraseña usando un token de recuperación.

    Args:
        db: Sesión de base de datos.
        reset_data: Token de reset y nueva contraseña.

    Raises:
        HTTPException 400: Si el token es inválido, expirado o ya fue usado.
    """
    stmt = select(PasswordResetToken).where(
        PasswordResetToken.token == reset_data.token
    )
    token_record = db.execute(stmt).scalar_one_or_none()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de recuperación inválido",
        )

    if token_record.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este token de recuperación ya fue utilizado",
        )

    expires_at = token_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de recuperación ha expirado. Solicite uno nuevo.",
        )

    user = user_repository.get_by_id(db, token_record.user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no encontrado",
        )

    user.hashed_password = hash_password(reset_data.new_password)
    token_record.used = True
    db.commit()
