"""
Módulo: utils/email.py
Descripción: Utilidades para envío de emails — recuperación de contraseña y notificaciones.
¿Para qué? Proveer funciones para enviar emails reales por SMTP (Gmail, Outlook, SendGrid, etc.)
           o registrar en consola en modo desarrollo.
"""

import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def _send_smtp_sync(email: str, reset_url: str, token: str) -> bool:
    """Función síncrona interna para enviar email por SMTP usando smtplib (Estándar de Python)."""
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD or settings.MAIL_SERVER == "smtp.example.com":
        logger.info("[Email] Configuración SMTP no detectada o por defecto. Omitiendo envío SMTP real.")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    msg["To"] = email
    msg["Subject"] = "Jóvenes al Ruedo — Recuperación de contraseña"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }}
            .header {{ text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; }}
            .header h1 {{ color: #4f46e5; margin: 0; font-size: 24px; }}
            .btn {{ display: inline-block; padding: 12px 28px; background-color: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; text-align: center; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Jóvenes al Ruedo</h1>
            </div>
            <h2>Solicitud de Recuperación de Contraseña</h2>
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña en la plataforma <strong>Jóvenes al Ruedo</strong>.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace es válido por 1 hora:</p>
            <div style="text-align: center;">
                <a href="{reset_url}" class="btn" target="_blank">Restablecer Contraseña</a>
            </div>
            <p style="margin-top: 25px; font-size: 13px; color: #666;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
                <a href="{reset_url}" style="color: #6366f1; word-break: break-all;">{reset_url}</a>
            </p>
            <div class="footer">
                <p>Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
                <p>&copy; 2026 Jóvenes al Ruedo — Plataforma Cultural y Bolsa de Empleo</p>
            </div>
        </div>
    </body>
    </html>
    """
    msg.attach(MIMEText(html_content, "html"))

    try:
        if settings.MAIL_PORT == 465:
            server = smtplib.SMTP_SSL(settings.MAIL_SERVER, settings.MAIL_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT, timeout=10)
            server.starttls()

        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM, [email], msg.as_string())
        server.quit()
        logger.info(f"[Email OK] Correo enviado exitosamente a {email} vía SMTP ({settings.MAIL_SERVER})")
        return True
    except Exception as e:
        logger.error(f"[Email Error] Error al enviar email vía SMTP a {email}: {e}")
        return False


async def send_password_reset_email(email: str, token: str) -> None:
    """Envía un email con el enlace de recuperación de contraseña.

    Intenta enviar por SMTP real si las credenciales están configuradas.
    Imprime en consola para facilidad de depuración y testing.
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    print(f"\n{'='*65}")
    print(f"[RECUPERACION DE CONTRASEÑA]")
    print(f"   Para: {email}")
    print(f"   Enlace: {reset_url}")
    print(f"   Token: {token}")
    print(f"{'='*65}\n")

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _send_smtp_sync, email, reset_url, token)
