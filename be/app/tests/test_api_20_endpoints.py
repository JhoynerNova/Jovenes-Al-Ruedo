"""
Modulo: tests/test_api_20_endpoints.py
Descripcion: Suite de pruebas automatizadas de 20+ Endpoints API con Verificacion de Consultas SQL/ORM (QA Clase 6).
Verifica la integridad referencial, el estado de la base de datos y la respuesta HTTP en llamadas exitosas y fallidas.
"""

import pytest
import uuid
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.models.user import User
from app.models.conv import Conv, Inscripcion
from app.models.portafolio import Portafolio, DetPortafolio
from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.models.notificacion import Notificacion
from app.utils.security import create_access_token, hash_password


@pytest.fixture()
def admin_headers(db: Session) -> dict:
    """Fixture para token de administrador."""
    admin_user = db.execute(select(User).where(User.role == "admin")).scalar_one_or_none()
    if not admin_user:
        admin_user = User(
            email="admin_qa_system@example.com",
            first_name="Admin",
            last_name="System",
            role="admin",
            is_active=True,
            hashed_password=hash_password("Password123!")
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    token = create_access_token(data={"sub": admin_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def artist_headers(db: Session) -> dict:
    """Fixture para token de artista activo."""
    artist = User(
        email=f"artist_{uuid.uuid4().hex[:6]}@example.com",
        first_name="Artista",
        last_name="QA",
        role="artista",
        is_active=True,
        hashed_password=hash_password("Password123!")
    )
    db.add(artist)
    db.commit()
    db.refresh(artist)
    token = create_access_token(data={"sub": artist.email})
    return {"Authorization": f"Bearer {token}", "artist": artist}


@pytest.fixture()
def company_headers(db: Session) -> dict:
    """Fixture para token de empresa activa."""
    company = User(
        email=f"company_{uuid.uuid4().hex[:6]}@example.com",
        first_name="Empresa",
        last_name="QA",
        role="empresa",
        is_active=True,
        hashed_password=hash_password("Password123!")
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    token = create_access_token(data={"sub": company.email})
    return {"Authorization": f"Bearer {token}", "company": company}


# -----------------------------------------------------------------------------
# 1. POST /api/v1/auth/register (Artista)
# -----------------------------------------------------------------------------
def test_01_register_artist_success(client: TestClient, db: Session):
    email = f"artist_qa_{uuid.uuid4().hex[:6]}@example.com"
    count_before = db.execute(select(func.count(User.id)).where(User.email == email)).scalar()
    assert count_before == 0

    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "first_name": "Artista",
        "last_name": "QA",
        "role": "artista",
        "birth_date": "2002-05-15",
        "artistic_area": "Música"
    })
    assert res.status_code == 201

    user_db = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    assert user_db is not None
    assert user_db.role == "artista"


# -----------------------------------------------------------------------------
# 2. POST /api/v1/auth/register (Empresa)
# -----------------------------------------------------------------------------
def test_02_register_company_success(client: TestClient, db: Session):
    email = f"company_qa_{uuid.uuid4().hex[:6]}@example.com"
    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "first_name": "Empresa",
        "last_name": "QA",
        "role": "empresa",
        "sector": "Cultura y Artes"
    })
    assert res.status_code == 201

    comp_db = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    assert comp_db is not None
    assert comp_db.role == "empresa"


