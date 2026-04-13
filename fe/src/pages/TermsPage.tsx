/**
 * Archivo: pages/TermsPage.tsx
 * Descripción: Página pública con los Términos y Condiciones de Jóvenes al Ruedo.
 * ¿Para qué? Cumplir con la legislación colombiana que exige informar al usuario
 *            sobre las condiciones de uso antes de registrarse.
 * ¿Impacto? Sin esta página, el enlace "/terms" del footer estaría roto
 *           y el consentimiento del usuario no tendría sustento legal completo.
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Scale, ShieldCheck, UserCheck, BookOpen, AlertTriangle, MapPin } from "lucide-react";

/**
 * ¿Qué? Secciones de los Términos y Condiciones.
 * ¿Para qué? Centralizar el contenido legal para facilitar actualizaciones.
 * ¿Impacto? Actualizar una sección aquí se refleja automáticamente en toda la página.
 */
const secciones = [
  {
    titulo: "1. Aceptación de los Términos",
    icono: ShieldCheck,
    contenido: [
      "Al acceder y utilizar la plataforma Jóvenes al Ruedo, usted acepta estar sujeto a estos Términos y Condiciones de Uso. Si no está de acuerdo con alguno de estos términos, le solicitamos no utilizar la plataforma.",
      "El uso continuado de la plataforma después de cualquier modificación a estos términos constituye su aceptación de dichos cambios.",
      "Estos Términos son complementarios a la Política de Privacidad de Jóvenes al Ruedo.",
    ],
  },
  {
    titulo: "2. Uso de la Plataforma",
    icono: UserCheck,
    contenido: [
      "Jóvenes al Ruedo es una plataforma de empleo artístico diseñada para conectar jóvenes artistas colombianos de 18 a 28 años con empresas y fundaciones que buscan talento creativo.",
      "Al utilizar la plataforma, usted se compromete a:",
      "• Proporcionar información veraz, precisa y actualizada",
      "• No crear cuentas falsas ni suplantar la identidad de otra persona",
      "• No utilizar la plataforma para actividades ilegales o no autorizadas",
      "• Mantener la confidencialidad de sus credenciales de acceso (email y contraseña)",
      "• Notificar de inmediato cualquier uso no autorizado de su cuenta",
      "• Respetar los derechos de propiedad intelectual de otros usuarios",
    ],
  },
  {
    titulo: "3. Registro y Cuentas de Usuario",
    icono: BookOpen,
    contenido: [
      "Para acceder a las funcionalidades de la plataforma, deberá crear una cuenta proporcionando:",
      "",
      "Para artistas:",
      "• Nombre completo",
      "• Correo electrónico válido",
      "• Fecha de nacimiento (debe tener entre 18 y 28 años)",
      "• Área artística principal",
      "• Contraseña segura (mínimo 8 caracteres, con mayúscula, minúscula y número)",
      "",
      "Para empresas/fundaciones:",
      "• Nombre de la organización",
      "• Correo electrónico corporativo válido",
      "• Sector de la industria",
      "• Contraseña segura",
      "",
      "Jóvenes al Ruedo se reserva el derecho de suspender o eliminar cuentas que incumplan estos términos, sin previo aviso.",
    ],
  },
  {
    titulo: "4. Propiedad Intelectual",
    icono: Scale,
    contenido: [
      "Todo el contenido original de la plataforma Jóvenes al Ruedo (diseño, código, textos, logotipos e imágenes) es propiedad de Jóvenes al Ruedo — Proyecto SENA Ficha 3171599.",
      "Los portafolios, obras artísticas y contenido subido por los usuarios son propiedad exclusiva de sus respectivos autores.",
      "Al subir contenido a la plataforma, usted otorga a Jóvenes al Ruedo una licencia no exclusiva, gratuita y revocable para mostrar dicho contenido a las empresas registradas, con el único propósito de facilitar la conexión laboral.",
      "Está prohibido copiar, reproducir, distribuir o crear obras derivadas de cualquier contenido de la plataforma sin autorización expresa del titular de los derechos.",
    ],
  },
  {
    titulo: "5. Limitación de Responsabilidad",
    icono: AlertTriangle,
    contenido: [
      "Jóvenes al Ruedo actúa únicamente como plataforma de conexión entre artistas y empresas. No somos responsables de:",
      "• La veracidad de la información proporcionada por los usuarios",
      "• Los resultados de las postulaciones a convocatorias",
      "• Los acuerdos o contratos establecidos entre artistas y empresas fuera de la plataforma",
      "• Pérdidas económicas derivadas del uso de la plataforma",
      "• Interrupciones del servicio por mantenimiento o causas ajenas a nuestro control",
      "",
      "Si bien implementamos medidas de seguridad robustas (ver Política de Privacidad), no garantizamos que la plataforma esté libre de errores técnicos o vulnerabilidades de seguridad en todo momento.",
    ],
  },
  {
    titulo: "6. Conducta del Usuario",
    icono: UserCheck,
    contenido: [
      "Queda estrictamente prohibido:",
      "• Publicar contenido ofensivo, discriminatorio, violento o sexualmente explícito",
      "• Utilizar la plataforma para enviar spam o publicidad no solicitada",
      "• Intentar acceder a cuentas de otros usuarios sin autorización",
      "• Realizar ingeniería inversa o intentar vulnerar la seguridad de la plataforma",
      "• Utilizar bots, scripts o herramientas automatizadas sin autorización",
      "",
      "El incumplimiento de estas normas resultará en la suspensión o eliminación permanente de la cuenta, conforme a la Ley 1273 de 2009 (Delitos Informáticos en Colombia).",
    ],
  },
  {
    titulo: "7. Jurisdicción y Ley Aplicable",
    icono: MapPin,
    contenido: [
      "Estos Términos y Condiciones se rigen por las leyes de la República de Colombia.",
      "Cualquier controversia derivada del uso de la plataforma se resolverá ante los tribunales competentes de la ciudad de Bogotá D.C., Colombia.",
      "Son normas aplicables:",
      "• Ley 1581 de 2012 — Protección de Datos Personales",
      "• Decreto 1377 de 2013 — Reglamentación de la Ley 1581",
      "• Ley 1273 de 2009 — Delitos Informáticos",
      "• Ley 23 de 1982 — Derechos de Autor",
      "• Código de Comercio de Colombia",
    ],
  },
  {
    titulo: "8. Modificaciones",
    icono: BookOpen,
    contenido: [
      "Jóvenes al Ruedo se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.",
      "Los cambios serán notificados a través de la plataforma con al menos 10 días de anticipación.",
      "El uso continuado de la plataforma después de la notificación de cambios constituye la aceptación de los nuevos términos.",
      "Le recomendamos revisar esta página periódicamente.",
    ],
  },
];

