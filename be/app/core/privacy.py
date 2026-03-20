"""
Módulo: core/privacy.py
Descripción: Política de privacidad y tratamiento de datos personales del proyecto Jóvenes al Ruedo.
¿Qué? Define las constantes y textos de la política de privacidad conforme a la legislación colombiana.
¿Para qué? Centralizar la política de privacidad permite actualizarla en un solo lugar
           y referenciarla desde la API y el frontend.
¿Impacto? Cumple con:
          - Ley 1581 de 2012 (Habeas Data — Protección de Datos Personales)
          - Decreto 1377 de 2013 (Reglamentación parcial de la Ley 1581)
          - Ley 1273 de 2009 (Delitos Informáticos en Colombia)
          - OWASP Top 10 A05 (Mala Configuración de Seguridad)
"""

# ¿Qué? Información del responsable del tratamiento de datos personales.
# ¿Para qué? Identificar a la organización responsable del tratamiento de datos.
# ¿Impacto? Art. 17 Ley 1581/2012 — el responsable debe estar claramente identificado.
RESPONSABLE = {
    "nombre": "Jóvenes al Ruedo",
    "ficha_sena": "3171599",
    "correo": "privacidad@jovenes-al-ruedo.com",
    "ciudad": "Colombia",
}

# ¿Qué? Listado de datos personales recolectados por la plataforma.
# ¿Para qué? Informar al titular exactamente qué datos se recopilan (principio de transparencia).
# ¿Impacto? Art. 15 Ley 1581/2012 — el titular tiene derecho a conocer los datos que se tratan.
DATOS_RECOLECTADOS = [
    "Nombre completo",
    "Dirección de correo electrónico",
    "Fecha de nacimiento",
    "Área artística",
    "Contraseña (almacenada como hash bcrypt — nunca en texto plano)",
    "Fecha y hora de registro",
    "Portafolios artísticos (archivos subidos)",
    "Historial de postulaciones a convocatorias",
    "Cookies de sesión (access_token y refresh_token — HTTPOnly)",
]

# ¿Qué? Finalidades del tratamiento de datos personales.
# ¿Para qué? Informar al titular para qué se usan sus datos (principio de finalidad).
# ¿Impacto? Art. 4 Ley 1581/2012 — los datos solo pueden usarse para las finalidades declaradas.
FINALIDADES = [
    "Autenticación y control de acceso a la plataforma",
    "Gestión del perfil artístico del usuario",
    "Publicación de portafolios para visibilidad ante empresas",
    "Notificación de convocatorias artísticas relevantes",
    "Envío de correos de recuperación de contraseña",
    "Análisis estadístico anónimo del uso de la plataforma",
    "Cumplimiento de obligaciones legales aplicables",
]

# ¿Qué? Derechos del titular de los datos personales.
# ¿Para qué? Informar al usuario de sus derechos legales sobre sus datos.
# ¿Impacto? Art. 8 Ley 1581/2012 — los titulares tienen derechos ARCO
#           (Acceso, Rectificación, Cancelación, Oposición).
DERECHOS_TITULAR = [
    "Conocer, actualizar y rectificar sus datos personales",
    "Solicitar prueba de la autorización otorgada para el tratamiento",
    "Ser informado sobre el uso que se ha dado a sus datos personales",
    "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)",
    "Revocar la autorización y/o solicitar la supresión de sus datos",
    "Acceder gratuitamente a sus datos personales tratados",
]

# ¿Qué? Política de uso de cookies de la plataforma.
# ¿Para qué? Informar al usuario sobre las cookies utilizadas y su propósito.
# ¿Impacto? OWASP A02 — las cookies HTTPOnly protegen los tokens contra XSS.
#           Ley 1581/2012 — las cookies de sesión son datos de uso del titular.
COOKIE_POLICY = {
    "access_token": {
        "descripcion": "Token JWT de acceso para autenticación",
        "duracion": "15 minutos",
        "tipo": "HTTPOnly — no accesible por JavaScript",
        "proposito": "Mantener la sesión del usuario activa",
    },
    "refresh_token": {
        "descripcion": "Token de refresco para renovar el access token",
        "duracion": "7 días",
        "tipo": "HTTPOnly — no accesible por JavaScript",
        "proposito": "Renovar la sesión sin requerir login frecuente",
    },
}

# ¿Qué? Texto completo de la política de privacidad.
# ¿Para qué? Proveer el texto legal completo que se muestra en el frontend.
# ¿Impacto? Sin este texto, la plataforma incumple la Ley 1581/2012 que exige
#           informar al titular antes de recolectar sus datos.
POLITICA_PRIVACIDAD = """
POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS PERSONALES
Jóvenes al Ruedo — SENA Ficha 3171599
Fecha de vigencia: 2026

1. RESPONSABLE DEL TRATAMIENTO
Jóvenes al Ruedo es el responsable del tratamiento de los datos personales
recolectados a través de esta plataforma. Para ejercer sus derechos o realizar
consultas, puede comunicarse a: privacidad@jovenes-al-ruedo.com

2. DATOS PERSONALES RECOLECTADOS
Recolectamos los siguientes datos personales: nombre completo, correo electrónico,
fecha de nacimiento, área artística, y los archivos artísticos que usted cargue
voluntariamente como parte de su portafolio.

3. FINALIDAD DEL TRATAMIENTO
Sus datos se utilizan exclusivamente para: autenticación en la plataforma, gestión
de su perfil artístico, conexión con convocatorias relevantes, y envío de
comunicaciones relacionadas con el servicio.

4. DERECHOS DEL TITULAR (Art. 8, Ley 1581 de 2012)
Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales,
así como a revocar su autorización para el tratamiento. Para ejercer estos derechos,
contáctenos en: privacidad@jovenes-al-ruedo.com

5. COOKIES
Utilizamos cookies HTTPOnly para gestionar su sesión de forma segura. Estas cookies
no son accesibles por JavaScript, lo que protege su sesión contra ataques XSS.
Al registrarse, usted acepta el uso de estas cookies de sesión.

6. SEGURIDAD
Sus datos se almacenan con medidas de seguridad técnicas y organizativas conforme
a la Ley 1273 de 2009 y las directrices OWASP. Las contraseñas se almacenan
como hash bcrypt irreversible — nunca en texto plano.

7. MODIFICACIONES
Esta política puede ser modificada en cualquier momento. Los cambios se notificarán
a través de la plataforma con al menos 10 días de anticipación.
"""
