# Base de Datos — Jóvenes al Ruedo

Proyecto: Jóvenes al Ruedo | SENA Ficha: 3171599
Autores: Jhoyner Nova (Scrum Master + BD) | Franky Almario (Arquitecto)

## Tecnología

- **Motor**: PostgreSQL 17 (Alpine)
- **ORM**: SQLAlchemy 2.0 con Alembic para migraciones
- **Contenedor**: Docker (`jovenes_al_ruedo_db`)

## Cómo conectarse a la base de datos

La base de datos corre en Docker. Para levantarla:

```bash
# Desde la raíz del proyecto
docker compose up -d

# Conectarse via psql
docker exec -it jovenes_al_ruedo_db psql -U jar_user -d jovenes_al_ruedo

# Ejecutar un script SQL
docker exec -i jovenes_al_ruedo_db psql -U jar_user -d jovenes_al_ruedo < db/schema.sql
docker exec -i jovenes_al_ruedo_db psql -U jar_user -d jovenes_al_ruedo < db/seed.sql
```

## Credenciales (solo desarrollo local)

| Parámetro | Valor |
|-----------|-------|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `jovenes_al_ruedo` |
| Usuario | `jar_user` |
| Contraseña | `jar_password` |

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios de la plataforma (artistas y empresas) |
| `password_reset_tokens` | Tokens temporales para recuperación de contraseña |
| `habilidades` | Catálogo de habilidades artísticas |
| `rel_usr_hab` | Relación muchos a muchos: usuarios ↔ habilidades |
| `portafolio` | Portafolios artísticos de los usuarios |
| `det_portafolio` | Archivos dentro de cada portafolio |
| `conv` | Convocatorias publicadas por empresas |
| `det_conv` | Evaluaciones de candidatos en convocatorias |
| `inscripcion` | Postulaciones de artistas a convocatorias |

## Archivos

- `schema.sql` — Script de creación de todas las tablas
- `seed.sql` — Datos de prueba (20 usuarios + portafolios + convocatorias)
- `queries.sql` — Consultas útiles de referencia
