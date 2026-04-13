"""
Router de Chat — soporta conversaciones por postulación aceptada y mensajes directos.
Endpoints:
  GET  /conversaciones              — listar mis conversaciones
  POST /conversaciones/directo      — empresa inicia mensaje directo con artista
  GET  /conversacion/{id}/mensajes  — obtener mensajes de una conversación
  POST /conversacion/{id}/mensajes  — enviar mensaje en una conversación
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_, and_, func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.conv import Conv, Inscripcion
from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.schemas.chat import (
    MensajeCreate,
    MensajeResponse,
    ConversacionResponse,
    ConversacionDirectaCreate,
)

router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])


# ── Helpers ──────────────────────────────────────────
def _build_conversacion_response(
    conv: Conversacion,
    current_user_id: uuid.UUID,
    db: Session,
) -> ConversacionResponse:
    """Construye la respuesta de una conversación para el usuario actual."""
    es_empresa = conv.empresa_id == current_user_id
    otro_uid = conv.artista_id if es_empresa else conv.empresa_id

    # Obtener datos del otro usuario
    try:
        otro_user = db.execute(
            select(User).where(User.id == otro_uid)
        ).scalar_one_or_none()
    except Exception:
        otro_user = None

    # Nombre de la convocatoria (solo para tipo postulacion)
    conv_nombre = None
    if conv.tipo == "postulacion" and conv.id_i:
        insc = db.get(Inscripcion, conv.id_i)
        if insc and insc.convocatoria:
            conv_nombre = insc.convocatoria.nombre

    # Último mensaje
    ultimo_msg = db.execute(
        select(Mensaje)
        .where(Mensaje.id_conversacion == conv.id_conversacion)
        .order_by(Mensaje.created_at.desc())
        .limit(1)
    ).scalar_one_or_none()

    # No leídos
    no_leidos = db.execute(
        select(func.count(Mensaje.id_msg)).where(
            Mensaje.id_conversacion == conv.id_conversacion,
            Mensaje.remitente_id != current_user_id,
            Mensaje.leido == False,
        )
    ).scalar() or 0

    return ConversacionResponse(
        id_conversacion=conv.id_conversacion,
        tipo=conv.tipo,
        conv_nombre=conv_nombre,
        otro_usuario_id=str(otro_uid),
        otro_usuario_nombre=otro_user.full_name if otro_user else "Usuario",
        otro_usuario_avatar=otro_user.profile_pic_url if otro_user else None,
        otro_usuario_role=otro_user.role if otro_user else None,
        ultimo_mensaje_texto=ultimo_msg.contenido if ultimo_msg else None,
        ultimo_mensaje_fecha=ultimo_msg.created_at if ultimo_msg else None,
        no_leidos=no_leidos,
    )


# ── GET /conversaciones ─────────────────────────────
@router.get("/conversaciones", response_model=list[ConversacionResponse])
def get_conversaciones(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtener todas mis conversaciones (postulación + directos)."""
    user_uid = current_user.id
    user_id_str = str(current_user.id)

    convs = db.execute(
        select(Conversacion).where(
            or_(
                Conversacion.empresa_id == user_uid,
                Conversacion.artista_id == user_uid,
            )
        )
    ).scalars().all()

    result = [
        _build_conversacion_response(c, user_uid, db) for c in convs
    ]

    # Ordenar por último mensaje (más reciente primero)
    def sort_key(c: ConversacionResponse):
        return c.ultimo_mensaje_fecha or datetime.min.replace(
            tzinfo=timezone.utc
        )

    result.sort(key=sort_key, reverse=True)
    return result


# ── POST /conversaciones/directo ─────────────────────
@router.post("/conversaciones/directo", response_model=ConversacionResponse)
def crear_conversacion_directa(
    body: ConversacionDirectaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Una empresa inicia un mensaje directo con un artista."""
    # Solo empresas pueden iniciar mensajes directos
    if current_user.role != "empresa":
        raise HTTPException(
            status_code=403,
            detail="Solo las empresas pueden iniciar mensajes directos",
        )

    user_id_str = str(current_user.id)

    # Verificar que el artista existe y es artista
    try:
        artista_uid = uuid.UUID(body.artista_id)
        artista = db.execute(
            select(User).where(User.id == artista_uid)
        ).scalar_one_or_none()
    except Exception:
        artista = None

    if not artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    if artista.role != "artista":
        raise HTTPException(
            status_code=400,
            detail="Solo puedes enviar mensajes directos a artistas",
        )

    # Verificar si ya existe una conversación directa entre ambos
    existing = db.execute(
        select(Conversacion).where(
            Conversacion.tipo == "directo",
            Conversacion.empresa_id == current_user.id,
            Conversacion.artista_id == artista_uid,
        )
    ).scalar_one_or_none()

    if existing:
        # Ya existe, retornar la existente
        return _build_conversacion_response(existing, current_user.id, db)

    nueva = Conversacion(
        tipo="directo",
        empresa_id=current_user.id,
        artista_id=artista_uid,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return _build_conversacion_response(nueva, current_user.id, db)


# ── GET /conversacion/{id}/mensajes ──────────────────
@router.get(
    "/conversacion/{id_conversacion}/mensajes",
    response_model=list[MensajeResponse],
)
def get_mensajes(
    id_conversacion: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtener mensajes de una conversación."""
    conv = db.get(Conversacion, id_conversacion)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    user_id_str = str(current_user.id)
    if str(conv.empresa_id) != user_id_str and str(conv.artista_id) != user_id_str:
        raise HTTPException(
            status_code=403, detail="No tienes acceso a esta conversación"
        )

    mensajes = (
        db.execute(
            select(Mensaje)
            .where(Mensaje.id_conversacion == id_conversacion)
            .order_by(Mensaje.created_at.asc())
        )
        .scalars()
        .all()
    )

    # Marcar como leídos los mensajes que no son míos
    for msg in mensajes:
        if msg.remitente_id != current_user.id and not msg.leido:
            msg.leido = True
    db.commit()

    return mensajes


# ── POST /conversacion/{id}/mensajes ─────────────────
@router.post(
    "/conversacion/{id_conversacion}/mensajes",
    response_model=MensajeResponse,
)
def enviar_mensaje(
    id_conversacion: int,
    body: MensajeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Enviar un mensaje en una conversación."""
    conv = db.get(Conversacion, id_conversacion)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    user_id_str = str(current_user.id)
    if str(conv.empresa_id) != user_id_str and str(conv.artista_id) != user_id_str:
        raise HTTPException(
            status_code=403, detail="No tienes acceso a esta conversación"
        )

    nuevo_mensaje = Mensaje(
        id_conversacion=id_conversacion,
        remitente_id=current_user.id,
        contenido=body.contenido,
    )
    db.add(nuevo_mensaje)
    db.commit()
    db.refresh(nuevo_mensaje)
    return nuevo_mensaje
