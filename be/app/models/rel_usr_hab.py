"""
Módulo: models/rel_usr_hab.py
Descripción: Relación muchos a muchos entre usuarios y habilidades.
"""
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RelUsrHab(Base):
    __tablename__ = "rel_usr_hab"
    __table_args__ = (
        UniqueConstraint("id_usr", "id_hab", name="uq_usr_hab"),
    )

    id_rel: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_usr: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    id_hab: Mapped[int] = mapped_column(ForeignKey("habilidades.id_hab", ondelete="CASCADE"), nullable=False)

    habilidad: Mapped["Habilidad"] = relationship(back_populates="usuarios")

    def __repr__(self) -> str:
        return f"RelUsrHab(usr={self.id_usr}, hab={self.id_hab})"