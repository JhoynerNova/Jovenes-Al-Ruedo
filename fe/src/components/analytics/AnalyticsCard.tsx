import { Eye, TrendingUp, Star, Award, CheckCircle2, Briefcase, Sparkles } from "lucide-react";
import type { UserStats } from "@/api/analytics";

interface AnalyticsCardProps {
  stats: UserStats;
  role: "artista" | "empresa";
}

export function AnalyticsCard({ stats, role }: AnalyticsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-fade-in-up">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-brand-teal" /> Estadísticas de Impacto & Rendimiento
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Métricas de visibilidad, interacciones y efectividad en la plataforma
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2.5 py-1 text-xs font-semibold text-brand-teal">
          <Sparkles className="h-3.5 w-3.5" /> Métricas en Tiempo Real
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Vistas Estimadas */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Vistas del Perfil</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{stats.vistas_perfil}</p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">↑ Alcance semanal estimado</p>
        </div>

        {role === "artista" ? (
          <>
            {/* Tasa de Éxito */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Tasa de Aceptación</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{stats.tasa_exito}%</p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {stats.postulaciones_aceptadas} de {stats.total_postulaciones} postulaciones
              </p>
            </div>

            {/* Obras Destacadas */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Obras Publicadas</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total_obras}</p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">En tus portafolios</p>
            </div>

            {/* Reputación Promedio */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Calificación</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats.promedio_calificacion ? `${stats.promedio_calificacion} ★` : "Sin reseñas"}
              </p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {stats.total_calificaciones || 0} reseñas de empresas
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Convocatorias Publicadas */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Convocatorias</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total_convocatorias}</p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Publicaciones creadas</p>
            </div>

            {/* Postulaciones Recibidas */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Postulaciones</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{stats.postulaciones_recibidas}</p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Artistas interesados</p>
            </div>

            {/* Promedio por Convocatoria */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Atracción Promedio</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{stats.postulantes_promedio}</p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Postulantes por convocatoria</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
