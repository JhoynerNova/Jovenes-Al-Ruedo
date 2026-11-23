/**
 * Archivo: __tests__/pages/RegisterPage.test.tsx
 * Descripción: Tests de la página de registro — campos, validación cliente, envío, errores.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { RegisterPage } from "@/pages/RegisterPage";
import { renderWithProviders } from "../helpers";

describe("RegisterPage", () => {
  it("renderiza el formulario completo de registro", () => {
    renderWithProviders(<RegisterPage />, { initialRoute: "/register" });

    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellido")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha de nacimiento")).toBeInTheDocument();
    expect(screen.getByLabelText("Área artística")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it("muestra enlace a iniciar sesión", () => {
    renderWithProviders(<RegisterPage />, { initialRoute: "/register" });
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
  });

  it("muestra error si el nombre tiene menos de 2 caracteres", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { initialRoute: "/register" });

    await user.type(screen.getByLabelText("Nombre"), "A");
    await user.type(screen.getByLabelText("Apellido"), "Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com");
    await user.type(screen.getByLabelText("Fecha de nacimiento"), "2000-01-01");
    await user.selectOptions(screen.getByLabelText("Área artística"), "Música");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.type(screen.getByLabelText("Confirmar"), "Password1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("El nombre debe tener al menos 2 caracteres")).toBeInTheDocument();
  });

  it("muestra error si la contraseña es muy corta", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { initialRoute: "/register" });

    await user.type(screen.getByLabelText("Nombre"), "Test");
    await user.type(screen.getByLabelText("Apellido"), "User");
    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com");
    await user.type(screen.getByLabelText("Fecha de nacimiento"), "2000-01-01");
    await user.selectOptions(screen.getByLabelText("Área artística"), "Música");
    await user.type(screen.getByLabelText("Contraseña"), "Ab1");
    await user.type(screen.getByLabelText("Confirmar"), "Ab1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { initialRoute: "/register" });

    await user.type(screen.getByLabelText("Nombre"), "Test");
    await user.type(screen.getByLabelText("Apellido"), "User");
    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com");
    await user.type(screen.getByLabelText("Fecha de nacimiento"), "2000-01-01");
    await user.selectOptions(screen.getByLabelText("Área artística"), "Música");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.type(screen.getByLabelText("Confirmar"), "Password2");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  it("ejecuta register al enviar formulario válido", async () => {
    const registerMock = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(<RegisterPage />, {
      initialRoute: "/register",
      authContext: { register: registerMock },
    });

    await user.type(screen.getByLabelText("Nombre"), "Juan");
    await user.type(screen.getByLabelText("Apellido"), "Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "juan@nn.com");
    await user.type(screen.getByLabelText("Fecha de nacimiento"), "2000-01-01");
    await user.selectOptions(screen.getByLabelText("Área artística"), "Música");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.type(screen.getByLabelText("Confirmar"), "Password1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(registerMock).toHaveBeenCalledWith({
      role: "artista",
      first_name: "Juan",
      last_name: "Pérez",
      email: "juan@nn.com",
      birth_date: "2000-01-01",
      artistic_area: "Música",
      password: "Password1",
      accepted_terms: true,
    });
  });

  it("muestra alerta de error cuando register falla", async () => {
    const registerMock = vi.fn().mockRejectedValue(new Error("El email ya está registrado"));
    const user = userEvent.setup();

    renderWithProviders(<RegisterPage />, {
      initialRoute: "/register",
      authContext: { register: registerMock },
    });

    await user.type(screen.getByLabelText("Nombre"), "Test");
    await user.type(screen.getByLabelText("Apellido"), "User");
    await user.type(screen.getByLabelText("Correo electrónico"), "dup@nn.com");
    await user.type(screen.getByLabelText("Fecha de nacimiento"), "2000-01-01");
    await user.selectOptions(screen.getByLabelText("Área artística"), "Música");
    await user.type(screen.getByLabelText("Contraseña"), "Password1");
    await user.type(screen.getByLabelText("Confirmar"), "Password1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("El email ya está registrado")).toBeInTheDocument();
  });
});