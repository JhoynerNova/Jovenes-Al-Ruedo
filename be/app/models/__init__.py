"""
Módulo: models/__init__.py
Descripción: Paquete de modelos ORM — exporta todos los modelos para facilitar imports.
¿Para qué? Permitir importar todos los modelos desde un solo lugar (from app.models import User)
           y asegurar que Alembic los detecte al generar migraciones.
¿Impacto? Sin este archivo, Alembic no detectaría los modelos automáticamente y las migraciones
          generadas estarían vacías (uno de los errores más comunes al configurar Alembic).
"""

from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.models.habilidad import Habilidad
from app.models.rel_usr_hab import RelUsrHab
from app.models.portafolio import Portafolio, DetPortafolio
from app.models.conv import Conv, DetConv, Inscripcion

__all__ = [
    "User",
    "PasswordResetToken",
    "Habilidad",
    "RelUsrHab",
    "Portafolio",
    "DetPortafolio",
    "Conv",
    "DetConv",
    "Inscripcion",
]