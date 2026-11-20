"""
Módulo de endpoints para gestión y consulta de perfiles de usuario.
Soporta consultas del usuario autenticado, perfiles públicos, feed social y administración.
"""

import math
import re
import uuid
from typing import Optional
from urllib.parse import unquote

from fastapi import APIRouter, Depends, Query, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.core.cookies import clear_auth_cookies
from app.dependencies import get_current_user, require_admin, get_db
from app.models.user import User
from app.models.conv import Conv, Inscripcion
from app.models.portafolio import Portafolio, DetPortafolio
from app.schemas.user import (
    DeleteAccountRequest,
    UserResponse,
    PaginatedUsersResponse,
    UserStatusUpdate,
    MessageResponse,
    UserUpdate,
    UserRoleUpdate,
    AdminResetPasswordRequest,
)
from app.utils.security import verify_password, hash_password

router = APIRouter(
    prefix="/api/v1/users",
    tags=["users"],
)


class PaletteUpdate(BaseModel):
    color_palette: str


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener perfil del usuario actual",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retorna los datos del perfil del usuario autenticado."""
    return UserResponse.model_validate(current_user)


@router.get(
    "/",
    response_model=PaginatedUsersResponse,
    summary="Listar usuarios (solo admin)",
)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|first_name|email)$"),
    sort_desc: bool = True,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna una lista paginada de todos los usuarios con opciones de filtro."""
    stmt = select(User)

    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.email.ilike(search_term),
                User.sector.ilike(search_term),
            )
        )
    if role:
        stmt = stmt.where(User.role == role)

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar() or 0

    sort_column = getattr(User, sort_by)
    if sort_desc:
        sort_column = sort_column.desc()

    users = db.execute(stmt.order_by(sort_column).offset(skip).limit(limit)).scalars().all()
    pages = math.ceil(total / limit) if limit > 0 else 0

    return PaginatedUsersResponse(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=(skip // limit) + 1,
        size=limit,
        pages=pages,
    )


@router.patch(
    "/{user_id}/status",
    response_model=MessageResponse,
    summary="Cambiar el estado (activo/inactivo) de un usuario (solo admin)",
)
def change_user_status(
    user_id: str,
    status_update: UserStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Activa o desactiva un usuario. Solo accesible por administradores."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

    if uid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propia cuenta",
        )

    user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.is_active = status_update.is_active
    db.commit()

    action = "activado" if status_update.is_active else "desactivado"
    return MessageResponse(message=f"Usuario {action} correctamente")


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Actualizar perfil del usuario autenticado",
)
def update_profile(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permite al usuario autenticado actualizar sus datos de perfil."""
    fields = [
        "first_name", "last_name", "artistic_area", "sector", "bio",
        "location", "color_palette", "customization", "profile_pic_url",
        "cover_pic_url", "social_links", "artistic_disciplines",
        "looking_for_disciplines", "company_legal_name", "company_nit",
        "company_size", "onboarding_completed"
    ]
    for field in fields:
        val = getattr(body, field, None)
        if val is not None:
            setattr(current_user, field, val)

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.delete(
    "/me",
    response_model=MessageResponse,
    summary="Eliminar la propia cuenta",
)
def delete_own_account(
    body: DeleteAccountRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Desactiva la cuenta del usuario autenticado (soft-delete) previa validación de contraseña."""
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña es incorrecta",
        )

    current_user.is_active = False
    db.commit()
    clear_auth_cookies(response)
    return MessageResponse(message="Tu cuenta ha sido eliminada")


@router.patch(
    "/palette",
    response_model=UserResponse,
    summary="Cambiar paleta de colores del usuario",
)
def update_palette(
    body: PaletteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza la paleta de colores activa para la personalización de interfaz."""
    current_user.color_palette = body.color_palette
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get(
    "/explore/artists",
    summary="Listar artistas públicos (feed)",
)
def explore_artists(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    area: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retorna la lista pública de artistas activos para el explorador."""
    stmt = select(User).where(User.role == "artista", User.is_active == True)
    if search:
        term = f"%{search}%"
        stmt = stmt.where(or_(
            User.first_name.ilike(term),
            User.last_name.ilike(term),
            User.artistic_area.ilike(term),
        ))
    if area:
        stmt = stmt.where(User.artistic_area.ilike(f"%{area}%"))

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar() or 0
    users = db.execute(stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)).scalars().all()
    return {
        "items": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
    }


@router.get(
    "/explore/companies",
    summary="Listar empresas públicas (feed)",
)
def explore_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retorna la lista pública de empresas activas para el explorador."""
    stmt = select(User).where(User.role == "empresa", User.is_active == True)
    if search:
        term = f"%{search}%"
        stmt = stmt.where(or_(
            User.first_name.ilike(term),
            User.last_name.ilike(term),
            User.sector.ilike(term),
        ))

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar() or 0
    users = db.execute(stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)).scalars().all()
    return {
        "items": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
    }


@router.get(
    "/admin/stats",
    summary="Estadísticas de la plataforma (admin)",
)
def get_admin_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna estadísticas globales para el panel administrativo."""
    total_users = db.execute(select(func.count()).select_from(User)).scalar() or 0
    total_artistas = db.execute(select(func.count()).where(User.role == "artista")).scalar() or 0
    total_empresas = db.execute(select(func.count()).where(User.role == "empresa")).scalar() or 0
    total_admins = db.execute(select(func.count()).where(User.role == "admin")).scalar() or 0
    active_users = db.execute(select(func.count()).where(User.is_active == True)).scalar() or 0
    total_convs = db.execute(select(func.count()).select_from(Conv)).scalar() or 0
    total_inscripciones = db.execute(select(func.count()).select_from(Inscripcion)).scalar() or 0
    total_portafolios = db.execute(select(func.count()).select_from(Portafolio)).scalar() or 0

    return {
        "total_users": total_users,
        "total_artistas": total_artistas,
        "total_empresas": total_empresas,
        "total_admins": total_admins,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "total_convocatorias": total_convs,
        "total_postulaciones": total_inscripciones,
        "total_portafolios": total_portafolios,
    }


@router.get(
    "/profile/{user_id:path}",
    summary="Ver perfil público de un usuario",
)
def get_public_profile(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Retorna el perfil público de un usuario por UUID, slug o coincidencia de nombre."""
    raw_str = unquote(user_id).strip().rstrip("/").split("/")[-1].lower()
    clean_str = raw_str.replace("jar-2026-", "").replace("jar-", "").strip()

    users = db.execute(select(User).where(User.is_active == True)).scalars().all()
    user = None

    for u in users:
        uid_full = str(u.id).lower()
        uid_short = uid_full[:8]
        uid_compact = uid_full.replace("-", "")

        if (uid_full in clean_str or
            clean_str in uid_full or
            clean_str.endswith(uid_short) or
            uid_short in clean_str or
            clean_str == uid_compact or
            clean_str.startswith(uid_compact[:8])):
            user = u
            break

    if not user:
        for u in users:
            name_str = f"{u.first_name or ''} {u.last_name or ''} {u.email or ''}".lower()
            clean_name = re.sub(r'[^a-z0-9]+', '', name_str)
            clean_search = re.sub(r'[^a-z0-9]+', '', clean_str)
            if clean_search and (clean_search in clean_name or clean_name in clean_search):
                user = u
                break

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    try:
        user.profile_views = (user.profile_views or 0) + 1
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()

    profile = UserResponse.model_validate(user)

    portafolios_data = []
    if user.role == "artista":
        try:
            ports = db.execute(select(Portafolio).where(Portafolio.id_usr == user.id)).scalars().all()
        except Exception:
            db.rollback()
            ports = db.execute(select(Portafolio).where(Portafolio.id_usr == str(user.id))).scalars().all()

        for p in ports:
            archivos = db.execute(
                select(DetPortafolio).where(DetPortafolio.id_port == p.id_port, DetPortafolio.estado == "P")
            ).scalars().all()
            portafolios_data.append({
                "id_port": p.id_port,
                "nombre": p.nombre,
                "archivos": [
                    {"id_det_p": a.id_det_p, "archivo": a.archivo, "titulo": a.titulo, "descripcion": a.descripcion}
                    for a in archivos
                ],
            })

    convocatorias_data = []
    if user.role == "empresa":
        try:
            convs_q = db.execute(select(Conv).where(Conv.id_usr == user.id)).scalars().all()
        except Exception:
            db.rollback()
            convs_q = db.execute(select(Conv).where(Conv.id_usr == str(user.id))).scalars().all()

        for c in convs_q:
            total_inscritos = db.execute(
                select(func.count()).where(Inscripcion.id_conv == c.id_conv)
            ).scalar() or 0
            convocatorias_data.append({
                "id_conv": c.id_conv,
                "nombre": c.nombre,
                "glue": c.glue,
                "total_inscritos": total_inscritos,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })

    return {
        "user": profile,
        "portafolios": portafolios_data,
        "convocatorias": convocatorias_data,
    }


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Ver perfil de usuario (admin)",
)
def get_user_by_id(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna el perfil completo de un usuario específico (solo admin)."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")
    user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UserResponse.model_validate(user)


