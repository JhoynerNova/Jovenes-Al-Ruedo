"""
Módulo: schemas/habilidad.py
Descripción: Schemas Pydantic para el modelo Habilidad.
"""

from pydantic import BaseModel, ConfigDict, field_validator

class HabilidadCreate(BaseModel):
    """Schema para crear una nueva habilidad artística.
    """

    nombre: str

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        """Valida que el nombre de la habilidad sea válido.
        """
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre de la habilidad debe tener al menos 2 caracteres")
        if len(v) > 100:
            raise ValueError("El nombre de la habilidad no puede exceder 100 caracteres")
        return v

class HabilidadResponse(BaseModel):
    """Schema de respuesta con datos de una habilidad.
    """

    id_hab: int

    nombre: str

    model_config = ConfigDict(from_attributes=True)
