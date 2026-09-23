import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usersApi } from "@/api/users";
import { chatApi } from "@/api/chat";
import { useAuth } from "@/hooks/useAuth";
import type { UserResponse } from "@/types/auth";
import { MapPin, Calendar, Briefcase, Palette, ArrowLeft, ExternalLink, Image, MessageCircle, Star, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RatingModal } from "@/components/RatingModal";
import { RatingsList } from "@/components/RatingsList";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { detectSocialLink } from "@/lib/social";
import { getUserProfileSlug } from "@/lib/user";
import { UserBadges } from "@/components/ui/UserBadges";
import { AvatarFrame } from "@/components/customization/AvatarFrame";
import { AudioSignaturePlayer } from "@/components/customization/AudioSignaturePlayer";
import { ArtistDigitalCardModal } from "@/components/customization/ArtistDigitalCardModal";
import { QrCode, Sparkles } from "lucide-react";

interface PortfolioItem {
  id_det_p: number;
  archivo: string;
  titulo: string | null;
  descripcion: string | null;
}

interface Portfolio {
  id_port: number;
  nombre: string;
  archivos: PortfolioItem[];
}

interface ConvocatoriaPublic {
  id_conv: number;
  nombre: string;
  glue: string | null;
  total_inscritos: number;
  created_at: string | null;
}

