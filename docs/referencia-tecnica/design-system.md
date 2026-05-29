# Sistema de Diseño: Jóvenes al Ruedo

Este documento establece la identidad visual, paleta de colores, tipografías y componentes unificados bajo **TailwindCSS 4** para la plataforma **Jóvenes al Ruedo**.

---

## 1. Colores de la Marca (Tokens CSS / Tailwind)

Para transmitir energía artística y elegancia premium, la paleta de colores se basa en armonía de matices oscuros combinados con acentos vibrantes:

### Colores Base
- **Fondo Oscuro (Dark Theme)**: `bg-[#0B0F19]` (Azul de medianoche ultra profundo).
- **Contenedores y Tarjetas**: `bg-[#161C2C]` con bordes sutiles `border-slate-800/40`.
- **Texto Principal**: `text-slate-100` (Blanco suave para evitar fatiga ocular).
- **Texto Secundario**: `text-slate-400`.

### Colores de Acento (Artísticos)
- **Primary Violet**: `text-[#8B5CF6]` / `bg-[#8B5CF6]` (Vibrante tono violeta para botones principales y enlaces interactivos).
- **Emerald Active**: `text-[#10B981]` / `bg-[#10B981]` (Para estados activos, convocatorias abiertas y confirmaciones exitosas).
- **Amber Warning**: `text-[#F59E0B]` / `bg-[#F59E0B]` (Alertas e información en revisión).

---

## 2. Tipografía y Jerarquía Visual

Utilizamos la fuente **Outfit** para títulos y la fuente **Inter** para el cuerpo de texto, cargadas dinámicamente desde Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
```

### Escala de Tipografías
* **H1 (Título de Página)**: `font-outfit font-extrabold text-3xl md:text-4xl text-slate-100 tracking-tight`
* **H2 (Secciones principales)**: `font-outfit font-bold text-2xl text-slate-200`
* **H3 (Subtítulos)**: `font-outfit font-semibold text-lg text-slate-200`
* **Cuerpo de texto**: `font-inter font-normal text-sm md:text-base text-slate-400 leading-relaxed`

---

## 3. Micro-animaciones e Interactividad

El movimiento moderado pero dinámico mejora enormemente el compromiso (engagement) del usuario:

### Hover Effects Premium
- **Botones Interactivos**: `transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]`
- **Tarjetas de Portafolio**: `hover:-translate-y-1 transition-transform duration-300 ease-out`
- **Glassmorphism**: Efecto de desenfoque de fondo premium para modales y navegación flotante:
  `bg-slate-900/60 backdrop-blur-md border border-white/10`
