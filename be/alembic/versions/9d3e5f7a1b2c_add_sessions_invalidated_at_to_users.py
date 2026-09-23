"""add sessions_invalidated_at to users

Revision ID: 9d3e5f7a1b2c
Revises: 7b1f9a2c3d4e
Create Date: 2026-08-28 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9d3e5f7a1b2c'
down_revision: Union[str, Sequence[str], None] = '7b1f9a2c3d4e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('sessions_invalidated_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'sessions_invalidated_at')
