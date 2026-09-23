/**
 * Archivo: pages/onboarding/OnboardingPage.tsx
 * Descripción: Punto de entrada de la ruta /onboarding — decide qué wizard mostrar según el rol.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArtistOnboarding } from "./ArtistOnboarding";
import { CompanyOnboarding } from "./CompanyOnboarding";

export function OnboardingPage() {
  const { user } = useAuth();

  if (!user) return null;
  if (user.role === "empresa") return <CompanyOnboarding />;
  if (user.role === "artista") return <ArtistOnboarding />;

  return <Navigate to="/dashboard" replace />;
}
