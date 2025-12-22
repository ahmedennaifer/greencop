"""add prediction feedback table

Revision ID: d9e1f2a3b4c5
Revises: c8d9e0f1a2b3
Create Date: 2025-01-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd9e1f2a3b4c5'
down_revision = 'c8d9e0f1a2b3'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'prediction_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sensor_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('predicted_temp', sa.Float(), nullable=False),
        sa.Column('predicted_humidity', sa.Float(), nullable=False),
        sa.Column('actual_temp', sa.Float(), nullable=False),
        sa.Column('actual_humidity', sa.Float(), nullable=False),
        sa.Column('anomaly_predicted', sa.Boolean(), nullable=True, default=False),
        sa.Column('feedback', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prediction_feedback_id'), 'prediction_feedback', ['id'], unique=False)
    op.create_index(op.f('ix_prediction_feedback_sensor_id'), 'prediction_feedback', ['sensor_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_prediction_feedback_sensor_id'), table_name='prediction_feedback')
    op.drop_index(op.f('ix_prediction_feedback_id'), table_name='prediction_feedback')
    op.drop_table('prediction_feedback')
