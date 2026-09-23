import React, { useState } from "react";
import { Palette, Check } from "lucide-react";
import { usersApi } from "@/api/users";

export interface PaletteOption {
  id: string;
  name: string;
  colors: string[];
}

export const PALETTES: PaletteOption[] = [
  { id: "default", name: "Púrpura Místico (Original)", colors: ["#5A3FA0", "#2F80ED", "#2EC4B6"] },
  { id: "cyberpunk", name: "Neon Cyberpunk", colors: ["#EC4899", "#8B5CF6", "#06B6D4"] },
  { id: "emerald", name: "Esmeralda & Naturaleza", colors: ["#059669", "#10B981", "#14B8A6"] },
  { id: "sunset", name: "Atardecer Dorado", colors: ["#D97706", "#F59E0B", "#EF4444"] },
  { id: "ocean", name: "Océano Nocturno", colors: ["#2563EB", "#0284C7", "#06B6D4"] },
  { id: "rose", name: "Rosa Cuarzo", colors: ["#E11D48", "#F43F5E", "#FB7185"] },
];

export const applyThemePalette = (paletteId: string | null | undefined) => {
  const pId = paletteId || "default";
  document.documentElement.setAttribute("data-theme", pId);
};

interface PaletteSelectorProps {
  currentPalette?: string;
  value?: string;
  onPaletteChange?: (newPalette: string) => void;
  onChange?: (newPalette: string) => void;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  currentPalette = "default",
  value,
  onPaletteChange,
  onChange,
}) => {
  const activePalette = value || currentPalette;
  const [selected, setSelected] = useState<string>(activePalette);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelect = async (paletteId: string) => {
    setSelected(paletteId);
    applyThemePalette(paletteId);
    setLoading(true);
    try {
      await usersApi.updateProfile({ color_palette: paletteId });
      onPaletteChange?.(paletteId);
      onChange?.(paletteId);
    } catch (err) {
      console.error("Error al guardar paleta", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Paleta de Colores Dinámica</h3>
      </div>
      <p className="text-xs text-slate-400">
        Personaliza el color y la atmósfera visual de tu perfil y la interfaz en tiempo real.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {PALETTES.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              disabled={loading}
              className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-3 relative ${
                isSelected
                  ? "border-purple-500 bg-slate-800/90 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/50"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{p.name}</span>
                {isSelected && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="flex items-center gap-2">
                {p.colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
