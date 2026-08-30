"""
Modulo: tests/test_database_transactions.py
Descripcion: Pruebas de Transacciones SQL, Integridad ACID, COMMIT y ROLLBACK (QA Clase 6).
Verifica que las transacciones fallen limpiamente ante violaciones de restricciones (CHECK, UNIQUE, FK)
y que los cambios no persistan ante un ROLLBACK explícito o excepción.
"""

import pytest
import uuid
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, StatementError

from app.models.user import User
from app.models.conv import Conv
from app.models.portafolio import Portafolio, DetPortafolio
from app.utils.security import hash_password


def test_acid_commit_success(db: Session):
    """1. Transacción Exitosa: Verificación de COMMIT y persistencia de datos."""
    email = f"acid_commit_{uuid.uuid4().hex[:6]}@example.com"
    user = User(
        email=email,
        first_name="ACID",
        last_name="CommitTest",
        role="artista",
        hashed_password=hash_password("Pass123!")
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Consulta de verificación
    fetched = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    assert fetched is not None
    assert fetched.id == user.id


def test_acid_rollback_duplicate_email_unique_constraint(db: Session):
    """2. Transacción Fallida: Verificación de ROLLBACK ante violación de Restricción UNIQUE (Email duplicado)."""
    email = f"unique_test_{uuid.uuid4().hex[:6]}@example.com"
    u1 = User(email=email, first_name="U1", last_name="QA", role="artista", hashed_password="hash")
    db.add(u1)
    db.commit()

    # Intentar insertar un segundo usuario con el mismo email
    u2 = User(email=email, first_name="U2", last_name="QA", role="empresa", hashed_password="hash")
    db.add(u2)

    with pytest.raises(IntegrityError):
        db.commit()

    db.rollback()

    # Verificar que u2 no persistió y la BD sigue en estado consistente
    users_count = db.execute(select(func.count(User.id)).where(User.email == email)).scalar()
    assert users_count == 1


def test_acid_rollback_invalid_enum_check_constraint(db: Session):
    """3. Transacción Fallida: Verificación de ROLLBACK ante estado no permitido en DetPortafolio."""
    artist = User(
        email=f"art_check_{uuid.uuid4().hex[:6]}@example.com",
        first_name="Art",
        last_name="Check",
        role="artista",
        hashed_password="hash"
    )
    db.add(artist)
    db.commit()

    port = Portafolio(nombre="Portafolio Check Test", id_usr=artist.id)
    db.add(port)
    db.commit()

    # Estado inválido 'Z' (Solo se permite 'G' o 'P' en BD/Schema)
    item = DetPortafolio(
        id_port=port.id_port,
        archivo="test.png",
        estado="Z"
    )
    db.add(item)

    try:
        db.commit()
    except Exception:
        db.rollback()

    # Consulta de verificación: No debe existir ningún detalle con estado 'Z'
    invalid_count = db.execute(select(func.count(DetPortafolio.id_det_p)).where(DetPortafolio.estado == "Z")).scalar()
    assert invalid_count == 0


def test_acid_atomicity_multiple_inserts_rollback(db: Session):
    """4. Transacción Atómica: Inserción múltiple que falla a la mitad efectúa un ROLLBACK completo."""
    initial_user_count = db.execute(select(func.count(User.id))).scalar()

    u1 = User(email=f"multi_1_{uuid.uuid4().hex[:6]}@example.com", first_name="A", last_name="1", role="artista", hashed_password="h")
    db.add(u1)
    
    # Usuario inválido con email nulo (VIOLACIÓN DE NOT NULL)
    u_invalid = User(email=None, first_name="Invalid", last_name="NullEmail", role="artista", hashed_password="h")
    db.add(u_invalid)

    with pytest.raises(IntegrityError):
        db.commit()

    db.rollback()

    final_user_count = db.execute(select(func.count(User.id))).scalar()
    assert final_user_count == initial_user_count
