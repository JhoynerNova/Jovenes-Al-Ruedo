import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Inicio",
  "change-password": "Cambiar contraseña",
  settings: "Configuración",
  mensajes: "Mensajes",
  explore: "Explorar",
  perfil: "Perfil",
};

function labelFor(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // Si el segmento es un UUID o un ID numérico, no mostrar el hash crudo en pantalla
  if (/^[0-9a-fA-F-]{20,}$/.test(segment) || /^\d+$/.test(segment)) {
    return "Detalle de Perfil";
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();

  if (items && items.length > 0) {
    return (
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-medium text-slate-400 py-3 px-4 bg-slate-900/60 border border-slate-800/80 rounded-xl mb-6 backdrop-blur-sm">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              {item.path && !isLast ? (
                <Link to={item.path} className="hover:text-emerald-400 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  const segments = location.pathname.split("/").filter(Boolean);
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
};
