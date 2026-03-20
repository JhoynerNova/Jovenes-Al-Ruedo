/**
 * Archivo: pages/LandingPage.tsx
 * Descripción: Página de inicio pública de Jóvenes al Ruedo.
 * ¿Qué? Página de presentación que explica la plataforma a visitantes nuevos.
 * ¿Para qué? Convertir visitantes en usuarios registrados (artistas o empresas).
 * ¿Impacto? Es la primera impresión del producto — define si el usuario se queda o se va.
 */

import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

/**
 * ¿Qué? Datos de las categorías artísticas soportadas por la plataforma.
 * ¿Para qué? Mostrar al visitante qué tipos de talento puede encontrar o publicar.
 * ¿Impacto? Centralizar aquí los datos evita repetir JSX y facilita agregar categorías futuras.
 */
const categorias = [
  { icono: "🎭", nombre: "Actuación", descripcion: "Teatro, cine, televisión y más" },
  { icono: "🎤", nombre: "Canto", descripcion: "Solistas, coristas y bandas" },
  { icono: "🎨", nombre: "Pintura", descripcion: "Arte visual y diseño gráfico" },
  { icono: "💃", nombre: "Danza", descripcion: "Ballet, urbano, folclórico" },
  { icono: "🎸", nombre: "Música", descripcion: "Instrumentistas y compositores" },
  { icono: "📸", nombre: "Fotografía", descripcion: "Retratos, eventos y moda" },
  { icono: "✍️", nombre: "Escritura", descripcion: "Guionistas, poetas y narradores" },
  { icono: "🎬", nombre: "Cine", descripcion: "Dirección, producción y edición" },
];

/**
 * ¿Qué? Pasos del proceso para artistas jóvenes.
 * ¿Para qué? Explicar de forma simple cómo funciona la plataforma para quien busca trabajo.
 * ¿Impacto? Reduce la fricción de registro al mostrar que el proceso es fácil y rápido.
 */
const pasosArtista = [
  { numero: "01", titulo: "Crea tu perfil", descripcion: "Regístrate gratis y muestra tu talento con tu portafolio artístico." },
  { numero: "02", titulo: "Explora ofertas", descripcion: "Encuentra oportunidades de empresas que buscan tu talento creativo." },
  { numero: "03", titulo: "Conecta y trabaja", descripcion: "Postúlate y empieza tu carrera artística profesional." },
];

/**
 * ¿Qué? Pasos del proceso para empresas que contratan talento.
 * ¿Para qué? Mostrar a las empresas cómo publicar ofertas y encontrar artistas.
 * ¿Impacto? Atrae al otro lado del mercado — sin empresas no hay ofertas para los artistas.
 */
const pasosEmpresa = [
  { numero: "01", titulo: "Regístrate como empresa", descripcion: "Crea tu cuenta empresarial de forma gratuita en minutos." },
  { numero: "02", titulo: "Publica tu oferta", descripcion: "Describe el perfil artístico que necesitas para tu proyecto." },
  { numero: "03", titulo: "Encuentra tu talento", descripcion: "Recibe postulaciones de jóvenes artistas calificados." },
];

