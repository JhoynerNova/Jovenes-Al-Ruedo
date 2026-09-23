import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import create_access_token


def test_analytics_and_badges(client: TestClient, test_user: User, db: Session):
    token = create_access_token(data={"sub": test_user.email, "type": "access"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Obteber estadísticas propias
    resp = client.get("/api/v1/analytics/my-stats", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "vistas_perfil" in data
    assert "badges" in data
    assert len(data["badges"]) >= 1
    assert data["badges"][0]["id"] == "sena_verified"

    # 2. Obteber insignias públicas
    resp_pub = client.get(f"/api/v1/analytics/user/{test_user.id}/badges")
    assert resp_pub.status_code == 200
    pub_badges = resp_pub.json()
    assert len(pub_badges) >= 1
