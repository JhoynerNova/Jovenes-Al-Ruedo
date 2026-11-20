/**
 * Archivo: __tests__/components/ThemeToggle.test.tsx
 * Descripción: Tests del componente ThemeToggle — cambio entre dark/light mode.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("renderiza el botón de toggle de tema", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("tiene aria-label accesible", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    // El aria-label depende del estado (oscuro/claro).
    expect(
      button.getAttribute("aria-label") === "Cambiar a tema oscuro" ||
        button.getAttribute("aria-label") === "Cambiar a tema claro",
    ).toBe(true);
  });

  it("alterna la clase 'dark' en html al hacer clic", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole("button");

    // Inicialmente light (sin dark), clic → dark.
    await user.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Segundo clic → vuelve a light.
    await user.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persiste la preferencia de tema en localStorage", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));
    expect(localStorage.getItem("theme")).toBe("dark");

    await user.click(screen.getByRole("button"));
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