/**
 * ¿Qué? Componente principal de la Landing Page.
 * ¿Para qué? Presentar la plataforma a visitantes no registrados y motivarlos a unirse.
 * ¿Impacto? Sin esta página, los nuevos usuarios no tendrían contexto de qué es la app
 *           y llegarían directo al login sin entender el valor del producto.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen font-sans">

      {/* ══════════════════════════════════════════════
          NAVBAR
          ¿Qué? Barra de navegación fija con logo y accesos rápidos.
          ¿Para qué? Permitir al visitante navegar a login o registro desde cualquier punto.
          ¿Impacto? Sin navbar, el usuario tendría que scrollear hasta el final para registrarse.
          ══════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b border-purple-900/40 bg-brand-dark shadow-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ¿Qué? Logo + nombre de la plataforma. ¿Para qué? Identidad de marca en todo momento. */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Jóvenes al Ruedo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xl font-bold text-white">Jóvenes al Ruedo</span>
          </div>

          {/* ¿Qué? Botones de acceso. ¿Para qué? Facilitar el ingreso desde el navbar. */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-purple-200 transition-colors hover:bg-brand-purple/30"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-500"
            >
              Regístrate gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO
          ¿Qué? Sección principal con propuesta de valor y llamada a la acción.
          ¿Para qué? Captar la atención del visitante en los primeros 3 segundos.
          ¿Impacto? Es la sección más importante — define si el usuario sigue leyendo o se va.
          ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-purple to-brand-blue">
        {/* ¿Qué? Círculos decorativos de fondo. ¿Para qué? Dar profundidad visual al hero. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand-teal/10 blur-3xl" />
          <div className="absolute -bottom-10 right-0 h-96 w-96 rounded-full bg-brand-orange/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="flex flex-col items-center gap-10 text-center lg:flex-row lg:text-left">
            {/* ¿Qué? Contenido textual del hero. ¿Para qué? Comunicar la propuesta de valor. */}
            <div className="flex-1">
              {/* ¿Qué? Badge de categoría. ¿Para qué? Contextualizar el nicho de la plataforma. */}
              <span className="mb-4 inline-block rounded-full bg-brand-teal/20 px-4 py-1 text-sm font-semibold text-brand-teal ring-1 ring-brand-teal/40">
                🎨 Plataforma de empleo artístico
              </span>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                Tu talento tiene
                <span className="block text-brand-teal"> un lugar aquí</span>
              </h1>

              <p className="mb-8 max-w-xl text-lg text-purple-200">
                Conectamos jóvenes artistas de <strong className="text-white">18 a 28 años</strong> con
                empresas que buscan talento creativo. Actuación, canto, pintura, danza y mucho más.
              </p>

              {/* ¿Qué? Botones de CTA. ¿Para qué? Dos rutas claras: artista o empresa. */}
              <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link
                  to="/register"
                  className="rounded-xl bg-brand-orange px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-orange-500 hover:shadow-brand-orange/30"
                >
                  Soy artista — Empieza gratis
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl border-2 border-brand-teal px-8 py-3 text-base font-bold text-brand-teal transition-all hover:bg-brand-teal hover:text-brand-dark"
                >
                  Soy empresa — Publica una oferta
                </Link>
              </div>

              {/* ¿Qué? Estadísticas rápidas. ¿Para qué? Generar confianza con números. */}
              <div className="mt-10 flex flex-wrap justify-center gap-8 lg:justify-start">
                {[
                  { valor: "18–28", label: "Años de edad" },
                  { valor: "8+", label: "Disciplinas artísticas" },
                  { valor: "100%", label: "Gratis para artistas" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-extrabold text-brand-teal">{stat.valor}</p>
                    <p className="text-sm text-purple-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ¿Qué? Logo grande en el hero. ¿Para qué? Reforzar identidad visual de la marca. */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-brand-teal/20 blur-2xl" />
                <img
                  src={logo}
                  alt="Jóvenes al Ruedo"
                  className="relative h-64 w-64 rounded-full object-cover shadow-2xl ring-4 ring-brand-teal/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ¿QUÉ ES JÓVENES AL RUEDO?
          ¿Qué? Sección explicativa sobre la plataforma.
          ¿Para qué? Resolver dudas del visitante sobre el propósito de la app.
          ¿Impacto? Sin esta sección, el usuario no entendería cómo funciona la plataforma.
          ══════════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            {/* ¿Qué? Título de sección. ¿Para qué? Orientar al lector sobre el contenido. */}
            <h2 className="mb-4 text-3xl font-extrabold text-brand-dark sm:text-4xl">
              ¿Qué es Jóvenes al Ruedo?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Somos el primer portal de empleo artístico enfocado en jóvenes colombianos de 18 a 28 años
              que viven del arte. Conectamos creativos con oportunidades reales.
            </p>
          </div>

          {/* ¿Qué? Tarjetas de propuesta de valor. ¿Para qué? Resumir los beneficios clave. */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icono: "🎯",
                titulo: "Enfocado en el arte",
                descripcion: "No somos un portal genérico. Cada oferta y perfil está pensado para el ecosistema artístico.",
                color: "border-brand-purple",
                bg: "bg-brand-purple/5",
              },
              {
                icono: "🤝",
                titulo: "Dos lados del mercado",
                descripcion: "Artistas que buscan trabajo y empresas que buscan talento, en una misma plataforma.",
                color: "border-brand-blue",
                bg: "bg-brand-blue/5",
              },
              {
                icono: "🚀",
                titulo: "Gratis para artistas",
                descripcion: "Regístrate, crea tu portafolio y postúlate a ofertas sin costo alguno.",
                color: "border-brand-teal",
                bg: "bg-brand-teal/5",
              },
            ].map((card) => (
              <div
                key={card.titulo}
                className={`rounded-2xl border-l-4 ${card.color} ${card.bg} p-6 shadow-sm transition-shadow hover:shadow-md`}
              >
                <span className="mb-4 block text-4xl">{card.icono}</span>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">{card.titulo}</h3>
                <p className="text-gray-600">{card.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATEGORÍAS ARTÍSTICAS
          ¿Qué? Grid de disciplinas artísticas soportadas.
          ¿Para qué? Mostrar al visitante la diversidad de perfiles que puede encontrar.
          ¿Impacto? Un artista que ve su disciplina listada se siente incluido y se registra.
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

          {/* ¿Qué? Grid de categorías con íconos. ¿Para qué? Visualizar la diversidad de la plataforma. */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categorias.map((cat, i) => (
              <div
                key={cat.nombre}
                className={`group flex flex-col items-center gap-3 rounded-2xl p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                  i % 4 === 0 ? "bg-brand-purple/10 hover:bg-brand-purple/20" :
                  i % 4 === 1 ? "bg-brand-blue/10 hover:bg-brand-blue/20" :
                  i % 4 === 2 ? "bg-brand-teal/10 hover:bg-brand-teal/20" :
                               "bg-brand-orange/10 hover:bg-brand-orange/20"
                }`}
              >
                <span className="text-4xl">{cat.icono}</span>
                <div>
                  <p className="font-bold text-brand-dark">{cat.nombre}</p>
                  <p className="mt-1 text-xs text-gray-500">{cat.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CÓMO FUNCIONA
          ¿Qué? Sección de pasos para artistas y empresas.
          ¿Para qué? Reducir la fricción explicando el proceso de forma simple.
          ¿Impacto? Si el usuario no entiende cómo funciona, no se registra.
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
            {/* ¿Qué? Columna de pasos para artistas. ¿Para qué? Guiar al artista en el proceso. */}
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="rounded-full bg-brand-teal/20 px-4 py-1 text-sm font-bold text-brand-teal ring-1 ring-brand-teal/40">
                  Para artistas 🎨
                </span>
              </div>
              <div className="space-y-6">
                {pasosArtista.map((paso) => (
                  <div key={paso.numero} className="flex gap-4">
                    {/* ¿Qué? Número de paso. ¿Para qué? Indicar el orden del proceso. */}
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-teal/20 text-lg font-extrabold text-brand-teal">
                      {paso.numero}
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{paso.titulo}</h3>
                      <p className="mt-1 text-purple-300">{paso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ¿Qué? Columna de pasos para empresas. ¿Para qué? Guiar a la empresa en el proceso. */}
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="rounded-full bg-brand-orange/20 px-4 py-1 text-sm font-bold text-brand-orange ring-1 ring-brand-orange/40">
                  Para empresas 🏢
                </span>
              </div>
              <div className="space-y-6">
                {pasosEmpresa.map((paso) => (
                  <div key={paso.numero} className="flex gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange/20 text-lg font-extrabold text-brand-orange">
                      {paso.numero}
                    </span>
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
          ¿Qué? Sección CTA al final de la página.
          ¿Para qué? Capturar al visitante que llegó hasta aquí y está listo para registrarse.
          ¿Impacto? Es el último empuje antes de que el usuario abandone la página.
          ══════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-brand-purple to-brand-blue py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            ¿Listo para dar el salto?
          </h2>
          <p className="mb-8 text-lg text-purple-200">
            Únete a la plataforma que está transformando el empleo artístico juvenil en Colombia.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
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
          ¿Qué? Pie de página con logo, descripción y redes sociales decorativas.
          ¿Para qué? Cerrar la página con identidad de marca y links de contacto.
          ¿Impacto? Un footer profesional genera confianza y credibilidad en el producto.
          ══════════════════════════════════════════════ */}
      <footer className="bg-brand-dark border-t border-brand-purple/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* ¿Qué? Columna de identidad de marca. ¿Para qué? Reforzar el logo y misión. */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <img src={logo} alt="Jóvenes al Ruedo" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-lg font-bold text-white">Jóvenes al Ruedo</span>
              </div>
              <p className="mb-4 text-sm text-purple-300">
                La plataforma de empleo artístico para jóvenes de 18 a 28 años en Colombia.
                Conectamos talento creativo con oportunidades reales.
              </p>
              {/* ¿Qué? Íconos de redes sociales. ¿Para qué? Mostrar presencia digital de la marca. */}
              <div className="flex gap-3">
                {[
                  { label: "Instagram", icon: "📷" },
                  { label: "TikTok", icon: "🎵" },
                  { label: "Facebook", icon: "👥" },
                  { label: "YouTube", icon: "▶️" },
                ].map((red) => (
                  <button
                    key={red.label}
                    title={red.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple/30 text-sm transition-colors hover:bg-brand-purple"
                  >
                    {red.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* ¿Qué? Columna de links para artistas. ¿Para qué? Facilitar la navegación desde el footer. */}
            <div>
              <h4 className="mb-4 font-bold text-white">Para artistas</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li><Link to="/register" className="hover:text-brand-teal transition-colors">Crear perfil</Link></li>
                <li><Link to="/login" className="hover:text-brand-teal transition-colors">Buscar ofertas</Link></li>
                <li><Link to="/register" className="hover:text-brand-teal transition-colors">Mi portafolio</Link></li>
              </ul>
            </div>

            {/* ¿Qué? Columna de links para empresas. ¿Para qué? Guiar a las empresas desde el footer. */}
            <div>
              <h4 className="mb-4 font-bold text-white">Para empresas</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li><Link to="/register" className="hover:text-brand-orange transition-colors">Registrar empresa</Link></li>
                <li><Link to="/register" className="hover:text-brand-orange transition-colors">Publicar oferta</Link></li>
                <li><Link to="/login" className="hover:text-brand-orange transition-colors">Buscar talento</Link></li>
              </ul>
            </div>
          </div>

          {/* ¿Qué? Línea de copyright. ¿Para qué? Indicar autoría y año de la plataforma. */}
          <div className="mt-10 border-t border-brand-purple/30 pt-6 text-center text-sm text-purple-400">
            © 2026 Jóvenes al Ruedo. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
