"""
Módulo: schemas/portafolio.py
Descripción: Schemas Pydantic para portafolios y archivos artísticos.
¿Qué? Define la estructura de datos para crear y responder portafolios y sus archivos.
¿Para qué? Validar que los portafolios tengan nombres válidos y los archivos extensiones permitidas.
¿Impacto? Sin validación, un artista podría subir archivos con extensiones peligrosas (.exe, .sh).
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


# ¿Qué? Extensiones de archivo permitidas en los portafolios.
# ¿Para qué? Restringir los tipos de archivo que pueden subirse a la plataforma.
# ¿Impacto? Sin esta lista, usuarios podrían subir ejecutables o scripts maliciosos.
EXTENSIONES_PERMITIDAS = {".mp3", ".mp4", ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".wav"}


class DetPortafolioCreate(BaseModel):
    """Schema para agregar un archivo a un portafolio.

    # ¿Qué? Datos para crear un archivo (Det = Detalle) dentro de un portafolio.
    # ¿Para qué? Validar extensión y estado del archivo antes de guardarlo.
    # ¿Impacto? Previene archivos con extensiones no permitidas y estados inválidos.
    """

    # ¿Qué? Ruta o nombre del archivo artístico.
    # ¿Para qué? Almacenar la referencia al archivo subido por el artista.
    # ¿Impacto? La extensión se valida para asegurar que solo se acepten formatos artísticos.
    archivo: str
    titulo: str | None = None
    descripcion: str | None = None
    portada_url: str | None = None
    etiquetas: str | None = None
    estado: str = "G"

    @field_validator("archivo")
    @classmethod
    def validate_archivo(cls, v: str) -> str:
        """Valida que el archivo tenga una extensión permitida.

        # ¿Qué? Verifica que el archivo sea de un tipo artístico válido.
        # ¿Para qué? Prevenir la subida de archivos peligrosos o no soportados.
        # ¿Impacto? OWASP A03 — sin esta validación, un atacante podría subir scripts.
        """
        import os
        ext = os.path.splitext(v.lower())[1]
        if ext not in EXTENSIONES_PERMITIDAS:
            raise ValueError(
                f"Extensión no permitida. Formatos aceptados: {', '.join(sorted(EXTENSIONES_PERMITIDAS))}"
            )
        return v

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, v: str) -> str:
        """Valida que el estado sea 'G' (Guardado) o 'P' (Publicado).

        # ¿Qué? Restringe los valores posibles del campo estado.
        # ¿Para qué? Garantizar consistencia con el CHECK constraint de la BD.
        # ¿Impacto? Sin esta validación, podrían guardarse estados inválidos que romperían la BD.
        """
        if v not in ("G", "P"):
            raise ValueError("El estado debe ser 'G' (Guardado) o 'P' (Publicado)")
        return v


class DetPortafolioResponse(BaseModel):
    """Schema de respuesta para un archivo de portafolio.

    # ¿Qué? Datos del archivo que retorna la API.
    # ¿Para qué? Exponer la información del archivo al cliente.
    # ¿Impacto? from_attributes=True permite conversión directa desde el ORM.
    """

    id_det_p: int
    id_port: int
    titulo: str | None = None
    descripcion: str | None = None
    portada_url: str | None = None
    etiquetas: str | None = None
    archivo: str
    estado: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PortafolioCreate(BaseModel):
    """Schema para crear un nuevo portafolio artístico.

    # ¿Qué? Datos requeridos para crear un portafolio.
    # ¿Para qué? Validar que el nombre del portafolio sea significativo.
    # ¿Impacto? Mínimo 3 caracteres evita portafolios con nombres vacíos o sin sentido.
    """

    # ¿Qué? Nombre del portafolio artístico.
    # ¿Para qué? Identificar la colección de obras del artista.
    # ¿Impacto? El nombre es la primera descripción que ve la empresa al revisar el portafolio.
    nombre: str
    descripcion: str | None = None
    visibilidad: str = "Publico"

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        """Valida que el nombre del portafolio sea válido.

        # ¿Qué? Verifica longitud mínima y máxima del nombre.
        # ¿Para qué? Garantizar que el portafolio tenga un nombre descriptivo.
        # ¿Impacto? Sin validación, un artista podría crear portafolios con nombre "a".
        """
        v = v.strip()
        if len(v) < 3:
            raise ValueError("El nombre del portafolio debe tener al menos 3 caracteres")
        if len(v) > 150:
            raise ValueError("El nombre del portafolio no puede exceder 150 caracteres")
        return v


class PortafolioResponse(BaseModel):
    """Schema de respuesta para un portafolio completo con sus archivos.

    # ¿Qué? Datos completos del portafolio incluyendo sus archivos.
    # ¿Para qué? Retornar al cliente toda la información de un portafolio en una sola respuesta.
    # ¿Impacto? Evita múltiples llamadas a la API para obtener el portafolio y sus archivos.
    """

    id_port: int
    nombre: str
    descripcion: str | None = None
    visibilidad: str
    id_usr: uuid.UUID
    created_at: datetime
    archivos: list[DetPortafolioResponse] = []

    model_config = ConfigDict(from_attributes=True)
