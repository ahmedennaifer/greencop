"""update alerts table schema

Revision ID: f6452ce6dc34
Revises: d9e1f2a3b4c5
Create Date: 2025-12-27 10:56:58.698541

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6452ce6dc34'
down_revision: Union[str, Sequence[str], None] = 'd9e1f2a3b4c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint('alerts_sensor_id_fkey', 'alerts', type_='foreignkey')

    op.alter_column('alerts', 'sensor_id',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False,
                    postgresql_using='sensor_id::varchar')

    op.alter_column('alerts', 'alert_type',
                    existing_type=sa.String(20),
                    type_=sa.String(50),
                    existing_nullable=False)

    op.add_column('alerts', sa.Column('message', sa.String(), nullable=True))

    op.execute("UPDATE alerts SET message = CONCAT(alert_type, ': ', value, ' exceeds threshold ', threshold)")

    op.alter_column('alerts', 'message', nullable=False)

    op.drop_column('alerts', 'value')
    op.drop_column('alerts', 'threshold')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('alerts', sa.Column('threshold', sa.Float(), nullable=True))
    op.add_column('alerts', sa.Column('value', sa.Float(), nullable=True))

    op.drop_column('alerts', 'message')

    op.alter_column('alerts', 'alert_type',
                    existing_type=sa.String(50),
                    type_=sa.String(20),
                    existing_nullable=False)

    op.alter_column('alerts', 'sensor_id',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False)
