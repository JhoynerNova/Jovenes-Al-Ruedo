"""
Módulo: services/notification_service.py
Descripción: Servicio de dominio para crear, consultar y administrar notificaciones.
"""
import uuid
from typing import List, Optional
from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import Session

from app.models.notificacion import Notificacion
from app.models.user import User


def create_notification(
    db: Session,
    id_usr: uuid.UUID,
    titulo: str,
    mensaje: str,
    tipo: str = "sistema",
    enlace: Optional[str] = None,
) -> Notificacion:
    """Crea y guarda una notificación para un usuario (o todos los admins si es soporte)."""
    try:
        uid = uuid.UUID(str(id_usr)) if isinstance(id_usr, (str, uuid.UUID)) else id_usr
    except Exception:
        uid = id_usr

    # Si la notificación es para un admin (o de soporte), notificar a todos los administradores activos
    target_user = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
    if target_user and target_user.role == "admin":
        admins = db.execute(select(User).where(User.role == "admin", User.is_active == True)).scalars().all()
        created_notif = None
        for adm in admins:
            n = Notificacion(
                id_usr=adm.id,
                titulo=titulo,
                mensaje=mensaje,
                tipo=tipo,
                enlace=enlace,
                leida=False,
            )
            db.add(n)
            created_notif = n
        db.commit()
        if created_notif:
            db.refresh(created_notif)
            return created_notif

    notif = Notificacion(
        id_usr=uid,
        titulo=titulo,
        mensaje=mensaje,
        tipo=tipo,
        enlace=enlace,
        leida=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_user_notifications(
    db: Session,
    id_usr: uuid.UUID,
    limit: int = 50,
    unread_only: bool = False,
) -> List[Notificacion]:
    """Obtiene las notificaciones del usuario ordenadas descendentemente por fecha."""
    stmt = select(Notificacion).where(Notificacion.id_usr == id_usr)
    if unread_only:
        stmt = stmt.where(Notificacion.leida == False)
    stmt = stmt.order_by(Notificacion.created_at.desc()).limit(limit)
    return list(db.execute(stmt).scalars().all())


def get_unread_count(db: Session, id_usr: uuid.UUID) -> int:
    """Cuenta las notificaciones no leídas de un usuario."""
    stmt = select(func.count()).select_from(Notificacion).where(
        Notificacion.id_usr == id_usr,
        Notificacion.leida == False,
    )
    return db.execute(stmt).scalar() or 0


def mark_as_read(db: Session, notification_id: uuid.UUID, id_usr: uuid.UUID) -> bool:
    """Marcar una notificación específica como leída."""
    stmt = (
        update(Notificacion)
        .where(Notificacion.id == notification_id, Notificacion.id_usr == id_usr)
        .values(leida=True)
    )
    res = db.execute(stmt)
    db.commit()
    return res.rowcount > 0


def mark_all_as_read(db: Session, id_usr: uuid.UUID) -> int:
    """Marcar todas las notificaciones de un usuario como leídas."""
    stmt = (
        update(Notificacion)
        .where(Notificacion.id_usr == id_usr, Notificacion.leida == False)
        .values(leida=True)
    )
    res = db.execute(stmt)
    db.commit()
    return res.rowcount


def delete_notification(db: Session, notification_id: uuid.UUID, id_usr: uuid.UUID) -> bool:
    """Eliminar una notificación de un usuario."""
    stmt = delete(Notificacion).where(
        Notificacion.id == notification_id,
        Notificacion.id_usr == id_usr,
    )
    res = db.execute(stmt)
    db.commit()
    return res.rowcount > 0
