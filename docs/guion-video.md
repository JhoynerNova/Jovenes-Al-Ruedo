# Guión de Video: Demostración del MVP de la Iteración

Este documento contiene la estructura del guión técnico para la grabación del video explicativo del avance del proyecto **Jóvenes al Ruedo**.

---

## Ficha Técnica del Video
- **Duración Estimada**: 3 minutos.
- **Objetivo**: Presentar de forma dinámica el flujo completo de Registro y Login (Móvil y Web), el Portafolio del Artista y la integración de Base de Datos.
- **Participantes**: Franky Almario (Backend) y Jhoyner Nova (Frontend y Móvil).

---

## Estructura del Guión

### Minuto 0:00 - 0:30 | Introducción y Contexto (Jhoyner Nova)
* **Apoyo Visual**: Compartir pantalla mostrando el inicio del repositorio de GitHub con la estructura `/docs` limpia y organizada.
* **Guión de Voz**:
  > *"¡Hola a todos! Bienvenidos a la presentación de los avances de la plataforma **Jóvenes al Ruedo**, un ecosistema web y móvil enfocado en conectar a jóvenes artistas con increíbles oportunidades laborales. En este Sprint de 12 días, logramos consolidar más del 80% del avance funcional y documentar cada historia de usuario desde nuestro Excel maestro. Veamos el sistema en acción."*

### Minuto 0:30 - 1:15 | Flujo de Registro y Login Móvil (Jhoyner Nova)
* **Apoyo Visual**: Emulador de React Native cargando la interfaz premium de Jóvenes al Ruedo App. Completar el formulario de registro de un joven de 20 años.
* **Guión de Voz**:
  > *"Aquí vemos nuestra aplicación móvil nativa construida con **React Native y Expo**. Los jóvenes artistas pueden crear su cuenta ingresando sus datos básicos. Noten la validación estricta de edad: si el usuario tiene menos de 18 años o más de 28, el sistema previene el registro protegiendo las políticas del programa. Al completar el registro con éxito, el flujo nos permite iniciar sesión de forma segura guardando el token JWT localmente."*

### Minuto 1:15 - 2:15 | Backend, Base de Datos e Integración Web (Franky Almario)
* **Apoyo Visual**: Terminal ejecutando FastAPI (`uvicorn`) y el panel de Swagger UI (`/docs`). Luego, mostrar la base de datos PostgreSQL cargando la tupla del usuario recién registrado en la tabla `users` mediante DBeaver o PgAdmin.
* **Guión de Voz**:
  > *"Hola, les habla Franky Almario. En la sección del backend, hemos orquestado con **Docker Compose** una base de datos relacional robusta en PostgreSQL 17. Nuestro backend en **FastAPI** implementa un middleware global para manejo de errores y validación de esquemas Pydantic. Al registrar un usuario, la contraseña se cifra con `bcrypt` en la tabla `users`. También contamos con el módulo del Portafolio Artístico que soporta la carga y gestión de imágenes, audios en formato MP3, videos en MP4 y documentos en PDF con límites de tamaño seguros."*

### Minuto 2:15 - 3:00 | Conclusiones y Cierre (Ambos)
* **Apoyo Visual**: Mostrar el frontend web en React mostrando una vista general del diseño responsivo con TailwindCSS 4 y el tablero de tareas cerrado al 100%.
* **Guión de Voz (Jhoyner)**:
  > *"Con este avance, logramos una integración limpia, un control de errores en tiempo real y sentamos las bases funcionales de las convocatorias y el chat que desarrollaremos a continuación. ¡Muchas gracias por su atención y nos vemos al ruedo!"*
