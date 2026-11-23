"""
Módulo: repositories/portafolio_repository.py
Descripción: Repositorio para entidades Portafolio y DetPortafolio.
"""

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.portafolio import Portafolio, DetPortafolio


class PortafolioRepository:
    """Encapsula operaciones de persistencia para portafolios e ítems multimedia."""

    @staticmethod
    def list_by_user(db: Session, user_id) -> List[Portafolio]:
        """Retorna todos los portafolios pertenecientes a un usuario ordenados por fecha."""
        stmt = (
            select(Portafolio)
            .where(Portafolio.id_usr == user_id)
            .order_by(Portafolio.created_at.desc())
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_by_id(db: Session, port_id: int) -> Optional[Portafolio]:
        """Obtiene un portafolio por su ID."""
        return db.get(Portafolio, port_id)

    @staticmethod
    def create_portafolio(db: Session, portafolio: Portafolio) -> Portafolio:
        """Guarda un nuevo portafolio en la base de datos."""
        db.add(portafolio)
        db.commit()
        db.refresh(portafolio)
        return portafolio

    @staticmethod
    def delete_portafolio(db: Session, portafolio: Portafolio) -> None:
        """Elimina un portafolio existente."""
        db.delete(portafolio)
        db.commit()

    @staticmethod
    def add_item(db: Session, item: DetPortafolio) -> DetPortafolio:
        """Agrega un ítem al portafolio."""
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def get_item(db: Session, item_id: int) -> Optional[DetPortafolio]:
        """Obtiene un detalle de portafolio por su ID."""
        return db.get(DetPortafolio, item_id)

    @staticmethod
    def delete_item(db: Session, item: DetPortafolio) -> None:
        """Elimina un detalle de portafolio."""
        db.delete(item)
        db.commit()


portafolio_repository = PortafolioRepository()
