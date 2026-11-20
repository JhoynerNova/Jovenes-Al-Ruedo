/**
 * Archivo: hooks/useAuth.ts
 * Descripción: Hook personalizado que provee el estado de autenticación y sus acciones.
 */

import { useContext } from "react";
import { AuthContext } from "@/context/authContextDef";
import type { AuthContextType } from "@/types/auth";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth debe usarse dentro de un AuthProvider. " +
        "Verifica que <AuthProvider> envuelve el componente que llama useAuth().",
    );
  }

  return context;
}
