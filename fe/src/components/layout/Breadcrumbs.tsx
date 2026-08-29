/**
 * Archivo: components/layout/Breadcrumbs.tsx
 * Descripción: Migas de pan (breadcrumbs) que muestran la ruta de navegación actual.
 * ¿Para qué? Dar contexto de "dónde estoy" dentro de la app y permitir volver a un
 *           nivel anterior con un clic, sin depender del botón "atrás" del navegador.
 * ¿Impacto? Mejora la usabilidad — regla de UX de que el usuario nunca debe sentirse
 *           perdido dentro de la aplicación.
 */

import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

// ¿Qué? Etiquetas legibles para cada segmento de ruta conocido.
// ¿Para qué? Traducir el path técnico ("change-password") a un texto claro para el usuario.
// ¿Impacto? Un segmento sin entrada aquí se muestra tal cual (capitalizado) como fallback.
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Inicio",
  "change-password": "Cambiar contraseña",
  settings: "Configuración",
  mensajes: "Mensajes",
  explore: "Explorar",
  perfil: "Perfil",
};

function labelFor(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * ¿Qué? Genera las migas de pan a partir del pathname actual.
 * ¿Para qué? Cada segmento de la URL se vuelve un nivel navegable, salvo el último
 *           (la página actual), que se muestra como texto plano sin enlace.
 * ¿Impacto? En rutas de un solo nivel (ej: /dashboard) no se renderiza nada —
 *           las migas solo aportan valor cuando hay más de un nivel de profundidad.
 */
export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // ¿Qué? En el dashboard (la home autenticada) no hay nada que "romper en migas".
  // ¿Para qué? Evitar un breadcrumb redundante ("Inicio > Inicio") en la página raíz.
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return null;
  }

  return (
    <nav aria-label="Ruta de navegación" className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-brand-blue transition-colors">
        <Home className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Inicio</span>
      </Link>
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        return (
          <span key={path} className="flex items-center">
            <ChevronRight className="mx-1 h-4 w-4 text-gray-400 dark:text-gray-600" aria-hidden="true" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-gray-100" aria-current="page">
                {labelFor(segment)}
              </span>
            ) : (
              <Link to={path} className="hover:text-brand-blue transition-colors">
                {labelFor(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
