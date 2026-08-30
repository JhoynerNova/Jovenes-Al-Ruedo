import { Instagram, Facebook, Youtube } from "lucide-react";

export function Footer() {
  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/jovenes_al_ruedo/", Icono: Instagram },
    { label: "Facebook", href: "https://web.facebook.com/profile.php?id=61580351439961", Icono: Facebook },
    { label: "YouTube", href: "https://www.youtube.com/@JovenesALRuedo", Icono: Youtube },
  ];

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Jóvenes al Ruedo. Todos los derechos reservados.
          </p>

          {/* Redes Sociales Oficiales */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hover:bg-brand-purple hover:text-white dark:hover:bg-brand-purple"
              >
                <s.Icono className="h-4 w-4" />
              </a>
            ))}
          </div>

          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <a href="/privacy-policy" className="hover:text-brand-purple dark:hover:text-brand-purple">
              Política de Privacidad
            </a>
            <a href="/terms" className="hover:text-brand-purple dark:hover:text-brand-purple">
              Términos de Servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
