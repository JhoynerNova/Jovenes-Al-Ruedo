-- ¿Qué? Script completo de creación de tablas del proyecto Jóvenes al Ruedo.
-- ¿Para qué? Documentar y reproducir el esquema de la BD desde cero.
-- ¿Impacto? Permite crear la BD en cualquier entorno sin depender de Alembic.
-- Proyecto: Jóvenes al Ruedo | SENA Ficha: 3171599
-- Autores: Jhoyner Nova (Scrum Master + BD) | Franky Almario (Arquitecto)

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════
-- Tabla: users
-- ¿Qué? Almacena los usuarios de la plataforma (artistas y empresas).
-- ¿Para qué? Gestionar autenticación y perfiles de usuarios.
-- ¿Impacto? Tabla central — todas las demás tablas referencian a users.
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email            VARCHAR(255) NOT NULL UNIQUE,
    full_name        VARCHAR(255) NOT NULL,
    birth_date       DATE NOT NULL,
    artistic_area    VARCHAR(100) NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ════════════════════════════════════════
-- Tabla: password_reset_tokens
-- ¿Qué? Tokens temporales para recuperación de contraseña.
-- ¿Para qué? Permitir restablecer contraseña sin conocer la actual.
-- ¿Impacto? Sin esta tabla, no hay flujo de "olvidé mi contraseña".
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════
-- Tabla: habilidades
-- ¿Qué? Catálogo de habilidades artísticas disponibles en la plataforma.
-- ¿Para qué? Estandarizar las habilidades que los artistas pueden asociar a su perfil.
-- ¿Impacto? Sin catálogo, cada artista escribiría la habilidad diferente (canto/Canto/CANTO).
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS habilidades (
    id_hab  SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE
);

-- ════════════════════════════════════════
-- Tabla: rel_usr_hab
-- ¿Qué? Relación muchos a muchos entre usuarios y habilidades.
-- ¿Para qué? Un artista puede tener múltiples habilidades; una habilidad puede pertenecer a muchos artistas.
-- ¿Impacto? Sin esta tabla, un artista solo podría tener una habilidad.
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rel_usr_hab (
    id_rel  SERIAL PRIMARY KEY,
    id_usr  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_hab  INT  NOT NULL REFERENCES habilidades(id_hab) ON DELETE CASCADE,
    CONSTRAINT uq_usr_hab UNIQUE (id_usr, id_hab)
);

-- ════════════════════════════════════════
-- Tabla: portafolio
-- ¿Qué? Portafolios artísticos de los usuarios.
-- ¿Para qué? Agrupar los archivos del artista en colecciones temáticas.
-- ¿Impacto? Un artista puede tener múltiples portafolios (ej: "Fotografía 2024", "Videos").
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS portafolio (
    id_port    SERIAL PRIMARY KEY,
    nombre     VARCHAR(150) NOT NULL,
    id_usr     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════
-- Tabla: det_portafolio
-- ¿Qué? Archivos individuales dentro de un portafolio.
-- ¿Para qué? Almacenar las URLs/rutas de los archivos del artista.
-- ¿Impacto? estado G=Guardado (borrador), P=Publicado (visible para empresas).
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS det_portafolio (
    id_det_p   SERIAL PRIMARY KEY,
    id_port    INT  NOT NULL REFERENCES portafolio(id_port) ON DELETE CASCADE,
    archivo    VARCHAR(255) NOT NULL,
    estado     CHAR(1) NOT NULL DEFAULT 'G' CHECK (estado IN ('G', 'P')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════
-- Tabla: conv
-- ¿Qué? Convocatorias publicadas por empresas buscando talento artístico.
-- ¿Para qué? Centralizar las ofertas de trabajo artístico en la plataforma.
-- ¿Impacto? Es la oferta de empleo — los artistas se inscriben a estas convocatorias.
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conv (
    id_conv    SERIAL PRIMARY KEY,
    nombre     VARCHAR(150) NOT NULL,
    glue       TEXT,
    id_usr     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════
-- Tabla: det_conv
-- ¿Qué? Evaluaciones/observaciones de candidatos en una convocatoria.
-- ¿Para qué? Registrar el feedback de la empresa sobre cada artista evaluado.
-- ¿Impacto? Permite a la empresa llevar un historial de evaluaciones por convocatoria.
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS det_conv (
    id_dc      SERIAL PRIMARY KEY,
    id_conv    INT  NOT NULL REFERENCES conv(id_conv)  ON DELETE CASCADE,
    id_usr     UUID NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    obsr       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════
-- Tabla: inscripcion
-- ¿Qué? Postulaciones de artistas a convocatorias.
-- ¿Para qué? Registrar qué artistas se postularon a qué convocatoria.
-- ¿Impacto? UNIQUE(id_conv, id_usr) previene postulaciones duplicadas.
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inscripcion (
    id_i       SERIAL PRIMARY KEY,
    id_conv    INT  NOT NULL REFERENCES conv(id_conv) ON DELETE CASCADE,
    id_usr     UUID NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_inscripcion UNIQUE (id_conv, id_usr)
);
