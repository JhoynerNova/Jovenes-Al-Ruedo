"""
Módulo: routers/users.py
Descripción: Endpoints de usuario — perfil del usuario autenticado.
¿Para qué? Proveer endpoints para que el usuario autenticado consulte y gestione su perfil.
¿Impacto? Sin este router, el frontend no podría mostrar los datos del usuario logueado
          (nombre, email, fecha de registro, etc.).
"""

from typing import Optional
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Query, HTTPException, Response, status

from pydantic import BaseModel
from app.core.cookies import clear_auth_cookies
from app.dependencies import get_current_user, require_admin, get_db
from app.models.user import User
from app.models.conv import Conv, Inscripcion
from app.models.portafolio import Portafolio
from app.schemas.user import DeleteAccountRequest, UserResponse, PaginatedUsersResponse, UserStatusUpdate, MessageResponse, UserUpdate, UserRoleUpdate
from app.utils.security import verify_password

# ¿Qué? Router de FastAPI para endpoints de usuario.
# ¿Para qué? Agrupar endpoints relacionados con el perfil del usuario bajo /api/v1/users.
# ¿Impacto? Separar los endpoints de usuario de los de auth mantiene el código organizado
#           y facilita agregar más endpoints de usuario en el futuro (ej: update profile).
router = APIRouter(
    prefix="/api/v1/users",
    tags=["users"],
)


