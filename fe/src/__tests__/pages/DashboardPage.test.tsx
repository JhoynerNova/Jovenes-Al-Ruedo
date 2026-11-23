/**
 * Archivo: __tests__/pages/DashboardPage.test.tsx
 * Descripción: Tests de la página de dashboard — información del perfil y acciones.
 */

import { screen } from "@testing-library/react";
import { DashboardPage } from "@/pages/DashboardPage";
import { renderWithProviders, mockUser } from "../helpers";

describe("DashboardPage", () => {
  it("muestra el nombre del usuario en el saludo o encabezado", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    expect(screen.getByRole("heading", { name: mockUser.full_name })).toBeInTheDocument();
  });

  it("muestra el correo o área artística del usuario", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    const elements = screen.getAllByText(mockUser.artistic_area!);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  it("muestra el estado activo del usuario", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("muestra la fecha de registro formateada", () => {
    const userWithSafeDate = { ...mockUser, created_at: "2026-06-15T12:00:00Z" };
    renderWithProviders(<DashboardPage />, {
      authContext: { user: userWithSafeDate, isAuthenticated: true },
    });

    const dateCell = screen.getByText(/junio/i);
    expect(dateCell).toBeInTheDocument();
    expect(dateCell.textContent).toContain("2026");
  });

  it("tiene enlace o botón a ver perfil público", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: mockUser, isAuthenticated: true },
    });

    expect(screen.getByText(/Ver mi perfil público/i)).toBeInTheDocument();
  });

  it("muestra Inactivo si el usuario no está activo", () => {
    renderWithProviders(<DashboardPage />, {
      authContext: { user: { ...mockUser, is_active: false }, isAuthenticated: true },
    });

    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });
});
