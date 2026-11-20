/**
 * Archivo: components/layout/AuthLayout.tsx
 * Descripción: Layout para páginas de autenticación (login, register, forgot, reset).
 */

import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Footer } from "./Footer";
import logo from "@/assets/logo.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isModal?: boolean;
}

export function AuthLayout({ children, title, subtitle, isModal = false }: AuthLayoutProps) {
  if (isModal) {
    return (
      <div className="w-full">
                <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>

                {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-brand-dark">
            <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

            <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
                    <div className="mb-8 flex flex-col items-center gap-3">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src={logo} alt="Jóvenes al Ruedo" className="h-24 w-24 rounded-full object-cover" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-brand-purple dark:text-brand-teal">
              Jóvenes al Ruedo
            </h1>
          </div>

                                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-brand-purple/30 dark:bg-gray-900 sm:p-8">
                        <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>

                        {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

