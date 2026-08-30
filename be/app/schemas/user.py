"""
Módulo: schemas/user.py
Descripción: Schemas Pydantic para validación de datos de entrada (request) y salida (response)
             en los endpoints de autenticación y usuario.
¿Para qué? Definir la "forma" exacta de los datos que la API acepta y retorna.
           Pydantic valida automáticamente tipos, formatos y restricciones — si los datos
           no cumplen el schema, FastAPI retorna un 422 con detalles del error.
¿Impacto? Sin schemas, la API aceptaría cualquier dato sin validación, exponiendo el backend
          a datos malformados, inyecciones y errores silenciosos.
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

    ¿Qué? Define los campos requeridos para crear una cuenta: email, nombre, edad,
          área artística y contraseña.
    ¿Para qué? Validar que el cliente envíe datos correctos antes de procesarlos.
    ¿Impacto? Los validadores garantizan fortaleza mínima de contraseña y restricción
              de edad mínima de 18 años.
    """

    # ¿Qué? Email del usuario — Pydantic valida formato automáticamente con EmailStr.
    # ¿Para qué? Identificador único y medio de contacto para recuperación de contraseña.
    # ¿Impacto? EmailStr rechaza emails inválidos (sin @, sin dominio, etc.).
    email: EmailStr

    # ¿Qué? Nombres y apellidos.
    first_name: str
    last_name: str

    # ¿Qué? Rol del usuario.
    # ¿Para qué? Diferenciar tipo de cuenta en registro.
    role: str = "artista"

    # ¿Qué? Sector de la empresa.
    # ¿Para qué? Las empresas deben ingresar esto.
    sector: Optional[str] = None

    # ¿Qué? Edad del joven artista.
    # ¿Para qué? Validar que sea mayor de 18 años al registrarse. Opcional para empresas.
    birth_date: Optional[date] = None

    # ¿Qué? Área artística del joven.
    # ¿Para qué? Categorizar al artista dentro de la plataforma. Opcional para empresas.
    artistic_area: Optional[str] = None

    # ¿Qué? Contraseña en texto plano (solo viaja en el request, NUNCA se almacena así).
    # ¿Para qué? El backend la hashea con bcrypt antes de guardarla en la BD.
    # ¿Impacto? El validador exige mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número.
    password: str

    # ¿Qué? Confirmación de que el usuario aceptó la Política de Privacidad y Términos.
    # ¿Para qué? Ley 1581 de 2012 (Habeas Data) exige consentimiento informado explícito
    #            para el tratamiento de datos personales — no basta con un checkbox visual
    #            en el frontend si el backend no lo valida ni lo registra.
    # ¿Impacto? El validador rechaza el registro si llega en False — el checkbox del
    #           frontend ya bloquea el submit, pero esta es la garantía del lado del servidor.
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

        ¿Qué? Verifica longitud mínima y presencia de mayúsculas, minúsculas y números.
        ¿Para qué? Prevenir contraseñas débiles que son fáciles de adivinar o crackear.
        ¿Impacto? Sin esta validación, un usuario podría registrarse con "a" como contraseña.

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
        # ¿Qué? Valida que el usuario tenga entre 18 y 28 años exactos (solo si se provee).
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
        # ¿Qué? Valida que el área artística tenga contenido significativo.
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

    ¿Qué? Define los campos necesarios para autenticarse: email y contraseña.
    ¿Para qué? Validar las credenciales antes de buscar en la BD.
    ¿Impacto? Estructura simple — la validación real (¿existe el email? ¿coincide la password?)
              se hace en el service, no aquí.
    """

    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    """Schema para cambiar la contraseña (usuario autenticado).

    ¿Qué? Requiere la contraseña actual y la nueva contraseña.
    ¿Para qué? Verificar que el usuario conoce su contraseña actual antes de cambiarla
              (previene cambios si alguien toma el dispositivo desbloqueado).
    ¿Impacto? Sin current_password, cualquier persona con acceso al token podría cambiar
              la contraseña sin conocer la original.
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

    ¿Qué? Solo requiere el email del usuario.
    ¿Para qué? Iniciar el flujo de recuperación: generar token + enviar email.
    ¿Impacto? La API siempre retorna el mismo mensaje (éxito), sin importar si el email
              existe o no — esto previene la enumeración de usuarios.
    """

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema para restablecer la contraseña con un token de recuperación.

    ¿Qué? Requiere el token de reset (recibido por email) y la nueva contraseña.
    ¿Para qué? Completar el flujo de recuperación: validar token + actualizar contraseña.
    ¿Impacto? El token se marca como usado después de un reset exitoso,
              evitando que se reutilice.
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

    ¿Qué? Requiere la contraseña actual como confirmación.
    ¿Para qué? Es una acción irreversible desde la perspectiva del usuario — pedir la
              contraseña evita que alguien con la sesión abierta (pero sin la contraseña)
              elimine la cuenta por error o malicia.
    """

    password: str


class LogoutRequest(BaseModel):
    """Schema para cerrar sesión revocando el refresh token.

    ¿Qué? Contiene opcionalmente el refresh_token para invalidarlo del lado del servidor.
    ¿Para qué? El access token se revoca a partir del header Authorization; el refresh
              token no viaja en headers, así que el cliente lo envía en el body.
    ¿Impacto? Si no se envía, el logout solo revoca el access token actual (el refresh
              token quedaría vigente hasta expirar, aunque las cookies ya se borraron).
    """

    refresh_token: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Schema para renovar el access token usando el refresh token.

    ¿Qué? Contiene el refresh token que el cliente recibió durante el login.
    ¿Para qué? Obtener un nuevo access token sin re-ingresar credenciales.
    ¿Impacto? Es el mecanismo que mantiene la sesión del usuario viva sin pedirle
              email/password continuamente.
    """

    refresh_token: str


# ════════════════════════════════════════
# 📤 Schemas de RESPONSE (datos que retorna la API)
# ════════════════════════════════════════


class UserResponse(BaseModel):
    """Schema de respuesta con datos del usuario (sin password).

    ¿Qué? Define qué campos del usuario se retornan al cliente.
    ¿Para qué? Controlar exactamente qué datos se exponen — NUNCA incluir hashed_password.
    ¿Impacto? Sin response_model, FastAPI podría serializar el objeto User completo,
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

    # ¿Qué? Configuración que permite crear este schema desde un objeto SQLAlchemy.
    # ¿Para qué? Convertir User (ORM) → UserResponse (Pydantic) automáticamente.
    # ¿Impacto? Sin esto, habría que construir el dict manualmente campo por campo.
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema de respuesta con los tokens de autenticación.

    ¿Qué? Retorna access_token, refresh_token y el tipo de token ("bearer").
    ¿Para qué? El frontend almacena estos tokens para enviarlos en peticiones futuras.
    ¿Impacto? token_type="bearer" indica al cliente cómo enviar el token:
              header Authorization: Bearer <access_token>.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """Schema de respuesta genérico con un mensaje.

    ¿Qué? Respuesta simple con un campo "message".
    ¿Para qué? Retornar confirmaciones de operaciones (cambio de contraseña,
              envío de email de recuperación, etc.).
    ¿Impacto? Estandariza las respuestas de la API — el frontend siempre
              puede esperar un campo "message" en operaciones sin datos de retorno.
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