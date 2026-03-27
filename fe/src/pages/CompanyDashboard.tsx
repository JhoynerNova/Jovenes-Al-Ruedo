/**
 * Archivo: pages/CompanyDashboard.tsx
 * Descripción: Dashboard profesional para usuarios con rol "empresa".
 * ¿Qué? Panel de control empresarial para gestionar convocatorias y descubrir talento artístico.
 * ¿Para qué? Centralizar las operaciones de reclutamiento artístico de la organización.
 * ¿Impacto? Sin este dashboard, las empresas/fundaciones no podrían gestionar sus convocatorias
 *           ni visualizar el talento disponible en la plataforma.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

/**
 * ¿Qué? Datos de muestra de convocatorias publicadas por la empresa.
 * ¿Para qué? Visualizar la interfaz mientras se implementan los endpoints reales.
 * ¿Impacto? Permite validar el diseño con datos realistas antes de conectar el backend.
 */
const misConvocatorias = [
  { id: 1, nombre: "Diseñador gráfico para campaña social", postulados: 8, estado: "Abierta", cierre: "2026-04-15", area: "Diseño" },
  { id: 2, nombre: "Músico para evento corporativo", postulados: 12, estado: "Abierta", cierre: "2026-04-01", area: "Música" },
  { id: 3, nombre: "Fotógrafo para catálogo de productos", postulados: 5, estado: "Cerrada", cierre: "2026-03-10", area: "Fotografía" },
  { id: 4, nombre: "Actor para video institucional", postulados: 18, estado: "Abierta", cierre: "2026-04-25", area: "Teatro" },
];

/**
 * ¿Qué? Datos de muestra de postulaciones recientes a las convocatorias.
 * ¿Para qué? Mostrar a la empresa quiénes se han inscrito últimamente.
 * ¿Impacto? Permite a la empresa actuar rápidamente sobre postulaciones nuevas.
 */
const postulacionesRecientes = [
  { id: 1, artista: "María Camila Torres", area: "Fotografía", convocatoria: "Fotógrafo para catálogo", fecha: "Hace 2 horas" },
  { id: 2, artista: "Juan David Ríos", area: "Música", convocatoria: "Músico para evento corporativo", fecha: "Hace 5 horas" },
  { id: 3, artista: "Laura V. Pérez", area: "Danza", convocatoria: "Actor para video institucional", fecha: "Hace 1 día" },
  { id: 4, artista: "Carlos A. Mejía", area: "Pintura", convocatoria: "Diseñador gráfico para campaña", fecha: "Hace 1 día" },
  { id: 5, artista: "Sofía Herrera", area: "Teatro", convocatoria: "Actor para video institucional", fecha: "Hace 2 días" },
];

/**
 * ¿Qué? Pestañas del dashboard empresarial.
 * ¿Para qué? Separar claramente las secciones del panel.
 * ¿Impacto? Navegación intuitiva estándar en plataformas B2B/SaaS.
 */
type Tab = "resumen" | "convocatorias" | "postulaciones";

