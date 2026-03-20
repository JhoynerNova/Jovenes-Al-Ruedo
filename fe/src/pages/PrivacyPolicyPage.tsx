/**
 * Archivo: pages/PrivacyPolicyPage.tsx
 * ¿Qué? Página pública con la Política de Privacidad de Jóvenes al Ruedo.
 * ¿Para qué? Cumplir con la Ley 1581 de 2012 y el Decreto 1377 de 2013,
 *            que obligan a informar al titular sobre el tratamiento de sus datos.
 * ¿Impacto? Sin esta página, el registro de usuarios sería ilegal en Colombia,
 *           ya que el titular debe conocer la política antes de dar su consentimiento.
 */

import { Link } from "react-router-dom";

/**
 * ¿Qué? Secciones de la política de privacidad.
 * ¿Para qué? Centralizar el contenido de la política para facilitar actualizaciones.
 * ¿Impacto? Actualizar una sección aquí se refleja automáticamente en toda la página.
 */
const secciones = [
  {
    titulo: "1. Responsable del Tratamiento",
    contenido: [
      "Jóvenes al Ruedo, proyecto educativo SENA Ficha 3171599, actúa como responsable del tratamiento de los datos personales recolectados a través de esta plataforma.",
      "Para ejercer sus derechos o realizar consultas, comuníquese a: privacidad@jovenes-al-ruedo.com",
    ],
  },
  {
    titulo: "2. Datos Personales Recolectados",
    contenido: [
      "Recolectamos los siguientes datos personales:",
      "• Nombre completo",
      "• Dirección de correo electrónico",
      "• Fecha de nacimiento",
      "• Área artística",
      "• Contraseña (almacenada como hash bcrypt — nunca en texto plano)",
      "• Portafolios artísticos (archivos subidos voluntariamente)",
      "• Historial de postulaciones a convocatorias",
      "• Cookies de sesión (HTTPOnly — no accesibles por JavaScript)",
    ],
  },
  {
    titulo: "3. Finalidad del Tratamiento (Art. 4, Ley 1581 de 2012)",
    contenido: [
      "Sus datos personales son utilizados exclusivamente para:",
      "• Autenticación y control de acceso a la plataforma",
      "• Gestión del perfil artístico del usuario",
      "• Publicación de portafolios para visibilidad ante empresas",
      "• Notificación de convocatorias artísticas relevantes",
      "• Envío de correos de recuperación de contraseña",
      "• Análisis estadístico anónimo del uso de la plataforma",
      "• Cumplimiento de obligaciones legales aplicables en Colombia",
    ],
  },
  {
    titulo: "4. Derechos del Titular (Art. 8, Ley 1581 de 2012)",
    contenido: [
      "Como titular de sus datos personales, usted tiene derecho a:",
      "• Conocer, actualizar y rectificar sus datos personales",
      "• Solicitar prueba de la autorización otorgada para el tratamiento",
      "• Ser informado sobre el uso que se ha dado a sus datos personales",
      "• Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)",
      "• Revocar la autorización y/o solicitar la supresión de sus datos",
      "• Acceder gratuitamente a sus datos personales tratados",
      "",
      "Para ejercer cualquiera de estos derechos, contáctenos en: privacidad@jovenes-al-ruedo.com",
    ],
  },
  {
    titulo: "5. Política de Cookies",
    contenido: [
      "Utilizamos cookies HTTPOnly para gestionar su sesión de forma segura:",
      "",
      "access_token — Token JWT de acceso (duración: 15 minutos)",
      "Propósito: Mantener la sesión activa. Al ser HTTPOnly, JavaScript no puede leerla, lo que protege su sesión contra ataques XSS.",
      "",
      "refresh_token — Token de refresco (duración: 7 días)",
      "Propósito: Renovar la sesión sin requerir login frecuente. Solo se envía al endpoint de renovación.",
      "",
      "Estas cookies son estrictamente necesarias para el funcionamiento de la plataforma. Al registrarse, usted acepta su uso.",
    ],
  },
  {
    titulo: "6. Seguridad de los Datos (Ley 1273 de 2009)",
    contenido: [
      "Implementamos medidas de seguridad técnicas y organizativas conforme a:",
      "• Ley 1273 de 2009 (Delitos Informáticos en Colombia)",
      "• OWASP Top 10 — directrices de seguridad para aplicaciones web",
      "",
      "Medidas implementadas:",
      "• Contraseñas almacenadas con hash bcrypt (irreversible)",
      "• Tokens JWT firmados con clave secreta",
      "• Cookies HTTPOnly + SameSite=Lax para prevenir XSS y CSRF",
      "• Headers de seguridad: X-Content-Type-Options, X-Frame-Options, HSTS",
      "• Comunicación cifrada mediante HTTPS en producción",
    ],
  },
  {
    titulo: "7. Transferencia de Datos a Terceros",
    contenido: [
      "Jóvenes al Ruedo NO comparte, vende ni transfiere sus datos personales a terceros sin su consentimiento explícito, salvo por obligación legal.",
      "Los datos pueden ser compartidos únicamente con empresas que publiquen convocatorias en la plataforma, y solo la información de su perfil artístico que usted decida hacer pública.",
    ],
  },
  {
    titulo: "8. Modificaciones a esta Política",
    contenido: [
      "Esta política puede ser modificada en cualquier momento para reflejar cambios en nuestras prácticas o en la legislación aplicable.",
      "Los cambios se notificarán a través de la plataforma con al menos 10 días de anticipación.",
      "Le recomendamos revisar esta política periódicamente.",
    ],
  },
];

