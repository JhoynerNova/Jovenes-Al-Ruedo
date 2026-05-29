import os
import json

# Paths
json_path = r"C:\Users\jhoyn\.gemini\antigravity\brain\8bca3fed-a75f-459c-9ba1-d1287cfacecf\scratch\excel_data.json"
docs_dir = r"c:\Users\jhoyn\Desktop\Proyecto del sena\Jovenes Al Ruedo\docs"

# Create directories
os.makedirs(os.path.join(docs_dir, "conceptos"), exist_ok=True)
os.makedirs(os.path.join(docs_dir, "referencia-tecnica"), exist_ok=True)
os.makedirs(os.path.join(docs_dir, "requisitos", "HUs"), exist_ok=True)
os.makedirs(os.path.join(docs_dir, "requisitos", "RFs"), exist_ok=True)
os.makedirs(os.path.join(docs_dir, "requisitos", "RNFs"), exist_ok=True)
os.makedirs(os.path.join(docs_dir, "setup"), exist_ok=True)

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Spanish text fix dictionary
replacements = {
    "contrasea": "contraseña",
    "contraseas": "contraseñas",
    "Jvenes": "Jóvenes",
    "jvenes": "jóvenes",
    "est ": "está ",
    "est\n": "está\n",
    "est.": "está.",
    "sesin": "sesión",
    "validacin": "validación",
    "automticamente": "automáticamente",
    "informacin": "información",
    "nmero": "número",
    "nmeros": "números",
    "mnimo": "mínimo",
    "ms ": "más ",
    "ms\n": "más\n",
    "ao": "año",
    "aos": "años",
    "revicion": "revisión",
    "aprobacin": "aprobación",
    "presentacin": "presentación",
    "visualizacin": "visualización",
    "trminos": "términos",
    "descripcin": "descripción",
    "opcin": "opción",
    "opcines": "opciones",
    "bsqueda": "búsqueda",
    "autenticacin": "autenticación",
    "direccin": "dirección",
    "creacin": "creación",
    "notificacin": "notificación",
    "calificacin": "calificación",
    "postulacin": "postulación",
    "postulaciones": "postulaciones",
    "participacin": "participación",
    "asociacin": "asociación",
    "comunicacin": "comunicación",
    "integracin": "integración",
    "configuracin": "configuración",
    "interaccin": "interacción",
    "exclusin": "exclusión",
    "reunin": "reunión",
    "gnero": "género",
    "categora": "categoría",
    "categoras": "categorías",
    "da ": "día ",
    "da\n": "día\n",
    "das": "días",
    "as ": "así ",
    "compaa": "compañía",
    "diseo": "diseño",
    "diseos": "diseños",
    "diseador": "diseñador",
    "administracin": "administración",
    "gestin": "gestión",
    "telfono": "teléfono",
    "fch": "fecha",
    "": "" # clean any raw replacement marks
}

def clean_text(text):
    if not text:
        return ""
    res = str(text)
    for k, v in replacements.items():
        res = res.replace(k, v)
    return res

# -----------------
# GENERATE HUs
# -----------------
for hu_id, rows in data['HUs'].items():
    title = clean_text(rows[0][1]) if len(rows) > 0 and rows[0][1] else "Historia de Usuario"
    
    como = ""
    quiero = ""
    para = ""
    criterios_raw = ""
    dependencia = "Ninguna"
    descripcion = ""
    
    for row in rows:
        if len(row) > 2:
            label = str(row[2]).strip() if row[2] else ""
            val = clean_text(row[3]).strip() if row[3] else ""
            
            if "Como" in label:
                como = val
            elif "Quiero" in label:
                quiero = val
            elif "Para" in label:
                para = val
            elif "Criterios" in label:
                criterios_raw = val
            elif "Dpendencia" in label:
                dependencia = val
            elif "Drescripcion" in label or "Descripcion" in label:
                descripcion = val

    # Gherkin transformation
    criterios_lines = [line.strip() for line in criterios_raw.split('\n') if line.strip()]
    gherkin_criteria = ""
    if criterios_lines:
        gherkin_criteria += "### Criterios de Aceptación (Gherkin)\n\n"
        for idx, crit in enumerate(criterios_lines, 1):
            crit_clean = clean_text(crit)
            gherkin_criteria += f"#### Escenario {idx}: {crit_clean[:50]}...\n"
            gherkin_criteria += f"  **Dado** que el usuario está interactuando con el sistema para la HU {hu_id}\n"
            gherkin_criteria += f"  **Cuando** {crit_clean.lower()}\n"
            gherkin_criteria += f"  **Entonces** el sistema responde correctamente garantizando el flujo esperado.\n\n"
    else:
        gherkin_criteria += "### Criterios de Aceptación\n- No especificados.\n"

    hu_md = f"""# {hu_id}: {title}

## Tabla de Identificación

| Campo | Detalle |
| :--- | :--- |
| **ID** | {hu_id} |
| **Título** | {title} |
| **Módulo** | Gestión de Usuarios / Portafolios |
| **Prioridad** | Alta |
| **Estado** | Planificado (Sprint 12 Días) |
| **RF Asociados** | RF001, RF002 |

---

## Historia de Usuario

* **COMO** {como}
* **QUIERO** {quiero}
* **PARA** {para}

---

## Descripción General
{descripcion or "Permite el correcto funcionamiento de esta funcionalidad en la plataforma Jóvenes al Ruedo."}

---

## Dependencias
* **Física / Lógica**: {dependencia}

---

{gherkin_criteria}
"""
    
    file_path = os.path.join(docs_dir, "requisitos", "HUs", f"{hu_id}.md")
    with open(file_path, 'w', encoding='utf-8') as f_out:
        f_out.write(hu_md.strip())

