"""
Módulo de pruebas para CORS, perfiles públicos y flujo directo entre usuarios.
Migrado y consolidado desde scripts de depuración a la suite oficial de pytest.
"""

import uuid
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.utils.security import hash_password


def test_cors_options_preflight(client: TestClient):
    """Verifica que las peticiones OPTIONS (CORS preflight) respondan correctamente con los encabezados adecuados."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization,Content-Type",
    }
    response = client.options("/api/v1/chat/conversaciones/directo", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173" or response.headers.get("access-control-allow-origin") == "*"


def test_public_profile_endpoint(client: TestClient, test_user: User):
    """Verifica que el endpoint de perfil público retorne la información esperada del usuario."""
    response = client.get(f"/api/v1/users/profile/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert data["user"]["full_name"] == test_user.full_name
    assert data["user"]["role"] == test_user.role


def test_direct_conversation_and_messaging_flow(db: Session, test_user: User):
    """Verifica la creación de una conversación directa entre empresa y artista y el registro de mensajes."""
    company = User(
        id=uuid.uuid4(),
        email=f"empresa_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password=hash_password("Empresa123"),
        first_name="Fundación",
        last_name="Cultural Test",
        role="empresa",
        birth_date=date(1995, 1, 1),
        is_active=True,
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    conv = Conversacion(
        tipo="directo",
        empresa_id=company.id,
        artista_id=test_user.id,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    assert conv.id_conversacion is not None
    assert conv.tipo == "directo"

    msg = Mensaje(
        id_conversacion=conv.id_conversacion,
        remitente_id=company.id,
        contenido="Mensaje de prueba consolidado en pytest",
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    assert msg.id_msg is not None
    assert msg.contenido == "Mensaje de prueba consolidado en pytest"
    assert msg.remitente_id == company.id
