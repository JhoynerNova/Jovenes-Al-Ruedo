"""
Módulo: routers/ratings.py
Descripción: Router de endpoints REST para el sistema de Calificaciones — delega a rating_service.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.rating import CalificacionCreate, CalificacionOut, RatingSummaryOut
from app.services.rating_service import rating_service

router = APIRouter(prefix="/api/v1/ratings", tags=["ratings"])


@router.post("", response_model=CalificacionOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CalificacionOut, status_code=status.HTTP_201_CREATED)
def create_rating(
    data: CalificacionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crear una calificación para un artista (Empresa o Admin)."""
    return rating_service.create_rating(db, current_user, data)


@router.get("/artist/{artist_id}", response_model=RatingSummaryOut)
def get_artist_ratings(
    artist_id: str,
    db: Session = Depends(get_db),
):
    """Obtener el resumen de reputación y lista de reseñas de un artista."""
    return rating_service.get_artist_ratings(db, artist_id)
