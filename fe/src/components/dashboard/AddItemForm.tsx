import { useState } from "react";
import { Image, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { portafolioApi } from "@/api/portafolio";
import { uploadApi } from "@/api/upload";

interface AddItemFormProps {
  portfolioId: number;
  onSuccess: () => void;
}

export function AddItemForm({ portfolioId, onSuccess }: AddItemFormProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [estado, setEstado] = useState<"P" | "G">("P");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAddItem = async () => {
    if (!title.trim()) {
      setError("El título de la obra es obligatorio");
      return;
    }
    if (!file) {
      setError("Debes seleccionar un archivo para la obra");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const url = await uploadApi.uploadFile(file);
      await portafolioApi.addItem(portfolioId, {
        archivo: url,
        titulo: title.trim(),
        descripcion: desc.trim() || undefined,
        etiquetas: tags.trim() || undefined,
        estado,
      });

      setTitle("");
      setDesc("");
      setTags("");
      setEstado("P");
      setFile(null);
      setPreviewUrl(null);
      onSuccess();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Error al subir la obra.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-purple to-brand-teal" />
      <h3 className="mb-5 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Image className="h-5 w-5 text-brand-purple dark:text-brand-teal" /> Añadir nueva obra
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Título de la obra <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Retrato Urbano Nocturno"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Categoría / Etiqueta <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <select
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">-- Seleccionar --</option>
                <option value="Teatro y Artes Escénicas">🎭 Teatro y Escénicas</option>
                <option value="Música y Producción Sonora">🎵 Música y Sonido</option>
                <option value="Danza y Expresión Corporal">💃 Danza y Expresión</option>
                <option value="Fotografía y Medios Digitales">📷 Fotografía</option>
                <option value="Pintura, Dibujo e Ilustración">🎨 Pintura e Ilustración</option>
                <option value="Audiovisual y Cine">🎬 Audiovisual y Cine</option>
                <option value="Escultura y Artes Plásticas">🗿 Escultura y Plásticas</option>
                <option value="Literatura y Escritura Creativa">✍️ Literatura</option>
                <option value="Diseño, Moda y Vestuario">👗 Diseño y Moda</option>
                <option value="Circo y Artes Callejeras">🎪 Circo y Callejera</option>
                <option value="Otra Categoría">✨ Otra Categoría</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as "P" | "G")}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="P">✅ Publicado</option>
                <option value="G">📝 Borrador / Guardado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Detalles sobre técnica, contexto o inspiración..."
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Archivo <span className="text-red-500">*</span>
          </label>
          <div className="relative group flex flex-1 w-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-purple hover:bg-brand-purple/5 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-teal dark:hover:bg-brand-teal/5 transition-all overflow-hidden text-center p-4">
            <input
              type="file"
              accept="image/*,.pdf,audio/*,video/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f && f.type.startsWith("image/")) {
                  setPreviewUrl(URL.createObjectURL(f));
                } else {
                  setPreviewUrl(null);
                }
              }}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            {previewUrl ? (
              <div className="absolute inset-0 z-0">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(null);
                    setFile(null);
                  }}
                  className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-transform hover:scale-110"
                  title="Quitar archivo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : file ? (
              <div className="z-10 flex flex-col items-center justify-center p-4">
                <div className="relative">
                  <span className="text-4xl mb-2 block">📄</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                    title="Quitar archivo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[200px] truncate">{file.name}</p>
              </div>
            ) : (
              <div className="z-0 flex flex-col items-center pointer-events-none">
                <div className="mb-3 rounded-full bg-white p-3 shadow-md dark:bg-gray-800 text-brand-purple dark:text-brand-teal transition-transform group-hover:-translate-y-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Haz clic o arrastra un archivo</p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                  <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">IMG</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">PDF</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">AUDIO</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700">VIDEO</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5 dark:border-gray-800">
        <div className="flex-1">
          {error && (
            <p className="text-sm font-medium text-red-500 animate-pulse flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </p>
          )}
        </div>
        <Button onClick={handleAddItem} disabled={uploading || !title || !file} className="px-6 flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Publicar Obra
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
