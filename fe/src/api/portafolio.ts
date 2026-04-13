import api from "./axios";

export interface DetPortafolioResponse {
  id_det_p: number;
  id_port: number;
  titulo: string | null;
  descripcion: string | null;
  portada_url: string | null;
  etiquetas: string | null;
  archivo: string;
  estado: string;
  created_at: string;
}

export interface PortafolioResponse {
  id_port: number;
  nombre: string;
  descripcion: string | null;
  visibilidad: string;
  id_usr: string;
  created_at: string;
  archivos: DetPortafolioResponse[];
}

export const portafolioApi = {
  list: async () => {
    const { data } = await api.get<PortafolioResponse[]>("/api/v1/portafolio");
    return data;
  },

  get: async (id: number) => {
    const { data } = await api.get<PortafolioResponse>(`/api/v1/portafolio/${id}`);
    return data;
  },

  create: async (body: { nombre: string; descripcion?: string; visibilidad?: string }) => {
    const { data } = await api.post<PortafolioResponse>("/api/v1/portafolio", body);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/v1/portafolio/${id}`);
  },

  addItem: async (portId: number, body: { archivo: string; titulo?: string; descripcion?: string; portada_url?: string; etiquetas?: string; estado?: string }) => {
    const { data } = await api.post<DetPortafolioResponse>(`/api/v1/portafolio/${portId}/items`, body);
    return data;
  },

  deleteItem: async (portId: number, itemId: number) => {
    await api.delete(`/api/v1/portafolio/${portId}/items/${itemId}`);
  },
};
