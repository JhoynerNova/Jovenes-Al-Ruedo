# ----------------------------------------
# Imagen base
# ----------------------------------------
FROM python:3.12-slim

# Crear usuario no-root por seguridad
RUN groupadd -r appuser && useradd -r -g appuser appuser

# ----------------------------------------
# Directorio de trabajo
# ----------------------------------------
WORKDIR /app

# ----------------------------------------
# Variables de entorno de Python
# ----------------------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ----------------------------------------
# Instalación de dependencias
# ----------------------------------------
COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ----------------------------------------
# Código fuente (copia explícita para no filtrar .env ni archivos sensibles)
# ----------------------------------------
COPY --chown=appuser:appuser app/ ./app/
COPY --chown=appuser:appuser alembic/ ./alembic/
COPY --chown=appuser:appuser alembic.ini ./
COPY --chown=appuser:appuser entrypoint.sh ./

RUN chmod +x /app/entrypoint.sh

# Cambiar al usuario sin privilegios de administrador
USER appuser

# ----------------------------------------
# Puerto y arranque
# ----------------------------------------
EXPOSE 8000

CMD ["/app/entrypoint.sh"]