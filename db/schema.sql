-- Proyecto: Jóvenes al Ruedo | SENA Ficha: 3171599
-- Autores: Jhoyner Nova (Scrum Master + BD) | Franky Almario (Arquitecto)
--
-- Motor:   PostgreSQL 13+ (usa gen_random_uuid(), nativo desde PG13 — no requiere extensiones)
-- Fuente:  Generado a partir de los modelos SQLAlchemy de be/app/models/ (estado actual).
--          Incluye la tabla `calificaciones`, que NO existe en ninguna migración de Alembic.
--
-- ════════════════════════════════════════
-- PASO 0 (una sola vez, como superusuario `postgres` en el servidor 192.168.56.101):
--   sudo -u postgres psql
--   CREATE ROLE jar_user WITH LOGIN PASSWORD 'jar_password';
--   CREATE DATABASE jovenes_al_ruedo OWNER jar_user ENCODING 'UTF8';
--   \q
--
-- EJECUCIÓN (desde el servidor o desde la máquina local con psql instalado):
--   psql -h 192.168.56.101 -U jar_user -d jovenes_al_ruedo -f db/schema.sql
-- ════════════════════════════════════════

BEGIN;

-- ════════════════════════════════════════
-- Tabla: users
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id               UUID         NOT NULL DEFAULT gen_random_uuid(),
    email            VARCHAR(255) NOT NULL,
    first_name       VARCHAR(255) NOT NULL,
    last_name        VARCHAR(255) NOT NULL,
    birth_date       DATE,
    artistic_area    VARCHAR(100),
    sector           VARCHAR(100),
    bio              TEXT,
    location         VARCHAR(100),
    profile_pic_url  VARCHAR(500),
    cover_pic_url    VARCHAR(500),
    role             VARCHAR(50)  NOT NULL DEFAULT 'artista',
    color_palette    VARCHAR(50),
    hashed_password  VARCHAR(255) NOT NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- ════════════════════════════════════════
-- Tabla: password_reset_tokens
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT password_reset_tokens_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_password_reset_tokens_token ON password_reset_tokens (token);

-- ════════════════════════════════════════
-- Tabla: habilidades
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS habilidades (
    id_hab  SERIAL       NOT NULL,
    nombre  VARCHAR(100) NOT NULL,
    CONSTRAINT habilidades_pkey PRIMARY KEY (id_hab),
    CONSTRAINT habilidades_nombre_key UNIQUE (nombre)
);

-- ════════════════════════════════════════
-- Tabla: rel_usr_hab
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rel_usr_hab (
    id_rel  SERIAL  NOT NULL,
    id_usr  UUID    NOT NULL,
    id_hab  INTEGER NOT NULL,
    CONSTRAINT rel_usr_hab_pkey PRIMARY KEY (id_rel),
    CONSTRAINT uq_usr_hab UNIQUE (id_usr, id_hab),
    CONSTRAINT rel_usr_hab_id_usr_fkey
        FOREIGN KEY (id_usr) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT rel_usr_hab_id_hab_fkey
        FOREIGN KEY (id_hab) REFERENCES habilidades (id_hab) ON DELETE CASCADE
);

-- ════════════════════════════════════════
-- Tabla: portafolio
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS portafolio (
    id_port     SERIAL        NOT NULL,
    nombre      VARCHAR(150)  NOT NULL,
    descripcion VARCHAR(1000),
    visibilidad VARCHAR(20)   NOT NULL DEFAULT 'Publico',
    id_usr      UUID          NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT portafolio_pkey PRIMARY KEY (id_port),
    CONSTRAINT portafolio_id_usr_fkey
        FOREIGN KEY (id_usr) REFERENCES users (id) ON DELETE CASCADE
);

-- ════════════════════════════════════════
-- Tabla: det_portafolio
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS det_portafolio (
    id_det_p    SERIAL        NOT NULL,
    id_port     INTEGER       NOT NULL,
    titulo      VARCHAR(150),
    descripcion VARCHAR(1000),
    portada_url VARCHAR(500),
    etiquetas   VARCHAR(300),
    archivo     VARCHAR(255)  NOT NULL,
    estado      VARCHAR(1)    NOT NULL DEFAULT 'G',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT det_portafolio_pkey PRIMARY KEY (id_det_p),
    CONSTRAINT chk_estado_port CHECK (estado IN ('G', 'P')),
    CONSTRAINT det_portafolio_id_port_fkey
        FOREIGN KEY (id_port) REFERENCES portafolio (id_port) ON DELETE CASCADE
);

