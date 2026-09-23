import { useState, useEffect } from "react";
import { Cookie, X, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function CookieConsentBanner() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("jar_cookie_consent");
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = (type: "all" | "necessary") => {
    localStorage.setItem("jar_cookie_consent", type);
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-fade-in-up">
      <div className="relative rounded-2xl bg-slate-900/95 border border-purple-500/40 p-5 text-white shadow-2xl backdrop-blur-xl space-y-4">
        <button
          onClick={() => handleAccept("necessary")}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400 border border-purple-500/30">
            <Cookie className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Uso de Cookies & Privacidad <ShieldCheck className="h-4 w-4 text-emerald-400 inline" />
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Utilizamos cookies técnicas y de rendimiento para ofrecerte una experiencia personalizada, guardar tu sesión y garantizar la seguridad de tus datos conforme a la Ley 1581/2012.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <Link
            to="/privacy"
            className="text-[11px] text-purple-300 hover:underline font-medium"
          >
            Ver Política de Privacidad
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleAccept("necessary")}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-slate-800 transition-colors border border-slate-700"
            >
              Solo Necesarias
            </button>
            <button
              onClick={() => handleAccept("all")}
              className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-purple-500 transition-all cursor-pointer"
            >
              Aceptar Todas 🍪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
