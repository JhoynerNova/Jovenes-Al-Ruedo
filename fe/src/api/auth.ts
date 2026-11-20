/**
 * Archivo: api/auth.ts
 * Descripción: Cliente HTTP para los endpoints de autenticación del backend.
 */

import api from "./axios";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserResponse,
} from "@/types/auth";

const AUTH_PREFIX = "/api/v1/auth";
const USERS_PREFIX = "/api/v1/users";

export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>(`${AUTH_PREFIX}/register`, data);
  return response.data;
}

export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>(`${AUTH_PREFIX}/login`, data);
  return response.data;
}

export async function refreshToken(data: RefreshTokenRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>(`${AUTH_PREFIX}/refresh`, data);
  return response.data;
}

export async function logoutUser(refreshToken: string | null): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/logout`, {
    refresh_token: refreshToken,
  });
  return response.data;
}

export async function logoutAllDevices(): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/logout-all-devices`);
  return response.data;
}

export async function changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/change-password`, data);
  return response.data;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/forgot-password`, data);
  return response.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/reset-password`, data);
  return response.data;
}

export async function getMe(): Promise<UserResponse> {
  const response = await api.get<UserResponse>(`${USERS_PREFIX}/me`);
  return response.data;
}
