# ¿Qué? Imagen Docker para el backend FastAPI del sistema de autenticación.
# ¿Para qué? Empaquetar la aplicación Python con TODAS sus dependencias en un contenedor
#            reproducible que funcione igual en cualquier máquina o servidor.
# ¿Impacto? Sin este archivo, el backend solo corre en máquinas donde alguien instaló
#           Python 3.12, el .venv y las dependencias manualmente. Con Docker, basta
#           tener Docker instalado — el entorno viene incluido en la imagen.

# ────────────────────────────
# Imagen base
# ────────────────────────────

# ¿Qué? Imagen oficial de Python 3.12 en su variante "slim" (sin herramientas de compilación).
# ¿Para qué? Partir de un entorno Python limpio y reducir el tamaño de la imagen final.
# ¿Impacto? python:3.12-slim (~130MB) vs python:3.12 (~1GB). Menor imagen =
#           menor superficie de ataque y tiempos de descarga/deploy más rápidos.
FROM python:3.12-slim

# ────────────────────────────
# Directorio de trabajo
# ────────────────────────────

# ¿Qué? Define /app como el directorio de trabajo dentro del contenedor.
# ¿Para qué? Todos los comandos COPY, RUN y CMD siguientes se ejecutan relativos a /app.
# ¿Impacto? Sin WORKDIR, los archivos se copiarían en / (raíz del sistema), creando
#           desorden y posibles colisiones con archivos del sistema operativo.
WORKDIR /app

# ────────────────────────────
# Variables de entorno de Python
# ────────────────────────────

# ¿Qué? Desactiva la generación de archivos .pyc (bytecode compilado de Python).
# ¿Para qué? Evitar archivos __pycache__ innecesarios dentro del contenedor.
# ¿Impacto? Pequeña optimización — sin ella la imagen crece con bytecode en cada módulo.
ENV PYTHONDONTWRITEBYTECODE=1

# ¿Qué? Desactiva el buffer del output estándar y de errores de Python.
# ¿Para qué? Ver los logs de la aplicación en tiempo real con `docker compose logs`.
# ¿Impacto? Sin PYTHONUNBUFFERED=1, los print() y logs pueden aparecer con retraso
#           o no aparecer si el contenedor se detiene antes de que el buffer se vacíe.
#           Esto dificulta el debugging enormemente.
ENV PYTHONUNBUFFERED=1

# ────────────────────────────
# Instalación de dependencias
# ────────────────────────────

# ¿Qué? Copia SOLO el archivo de dependencias (antes del código fuente).
# ¿Para qué? Aprovechar el sistema de caché de capas de Docker.
# ¿Impacto? Si el código fuente cambia pero requirements.txt NO cambia, Docker
#           reutiliza la capa de `pip install` del caché. El rebuild es MUCHO más
#           rápido porque no reinstala ~40 paquetes en cada cambio de código.
COPY requirements.txt .

# ¿Qué? Actualiza pip e instala todas las dependencias del proyecto.
# ¿Para qué? Tener FastAPI, SQLAlchemy, passlib, python-jose y el resto disponibles.
# ¿Impacto? --no-cache-dir impide que pip guarde el caché de descarga dentro de
#           la imagen, reduciendo su tamaño. El upgrade de pip evita advertencias.
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ────────────────────────────
# Código fuente
# ────────────────────────────

# ¿Qué? Copia todo el código fuente del backend al directorio de trabajo.
# ¿Para qué? Tener la app/ (FastAPI), alembic/ (migraciones) y alembic.ini disponibles.
# ¿Impacto? Se hace DESPUÉS de instalar dependencias para maximizar el uso del caché.
#           Si solo cambias código (no requirements.txt), solo se re-ejecuta este COPY,
#           no el pip install — rebuid significativamente más rápido.
COPY . .

# ¿Qué? Da permisos de ejecución al script de entrypoint.
# ¿Para qué? El script entrypoint.sh necesita poder ejecutarse como un programa.
# ¿Impacto? Sin este chmod, el contenedor falla al arrancar con "Permission denied".
RUN chmod +x /app/entrypoint.sh

# ────────────────────────────
# Puerto y arranque
# ────────────────────────────

# ¿Qué? Declara que el contenedor escucha en el puerto 8000.
# ¿Para qué? Documentar el puerto de la aplicación (convención Docker).
# ¿Impacto? EXPOSE es solo documental — no publica el puerto automáticamente.
#           El acceso real desde fuera se configura con `ports:` en docker-compose.yml.
EXPOSE 8000

# ¿Qué? Comando que se ejecuta cuando el contenedor arranca.
# ¿Para qué? Delegar el arranque al entrypoint.sh para ejecutar pasos de inicialización
#            (esperar la BD, aplicar migraciones) ANTES de iniciar uvicorn.
# ¿Impacto? Si usáramos CMD con uvicorn directamente, el servidor fallaría porque:
#           1) La BD podría no estar lista aún.
#           2) Las tablas no existirían (migraciones no aplicadas).
#           El entrypoint.sh resuelve ambos problemas en orden correcto.
CMD ["/app/entrypoint.sh"]
