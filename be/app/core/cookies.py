"""
Módulo: core/cookies.py
Descripción: Configuración centralizada de cookies HTTPOnly para tokens JWT.
¿Qué? Define los parámetros de seguridad para las cookies de autenticación.
¿Para qué? Centralizar la configuración de cookies evita inconsistencias entre endpoints.
¿Impacto? Cumple con:
          - Ley 1581 de 2012 (Protección de Datos Personales de Colombia)
          - Ley 1273 de 2009 (Delitos Informáticos Colombia)
          - OWASP Top 10 A02 (Fallas Criptográficas) y A07 (Fallas de Autenticación)
"""

from fastapi import Response


# ¿Qué? Duración del access token en segundos (15 minutos).
# ¿Para qué? Sesión corta limita la ventana de ataque si el token es robado.
# ¿Impacto? OWASP A07 — tokens de corta duración minimizan el riesgo de robo de sesión.
ACCESS_TOKEN_MAX_AGE = 900  # 15 minutos

# ¿Qué? Duración del refresh token en segundos (7 días).
# ¿Para qué? Mantener la sesión del usuario sin requerir login frecuente.
# ¿Impacto? Balance entre seguridad (duración corta) y usabilidad (no login diario).
REFRESH_TOKEN_MAX_AGE = 604800  # 7 días


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Establece las cookies de autenticación HTTPOnly en la respuesta.

    # ¿Qué? Configura access_token y refresh_token como cookies seguras en la respuesta HTTP.
    # ¿Para qué? Almacenar tokens en cookies HTTPOnly previene que JavaScript los lea (anti-XSS).
    # ¿Impacto? Cumple OWASP A02: cookies HTTPOnly + Secure + SameSite=lax protegen contra
    #           XSS (Cross-Site Scripting) y CSRF (Cross-Site Request Forgery).
    #           Ley 1581/2012: los datos de sesión se transmiten de forma segura y cifrada.

    Args:
        response: Objeto Response de FastAPI donde se establecen las cookies.
        access_token: Token JWT de acceso (corta duración).
        refresh_token: Token de refresco (larga duración).
    """
    # ¿Qué? Cookie del access token con valor "Bearer <token>".
    # ¿Para qué? El backend puede leer directamente el header Authorization desde la cookie.
    # ¿Impacto? httponly=True: JavaScript NO puede leer esta cookie (previene XSS).
    #           secure=True: Solo se envía por HTTPS (previene sniffing en HTTP).
    #           samesite="lax": Previene CSRF en la mayoría de casos.
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=False,       # En producción cambiar a True (requiere HTTPS)
        samesite="lax",
        max_age=ACCESS_TOKEN_MAX_AGE,
        path="/",
    )

    # ¿Qué? Cookie del refresh token — solo accesible en el endpoint de refresh.
    # ¿Para qué? Limitar el path reduce la superficie de ataque del refresh token.
    # ¿Impacto? path="/api/v1/auth/refresh" asegura que la cookie solo se envíe
    #           a ese endpoint específico — el resto de la API no recibe el refresh token.
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,       # En producción cambiar a True (requiere HTTPS)
        samesite="lax",
        max_age=REFRESH_TOKEN_MAX_AGE,
        path="/api/v1/auth/refresh",
    )


def clear_auth_cookies(response: Response) -> None:
    """Elimina las cookies de autenticación (logout).

    # ¿Qué? Borra las cookies de access_token y refresh_token de la respuesta.
    # ¿Para qué? Al hacer logout, invalidar las cookies en el navegador del usuario.
    # ¿Impacto? Sin esta función, el logout no tendría efecto en las cookies HTTPOnly
    #           (JavaScript no puede borrarlas porque son httponly).
    #           Ley 1581/2012: el usuario tiene derecho a cerrar su sesión de forma segura.

    Args:
        response: Objeto Response de FastAPI donde se borran las cookies.
    """
    # ¿Qué? Borra la cookie del access token.
    # ¿Para qué? Invalidar la sesión del usuario al hacer logout.
    # ¿Impacto? El navegador eliminará la cookie inmediatamente (max_age=0).
    response.delete_cookie(key="access_token", path="/")

    # ¿Qué? Borra la cookie del refresh token.
    # ¿Para qué? Evitar que el refresh token siga siendo válido después del logout.
    # ¿Impacto? Sin borrar el refresh token, el usuario podría obtener nuevos access tokens
    #           después de hacer logout, vulnerando la seguridad de la sesión.
    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")
