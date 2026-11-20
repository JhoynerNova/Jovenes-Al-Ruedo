/**
 * Archivo: pages/ForgotPasswordPage.tsx
 * Descripción: Página para solicitar recuperación de contraseña por email.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("El correo es obligatorio");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      );
      setEmail("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al enviar la solicitud";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace de recuperación"
    >
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} />
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Correo electrónico"
          name="email"
          type="email"
          value={email}
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          icon={<Mail className="h-5 w-5" />}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
        />

        <div className="mt-2 flex justify-end">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Enviar enlace
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <Link
          to="/login"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
