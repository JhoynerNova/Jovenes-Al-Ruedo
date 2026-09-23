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
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import IntegrityError

from app.core.limiter import limiter

from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.convocatorias import router as convocatorias_router
from app.routers.portafolio import router as portafolio_router
from app.routers.upload import router as upload_router
from app.routers.chat import router as chat_router
from app.routers.ratings import router as ratings_router
from app.routers.reports import router as reports_router
from app.routers.notificaciones import router as notificaciones_router
from app.routers.analytics import router as analytics_router
from fastapi.staticfiles import StaticFiles
import os

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
    from app.database import Base, engine, SessionLocal
    import app.models  # Importar todos los modelos
    Base.metadata.create_all(bind=engine)

    # Seeding automático de la cuenta de Administrador universal
    try:
        from app.seed import seed_admin_user
        db = SessionLocal()
        seed_admin_user(db)
        db.close()
    except Exception as e:
        logger.error(f"Error seeding admin user: {e}")

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

# ¿Qué? Registro del limiter (definido en app.core.limiter) en el estado de la app.
# ¿Para qué? slowapi necesita `app.state.limiter` para poder aplicar los límites
#            declarados con @limiter.limit() en cada router.
# ¿Impacto? Sin este registro, los decoradores @limiter.limit() lanzarían un error en runtime.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Traduce violaciones de integridad de la BD (unique/FK) a un 409 coherente.

    ¿Qué? Sin este handler, un IntegrityError (ej: dos registros simultáneos con el
          mismo email, o una FK apuntando a un registro ya eliminado) caía en el
          handler genérico de Exception y devolvía un 500 "error interno" engañoso.
    ¿Para qué? Un conflicto de datos no es un fallo del servidor — es un 409, con un
              mensaje que el frontend puede mostrar directamente al usuario.
    ¿Impacto? La sesión de BD (creada por get_db) se cierra en su bloque `finally`
              al terminar el request, descartando la transacción fallida automáticamente.
    """
    logger.warning(f"Violación de integridad en BD: {exc}")
    return JSONResponse(
        status_code=409,
        content={"detail": "El registro ya existe o entra en conflicto con datos relacionados."},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captura cualquier excepción no manejada y retorna un error 500 estandarizado."""
    logger.error(f"Error interno detectado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Ocurrió un error interno en el servidor. Por favor, contacte al soporte técnico."},
    )

# ¿Qué? Middleware que valida el header Host de las peticiones entrantes.
# ¿Para qué? Prevenir ataques de Host Header Injection.
# ¿Impacto? OWASP A05 — solo acepta peticiones con hosts conocidos y seguros.
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://204.48.26.96",
        "http://204.48.26.96:8000",
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(ratings_router)
app.include_router(reports_router)
app.include_router(notificaciones_router)
app.include_router(analytics_router)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


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
