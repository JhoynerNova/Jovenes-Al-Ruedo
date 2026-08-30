import api from "./axios";
import type { PaginatedUsersResponse, MessageResponse, UserResponse } from "../types/auth";

export interface ExploreResponse {
  items: UserResponse[];
  total: number;
  page: number;
  size: number;
}

export interface AdminStats {
  total_users: number;
  total_artistas: number;
  total_empresas: number;
  total_admins: number;
  active_users: number;
  inactive_users: number;
  total_convocatorias: number;
  total_postulaciones: number;
  total_portafolios: number;
}

export const usersApi = {
  getUsers: async (params: { skip?: number; limit?: number; search?: string; role?: string; sort_by?: string; sort_desc?: boolean }) => {
    const { data } = await api.get<PaginatedUsersResponse>("/api/v1/users/", { params });
    return data;
  },

  changeUserStatus: async (userId: string, is_active: boolean) => {
    const { data } = await api.patch<MessageResponse>(`/api/v1/users/${userId}/status/`, { is_active });
    return data;
  },

  changeUserRole: async (userId: string, role: string) => {
    const { data } = await api.patch<MessageResponse>(`/api/v1/users/${userId}/role/`, { role });
    return data;
  },

  getUserById: async (userId: string) => {
    const { data } = await api.get<UserResponse>(`/api/v1/users/${userId}/`);
    return data;
  },

  updateProfile: async (body: {
    first_name?: string;
    last_name?: string;
    artistic_area?: string;
    sector?: string;
    bio?: string;
    location?: string;
    color_palette?: string;
    customization?: Record<string, any>;
    profile_pic_url?: string;
    cover_pic_url?: string;
    social_links?: Record<string, string>;
    artistic_disciplines?: string[];
    looking_for_disciplines?: string[];
    company_legal_name?: string;
    company_nit?: string;
    company_size?: string;
    onboarding_completed?: boolean;
  }) => {
    const { data } = await api.patch<UserResponse>("/api/v1/users/me/", body);
    return data;
  },

  getAdminStats: async () => {
    const { data } = await api.get<AdminStats>("/api/v1/users/admin/stats/");
    return data;
  },

  exploreArtists: async (params?: { skip?: number; limit?: number; search?: string; area?: string }) => {
    const { data } = await api.get<ExploreResponse>("/api/v1/users/explore/artists/", { params });
    return data;
  },

  exploreCompanies: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<ExploreResponse>("/api/v1/users/explore/companies/", { params });
    return data;
  },

  getPublicProfile: async (userId: string) => {
    const { data } = await api.get<any>(`/api/v1/users/profile/${userId}/`);
    return data;
  },

  deleteAccount: async (password: string) => {
    const { data } = await api.delete<MessageResponse>("/api/v1/users/me/", { data: { password } });
    return data;
  },

  resetUserPassword: async (userId: string, new_password: string) => {
    const { data } = await api.post<MessageResponse>(`/api/v1/users/${userId}/reset-password`, { new_password });
    return data;
  },

  getAllConvocatoriasAdmin: async () => {
    const { data } = await api.get<any[]>("/api/v1/users/admin/all-convocatorias");
    return data;
  },

  deleteConvocatoriaAdmin: async (convId: number) => {
    const { data } = await api.delete<MessageResponse>(`/api/v1/users/admin/convocatoria/${convId}`);
    return data;
  },

  getAuditLogs: async () => {
    const { data } = await api.get<any[]>("/api/v1/users/admin/audit-logs");
    return data;
  },
};
