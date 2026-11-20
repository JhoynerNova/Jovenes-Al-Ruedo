import { X } from "lucide-react";
import type { DetPortafolioResponse } from "@/api/portafolio";

interface MediaLightboxModalProps {
  media: DetPortafolioResponse | null;
  onClose: () => void;
}

export function MediaLightboxModal({ media, onClose }: MediaLightboxModalProps) {
  if (!media) return null;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const fileUrl = `${apiUrl}${media.archivo}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {media.titulo || "Detalle de la obra"}
            </h3>
            {media.created_at && (
              <p className="text-xs text-gray-500">
                Publicado el {new Date(media.created_at).toLocaleDateString("es-CO")}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-gray-950/5 dark:bg-gray-950">
          {media.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
            <img
              src={fileUrl}
              alt={media.titulo || "Obra"}
              className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
            />
          ) : media.archivo.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ? (
            <video
              src={fileUrl}
              controls
              autoPlay
              className="max-h-[60vh] w-full rounded-xl shadow-lg"
            />
          ) : media.archivo.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg text-center space-y-4">
              <span className="text-6xl block">🎵</span>
              <audio src={fileUrl} controls className="w-full" />
            </div>
          ) : (
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center space-y-4">
              <span className="text-6xl block">📄</span>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Archivo de documento PDF
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-purple/90 shadow-md transition-all"
              >
                Abrir documento en ventana nueva
              </a>
            </div>
          )}

          {media.descripcion && (
            <div className="mt-6 w-full max-w-2xl rounded-xl bg-white p-4 shadow dark:bg-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Descripción / Detalles
              </h4>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {media.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
