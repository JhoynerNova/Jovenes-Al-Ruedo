# Restricciones del Sistema

Este documento establece las restricciones de negocio, de seguridad y técnicas que rigen la plataforma **Jóvenes al Ruedo**.

---

## 1. Restricciones de Negocio y Reglas de Validación

### R01: Rango de Edad para Artistas Jóvenes
- **Regla**: Solo se permite el registro de usuarios con el rol de "Joven Artista" si su edad está estrictamente entre **18 y 28 años** al momento del registro.
- **Validación Backend**: Comprobar que la fecha de nacimiento ingresada cumpla con:
  $$\text{Edad} = \text{Fecha Actual} - \text{Fecha de Nacimiento} \in [18, 28]$$
- **Validación Frontend**: DatePicker restringido dinámicamente y mensajes interactivos inmediatos.

### R02: Registro de Empresas
- **Regla**: Las empresas deben registrar un NIT válido y una razón social verificable.

---

## 2. Restricciones de Seguridad y Autenticación

### R03: Autenticación y Autorización (JWT)
- **Algoritmo**: JSON Web Tokens (JWT) firmados con el algoritmo `HS256`.
- **Expiración**: El token de acceso expira en **60 minutos**.
- **Almacenamiento en Cliente**: Almacenado de forma segura en `localStorage` (Web) o `SecureStore` (React Native) y enviado en el header HTTP:
  `Authorization: Bearer <token>`

### R04: Robustez de Contraseña
- **Longitud Mínima**: 8 caracteres.
- **Complejidad**: Debe incluir al menos una letra mayúscula, una letra minúscula y un número.
- **Hashing**: Las contraseñas se encriptan en base de datos utilizando `bcrypt` con un costo adaptativo (salt rounds: 12).

### R05: Unicidad de Correo
- No se permiten dos cuentas (sean jóvenes o empresas) registradas con la misma dirección de correo electrónico.

---

## 3. Restricciones de Infraestructura y Multimedia

### R06: Tamaños Máximos de Carga (Multimedia del Portafolio)
Para garantizar el rendimiento de almacenamiento y transferencia de red:

| Tipo de Archivo | Formatos Permitidos | Tamaño Máximo |
| :--- | :--- | :--- |
| **Imágenes** | `JPG`, `PNG`, `WEBP` | 5 MB |
| **Audio** | `MP3`, `WAV` | 15 MB |
| **Video** | `MP4`, `WEBM` | 50 MB |
| **Documentos** | `PDF` | 10 MB |

### R07: Activación de Cuenta
- Las cuentas nuevas se crean en estado `is_active = False`.
- El sistema envía un correo de confirmación con un token temporal. Al validarse, el estado cambia a `is_active = True`, habilitando el login.
