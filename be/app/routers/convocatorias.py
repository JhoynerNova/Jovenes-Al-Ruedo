"""
Módulo: routers/convocatorias.py
Descripción: Router HTTP de convocatorias — CRUD para empresas y postulaciones para artistas.
Arquitectura: Actúa como capa de entrada HTTP (Controller). Valida DTOs y delega a ConvocatoriaService.
"""

from datetime import date
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db, require_admin
from app.models.user import User
from app.schemas.conv import (
    ConvCreate,
    ConvResponse,
    InscripcionCreate,
    InscripcionUpdateStatus,
)
from app.services.convocatoria_service import convocatoria_service

router = APIRouter(prefix="/api/v1/convocatorias", tags=["convocatorias"])


# ── Listar todas las convocatorias (público) ──
@router.get("/", summary="Listar convocatorias (público)")
def list_convocatorias(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Consulta pública de convocatorias con paginación delegada al servicio."""
    return convocatoria_service.list_convocatorias(db=db, skip=skip, limit=limit, search=search)


# ── Mis convocatorias (empresa autenticada) ──
@router.get("/mis-convocatorias", summary="Mis convocatorias (empresa)")
def my_convocatorias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna las convocatorias de la empresa actual."""
    return convocatoria_service.get_my_convocatorias(db=db, current_user=current_user)


# ── Mis postulaciones (artista autenticado) ──
@router.get("/mis-postulaciones", summary="Mis postulaciones (artista)")
def my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna las postulaciones del artista autenticado."""
    return convocatoria_service.get_my_applications(db=db, current_user=current_user)


# ── Reporte parametrizado de postulaciones (admin) ──
@router.get("/admin/reporte", summary="Reporte de postulaciones (admin)")
def reporte_postulaciones(
    fecha_desde: Optional[date] = Query(None, description="Filtra postulaciones creadas desde esta fecha"),
    fecha_hasta: Optional[date] = Query(None, description="Filtra postulaciones creadas hasta esta fecha"),
    estado: Optional[str] = Query(None, description="Filtra por estado: Pendiente, Aceptada, Rechazada"),
    conv_id: Optional[int] = Query(None, description="Filtra por convocatoria"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Reporte administrativo parametrizado de postulaciones."""
    return convocatoria_service.get_reporte(
        db=db,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        estado=estado,
        conv_id=conv_id,
    )


# ── Crear convocatoria (empresa) ──
@router.post("/", status_code=201, summary="Crear convocatoria (empresa)")
def create_convocatoria(
    body: ConvCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una convocatoria a través del servicio."""
    return convocatoria_service.create_convocatoria(db=db, body=body, current_user=current_user)


# ── Ver detalle de una convocatoria ──
@router.get("/{conv_id}", summary="Detalle de convocatoria")
def get_convocatoria(conv_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de una convocatoria."""
    return convocatoria_service.get_convocatoria_detail(db=db, conv_id=conv_id)


# ── Actualizar convocatoria (empresa dueña) ──
@router.put("/{conv_id}", summary="Actualizar convocatoria")
def update_convocatoria(
    conv_id: int,
    body: ConvCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza una convocatoria delegando al servicio."""
    return convocatoria_service.update_convocatoria(
        db=db, conv_id=conv_id, body=body, current_user=current_user
    )


# ── Eliminar convocatoria ──
@router.delete("/{conv_id}", status_code=204, summary="Eliminar convocatoria")
def delete_convocatoria(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina una convocatoria a través del servicio."""
    convocatoria_service.delete_convocatoria(db=db, conv_id=conv_id, current_user=current_user)


# ── Postularse a una convocatoria (artista) ──
@router.post("/{conv_id}/apply", status_code=201, summary="Postularse a convocatoria")
@router.post("/{conv_id}/postularse", status_code=201, summary="Postularse a convocatoria (rápida)")
def apply_to_convocatoria(
    conv_id: int,
    body: InscripcionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra una postulación a través del servicio."""
    return convocatoria_service.apply_to_convocatoria(
        db=db, conv_id=conv_id, body=body, current_user=current_user
    )


# ── Retirar postulación ──
@router.delete("/{conv_id}/apply", status_code=204, summary="Retirar postulación")
def withdraw_application(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retira la postulación a través del servicio."""
    convocatoria_service.withdraw_application(db=db, conv_id=conv_id, current_user=current_user)


# ── Ver postulados a una convocatoria (empresa dueña) ──
@router.get("/{conv_id}/applicants", summary="Ver postulados (empresa)")
def get_applicants(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna los postulantes al tablero Kanban de la empresa."""
    return convocatoria_service.get_applicants(db=db, conv_id=conv_id, current_user=current_user)


# ── Actualizar estado de postulación (empresa dueña) ──
@router.put("/{conv_id}/applicants/{inscripcion_id}", summary="Actualizar estado de postulación")
def update_application_status(
    conv_id: int,
    inscripcion_id: int,
    body: InscripcionUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza el estado de la postulación a través del servicio."""
    return convocatoria_service.update_applicant_status(
        db=db,
        conv_id=conv_id,
        inscripcion_id=inscripcion_id,
        body=body,
        current_user=current_user,
    )
