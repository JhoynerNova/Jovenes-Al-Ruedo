/**
 * Utilidad para exportar e imprimir la ficha artística de un usuario en una ventana limpia.
 */
export function exportArtistProfile(user: {
  full_name?: string;
  artistic_area?: string | null;
  email?: string;
  location?: string | null;
  bio?: string | null;
} | null) {
  if (!user) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Ficha Artística - ${user.full_name || "Artista"}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; background-color: #f8fafc; }
          .card { background: #ffffff; border: 2px solid #5A3FA0; border-radius: 16px; padding: 32px; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          h1 { color: #5A3FA0; margin-top: 0; margin-bottom: 8px; font-size: 24px; }
          .badge { display: inline-block; background: #2EC4B6; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
          .section { border-top: 1px solid #e2e8f0; padding-top: 20px; }
          p { margin: 10px 0; font-size: 14px; }
          .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${user.full_name || "Artista Jóvenes al Ruedo"}</h1>
          <span class="badge">${user.artistic_area || "Talento Emergente"}</span>
          <div class="section">
            <p><span class="label">Correo Electrónico:</span> ${user.email || "No especificado"}</p>
            <p><span class="label">Ubicación:</span> ${user.location || "Colombia"}</p>
            <p><span class="label">Biografía Artística:</span><br/>${user.bio || "Sin biografía registrada."}</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
