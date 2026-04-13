"""
Módulo: models/user.py
Descripción: Modelo ORM que representa la tabla `users` en PostgreSQL.
¿Para qué? Definir la estructura de la tabla de usuarios — columnas, tipos, restricciones
           e índices — usando Python en lugar de SQL directo.
¿Impacto? Este modelo es el corazón del sistema de autenticación. Cada registro en esta tabla
          representa un usuario del sistema. Sin este modelo, no hay usuarios.
"""

import uuid
from datetime import datetime, date
from typing import List

from sqlalchemy import Boolean, Date, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """Modelo ORM para la tabla `users`.

    ¿Qué? Clase Python que mapea a la tabla `users` en PostgreSQL.
    ¿Para qué? Cada instancia de User representa una fila en la tabla.
              SQLAlchemy traduce operaciones Python (crear User, query, update)
              a sentencias SQL automáticamente.
    ¿Impacto? Almacena las credenciales y datos de perfil de cada usuario.
              La contraseña se guarda como hash bcrypt (columna hashed_password),
              NUNCA en texto plano.
    """

    # ¿Qué? Nombre de la tabla en PostgreSQL.
    # ¿Para qué? SQLAlchemy usa esto para crear/referenciar la tabla.
    # ¿Impacto? Convención: plural, snake_case (users, no User ni usuario).
    __tablename__ = "users"

    # ────────────────────────────
    # Columnas
    # ────────────────────────────

    # ¿Qué? Identificador único universal del usuario.
    # ¿Para qué? Identificar cada usuario de forma única e inmutable.
    # ¿Impacto? UUID es mejor que autoincremental para seguridad — no revela
    #           cuántos usuarios hay ni permite adivinar IDs secuenciales.
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ¿Qué? Dirección de email del usuario.
    # ¿Para qué? Sirve como identificador de login (credencial) y para enviar
    #            emails de recuperación de contraseña.
    # ¿Impacto? UNIQUE evita cuentas duplicadas. INDEX acelera las búsquedas
    #           por email (operación muy frecuente en login).
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    # ¿Qué? Nombre completo del usuario.
    # ¿Para qué? Mostrar el nombre en el perfil y en la interfaz del frontend.
    # ¿Impacto? Campo requerido para personalizar la experiencia del usuario.
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # ¿Qué? Fecha de nacimiento del joven artista.
    # ¿Para qué? Validar que el usuario sea mayor de 18 años al registrarse (si es artista).
    # ¿Impacto? Guarda la fecha de nacimiento en vez de la edad estimada. Opcional para empresas.
    birth_date: Mapped[date] = mapped_column(
        Date,
        nullable=True,
    )

    # ¿Qué? Área artística en la que se desenvuelve el joven artista.
    # ¿Para qué? Categorizar al artista dentro de la plataforma.
    # ¿Impacto? Permite filtrar y conectar artistas por disciplina artística. Opcional para empresas.
    artistic_area: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )
    
    # ¿Qué? Sector en el que opera la empresa.
    # ¿Para qué? Categorizar la empresa o fundación.
    # ¿Impacto? Las empresas deben ingresar este campo en lugar de artistic_area.
    sector: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )
    
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    profile_pic_url: Mapped[str] = mapped_column(String(500), nullable=True)
    cover_pic_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # ¿Qué? Rol del usuario.
    # ¿Para qué? Diferenciar entre artistas, empresas o administradores.
    # ¿Impacto? Controla los permisos y la vista del dashboard inicial.
    role: Mapped[str] = mapped_column(
        String(50),
        default="artista",
        server_default="artista",
        nullable=False,
    )

    # ¿Qué? Hash bcrypt de la contraseña del usuario.
    # ¿Para qué? Almacenar la contraseña de forma segura — el hash es irreversible,
    #            por lo que incluso si la BD es comprometida, las contraseñas no se exponen.
    # ¿Impacto? NUNCA almacenar la contraseña en texto plano aquí.
    #           El hash bcrypt tiene ~60 caracteres, pero usamos 255 por seguridad futura.
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # ¿Qué? Indicador de si la cuenta del usuario está activa.
    # ¿Para qué? Permitir desactivar cuentas sin borrar datos (soft delete).
    #            Un usuario inactivo no puede hacer login ni acceder a la API.
    # ¿Impacto? Default True = los usuarios están activos al registrarse.
    #           Un admin podría desactivar cuentas sospechosas sin perder datos.
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ¿Qué? Fecha y hora de creación del registro.
    # ¿Para qué? Trazabilidad — saber cuándo se registró cada usuario.
    # ¿Impacto? server_default=func.now() hace que PostgreSQL genere la fecha,
    #           no Python, garantizando consistencia incluso si los relojes difieren.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ¿Qué? Fecha y hora de la última actualización del registro.
    # ¿Para qué? Saber cuándo se modificó por última vez (ej: cambio de contraseña).
    # ¿Impacto? server_default + onupdate: se establece al crear y se actualiza
    #           automáticamente en cada UPDATE de SQLAlchemy.
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ════════════════════════════════════════
    # Relaciones ORM
    # ════════════════════════════════════════

    # ¿Qué? Relación uno-a-muchos: un usuario puede tener muchas habilidades.
    # ¿Para qué? Acceder a las habilidades de un usuario con user.habilidades.
    # ¿Impacto? cascade="all, delete-orphan" borra automáticamente las habilidades si se borra el usuario.
    habilidades: Mapped[List["RelUsrHab"]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )

    # ¿Qué? Relación uno-a-muchos: un usuario puede tener muchos portafolios.
    # ¿Para qué? Acceder a los portafolios de un artista con user.portafolios.
    # ¿Impacto? Al borrar un usuario se borran automáticamente todos sus portafolios.
    portafolios: Mapped[List["Portafolio"]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )

    # ¿Qué? Relación uno-a-muchos: un usuario (empresa) puede crear muchas convocatorias.
    # ¿Para qué? Acceder a las convocatorias publicadas por una empresa con user.convocatorias.
    # ¿Impacto? Al borrar la empresa se borran automáticamente todas sus convocatorias.
    convocatorias: Mapped[List["Conv"]] = relationship(
        foreign_keys="Conv.id_usr", back_populates="empresa", cascade="all, delete-orphan"
    )

    # ¿Qué? Relación uno-a-muchos: un artista puede inscribirse a muchas convocatorias.
    # ¿Para qué? Ver a qué convocatorias se ha postulado un artista con user.inscripciones.
    # ¿Impacto? Al borrar el usuario se borran sus postulaciones (historial).
    inscripciones: Mapped[List["Inscripcion"]] = relationship(
        foreign_keys="Inscripcion.id_usr", back_populates="usuario", cascade="all, delete-orphan"
    )

    # ¿Qué? Relación uno-a-muchos: un usuario puede tener muchas evaluaciones.
    # ¿Para qué? Ver las evaluaciones recibidas por un artista en convocatorias.
    # ¿Impacto? Al borrar el usuario se borran sus evaluaciones.
    evaluaciones: Mapped[List["DetConv"]] = relationship(
        foreign_keys="DetConv.id_usr", back_populates="usuario", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """Representación legible del usuario para debugging.

        ¿Qué? Retorna una cadena descriptiva al imprimir el objeto User.
        ¿Para qué? Facilitar el debugging — en lugar de ver <User object at 0x...>,
                   se ve User(id=..., email=...).
        ¿Impacto? NUNCA incluir hashed_password en __repr__ por seguridad.
        """
        return f"User(id={self.id}, email={self.email}, is_active={self.is_active})"
