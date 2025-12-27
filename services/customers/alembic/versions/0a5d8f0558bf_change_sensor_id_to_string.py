"""change sensor id to string

Revision ID: 0a5d8f0558bf
Revises: f6452ce6dc34
Create Date: 2025-12-27 11:21:23.934214

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0a5d8f0558bf'
down_revision: Union[str, Sequence[str], None] = 'f6452ce6dc34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('sensors', 'id',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False,
                    postgresql_using='id::varchar')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('sensors', 'id',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False,
                    postgresql_using='id::integer')
