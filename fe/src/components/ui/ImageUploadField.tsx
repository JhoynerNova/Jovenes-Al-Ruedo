/**
 * Archivo: components/ui/ImageUploadField.tsx
 * Descripción: Input de imagen reutilizable con previsualización y subida automática.
 * ¿Para qué? Foto de perfil, banner y logo se suben todos igual (elegir archivo → preview
 *            instantáneo → subir a /api/v1/upload → devolver la URL al formulario padre).
 * ¿Impacto? Único punto de subida de imágenes en todo el frontend — cualquier pantalla que
 *           necesite este flujo (onboarding, Settings) reutiliza este componente en vez de
 *           reimplementar el manejo de archivo + FormData + preview.
 */

import { useRef, useState, useEffect } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { uploadApi } from "../../api/upload";
import { toAbsoluteMediaUrl } from "../../lib/media";

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  shape?: "circle" | "rectangle";
  onError?: (message: string) => void;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploadField({
  label,
  value,
  onChange,
  shape = "circle",
  onError,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ? toAbsoluteMediaUrl(value) : null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreview(value ? toAbsoluteMediaUrl(value) : null);
  }, [value]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange("");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError?.("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      onError?.("La imagen no puede superar los 10MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      setIsUploading(true);
      const url = await uploadApi.uploadFile(file);
      setPreview(toAbsoluteMediaUrl(url));
      onChange(url);
    } catch {
      onError?.("No se pudo subir la imagen, intentá de nuevo");
      setPreview(value ? toAbsoluteMediaUrl(value) : null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const shapeClasses =
    shape === "circle"
      ? "h-24 w-24 rounded-full"
      : "h-32 w-full max-w-sm rounded-xl";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`relative flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-brand-purple transition-colors ${shapeClasses}`}
        >
          {preview ? (
            <img src={preview} alt={label} className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-6 w-6 text-gray-400" />
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </button>

        {preview && !isUploading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 focus:outline-none transition-transform hover:scale-110"
            title="Quitar imagen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}
