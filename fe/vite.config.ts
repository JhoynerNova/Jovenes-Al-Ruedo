/**
 * Archivo: vite.config.ts
 * Descripción: Configuración de Vite — bundler y servidor de desarrollo.
 */

/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/__tests__/setup.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/types/**",
      ],
    },
  },
});
