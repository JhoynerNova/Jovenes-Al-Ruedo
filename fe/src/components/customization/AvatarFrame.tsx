import { toAbsoluteMediaUrl } from "@/lib/media";

export type FrameStyle = "none" | "holo-glow" | "cyber-aura" | "gold-crest" | "violet-synthwave" | "retro-canvas";

interface AvatarFrameProps {
  src: string | null | undefined;
  alt: string;
  frameStyle?: FrameStyle | string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  onClick?: () => void;
}

export function AvatarFrame({
  src,
  alt,
  frameStyle = "none",
  size = "lg",
  className = "",
  onClick,
}: AvatarFrameProps) {
  const mediaUrl = toAbsoluteMediaUrl(src);

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-16 h-16 text-base",
    lg: "w-24 h-24 text-xl",
    xl: "w-32 h-32 text-2xl",
    "2xl": "w-40 h-40 text-3xl",
  }[size];

  const frameWrapperStyle = () => {
    switch (frameStyle) {
      case "holo-glow":
        return "p-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 animate-spin-slow shadow-[0_0_25px_rgba(168,85,247,0.5)]";
      case "cyber-aura":
        return "p-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse";
      case "gold-crest":
        return "p-1 rounded-full bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_20px_rgba(234,179,8,0.5)] border border-amber-200/50";
      case "violet-synthwave":
        return "p-1.5 rounded-full bg-gradient-to-tr from-purple-900 via-indigo-500 to-pink-500 shadow-[0_0_30px_rgba(99,102,241,0.6)]";
      case "retro-canvas":
        return "p-1 rounded-2xl border-2 border-brand-purple/70 bg-gradient-to-b from-gray-900 to-slate-900 shadow-xl";
      default:
        return "";
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 transition-transform hover:scale-105 ${frameWrapperStyle()} ${className}`}
    >
      <div className={`relative overflow-hidden rounded-full bg-slate-800 ${sizeClasses}`}>
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt={alt}
            className="h-full w-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-800">
            {getInitial(alt)}
          </div>
        )}
      </div>

      {/* Insignia decorativa de marco */}
      {frameStyle && frameStyle !== "none" && (
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-purple-500/50 text-[10px] shadow-lg">
          {frameStyle === "gold-crest" ? "👑" : frameStyle === "cyber-aura" ? "⚡" : "✨"}
        </span>
      )}
    </div>
  );
}
