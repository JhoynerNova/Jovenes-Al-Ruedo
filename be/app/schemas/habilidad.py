"""
Módulo: schemas/habilidad.py
Descripción: Schemas Pydantic para el modelo Habilidad.
¿Qué? Define la forma de los datos para crear y responder habilidades artísticas.
¿Para qué? Validar que las habilidades tengan nombre válido antes de guardarlas.
¿Impacto? Sin schemas, cualquier texto (vacío, malformado) podría guardarse como habilidad.
"""

from pydantic import BaseModel, ConfigDict, field_validator


class HabilidadCreate(BaseModel):
    """Schema para crear una nueva habilidad artística.

    # ¿Qué? Datos requeridos para registrar una habilidad en el catálogo.
    # ¿Para qué? Validar el nombre antes de insertarlo en la BD.
    # ¿Impacto? Previene duplicados y nombres inválidos en el catálogo.
    """

    # ¿Qué? Nombre de la habilidad artística.
    # ¿Para qué? Identificar la habilidad en el catálogo de la plataforma.
    # ¿Impacto? Mínimo 2 caracteres evita habilidades sin sentido ("a", "").
    nombre: str

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        """Valida que el nombre de la habilidad sea válido.

        # ¿Qué? Verifica longitud mínima y máxima del nombre.
        # ¿Para qué? Garantizar que el catálogo tenga habilidades con nombres reales.
        # ¿Impacto? Sin validación, podrían ingresarse habilidades como "x" o con 1000 caracteres.
        """
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre de la habilidad debe tener al menos 2 caracteres")
        if len(v) > 100:
            raise ValueError("El nombre de la habilidad no puede exceder 100 caracteres")
        return v


class HabilidadResponse(BaseModel):
    """Schema de respuesta con datos de una habilidad.

    # ¿Qué? Datos que retorna la API cuando se consulta una habilidad.
    # ¿Para qué? Exponer solo los campos necesarios del modelo Habilidad.
    # ¿Impacto? from_attributes=True permite convertir directamente desde el ORM.
    """

    # ¿Qué? Identificador único de la habilidad en la BD.
    # ¿Para qué? Referenciar la habilidad en otras operaciones (asignar a usuario, etc.).
    # ¿Impacto? Sin id, el cliente no puede identificar ni relacionar habilidades.
    id_hab: int

    # ¿Qué? Nombre de la habilidad artística.
    # ¿Para qué? Mostrar al usuario qué habilidad es.
    # ¿Impacto? Campo principal visible en la interfaz del usuario.
    nombre: str

    # ¿Qué? Configuración para compatibilidad con modelos ORM de SQLAlchemy.
    # ¿Para qué? Permite crear HabilidadResponse desde un objeto Habilidad directamente.
    # ¿Impacto? Sin esto, habría que convertir manualmente el ORM a dict.
    model_config = ConfigDict(from_attributes=True)
