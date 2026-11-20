/**
 * Archivo: __tests__/pages/DashboardPage.test.tsx
 * Descripción: Tests de la página de dashboard — información del perfil y acciones.
 */

import { screen } from "@testing-library/react";
import { DashboardPage } from "@/pages/DashboardPage";
import { renderWithProviders, mockUser } from "../helpers";

describe("DashboardPage", () => {
  it("muestra el nombre del usuario en el saludo", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    expect(screen.getByText(`Bienvenido, ${mockUser.full_name}`)).toBeInTheDocument();
  });

  it("muestra el correo del usuario", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it("muestra el estado activo del usuario", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("muestra la fecha de registro formateada", () => {
    // Usar una fecha que no cambie de día por diferencia horaria UTC
    const userWithSafeDate = { ...mockUser, created_at: "2026-06-15T12:00:00Z" };
    renderWithProviders(<DashboardPage />, {
      authContext: { user: userWithSafeDate, isAuthenticated: true },
    });

    // Esperamos el mes junio y el año 2026 en el texto
    const dateCell = screen.getByText(/junio/i);
    expect(dateCell).toBeInTheDocument();
    expect(dateCell.textContent).toContain("2026");
  });

  it("tiene enlace a cambiar contraseña", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
  });

  it("muestra Inactivo si el usuario no está activo", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: { ...mockUser, is_active: false }, isAuthenticated: true },
    });

    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });
});
