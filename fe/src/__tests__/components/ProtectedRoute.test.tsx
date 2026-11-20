/**
 * Archivo: __tests__/components/ProtectedRoute.test.tsx
 * Descripción: Tests del componente ProtectedRoute — guarda contra acceso no autorizado.
 */

import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { mockUser, renderWithProviders } from "../helpers";

describe("ProtectedRoute", () => {
  const ProtectedContent = () => <div>Contenido protegido</div>;
  const LoginFallback = () => <div>Página de login</div>;

    function renderProtected(authOverrides = {}) {
    return renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginFallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
      </Routes>,
      { authContext: authOverrides, initialRoute: "/dashboard" },
    );
  }

  it("muestra spinner mientras isLoading es true", () => {
    renderProtected({ isLoading: true });
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("redirige a /login si no está autenticado", () => {
    renderProtected({ isAuthenticated: false, isLoading: false });
    expect(screen.getByText("Página de login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("renderiza children si está autenticado", () => {
    renderProtected({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      accessToken: "fake-token",
    });
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("no renderiza children mientras carga", () => {
    renderProtected({ isLoading: true, isAuthenticated: false });
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });
});
