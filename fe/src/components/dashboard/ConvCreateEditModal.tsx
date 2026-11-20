import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { ConvResponse } from "@/api/convocatorias";

interface ConvCreateEditModalProps {
  isOpen: boolean;
  editingConv: ConvResponse | null;
  onClose: () => void;
  onSubmit: (data: {
    nombre: string;
    glue: string;
    nivel_experiencia?: string;
    tipo_jornada?: string;
    rango_salarial?: string;
    ubicacion?: string;
  }) => Promise<void>;
}

const TEMPLATES = [
  {
    label: "📸 Fotógrafo",
    title: "Fotógrafo Profesional para Evento",
    exp: "Intermedio",
    jor: "Freelance",
    sal: "$2.0M - $3.5M COP",
    desc: "Buscamos un fotógrafo creativo con experiencia en retratos y eventos culturales. Se requiere portafolio y equipo propio.",
  },
  {
    label: "🎸 Músico",
    title: "Músico de Sesión / Instrumentista",
    exp: "Intermedio",
    jor: "Freelance",
    sal: "$2.5M - $4.0M COP",
    desc: "Necesitamos un instrumentista (guitarrista/pianista) para grabación de pistas de estudio y soporte en vivo.",
  },
  {
    label: "🎭 Actor/Actriz",
    title: "Actor de Teatro / Doblaje de Voz",
    exp: "Principiante",
    jor: "Freelance",
    sal: "$1.8M - $3.0M COP",
    desc: "Convocatoria abierta para proyecto de doblaje vocal y cortometraje teatral. No se requiere amplia experiencia, pero sí excelente modulación.",
  },
];

const LOCALIDADES_BOGOTA = [
  "Usaquén", "Chapinero", "Santa Fe", "San Cristóbal", "Usme",
  "Tunjuelito", "Bosa", "Kennedy", "Fontibón", "Engativá",
  "Suba", "Barrios Unidos", "Teusaquillo", "Los Mártires",
  "Antonio Nariño", "Puente Aranda", "La Candelaria",
  "Rafael Uribe Uribe", "Ciudad Bolívar", "Sumapaz",
];

export function ConvCreateEditModal({
  isOpen,
  editingConv,
  onClose,
  onSubmit,
}: ConvCreateEditModalProps) {
  const [nombre, setNombre] = useState("");
  const [glue, setGlue] = useState("");
  const [exp, setExp] = useState("");
  const [jornada, setJornada] = useState("");
  const [salario, setSalario] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingConv) {
      setNombre(editingConv.nombre || "");
      setGlue(editingConv.glue || "");
      setExp(editingConv.nivel_experiencia || "");
      setJornada(editingConv.tipo_jornada || "");
      setSalario(editingConv.rango_salarial || "");
      setUbicacion(editingConv.ubicacion || "");
    } else {
      setNombre("");
      setGlue("");
      setExp("");
      setJornada("");
      setSalario("");
      setUbicacion("");
    }
    setError("");
  }, [editingConv, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError("El título de la convocatoria es obligatorio");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        glue: glue.trim(),
        nivel_experiencia: exp || undefined,
        tipo_jornada: jornada || undefined,
        rango_salarial: salario || undefined,
        ubicacion: ubicacion || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Error al procesar convocatoria");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-fade-in-up">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
        {editingConv ? "Editar convocatoria" : "Nueva convocatoria"}
      </h3>

      <div className="space-y-3">
        {!editingConv && (
          <div className="flex gap-2 items-center mb-2 overflow-x-auto py-1">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Plantillas rápidas:
            </span>
            {TEMPLATES.map((t) => (
              <button
                type="button"
                key={t.label}
                onClick={() => {
                  setNombre(t.title);
                  setExp(t.exp);
                  setJornada(t.jor);
                  setSalario(t.sal);
                  setGlue(t.desc);
                }}
                className="text-[10px] bg-brand-purple/5 hover:bg-brand-purple/10 text-brand-purple px-2 py-1 rounded border border-brand-purple/20 font-bold whitespace-nowrap dark:bg-brand-teal/5 dark:text-brand-teal dark:border-brand-teal/20"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Título de la convocatoria (ej: Fotógrafo para campaña)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Localidad en Bogotá (Opcional)</option>
            {LOCALIDADES_BOGOTA.map((loc) => (
              <option key={loc} value={`${loc}, Bogotá`}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Nivel de experiencia</option>
            <option value="Principiante">Principiante (0-2 años)</option>
            <option value="Intermedio">Intermedio (2-5 años)</option>
            <option value="Senior">Senior (+5 años)</option>
          </select>

          <select
            value={jornada}
            onChange={(e) => setJornada(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tipo de contrato</option>
            <option value="Tiempo Completo">Tiempo Completo</option>
            <option value="Medio Tiempo">Medio Tiempo</option>
            <option value="Freelance">Freelance / Por Proyecto</option>
          </select>

          <input
            type="text"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
            placeholder="Rango Salarial (ej: $1M - $2M COP)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <textarea
          value={glue}
          onChange={(e) => setGlue(e.target.value)}
          placeholder="Descripción detallada de la oferta..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : editingConv ? "Guardar cambios" : "Publicar"}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
