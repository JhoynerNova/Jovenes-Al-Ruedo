
# ────────────────────────────
# Imagen base
# ────────────────────────────

FROM python:3.12-slim

# ────────────────────────────
# Directorio de trabajo
# ────────────────────────────

WORKDIR /app

# ────────────────────────────
# Variables de entorno de Python
# ────────────────────────────

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

# ────────────────────────────
# Instalación de dependencias
# ────────────────────────────

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ────────────────────────────
# Código fuente
# ────────────────────────────

COPY . .

RUN chmod +x /app/entrypoint.sh

# ────────────────────────────
# Puerto y arranque
# ────────────────────────────

EXPOSE 8000

CMD ["/app/entrypoint.sh"]
