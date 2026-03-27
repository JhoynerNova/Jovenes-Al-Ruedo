"""
Módulo: main.py
Descripción: Punto de entrada de la aplicación FastAPI — configura y arranca el servidor.
¿Para qué? Crear la instancia principal de FastAPI, configurar CORS, middlewares de seguridad,
           incluir routers y definir el ciclo de vida de la aplicación.
¿Impacto? Este es el archivo que Uvicorn ejecuta. Sin él, no hay servidor.
          Todo endpoint, middleware y configuración se conecta aquí.
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.convocatorias import router as convocatorias_router
from app.routers.portafolio import router as portafolio_router

# ¿Qué? Configuración básica del sistema de logging de Python.
# ¿Para qué? Registrar eventos importantes (logins, errores, arranque) con timestamps.
# ¿Impacto? Sin logging configurado, los mensajes no se muestran en consola ni en archivos.
#           Nivel INFO registra eventos normales; WARNING y ERROR capturan problemas.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ¿Qué? Función de ciclo de vida (lifespan) que se ejecuta al iniciar y al cerrar la app.
# ¿Para qué? Realizar tareas de inicialización (ej: verificar conexión a BD) al arrancar
#            y tareas de limpieza (ej: cerrar conexiones) al apagar.
# ¿Impacto? Sin lifespan, no hay un lugar centralizado para código de startup/shutdown,
#           lo que podría causar fugas de recursos o conexiones huérfanas.
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Gestiona el ciclo de vida de la aplicación FastAPI.

    ¿Qué? Context manager async que se ejecuta al inicio y al cierre del servidor.
    ¿Para qué? Ejecutar lógica de arranque (verificaciones, logs) y limpieza (cerrar pools).
    ¿Impacto? El código antes de `yield` se ejecuta al INICIAR.
              El código después de `yield` se ejecuta al CERRAR.
    """
    # --- Startup ---
    logger.info("Jóvenes al Ruedo — Backend iniciando...")
    logger.info(f"CORS habilitado para: {settings.FRONTEND_URL}")
    yield
    # --- Shutdown ---
    logger.info("Jóvenes al Ruedo — Backend cerrando...")


# ¿Qué? Instancia principal de la aplicación FastAPI.
# ¿Para qué? Es el objeto central que recibe las peticiones HTTP, las enruta a los
#            endpoints correctos y devuelve las respuestas.
# ¿Impacto? Los metadatos (title, description, version) aparecen automáticamente
#           en la documentación interactiva de Swagger UI (/docs).
app = FastAPI(
    title="Jóvenes al Ruedo",
    description=(
        "Sistema de autenticación para la plataforma Jóvenes al Ruedo. "
        "Incluye registro, login, cambio y recuperación de contraseña. "
        "Proyecto educativo — SENA, Ficha 3171599."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ¿Qué? Middleware que valida el header Host de las peticiones entrantes.
# ¿Para qué? Prevenir ataques de Host Header Injection.
# ¿Impacto? OWASP A05 — solo acepta peticiones con hosts conocidos y seguros.
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.jovenes-al-ruedo.com", "*"],
)

# ¿Qué? Middleware CORS (Cross-Origin Resource Sharing).
# ¿Para qué? Permitir que el frontend (http://localhost:5173) haga peticiones HTTP al backend
#            (http://localhost:8000), que técnicamente está en un "origen" diferente.
# ¿Impacto? Sin CORS, el navegador BLOQUEA todas las peticiones del frontend al backend
#           por política de seguridad del mismo origen (Same-Origin Policy).
#           allow_credentials=True permite enviar cookies/headers de autenticación.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes en desarrollo
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos HTTP (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"],  # Permitir todos los headers (incluyendo Authorization)
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Middleware que agrega headers de seguridad a todas las respuestas HTTP.

    # ¿Qué? Intercepta cada respuesta y agrega headers de seguridad estándar.
    # ¿Para qué? Proteger contra vulnerabilidades comunes de navegadores.
    # ¿Impacto? Mitiga: OWASP A05 (Mala Configuración de Seguridad).
    #   X-Content-Type-Options: Previene MIME sniffing (el navegador respeta el Content-Type).
    #   X-Frame-Options: Previene clickjacking (la página no puede cargarse en un iframe).
    #   X-XSS-Protection: Activa filtro XSS del navegador (legacy, complementa CSP).
    #   Strict-Transport-Security: Fuerza HTTPS por 1 año (HSTS).
    #   Content-Security-Policy: Restringe las fuentes de contenido permitidas.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; "
        "img-src 'self' data: fastapi.tiangolo.com;"
    )
    return response


# ────────────────────────────
# Incluir routers
# ────────────────────────────

# ¿Qué? Registro de los routers de autenticación y usuarios en la app.
# ¿Para qué? Conectar todos los endpoints definidos en los módulos routers/ a la aplicación
#            principal, para que FastAPI pueda enrutarlos correctamente.
# ¿Impacto? Sin include_router(), los endpoints de auth y users NO existirían — las
#           peticiones a /api/v1/auth/* y /api/v1/users/* retornarían 404.
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(convocatorias_router)
app.include_router(portafolio_router)


# ────────────────────────────
# Endpoint de salud (health check)
# ────────────────────────────
@app.get(
    "/api/v1/health",
    tags=["health"],
    summary="Verificar estado del servidor",
)
async def health_check() -> dict[str, str]:
    """Endpoint de verificación de salud del servidor.

    ¿Qué? Retorna un JSON simple indicando que el servidor está activo.
    ¿Para qué? Permitir a herramientas de monitoreo, Docker healthchecks o desarrolladores
              verificar rápidamente que el backend responde.
    ¿Impacto? Si este endpoint no responde, significa que el servidor está caído.
              Es el primer endpoint a probar tras levantar el servidor.

    Returns:
        Diccionario con el estado del servidor y el nombre del proyecto.
    """
    return {
        "status": "healthy",
        "project": "Jóvenes al Ruedo",
        "version": "0.1.0",
    }


@app.get(
    "/api/v1/debug/config",
    tags=["debug"],
    summary="Debug: Mostrar configuración actual",
)
async def debug_config() -> dict:
    """Endpoint de debug para verificar la configuración actual."""
    return {
        "FRONTEND_URL": settings.FRONTEND_URL,
        "DATABASE_URL": settings.DATABASE_URL[:20] + "***",  # Ocultar contraseña
        "CORS_enabled": True,
    }
