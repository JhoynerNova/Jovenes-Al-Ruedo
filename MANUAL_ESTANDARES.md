# 📜 Manual de Estándares de Desarrollo y Git — Jóvenes al Ruedo

**Proyecto educativo — SENA, Ficha 3171599 | ADSO 2026**

Este documento establece las políticas de desarrollo, convenciones de nombres, estructura de ramas (Gitflow), estándar de mensajes de commit (Conventional Commits) y flujo de revisión de código (Pull Requests) para el equipo de desarrollo de **Jóvenes al Ruedo**.

---

## 📌 1. Convención de Mensajes de Commit (Conventional Commits)

Todos los desarrolladores deben formatear sus commits de acuerdo con la especificación de **Conventional Commits v1.0.0**:

```text
<tipo>(<ámbito opcional>): <descripción corta en minúsculas y presente imperativo>

[cuerpo opcional explicativo]
```

### Tipos Permitidos:
* `feat:` Nueva característica o funcionalidad del sistema (ej: `feat(auth): agregar validación de cédula para empresas`).
* `fix:` Corrección de un error o bug en el código (ej: `fix(chat): corregir reconexión de WebSockets en fallback`).
* `docs:` Cambios únicamente en la documentación (ej: `docs(readme): actualizar instrucciones de instalación`).
* `style:` Ajustes de formato, espacios o estilos sin afectar la lógica de negocio (ej: `style(dashboard): ajustar margen inferior del botón de postulación`).
* `refactor:` Reescribir código existente sin alterar funcionalidad ni corregir bugs (ej: `refactor(be): optimizar consulta SQLAlchemy de usuarios`).
* `test:` Añadir o modificar pruebas unitarias e integración (ej: `test(be): agregar 39/39 pruebas de pytest para ratings y reportes`).
* `chore:` Tareas de mantenimiento, actualización de dependencias o configuración del build (ej: `chore(deps): actualizar TailwindCSS a v4`).

---

## 🌿 2. Estrategia de Ramificación (Gitflow)

El proyecto utiliza **Gitflow** adaptado a desarrollo continuo:

### Ramas Principales:
* `main`: Contiene el código de producción 100% estable y testeado. Solo recibe descargas mediante Pull Requests desde `develop`.
* `develop`: Rama base de desarrollo continuo donde se integran todas las funcionalidades probadas.

### Ramas de Soporte / Trabajo:
* `feature/<nombre-funcionalidad>`: Para el desarrollo de nuevas características (ej: `feature/login`, `feature/rating-stars`, `feature/export-excel`).
* `bugfix/<nombre-error>`: Para solucionar errores detectados durante el desarrollo o pruebas en `develop`.
* `hotfix/<nombre-incidencia>`: Para solucionar fallos críticos directamente sobre `main` en producción.

---

## 🔍 3. Flujo de Trabajo y Pull Requests (Code Review)

1. **Creación de Rama:** Partir siempre desde la versión actualizada de `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-funcionalidad
   ```
2. **Desarrollo y Commits:** Realizar al menos 3 commits atómicos usando la convención.
3. **Publicación:** Subir la rama a GitHub:
   ```bash
   git push origin feature/nombre-funcionalidad
   ```
4. **Pull Request (PR):**
   * Crear el PR apuntando a `develop` (NUNCA a `main` directamente).
   * Asignar al menos 1 **Reviewer** (Revisor) del equipo.
   * El revisor inspecciona la pestaña *Files changed*, deja comentarios de aprobación y efectúa el *Merge*.

---

## 💻 4. Estándares de Código

* **Backend (Python / FastAPI):**
  * Cumplimiento con PEP 8.
  * Tipado estático con anotaciones de tipo (`typing`).
  * Validación de esquemas con Pydantic.
* **Frontend (React 19 / TypeScript):**
  * Componentes funcionales con TypeScript estricto.
  * Estilos mediante clases de utilidad TailwindCSS 4.
  * Iconografía estandarizada con `lucide-react`.

---

*Manual oficial de trabajo colaborativo para el proyecto Jóvenes al Ruedo (SENA - Ficha 3171599).*
