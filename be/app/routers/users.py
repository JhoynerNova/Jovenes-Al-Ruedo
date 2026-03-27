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
from fastapi import APIRouter, Depends, Query, HTTPException, status

from app.dependencies import get_current_user, require_admin, get_db
from app.models.user import User
from app.schemas.user import UserResponse, PaginatedUsersResponse, UserStatusUpdate, MessageResponse

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
    sort_by: str = Query("created_at", pattern="^(created_at|full_name|email)$"),
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
                User.full_name.ilike(search_term),
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
