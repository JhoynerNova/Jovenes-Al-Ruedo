/**
 * Archivo: pages/onboarding/CompanyOnboarding.tsx
 * Descripción: Wizard de onboarding post-registro para empresas/gestores culturales.
 * ¿Para qué? Guiar a la empresa recién registrada a completar logo, datos legales
 *            y perfil de empresa.
 * ¿Impacto? Reutiliza usersApi.updateProfile y uploadApi — no agrega endpoints nuevos.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { usersApi } from "@/api/users";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { OnboardingWizard, type OnboardingStep } from "@/components/onboarding/OnboardingWizard";
import { LayoutDashboard } from "lucide-react";

const TALENTO_OPCIONES = [
  "Música",
  "Danza",
  "Teatro",
  "Artes Plásticas",
  "Literatura",
  "Audiovisual",
  "Fotografía",
  "Circo",
  "Diseño Gráfico",
];

const TAMANIOS = ["1-10", "11-50", "51-200", "200+"];

const SECTORES_CULTURALES = [
  "Cultura y Artes",
  "Educación",
  "Tecnología",
  "Medios de Comunicación",
  "Entretenimiento y Eventos",
  "Publicidad y Marketing",
  "Moda y Diseño",
  "Fundación / ONG",
  "Gobierno",
  "Otro",
];

export function CompanyOnboarding() {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [logoUrl, setLogoUrl] = useState("");
  const [legalName, setLegalName] = useState("");
  const [nit, setNit] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [size, setSize] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const toggleTalent = (t: string) => {
    setLookingFor((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const persistCompanyData = async () => {
    const payload: Parameters<typeof usersApi.updateProfile>[0] = {
      onboarding_completed: true,
    };
    if (logoUrl) payload.profile_pic_url = logoUrl;
    if (legalName.trim()) payload.company_legal_name = legalName.trim();
    if (nit.trim()) payload.company_nit = nit.trim();
    if (sector.trim()) payload.sector = sector.trim();
    if (description.trim()) payload.bio = description.trim();
    if (size) payload.company_size = size;
    if (lookingFor.length > 0) payload.looking_for_disciplines = lookingFor;
    if (website.trim()) payload.social_links = { website: website.trim() };

    const updated = await usersApi.updateProfile(payload);
    updateUser(updated);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await persistCompanyData();
      navigate("/dashboard", { replace: true });
    } catch {
      showToast("Hubo un error guardando tu perfil, intentá de nuevo", "error");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSkip = async () => {
    try {
      const updated = await usersApi.updateProfile({ onboarding_completed: true });
      updateUser(updated);
    } catch {
      // Si falla, igual dejamos avanzar — la empresa puede completar el perfil después.
    }
    navigate("/dashboard", { replace: true });
  };

  const steps: OnboardingStep[] = [
    {
      title: "Identidad corporativa",
      subtitle: "Así te van a ver los artistas en la plataforma",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center">
            <ImageUploadField
              label="Logo de la empresa"
              shape="circle"
              onChange={setLogoUrl}
              onError={(m) => showToast(m, "error")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre comercial / razón social
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Nombre de tu empresa o fundación"
              className="block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                NIT / registro (opcional)
              </label>
              <input
                type="text"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder="900.123.456-7"
                className="block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sector cultural
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={`block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${!sector ? "text-gray-400 dark:text-gray-500" : ""}`}
              >
                <option value="" disabled>Selecciona un sector...</option>
                {SECTORES_CULTURALES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Perfil de la empresa",
      subtitle: "Contales a los artistas quiénes son y qué talento buscan",
      content: (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción breve
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="¿A qué se dedica tu organización?"
              className="block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sitio web
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tamaño de la empresa
            </label>
            <div className="flex flex-wrap gap-2">
              {TAMANIOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSize(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    size === t
                      ? "bg-brand-purple text-white border-brand-purple"
                      : "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300 hover:border-brand-purple"
                  }`}
                >
                  {t} empleados
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ¿Qué talento suelen buscar?
            </label>
            <div className="flex flex-wrap gap-2">
              {TALENTO_OPCIONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTalent(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    lookingFor.includes(t)
                      ? "bg-brand-purple text-white border-brand-purple"
                      : "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300 hover:border-brand-purple"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tu panel de control te espera",
      subtitle: "Ahí vas a ver las postulaciones de los artistas a tus convocatorias",
      content: (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <LayoutDashboard className="h-14 w-14 text-brand-purple dark:text-brand-teal" />
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Guardamos el perfil de tu empresa. Podés seguir editándolo y publicar más
            convocatorias cuando quieras.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-900">
      <OnboardingWizard steps={steps} onSkip={handleSkip} onFinish={handleFinish} isFinishing={isFinishing} />
    </div>
  );
}
