import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { convocatoriasApi, type ConvResponse, type MiPostulacion } from "@/api/convocatorias";
import { portafolioApi, type PortafolioResponse } from "@/api/portafolio";

type Tab = "resumen" | "portafolio" | "convocatorias" | "mis-postulaciones";

export function ArtistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");

  // Portafolio
  const [portafolios, setPortafolios] = useState<PortafolioResponse[]>([]);
  const [loadingPort, setLoadingPort] = useState(false);
  const [showNewPort, setShowNewPort] = useState(false);
  const [newPortNombre, setNewPortNombre] = useState("");
  const [portError, setPortError] = useState("");

  // Convocatorias
  const [convs, setConvs] = useState<ConvResponse[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [searchConv, setSearchConv] = useState("");
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [convMsg, setConvMsg] = useState("");

  // Mis postulaciones
  const [misPost, setMisPost] = useState<MiPostulacion[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);

  const calcularEdad = (fechaNac: string) => {
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const loadPortafolios = useCallback(async () => {
    setLoadingPort(true);
    try {
      const data = await portafolioApi.list();
      setPortafolios(data);
    } catch {
      // silent
    } finally {
      setLoadingPort(false);
    }
  }, []);

  const loadConvocatorias = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await convocatoriasApi.list({ limit: 50, search: searchConv || undefined });
      setConvs(data.items);
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }, [searchConv]);

  const loadMisPostulaciones = useCallback(async () => {
    setLoadingPost(true);
    try {
      const data = await convocatoriasApi.getMisPostulaciones();
      setMisPost(data);
      setAppliedIds(new Set(data.map((p) => p.id_conv)));
    } catch {
      // silent
    } finally {
      setLoadingPost(false);
    }
  }, []);

  useEffect(() => {
    loadPortafolios();
    loadMisPostulaciones();
  }, [loadPortafolios, loadMisPostulaciones]);

  useEffect(() => {
    if (activeTab === "convocatorias") loadConvocatorias();
  }, [activeTab, loadConvocatorias]);

  const handleCreatePortafolio = async () => {
    if (!newPortNombre.trim()) return;
    setPortError("");
    try {
      await portafolioApi.create(newPortNombre.trim());
      setNewPortNombre("");
      setShowNewPort(false);
      loadPortafolios();
    } catch (e: any) {
      setPortError(e.message || "Error al crear portafolio");
    }
  };

  const handleDeletePortafolio = async (id: number) => {
    if (!confirm("¿Eliminar este portafolio?")) return;
    try {
      await portafolioApi.delete(id);
      loadPortafolios();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleApply = async (convId: number) => {
    setApplyingId(convId);
    setConvMsg("");
    try {
      if (appliedIds.has(convId)) {
        await convocatoriasApi.withdraw(convId);
        setAppliedIds((prev) => { const s = new Set(prev); s.delete(convId); return s; });
        setConvMsg("Postulación retirada");
      } else {
        await convocatoriasApi.apply(convId);
        setAppliedIds((prev) => new Set(prev).add(convId));
        setConvMsg("¡Te postulaste exitosamente!");
        loadMisPostulaciones();
      }
    } catch (e: any) {
      setConvMsg(e.message || "Error al procesar postulación");
    } finally {
      setApplyingId(null);
      setTimeout(() => setConvMsg(""), 3000);
    }
  };

  const totalItems = portafolios.reduce((acc, p) => acc + p.archivos.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{user?.full_name}</h1>
              <p className="text-sm text-white/80">{user?.artistic_area || "Artista"} · {user?.email}</p>
              {user?.birth_date && (
                <p className="text-xs text-white/60">{calcularEdad(user.birth_date)} años{user.location ? ` · ${user.location}` : ""}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/settings"><Button variant="secondary" size="sm">⚙️ Configuración</Button></Link>
            <Link to="/explore"><Button variant="secondary" size="sm">🌐 Explorar</Button></Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6 overflow-x-auto">
          {([
            { key: "resumen" as Tab, label: "📊 Resumen" },
            { key: "portafolio" as Tab, label: "🖼️ Mi Portafolio" },
            { key: "convocatorias" as Tab, label: "💼 Convocatorias" },
            { key: "mis-postulaciones" as Tab, label: "📤 Mis Postulaciones" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
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

      {/* ── TAB: RESUMEN ── */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Portafolios", valor: String(portafolios.length), cambio: `${totalItems} obras`, color: "border-l-brand-purple" },
              { label: "Postulaciones enviadas", valor: String(misPost.length), cambio: "Total histórico", color: "border-l-brand-teal" },
              { label: "Área artística", valor: user?.artistic_area || "—", cambio: "Tu especialidad", color: "border-l-brand-orange" },
              { label: "Estado", valor: user?.is_active ? "Activo" : "Inactivo", cambio: "Cuenta", color: "border-l-brand-blue" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{m.valor}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{m.cambio}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Información del perfil</h2>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Nombre completo", valor: user?.full_name },
                { label: "Correo electrónico", valor: user?.email },
                { label: "Área artística", valor: user?.artistic_area || "—" },
                { label: "Ubicación", valor: user?.location || "—" },
                { label: "Fecha de nacimiento", valor: user?.birth_date ? new Date(user.birth_date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                { label: "Miembro desde", valor: user?.created_at ? new Date(user.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "—" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{item.valor}</dd>
                </div>
              ))}
            </dl>
            {user?.bio && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Biografía</dt>
                <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">{user.bio}</dd>
              </div>
            )}
          </div>

          {misPost.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Postulaciones recientes</h2>
                <button onClick={() => setActiveTab("mis-postulaciones")} className="text-sm font-medium text-brand-purple hover:underline dark:text-brand-teal">Ver todas →</button>
              </div>
              <div className="space-y-2">
                {misPost.slice(0, 3).map((p) => (
                  <div key={p.id_i} className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.conv_nombre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.empresa_nombre}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString("es-CO")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PORTAFOLIO ── */}
      {activeTab === "portafolio" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">{portafolios.length} portafolios · {totalItems} obras</p>
            <Button size="sm" onClick={() => setShowNewPort(true)}>+ Nuevo portafolio</Button>
          </div>

          {showNewPort && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Nuevo portafolio</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPortNombre}
                  onChange={(e) => setNewPortNombre(e.target.value)}
                  placeholder="Nombre del portafolio"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePortafolio()}
                />
                <Button size="sm" onClick={handleCreatePortafolio}>Crear</Button>
                <Button variant="secondary" size="sm" onClick={() => { setShowNewPort(false); setPortError(""); }}>Cancelar</Button>
              </div>
              {portError && <p className="mt-2 text-xs text-red-500">{portError}</p>}
            </div>
          )}

          {loadingPort ? (
            <p className="text-sm text-gray-500">Cargando portafolios...</p>
          ) : portafolios.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">Aún no tienes portafolios</p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Crea uno para mostrar tu trabajo</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portafolios.map((port) => (
                <div key={port.id_port} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{port.nombre}</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {port.archivos.length} obras · {new Date(port.created_at).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePortafolio(port.id_port)}
                      className="rounded p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar portafolio"
                    >✕</button>
                  </div>
                  {port.archivos.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {port.archivos.slice(0, 3).map((a) => (
                        <li key={a.id_det_p} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className={`h-1.5 w-1.5 rounded-full ${a.estado === "P" ? "bg-green-400" : "bg-yellow-400"}`} />
                          <span className="truncate">{a.archivo}</span>
                          <span className="ml-auto text-gray-400">{a.estado === "P" ? "Pub." : "Bor."}</span>
                        </li>
                      ))}
                      {port.archivos.length > 3 && (
                        <li className="text-xs text-gray-400">+{port.archivos.length - 3} más...</li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CONVOCATORIAS ── */}
      {activeTab === "convocatorias" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">{convs.length} convocatorias disponibles</p>
            <input
              type="text"
              value={searchConv}
              onChange={(e) => setSearchConv(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadConvocatorias()}
              placeholder="Buscar convocatorias..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:w-64"
            />
          </div>

          {convMsg && (
            <div className={`rounded-lg px-4 py-2 text-sm ${convMsg.includes("Error") || convMsg.includes("retirada") ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"}`}>
              {convMsg}
            </div>
          )}

          {loadingConvs ? (
            <p className="text-sm text-gray-500">Cargando convocatorias...</p>
          ) : convs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-gray-500">No hay convocatorias disponibles</p>
            </div>
          ) : (
            <div className="space-y-3">
              {convs.map((c) => (
                <div key={c.id_conv} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-purple/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{c.nombre}</h3>
                      {c.empresa_nombre && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">🏢 {c.empresa_nombre}{c.empresa_sector ? ` · ${c.empresa_sector}` : ""}</p>}
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
                    <Button
                      size="sm"
                      variant={appliedIds.has(c.id_conv) ? "secondary" : "primary"}
                      onClick={() => handleApply(c.id_conv)}
                      disabled={applyingId === c.id_conv}
                    >
                      {applyingId === c.id_conv ? "..." : appliedIds.has(c.id_conv) ? "Retirar" : "Postularme"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: MIS POSTULACIONES ── */}
      {activeTab === "mis-postulaciones" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{misPost.length} postulaciones enviadas</p>
          {loadingPost ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : misPost.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-gray-500">Aún no te has postulado a ninguna convocatoria</p>
              <button onClick={() => setActiveTab("convocatorias")} className="mt-2 text-sm font-medium text-brand-purple hover:underline dark:text-brand-teal">
                Ver convocatorias →
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Convocatoria</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Empresa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {misPost.map((p) => (
                    <tr key={p.id_i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.conv_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.empresa_nombre || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(p.created_at).toLocaleDateString("es-CO")}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            try {
                              await convocatoriasApi.withdraw(p.id_conv);
                              loadMisPostulaciones();
                            } catch (e: any) {
                              alert(e.message);
                            }
                          }}
                        >
                          Retirar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