export function PublicProfile() {
  const params = useParams<{ userId?: string; "*"?: string }>();
  const rawParam = params["*"] || params.userId || "";
  const targetId = rawParam.split("/").filter(Boolean).pop() || "";

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [portafolios, setPortafolios] = useState<Portfolio[]>([]);
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingsKey, setRatingsKey] = useState(0);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!profile || sendingMessage) return;
    setSendingMessage(true);
    try {
      await chatApi.crearConversacionDirecta(profile.id);
      navigate("/mensajes");
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error al iniciar conversación");
    } finally {
      setSendingMessage(false);
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!targetId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await usersApi.getPublicProfile(targetId);
        setProfile(data.user);
        setPortafolios(data.portafolios || []);
        setConvocatorias(data.convocatorias || []);

        // Auto-reescribir la URL en el navegador si aún muestra la UUID cruda
        const cleanSlug = getUserProfileSlug(data.user);
        if (cleanSlug && targetId !== cleanSlug) {
          navigate(`/perfil/${cleanSlug}`, { replace: true });
        }
      } catch (e: any) {
        setError(e.response?.data?.detail || "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetId]);

  const calcEdad = (bd: string) => {
    const hoy = new Date();
    const nac = new Date(bd);
    let e = hoy.getFullYear() - nac.getFullYear();
    if (hoy.getMonth() - nac.getMonth() < 0 || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) e--;
    return e;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">😔 {error || "Perfil no encontrado"}</h2>
        <Link to="/explore" className="mt-4 inline-block text-brand-purple hover:underline">← Volver a explorar</Link>
      </div>
    );
  }

  const isArtist = profile.role === "artista";
  const isCompany = profile.role === "empresa";
  const isMe = currentUser?.id === profile.id;

  return (
    <div data-theme={profile.color_palette || "default"} className="space-y-6 animate-fade-in-up">
      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setLightboxImg(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img src={lightboxImg} alt="Obra ampliada" className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl object-contain" />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 transition-transform hover:scale-110"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Calificación */}
      {isArtist && (
        <RatingModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          artistaId={profile.id}
          artistaNombre={profile.full_name}
          onRatingSuccess={() => setRatingsKey((prev) => prev + 1)}
        />
      )}

      {/* Modal de Tarjeta 3D & QR */}
      <ArtistDigitalCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        user={profile}
      />

      <Breadcrumbs items={[{ label: "Explorar", path: "/explore" }, { label: profile?.full_name || "Perfil de Artista" }]} />

      {/* ── HERO / COVER VIVO ── */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div
          className={`relative h-48 sm:h-60 bg-cover bg-center transition-all ${
            profile.customization?.banner_fx === "mesh-gradient"
              ? "bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 animate-pulse"
              : profile.customization?.banner_fx === "cyber-particles"
              ? "bg-gradient-to-r from-cyan-950 via-slate-900 to-fuchsia-950"
              : profile.customization?.banner_fx === "retro-wave"
              ? "bg-gradient-to-r from-pink-900 via-purple-900 to-indigo-950"
              : isArtist
              ? "bg-gradient-to-r from-brand-purple via-purple-600 to-brand-teal"
              : "bg-gradient-to-r from-brand-blue via-blue-600 to-brand-dark"
          }`}
          style={profile.cover_pic_url ? { backgroundImage: `url(${apiUrl}${profile.cover_pic_url})` } : undefined}
        >
          {!profile.cover_pic_url && (
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
          )}

          {/* Reproductor Audio Signature en la esquina del banner */}
          {profile.customization?.audio_signature_url && (
            <div className="absolute top-3 right-3 z-10">
              <AudioSignaturePlayer
                audioUrl={profile.customization.audio_signature_url}
                title={profile.customization.audio_signature_title || "Audio Signature"}
                artistName={profile.full_name}
              />
            </div>
          )}
        </div>

        <div className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            {/* Avatar con Marco Neón / Holográfico */}
            <AvatarFrame
              src={profile.profile_pic_url}
              alt={profile.full_name}
              frameStyle={profile.customization?.avatar_frame || "holo-glow"}
              size="2xl"
              className="z-10 shadow-2xl"
            />

            <div className="flex-1 pt-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{profile.full_name}</h1>
                {profile.customization?.headline && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20">
                    <Sparkles className="h-3 w-3" /> {profile.customization.headline}
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                {isArtist && profile.artistic_area && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple dark:text-purple-300">
                    <Palette className="h-3.5 w-3.5" /> {profile.artistic_area}
                  </span>
                )}
                {isCompany && profile.sector && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue dark:text-blue-300">
                    <Briefcase className="h-3.5 w-3.5" /> {profile.sector}
                  </span>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {profile.location}
                  </span>
                )}
                {isArtist && profile.birth_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {calcEdad(profile.birth_date)} años
                  </span>
                )}
                <UserBadges userId={profile.id} size="md" />
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCardModalOpen(true)}
                className="border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10"
              >
                <QrCode className="mr-1.5 h-4 w-4 inline" /> Tarjeta 3D & QR
              </Button>

              {isMe && (
                <Link to="/settings">
                  <Button variant="secondary" size="sm">Editar Perfil</Button>
                </Link>
              )}
              {!isMe && currentUser?.role === "empresa" && isArtist && (
                <>
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={sendingMessage}
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4 inline" />
                    {sendingMessage ? "Abriendo..." : "Enviar mensaje"}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsRatingOpen(true)}
                    className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  >
                    <Star className="mr-1.5 h-4 w-4 inline fill-amber-400 text-amber-400" />
                    Calificar Artista
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BIO ── */}
      {profile.bio && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Sobre {isArtist ? "el artista" : "la empresa"}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* ── REDES SOCIALES / CONTACTO ── */}
      {profile.social_links && Object.values(profile.social_links).some((v) => !!v) && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Enlaces y contacto</h2>
          <div className="flex flex-wrap gap-3">
            {profile.social_links.social && (() => {
              const detected = detectSocialLink(profile.social_links.social);
              if (!detected) return null;
              return (
                <a
                  href={detected.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple/10 px-3 py-1.5 text-xs font-semibold text-brand-purple hover:underline dark:text-purple-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> {detected.platform}
                </a>
              );
            })()}
            {profile.social_links.phone && (
              <a
                href={`tel:${profile.social_links.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1.5 text-xs font-semibold text-brand-teal hover:underline"
              >
                <Phone className="h-3.5 w-3.5" /> {profile.social_links.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── CALIFICACIONES Y REPUTACIÓN (Solo Artista) ── */}
      {isArtist && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> Reputación y Reseñas
            </h2>
            {!isMe && currentUser?.role === "empresa" && (
              <button
                onClick={() => setIsRatingOpen(true)}
                className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1"
              >
                + Dejar calificación
              </button>
            )}
          </div>
          <RatingsList key={ratingsKey} artistId={profile.id} />
        </div>
      )}

      {/* ── PORTAFOLIOS (solo artista) ── */}
      {isArtist && portafolios.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Image className="h-5 w-5 text-brand-purple" /> Portafolios
          </h2>

          {!activePortfolio ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portafolios.map((p) => (
                <button
                  key={p.id_port}
                  onClick={() => setActivePortfolio(p)}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-brand-purple/40 dark:border-gray-800 dark:bg-gray-900 text-left"
                >
                  <div className="h-32 bg-gradient-to-br from-brand-purple/10 to-brand-teal/10 dark:from-brand-purple/20 dark:to-brand-teal/20 flex items-center justify-center">
                    {p.archivos.length > 0 && p.archivos[0].archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                      <img src={`${apiUrl}${p.archivos[0].archivo}`} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <Image className="h-10 w-10 text-brand-purple/30 dark:text-brand-teal/30" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{p.nombre}</h3>
                    <p className="mt-1 text-xs text-gray-500">{p.archivos.length} obras</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              <button
                onClick={() => setActivePortfolio(null)}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-purple transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Volver a portafolios
              </button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activePortfolio.nombre}</h3>

              {activePortfolio.archivos.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">Este portafolio no tiene obras publicadas.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activePortfolio.archivos.map((a) => (
                    <div key={a.id_det_p} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      <div
                        className="h-48 bg-gray-100 dark:bg-gray-800 cursor-pointer relative"
                        onClick={() => {
                          if (a.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
                            setLightboxImg(`${apiUrl}${a.archivo}`);
                          }
                        }}
                      >
                        {a.archivo.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                          <img src={`${apiUrl}${a.archivo}`} alt={a.titulo || "Obra"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <ExternalLink className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{a.titulo || "Sin título"}</h4>
                        {a.descripcion && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{a.descripcion}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isArtist && portafolios.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <Image className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500">Este artista aún no ha publicado obras</p>
        </div>
      )}

      {/* ── CONVOCATORIAS (solo empresa) ── */}
      {isCompany && convocatorias.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-blue" /> Convocatorias Publicadas
          </h2>
          <div className="space-y-3">
            {convocatorias.map((c) => (
              <div key={c.id_conv} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-semibold text-gray-900 dark:text-white">{c.nombre}</h3>
                {c.glue && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{c.glue}</p>}
                <div className="mt-3 flex gap-3 text-xs text-gray-500">
                  <span>👥 {c.total_inscritos} postulados</span>
                  {c.created_at && <span>📅 {new Date(c.created_at).toLocaleDateString("es-CO")}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isArtist && (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-3xl font-bold text-brand-purple">{portafolios.length}</p>
              <p className="mt-1 text-sm text-gray-500">Portafolios</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-3xl font-bold text-brand-teal">{portafolios.reduce((a, p) => a + p.archivos.length, 0)}</p>
              <p className="mt-1 text-sm text-gray-500">Obras publicadas</p>
            </div>
          </>
        )}
        {isCompany && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-3xl font-bold text-brand-blue">{convocatorias.length}</p>
            <p className="mt-1 text-sm text-gray-500">Convocatorias activas</p>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {profile.created_at ? new Date(profile.created_at).toLocaleDateString("es-CO", { month: "short", year: "numeric" }) : "—"}
          </p>
          <p className="mt-1 text-sm text-gray-500">Miembro desde</p>
        </div>
      </div>
    </div>
  );
}
