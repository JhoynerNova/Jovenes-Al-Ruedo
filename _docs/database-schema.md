# 🗄️ Esquema de Base de Datos — NN Auth System

**PostgreSQL 17+ | Alembic Migrations**

> Documentación del modelo de datos relacional, tablas, columnas, restricciones, índices y relaciones.

---

## Tabla de Contenidos

- [Modelo Conceptual](#modelo-conceptual)
- [Tabla: users](#tabla-users)
- [Tabla: password_reset_tokens](#tabla-password_reset_tokens)
- [Índices](#índices)
- [Restricciones](#restricciones)
- [Diagramas ER](#diagramas-er)
- [Migraciones](#migraciones)
- [Queries Comunes](#queries-comunes)

---

## Modelo Conceptual

El sistema actual tiene **2 entidades principales**:

```
┌─────────────────────────┐
│        USERS            │
├─────────────────────────┤
│ id (PK)                 │
│ email (UNIQUE)          │
│ full_name               │
│ age                     │
│ artistic_area           │
│ hashed_password         │
│ is_active               │
│ created_at              │
│ updated_at              │
└──────────────┬──────────┘
               │
               │ 1:N
               │
               ▼
┌─────────────────────────────────┐
│ PASSWORD_RESET_TOKENS           │
├─────────────────────────────────┤
│ id (PK)                         │
│ user_id (FK → users)            │
│ token (UNIQUE)                  │
│ expires_at                      │
│ used                            │
│ created_at                      │
└─────────────────────────────────┘
```

**Relación:** Un usuario puede tener múltiples tokens de reset (si solicita recuperación varias veces).

---

## Tabla: users

Almacena los datos de los jóvenes artistas registrados en la plataforma.

### Estructura

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    artistic_area VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### Columnas Detalladas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único universal (no secuencial) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | Email del usuario — identificador de login |
| `full_name` | VARCHAR(255) | NOT NULL | Nombre completo del artista |
| `age` | INTEGER | NOT NULL | Edad — validación ≥ 18 años en aplicación |
| `artistic_area` | VARCHAR(100) | NOT NULL | Disciplina artística (Música, Fotografía, etc.) |
| `hashed_password` | VARCHAR(255) | NOT NULL | Hash bcrypt de la contraseña — nunca texto plano |
| `is_active` | BOOLEAN | DEFAULT TRUE, NOT NULL | Indicador de cuenta activa/desactivada |
| `created_at` | TIMESTAMP TZ | DEFAULT now(), NOT NULL | Fecha de creación (UTC) |
| `updated_at` | TIMESTAMP TZ | DEFAULT now(), NOT NULL | Última actualización |

### Ejemplos de Inserciones

```sql
-- Inserción válida
INSERT INTO users (email, full_name, age, artistic_area, hashed_password)
VALUES (
  'carlos@example.com',
  'Carlos Guevara',
  24,
  'Música Electrónica',
  '$2b$12$Z8o8j5K2L9p3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4'  -- bcrypt hash
);

-- Resultado: Usuario créado con is_active=true, created_at=ahora
SELECT * FROM users WHERE email = 'carlos@example.com';
```

### Restricciones de Integridad

```sql
-- ¿Por qué UNIQUE en email?
-- Si dos usuarios tuvieran el mismo email, no sabríamos cuál es cuál en el login.

-- ¿Por qué UUID?
-- Mejor que autoincrement para seguridad (no revela cuántos usuarios hay).

-- ¿Por qué hashed_password VARCHAR(255)?
-- bcrypt produce ~60 caracteres, pero 255 da margen para algoritmos futuros.

-- ¿Por qué is_active BOOLEAN?
-- Permite "soft delete" — desactivar usuario sin borrar datos históricos.
```

---

## Tabla: password_reset_tokens

Almacena tokens temporales y de un solo uso para recuperación de contraseña.

### Estructura

```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
```

### Columnas Detalladas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único del registro |
| `user_id` | UUID | FK → users.id, NOT NULL, ON DELETE CASCADE | Usuario que solicita reset |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | Token UUID para validar reset (irrepetible) |
| `expires_at` | TIMESTAMP TZ | NOT NULL | Cuándo expira este token (típicamente NOW() + 1 hora) |
| `used` | BOOLEAN | DEFAULT FALSE, NOT NULL | Flag de un solo uso — previene reutilización |
| `created_at` | TIMESTAMP TZ | DEFAULT now(), NOT NULL | Cuándo se generó el token |

### Ejemplos de Inserciones

```sql
-- 1. Usuario solicit forgot password
INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
VALUES (
  'uuid-del-usuario',
  '550e8400-e29b-41d4-a716-446655440000',
  NOW() + INTERVAL '1 hour',
  FALSE
);

-- 2. Usuario hace clic en email, entra token en request
SELECT * FROM password_reset_tokens
WHERE token = '550e8400-e29b-41d4-a716-446655440000'
  AND expires_at > NOW()
  AND used = FALSE;
-- Result: Retorna el registro si es válido

-- 3. Backend valida y resetea contraseña
UPDATE password_reset_tokens
SET used = TRUE
WHERE token = '550e8400-e29b-41d4-a716-446655440000';

UPDATE users
SET hashed_password = '<nuevo hash>', updated_at = NOW()
WHERE id = 'uuid-del-usuario';

-- Ahora el token está marcado como usado — no se puede usar nuevamente
```

### ¿Por qué ON DELETE CASCADE?

```sql
-- Si se borra un usuario:
DELETE FROM users WHERE id = 'uuid-del-usuario';

-- Automáticamente se borran sus tokens de reset (gracias a ON DELETE CASCADE)
-- Esto evita consistencia referencial rota en la BD.

-- Sin CASCADE, obtendríamos error:
-- "FOREIGN KEY violation: cannot delete user with active reset tokens"
```

---

## Índices

Los índices aceleren las búsquedas frecuentes:

| Índice | Tabla | Columna(s) | Propósito | Impacto |
|--------|-------|-----------|----------|--------|
| PK: `id` | users | id | PRIMARY KEY | Búsquedas clave primaria |
| UNIQUE: `email` | users | email | Evitar duplicados | Búsqueda rápida en login |
| IDX: `idx_users_email` | users | email | Acelerar queries por email | LOGIN es la operación más frecuente |
| PK: `id` | password_reset_tokens | id | PRIMARY KEY | Búsquedas clave primaria |
| FK: `user_id` | password_reset_tokens | user_id | Relación con users | Búsquedas "tokens de este usuario" |
| IDX: `idx_password_reset_tokens_token` | password_reset_tokens | token | Acelerar búsqueda por token | RESET PASSWORD necesita encontrar token rápido |

### Tamaño de Índices en Memoria

```
idx_users_email: ~8 MB por cada 1 millón de usuarios
idx_password_reset_tokens_token: ~1 MB por cada 1 millón de tokens
```

---

## Restricciones

### Primary Keys (PK)

Garantizan unicidad e identificación:

```sql
-- Tabla users
ALTER TABLE users ADD PRIMARY KEY (id);
-- Result: Cada user.id es único

-- Tabla password_reset_tokens
ALTER TABLE password_reset_tokens ADD PRIMARY KEY (id);
-- Result: Cada token tiene un ID único
```

### Foreign Keys (FK)

Garantizan integridad referencial:

```sql
-- password_reset_tokens.user_id debe existir en users.id
ALTER TABLE password_reset_tokens
ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

-- Si intento insertar un token con user_id que no existe:
INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
VALUES ('user-no-existente', '...', NOW() + INTERVAL '1 hour', FALSE);
-- Error: Violación de FK
```

### UNIQUE Constraints

Evitan valor duplicados:

```sql
-- Email único
ALTER TABLE users ADD CONSTRAINT uq_email UNIQUE (email);

-- Si intento registrar dos usuarios con el mismo email:
INSERT INTO users (email, full_name, age, artistic_area, hashed_password)
VALUES ('test@example.com', 'User 1', 18, 'Art', 'hash1');

INSERT INTO users (email, full_name, age, artistic_area, hashed_password)
VALUES ('test@example.com', 'User 2', 21, 'Art', 'hash2');
-- Error: Unique violation on email
```

### NOT NULL Constraints

Columnas obligatorias:

```sql
-- Si intento insertar usuario sin email:
INSERT INTO users (full_name, age, artistic_area, hashed_password)
VALUES ('John Doe', 25, 'Music', 'hash');
-- Error: email must not be null
```

---

## Diagramas ER

### Diagrama Entidad-Relación (ER)

```
┌────────────────────────────────────┐
│            USERS                   │
├────────────────────────────────────┤
│ id (UUID, PK) ◄─────────────────┐  │
│ email (VARCHAR, UNIQUE)          │  │
│ full_name (VARCHAR)              │  │
│ age (INTEGER)                    │  │
│ artistic_area (VARCHAR)          │  │
│ hashed_password (VARCHAR)        │  │
│ is_active (BOOLEAN)              │  │
│ created_at (TIMESTAMP)           │  │
│ updated_at (TIMESTAMP)           │  │
└────────────────────────────────────┘  │
                                        │
                                        │ 1
                                        │
                                        │ N
┌────────────────────────────────────┐  │
│ PASSWORD_RESET_TOKENS             │  │
├────────────────────────────────────┤  │
│ id (UUID, PK)                      │  │
│ user_id (UUID, FK) ────────────────┘  │
│ token (VARCHAR, UNIQUE)            │  │
│ expires_at (TIMESTAMP)             │  │
│ used (BOOLEAN)                     │  │
│ created_at (TIMESTAMP)             │  │
└────────────────────────────────────┘

Relación: 1:N
- 1 Usuario → 0..N Tokens de Reset
- Ejemplos:
  • Usuario solicita forgot password 3 veces → 3 registros
  • Usuario nunca olvida password → 0 registros
```

---

## Migraciones

Las migraciones son versionadas y automatizadas con Alembic.

### Listar Migraciones Aplicadas

```bash
cd be
source .venv/bin/activate
alembic current
# Output: <fecha>_<nombre_migracion>

alembic history
# Output:
# <Rev B> | <Rev A> | 2026-02-20 14:00 | Create users and password_reset...
# <Rev A> | <base>  | 2026-02-10 10:00 | Initial migration
```

### Aplicar/Revertir Migraciones

```bash
# Aplicar todas las pendientes
alembic upgrade head

# Revertir a una versión anterior
alembic downgrade -1

# Revertir todo
alembic downgrade base

# Crear nueva migración
alembic revision --autogenerate -m "Add theme preference to users"
```

### Archivo de Migración Ejemplo

```python
# alembic/versions/ab3d782f3aa0_add_age_and_artistic_area_to_users.py

from alembic import op
import sqlalchemy as sa

revision = 'ab3d782f3aa0'
down_revision = 'a7c03fd8169f'

def upgrade() -> None:
    # Agregar columnas nuevas
    op.add_column('users',
        sa.Column('age', sa.Integer(), nullable=False, server_default='18')
    )
    op.add_column('users',
        sa.Column('artistic_area', sa.String(length=100), nullable=False, server_default='General')
    )

def downgrade() -> None:
    # Revertir cambios
    op.drop_column('users', 'artistic_area')
    op.drop_column('users', 'age')
```

---

## Queries Comunes

### Búsqueda de Usuario por Email

```sql
-- Búsqueda rápida (usa índice)
SELECT * FROM users WHERE email = 'carlos@example.com';

-- Result:
-- id | email | full_name | age | artistic_area | hashed_password | is_active | created_at | updated_at
-- uuid | carlos@example.com | Carlos Guevara | 24 | Música Electrónica | $2b$12$... | true | 2026-02-20 10:30 | 2026-02-20 10:30
```

### Verificar Existencia de Usuario

```sql
-- Ideal para validación de duplicados
SELECT COUNT(*) FROM users WHERE email = 'test@example.com';

-- Result: 0 (no existe) o 1 (ya existe)
```

### Contar Usuarios Activos

```sql
SELECT COUNT(*) as total_usuarios_activos
FROM users
WHERE is_active = TRUE;
```

### Buscar Tokens de Reset Válidos

```sql
-- Tokens no expirados y no usados para un usuario
SELECT * FROM password_reset_tokens
WHERE user_id = 'uuid-usuario'
  AND expires_at > NOW()
  AND used = FALSE
ORDER BY created_at DESC
LIMIT 1;

-- Useful para validar enlace de reset recibido en email
```

### Limpiar Tokens Expirados

```sql
-- Borra tokens que ya están vencidos (limpieza manual)
DELETE FROM password_reset_tokens
WHERE expires_at < NOW();

-- Nota: En producción, podría ser un CRON job automatizado
```

### Obtener Estadísticas de la Plataforma

```sql
-- Usuarios registrados por mes
SELECT DATE_TRUNC('month', created_at) as mes, COUNT(*) as nuevos_usuarios
FROM users
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- Resultado: Gráfica de crecimiento

-- Usuarios activos vs inactivos
SELECT is_active, COUNT(*) as count
FROM users
GROUP BY is_active;

-- Result:
-- is_active | count
-- true      | 1250
-- false     |   45
```

### Auditoría: Cambios Recientes

```sql
-- Usuarios que cambiaron contraseña recientemente (updated_at distinto a created_at)
SELECT id, email, updated_at
FROM users
WHERE updated_at > created_at
ORDER BY updated_at DESC
LIMIT 10;
```

---

## Rendimiento y Optimización

### Consultas Lentas a Evitar

```sql
-- ❌ LENTO — Full table scan (sin índice)
SELECT * FROM users WHERE full_name = 'Carlos';
-- Result: Scans 10,000 usuarios → Lento

-- ✅ RÁPIDO — Con índice
SELECT * FROM users WHERE email = 'carlos@example.com';
-- Result: Busca directa en índice → Rápido
```

### Estrategias de Optimización

| Estrategia | Implementación | Impacto |
|-----------|---|---|
| **Índices** | CREATE INDEX en email, user_id | 100x más rápido en búsquedas |
| **Connection Pooling** | SQLAlchemy pool_size=20 | Menos overhead de conexión |
| **Caching** | Redis para tokens activos | Evita queries a BD |
| **Pagination** | LIMIT + OFFSET en listados | Menos datos en red |
| **Denormalization** | Copiar datos frecuentes | Trade-off: Espacio vs velocidad |

---

## Backup y Recuperación

### Backup Manual

```bash
# Crear dump SQL
pg_dump -U nn_user -d nn_auth_db -h localhost -F c -f backup.dump

# Restaurar dump
pg_restore -U nn_user -d nn_auth_db -h localhost backup.dump
```

### Backup Automático (Producción)

```bash
# Cron job diario
0 2 * * * /usr/bin/pg_dump -U nn_user -d nn_auth_db | gzip > /backups/nn_auth_db_$(date +\%Y\%m\%d).sql.gz
```

---

## Próximos Pasos

### Expansión Futura

La BD actual soporta autenticación. Para expandir a "Jóvenes al Ruedo":

```sql
-- Tabla de portafolios
CREATE TABLE portfolios (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP,
    ...
);

-- Tabla de habilidades
CREATE TABLE skills (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(100),
    ...
);

-- Tabla de relación portfolio-skills
CREATE TABLE portfolio_skills (
    portfolio_id UUID REFERENCES portfolios(id),
    skill_id UUID REFERENCES skills(id),
    PRIMARY KEY (portfolio_id, skill_id)
);

-- ... Más tablas para empresas, ofertas, postulaciones, mensajes, etc.
```

---

> **Última actualización:** 20 febrero 2026 | **Versión:** 1.0
