/**
 * Archivo: components/onboarding/OnboardingWizard.tsx
 * Descripción: Contenedor genérico de pasos (stepper) para los wizards de onboarding.
 * ¿Para qué? Artista y Empresa comparten la misma mecánica de navegación (barra de progreso,
 *            Atrás/Siguiente, Completar más tarde) pero con contenido de pasos distinto.
 * ¿Impacto? Evita duplicar la lógica de navegación entre ArtistOnboarding y CompanyOnboarding.
 */

import { useState } from "react";
import { Button } from "../ui/Button";

export interface OnboardingStep {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  /** Si retorna false, bloquea el avance al siguiente paso (validación del paso actual). */
  canAdvance?: () => boolean;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onSkip: () => void;
  onFinish: () => void;
  isFinishing?: boolean;
}

export function OnboardingWizard({ steps, onSkip, onFinish, isFinishing = false }: OnboardingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (step.canAdvance && !step.canAdvance()) return;
    if (isLastStep) {
      onFinish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-brand-purple dark:bg-brand-teal" : "bg-gray-200 dark:bg-gray-800"
            }`}
          />
        ))}
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{step.title}</h2>
        {step.subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{step.subtitle}</p>
        )}
      </div>

      <div className="mb-8">{step.content}</div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Completar más tarde
        </button>

        <div className="flex gap-2">
          {stepIndex > 0 && (
            <Button variant="secondary" onClick={handleBack}>
              Atrás
            </Button>
          )}
          <Button onClick={handleNext} isLoading={isLastStep && isFinishing}>
            {isLastStep ? "Finalizar" : "Siguiente"}
          </Button>
        </div>
      </div>
    </div>
  );
}
