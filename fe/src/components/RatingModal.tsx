import React, { useState } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';
import axios from '../api/axios';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistaId: string;
  artistaNombre: string;
  convocatoriaId?: number;
  onRatingSuccess?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  artistaId,
  artistaNombre,
  convocatoriaId,
  onRatingSuccess,
}) => {
  const [puntuacion, setPuntuacion] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comentario, setComentario] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('/ratings/', {
        artista_id: artistaId,
        convocatoria_id: convocatoriaId,
        puntuacion,
        comentario: comentario.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onRatingSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.detail || err.message || 'Error al enviar la calificación.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce mb-3" />
            <h3 className="text-xl font-bold text-white">¡Calificación Enviada!</h3>
            <p className="text-sm text-slate-400 mt-1">Gracias por valorar el talento de {artistaNombre}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Calificar Artista</h3>
              <p className="text-sm text-slate-400 mt-1">
                Valora el desempeño de <span className="text-emerald-400 font-semibold">{artistaNombre}</span>
              </p>
            </div>

            {/* Selección de Estrellas */}
            <div className="flex flex-col items-center py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hoverRating || puntuacion);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPuntuacion(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          active
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-medium text-amber-400 mt-2">
                {puntuacion === 5
                  ? '🌟 Excelente'
                  : puntuacion === 4
                  ? '⭐ Muy Bueno'
                  : puntuacion === 3
                  ? '✨ Bueno'
                  : puntuacion === 2
                  ? '⚡ Regular'
                  : '⚠️ Deficiente'}
              </span>
            </div>

            {/* Campo Comentario */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Comentario / Reseña (Opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe una breve reseña sobre el trabajo de este talento joven..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Publicar Calificación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
