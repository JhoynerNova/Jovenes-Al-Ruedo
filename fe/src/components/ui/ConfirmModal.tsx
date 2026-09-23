import { AlertTriangle, Trash2, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              variant === "danger"
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : variant === "warning"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "bg-brand-purple/10 text-brand-purple border border-brand-purple/20"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="h-6 w-6" />
            ) : variant === "warning" ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <HelpCircle className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            size="sm"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
