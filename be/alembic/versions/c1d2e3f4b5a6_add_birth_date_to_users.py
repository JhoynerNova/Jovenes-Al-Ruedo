"""add birth_date to users

Revision ID: c1d2e3f4b5a6
Revises: ab3d782f3aa0
Create Date: 2026-02-27 00:00:00.000000

"""
from typing import Union, Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4b5a6'
down_revision: Union[str, Sequence[str], None] = 'ab3d782f3aa0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add birth_date, backfill from age, then drop age."""
    # 1) Add new nullable column birth_date
    op.add_column('users', sa.Column('birth_date', sa.Date(), nullable=True))

    # 2) Backfill birth_date from existing age values (approximate)
    #    Use CURRENT_DATE - (age * interval '1 year') to approximate birth_date
    op.execute(
        """
        UPDATE users
        SET birth_date = (CURRENT_DATE - (age * INTERVAL '1 year'))::date
        WHERE age IS NOT NULL
        """
    )

    # 3) Make birth_date NOT NULL if backfill succeeded (guarded)
    op.alter_column('users', 'birth_date', nullable=False)

    # 4) Drop the old age column
    op.drop_column('users', 'age')


def downgrade() -> None:
    """Downgrade: add age back (nullable), try to backfill from birth_date, then drop birth_date."""
    op.add_column('users', sa.Column('age', sa.Integer(), nullable=True))
    op.execute(
        """
        UPDATE users
        SET age = FLOOR(EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)))::int
        WHERE birth_date IS NOT NULL
        """
    )
    op.alter_column('users', 'age', nullable=False)
    op.drop_column('users', 'birth_date')
