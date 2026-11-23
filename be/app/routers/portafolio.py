"""
Módulo: routers/portafolio.py
Descripción: Router de portafolios — delega lógica de negocio a portafolio_service.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.portafolio import (
    PortafolioCreate,
    PortafolioResponse,
    DetPortafolioCreate,
    DetPortafolioResponse,
)
from app.services.portafolio_service import portafolio_service

router = APIRouter(prefix="/api/v1/portafolio", tags=["portafolio"])


@router.get("/", response_model=list[PortafolioResponse], summary="Mis portafolios")
def list_portafolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Listar todos los portafolios del artista autenticado."""
    return portafolio_service.list_portafolios(db, current_user)


@router.post("/", response_model=PortafolioResponse, status_code=201, summary="Crear portafolio")
def create_portafolio(
    body: PortafolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crear un nuevo portafolio para el artista autenticado."""
    return portafolio_service.create_portafolio(db, current_user, body)


@router.get("/{port_id}", response_model=PortafolioResponse, summary="Ver portafolio")
def get_portafolio(
    port_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtener detalle de un portafolio por su identificador."""
    return portafolio_service.get_portafolio(db, current_user, port_id)


@router.delete("/{port_id}", status_code=204, summary="Eliminar portafolio")
def delete_portafolio(
    port_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Eliminar un portafolio propio."""
    portafolio_service.delete_portafolio(db, current_user, port_id)


@router.post("/{port_id}/items", response_model=DetPortafolioResponse, status_code=201, summary="Agregar ítem")
def add_item(
    port_id: int,
    body: DetPortafolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Agregar un ítem multimedia (imagen, audio, video, documento) al portafolio."""
    return portafolio_service.add_item(db, current_user, port_id, body)


@router.delete("/{port_id}/items/{item_id}", status_code=204, summary="Eliminar ítem")
def delete_item(
    port_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Eliminar un ítem de un portafolio propio."""
    portafolio_service.delete_item(db, current_user, port_id, item_id)
