import { useState } from "react";
import { X, QrCode, Download, Share2, Sparkles, Check, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AvatarFrame } from "@/components/customization/AvatarFrame";
import type { UserResponse } from "@/types/auth";

interface ArtistDigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponse;
}

export function ArtistDigitalCardModal({
  isOpen,
  onClose,
  user,
}: ArtistDigitalCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [transformStyle, setTransformStyle] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glareStyle, setGlareStyle] = useState({ opacity: 0, x: 50, y: 50 });

  if (!isOpen) return null;

  const profileUrl = `${window.location.origin}/profile/${user.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}&color=ffffff&bgcolor=0f172a`;
  const frameStyle = user.customization?.avatar_frame || "holo-glow";
  
  // ID Formateado seguro y profesional (Oculta la UUID interna directa en la tarjeta)
  const shortId = `JAR-${user.id.slice(0, 8).toUpperCase()}`;

  const updateTilt = (clientX: number, clientY: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -16;
    const rotateY = ((x - centerX) / centerX) * 16;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`);
    setGlareStyle({
      opacity: 0.45,
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateTilt(e.clientX, e.clientY, e.currentTarget);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      updateTilt(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  };

  const handleResetTilt = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlareStyle({ opacity: 0, x: 50, y: 50 });
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = profileUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert(`Enlace de perfil: ${profileUrl}`);
    }
  };

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `QR_${user.full_name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-3xl bg-slate-950 p-6 text-white shadow-2xl border border-slate-800 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition-colors z-20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" /> Tarjeta Digital Artística 3D
          </h3>
          <p className="text-xs text-gray-400">Pasa el cursor o desliza tu dedo para interactuar en 3D</p>
        </div>

        {/* TARJETA 3D INTERACTIVA TILT CON CAPA HOLOGRÁFICA */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleResetTilt}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleResetTilt}
          style={{
            transform: transformStyle,
            transition: "transform 0.1s ease-out",
            transformStyle: "preserve-3d",
          }}
          className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-slate-900 via-purple-950/60 to-slate-950 p-6 shadow-2xl cursor-pointer select-none space-y-5 group"
        >
          {/* Capa de destello / reflejo holográfico dinámico */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-200 z-30"
            style={{
              opacity: glareStyle.opacity,
              background: `radial-gradient(circle at ${glareStyle.x}% ${glareStyle.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)`,
            }}
          />

          {/* Brillos holográficos de ambiente */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

          {/* Cabecera de la Tarjeta */}
          <div className="relative flex items-center justify-between border-b border-slate-800/80 pb-4 z-10" style={{ transform: "translateZ(20px)" }}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-300">Talento Verificado</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/50 shadow-sm">
              {shortId}
            </span>
          </div>

          {/* Cuerpo principal de la tarjeta en 3D */}
          <div className="relative flex items-center gap-4 z-10" style={{ transform: "translateZ(30px)" }}>
            <AvatarFrame
              src={user.profile_pic_url}
              alt={user.full_name}
              frameStyle={frameStyle}
              size="xl"
            />
            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-white tracking-tight">{user.full_name}</h4>
              <p className="text-xs font-semibold text-purple-300">
                {user.artistic_area || user.sector || "Artista Creador"}
              </p>
              {user.location && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-purple-400" /> {user.location}
                </p>
              )}
            </div>
          </div>

          {/* Código QR incorporado en relieve 3D */}
          <div
            className="relative flex items-center justify-between rounded-2xl bg-slate-900/90 p-4 border border-slate-800/90 shadow-inner z-10"
            style={{ transform: "translateZ(25px)" }}
          >
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-cyan-400" /> Escanea para Ver Perfil
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Acceso directo a portafolios y contacto</p>
            </div>
            <img
              src={qrUrl}
              alt="Código QR del Perfil"
              className="h-24 w-24 rounded-xl border border-purple-500/30 shadow-md object-contain bg-slate-950 p-1"
            />
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="mr-2 h-4 w-4 text-emerald-400" /> : <Share2 className="mr-2 h-4 w-4" />}
            {copied ? "¡Enlace Copiado!" : "Compartir Perfil"}
          </Button>
          
          <button
            onClick={handleDownloadQR}
            disabled={downloading}
            className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="mr-2 h-4 w-4" /> {downloading ? "Descargando..." : "Descargar QR"}
          </button>
        </div>
      </div>
    </div>
  );
}
