import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 py-3 px-4 bg-slate-900/60 border border-slate-800/80 rounded-xl mb-6 backdrop-blur-sm">
      <Link to="/" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
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
};
