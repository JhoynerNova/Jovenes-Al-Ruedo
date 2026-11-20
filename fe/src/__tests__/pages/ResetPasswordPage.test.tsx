/**
 * Archivo: __tests__/pages/ResetPasswordPage.test.tsx
 * Descripción: Tests de la página de restablecimiento de contraseña con token.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { renderWithProviders } from "../helpers";

describe("ResetPasswordPage", () => {
  it("muestra error si no hay token en la URL", () => {
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: "/reset-password",
    });

    expect(
      screen.getByText("El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Solicitar nuevo enlace")).toBeInTheDocument();
  });

  it("renderiza formulario si hay token en la URL", () => {
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: "/reset-password?token=valid-token-123",
    });

    expect(screen.getByRole("heading", { name: "Restablecer contraseña" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar nueva contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restablecer contraseña" })).toBeInTheDocument();
  });

  it("muestra error si la nueva contraseña es muy corta", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: "/reset-password?token=abc123",
    });

    await user.type(screen.getByLabelText("Nueva contraseña"), "Aa1");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña"), "Aa1");
    await user.click(screen.getByRole("button", { name: "Restablecer contraseña" }));

    expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: "/reset-password?token=abc123",
    });

    await user.type(screen.getByLabelText("Nueva contraseña"), "NewPass1!");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña"), "Different1");
    await user.click(screen.getByRole("button", { name: "Restablecer contraseña" }));

    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  it("ejecuta resetPassword con token y nueva contraseña", async () => {
    const resetPasswordMock = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: "/reset-password?token=valid-token-xyz",
      authContext: { resetPassword: resetPasswordMock },
    });

    await user.type(screen.getByLabelText("Nueva contraseña"), "NewPass1!");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña"), "NewPass1!");
    await user.click(screen.getByRole("button", { name: "Restablecer contraseña" }));

    expect(resetPasswordMock).toHaveBeenCalledWith({
      token: "valid-token-xyz",
      new_password: "NewPass1!",
    });
  });

  it("muestra mensaje de éxito al restablecer contraseña", async () => {
    const resetPasswordMock = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: "/reset-password?token=valid-token",
      authContext: { resetPassword: resetPasswordMock },
    });

    await user.type(screen.getByLabelText("Nueva contraseña"), "NewPass1!");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña"), "NewPass1!");
    await user.click(screen.getByRole("button", { name: "Restablecer contraseña" }));

    expect(
      await screen.findByText(
        "Contraseña restablecida exitosamente. Ya puedes iniciar sesión.",
      ),
    ).toBeInTheDocument();
  });

  it("muestra error si resetPassword falla", async () => {
    const resetPasswordMock = vi
      .fn()
      .mockRejectedValue(new Error("Token expirado o ya utilizado"));
    const user = userEvent.setup();

    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: "/reset-password?token=expired-token",
      authContext: { resetPassword: resetPasswordMock },
    });

    await user.type(screen.getByLabelText("Nueva contraseña"), "NewPass1!");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña"), "NewPass1!");
    await user.click(screen.getByRole("button", { name: "Restablecer contraseña" }));

    expect(await screen.findByText("Token expirado o ya utilizado")).toBeInTheDocument();
  });
});
