/**
 * Archivo: lib/user.ts
 * Descripción: Helper para generar slugs amigables y limpios para la URL de perfil de los usuarios.
 * Convierte "Lorena Oviedo" + UUID -> "lorena-oviedo-bd2b358f"
 */

export function getUserProfileSlug(user: { id: string; full_name?: string; first_name?: string; last_name?: string }): string {
  if (!user || !user.id) return "";
  const name = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const shortHex = user.id.slice(0, 8);
  if (name) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${slug}-${shortHex}`;
  }
  return shortHex;
}