/**
 * ¿Qué? Componente de página de Política de Privacidad.
 * ¿Para qué? Mostrar al usuario toda la información sobre el tratamiento de sus datos.
 * ¿Impacto? Permite que el usuario tome una decisión informada antes de registrarse,
 *           cumpliendo con el principio de consentimiento libre e informado (Ley 1581/2012).
 */
export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark">
      {/* ¿Qué? Navbar de la página de privacidad. */}
      {/* ¿Para qué? Permitir al usuario navegar de regreso al login o al registro. */}
      {/* ¿Impacto? Sin navbar, el usuario quedaría atrapado en la página sin poder salir. */}
      <nav className="bg-brand-dark shadow-lg">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
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

      {/* ¿Qué? Encabezado de la política con fondo de color de marca. */}
      {/* ¿Para qué? Identificar visualmente la sección y dar contexto legal. */}
      {/* ¿Impacto? El fondo brand-purple indica una sección oficial e importante. */}
      <header className="bg-brand-purple py-12 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-3 text-brand-teal font-medium">
            Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013
          </p>
          <p className="mt-2 text-gray-300 text-sm">
            Jóvenes al Ruedo — SENA Ficha 3171599 | Fecha de vigencia: 2026
          </p>
        </div>
      </header>

      {/* ¿Qué? Contenido principal de la política de privacidad. */}
      {/* ¿Para qué? Presentar cada sección de forma clara y legible. */}
      {/* ¿Impacto? La lectura fácil garantiza que el consentimiento sea verdaderamente informado. */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* ¿Qué? Aviso legal introductorio. */}
        {/* ¿Para qué? Contextualizar la política antes de las secciones detalladas. */}
        {/* ¿Impacto? El usuario comprende de inmediato el propósito del documento. */}
        <div className="mb-8 rounded-xl border-l-4 border-brand-teal bg-white p-6 shadow-sm dark:bg-gray-800">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            En <strong className="text-brand-purple dark:text-brand-teal">Jóvenes al Ruedo</strong>,
            respetamos su privacidad y nos comprometemos a proteger sus datos personales conforme
            a la legislación colombiana. Al registrarse en nuestra plataforma, usted acepta
            los términos descritos en esta política.
          </p>
        </div>

        {/* ¿Qué? Renderizado dinámico de cada sección de la política. */}
        {/* ¿Para qué? Evitar JSX repetitivo — cada sección tiene el mismo formato. */}
        {/* ¿Impacto? Agregar una nueva sección solo requiere añadir un objeto al array `secciones`. */}
        <div className="space-y-6">
          {secciones.map((seccion, index) => (
            <section
              key={index}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              {/* ¿Qué? Título de la sección con color de marca. */}
              {/* ¿Para qué? Separar visualmente cada tema de la política. */}
              {/* ¿Impacto? brand-purple mantiene consistencia con la identidad visual. */}
              <h2 className="mb-4 text-lg font-semibold text-brand-purple dark:text-brand-teal">
                {seccion.titulo}
              </h2>
              <div className="space-y-2">
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
          ))}
        </div>

        {/* ¿Qué? Sección de contacto para ejercer derechos ARCO. */}
        {/* ¿Para qué? Facilitar al usuario el contacto para ejercer sus derechos. */}
        {/* ¿Impacto? Art. 8 Ley 1581/2012 — el responsable debe facilitar el ejercicio de derechos. */}
        <div className="mt-8 rounded-xl bg-brand-dark p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            ¿Preguntas sobre su privacidad?
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Para ejercer sus derechos o resolver dudas sobre el tratamiento de sus datos:
          </p>
          <a
            href="mailto:privacidad@jovenes-al-ruedo.com"
            className="inline-block rounded-lg bg-brand-teal px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            privacidad@jovenes-al-ruedo.com
          </a>
        </div>

        {/* ¿Qué? Footer con links de navegación. */}
        {/* ¿Para qué? Facilitar la navegación desde la página de privacidad. */}
        {/* ¿Impacto? Mejora la UX al no dejar al usuario "atrapado" en la página. */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
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
