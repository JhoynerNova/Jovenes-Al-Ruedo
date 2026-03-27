/**
 * Archivo: pages/ArtistDashboard.tsx
 * Descripción: Dashboard profesional para usuarios con rol "artista".
 * ¿Qué? Panel principal que centraliza la experiencia del artista en la plataforma.
 * ¿Para qué? Dar al artista acceso rápido a su perfil, portafolio, convocatorias y métricas.
 * ¿Impacto? Un dashboard bien diseñado retiene al usuario y facilita la gestión de su carrera artística.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

/**
 * ¿Qué? Datos de muestra para el portafolio del artista.
 * ¿Para qué? Demostrar la interfaz antes de conectar con los endpoints CRUD reales.
 * ¿Impacto? Permite validar el diseño y flujo de usuario con datos realistas.
 */
const portafolioItems = [
  { id: 1, nombre: "Sesión fotográfica urbana", tipo: "Fotografía", fecha: "2026-03-15", estado: "Publicado" },
  { id: 2, nombre: "Mural comunitario Barrio Kennedy", tipo: "Pintura", fecha: "2026-02-20", estado: "Publicado" },
  { id: 3, nombre: "Cortometraje 'Raíces'", tipo: "Cine", fecha: "2026-01-10", estado: "En revisión" },
];

/**
 * ¿Qué? Datos de muestra para convocatorias activas disponibles.
 * ¿Para qué? Mostrar el tipo de oportunidades que un artista puede encontrar.
 * ¿Impacto? Las convocatorias son el corazón del marketplace — sin ellas no hay conexión empleo-talento.
 */
const convocatorias = [
  { id: 1, nombre: "Festival de Artes Jóvenes 2026", empresa: "Fundación Cultural Bogotá", cierre: "2026-04-15", area: "Múltiple", postulados: 32 },
  { id: 2, nombre: "Muralista para espacio coworking", empresa: "WeWork Colombia", cierre: "2026-04-01", area: "Pintura", postulados: 8 },
  { id: 3, nombre: "Banda sonora documental", empresa: "Canal Capital", cierre: "2026-04-20", area: "Música", postulados: 15 },
  { id: 4, nombre: "Bailarines para evento corporativo", empresa: "Bavaria S.A.", cierre: "2026-04-28", area: "Danza", postulados: 22 },
];

/**
 * ¿Qué? Pestaña activa del dashboard (resumen, portafolio, convocatorias).
 * ¿Para qué? Organizar el contenido en secciones navegables sin cambiar de página.
 * ¿Impacto? Reduce la complejidad visual — el artista solo ve lo que necesita en cada momento.
 */
type Tab = "resumen" | "portafolio" | "convocatorias";

