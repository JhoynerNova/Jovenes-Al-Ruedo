import { useState } from "react";
import { Sparkles, Image, Music, Layout, Disc, Frame, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AvatarFrame, type FrameStyle } from "@/components/customization/AvatarFrame";
import { AudioSignaturePlayer } from "@/components/customization/AudioSignaturePlayer";
import { usersApi } from "@/api/users";
import { uploadApi } from "@/api/upload";
import type { UserResponse } from "@/types/auth";

interface CustomizationStudioProps {
  user: UserResponse;
  onUpdate: (updatedUser: UserResponse) => void;
}

export function CustomizationStudio({ user, onUpdate }: CustomizationStudioProps) {
  const currentCust = user.customization || {};

  const [frame, setFrame] = useState<FrameStyle>((currentCust.avatar_frame as FrameStyle) || "holo-glow");
  const [bannerFx, setBannerFx] = useState<string>(currentCust.banner_fx || "mesh-gradient");
  const [audioUrl, setAudioUrl] = useState<string>(currentCust.audio_signature_url || "");
  const [audioTitle, setAudioTitle] = useState<string>(currentCust.audio_signature_title || "Reel de Presentación");
  const [layoutMode, setLayoutMode] = useState<string>(currentCust.layout_mode || "masonry");
  const [headline, setHeadline] = useState<string>(currentCust.headline || "🎨 Creando nuevo contenido artístico");

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    try {
      const url = await uploadApi.uploadFile(file);
      setAudioUrl(url);
      setMsg("Pista de audio cargada correctamente");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Error al subir el archivo de audio");
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const newCustomization = {
        ...currentCust,
        avatar_frame: frame,
        banner_fx: bannerFx,
        audio_signature_url: audioUrl,
        audio_signature_title: audioTitle,
        layout_mode: layoutMode,
        headline,
      };

      const updated = await usersApi.updateProfile({ customization: newCustomization });
      onUpdate(updated);
      setMsg("✨ ¡Estudio de personalización guardado exitosamente!");
      setTimeout(() => setMsg(""), 4000);
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || e?.message || "Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── PREVISUALIZACIÓN EN VIVO (LIVE PREVIEW STUDIO) ── */}
      <div className="rounded-3xl border border-purple-500/30 bg-slate-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Previsualización en Vivo de tu Perfil</span>
          </div>
          <span className="rounded-full bg-purple-500/20 text-purple-300 px-3 py-0.5 text-[11px] font-bold">
            Live Preview
          </span>
        </div>

        {/* Tarjeta de previsualización */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          {/* Banner visual animado */}
          <div
            className={`absolute top-0 left-0 right-0 h-24 transition-all ${
              bannerFx === "mesh-gradient"
                ? "bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 animate-pulse opacity-90"
                : bannerFx === "cyber-particles"
                ? "bg-gradient-to-r from-cyan-950 via-slate-900 to-fuchsia-950 opacity-90"
                : bannerFx === "retro-wave"
                ? "bg-gradient-to-r from-pink-900 via-purple-900 to-indigo-950 opacity-90"
                : "bg-slate-800"
            }`}
          />

          <div className="relative pt-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <AvatarFrame
                src={user.profile_pic_url}
                alt={user.full_name}
                frameStyle={frame}
                size="xl"
              />
              <div>
                <h4 className="text-xl font-bold text-white">{user.full_name}</h4>
                <p className="text-xs text-purple-300 font-medium">{headline}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Estilo de Galería: <span className="text-cyan-400 capitalize">{layoutMode}</span>
                </p>
              </div>
            </div>

            {/* Reproductor Audio Signature en vivo */}
            {audioUrl && (
              <AudioSignaturePlayer
                audioUrl={audioUrl}
                title={audioTitle}
                artistName={user.full_name}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── CONTROLES DEL ESTUDIO ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. SELECCIÓN DE MARCOS DE AVATAR */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Frame className="h-4 w-4 text-purple-500" /> Marco de Perfil Neón & Holográfico
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "none", name: "Sin Marco" },
              { id: "holo-glow", name: "Holo Glow" },
              { id: "cyber-aura", name: "Cyber Aura" },
              { id: "gold-crest", name: "Gold Crest" },
              { id: "violet-synthwave", name: "Synthwave" },
              { id: "retro-canvas", name: "Retro Canvas" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFrame(f.id as FrameStyle)}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all flex flex-col items-center gap-2 ${
                  frame === f.id
                    ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/30"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                <AvatarFrame src={user.profile_pic_url} alt={user.full_name} frameStyle={f.id} size="sm" />
                <span>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. EFECTOS VISUALES DE PORTADA */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Image className="h-4 w-4 text-cyan-500" /> Efecto de Banner / Portada Viva
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "mesh-gradient", name: "Mesh Gradient Vivo" },
              { id: "cyber-particles", name: "Cyber Matrix" },
              { id: "retro-wave", name: "Retro Synthwave" },
              { id: "none", name: "Estándar Difuminado" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBannerFx(b.id)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  bannerFx === b.id
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 ring-2 ring-cyan-500/30"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. PISTA AUDIO SIGNATURE */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Music className="h-4 w-4 text-pink-500" /> Pista de Presentación (Audio Signature)
          </h4>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Título de la Pista</label>
              <input
                type="text"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                placeholder="Ej: Demo Vocal / Solo de Guitarra / Reel 2026..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Cargar Archivo de Audio (MP3 / WAV)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  disabled={uploadingAudio}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                />
                {uploadingAudio && <Disc className="h-5 w-5 animate-spin text-purple-500 shrink-0" />}
              </div>
            </div>
          </div>
        </div>

        {/* 4. MODO DE LAYOUT DE PORTAFOLIO & HEADLINE */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="h-4 w-4 text-emerald-500" /> Modo de Galería & Titular Creativo
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Titular Creativo / Estado Actual</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ej: 🎭 En rodaje de cortometraje / 🎶 Disponible para eventos..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Diseño de Galería en Perfil</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "masonry", name: "Mural Artístico (Masonry)" },
                  { id: "showcase", name: "Galería Cinemática" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLayoutMode(l.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      layoutMode === l.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                        : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4 shrink-0" /> {msg}
        </div>
      )}

      {/* BOTÓN GUARDAR ESTUDIO */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full md:w-auto">
          {saving ? "Guardando Personalización..." : <><Save className="mr-2 h-4 w-4" /> Guardar Todo en tu Perfil</>}
        </Button>
      </div>
    </div>
  );
}
