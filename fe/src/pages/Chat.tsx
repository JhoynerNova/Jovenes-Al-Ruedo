import { useState, useEffect, useRef } from "react";
import { Send, Search, MessageCircle, Briefcase, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { chatApi, type ConversacionResponse, type MensajeResponse } from "@/api/chat";

export function Chat() {
  const { user } = useAuth();

  const [conversaciones, setConversaciones] = useState<ConversacionResponse[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<MensajeResponse[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar conversaciones
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const data = await chatApi.getConversaciones();
        setConversaciones(data);
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id_conversacion);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConvs();
    const interval = setInterval(fetchConvs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cargar mensajes
  useEffect(() => {
    if (!activeConvId) return;
    setLoadingMsgs(true);
    const fetchMsgs = async () => {
      try {
        const data = await chatApi.getMensajes(activeConvId);
        setMensajes(data);
        scrollToBottom();
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMsgs(false);
      }
    };
    fetchMsgs();
    const interval = setInterval(async () => {
      try {
        const data = await chatApi.getMensajes(activeConvId);
        setMensajes(data);
      } catch { /* silent */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const activeConv = conversaciones.find((c) => c.id_conversacion === activeConvId);

  const handleSend = async () => {
    if (!nuevoMensaje.trim() || !activeConvId) return;
    try {
      const msg = await chatApi.enviarMensaje(activeConvId, nuevoMensaje.trim());
      setMensajes((prev) => [...prev, msg]);
      setNuevoMensaje("");
      scrollToBottom();
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === activeConvId
            ? { ...c, ultimo_mensaje_texto: msg.contenido, ultimo_mensaje_fecha: msg.created_at }
            : c
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getAvatarUrl = (url: string | null, name: string) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&bold=true`;
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${url}`;
  };

  const parseTime = (isoString?: string | null) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const parseDate = (isoString?: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (new Date().toDateString() === date.toDateString()) return parseTime(isoString);
    return date.toLocaleDateString("es-CO");
  };

  // Filtrar conversaciones por búsqueda
  const filtered = conversaciones.filter((c) =>
    !searchQuery ||
    c.otro_usuario_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.conv_nombre && c.conv_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="flex min-h-[600px] w-full gap-0 overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-fade-in-up"
      style={{ height: "calc(100vh - 180px)" }}
    >
      {/* ── COL 1: CONVERSACIONES ── */}
      <div
        className={`flex w-full max-w-[340px] shrink-0 flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 ${
          showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversaciones</h2>
            <span className="rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-bold text-brand-purple">
              {conversaciones.length}
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-purple border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mb-3 inline-flex rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <MessageCircle className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {searchQuery ? "Sin resultados" : "No tienes conversaciones activas"}
              </p>
              {!searchQuery && (
                <p className="mt-1 text-xs text-gray-400">
                  {user?.role === "artista"
                    ? "Las conversaciones aparecerán cuando una empresa acepte tu postulación"
                    : "Envía un mensaje a un artista desde su perfil"}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((c) => (
                <button
                  key={c.id_conversacion}
                  onClick={() => {
                    setActiveConvId(c.id_conversacion);
                    setShowMobileChat(true);
                  }}
                  className={`flex items-start gap-3 p-4 text-left transition-all border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    activeConvId === c.id_conversacion
                      ? "bg-brand-purple/5 dark:bg-brand-purple/10 border-l-2 border-l-brand-purple"
                      : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={getAvatarUrl(c.otro_usuario_avatar, c.otro_usuario_nombre)}
                      alt={c.otro_usuario_nombre}
                      className="h-12 w-12 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700"
                    />
                    {c.no_leidos > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
                        {c.no_leidos}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-semibold text-sm text-gray-900 dark:text-white">
                        {c.otro_usuario_nombre}
                      </span>
                      <span className="shrink-0 text-[11px] text-gray-500">
                        {parseDate(c.ultimo_mensaje_fecha)}
                      </span>
                    </div>
                    {/* Badge de tipo */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {c.tipo === "postulacion" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-semibold text-brand-purple">
                          <Briefcase className="h-2.5 w-2.5" />
                          {c.conv_nombre || "Postulación"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-semibold text-brand-teal">
                          <MessageCircle className="h-2.5 w-2.5" />
                          Mensaje directo
                        </span>
                      )}
                    </div>
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {c.ultimo_mensaje_texto || "Sin mensajes todavía"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── COL 2: MAIN CHAT AREA ── */}
      {!activeConv ? (
        <div className={`flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900/50 ${showMobileChat ? "hidden md:flex" : ""}`}>
          <div className="text-center text-gray-500">
            <div className="mb-4 inline-flex rounded-full bg-gray-100 p-5 dark:bg-gray-800">
              <MessageCircle className="h-10 w-10 text-gray-400" />
            </div>
            <p className="font-medium">Selecciona una conversación</p>
            <p className="text-sm text-gray-400 mt-1">para empezar a chatear</p>
          </div>
        </div>
      ) : (
        <div className={`flex flex-1 flex-col bg-white dark:bg-gray-900 ${showMobileChat ? "flex" : "hidden md:flex"}`}>
          {/* Cabecera del Chat */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-3.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <img
                src={getAvatarUrl(activeConv.otro_usuario_avatar, activeConv.otro_usuario_nombre)}
                alt={activeConv.otro_usuario_nombre}
                className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {activeConv.otro_usuario_nombre}
                </h3>
                <div className="flex items-center gap-1.5">
                  {activeConv.tipo === "postulacion" ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-brand-purple">
                      <Briefcase className="h-3 w-3" />
                      {activeConv.conv_nombre}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-brand-teal">
                      <MessageCircle className="h-3 w-3" />
                      Mensaje directo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/30 p-6 space-y-3">
            {loadingMsgs ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-purple border-t-transparent" />
              </div>
            ) : mensajes.length === 0 ? (
              <div className="text-center my-12">
                <div className="mb-3 inline-flex rounded-full bg-brand-purple/10 p-4">
                  <Send className="h-6 w-6 text-brand-purple" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No hay mensajes todavía
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ¡Envía el primer mensaje para iniciar la conversación!
                </p>
              </div>
            ) : (
              mensajes.map((m) => {
                const soyYo = m.remitente_id === user?.id;
                return (
                  <div key={m.id_msg} className={`flex flex-col ${soyYo ? "items-end" : "items-start"}`}>
                    <div
                      className={`relative max-w-[70%] px-4 py-2.5 shadow-sm text-[14px] leading-relaxed ${
                        soyYo
                          ? "rounded-2xl rounded-tr-sm bg-brand-purple text-white"
                          : "rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700"
                      }`}
                    >
                      {m.contenido}
                    </div>
                    <span className="mt-1 text-[10px] text-gray-400 px-1">
                      {parseTime(m.created_at)}
                      {soyYo && m.leido && " ✓✓"}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensaje */}
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
            <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 p-2 focus-within:border-brand-purple focus-within:ring-1 focus-within:ring-brand-purple transition-all shadow-sm">
              <textarea
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribe un mensaje..."
                className="max-h-32 min-h-[44px] w-full resize-none bg-transparent py-3 px-2 text-sm focus:outline-none dark:text-white"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!nuevoMensaje.trim()}
                className="shrink-0 rounded-full bg-brand-purple p-3 text-white hover:bg-brand-purple/90 focus:outline-none disabled:opacity-40 transition-all shadow-md transform active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COL 3: INFO PANEL ── */}
      {activeConv && (
        <div className="hidden w-[280px] shrink-0 flex-col border-l border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 lg:flex">
          <div className="flex flex-col items-center p-6 border-b border-gray-200 dark:border-gray-800">
            <img
              src={getAvatarUrl(activeConv.otro_usuario_avatar, activeConv.otro_usuario_nombre)}
              alt={activeConv.otro_usuario_nombre}
              className="h-20 w-20 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800 mb-3"
            />
            <h3 className="text-center font-bold text-gray-900 dark:text-white leading-tight">
              {activeConv.otro_usuario_nombre}
            </h3>
            <p className="mt-1 text-center text-xs font-medium text-gray-500 capitalize">
              {activeConv.otro_usuario_role === "empresa" ? "🏢 Empresa" : "🎨 Artista"}
            </p>
          </div>

          <div className="p-5">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Tipo de conversación
            </h4>
            <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-800">
              {activeConv.tipo === "postulacion" ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-brand-purple" />
                    <span className="text-sm font-semibold text-brand-purple">Postulación</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activeConv.conv_nombre}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Conversación activada al aceptar la postulación
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-brand-teal" />
                    <span className="text-sm font-semibold text-brand-teal">Mensaje directo</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Conversación iniciada directamente
                  </p>
                </>
              )}
            </div>

            <a
              href={`/perfil/${activeConv.otro_usuario_id}`}
              className="mt-4 block w-full rounded-lg bg-gray-100 py-2.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Ver perfil completo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
