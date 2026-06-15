import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import uuid

from app.models.user import User
from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.utils.security import create_access_token


@pytest.fixture
def test_users(db: Session):
    # Crear artista y empresa de prueba
    artista_id = uuid.uuid4()
    empresa_id = uuid.uuid4()
    
    artista = User(
        id=artista_id,
        email=f"artista_{artista_id.hex[:6]}@test.com",
        full_name="Artista de Prueba",
        role="artista",
        hashed_password="hashedpassword123",
        is_active=True
    )
    
    empresa = User(
        id=empresa_id,
        email=f"empresa_{empresa_id.hex[:6]}@test.com",
        full_name="Empresa de Prueba",
        role="empresa",
        sector="Música",
        hashed_password="hashedpassword123",
        is_active=True
    )
    
    db.add(artista)
    db.add(empresa)
    db.commit()
    return {"artista": artista, "empresa": empresa}


def test_crear_conversacion_directa(client: TestClient, db: Session, test_users):
    empresa = test_users["empresa"]
    artista = test_users["artista"]
    
    token = create_access_token(data={"sub": empresa.email, "type": "access"})
    headers = {"Authorization": f"Bearer {token}"}
    
    # Crear conversación directa
    response = client.post(
        "/api/v1/chat/conversaciones/directo",
        json={"artista_id": str(artista.id)},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tipo"] == "directo"
    assert data["otro_usuario_nombre"] == "Artista de Prueba"


def test_enviar_y_recibir_mensaje(client: TestClient, db: Session, test_users):
    empresa = test_users["empresa"]
    artista = test_users["artista"]
    
    # Crear la conversación en DB directamente
    conv = Conversacion(
        tipo="directo",
        empresa_id=empresa.id,
        artista_id=artista.id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    
    token = create_access_token(data={"sub": empresa.email, "type": "access"})
    headers = {"Authorization": f"Bearer {token}"}
    
    # Enviar mensaje
    response = client.post(
        f"/api/v1/chat/conversacion/{conv.id_conversacion}/mensajes",
        json={"contenido": "Hola Artista!"},
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["contenido"] == "Hola Artista!"
    
    # Obtener mensajes
    response = client.get(
        f"/api/v1/chat/conversacion/{conv.id_conversacion}/mensajes",
        headers=headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["contenido"] == "Hola Artista!"


def test_websocket_chat(client: TestClient, db: Session, test_users):
    empresa = test_users["empresa"]
    artista = test_users["artista"]
    
    # Crear la conversación
    conv = Conversacion(
        tipo="directo",
        empresa_id=empresa.id,
        artista_id=artista.id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    
    # Conectar al WebSocket
    with client.websocket_connect(f"/api/v1/chat/ws/{conv.id_conversacion}") as websocket:
        # Enviar mensaje por WebSocket
        websocket.send_json({
            "remitente_id": str(empresa.id),
            "contenido": "Mensaje en tiempo real!"
        })
        
        # Recibir respuesta del broadcast
        broadcast_data = websocket.receive_json()
        assert broadcast_data["contenido"] == "Mensaje en tiempo real!"
        assert broadcast_data["id_conversacion"] == conv.id_conversacion
        assert broadcast_data["remitente_id"] == str(empresa.id)


def test_global_exception_handler(client: TestClient):
    response = client.get("/api/v1/chat/conversacion/999999/mensajes", headers={"Authorization": "Bearer invalido"})
    assert response.status_code == 401