export function ArtistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");

  /**
   * ¿Qué? Función para calcular la edad a partir de la fecha de nacimiento.
   * ¿Para qué? Mostrar la edad del artista en el perfil sin enviarla desde el backend.
   * ¿Impacto? Es un dato relevante ya que la plataforma es para jóvenes de 18 a 28 años.
   */
  const calcularEdad = (fechaNac: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════
          HEADER CON GRADIENTE Y PERFIL RÁPIDO
          ¿Qué? Banner superior con información del artista y acciones rápidas.
          ¿Para qué? Primera impresión profesional y acceso inmediato a datos clave.
          ¿Impacto? Un header premium genera confianza y retiene al usuario en la plataforma.
          ══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* ¿Qué? Avatar con iniciales del artista. */}
            {/* ¿Para qué? Identificación visual rápida sin necesidad de foto. */}
            {/* ¿Impacto? Un avatar hace que el perfil se sienta personal y profesional. */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{user?.full_name}</h1>
              <p className="text-sm text-white/80">{user?.artistic_area || "Artista"} · {user?.email}</p>
              {user?.birth_date && (
                <p className="text-xs text-white/60">{calcularEdad(user.birth_date)} años</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/change-password">
              <Button variant="secondary" size="sm">⚙️ Configuración</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TABS DE NAVEGACIÓN
          ¿Qué? Pestañas para navegar entre secciones del dashboard.
          ¿Para qué? Organizar el contenido sin recargar la página.
          ¿Impacto? Una navegación por tabs es estándar en dashboards profesionales
                    y reduce la sobrecarga cognitiva del usuario.
          ══════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {([
            { key: "resumen" as Tab, label: "📊 Resumen" },
            { key: "portafolio" as Tab, label: "🖼️ Mi Portafolio" },
            { key: "convocatorias" as Tab, label: "💼 Convocatorias" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-brand-purple text-brand-purple dark:border-brand-teal dark:text-brand-teal"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ══════════════════════════════════════════════
          TAB: RESUMEN
          ¿Qué? Vista general con métricas, actividad reciente y datos del perfil.
          ¿Para qué? Dar al artista un panorama completo al iniciar sesión.
          ¿Impacto? Un buen resumen evita que el usuario tenga que navegar múltiples secciones.
          ══════════════════════════════════════════════ */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          {/* Tarjetas de métricas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Trabajos en portafolio", valor: "3", cambio: "+1 este mes", color: "border-l-brand-purple" },
              { label: "Convocatorias disponibles", valor: "12", cambio: "4 nuevas", color: "border-l-brand-teal" },
              { label: "Postulaciones enviadas", valor: "2", cambio: "1 en revisión", color: "border-l-brand-orange" },
              { label: "Perfil completado", valor: "75%", cambio: "Falta portafolio", color: "border-l-brand-blue" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{m.valor}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{m.cambio}</p>
              </div>
            ))}
          </div>

          {/* Perfil detallado */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Información del perfil</h2>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Nombre completo", valor: user?.full_name },
                { label: "Correo electrónico", valor: user?.email },
                { label: "Área artística", valor: user?.artistic_area || "—" },
                { label: "Fecha de nacimiento", valor: user?.birth_date ? new Date(user.birth_date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                { label: "Estado", valor: user?.is_active ? "✅ Activo" : "❌ Inactivo" },
                { label: "Miembro desde", valor: user?.created_at ? new Date(user.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "—" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{item.valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Actividad reciente */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Actividad reciente</h2>
            <div className="space-y-3">
              {[
                { accion: "Subiste una nueva pieza al portafolio", detalle: "Cortometraje 'Raíces'", tiempo: "Hace 2 horas", icono: "🖼️" },
                { accion: "Te postulaste a una convocatoria", detalle: "Festival de Artes Jóvenes 2026", tiempo: "Hace 1 día", icono: "📤" },
                { accion: "Actualizaste tu perfil", detalle: "Área artística cambiada", tiempo: "Hace 3 días", icono: "✏️" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="mt-0.5 text-lg">{a.icono}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.accion}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.detalle}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{a.tiempo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: PORTAFOLIO
          ¿Qué? Gestión completa de los trabajos artísticos del usuario.
          ¿Para qué? El portafolio es la carta de presentación del artista ante las empresas.
          ¿Impacto? Un artista sin portafolio tiene 0% de probabilidad de ser seleccionado.
          ══════════════════════════════════════════════ */}
      {activeTab === "portafolio" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {portafolioItems.length} trabajos en tu portafolio
            </p>
            <Button size="sm">+ Agregar trabajo</Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Trabajo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {portafolioItems.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple dark:text-purple-300">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.estado === "Publicado"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button variant="secondary" size="sm">Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: CONVOCATORIAS
          ¿Qué? Marketplace de oportunidades laborales artísticas.
          ¿Para qué? Conectar al artista con empresas que buscan talento creativo.
          ¿Impacto? Esta es la función core de Jóvenes al Ruedo — sin convocatorias
                    la plataforma no tiene razón de existir.
          ══════════════════════════════════════════════ */}
      {activeTab === "convocatorias" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {convocatorias.length} convocatorias abiertas
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-500">Ordenadas por fecha de cierre</div>
          </div>

          <div className="space-y-3">
            {convocatorias.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-purple/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-teal/40">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.nombre}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">🏢 {c.empresa}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                        {c.area}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        📅 Cierre: {new Date(c.cierre).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        👥 {c.postulados} postulados
                      </span>
                    </div>
                  </div>
                  <Button size="sm">Postularme</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
