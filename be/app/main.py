"""
Punto de entrada de la aplicación FastAPI para Jóvenes al Ruedo.
Configura middlewares, controladores, ciclo de vida y manejadores globales de excepciones.
"""

import logging
import os
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
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

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Gestiona tareas de inicio (inicialización de tablas y seeding) y apagado del servidor."""
    # --- Startup ---
    from app.database import Base, engine, SessionLocal
    import app.models
    Base.metadata.create_all(bind=engine)

    try:
        from app.seed import seed_admin_user
        db = SessionLocal()
        seed_admin_user(db)
        db.close()
    except Exception as e:
        logger.error(f"Error seeding admin user: {e}")

    yield

    # --- Shutdown ---
    logger.info("Jóvenes al Ruedo — Backend finalizado con éxito.")


app = FastAPI(
    title="Jóvenes al Ruedo API",
    description="API RESTful para la plataforma cultural y bolsa de empleo Jóvenes al Ruedo.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Integración del limitador de tasa (rate limiter)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Mapea violaciones de integridad en base de datos a respuestas 409 Conflict."""
    logger.warning(f"Violación de integridad en BD: {exc}")
    return JSONResponse(
        status_code=409,
        content={"detail": "El registro ya existe o entra en conflicto con datos relacionados."},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejador global de excepciones no controladas."""
    logger.error(f"Error interno detectado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Ocurrió un error interno en el servidor. Por favor, contacte al soporte técnico."},
    )


app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],
)

allowed_cors_origins = [
    origin.strip()
    for origin in [
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
    ]
    if origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Agrega cabeceras HTTP de seguridad (OWASP) a todas las respuestas."""
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


# Enrutadores principales
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

# Servir archivos estáticos subidos
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get(
    "/api/v1/health",
    tags=["health"],
    summary="Verificar estado del servidor",
)
async def health_check() -> dict[str, str]:
    """Retorna el estado de disponibilidad del backend."""
    return {
        "status": "healthy",
        "project": "Jóvenes al Ruedo",
        "version": "1.0.0",
    }
