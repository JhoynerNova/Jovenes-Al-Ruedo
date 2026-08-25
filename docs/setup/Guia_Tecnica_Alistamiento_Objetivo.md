# Guía Técnica y Documento Oficial de Alistamiento de Proyecto (Evidencia Guía Objetivo)

**Servicio Nacional de Aprendizaje (SENA)**  
**Tecnología en Análisis y Desarrollo de Software (ADSO) - Ficha 3171599**  
**Proyecto Productivo**: Jóvenes al Ruedo — Plataforma de Oportunidades Juveniles  
**Aprendices / Autores**: Franky Almario & Jhoyner Nova  
**Repositorio GitHub**: [Jovenes-Al-Ruedo en GitHub](https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git)  

---

## 1. Configuración del Entorno de Desarrollo Local

Para garantizar la reproducibilidad y el correcto alistamiento del proyecto **Jóvenes al Ruedo**, el equipo de desarrollo ha documentado los requisitos mínimos del sistema, el entorno de ejecución, el motor de base de datos relacional y las herramientas auxiliares.

### 1.1. Requisitos Mínimos del Sistema

| Componente Hardware | Requisito Mínimo | Requisito Recomendado |
| :--- | :--- | :--- |
| **Procesador (CPU)** | Intel Core i3 / AMD Ryzen 3 (4 núcleos) | Intel Core i5/i7 o AMD Ryzen 5/7 (6+ núcleos) |
| **Memoria RAM** | 8 GB RAM DDR4 | 16 GB RAM DDR4/DDR5 |
| **Almacenamiento** | 20 GB libres SSD | 50 GB libres NVMe SSD |
| **Sistema Operativo** | Windows 10/11 64-bit, Ubuntu 22.04 LTS o macOS 13+ | Windows 11 Pro 64-bit / Linux WSL2 |

---

### 1.2. Herramientas y Runtimes

#### Lenguaje y Entorno Backend (Python 3.12+ & FastAPI)
- **Entorno de Ejecución**: Python 3.12 LTS con FastAPI (Framework web asíncrono ASGI).
- **Servidor ASGI**: Uvicorn.
- **Gestor de Paquetes**: `pip` / `uv` con entornos virtuales `.venv`.

```bash
# 1. Acceder a la carpeta del backend
cd be

# 2. Crear el entorno virtual aislado
python -m venv .venv

# 3. Activar el entorno virtual
# En Windows PowerShell:
.venv\Scripts\Activate.ps1
# En Linux / macOS:
source .venv/bin/activate

# 4. Instalar dependencias requeridas
pip install -r requirements.txt

# 5. Iniciar el servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

#### Sistema de Gestión de Bases de Datos (PostgreSQL 16 & Docker)
- **Motor SGBD**: PostgreSQL 16 relacional en puerto `5432`.
- **ORM & Migraciones**: SQLAlchemy 2.0 y Alembic 1.14.
- **Contenedores**: Docker Compose (`docker-compose.yml`) para el despliegue rápido del servicio `db`.

```bash
# Levantar el servicio PostgreSQL local en Docker
docker-compose up -d db

# Aplicar las migraciones de esquemas con Alembic
cd be
alembic upgrade head

# Poblar la base de datos con datos semilla
python seed_web_db.py
```

---

### 1.3. Herramientas de Software Auxiliares

| Categoría | Herramienta Seleccionada | Justificación y Uso en el Proyecto |
| :--- | :--- | :--- |
| **Editor de Código (IDE)** | Visual Studio Code | IDE estándar del equipo. Extensiones obligatorias: Python, Pylance, Prettier, ESLint, Docker, GitLens, PostgreSQL Client. |
| **Pruebas de API HTTP** | Swagger UI & Postman | Swagger UI interactivo en `http://localhost:8000/docs`. Postman / Thunder Client para pruebas de autenticación JWT. |
| **Administración de BD** | DBeaver / pgAdmin 4 | Cliente gráfico para consulta visual de tablas, diagramas Entidad-Relación (ER) y verificación de llaves foráneas. |

---

### Evidencias Fotográficas de Herramientas e Instalación

#### Evidencia 1: Visual Studio Code & Entorno de Desarrollo Backend
![Visual Studio Code y Terminal Uvicorn](images/captura_vscode.png)
*Figura 1: Entorno de desarrollo local en VS Code mostrando la estructura del backend en Python FastAPI y la terminal integrada ejecutando Uvicorn en la rama 'develop'.*

#### Evidencia 2: Cliente de Pruebas de API HTTP (Swagger UI)
![FastAPI Swagger UI Docs](images/captura_swagger.png)
*Figura 2: Interfaz interactiva de Swagger UI de la API Jóvenes al Ruedo desplegada en http://localhost:8000/docs mostrando los endpoints HTTP.*

---

## 2. Estándares del Repositorio y Control de Versiones (GitHub)

Repositorio Oficial: [https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git](https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git)

