/**
 * Archivo: context/AuthContext.tsx
 * Descripción: Contexto de React que gestiona el estado de autenticación global.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as authApi from "@/api/auth";
import { AuthContext } from "@/context/authContextDef";
import type {
  AuthContextType,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
} from "@/types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem("access_token"),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => sessionStorage.getItem("refresh_token"),
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!user && !!accessToken;

    const saveTokens = useCallback((access: string, refresh: string) => {
    sessionStorage.setItem("access_token", access);
    sessionStorage.setItem("refresh_token", refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  }, []);

    const clearAuth = useCallback(() => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

    useEffect(() => {
    const verifySession = async () => {
      const storedToken = sessionStorage.getItem("access_token");
      const storedRefreshToken = sessionStorage.getItem("refresh_token");
      if (!storedToken && !storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch {
        if (storedRefreshToken) {
          try {
            const tokens = await authApi.refreshToken({ refresh_token: storedRefreshToken });
            saveTokens(tokens.access_token, tokens.refresh_token);
            const userData = await authApi.getMe();
            setUser(userData);
          } catch {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [clearAuth, saveTokens]);

  // Aplicar paleta de colores del usuario automáticamente al cargar o actualizar
  useEffect(() => {
    if (user?.color_palette) {
      import("@/components/PaletteSelector").then(({ applyThemePalette }) => {
        applyThemePalette(user.color_palette);
      });
    }
  }, [user?.color_palette]);

    const login = useCallback(
    async (data: LoginRequest) => {
      const tokens = await authApi.loginUser(data);
      saveTokens(tokens.access_token, tokens.refresh_token);
      const userData = await authApi.getMe();
      setUser(userData);
    },
    [saveTokens],
  );

    const register = useCallback(
    async (data: RegisterRequest) => {
      await authApi.registerUser(data);
      // Login automático después del registro.
      await login({ email: data.email, password: data.password });
    },
    [login],
  );

    const logout = useCallback(() => {
    authApi.logoutUser(refreshToken).catch(() => {
      // Best-effort: si el backend no responde, igual cerramos sesión localmente.
    }).finally(() => {
      clearAuth();
    });
  }, [refreshToken, clearAuth]);

    const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    await authApi.changePassword(data);
  }, []);

    const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    await authApi.forgotPassword(data);
  }, []);

    const resetPasswordAction = useCallback(async (data: ResetPasswordRequest) => {
    await authApi.resetPassword(data);
  }, []);

    const updateUser = useCallback((updatedUser: UserResponse) => {
    setUser(updatedUser);
  }, []);

    const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      changePassword,
      forgotPassword,
      resetPassword: resetPasswordAction,
      updateUser,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      changePassword,
      forgotPassword,
      resetPasswordAction,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
