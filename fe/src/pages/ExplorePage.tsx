import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "@/api/users";
import { convocatoriasApi, type ConvResponse } from "@/api/convocatorias";
import type { UserResponse } from "@/types/auth";
import { Button } from "@/components/ui/Button";

type FeedTab = "todo" | "artistas" | "empresas" | "convocatorias";

export function ExplorePage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>("todo");
  const [search, setSearch] = useState("");

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
        convocatoriasApi.list({ limit: 30, search: search || undefined }),
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
        await convocatoriasApi.apply(convId);
        setAppliedIds((prev) => new Set(prev).add(convId));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setApplyingId(null);
    }
  };

  const calcEdad = (bd: string) => {
    const hoy = new Date();
    const nac = new Date(bd);
    let e = hoy.getFullYear() - nac.getFullYear();
    if (hoy.getMonth() - nac.getMonth() < 0 || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--;
    return e;
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand-purple to-brand-teal p-6 text-white shadow-lg sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl font-bold sm:text-3xl">🌐 Explorar la comunidad</h1>
          <p className="mt-2 text-white/80">Descubre artistas, empresas y convocatorias de la plataforma</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Buscar artistas, empresas o convocatorias..."
              className="flex-1 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 sm:max-w-md"
            />
            <Button size="sm" variant="secondary" onClick={load}>Buscar</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6 overflow-x-auto">
          {([
            { key: "todo" as FeedTab, label: "🏠 Todo", count: artistas.length + empresas.length + convs.length },
            { key: "artistas" as FeedTab, label: "🎨 Artistas", count: artistas.length },
            { key: "empresas" as FeedTab, label: "🏢 Empresas", count: empresas.length },
            { key: "convocatorias" as FeedTab, label: "💼 Convocatorias", count: convs.length },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-brand-purple text-brand-purple dark:border-brand-teal dark:text-brand-teal"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
        </div>
      )}

      {!loading && (
        <>
          {/* ── ARTISTAS ── */}
          {(activeTab === "todo" || activeTab === "artistas") && (
            <section>
              {activeTab === "todo" && <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">🎨 Artistas</h2>}
              {artistas.length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron artistas</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {artistas.map((a) => (
                    <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-purple/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple/30 to-brand-teal/30 text-lg font-bold text-brand-purple dark:text-brand-teal">
                          {a.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900 dark:text-white">{a.full_name}</h3>
                          {a.artistic_area && (
                            <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs font-medium text-brand-purple dark:text-purple-300">
                              {a.artistic_area}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {a.location && <p className="text-xs text-gray-500 dark:text-gray-400">📍 {a.location}</p>}
                        {a.birth_date && <p className="text-xs text-gray-500 dark:text-gray-400">🎂 {calcEdad(a.birth_date)} años</p>}
                        {a.bio && <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{a.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "todo" && artistas.length > 0 && empresas.length > 0 && (
            <hr className="border-gray-200 dark:border-gray-700" />
          )}

          {/* ── EMPRESAS ── */}
          {(activeTab === "todo" || activeTab === "empresas") && (
            <section>
              {activeTab === "todo" && <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">🏢 Empresas</h2>}
              {empresas.length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron empresas</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {empresas.map((e) => (
                    <div key={e.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-blue/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue/30 to-brand-dark/30 text-lg font-bold text-brand-blue dark:text-blue-300">
                          {e.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900 dark:text-white">{e.full_name}</h3>
                          {e.sector && (
                            <span className="inline-flex items-center rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-medium text-brand-blue dark:text-blue-300">
                              {e.sector}
                            </span>
                          )}
                        </div>
                      </div>
                      {e.location && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">📍 {e.location}</p>}
                      {e.bio && <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{e.bio}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "todo" && empresas.length > 0 && convs.length > 0 && (
            <hr className="border-gray-200 dark:border-gray-700" />
          )}

          {/* ── CONVOCATORIAS ── */}
          {(activeTab === "todo" || activeTab === "convocatorias") && (
            <section>
              {activeTab === "todo" && <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">💼 Convocatorias abiertas</h2>}
              {convs.length === 0 ? (
                <p className="text-sm text-gray-500">No hay convocatorias disponibles</p>
              ) : (
                <div className="space-y-3">
                  {convs.map((c) => (
                    <div key={c.id_conv} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-teal/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{c.nombre}</h3>
                          {c.empresa_nombre && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              🏢 {c.empresa_nombre}{c.empresa_sector ? ` · ${c.empresa_sector}` : ""}
                            </p>
                          )}
                          {c.glue && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{c.glue}</p>}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              👥 {c.total_inscritos} postulados
                            </span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              📅 {new Date(c.created_at).toLocaleDateString("es-CO")}
                            </span>
                          </div>
                        </div>
                        {isAuthenticated && user?.role === "artista" && (
                          <Button
                            size="sm"
                            variant={appliedIds.has(c.id_conv) ? "secondary" : "primary"}
                            onClick={() => handleApply(c.id_conv)}
                            disabled={applyingId === c.id_conv}
                          >
                            {applyingId === c.id_conv ? "..." : appliedIds.has(c.id_conv) ? "Retirar" : "Postularme"}
                          </Button>
                        )}
                        {!isAuthenticated && (
                          <Link to="/login">
                            <Button size="sm" variant="secondary">Ingresar para postularse</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