export function CompanyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════
          HEADER EMPRESARIAL CON GRADIENTE
          ¿Qué? Banner superior con identidad de la empresa y acciones rápidas.
          ¿Para qué? Establecer un contexto profesional desde el primer momento.
          ¿Impacto? Un header empresarial con gradiente transmite seriedad y modernidad.
          ══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand-purple to-brand-blue p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* ¿Qué? Avatar con inicial de la empresa. */}
            {/* ¿Para qué? Identificación visual de la organización. */}
            {/* ¿Impacto? Un branding consistente genera confianza ante los artistas. */}
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold backdrop-blur-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{user?.full_name}</h1>
              <p className="text-sm text-white/80">{user?.sector || "Empresa"} · {user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm">+ Nueva convocatoria</Button>
            <Link to="/change-password">
              <Button variant="secondary" size="sm">⚙️ Configuración</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TABS DE NAVEGACIÓN
          ¿Qué? Pestañas para navegar entre las secciones del panel empresarial.
          ¿Para qué? Organizar información por contexto (resumen, convocatorias, postulaciones).
          ¿Impacto? Patrón estándar SaaS — reduce carga cognitiva y mejora la productividad.
          ══════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {([
            { key: "resumen" as Tab, label: "📊 Resumen" },
            { key: "convocatorias" as Tab, label: "📢 Mis Convocatorias" },
            { key: "postulaciones" as Tab, label: "📥 Postulaciones" },
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
          ¿Qué? Vista general con KPIs, perfil de la organización y actividad reciente.
          ¿Para qué? Dar a la empresa un panorama completo de su actividad en la plataforma.
          ¿Impacto? Un resumen ejecutivo limpio es la expectativa mínima en un SaaS empresarial.
          ══════════════════════════════════════════════ */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Convocatorias activas", valor: "3", cambio: "+1 esta semana", color: "border-l-brand-purple" },
              { label: "Total postulaciones", valor: "43", cambio: "+12 esta semana", color: "border-l-brand-teal" },
              { label: "Artistas visualizados", valor: "148", cambio: "+38 este mes", color: "border-l-brand-orange" },
              { label: "Tasa de respuesta", valor: "87%", cambio: "↑ 5% vs mes anterior", color: "border-l-brand-blue" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{m.valor}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{m.cambio}</p>
              </div>
            ))}
          </div>

          {/* Perfil de la organización */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Información de la organización</h2>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Nombre", valor: user?.full_name },
                { label: "Correo electrónico", valor: user?.email },
                { label: "Sector", valor: user?.sector || "—" },
                { label: "Estado", valor: user?.is_active ? "✅ Activa" : "❌ Inactiva" },
                { label: "Miembro desde", valor: user?.created_at ? new Date(user.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "—" },
                { label: "Convocatorias publicadas", valor: `${misConvocatorias.length} total` },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{item.valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Postulaciones recientes */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Postulaciones recientes</h2>
              <button
                onClick={() => setActiveTab("postulaciones")}
                className="text-sm font-medium text-brand-purple hover:text-brand-dark dark:text-brand-teal dark:hover:text-brand-teal/80"
              >
                Ver todas →
              </button>
            </div>
            <div className="space-y-2">
              {postulacionesRecientes.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-teal/20 text-sm font-bold text-brand-purple dark:text-brand-teal">
                    {p.artista.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.artista}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.area} · {p.convocatoria}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{p.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: MIS CONVOCATORIAS
          ¿Qué? Tabla completa de convocatorias publicadas por la empresa.
          ¿Para qué? Gestionar el ciclo de vida de cada convocatoria (crear, cerrar, ver postulados).
          ¿Impacto? Esta tabla es la herramienta principal de trabajo de la empresa en la plataforma.
          ══════════════════════════════════════════════ */}
      {activeTab === "convocatorias" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {misConvocatorias.length} convocatorias publicadas
            </p>
            <Button size="sm">+ Nueva convocatoria</Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Convocatoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Postulados</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cierre</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {misConvocatorias.map((conv) => (
                  <tr key={conv.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{conv.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple dark:text-purple-300">
                        {conv.area}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{conv.postulados}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        conv.estado === "Abierta"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {conv.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(conv.cierre).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button variant="secondary" size="sm">Ver detalle</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: POSTULACIONES
          ¿Qué? Feed completo de artistas que se han postulado a las convocatorias.
          ¿Para qué? Permitir evaluar candidatos y gestionar el proceso de selección.
          ¿Impacto? Una vista clara de postulaciones acelera la toma de decisiones
                    y reduce el tiempo de contratación de talento artístico.
          ══════════════════════════════════════════════ */}
      {activeTab === "postulaciones" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {postulacionesRecientes.length} postulaciones recibidas
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Artista</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Convocatoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {postulacionesRecientes.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-teal/20 text-xs font-bold text-brand-purple dark:text-brand-teal">
                          {p.artista.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{p.artista}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                        {p.area}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.convocatoria}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400 dark:text-gray-500">{p.fecha}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right space-x-2">
                      <Button variant="secondary" size="sm">Ver perfil</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
