import api from "./axios";

export interface DetPortafolioResponse {
  id_det_p: number;
  id_port: number;
  archivo: string;
  estado: string;
  created_at: string;
}

export interface PortafolioResponse {
  id_port: number;
  nombre: string;
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

  create: async (nombre: string) => {
    const { data } = await api.post<PortafolioResponse>("/api/v1/portafolio", { nombre });
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/v1/portafolio/${id}`);
  },

  addItem: async (portId: number, archivo: string, estado: string = "G") => {
    const { data } = await api.post<DetPortafolioResponse>(`/api/v1/portafolio/${portId}/items`, { archivo, estado });
    return data;
  },

  deleteItem: async (portId: number, itemId: number) => {
    await api.delete(`/api/v1/portafolio/${portId}/items/${itemId}`);
  },
};
