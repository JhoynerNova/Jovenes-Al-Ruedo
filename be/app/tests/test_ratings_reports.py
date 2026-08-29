import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import create_access_token, hash_password


@pytest.fixture
def empresa_user(db: Session) -> User:
    user = User(
        email="empresa_test@company.com",
        first_name="Empresa",
        last_name="Test",
        role="empresa",
        sector="Música",
        hashed_password=hash_password("EmpresaPass123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def empresa_headers(empresa_user: User) -> dict:
    token = create_access_token(data={"sub": empresa_user.email, "type": "access"})
    return {"Authorization": f"Bearer {token}"}


def test_create_rating_and_get_summary(client: TestClient, empresa_headers: dict, test_user: User):
    # 1. Crear calificación
    response = client.post(
        "/api/v1/ratings/",
        json={
            "artista_id": str(test_user.id),
            "puntuacion": 5,
            "comentario": "Excelente talento musical!",
        },
        headers=empresa_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["puntuacion"] == 5
    assert data["comentario"] == "Excelente talento musical!"

    # 2. Obtener resumen de calificaciones del artista
    summary_res = client.get(f"/api/v1/ratings/artist/{test_user.id}")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_calificaciones"] == 1
    assert summary["promedio"] == 5.0
    assert len(summary["calificaciones"]) == 1


def test_export_convocatorias_csv(client: TestClient, empresa_headers: dict):
    response = client.get("/api/v1/reports/convocatorias/csv", headers=empresa_headers)
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "ID Convocatoria" in response.text


def test_get_stats_summary(client: TestClient, empresa_headers: dict):
    response = client.get("/api/v1/reports/stats/summary", headers=empresa_headers)
    assert response.status_code == 200
    stats = response.json()
    assert "artistas_registrados" in stats
    assert "convocatorias_activas" in stats