# ¿Qué? Handler OPTIONS para preflight CORS.
# ¿Para qué? Explícitamente permitir peticiones OPTIONS del navegador (preflight).
# ¿Impacto? Sin esto, los navegadores rechazan peticiones por CORS.
@router.options("/me")
async def options_me():
    """Maneja peticiones OPTIONS para preflight CORS."""
    return {}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener perfil del usuario actual",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retorna los datos del perfil del usuario autenticado.

    ¿Qué? Endpoint que retorna los datos del usuario que está haciendo el request.
    ¿Para qué? El frontend lo usa para mostrar el nombre, email y datos del usuario
              en el dashboard, navbar, perfil, etc.
    ¿Impacto? Depends(get_current_user) hace que este endpoint sea PROTEGIDO:
              solo funciona con un access_token válido. Si el token es inválido o expiró,
              FastAPI retorna 401 automáticamente (gracias a la dependencia).

    Args:
        current_user: Usuario autenticado (inyectado automáticamente por FastAPI).

    Returns:
        Datos del perfil del usuario (sin contraseña).
    """
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
    
    # Filtros
    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.email.ilike(search_term),
                User.sector.ilike(search_term)
            )
        )
    if role:
        stmt = stmt.where(User.role == role)
        
    # Total de registros (sin paginación)
    total_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(total_stmt).scalar() or 0
    
    # Ordenamiento
    sort_column = getattr(User, sort_by)
    if sort_desc:
        sort_column = sort_column.desc()
    
    stmt = stmt.order_by(sort_column).offset(skip).limit(limit)
    users = db.execute(stmt).scalars().all()
    
    import math
    pages = math.ceil(total / limit) if limit > 0 else 0
    
    return PaginatedUsersResponse(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=(skip // limit) + 1,
        size=limit,
        pages=pages
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
        import uuid
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")
        
    if uid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propia cuenta"
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
    """Permite al usuario actualizar su perfil (nombre, bio, área, sector, ubicación)."""
    if body.first_name is not None:
        current_user.first_name = body.first_name
    if body.last_name is not None:
        current_user.last_name = body.last_name
    if body.artistic_area is not None:
        current_user.artistic_area = body.artistic_area
    if body.sector is not None:
        current_user.sector = body.sector
    if body.bio is not None:
        current_user.bio = body.bio
    if body.location is not None:
        current_user.location = body.location
    if body.color_palette is not None:
        current_user.color_palette = body.color_palette
    if body.profile_pic_url is not None:
        current_user.profile_pic_url = body.profile_pic_url
    if body.cover_pic_url is not None:
        current_user.cover_pic_url = body.cover_pic_url
    if body.social_links is not None:
        current_user.social_links = body.social_links
    if body.artistic_disciplines is not None:
        current_user.artistic_disciplines = body.artistic_disciplines
    if body.looking_for_disciplines is not None:
        current_user.looking_for_disciplines = body.looking_for_disciplines
    if body.company_legal_name is not None:
        current_user.company_legal_name = body.company_legal_name
    if body.company_nit is not None:
        current_user.company_nit = body.company_nit
    if body.company_size is not None:
        current_user.company_size = body.company_size
    if body.onboarding_completed is not None:
        current_user.onboarding_completed = body.onboarding_completed
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
    """Elimina (desactiva) la cuenta del usuario autenticado.

    ¿Qué? Requiere la contraseña actual como confirmación y desactiva la cuenta
          (is_active=False) — el mismo mecanismo de soft-delete que ya usa un admin
          para desactivar usuarios (ver change_user_status).
    ¿Para qué? Dar cumplimiento al "derecho al olvido" (Ley 1581/2012) permitiendo que
              el usuario mismo elimine su cuenta, sin depender de un administrador.
    ¿Impacto? Soft-delete, no borrado físico: se preservan datos relacionales
              (postulaciones, convocatorias) por integridad histórica, pero la cuenta
              queda inaccesible — get_current_user ya rechaza usuarios con is_active=False
              en cualquier request futuro, incluyendo intentos de login.
              La confirmación "doble" es: (1) contraseña + (2) diálogo de confirmación
              en el frontend antes de llamar este endpoint.
    """
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña es incorrecta",
        )

    current_user.is_active = False
    db.commit()

    clear_auth_cookies(response)
    return MessageResponse(message="Tu cuenta ha sido eliminada")


class PaletteUpdate(BaseModel):
    color_palette: str

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
    """Retorna la lista pública de artistas activos para el feed social."""
    stmt = select(User).where(User.role == "artista", User.is_active == True)
    if search:
        term = f"%{search}%"
        stmt = stmt.where(or_(
            User.first_name.ilike(term), 
            User.last_name.ilike(term), 
            User.artistic_area.ilike(term)
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
    """Retorna la lista pública de empresas activas para el feed social."""
    stmt = select(User).where(User.role == "empresa", User.is_active == True)
    if search:
        term = f"%{search}%"
        stmt = stmt.where(or_(
            User.first_name.ilike(term), 
            User.last_name.ilike(term), 
            User.sector.ilike(term)
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
    """Retorna estadísticas globales de la plataforma para el panel de admin."""
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
    "/profile/{user_id}",
    summary="Ver perfil público de un usuario",
)
def get_public_profile(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Retorna el perfil público de un usuario con sus portafolios (si es artista)."""
    try:
        import uuid as _uuid
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")
    user = db.execute(select(User).where(User.id == uid, User.is_active == True)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Incrementar contador real de vistas al perfil
    try:
        user.profile_views = (user.profile_views or 0) + 1
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        print(f"[Users] Error incrementando vistas de perfil: {e}")
    
    profile = UserResponse.model_validate(user)
    
    # Si es artista, incluir portafolios publicados
    portafolios_data = []
    if user.role == "artista":
        from app.models.portafolio import DetPortafolio
        ports = db.execute(
            select(Portafolio).where(or_(Portafolio.id_usr == uid, Portafolio.id_usr == str(uid)))
        ).scalars().all()
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
    
    # Convocatorias publicadas (si es empresa)
    convocatorias_data = []
    if user.role == "empresa":
        convs_q = db.execute(
            select(Conv).where(or_(Conv.id_usr == uid, Conv.id_usr == str(uid)))
        ).scalars().all()
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
        import uuid as _uuid
        uid = _uuid.UUID(user_id)
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
    """Cambia el rol de un usuario. Solo accesible por administradores."""
    try:
        import uuid as _uuid
        uid = _uuid.UUID(user_id)
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
        import uuid as _uuid
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")
    user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    from app.utils.security import hash_password
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
    return MessageResponse(message="Convocatoria moderada y eliminada del sistema")

