"""
Módulo: seed.py
Descripción: Seeding automático de la cuenta de Administrador principal al arrancar el backend.
Garantiza que la cuenta de administrador exista con credenciales universales en cualquier máquina.
"""

import logging
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import hash_password

logger = logging.getLogger(__name__)

ADMIN_EMAIL = "admin@jovenesalruedo.com"
ADMIN_PASS = "Admin123456*"


def seed_admin_user(db: Session):
    """Crea o actualiza la cuenta de Administrador principal por defecto."""
    try:
        # 1. Buscar administrador por email o por ID existente
        fixed_id = uuid.UUID("a1b2c3d4-9999-9999-9999-999999999999")
        admin_by_email = db.execute(select(User).where(User.email == ADMIN_EMAIL)).scalar_one_or_none()
        admin_by_id = db.execute(select(User).where(User.id == fixed_id)).scalar_one_or_none()

        admin = admin_by_email or admin_by_id

        if not admin:
            logger.info(f"[Seed] Creando cuenta de Administrador principal ({ADMIN_EMAIL})...")
            admin = User(
                id=fixed_id,
                email=ADMIN_EMAIL,
                first_name="ADMINISTRADOR",
                last_name="DEL SISTEMA",
                role="admin",
                hashed_password=hash_password(ADMIN_PASS),
                is_active=True,
                onboarding_completed=True,
            )
            db.add(admin)
            db.commit()
            logger.info(f"[Seed] Cuenta de Administrador principal creada con éxito.")
        else:
            # Asegurar que el email, contraseña y estado estén activos y estandarizados
            admin.hashed_password = hash_password(ADMIN_PASS)
            admin.is_active = True
            admin.role = "admin"
            db.commit()
            logger.info(f"[Seed] Cuenta de Administrador ({admin.email}) verificada y actualizada.")

        # 2. Estandarizar la contraseña de todos los demás administradores existentes
        all_admins = db.execute(select(User).where(User.role == "admin")).scalars().all()
        for a in all_admins:
            a.hashed_password = hash_password(ADMIN_PASS)
            a.is_active = True
        db.commit()
        logger.info(f"[Seed] Todos los administradores ({len(all_admins)}) tienen la clave estandarizada.")

    except Exception as e:
        db.rollback()
        logger.error(f"[Seed] Error al inicializar usuario administrador: {e}")
