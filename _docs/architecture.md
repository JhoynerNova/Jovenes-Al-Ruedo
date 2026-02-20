# 🏗️ Arquitectura del Sistema — NN Auth System

**Versión 1.0 | Febrero 2026**

> Documento que describe la arquitectura general, componentes principales, flujos y decisiones técnicas del proyecto.

---

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
- [Componentes Principales](#componentes-principales)
- [Flujos de Datos](#flujos-de-datos)
- [Patrones de Diseño](#patrones-de-diseño)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Seguridad](#seguridad)
- [Escalabilidad](#escalabilidad)

---

## Visión General

**NN Auth System** es una plataforma educativa de autenticación moderna que demuestra las mejores prácticas en:

- ✅ Arquitectura limpia y separación de responsabilidades
- ✅ Seguridad cryptográfica (bcrypt, JWT)
- ✅ Testing exhaustivo (backend y frontend)
- ✅ API RESTful bien documentada
- ✅ Interfaz de usuario moderna (React + TailwindCSS)
- ✅ Flujos de autenticación completos (registro, login, cambio y recuperación de contraseña)

### Stack Resumido

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
│        TypeScript + Vite + TailwindCSS + Axios         │
│          http://localhost:5173 (dev)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP REST (JSON)
                     │ CORS enabled
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                     │
│     Python 3.12+ + SQLAlchemy + Pydantic + JWT         │
│          http://localhost:8000/api/v1 (dev)            │
│          Swagger UI: http://localhost:8000/docs        │
└────────────────────┬────────────────────────────────────┘
                     │ SQL queries
                     │ Connection pooling
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                 │
│                   localhost:5432 (Docker)               │
│             Tablas: users, password_reset_tokens       │
└─────────────────────────────────────────────────────────┘
```

---

## Arquitectura de Alto Nivel

### Backend — Estructura en Capas

```
app/
├── main.py .......................... Punto de entrada, configuración de FastAPI
│
├── routers/ ......................... Capa de Presentación
│   ├── auth.py ...................... Endpoints de autenticación
│   └── users.py ..................... Endpoints de usuario
│
├── services/ ........................ Capa de Lógica de Negocio
│   └── auth_service.py .............. Toda la lógica de auth (sin HTTP)
│
├── models/ .......................... Capa de Datos (ORM)
│   ├── user.py ...................... Modelo User
│   └── password_reset_token.py ....... Modelo PasswordResetToken
│
├── schemas/ ......................... Capa de Validación (Pydantic)
│   └── user.py ...................... Schemas request/response
│
├── utils/ ........................... Utilidades Transversales
│   ├── security.py .................. Hash, JWT, verificación
│   └── email.py ..................... Envío de emails
│
├── database.py ...................... Configuración de SQLAlchemy
├── config.py ......................... Pydantic Settings (variables de entorno)
└── dependencies.py ................... Inyección de dependencias (get_db, get_current_user)
```

**Principios:**
- ✅ Cada capa tiene una responsabilidad clara
- ✅ Las dependencias van hacia adentro (routing → services → models/utils)
- ✅ Los services NO conocen de HTTP (puro Python)
- ✅ Fácil de testear: mockear una capa sin afectar otras

### Frontend — Estructura Modular

```
src/
├── main.tsx .......................... Punto de entrada
├── App.tsx ........................... Enrutamiento (React Router)
│
├── pages/ ............................ Vistas completamente funcionales
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ChangePasswordPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
│
├── components/ ....................... Componentes reutilizables
│   ├── ui/ ........................... Componentes primitivos
│   │   ├── Button.tsx
│   │   └── InputField.tsx
│   ├── layout/ ....................... Estructura de página
│   │   ├── Navbar.tsx
│   │   └── Layout.tsx
│   └── auth/ ......................... Componentes específicos de auth
│       └── ProtectedRoute.tsx
│
├── context/
│   └── AuthContext.tsx ............... Estado global de autenticación
│
├── hooks/
│   └── useAuth.ts .................... Hook para consumir AuthContext
│
├── api/
│   └── auth.ts ....................... Funciones para llamadas HTTP
│
├── types/
│   └── auth.ts ....................... Interfaces TypeScript
│
└── utils/ ............................ Funciones helper
```

**Principios:**
- ✅ Componentes pequeños y reutilizables
- ✅ Context API para estado global (auth)
- ✅ Custom hooks para lógica de componentes
- ✅ Separación clara: presentación vs lógica vs datos

---

## Componentes Principales

### Backend

#### 📍 routers/auth.py
Endpoints HTTP que exponen el sistema de autenticación:

- `POST /api/v1/auth/register` — Crear nueva cuenta
- `POST /api/v1/auth/login` — Obtener tokens
- `POST /api/v1/auth/refresh` — Renovar access token
- `POST /api/v1/auth/change-password` — Cambiar contraseña (autenticado)
- `POST /api/v1/auth/forgot-password` — Solicitar recuperación
- `POST /api/v1/auth/reset-password` — Restablecer contraseña

#### 📍 services/auth_service.py
Lógica de negocio pura (sin HTTP, sin BD directo). Implementa:

- Validación y creación de usuarios
- Verificación de credenciales
- Generación de tokens JWT
- Cambio de contraseña
- Flujo de recuperación (generar token, validar expiración, marcar como usado)

#### 📍 models/user.py
Tabla `users` — datos del usuario:

```python
id (UUID)
email (unique, indexed)
full_name
age
artistic_area
hashed_password (bcrypt)
is_active
created_at
updated_at
```

#### 📍 models/password_reset_token.py
Tabla `password_reset_tokens` — tokens temporales de reset:

```python
id (UUID)
user_id (FK → users)
token (unique, indexed)
expires_at
used (flag)
created_at
```

#### 📍 utils/security.py
Funciones criptográficas:

- `hash_password(plain_password)` → bcrypt hash
- `verify_password(plain, hashed)` → bool
- `create_access_token(data)` → JWT (15 min)
- `create_refresh_token(data)` → JWT (7 días)
- `decode_token(token)` → payload o error

#### 📍 utils/email.py
Envío de emails:

- `send_reset_password_email(user, reset_url)` — Email con enlace de reset

#### 📍 schemas/user.py
Validación con Pydantic:

- `UserCreate` — Request de registro
- `UserLogin` — Request de login
- `UserResponse` — Response de usuario (sin password)
- `TokenResponse` — Response con tokens
- `ChangePasswordRequest` — Cambio de contraseña
- Etc.

### Frontend

#### 📍 context/AuthContext.tsx
Estado global + funciones de auth. Provee:

```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
  login: (email, password) => Promise<void>,
  register: (data) => Promise<void>,
  logout: () => void,
  changePassword: (current, new_pass) => Promise<void>,
}
```

#### 📍 hooks/useAuth.ts
Hook que permite consumir `AuthContext` en cualquier componente:

```typescript
const { user, login, logout } = useAuth();
```

#### 📍 api/auth.ts
Funciones que llaman a la API:

- `registerUser(userData)` — POST /register
- `loginUser(email, password)` — POST /login
- `refreshToken()` — POST /refresh
- `changePassword(current, new)` — POST /change-password
- `requestPasswordReset(email)` — POST /forgot-password
- `resetPassword(token, newPassword)` — POST /reset-password
- `getUserProfile()` — GET /me

#### 📍 components/auth/ProtectedRoute.tsx
Componente que valida autenticación:

```typescript
<ProtectedRoute>
  <DashboardPage /> {/* Solo visible si está autenticado */}
</ProtectedRoute>
```

---

## Flujos de Datos

### Flujo 1: Registro de Usuario

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Usuario llena formulario en RegisterPage                 │
│    { email, full_name, age, artistic_area, password }       │
└────────────────────┬─────────────────────────────────────────┘
                     │ onClick
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Frontend → POST /api/v1/auth/register (axios)            │
│    Body: UserCreate (Pydantic schema)                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Backend routers/auth.py: register()                      │
│    - Valida con Pydantic (UserCreate schema)                │
│    - Llama services.auth_service.create_user()             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Backend services/auth_service.py: create_user()         │
│    - Verifica email único (query BD)                        │
│    - Hash password con bcrypt (security.py)                │
│    - Crea User en BD (session.add + commit)               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. BD PostgreSQL: INSERT INTO users (...)                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Backend responde UserResponse { id, email, full_name }  │
│    (sin hashed_password, password nunca viaja)             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Frontend recibe usuario créado                           │
│    → Redirige a LoginPage                                   │
│    → Muestra: "Usuario créado. Por favor inicia sesión"    │
└──────────────────────────────────────────────────────────────┘
```

### Flujo 2: Login

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa { email, password }                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Frontend → POST /api/v1/auth/login (axios)               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Backend: login()                                         │
│    - Busca usuario por email en BD                         │
│    - Si no existe: retorna 401 genérico                   │
│    - Si existe: verifica password vs hash (security.py)   │
│    - Si no coincide: retorna 401                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Backend: crea_tokens()                                   │
│    - access_token (15 min): exp = now + 15min              │
│    - refresh_token (7 días): exp = now + 7d               │
│    (Ambos firmados con SECRET_KEY)                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Backend responde TokenResponse                           │
│    {                                                        │
│      "access_token": "eyJ0...",                            │
│      "refresh_token": "eyJ0...",                           │
│      "token_type": "bearer"                                │
│    }                                                        │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Frontend guarda tokens en memoria/sessionStorage         │
│    - AuthContext.setState({ user, tokens })               │
│    - Redirige a DashboardPage                             │
└──────────────────────────────────────────────────────────────┘
```

### Flujo 3: Acceso a Ruta Protegida

```
┌──────────────────────────────────────────────────────────────┐
│ Usuario intenta acceder a /dashboard (página protegida)     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ ProtectedRoute valida:                                      │
│  - ¿Hay token en localStorage/memory?                      │
│  - ¿Es válido (no expirado)?                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
    VÁLIDO               EXPIRADO O AUSENTE
        │                         │
        ▼                         ▼
  Renderiza            Redirige a LoginPage
  DashboardPage               │
                              ▼
                      Mostrar: "Sesión expirada"
```

### Flujo 4: Recuperación de Contraseña

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa email en ForgotPasswordPage              │
│    → POST /api/v1/auth/forgot-password                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Backend: forgot_password(email)                          │
│    - Busca usuario por email                               │
│    - Si NO existe: retorna 200 genérico (no revelar)      │
│    - Si existe: genera token UUID + 1 hora de exp         │
│    - Crea PasswordResetToken en BD                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Backend: send_reset_password_email()                     │
│    - Email: "Haz clic aquí para resetear:"                 │
│      {FRONTEND_URL}/reset-password?token={token}          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Usuario recibe email, hace clic                          │
│    → Llega a ResetPasswordPage con ?token=xyz              │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Usuario ingresa nueva contraseña                         │
│    → POST /api/v1/auth/reset-password                      │
│      { token, new_password }                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Backend: reset_password(token, new_password)            │
│    - Busca token en BD                                     │
│    - Si no existe: error 400 "Token inválido"             │
│    - Si expiró: error 400 "Token expirado"                │
│    - Si usado: error 400 "Token ya fue usado"             │
│    - Si válido:                                            │
│      * Hashea new_password (bcrypt)                       │
│      * Actualiza user.hashed_password                     │
│      * Marca token.used = True                            │
│      * commit()                                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Backend responde 200 { "message": "..." }               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. Frontend muestra: "Contraseña cambiada"                 │
│    → Redirige a LoginPage                                  │
│    → Usuario hace login con nueva contraseña              │
└──────────────────────────────────────────────────────────────┘
```

---

## Patrones de Diseño

### Backend

#### 1️⃣ Inyección de Dependencias (Dependency Injection)
**¿Qué?** FastAPI maneja automáticamente las dependencias via `Depends()`.

```python
@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),  # ← Inyectado
    db: Session = Depends(get_db)  # ← Inyectado
):
    # FastAPI llama get_current_user() y get_db() automáticamente
    return current_user
```

**¿Para qué?** Desacoplar componentes, facilitar testing (mockear dependencias).

**¿Impacto?** Código limpio, testeable.

---

#### 2️⃣ Separación de Capas
**¿Qué?** Código dividido en routers → services → models.

```
routers/auth.py      ← HTTP (mapea requests a funciones Python)
  ↓ depende de
services/auth_service.py  ← Lógica pura (sin HTTP)
  ↓ depende de
models/user.py            ← ORM (mapea objetos a BD)
```

**¿Para qué?** Cada capa tiene una responsabilidad. Cambiar BD no afecta la lógica de negocio.

**¿Impacto?** Código mantenible, testeable, reutilizable.

---

#### 3️⃣ Response Models (Pydantic)
**¿Qué?** Cada endpoint especifica su `response_model` con Pydantic.

```python
@router.post(
    "/login",
    response_model=TokenResponse,  # ← Pydantic schema
    status_code=status.HTTP_200_OK
)
def login(...) -> TokenResponse:
    # FastAPI valida el response contra TokenResponse
    # Si hay campos extra/faltantes, error
    return TokenResponse(access_token=..., refresh_token=...)
```

**¿Para qué?** Documentación automática, validación, coherencia.

**¿Impacto?** Swagger UI es 100% accurate. Errores atrapados temprano.

---

### Frontend

#### 1️⃣ Context API para Estado Global
**¿Qué?** `AuthContext` centraliza todo el estado de autenticación.

```typescript
<AuthProvider>
  <App /> {/* Todos los componentes pueden acceder a AuthContext */}
</AuthProvider>
```

**¿Para qué?** Evitar prop drilling (pasar props a través de 10 componentes).

**¿Impacto?** Estado centralizado, fácil de testear.

---

#### 2️⃣ Custom Hooks para Lógica Reutilizable
**¿Qué?** `useAuth()` encapsula acceso a AuthContext.

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth solo dentro de AuthProvider");
  return context;
}
```

**¿Para qué?** Cualquier componente usa `const { user, login } = useAuth()`.

**¿Impacto?** Código DRY, validaciones de uso.

---

#### 3️⃣ Protected Routes
**¿Qué?** `ProtectedRoute` valida autenticación antes de renderizar.

```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

**¿Para qué?** Prevenir acceso a páginas sin autenticación.

**¿Impacto?** Seguridad de URL (aunque el backend también valida).

---

## Decisiones Técnicas

### 🔐 JWT vs Sessions

**Decisión:** JWT (JSON Web Tokens)

**Razones:**
- ✅ Stateless — no requiere base de datos de sesiones
- ✅ Escalable — múltiples servidores sin sincronización
- ✅ Mejor para APIs REST / Single Page Applications
- ✅ Tokens con expiración clara

**Implementación:**
- Access token: 15 minutos (corto, no crítico si se expone)
- Refresh token: 7 días (largo, almacenado de forma segura)

---

### 🔑 Bcrypt vs SHA256 para Passwords

**Decisión:** Bcrypt via passlib

**Razones:**
- ✅ Tiene "salting" automático (evita rainbow tables)
- ✅ Lento por diseño (resiste brute force)
- ✅ Adaptativo (puede aumentar "cost factor" en el futuro)
- ✅ Estándar de la industria (OWASP recomendado)

**SHA256 perderías salting, sería rápido (malo), no es adaptativo.**

---

### 🗄️ UUID vs AutoIncrement para IDs

**Decisión:** UUID (PostgreSQL UUID type)

**Razones:**
- ✅ No revela cuántos usuarios hay
- ✅ Imposible adivinar IDs secuenciales
- ✅ Mejor para seguridad
- ✅ Aún es performante con índices

---

### 📧 Email en Desarrollo

**Decisión:** Print a consola en dev (usando mailtrap/ethereal en producción)

**Implementación:**
```python
# dev: print email a stdout
if settings.ENVIRONMENT == "development":
    print(f"[EMAIL] To: {email}\nBody:\n{body}")
else:
    # prod: SMTP real
    send_via_smtp(email, body)
```

---

### 💾 localStorage vs sessionStorage vs Cookies para Tokens

**Decisión:** Context + sessionStorage (o memoria + secure httpOnly cookies en prod)

**Razones:**
- ✅ sessionStorage: automáticamente borrado al cerrar pestaña
- ✅ No vulnerable a XSS como localStorage (en desarrollo)
- ✅ En producción: usar httpOnly cookies (no accesibles por JavaScript)

---

## Seguridad

### ✅ Implementado

1. **Hashing de contraseñas** — Bcrypt (nunca texto plano)
2. **JWT firmados** — Imposible falsificar sin SECRET_KEY
3. **Expiración de tokens** — Access token 15 min, refresh 7 días
4. **Tokens de un solo uso** — Password reset tokens marcados como `used`
5. **CORS restrictivo** — Solo `http://localhost:5173` en desarrollo
6. **Validación de input** — Pydantic valida todos los requests
7. **Mensajes genéricos en auth** — No revelar si email existe
8. **Historial de cambios de contraseña** — (implementable: guardar hash anterior)

### ✅ Recomendaciones para Producción

```python
# ➊ Rate limiting — prevenir brute force
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
def login(...):
    pass

# ➋ HTTPS obligatorio
# ➌ Secrets en variables de entorno

# ➋ CORS específico
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

# ➌ httpOnly cookies para JWT
response.set_cookie(
    "access_token",
    value=access_token,
    httponly=True,
    secure=True,  # HTTPS only
    samesite="Lax"
)
```

---

## Escalabilidad

### Horizontal Scaling (múltiples instancias)

**JWT es stateless → escalable:** Cada servidor puede validar tokens sin estado compartido.

```
┌─────────────────┐
│  Load Balancer  │
├─────────┬───────┤
│ API 1   │ API 2 │
│(token)  │(token)│ ← Ambas pueden validar el mismo token
└────┬────┴───┬───┘
     │        │
     └────┬───┘
          │
       ┌─────────┐
       │   BD    │
       └─────────┘
```

### Vertical Scaling (más recursos)

- Connection pooling en SQLAlchemy
- Redis cache para tokens revocados (si se implementa logout "hard")
- CDN para frontend (Vite build es static)

---

## Diagrama de Flujo de Autenticación

```
START
 │
 ├─→ [Registro] → Email único? Yes → Hash password → Guardar → User créado
 │                              No  → Email duplicado error
 │
 ├─→ [Login] → Email + Password → Email existe? Yes → Password coincide?
 │                                               Yes  → Generar access + refresh token
 │                                               No   → Unauthorized 401
 │                                            No  → User not found
 │
 ├─→ [Cambio de contraseña] → (Requiere access_token) → Verificar pwd actual
 │                                                    Yes → Hash pwd nueva → Guardar
 │                                                    No  → Current password error
 │
 ├─→ [Forgot Password] → Email existe? Yes → Generar token descartable (1h exp)
 │                                        Enviar email con reset link
 │                    No  → Return 200 genérico (no revelar)
 │
 └─→ [Reset Password] → Token válido? Yes → No expirado? Yes → No usado?
                                              Yes → Hash pwd nueva → Guardar + Mark used
                                              No → Token expirado
                                           No → Token inválido
```

---

> **Documento vivo:** Se actualiza a medida que la arquitectura evoluciona.
