# 📋 01 — Matriz Funcional de las Dos Operaciones Clave

> **Proyecto:** Jóvenes al Ruedo — Web & API  
> **Ficha SENA:** 3171599 (ADSO) | **Fecha:** 2026-11-19  
> **Autores:** Jhoyner Nova & Franky Almario  
> **Línea Base Refactorizada:** Rama `main` (FastAPI 0.115+, PostgreSQL 17, React 19)

---

## 📌 Matriz Comparativa: Consulta vs. Escritura

| Elemento / Dimensión | Operación de Consulta (Lectura) | Operación de Escritura (Creación) |
|---|---|---|
| **Nombre de la funcionalidad** | Listado público de convocatorias con filtros y paginación | Registro de nuevo usuario (Joven Artista de 18 a 28 años) |
| **Endpoint HTTP y Método** | `GET /api/v1/convocatorias/` | `POST /api/v1/auth/register` |
| **Actor que la ejecuta** | Usuario anónimo (visitante), Artista o Empresa | Joven Aspirante a Artista (18 a 28 años) |
| **Resultado esperado** | JSON estructurado con listado de ofertas activas, empresa oferente, total de inscritos en vivo y metadatos de paginación (`HTTP 200 OK`). | Persistencia de la nueva cuenta en PostgreSQL con contraseña encriptada (`bcrypt`), fecha de consentimiento de privacidad y paleta asignada (`HTTP 201 Created`). |
| **Componente de Entrada (Router)** | `be/app/routers/convocatorias.py` (Línea 28, función `list_convocatorias`) | `be/app/routers/auth.py` (Línea 75, función `register`) |
| **Capa de Negocio (Service)** | `be/app/services/convocatoria_service.py` (Línea 52, función `list_convocatorias` y Línea 34, `to_dto`) | `be/app/services/auth_service.py` (Línea 40, función `register_user`) |
| **Capa de Persistencia (Repository)** | `be/app/repositories/convocatoria_repository.py` (Línea 25, `list_paginated` y Línea 43, `count_inscritos`) | `be/app/repositories/user_repository.py` (Línea 23, `get_by_email` y Línea 29, `create`) |
| **Esquemas de Validación (DTOs / Pydantic)** | • **Entrada:** Query params validados por FastAPI (`skip`, `limit`, `search`).<br>• **Salida:** `ConvResponse` (`be/app/schemas/conv.py`, Línea 51) dentro de diccionario paginado. | • **Entrada:** `UserCreate` (`be/app/schemas/user.py`, Línea 26) que valida edad (18-28), contraseña segura y términos.<br>• **Salida:** `UserResponse` (`be/app/schemas/user.py`, Línea 287) que omite `hashed_password`. |
| **Datos de Entrada** | Query params: `skip` (int $\ge 0$), `limit` (int $1..100$, default 20), `search` (str opcional). | Body JSON: `email`, `password`, `first_name`, `last_name`, `role='artista'`, `birth_date`, `artistic_area`, `accepted_terms=true`. |
| **Datos de Salida** | JSON: `{"items": [ConvResponse], "total": int, "page": int, "size": int, "pages": int}` | JSON `UserResponse`: `{"id": UUID, "email": str, "first_name": str, "last_name": str, "role": "artista", "color_palette": str, "is_active": true, ...}` |
| **Modelos ORM de Entidad (SQLAlchemy)** | • `Conv` (`be/app/models/conv.py`, Línea 12)<br>• `Inscripcion` (`be/app/models/conv.py`, Línea 61)<br>• `User` (`be/app/models/user.py`, Línea 21) | • `User` (`be/app/models/user.py`, Línea 21) |
| **Tablas Consultadas** | 1. `conv` (Convocatorias registradas)<br>2. `users` (Empresa publicadora vía relación ORM)<br>3. `inscripcion` (Conteo de aspirantes postulados) | 1. `users` (Consulta de verificación de unicidad por email) |
| **Tablas Modificadas** | **Ninguna**. Es una operación idempotente y pura de lectura sin efectos colaterales persistentes. | 1. `users` (Inserción de nuevo registro con UUID v4 autogenerado) |
| **Reglas de Negocio Aplicadas** | • Paginación estricta (`limit` máximo 100).<br>• Búsqueda insensible a mayúsculas/minúsculas (`ILIKE`).<br>• Conteo dinámico de postulantes en vivo por oferta. | • Validación de edad: estrictamente entre 18 y 28 años cumplidos.<br>• Complejidad de contraseña: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un dígito numérico.<br>• Habeas Data (Ley 1581/2012): `accepted_terms=True` obligatorio con registro de timestamp en `privacy_accepted_at`.<br>• Unicidad: el email no puede existir previamente en la base de datos.<br>• Asignación automática de paleta visual según disciplina artística (`música` $\rightarrow$ `blue`, `danza` $\rightarrow$ `purple`, etc.). |
| **Manejo de Códigos de Error** | • `422 Unprocessable Entity`: Parámetros de paginación inválidos (`skip < 0` o `limit > 100`).<br>• `500 Internal Server Error`: Fallo de conexión o indisponibilidad del motor PostgreSQL. | • `400 Bad Request`: El email ya se encuentra registrado en el sistema.<br>• `422 Unprocessable Entity`: Violación de invariante DTO (edad fuera de rango, contraseña débil, términos no aceptados).<br>• `429 Too Many Requests`: Exceso de peticiones en rate limiter (máximo 5 peticiones/minuto por IP). |
