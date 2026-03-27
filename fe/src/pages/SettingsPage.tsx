import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { usersApi } from "@/api/users";

type SettingsTab = "perfil" | "seguridad" | "cuenta";

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("perfil");

  // Perfil
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [artisticArea, setArtisticArea] = useState(user?.artistic_area || "");
  const [sector, setSector] = useState(user?.sector || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    setSaveError("");
    try {
      const updated = await usersApi.updateProfile({
        full_name: fullName.trim() || undefined,
        artistic_area: artisticArea.trim() || undefined,
        sector: sector.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
      });
      setSaveMsg("Perfil actualizado correctamente");
      // Update local display values
      setFullName(updated.full_name);
      setArtisticArea(updated.artistic_area || "");
      setSector(updated.sector || "");
      setBio(updated.bio || "");
      setLocation(updated.location || "");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e: any) {
      setSaveError(e.message || "Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const AREAS_ARTISTICAS = [
    "Música", "Danza", "Teatro", "Fotografía", "Cine / Audiovisual",
    "Pintura", "Escultura", "Diseño Gráfico", "Ilustración", "Literatura",
    "Poesía", "Circo / Artes Escénicas", "Graffiti / Arte Urbano", "Artesanías", "Otra",
  ];

  const SECTORES = [
    "Cultura y Artes", "Educación", "Tecnología", "Medios de Comunicación",
    "Entretenimiento y Eventos", "Publicidad y Marketing", "Moda y Diseño",
    "Fundación / ONG", "Gobierno", "Otro",
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Configuración</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestiona tu perfil, seguridad y preferencias de cuenta</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {([
            { key: "perfil" as SettingsTab, label: "👤 Mi Perfil" },
            { key: "seguridad" as SettingsTab, label: "🔒 Seguridad" },
            { key: "cuenta" as SettingsTab, label: "📋 Cuenta" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-brand-purple text-brand-purple dark:border-brand-teal dark:text-brand-teal"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── TAB: PERFIL ── */}
      {activeTab === "perfil" && (
        <div className="space-y-6">
          {/* Avatar & nombre */}
          <div className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-teal text-3xl font-bold text-white shadow-md">
              {(fullName || user?.full_name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fullName || user?.full_name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                user?.role === "artista" ? "bg-brand-purple/10 text-brand-purple" :
                user?.role === "empresa" ? "bg-brand-blue/10 text-brand-blue" :
                "bg-orange-100 text-orange-700"
              }`}>
                {user?.role === "artista" ? "🎨 Artista" : user?.role === "empresa" ? "🏢 Empresa" : "🛡️ Admin"}
              </span>
            </div>
          </div>

          {/* Formulario */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">Información personal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {user?.role === "artista" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Área artística</label>
                  <select
                    value={artisticArea}
                    onChange={(e) => setArtisticArea(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Seleccionar área...</option>
                    {AREAS_ARTISTICAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )}

              {user?.role === "empresa" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Seleccionar sector...</option>
                    {SECTORES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ciudad, País (ej: Bogotá, Colombia)"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.role === "empresa" ? "Descripción de la organización" : "Biografía"}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder={user?.role === "empresa" ? "Cuéntanos sobre tu organización, misión y proyectos..." : "Cuéntanos sobre tu trayectoria artística, influencias y proyectos..."}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-400">{bio.length}/500 caracteres</p>
              </div>

              {saveMsg && (
                <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  ✅ {saveMsg}
                </div>
              )}
              {saveError && (
                <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  ❌ {saveError}
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </div>

          {/* Info de solo lectura */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Información de la cuenta</h3>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                { label: "Correo electrónico", valor: user?.email, note: "No se puede cambiar" },
                { label: "Rol", valor: user?.role === "artista" ? "Artista" : user?.role === "empresa" ? "Empresa" : "Administrador", note: null },
                { label: "Miembro desde", valor: user?.created_at ? new Date(user.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "—", note: null },
                { label: "Última actualización", valor: user?.updated_at ? new Date(user.updated_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "—", note: null },
                ...(user?.birth_date ? [{ label: "Fecha de nacimiento", valor: new Date(user.birth_date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }), note: "No se puede cambiar" }] : []),
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.valor}</dd>
                  {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* ── TAB: SEGURIDAD ── */}
      {activeTab === "seguridad" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">🔑 Contraseña</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Cambia tu contraseña periódicamente para mantener tu cuenta segura. Se requiere la contraseña actual.
            </p>
            <Link to="/change-password">
              <Button variant="secondary">Cambiar contraseña</Button>
            </Link>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">🛡️ Información de seguridad</h3>
            <div className="space-y-3">
              {[
                { icon: "✅", label: "Contraseña segura", desc: "Tu contraseña cumple los requisitos mínimos de seguridad" },
                { icon: "✅", label: "Cuenta verificada", desc: "Tu cuenta está activa y verificada en la plataforma" },
                { icon: "🔒", label: "Sesiones con tokens", desc: "Usamos JWT con expiración automática para proteger tu sesión" },
                { icon: "🍪", label: "Cookies HTTPOnly", desc: "Los tokens se almacenan en cookies seguras resistentes a XSS" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">🚨 Recuperación de acceso</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Si olvidaste tu contraseña, puedes recuperarla por correo electrónico.
            </p>
            <Link to="/forgot-password">
              <Button variant="secondary">Recuperar contraseña</Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── TAB: CUENTA ── */}
      {activeTab === "cuenta" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">📋 Detalles de la cuenta</h3>
            <dl className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">ID de usuario</dt>
                  <dd className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400 break-all">{user?.id}</dd>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado de la cuenta</dt>
                  <dd className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {user?.is_active ? "✅ Activa — Puedes acceder a todas las funciones" : "❌ Inactiva — Contacta al administrador"}
                  </dd>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de cuenta</dt>
                  <dd className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {user?.role === "artista" ? "🎨 Artista — Puedes postularte a convocatorias y gestionar tu portafolio" :
                     user?.role === "empresa" ? "🏢 Empresa — Puedes publicar convocatorias y revisar artistas" :
                     "🛡️ Administrador — Acceso completo a la plataforma"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">📜 Privacidad y datos</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Tu información está protegida conforme a la Ley 1581 de 2012 (Habeas Data) de Colombia.
            </p>
            <div className="space-y-3">
              {[
                { icon: "🔐", title: "Datos encriptados", desc: "Tu contraseña nunca se almacena en texto plano — usamos bcrypt." },
                { icon: "📧", title: "Email confidencial", desc: "No compartimos tu correo con terceros." },
                { icon: "🗑️", title: "Derecho al olvido", desc: "Puedes solicitar la eliminación de tu cuenta contactando al administrador." },
                { icon: "📄", title: "Política de privacidad", desc: "Consulta nuestra política de privacidad completa." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/privacy-policy" className="text-sm font-medium text-brand-purple hover:underline dark:text-brand-teal">
                Ver política de privacidad completa →
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">ℹ️ Acerca de la plataforma</h3>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Plataforma:</span> Jóvenes al Ruedo</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Versión:</span> 1.0.0</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Propósito:</span> Conectar jóvenes artistas (18-28 años) con organizaciones que buscan talento creativo.</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Proyecto educativo:</span> SENA — Ficha 3171599</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
