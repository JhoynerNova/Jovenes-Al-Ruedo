# 🧪 04 — Evidencias de Ejecución, Pruebas y Consistencia

> **Proyecto:** Jóvenes al Ruedo — Web & API  
> **Ficha SENA:** 3171599 (ADSO) | **Fecha:** 2026-11-19  
> **Autores:** Jhoyner Nova & Franky Almario  
> **Entorno:** Linux Fedora / Podman 5 / Python 3.14 (CPython) / PostgreSQL 17

---

## 🐳 1. Orquestación y Levantamiento del Entorno

### Inicialización de Base de Datos y Socket de Podman
```bash
# 1. Habilitación del socket de usuario para compatibilidad Docker Compose en Linux Fedora
systemctl --user start podman.socket

# 2. Variable de entorno DOCKER_HOST
export DOCKER_HOST="unix:///run/user/1000/podman/podman.sock"

# 3. Despliegue de PostgreSQL 17 en contenedor
cd /home/frankyalmario/Jovenes-Al-Ruedo
docker compose up -d db

# 4. Verificación de contenedor en ejecución
docker ps
# CONTAINER ID   IMAGE                STATUS          PORTS                    NAMES
# 459b71988f9e   postgres:17-alpine   Up 26 minutes   0.0.0.0:5433->5432/tcp   jovenes_al_ruedo_db
```

### Ejecución de Migraciones y Sembrado de Datos
```bash
cd be
uv run alembic upgrade head
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.runtime.migration] Running upgrade  -> a7c03fd8169f, create users table
# ...
# INFO  [alembic.runtime.migration] Running upgrade 2f4a6b8c0d1e -> 9ec46bc4ce93, add onboarding fields
```

---

## 🚦 2. Resultado Real de la Suite de Pruebas Automatizadas (`pytest`)

Ejecución de la suite completa que valida la integridad de la refactorización arquitectónica:

```bash
cd be
uv run pytest app/tests/test_auth.py app/tests/test_chat.py app/tests/test_database_transactions.py app/tests/test_api_20_endpoints.py -v
```

