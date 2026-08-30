/**
 * Archivo: api/axios.ts
 * Descripción: Instancia de Axios configurada con la URL base de la API y interceptores.
 * ¿Para qué? Centralizar la configuración HTTP — todos los módulos de API usan esta instancia.
 * ¿Impacto? Sin este archivo, cada petición tendría que configurar la URL, headers y manejo
 *           de errores por separado, causando duplicación y posibles inconsistencias.
 */

import axios from "axios";

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return envUrl || "http://127.0.0.1:8000";
};

const API_URL = getApiUrl();

/**
 * ¿Qué? Instancia de Axios preconfigurada con URL base, headers y timeout.
 * ¿Para qué? Reutilizar esta instancia en todos los módulos de API (auth, users, etc.).
 * ¿Impacto? Garantiza consistencia: todas las peticiones usan JSON, timeout de 10s,
 *           y la misma URL base.
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos máximo por petición
});

/**
 * ¿Qué? Interceptor de request que agrega el token JWT automáticamente.
 * ¿Para qué? Cada petición a endpoints protegidos necesita el header Authorization.
 *           En vez de agregarlo manualmente en cada llamada, el interceptor lo hace.
 * ¿Impacto? Sin este interceptor, el frontend tendría que pasar el token en cada fetch,
 *           aumentando el riesgo de olvidarlo y recibir 401.
 */
api.interceptors.request.use(
  (config) => {
    // ¿Qué? Lee el access token almacenado en memoria (sessionStorage).
    // ¿Para qué? Adjuntarlo como Bearer token en el header Authorization.
    // ¿Impacto? sessionStorage se borra al cerrar el navegador — más seguro que localStorage.
    const token = sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * ¿Qué? Interceptor de response que maneja errores HTTP de forma centralizada.
 * ¿Para qué? Extraer mensajes de error del backend y formatearlos para el frontend.
 * ¿Impacto? Sin esto, cada componente tendría que parsear el error de Axios por separado.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Manejo de token expirado (401) con auto-refresco de JWT transparente
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedRefreshToken = sessionStorage.getItem("refresh_token");

      if (storedRefreshToken && !originalRequest.url?.includes("/auth/refresh") && !originalRequest.url?.includes("/auth/login")) {
        try {
          // Intentar renovar el access token expirado
          const refreshRes = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: storedRefreshToken,
          });

          const { access_token, refresh_token } = refreshRes.data;
          sessionStorage.setItem("access_token", access_token);
          sessionStorage.setItem("refresh_token", refresh_token);

          // Reintentar la petición original con la nueva credencial Bearer
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("refresh_token");
        }
      }
    }

    if (error.response) {
      // Error HTTP del servidor (4xx, 5xx).
      const data = error.response.data;

      if (error.response.status === 422 && Array.isArray(data.detail)) {
        const messages = data.detail.map(
          (err: { msg: string }) => err.msg,
        );
        error.message = messages.join(". ");

        (error as any).validationErrors = data.detail.reduce((acc: Record<string, string>, err: any) => {
          if (err.loc && err.loc.length > 0) {
            const field = err.loc[err.loc.length - 1];
            acc[field] = err.msg;
          }
          return acc;
        }, {});
      } else if (typeof data.detail === "string") {
        error.message = data.detail;
      }
    } else if (error.request) {
      error.message = "No se pudo conectar con el servidor";
    }
    return Promise.reject(error);
  },
);

export default api;
