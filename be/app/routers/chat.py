"""
Router de Chat — soporta conversaciones por postulación aceptada, mensajes directos y soporte.
Delega toda la lógica de negocio a chat_service y persistencia a chat_repository.
Endpoints:
  GET  /conversaciones              — listar mis conversaciones
  POST /conversaciones/directo      — empresa inicia mensaje directo con artista
  POST /soporte                     — iniciar chat de soporte con admin
  GET  /conversacion/{id}/mensajes  — obtener mensajes de una conversación
  POST /conversacion/{id}/mensajes  — enviar mensaje en una conversación
  WS   /ws/{id}                     — websocket para chat en tiempo real
"""

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.chat import Mensaje
from app.models.conversacion import Conversacion
from app.models.user import User
from app.schemas.chat import (
    MensajeCreate,
    MensajeResponse,
    ConversacionResponse,
    ConversacionDirectaCreate,
)
from app.services.chat_service import chat_service, manager
from app.repositories.chat_repository import chat_repository

router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])


@router.get("/conversaciones", response_model=list[ConversacionResponse])
def get_conversaciones(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtener todas mis conversaciones (postulación + directos + soporte)."""
    return chat_service.get_conversaciones(db, current_user)


@router.post("/conversaciones/directo", response_model=ConversacionResponse)
def crear_conversacion_directa(
    body: ConversacionDirectaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Una empresa inicia un mensaje directo con un artista."""
    return chat_service.crear_conversacion_directa(db, current_user, body)


@router.post("/soporte", response_model=ConversacionResponse)
def iniciar_chat_soporte(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea o recupera la conversación de soporte directo entre el usuario y el Administrador."""
    return chat_service.iniciar_chat_soporte(db, current_user)


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
    return chat_service.get_mensajes(db, current_user, id_conversacion)


@router.post(
    "/conversacion/{id_conversacion}/mensajes",
    response_model=MensajeResponse,
)
async def enviar_mensaje(
    id_conversacion: int,
    body: MensajeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Enviar un mensaje en una conversación."""
    return await chat_service.enviar_mensaje(db, current_user, id_conversacion, body)


@router.websocket("/ws/{id_conversacion}")
async def websocket_endpoint(
    websocket: WebSocket,
    id_conversacion: int,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Enlace bidireccional WebSocket para chat en tiempo real con autenticación y autorización."""
    auth_token = token or websocket.query_params.get("token")
    if not auth_token:
        auth_header = websocket.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ")[1]
        elif not auth_token:
            auth_token = websocket.cookies.get("access_token")

    if not auth_token:
        await websocket.close(code=1008)
        return

    from app.utils.security import decode_token
    payload = decode_token(auth_token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=1008)
        return

    email = payload.get("sub")
    if not email:
        await websocket.close(code=1008)
        return

    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or not user.is_active:
        await websocket.close(code=1008)
        return

    conv = chat_repository.get_conversacion(db, id_conversacion)
    if not conv or (not chat_service.user_participates(conv, user.id) and user.role != "admin"):
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, id_conversacion)
    try:
        while True:
            data = await websocket.receive_json()
            contenido = data.get("contenido")

            if contenido and contenido.strip():
                remitente_uuid = user.id
                nuevo_mensaje = Mensaje(
                    id_conversacion=id_conversacion,
                    remitente_id=remitente_uuid,
                    contenido=contenido.strip(),
                )
                chat_repository.create_mensaje(db, nuevo_mensaje)

                conv_actual = chat_repository.get_conversacion(db, id_conversacion)
                if conv_actual:
                    try:
                        dest_uid = chat_service._get_destinatario_id(conv_actual, user, db)
                        from app.services import notification_service
                        notification_service.create_notification(
                            db,
                            id_usr=dest_uid,
                            titulo=f"Nuevo mensaje de {user.full_name}",
                            mensaje=contenido[:150],
                            tipo="mensaje",
                            enlace=f"/mensajes?convId={id_conversacion}",
                        )
                    except Exception as e:
                        print(f"[WS Chat] Error creando notificación: {e}")

                broadcast_data = {
                    "id_msg": nuevo_mensaje.id_msg,
                    "id_conversacion": id_conversacion,
                    "remitente_id": str(nuevo_mensaje.remitente_id),
                    "contenido": nuevo_mensaje.contenido,
                    "created_at": (
                        nuevo_mensaje.created_at.isoformat() if nuevo_mensaje.created_at else None
                    ),
                    "leido": nuevo_mensaje.leido,
                }
                await manager.broadcast(broadcast_data, id_conversacion)
    except WebSocketDisconnect:
        manager.disconnect(websocket, id_conversacion)
    except Exception:
        manager.disconnect(websocket, id_conversacion)
