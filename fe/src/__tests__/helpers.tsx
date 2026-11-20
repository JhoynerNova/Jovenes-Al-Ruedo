/**
 * Archivo: __tests__/helpers.tsx
 * Descripción: Utilidades compartidas para tests — wrappers de renderizado con providers.
 */

import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthContext } from "@/context/authContextDef";
import { ToastProvider } from "@/context/ToastContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import type { AuthContextType, UserResponse } from "@/types/auth";
import type { ReactNode } from "react";

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

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  authContext?: Partial<AuthContextType>;
  initialRoute?: string;
}

export function renderWithProviders(
  ui: ReactNode,
  { authContext = {}, initialRoute = "/", ...options }: CustomRenderOptions = {},
) {
  const value: AuthContextType = { ...defaultAuthContext, ...authContext };

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialRoute]}>
        <ToastProvider>
          <AuthContext.Provider value={value}>
            <AuthModalProvider>{children}</AuthModalProvider>
          </AuthContext.Provider>
        </ToastProvider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    authContext: value,
  };
}
