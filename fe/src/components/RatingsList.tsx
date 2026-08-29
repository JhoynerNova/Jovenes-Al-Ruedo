import React, { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import axios from "@/api/axios";

interface RatingItem {
  id: string;
  puntuacion: number;
  comentario?: string;
  empresa_nombre?: string;
  created_at: string;
}

interface RatingsSummary {
  promedio: number;
  total_calificaciones: number;
  calificaciones: RatingItem[];
}

interface RatingsListProps {
  artistId: string;
}

export const RatingsList: React.FC<RatingsListProps> = ({ artistId }) => {
  const [data, setData] = useState<RatingsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!artistId) return;
    const fetchRatings = async () => {
      setLoading(true);
      try {
        const res = await axios.get<RatingsSummary>(`/api/v1/ratings/artist/${artistId}`);
        setData(res.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, [artistId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
        <span>Cargando calificaciones...</span>
      </div>
    );
  }

  if (!data || data.total_calificaciones === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700/60 p-5 text-center text-xs text-slate-400">
        <Star className="mx-auto h-6 w-6 text-slate-500 mb-1" />
        <p>Aún no has recibido calificaciones de empresas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen Promedio */}
      <div className="flex items-center gap-4 rounded-xl bg-slate-800/40 p-4 border border-slate-700/50">
        <div className="flex flex-col items-center justify-center border-r border-slate-700/60 pr-4">
          <span className="text-3xl font-extrabold text-amber-400">{data.promedio.toFixed(1)}</span>
          <div className="flex text-amber-400 text-xs mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${
                  s <= Math.round(data.promedio) ? "fill-amber-400 text-amber-400" : "text-slate-600"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">{data.total_calificaciones} valoraciones</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-200">Reputación Artística</p>
          <p className="text-[11px] text-slate-400">
            Promedio basado en la satisfacción de las empresas contratantes en Jóvenes al Ruedo.
          </p>
        </div>
      </div>

      {/* Lista de Calificaciones */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {data.calificaciones.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{r.empresa_nombre || "Empresa Verificada"}</span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3 w-3 ${
                      s <= r.puntuacion ? "fill-amber-400 text-amber-400" : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            {r.comentario && (
              <p className="text-slate-300 italic flex items-start gap-1 text-[11px]">
                <MessageSquare className="h-3 w-3 text-slate-500 flex-shrink-0 mt-0.5" />
                "{r.comentario}"
              </p>
            )}
            <span className="text-[9px] text-slate-500 block text-right">
              {new Date(r.created_at).toLocaleDateString("es-CO")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
