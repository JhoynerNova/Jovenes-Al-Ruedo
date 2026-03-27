import api from "./axios";

export interface ConvResponse {
  id_conv: number;
  nombre: string;
  glue: string | null;
  id_usr: string;
  empresa_nombre: string | null;
  empresa_sector: string | null;
  created_at: string;
  total_inscritos: number;
}

export interface PaginatedConvResponse {
  items: ConvResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface MiPostulacion {
  id_i: number;
  id_conv: number;
  conv_nombre: string;
  empresa_nombre: string | null;
  created_at: string;
}

export interface Applicant {
  id_i: number;
  id_usr: string;
  artista_nombre: string;
  artista_email: string;
  artista_area: string | null;
  artista_bio: string | null;
  artista_location: string | null;
  created_at: string;
}

export const convocatoriasApi = {
  list: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<PaginatedConvResponse>("/api/v1/convocatorias", { params });
    return data;
  },

  getMisConvocatorias: async () => {
    const { data } = await api.get<ConvResponse[]>("/api/v1/convocatorias/mis-convocatorias");
    return data;
  },

  getMisPostulaciones: async () => {
    const { data } = await api.get<MiPostulacion[]>("/api/v1/convocatorias/mis-postulaciones");
    return data;
  },

  get: async (id: number) => {
    const { data } = await api.get<ConvResponse>(`/api/v1/convocatorias/${id}`);
    return data;
  },

  create: async (body: { nombre: string; glue?: string }) => {
    const { data } = await api.post<ConvResponse>("/api/v1/convocatorias", body);
    return data;
  },

  update: async (id: number, body: { nombre: string; glue?: string }) => {
    const { data } = await api.put<ConvResponse>(`/api/v1/convocatorias/${id}`, body);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/v1/convocatorias/${id}`);
  },

  apply: async (convId: number) => {
    const { data } = await api.post(`/api/v1/convocatorias/${convId}/apply`);
    return data;
  },

  withdraw: async (convId: number) => {
    await api.delete(`/api/v1/convocatorias/${convId}/apply`);
  },

  getApplicants: async (convId: number) => {
    const { data } = await api.get<Applicant[]>(`/api/v1/convocatorias/${convId}/applicants`);
    return data;
  },
};
