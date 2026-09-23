import api from "./axios";

export interface Badge {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export interface UserStats {
  vistas_perfil: number;
  total_obras?: number;
  total_postulaciones?: number;
  postulaciones_aceptadas?: number;
  tasa_exito?: number;
  promedio_calificacion?: number;
  total_calificaciones?: number;
  total_convocatorias?: number;
  postulaciones_recibidas?: number;
  postulantes_promedio?: number;
  badges: Badge[];
}

export const analyticsApi = {
  getMyStats: async (): Promise<UserStats> => {
    const res = await api.get<UserStats>("/api/v1/analytics/my-stats");
    return res.data;
  },

  getUserBadges: async (userId: string): Promise<Badge[]> => {
    const res = await api.get<Badge[]>(`/api/v1/analytics/user/${userId}/badges`);
    return res.data;
  },
};
