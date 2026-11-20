"""
Módulo: repositories/user_repository.py
Descripción: Repositorio para la entidad User — encapsula el acceso a datos y consultas SQLAlchemy.
"""

from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    """Encapsula operaciones de persistencia para la entidad User."""

    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        """Busca un usuario por su clave primaria UUID."""
        return db.get(User, user_id)

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Busca un usuario por su dirección de email (case-sensitive o normalizado)."""
        stmt = select(User).where(User.email == email)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def create(db: Session, user: User) -> User:
        """Persiste una nueva entidad User en la base de datos."""
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, user: User) -> User:
        """Actualiza el estado de una entidad User existente."""
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_artists(db: Session, skip: int = 0, limit: int = 20) -> List[User]:
        """Retorna listado de usuarios con rol artista."""
        stmt = select(User).where(User.role == "artista").offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_companies(db: Session, skip: int = 0, limit: int = 20) -> List[User]:
        """Retorna listado de usuarios con rol empresa."""
        stmt = select(User).where(User.role == "empresa").offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

user_repository = UserRepository()