-- ════════════════════════════════════════
-- Tabla: conv
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conv (
    id_conv           SERIAL       NOT NULL,
    nombre            VARCHAR(150) NOT NULL,
    glue              TEXT,
    nivel_experiencia VARCHAR(50),
    tipo_jornada      VARCHAR(50),
    rango_salarial    VARCHAR(100),
    ubicacion         VARCHAR(150),
    id_usr            UUID         NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT conv_pkey PRIMARY KEY (id_conv),
    CONSTRAINT conv_id_usr_fkey
        FOREIGN KEY (id_usr) REFERENCES users (id) ON DELETE CASCADE
);

-- ════════════════════════════════════════
-- Tabla: det_conv
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS det_conv (
    id_dc      SERIAL      NOT NULL,
    id_conv    INTEGER     NOT NULL,
    id_usr     UUID        NOT NULL,
    obsr       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT det_conv_pkey PRIMARY KEY (id_dc),
    CONSTRAINT det_conv_id_conv_fkey
        FOREIGN KEY (id_conv) REFERENCES conv (id_conv) ON DELETE CASCADE,
    CONSTRAINT det_conv_id_usr_fkey
        FOREIGN KEY (id_usr) REFERENCES users (id) ON DELETE CASCADE
);

-- ════════════════════════════════════════
-- Tabla: inscripcion
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inscripcion (
    id_i                  SERIAL      NOT NULL,
    id_conv               INTEGER     NOT NULL,
    id_usr                UUID        NOT NULL,
    estado                VARCHAR(50) NOT NULL DEFAULT 'Enviada',
    carta_presentacion    TEXT,
    id_portafolio_interno INTEGER,
    cv_url                VARCHAR(500),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT inscripcion_pkey PRIMARY KEY (id_i),
    CONSTRAINT uq_inscripcion UNIQUE (id_conv, id_usr),
    CONSTRAINT inscripcion_id_conv_fkey
        FOREIGN KEY (id_conv) REFERENCES conv (id_conv) ON DELETE CASCADE,
    CONSTRAINT inscripcion_id_usr_fkey
        FOREIGN KEY (id_usr) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT inscripcion_id_portafolio_interno_fkey
        FOREIGN KEY (id_portafolio_interno) REFERENCES portafolio (id_port) ON DELETE SET NULL
);

-- ════════════════════════════════════════
-- Tabla: conversacion
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conversacion (
    id_conversacion SERIAL      NOT NULL,
    tipo            VARCHAR(20) NOT NULL,
    id_i            INTEGER,
    empresa_id      UUID        NOT NULL,
    artista_id      UUID        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT conversacion_pkey PRIMARY KEY (id_conversacion),
    CONSTRAINT uq_conversacion_inscripcion UNIQUE (id_i),
    CONSTRAINT conversacion_id_i_fkey
        FOREIGN KEY (id_i) REFERENCES inscripcion (id_i) ON DELETE CASCADE,
    CONSTRAINT conversacion_empresa_id_fkey
        FOREIGN KEY (empresa_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT conversacion_artista_id_fkey
        FOREIGN KEY (artista_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ════════════════════════════════════════
-- Tabla: mensaje
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mensaje (
    id_msg          SERIAL      NOT NULL,
    id_conversacion INTEGER     NOT NULL,
    remitente_id    UUID        NOT NULL,
    contenido       TEXT        NOT NULL,
    leido           BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT mensaje_pkey PRIMARY KEY (id_msg),
    CONSTRAINT mensaje_id_conversacion_fkey
        FOREIGN KEY (id_conversacion) REFERENCES conversacion (id_conversacion) ON DELETE CASCADE,
    CONSTRAINT mensaje_remitente_id_fkey
        FOREIGN KEY (remitente_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ════════════════════════════════════════
-- Tabla: calificaciones
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS calificaciones (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    empresa_id      UUID        NOT NULL,
    artista_id      UUID        NOT NULL,
    convocatoria_id INTEGER,
    puntuacion      INTEGER     NOT NULL,
    comentario      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT calificaciones_pkey PRIMARY KEY (id),
    CONSTRAINT calificaciones_empresa_id_fkey
        FOREIGN KEY (empresa_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT calificaciones_artista_id_fkey
        FOREIGN KEY (artista_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT calificaciones_convocatoria_id_fkey
        FOREIGN KEY (convocatoria_id) REFERENCES conv (id_conv) ON DELETE SET NULL
);

-- ════════════════════════════════════════
-- Tabla: alembic_version
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);
DELETE FROM alembic_version;
INSERT INTO alembic_version (version_num) VALUES ('41c33563312e');

COMMIT;
