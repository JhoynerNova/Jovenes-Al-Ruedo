import api from "./axios";

export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    // We don't want the default application/json Content-Type 
    // when sending FormData, axios will handle setting multipart/form-data.
    const { data } = await api.post<{ url: string }>("/api/v1/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.url;
  },
};
