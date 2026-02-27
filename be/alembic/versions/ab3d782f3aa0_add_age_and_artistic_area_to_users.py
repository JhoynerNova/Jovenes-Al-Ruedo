"""add age and artistic_area to users

Revision ID: ab3d782f3aa0
Revises: a7c03fd8169f
Create Date: 2026-02-20 12:01:54.857089

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab3d782f3aa0'
down_revision: Union[str, Sequence[str], None] = 'a7c03fd8169f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Agregar columnas a la tabla users existente
    op.add_column('users', sa.Column('age', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('artistic_area', sa.String(length=100), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remover las columnas agregadas
    op.drop_column('users', 'artistic_area')
    op.drop_column('users', 'age')
