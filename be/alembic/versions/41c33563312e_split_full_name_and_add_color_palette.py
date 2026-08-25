"""split full_name and add color_palette

Revision ID: 41c33563312e
Revises: ecc79ba49269
Create Date: 2026-06-23 00:53:03.567303

"""
from typing import Sequence, Union



# revision identifiers, used by Alembic.
revision: str = '41c33563312e'
down_revision: Union[str, Sequence[str], None] = 'ecc79ba49269'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from alembic import op
    import sqlalchemy as sa
    
    # 1. Agregar las nuevas columnas temporalmente permitiendo nulos
    op.add_column('users', sa.Column('first_name', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('color_palette', sa.String(length=50), nullable=True))
    
    # 2. Migrar los datos existentes: separar el full_name por el primer espacio y pasarlo a mayúsculas (como solicitó el usuario)
    op.execute("""
        UPDATE users 
        SET 
            first_name = UPPER(split_part(full_name, ' ', 1)),
            last_name = CASE 
                WHEN position(' ' in full_name) > 0 THEN UPPER(substring(full_name from position(' ' in full_name) + 1))
                ELSE ''
            END
    """)
    
    # 3. Hacer que las columnas sean obligatorias (NOT NULL)
    op.alter_column('users', 'first_name', nullable=False)
    op.alter_column('users', 'last_name', nullable=False)
    
    # 4. Eliminar la columna vieja
    op.drop_column('users', 'full_name')


def downgrade() -> None:
    from alembic import op
    import sqlalchemy as sa
    
    # 1. Volver a crear full_name
    op.add_column('users', sa.Column('full_name', sa.String(length=255), nullable=True))
    
    # 2. Juntar los nombres
    op.execute("""
        UPDATE users 
        SET full_name = first_name || ' ' || last_name
    """)
    
    op.alter_column('users', 'full_name', nullable=False)
    
    # 3. Eliminar las nuevas columnas
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')
    op.drop_column('users', 'color_palette')
