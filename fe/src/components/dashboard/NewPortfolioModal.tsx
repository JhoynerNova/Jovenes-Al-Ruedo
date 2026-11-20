import { useState } from "react";
import { FolderPlus, Image, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { portafolioApi, type PortafolioResponse } from "@/api/portafolio";
import { uploadApi } from "@/api/upload";

interface NewPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdPort: PortafolioResponse) => void;
}

export function NewPortfolioModal({ isOpen, onClose, onSuccess }: NewPortfolioModalProps) {
  const [nombre, setNombre] = useState("");
  const [desc, setDesc] = useState("");
  const [visibilidad, setVisibilidad] = useState("Publico");
  const [firstItemTitle, setFirstItemTitle] = useState("");
  const [firstItemDesc, setFirstItemDesc] = useState("");
  const [firstItemTags, setFirstItemTags] = useState("");
  const [firstItemFile, setFirstItemFile] = useState<File | null>(null);
  const [firstItemPreview, setFirstItemPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!nombre.trim()) {
      setError("El nombre del portafolio es obligatorio");
      return;
    }
    if (firstItemFile && !firstItemTitle.trim()) {
      setError("Escribe un título para la primera obra seleccionada");
      return;
    }
    setError("");
    setCreating(true);
    try {
      const createdPort = await portafolioApi.create({
        nombre: nombre.trim(),
        descripcion: desc.trim() || undefined,
        visibilidad,
      });

      if (firstItemFile) {
        const url = await uploadApi.uploadFile(firstItemFile);
        await portafolioApi.addItem(createdPort.id_port, {
          archivo: url,
          titulo: firstItemTitle.trim() || nombre.trim(),
          descripcion: firstItemDesc.trim() || undefined,
          etiquetas: firstItemTags.trim() || undefined,
          estado: "P",
        });
      }

      setNombre("");
      setDesc("");
      setVisibilidad("Publico");
      setFirstItemTitle("");
      setFirstItemDesc("");
      setFirstItemTags("");
      setFirstItemFile(null);
      setFirstItemPreview(null);
      onSuccess(createdPort);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Error al crear portafolio");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-brand-purple/30 bg-white p-6 shadow-xl dark:border-brand-teal/30 dark:bg-gray-900 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple dark:bg-brand-teal/10 dark:text-brand-teal">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crear nuevo portafolio</h3>
            <p className="text-xs text-gray-500">Crea tu colección y añade tu primera obra de una vez</p>
          </div>
        </div>
        <button
          onClick={() => {
            onClose();
            setError("");
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-teal">
          1. Datos del Portafolio
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Nombre del portafolio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Fotografía Urbana 2025..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Visibilidad
            </label>
            <select
              value={visibilidad}
              onChange={(e) => setVisibilidad(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="Publico">🌐 Público (Visible en perfil)</option>
              <option value="Postulaciones">💼 Solo Postulaciones</option>
              <option value="Privado">🔒 Privado</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Descripción del portafolio <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Explica la temática o concepto artístico..."
              rows={2}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-teal flex items-center gap-1.5">
          <Image className="h-4 w-4" /> 2. Añadir primera obra <span className="text-gray-400 font-normal lowercase">(opcional)</span>
        </h4>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Título de la obra
              </label>
              <input
                type="text"
                value={firstItemTitle}
                onChange={(e) => setFirstItemTitle(e.target.value)}
                placeholder="Ej: Obra Nro 1 - Atardecer"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Categoría / Etiqueta
              </label>
              <select
                value={firstItemTags}
                onChange={(e) => setFirstItemTags(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">-- Selecciona una Categoría --</option>
                <option value="Teatro y Artes Escénicas">🎭 Teatro y Artes Escénicas</option>
                <option value="Música y Producción Sonora">🎵 Música y Producción Sonora</option>
                <option value="Danza y Expresión Corporal">💃 Danza y Expresión Corporal</option>
                <option value="Fotografía y Medios Digitales">📷 Fotografía y Medios Digitales</option>
                <option value="Pintura, Dibujo e Ilustración">🎨 Pintura, Dibujo e Ilustración</option>
                <option value="Audiovisual y Cine">🎬 Audiovisual y Cine</option>
                <option value="Escultura y Artes Plásticas">🗿 Escultura y Artes Plásticas</option>
                <option value="Literatura y Escritura Creativa">✍️ Literatura y Escritura Creativa</option>
                <option value="Diseño, Moda y Vestuario">👗 Diseño, Moda y Vestuario</option>
                <option value="Circo y Artes Callejeras">🎪 Circo y Artes Callejeras</option>
                <option value="Otra Categoría">✨ Otra Categoría</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Descripción de la obra
              </label>
              <textarea
                value={firstItemDesc}
                onChange={(e) => setFirstItemDesc(e.target.value)}
                placeholder="Detalles sobre esta obra inicial..."
                rows={2}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Archivo de la obra
            </label>
            <div className="relative group flex flex-1 w-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-purple hover:bg-brand-purple/5 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-teal dark:hover:bg-brand-teal/5 transition-all overflow-hidden text-center p-4">
              <input
                type="file"
                accept="image/*,.pdf,audio/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFirstItemFile(file);
                  if (file && file.type.startsWith("image/")) {
                    setFirstItemPreview(URL.createObjectURL(file));
                  } else {
                    setFirstItemPreview(null);
                  }
                }}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              {firstItemPreview ? (
                <div className="absolute inset-0 z-0">
                  <img
                    src={firstItemPreview}
                    alt="Preview"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFirstItemPreview(null);
                      setFirstItemFile(null);
                    }}
                    className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-transform hover:scale-110"
                    title="Quitar archivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : firstItemFile ? (
                <div className="z-10 flex flex-col items-center justify-center p-4">
                  <span className="text-4xl mb-2 block">📄</span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white max-w-[200px] truncate">
                    {firstItemFile.name}
                  </p>
                  <span className="text-xs text-gray-500 mt-1">
                    {(firstItemFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none p-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-brand-purple dark:text-brand-teal">
                    <Image className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Arrastra o haz clic para subir
                    </span>
                    <p className="text-xs text-gray-500">Imágenes, Audio, Video o PDF</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <Button variant="secondary" onClick={onClose} disabled={creating}>
          Cancelar
        </Button>
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? "Creando..." : "Crear Portafolio"}
        </Button>
      </div>
    </div>
  );
}
