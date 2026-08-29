"""Router REST para el módulo de notificaciones."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.notificacion import NotificacionResponse, UnreadCountResponse
from app.services import notification_service

router = APIRouter(prefix="/api/v1/notificaciones", tags=["notificaciones"])


@router.get("/", response_model=List[NotificacionResponse], summary="Obtener notificaciones del usuario")
def get_notifications(
    unread_only: bool = Query(False, description="Filtrar solo no leídas"),
    limit: int = Query(50, ge=1, le=100, description="Límite de notificaciones"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtiene las notificaciones del usuario autenticado."""
    return notification_service.get_user_notifications(
        db, id_usr=current_user.id, limit=limit, unread_only=unread_only
    )


@router.get("/unread-count", response_model=UnreadCountResponse, summary="Obtener contador de no leídas")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna la cantidad total de notificaciones no leídas para los badges del Navbar."""
    count = notification_service.get_unread_count(db, id_usr=current_user.id)
    return UnreadCountResponse(unread_count=count)


@router.patch("/{notif_id}/read", summary="Marcar una notificación como leída")
def mark_read(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marca la notificación indicada como leída."""
    success = notification_service.mark_as_read(db, notification_id=notif_id, id_usr=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada",
        )
    return {"message": "Notificación marcada como leída"}


@router.post("/read-all", summary="Marcar todas como leídas")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marca todas las notificaciones del usuario como leídas."""
    count = notification_service.mark_all_as_read(db, id_usr=current_user.id)
    return {"message": "Todas las notificaciones marcadas como leídas", "count": count}


@router.delete("/{notif_id}", summary="Eliminar una notificación")
def delete_notif(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina la notificación especificada."""
    success = notification_service.delete_notification(db, notification_id=notif_id, id_usr=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada",
        )
    return {"message": "Notificación eliminada correctamente"}
