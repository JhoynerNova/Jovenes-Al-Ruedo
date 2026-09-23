/**
 * Archivo: App.tsx
 * Descripción: Componente raíz de la aplicación — define el enrutamiento principal.
 * ¿Para qué? Centralizar la estructura de rutas y proveer los contexts globales (auth).
 * ¿Impacto? Sin este componente, la app no tendría navegación ni estructura de páginas.
 */

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthModalProvider, useAuthModal } from "@/context/AuthModalContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Componentes de redirección — muestran el modal sobre la landing, nunca páginas separadas
function LoginRedirect() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  useEffect(() => {
    navigate("/", { replace: true });
    openLogin();
  }, []);
  return null;
}

function RegisterRedirect() {
  const navigate = useNavigate();
  const { openRegister } = useAuthModal();
  useEffect(() => {
    navigate("/", { replace: true });
    openRegister();
  }, []);
  return null;
}

// ¿Qué? Imports de todas las páginas de la aplicación.

// ¿Para qué? Cada página se renderiza según la ruta activa.
// ¿Impacto? Al agregar una nueva página, se importa aquí y se agrega una <Route>.
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { TermsPage } from "@/pages/TermsPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Chat } from "@/pages/Chat";
import { PublicProfile } from "@/pages/PublicProfile";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { NotificationsPage } from "@/pages/NotificationsPage";

/**
 * ¿Qué? Componente raíz que configura el AuthProvider y las rutas de la aplicación.
 * ¿Para qué? Definir qué página se muestra según la URL del navegador.
 * ¿Impacto? Es el punto de entrada visual — toda la interfaz se renderiza dentro de este componente.
 */
function App() {
  return (
    <BrowserRouter>
      {/* ¿Qué? AuthProvider envuelve todas las rutas para que useAuth() funcione. */}
      {/* ¿Para qué? Sin AuthProvider, ningún componente hijo puede acceder al contexto de auth. */}
      {/* ¿Impacto? Debe ser el wrapper más externo después del BrowserRouter. */}
      <ToastProvider>
        <AuthProvider>
          <AuthModalProvider>
            <Routes>
              {/* 🔓 Rutas públicas */}
              <Route path="/login" element={<LoginRedirect />} />
              <Route path="/register" element={<RegisterRedirect />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              {/* Las rutas de política y landing están agrupadas abajo */}

              {/* 🔓 Rutas públicas con diseño común (AppLayout) */}
              <Route element={<AppLayout />}>
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/perfil/:userId" element={<PublicProfile />} />
                <Route path="/perfil/*" element={<PublicProfile />} />
                <Route path="/profile/:userId" element={<PublicProfile />} />
                <Route path="/profile/*" element={<PublicProfile />} />
              </Route>

              {/* 🔒 Rutas protegidas */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/mensajes" element={<Chat />} />
                <Route path="/notificaciones" element={<NotificationsPage />} />
              </Route>

              {/* Ruta raíz */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Ruta catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthModalProvider>
        </AuthProvider>
      </ToastProvider>


    </BrowserRouter>
  );
}

export default App;