### Log de Ejecución (61/61 Pruebas Aprobadas - 100% Verde):
```text
============================= test session starts ==============================
platform linux -- Python 3.14.8, pytest-9.0.3, pluggy-1.6.0 -- be/.venv/bin/python
rootdir: /home/frankyalmario/Jovenes-Al-Ruedo/be
configfile: pyproject.toml
plugins: asyncio-1.4.0, anyio-4.13.0, cov-7.1.0
collected 61 items

app/tests/test_auth.py::TestRegister::test_register_success PASSED       [  1%]
app/tests/test_auth.py::TestRegister::test_register_duplicate_email PASSED [  3%]
app/tests/test_auth.py::TestRegister::test_register_weak_password_too_short PASSED [  4%]
app/tests/test_auth.py::TestRegister::test_register_password_no_uppercase PASSED [  6%]
app/tests/test_auth.py::TestRegister::test_register_password_no_lowercase PASSED [  8%]
app/tests/test_auth.py::TestRegister::test_register_password_no_digit PASSED [  9%]
app/tests/test_auth.py::TestRegister::test_register_invalid_email PASSED [ 11%]
app/tests/test_auth.py::TestRegister::test_register_empty_name PASSED    [ 13%]
app/tests/test_auth.py::TestRegister::test_register_missing_fields PASSED [ 14%]
app/tests/test_auth.py::TestLogin::test_login_success PASSED             [ 16%]
app/tests/test_auth.py::TestLogin::test_login_wrong_password PASSED      [ 18%]
app/tests/test_auth.py::TestLogin::test_login_nonexistent_email PASSED   [ 19%]
app/tests/test_auth.py::TestLogin::test_login_inactive_user PASSED       [ 21%]
app/tests/test_auth.py::TestRefresh::test_refresh_success PASSED         [ 22%]
app/tests/test_auth.py::TestRefresh::test_refresh_invalid_token PASSED   [ 24%]
app/tests/test_auth.py::TestRefresh::test_refresh_with_access_token PASSED [ 26%]
app/tests/test_auth.py::TestChangePassword::test_change_password_success PASSED [ 27%]
app/tests/test_auth.py::TestChangePassword::test_change_password_wrong_current PASSED [ 29%]
app/tests/test_auth.py::TestChangePassword::test_change_password_no_auth PASSED [ 31%]
app/tests/test_auth.py::TestChangePassword::test_change_password_weak_new_password PASSED [ 32%]
app/tests/test_auth.py::TestForgotPassword::test_forgot_password_existing_email PASSED [ 34%]
app/tests/test_auth.py::TestForgotPassword::test_forgot_password_nonexistent_email PASSED [ 36%]
app/tests/test_auth.py::TestForgotPassword::test_forgot_password_invalid_email PASSED [ 37%]
app/tests/test_auth.py::TestResetPassword::test_reset_password_success PASSED [ 39%]
app/tests/test_auth.py::TestResetPassword::test_reset_password_invalid_token PASSED [ 40%]
app/tests/test_auth.py::TestResetPassword::test_reset_password_expired_token PASSED [ 42%]
app/tests/test_auth.py::TestResetPassword::test_reset_password_used_token PASSED [ 44%]
app/tests/test_auth.py::TestResetPassword::test_reset_password_weak_new_password PASSED [ 45%]
app/tests/test_auth.py::TestGetMe::test_get_me_success PASSED            [ 47%]
app/tests/test_auth.py::TestGetMe::test_get_me_no_auth PASSED            [ 49%]
app/tests/test_auth.py::TestGetMe::test_get_me_invalid_token PASSED      [ 50%]
app/tests/test_auth.py::TestHealthCheck::test_health_check PASSED        [ 52%]
app/tests/test_chat.py::test_crear_conversacion_directa PASSED           [ 54%]
app/tests/test_chat.py::test_enviar_y_recibir_mensaje PASSED             [ 55%]
app/tests/test_chat.py::test_websocket_chat PASSED                       [ 57%]
app/tests/test_chat.py::test_websocket_chat_unauthenticated PASSED       [ 59%]
app/tests/test_chat.py::test_global_exception_handler PASSED             [ 60%]
app/tests/test_database_transactions.py::test_acid_commit_success PASSED [ 62%]
app/tests/test_database_transactions.py::test_acid_rollback_duplicate_email_unique_constraint PASSED [ 63%]
app/tests/test_database_transactions.py::test_acid_rollback_invalid_enum_check_constraint PASSED [ 65%]
app/tests/test_database_transactions.py::test_acid_atomicity_multiple_inserts_rollback PASSED [ 67%]
app/tests/test_api_20_endpoints.py::test_01_register_artist_success PASSED [ 68%]
app/tests/test_api_20_endpoints.py::test_02_register_company_success PASSED [ 70%]
app/tests/test_api_20_endpoints.py::test_03_login_success PASSED         [ 72%]
app/tests/test_api_20_endpoints.py::test_04_login_failure_wrong_password PASSED [ 73%]
app/tests/test_api_20_endpoints.py::test_05_get_me_authenticated PASSED  [ 75%]
app/tests/test_api_20_endpoints.py::test_06_get_me_unauthorized PASSED   [ 77%]
app/tests/test_api_20_endpoints.py::test_07_patch_profile_customization PASSED [ 78%]
app/tests/test_api_20_endpoints.py::test_08_get_users_list PASSED        [ 80%]
app/tests/test_api_20_endpoints.py::test_09_get_public_profile PASSED    [ 81%]
app/tests/test_api_20_endpoints.py::test_10_explore_artists PASSED       [ 83%]
app/tests/test_api_20_endpoints.py::test_11_explore_companies PASSED     [ 85%]
app/tests/test_api_20_endpoints.py::test_12_get_admin_stats PASSED       [ 86%]
app/tests/test_api_20_endpoints.py::test_13_create_convocatoria_success PASSED [ 88%]
app/tests/test_api_20_endpoints.py::test_14_list_convocatorias PASSED    [ 90%]
app/tests/test_api_20_endpoints.py::test_15_create_portafolio_success PASSED [ 91%]
app/tests/test_api_20_endpoints.py::test_16_get_my_portafolios PASSED    [ 93%]
app/tests/test_api_20_endpoints.py::test_17_create_chat_direct_conversation PASSED [ 95%]
app/tests/test_api_20_endpoints.py::test_18_list_chat_conversations PASSED [ 96%]
app/tests/test_api_20_endpoints.py::test_19_list_notifications PASSED    [ 98%]
app/tests/test_api_20_endpoints.py::test_20_delete_user_account_unauthorized_password PASSED [100%]

======================= 61 passed, 5 warnings in 86.50s =======================
```

