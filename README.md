# 🎨 Jóvenes al Ruedo

**Proyecto educativo — SENA, Ficha 3171599 | Febrero 2026**

Sistema de autenticación y gestión de perfiles para la plataforma **Jóvenes al Ruedo** — una plataforma que conecta jóvenes artistas con empresas y oportunidades en el sector cultural y creativo.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Prerrequisitos](#prerrequisitos)
- [Instalación y Setup](#instalación-y-setup)
- [Ejecución](#ejecución)
- [Testing](#testing)
- [Documentación Técnica](#documentación-técnica)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Convenciones](#convenciones)
- [Autores](#autores)

---

## 📖 Descripción del Proyecto

**Jóvenes al Ruedo** es una plataforma digital diseñada para empoderar a jóvenes artistas, permitiéndoles:

- 🎭 Registrarse con su perfil artístico (nombre, edad, área artística)
- 🗂️ Crear y gestionar su portafolio de proyectos y habilidades
- 🏢 Conectar con empresas del sector cultural
- 💼 Postularse a ofertas laborales y retos creativos
- 💬 Comunicarse directamente con empresas mediante mensajes y comentarios

Este repositorio contiene el sistema de autenticación base (registro, login, cambio y recuperación de contraseña), construido sobre el proyecto educativo del instructor.

---

## 🛠️ Stack Tecnológico

### Backend (`be/`)

| Tecnología | Versión | Propósito |
|---|---|---|
| Python | 3.12+ | Lenguaje principal |
| FastAPI | 0.115+ | Framework web async |
| SQLAlchemy | 2.0+ | ORM para PostgreSQL |
| Alembic | latest | Migraciones de BD |
| Pydantic | 2.0+ | Validación de datos |
| python-jose | latest | Tokens JWT |
| passlib[bcrypt] | latest | Hashing de contraseñas |
| pytest | latest | Testing |
| uvicorn | latest | Servidor ASGI |

### Frontend (`fe/`)

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18+ | Interfaz de usuario |
| TypeScript | 5.0+ | Tipado estático |
| Vite | 6+ | Bundler y dev server |
| TailwindCSS | 4+ | Estilos utility-first |
| React Router | 7+ | Enrutamiento |
| Axios | latest | Cliente HTTP |
| Vitest | latest | Testing frontend |

### Base de Datos

| Tecnología | Versión | Propósito |
|---|---|---|
| PostgreSQL | 17+ | Base de datos relacional |
| Docker Compose | latest | Contenedor de la BD |

---

## 🗄️ Estructura de la Base de Datos

La plataforma cuenta con las siguientes entidades principales:

### Entidades principales

| Tabla | Descripción |
|---|---|
| `Usuarios` | Jóvenes artistas registrados en la plataforma |
| `Empresa` | Organizaciones y empresas del sector cultural |
| `Portafolio` | Portafolios de proyectos de cada artista |
| `Habilidad` | Tipos de arte y habilidades artísticas |
| `Portafolio_Habilidad` | Relación entre portafolios y habilidades |
| `Oferta` | Oportunidades laborales publicadas por empresas |
| `Postulacion` | Postulaciones de artistas a ofertas |
| `Reto` | Retos creativos propuestos por empresas |
| `Participa` | Participación de artistas en retos |
| `Rol` | Roles de los usuarios en el sistema |
| `Mensaje` | Mensajes entre artistas y empresas |
| `Comentario` | Comentarios en perfiles y portafolios |

### Tabla `Usuarios`

| Columna | Tipo | Descripción |
|---|---|---|
| `id_usuario` | INTEGER (PK) | Identificador único |
| `Nombre` | VARCHAR(50) | Nombre completo |
| `Edad` | INTEGER | Edad del artista (mínimo 18) |
| `Telefono` | VARCHAR(50) | Teléfono de contacto |
| `Direccion` | VARCHAR(50) | Dirección |
| `Correo` | VARCHAR(50) | Correo electrónico |

### Tabla `Empresa`

| Columna | Tipo | Descripción |
|---|---|---|
| `id_empresa` | INTEGER (PK) | Identificador único |
| `Nombre` | VARCHAR(50) | Nombre de la empresa |
| `Sector_empresa` | TEXT(50) | Sector artístico/cultural |
| `Correo` | VARCHAR(50) | Correo de contacto |
| `Numero_NIT` | INTEGER | NIT de la empresa |
| `Telefono` | VARCHAR(10) | Teléfono |

---

## ✅ Prerrequisitos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Python | 3.12+ | `python --version` |
| Node.js | 20 LTS+ | `node --version` |
| pnpm | 9+ | `pnpm --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Git | 2.40+ | `git --version` |

> ⚠️ **Importante:** Usar `pnpm` como gestor de paquetes de Node.js. **Nunca usar npm ni yarn.**

---

## 🚀 Instalación y Setup

### 1. Clonar el repositorio

```bash
git clone https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git
cd Jovenes-Al-Ruedo
```

### 2. Levantar la base de datos

```bash
docker compose up -d
docker compose ps
# Debe mostrar nn_auth_db con estado "healthy"
```

### 3. Configurar el Backend

```bash
cd be

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
source .venv/Scripts/activate    # Windows (Git Bash)
source .venv/bin/activate        # Linux/macOS

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
alembic upgrade head
```

### 4. Configurar el Frontend

```bash
cd fe
pnpm install
cp .env.example .env
```

---

## ▶️ Ejecución

```bash
# Terminal 1 — Base de datos
docker compose up -d

# Terminal 2 — Backend (FastAPI)
cd be && source .venv/Scripts/activate
uvicorn app.main:app --reload
# → API en http://localhost:8000
# → Swagger UI en http://localhost:8000/docs

# Terminal 3 — Frontend (React)
cd fe && pnpm dev
# → App en http://localhost:5173
```

---

## 🧪 Testing

### Backend

```bash
cd be && source .venv/Scripts/activate

# Todos los tests
pytest -v

# Con cobertura
pytest --cov=app --cov-report=term-missing
```

**Resultado:** ✅ 32/32 tests pasando

### Frontend

```bash
cd fe

# Todos los tests
pnpm test

# Con cobertura
pnpm test:coverage
```

**Resultado:** ✅ 82/82 tests pasando

---

## � Documentación Técnica

Documentación completa y detallada sobre la arquitectura, endpoints y base de datos:

| Documento | Descripción |
|-----------|------------|
| [architecture.md](_docs/architecture.md) | Arquitectura de alto nivel, componentes, flujos de datos, patrones de diseño |
| [api-endpoints.md](_docs/api-endpoints.md) | Especificación completa de endpoints, parámetros, ejemplos con curl |
| [database-schema.md](_docs/database-schema.md) | Modelo de datos, tablas, migraciones, queries comunes, ER diagram |

### 🔍 API Interactiva (Swagger UI)

Una vez levantado el backend, acceder a la documentación interactiva en:

```
http://localhost:8000/docs
```

Permite probar todos los endpoints directamente sin usar curl.

---

```
Jovenes-Al-Ruedo/
├── .github/
│   └── copilot-instructions.md    # Reglas y convenciones del proyecto
├── _docs/                         # Documentación técnica
│   ├── HUs/                       # Historias de Usuario
│   ├── RFs/                       # Requerimientos Funcionales
│   ├── RNFs/                      # Requerimientos No Funcionales
│   └── restrictions/              # Restricciones del sistema
├── be/                            # Backend — FastAPI + Python
│   ├── app/
│   │   ├── main.py                # Punto de entrada FastAPI
│   │   ├── config.py              # Configuración (Pydantic Settings)
│   │   ├── database.py            # Conexión a PostgreSQL
│   │   ├── models/                # Modelos ORM
│   │   │   ├── user.py            # Modelo User (con age y artistic_area)
│   │   │   └── password_reset_token.py
│   │   ├── schemas/               # Schemas Pydantic
│   │   ├── routers/               # Endpoints (auth, users)
│   │   ├── services/              # Lógica de negocio
│   │   ├── utils/                 # Seguridad y email
│   │   └── tests/                 # Tests con pytest
│   ├── alembic/                   # Migraciones de BD
│   └── requirements.txt
├── fe/                            # Frontend — React + Vite + TypeScript
│   └── src/
│       ├── api/                   # Clientes HTTP
│       ├── components/            # Componentes reutilizables
│       ├── pages/                 # Páginas/vistas
│       ├── hooks/                 # Custom hooks
│       ├── context/               # Context providers
│       └── types/                 # Tipos TypeScript
├── docker-compose.yml             # PostgreSQL 17
└── README.md
```

---

## 🔌 Endpoints de la API

Base URL: `http://localhost:8000/api/v1`

### Autenticación (`/auth`)

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/register` | Registrar joven artista | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Renovar access token | No |
| POST | `/auth/change-password` | Cambiar contraseña | Sí |
| POST | `/auth/forgot-password` | Solicitar recuperación | No |
| POST | `/auth/reset-password` | Restablecer contraseña | No |

### Usuario (`/users`)

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/users/me` | Obtener perfil del artista | Sí |

### Campos de registro

```json
{
  "email": "artista@ejemplo.com",
  "full_name": "Nombre Completo",
  "age": 20,
  "artistic_area": "Música",
  "password": "Contraseña123"
}
```

> 📖 Documentación interactiva completa en: **http://localhost:8000/docs**

---

## 📏 Convenciones

| Aspecto | Regla |
|---|---|
| Nomenclatura técnica | Inglés (variables, funciones, endpoints) |
| Comentarios y docs | Español (¿Qué? ¿Para qué? ¿Impacto?) |
| Commits | Conventional Commits en inglés |
| Python | PEP 8 + type hints + ruff |
| TypeScript | strict mode + ESLint + Prettier |
| Gestor paquetes | venv (Python), pnpm (Node.js) |

---

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** — nunca en texto plano
- Autenticación con **JWT** (Access Token 15 min + Refresh Token 7 días)
- Validación de edad mínima: **18 años**
- Validación de contraseña: mínimo 8 caracteres, mayúscula, minúscula y número
- CORS configurado solo para `http://localhost:5173`

---

## 👥 Autores

| Nombre | Rol |
|---|---|
| **Franky Almario** | Desarrollador |
| **Jhoyner Nova** | Desarrollador |

**Instructor:** ergrato-dev  
**Programa:** SENA — Ficha 3171599  
**Fecha:** Febrero 2026

---

## ✅ Verificación Final del Sistema

La implementación ha completado todas las fases del proyecto:

### Checklist de Completitud

```bash
# ✅ Fase 1 — Backend Setup                        [COMPLETADA]
# ✅ Fase 2 — Modelo de Datos y Migraciones        [COMPLETADA]
# ✅ Fase 3 — Autenticación Backend                [COMPLETADA]
# ✅ Fase 4 — Tests Backend (32/32 ✅)              [COMPLETADA]
# ✅ Fase 5 — Frontend Setup                       [COMPLETADA]
# ✅ Fase 6 — Frontend Auth                        [COMPLETADA]
# ✅ Fase 7 — Tests Frontend (82/82 ✅)             [COMPLETADA]
# ✅ Fase 8 — Documentación Final                  [COMPLETADA]
```

### Probar el Sistema Completo

```bash
# 1. Levantar base de datos
docker compose up -d
docker compose ps

# 2. Levantar backend (Terminal 1)
cd be && source .venv/bin/activate && uvicorn app.main:app --reload
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs

# 3. Levantar frontend (Terminal 2)
cd fe && pnpm dev
# → http://localhost:5173

# 4. Ejecutar tests (Terminal 3)
cd be && source .venv/bin/activate && pytest -v --cov=app
cd fe && pnpm test

# 5. Flujo manual completo:
#    ✓ Ir a http://localhost:5173
#    ✓ Registro con nuevo usuario
#    ✓ Login con credenciales
#    ✓ Ver perfil (/dashboard)
#    ✓ Cambiar contraseña (/change-password)
#    ✓ Logout
#    ✓ Forgot password (revisa consola del backend por email)
#    ✓ Reset password (usa token del email)
#    ✓ Login nuevamente con nueva contraseña
```

### Estado del Proyecto

| Aspecto | Estado |
|--------|--------|
| Backend (FastAPI) | ✅ Funcional |
| Frontend (React) | ✅ Funcional |
| Base de Datos | ✅ Funcional |
| Autenticación JWT | ✅ Implementada |
| Tests Backend | ✅ 32/32 pasando (96% cobertura) |
| Tests Frontend | ✅ 82/82 pasando |
| Documentación | ✅ Completa |
| Seguridad | ✅ Implementada (bcrypt, JWT, CORS) |

---