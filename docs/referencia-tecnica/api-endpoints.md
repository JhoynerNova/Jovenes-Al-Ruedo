# Referencia Técnica: Endpoints de la API (FastAPI)

Este documento detalla la estructura completa de los endpoints expuestos por el Backend de **Jóvenes al Ruedo** (versión de la API: `/api/v1`).

---

## 1. Módulo de Autenticación (`/api/v1/auth`)

Endpoints públicos para registro, inicio de sesión y recuperación de cuentas.

### POST `/api/v1/auth/register`
- **Descripción**: Registra un nuevo usuario en la plataforma.
- **Acceso**: Público.
- **Cuerpo de Petición (JSON)**:
```json
{
  "email": "artista@jovenes.com",
  "password": "Password123",
  "full_name": "Franky Almario",
  "role": "artista", 
  "birth_date": "2005-05-15",
  "artist_area": "Música"
}
```
- **Respuestas**:
  - `201 Created`: Cuenta creada exitosamente. Muestra mensaje informando que se debe validar el correo.
  - `400 Bad Request`: Correo electrónico duplicado o validación de edad fallida (menor de 18 o mayor de 28).

### POST `/api/v1/auth/login`
- **Descripción**: Autentica las credenciales y devuelve un token de acceso JWT.
- **Acceso**: Público.
- **Cuerpo de Petición (Form-data / JSON)**:
```json
{
  "username": "artista@jovenes.com",
  "password": "Password123"
}
```
- **Respuesta `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "artista@jovenes.com",
    "full_name": "Franky Almario",
    "role": "artista"
  }
}
```

---

## 2. Módulo del Portafolio (`/api/v1/portafolio`)

Endpoints protegidos para la administración del portafolio artístico.

### GET `/api/v1/portafolio`
- **Descripción**: Obtiene el portafolio del usuario autenticado actual.
- **Acceso**: Autenticado (Bearer Token).
- **Respuesta `200 OK`**:
```json
{
  "id": 5,
  "bio": "Cantautor de pop alternativo...",
  "social_links": {
    "instagram": "https://instagram.com/franky",
    "youtube": "https://youtube.com/franky"
  },
  "items": [
    {
      "id": 12,
      "file_url": "/uploads/demo_audio.mp3",
      "file_type": "audio",
      "description": "Demo de canción acústica"
    }
  ]
}
```

### POST `/api/v1/upload`
- **Descripción**: Sube un archivo multimedia de portafolio de forma asíncrona.
- **Acceso**: Autenticado (Bearer Token).
- **Cuerpo (Multipart Form-Data)**:
  - `file`: Archivo binario (Imagen, Audio, Video, PDF).
  - `description`: String describiendo el archivo.
- **Respuesta `201 Created`**:
```json
{
  "success": true,
  "file_url": "/uploads/portafolios/file_12345.mp3",
  "file_type": "audio",
  "description": "Demo de canción acústica"
}
```

---

## 3. Módulo de Convocatorias y Empleo (`/api/v1/convocatorias`)

### GET `/api/v1/convocatorias`
- **Descripción**: Lista las ofertas activas con filtros dinámicos (área artística, presupuesto, ubicación).
- **Acceso**: Público / Autenticado.

### POST `/api/v1/convocatorias`
- **Descripción**: Publica una nueva oferta.
- **Acceso**: Solo rol "Empresa" (Autenticado).
