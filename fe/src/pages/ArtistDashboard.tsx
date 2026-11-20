import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, Image, Briefcase, Send, Settings, Globe,
  Building2, Users, Calendar, FolderPlus, Trash2, FileText, Star,
  Eye, Music
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
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { exportArtistProfile } from "@/lib/profileExport";
import { NewPortfolioModal } from "@/components/dashboard/NewPortfolioModal";
import { AddItemForm } from "@/components/dashboard/AddItemForm";
import { MediaLightboxModal } from "@/components/dashboard/MediaLightboxModal";
import { ApplyConvModal } from "@/components/dashboard/ApplyConvModal";

type Tab = "resumen" | "portafolio" | "convocatorias" | "mis-postulaciones";
type MediaFilter = "todas" | "imagenes" | "videos" | "audios" | "documentos";

export function ArtistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");

  // Portafolio
  const [portafolios, setPortafolios] = useState<PortafolioResponse[]>([]);
  const [loadingPort, setLoadingPort] = useState(false);
  const [showNewPort, setShowNewPort] = useState(false);
  const [viewingPort, setViewingPort] = useState<PortafolioResponse | null>(null);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("todas");
  const [activeMediaModal, setActiveMediaModal] = useState<DetPortafolioResponse | null>(null);

  // Convocatorias
  const [convs, setConvs] = useState<ConvResponse[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [searchConv, setSearchConv] = useState("");
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [convMsg, setConvMsg] = useState("");
  const [applyModalConv, setApplyModalConv] = useState<ConvResponse | null>(null);

  // Mis postulaciones
  const [misPost, setMisPost] = useState<MiPostulacion[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Modal de confirmación
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

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
      setAppliedIds(new Set(data.map((p: MiPostulacion) => p.id_conv)));
    } catch {
      // silent
    } finally {
      setLoadingPost(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const stats = await analyticsApi.getMyStats();
      setUserStats(stats);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadPortafolios();
    loadMisPostulaciones();
    loadConvocatorias();
    loadStats();
  }, [loadPortafolios, loadMisPostulaciones, loadConvocatorias, loadStats]);

  useEffect(() => {
    if (activeTab === "convocatorias") loadConvocatorias();
    if (activeTab === "resumen") loadStats();
  }, [activeTab, loadConvocatorias, loadStats]);

  const handleDeletePortafolio = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Portafolio",
      message: "¿Seguro que deseas eliminar este portafolio? Esta acción eliminará el contenedor de tus obras.",
      confirmText: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await portafolioApi.delete(id);
          if (viewingPort?.id_port === id) setViewingPort(null);
          loadPortafolios();
          loadStats();
        } catch {
          // error handled
        }
      },
    });
  };

  const handleDeleteItem = (itemId: number) => {
    if (!viewingPort) return;
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Obra",
      message: "¿Seguro que deseas eliminar esta obra de tu galería?",
      confirmText: "Eliminar obra",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await portafolioApi.deleteItem(viewingPort.id_port, itemId);
          const updatedList = await portafolioApi.list();
          setPortafolios(updatedList);
          setViewingPort(updatedList.find((p) => p.id_port === viewingPort.id_port) || null);
          loadStats();
        } catch {
          // error handled
        }
      },
    });
  };

  const handleApplySubmit = async (
    convId: number,
    carta: string,
    portId: number | "",
    cvFile: File | null
  ) => {
    setApplyingId(convId);
    setConvMsg("");
    try {
      let uploadedCvUrl: string | undefined = undefined;
      if (cvFile) {
        uploadedCvUrl = await uploadApi.uploadFile(cvFile);
      }
      await convocatoriasApi.apply(convId, {
        carta_presentacion: carta.trim() || undefined,
        id_portafolio_interno: portId !== "" ? portId : undefined,
        cv_url: uploadedCvUrl,
      });
      setAppliedIds((prev) => new Set(prev).add(convId));
      setConvMsg("¡Te postulaste exitosamente!");
      setApplyModalConv(null);
      loadMisPostulaciones();
    } catch (e: any) {
      setConvMsg(e.message || "Error al procesar postulación");
    } finally {
      setApplyingId(null);
      setTimeout(() => setConvMsg(""), 3000);
    }
  };

  const handleWithdraw = (convId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Retirar Postulación",
      message: "¿Seguro que deseas retirar tu postulación a esta convocatoria?",
      confirmText: "Retirar postulación",
      variant: "warning",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await convocatoriasApi.withdraw(convId);
          setAppliedIds((prev) => {
            const s = new Set(prev);
            s.delete(convId);
            return s;
          });
          setConvMsg("Postulación retirada");
          loadMisPostulaciones();
          setTimeout(() => setConvMsg(""), 3000);
        } catch (e: any) {
          setConvMsg(e.message || "Error al retirar postulación");
        }
      },
    });
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
                alt={user?.full_name}
                className="h-16 w-16 rounded-full border-2 border-white/50 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-sm">
                {user?.first_name?.[0] || "A"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold sm:text-2xl">{user?.full_name}</h1>
                <UserBadges userId={user?.id} />
              </div>
              <p className="text-sm text-white/80">{user?.artistic_area || "Artista Jóvenes al Ruedo"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/p/${user?.id}`}>
              <Button variant="secondary" size="sm">
                <Eye className="mr-1.5 h-4 w-4 inline" /> Ver mi perfil público
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => exportArtistProfile(user)}>
              <FileText className="mr-1.5 h-4 w-4 inline" /> Exportar CV 📄
            </Button>
            <Link to="/settings">
              <Button variant="secondary" size="sm">
                <Settings className="mr-1.5 h-4 w-4 inline" /> Configuración
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="secondary" size="sm">
                <Globe className="mr-1.5 h-4 w-4 inline" /> Explorar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { key: "resumen" as Tab, label: "Resumen", Icono: BarChart3 },
            { key: "portafolio" as Tab, label: "Mi Portafolio", Icono: Image },
            { key: "convocatorias" as Tab, label: "Convocatorias", Icono: Briefcase },
            { key: "mis-postulaciones" as Tab, label: "Mis Postulaciones", Icono: Send },
          ].map((tab) => (
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
              <div
                key={m.label}
                className={`animate-scale-in delay-${i} card-hover rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}
              >
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
                {
                  label: "Fecha de nacimiento",
                  valor: user?.birth_date
                    ? new Date(user.birth_date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })
                    : "—",
                },
                {
                  label: "Miembro desde",
                  valor: user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" })
                    : "—",
                },
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
                <button onClick={() => setActiveTab("mis-postulaciones")} className="text-sm font-medium text-brand-purple hover:underline dark:text-brand-teal">
                  Ver todas →
                </button>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {portafolios.length} portafolios · {totalItems} obras
            </p>
            <Button size="sm" onClick={() => setShowNewPort(true)}>
              <FolderPlus className="mr-1.5 h-4 w-4 inline" /> Nuevo portafolio
            </Button>
          </div>

          <NewPortfolioModal
            isOpen={showNewPort}
            onClose={() => setShowNewPort(false)}
            onSuccess={async (created) => {
              setShowNewPort(false);
              const updatedList = await portafolioApi.list();
              setPortafolios(updatedList);
              const fresh = updatedList.find((p) => p.id_port === created.id_port);
              if (fresh) setViewingPort(fresh);
              loadStats();
            }}
          />

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
                  <Button variant="secondary" size="sm" onClick={() => setViewingPort(null)}>
                    ← Volver a mis portafolios
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {viewingPort.nombre}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-normal text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {viewingPort.visibilidad === "Publico" ? "🌐 Público" : viewingPort.visibilidad === "Privado" ? "🔒 Privado" : "💼 Postulaciones"}
                      </span>
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                      {viewingPort.descripcion || `${viewingPort.archivos.length} obras en esta colección`}
                    </p>
                  </div>
                </div>

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

              <AddItemForm
                portfolioId={viewingPort.id_port}
                onSuccess={async () => {
                  const updatedList = await portafolioApi.list();
                  setPortafolios(updatedList);
                  setViewingPort(updatedList.find((p) => p.id_port === viewingPort.id_port) || null);
                  loadStats();
                }}
              />

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
                      const fileUrl = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${a.archivo}`;
                      return (
                        <div
                          key={a.id_det_p}
                          onClick={() => setActiveMediaModal(a)}
                          className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 flex flex-col group"
                        >
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
                          </div>
                          <div className="p-3.5 flex flex-col flex-1 justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{a.titulo || "Sin título"}</h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                                  {a.estado === "P" ? "Público" : "Borrador"}
                                </span>
                              </div>
                              {a.etiquetas && (
                                <p className="text-[11px] text-brand-purple dark:text-brand-teal font-medium mt-0.5">{a.etiquetas}</p>
                              )}
                              {a.descripcion && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.descripcion}</p>
                              )}
                            </div>
                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                              <span className="text-[10px] text-gray-400">
                                {a.created_at ? new Date(a.created_at).toLocaleDateString("es-CO") : ""}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(a.id_det_p);
                                }}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portafolios.map((p) => (
                <div
                  key={p.id_port}
                  onClick={() => setViewingPort(p)}
                  className="animate-fade-in-up card-hover cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{p.nombre}</h3>
                      <p className="mt-1 text-xs text-gray-500">{p.archivos.length} obras</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePortafolio(p.id_port);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {p.descripcion && <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{p.descripcion}</p>}
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
            <div
              className={`rounded-lg px-4 py-2 text-sm ${
                convMsg.includes("Error") || convMsg.includes("retirada")
                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              }`}
            >
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
                      {c.empresa_nombre && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Building2 className="h-3.5 w-3.5" /> {c.empresa_nombre}
                          {c.empresa_sector ? ` · ${c.empresa_sector}` : ""}
                        </p>
                      )}
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
                      onClick={() => (appliedIds.has(c.id_conv) ? handleWithdraw(c.id_conv) : setApplyModalConv(c))}
                    >
                      {appliedIds.has(c.id_conv) ? "Retirar" : "Postularme"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ApplyConvModal
            conv={applyModalConv}
            portafolios={portafolios}
            isSubmitting={applyingId === applyModalConv?.id_conv}
            onClose={() => setApplyModalConv(null)}
            onSubmit={handleApplySubmit}
          />
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
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            p.estado === "Aceptada"
                              ? "bg-green-100 text-green-800"
                              : p.estado === "Rechazada"
                              ? "bg-red-100 text-red-800"
                              : p.estado === "En revisión"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(p.created_at).toLocaleDateString("es-CO")}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="secondary" size="sm" onClick={() => handleWithdraw(p.id_conv)}>
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
      <MediaLightboxModal media={activeMediaModal} onClose={() => setActiveMediaModal(null)} />

      {/* Modal de Confirmación Elegante */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />
    </div>
  );
}
