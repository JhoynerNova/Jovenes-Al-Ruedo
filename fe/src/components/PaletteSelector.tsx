import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import axios from '../api/axios';

interface PaletteOption {
  id: string;
  name: string;
  colors: string[];
}

const PALETTES: PaletteOption[] = [
  { id: 'default', name: 'Esmeralda SENA (Original)', colors: ['#059669', '#10B981', '#064E3B'] },
  { id: 'sunset', name: 'Atardecer Cálido', colors: ['#F59E0B', '#EF4444', '#78350F'] },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', colors: ['#EC4899', '#8B5CF6', '#4C1D95'] },
  { id: 'ocean', name: 'Océano Nocturno', colors: ['#0284C7', '#3B82F6', '#1E3A8A'] },
];

export const applyThemePalette = (paletteId: string) => {
  const root = document.documentElement;
  if (paletteId === 'sunset') {
    root.style.setProperty('--color-primary', '#F59E0B');
    root.style.setProperty('--color-primary-hover', '#D97706');
    root.style.setProperty('--color-accent', '#EF4444');
  } else if (paletteId === 'cyberpunk') {
    root.style.setProperty('--color-primary', '#EC4899');
    root.style.setProperty('--color-primary-hover', '#DB2777');
    root.style.setProperty('--color-accent', '#8B5CF6');
  } else if (paletteId === 'ocean') {
    root.style.setProperty('--color-primary', '#0284C7');
    root.style.setProperty('--color-primary-hover', '#0369A1');
    root.style.setProperty('--color-accent', '#3B82F6');
  } else {
    root.style.setProperty('--color-primary', '#10B981');
    root.style.setProperty('--color-primary-hover', '#059669');
    root.style.setProperty('--color-accent', '#064E3B');
  }
};

interface PaletteSelectorProps {
  currentPalette?: string;
  value?: string;
  onPaletteChange?: (newPalette: string) => void;
  onChange?: (newPalette: string) => void;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  currentPalette = 'default',
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
      await axios.patch('/users/palette', { color_palette: paletteId });
      onPaletteChange?.(paletteId);
      onChange?.(paletteId);
    } catch (err) {
      console.error('Error al guardar paleta', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">Paleta de Colores Dinámica</h3>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        Personaliza el tema visual de la plataforma según tu disciplina artística o gusto.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PALETTES.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              disabled={loading}
              className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-3 relative ${
                isSelected
                  ? 'border-emerald-500 bg-slate-800/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{p.name}</span>
                {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="flex items-center gap-2">
                {p.colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border border-white/10 shadow-inner"
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
