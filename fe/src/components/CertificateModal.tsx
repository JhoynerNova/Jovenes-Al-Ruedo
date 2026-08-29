import React from 'react';
import { Award, X, Printer, ShieldCheck, QrCode } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistaNombre: string;
  empresaNombre: string;
  convocatoriaTitulo: string;
  fechaSeleccion?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  artistaNombre,
  empresaNombre,
  convocatoriaTitulo,
  fechaSeleccion = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
}) => {
  if (!isOpen) return null;

  const verificationHash = `JAR-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Certificado Imprimible */}
        <div className="border-4 border-double border-amber-500/40 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-center relative overflow-hidden">
          {/* Marca de Agua */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Award className="w-80 h-80 text-amber-500" />
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
            <Award className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-widest">SENA — Ficha 3171599</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 uppercase tracking-tight">
            Certificado de Talento Joven
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Jóvenes al Ruedo • Plataforma de Empleo & Cultura</p>

          <div className="my-6">
            <p className="text-sm text-slate-300">Se otorga el presente reconocimiento oficial a:</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-1 underline decoration-amber-500 decoration-2 underline-offset-8">
              {artistaNombre}
            </h3>
            <p className="text-xs text-emerald-400 font-medium">Joven Artista Emergente</p>
          </div>

          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Por haber sido exitosamente <span className="text-amber-400 font-bold">SELECCIONADO(A)</span> por la organización{' '}
            <span className="text-white font-semibold">{empresaNombre}</span> para participar en la convocatoria cultural:
          </p>

          <div className="my-4 py-3 px-4 bg-slate-800/60 rounded-xl border border-amber-500/20 max-w-md mx-auto">
            <p className="text-base font-bold text-amber-300">"{convocatoriaTitulo}"</p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verificación Auténtica SENA</span>
              </div>
              <p className="text-[11px] text-slate-400">Código Hash: <span className="font-mono text-slate-200">{verificationHash}</span></p>
              <p className="text-[11px] text-slate-400">Fecha de Emisión: {fechaSeleccion}</p>
            </div>

            {/* QR Mockup */}
            <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <QrCode className="w-12 h-12 text-amber-400" />
              <div className="text-[10px] text-slate-400">
                <p className="font-bold text-slate-200">Escanear QR</p>
                <p>Para verificar en línea</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>
    </div>
  );
};
