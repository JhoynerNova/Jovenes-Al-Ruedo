"""Router REST para el módulo de analíticas e insignias."""

import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import analytics_service

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/my-stats", summary="Obtener analíticas del usuario autenticado")
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retorna las métricas de impacto, estadísticas e insignias del usuario."""
    return analytics_service.get_user_stats(db, current_user)


@router.get("/user/{user_id}/badges", summary="Obtener insignias públicas de un usuario")
def get_user_badges(
    user_id: str,
    db: Session = Depends(get_db),
) -> List[Dict[str, str]]:
    """Retorna las insignias públicas obtenidas por un usuario."""
    try:
        uid = uuid.UUID(user_id)
        target_user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    except Exception:
        target_user = None

    if not target_user:
        users = db.execute(select(User)).scalars().all()
        for u in users:
            if str(u.id) == user_id or user_id in str(u.id):
                target_user = u
                break

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return analytics_service.get_user_badges(db, target_user)
