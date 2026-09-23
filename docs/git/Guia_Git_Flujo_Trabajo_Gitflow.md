# 📘 Guía de Configuración de Git, Flujo de Trabajo Colaborativo y Gitflow

**Proyecto Formativo:** Jóvenes al Ruedo — Web & API  
**Programa de Formación:** Análisis y Desarrollo de Software (ADSO)  
**Número de Ficha:** 3171599  
**Entidad:** Servicio Nacional de Aprendizaje (SENA) — 2026  
**Líder de Repositorio:** Jhoyner Nova  
**Repositorio Oficial GitHub:** [https://github.com/JhoynerNova/Jovenes-Al-Ruedo](https://github.com/JhoynerNova/Jovenes-Al-Ruedo)  

---

## 📄 PORTADA

| Campo | Detalles |
|---|---|
| **Nombre del Proyecto** | Jóvenes al Ruedo — Plataforma de empleo y visualización de talento artístico |
| **Programa de Formación** | Tecnólogo en Análisis y Desarrollo de Software (ADSO) |
| **Ficha de Caracterización** | 3171599 |
| **Integrantes del Equipo** | Jhoyner Nova (Líder del Repositorio / Admin), Equipo de Desarrollo |
| **Repositorio Remoto** | `https://github.com/JhoynerNova/Jovenes-Al-Ruedo` |
| **Documento Entregable** | `Guia_Git_GrupoX.pdf` / `Guia_Git_Flujo_Trabajo_Gitflow.md` |

---

## 🎯 1. Conceptos Clave

A continuación se presentan los conceptos fundamentales del control de versiones distribuido y la gestión colaborativa con Git/GitHub:

| Concepto | Definición | Elemento Clave / Comando |
|---|---|---|
| **Control de Versiones (Git)** | Sistema distribuido para registrar cambios en el código fuente a lo largo del tiempo, permitiendo revertir estados y auditar autoría. | `git init`, `git clone` |
| **Configuración Global** | Identificación oficial del autor (nombre y correo) asociada a cada commit grabado en el repositorio. | `git config --global user.name` / `user.email` |
| **Estados de Archivo** | Ciclo de vida de los archivos en Git: no rastreado (*Untracked*), preparado (*Staged*) y confirmado (*Committed*). | `git status`, `git add` |
| **Commits y Convención** | Snapshots inmutables del estado del código. Deben seguir el estándar **Conventional Commits** (`feat:`, `fix:`, `docs:`, `style:`). | `git commit -m "feat: agregar login"` |
| **Ramas (Branches)** | Líneas de desarrollo independientes diseñadas para construir funcionalidades sin alterar el código estable. | `git branch`, `git checkout -b` / `git switch -c` |
| **Estrategia Gitflow** | Metodología de ramificación estructurada mediante ramas permanentes (`main`, `develop`) y temporales (`feature/`, `bugfix/`, `release/`). | Nomenclatura normalizada de ramas |
| **Repositorio Remoto** | Servidor centralizado en la nube (GitHub) donde se sincroniza el trabajo colaborativo del equipo. | `git remote add origin`, `git push`, `git pull` |
| **Pull Request (PR) & Code Review** | Solicitud formal de integración de código entre ramas que requiere revisión y aprobación por parte de un par (*Reviewer*). | Interfaz Web de GitHub / *Merge PR* |
| **Resolución de Conflictos** | Proceso manual de conciliación cuando dos desarrolladores modifican las mismas líneas en distintas ramas. | Edición manual de etiquetas de conflicto + commit |

---

## 🗂️ 2. Organización Estándar del Repositorio de Software

La raíz del repositorio **Jóvenes al Ruedo** sigue la estructura estándar recomendada para garantizar la seguridad, mantenibilidad y modularidad:

```text
Jovenes-Al-Ruedo/
├── .gitignore               # Exclusión estricta de archivos sensibles y pesados
├── README.md                # Documentación principal del proyecto y setup
├── MANUAL_ESTANDARES.md     # Estándares de desarrollo, Gitflow y Conventional Commits
├── docker-compose.yml       # Orquestación de base de datos PostgreSQL y servicios
├── tablero_trello.txt       # Mapeo y estado del backlog en Trello
├── generate_all_docs.py     # Script de consolidación de documentación técnica
├── be/                      # Backend (FastAPI, SQLAlchemy, Alembic, Pytest)
├── fe/                      # Frontend (React 19, TypeScript, Vite 7, TailwindCSS 4)
├── db/                      # Scripts y esquemas de base de datos PostgreSQL
└── docs/                    # Documentación técnica, HUs, RFs, guías de alistamiento
```

### Reglas Fundamentales de Organización:
1. **Exclusión de Archivos Sensibles (`.gitignore`):** Es obligatorio omitir entornos virtuales (`.venv/`), dependencias pesadas (`node_modules/`), credenciales o variables de entorno (`.env`), y carpetas de build (`dist/`, `build/`).
2. **Documentación Base (`README.md` & `MANUAL_ESTANDARES.md`):** Describe la arquitectura del proyecto, stack tecnológico, guías de ejecución local, y las reglas estrictas para contribución de código.
3. **Separación de Capas:** El código fuente se divide claramente entre la capa de servidor backend (`be/`) y la capa de cliente frontend (`fe/`).

---

## ⚙️ 3. Pasos Desarrollados y Flujo Ejecutado

### Paso 1: Configuración Inicial del Repositorio (Líder del Equipo)
1. **Inicialización y Rama Principal:** Se inicializó el repositorio con la rama primaria denominada `main`.
2. **Archivos Base:** Se crearon los archivos `.gitignore` (para Python, Node.js y Docker), `README.md` y `MANUAL_ESTANDARES.md`.
3. **Commit Inicial:** Se ejecutó el commit base con la convención estándar:
   ```bash
   git add .
   git commit -m "feat: estructura inicial del proyecto Jóvenes al Ruedo"
   ```
4. **Vincular GitHub & Crear Rama Develop:**
   ```bash
   git remote add origin https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git
   git push -u origin main
   git checkout -b develop
   git push -u origin develop
   ```
5. **Configuración de Colaboradores:** En la sección **Settings ➔ Collaborators** del repositorio en GitHub, el líder invitó a los desarrolladores asignando permisos de escritura.

---

### Paso 2: Clonado y Creación de Ramas de Trabajo (Desarrolladores)
1. **Clonado del Repositorio:**
   ```bash
   git clone https://github.com/JhoynerNova/Jovenes-Al-Ruedo.git
   cd Jovenes-Al-Ruedo
   ```
2. **Configuración de Identidad Local:**
   ```bash
   git config user.name "Nombre Desarrollador"
   git config user.email "correo@ejemplo.com"
   ```
3. **Creación de Rama de Trabajo desde `develop`:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/login
   ```

---

### Paso 3: Desarrollo, Commits y Sincronización
Durante la construcción del componente assigned (`feature/login`, `feature/registro`, `feature/ui-header`, etc.), se realizaron commits incrementales siguiendo **Conventional Commits**:

```bash
# Ejemplo de commits realizados:
git commit -m "feat(auth): implementar formulario de autenticación con TypeScript"
git commit -m "style(auth): aplicar clases de TailwindCSS 4 en pantalla de login"
git commit -m "fix(auth): corregir deshabilitación de botón submit al enviar datos"
git commit -m "docs(auth): documentar esquema de autenticación en README"
```

Posteriormente, se publicó la rama en GitHub:
```bash
git push origin feature/login
```

---

### Paso 4: Pull Request (PR) y Code Review
1. **Creación del Pull Request:** En GitHub, se abrió el PR solicitando fusionar `feature/login` hacia `develop` (nunca directo a `main`).
2. **Asignación de Revisor:** Se asignó a un compañero del equipo como **Reviewer**.
3. **Code Review & Merge:** El revisor inspeccionó los cambios en *Files changed*, verificó que las 39/39 pruebas de `pytest` y validaciones pasaran, aprobó el PR y efectuó el **Merge pull request** hacia `develop`.

---

### Paso 5: Sincronización Final y Merge a Main
1. **Sincronización Local:** Todos los integrantes actualizaron su rama `develop` local:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Release a Producción:** Una vez integradas y verificadas todas las funcionalidades en `develop`, el Líder del Equipo creó el PR final `develop` ➔ `main` para publicar la versión 1.0 estable del sistema.

---

## 📷 4. Lista de Chequeo y Anexo de Evidencias (GitHub)

Las evidencias de la ejecución se verifican directamente en la plataforma **GitHub** bajo la siguiente estructura:

### 📸 Captura 1: Estructura Raíz del Repositorio
* **Ubicación:** Pestaña `Code` ➔ Vista principal de archivos.
* **Evidencia:** Muestra clara de la estructura con `be/`, `fe/`, `docs/`, `.gitignore`, `README.md` y `MANUAL_ESTANDARES.md`.
* **Descripción:** Se confirma que la raíz del proyecto cumple con la separación de capas y archivos de configuración obligatorios.

### 📸 Captura 2: Listado de Ramas (Branches)
* **Ubicación:** Pestaña `Code` ➔ `Branches`.
* **Evidencia:** Visualización de la rama principal `main`, la rama base `develop` y las distintas ramas de trabajo `feature/*`.
* **Descripción:** Evidencia la aplicación de la estrategia **Gitflow** con ramas independientes por funcionalidad.

### 📸 Captura 3: Historial de Commits
* **Ubicación:** Pestaña `Code` ➔ `Commits`.
* **Evidencia:** Registro cronológico de commits etiquetados con `feat:`, `fix:`, `docs:` y `style:`.
* **Descripción:** Muestra el cumplimiento estricto del estándar **Conventional Commits** por parte de los desarrolladores.

### 📸 Captura 4: Gráfico de Red de Ramas (Network Graph)
* **Ubicación:** Pestaña `Insights` ➔ `Network`.
* **Evidencia:** Diagrama de bifurcaciones visuales donde se aprecian el nacimiento de las ramas `feature/` desde `develop` y su posterior integración mediante merges.
* **Descripción:** Comprueba visualmente el flujo colaborativo y la convergencia de código en la rama `develop`.

### 📸 Captura 5: Detalle del Pull Request y Code Review
* **Ubicación:** Pestaña `Pull requests` ➔ `[PR #1 Feat: sistema de autenticación]`.
* **Evidencia:** Vista del Pull Request con asignación de Reviewer, comentarios de revisión, comprobación de pruebas y botón de *Merged*.
* **Descripción:** Demuestra la auditoría y control de calidad entre pares previo al despliegue.

---

*Guía completada y validada según los requerimientos del SENA para el proyecto Jóvenes al Ruedo.*
