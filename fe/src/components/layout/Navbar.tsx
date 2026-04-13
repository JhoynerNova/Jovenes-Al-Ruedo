/**
 * Archivo: components/layout/Navbar.tsx
 * Descripción: Barra de navegación superior con logo, toggle de tema y logout.
 * ¿Para qué? Proveer navegación consistente y acceso al toggle dark/light en toda la app.
 * ¿Impacto? Sin navbar, el usuario no tendría forma de cerrar sesión ni cambiar tema.
 */

import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import logo from "@/assets/logo.png";

/**
 * ¿Qué? Barra de navegación con logo, nombre de usuario, toggle de tema y logout.
 * ¿Para qué? Presente en todas las páginas autenticadas (Dashboard, ChangePassword, etc.).
 * ¿Impacto? Diseño: fondo sólido (sin degradado), bordes sutiles, botones a la derecha.
 */
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * ¿Qué? Handler de logout — cierra sesión y redirige al login.
   * ¿Para qué? Limpiar tokens y enviar al usuario a la página de login.
   * ¿Impacto? Sin la redirección, el usuario quedaría en una página protegida sin sesión.
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-brand-purple/40 bg-brand-dark">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ¿Qué? Logo/nombre de la app — enlace al dashboard o landing. */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <img src={logo} alt="Jóvenes al Ruedo" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Jóvenes al Ruedo</span>
        </Link>

        {/* Menú de navegación central */}
        {isAuthenticated && (
          <div className="hidden md:flex space-x-8">
            <Link to="/dashboard" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link to="/explore" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
              Explorar
            </Link>
            <Link to="/settings" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
              Configuración
            </Link>
            <Link to="/mensajes" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
              Mensajes
            </Link>
          </div>
        )}

        {/* ¿Qué? Acciones de la derecha: info del usuario, toggle de tema, logout. */}
        {/* ¿Para qué? Agrupar acciones secundarias y el toggle de tema juntos. */}
        {/* ¿Impacto? Botones alineados a la derecha según las reglas de diseño. */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated && user && (
            <>
              {/* ¿Qué? Nombre del usuario autenticado. */}
              <span className="hidden text-sm text-purple-200 sm:block">
                {user.full_name}
              </span>

              {/* ¿Qué? Botón de cerrar sesión prominente y visible. */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