# -----------------
# GENERATE RFs
# -----------------
rf_list = []
for rf_id, rows in data['RFs'].items():
    title = "Requisito Funcional"
    desc = ""
    controles = ""
    criterios = ""
    presentado = "Franky Almario y Jhoyner Nova"
    module = "Sistema de Oportunidades"
    
    if len(rows) > 0 and len(rows[0]) > 2:
        module = clean_text(rows[0][2])
    
    for row in rows:
        if len(row) > 2:
            lbl = str(row[2]).strip() if row[2] else ""
            val = clean_text(row[3]).strip() if row[3] else ""
            
            if "RF" in str(row[1]):
                title = clean_text(row[2])
                desc = clean_text(row[3])
            elif "Controles" in lbl:
                controles = val
            elif "Criterios" in lbl:
                criterios = val
            elif "Presentado" in lbl:
                presentado = val

    rf_md = f"""# {rf_id}: {title}

## Identificación
- **Módulo**: {module or "Sistema de Oportunidades"}
- **Presentado Por**: {presentado}
- **Estado**: Aprobado

## Descripción
{desc or "No especificado."}

## Controles y Restricciones
{controles or "No especificado."}

## Criterios de Aceptación
{criterios or "No especificado."}
"""
    file_path = os.path.join(docs_dir, "requisitos", "RFs", f"{rf_id}.md")
    with open(file_path, 'w', encoding='utf-8') as f_out:
        f_out.write(rf_md.strip())
    
    rf_list.append((rf_id, title, module))

# Write RFs Index
rf_index_md = "# Requisitos Funcionales (RFs)\n\n| Código | Nombre del Requisito | Módulo |\n| :--- | :--- | :--- |\n"
for rf_id, rft, rfm in sorted(rf_list, key=lambda x: int(x[0][2:]) if x[0][2:].isdigit() else 0):
    rf_index_md += f"| [{rf_id}](file:///docs/requisitos/RFs/{rf_id}.md) | {rft} | {rfm} |\n"

with open(os.path.join(docs_dir, "requisitos", "RFs", "README.md"), 'w', encoding='utf-8') as f_out:
    f_out.write(rf_index_md)

# -----------------
# GENERATE RNFs
# -----------------
rnf_list = []
for rnf_id, rows in data['RNFs'].items():
    title = "Requisito No Funcional"
    desc = ""
    controles = ""
    criterios = ""
    presentado = "Franky Almario y Jhoyner Nova"
    
    for row in rows:
        if len(row) > 2:
            lbl = str(row[2]).strip() if row[2] else ""
            val = clean_text(row[3]).strip() if row[3] else ""
            
            if "RNF" in str(row[1]):
                title = clean_text(row[2])
                desc = clean_text(row[3])
            elif "Controles" in lbl:
                controles = val
            elif "Criterios" in lbl:
                criterios = val
            elif "Presentado" in lbl:
                presentado = val

    rnf_md = f"""# {rnf_id}: {title}

## Identificación
- **Presentado Por**: {presentado}
- **Categoría**: Calidad del Sistema

## Descripción
{desc or "No especificado."}

## Controles y Restricciones
{controles or "No especificado."}

## Criterios de Aceptación
{criterios or "No especificado."}
"""
    file_path = os.path.join(docs_dir, "requisitos", "RNFs", f"{rnf_id}.md")
    with open(file_path, 'w', encoding='utf-8') as f_out:
        f_out.write(rnf_md.strip())
        
    rnf_list.append((rnf_id, title))

# Write RNFs Index
rnf_index_md = "# Requisitos No Funcionales (RNFs)\n\n| Código | Nombre del Requisito No Funcional |\n| :--- | :--- |\n"
for rnf_id, rnft in sorted(rnf_list):
    rnf_index_md += f"| [{rnf_id}](file:///docs/requisitos/RNFs/{rnf_id}.md) | {rnft} |\n"

with open(os.path.join(docs_dir, "requisitos", "RNFs", "README.md"), 'w', encoding='utf-8') as f_out:
    f_out.write(rnf_index_md)

print("Documentación generada con éxito.")
