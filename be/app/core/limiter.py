"""
Módulo: core/limiter.py
Descripción: Instancia compartida del rate limiter (slowapi).
           como los routers (decoradores @limiter.limit(...)) puedan importarla
           sin crear un import circular entre main.py y los routers.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
