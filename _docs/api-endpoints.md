# 🔌 Documentación de Endpoints — NN Auth System

**API REST | Base URL:** `http://localhost:8000/api/v1`

> Documentación completa de todos los endpoints. Para una API interactiva, ver Swagger UI en `/docs`.

---

## Tabla de Contenidos

- [Autenticación](#autenticación)
  - [Registro](#registro)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Cambio de Contraseña](#cambio-de-contraseña)
  - [Forgot Password](#forgot-password)
  - [Reset Password](#reset-password)
- [Usuario](#usuario)
  - [Obtener Perfil](#obtener-perfil)
- [Códigos de Respuesta](#códigos-de-respuesta)
- [Autenticación via JWT](#autenticación-via-jwt)
- [Ejemplos Completos](#ejemplos-completos)

---

## Autenticación

### Registro

Crea una nueva cuenta de usuario.

```
POST /auth/register
```

**Parámetros (Body — JSON):**

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|-----------|
| `email` | string | Sí | Formato email, único |
| `full_name` | string | Sí | 1-255 caracteres |
| `age` | integer | Sí | ≥ 18 años |
| `artistic_area` | string | Sí | 1-100 caracteres |
| `password` | string | Sí | Min 8 chars, 1 mayús, 1 minús, 1 número |

**Request Example:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@example.com",
    "full_name": "Carlos Música",
    "age": 24,
    "artistic_area": "Música Electrónica",
    "password": "SecurePass123"
  }'
```

**Response (201 Created):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "artist@example.com",
  "full_name": "Carlos Música",
  "age": 24,
  "artistic_area": "Música Electrónica",
  "is_active": true,
  "created_at": "2026-02-20T10:30:00Z",
  "updated_at": "2026-02-20T10:30:00Z"
}
```

**Error Responses:**

| Código | Causa | Response |
|--------|-------|----------|
| 400 | Email duplicado | `{"detail": "Email already registered"}` |
| 400 | Validación fallida | `{"detail": "Password must have..."}` |
| 422 | Schema inválido | `{"detail": [{"loc": [...], "msg": "..."}]}` |

---

### Login

Inicia sesión y obtiene tokens.

```
POST /auth/login
```

**Parámetros (Body — JSON):**

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `email` | string | Sí |
| `password` | string | Sí |

**Request Example:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@example.com",
    "password": "SecurePass123"
  }'
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**

| Código | Causa |
|--------|-------|
| 401 | Email o password incorrecto (respuesta genérica) |
| 422 | Schema inválido |

**¿Qué hacer con los tokens?**

```javascript
// Frontend — guardar tokens
const { access_token, refresh_token } = response.data;
sessionStorage.setItem('access_token', access_token);
sessionStorage.setItem('refresh_token', refresh_token);

// Usar access_token en requests posteriores:
axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
```

---

### Refresh Token

Obtiene un nuevo access token usando el refresh token.

```
POST /auth/refresh
```

**Parámetros (Body — JSON):**

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `refresh_token` | string | Sí |

**Request Example:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**

| Código | Causa |
|--------|-------|
| 401 | Refresh token expirado o inválido |

**Cuándo usar:**

- El access token expiró (después de 15 minutos)
- El refresh token aún es válido (máximo 7 días)
- Permite login sin pedir credenciales nuevamente

---

### Cambio de Contraseña

Cambia la contraseña del usuario autenticado.

```
POST /auth/change-password
```

**Requisitos:**
- ✅ Autenticación requerida (header `Authorization: Bearer <access_token>`)

**Parámetros (Body — JSON):**

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `current_password` | string | Sí |
| `new_password` | string | Sí |

**Request Example:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "current_password": "SecurePass123",
    "new_password": "NewSecurePass456"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

| Código | Causa |
|--------|-------|
| 401 | No autenticado (falta header Authorization) |
| 401 | Current password incorrecto |
| 400 | Nueva contraseña no válida |
| 400 | Nueva contraseña igual a la actual |

---

### Forgot Password

Solicita un email para recuperar la contraseña olvidada.

```
POST /auth/forgot-password
```

**Parámetros (Body — JSON):**

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `email` | string | Sí |

**Request Example:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@example.com"
  }'
```

**Response (200 OK):**

```json
{
  "message": "If the email exists, a password reset link will be sent"
}
```

**Nota:** La respuesta es genérica incluso si el email no existe (por seguridad).

**¿Qué sucede internamente?**

1. Se genera un token único de reset (UUID)
2. Se guarda en tabla `password_reset_tokens` con expiración (1 hora)
3. Se envía email con enlace:
   ```
   https://localhost:5173/reset-password?token=<token>
   ```
4. El usuario hace clic, va a `ResetPasswordPage`

---

### Reset Password

Restablece la contraseña usando un token válido.

```
POST /auth/reset-password
```

**Parámetros (Body — JSON):**

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `token` | string (UUID) | Sí |
| `new_password` | string | Sí |

**Request Example:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "new_password": "FreshNewPass789"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses:**

| Código | Causa |
|--------|-------|
| 400 | Token inválido (no existe en BD) |
| 400 | Token expirado (expires_at < now) |
| 400 | Token ya fue usado (used = true) |
| 400 | Nueva contraseña no válida |

---

## Usuario

### Obtener Perfil

Retorna el perfil del usuario autenticado.

```
GET /users/me
```

**Requisitos:**
- ✅ Autenticación requerida (header `Authorization: Bearer <access_token>`)

**Request Example:**

```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "artist@example.com",
  "full_name": "Carlos Música",
  "age": 24,
  "artistic_area": "Música Electrónica",
  "is_active": true,
  "created_at": "2026-02-20T10:30:00Z",
  "updated_at": "2026-02-20T10:30:00Z"
}
```

**Error Responses:**

| Código | Causa |
|--------|-------|
| 401 | No autenticado (falta header Authorization) |
| 401 | Token expirado |
| 401 | Token inválido |

---

## Códigos de Respuesta

| Código | Significado |
|--------|------------|
| 200 | OK — Operación exitosa |
| 201 | Created — Recurso créado (registro) |
| 400 | Bad Request — Datos inválidos o lógica fallida |
| 401 | Unauthorized — No autenticado o token inválido |
| 404 | Not Found — Recurso no encontrado |
| 422 | Unprocessable Entity — Schema Pydantic rechazó datos |
| 500 | Internal Server Error — Error del servidor |

---

## Autenticación via JWT

### ¿Cómo enviar el access token?

Todos los endpoints que requieren autenticación esperan el header:

```
Authorization: Bearer <access_token>
```

**En axios (frontend):**

```typescript
// Global — todas las requests incluyen el token
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ahora todos los requests lo usan automáticamente
const response = await axios.get('/api/v1/users/me');
```

**En curl (testing):**

```bash
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8000/api/v1/users/me
```

### Estructu del JWT

Un JWT está compuesto por 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZmE4NWY2NC01NzE3LTQ1NjItYjNmYy0yYzk2M2Y2NmFmYTYiLCJleHAiOjE3NDUzMzE4MDB9.A5c1_k2K5x...
 └─ Header ─┘ └────────────── Payload ──────────────┘ └──── Signature ────┘
```

**Decodificación (puedes usar https://jwt.io):**

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  // user_id
  "exp": 1745331800,  // Timestamp de expiración (15 min)
  "iat": 1745331000   // Timestamp de creación
}

// Signature: HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)
```

---

## Ejemplos Completos

### Flujo de Registro e Inicio de Sesión

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "full_name": "Juan Pérez",
    "age": 22,
    "artistic_area": "Fotografía",
    "password": "StrongPass123"
  }'
# Response: { "id": "uuid", "email": "newuser@example.com", ... }

# 2. Iniciar sesión
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "StrongPass123"
  }'
# Response: { "access_token": "JWT...", "refresh_token": "JWT..." }

# 3. Guardar tokens y usar en request autenticado
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Obtener perfil del usuario
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
# Response: { "id": "uuid", "email": "newuser@example.com", ... }
```

### Flujo de Cambio de Contraseña

```bash
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Cambiar contraseña
curl -X POST http://localhost:8000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "current_password": "StrongPass123",
    "new_password": "UltraNewPass456"
  }'
# Response: { "message": "Password changed successfully" }

# Ahora el login debe usar la nueva contraseña
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "UltraNewPass456"
  }'
```

### Flujo de Recuperación de Contraseña

```bash
# 1. Solicitar recuperación
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com"}'
# Response: { "message": "If the email exists..." }
# → Email recibido: "Reset tu contraseña aquí: http://localhost:5173/reset-password?token=550e8400..."

# 2. Usar el token para resetear
RESET_TOKEN="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$RESET_TOKEN'",
    "new_password": "FreshPassword789"
  }'
# Response: { "message": "Password reset successfully..." }

# 3. Login con nueva contraseña
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "FreshPassword789"
  }'
```

### Refresh Token (cuando access token expira)

```bash
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Expirado
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Aún válido (7 días)

# Obtener nuevo access token
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "'$REFRESH_TOKEN'"}'
# Response: { "access_token": "NEW_JWT...", "token_type": "bearer" }

# Ahora usar el nuevo access token
NEW_ACCESS_TOKEN="NEW_JWT..."

curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN"
# Response: { "id": "uuid", ... }
```

---

## Ver API Interactiva

Para experimentar con los endpoints de forma interactiva:

```bash
# Terminal 1: Levantar backend
cd be && source .venv/bin/activate && uvicorn app.main:app --reload

# Terminal 2: Abrir en navegador
http://localhost:8000/docs
```

Swagger UI permite:
- ✅ Probar cada endpoint directamente
- ✅ Ver esquemas de request/response
- ✅ Guardar responses
- ✅ Exportar código (Python, JavaScript, etc.)

---

> **Última actualización:** 20 febrero 2026
