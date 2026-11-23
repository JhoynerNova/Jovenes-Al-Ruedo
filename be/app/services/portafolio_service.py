"""
Módulo: services/portafolio_service.py
Descripción: Lógica de negocio para portafolios y gestión de ítems multimedia.
"""

from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.portafolio import Portafolio, DetPortafolio
from app.models.user import User
from app.schemas.portafolio import PortafolioCreate, DetPortafolioCreate
from app.repositories.portafolio_repository import portafolio_repository


class PortafolioService:
    """Servicio que implementa las reglas de negocio de portafolios."""

    @staticmethod
    def _require_artista(user: User) -> None:
        if user.role != "artista":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo los artistas tienen portafolio",
            )

    def list_portafolios(self, db: Session, current_user: User) -> List[Portafolio]:
        self._require_artista(current_user)
        return portafolio_repository.list_by_user(db, current_user.id)

    def create_portafolio(
        self, db: Session, current_user: User, data: PortafolioCreate
    ) -> Portafolio:
        self._require_artista(current_user)
        port = Portafolio(
            nombre=data.nombre,
            descripcion=data.descripcion,
            visibilidad=data.visibilidad,
            id_usr=current_user.id,
        )
        return portafolio_repository.create_portafolio(db, port)

    def get_portafolio(
        self, db: Session, current_user: User, port_id: int
    ) -> Portafolio:
        port = portafolio_repository.get_by_id(db, port_id)
        if not port:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portafolio no encontrado",
            )
        if str(port.id_usr) != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a este portafolio",
            )
        return port

    def delete_portafolio(
        self, db: Session, current_user: User, port_id: int
    ) -> None:
        port = portafolio_repository.get_by_id(db, port_id)
        if not port:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portafolio no encontrado",
            )
        if str(port.id_usr) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar este portafolio",
            )
        portafolio_repository.delete_portafolio(db, port)

    def add_item(
        self, db: Session, current_user: User, port_id: int, data: DetPortafolioCreate
    ) -> DetPortafolio:
        self._require_artista(current_user)
        port = portafolio_repository.get_by_id(db, port_id)
        if not port:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portafolio no encontrado",
            )
        if str(port.id_usr) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para editar este portafolio",
            )
        item = DetPortafolio(
            id_port=port_id,
            archivo=data.archivo,
            titulo=data.titulo,
            descripcion=data.descripcion,
            portada_url=data.portada_url,
            etiquetas=data.etiquetas,
            estado=data.estado,
        )
        return portafolio_repository.add_item(db, item)

    def delete_item(
        self, db: Session, current_user: User, port_id: int, item_id: int
    ) -> None:
        port = portafolio_repository.get_by_id(db, port_id)
        if not port or str(port.id_usr) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso",
            )
        item = portafolio_repository.get_item(db, item_id)
        if not item or item.id_port != port_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ítem no encontrado",
            )
        portafolio_repository.delete_item(db, item)


portafolio_service = PortafolioService()