/**
 * ¿Qué? Componente de página de T&C.
 * ¿Para qué? Mostrar al usuario las condiciones de uso antes de registrarse.
 * ¿Impacto? Permite que el consentimiento del registro sea legalmente válido.
 */
export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark">
      {/* Navbar */}
      <nav className="bg-brand-dark shadow-lg">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-brand-teal" />
            <span className="text-xl font-bold text-white">Jóvenes al Ruedo</span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-brand-teal hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-r from-brand-purple to-brand-blue py-12 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 flex justify-center">
            <Scale className="h-12 w-12 text-brand-teal" />
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Términos y Condiciones
          </h1>
          <p className="mt-3 text-brand-teal font-medium">
            Condiciones de uso de la plataforma Jóvenes al Ruedo
          </p>
          <p className="mt-2 text-gray-300 text-sm">
            Jóvenes al Ruedo — SENA Ficha 3171599 | Última actualización: Abril 2026
          </p>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Aviso introductorio */}
        <div className="animate-fade-in-up mb-8 rounded-xl border-l-4 border-brand-teal bg-white p-6 shadow-sm dark:bg-gray-800">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Al registrarse y utilizar <strong className="text-brand-purple dark:text-brand-teal">Jóvenes al Ruedo</strong>,
            usted acepta estos Términos y Condiciones en su totalidad. Le recomendamos leerlos
            detenidamente antes de crear su cuenta. Estos términos son complementarios
            a nuestra <Link to="/privacy-policy" className="text-brand-blue hover:underline font-medium">Política de Privacidad</Link>.
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-6">
          {secciones.map((seccion, index) => {
            const Icono = seccion.icono;
            return (
              <section
                key={index}
                className={`animate-fade-in-up delay-${Math.min(index, 7)} rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 card-hover`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10 dark:bg-brand-teal/10">
                    <Icono className="h-5 w-5 text-brand-purple dark:text-brand-teal" />
                  </div>
                  <h2 className="text-lg font-semibold text-brand-purple dark:text-brand-teal">
                    {seccion.titulo}
                  </h2>
                </div>
                <div className="space-y-2 pl-13">
                  {seccion.contenido.map((parrafo, pIndex) => (
                    <p
                      key={pIndex}
                      className={`text-sm leading-relaxed ${
                        parrafo === ""
                          ? "h-2"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {parrafo}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA de contacto */}
        <div className="animate-fade-in-up mt-8 rounded-xl bg-gradient-to-r from-brand-dark to-brand-purple p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            ¿Tienes preguntas sobre estos términos?
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Contáctanos si necesitas aclaración sobre cualquier sección:
          </p>
          <a
            href="mailto:soporte@jovenes-al-ruedo.com"
            className="inline-block rounded-lg bg-brand-teal px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            soporte@jovenes-al-ruedo.com
          </a>
        </div>

        {/* Navegación */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/privacy-policy" className="text-brand-blue hover:underline">
            Política de Privacidad
          </Link>
          {" · "}
          <Link to="/register" className="text-brand-blue hover:underline">
            Crear cuenta
          </Link>
          {" · "}
          <Link to="/login" className="text-brand-blue hover:underline">
            Iniciar sesión
          </Link>
          {" · "}
          <Link to="/" className="text-brand-blue hover:underline">
            Página principal
          </Link>
        </div>
      </main>
    </div>
  );
}
