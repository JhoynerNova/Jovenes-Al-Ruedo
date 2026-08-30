"""
Router de Chat — soporta conversaciones por postulación aceptada, mensajes directos y soporte.
Endpoints:
  GET  /conversaciones              — listar mis conversaciones
  POST /conversaciones/directo      — empresa inicia mensaje directo con artista
  POST /soporte                     — iniciar chat de soporte con admin
  GET  /conversacion/{id}/mensajes  — obtener mensajes de una conversación
  POST /conversacion/{id}/mensajes  — enviar mensaje en una conversación
  WS   /ws/{id}                     — websocket para chat en tiempo real
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
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

def _safe_uuid(val) -> uuid.UUID:
    """Convierte de forma segura un valor a uuid.UUID."""
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


def _user_participates(conv: Conversacion, user_id: uuid.UUID) -> bool:
    """Verifica si un usuario participa en la conversación."""
    uid_str = str(user_id)
    return str(conv.empresa_id) == uid_str or str(conv.artista_id) == uid_str


def _get_otro_participante(conv: Conversacion, current_user: User, db: Session):
    """
    Retorna (otro_user, otro_uid, otro_nombre) para la conversación.
    Maneja correctamente soporte, directo y postulación.
    """
    current_id_str = str(current_user.id)

    if conv.tipo == "soporte":
        if current_user.role == "admin":
            # Admin ve la conversación → mostrar el cliente (no-admin)
            p1 = db.execute(select(User).where(User.id == conv.artista_id)).scalar_one_or_none()
            p2 = db.execute(select(User).where(User.id == conv.empresa_id)).scalar_one_or_none()

            # Preferir al no-admin
            cliente = None
            if p1 and p1.role != "admin":
                cliente = p1
            elif p2 and p2.role != "admin":
                cliente = p2
            # Si ambos son admin, elegir al que no soy yo
            elif p1 and str(p1.id) != current_id_str:
                cliente = p1
            elif p2 and str(p2.id) != current_id_str:
                cliente = p2

            if cliente:
                return cliente, cliente.id, cliente.full_name
            else:
                return None, conv.artista_id, "Solicitud de Soporte"
        else:
            # Usuario/empresa/artista ve soporte → mostrar "Soporte Oficial"
            return None, conv.empresa_id, "Soporte Oficial"
    else:
        # Conversación directa o postulación: mostrar al otro participante
        es_empresa = str(conv.empresa_id) == current_id_str
        otro_uid = conv.artista_id if es_empresa else conv.empresa_id
        try:
            otro_user = db.execute(select(User).where(User.id == _safe_uuid(otro_uid))).scalar_one_or_none()
        except Exception:
            otro_user = None
        nombre = otro_user.full_name if otro_user else "Usuario"
        return otro_user, otro_uid, nombre


def _get_destinatario_id(conv: Conversacion, remitente: User, db: Session) -> uuid.UUID:
    """
    Calcula el ID del destinatario correcto para notificaciones.
    """
    remitente_id_str = str(remitente.id)

    if conv.tipo == "soporte":
        if remitente.role == "admin":
            # Admin envía → notificar al cliente (no-admin)
            p1 = db.execute(select(User).where(User.id == conv.artista_id)).scalar_one_or_none()
            p2 = db.execute(select(User).where(User.id == conv.empresa_id)).scalar_one_or_none()
            if p1 and p1.role != "admin":
                return p1.id
            if p2 and p2.role != "admin":
                return p2.id
            # Fallback
            if p1 and str(p1.id) != remitente_id_str:
                return p1.id
            if p2 and str(p2.id) != remitente_id_str:
                return p2.id
            return conv.artista_id
        else:
            # Cliente envía → notificar al admin
            admin = db.execute(select(User).where(User.role == "admin")).scalars().first()
            if admin:
                return admin.id
            return conv.empresa_id
    else:
        # Directo/postulación: el otro participante
        if str(conv.empresa_id) == remitente_id_str:
            return conv.artista_id
        else:
            return conv.empresa_id


def _build_conversacion_response(
    conv: Conversacion,
    current_user: User,
    db: Session,
) -> ConversacionResponse:
    """Construye la respuesta de una conversación para el usuario actual."""
    otro_user, otro_uid, otro_nombre = _get_otro_participante(conv, current_user, db)

    # Nombre de la convocatoria (solo para tipo postulacion)
    conv_nombre = None
    if conv.tipo == "postulacion" and conv.id_i:
        try:
            insc = db.get(Inscripcion, conv.id_i)
            if insc and insc.convocatoria:
                conv_nombre = insc.convocatoria.nombre
        except Exception:
            pass

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
            Mensaje.remitente_id != current_user.id,
            Mensaje.leido == False,
        )
    ).scalar() or 0

    return ConversacionResponse(
        id_conversacion=conv.id_conversacion,
        tipo=conv.tipo,
        conv_nombre=conv_nombre,
        otro_usuario_id=str(otro_uid),
        otro_usuario_nombre=otro_nombre,
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
    """Obtener todas mis conversaciones (postulación + directos + soporte)."""
    user_uid = current_user.id

    if current_user.role == "admin":
        # Admin ve todas las de soporte + las propias
        stmt = select(Conversacion).where(
            or_(
                Conversacion.empresa_id == user_uid,
                Conversacion.artista_id == user_uid,
                Conversacion.tipo == "soporte",
            )
        )
    else:
        stmt = select(Conversacion).where(
            or_(
                Conversacion.empresa_id == user_uid,
                Conversacion.artista_id == user_uid,
            )
        )

    convs = db.execute(stmt).scalars().all()

    # Deduplicar por id_conversacion (el admin puede coincidir en multiples filtros)
    seen = set()
    unique_convs = []
    for c in convs:
        if c.id_conversacion not in seen:
            seen.add(c.id_conversacion)
            unique_convs.append(c)

    result = []
    for c in unique_convs:
        try:
            result.append(_build_conversacion_response(c, current_user, db))
        except Exception as e:
            print(f"[Chat] Error construyendo respuesta para conv {c.id_conversacion}: {e}")
            continue

    # Ordenar por último mensaje (más reciente primero)
    def sort_key(c: ConversacionResponse):
        return c.ultimo_mensaje_fecha or datetime.min.replace(tzinfo=timezone.utc)

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
    if current_user.role != "empresa":
        raise HTTPException(
            status_code=403,
            detail="Solo las empresas pueden iniciar mensajes directos",
        )

    artista_uid = body.artista_id
    artista = db.execute(
        select(User).where(User.id == artista_uid)
    ).scalar_one_or_none()

    if not artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    if artista.role != "artista":
        raise HTTPException(
            status_code=400,
            detail="Solo puedes enviar mensajes directos a artistas",
        )

    existing = db.execute(
        select(Conversacion).where(
            Conversacion.tipo == "directo",
            Conversacion.empresa_id == current_user.id,
            Conversacion.artista_id == artista_uid,
        )
    ).scalar_one_or_none()

    if existing:
        return _build_conversacion_response(existing, current_user, db)

    nueva = Conversacion(
        tipo="directo",
        empresa_id=current_user.id,
        artista_id=artista_uid,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return _build_conversacion_response(nueva, current_user, db)


# ── POST /soporte ──────────────────────
@router.post("/soporte", response_model=ConversacionResponse)
def iniciar_chat_soporte(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea o recupera la conversación de soporte directo entre el usuario y el Administrador."""
    admin = db.execute(select(User).where(User.role == "admin")).scalars().first()
    if not admin:
        admin = db.execute(select(User).where(User.is_active == True)).scalars().first()

    admin_uid = admin.id if admin else current_user.id

    # Verificar si ya existe conversación de soporte para este usuario
    existing = db.execute(
        select(Conversacion).where(
            Conversacion.tipo == "soporte",
            or_(
                and_(Conversacion.empresa_id == current_user.id, Conversacion.artista_id == admin_uid),
                and_(Conversacion.artista_id == current_user.id, Conversacion.empresa_id == admin_uid),
            )
        )
    ).scalars().first()

    if existing:
        return _build_conversacion_response(existing, current_user, db)

    nueva = Conversacion(
        tipo="soporte",
        empresa_id=admin_uid,
        artista_id=current_user.id,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    # Mensaje automático de bienvenida del soporte
    msg_bienvenida = Mensaje(
        id_conversacion=nueva.id_conversacion,
        remitente_id=admin_uid,
        contenido="👋 ¡Hola! Bienvenido al canal de Soporte Oficial — Jóvenes al Ruedo. ¿En qué te podemos ayudar hoy? (Cambio de clave, dudas, reportes, etc.)"
    )
    db.add(msg_bienvenida)
    db.commit()

    return _build_conversacion_response(nueva, current_user, db)


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

    if not _user_participates(conv, current_user.id) and current_user.role != "admin":
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

    if not _user_participates(conv, current_user.id) and current_user.role != "admin":
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

    try:
        destinatario_id = _get_destinatario_id(conv, current_user, db)
        from app.services import notification_service
        notification_service.create_notification(
            db,
            id_usr=destinatario_id,
            titulo=f"Nuevo mensaje de {current_user.full_name}",
            mensaje=body.contenido[:150],
            tipo="mensaje",
            enlace=f"/mensajes?convId={id_conversacion}"
        )
    except Exception as e:
        print(f"[Chat] Error al crear notificacion: {e}")

    return nuevo_mensaje


# ── WebSockets Connection Manager & Endpoint ──

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, id_conversacion: int):
        await websocket.accept()
        if id_conversacion not in self.active_connections:
            self.active_connections[id_conversacion] = []
        self.active_connections[id_conversacion].append(websocket)

    def disconnect(self, websocket: WebSocket, id_conversacion: int):
        if id_conversacion in self.active_connections:
            if websocket in self.active_connections[id_conversacion]:
                self.active_connections[id_conversacion].remove(websocket)
            if not self.active_connections[id_conversacion]:
                del self.active_connections[id_conversacion]

    async def broadcast(self, message: dict, id_conversacion: int):
        if id_conversacion in self.active_connections:
            for connection in self.active_connections[id_conversacion]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()


