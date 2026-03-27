export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Jóvenes al Ruedo. Todos los derechos reservados.
          </p>
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
