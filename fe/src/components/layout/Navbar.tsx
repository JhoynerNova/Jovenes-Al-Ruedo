/**
 * Archivo: components/layout/Navbar.tsx
 * Descripción: Barra de navegación superior con logo, toggle de tema y logout.
 * ¿Para qué? Proveer navegación consistente y acceso al toggle dark/light en toda la app.
 * ¿Impacto? Sin navbar, el usuario no tendría forma de cerrar sesión ni cambiar tema.
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import logo from "@/assets/logo.png";

/**
 * ¿Qué? Barra de navegación con logo, nombre de usuario, toggle de tema y logout.
 * ¿Para qué? Presente en todas las páginas autenticadas (Dashboard, ChangePassword, etc.).
 * ¿Impacto? Diseño: fondo sólido (sin degradado), bordes sutiles, botones a la derecha.
 */
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * ¿Qué? Clases del link de navegación según si su ruta es la actual.
   * ¿Para qué? Resaltar visualmente en qué sección está el usuario — regla de usabilidad
   *           básica: el menú debe reflejar dónde estás, no solo a dónde puedes ir.
   * ¿Impacto? Sin esto, todos los links se ven idénticos sin importar la página activa.
   */
  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path
        ? "text-white font-semibold border-b-2 border-brand-blue pb-0.5"
        : "text-purple-200 hover:text-white"
    }`;

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
            <Link to="/dashboard" className={navLinkClass("/dashboard")}>
              Inicio
            </Link>
            <Link to="/explore" className={navLinkClass("/explore")}>
              Explorar
            </Link>
            <Link to="/settings" className={navLinkClass("/settings")}>
              Configuración
            </Link>
            <Link to="/mensajes" className={navLinkClass("/mensajes")}>
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
              <button
                onClick={async () => {
                  try {
                    const { chatApi } = await import("@/api/chat");
                    const conv = await chatApi.startSupportChat();
                    navigate(`/mensajes?convId=${conv.id_conversacion}`);
                  } catch {
                    navigate("/mensajes");
                  }
                }}
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-all"
                title="Chat directo con Soporte Oficial"
              >
                🛠️ Soporte
              </button>

              <NotificationBell />

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
