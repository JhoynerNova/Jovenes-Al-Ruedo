"""
Módulo: repositories/rating_repository.py
Descripción: Repositorio para la entidad Calificacion.
"""

from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.rating import Calificacion
from app.models.user import User


class RatingRepository:
    """Encapsula operaciones de persistencia para calificaciones y reseñas."""

    @staticmethod
    def create_rating(db: Session, calificacion: Calificacion) -> Calificacion:
        """Persiste una nueva calificación."""
        db.add(calificacion)
        db.commit()
        db.refresh(calificacion)
        return calificacion

    @staticmethod
    def list_by_artist(db: Session, artist_id: Optional[uuid.UUID]) -> List[Calificacion]:
        """Retorna todas las calificaciones de un artista ordenadas por fecha."""
        stmt = select(Calificacion)
        if artist_id:
            stmt = stmt.where(Calificacion.artista_id == artist_id)
        stmt = stmt.order_by(Calificacion.created_at.desc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        """Busca un usuario por clave primaria."""
        return db.get(User, user_id)

    @staticmethod
    def list_artists(db: Session) -> List[User]:
        """Busca todos los usuarios con rol artista."""
        stmt = select(User).where(User.role == "artista")
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create_user(db: Session, user: User) -> User:
        """Crea un usuario (fallback para pruebas locales)."""
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


rating_repository = RatingRepository()
