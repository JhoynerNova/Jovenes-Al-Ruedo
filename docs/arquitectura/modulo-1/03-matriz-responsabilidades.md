# 🏛️ 03 — Matriz de Separación de Responsabilidades y Justificación Arquitectónica

> **Proyecto:** Jóvenes al Ruedo — Web & API  
> **Ficha SENA:** 3171599 (ADSO) | **Fecha:** 2026-11-19  
> **Autores:** Jhoyner Nova & Franky Almario  
> **Evaluación:** Estado Post-Refactorización (Clean Architecture / Capas Desacopladas)

---

## 📊 Matriz de Evaluación de Responsabilidades

| Componente Lógico | Archivo Real en el Repositorio | Responsabilidad Efectiva en Jóvenes al Ruedo | Qué NO Asume (Frontera Respetada) | Calificación Técnica |
|---|---|---|---|---|
| **1. Interfaz de Usuario** | `fe/src/pages/ExplorePage.tsx`<br>`fe/src/pages/RegisterPage.tsx`<br>`fe/src/components/ui/` | Captura eventos del usuario, renderiza vistas y presenta errores visuales (toasts / alertas). | No toma decisiones de negocio, no calcula hash de claves ni genera identificadores. | **Correcta** |
| **2. Router / Entrada HTTP** | `be/app/routers/convocatorias.py`<br>`be/app/routers/auth.py` | Declara rutas HTTP (`/api/v1/...`), verbos (`GET`, `POST`), códigos de estado (`200`, `201`, `204`) e inyección de dependencias (`get_db`, `get_current_user`). | No ejecuta sentencias SQL directas, no calcula paginación compleja ni manipula transacciones. | **Correcta** (Antes: *Mezclada*) |
| **3. Middleware** | `be/app/main.py` (`add_security_headers`)<br>`be/app/core/limiter.py` | Aplica políticas transversales: CORS estricto, headers de seguridad OWASP (HSTS, CSP, X-Frame) y rate limit (5 req/min). | No orquesta flujos de negocio ni accede directamente a entidades de base de datos. | **Correcta** |
| **4. Controller** | Routers decorados en FastAPI (`be/app/routers/`) | Adapta las peticiones HTTP entrantes, valida DTOs mediante Pydantic y mapea la respuesta de los servicios a JSON. | No contiene lógica de negocio pesada ni sentencias de persistencia SQLAlchemy. | **Correcta** (Antes: *Mezclada*) |
| **5. Service / Use Case** | `be/app/services/convocatoria_service.py`<br>`be/app/services/auth_service.py` | Coordina las reglas de aplicación: validación de duplicidad, cálculo de rangos de edad, asignación de paletas y orquestación de notificaciones. | No depende del protocolo HTTP (sin `Request`/`Response`) ni ejecuta SQL crudo. | **Correcta** (Antes: *Inexistente en Convocatorias*) |
| **6. Domain / Schemas** | `be/app/schemas/conv.py` (`ConvResponse`)<br>`be/app/schemas/user.py` (`UserCreate`, `UserResponse`) | Define los contratos de datos (DTOs), reglas de invariancia sintáctica (regex de password, rangos numéricos) y filtra datos sensibles de salida. | No conoce detalles de la base de datos ni de las rutas HTTP. | **Correcta** |
| **7. Repository / Adapter** | `be/app/repositories/convocatoria_repository.py`<br>`be/app/repositories/user_repository.py` | Encapsula todas las operaciones de acceso a datos (`select`, `add`, `commit`, `refresh`, `delete`) sobre los modelos ORM de SQLAlchemy. | No decide políticas de negocio, ni reglas de autorización de usuarios. | **Correcta** (Antes: *Inexistente*) |
| **8. Base de datos / Models** | `be/app/models/conv.py` (`Conv`, `Inscripcion`)<br>`be/app/models/user.py` (`User`)<br>PostgreSQL 17 | Define el esquema relacional, tipos de columnas, restricciones de integridad (`UNIQUE`, `CHECK`, `NOT NULL`) y relaciones foráneas en motor de BD. | No sustituye las reglas de aplicación ni la validación de contratos del cliente. | **Correcta** |

---

## ⚖️ Justificaciones Técnicas Obligatorias

### 1. Desacoplamiento de Controller y Service en Convocatorias
- **Situación Inicial (Mezclada):** En la versión original de `be/app/routers/convocatorias.py`, la función `list_convocatorias()` ejecutaba sentencias SQL en línea (`stmt = select(Conv)`, `db.execute()`, `db.commit()`) y calculaba la paginación dentro del mismo bloque HTTP. Esto generaba un fuerte acoplamiento entre el framework web y la persistencia relacional.
- **Solución Implementada:** Se introdujo `ConvocatoriaService` (`be/app/services/convocatoria_service.py`). El router se redujo a 5 líneas por endpoint encargándose únicamente del enrutamiento HTTP y delegando la totalidad de la lógica al servicio. Esto permite testear la lógica de convocatorias de forma unitaria sin necesidad de levantar el servidor web.

### 2. Creación de la Capa de Repositorios (`be/app/repositories/`)
- **Situación Inicial (Mezclada):** Las operaciones de base de datos (`db.add()`, `db.commit()`, `db.execute(select(...))`) estaban dispersas entre servicios y routers. No existía una capa de abstracción sobre SQLAlchemy.
- **Solución Implementada:** Se crearon `ConvocatoriaRepository` y `UserRepository`. Toda consulta a PostgreSQL pasa obligatoriamente por estos repositorios. De esta forma, si el modelo de datos cambia o se decide migrar a consultas optimizadas, los servicios y routers no sufren modificaciones.

### 3. Diferenciación Arquitectónica: Schemas (Pydantic) vs. Models (SQLAlchemy)
- **Schemas (`be/app/schemas/`):** Actúan como **Data Transfer Objects (DTO)**. Su ciclo de vida ocurre en la frontera de la aplicación: validan que la carga útil entrante cumpla con las reglas estructurales (ej: `UserCreate` asegura que el aspirante tenga entre 18 y 28 años) y que la salida hacia el cliente no filtre campos peligrosos (ej: `UserResponse` excluye `hashed_password`).
- **Models (`be/app/models/`):** Son las **Entidades de Dominio Persistente** mapeadas al motor relacional PostgreSQL mediante SQLAlchemy. Su responsabilidad es la integridad en almacenamiento: llaves primarias UUID, llaves foráneas con borrado en cascada (`ON DELETE CASCADE`) e índices de unicidad.
- **Conclusión:** Ambos componentes conviven armónicamente sin violar la arquitectura limpia porque operan en diferentes lados de la frontera arquitectónica.
