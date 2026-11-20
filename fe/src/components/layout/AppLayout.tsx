/**
 * Archivo: components/layout/AppLayout.tsx
 * Descripción: Layout principal para páginas autenticadas (con navbar).
 */

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Breadcrumbs } from "./Breadcrumbs";
import { CookieConsentBanner } from "./CookieConsentBanner";
import { useAuth } from "@/hooks/useAuth";

const PALETTE_HEX: Record<string, string> = {
  blue: "#3b82f6",
  purple: "#a855f7",
  red: "#ef4444",
  green: "#22c55e",
  amber: "#f59e0b",
  pink: "#ec4899",
  teal: "#14b8a6",
};

export function AppLayout() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.color_palette && PALETTE_HEX[user.color_palette]) {
      document.documentElement.style.setProperty("--color-brand-purple", PALETTE_HEX[user.color_palette]);
    } else {
      document.documentElement.style.removeProperty("--color-brand-purple");
    }
    
    // Cleanup al desmontar
    return () => {
      document.documentElement.style.removeProperty("--color-brand-purple");
    };
  }, [user?.color_palette]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-brand-dark">
      <Navbar />
                  <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <Outlet />
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
