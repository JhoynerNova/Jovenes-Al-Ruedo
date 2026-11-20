/**
 * Archivo: __tests__/components/Button.test.tsx
 * Descripción: Tests del componente Button — variantes, loading, disabled, onClick.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza el texto children correctamente", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("tiene type='button' por defecto", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("acepta type='submit' para formularios", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("ejecuta onClick al hacer clic", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("se deshabilita cuando disabled es true", () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("muestra spinner y se deshabilita cuando isLoading es true", () => {
    render(<Button isLoading>Cargando</Button>);
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("no ejecuta onClick cuando está cargando", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button isLoading onClick={handleClick}>
        Click
      </Button>,
    );
    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("aplica clase w-full cuando fullWidth es true", () => {
    render(<Button fullWidth>Ancho completo</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it.each(["primary", "secondary", "danger"] as const)(
    "renderiza correctamente la variante '%s'",
    (variant) => {
      render(<Button variant={variant}>Botón</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    },
  );
});
