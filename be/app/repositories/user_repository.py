"""
Módulo: repositories/user_repository.py
Descripción: Repositorio para la entidad User y consultas relacionadas con perfiles y administración.
"""

from typing import Optional, List, Dict, Any, Tuple
import math
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.conv import Conv, Inscripcion
from app.models.portafolio import Portafolio, DetPortafolio


class UserRepository:
    """Encapsula operaciones de persistencia para la entidad User y datos de perfil."""

    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        """Busca un usuario por su clave primaria UUID."""
        return db.get(User, user_id)

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Busca un usuario por su dirección de email."""
        stmt = select(User).where(User.email == email)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def create(db: Session, user: User) -> User:
        """Persiste una nueva entidad User en la base de datos."""
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, user: User) -> User:
        """Actualiza el estado de una entidad User existente."""
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_artists(db: Session, skip: int = 0, limit: int = 20) -> List[User]:
        """Retorna listado de usuarios con rol artista."""
        stmt = select(User).where(User.role == "artista").offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_companies(db: Session, skip: int = 0, limit: int = 20) -> List[User]:
        """Retorna listado de usuarios con rol empresa."""
        stmt = select(User).where(User.role == "empresa").offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_active(db: Session) -> List[User]:
        """Retorna todos los usuarios activos del sistema."""
        stmt = select(User).where(User.is_active == True)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_paginated(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        role: Optional[str] = None,
        sort_by: str = "created_at",
        sort_desc: bool = True,
    ) -> Tuple[List[User], int]:
        """Retorna usuarios paginados con conteo total y filtros."""
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

        sort_column = getattr(User, sort_by, User.created_at)
        if sort_desc:
            sort_column = sort_column.desc()

        users = db.execute(stmt.order_by(sort_column).offset(skip).limit(limit)).scalars().all()
        return list(users), total

    @staticmethod
    def explore_artists(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        area: Optional[str] = None,
    ) -> Tuple[List[User], int]:
        """Retorna artistas públicos con conteo para el explorador."""
        stmt = select(User).where(User.role == "artista", User.is_active == True)
        if search:
            term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    User.first_name.ilike(term),
                    User.last_name.ilike(term),
                    User.artistic_area.ilike(term),
                )
            )
        if area:
            stmt = stmt.where(User.artistic_area.ilike(f"%{area}%"))

        total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar() or 0
        users = db.execute(stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)).scalars().all()
        return list(users), total

    @staticmethod
    def explore_companies(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
    ) -> Tuple[List[User], int]:
        """Retorna empresas públicas con conteo para el explorador."""
        stmt = select(User).where(User.role == "empresa", User.is_active == True)
        if search:
            term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    User.first_name.ilike(term),
                    User.last_name.ilike(term),
                    User.sector.ilike(term),
                )
            )

        total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar() or 0
        users = db.execute(stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)).scalars().all()
        return list(users), total

    @staticmethod
    def get_admin_stats(db: Session) -> Dict[str, int]:
        """Calcula métricas agregadas del sistema para el panel administrativo."""
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

    @staticmethod
    def get_portafolios_for_artist(db: Session, user_id: Any) -> List[Dict[str, Any]]:
        """Obtiene portafolios e ítems públicos de un artista."""
        try:
            ports = db.execute(select(Portafolio).where(Portafolio.id_usr == user_id)).scalars().all()
        except Exception:
            db.rollback()
            ports = db.execute(select(Portafolio).where(Portafolio.id_usr == str(user_id))).scalars().all()

        portafolios_data = []
        for p in ports:
            archivos = db.execute(
                select(DetPortafolio).where(DetPortafolio.id_port == p.id_port, DetPortafolio.estado == "P")
            ).scalars().all()
            portafolios_data.append({
                "id_port": p.id_port,
                "nombre": p.nombre,
                "archivos": [
                    {
                        "id_det_p": a.id_det_p,
                        "archivo": a.archivo,
                        "titulo": a.titulo,
                        "descripcion": a.descripcion,
                    }
                    for a in archivos
                ],
            })
        return portafolios_data

    @staticmethod
    def get_convocatorias_for_company(db: Session, user_id: Any) -> List[Dict[str, Any]]:
        """Obtiene convocatorias emitidas por una empresa con conteo de inscritos."""
        try:
            convs_q = db.execute(select(Conv).where(Conv.id_usr == user_id)).scalars().all()
        except Exception:
            db.rollback()
            convs_q = db.execute(select(Conv).where(Conv.id_usr == str(user_id))).scalars().all()

        convocatorias_data = []
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
        return convocatorias_data

    @staticmethod
    def get_all_convocatorias_admin(db: Session) -> List[Dict[str, Any]]:
        """Obtiene todas las convocatorias para moderación administrativa."""
        convs = db.execute(select(Conv).order_by(Conv.created_at.desc())).scalars().all()
        result = []
        for c in convs:
            empresa = db.execute(select(User).where(User.id == c.id_usr)).scalar_one_or_none()
            total_inscritos = db.execute(
                select(func.count()).where(Inscripcion.id_conv == c.id_conv)
            ).scalar() or 0
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

    @staticmethod
    def delete_convocatoria(db: Session, conv_id: int) -> Optional[str]:
        """Elimina una convocatoria por moderación de administrador."""
        conv = db.get(Conv, conv_id)
        if not conv:
            return None
        nombre = conv.nombre
        db.delete(conv)
        db.commit()
        return nombre


user_repository = UserRepository()
