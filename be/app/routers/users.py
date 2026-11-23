"""
Módulo de endpoints para gestión y consulta de perfiles de usuario.
Soporta consultas del usuario autenticado, perfiles públicos, feed social y administración.
Delega toda la lógica de negocio y persistencia a user_service.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, require_admin, get_db
from app.models.user import User
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
from app.services.user_service import user_service

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
    return user_service.list_users(
        db, skip=skip, limit=limit, search=search, role=role, sort_by=sort_by, sort_desc=sort_desc
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
    return user_service.change_user_status(db, current_user, user_id, status_update)


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
    return user_service.update_profile(db, current_user, body)


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
    return user_service.delete_own_account(db, current_user, body, response)


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
    return user_service.update_palette(db, current_user, body.color_palette)


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
    return user_service.explore_artists(db, skip=skip, limit=limit, search=search, area=area)


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
    return user_service.explore_companies(db, skip=skip, limit=limit, search=search)


@router.get(
    "/admin/stats",
    summary="Estadísticas de la plataforma (admin)",
)
def get_admin_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna estadísticas globales para el panel administrativo."""
    return user_service.get_admin_stats(db)


@router.get(
    "/profile/{user_id:path}",
    summary="Ver perfil público de un usuario",
)
def get_public_profile(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Retorna el perfil público de un usuario por UUID, slug o coincidencia de nombre."""
    return user_service.get_public_profile(db, user_id)


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
    return user_service.get_user_by_id(db, user_id)


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
    return user_service.change_user_role(db, user_id, role_update)


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
    return user_service.admin_reset_password(db, user_id, body)


@router.get(
    "/admin/all-convocatorias",
    summary="Listar todas las convocatorias para moderación (admin)",
)
def get_all_convocatorias_admin(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna todas las convocatorias del sistema con información de la empresa emisora."""
    return user_service.get_all_convocatorias_admin(db)


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
    return user_service.admin_delete_convocatoria(db, conv_id)


@router.get(
    "/admin/audit-logs",
    summary="Bitácora de eventos de seguridad y auditoría (admin)",
)
def get_audit_logs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retorna eventos de auditoría y actividad del sistema en tiempo real."""
    return user_service.get_audit_logs(db)
