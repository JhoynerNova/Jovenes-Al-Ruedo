"""Router de convocatorias: CRUD para empresas y postulaciones para artistas."""

import math
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.conv import Conv, Inscripcion
from app.models.user import User
from app.schemas.conv import ConvCreate, ConvResponse, InscripcionResponse

router = APIRouter(prefix="/api/v1/convocatorias", tags=["convocatorias"])


def _conv_to_response(conv: Conv, db: Session) -> ConvResponse:
    total = db.execute(
        select(func.count()).where(Inscripcion.id_conv == conv.id_conv)
    ).scalar() or 0
    return ConvResponse(
        id_conv=conv.id_conv,
        nombre=conv.nombre,
        glue=conv.glue,
        id_usr=str(conv.id_usr),
        empresa_nombre=conv.empresa.full_name if conv.empresa else None,
        empresa_sector=conv.empresa.sector if conv.empresa else None,
        created_at=conv.created_at,
        total_inscritos=total,
    )


# ── Listar todas las convocatorias (público) ──
@router.get("/", summary="Listar convocatorias (público)")
def list_convocatorias(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    stmt = select(Conv)
    if search:
        stmt = stmt.where(Conv.nombre.ilike(f"%{search}%"))
    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar() or 0
    convs = db.execute(stmt.order_by(Conv.created_at.desc()).offset(skip).limit(limit)).scalars().all()
    return {
        "items": [_conv_to_response(c, db) for c in convs],
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": math.ceil(total / limit) if limit > 0 else 0,
    }


# ── Mis convocatorias (empresa autenticada) ──
@router.get("/mis-convocatorias", summary="Mis convocatorias (empresa)")
def my_convocatorias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "empresa":
        raise HTTPException(status_code=403, detail="Solo las empresas pueden ver sus convocatorias")
    convs = db.execute(
        select(Conv).where(Conv.id_usr == str(current_user.id)).order_by(Conv.created_at.desc())
    ).scalars().all()
    return [_conv_to_response(c, db) for c in convs]


# ── Mis postulaciones (artista autenticado) ──
@router.get("/mis-postulaciones", summary="Mis postulaciones (artista)")
def my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "artista":
        raise HTTPException(status_code=403, detail="Solo los artistas pueden ver sus postulaciones")
    inscripciones = db.execute(
        select(Inscripcion).where(Inscripcion.id_usr == str(current_user.id)).order_by(Inscripcion.created_at.desc())
    ).scalars().all()
    result = []
    for i in inscripciones:
        conv = db.get(Conv, i.id_conv)
        if conv:
            result.append({
                "id_i": i.id_i,
                "id_conv": i.id_conv,
                "conv_nombre": conv.nombre,
                "empresa_nombre": conv.empresa.full_name if conv.empresa else None,
                "created_at": i.created_at.isoformat(),
            })
    return result


# ── Crear convocatoria (empresa) ──
@router.post("/", status_code=201, summary="Crear convocatoria (empresa)")
def create_convocatoria(
    body: ConvCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "empresa":
        raise HTTPException(status_code=403, detail="Solo las empresas pueden crear convocatorias")
    conv = Conv(nombre=body.nombre, glue=body.glue, id_usr=str(current_user.id))
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _conv_to_response(conv, db)


# ── Ver detalle de una convocatoria ──
@router.get("/{conv_id}", summary="Detalle de convocatoria")
def get_convocatoria(conv_id: int, db: Session = Depends(get_db)):
    conv = db.get(Conv, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
    return _conv_to_response(conv, db)


# ── Actualizar convocatoria (empresa dueña) ──
@router.put("/{conv_id}", summary="Actualizar convocatoria")
def update_convocatoria(
    conv_id: int,
    body: ConvCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.get(Conv, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
    if str(conv.id_usr) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta convocatoria")
    conv.nombre = body.nombre
    conv.glue = body.glue
    db.commit()
    db.refresh(conv)
    return _conv_to_response(conv, db)


# ── Eliminar convocatoria ──
@router.delete("/{conv_id}", status_code=204, summary="Eliminar convocatoria")
def delete_convocatoria(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.get(Conv, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
    if str(conv.id_usr) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta convocatoria")
    db.delete(conv)
    db.commit()


# ── Postularse a una convocatoria (artista) ──
@router.post("/{conv_id}/apply", status_code=201, summary="Postularse a convocatoria")
def apply_to_convocatoria(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "artista":
        raise HTTPException(status_code=403, detail="Solo los artistas pueden postularse")
    conv = db.get(Conv, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
    existing = db.execute(
        select(Inscripcion).where(
            Inscripcion.id_conv == conv_id,
            Inscripcion.id_usr == str(current_user.id),
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Ya estás postulado a esta convocatoria")
    insc = Inscripcion(id_conv=conv_id, id_usr=str(current_user.id))
    db.add(insc)
    db.commit()
    db.refresh(insc)
    return {"message": "Postulación registrada", "id_i": insc.id_i}


# ── Retirar postulación ──
@router.delete("/{conv_id}/apply", status_code=204, summary="Retirar postulación")
def withdraw_application(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    insc = db.execute(
        select(Inscripcion).where(
            Inscripcion.id_conv == conv_id,
            Inscripcion.id_usr == str(current_user.id),
        )
    ).scalar_one_or_none()
    if not insc:
        raise HTTPException(status_code=404, detail="No tienes postulación en esta convocatoria")
    db.delete(insc)
    db.commit()


# ── Ver postulados a una convocatoria (empresa dueña) ──
@router.get("/{conv_id}/applicants", summary="Ver postulados (empresa)")
def get_applicants(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.get(Conv, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
    if str(conv.id_usr) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para ver los postulados")
    inscripciones = db.execute(
        select(Inscripcion).where(Inscripcion.id_conv == conv_id).order_by(Inscripcion.created_at.desc())
    ).scalars().all()
    result = []
    for i in inscripciones:
        try:
            uid = uuid.UUID(str(i.id_usr))
        except Exception:
            continue
        artista = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
        if artista:
            result.append({
                "id_i": i.id_i,
                "id_usr": str(artista.id),
                "artista_nombre": artista.full_name,
                "artista_email": artista.email,
                "artista_area": artista.artistic_area,
                "artista_bio": artista.bio,
                "artista_location": artista.location,
                "created_at": i.created_at.isoformat(),
            })
    return result
