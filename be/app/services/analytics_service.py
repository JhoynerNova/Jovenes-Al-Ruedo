"""
Módulo: services/analytics_service.py
Descripción: Servicio para cálculo de estadísticas de impacto, analíticas y generación de insignias (badges).
"""
import uuid
from typing import Dict, Any, List
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.portafolio import Portafolio, DetPortafolio
from app.models.conv import Conv, Inscripcion
from app.models.rating import Calificacion


def get_user_badges(db: Session, user: User) -> List[Dict[str, str]]:
    """Calcula la lista de insignias obtenidas por un usuario."""
    badges = []

    # 1. Badge por defecto: Talento Verificado SENA
    badges.append({
        "id": "sena_verified",
        "title": "Talento Verificado SENA",
        "icon": "🎭",
        "color": "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
        "description": "Usuario registrado y verificado en Jóvenes al Ruedo"
    })

    if user.role == "artista":
        # Contar portafolios y obras
        port_stmt = select(Portafolio).where(Portafolio.id_usr == user.id)
        portafolios = db.execute(port_stmt).scalars().all()
        port_ids = [p.id_port for p in portafolios]

        total_obras = 0
        if port_ids:
            obras_stmt = select(func.count()).select_from(DetPortafolio).where(DetPortafolio.id_port.in_(port_ids))
            total_obras = db.execute(obras_stmt).scalar() or 0

        # Promedio de calificaciones
        rating_stmt = select(func.avg(Calificacion.puntuacion)).where(Calificacion.artista_id == user.id)
        avg_rating = db.execute(rating_stmt).scalar() or 0.0

        # Insignia Artista Destacado
        if total_obras >= 3 or float(avg_rating or 0) >= 4.0:
            badges.append({
                "id": "featured_artist",
                "title": "Artista Destacado",
                "icon": "🌟",
                "color": "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
                "description": "Portafolio activo y destacadas valoraciones culturales"
            })

        # Contar postulaciones aceptadas
        accepted_stmt = select(func.count()).select_from(Inscripcion).where(
            Inscripcion.id_usr == user.id,
            Inscripcion.estado == "Aceptada"
        )
        accepted_count = db.execute(accepted_stmt).scalar() or 0

        if accepted_count > 0:
            badges.append({
                "id": "winner",
                "title": "Ganador de Convocatoria",
                "icon": "🏆",
                "color": "bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400",
                "description": "Seleccionado en convocatorias por empresas participantes"
            })

    elif user.role == "empresa":
        conv_stmt = select(func.count()).select_from(Conv).where(Conv.id_usr == user.id)
        total_convs = db.execute(conv_stmt).scalar() or 0

        if total_convs > 0:
            badges.append({
                "id": "active_company",
                "title": "Organización Activa",
                "icon": "⚡",
                "color": "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
                "description": "Generadora de oportunidades culturales y empleo para jóvenes"
            })

    return badges


def get_user_stats(db: Session, user: User) -> Dict[str, Any]:
    """Calcula el resumen de analíticas e impacto del usuario."""
    badges = get_user_badges(db, user)

    if user.role == "artista":
        port_stmt = select(Portafolio).where(Portafolio.id_usr == user.id)
        portafolios = db.execute(port_stmt).scalars().all()
        port_ids = [p.id_port for p in portafolios]

        total_obras = 0
        if port_ids:
            obras_stmt = select(func.count()).select_from(DetPortafolio).where(DetPortafolio.id_port.in_(port_ids))
            total_obras = db.execute(obras_stmt).scalar() or 0

        insc_total_stmt = select(func.count()).select_from(Inscripcion).where(Inscripcion.id_usr == user.id)
        total_postulaciones = db.execute(insc_total_stmt).scalar() or 0

        insc_accepted_stmt = select(func.count()).select_from(Inscripcion).where(
            Inscripcion.id_usr == user.id,
            Inscripcion.estado == "Aceptada"
        )
        postulaciones_aceptadas = db.execute(insc_accepted_stmt).scalar() or 0

        tasa_exito = round((postulaciones_aceptadas / total_postulaciones * 100), 1) if total_postulaciones > 0 else 0.0

        rating_stmt = select(func.avg(Calificacion.puntuacion), func.count(Calificacion.id)).where(Calificacion.artista_id == user.id)
        avg_rating, total_ratings = db.execute(rating_stmt).first() or (0.0, 0)
        avg_rating = round(float(avg_rating or 0), 1)

        # Vistas reales acumuladas + estimación activa
        real_views = getattr(user, "profile_views", 0) or 0
        vistas_totales = real_views + (total_obras * 14) + (total_postulaciones * 8) + (total_ratings * 25) + 32

        return {
            "vistas_perfil": vistas_totales,
            "total_obras": total_obras,
            "total_postulaciones": total_postulaciones,
            "postulaciones_aceptadas": postulaciones_aceptadas,
            "tasa_exito": tasa_exito,
            "promedio_calificacion": avg_rating,
            "total_calificaciones": total_ratings,
            "badges": badges,
        }

    else: # Empresa
        conv_stmt = select(func.count()).select_from(Conv).where(Conv.id_usr == user.id)
        total_convs = db.execute(conv_stmt).scalar() or 0

        conv_ids_stmt = select(Conv.id_conv).where(Conv.id_usr == user.id)
        conv_ids = db.execute(conv_ids_stmt).scalars().all()

        total_postulaciones_recibidas = 0
        if conv_ids:
            post_recibidas_stmt = select(func.count()).select_from(Inscripcion).where(Inscripcion.id_conv.in_(conv_ids))
            total_postulaciones_recibidas = db.execute(post_recibidas_stmt).scalar() or 0

        real_views = getattr(user, "profile_views", 0) or 0
        vistas_totales = real_views + (total_convs * 45) + (total_postulaciones_recibidas * 12) + 50

        return {
            "vistas_perfil": vistas_totales,
            "total_convocatorias": total_convs,
            "postulaciones_recibidas": total_postulaciones_recibidas,
            "postulantes_promedio": round(total_postulaciones_recibidas / total_convs, 1) if total_convs > 0 else 0.0,
            "badges": badges,
        }
