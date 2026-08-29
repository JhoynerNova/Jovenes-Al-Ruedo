"""
Módulo: database.py
Descripción: Configuración de la conexión a PostgreSQL con SQLAlchemy 2.0.
¿Para qué? Proveer el engine (motor de conexión), la sesión (SessionLocal) y la
           clase base (Base) que todos los modelos ORM heredan.
¿Impacto? Este módulo es el puente entre Python y PostgreSQL. Sin él, ningún modelo
          puede crear tablas ni hacer consultas a la base de datos.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

db_url = settings.DATABASE_URL
connect_args = {}

if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True if "sqlite" not in db_url else False,
        echo=False,
    )
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except Exception:
    # Fallback a SQLite local si PostgreSQL no está disponible
    db_url = "sqlite:///./app.db"
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """Clase base para todos los modelos ORM del proyecto."""

    pass
