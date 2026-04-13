import api from "./axios";

export interface ConversacionResponse {
  id_conversacion: number;
  tipo: "postulacion" | "directo";
  conv_nombre: string | null;
  otro_usuario_id: string;
  otro_usuario_nombre: string;
  otro_usuario_avatar: string | null;
  otro_usuario_role: string | null;
  ultimo_mensaje_texto: string | null;
  ultimo_mensaje_fecha: string | null;
  no_leidos: number;
}

export interface MensajeResponse {
  id_msg: number;
  id_conversacion: number;
  remitente_id: string;
  contenido: string;
  leido: boolean;
  created_at: string;
}

export const chatApi = {
  getConversaciones: async () => {
    const { data } = await api.get<ConversacionResponse[]>("/api/v1/chat/conversaciones");
    return data;
  },

  crearConversacionDirecta: async (artistaId: string) => {
    const { data } = await api.post<ConversacionResponse>("/api/v1/chat/conversaciones/directo", {
      artista_id: artistaId,
    });
    return data;
  },

  getMensajes: async (idConversacion: number) => {
    const { data } = await api.get<MensajeResponse[]>(
      `/api/v1/chat/conversacion/${idConversacion}/mensajes`
    );
    return data;
  },

  enviarMensaje: async (idConversacion: number, contenido: string) => {
    const { data } = await api.post<MensajeResponse>(
      `/api/v1/chat/conversacion/${idConversacion}/mensajes`,
      { contenido }
    );
    return data;
  },
};
