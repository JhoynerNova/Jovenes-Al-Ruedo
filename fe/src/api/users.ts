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
    const { data } = await api.get<PaginatedUsersResponse>("/api/v1/users", { params });
    return data;
  },

  changeUserStatus: async (userId: string, is_active: boolean) => {
    const { data } = await api.patch<MessageResponse>(`/api/v1/users/${userId}/status`, { is_active });
    return data;
  },

  changeUserRole: async (userId: string, role: string) => {
    const { data } = await api.patch<MessageResponse>(`/api/v1/users/${userId}/role`, { role });
    return data;
  },

  getUserById: async (userId: string) => {
    const { data } = await api.get<UserResponse>(`/api/v1/users/${userId}`);
    return data;
  },

  updateProfile: async (body: { full_name?: string; artistic_area?: string; sector?: string; bio?: string; location?: string }) => {
    const { data } = await api.patch<UserResponse>("/api/v1/users/me", body);
    return data;
  },

  getAdminStats: async () => {
    const { data } = await api.get<AdminStats>("/api/v1/users/admin/stats");
    return data;
  },

  exploreArtists: async (params?: { skip?: number; limit?: number; search?: string; area?: string }) => {
    const { data } = await api.get<ExploreResponse>("/api/v1/users/explore/artists", { params });
    return data;
  },

  exploreCompanies: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<ExploreResponse>("/api/v1/users/explore/companies", { params });
    return data;
  },
};
