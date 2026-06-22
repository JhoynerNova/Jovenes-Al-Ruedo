import { createContext, useContext, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

interface AuthModalContextType {
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  isOpen: boolean;
  view: "login" | "register";
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal debe usarse dentro de un AuthModalProvider");
  }
  return context;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"login" | "register">("login");

  const openLogin = () => {
    setView("login");
    setIsOpen(true);
  };

  const openRegister = () => {
    setView("register");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ openLogin, openRegister, closeModal, isOpen, view }}>
      {children}
      
      {/* Modal Overlay con desenfoque de fondo (backdrop-blur) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all duration-300 animate-fade-in-up">
          <div 
            className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-brand-purple/30 bg-white dark:bg-gray-900 p-6 shadow-2xl md:p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Renderizado dinámico del login o registro */}
            {view === "login" ? (
              <LoginPage isModalMode={true} />
            ) : (
              <RegisterPage isModalMode={true} />
            )}
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
