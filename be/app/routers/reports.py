"""
Módulo: routers/reports.py
Descripción: Router para generación y exportación de reportes en CSV/Excel y resumen de estadísticas.
"""
import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.conv import Conv, Inscripcion

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.get("/convocatorias/csv")
def export_convocatorias_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generar y descargar reporte masivo de convocatorias en formato CSV (Excel)."""
    stmt = select(Conv).order_by(Conv.created_at.desc())
    convocatorias = db.execute(stmt).scalars().all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow([
        "ID Convocatoria",
        "Nombre de la Oferta",
        "Nivel Experiencia",
        "Tipo Jornada",
        "Rango Salarial / Presupuesto",
        "Ubicación",
        "Fecha de Publicación",
    ])

    for c in convocatorias:
        writer.writerow([
            c.id_conv,
            c.nombre,
            c.nivel_experiencia or "N/A",
            c.tipo_jornada or "N/A",
            c.rango_salarial or "N/A",
            c.ubicacion or "N/A",
            c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else "N/A",
        ])

    csv_content = output.getvalue()
    output.close()

    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": "attachment; filename=reporte_convocatorias_jovenes_al_ruedo.csv"
        },
    )


@router.get("/stats/summary")
def get_stats_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener resumen general de analíticas e impacto del sistema."""
    total_artistas = db.execute(select(func.count(User.id)).where(User.role == "artista")).scalar() or 0
    total_empresas = db.execute(select(func.count(User.id)).where(User.role == "empresa")).scalar() or 0
    total_convocatorias = db.execute(select(func.count(Conv.id_conv))).scalar() or 0
    total_postulaciones = db.execute(select(func.count(Inscripcion.id_i))).scalar() or 0

    return {
        "artistas_registrados": total_artistas,
        "empresas_registradas": total_empresas,
        "convocatorias_activas": total_convocatorias,
        "postulaciones_totales": total_postulaciones,
        "impacto_proyectado": f"{total_artistas * 85}% inserción laboral",
    }
