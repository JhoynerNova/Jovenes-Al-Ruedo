"""
Módulo: repositories/convocatoria_repository.py
Descripción: Capa de persistencia para Convocatorias e Inscripciones.
¿Para qué? Encapsular todas las sentencias SQL y operaciones ORM sobre las tablas 'conv' e 'inscripcion'.
"""

from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
import uuid
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session
from app.models.conv import Conv, Inscripcion
from app.models.user import User


class ConvocatoriaRepository:
    """Repositorio para gestionar el acceso a datos de Convocatorias e Inscripciones."""

    @staticmethod
    def get_by_id(db: Session, conv_id: int) -> Optional[Conv]:
        """Obtiene una convocatoria por su clave primaria."""
        return db.get(Conv, conv_id)

    @staticmethod
    def list_paginated(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
    ) -> Tuple[List[Conv], int]:
        """Retorna una lista paginada de convocatorias y el total de registros encontrados."""
        stmt = select(Conv)
        if search:
            stmt = stmt.where(Conv.nombre.ilike(f"%{search}%"))
        
        total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar() or 0
        convs = db.execute(
            stmt.order_by(Conv.created_at.desc()).offset(skip).limit(limit)
        ).scalars().all()
        return list(convs), total

    @staticmethod
    def count_inscritos(db: Session, conv_id: int) -> int:
        """Cuenta el total de inscritos postulados a una convocatoria específica."""
        stmt = select(func.count()).where(Inscripcion.id_conv == conv_id)
        return db.execute(stmt).scalar() or 0

    @staticmethod
    def list_by_empresa(db: Session, empresa_id: uuid.UUID) -> List[Conv]:
        """Lista las convocatorias publicadas por una empresa específica."""
        stmt = select(Conv).where(Conv.id_usr == empresa_id).order_by(Conv.created_at.desc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create_convocatoria(db: Session, conv: Conv) -> Conv:
        """Persiste una nueva convocatoria."""
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    @staticmethod
    def update_convocatoria(db: Session, conv: Conv) -> Conv:
        """Actualiza una convocatoria existente."""
        db.commit()
        db.refresh(conv)
        return conv

    @staticmethod
    def delete_convocatoria(db: Session, conv: Conv) -> None:
        """Elimina una convocatoria de la base de datos."""
        db.delete(conv)
        db.commit()

    @staticmethod
    def get_inscripcion(db: Session, conv_id: int, user_id_str: str) -> Optional[Inscripcion]:
        """Busca una postulación existente por convocatoria y usuario."""
        stmt = select(Inscripcion).where(
            Inscripcion.id_conv == conv_id,
            Inscripcion.id_usr == user_id_str,
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_inscripcion_by_id(db: Session, inscripcion_id: int) -> Optional[Inscripcion]:
        """Obtiene una inscripción por su ID."""
        return db.get(Inscripcion, inscripcion_id)

    @staticmethod
    def list_inscripciones_by_user(db: Session, user_id_str: str) -> List[Inscripcion]:
        """Lista las inscripciones realizadas por un artista."""
        stmt = select(Inscripcion).where(
            Inscripcion.id_usr == user_id_str
        ).order_by(Inscripcion.created_at.desc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_inscripciones_by_conv(db: Session, conv_id: int) -> List[Inscripcion]:
        """Lista todos los postulados a una convocatoria específica."""
        stmt = select(Inscripcion).where(
            Inscripcion.id_conv == conv_id
        ).order_by(Inscripcion.created_at.desc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create_inscripcion(db: Session, inscripcion: Inscripcion) -> Inscripcion:
        """Registra una nueva postulación."""
        db.add(inscripcion)
        db.commit()
        db.refresh(inscripcion)
        return inscripcion

    @staticmethod
    def update_inscripcion(db: Session, inscripcion: Inscripcion) -> Inscripcion:
        """Actualiza el estado o datos de una postulación."""
        db.commit()
        db.refresh(inscripcion)
        return inscripcion

    @staticmethod
    def delete_inscripcion(db: Session, inscripcion: Inscripcion) -> None:
        """Elimina una postulación."""
        db.delete(inscripcion)
        db.commit()

    @staticmethod
    def filter_inscripciones_report(
        db: Session,
        fecha_desde_dt: Optional[datetime] = None,
        fecha_hasta_dt: Optional[datetime] = None,
        estado: Optional[str] = None,
        conv_id: Optional[int] = None,
    ) -> List[Inscripcion]:
        """Ejecuta consulta parametrizada para el reporte de auditoría de postulaciones."""
        stmt = select(Inscripcion)
        if fecha_desde_dt:
            stmt = stmt.where(Inscripcion.created_at >= fecha_desde_dt)
        if fecha_hasta_dt:
            stmt = stmt.where(Inscripcion.created_at <= fecha_hasta_dt)
        if estado:
            stmt = stmt.where(Inscripcion.estado == estado)
        if conv_id:
            stmt = stmt.where(Inscripcion.id_conv == conv_id)

        return list(db.execute(stmt.order_by(Inscripcion.created_at.desc())).scalars().all())


convocatoria_repository = ConvocatoriaRepository()