---

## 📡 3. Evidencias de Peticiones y Respuestas HTTP (JSON Real)

### Operación 1: Consulta (`GET /api/v1/convocatorias/?skip=0&limit=1`)

**Request:**
```http
GET /api/v1/convocatorias/?skip=0&limit=1 HTTP/1.1
Host: localhost:8000
Accept: application/json
```

**Response (HTTP 200 OK):**
```json
{
  "items": [
    {
      "id_conv": 1,
      "nombre": "Festival de Teatro Emergente 2026",
      "glue": "Se buscan jóvenes actores y actrices para obra teatral experimental.",
      "nivel_experiencia": "Sin experiencia",
      "tipo_jornada": "Medio tiempo",
      "rango_salarial": "$1.500.000 - $2.000.000 COP",
      "ubicacion": "Bogotá D.C.",
      "id_usr": "a1b2c3d4-0001-0001-0001-000000000001",
      "empresa_nombre": "FUNDACIÓN TEATRAL DEL VALLE",
      "empresa_sector": "Teatro",
      "created_at": "2026-11-17T15:30:00Z",
      "total_inscritos": 4
    }
  ],
  "total": 12,
  "page": 1,
  "size": 1,
  "pages": 12
}
```

---

### Operación 2: Escritura (`POST /api/v1/auth/register`)

**Request:**
```http
POST /api/v1/auth/register HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "camilo.artista@example.com",
  "password": "Password123!",
  "first_name": "Camilo",
  "last_name": "Sánchez",
  "role": "artista",
  "birth_date": "2003-05-14",
  "artistic_area": "Música",
  "accepted_terms": true
}
```

**Response (HTTP 201 Created):**
```json
{
  "id": "e89d14f2-98b3-4f91-8bb2-3df7651a029c",
  "email": "camilo.artista@example.com",
  "first_name": "CAMILO",
  "last_name": "SÁNCHEZ",
  "role": "artista",
  "birth_date": "2003-05-14",
  "artistic_area": "Música",
  "color_palette": "blue",
  "is_active": true,
  "created_at": "2026-11-19T14:05:00Z",
  "privacy_accepted_at": "2026-11-19T14:05:00Z"
}
```
*(Nótese que `hashed_password` está 100% ausente del payload de salida, validado por el Schema `UserResponse`).*

---

## 🗄️ 4. Evidencias de Consultas SQL Internas (PostgreSQL)

```sql
-- 1. Verificación previa de email (User Repository)
SELECT users.id, users.email, users.is_active 
FROM users 
WHERE users.email = 'camilo.artista@example.com';

-- 2. Inserción segura con hash bcrypt (User Repository)
INSERT INTO users (id, email, first_name, last_name, birth_date, artistic_area, hashed_password, role, color_palette, is_active, privacy_accepted_at) 
VALUES ('e89d14f2-98b3-4f91-8bb2-3df7651a029c', 'camilo.artista@example.com', 'CAMILO', 'SÁNCHEZ', '2003-05-14', 'Música', '$2b$12$e8F0...', 'artista', 'blue', true, NOW()) 
RETURNING users.id;

-- 3. Consulta paginada de convocatorias (Convocatoria Repository)
SELECT conv.id_conv, conv.nombre, conv.glue, conv.rango_salarial, conv.id_usr, conv.created_at 
FROM conv 
ORDER BY conv.created_at DESC 
LIMIT 20 OFFSET 0;

-- 4. Conteo de postulantes por convocatoria (Convocatoria Repository)
SELECT count(*) AS count_1 
FROM inscripcion 
WHERE inscripcion.id_conv = 1;
```
