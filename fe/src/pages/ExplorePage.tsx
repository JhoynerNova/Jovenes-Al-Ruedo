import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "@/api/users";
import { convocatoriasApi, type ConvResponse } from "@/api/convocatorias";
import type { UserResponse } from "@/types/auth";
import { Button } from "@/components/ui/Button";
import {
  ExternalLink, Search, MapPin, Briefcase, Clock, Star, Users, Filter,
  ChevronDown, X, Palette, Building2, Sparkles, TrendingUp, Zap, Award
} from "lucide-react";

type FeedTab = "todo" | "artistas" | "empresas" | "convocatorias";

/* ─── Helpers ─── */
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `Hace ${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? "es" : ""}`;
}

function calcEdad(bd: string): number {
  const hoy = new Date();
  const nac = new Date(bd);
  let e = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() - nac.getMonth() < 0 || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--;
  return e;
}

const NIVEL_COLORS: Record<string, string> = {
  principiante: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  intermedio: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  senior: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const JORNADA_ICONS: Record<string, string> = {
  "tiempo completo": "⏰",
  "medio tiempo": "🕐",
  freelance: "💻",
  temporal: "📅",
};

export function ExplorePage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>("todo");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterNivel, setFilterNivel] = useState("");
  const [filterJornada, setFilterJornada] = useState("");
  const [filterUbicacion, setFilterUbicacion] = useState("");

  const [artistas, setArtistas] = useState<UserResponse[]>([]);
  const [empresas, setEmpresas] = useState<UserResponse[]>([]);
  const [convs, setConvs] = useState<ConvResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [artistaRes, empresaRes, convRes] = await Promise.all([
        usersApi.exploreArtists({ limit: 30, search: search || undefined }),
        usersApi.exploreCompanies({ limit: 30, search: search || undefined }),
        convocatoriasApi.list({ limit: 50, search: search || undefined }),
      ]);
      setArtistas(artistaRes.items);
      setEmpresas(empresaRes.items);
      setConvs(convRes.items);

      if (isAuthenticated && user?.role === "artista") {
        try {
          const mis = await convocatoriasApi.getMisPostulaciones();
          setAppliedIds(new Set(mis.map((p) => p.id_conv)));
        } catch { /* */ }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApply = async (convId: number) => {
    if (!isAuthenticated) return;
    setApplyingId(convId);
    try {
      if (appliedIds.has(convId)) {
        await convocatoriasApi.withdraw(convId);
        setAppliedIds((prev) => { const s = new Set(prev); s.delete(convId); return s; });
      } else {
        await convocatoriasApi.apply(convId, {});
        setAppliedIds((prev) => new Set(prev).add(convId));
      }
    } catch (e: any) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setApplyingId(null);
    }
  };

  const clearFilters = () => {
    setFilterNivel("");
    setFilterJornada("");
    setFilterUbicacion("");
  };

  const hasActiveFilters = filterNivel || filterJornada || filterUbicacion;

  // Apply client-side filters to convocatorias
  const filteredConvs = convs.filter((c) => {
    if (filterNivel && c.nivel_experiencia?.toLowerCase() !== filterNivel.toLowerCase()) return false;
    if (filterJornada && c.tipo_jornada?.toLowerCase() !== filterJornada.toLowerCase()) return false;
    if (filterUbicacion && !c.ubicacion?.toLowerCase().includes(filterUbicacion.toLowerCase())) return false;
    return true;
  });

  // Stats
  const totalConvs = convs.length;
  const totalArtistas = artistas.length;
  const totalEmpresas = empresas.length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand-purple to-brand-teal p-6 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-7 w-7 text-yellow-300 animate-pulse" />
            <h1 className="text-2xl font-bold sm:text-3xl">Explorar Comunidad</h1>
          </div>
          <p className="mt-1 text-white/80 max-w-xl">Descubre artistas talentosos, empresas innovadoras y convocatorias abiertas en la plataforma</p>
          
          {/* Search Bar */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="Buscar artistas, empresas o convocatorias..."
                className="w-full rounded-xl border border-white/30 bg-white/15 py-3 pl-10 pr-4 text-sm text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all"
              />
            </div>
            <Button size="sm" variant="secondary" onClick={load}>Buscar</Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <Palette className="h-4 w-4" />
              <span className="font-semibold">{totalArtistas}</span> Artistas
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <Building2 className="h-4 w-4" />
              <span className="font-semibold">{totalEmpresas}</span> Empresas
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <Briefcase className="h-4 w-4" />
              <span className="font-semibold">{totalConvs}</span> Convocatorias
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 overflow-x-auto">
          {([
            { key: "todo" as FeedTab, label: "Todo", icon: <Sparkles className="h-4 w-4" />, count: totalArtistas + totalEmpresas + totalConvs },
            { key: "artistas" as FeedTab, label: "Artistas", icon: <Palette className="h-4 w-4" />, count: totalArtistas },
            { key: "empresas" as FeedTab, label: "Empresas", icon: <Building2 className="h-4 w-4" />, count: totalEmpresas },
            { key: "convocatorias" as FeedTab, label: "Convocatorias", icon: <Briefcase className="h-4 w-4" />, count: filteredConvs.length },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "border-brand-purple text-brand-purple dark:border-brand-teal dark:text-brand-teal"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === tab.key 
                  ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-teal/10 dark:text-brand-teal"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>

        {(activeTab === "todo" || activeTab === "convocatorias") && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              showFilters || hasActiveFilters
                ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-teal/10 dark:text-brand-teal"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white">
                {[filterNivel, filterJornada, filterUbicacion].filter(Boolean).length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── FILTERS PANEL ── */}
      {showFilters && (activeTab === "todo" || activeTab === "convocatorias") && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-purple" /> Filtrar Convocatorias
            </h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                <X className="h-3 w-3" /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Nivel */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experiencia</label>
              <div className="relative">
                <select
                  value={filterNivel}
                  onChange={(e) => setFilterNivel(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Todos los niveles</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="senior">Senior</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            {/* Jornada */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo de Contrato</label>
              <div className="relative">
                <select
                  value={filterJornada}
                  onChange={(e) => setFilterJornada(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Todas las jornadas</option>
                  <option value="tiempo completo">Tiempo Completo</option>
                  <option value="medio tiempo">Medio Tiempo</option>
                  <option value="freelance">Freelance</option>
                  <option value="temporal">Temporal</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            {/* Ubicación */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</label>
              <input
                type="text"
                value={filterUbicacion}
                onChange={(e) => setFilterUbicacion(e.target.value)}
                placeholder="Ej: Bogotá"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
            <p className="text-sm text-gray-500 animate-pulse">Cargando comunidad...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* ════════════════════ ARTISTAS ════════════════════ */}
          {(activeTab === "todo" || activeTab === "artistas") && (
            <section>
              {activeTab === "todo" && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-brand-purple" /> Artistas Destacados
                  </h2>
                  {activeTab === "todo" && artistas.length > 4 && (
                    <button onClick={() => setActiveTab("artistas")} className="text-sm font-medium text-brand-purple hover:underline">Ver todos →</button>
                  )}
                </div>
              )}
              {artistas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
                  <Palette className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500">No se encontraron artistas</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {(activeTab === "todo" ? artistas.slice(0, 4) : artistas).map((a) => (
                    <Link to={`/perfil/${a.id}`} key={a.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-purple/40 hover:shadow-lg hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900">
                      {/* Card gradient top */}
                      <div className="h-16 bg-gradient-to-r from-brand-purple/20 via-purple-400/10 to-brand-teal/20" />
                      <div className="p-5 pt-0 -mt-6">
                        <div className="flex items-end gap-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-brand-purple/30 to-brand-teal/30 text-lg font-bold text-brand-purple shadow-sm dark:border-gray-800 dark:text-brand-teal">
                            {a.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <h3 className="truncate font-semibold text-gray-900 dark:text-white">{a.full_name}</h3>
                            {a.artistic_area && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/10 px-2 py-0.5 text-[11px] font-semibold text-brand-purple dark:text-purple-300">
                                <Palette className="h-3 w-3" /> {a.artistic_area}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 space-y-1.5">
                          {a.location && <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><MapPin className="h-3 w-3" /> {a.location}</p>}
                          {a.birth_date && <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><Clock className="h-3 w-3" /> {calcEdad(a.birth_date)} años</p>}
                          {a.bio && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">{a.bio}</p>}
                        </div>
                        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                          <span className="flex items-center gap-1 text-xs font-medium text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-3 w-3" /> Ver perfil completo
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "todo" && artistas.length > 0 && empresas.length > 0 && (
            <hr className="border-gray-200 dark:border-gray-700" />
          )}

          {/* ════════════════════ EMPRESAS ════════════════════ */}
          {(activeTab === "todo" || activeTab === "empresas") && (
            <section>
              {activeTab === "todo" && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-brand-blue" /> Empresas en la Plataforma
                  </h2>
                  {activeTab === "todo" && empresas.length > 4 && (
                    <button onClick={() => setActiveTab("empresas")} className="text-sm font-medium text-brand-blue hover:underline">Ver todas →</button>
                  )}
                </div>
              )}
              {empresas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
                  <Building2 className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500">No se encontraron empresas</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {(activeTab === "todo" ? empresas.slice(0, 4) : empresas).map((e) => (
                    <Link to={`/perfil/${e.id}`} key={e.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-blue/40 hover:shadow-lg hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900">
                      <div className="h-16 bg-gradient-to-r from-brand-blue/20 via-blue-400/10 to-brand-dark/20" />
                      <div className="p-5 pt-0 -mt-6">
                        <div className="flex items-end gap-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-brand-blue/30 to-brand-dark/30 text-lg font-bold text-brand-blue shadow-sm dark:border-gray-800 dark:text-blue-300">
                            {e.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <h3 className="truncate font-semibold text-gray-900 dark:text-white">{e.full_name}</h3>
                            {e.sector && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] font-semibold text-brand-blue dark:text-blue-300">
                                <Briefcase className="h-3 w-3" /> {e.sector}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3">
                          {e.location && <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><MapPin className="h-3 w-3" /> {e.location}</p>}
                          {e.bio && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">{e.bio}</p>}
                        </div>
                        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                          <span className="flex items-center gap-1 text-xs font-medium text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-3 w-3" /> Ver perfil completo
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "todo" && empresas.length > 0 && filteredConvs.length > 0 && (
            <hr className="border-gray-200 dark:border-gray-700" />
          )}

          {/* ════════════════════ CONVOCATORIAS ════════════════════ */}
          {(activeTab === "todo" || activeTab === "convocatorias") && (
            <section>
              {activeTab === "todo" && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-brand-teal" /> Convocatorias Abiertas
                  </h2>
                  {activeTab === "todo" && filteredConvs.length > 6 && (
                    <button onClick={() => setActiveTab("convocatorias")} className="text-sm font-medium text-brand-teal hover:underline">Ver todas →</button>
                  )}
                </div>
              )}
              {filteredConvs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
                  <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    {hasActiveFilters ? "No hay convocatorias con esos filtros" : "No hay convocatorias disponibles"}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-2 text-sm font-medium text-brand-purple hover:underline">Limpiar filtros</button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeTab === "todo" ? filteredConvs.slice(0, 6) : filteredConvs).map((c) => {
                    const daysAgo = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000);
                    const isUrgent = daysAgo <= 2;
                    const isTrending = c.total_inscritos >= 5;
                    const applied = appliedIds.has(c.id_conv);

                    return (
                      <div key={c.id_conv} className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900">
                        {/* Badges */}
                        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                          {isUrgent && (
                            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
                              <Zap className="h-3 w-3" /> ¡Nuevo!
                            </span>
                          )}
                          {isTrending && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                              <TrendingUp className="h-3 w-3" /> Popular
                            </span>
                          )}
                        </div>

                        {/* Card Header */}
                        <div className="p-5 flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal/20 to-brand-purple/10 text-brand-teal dark:from-brand-teal/30 dark:to-brand-purple/20">
                              <Award className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">{c.nombre}</h3>
                              {c.empresa_nombre && (
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {c.empresa_nombre}{c.empresa_sector ? ` · ${c.empresa_sector}` : ""}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Location */}
                          {c.ubicacion && (
                            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <MapPin className="h-3.5 w-3.5 text-brand-teal" /> {c.ubicacion}
                            </p>
                          )}

                          {/* Description */}
                          {c.glue && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">{c.glue}</p>}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {c.nivel_experiencia && (
                              <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${NIVEL_COLORS[c.nivel_experiencia.toLowerCase()] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                <Star className="h-3 w-3" /> Nivel: {c.nivel_experiencia}
                              </span>
                            )}
                            {c.tipo_jornada && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {JORNADA_ICONS[c.tipo_jornada.toLowerCase()] || "📋"} {c.tipo_jornada}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3.5 bg-gray-50/50 dark:bg-gray-800/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {c.rango_salarial && (
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{c.rango_salarial}</span>
                              )}
                              {!c.rango_salarial && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Users className="h-3.5 w-3.5" /> {c.total_inscritos} postulados
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400">{timeAgo(c.created_at)}</span>
                          </div>
                          
                          {c.rango_salarial && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                              <Users className="h-3 w-3" /> {c.total_inscritos} postulados
                            </div>
                          )}

                          {/* CTA */}
                          <div className="mt-3">
                            {isAuthenticated && user?.role === "artista" ? (
                              <button
                                onClick={() => handleApply(c.id_conv)}
                                disabled={applyingId === c.id_conv}
                                className={`w-full rounded-lg py-2.5 text-sm font-bold transition-all shadow-sm ${
                                  applied
                                    ? "bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                    : "bg-brand-purple text-white hover:bg-brand-purple/90 shadow-md shadow-brand-purple/20 hover:shadow-lg hover:shadow-brand-purple/30 active:scale-[0.98]"
                                }`}
                              >
                                {applyingId === c.id_conv
                                  ? "..."
                                  : applied
                                  ? "✓ Postulado · Click para retirar"
                                  : "Aplicar Ahora"}
                              </button>
                            ) : !isAuthenticated ? (
                              <Link to="/login" className="block">
                                <button className="w-full rounded-lg bg-brand-purple py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-purple/90 transition-all">
                                  Ingresar para postularse
                                </button>
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
