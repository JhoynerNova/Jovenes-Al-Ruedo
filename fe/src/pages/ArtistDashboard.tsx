import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, Image, Briefcase, Send, Settings, Globe,
  Building2, Users, Calendar, FolderPlus, Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { convocatoriasApi, type ConvResponse, type MiPostulacion } from "@/api/convocatorias";
import { portafolioApi, type PortafolioResponse } from "@/api/portafolio";
import { uploadApi } from "@/api/upload";

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
  
  // Detalle de Portafolio
  const [viewingPort, setViewingPort] = useState<PortafolioResponse | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemFile, setNewItemFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [itemError, setItemError] = useState("");
  const [uploadingItem, setUploadingItem] = useState(false);

  // Convocatorias
  const [convs, setConvs] = useState<ConvResponse[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [searchConv, setSearchConv] = useState("");
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [convMsg, setConvMsg] = useState("");
  
  // Modal de postulación
  const [applyModalConv, setApplyModalConv] = useState<ConvResponse | null>(null);
  const [applyCarta, setApplyCarta] = useState("");
  const [applyPortafolioId, setApplyPortafolioId] = useState<number | "">("");
  const [applyCvFile, setApplyCvFile] = useState<File | null>(null);

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
      await portafolioApi.create({ nombre: newPortNombre.trim() });
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
      if (viewingPort?.id_port === id) setViewingPort(null);
      loadPortafolios();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddItem = async () => {
    if (!viewingPort || !newItemFile || !newItemTitle) {
      setItemError("Título y un archivo son obligatorios");
      return;
    }
    setItemError("");
    setUploadingItem(true);
    try {
      const url = await uploadApi.uploadFile(newItemFile);
      await portafolioApi.addItem(viewingPort.id_port, {
        archivo: url,
        titulo: newItemTitle.trim(),
        descripcion: newItemDesc.trim() || undefined,
        estado: "P", // Publicado directamente
      });
      setNewItemTitle("");
      setNewItemDesc("");
      setNewItemFile(null);
      setPreviewUrl(null);
      // Recargar lista
      const updatedList = await portafolioApi.list();
      setPortafolios(updatedList);
      setViewingPort(updatedList.find(p => p.id_port === viewingPort.id_port) || null);
    } catch (e: any) {
      setItemError(e.message || "Error al subir item");
    } finally {
      setUploadingItem(false);
    }
  };
  
  const handleDeleteItem = async (itemId: number) => {
    if(!viewingPort) return;
    if(!confirm("¿Eliminar este obra de tu galería?")) return;
    try {
      await portafolioApi.deleteItem(viewingPort.id_port, itemId);
      const updatedList = await portafolioApi.list();
      setPortafolios(updatedList);
      setViewingPort(updatedList.find(p => p.id_port === viewingPort.id_port) || null);
    } catch(e:any) {
      alert(e.message);
    }
  }

  const handleApplySubmit = async () => {
    if (!applyModalConv) return;
    setApplyingId(applyModalConv.id_conv);
    setConvMsg("");
    try {
      let uploadedCvUrl: string | undefined = undefined;
      if (applyCvFile) {
        uploadedCvUrl = await uploadApi.uploadFile(applyCvFile);
      }
      await convocatoriasApi.apply(applyModalConv.id_conv, {
        carta_presentacion: applyCarta.trim() || undefined,
        id_portafolio_interno: applyPortafolioId !== "" ? applyPortafolioId : undefined,
        cv_url: uploadedCvUrl
      });
      setAppliedIds((prev) => new Set(prev).add(applyModalConv.id_conv));
      setConvMsg("¡Te postulaste exitosamente!");
      setApplyModalConv(null);
      setApplyCarta(""); setApplyPortafolioId(""); setApplyCvFile(null);
      loadMisPostulaciones();
    } catch (e: any) {
      setConvMsg(e.message || "Error al procesar postulación");
    } finally {
      setApplyingId(null);
      setTimeout(() => setConvMsg(""), 3000);
    }
  };

  const handleWithdraw = async (convId: number) => {
    if (!confirm("¿Seguro que deseas retirar tu postulación?")) return;
    try {
      await convocatoriasApi.withdraw(convId);
      setAppliedIds((prev) => { const s = new Set(prev); s.delete(convId); return s; });
      setConvMsg("Postulación retirada");
      loadMisPostulaciones();
      setTimeout(() => setConvMsg(""), 3000);
    } catch(e:any) {
      alert(e.message);
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
            <Link to="/settings"><Button variant="secondary" size="sm"><Settings className="mr-1.5 h-4 w-4 inline" /> Configuración</Button></Link>
            <Link to="/explore"><Button variant="secondary" size="sm"><Globe className="mr-1.5 h-4 w-4 inline" /> Explorar</Button></Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6 overflow-x-auto">
          {([
            { key: "resumen" as Tab, label: "Resumen", Icono: BarChart3 },
            { key: "portafolio" as Tab, label: "Mi Portafolio", Icono: Image },
            { key: "convocatorias" as Tab, label: "Convocatorias", Icono: Briefcase },
            { key: "mis-postulaciones" as Tab, label: "Mis Postulaciones", Icono: Send },
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
              { label: "Portafolios", valor: String(portafolios.length), cambio: `${totalItems} obras`, color: "border-l-brand-purple" },
              { label: "Postulaciones enviadas", valor: String(misPost.length), cambio: "Total histórico", color: "border-l-brand-teal" },
              { label: "Área artística", valor: user?.artistic_area || "—", cambio: "Tu especialidad", color: "border-l-brand-orange" },
              { label: "Estado", valor: user?.is_active ? "Activo" : "Inactivo", cambio: "Cuenta", color: "border-l-brand-blue" },
            ].map((m, i) => (
              <div key={m.label} className={`animate-scale-in delay-${i} card-hover rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
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
            <Button size="sm" onClick={() => setShowNewPort(true)}><FolderPlus className="mr-1.5 h-4 w-4 inline" /> Nuevo portafolio</Button>
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
          ) : viewingPort ? (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <Button variant="secondary" size="sm" onClick={() => { setViewingPort(null); setItemError(""); setNewItemTitle(""); setNewItemDesc(""); setNewItemFile(null); setPreviewUrl(null); }}>← Volver a mis portafolios</Button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{viewingPort.nombre}</h2>
                  <p className="text-sm font-medium text-gray-500">{viewingPort.archivos.length} obras en esta colección</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-purple to-brand-teal"></div>
                <h3 className="mb-5 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Image className="h-5 w-5 text-brand-purple dark:text-brand-teal" /> Añadir nueva obra
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Título de la obra <span className="text-red-500">*</span></label>
                      <input
                        type="text" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="Ej: Retrato Urbano Nocturno"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción <span className="text-gray-400 font-normal">(Opcional)</span></label>
                      <textarea
                        value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)}
                        placeholder="Detalles sobre técnica, contexto o inspiración tras de esta obra..." rows={4}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Archivo <span className="text-red-500">*</span></label>
                    <div className="relative group flex flex-1 w-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-purple hover:bg-brand-purple/5 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-teal dark:hover:bg-brand-teal/5 transition-all overflow-hidden text-center p-4">
                      <input
                        type="file" accept="image/*,.pdf" 
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewItemFile(file);
                          if (file && file.type.startsWith('image/')) {
                            const url = URL.createObjectURL(file);
                            setPreviewUrl(url);
                          } else {
                            setPreviewUrl(null);
                          }
                        }}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      {previewUrl ? (
                        <div className="absolute inset-0 z-0">
                          <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                            <span className="rounded-full bg-white/20 p-3 backdrop-blur-md mb-2">
                              <Image className="h-6 w-6 text-white" />
                            </span>
                            <span className="text-xs font-semibold text-white drop-shadow-md">Cambiar Imagen</span>
                          </div>
                        </div>
                      ) : (
                        <div className="z-0 flex flex-col items-center pointer-events-none">
                          <div className="mb-3 rounded-full bg-white p-3 shadow-md dark:bg-gray-800 text-brand-purple dark:text-brand-teal transition-transform group-hover:-translate-y-1">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Haz clic o arrastra un archivo</p>
                          <p className="mt-1 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">JPG</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">PNG</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">PDF</span>
                          </p>
                          {newItemFile && !previewUrl && <div className="mt-4 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-700 dark:text-teal-400 max-w-[80%] truncate">📄 {newItemFile.name}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5 dark:border-gray-800">
                  <div className="flex-1">
                    {itemError && <p className="text-sm font-medium text-red-500 animate-pulse flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>{itemError}</p>}
                  </div>
                  <Button onClick={handleAddItem} disabled={uploadingItem || !newItemTitle || !newItemFile} className="px-6 flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                    {uploadingItem ? (
                       <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                       Guardando...</>
                    ) : (
                       <><Send className="h-4 w-4"/> Publicar Obra</>
                    )}
                  </Button>
                </div>
              </div>

              {viewingPort.archivos.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No hay obras en este portafolio aún.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {viewingPort.archivos.map(a => (
                    <div key={a.id_det_p} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col group">
                      <div className="h-40 bg-gray-100 dark:bg-gray-800 relative">
                        {a.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                          <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${a.archivo}`} alt={a.titulo || "Obra"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-500">PDF / Documento</div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => handleDeleteItem(a.id_det_p)} className="rounded bg-red-600 p-2 text-white hover:bg-red-700 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{a.titulo}</h4>
                        {a.descripcion && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{a.descripcion}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portafolios.map((port) => (
                <div key={port.id_port} onClick={() => setViewingPort(port)} className="cursor-pointer animate-scale-in card-hover rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{port.nombre}</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {port.archivos.length} obras · {new Date(port.created_at).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePortafolio(port.id_port); }}
                      className="rounded p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title="Eliminar portafolio"
                    ><Trash2 className="h-4 w-4" /></button>
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
                <div key={c.id_conv} className="animate-fade-in-up card-hover rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{c.nombre}</h3>
                      {c.empresa_nombre && <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><Building2 className="h-3.5 w-3.5" /> {c.empresa_nombre}{c.empresa_sector ? ` · ${c.empresa_sector}` : ""}</p>}
                      {c.glue && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{c.glue}</p>}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {c.ubicacion && <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">📍 {c.ubicacion}</span>}
                        {c.rango_salarial && <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-green-700 dark:bg-green-900/20 dark:text-green-400">💰 {c.rango_salarial}</span>}
                        {c.tipo_jornada && <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">⏱ {c.tipo_jornada}</span>}
                        {c.nivel_experiencia && <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">🎓 {c.nivel_experiencia}</span>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          <Users className="h-3 w-3" /> {c.total_inscritos} postulados
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          <Calendar className="h-3 w-3" /> {new Date(c.created_at).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={appliedIds.has(c.id_conv) ? "secondary" : "primary"}
                      onClick={() => appliedIds.has(c.id_conv) ? handleWithdraw(c.id_conv) : setApplyModalConv(c)}
                    >
                      {appliedIds.has(c.id_conv) ? "Retirar" : "Postularme"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Modal de Aplicación */}
          {applyModalConv && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="animate-scale-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Postular a {applyModalConv.nombre}</h3>
                <p className="mb-4 text-xs text-gray-500">Completa tu información para destacar ante la empresa.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Carta de presentación</label>
                    <textarea 
                      value={applyCarta} onChange={(e) => setApplyCarta(e.target.value)}
                      rows={4} placeholder="¿Por qué eres ideal para esta oferta?"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Portafolio en Plataforma (Opcional)</label>
                    <select
                      value={applyPortafolioId}
                      onChange={(e) => setApplyPortafolioId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">No adjuntar portafolio</option>
                      {portafolios.map(p => (
                        <option key={p.id_port} value={p.id_port}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">CV (Archivo PDF, Opcional)</label>
                    <input 
                      type="file" accept=".pdf"
                      onChange={(e) => setApplyCvFile(e.target.files?.[0] || null)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-purple file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-purple/90 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setApplyModalConv(null)}>Cancelar</Button>
                    <Button onClick={handleApplySubmit} disabled={applyingId === applyModalConv.id_conv}>
                      {applyingId === applyModalConv.id_conv ? "Enviando..." : "Enviar postulación"}
                    </Button>
                  </div>
                </div>
              </div>
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
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {misPost.map((p) => (
                    <tr key={p.id_i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.conv_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.empresa_nombre || "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          p.estado === 'Aceptada' ? 'bg-green-100 text-green-800' :
                          p.estado === 'Rechazada' ? 'bg-red-100 text-red-800' :
                          p.estado === 'En revisión' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(p.created_at).toLocaleDateString("es-CO")}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleWithdraw(p.id_conv)}
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
