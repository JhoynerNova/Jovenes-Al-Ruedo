#!/bin/sh

set -e

echo "======================================================"
echo "  Jóvenes al Ruedo — Backend iniciando en Docker"
echo "======================================================"

# ────────────────────────────
# Paso 1: Esperar a PostgreSQL
# ────────────────────────────

# Usamos Python + psycopg2 (ya instalado en el contenedor) en vez de herramientas
# externas como wait-for-it.sh o netcat, que habría que instalar por separado.
echo "⏳ Esperando a que PostgreSQL esté listo..."

until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ.get('DATABASE_URL', ''))
    sys.exit(0)
except Exception as e:
    print(f'   → BD no disponible todavía: {e}')
    sys.exit(1)
" 2>&1; do
  echo "   → Reintentando en 2 segundos..."
  sleep 2
done

echo "✅ PostgreSQL listo."
echo ""

# ────────────────────────────
# Paso 2: Aplicar migraciones
# ────────────────────────────

echo "⚙️  Aplicando migraciones con Alembic..."
alembic upgrade head
echo "✅ Migraciones aplicadas correctamente."
echo ""

# ────────────────────────────
# Paso 3: Iniciar el servidor
# ────────────────────────────

# `exec` reemplaza el proceso shell por uvicorn, de modo que uvicorn queda
# como PID 1 y recibe directamente las señales de Docker (SIGTERM en `docker stop`).
# Sin exec, las señales llegan al shell y uvicorn no tiene chance de apagarse limpiamente.
echo "🚀 Iniciando servidor FastAPI con Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
