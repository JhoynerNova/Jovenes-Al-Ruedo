"""
Módulo: repositories/chat_repository.py
Descripción: Repositorio para entidades Conversacion y Mensaje.
"""

from typing import List, Optional, Set
import uuid
from sqlalchemy import select, or_, and_, func
from sqlalchemy.orm import Session

from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.models.user import User
from app.models.conv import Inscripcion


class ChatRepository:
    """Encapsula operaciones de persistencia para el chat y mensajería."""

    @staticmethod
    def get_conversacion(db: Session, id_conversacion: int) -> Optional[Conversacion]:
        """Obtiene una conversación por ID."""
        return db.get(Conversacion, id_conversacion)

    @staticmethod
    def list_conversaciones_for_user(
        db: Session, user_uid: uuid.UUID, is_admin: bool = False
    ) -> List[Conversacion]:
        """Retorna todas las conversaciones donde participa el usuario (o todas las de soporte si es admin)."""
        if is_admin:
            stmt = select(Conversacion).where(
                or_(
                    Conversacion.empresa_id == user_uid,
                    Conversacion.artista_id == user_uid,
                    Conversacion.tipo == "soporte",
                )
            )
        else:
            stmt = select(Conversacion).where(
                or_(
                    Conversacion.empresa_id == user_uid,
                    Conversacion.artista_id == user_uid,
                )
            )

        convs = db.execute(stmt).scalars().all()
        # Deduplicar
        seen: Set[int] = set()
        unique_convs: List[Conversacion] = []
        for c in convs:
            if c.id_conversacion not in seen:
                seen.add(c.id_conversacion)
                unique_convs.append(c)
        return unique_convs

    @staticmethod
    def find_direct(
        db: Session, empresa_id: uuid.UUID, artista_id: uuid.UUID
    ) -> Optional[Conversacion]:
        """Busca una conversación directa existente entre empresa y artista."""
        stmt = select(Conversacion).where(
            Conversacion.tipo == "directo",
            Conversacion.empresa_id == empresa_id,
            Conversacion.artista_id == artista_id,
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def find_support(
        db: Session, user_id: uuid.UUID, admin_id: uuid.UUID
    ) -> Optional[Conversacion]:
        """Busca una conversación de soporte existente entre usuario y admin."""
        stmt = select(Conversacion).where(
            Conversacion.tipo == "soporte",
            or_(
                and_(Conversacion.empresa_id == user_id, Conversacion.artista_id == admin_id),
                and_(Conversacion.artista_id == user_id, Conversacion.empresa_id == admin_id),
            ),
        )
        return db.execute(stmt).scalars().first()

    @staticmethod
    def create_conversacion(db: Session, conv: Conversacion) -> Conversacion:
        """Crea y persiste una nueva conversación."""
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    @staticmethod
    def list_mensajes(db: Session, id_conversacion: int) -> List[Mensaje]:
        """Retorna todos los mensajes de una conversación ordenados cronológicamente."""
        stmt = (
            select(Mensaje)
            .where(Mensaje.id_conversacion == id_conversacion)
            .order_by(Mensaje.created_at.asc())
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create_mensaje(db: Session, mensaje: Mensaje) -> Mensaje:
        """Crea y persiste un nuevo mensaje."""
        db.add(mensaje)
        db.commit()
        db.refresh(mensaje)
        return mensaje

    @staticmethod
    def mark_as_read(db: Session, id_conversacion: int, current_user_id: uuid.UUID) -> None:
        """Marca como leídos los mensajes no enviados por el usuario actual."""
        mensajes = (
            db.execute(
                select(Mensaje).where(
                    Mensaje.id_conversacion == id_conversacion,
                    Mensaje.remitente_id != current_user_id,
                    Mensaje.leido == False,
                )
            )
            .scalars()
            .all()
        )
        for msg in mensajes:
            msg.leido = True
        db.commit()

    @staticmethod
    def get_last_message(db: Session, id_conversacion: int) -> Optional[Mensaje]:
        """Obtiene el último mensaje de la conversación."""
        stmt = (
            select(Mensaje)
            .where(Mensaje.id_conversacion == id_conversacion)
            .order_by(Mensaje.created_at.desc())
            .limit(1)
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def count_unread(db: Session, id_conversacion: int, current_user_id: uuid.UUID) -> int:
        """Cuenta los mensajes no leídos dirigidos al usuario actual."""
        stmt = select(func.count(Mensaje.id_msg)).where(
            Mensaje.id_conversacion == id_conversacion,
            Mensaje.remitente_id != current_user_id,
            Mensaje.leido == False,
        )
        return db.execute(stmt).scalar() or 0

    @staticmethod
    def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        """Busca un usuario por UUID."""
        return db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()

    @staticmethod
    def get_admin_user(db: Session) -> Optional[User]:
        """Busca el primer usuario administrador o activo."""
        admin = db.execute(select(User).where(User.role == "admin")).scalars().first()
        if not admin:
            admin = db.execute(select(User).where(User.is_active == True)).scalars().first()
        return admin

    @staticmethod
    def get_inscripcion(db: Session, id_i: int) -> Optional[Inscripcion]:
        """Obtiene una inscripción por ID."""
        return db.get(Inscripcion, id_i)


chat_repository = ChatRepository()
