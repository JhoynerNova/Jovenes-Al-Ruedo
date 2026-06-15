/**
 * Archivo: pages/LandingPage.tsx
 * Descripción: Página de inicio pública de Jóvenes al Ruedo.
 * ¿Qué? Página de presentación que explica la plataforma a visitantes nuevos.
 * ¿Para qué? Convertir visitantes en usuarios registrados (artistas o empresas).
 * ¿Impacto? Es la primera impresión del producto — define si el usuario se queda o se va.
 */

import { Link } from "react-router-dom";
import {
  Drama, Mic, Palette, Music, Guitar, Camera, PenTool, Film,
  Target, Handshake, Rocket,
  UserPlus, Search, Zap, Building2, FileText, Users,
  Instagram, Youtube, Facebook, ArrowRight
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";

/**
 * ¿Qué? Datos de las categorías artísticas soportadas por la plataforma.
 * ¿Para qué? Mostrar al visitante qué tipos de talento puede encontrar o publicar.
 * ¿Impacto? Centralizar aquí los datos evita repetir JSX y facilita agregar categorías futuras.
 */
const categorias = [
  { Icono: Drama, nombre: "Actuación", descripcion: "Teatro, cine, televisión y más" },
  { Icono: Mic, nombre: "Canto", descripcion: "Solistas, coristas y bandas" },
  { Icono: Palette, nombre: "Pintura", descripcion: "Arte visual y diseño gráfico" },
  { Icono: Music, nombre: "Danza", descripcion: "Ballet, urbano, folclórico" },
  { Icono: Guitar, nombre: "Música", descripcion: "Instrumentistas y compositores" },
  { Icono: Camera, nombre: "Fotografía", descripcion: "Retratos, eventos y moda" },
  { Icono: PenTool, nombre: "Escritura", descripcion: "Guionistas, poetas y narradores" },
  { Icono: Film, nombre: "Cine", descripcion: "Dirección, producción y edición" },
];

/**
 * ¿Qué? Pasos del proceso para artistas jóvenes.
 * ¿Para qué? Explicar de forma simple cómo funciona la plataforma para quien busca trabajo.
 * ¿Impacto? Reduce la fricción de registro al mostrar que el proceso es fácil y rápido.
 */
const pasosArtista = [
  { numero: "01", titulo: "Crea tu perfil", descripcion: "Regístrate gratis y muestra tu talento con tu portafolio artístico.", Icono: UserPlus },
  { numero: "02", titulo: "Explora ofertas", descripcion: "Encuentra oportunidades de empresas que buscan tu talento creativo.", Icono: Search },
  { numero: "03", titulo: "Conecta y trabaja", descripcion: "Postúlate y empieza tu carrera artística profesional.", Icono: Zap },
];

/**
 * ¿Qué? Pasos del proceso para empresas que contratan talento.
 * ¿Para qué? Mostrar a las empresas cómo publicar ofertas y encontrar artistas.
 * ¿Impacto? Atrae al otro lado del mercado — sin empresas no hay ofertas para los artistas.
 */
const pasosEmpresa = [
  { numero: "01", titulo: "Regístrate como empresa", descripcion: "Crea tu cuenta empresarial de forma gratuita en minutos.", Icono: Building2 },
  { numero: "02", titulo: "Publica tu oferta", descripcion: "Describe el perfil artístico que necesitas para tu proyecto.", Icono: FileText },
  { numero: "03", titulo: "Encuentra tu talento", descripcion: "Recibe postulaciones de jóvenes artistas calificados.", Icono: Users },
];

/**
 * ¿Qué? Componente principal de la Landing Page.
 * ¿Para qué? Presentar la plataforma a visitantes no registrados y motivarlos a unirse.
 * ¿Impacto? Sin esta página, los nuevos usuarios no tendrían contexto de qué es la app
 *           y llegarían directo al login sin entender el valor del producto.
 */
export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<"Pintura" | "Música" | "Actuación" | "Danza" | "Fotografía" | "Canto">("Pintura");

  const salariosData = {
    "Pintura": { promedio: "$1.8M - $3.2M COP", demanda: "Alta", rol: "Ilustrador Digital / Diseñador Conceptual", crecimiento: "+12%", color: "from-purple-500 to-indigo-500" },
    "Música": { promedio: "$2.0M - $4.0M COP", demanda: "Muy Alta", rol: "Productor Musical / Arreglista", crecimiento: "+15%", color: "from-blue-500 to-teal-500" },
    "Actuación": { promedio: "$2.2M - $4.5M COP", demanda: "Media", rol: "Actor de Doblaje / Productora Teatral", crecimiento: "+8%", color: "from-rose-500 to-orange-500" },
    "Danza": { promedio: "$1.5M - $2.8M COP", demanda: "Media-Alta", rol: "Coreógrafo / Bailarín Principal", crecimiento: "+10%", color: "from-amber-500 to-yellow-500" },
    "Fotografía": { promedio: "$1.8M - $3.5M COP", demanda: "Alta", rol: "Fotógrafo Comercial / Editor Visual", crecimiento: "+14%", color: "from-teal-500 to-green-500" },
    "Canto": { promedio: "$2.0M - $3.8M COP", demanda: "Alta", rol: "Vocalista Principal / Entrenador Vocal", crecimiento: "+11%", color: "from-pink-500 to-purple-500" }
  };

  const testimonios = [
    { nombre: "Camilo Torres", edad: "22 años", area: "Artes Plásticas", texto: "Gracias a Jóvenes al Ruedo conseguí mi primer contrato para ilustrar la portada de una novela independiente. ¡Es genial ver que valoran nuestro talento!", avatar: "🎨" },
    { nombre: "Empresa Inmersiva S.A.S.", area: "Sector Creativo", texto: "Buscábamos un fotógrafo de moda juvenil para una campaña digital y encontramos a la persona ideal en solo tres días. El portafolio integrado agilizó todo el proceso.", avatar: "🏢" },
    { nombre: "Sara Beltrán", edad: "25 años", area: "Música & Canto", texto: "Poder subir pistas de audio a mi portafolio web cambió las reglas del juego. Una agencia me escuchó aquí y me contactó por el chat integrado.", avatar: "🎵" }
  ];

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ══════════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b border-purple-900/10 bg-brand-dark/95 backdrop-blur-md shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Jóvenes al Ruedo" className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-teal/40" />
            <span className="text-xl font-bold text-white tracking-wide">Jóvenes al Ruedo</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-purple-200 transition-all hover:bg-white/10 hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-bold text-white transition-all hover:bg-orange-500 shadow-md hover:shadow-brand-orange/20"
            >
              Regístrate gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-purple to-brand-blue py-20 lg:py-28 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand-teal/10 blur-3xl" />
          <div className="absolute -bottom-10 right-0 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:text-left">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-teal/20 px-4 py-1.5 text-xs font-semibold text-brand-teal ring-1 ring-brand-teal/40 animate-pulse">
                <Palette className="h-4 w-4" />
                El Computrabajo Creativo para Jóvenes
              </span>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Impulsa tu carrera
                <span className="block text-brand-teal">artística en Colombia</span>
              </h1>

              <p className="max-w-xl text-lg text-purple-200/90 leading-relaxed">
                Conectamos jóvenes talentos de <strong className="text-white">18 a 28 años</strong> con las mejores empresas del sector creativo. Diseña tu portafolio y postúlate hoy mismo.
              </p>

              {/* Computrabajo-Style Search Widget */}
              <div className="relative max-w-xl mx-auto lg:mx-0 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué buscas? Ej: Cantante, Fotógrafo, Músico..."
                    className="w-full bg-transparent border-0 py-3 pl-11 pr-4 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        window.location.href = `/explore?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    window.location.href = `/explore?search=${encodeURIComponent(searchQuery)}`;
                  }}
                  className="w-full sm:w-auto rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-500 transition-all hover:scale-102 flex items-center justify-center gap-2"
                >
                  Buscar Ofertas <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start">
                {[
                  { valor: "18 a 28", label: "Años de edad" },
                  { valor: "8+", label: "Especialidades" },
                  { valor: "100% Gratis", label: "Para Artistas" },
                ].map((stat) => (
                  <div key={stat.label} className="border-l-2 border-brand-teal/40 pl-4">
                    <p className="text-xl font-black text-brand-teal">{stat.valor}</p>
                    <p className="text-xs text-purple-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 animate-scale-in">
              <div className="relative p-4">
                <div className="absolute inset-0 rounded-full bg-brand-teal/20 blur-3xl" />
                <img
                  src={logo}
                  alt="Jóvenes al Ruedo"
                  className="relative h-64 w-64 lg:h-80 lg:w-80 rounded-3xl object-cover shadow-2xl ring-4 ring-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMPUTRABAJO-STYLE SALARY WIDGET
          ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              ¿Cuánto se gana en el sector artístico?
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Analiza los rangos salariales promedio y la demanda laboral en Bogotá por cada categoría.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Button Group */}
            <div className="lg:col-span-5 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Selecciona una disciplina:</label>
              {(Object.keys(salariosData) as Array<keyof typeof salariosData>).map((disc) => (
                <button
                  key={disc}
                  onClick={() => setSelectedDiscipline(disc)}
                  className={`w-full text-left rounded-xl p-4 transition-all duration-200 border flex items-center justify-between font-bold text-sm ${
                    selectedDiscipline === disc
                      ? "border-brand-purple bg-brand-purple/5 text-brand-purple dark:border-brand-teal dark:bg-brand-teal/5 dark:text-brand-teal shadow-sm"
                      : "border-gray-150 bg-gray-50/50 hover:bg-gray-100/60 text-gray-700 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300"
                  }`}
                >
                  <span>{disc}</span>
                  <span className="text-xs font-medium opacity-80">Ver estadísticas →</span>
                </button>
              ))}
            </div>

            {/* Right Interactive Card */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6 sm:p-8 shadow-sm">
                <div className={`absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r ${salariosData[selectedDiscipline].color}`}></div>
                
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase text-gray-400">Salario Promedio Mensual</span>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                      {salariosData[selectedDiscipline].promedio}
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-150 dark:border-gray-800 text-right">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Demanda Laboral</span>
                    <span className="text-sm font-bold text-brand-orange mt-0.5 inline-block">🔥 {salariosData[selectedDiscipline].demanda}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800 pb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Rol Más Demandado:</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{salariosData[selectedDiscipline].rol}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800 pb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Crecimiento este año:</span>
                    <span className="text-sm font-bold text-green-500">{salariosData[selectedDiscipline].crecimiento}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Datos obtenidos de las ofertas activas en Bogotá.</p>
                  <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-purple hover:underline dark:text-brand-teal">
                    Postularme a ofertas <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS & COMMUNITY (REPLACES ROADMAP)
          ══════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/10 px-3.5 py-1 text-xs font-semibold text-brand-purple dark:text-purple-300">
              <Users className="h-3.5 w-3.5" /> Comunidad Jóvenes al Ruedo
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
              Historias de Éxito y Testimonios
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Descubre cómo ayudamos a jóvenes artistas a conectar con empresas del sector creativo.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonios.map((item) => (
              <div key={item.nombre} className="rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed mb-6">
                  "{item.texto}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-purple/5 flex items-center justify-center text-lg">
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.nombre}</h4>
                    <p className="text-xs text-gray-500">{item.area}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ¿QUÉ ES JÓVENES AL RUEDO?
          ══════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-brand-dark dark:text-white sm:text-4xl">
              ¿Qué es Jóvenes al Ruedo?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Somos el primer portal de empleo artístico enfocado en jóvenes colombianos de 18 a 28 años que viven del arte. Conectamos creativos con oportunidades reales.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icono: Target,
                titulo: "Enfocado en el arte",
                descripcion: "No somos un portal genérico. Cada oferta y perfil está pensado para el ecosistema artístico.",
                color: "border-brand-purple",
                bg: "bg-brand-purple/5",
                iconColor: "text-brand-purple",
              },
              {
                Icono: Handshake,
                titulo: "Dos lados del mercado",
                descripcion: "Artistas que buscan trabajo y empresas que buscan talento, en una misma plataforma.",
                color: "border-brand-blue",
                bg: "bg-brand-blue/5",
                iconColor: "text-brand-blue",
              },
              {
                Icono: Rocket,
                titulo: "Gratis para artistas",
                descripcion: "Regístrate, crea tu portafolio y postúlate a ofertas sin costo alguno.",
                color: "border-brand-teal",
                bg: "bg-brand-teal/5",
                iconColor: "text-brand-teal",
              },
            ].map((card, i) => (
              <div
                key={card.titulo}
                className={`animate-fade-in-up delay-${i} card-hover rounded-2xl border-l-4 ${card.color} ${card.bg} p-6 shadow-sm`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.iconColor}`}>
                  <card.Icono className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{card.titulo}</h3>
                <p className="text-gray-650 dark:text-gray-400 text-sm leading-relaxed">{card.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATEGORÍAS ARTÍSTICAS
          ══════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-brand-dark sm:text-4xl">
              Disciplinas artísticas
            </h2>
            <p className="text-lg text-gray-600">
              Desde las artes escénicas hasta las visuales — todos los talentos tienen cabida.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categorias.map((cat, i) => {
              const colorVariants = [
                { bg: "bg-brand-purple/10 hover:bg-brand-purple/20", icon: "text-brand-purple" },
                { bg: "bg-brand-blue/10 hover:bg-brand-blue/20", icon: "text-brand-blue" },
                { bg: "bg-brand-teal/10 hover:bg-brand-teal/20", icon: "text-brand-teal" },
                { bg: "bg-brand-orange/10 hover:bg-brand-orange/20", icon: "text-brand-orange" },
              ];
              const variant = colorVariants[i % 4];

              return (
                <div
                  key={cat.nombre}
                  className={`animate-fade-in-up delay-${i} card-hover group flex flex-col items-center gap-3 rounded-2xl p-6 text-center shadow-sm ${variant.bg}`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm ${variant.icon}`}>
                    <cat.Icono className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark">{cat.nombre}</p>
                    <p className="mt-1 text-xs text-gray-500">{cat.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CÓMO FUNCIONA
          ══════════════════════════════════════════════ */}
      <section className="bg-brand-dark py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-purple-300">Simple, rápido y sin complicaciones.</p>
          </div>

          <div className="grid gap-16 lg:grid-cols-2">
            {/* Columna artistas */}
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-teal/20 px-4 py-1 text-sm font-bold text-brand-teal ring-1 ring-brand-teal/40">
                  <Palette className="h-4 w-4" />
                  Para artistas
                </span>
              </div>
              <div className="space-y-6">
                {pasosArtista.map((paso, i) => (
                  <div key={paso.numero} className={`animate-slide-in-left delay-${i} flex gap-4`}>
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-teal/20">
                      <paso.Icono className="h-5 w-5 text-brand-teal" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{paso.titulo}</h3>
                      <p className="mt-1 text-purple-300">{paso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna empresas */}
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/20 px-4 py-1 text-sm font-bold text-brand-orange ring-1 ring-brand-orange/40">
                  <Building2 className="h-4 w-4" />
                  Para empresas
                </span>
              </div>
              <div className="space-y-6">
                {pasosEmpresa.map((paso, i) => (
                  <div key={paso.numero} className={`animate-slide-in-left delay-${i + 3} flex gap-4`}>
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange/20">
                      <paso.Icono className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{paso.titulo}</h3>
                      <p className="mt-1 text-purple-300">{paso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LLAMADO A LA ACCIÓN FINAL
          ══════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-brand-purple to-brand-blue py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="animate-fade-in-up mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            ¿Listo para dar el salto?
          </h2>
          <p className="animate-fade-in-up delay-1 mb-8 text-lg text-purple-200">
            Únete a la plataforma que está transformando el empleo artístico juvenil en Colombia.
          </p>
          <div className="animate-fade-in-up delay-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-brand-orange px-10 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-orange-500"
            >
              Crear mi cuenta gratis
            </Link>
            <Link
              to="/login"
              className="rounded-xl border-2 border-white px-10 py-4 text-lg font-bold text-white transition-all hover:bg-white hover:text-brand-purple"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════ */}
      <footer className="bg-brand-dark border-t border-brand-purple/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <img src={logo} alt="Jóvenes al Ruedo" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-lg font-bold text-white">Jóvenes al Ruedo</span>
              </div>
              <p className="mb-4 text-sm text-purple-300">
                La plataforma de empleo artístico para jóvenes de 18 a 28 años en Colombia.
                Conectamos talento creativo con oportunidades reales.
              </p>
              <div className="flex gap-3">
                {[
                  { label: "Instagram", Icono: Instagram },
                  { label: "Facebook", Icono: Facebook },
                  { label: "YouTube", Icono: Youtube },
                ].map((red) => (
                  <button
                    key={red.label}
                    title={red.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple/30 text-purple-200 transition-colors hover:bg-brand-purple hover:text-white"
                  >
                    <red.Icono className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">Para artistas</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li><Link to="/register" className="hover:text-brand-teal transition-colors">Crear perfil</Link></li>
                <li><Link to="/login" className="hover:text-brand-teal transition-colors">Buscar ofertas</Link></li>
                <li><Link to="/register" className="hover:text-brand-teal transition-colors">Mi portafolio</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">Para empresas</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li><Link to="/register" className="hover:text-brand-orange transition-colors">Registrar empresa</Link></li>
                <li><Link to="/register" className="hover:text-brand-orange transition-colors">Publicar oferta</Link></li>
                <li><Link to="/login" className="hover:text-brand-orange transition-colors">Buscar talento</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 border-t border-brand-purple/30 pt-6 text-center text-sm text-purple-400 sm:flex-row sm:justify-between">
            <span>© 2026 Jóvenes al Ruedo. Todos los derechos reservados.</span>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="hover:text-brand-teal transition-colors">Privacidad</Link>
              <Link to="/terms" className="hover:text-brand-teal transition-colors">Términos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
