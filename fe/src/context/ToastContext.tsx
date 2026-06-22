import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };
      
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Contenedor de Toasts en la esquina superior derecha */}
      <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void }) {
  const { id, type, title, message } = toast;

  const config = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/90",
      border: "border-emerald-200 dark:border-emerald-800/40",
      text: "text-emerald-800 dark:text-emerald-200",
      iconText: "text-emerald-500 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-950/90",
      border: "border-rose-200 dark:border-rose-800/40",
      text: "text-rose-800 dark:text-rose-200",
      iconText: "text-rose-500 dark:text-rose-400",
      icon: <AlertCircle className="h-5 w-5" />,
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/90",
      border: "border-amber-200 dark:border-amber-800/40",
      text: "text-amber-800 dark:text-amber-200",
      iconText: "text-amber-500 dark:text-amber-400",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/90",
      border: "border-blue-200 dark:border-blue-800/40",
      text: "text-blue-800 dark:text-blue-200",
      iconText: "text-blue-500 dark:text-blue-400",
      icon: <Info className="h-5 w-5" />,
    },
  }[type];

  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in-left ${config.bg} ${config.border} ${config.text}`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${config.iconText}`}>{config.icon}</div>
      <div className="flex-1 text-sm font-medium leading-5">
        {title && <h4 className="font-bold text-gray-900 dark:text-gray-100">{title}</h4>}
        <p className="opacity-90">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 rounded-lg p-0.5 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
