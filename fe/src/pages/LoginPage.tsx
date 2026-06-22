/**
 * Archivo: pages/LoginPage.tsx
 * Descripción: Página de inicio de sesión — formulario de email y contraseña.
 * ¿Para qué? Permitir que usuarios registrados se autentiquen en el sistema.
 * ¿Impacto? Es la puerta de entrada a la app — sin login, no se puede acceder a nada protegido.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";

/**
 * ¿Qué? Página de login con formulario, manejo de errores y redirección post-login.
 * ¿Para qué? Autenticar al usuario con email + password y obtener tokens JWT.
 * ¿Impacto? Una vez autenticado, se redirige al dashboard automáticamente.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  // ¿Qué? Estado del formulario — email y password.
  const [formData, setFormData] = useState({ email: "", password: "" });
  // ¿Qué? Errores específicos de validación por campo.
  const [errors, setErrors] = useState<Record<string, string>>({});
  // ¿Qué? Flag de carga — deshabilita el botón mientras se procesa el login.
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ¿Qué? Actualiza el campo correspondiente cuando el usuario escribe.
   * ¿Para qué? Mantener el estado sincronizado con los inputs del formulario.
   * ¿Impacto? Patrón controlled component — React controla el valor de cada input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // Limpiar error de campo al escribir
  };

  /**
   * ¿Qué? Valida los campos de entrada antes de hacer la petición.
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de correo no válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * ¿Qué? Envía las credenciales al backend y maneja la respuesta.
   * ¿Para qué? Autenticar al usuario y navegar al dashboard si es exitoso.
   * ¿Impacto? Si falla, muestra el mensaje de error. Si tiene éxito, redirige.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      await login(formData);
      showToast("¡Sesión iniciada correctamente!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      showToast(message, "error", "Error de inicio de sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Ingresa tus credenciales para acceder">
      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Correo electrónico"
          name="email"
          type="email"
          value={formData.email}
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email}
          onChange={handleChange}
        />

        <InputField
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          placeholder="••••••••"
          autoComplete="current-password"
          icon={<Lock className="h-5 w-5" />}
          error={errors.password}
          onChange={handleChange}
        />

        {/* ¿Qué? Enlace a recuperación de contraseña. */}
        <div className="mb-6 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* ¿Qué? Botón de submit con estado de carga. */}
        {/* ¿Para qué? Enviar el formulario y deshabilitarse mientras se procesa. */}
        <div className="flex justify-end">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Iniciar sesión
          </Button>
        </div>
      </form>

      {/* ¿Qué? Enlace a la página de registro. */}
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}

