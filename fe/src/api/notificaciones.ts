import api from "./axios";

export interface Notificacion {
  id: string;
  id_usr: string;
  titulo: string;
  mensaje: string;
  tipo: "postulacion" | "mensaje" | "calificacion" | "sistema";
  leida: boolean;
  enlace: string | null;
  created_at: string;
}

export const notificacionesApi = {
  getAll: async (unreadOnly: boolean = false, limit: number = 50) => {
    const { data } = await api.get<Notificacion[]>("/api/v1/notificaciones/", {
      params: { unread_only: unreadOnly, limit },
    });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get<{ unread_count: number }>("/api/v1/notificaciones/unread-count");
    return data.unread_count;
  },

  markAsRead: async (id: string) => {
    await api.patch(`/api/v1/notificaciones/${id}/read`);
  },

  markAllAsRead: async () => {
    const { data } = await api.post<{ message: string; count: number }>("/api/v1/notificaciones/read-all");
    return data;
  },

  deleteNotif: async (id: string) => {
    await api.delete(`/api/v1/notificaciones/${id}`);
  },
};