# -----------------------------------------------------------------------------
# 3. POST /api/v1/auth/login (Exitoso)
# -----------------------------------------------------------------------------
def test_03_login_success(client: TestClient, artist_headers: dict):
    artist = artist_headers["artist"]
    res = client.post("/api/v1/auth/login", json={
        "email": artist.email,
        "password": "Password123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


# -----------------------------------------------------------------------------
# 4. POST /api/v1/auth/login (Fallido - Contraseña errónea)
# -----------------------------------------------------------------------------
def test_04_login_failure_wrong_password(client: TestClient, artist_headers: dict):
    artist = artist_headers["artist"]
    res = client.post("/api/v1/auth/login", json={
        "email": artist.email,
        "password": "WrongPassword999"
    })
    assert res.status_code in [400, 401]


# -----------------------------------------------------------------------------
# 5. GET /api/v1/users/me/ (Autenticado)
# -----------------------------------------------------------------------------
def test_05_get_me_authenticated(client: TestClient, artist_headers: dict):
    headers = {"Authorization": artist_headers["Authorization"]}
    res = client.get("/api/v1/users/me/", headers=headers)
    assert res.status_code == 200
    assert "email" in res.json()


# -----------------------------------------------------------------------------
# 6. GET /api/v1/users/me/ (Sin token - 401 Unauthorized)
# -----------------------------------------------------------------------------
def test_06_get_me_unauthorized(client: TestClient):
    res = client.get("/api/v1/users/me/")
    assert res.status_code == 401


# -----------------------------------------------------------------------------
# 7. PATCH /api/v1/users/me/ (Actualizar Perfil & Customization)
# -----------------------------------------------------------------------------
def test_07_patch_profile_customization(client: TestClient, artist_headers: dict, db: Session):
    headers = {"Authorization": artist_headers["Authorization"]}
    artist = artist_headers["artist"]
    payload = {
        "bio": "Bio actualizada QA",
        "color_palette": "cyberpunk",
        "customization": {
            "avatar_frame": "holo-glow",
            "headline": "🎭 Creador QA"
        }
    }
    res = client.patch("/api/v1/users/me/", json=payload, headers=headers)
    assert res.status_code == 200

    db.refresh(artist)
    assert artist.bio == "Bio actualizada QA"
    assert artist.color_palette == "cyberpunk"


# -----------------------------------------------------------------------------
# 8. GET /api/v1/users/ (Listar Usuarios por Admin)
# -----------------------------------------------------------------------------
def test_08_get_users_list(client: TestClient, admin_headers: dict):
    res = client.get("/api/v1/users/", headers=admin_headers)
    assert res.status_code == 200
    assert "items" in res.json()


# -----------------------------------------------------------------------------
# 9. GET /api/v1/users/profile/{user_id} (Perfil Público)
# -----------------------------------------------------------------------------
def test_09_get_public_profile(client: TestClient, artist_headers: dict):
    artist = artist_headers["artist"]
    res = client.get(f"/api/v1/users/profile/{artist.id}")
    assert res.status_code == 200
    assert res.json()["user"]["id"] == str(artist.id)


# -----------------------------------------------------------------------------
# 10. GET /api/v1/users/explore/artists/ (Explorar Artistas)
# -----------------------------------------------------------------------------
def test_10_explore_artists(client: TestClient):
    res = client.get("/api/v1/users/explore/artists/")
    assert res.status_code == 200
    assert "items" in res.json()


# -----------------------------------------------------------------------------
# 11. GET /api/v1/users/explore/companies/ (Explorar Empresas)
# -----------------------------------------------------------------------------
def test_11_explore_companies(client: TestClient):
    res = client.get("/api/v1/users/explore/companies/")
    assert res.status_code == 200
    assert "items" in res.json()


# -----------------------------------------------------------------------------
# 12. GET /api/v1/users/admin/stats/ (Estadísticas Admin)
# -----------------------------------------------------------------------------
def test_12_get_admin_stats(client: TestClient, admin_headers: dict):
    res = client.get("/api/v1/users/admin/stats/", headers=admin_headers)
    assert res.status_code == 200
    assert "total_users" in res.json()


# -----------------------------------------------------------------------------
# 13. POST /api/v1/convocatorias/ (Crear Convocatoria por Empresa)
# -----------------------------------------------------------------------------
def test_13_create_convocatoria_success(client: TestClient, db: Session, company_headers: dict):
    headers = {"Authorization": company_headers["Authorization"]}
    res = client.post("/api/v1/convocatorias/", json={
        "nombre": "Oferta Musical QA 2026",
        "descripcion": "Se busca guitarrista para ensamble",
        "id_area": 1,
        "monto": 2500000,
        "visibilidad": "Publica"
    }, headers=headers)
    assert res.status_code in [200, 201]


# -----------------------------------------------------------------------------
# 14. GET /api/v1/convocatorias/ (Listar Convocatorias)
# -----------------------------------------------------------------------------
def test_14_list_convocatorias(client: TestClient):
    res = client.get("/api/v1/convocatorias/")
    assert res.status_code == 200


# -----------------------------------------------------------------------------
# 15. POST /api/v1/portafolio/ (Crear Portafolio Artista)
# -----------------------------------------------------------------------------
def test_15_create_portafolio_success(client: TestClient, db: Session, artist_headers: dict):
    headers = {"Authorization": artist_headers["Authorization"]}
    res = client.post("/api/v1/portafolio/", json={
        "nombre": "Portafolio Ilustración QA",
        "descripcion": "Muestra de artes digitales",
        "visibilidad": "Publico"
    }, headers=headers)
    assert res.status_code in [200, 201]


# -----------------------------------------------------------------------------
# 16. GET /api/v1/portafolio/ (Obtener Mis Portafolios)
# -----------------------------------------------------------------------------
def test_16_get_my_portafolios(client: TestClient, artist_headers: dict):
    headers = {"Authorization": artist_headers["Authorization"]}
    res = client.get("/api/v1/portafolio/", headers=headers)
    assert res.status_code == 200


# -----------------------------------------------------------------------------
# 17. POST /api/v1/chat/conversaciones/directo (Iniciar Conversación Directa)
# -----------------------------------------------------------------------------
def test_17_create_chat_direct_conversation(client: TestClient, db: Session, company_headers: dict, artist_headers: dict):
    company_h = {"Authorization": company_headers["Authorization"]}
    artist = artist_headers["artist"]

    res = client.post("/api/v1/chat/conversaciones/directo", json={
        "artista_id": str(artist.id)
    }, headers=company_h)
    assert res.status_code in [200, 201]


# -----------------------------------------------------------------------------
# 18. GET /api/v1/chat/conversaciones (Listar Conversaciones)
# -----------------------------------------------------------------------------
def test_18_list_chat_conversations(client: TestClient, artist_headers: dict):
    headers = {"Authorization": artist_headers["Authorization"]}
    res = client.get("/api/v1/chat/conversaciones", headers=headers)
    assert res.status_code == 200


# -----------------------------------------------------------------------------
# 19. GET /api/v1/notificaciones/ (Listar Notificaciones)
# -----------------------------------------------------------------------------
def test_19_list_notifications(client: TestClient, artist_headers: dict):
    headers = {"Authorization": artist_headers["Authorization"]}
    res = client.get("/api/v1/notificaciones/", headers=headers)
    assert res.status_code == 200


# -----------------------------------------------------------------------------
# 20. DELETE /api/v1/users/me/ (Fallo de Eliminación con Contraseña Errónea)
# -----------------------------------------------------------------------------
def test_20_delete_user_account_unauthorized_password(client: TestClient, artist_headers: dict):
    headers = {"Authorization": artist_headers["Authorization"]}
    res = client.request("DELETE", "/api/v1/users/me/", json={"password": "WrongPassword123"}, headers=headers)
    assert res.status_code in [400, 401]
