"""
Módulo: services/user_service.py
Descripción: Capa de lógica de negocio para usuarios, perfiles y administración.
"""

from typing import Optional, Dict, Any, List
from urllib.parse import unquote
import math
import re
import uuid

from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.cookies import clear_auth_cookies
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.user import (
    UserResponse,
    PaginatedUsersResponse,
    UserStatusUpdate,
    MessageResponse,
    UserUpdate,
    UserRoleUpdate,
    AdminResetPasswordRequest,
    DeleteAccountRequest,
)
from app.utils.security import verify_password, hash_password


class UserService:
    """Servicio que encapsula la lógica de negocio de usuarios y perfiles."""

    def list_users(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        role: Optional[str] = None,
        sort_by: str = "created_at",
        sort_desc: bool = True,
    ) -> PaginatedUsersResponse:
        users, total = user_repository.list_paginated(
            db, skip=skip, limit=limit, search=search, role=role, sort_by=sort_by, sort_desc=sort_desc
        )
        pages = math.ceil(total / limit) if limit > 0 else 0
        return PaginatedUsersResponse(
            items=[UserResponse.model_validate(u) for u in users],
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )

    def change_user_status(
        self, db: Session, current_user: User, user_id: str, status_update: UserStatusUpdate
    ) -> MessageResponse:
        try:
            uid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="ID de usuario inválido")

        if uid == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes desactivar tu propia cuenta",
            )

        user = user_repository.get_by_id(db, uid)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        user.is_active = status_update.is_active
        user_repository.update(db, user)

        action = "activado" if status_update.is_active else "desactivado"
        return MessageResponse(message=f"Usuario {action} correctamente")

    def update_profile(
        self, db: Session, current_user: User, body: UserUpdate
    ) -> UserResponse:
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

        user_repository.update(db, current_user)
        return UserResponse.model_validate(current_user)

    def delete_own_account(
        self, db: Session, current_user: User, body: DeleteAccountRequest, response: Response
    ) -> MessageResponse:
        if not verify_password(body.password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña es incorrecta",
            )

        current_user.is_active = False
        user_repository.update(db, current_user)
        clear_auth_cookies(response)
        return MessageResponse(message="Tu cuenta ha sido eliminada")

    def update_palette(
        self, db: Session, current_user: User, color_palette: str
    ) -> UserResponse:
        current_user.color_palette = color_palette
        user_repository.update(db, current_user)
        return UserResponse.model_validate(current_user)

    def explore_artists(
        self, db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, area: Optional[str] = None
    ) -> Dict[str, Any]:
        users, total = user_repository.explore_artists(db, skip=skip, limit=limit, search=search, area=area)
        return {
            "items": [UserResponse.model_validate(u) for u in users],
            "total": total,
            "page": (skip // limit) + 1,
            "size": limit,
        }

    def explore_companies(
        self, db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None
    ) -> Dict[str, Any]:
        users, total = user_repository.explore_companies(db, skip=skip, limit=limit, search=search)
        return {
            "items": [UserResponse.model_validate(u) for u in users],
            "total": total,
            "page": (skip // limit) + 1,
            "size": limit,
        }

    def get_admin_stats(self, db: Session) -> Dict[str, int]:
        return user_repository.get_admin_stats(db)

    def get_public_profile(self, db: Session, user_id: str) -> Dict[str, Any]:
        raw_str = unquote(user_id).strip().rstrip("/").split("/")[-1].lower()
        clean_str = raw_str.replace("jar-2026-", "").replace("jar-", "").strip()

        users = user_repository.list_active(db)
        user: Optional[User] = None

        for u in users:
            uid_full = str(u.id).lower()
            uid_short = uid_full[:8]
            uid_compact = uid_full.replace("-", "")

            if (
                uid_full in clean_str
                or clean_str in uid_full
                or clean_str.endswith(uid_short)
                or uid_short in clean_str
                or clean_str == uid_compact
                or clean_str.startswith(uid_compact[:8])
            ):
                user = u
                break

        if not user:
            for u in users:
                name_str = f"{u.first_name or ''} {u.last_name or ''} {u.email or ''}".lower()
                clean_name = re.sub(r"[^a-z0-9]+", "", name_str)
                clean_search = re.sub(r"[^a-z0-9]+", "", clean_str)
                if clean_search and (clean_search in clean_name or clean_name in clean_search):
                    user = u
                    break

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        try:
            user.profile_views = (user.profile_views or 0) + 1
            user_repository.update(db, user)
        except Exception:
            db.rollback()

        profile = UserResponse.model_validate(user)
        portafolios_data = []
        if user.role == "artista":
            portafolios_data = user_repository.get_portafolios_for_artist(db, user.id)

        convocatorias_data = []
        if user.role == "empresa":
            convocatorias_data = user_repository.get_convocatorias_for_company(db, user.id)

        return {
            "user": profile,
            "portafolios": portafolios_data,
            "convocatorias": convocatorias_data,
        }

    def get_user_by_id(self, db: Session, user_id: str) -> UserResponse:
        try:
            uid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="ID de usuario inválido")
        user = user_repository.get_by_id(db, uid)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return UserResponse.model_validate(user)

    def change_user_role(
        self, db: Session, user_id: str, role_update: UserRoleUpdate
    ) -> MessageResponse:
        try:
            uid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="ID de usuario inválido")
        user = user_repository.get_by_id(db, uid)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        user.role = role_update.role
        user_repository.update(db, user)
        return MessageResponse(message=f"Rol cambiado a {role_update.role} correctamente")

    def admin_reset_password(
        self, db: Session, user_id: str, body: AdminResetPasswordRequest
    ) -> MessageResponse:
        try:
            uid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="ID de usuario inválido")
        user = user_repository.get_by_id(db, uid)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        user.hashed_password = hash_password(body.new_password)
        user_repository.update(db, user)
        return MessageResponse(message=f"Contraseña de {user.full_name} restablecida con éxito")

    def get_all_convocatorias_admin(self, db: Session) -> List[Dict[str, Any]]:
        return user_repository.get_all_convocatorias_admin(db)

    def admin_delete_convocatoria(self, db: Session, conv_id: int) -> MessageResponse:
        nombre = user_repository.delete_convocatoria(db, conv_id)
        if not nombre:
            raise HTTPException(status_code=404, detail="Convocatoria no encontrada")
        return MessageResponse(message=f"Convocatoria '{nombre}' eliminada con éxito")

    def get_audit_logs(self, db: Session) -> List[Dict[str, Any]]:
        from app.models.notificacion import Notificacion
        from app.models.conv import Conv, Inscripcion
        from sqlalchemy import select

        def _format_time_ago(dt) -> str:
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

        logs = []
        try:
            nots = db.execute(select(Notificacion).order_by(Notificacion.created_at.desc()).limit(10)).scalars().all()
            for n in nots:
                u = user_repository.get_by_id(db, n.id_usr)
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
                u = user_repository.get_by_id(db, i.id_usr)
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


user_service = UserService()
