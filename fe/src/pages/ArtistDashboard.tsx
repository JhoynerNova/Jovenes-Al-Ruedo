import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, Image, Briefcase, Send, Settings, Globe,
  Building2, Users, Calendar, FolderPlus, Trash2, FileText, Star,
  X, Eye, Music
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { convocatoriasApi, type ConvResponse, type MiPostulacion } from "@/api/convocatorias";
import { portafolioApi, type PortafolioResponse, type DetPortafolioResponse } from "@/api/portafolio";
import { uploadApi } from "@/api/upload";
import { RatingsList } from "@/components/RatingsList";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { toAbsoluteMediaUrl } from "@/lib/media";
import { UserBadges } from "@/components/ui/UserBadges";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { analyticsApi, type UserStats } from "@/api/analytics";

type Tab = "resumen" | "portafolio" | "convocatorias" | "mis-postulaciones";
type MediaFilter = "todas" | "imagenes" | "videos" | "audios" | "documentos";

export function ArtistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");

  // Portafolio
  const [portafolios, setPortafolios] = useState<PortafolioResponse[]>([]);
  const [loadingPort, setLoadingPort] = useState(false);
  const [showNewPort, setShowNewPort] = useState(false);
  const [newPortNombre, setNewPortNombre] = useState("");
  const [newPortDesc, setNewPortDesc] = useState("");
  const [newPortVisibilidad, setNewPortVisibilidad] = useState<string>("Publico");
  const [newPortFirstItemTitle, setNewPortFirstItemTitle] = useState("");
  const [newPortFirstItemDesc, setNewPortFirstItemDesc] = useState("");
  const [newPortFirstItemTags, setNewPortFirstItemTags] = useState("");
  const [newPortFirstItemFile, setNewPortFirstItemFile] = useState<File | null>(null);
  const [newPortFirstItemPreview, setNewPortFirstItemPreview] = useState<string | null>(null);
  const [creatingPort, setCreatingPort] = useState(false);
  const [portError, setPortError] = useState("");
  
  // Detalle de Portafolio
  const [viewingPort, setViewingPort] = useState<PortafolioResponse | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemTags, setNewItemTags] = useState("");
  const [newItemEstado, setNewItemEstado] = useState<"P" | "G">("P");
  const [newItemFile, setNewItemFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [itemError, setItemError] = useState("");
  const [uploadingItem, setUploadingItem] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("todas");

  // Visor Modal Lightbox
  const [activeMediaModal, setActiveMediaModal] = useState<DetPortafolioResponse | null>(null);

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

  const handleExportProfile = () => {
    const printWindow = window.open("", "_blank");
    if(!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha Artística - ${user?.full_name}</title>
          <style>
            body { font-family: sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            .card { border: 2px solid #5A3FA0; border-radius: 12px; padding: 30px; max-width: 600px; margin: auto; }
            h1 { color: #5A3FA0; margin-top: 0; }
            .badge { display: inline-block; background: #2EC4B6; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .section { margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }
            .label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${user?.full_name}</h1>
            <span class="badge">${user?.artistic_area || "Artista"}</span>
            <div class="section">
              <p><span class="label">Correo:</span> ${user?.email}</p>
              <p><span class="label">Ubicación:</span> ${user?.location || "Bogotá, Colombia"}</p>
              <p><span class="label">Biografía:</span><br/>${user?.bio || "Sin biografía especificada."}</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadPortafolios();
    loadMisPostulaciones();
    loadConvocatorias();
    analyticsApi.getMyStats().then(setUserStats).catch(() => {});
  }, [loadPortafolios, loadMisPostulaciones, loadConvocatorias]);

  useEffect(() => {
    if (activeTab === "convocatorias") loadConvocatorias();
  }, [activeTab, loadConvocatorias]);

  const handleCreatePortafolio = async () => {
    if (!newPortNombre.trim()) {
      setPortError("El nombre del portafolio es obligatorio");
      return;
    }
    if (newPortFirstItemFile && !newPortFirstItemTitle.trim()) {
      setPortError("Escribe un título para la primera obra seleccionada");
      return;
    }
    setPortError("");
    setCreatingPort(true);
    try {
      const createdPort = await portafolioApi.create({
        nombre: newPortNombre.trim(),
        descripcion: newPortDesc.trim() || undefined,
        visibilidad: newPortVisibilidad,
      });

      if (newPortFirstItemFile) {
        const url = await uploadApi.uploadFile(newPortFirstItemFile);
        await portafolioApi.addItem(createdPort.id_port, {
          archivo: url,
          titulo: newPortFirstItemTitle.trim() || newPortNombre.trim(),
          descripcion: newPortFirstItemDesc.trim() || undefined,
          etiquetas: newPortFirstItemTags.trim() || undefined,
          estado: "P",
        });
      }

      setNewPortNombre("");
      setNewPortDesc("");
      setNewPortVisibilidad("Publico");
      setNewPortFirstItemTitle("");
      setNewPortFirstItemDesc("");
      setNewPortFirstItemTags("");
      setNewPortFirstItemFile(null);
      setNewPortFirstItemPreview(null);
      setShowNewPort(false);

      const updatedList = await portafolioApi.list();
      setPortafolios(updatedList);
      const freshCreated = updatedList.find(p => p.id_port === createdPort.id_port);
      if (freshCreated) setViewingPort(freshCreated);
    } catch (e: any) {
      setPortError(e.message || "Error al crear portafolio");
    } finally {
      setCreatingPort(false);
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
        etiquetas: newItemTags.trim() || undefined,
        estado: newItemEstado,
      });
      setNewItemTitle("");
      setNewItemDesc("");
      setNewItemTags("");
      setNewItemEstado("P");
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
      <Breadcrumbs items={[{ label: "Mi Panel de Artista" }]} />
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.profile_pic_url ? (
              <img
                src={toAbsoluteMediaUrl(user.profile_pic_url)}
                alt={user.full_name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-sm">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{user?.full_name}</h1>
              <p className="text-sm text-white/80">{user?.artistic_area || "Artista"} · {user?.email}</p>
              {user?.birth_date && (
                <p className="text-xs text-white/60 mb-2">{calcularEdad(user.birth_date)} años{user.location ? ` · ${user.location}` : ""}</p>
              )}
              {userStats?.badges && <UserBadges badges={userStats.badges} size="sm" />}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleExportProfile}><FileText className="mr-1.5 h-4 w-4 inline" /> Exportar CV 📄</Button>
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
          {userStats && <AnalyticsCard stats={userStats} role="artista" />}
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

          {/* Calificaciones y Reseñas de Empresas */}
          {user?.id && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> Reputación y Reseñas de Empresas
              </h2>
              <RatingsList artistId={user.id} />
            </div>
          )}

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

          {/* Tips and Useful Resources for Artists */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md">
              <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">💡 Consejos para Artistas Jóvenes</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-brand-purple dark:text-brand-teal font-bold">✔</span>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Arma un Reel Corto:</strong> Las empresas suelen mirar solo los primeros 30 segundos de tus audios o videos. ¡Sé impactante!</p>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-purple dark:text-brand-teal font-bold">✔</span>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Sube muestras claras:</strong> Asegúrate de subir imágenes de buena resolución y archivos en formatos universales (MP3, MP4, PDF).</p>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-purple dark:text-brand-teal font-bold">✔</span>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Mantén tu perfil al día:</strong> Actualiza tu biografía y localización para que más empresas cercanas te encuentren.</p>
                </li>
              </ul>
            </div>
            
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md">
              <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">🎯 Ofertas recomendadas para ti</h2>
              {convs.length === 0 ? (
                <p className="text-xs text-gray-500">No hay convocatorias cargadas en este momento.</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const filtered = convs.filter(c => {
                      const userArea = user?.artistic_area?.toLowerCase() || "";
                      return userArea && (c.nombre.toLowerCase().includes(userArea) || c.glue?.toLowerCase().includes(userArea));
                    });

                    if (filtered.length > 0) {
                      return filtered.slice(0, 3).map(c => (
                        <div key={c.id_conv} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2 last:border-b-0 last:pb-0">
                          <div className="min-w-0 flex-1 mr-2">
                            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{c.nombre}</h4>
                            <p className="text-[10px] text-gray-500 truncate">{c.empresa_nombre || "Empresa"}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab("convocatorias")}
                            className="text-[10px] bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple font-bold px-2 py-1 rounded dark:bg-brand-teal/10 dark:text-brand-teal dark:hover:bg-brand-teal/20 whitespace-nowrap"
                          >
                            Ver oferta →
                          </button>
                        </div>
                      ));
                    }

                    // Fallback to latest 3 jobs
                    return (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 italic mb-2">No encontramos ofertas exactas para tu área, pero mira las últimas publicadas:</p>
                        {convs.slice(0, 3).map(c => (
                          <div key={c.id_conv} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2 last:border-b-0 last:pb-0">
                            <div className="min-w-0 flex-1 mr-2">
                              <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{c.nombre}</h4>
                              <p className="text-[10px] text-gray-500 truncate">{c.empresa_nombre || "Empresa"}</p>
                            </div>
                            <button
                              onClick={() => setActiveTab("convocatorias")}
                              className="text-[10px] bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple font-bold px-2 py-1 rounded dark:bg-brand-teal/10 dark:text-brand-teal dark:hover:bg-brand-teal/20 whitespace-nowrap"
                            >
                              Ver oferta →
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
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
            <div className="rounded-2xl border border-brand-purple/30 bg-white p-6 shadow-xl dark:border-brand-teal/30 dark:bg-gray-900 space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple dark:bg-brand-teal/10 dark:text-brand-teal">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crear nuevo portafolio</h3>
                    <p className="text-xs text-gray-500">Crea tu colección y añade tu primera obra de una vez</p>
                  </div>
                </div>
                <button onClick={() => { setShowNewPort(false); setPortError(""); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sección 1: Información del Portafolio */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-teal">1. Datos del Portafolio</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Nombre del portafolio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPortNombre}
                      onChange={(e) => setNewPortNombre(e.target.value)}
                      placeholder="Ej. Fotografía Urbana 2025, Ilustraciones Digitales..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Visibilidad
                    </label>
                    <select
                      value={newPortVisibilidad}
                      onChange={(e) => setNewPortVisibilidad(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Publico">🌐 Público (Visible en perfil)</option>
                      <option value="Postulaciones">💼 Solo Postulaciones</option>
                      <option value="Privado">🔒 Privado</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Descripción del portafolio <span className="text-gray-400 font-normal">(Opcional)</span>
                    </label>
                    <textarea
                      value={newPortDesc}
                      onChange={(e) => setNewPortDesc(e.target.value)}
                      placeholder="Explica la temática o concepto artístico de esta colección..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Primera Obra Integrada */}
              <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-teal flex items-center gap-1.5">
                    <Image className="h-4 w-4" /> 2. Añadir primera obra a este portafolio <span className="text-gray-400 font-normal lowercase">(opcional)</span>
                  </h4>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Título de la obra
                      </label>
                      <input
                        type="text"
                        value={newPortFirstItemTitle}
                        onChange={(e) => setNewPortFirstItemTitle(e.target.value)}
                        placeholder="Ej: Obra Nro 1 - Atardecer"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Categoría / Etiqueta <span className="text-gray-400 font-normal">(Opcional)</span>
                      </label>
                      <select
                        value={newPortFirstItemTags}
                        onChange={(e) => setNewPortFirstItemTags(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">-- Selecciona una Categoría --</option>
                        <option value="Teatro y Artes Escénicas">🎭 Teatro y Artes Escénicas</option>
                        <option value="Música y Producción Sonora">🎵 Música y Producción Sonora</option>
                        <option value="Danza y Expresión Corporal">💃 Danza y Expresión Corporal</option>
                        <option value="Fotografía y Medios Digitales">📷 Fotografía y Medios Digitales</option>
                        <option value="Pintura, Dibujo e Ilustración">🎨 Pintura, Dibujo e Ilustración</option>
                        <option value="Audiovisual y Cine">🎬 Audiovisual y Cine</option>
                        <option value="Escultura y Artes Plásticas">🗿 Escultura y Artes Plásticas</option>
                        <option value="Literatura y Escritura Creativa">✍️ Literatura y Escritura Creativa</option>
                        <option value="Diseño, Moda y Vestuario">👗 Diseño, Moda y Vestuario</option>
                        <option value="Circo y Artes Callejeras">🎪 Circo y Artes Callejeras</option>
                        <option value="Otra Categoría">✨ Otra Categoría</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Descripción de la obra
                      </label>
                      <textarea
                        value={newPortFirstItemDesc}
                        onChange={(e) => setNewPortFirstItemDesc(e.target.value)}
                        placeholder="Detalles sobre esta obra inicial..."
                        rows={2}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Archivo de la obra
                    </label>
                    <div className="relative group flex flex-1 w-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-purple hover:bg-brand-purple/5 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-teal dark:hover:bg-brand-teal/5 transition-all overflow-hidden text-center p-4">
                      <input
                        type="file" accept="image/*,.pdf,audio/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewPortFirstItemFile(file);
                          if (file && file.type.startsWith('image/')) {
                            const url = URL.createObjectURL(file);
                            setNewPortFirstItemPreview(url);
                          } else {
                            setNewPortFirstItemPreview(null);
                          }
                        }}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      {newPortFirstItemPreview ? (
                        <div className="absolute inset-0 z-0">
                          <img src={newPortFirstItemPreview} alt="Preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewPortFirstItemPreview(null);
                              setNewPortFirstItemFile(null);
                            }}
                            className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-transform hover:scale-110"
                            title="Quitar archivo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : newPortFirstItemFile ? (
                        <div className="z-10 flex flex-col items-center justify-center p-4">
                          <div className="relative">
                            <span className="text-4xl mb-2 block">📄</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewPortFirstItemFile(null);
                              }}
                              className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                              title="Quitar archivo"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[200px] truncate">{newPortFirstItemFile.name}</p>
                        </div>
                      ) : (
                        <div className="z-0 flex flex-col items-center pointer-events-none">
                          <div className="mb-2 rounded-full bg-white p-2.5 shadow-md dark:bg-gray-800 text-brand-purple dark:text-brand-teal">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          </div>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">Haz clic o arrastra un archivo</p>
                          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-gray-500">
                            <span className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">IMG</span>
                            <span className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">PDF</span>
                            <span className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">AUDIO</span>
                            <span className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">VIDEO</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {portError && <p className="text-xs font-medium text-red-500 animate-pulse">{portError}</p>}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button variant="secondary" size="sm" onClick={() => { setShowNewPort(false); setPortError(""); }}>Cancelar</Button>
                <Button size="sm" onClick={handleCreatePortafolio} disabled={creatingPort || !newPortNombre.trim()} className="px-6 shadow-md">
                  {creatingPort ? "Creando y Guardando..." : "Crear Portafolio y Publicar"}
                </Button>
              </div>
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
              <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="sm" onClick={() => { setViewingPort(null); setItemError(""); setNewItemTitle(""); setNewItemDesc(""); setNewItemFile(null); setPreviewUrl(null); }}>← Volver a mis portafolios</Button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {viewingPort.nombre}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-normal text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {viewingPort.visibilidad === "Publico" ? "🌐 Público" : viewingPort.visibilidad === "Privado" ? "🔒 Privado" : "💼 Postulaciones"}
                      </span>
                    </h2>
                    <p className="text-sm font-medium text-gray-500">{viewingPort.descripcion || `${viewingPort.archivos.length} obras en esta colección`}</p>
                  </div>
                </div>

                {/* Filtros por tipo de archivo */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-medium">
                  {(["todas", "imagenes", "videos", "audios", "documentos"] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setMediaFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                        mediaFilter === filterKey
                          ? "bg-white dark:bg-gray-900 text-brand-purple dark:text-brand-teal font-semibold shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {filterKey}
                    </button>
                  ))}
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
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Título de la obra <span className="text-red-500">*</span></label>
                      <input
                        type="text" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="Ej: Retrato Urbano Nocturno"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Categoría / Etiqueta <span className="text-gray-400 font-normal">(Opcional)</span>
                        </label>
                        <select
                          value={newItemTags}
                          onChange={(e) => setNewItemTags(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="Teatro y Artes Escénicas">🎭 Teatro y Escénicas</option>
                          <option value="Música y Producción Sonora">🎵 Música y Sonido</option>
                          <option value="Danza y Expresión Corporal">💃 Danza y Expresión</option>
                          <option value="Fotografía y Medios Digitales">📷 Fotografía</option>
                          <option value="Pintura, Dibujo e Ilustración">🎨 Pintura e Ilustración</option>
                          <option value="Audiovisual y Cine">🎬 Audiovisual y Cine</option>
                          <option value="Escultura y Artes Plásticas">🗿 Escultura y Plásticas</option>
                          <option value="Literatura y Escritura Creativa">✍️ Literatura</option>
                          <option value="Diseño, Moda y Vestuario">👗 Diseño y Moda</option>
                          <option value="Circo y Artes Callejeras">🎪 Circo y Callejera</option>
                          <option value="Otra Categoría">✨ Otra Categoría</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Estado
                        </label>
                        <select
                          value={newItemEstado}
                          onChange={(e) => setNewItemEstado(e.target.value as "P" | "G")}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="P">✅ Publicado</option>
                          <option value="G">📝 Borrador / Guardado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Descripción <span className="text-gray-400 font-normal">(Opcional)</span></label>
                      <textarea
                        value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)}
                        placeholder="Detalles sobre técnica, contexto o inspiración tras de esta obra..." rows={3}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Archivo <span className="text-red-500">*</span></label>
                    <div className="relative group flex flex-1 w-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-purple hover:bg-brand-purple/5 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-teal dark:hover:bg-brand-teal/5 transition-all overflow-hidden text-center p-4">
                      <input
                        type="file" accept="image/*,.pdf,audio/*,video/*" 
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
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewUrl(null);
                              setNewItemFile(null);
                            }}
                            className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-transform hover:scale-110"
                            title="Quitar archivo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : newItemFile ? (
                        <div className="z-10 flex flex-col items-center justify-center p-4">
                          <div className="relative">
                            <span className="text-4xl mb-2 block">📄</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewItemFile(null);
                              }}
                              className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                              title="Quitar archivo"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[200px] truncate">{newItemFile.name}</p>
                        </div>
                      ) : (
                        <div className="z-0 flex flex-col items-center pointer-events-none">
                          <div className="mb-3 rounded-full bg-white p-3 shadow-md dark:bg-gray-800 text-brand-purple dark:text-brand-teal transition-transform group-hover:-translate-y-1">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Haz clic o arrastra un archivo</p>
                          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">IMG</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">PDF</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">AUDIO</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">VIDEO</span>
                          </p>
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
                  {viewingPort.archivos
                    .filter((a) => {
                      if (mediaFilter === "imagenes") return a.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
                      if (mediaFilter === "videos") return a.archivo.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i);
                      if (mediaFilter === "audios") return a.archivo.match(/\.(mp3|wav|ogg|m4a)$/i);
                      if (mediaFilter === "documentos") return a.archivo.match(/\.(pdf|doc|docx)$/i);
                      return true;
                    })
                    .map((a) => {
                    const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${a.archivo}`;
                    return (
                      <div key={a.id_det_p} onClick={() => setActiveMediaModal(a)} className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 flex flex-col group">
                        <div className="h-44 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                          {a.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                            <img src={fileUrl} alt={a.titulo || "Obra"} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : a.archivo.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ? (
                            <video src={fileUrl} className="h-full w-full object-cover" />
                          ) : a.archivo.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-brand-purple/10 to-brand-teal/10 p-2">
                              <Music className="h-10 w-10 text-brand-purple dark:text-brand-teal mb-1" />
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Audio / Música</span>
                            </div>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/80 p-2 text-xs text-gray-500">
                              <FileText className="h-10 w-10 text-gray-400 mb-1" />
                              <span className="font-semibold">Documento PDF</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="rounded-full bg-white/30 backdrop-blur-md p-2 text-white">
                              <Eye className="h-5 w-5" />
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 z-20">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteItem(a.id_det_p); }}
                              className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                              title="Eliminar obra"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{a.titulo}</h4>
                          {a.descripcion && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{a.descripcion}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portafolios.map((port) => (
                <div key={port.id_port} onClick={() => setViewingPort(port)} className="cursor-pointer animate-scale-in card-hover rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {port.nombre}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-normal text-gray-600 dark:text-gray-400">
                          {port.visibilidad === "Publico" ? "🌐 Público" : port.visibilidad === "Privado" ? "🔒 Privado" : "💼 Postulaciones"}
                        </span>
                      </h3>
                      {port.descripcion && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{port.descripcion}</p>}
                      <p className="mt-2 text-xs text-gray-400">
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
                    <ul className="mt-3 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-2">
                      {port.archivos.slice(0, 3).map((a) => (
                        <li key={a.id_det_p} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className={`h-1.5 w-1.5 rounded-full ${a.estado === "P" ? "bg-green-400" : "bg-yellow-400"}`} />
                          <span className="truncate">{a.titulo || a.archivo}</span>
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

      {/* Lightbox / Visor de Obra Modal */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeMediaModal.titulo || "Detalle de la obra"}</h3>
                {activeMediaModal.created_at && (
                  <p className="text-xs text-gray-500">Publicado el {new Date(activeMediaModal.created_at).toLocaleDateString("es-CO")}</p>
                )}
              </div>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-gray-950/5 dark:bg-gray-950">
              {activeMediaModal.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeMediaModal.archivo}`}
                  alt={activeMediaModal.titulo || "Obra"}
                  className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
                />
              ) : activeMediaModal.archivo.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ? (
                <video
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeMediaModal.archivo}`}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full rounded-xl shadow-lg"
                />
              ) : activeMediaModal.archivo.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg text-center space-y-4">
                  <span className="text-6xl block">🎵</span>
                  <audio
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeMediaModal.archivo}`}
                    controls
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center space-y-4">
                  <span className="text-6xl block">📄</span>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Archivo de documento PDF</p>
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeMediaModal.archivo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-purple/90 shadow-md transition-all"
                  >
                    Abrir documento en ventana nueva
                  </a>
                </div>
              )}

              {activeMediaModal.descripcion && (
                <div className="mt-6 w-full max-w-2xl rounded-xl bg-white p-4 shadow dark:bg-gray-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Descripción / Detalles</h4>
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{activeMediaModal.descripcion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
