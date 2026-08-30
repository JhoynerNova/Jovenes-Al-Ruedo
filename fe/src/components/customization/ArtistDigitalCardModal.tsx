import { useState } from "react";
import { X, QrCode, Download, Share2, Sparkles, Check, MapPin } from "lucide-react";
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
  const [transformStyle, setTransformStyle] = useState("");

  if (!isOpen) return null;

  const profileUrl = `${window.location.origin}/profile/${user.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(profileUrl)}&color=ffffff&bgcolor=0f172a`;

  const frameStyle = user.customization?.avatar_frame || "holo-glow";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
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
          <p className="text-xs text-gray-400">Pasa el mouse para interactuar y descarga tu código QR oficial</p>
        </div>

        {/* TARJETA 3D INTERACTIVA TILT */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transform: transformStyle, transition: "transform 0.15s ease-out" }}
          className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 p-6 shadow-2xl cursor-pointer select-none space-y-5"
        >
          {/* Brillo holográfico de fondo */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">Talento Verificado</span>
            </div>
            <span className="text-[10px] font-medium text-gray-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              Jóvenes al Ruedo ID
            </span>
          </div>

          <div className="relative flex items-center gap-4">
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

          {/* Código QR incorporado en la tarjeta */}
          <div className="relative flex items-center justify-between rounded-2xl bg-slate-900/90 p-4 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-cyan-400" /> Escanea para Ver Perfil
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Acceso directo a portafolios y contacto</p>
            </div>
            <img
              src={qrUrl}
              alt="Código QR del Perfil"
              className="h-16 w-16 rounded-xl border border-purple-500/30 shadow-md"
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
          
          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`QR_${user.full_name.replace(/\s+/g, '_')}.png`}
            className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all"
          >
            <Download className="mr-2 h-4 w-4" /> Descargar QR
          </a>
        </div>
      </div>
    </div>
  );
}
