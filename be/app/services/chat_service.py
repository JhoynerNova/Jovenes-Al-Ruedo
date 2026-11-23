"""
Módulo: services/chat_service.py
Descripción: Capa de lógica de negocio para chat, mensajería y WebSockets.
"""

from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
import uuid

from fastapi import HTTPException, WebSocket, status
from sqlalchemy.orm import Session

from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.models.user import User
from app.schemas.chat import (
    MensajeCreate,
    MensajeResponse,
    ConversacionResponse,
    ConversacionDirectaCreate,
)
from app.repositories.chat_repository import chat_repository


class ConnectionManager:
    """Administra conexiones activas de WebSockets por sala/conversación."""

    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

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
            for connection in list(self.active_connections[id_conversacion]):
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()


class ChatService:
    """Servicio que encapsula las reglas de negocio del chat."""

    @staticmethod
    def _safe_uuid(val) -> uuid.UUID:
        if isinstance(val, uuid.UUID):
            return val
        return uuid.UUID(str(val))

    @staticmethod
    def user_participates(conv: Conversacion, user_id: uuid.UUID) -> bool:
        uid_str = str(user_id)
        return str(conv.empresa_id) == uid_str or str(conv.artista_id) == uid_str

    def _get_otro_participante(
        self, conv: Conversacion, current_user: User, db: Session
    ) -> Tuple[Optional[User], Any, str]:
        current_id_str = str(current_user.id)

        if conv.tipo == "soporte":
            if current_user.role == "admin":
                p1 = chat_repository.get_user_by_id(db, conv.artista_id)
                p2 = chat_repository.get_user_by_id(db, conv.empresa_id)

                cliente = None
                if p1 and p1.role != "admin":
                    cliente = p1
                elif p2 and p2.role != "admin":
                    cliente = p2
                elif p1 and str(p1.id) != current_id_str:
                    cliente = p1
                elif p2 and str(p2.id) != current_id_str:
                    cliente = p2

                if cliente:
                    return cliente, cliente.id, cliente.full_name
                else:
                    return None, conv.artista_id, "Solicitud de Soporte"
            else:
                return None, conv.empresa_id, "Soporte Oficial"
        else:
            es_empresa = str(conv.empresa_id) == current_id_str
            otro_uid = conv.artista_id if es_empresa else conv.empresa_id
            try:
                otro_user = chat_repository.get_user_by_id(db, self._safe_uuid(otro_uid))
            except Exception:
                otro_user = None
            nombre = otro_user.full_name if otro_user else "Usuario"
            return otro_user, otro_uid, nombre

    def _get_destinatario_id(
        self, conv: Conversacion, remitente: User, db: Session
    ) -> uuid.UUID:
        remitente_id_str = str(remitente.id)

        if conv.tipo == "soporte":
            if remitente.role == "admin":
                p1 = chat_repository.get_user_by_id(db, conv.artista_id)
                p2 = chat_repository.get_user_by_id(db, conv.empresa_id)
                if p1 and p1.role != "admin":
                    return p1.id
                if p2 and p2.role != "admin":
                    return p2.id
                if p1 and str(p1.id) != remitente_id_str:
                    return p1.id
                if p2 and str(p2.id) != remitente_id_str:
                    return p2.id
                return conv.artista_id
            else:
                return conv.empresa_id
        else:
            if str(conv.empresa_id) == remitente_id_str:
                return conv.artista_id
            else:
                return conv.empresa_id

    def _build_conversacion_response(
        self, conv: Conversacion, current_user: User, db: Session
    ) -> ConversacionResponse:
        otro_user, otro_uid, otro_nombre = self._get_otro_participante(conv, current_user, db)

        conv_nombre = None
        if conv.tipo == "postulacion" and conv.id_i:
            try:
                insc = chat_repository.get_inscripcion(db, conv.id_i)
                if insc and insc.convocatoria:
                    conv_nombre = insc.convocatoria.nombre
            except Exception:
                pass

        ultimo_msg = chat_repository.get_last_message(db, conv.id_conversacion)
        no_leidos = chat_repository.count_unread(db, conv.id_conversacion, current_user.id)

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

    def get_conversaciones(
        self, db: Session, current_user: User
    ) -> List[ConversacionResponse]:
        is_admin = current_user.role == "admin"
        unique_convs = chat_repository.list_conversaciones_for_user(
            db, current_user.id, is_admin=is_admin
        )

        result: List[ConversacionResponse] = []
        for c in unique_convs:
            try:
                result.append(self._build_conversacion_response(c, current_user, db))
            except Exception as e:
                print(f"[Chat] Error construyendo respuesta para conv {c.id_conversacion}: {e}")
                continue

        def sort_key(c: ConversacionResponse):
            return c.ultimo_mensaje_fecha or datetime.min.replace(tzinfo=timezone.utc)

        result.sort(key=sort_key, reverse=True)
        return result

    def crear_conversacion_directa(
        self, db: Session, current_user: User, body: ConversacionDirectaCreate
    ) -> ConversacionResponse:
        if current_user.role != "empresa":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo las empresas pueden iniciar mensajes directos",
            )

        artista_uid = body.artista_id
        artista = chat_repository.get_user_by_id(db, artista_uid)

        if not artista:
            raise HTTPException(status_code=404, detail="Artista no encontrado")
        if artista.role != "artista":
            raise HTTPException(
                status_code=400,
                detail="Solo puedes enviar mensajes directos a artistas",
            )

        existing = chat_repository.find_direct(db, current_user.id, artista_uid)
        if existing:
            return self._build_conversacion_response(existing, current_user, db)

        nueva = Conversacion(
            tipo="directo",
            empresa_id=current_user.id,
            artista_id=artista_uid,
        )
        chat_repository.create_conversacion(db, nueva)
        return self._build_conversacion_response(nueva, current_user, db)

    def iniciar_chat_soporte(
        self, db: Session, current_user: User
    ) -> ConversacionResponse:
        admin = chat_repository.get_admin_user(db)
        admin_uid = admin.id if admin else current_user.id

        existing = chat_repository.find_support(db, current_user.id, admin_uid)
        if existing:
            return self._build_conversacion_response(existing, current_user, db)

        nueva = Conversacion(
            tipo="soporte",
            empresa_id=admin_uid,
            artista_id=current_user.id,
        )
        chat_repository.create_conversacion(db, nueva)

        msg_bienvenida = Mensaje(
            id_conversacion=nueva.id_conversacion,
            remitente_id=admin_uid,
            contenido=(
                "👋 ¡Hola! Bienvenido al canal de Soporte Oficial — Jóvenes al Ruedo. "
                "¿En qué te podemos ayudar hoy? (Cambio de clave, dudas, reportes, etc.)"
            ),
        )
        chat_repository.create_mensaje(db, msg_bienvenida)
        return self._build_conversacion_response(nueva, current_user, db)

    def get_mensajes(
        self, db: Session, current_user: User, id_conversacion: int
    ) -> List[Mensaje]:
        conv = chat_repository.get_conversacion(db, id_conversacion)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")

        if not self.user_participates(conv, current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a esta conversación",
            )

        mensajes = chat_repository.list_mensajes(db, id_conversacion)
        chat_repository.mark_as_read(db, id_conversacion, current_user.id)
        return mensajes

    async def enviar_mensaje(
        self, db: Session, current_user: User, id_conversacion: int, body: MensajeCreate
    ) -> Mensaje:
        conv = chat_repository.get_conversacion(db, id_conversacion)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")

        if not self.user_participates(conv, current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a esta conversación",
            )

        nuevo_mensaje = Mensaje(
            id_conversacion=id_conversacion,
            remitente_id=current_user.id,
            contenido=body.contenido,
        )
        chat_repository.create_mensaje(db, nuevo_mensaje)

        try:
            destinatario_id = self._get_destinatario_id(conv, current_user, db)
            from app.services import notification_service
            notification_service.create_notification(
                db,
                id_usr=destinatario_id,
                titulo=f"Nuevo mensaje de {current_user.full_name}",
                mensaje=body.contenido[:150],
                tipo="mensaje",
                enlace=f"/mensajes?convId={id_conversacion}",
            )
        except Exception as e:
            print(f"[Chat] Error al crear notificacion: {e}")

        try:
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
        except Exception as e:
            print(f"[Chat] Error en broadcast WS: {e}")

        return nuevo_mensaje


chat_service = ChatService()
