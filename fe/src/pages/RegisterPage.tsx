/**
 * Archivo: pages/RegisterPage.tsx
 * Descripción: Página de registro — formulario para crear una nueva cuenta.
 * ¿Para qué? Permitir que nuevos usuarios se registren con email, nombre y contraseña.
 * ¿Impacto? Sin esta página, no habría forma de crear cuentas desde el frontend.
 */

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, KeyRound, Calendar, Palette, Building2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";

/**
 * ¿Qué? Página de registro con validación de campos y feedback de errores.
 * ¿Para qué? Crear cuenta → login automático → redirección al dashboard.
 * ¿Impacto? Tras un registro exitoso, el usuario queda logueado automáticamente.
 */
export function RegisterPage({ isModalMode = false }: { isModalMode?: boolean }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const { openLogin, closeModal } = useAuthModal();

  const [formData, setFormData] = useState({
    role: "artista",
    email: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    artistic_area: "",
    sector: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setFormError(null);
  };


  /**
   * ¿Qué? Calcula si el formulario está completo para habilitar el botón.
   * ¿Para qué? El botón de registro solo se activa cuando TODOS los campos están llenos
   *            y el usuario acepta los términos y condiciones.
   * ¿Impacto? Previene envíos incompletos y mejora la UX con feedback visual.
   */
  const isFormComplete = useMemo(() => {
    const baseComplete =
      formData.email.trim() !== "" &&
      formData.first_name.trim().length >= 2 &&
      formData.last_name.trim().length >= 2 &&
      formData.password.length >= 8 &&
      formData.confirmPassword !== "" &&
      formData.password === formData.confirmPassword &&
      acceptedTerms;

    if (formData.role === "artista") {
      return baseComplete &&
        formData.birth_date !== "" &&
        formData.artistic_area.trim().length >= 2;
    } else {
      return baseComplete &&
        formData.sector.trim().length >= 2;
    }
  }, [formData, acceptedTerms]);

  /**
   * ¿Qué? Validación del lado del cliente antes de enviar al backend.
   * ¿Para qué? Dar feedback inmediato sin esperar la respuesta del servidor.
   * ¿Impacto? Reduce peticiones innecesarias y mejora la UX.
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del correo es inválido";
    }

    if (!formData.first_name || formData.first_name.trim().length < 2) {
      newErrors.first_name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.last_name || formData.last_name.trim().length < 2) {
      newErrors.last_name = "El apellido debe tener al menos 2 caracteres";
    }

    if (formData.role === "artista") {
      if (!formData.birth_date) {
        newErrors.birth_date = "La fecha de nacimiento es obligatoria";
      } else {
        const birth = new Date(formData.birth_date);
        if (isNaN(birth.getTime())) {
          newErrors.birth_date = "Fecha inválida";
        } else {
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          if (age < 18 || age > 28) {
            newErrors.birth_date = "La plataforma es exclusiva para jóvenes entre 18 y 28 años";
          }
        }
      }

      if (!formData.artistic_area || formData.artistic_area.trim().length < 2) {
        newErrors.artistic_area = "El área artística es obligatoria";
      }
    } else if (formData.role === "empresa") {
      if (!formData.sector || formData.sector.trim().length < 2) {
        newErrors.sector = "El sector es obligatorio para empresas o fundaciones";
      }
    }

    if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Debe incluir al menos una mayúscula";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Debe incluir al menos una minúscula";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Debe incluir al menos un número";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Concatenar nombre + apellido → full_name para el backend
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;

      const payload: any = {
        role: formData.role,
        email: formData.email,
        full_name: fullName,
        password: formData.password,
      };

      if (formData.role === "artista") {
        payload.birth_date = formData.birth_date;
        payload.artistic_area = formData.artistic_area.trim();
      } else {
        payload.sector = formData.sector.trim();
      }

      await register(payload);
      showToast("¡Registro exitoso! Cuenta creada.", "success");
      if (isModalMode) {
        closeModal();
      }
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Error al registrar usuario";
      
      if (err.validationErrors && Object.keys(err.validationErrors).length > 0) {
        setErrors(err.validationErrors);
      } else if (message.toLowerCase().includes("email") || message.toLowerCase().includes("correo")) {
        // Si el error de negocio es sobre el correo (ej: "El correo ya está registrado")
        setErrors({ email: message });
      } else {
        // Errores generales sin campo específico, se muestran en el formulario, NO en Toast
        setFormError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Completa tus datos para registrarte" isModal={isModalMode}>
      <form onSubmit={handleSubmit} noValidate>


        {/* Selector de Rol */}
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="artista"
              checked={formData.role === "artista"}
              onChange={handleChange}
              className="accent-brand-purple"
            />
            <span className="text-gray-700 dark:text-gray-300">Soy Artista</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="empresa"
              checked={formData.role === "empresa"}
              onChange={handleChange}
              className="accent-brand-purple"
            />
            <span className="text-gray-700 dark:text-gray-300">Soy Empresa / Fundación</span>
          </label>
        </div>

        {/* Nombre y Apellido separados (o nombre empresa) */}
        {formData.role === "artista" ? (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Nombre"
              name="first_name"
              type="text"
              value={formData.first_name}
              placeholder="Juan"
              autoComplete="given-name"
              icon={<User className="h-5 w-5" />}
              error={errors.first_name}
              onChange={handleChange}
            />
            <InputField
              label="Apellido"
              name="last_name"
              type="text"
              value={formData.last_name}
              placeholder="Pérez"
              autoComplete="family-name"
              icon={<User className="h-5 w-5" />}
              error={errors.last_name}
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Nombre de la empresa"
              name="first_name"
              type="text"
              value={formData.first_name}
              placeholder="Fundación Cultural"
              autoComplete="organization"
              icon={<Building2 className="h-5 w-5" />}
              error={errors.first_name}
              onChange={handleChange}
            />
            <InputField
              label="Sigla o complemento"
              name="last_name"
              type="text"
              value={formData.last_name}
              placeholder="S.A.S. / ONG"
              autoComplete="organization"
              icon={<Building2 className="h-5 w-5" />}
              error={errors.last_name}
              onChange={handleChange}
            />
          </div>
        )}

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

        {formData.role === "artista" ? (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Fecha de nacimiento"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              placeholder="2000-01-01"
              icon={<Calendar className="h-5 w-5" />}
              error={errors.birth_date}
              onChange={handleChange}
            />
    
            <div className="mb-3">
              <label htmlFor="artistic_area" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Área artística
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <Palette className="h-5 w-5" />
                </div>
                <select
                  id="artistic_area"
                  name="artistic_area"
                  value={formData.artistic_area}
                  onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                  className={`block w-full rounded-lg border pl-10 pr-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 ${
                    errors.artistic_area
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:ring-red-400/20"
                      : "border-gray-300 focus:border-brand-blue focus:ring-brand-blue/20 dark:border-brand-purple/40 dark:focus:border-brand-blue dark:focus:ring-brand-blue/20"
                  } ${!formData.artistic_area ? "text-gray-400 dark:text-gray-500" : ""}`}
                >
                  <option value="" disabled>Selecciona un área...</option>
                  <option value="Música">Música</option>
                  <option value="Danza">Danza</option>
                  <option value="Teatro">Teatro</option>
                  <option value="Artes Plásticas">Artes Plásticas</option>
                  <option value="Literatura">Literatura</option>
                  <option value="Audiovisual">Audiovisual</option>
                  <option value="Fotografía">Fotografía</option>
                  <option value="Circo">Circo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              {errors.artistic_area && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.artistic_area}</p>
              )}
            </div>
          </div>
        ) : (
          <InputField
            label="Sector de la industria"
            name="sector"
            type="text"
            value={formData.sector}
            placeholder="Audiovisual, Entretenimiento, Educación..."
            icon={<Building2 className="h-5 w-5" />}
            error={errors.sector}
            onChange={handleChange}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            placeholder="Mínimo 8"
            autoComplete="new-password"
            icon={<Lock className="h-5 w-5" />}
            error={errors.password}
            onChange={handleChange}
          />

          <InputField
            label="Confirmar"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            placeholder="Repetir"
            autoComplete="new-password"
            icon={<KeyRound className="h-5 w-5" />}
            error={errors.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {/* Checkbox de consentimiento */}
        <div className="mb-4 flex items-start gap-2">
          <input
            type="checkbox"
            id="privacy-consent"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 accent-brand-purple"
          />
          <label htmlFor="privacy-consent" className="text-sm text-gray-600 dark:text-gray-400">
            He leído y acepto la{" "}
            <Link to="/privacy-policy" className="text-brand-blue hover:underline font-medium" target="_blank">
              Política de Privacidad
            </Link>
            {" "}y los{" "}
            <Link to="/terms" className="text-brand-blue hover:underline font-medium" target="_blank">
              Términos y Condiciones
            </Link>
            {" "}conforme a la{" "}
            <strong>Ley 1581 de 2012</strong>
          </label>
        </div>

        {/* Error general del formulario (errores de backend no asociados a un campo específico) */}
        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {formError}
          </div>
        )}

        {/* Indicador de formulario incompleto */}
        {!isFormComplete && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Completa todos los campos y acepta los términos para continuar</span>
          </div>
        )}

        <div className="mt-2 flex justify-end">
          <Button type="submit" fullWidth isLoading={isLoading} disabled={!isFormComplete}>
            Crear cuenta
          </Button>
        </div>
      </form>

      <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿Ya tienes cuenta?{" "}
        {isModalMode ? (
          <button
            onClick={openLogin}
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer focus:outline-none"
          >
            Iniciar sesión
          </button>
        ) : (
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Iniciar sesión
          </Link>
        )}
      </p>
    </AuthLayout>
  );
}

