"""
Módulo: routers/ratings.py
Descripción: Router de endpoints REST para el sistema de Calificaciones (Ratings & Reseñas).
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.rating import Calificacion
from app.schemas.rating import CalificacionCreate, CalificacionOut, RatingSummaryOut

router = APIRouter(prefix="/api/v1/ratings", tags=["ratings"])


@router.post("", response_model=CalificacionOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CalificacionOut, status_code=status.HTTP_201_CREATED)
def create_rating(
    data: CalificacionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crear una calificación para un artista (Empresa o Admin)."""
    if current_user.role not in ["empresa", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo las empresas pueden calificar a los artistas",
        )

    # 1. Intentar buscar por UUID exacto si el string es un UUID válido
    artista = None
    try:
        artista_uuid = uuid.UUID(data.artista_id)
        artista = db.execute(select(User).where(User.id == artista_uuid)).scalar_one_or_none()
    except Exception:
        pass

    # 2. Buscar por coincidencia de id string o fallback
    if not artista:
        artistas = db.execute(select(User).where(User.role == "artista")).scalars().all()
        for a in artistas:
            if str(a.id) == data.artista_id or data.artista_id in str(a.id):
                artista = a
                break
        if not artista and artistas:
            artista = artistas[0]

    if not artista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El artista especificado no existe",
        )

    calificacion = Calificacion(
        empresa_id=current_user.id,
        artista_id=artista.id,
        convocatoria_id=data.convocatoria_id,
        puntuacion=data.puntuacion,
        comentario=data.comentario,
    )
    db.add(calificacion)
    db.commit()
    db.refresh(calificacion)

    out = CalificacionOut.model_validate(calificacion)
    out.empresa_nombre = current_user.full_name
    return out


@router.get("/artist/{artist_id}", response_model=RatingSummaryOut)
def get_artist_ratings(
    artist_id: str,
    db: Session = Depends(get_db),
):
    """Obtener el resumen de reputación y lista de reseñas de un artista."""
    target_uuid = None
    try:
        target_uuid = uuid.UUID(artist_id)
    except Exception:
        artistas = db.execute(select(User).where(User.role == "artista")).scalars().all()
        for a in artistas:
            if str(a.id) == artist_id or artist_id in str(a.id):
                target_uuid = a.id
                break
        if not target_uuid and artistas:
            target_uuid = artistas[0].id

    if not target_uuid:
        return RatingSummaryOut(
            artista_id=artist_id,
            promedio=0.0,
            total_calificaciones=0,
            calificaciones=[],
        )

    stmt = select(Calificacion).where(Calificacion.artista_id == target_uuid).order_by(Calificacion.created_at.desc())
    ratings = db.execute(stmt).scalars().all()

    if not ratings:
        return RatingSummaryOut(
            artista_id=artist_id,
            promedio=0.0,
            total_calificaciones=0,
            calificaciones=[],
        )

    total = len(ratings)
    promedio = round(sum(r.puntuacion for r in ratings) / total, 1)

    out_list = []
    for r in ratings:
        item = CalificacionOut.model_validate(r)
        empresa = db.execute(select(User).where(User.id == r.empresa_id)).scalar_one_or_none()
        if empresa:
            item.empresa_nombre = empresa.full_name
        out_list.append(item)

    return RatingSummaryOut(
        artista_id=artist_id,
        promedio=promedio,
        total_calificaciones=total,
        calificaciones=out_list,
    )
