#!/bin/sh

# ¿Qué? Script de entrypoint que orquesta el arranque correcto del backend.
# ¿Para qué? Garantizar que los pasos se ejecuten en el orden correcto:
#            1) Esperar a que PostgreSQL esté listo.
#            2) Aplicar migraciones pendientes con Alembic.
#            3) Iniciar el servidor Uvicorn.
# ¿Impacto? Sin este script, uvicorn arrancaría de inmediato y fallaría porque:
#           - La BD todavía estaría inicializándose ("Connection refused").
#           - Las tablas no existirían aún (migraciones no aplicadas).
#           Este script resuelve el problema de la condición de carrera entre
#           el contenedor del backend y el del PostgreSQL.

# ¿Qué? Activa el modo "exit on error" del shell.
# ¿Para qué? Si cualquier comando del script falla, el script se detiene inmediatamente.
# ¿Impacto? Sin `set -e`, un error en alembic upgrade head podría pasar desapercibido
#           y uvicorn arrancaría con una BD en mal estado.
set -e

echo "======================================================"
echo "  Jóvenes al Ruedo — Backend iniciando en Docker"
echo "======================================================"

# ────────────────────────────
# Paso 1: Esperar a PostgreSQL
# ────────────────────────────

# ¿Qué? Bucle que reintenta la conexión a la BD cada 2 segundos hasta que responda.
# ¿Para qué? PostgreSQL tarda varios segundos en inicializar su clúster de datos.
#            El backend debe esperarlo antes de intentar cualquier operación.
# ¿Impacto? Sin esta espera, el primer intento de conexión falla con
#           "could not connect to server: Connection refused" y el contenedor
#           se detiene con error, obligando a reiniciarlo manualmente.
#
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

# ¿Qué? Ejecuta todas las migraciones de Alembic que estén pendientes.
# ¿Para qué? Asegurar que el esquema de la BD (tablas, columnas, índices) esté
#            sincronizado con el estado actual de los modelos SQLAlchemy.
# ¿Impacto? Sin este paso:
#           - En el primer arranque: las tablas `users` y `password_reset_tokens`
#             no existen → cualquier endpoint falla con "table does not exist".
#           - Luego de un cambio de modelo: las columnas nuevas no existen en la BD
#             → errores de columna en runtime.
#           `upgrade head` aplica TODAS las migraciones hasta la más reciente,
#           sin importar en qué versión esté la BD actualmente.
echo "⚙️  Aplicando migraciones con Alembic..."
alembic upgrade head
echo "✅ Migraciones aplicadas correctamente."
echo ""

# ────────────────────────────
# Paso 3: Iniciar el servidor
# ────────────────────────────

# ¿Qué? Inicia el servidor ASGI Uvicorn con la aplicación FastAPI.
# ¿Para qué? Procesar las peticiones HTTP entrantes (registro, login, etc.).
# ¿Impacto? Cada flag importa:
#   --host 0.0.0.0  → Acepta conexiones desde FUERA del contenedor (no solo localhost).
#                     Sin esto, el puerto 8000 no sería accesible desde el browser.
#   --port 8000     → Puerto donde escucha (debe coincidir con EXPOSE y ports: en compose).
#
# `exec` reemplaza el proceso shell por uvicorn, de modo que uvicorn queda
# como PID 1 y recibe directamente las señales de Docker (SIGTERM en `docker stop`).
# Sin exec, las señales llegan al shell y uvicorn no tiene chance de apagarse limpiamente.
echo "🚀 Iniciando servidor FastAPI con Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
