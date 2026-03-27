import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { convocatoriasApi, type ConvResponse, type Applicant } from "@/api/convocatorias";

type Tab = "resumen" | "convocatorias" | "postulaciones";

export function CompanyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");

  // Convocatorias
  const [convs, setConvs] = useState<ConvResponse[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvNombre, setNewConvNombre] = useState("");
  const [newConvGlue, setNewConvGlue] = useState("");
  const [convError, setConvError] = useState("");
  const [editingConv, setEditingConv] = useState<ConvResponse | null>(null);

  // Postulaciones: ver todos los applicants de todas mis convocatorias
  const [allApplicants, setAllApplicants] = useState<(Applicant & { conv_nombre: string })[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);

  const loadConvs = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await convocatoriasApi.getMisConvocatorias();
      setConvs(data);
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const loadAllApplicants = useCallback(async (convList: ConvResponse[]) => {
    setLoadingApplicants(true);
    try {
      const results: (Applicant & { conv_nombre: string })[] = [];
      for (const conv of convList) {
        try {
          const apps = await convocatoriasApi.getApplicants(conv.id_conv);
          apps.forEach((a) => results.push({ ...a, conv_nombre: conv.nombre }));
        } catch { /* skip */ }
      }
      setAllApplicants(results);
    } finally {
      setLoadingApplicants(false);
    }
  }, []);

  useEffect(() => {
    loadConvs();
  }, [loadConvs]);

  useEffect(() => {
    if (convs.length > 0 && activeTab === "postulaciones") {
      const filtered = selectedConvId ? convs.filter((c) => c.id_conv === selectedConvId) : convs;
      loadAllApplicants(filtered);
    }
  }, [activeTab, convs, selectedConvId, loadAllApplicants]);

  const handleCreateConv = async () => {
    if (!newConvNombre.trim()) return;
    setConvError("");
    try {
      await convocatoriasApi.create({ nombre: newConvNombre.trim(), glue: newConvGlue.trim() || undefined });
      setNewConvNombre("");
      setNewConvGlue("");
      setShowNewConv(false);
      loadConvs();
    } catch (e: any) {
      setConvError(e.message || "Error al crear convocatoria");
    }
  };

  const handleUpdateConv = async () => {
    if (!editingConv) return;
    setConvError("");
    try {
      await convocatoriasApi.update(editingConv.id_conv, { nombre: editingConv.nombre, glue: editingConv.glue || undefined });
      setEditingConv(null);
      loadConvs();
    } catch (e: any) {
      setConvError(e.message || "Error al actualizar");
    }
  };

  const handleDeleteConv = async (id: number) => {
    if (!confirm("¿Eliminar esta convocatoria? Se perderán todas las postulaciones.")) return;
    try {
      await convocatoriasApi.delete(id);
      loadConvs();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const totalPostulaciones = convs.reduce((acc, c) => acc + c.total_inscritos, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand-purple to-brand-blue p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold backdrop-blur-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{user?.full_name}</h1>
              <p className="text-sm text-white/80">{user?.sector || "Empresa"} · {user?.email}</p>
              {user?.location && <p className="text-xs text-white/60">{user.location}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setShowNewConv(true); setActiveTab("convocatorias"); }}>+ Nueva convocatoria</Button>
            <Link to="/settings"><Button variant="secondary" size="sm">⚙️ Configuración</Button></Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* ── TAB: RESUMEN ── */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Convocatorias activas", valor: String(convs.length), cambio: "Total publicadas", color: "border-l-brand-purple" },
              { label: "Total postulaciones", valor: String(totalPostulaciones), cambio: "Artistas interesados", color: "border-l-brand-teal" },
              { label: "Sector", valor: user?.sector || "—", cambio: "Tu categoría", color: "border-l-brand-orange" },
              { label: "Estado", valor: user?.is_active ? "Activa" : "Inactiva", cambio: "Cuenta", color: "border-l-brand-blue" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{m.valor}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{m.cambio}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Información de la organización</h2>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Nombre", valor: user?.full_name },
                { label: "Correo electrónico", valor: user?.email },
                { label: "Sector", valor: user?.sector || "—" },
                { label: "Ubicación", valor: user?.location || "—" },
                { label: "Miembro desde", valor: user?.created_at ? new Date(user.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "—" },
                { label: "Convocatorias publicadas", valor: `${convs.length} total` },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{item.valor}</dd>
                </div>
              ))}
            </dl>
            {user?.bio && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Descripción</dt>
                <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">{user.bio}</dd>
              </div>
            )}
          </div>

          {convs.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Convocatorias recientes</h2>
                <button onClick={() => setActiveTab("convocatorias")} className="text-sm font-medium text-brand-purple hover:underline dark:text-brand-teal">Ver todas →</button>
              </div>
              <div className="space-y-2">
                {convs.slice(0, 3).map((c) => (
                  <div key={c.id_conv} className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{c.nombre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{c.total_inscritos} postulados</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString("es-CO")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: MIS CONVOCATORIAS ── */}
      {activeTab === "convocatorias" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">{convs.length} convocatorias publicadas</p>
            <Button size="sm" onClick={() => { setShowNewConv(true); setEditingConv(null); }}>+ Nueva convocatoria</Button>
          </div>

          {(showNewConv || editingConv) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                {editingConv ? "Editar convocatoria" : "Nueva convocatoria"}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingConv ? editingConv.nombre : newConvNombre}
                  onChange={(e) => editingConv ? setEditingConv({ ...editingConv, nombre: e.target.value }) : setNewConvNombre(e.target.value)}
                  placeholder="Título de la convocatoria (ej: Fotógrafo para campaña)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <textarea
                  value={editingConv ? (editingConv.glue || "") : newConvGlue}
                  onChange={(e) => editingConv ? setEditingConv({ ...editingConv, glue: e.target.value }) : setNewConvGlue(e.target.value)}
                  placeholder="Descripción detallada (opcional)..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {convError && <p className="text-xs text-red-500">{convError}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={editingConv ? handleUpdateConv : handleCreateConv}>
                    {editingConv ? "Guardar cambios" : "Publicar"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => { setShowNewConv(false); setEditingConv(null); setConvError(""); }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loadingConvs ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : convs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-gray-500">No has publicado convocatorias aún</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Convocatoria</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Postulados</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {convs.map((conv) => (
                    <tr key={conv.id_conv} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{conv.nombre}</p>
                        {conv.glue && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{conv.glue}</p>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{conv.total_inscritos}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{new Date(conv.created_at).toLocaleDateString("es-CO")}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => { setEditingConv(conv); setShowNewConv(false); }}>Editar</Button>
                        <Button variant="secondary" size="sm" onClick={() => { setSelectedConvId(conv.id_conv); setActiveTab("postulaciones"); }}>Ver postulados</Button>
                        <button onClick={() => handleDeleteConv(conv.id_conv)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: POSTULACIONES ── */}
      {activeTab === "postulaciones" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">{allApplicants.length} postulaciones recibidas</p>
            <div className="flex items-center gap-2">
              <select
                value={selectedConvId || ""}
                onChange={(e) => setSelectedConvId(e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todas las convocatorias</option>
                {convs.map((c) => (
                  <option key={c.id_conv} value={c.id_conv}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingApplicants ? (
            <p className="text-sm text-gray-500">Cargando postulaciones...</p>
          ) : allApplicants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-gray-500">No hay postulaciones aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allApplicants.map((a) => (
                <div key={a.id_i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-teal/20 text-lg font-bold text-brand-purple dark:text-brand-teal">
                      {a.artista_nombre.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{a.artista_nombre}</h3>
                        <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString("es-CO")}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{a.artista_email}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {a.artista_area && (
                          <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                            {a.artista_area}
                          </span>
                        )}
                        {a.artista_location && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            📍 {a.artista_location}
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs text-brand-purple dark:text-purple-300">
                          📢 {a.conv_nombre}
                        </span>
                      </div>
                      {a.artista_bio && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{a.artista_bio}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
