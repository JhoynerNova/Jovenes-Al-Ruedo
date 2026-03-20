"""
Módulo: schemas/conv.py
Descripción: Schemas Pydantic para convocatorias, inscripciones y evaluaciones.
¿Qué? Define la estructura de datos para operaciones sobre convocatorias artísticas.
¿Para qué? Validar que las convocatorias tengan información suficiente y coherente.
¿Impacto? Sin validación, podrían crearse convocatorias con nombres vacíos o ilegibles.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class ConvCreate(BaseModel):
    """Schema para crear una nueva convocatoria artística.

    # ¿Qué? Datos requeridos para publicar una convocatoria de empleo artístico.
    # ¿Para qué? Validar que la convocatoria tenga un título descriptivo.
    # ¿Impacto? Mínimo 5 caracteres garantiza convocatorias con títulos significativos.
    """

    # ¿Qué? Nombre o título de la convocatoria.
    # ¿Para qué? Describir brevemente la oferta artística que se publica.
    # ¿Impacto? Es lo primero que ve el artista — debe ser claro y descriptivo.
    nombre: str

    # ¿Qué? Descripción detallada (glue) de la convocatoria.
    # ¿Para qué? Dar contexto completo sobre lo que busca la empresa.
    # ¿Impacto? Campo opcional — permite convocatorias simples sin descripción larga.
    glue: str | None = None

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        """Valida que el nombre de la convocatoria sea suficientemente descriptivo.

        # ¿Qué? Verifica longitud mínima del título de la convocatoria.
        # ¿Para qué? Evitar convocatorias con títulos vagos como "hola" o "test".
        # ¿Impacto? Sin esta validación, las empresas podrían publicar ofertas sin información.
        """
        v = v.strip()
        if len(v) < 5:
            raise ValueError("El nombre de la convocatoria debe tener al menos 5 caracteres")
        if len(v) > 150:
            raise ValueError("El nombre de la convocatoria no puede exceder 150 caracteres")
        return v


class ConvResponse(BaseModel):
    """Schema de respuesta para una convocatoria.

    # ¿Qué? Datos de la convocatoria que retorna la API.
    # ¿Para qué? Exponer la información pública de la convocatoria al cliente.
    # ¿Impacto? from_attributes=True permite conversión directa desde el ORM Conv.
    """

    id_conv: int
    nombre: str
    glue: str | None
    id_usr: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InscripcionCreate(BaseModel):
    """Schema para que un artista se postule a una convocatoria.

    # ¿Qué? Solo requiere el ID de la convocatoria a la que se postula.
    # ¿Para qué? El ID del artista se obtiene del token JWT, no del body.
    # ¿Impacto? Previene que un usuario se postule en nombre de otro.
    """

    # ¿Qué? Identificador de la convocatoria a la que se postula el artista.
    # ¿Para qué? Relacionar la postulación con la convocatoria correcta.
    # ¿Impacto? Sin este campo, no hay forma de saber a qué convocatoria se postula.
    id_conv: int


class InscripcionResponse(BaseModel):
    """Schema de respuesta para una inscripción.

    # ¿Qué? Confirmación de la postulación del artista.
    # ¿Para qué? Retornar los datos de la inscripción creada.
    # ¿Impacto? Permite al artista confirmar que su postulación fue registrada.
    """

    id_i: int
    id_conv: int
    id_usr: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DetConvCreate(BaseModel):
    """Schema para registrar una evaluación de un candidato en una convocatoria.

    # ¿Qué? Datos para que la empresa evalúe a un artista inscrito.
    # ¿Para qué? Registrar las observaciones de la empresa sobre cada candidato.
    # ¿Impacto? Permite llevar historial de evaluaciones por convocatoria.
    """

    # ¿Qué? ID de la convocatoria en la que se evalúa al candidato.
    # ¿Para qué? Relacionar la evaluación con la convocatoria correcta.
    # ¿Impacto? Sin este campo, no se sabe en cuál convocatoria fue evaluado.
    id_conv: int

    # ¿Qué? ID del artista que está siendo evaluado.
    # ¿Para qué? Identificar al candidato dentro de la convocatoria.
    # ¿Impacto? Permite filtrar evaluaciones por candidato.
    id_usr: uuid.UUID

    # ¿Qué? Observaciones o comentarios de la empresa sobre el candidato.
    # ¿Para qué? Registrar el feedback cualitativo de la evaluación.
    # ¿Impacto? Campo opcional — la empresa puede evaluar sin dejar comentarios.
    obsr: str | None = None