@router.websocket("/ws/{id_conversacion}")
async def websocket_endpoint(
    websocket: WebSocket,
    id_conversacion: int,
    db: Session = Depends(get_db),
):
    """Enlace bidireccional WebSocket para chat en tiempo real."""
    await manager.connect(websocket, id_conversacion)
    try:
        while True:
            data = await websocket.receive_json()
            remitente_id = data.get("remitente_id")
            contenido = data.get("contenido")

            if contenido and remitente_id:
                remitente_uuid = uuid.UUID(remitente_id) if isinstance(remitente_id, str) else remitente_id

                nuevo_mensaje = Mensaje(
                    id_conversacion=id_conversacion,
                    remitente_id=remitente_uuid,
                    contenido=contenido,
                )
                db.add(nuevo_mensaje)
                db.commit()
                db.refresh(nuevo_mensaje)

                # Generar notificación para el destinatario
                conv = db.get(Conversacion, id_conversacion)
                if conv:
                    rem_user = db.execute(select(User).where(User.id == remitente_uuid)).scalar_one_or_none()
                    if rem_user:
                        try:
                            dest_uid = _get_destinatario_id(conv, rem_user, db)
                            from app.services import notification_service
                            notification_service.create_notification(
                                db,
                                id_usr=dest_uid,
                                titulo=f"Nuevo mensaje de {rem_user.full_name}",
                                mensaje=contenido[:150],
                                tipo="mensaje",
                                enlace=f"/mensajes?convId={id_conversacion}"
                            )
                        except Exception as e:
                            print(f"[WS Chat] Error creando notificación: {e}")

                # Transmitir a todos los conectados
                broadcast_data = {
                    "id_msg": nuevo_mensaje.id_msg,
                    "id_conversacion": id_conversacion,
                    "remitente_id": str(nuevo_mensaje.remitente_id),
                    "contenido": nuevo_mensaje.contenido,
                    "created_at": nuevo_mensaje.created_at.isoformat() if nuevo_mensaje.created_at else None,
                    "leido": nuevo_mensaje.leido
                }
                await manager.broadcast(broadcast_data, id_conversacion)
    except WebSocketDisconnect:
        manager.disconnect(websocket, id_conversacion)
    except Exception:
        manager.disconnect(websocket, id_conversacion)
