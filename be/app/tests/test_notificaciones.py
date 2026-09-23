import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.services import notification_service
from app.utils.security import create_access_token


def test_notifications_flow(client: TestClient, test_user: User, db: Session):
    token = create_access_token(data={"sub": test_user.email, "type": "access"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Crear 2 notificaciones de prueba
    notif1 = notification_service.create_notification(
        db,
        id_usr=test_user.id,
        titulo="Bienvenido a la plataforma",
        mensaje="Hola, este es un mensaje del sistema",
        tipo="sistema",
        enlace="/dashboard"
    )
    notif2 = notification_service.create_notification(
        db,
        id_usr=test_user.id,
        titulo="Nueva postulación",
        mensaje="Tienes una nueva postulación",
        tipo="postulacion",
        enlace="/convocatorias"
    )

    # 2. Consultar unread count
    resp = client.get("/api/v1/notificaciones/unread-count", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["unread_count"] == 2

    # 3. Listar notificaciones
    resp = client.get("/api/v1/notificaciones/", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    titles = [n["titulo"] for n in data]
    assert "Bienvenido a la plataforma" in titles
    assert "Nueva postulación" in titles

    # 4. Marcar 1 como leída
    resp = client.patch(f"/api/v1/notificaciones/{notif2.id}/read", headers=headers)
    assert resp.status_code == 200

    resp = client.get("/api/v1/notificaciones/unread-count", headers=headers)
    assert resp.json()["unread_count"] == 1

    # 5. Marcar todas como leídas
    resp = client.post("/api/v1/notificaciones/read-all", headers=headers)
    assert resp.status_code == 200

    resp = client.get("/api/v1/notificaciones/unread-count", headers=headers)
    assert resp.json()["unread_count"] == 0

    # 6. Eliminar una notificación
    resp = client.delete(f"/api/v1/notificaciones/{notif1.id}", headers=headers)
    assert resp.status_code == 200
