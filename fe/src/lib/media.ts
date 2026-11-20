/**
 * Archivo: lib/media.ts
 * Descripción: Utilidad compartida para convertir rutas relativas de /uploads en URLs absolutas.
 */

export function toAbsoluteMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return `${apiBase}${url}`;
}
