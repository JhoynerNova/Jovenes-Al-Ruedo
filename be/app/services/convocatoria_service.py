"""
Módulo: services/convocatoria_service.py
Descripción: Capa de lógica de negocio para Convocatorias y Postulaciones.
"""

from datetime import date, datetime, time, timezone
import math
from typing import Optional, List, Dict, Any
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.conv import Conv, Inscripcion
from app.models.user import User
from app.models.conversacion import Conversacion
from app.repositories.convocatoria_repository import convocatoria_repository
from app.repositories.user_repository import user_repository
from app.schemas.conv import (
    ConvCreate,
    ConvResponse,
    InscripcionCreate,
    InscripcionUpdateStatus,
)
from app.services import notification_service

class ConvocatoriaService:
    """Lógica de negocio para convocatorias y postulaciones."""

    @staticmethod
    def to_dto(conv: Conv, db: Session) -> ConvResponse:
        """Transforma una entidad ORM Conv en su DTO de salida ConvResponse."""
        total_inscritos = convocatoria_repository.count_inscritos(db, conv.id_conv)
        return ConvResponse(
            id_conv=conv.id_conv,
            nombre=conv.nombre,
            glue=conv.glue,
            nivel_experiencia=conv.nivel_experiencia,
            tipo_jornada=conv.tipo_jornada,
            rango_salarial=conv.rango_salarial,
            ubicacion=conv.ubicacion,
            id_usr=str(conv.id_usr),
            empresa_nombre=conv.empresa.full_name if conv.empresa else None,
            empresa_sector=conv.empresa.sector if conv.empresa else None,
            created_at=conv.created_at,
            total_inscritos=total_inscritos,
        )

    def list_convocatorias(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Consulta paginada de convocatorias públicas con cálculo de páginas y total."""
        convs, total = convocatoria_repository.list_paginated(db, skip=skip, limit=limit, search=search)
        page = (skip // limit) + 1 if limit > 0 else 1
        pages = math.ceil(total / limit) if limit > 0 else 0
        items = [self.to_dto(c, db) for c in convs]

        return {
            "items": items,
            "total": total,
            "page": page,
            "size": limit,
            "pages": pages,
        }

    def get_my_convocatorias(self, db: Session, current_user: User) -> List[ConvResponse]:
        """Lista las convocatorias creadas por la empresa autenticada."""
        if current_user.role != "empresa":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo las empresas pueden ver sus convocatorias",
            )
        convs = convocatoria_repository.list_by_empresa(db, current_user.id)
        return [self.to_dto(c, db) for c in convs]

    def get_my_applications(self, db: Session, current_user: User) -> List[Dict[str, Any]]:
        """Lista las postulaciones activas del artista autenticado."""
        if current_user.role != "artista":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo los artistas pueden ver sus postulaciones",
            )
        inscripciones = convocatoria_repository.list_inscripciones_by_user(db, str(current_user.id))
        result = []
        for i in inscripciones:
            conv = convocatoria_repository.get_by_id(db, i.id_conv)
            if conv:
                result.append({
                    "id_i": i.id_i,
                    "id_conv": i.id_conv,
                    "conv_nombre": conv.nombre,
                    "empresa_nombre": conv.empresa.full_name if conv.empresa else None,
                    "estado": i.estado,
                    "created_at": i.created_at.isoformat(),
                })
        return result

    def get_reporte(
        self,
        db: Session,
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        estado: Optional[str] = None,
        conv_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Genera reporte administrativo parametrizado de postulaciones."""
        fecha_desde_dt = (
            datetime.combine(fecha_desde, time.min, tzinfo=timezone.utc)
            if fecha_desde else None
        )
        fecha_hasta_dt = (
            datetime.combine(fecha_hasta, time.max, tzinfo=timezone.utc)
            if fecha_hasta else None
        )

        inscripciones = convocatoria_repository.filter_inscripciones_report(
            db, fecha_desde_dt, fecha_hasta_dt, estado, conv_id
        )

        detalle = []
        resumen_por_estado: Dict[str, int] = {}
        for i in inscripciones:
            resumen_por_estado[i.estado] = resumen_por_estado.get(i.estado, 0) + 1
            conv = convocatoria_repository.get_by_id(db, i.id_conv)
            artista = None
            try:
                artista = user_repository.get_by_id(db, uuid.UUID(str(i.id_usr)))
            except Exception:
                pass

            detalle.append({
                "id_i": i.id_i,
                "id_conv": i.id_conv,
                "conv_nombre": conv.nombre if conv else None,
                "artista_nombre": artista.full_name if artista else None,
                "estado": i.estado,
                "created_at": i.created_at.isoformat(),
            })

        return {
            "filtros_aplicados": {
                "fecha_desde": fecha_desde.isoformat() if fecha_desde else None,
                "fecha_hasta": fecha_hasta.isoformat() if fecha_hasta else None,
                "estado": estado,
                "conv_id": conv_id,
            },
            "total": len(detalle),
            "resumen_por_estado": resumen_por_estado,
            "detalle": detalle,
        }

    def create_convocatoria(self, db: Session, body: ConvCreate, current_user: User) -> ConvResponse:
        """Crea una nueva convocatoria validando que el autor sea empresa."""
        if current_user.role != "empresa":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo las empresas pueden crear convocatorias",
            )

        conv = Conv(
            nombre=body.nombre,
            glue=body.glue,
            nivel_experiencia=body.nivel_experiencia,
            tipo_jornada=body.tipo_jornada,
            rango_salarial=body.rango_salarial,
            ubicacion=body.ubicacion,
            id_usr=current_user.id,
        )
        saved = convocatoria_repository.create_convocatoria(db, conv)
        return self.to_dto(saved, db)

    def get_convocatoria_detail(self, db: Session, conv_id: int) -> ConvResponse:
        """Obtiene el detalle de una convocatoria existente."""
        conv = convocatoria_repository.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Convocatoria no encontrada",
            )
        return self.to_dto(conv, db)

    def update_convocatoria(
        self,
        db: Session,
        conv_id: int,
        body: ConvCreate,
        current_user: User,
    ) -> ConvResponse:
        """Actualiza los datos de una convocatoria verificando pertenencia."""
        conv = convocatoria_repository.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Convocatoria no encontrada",
            )
        if str(conv.id_usr) != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para editar esta convocatoria",
            )

        conv.nombre = body.nombre
        conv.glue = body.glue
        conv.nivel_experiencia = body.nivel_experiencia
        conv.tipo_jornada = body.tipo_jornada
        conv.rango_salarial = body.rango_salarial
        conv.ubicacion = body.ubicacion

        updated = convocatoria_repository.update_convocatoria(db, conv)
        return self.to_dto(updated, db)

    def delete_convocatoria(self, db: Session, conv_id: int, current_user: User) -> None:
        """Elimina una convocatoria si el usuario es el creador o admin."""
        conv = convocatoria_repository.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Convocatoria no encontrada",
            )
        if str(conv.id_usr) != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar esta convocatoria",
            )
        convocatoria_repository.delete_convocatoria(db, conv)

    def apply_to_convocatoria(
        self,
        db: Session,
        conv_id: int,
        body: InscripcionCreate,
        current_user: User,
    ) -> Dict[str, Any]:
        """Gestiona la postulación de un artista a una convocatoria."""
        if current_user.role != "artista":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo los artistas pueden postularse",
            )

        conv = convocatoria_repository.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Convocatoria no encontrada",
            )

        existing = convocatoria_repository.get_inscripcion(db, conv_id, str(current_user.id))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya estás postulado a esta convocatoria",
            )

        insc = Inscripcion(
            id_conv=conv_id,
            id_usr=str(current_user.id),
            carta_presentacion=body.carta_presentacion,
            id_portafolio_interno=body.id_portafolio_interno,
            cv_url=body.cv_url,
        )
        saved = convocatoria_repository.create_inscripcion(db, insc)

        try:
            empresa_uuid = uuid.UUID(str(conv.id_usr))
            notification_service.create_notification(
                db,
                id_usr=empresa_uuid,
                titulo="Nueva postulación recibida",
                mensaje=f"{current_user.full_name} se ha postulado a tu convocatoria '{conv.nombre}'",
                tipo="postulacion",
                enlace="/dashboard",
            )
        except Exception:
            pass

        return {"message": "Postulación registrada", "id_i": saved.id_i}

    def withdraw_application(self, db: Session, conv_id: int, current_user: User) -> None:
        """Permite a un artista retirar su postulación."""
        insc = convocatoria_repository.get_inscripcion(db, conv_id, str(current_user.id))
        if not insc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes postulación en esta convocatoria",
            )
        convocatoria_repository.delete_inscripcion(db, insc)

    def get_applicants(self, db: Session, conv_id: int, current_user: User) -> List[Dict[str, Any]]:
        """Retorna la lista de postulantes para el tablero Kanban de la empresa dueña."""
        conv = convocatoria_repository.get_by_id(db, conv_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Convocatoria no encontrada",
            )
        if str(conv.id_usr) != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver los postulados",
            )

        inscripciones = convocatoria_repository.list_inscripciones_by_conv(db, conv_id)
        result = []
        for i in inscripciones:
            try:
                uid = uuid.UUID(str(i.id_usr))
            except Exception:
                continue
            artista = user_repository.get_by_id(db, uid)
            if artista:
                result.append({
                    "id_i": i.id_i,
                    "id_usr": str(artista.id),
                    "artista_nombre": artista.full_name,
                    "artista_email": artista.email,
                    "artista_area": artista.artistic_area,
                    "artista_bio": artista.bio,
                    "artista_location": artista.location,
                    "estado": i.estado,
                    "carta_presentacion": i.carta_presentacion,
                    "id_portafolio_interno": i.id_portafolio_interno,
                    "cv_url": i.cv_url,
                    "created_at": i.created_at.isoformat(),
                })
        return result

    def update_applicant_status(
        self,
        db: Session,
        conv_id: int,
        inscripcion_id: int,
        body: InscripcionUpdateStatus,
        current_user: User,
    ) -> Dict[str, Any]:
        """Actualiza el estado de evaluación de un aspirante y abre canal de chat si es aceptado."""
        conv = convocatoria_repository.get_by_id(db, conv_id)
        if not conv or (str(conv.id_usr) != str(current_user.id) and current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso",
            )

        insc = convocatoria_repository.get_inscripcion_by_id(db, inscripcion_id)
        if not insc or insc.id_conv != conv_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inscripción no encontrada",
            )

        insc.estado = body.estado
        convocatoria_repository.update_inscripcion(db, insc)

        try:
            artista_uuid = uuid.UUID(str(insc.id_usr))
            notification_service.create_notification(
                db,
                id_usr=artista_uuid,
                titulo=f"Postulación {body.estado}",
                mensaje=f"Tu postulación a la convocatoria '{conv.nombre}' ha sido actualizada a '{body.estado}'",
                tipo="postulacion",
                enlace="/dashboard",
            )
        except Exception:
            pass

        if body.estado == "Aceptada":
            from sqlalchemy import select
            existing = db.execute(
                select(Conversacion).where(Conversacion.id_i == inscripcion_id)
            ).scalar_one_or_none()
            if not existing:
                nueva_conv = Conversacion(
                    tipo="postulacion",
                    id_i=inscripcion_id,
                    empresa_id=conv.id_usr,
                    artista_id=insc.id_usr,
                )
                db.add(nueva_conv)
                db.commit()

        return {"message": "Estado actualizado", "estado": insc.estado}

convocatoria_service = ConvocatoriaService()
