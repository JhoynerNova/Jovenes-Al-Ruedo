/**
 * Archivo: lib/social.ts
 * Descripción: Detecta a qué red social pertenece un link/handle guardado por el usuario,
 *              para mostrar el nombre de la red (ej. "Instagram") en vez del link literal,
 *              mientras el link real sigue funcionando por debajo.
 */

export interface DetectedSocialLink {
  platform: string;
  href: string;
}

const DOMAIN_PLATFORMS: [string, string][] = [
  ["instagram.com", "Instagram"],
  ["tiktok.com", "TikTok"],
  ["facebook.com", "Facebook"],
  ["fb.com", "Facebook"],
  ["twitter.com", "X (Twitter)"],
  ["x.com", "X (Twitter)"],
  ["youtube.com", "YouTube"],
  ["youtu.be", "YouTube"],
  ["behance.net", "Behance"],
  ["linkedin.com", "LinkedIn"],
  ["threads.net", "Threads"],
  ["wa.me", "WhatsApp"],
  ["whatsapp.com", "WhatsApp"],
];

export function detectSocialLink(raw: string): DetectedSocialLink | null {
  const value = raw.trim();
  if (!value) return null;

  const lower = value.toLowerCase();
  for (const [domain, platform] of DOMAIN_PLATFORMS) {
    if (lower.includes(domain)) {
      return { platform, href: value.startsWith("http") ? value : `https://${value}` };
    }
  }

  if (value.startsWith("@")) {
    return { platform: "Instagram", href: `https://instagram.com/${value.slice(1)}` };
  }

  if (value.startsWith("http")) {
    return { platform: "Sitio web", href: value };
  }

  return { platform: "Red social", href: `https://${value}` };
}
