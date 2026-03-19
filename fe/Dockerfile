# ¿Qué? Imagen Docker multi-etapa para el frontend React + Vite + TypeScript.
# ¿Para qué? Construir la aplicación en una etapa y servirla con Nginx en otra,
#            resultando en una imagen final mínima sin Node.js ni herramientas de build.
# ¿Impacto? El concepto "multi-stage build" es clave:
#           - Sin multi-stage: imagen con Node.js + código fuente → ~800MB
#           - Con multi-stage: imagen con solo Nginx + archivos HTML/CSS/JS → ~50MB
#           Menor imagen = más segura (sin Node.js en producción) y más rápida de desplegar.

# ════════════════════════════════════════════════================================================================
# ETAPA 1 — builder: compilar la aplicación React
# ════════════════════════════════════════════════
# ¿Qué? Etapa temporal donde se instalan dependencias y se compila el código TypeScript/JSX.
# ¿Para qué? Esta etapa NO estará en la imagen final — solo produce el output del build.
# ¿Impacto? Todo lo que se instale o genere aquí (node_modules, caché de pnpm, código fuente)
#           se descarta al terminar. Solo /app/dist sobrevive a la siguiente etapa.
FROM node:20-alpine AS builder

# ¿Qué? Instala pnpm globalmente usando npm (disponible en la imagen de Node).
# ¿Para qué? El proyecto usa pnpm de forma obligatoria según las instrucciones del proyecto.
# ¿Impacto? Sin pnpm, no se pueden instalar las dependencias correctamente.
#           pnpm es más rápido y eficiente que npm gracias a su store de paquetes compartido.
RUN npm install -g pnpm

# ¿Qué? Define /app como el directorio de trabajo dentro del contenedor builder.
# ¿Para qué? Organizar todos los archivos del frontend en un directorio predecible.
WORKDIR /app

# ¿Qué? Copia SOLO los archivos de definición de dependencias (antes del código fuente).
# ¿Para qué? Aprovechar el sistema de caché de capas de Docker.
# ¿Impacto? Si el código TypeScript cambia pero package.json y pnpm-lock.yaml NO cambian,
#           Docker reutiliza la capa de `pnpm install` del caché — no reinstala ~200 paquetes.
#           Esto acelera los rebuilds de 2-3 minutos a pocos segundos.
COPY package.json pnpm-lock.yaml ./

# ¿Qué? Instala las dependencias usando las versiones exactas del lockfile.
# ¿Para qué? Garantizar reproducibilidad — siempre las mismas versiones en todos los entornos.
# ¿Impacto? --frozen-lockfile FALLA si pnpm-lock.yaml no está sincronizado con package.json.
#           Esto es intencional: alerta de inconsistencias antes de que causen bugs en runtime.
#           En CI/CD, este comportamiento previene que versiones inesperadas rompan el build.
RUN pnpm install --frozen-lockfile

# ¿Qué? Copia todo el código fuente del frontend.
# ¿Para qué? Tener los archivos .tsx, .ts, .css disponibles para el proceso de build.
# ¿Impacto? Se hace DESPUÉS de instalar dependencias para maximizar el uso del caché.
COPY . .

# ¿Qué? Argumento de build que define la URL base de la API del backend.
# ¿Para qué? Pasar la URL al proceso de build de Vite para que la "hornee" en el bundle.
# ¿Impacto? CONCEPTO CLAVE — Vite resuelve las variables VITE_* en TIEMPO DE BUILD,
#           no en tiempo de ejecución (a diferencia de Node.js). Una vez compilado el JS,
#           la URL queda grabada literalmente en el código. No se puede cambiar sin rebuildar.
#
#           IMPORTANTE: esta URL es la que el NAVEGADOR del usuario usa para llamar al backend.
#           Por eso debe ser una URL accesible desde el host (localhost), NO el nombre del
#           servicio Docker interno (backend). El browser no vive dentro de la red Docker.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

# ¿Qué? Compila la aplicación React en archivos estáticos optimizados para producción.
# ¿Para qué? Generar HTML, CSS y JavaScript minificados y con tree-shaking en /app/dist/.
# ¿Impacto? El output de pnpm build es lo único que el servidor web necesita para
#           servir la aplicación. Todo el código TypeScript se transpila a JavaScript
#           estándar que cualquier navegador moderno puede ejecutar.
RUN pnpm build

# ════════════════════════════════════════════
# ETAPA 2 — runner: servir con Nginx
# ════════════════════════════════════════════
# ¿Qué? Imagen base de Nginx en Alpine Linux para la etapa final de la imagen.
# ¿Para qué? Servir los archivos estáticos del build de React de forma eficiente.
# ¿Impacto? Esta es la imagen que realmente se despliega. No contiene Node.js, pnpm,
#           código fuente TypeScript, ni node_modules. Solo Nginx + HTML/CSS/JS.
#           Nginx Alpine pesa ~5MB. La imagen final completa ~50MB vs ~800MB sin multi-stage.
FROM nginx:alpine AS runner

# ¿Qué? Elimina la configuración por defecto de Nginx.
# ¿Para qué? Evitar que la config por defecto (que sirve la página de bienvenida "Welcome to nginx")
#            interfiera con nuestra configuración personalizada.
# ¿Impacto? Sin este paso podría haber conflictos entre dos server blocks en el mismo puerto.
RUN rm /etc/nginx/conf.d/default.conf

# ¿Qué? Copia nuestra configuración personalizada de Nginx.
# ¿Para qué? Habilitar el enrutamiento SPA con try_files $uri /index.html.
# ¿Impacto? Sin esta configuración, React Router fallaría al refrescar cualquier ruta
#           que no sea "/" — Nginx devolvería 404 en /login, /dashboard, etc.
COPY nginx.conf /etc/nginx/conf.d/app.conf

# ¿Qué? Copia los archivos compilados desde la etapa "builder" (solo /app/dist).
# ¿Para qué? Poner el bundle de React en el directorio que Nginx sirve.
# ¿Impacto? La sintaxis --from=builder indica que se copia desde la etapa anterior,
#           no desde el sistema de archivos del host. Esto es la "magia" del multi-stage:
#           tomamos SOLO lo necesario de la etapa anterior y descartamos el resto.
COPY --from=builder /app/dist /usr/share/nginx/html

# ¿Qué? Declara que el contenedor escucha en el puerto 80 (HTTP estándar).
# ¿Para qué? Documentar el puerto de la aplicación (convención Docker).
# ¿Impacto? El acceso real se configura con `ports:` en docker-compose.yml.
EXPOSE 80

# ¿Qué? Comando para iniciar Nginx en modo primer plano (foreground).
# ¿Para qué? Docker necesita que el proceso principal permanezca en foreground.
# ¿Impacto? "daemon off" es OBLIGATORIO en Docker. Si Nginx corre en background
#           (su comportamiento por defecto como servicio del SO), Docker ve que
#           el proceso principal terminó y detiene el contenedor inmediatamente.
CMD ["nginx", "-g", "daemon off;"]
