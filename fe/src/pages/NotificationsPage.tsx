import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, ExternalLink, Briefcase, MessageSquare, Star, Info, Filter } from "lucide-react";
import { notificacionesApi, type Notificacion } from "@/api/notificaciones";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

type FilterType = "todas" | "no_leidas" | "postulacion" | "mensaje" | "calificacion" | "sistema";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("todas");
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificacionesApi.getAll(false, 100);
      setNotifications(data);
    } catch {
      // Ignorar
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificacionesApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (e: any) {
      alert("Error al actualizar notificación");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificacionesApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (e: any) {
      alert("Error al marcar todas como leídas");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificacionesApi.deleteNotif(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      alert("Error al eliminar notificación");
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "postulacion":
        return <Briefcase className="h-5 w-5 text-brand-purple dark:text-brand-teal" />;
      case "mensaje":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "calificacion":
        return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-emerald-500" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "no_leidas") return !n.leida;
    if (filter === "todas") return true;
    return n.tipo === filter;
  });

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Breadcrumbs items={[{ label: "Inicio", path: "/dashboard" }, { label: "Notificaciones" }]} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple dark:bg-brand-teal/10 dark:text-brand-teal">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Notificaciones
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  {unreadCount} nuevas
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500">Mantente al día con tus postulaciones, mensajes y novedades</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button size="sm" variant="secondary" onClick={handleMarkAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4 text-brand-purple dark:text-brand-teal" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 text-xs font-medium">
        <Filter className="h-4 w-4 text-gray-400 mr-1 shrink-0" />
        {(
          [
            { id: "todas", label: "Todas" },
            { id: "no_leidas", label: `No leídas (${unreadCount})` },
            { id: "postulacion", label: "Postulaciones" },
            { id: "mensaje", label: "Mensajes" },
            { id: "calificacion", label: "Reseñas" },
            { id: "sistema", label: "Sistema" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as FilterType)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              filter === tab.id
                ? "bg-brand-purple text-white shadow-sm font-semibold"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Notificaciones */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sin notificaciones</h3>
          <p className="mt-1 text-xs text-gray-500">No hay notificaciones en este filtro en este momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`group flex items-start justify-between gap-4 rounded-2xl border p-4 transition-all shadow-sm ${
                !n.leida
                  ? "border-brand-purple/40 bg-brand-purple/5 dark:border-brand-teal/40 dark:bg-brand-teal/5"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="mt-1 rounded-xl bg-white dark:bg-gray-800 p-2.5 shadow-sm shrink-0">
                  {getIcon(n.tipo)}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm text-gray-900 dark:text-white ${!n.leida ? "font-bold" : "font-semibold"}`}>
                      {n.titulo}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">
                      {n.tipo}
                    </span>
                    {!n.leida && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-purple text-white">
                        Nueva
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{n.mensaje}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-2 shrink-0 pt-1">
                {n.enlace && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (!n.leida) handleMarkAsRead(n.id);
                      navigate(n.enlace!);
                    }}
                    className="text-xs"
                  >
                    Ver detalles <ExternalLink className="ml-1 h-3.5 w-3.5 inline" />
                  </Button>
                )}
                {!n.leida && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-purple dark:hover:bg-gray-800 transition-colors"
                    title="Marcar como leída"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
                  title="Eliminar notificación"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
