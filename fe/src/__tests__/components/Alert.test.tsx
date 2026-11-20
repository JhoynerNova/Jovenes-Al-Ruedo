/**
 * Archivo: __tests__/components/Alert.test.tsx
 * Descripción: Tests del componente Alert — tipos, mensaje, botón de cierre.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert } from "@/components/ui/Alert";

describe("Alert", () => {
  it("renderiza el mensaje proporcionado", () => {
    render(<Alert type="info" message="Esto es informativo" />);
    expect(screen.getByText("Esto es informativo")).toBeInTheDocument();
  });

  it("tiene role='alert' para accesibilidad", () => {
    render(<Alert type="error" message="Error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it.each(["success", "error", "info"] as const)(
    "renderiza correctamente el tipo '%s'",
    (type) => {
      render(<Alert type={type} message={`Alerta ${type}`} />);
      expect(screen.getByText(`Alerta ${type}`)).toBeInTheDocument();
    },
  );

  it("no muestra botón de cierre sin onClose", () => {
    render(<Alert type="info" message="Sin cierre" />);
    expect(screen.queryByLabelText("Cerrar alerta")).not.toBeInTheDocument();
  });

  it("muestra botón de cierre y ejecuta onClose al hacer clic", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<Alert type="error" message="Cerrable" onClose={handleClose} />);

    const closeButton = screen.getByLabelText("Cerrar alerta");
    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
