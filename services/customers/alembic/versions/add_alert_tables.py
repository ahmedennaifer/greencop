"""Add alert tables

Revision ID: b3e4f5a6c7d8
Revises: a2230ed9b9a8
Create Date: 2025-12-10

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b3e4f5a6c7d8'
down_revision = 'a2230ed9b9a8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sensor_id', sa.Integer(), nullable=False),
        sa.Column('alert_type', sa.String(length=20), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('threshold', sa.Float(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('acknowledged', sa.Boolean(), nullable=True, server_default='false'),
        sa.ForeignKeyConstraint(['sensor_id'], ['sensors.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_sensor_id'), 'alerts', ['sensor_id'], unique=False)
    op.create_index(op.f('ix_alerts_acknowledged'), 'alerts', ['acknowledged'], unique=False)

    # Create alert_thresholds table
    op.create_table(
        'alert_thresholds',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('max_temperature', sa.Float(), nullable=True, server_default='50.0'),
        sa.Column('max_humidity', sa.Float(), nullable=True, server_default='50.0'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alert_thresholds_customer_id'), 'alert_thresholds', ['customer_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_alert_thresholds_customer_id'), table_name='alert_thresholds')
    op.drop_table('alert_thresholds')
    op.drop_index(op.f('ix_alerts_acknowledged'), table_name='alerts')
    op.drop_index(op.f('ix_alerts_sensor_id'), table_name='alerts')
    op.drop_table('alerts')
