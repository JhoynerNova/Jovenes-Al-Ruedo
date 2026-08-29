"""
Módulo: core/limiter.py
Descripción: Instancia compartida del rate limiter (slowapi).
¿Para qué? Vive en su propio módulo para que tanto main.py (registro del middleware)
           como los routers (decoradores @limiter.limit(...)) puedan importarla
           sin crear un import circular entre main.py y los routers.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# ¿Qué? Limiter identificado por IP de origen del request.
# ¿Para qué? Bloquear fuerza bruta contra login/registro/reset de contraseña.
# ¿Impacto? Sin esto, un atacante puede probar miles de contraseñas por minuto sin restricción.
limiter = Limiter(key_func=get_remote_address)
