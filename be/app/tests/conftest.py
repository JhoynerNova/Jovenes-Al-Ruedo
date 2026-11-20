"""
Módulo: tests/conftest.py
Descripción: Fixtures compartidos para todos los tests del backend.
"""

import uuid
from collections.abc import Generator
from datetime import datetime, timedelta, timezone, date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database import Base
from app.dependencies import get_db
from app.main import app
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.utils.security import create_access_token, hash_password

# ────────────────────────────
# 🗄️ Configuración de BD de testing
# ────────────────────────────

from sqlalchemy.pool import StaticPool

TEST_DATABASE_URL = "sqlite:///./test_pytest.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)

# ────────────────────────────
# 📦 Fixtures de base de datos
# ────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def setup_database() -> Generator[None, None, None]:
    """Crea y destruye las tablas de la BD al inicio y fin de la sesión de tests.
    """
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture()
def db() -> Generator[Session, None, None]:
    """Provee una sesión de BD aislada para cada test con rollback automático.

              NO afectan a otros tests (isolation).
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def end_savepoint(session: Session, transaction_state: object) -> None:
        """Recrea el savepoint después de cada commit dentro del test."""
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

# ────────────────────────────
# 🌐 Fixture del cliente HTTP
# ────────────────────────────

@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:
    """Provee un cliente HTTP de testing que usa la sesión de BD aislada.
    """

    def override_get_db() -> Generator[Session, None, None]:
        """Reemplaza la dependencia get_db para usar la sesión de testing."""
        yield db

    app.dependency_overrides[get_db] = override_get_db
    app.state.limiter.enabled = False
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    app.state.limiter.enabled = True

# ────────────────────────────
# 👤 Fixtures de datos de prueba
# ────────────────────────────

TEST_USER_EMAIL = "test@nn-company.com"
TEST_USER_FULL_NAME = "TEST USER"
TEST_USER_PASSWORD = "TestPass123"
TEST_USER_BIRTH_DATE = date(2003, 1, 1)
TEST_USER_ARTISTIC_AREA = "Música"

@pytest.fixture()
def test_user(db: Session) -> User:
    """Crea un usuario de prueba en la BD y lo retorna.
    """
    user = User(
        email=TEST_USER_EMAIL,
        first_name="TEST",
        last_name="USER",
        role="artista",
        birth_date=TEST_USER_BIRTH_DATE,
        artistic_area=TEST_USER_ARTISTIC_AREA,
        hashed_password=hash_password(TEST_USER_PASSWORD),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture()
def auth_headers(test_user: User) -> dict[str, str]:
    """Genera headers de autenticación con un access token válido.
    """
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture()
def expired_reset_token(db: Session, test_user: User) -> str:
    """Crea un token de reset de contraseña ya expirado.
    """
    token = str(uuid.uuid4())
    token_record = PasswordResetToken(
        user_id=test_user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
    )
    db.add(token_record)
    db.commit()
    return token

@pytest.fixture()
def used_reset_token(db: Session, test_user: User) -> str:
    """Crea un token de reset de contraseña ya utilizado.
    """
    token = str(uuid.uuid4())
    token_record = PasswordResetToken(
        user_id=test_user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        used=True,
    )
    db.add(token_record)
    db.commit()
    return token

@pytest.fixture()
def valid_reset_token(db: Session, test_user: User) -> str:
    """Crea un token de reset de contraseña válido (no expirado, no usado).
    """
    token = str(uuid.uuid4())
    token_record = PasswordResetToken(
        user_id=test_user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(token_record)
    db.commit()
    return token
