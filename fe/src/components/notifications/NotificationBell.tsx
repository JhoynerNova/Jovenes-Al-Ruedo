import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Briefcase, MessageSquare, Star, Info, X } from "lucide-react";
import { notificacionesApi, type Notificacion } from "@/api/notificaciones";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [toastNotification, setToastNotification] = useState<Notificacion | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const navigate = useNavigate();

  const loadUnreadCount = async () => {
    try {
      const count = await notificacionesApi.getUnreadCount();
      
      // Si la cantidad de no leídos aumentó, disparar animación y cargar notificación reciente
      if (count > prevCountRef.current && prevCountRef.current !== 0) {
        setIsRinging(true);
        setTimeout(() => setIsRinging(false), 3000);
        
        // Obtener la notificación más reciente para mostrar el Banner Flotante
        try {
          const recent = await notificacionesApi.getAll(true, 1);
          if (recent.length > 0) {
            setToastNotification(recent[0]);
            setTimeout(() => setToastNotification(null), 5000);
          }
        } catch {
          // silent
        }
      }
      prevCountRef.current = count;
      setUnreadCount(count);
    } catch {
      // Ignorar errores silenciosos de polling
    }
  };

  const loadRecentNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificacionesApi.getAll(false, 6);
      setNotifications(data);
    } catch {
      // Ignorar
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 6000); // Polling rápido cada 6s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRecentNotifications();
    }
  }, [isOpen]);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificacionesApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (e: any) {
      alert("Error al marcar notificaciones");
    }
  };

  const handleNotificationClick = async (n: Notificacion) => {
    if (!n.leida) {
      try {
        await notificacionesApi.markAsRead(n.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, leida: true } : item))
        );
      } catch {
        // Ignorar
      }
    }
    setIsOpen(false);
    setToastNotification(null);
    if (n.enlace) {
      navigate(n.enlace);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "postulacion":
        return <Briefcase className="h-4 w-4 text-brand-purple dark:text-brand-teal" />;
      case "mensaje":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "calificacion":
        return <Star className="h-4 w-4 text-amber-500 fill-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la Campana con Animación */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-xl p-2 text-purple-200 hover:bg-brand-purple/20 hover:text-white transition-all focus:outline-none ${
          isRinging ? "ring-4 ring-amber-400/50 bg-amber-500/20 text-amber-300 animate-bounce" : ""
        }`}
        title="Notificaciones"
      >
        <Bell className={`h-5 w-5 ${isRinging ? "animate-spin text-amber-300" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-brand-dark animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* BANNER FLOTANTE ANIMADO AL LLEGAR NOTIFICACIÓN */}
      {toastNotification && (
        <div
          onClick={() => handleNotificationClick(toastNotification)}
          className="fixed top-20 right-6 z-50 flex items-start gap-3 w-80 sm:w-96 rounded-2xl border border-amber-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md cursor-pointer animate-slide-down text-white hover:scale-102 transition-transform"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bell className="h-5 w-5 animate-bounce" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">🔔 Nueva Notificación</p>
            <p className="text-sm font-bold truncate mt-0.5">{toastNotification.titulo}</p>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{toastNotification.mensaje}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setToastNotification(null); }}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Popover Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-950/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-bold text-brand-purple dark:bg-brand-teal/10 dark:text-brand-teal">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-purple hover:underline dark:text-brand-teal"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Leídas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista de Notificaciones Recientes */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <div className="p-6 text-center text-xs text-gray-500">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !n.leida ? "bg-purple-50/50 dark:bg-purple-950/20" : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    {getIcon(n.tipo)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${!n.leida ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-300"}`}>
                        {n.titulo}
                      </p>
                      {!n.leida && <span className="h-2 w-2 rounded-full bg-brand-purple dark:bg-brand-teal shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                      {n.mensaje}
                    </p>
                    <span className="mt-1 block text-[10px] text-gray-400">
                      {new Date(n.created_at).toLocaleDateString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 p-2.5 text-center bg-gray-50 dark:bg-gray-950/50">
            <Link
              to="/notificaciones"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-brand-purple hover:underline dark:text-brand-teal"
            >
              Ver todas las notificaciones →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
