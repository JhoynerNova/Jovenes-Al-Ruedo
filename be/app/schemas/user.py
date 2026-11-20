"""
Módulo: schemas/user.py
Descripción: Schemas Pydantic para validación de datos de entrada (request) y salida (response)
             en los endpoints de autenticación y usuario.
"""

import re
import uuid
from datetime import datetime, date  # datetime usado en UserResponse

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, model_validator

# 
# Schemas de REQUEST (datos que envía el cliente)
# 

class UserCreate(BaseModel):
    """Schema para el registro de un nuevo usuario.
    """

    email: EmailStr

    first_name: str
    last_name: str

    role: str = "artista"

    sector: Optional[str] = None

    birth_date: Optional[date] = None

    artistic_area: Optional[str] = None

    password: str

    accepted_terms: bool = False

    @field_validator("accepted_terms")
    @classmethod
    def validate_accepted_terms(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Debes aceptar la Política de Privacidad y los Términos y Condiciones")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Valida que la contraseña cumpla requisitos mínimos de seguridad.

        Args:
            v: Valor de la contraseña a validar.

        Returns:
            La contraseña si pasa todas las validaciones.

        Raises:
            ValueError: Si la contraseña no cumple los requisitos.
        """
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe contener al menos una letra minúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, v: Optional[date]) -> Optional[date]:
        """
        """
        if v is None:
            return v
        today = date.today()
        years = (today - v).days / 365.25
        if years < 18:
            raise ValueError("Debes tener al menos 18 años para registrarte en la plataforma")
        if years > 28:
            raise ValueError("Esta plataforma es exclusiva para jóvenes entre 18 y 28 años")
        return v

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Valida que los nombres no estén vacíos y no excedan el límite."""
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre/apellido debe tener al menos 2 caracteres")
        if len(v) > 255:
            raise ValueError("El nombre/apellido no puede exceder 255 caracteres")
        return v

    @field_validator("artistic_area")
    @classmethod
    def validate_artistic_area(cls, v: Optional[str]) -> Optional[str]:
        """
        """
        if v is None:
            return v
        v = v.strip()
        if len(v) < 3:
            raise ValueError("El área artística debe tener al menos 3 caracteres")
        if len(v) > 100:
            raise ValueError("El área artística no puede exceder 100 caracteres")
        return v

    @model_validator(mode="after")
    def validate_role_fields(self) -> "UserCreate":
        """Valida campos requeridos dinámicamente según el rol."""
        if self.role == "artista":
            if not self.birth_date:
                raise ValueError("La fecha de nacimiento es requerida para artistas")
            if not self.artistic_area:
                raise ValueError("El área artística es requerida para artistas")
        elif self.role == "empresa":
            if not self.sector:
                raise ValueError("El sector es requerido para empresas")
        return self

class UserLogin(BaseModel):
    """Schema para el login de un usuario.
    """

    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    """Schema para cambiar la contraseña (usuario autenticado).

              (previene cambios si alguien toma el dispositivo desbloqueado).
    """

    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        """Aplica las mismas reglas de fortaleza que en el registro."""
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe contener al menos una letra minúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v

class ForgotPasswordRequest(BaseModel):
    """Schema para solicitar recuperación de contraseña.
    """

    email: EmailStr

class ResetPasswordRequest(BaseModel):
    """Schema para restablecer la contraseña con un token de recuperación.
    """

    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        """Aplica las mismas reglas de fortaleza que en el registro."""
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe contener al menos una letra minúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v

class DeleteAccountRequest(BaseModel):
    """Schema para eliminar la propia cuenta (usuario autenticado).

              contraseña evita que alguien con la sesión abierta (pero sin la contraseña)
              elimine la cuenta por error o malicia.
    """

    password: str

class LogoutRequest(BaseModel):
    """Schema para cerrar sesión revocando el refresh token.

              token quedaría vigente hasta expirar, aunque las cookies ya se borraron).
    """

    refresh_token: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    """Schema para renovar el access token usando el refresh token.
    """

    refresh_token: str

# ════════════════════════════════════════
# 📤 Schemas de RESPONSE (datos que retorna la API)
# ════════════════════════════════════════

class UserResponse(BaseModel):
    """Schema de respuesta con datos del usuario (sin password).

              exponiendo el hash de la contraseña. model_config from_attributes=True
              permite convertir directamente desde el modelo ORM.
    """

    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    full_name: str
    color_palette: Optional[str] = None
    customization: Optional[dict] = None
    role: str
    sector: Optional[str] = None
    birth_date: Optional[date] = None
    artistic_area: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_pic_url: Optional[str] = None
    cover_pic_url: Optional[str] = None
    social_links: Optional[dict] = None
    artistic_disciplines: Optional[List[str]] = None
    looking_for_disciplines: Optional[List[str]] = None
    company_legal_name: Optional[str] = None
    company_nit: Optional[str] = None
    company_size: Optional[str] = None
    onboarding_completed: bool = False
    profile_views: int = 0
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    """Schema de respuesta con los tokens de autenticación.

              header Authorization: Bearer <access_token>.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class MessageResponse(BaseModel):
    """Schema de respuesta genérico con un mensaje.

              envío de email de recuperación, etc.).
    """

    message: str

from typing import List

class PaginatedUsersResponse(BaseModel):
    """Schema para listar usuarios con paginación."""
    items: List[UserResponse]
    total: int
    page: int
    size: int
    pages: int

class UserStatusUpdate(BaseModel):
    """Schema para activar o desactivar un usuario."""
    is_active: bool

class UserUpdate(BaseModel):
    """Schema para actualizar el perfil del usuario autenticado."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    artistic_area: Optional[str] = None
    sector: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_pic_url: Optional[str] = None
    cover_pic_url: Optional[str] = None
    color_palette: Optional[str] = None
    customization: Optional[dict] = None
    social_links: Optional[dict] = None
    artistic_disciplines: Optional[List[str]] = None
    looking_for_disciplines: Optional[List[str]] = None
    company_legal_name: Optional[str] = None
    company_nit: Optional[str] = None
    company_size: Optional[str] = None
    onboarding_completed: Optional[bool] = None

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre/apellido debe tener al menos 2 caracteres")
        return v

    @field_validator("company_size")
    @classmethod
    def validate_company_size(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"1-10", "11-50", "51-200", "200+"}
        if v not in allowed:
            raise ValueError(f"company_size debe ser uno de: {', '.join(sorted(allowed))}")
        return v

class UserRoleUpdate(BaseModel):
    """Schema para cambiar el rol de un usuario (solo admin)."""
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("artista", "empresa", "admin"):
            raise ValueError("Rol inválido. Debe ser artista, empresa o admin")
        return v

class AdminResetPasswordRequest(BaseModel):
    """Schema para que un administrador cambie la contraseña de un usuario."""
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("La nueva contraseña debe tener al menos 6 caracteres")
        return v