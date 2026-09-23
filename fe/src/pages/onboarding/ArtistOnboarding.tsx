/**
 * Archivo: pages/onboarding/ArtistOnboarding.tsx
 * Descripción: Wizard de onboarding post-registro para artistas.
 * ¿Para qué? Guiar al artista recién registrado a completar su foto, banner, bio,
 *            disciplinas, ubicación, redes sociales y un portafolio inicial, en vez de
 *            dejarlo caer directo en un dashboard vacío.
 * ¿Impacto? Reutiliza usersApi.updateProfile, uploadApi y portafolioApi — no agrega
 *           endpoints nuevos de backend.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { usersApi } from "@/api/users";
import { uploadApi } from "@/api/upload";
import { portafolioApi } from "@/api/portafolio";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { OnboardingWizard, type OnboardingStep } from "@/components/onboarding/OnboardingWizard";
import { PartyPopper, Trash2 } from "lucide-react";

const DISCIPLINAS = [
  "Música",
  "Danza",
  "Teatro",
  "Artes Plásticas",
  "Literatura",
  "Audiovisual",
  "Fotografía",
  "Circo",
  "Otro",
];

// ¿Qué? Localidades de Bogotá — la plataforma solo opera en Bogotá por ahora.
// ¿Para qué? Restringir la ubicación a un desplegable en vez de texto libre.
const LOCALIDADES_BOGOTA = [
  "Usaquén",
  "Chapinero",
  "Santa Fe",
  "San Cristóbal",
  "Usme",
  "Tunjuelito",
  "Bosa",
  "Kennedy",
  "Fontibón",
  "Engativá",
  "Suba",
  "Barrios Unidos",
  "Teusaquillo",
  "Los Mártires",
  "Antonio Nariño",
  "Puente Aranda",
  "La Candelaria",
  "Rafael Uribe Uribe",
  "Ciudad Bolívar",
  "Sumapaz",
];

interface PortfolioDraftItem {
  titulo: string;
  descripcion: string;
  etiquetas: string;
  archivoUrl: string;
  archivoNombre: string;
}

export function ArtistOnboarding() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [coverPicUrl, setCoverPicUrl] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [socialLink, setSocialLink] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [items, setItems] = useState<PortfolioDraftItem[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const toggleDiscipline = (d: string) => {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleAddItemFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (items.length >= 5) {
      showToast("Máximo 5 proyectos en el portafolio inicial", "error");
      return;
    }
    try {
      const url = await uploadApi.uploadFile(file);
      setItems((prev) => [
        ...prev,
        { titulo: "", descripcion: "", etiquetas: "", archivoUrl: url, archivoNombre: file.name },
      ]);
    } catch {
      showToast("No se pudo subir el archivo del proyecto", "error");
    }
    e.target.value = "";
  };

  const updateItem = (index: number, patch: Partial<PortfolioDraftItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const persistProfileData = async () => {
    const payload: Parameters<typeof usersApi.updateProfile>[0] = {
      onboarding_completed: true,
    };
    if (profilePicUrl) payload.profile_pic_url = profilePicUrl;
    if (coverPicUrl) payload.cover_pic_url = coverPicUrl;
    if (bio.trim()) payload.bio = bio.trim();
    if (location.trim()) payload.location = location.trim();
    if (disciplines.length > 0) payload.artistic_disciplines = disciplines;
    const socialLinks: Record<string, string> = {};
    if (socialLink.trim()) socialLinks.social = socialLink.trim();
    if (contactPhone.trim()) socialLinks.phone = contactPhone.trim();
    if (Object.keys(socialLinks).length > 0) payload.social_links = socialLinks;

    const updated = await usersApi.updateProfile(payload);
    updateUser(updated);

    if (items.length > 0) {
      const existentes = await portafolioApi.list();
      const portafolio =
        existentes[0] ??
        (await portafolioApi.create({
          nombre: `Portafolio de ${user?.first_name ?? "Artista"}`,
        }));
      for (const item of items) {
        await portafolioApi.addItem(portafolio.id_port, {
          archivo: item.archivoUrl,
          titulo: item.titulo || item.archivoNombre,
          descripcion: item.descripcion || undefined,
          etiquetas: item.etiquetas || undefined,
          estado: "P",
        });
      }
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await persistProfileData();
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
      // Si falla, igual dejamos avanzar — el usuario puede completar el perfil después.
    }
    navigate("/dashboard", { replace: true });
  };

  const steps: OnboardingStep[] = [
    {
      title: "Tu identidad visual",
      subtitle: "Una buena foto ayuda a que las empresas confíen en tu perfil",
      content: (
        <div className="flex flex-wrap justify-center gap-8">
          <ImageUploadField
            label="Foto de perfil"
            shape="circle"
            onChange={setProfilePicUrl}
            onError={(m) => showToast(m, "error")}
          />
          <ImageUploadField
            label="Banner de portada"
            shape="rectangle"
            onChange={setCoverPicUrl}
            onError={(m) => showToast(m, "error")}
          />
        </div>
      ),
    },
    {
      title: "Tu hoja de vida artística",
      subtitle: "Contale al mundo quién sos y qué hacés",
      content: (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Biografía corta
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Contá en pocas líneas quién sos como artista..."
              className="block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Disciplinas artísticas
            </label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINAS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDiscipline(d)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    disciplines.includes(d)
                      ? "bg-brand-purple text-white border-brand-purple"
                      : "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300 hover:border-brand-purple"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Localidad (Bogotá)
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${!location ? "text-gray-400 dark:text-gray-500" : ""}`}
            >
              <option value="" disabled>Selecciona tu localidad...</option>
              {LOCALIDADES_BOGOTA.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Red social
              </label>
              <input
                type="text"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="@tuusuario o enlace a tu red social"
                className="block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Número de contacto
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+57 300 123 4567"
                className="block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Arma tu portafolio inicial",
      subtitle: "Subí de 1 a 5 proyectos para mostrar tu trabajo (opcional)",
      content: (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.archivoNombre}
                </span>
                <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.titulo}
                onChange={(e) => updateItem(i, { titulo: e.target.value })}
                placeholder="Título del proyecto"
                className="mb-2 block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                type="text"
                value={item.descripcion}
                onChange={(e) => updateItem(i, { descripcion: e.target.value })}
                placeholder="Descripción breve"
                className="mb-2 block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100"
              />
              <select
                value={item.etiquetas}
                onChange={(e) => updateItem(i, { etiquetas: e.target.value })}
                className={`block w-full rounded-lg border border-gray-300 dark:border-brand-purple/40 px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100 ${!item.etiquetas ? "text-gray-400 dark:text-gray-500" : ""}`}
              >
                <option value="" disabled>Categoría del proyecto...</option>
                {DISCIPLINAS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          ))}

          {items.length < 5 && (
            <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-6 text-sm text-gray-500 hover:border-brand-purple">
              + Agregar proyecto (imagen, video o PDF)
              <input type="file" accept="image/*,video/*,application/pdf" onChange={handleAddItemFile} className="hidden" />
            </label>
          )}
        </div>
      ),
    },
    {
      title: "¡Listo para el ruedo!",
      subtitle: "Tu perfil está armado — ya podés explorar oportunidades",
      content: (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <PartyPopper className="h-14 w-14 text-brand-purple dark:text-brand-teal" />
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Guardamos tu perfil y tu portafolio inicial. Podés seguir editándolos cuando quieras
            desde Configuración.
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
