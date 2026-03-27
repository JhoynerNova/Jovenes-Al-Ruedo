"""add bio and location to users

Revision ID: f1a2b3c4d5e6
Revises: 9c610dcaeb9c
Create Date: 2026-03-26 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = '0e275399726b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'location')
    op.drop_column('users', 'bio')
