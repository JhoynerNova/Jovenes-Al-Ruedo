/**
 * Archivo: __tests__/hooks/useAuth.test.tsx
 * Descripción: Tests del hook useAuth — verifica que consume AuthContext correctamente.
 */

import { renderHook } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { AuthContext } from "@/context/authContextDef";
import { defaultAuthContext, mockUser } from "../helpers";
import type { ReactNode } from "react";

describe("useAuth", () => {
  it("lanza error si se usa fuera de AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth debe usarse dentro de un AuthProvider");
  });

  it("retorna el contexto de auth dentro de AuthProvider", () => {
    const contextValue = {
      ...defaultAuthContext,
      user: mockUser,
      isAuthenticated: true,
      accessToken: "test-token",
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.accessToken).toBe("test-token");
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.changePassword).toBe("function");
    expect(typeof result.current.forgotPassword).toBe("function");
    expect(typeof result.current.resetPassword).toBe("function");
  });
});
