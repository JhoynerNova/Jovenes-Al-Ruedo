import api from "./axios";
import type { PaginatedUsersResponse, MessageResponse } from "../types/auth";

export const usersApi = {
  getUsers: async (params: { skip?: number; limit?: number; search?: string; role?: string; sort_by?: string; sort_desc?: boolean }) => {
    const { data } = await api.get<PaginatedUsersResponse>("/api/v1/users", { params });
    return data;
  },

  changeUserStatus: async (userId: string, is_active: boolean) => {
    const { data } = await api.patch<MessageResponse>(`/api/v1/users/${userId}/status`, { is_active });
    return data;
  }
};
