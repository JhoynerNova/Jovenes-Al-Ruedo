"""
Módulo de repositorios — capa de persistencia y acceso a datos.
"""

from app.repositories.convocatoria_repository import convocatoria_repository
from app.repositories.user_repository import user_repository
from app.repositories.chat_repository import chat_repository
from app.repositories.portafolio_repository import portafolio_repository
from app.repositories.rating_repository import rating_repository

__all__ = [
    "convocatoria_repository",
    "user_repository",
    "chat_repository",
    "portafolio_repository",
    "rating_repository",
]
