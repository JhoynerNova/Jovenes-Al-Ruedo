import api from "./axios";

export interface ConvResponse {
  id_conv: number;
  nombre: string;
  glue: string | null;
  nivel_experiencia: string | null;
  tipo_jornada: string | null;
  rango_salarial: string | null;
  ubicacion: string | null;
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
  estado: string;
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
  estado: string;
  carta_presentacion: string | null;
  id_portafolio_interno: number | null;
  cv_url: string | null;
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

  create: async (body: { nombre: string; glue?: string; nivel_experiencia?: string; tipo_jornada?: string; rango_salarial?: string; ubicacion?: string }) => {
    const { data } = await api.post<ConvResponse>("/api/v1/convocatorias", body);
    return data;
  },

  update: async (id: number, body: { nombre: string; glue?: string; nivel_experiencia?: string; tipo_jornada?: string; rango_salarial?: string; ubicacion?: string }) => {
    const { data } = await api.put<ConvResponse>(`/api/v1/convocatorias/${id}`, body);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/v1/convocatorias/${id}`);
  },

  apply: async (convId: number, body: { carta_presentacion?: string; id_portafolio_interno?: number; cv_url?: string }) => {
    const { data } = await api.post(`/api/v1/convocatorias/${convId}/apply`, body);
    return data;
  },

  withdraw: async (convId: number) => {
    await api.delete(`/api/v1/convocatorias/${convId}/apply`);
  },

  getApplicants: async (convId: number) => {
    const { data } = await api.get<Applicant[]>(`/api/v1/convocatorias/${convId}/applicants`);
    return data;
  },
  
  updateApplicantStatus: async (convId: number, inscripcionId: number, estado: string) => {
    const { data } = await api.put(`/api/v1/convocatorias/${convId}/applicants/${inscripcionId}`, { estado });
    return data;
  }
};
