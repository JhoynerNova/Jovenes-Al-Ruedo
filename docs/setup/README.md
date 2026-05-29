# Guía de Instalación y Configuración del Proyecto

Esta guía describe los pasos necesarios para levantar y configurar el entorno completo de desarrollo de **Jóvenes al Ruedo** (Backend, Frontend, Móvil y Base de Datos).

---

## 1. Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu sistema:
- **Python 3.12+**
- **Node.js 18+** y gestor de paquetes **pnpm** o **npm**
- **Docker** y **Docker Compose**
- **Git**

---

## 2. Base de Datos (PostgreSQL)

El entorno utiliza PostgreSQL a través de Docker.

1. Navega a la raíz del repositorio (`Jovenes Al Ruedo/`).
2. Levanta el contenedor de la base de datos:
   ```bash
   docker-compose up -d
   ```
3. Verifica que el contenedor esté corriendo:
   ```bash
   docker ps
   ```

---

## 3. Backend (FastAPI)

1. Ingresa a la carpeta del backend:
   ```bash
   cd be
   ```
2. Crea el entorno virtual en Python:
   ```bash
   python -m venv .venv
   ```
3. Activa el entorno virtual:
   - **En Windows (PowerShell)**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **En Linux / macOS**:
     ```bash
     source .venv/bin/activate
     ```
4. Instala todas las dependencias requeridas:
   ```bash
   pip install -r requirements.txt
   ```
5. Configura tu archivo de variables de entorno copiando el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
6. Aplica las migraciones de base de datos de Alembic:
   ```bash
   alembic upgrade head
   ```
7. Inicia el servidor de desarrollo:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   La documentación interactiva de la API estará disponible en [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 4. Frontend Web (React SPA)

1. Ingresa a la carpeta del frontend:
   ```bash
   cd ../fe
   ```
2. Instala los módulos y dependencias de Node:
   ```bash
   pnpm install
   # o usando npm: npm install
   ```
3. Copia la plantilla de entorno:
   ```bash
   cp .env.example .env
   ```
4. Lanza el servidor local de desarrollo con Vite:
   ```bash
   pnpm dev
   ```
   Accede a la aplicación web en [http://localhost:5173](http://localhost:5173).

---

## 5. Aplicación Móvil (React Native + Expo)

1. Navega a la carpeta de la aplicación móvil:
   ```bash
   cd ../Jovenes-al-ruedo-app
   ```
2. Instala las dependencias necesarias:
   ```bash
   pnpm install
   ```
3. Levanta la consola de Expo:
   ```bash
   pnpm expo start
   ```
4. Presiona `a` para emulador Android, `i` para emulador iOS o escanea el código QR con la app **Expo Go** en tu dispositivo físico conectado a la misma red local.
