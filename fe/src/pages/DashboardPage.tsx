/**
 * Archivo: pages/DashboardPage.tsx
 * Descripción: Página principal del usuario autenticado — muestra su perfil e información.
 */

import { useAuth } from "@/hooks/useAuth";
import { ArtistDashboard } from "./ArtistDashboard";
import { CompanyDashboard } from "./CompanyDashboard";
import { AdminDashboard } from "./AdminDashboard";

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // O un spinner intermedio
  }

  // Renderizar el dashboard según el rol del usuario
  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "empresa":
      return <CompanyDashboard />;
    case "artista":
    default:
      return <ArtistDashboard />;
  }
}
