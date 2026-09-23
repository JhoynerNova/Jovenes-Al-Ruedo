/**
 * Archivo: __tests__/helpers.tsx
 * Descripción: Utilidades compartidas para tests — wrappers de renderizado con providers.
 * ¿Para qué? Proveer AuthContext y Router a los componentes bajo test.
 * ¿Impacto? Sin estos helpers, cada test tendría que configurar providers manualmente,
 *           causando duplicación y posibles inconsistencias.
 */

import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthContext } from "@/context/authContextDef";
import type { AuthContextType, UserResponse } from "@/types/auth";
import type { ReactNode } from "react";

// ¿Qué? Usuario fake para tests que necesitan sesión activa.
// ¿Para qué? Simular un usuario autenticado sin llamar al backend.
// ¿Impacto? Se usa en tests de Dashboard, ChangePassword, ProtectedRoute, etc.
export const mockUser: UserResponse = {
  id: "test-user-id",
  email: "test@example.com",
  first_name: "Usuario",
  last_name: "Prueba",
  full_name: "Usuario Prueba",
  role: "artista",
  sector: null,
  birth_date: "2000-01-01",
  artistic_area: "Music",
  bio: null,
  location: null,
  profile_pic_url: null,
  cover_pic_url: null,
  social_links: null,
  artistic_disciplines: null,
  looking_for_disciplines: null,
  company_legal_name: null,
  company_nit: null,
  company_size: null,
  onboarding_completed: true,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

// ¿Qué? Valor por defecto del AuthContext para tests.
// ¿Para qué? Proveer un contexto de auth controlado por cada test.
// ¿Impacto? Cada test puede sobreescribir las propiedades que necesite.
export const defaultAuthContext: AuthContextType = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  updateUser: vi.fn(),
};

/**
 * ¿Qué? Opciones de renderizado personalizadas para tests.
 * ¿Para qué? Permitir inyectar un AuthContext custom y una ruta inicial.
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  authContext?: Partial<AuthContextType>;
  initialRoute?: string;
}

/**
 * ¿Qué? Función de render personalizada que envuelve el componente con providers.
 * ¿Para qué? Simplificar los tests — no es necesario repetir AuthContext.Provider + MemoryRouter.
 * ¿Impacto? Todos los tests usan esta función en lugar de render() directo.
 */
export function renderWithProviders(
  ui: ReactNode,
  { authContext = {}, initialRoute = "/", ...options }: CustomRenderOptions = {},
) {
  const value: AuthContextType = { ...defaultAuthContext, ...authContext };

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    authContext: value,
  };
}
