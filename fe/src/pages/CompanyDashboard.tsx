import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3, Megaphone, Inbox, Settings, PlusCircle, Pencil, Trash2, Users, X, ExternalLink, MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { convocatoriasApi, type ConvResponse, type Applicant } from "@/api/convocatorias";
import { portafolioApi, type PortafolioResponse } from "@/api/portafolio";
import { chatApi } from "@/api/chat";

type Tab = "resumen" | "convocatorias" | "postulaciones";

export function CompanyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const navigate = useNavigate();
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

  const handleStartChat = async (artistaId: string) => {
    setStartingChatId(artistaId);
    try {
      await chatApi.crearConversacionDirecta(artistaId);
      navigate("/mensajes");
    } catch {
      alert("Error al iniciar chat con el artista.");
    } finally {
      setStartingChatId(null);
    }
  };

  // Convocatorias
  const [convs, setConvs] = useState<ConvResponse[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvNombre, setNewConvNombre] = useState("");
  const [newConvGlue, setNewConvGlue] = useState("");
  const [newConvExp, setNewConvExp] = useState("");
  const [newConvJornada, setNewConvJornada] = useState("");
  const [newConvSalario, setNewConvSalario] = useState("");
  const [newConvUbicacion, setNewConvUbicacion] = useState("");
  const [convError, setConvError] = useState("");
  const [editingConv, setEditingConv] = useState<ConvResponse | null>(null);

  const [allApplicants, setAllApplicants] = useState<(Applicant & { conv_nombre: string, id_conv: number })[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);

  // States for viewing artist portfolio in modal
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortafolioResponse | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");

  const handleViewPortfolio = async (id: number) => {
    setLoadingPortfolio(true);
    setPortfolioError("");
    setSelectedPortfolio(null);
    try {
      const data = await portafolioApi.get(id);
      setSelectedPortfolio(data);
    } catch (e: any) {
      setPortfolioError("No se pudo cargar el portafolio de este artista.");
    } finally {
      setLoadingPortfolio(false);
    }
  };

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
      const results: (Applicant & { conv_nombre: string, id_conv: number })[] = [];
      for (const conv of convList) {
        try {
          const apps = await convocatoriasApi.getApplicants(conv.id_conv);
          apps.forEach((a) => results.push({ ...a, conv_nombre: conv.nombre, id_conv: conv.id_conv }));
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
      await convocatoriasApi.create({ 
        nombre: newConvNombre.trim(), 
        glue: newConvGlue.trim() || undefined,
        nivel_experiencia: newConvExp || undefined,
        tipo_jornada: newConvJornada || undefined,
        rango_salarial: newConvSalario || undefined,
        ubicacion: newConvUbicacion || undefined
      });
      setNewConvNombre("");
      setNewConvGlue("");
      setNewConvExp("");
      setNewConvJornada("");
      setNewConvSalario("");
      setNewConvUbicacion("");
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
      await convocatoriasApi.update(editingConv.id_conv, { 
        nombre: editingConv.nombre, 
        glue: editingConv.glue || undefined,
        nivel_experiencia: editingConv.nivel_experiencia || undefined,
        tipo_jornada: editingConv.tipo_jornada || undefined,
        rango_salarial: editingConv.rango_salarial || undefined,
        ubicacion: editingConv.ubicacion || undefined
      });
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

  const handleUpdateApplicantStatus = async (convId: number, inscId: number, nuevoEstado: string) => {
    try {
      await convocatoriasApi.updateApplicantStatus(convId, inscId, nuevoEstado);
      // update local state
      setAllApplicants(prev => prev.map(a => a.id_i === inscId ? { ...a, estado: nuevoEstado } : a));
    } catch (e: any) {
      alert("Error al actualizar estado");
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
            <Button size="sm" onClick={() => { setShowNewConv(true); setActiveTab("convocatorias"); }}><PlusCircle className="mr-1.5 h-4 w-4 inline" /> Nueva convocatoria</Button>
            <Link to="/settings"><Button variant="secondary" size="sm"><Settings className="mr-1.5 h-4 w-4 inline" /> Configuración</Button></Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {([
            { key: "resumen" as Tab, label: "Resumen", Icono: BarChart3 },
            { key: "convocatorias" as Tab, label: "Mis Convocatorias", Icono: Megaphone },
            { key: "postulaciones" as Tab, label: "Postulaciones", Icono: Inbox },
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
              <tab.Icono className="mr-1.5 h-4 w-4 inline" />
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
            ].map((m, i) => (
              <div key={m.label} className={`animate-scale-in delay-${i} card-hover rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
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
            <Button size="sm" onClick={() => { setShowNewConv(true); setEditingConv(null); }}><PlusCircle className="mr-1.5 h-4 w-4 inline" /> Nueva convocatoria</Button>
          </div>

          {(showNewConv || editingConv) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                {editingConv ? "Editar convocatoria" : "Nueva convocatoria"}
              </h3>
              <div className="space-y-3">
                {!editingConv && (
                  <div className="flex gap-2 items-center mb-2 overflow-x-auto py-1">
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Plantillas rápidas:</span>
                    {[
                      { label: "📸 Fotógrafo", title: "Fotógrafo Profesional para Evento", exp: "Intermedio", jor: "Freelance", sal: "$2.0M - $3.5M COP", desc: "Buscamos un fotógrafo creativo con experiencia en retratos y eventos culturales. Se requiere portafolio y equipo propio." },
                      { label: "🎸 Músico", title: "Músico de Sesión / Instrumentista", exp: "Intermedio", jor: "Freelance", sal: "$2.5M - $4.0M COP", desc: "Necesitamos un instrumentista (guitarrista/pianista) para grabación de pistas de estudio y soporte en vivo." },
                      { label: "🎭 Actor/Actriz", title: "Actor de Teatro / Doblaje de Voz", exp: "Principiante", jor: "Freelance", sal: "$1.8M - $3.0M COP", desc: "Convocatoria abierta para proyecto de doblaje vocal y cortometraje teatral. No se requiere amplia experiencia, pero sí excelente modulación." }
                    ].map(t => (
                      <button
                        type="button"
                        key={t.label}
                        onClick={() => {
                          setNewConvNombre(t.title);
                          setNewConvExp(t.exp);
                          setNewConvJornada(t.jor);
                          setNewConvSalario(t.sal);
                          setNewConvGlue(t.desc);
                        }}
                        className="text-[10px] bg-brand-purple/5 hover:bg-brand-purple/10 text-brand-purple px-2 py-1 rounded border border-brand-purple/20 font-bold whitespace-nowrap dark:bg-brand-teal/5 dark:text-brand-teal dark:border-brand-teal/20"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={editingConv ? editingConv.nombre : newConvNombre}
                  onChange={(e) => editingConv ? setEditingConv({ ...editingConv, nombre: e.target.value }) : setNewConvNombre(e.target.value)}
                  placeholder="Título de la convocatoria (ej: Fotógrafo para campaña)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={editingConv ? (editingConv.ubicacion || "") : newConvUbicacion}
                    onChange={(e) => editingConv ? setEditingConv({ ...editingConv, ubicacion: e.target.value }) : setNewConvUbicacion(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Localidad en Bogotá (Opcional)</option>
                    {["Usaquén", "Chapinero", "Santa Fe", "San Cristóbal", "Usme", "Tunjuelito", "Bosa", "Kennedy", "Fontibón", "Engativá", "Suba", "Barrios Unidos", "Teusaquillo", "Los Mártires", "Antonio Nariño", "Puente Aranda", "La Candelaria", "Rafael Uribe Uribe", "Ciudad Bolívar", "Sumapaz"].map(loc => (
                      <option key={loc} value={`${loc}, Bogotá`}>{loc}</option>
                    ))}
                  </select>

                  <select
                    value={editingConv ? (editingConv.nivel_experiencia || "") : newConvExp}
                    onChange={(e) => editingConv ? setEditingConv({ ...editingConv, nivel_experiencia: e.target.value }) : setNewConvExp(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Nivel de experiencia</option>
                    <option value="Principiante">Principiante (0-2 años)</option>
                    <option value="Intermedio">Intermedio (2-5 años)</option>
                    <option value="Senior">Senior (+5 años)</option>
                  </select>

                  <select
                    value={editingConv ? (editingConv.tipo_jornada || "") : newConvJornada}
                    onChange={(e) => editingConv ? setEditingConv({ ...editingConv, tipo_jornada: e.target.value }) : setNewConvJornada(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Tipo de contrato</option>
                    <option value="Tiempo Completo">Tiempo Completo</option>
                    <option value="Medio Tiempo">Medio Tiempo</option>
                    <option value="Freelance">Freelance / Por Proyecto</option>
                  </select>

                  <input
                    type="text"
                    value={editingConv ? (editingConv.rango_salarial || "") : newConvSalario}
                    onChange={(e) => editingConv ? setEditingConv({ ...editingConv, rango_salarial: e.target.value }) : setNewConvSalario(e.target.value)}
                    placeholder="Rango Salarial (ej: $1M - $2M COP)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <textarea
                  value={editingConv ? (editingConv.glue || "") : newConvGlue}
                  onChange={(e) => editingConv ? setEditingConv({ ...editingConv, glue: e.target.value }) : setNewConvGlue(e.target.value)}
                  placeholder="Descripción detallada de la oferta..."
                  rows={4}
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
                        <Button variant="secondary" size="sm" onClick={() => { setEditingConv(conv); setShowNewConv(false); }}><Pencil className="mr-1 h-3.5 w-3.5 inline" /> Editar</Button>
                        <Button variant="secondary" size="sm" onClick={() => { setSelectedConvId(conv.id_conv); setActiveTab("postulaciones"); }}><Users className="mr-1 h-3.5 w-3.5 inline" /> Ver postulados</Button>
                        <button onClick={() => handleDeleteConv(conv.id_conv)} className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /> Eliminar</button>
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
            <div className="grid gap-4 md:grid-cols-4 items-start">
              {/* Kanban Columns */}
              {([
                { key: "Enviada", label: "Recibidas (Enviadas)", color: "border-t-blue-500 bg-blue-50/50 dark:bg-blue-950/10" },
                { key: "En revisión", label: "En revisión", color: "border-t-orange-500 bg-orange-50/50 dark:bg-orange-950/10" },
                { key: "Aceptada", label: "Aceptadas", color: "border-t-green-500 bg-green-50/50 dark:bg-green-950/10" },
                { key: "Rechazada", label: "Rechazadas", color: "border-t-red-500 bg-red-50/50 dark:bg-red-950/10" }
              ]).map((col) => {
                const colApps = allApplicants.filter(a => a.estado === col.key);
                return (
                  <div key={col.key} className={`rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 ${col.color} p-3 min-h-[500px]`}>
                    <div className="flex items-center justify-between mb-3 border-b border-gray-200/50 pb-2 dark:border-gray-800/50">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">{col.label}</h4>
                      <span className="rounded-full bg-gray-200 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-gray-400">{colApps.length}</span>
                    </div>
                    <div className="space-y-3">
                      {colApps.map((a) => (
                        <div key={a.id_i} className="animate-scale-in rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900 text-xs space-y-2.5">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h5 className="font-bold text-gray-900 dark:text-white">{a.artista_nombre}</h5>
                              <p className="text-[10px] text-gray-400">{a.artista_email}</p>
                              {a.artista_area && <span className="mt-1 inline-block text-[10px] text-brand-teal font-medium">✨ {a.artista_area}</span>}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(a.created_at).toLocaleDateString("es-CO", { day: '2-digit', month: '2-digit' })}</span>
                          </div>

                          <div className="rounded-md bg-gray-50 dark:bg-gray-850 p-2 border-l-2 border-brand-purple/20">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Vacante</p>
                            <p className="truncate font-semibold text-gray-700 dark:text-gray-300">{a.conv_nombre}</p>
                          </div>

                          {a.carta_presentacion && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 italic line-clamp-2">"{a.carta_presentacion}"</p>
                          )}

                          <div className="flex flex-col gap-2 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                            <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Mover estado:</label>
                            <select
                              value={a.estado}
                              onChange={(e) => handleUpdateApplicantStatus(a.id_conv, a.id_i, e.target.value)}
                              className={`w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs focus:ring-1 focus:ring-brand-purple ${
                                a.estado === 'Aceptada' ? 'text-green-600 font-semibold' :
                                a.estado === 'Rechazada' ? 'text-red-600 font-semibold' :
                                a.estado === 'En revisión' ? 'text-orange-600 font-semibold' :
                                'text-gray-600'
                              }`}
                            >
                              <option value="Enviada">Recibida (Enviada)</option>
                              <option value="En revisión">En revisión</option>
                              <option value="Aceptada">Aceptada</option>
                              <option value="Rechazada">Rechazada</option>
                            </select>
                          </div>

                          {(a.id_portafolio_interno || a.cv_url) && (
                            <div className="flex justify-between items-center pt-1 text-[10px] gap-2">
                              {a.id_portafolio_interno && (
                                <button onClick={() => handleViewPortfolio(a.id_portafolio_interno!)} className="text-brand-purple hover:underline font-semibold dark:text-brand-teal">
                                  Ver Portafolio 🎨
                                </button>
                              )}
                              {a.cv_url && (
                                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${a.cv_url}`} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline font-semibold ml-auto">
                                  Descargar CV 📄
                                </a>
                              )}
                            </div>
                          )}

                          <div className="pt-2 border-t border-gray-100 dark:border-gray-850">
                            <button
                              onClick={() => handleStartChat(a.id_usr)}
                              disabled={startingChatId === a.id_usr}
                              className="w-full text-center rounded-lg bg-brand-purple/10 text-brand-purple py-1.5 font-bold transition-all hover:bg-brand-purple/20 text-[10px] flex items-center justify-center gap-1.5 dark:bg-brand-teal/10 dark:text-brand-teal dark:hover:bg-brand-teal/20"
                            >
                              <MessageSquare className="h-3 w-3" />
                              {startingChatId === a.id_usr ? "Conectando..." : "Chat con el Artista 💬"}
                            </button>
                          </div>
                        </div>
                      ))}
                      {colApps.length === 0 && (
                        <p className="text-gray-400 dark:text-gray-600 text-center py-6 text-[10px] border border-dashed border-gray-200/55 dark:border-gray-800 rounded-lg">Columna vacía</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Portfolio Viewer Modal */}
      {(loadingPortfolio || selectedPortfolio || portfolioError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="animate-scale-in w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 max-h-[85vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {loadingPortfolio ? "Cargando portafolio..." : selectedPortfolio?.nombre || "Portafolio del Artista"}
                </h3>
                {selectedPortfolio && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Este portafolio contiene {selectedPortfolio.archivos.length} obras.
                  </p>
                )}
              </div>
              <button
                onClick={() => { setSelectedPortfolio(null); setLoadingPortfolio(false); setPortfolioError(""); }}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingPortfolio && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
                <p className="text-sm text-gray-500 font-medium">Buscando obras del artista...</p>
              </div>
            )}

            {portfolioError && (
              <div className="text-center py-10">
                <p className="text-sm font-semibold text-red-500">⚠️ {portfolioError}</p>
              </div>
            )}

            {selectedPortfolio && (
              <div className="flex-1 space-y-4">
                {selectedPortfolio.archivos.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-gray-500 text-sm">Este portafolio no tiene obras cargadas aún.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedPortfolio.archivos.map((a) => {
                      const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${a.archivo}`;
                      const isImage = a.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
                      const isVideo = a.archivo.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i);
                      const isAudio = a.archivo.match(/\.(mp3|wav|ogg|m4a)$/i);

                      return (
                        <div key={a.id_det_p} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 flex flex-col group transition-all hover:shadow-md">
                          <div className="h-44 bg-gray-50 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden">
                            {isImage ? (
                              <img src={fileUrl} alt={a.titulo || "Obra"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : isVideo ? (
                              <video src={fileUrl} controls className="h-full w-full object-cover" />
                            ) : isAudio ? (
                              <div className="flex h-full w-full flex-col items-center justify-center p-3 bg-brand-purple/5">
                                <span className="text-3xl mb-2">🎵</span>
                                <audio src={fileUrl} controls className="w-full scale-90" />
                              </div>
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                                <span className="text-4xl mb-2">📄</span>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple dark:text-brand-teal hover:underline"
                                >
                                  Ver Documento <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="p-3 border-t border-gray-100 dark:border-gray-850">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{a.titulo || "Sin título"}</h4>
                            {a.descripcion && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 italic">
                                "{a.descripcion}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6 flex justify-end">
              <Button onClick={() => setSelectedPortfolio(null)}>Cerrar Portafolio</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
