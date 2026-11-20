"""
Módulo: models/__init__.py
Descripción: Paquete de modelos ORM — exporta todos los modelos para facilitar imports.
          generadas estarían vacías (uno de los errores más comunes al configurar Alembic).
"""

from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.models.habilidad import Habilidad
from app.models.rel_usr_hab import RelUsrHab
from app.models.portafolio import Portafolio, DetPortafolio
from app.models.conv import Conv, DetConv, Inscripcion
from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.models.rating import Calificacion

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
    "Conversacion",
    "Mensaje",
    "Calificacion",
]