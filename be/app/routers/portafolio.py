"""Router de portafolios: CRUD para artistas."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.portafolio import Portafolio, DetPortafolio
from app.models.user import User
from app.schemas.portafolio import PortafolioCreate, PortafolioResponse, DetPortafolioCreate, DetPortafolioResponse

router = APIRouter(prefix="/api/v1/portafolio", tags=["portafolio"])


def _require_artista(user: User):
    if user.role != "artista":
        raise HTTPException(status_code=403, detail="Solo los artistas tienen portafolio")


# ── Listar mis portafolios ──
@router.get("/", response_model=list[PortafolioResponse], summary="Mis portafolios")
def list_portafolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_artista(current_user)
    portafolios = db.execute(
        select(Portafolio).where(Portafolio.id_usr == str(current_user.id)).order_by(Portafolio.created_at.desc())
    ).scalars().all()
    return portafolios


# ── Crear portafolio ──
@router.post("/", response_model=PortafolioResponse, status_code=201, summary="Crear portafolio")
def create_portafolio(
    body: PortafolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_artista(current_user)
    port = Portafolio(nombre=body.nombre, id_usr=str(current_user.id))
    db.add(port)
    db.commit()
    db.refresh(port)
    return port


# ── Ver portafolio por ID ──
@router.get("/{port_id}", response_model=PortafolioResponse, summary="Ver portafolio")
def get_portafolio(
    port_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    port = db.get(Portafolio, port_id)
    if not port:
        raise HTTPException(status_code=404, detail="Portafolio no encontrado")
    if str(port.id_usr) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes acceso a este portafolio")
    return port


# ── Eliminar portafolio ──
@router.delete("/{port_id}", status_code=204, summary="Eliminar portafolio")
def delete_portafolio(
    port_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    port = db.get(Portafolio, port_id)
    if not port:
        raise HTTPException(status_code=404, detail="Portafolio no encontrado")
    if str(port.id_usr) != str(current_user.id):
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este portafolio")
    db.delete(port)
    db.commit()


# ── Agregar ítem a portafolio ──
@router.post("/{port_id}/items", response_model=DetPortafolioResponse, status_code=201, summary="Agregar ítem")
def add_item(
    port_id: int,
    body: DetPortafolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_artista(current_user)
    port = db.get(Portafolio, port_id)
    if not port:
        raise HTTPException(status_code=404, detail="Portafolio no encontrado")
    if str(port.id_usr) != str(current_user.id):
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este portafolio")
    item = DetPortafolio(id_port=port_id, archivo=body.archivo, estado=body.estado)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# ── Eliminar ítem de portafolio ──
@router.delete("/{port_id}/items/{item_id}", status_code=204, summary="Eliminar ítem")
def delete_item(
    port_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    port = db.get(Portafolio, port_id)
    if not port or str(port.id_usr) != str(current_user.id):
        raise HTTPException(status_code=403, detail="No tienes permiso")
    item = db.get(DetPortafolio, item_id)
    if not item or item.id_port != port_id:
        raise HTTPException(status_code=404, detail="Ítem no encontrado")
    db.delete(item)
    db.commit()
