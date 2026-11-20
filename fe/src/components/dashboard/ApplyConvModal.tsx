import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ConvResponse } from "@/api/convocatorias";
import type { PortafolioResponse } from "@/api/portafolio";

interface ApplyConvModalProps {
  conv: ConvResponse | null;
  portafolios: PortafolioResponse[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (convId: number, carta: string, portId: number | "", cvFile: File | null) => void;
}

export function ApplyConvModal({
  conv,
  portafolios,
  isSubmitting,
  onClose,
  onSubmit,
}: ApplyConvModalProps) {
  const [carta, setCarta] = useState("");
  const [portafolioId, setPortafolioId] = useState<number | "">("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  if (!conv) return null;

  const handleSubmit = () => {
    onSubmit(conv.id_conv, carta, portafolioId, cvFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="animate-scale-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Postular a {conv.nombre}
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          Completa tu información para destacar ante la empresa.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Carta de presentación
            </label>
            <textarea
              value={carta}
              onChange={(e) => setCarta(e.target.value)}
              rows={4}
              placeholder="¿Por qué eres ideal para esta oferta?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Portafolio en Plataforma (Opcional)
            </label>
            <select
              value={portafolioId}
              onChange={(e) => setPortafolioId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">No adjuntar portafolio</option>
              {portafolios.map((p) => (
                <option key={p.id_port} value={p.id_port}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              CV (Archivo PDF, Opcional)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-purple file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-purple/90 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar postulación"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
