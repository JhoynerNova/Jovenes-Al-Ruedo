import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Disc } from "lucide-react";
import { toAbsoluteMediaUrl } from "@/lib/media";

interface AudioSignaturePlayerProps {
  audioUrl: string;
  title?: string;
  artistName?: string;
}

export function AudioSignaturePlayer({
  audioUrl,
  title = "Pista de Presentación",
  artistName = "Artista",
}: AudioSignaturePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fullUrl = toAbsoluteMediaUrl(audioUrl);
  if (!fullUrl || hasError) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasError(true));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-900/80 p-2.5 pr-4 text-white shadow-2xl backdrop-blur-md transition-all hover:border-brand-purple/50 animate-fade-in">
      <audio
        ref={audioRef}
        src={fullUrl}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />

      {/* Botón de reproducción */}
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95"
        title={isPlaying ? "Pausar audio" : "Escuchar Audio Signature"}
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
      </button>

      {/* Ecualizador de ondas animado */}
      <div className="flex flex-col justify-center min-w-[120px]">
        <div className="flex items-center gap-1.5">
          <Music className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <span className="text-xs font-bold truncate max-w-[140px]">{title}</span>
        </div>
        <p className="text-[10px] text-gray-400 truncate">{artistName}</p>

        {/* Barras de ecualizador dinámico */}
        <div className="flex items-end gap-0.5 h-3 mt-1">
          {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30].map((height, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full bg-gradient-to-t from-purple-500 to-cyan-400 transition-all ${
                isPlaying ? "animate-pulse" : "opacity-40"
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (height * (i % 3 + 1)) % 100)}%` : "20%",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Botón Mute */}
      <button
        onClick={toggleMute}
        className="p-1 text-gray-400 hover:text-white transition-colors"
        title={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
      </button>

      <Disc className={`h-4 w-4 text-purple-400 shrink-0 ${isPlaying ? "animate-spin-slow" : "opacity-30"}`} />
    </div>
  );
}
