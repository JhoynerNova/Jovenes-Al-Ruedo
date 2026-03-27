/**
 * Archivo: App.tsx
 * Descripción: Componente raíz de la aplicación — define el enrutamiento principal.
 * ¿Para qué? Centralizar la estructura de rutas y proveer los contexts globales (auth).
 * ¿Impacto? Sin este componente, la app no tendría navegación ni estructura de páginas.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// ¿Qué? Imports de todas las páginas de la aplicación.
// ¿Para qué? Cada página se renderiza según la ruta activa.
// ¿Impacto? Al agregar una nueva página, se importa aquí y se agrega una <Route>.
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { SettingsPage } from "@/pages/SettingsPage";

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
      <AuthProvider>
        <Routes>
          {/* ════════════════════════════════════════ */}
          {/* 🔓 Rutas públicas (no requieren autenticación) */}
          {/* ════════════════════════════════════════ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Las rutas de política y landing están agrupadas abajo */}

          {/* ════════════════════════════════════════ */}
          {/* 🔒 Rutas protegidas (requieren sesión activa) */}
          {/* ════════════════════════════════════════ */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* ¿Qué? Ruta raíz muestra la landing page. */}
          {/* ¿Para qué? El visitante nuevo ve la presentación del producto antes del login. */}
          {/* ¿Impacto? Mejora la conversión al dar contexto antes de pedir el registro. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* ¿Qué? Ruta catch-all para URLs no existentes. */}
          {/* ¿Para qué? Redirigir al login cualquier ruta desconocida. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
