"""
Módulo: core/cookies.py
Descripción: Configuración centralizada de cookies HTTPOnly para tokens JWT.
          - Ley 1581 de 2012 (Protección de Datos Personales de Colombia)
          - Ley 1273 de 2009 (Delitos Informáticos Colombia)
          - OWASP Top 10 A02 (Fallas Criptográficas) y A07 (Fallas de Autenticación)
"""

from fastapi import Response

from app.config import settings

COOKIE_SECURE = settings.ENVIRONMENT == "production"

ACCESS_TOKEN_MAX_AGE = 900  # 15 minutos

REFRESH_TOKEN_MAX_AGE = 604800  # 7 días

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Establece las cookies de autenticación HTTPOnly en la respuesta.

    Args:
        response: Objeto Response de FastAPI donde se establecen las cookies.
        access_token: Token JWT de acceso (corta duración).
        refresh_token: Token de refresco (larga duración).
    """
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_MAX_AGE,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=REFRESH_TOKEN_MAX_AGE,
        path="/api/v1/auth/refresh",
    )

def clear_auth_cookies(response: Response) -> None:
    """Elimina las cookies de autenticación (logout).

    Args:
        response: Objeto Response de FastAPI donde se borran las cookies.
    """
    response.delete_cookie(key="access_token", path="/")

    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")