### 2.1. Modelo de Gestión de Ramas (Branching Model)
El grupo establece las siguientes reglas para la administración del repositorio:

- **`main`**: Código en estado estable y listo para producción.
- **`develop`**: Rama de integración continua donde se consolidan y prueban los avances del equipo.
- **`feature/nombre-funcionalidad`**: Ramas independientes derivadas de `develop` para construir nuevos módulos (`feature/auth-jwt`, `feature/portafolio`, `feature/convocatorias`).

#### Evidencia 3: Repositorio Oficial en GitHub & Rama `develop`
![GitHub Repository Develop Branch](images/captura_github.png)
*Figura 3: Vista del repositorio oficial en GitHub con la rama 'develop' seleccionada y la estructura de archivos .gitignore, docker-compose.yml y backend.*

```bash
# Ejemplo de creación y envío de rama de funcionalidad:
git checkout develop
git pull origin develop
git checkout -b feature/autenticacion-jwt
git add .
git commit -m "feat(auth): implementar generacion de JWT tokens"
git push -u origin feature/autenticacion-jwt
```

---

### 2.2. Archivos de Configuración e Ignorados

#### Archivo `.gitignore`
Previene la inclusión accidentada de datos sensibles, temporales o pesados:

```gitignore
# Backend Python
be/.venv/
.venv/
__pycache__/
*.pyc
.pytest_cache/
.ruff_cache/

# Frontend Node.js
node_modules/
fe/dist/
fe/.vite/

# Variables de Entorno y Seguridad
.env
*.env.local

# Excepciones
!.env.example
```

#### Plantilla `.env.example`
Plantilla con valores ficticios para guiar la configuración local:

```env
DATABASE_URL=postgresql://jar_user:jar_password@localhost:5432/jovenes_al_ruedo
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
```

---

### 2.3. Estándar de Mensajes de Commit (Conventional Commits)

| Prefijo | Propósito | Ejemplo Real del Proyecto |
| :--- | :--- | :--- |
| **`feat`** | Nueva funcionalidad o pantalla | `feat(auth): agregar endpoint de registro de usuarios` |
| **`fix`** | Corrección de bug o error | `fix(db): corregir mapeo de relacion entre Usuario y Portafolio` |
| **`docs`** | Cambios en documentación | `docs(setup): actualizar guia tecnica de alistamiento de entorno` |
| **`style`** | Ajustes de formato o CSS sin cambiar lógica | `style(be): aplicar formateador ruff en los routers de usuarios` |
| **`refactor`** | Reestructuración de código existente | `refactor(services): separar logica de envio de correo en mail.py` |

---

## 3. Estructura de Carpetas (Estilo Arquitectónico API REST)

El backend adopta una **Arquitectura en Capas** limpia y desacoplada:

```
be/
├── alembic/                  # Migraciones versionadas de la base de datos
├── app/                      # Código fuente principal de la aplicación
│   ├── core/                 # Configuraciones de seguridad, JWT y constantes
│   ├── models/               # Capa de Modelos ORM (SQLAlchemy)
│   ├── routers/              # Capa de Rutas y Endpoints HTTP
│   ├── schemas/              # Capa de Schemas de Validación (Pydantic v2)
│   ├── services/             # Capa de Servicios y Reglas de Negocio
│   ├── utils/                # Capa de Utilidades (hashing, formateadores)
│   ├── config.py             # Configuración central de variables de entorno
│   ├── database.py           # Conexión y sesión de base de datos
│   ├── dependencies.py       # Inyección de dependencias (Auth JWT, DB Session)
│   └── main.py               # Punto de entrada FastAPI, CORS y Middlewares
├── tests/                    # Pruebas unitarias e integración con Pytest
├── uploads/                  # Almacenamiento local de archivos estáticos
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Reglas de ignorado de Git
├── docker-compose.yml        # Orquestación de servicios PostgreSQL y Backend
├── pyproject.toml            # Configuración de linter (Ruff)
└── requirements.txt          # Lista oficial de dependencias Python
```

#### Evidencia 4: Cliente Gráfico de Base de Datos (DBeaver / PostgreSQL)
![DBeaver PostgreSQL Database Connection](images/captura_dbeaver.png)
*Figura 4: Vista del cliente DBeaver conectado a PostgreSQL 16 mostrando las tablas 'users', 'roles', 'portfolios' y 'convocatorias' con su modelo relacional.*

---

## 4. Evidencias de Verificación y Estado del Sistema

### 4.1. Verificación del Repositorio GitHub y Ramas
```bash
$ git remote -v
origin  https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git (fetch)
origin  https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git (push)

$ git branch -a
* develop
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/develop
```

### 4.2. Endpoint de Salud (Health Check)
```json
// GET http://localhost:8000/api/v1/health
{
  "status": "healthy",
  "project": "Jóvenes al Ruedo",
  "version": "0.1.0"
}
```

---
**Firmado Por:**  
Franky Almario & Jhoyner Nova  
*Aprendices ADSO — Ficha 3171599, SENA*
