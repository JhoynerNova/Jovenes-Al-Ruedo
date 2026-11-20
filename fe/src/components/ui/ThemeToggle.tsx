/**
 * Archivo: components/ui/ThemeToggle.tsx
 * Descripción: Botón para alternar entre tema claro y oscuro.
 */

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem("theme") : null;
      if (stored) return stored === "dark";
      return typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      try { window.localStorage?.setItem("theme", "dark"); } catch {}
    } else {
      root.classList.remove("dark");
      try { window.localStorage?.setItem("theme", "light"); } catch {}
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((prev) => !prev) };
}

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
