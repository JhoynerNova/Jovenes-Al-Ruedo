/**
 * Archivo: __tests__/components/InputField.test.tsx
 * Descripción: Tests del componente InputField — label, error, password toggle, accesibilidad.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputField } from "@/components/ui/InputField";

describe("InputField", () => {
  const baseProps = {
    label: "Correo electrónico",
    name: "email",
    value: "",
    onChange: vi.fn(),
  };

  it("renderiza el label", () => {
    render(<InputField {...baseProps} />);
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("muestra el placeholder", () => {
    render(<InputField {...baseProps} placeholder="correo@ejemplo.com" />);
    expect(screen.getByPlaceholderText("correo@ejemplo.com")).toBeInTheDocument();
  });

  it("muestra el valor proporcionado", () => {
    render(<InputField {...baseProps} value="test@test.com" />);
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("test@test.com");
  });

  it("ejecuta onChange al escribir", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<InputField {...baseProps} onChange={handleChange} />);
    await user.type(screen.getByLabelText("Correo electrónico"), "a");

    expect(handleChange).toHaveBeenCalled();
  });

  it("muestra el mensaje de error", () => {
    render(<InputField {...baseProps} error="El correo es obligatorio" />);
    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
  });

  it("marca aria-invalid cuando hay error", () => {
    render(<InputField {...baseProps} error="Error" />);
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("aria-invalid", "true");
  });

  it("el mensaje de error tiene role='alert'", () => {
    render(<InputField {...baseProps} error="Campo requerido" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Campo requerido");
  });

  it("no muestra error cuando no hay", () => {
    render(<InputField {...baseProps} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra botón de mostrar/ocultar en campos de password", () => {
    render(<InputField {...baseProps} type="password" />);
    expect(screen.getByLabelText("Mostrar contraseña")).toBeInTheDocument();
  });

  it("alterna entre password y text al hacer clic en el toggle", async () => {
    const user = userEvent.setup();

    render(<InputField {...baseProps} name="password" type="password" />);
    const input = screen.getByLabelText("Correo electrónico");

    // Inicialmente es password.
    expect(input).toHaveAttribute("type", "password");

    // Clic en mostrar → cambia a text.
    await user.click(screen.getByLabelText("Mostrar contraseña"));
    expect(input).toHaveAttribute("type", "text");

    // Clic en ocultar → vuelve a password.
    await user.click(screen.getByLabelText("Ocultar contraseña"));
    expect(input).toHaveAttribute("type", "password");
  });

  it("no muestra toggle para inputs de tipo text", () => {
    render(<InputField {...baseProps} type="text" />);
    expect(screen.queryByLabelText("Mostrar contraseña")).not.toBeInTheDocument();
  });

  it("renderiza el icono cuando se pasa la prop icon", () => {
    render(
      <InputField {...baseProps} icon={<span data-testid="test-icon">icon</span>} />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("no renderiza contenedor de icono cuando no se pasa la prop", () => {
    const { container } = render(<InputField {...baseProps} />);
    expect(container.querySelector(".pointer-events-none")).not.toBeInTheDocument();
  });
});
