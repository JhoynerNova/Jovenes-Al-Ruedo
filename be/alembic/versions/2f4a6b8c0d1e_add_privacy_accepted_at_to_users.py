"""add privacy_accepted_at to users

Revision ID: 2f4a6b8c0d1e
Revises: 9d3e5f7a1b2c
Create Date: 2026-08-28 00:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2f4a6b8c0d1e'
down_revision: Union[str, Sequence[str], None] = '9d3e5f7a1b2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('privacy_accepted_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'privacy_accepted_at')