@router.patch(
    "/{user_id}/role",
    response_model=MessageResponse,
    summary="Cambiar rol de un usuario (admin)",
)
def change_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Cambia el rol de un usuario en el sistema (solo admin)."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")
    user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.role = role_update.role
    db.commit()
    return MessageResponse(message=f"Rol cambiado a {role_update.role} correctamente")


@router.post(
    "/{user_id}/reset-password",
    response_model=MessageResponse,
    summary="Restablecer contraseña de un usuario por administrador",
)
def admin_reset_user_password(
    user_id: str,
    body: AdminResetPasswordRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Permite al administrador restablecer la contraseña de cualquier usuario."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")
    user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.hashed_password = hash_password(body.new_password)
    db.commit()
    return MessageResponse(message=f"Contraseña de {user.full_name} restablecida con éxito")


@router.get(
    "/admin/all-convocatorias",
    summary="Listar todas las convocatorias para moderación (admin)",
)
def get_all_convocatorias_admin(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna todas las convocatorias del sistema con información de la empresa emisora."""
    convs = db.execute(select(Conv).order_by(Conv.created_at.desc())).scalars().all()
    result = []
    for c in convs:
        empresa = db.execute(select(User).where(User.id == c.id_usr)).scalar_one_or_none()
        total_inscritos = db.execute(select(func.count()).where(Inscripcion.id_conv == c.id_conv)).scalar() or 0
        result.append({
            "id_conv": c.id_conv,
            "nombre": c.nombre,
            "glue": c.glue,
            "nivel_experiencia": c.nivel_experiencia,
            "tipo_jornada": c.tipo_jornada,
            "rango_salarial": c.rango_salarial,
            "ubicacion": c.ubicacion,
            "empresa_nombre": empresa.full_name if empresa else "Empresa",
            "empresa_email": empresa.email if empresa else "",
            "total_inscritos": total_inscritos,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.delete(
    "/admin/convocatoria/{conv_id}",
    response_model=MessageResponse,
    summary="Eliminar o moderar una convocatoria (admin)",
)
def admin_delete_convocatoria(
    conv_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Permite al administrador moderar y eliminar convocatorias."""
    conv = db.get(Conv, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Convocatoria no encontrada")

    db.delete(conv)
    db.commit()
    return MessageResponse(message=f"Convocatoria '{conv.nombre}' eliminada con éxito")


def _format_time_ago(dt) -> str:
    """Formatea una fecha a tiempo relativo legible."""
    if not dt:
        return "Hace un momento"
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = (now - dt).total_seconds()
    if diff < 60:
        return "Hace un momento"
    elif diff < 3600:
        mins = int(diff // 60)
        return f"Hace {mins} min"
    elif diff < 86400:
        hours = int(diff // 3600)
        return f"Hace {hours} h"
    else:
        days = int(diff // 86400)
        return f"Hace {days} d"


@router.get(
    "/admin/audit-logs",
    summary="Bitácora de eventos de seguridad y auditoría (admin)",
)
def get_audit_logs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna eventos de auditoría y actividad del sistema en tiempo real."""
    logs = []

    try:
        from app.models.notificacion import Notificacion
        nots = db.execute(select(Notificacion).order_by(Notificacion.created_at.desc()).limit(10)).scalars().all()
        for n in nots:
            u = db.execute(select(User).where(User.id == n.id_usr)).scalar_one_or_none()
            logs.append({
                "event": f"Notificación: {n.titulo}",
                "user": u.email if u else "Sistema",
                "time": _format_time_ago(n.created_at),
                "created_at": n.created_at.isoformat() if n.created_at else "",
            })
    except Exception:
        pass

    try:
        inscs = db.execute(select(Inscripcion).order_by(Inscripcion.created_at.desc()).limit(10)).scalars().all()
        for i in inscs:
            u = db.execute(select(User).where(User.id == i.id_usr)).scalar_one_or_none()
            c = db.get(Conv, i.id_conv)
            conv_title = c.nombre if c else "Convocatoria"
            logs.append({
                "event": f"Postulación a Convocatoria: {conv_title}",
                "user": u.email if u else "Aprendiz",
                "time": _format_time_ago(i.created_at),
                "created_at": i.created_at.isoformat() if i.created_at else "",
            })
    except Exception:
        pass

    try:
        users = db.execute(select(User).order_by(User.created_at.desc()).limit(10)).scalars().all()
        for u in users:
            logs.append({
                "event": f"Registro de usuario ({u.role.capitalize()})",
                "user": u.email,
                "time": _format_time_ago(u.created_at),
                "created_at": u.created_at.isoformat() if u.created_at else "",
            })
    except Exception:
        pass

    logs.sort(key=lambda x: x["created_at"] or "", reverse=True)
    return logs[:20]
