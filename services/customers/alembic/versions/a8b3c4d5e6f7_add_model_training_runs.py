"""add model training runs

Revision ID: a8b3c4d5e6f7
Revises: f6452ce6dc34, b3e4f5a6c7d8
Create Date: 2025-12-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'a8b3c4d5e6f7'
down_revision = ('f6452ce6dc34', 'b3e4f5a6c7d8')
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('model_training_runs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('model_type', sa.String(), nullable=False),
    sa.Column('training_data_count', sa.Integer(), nullable=True),
    sa.Column('validated_data_count', sa.Integer(), nullable=True),
    sa.Column('metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('model_version', sa.String(), nullable=True),
    sa.Column('triggered_by', sa.String(), nullable=False),
    sa.Column('error_message', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_model_training_runs_id'), 'model_training_runs', ['id'], unique=False)

    op.add_column('prediction_feedback', sa.Column('used_in_training', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('prediction_feedback', sa.Column('training_run_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'prediction_feedback', 'model_training_runs', ['training_run_id'], ['id'])


def downgrade():
    op.drop_constraint(None, 'prediction_feedback', type_='foreignkey')
    op.drop_column('prediction_feedback', 'training_run_id')
    op.drop_column('prediction_feedback', 'used_in_training')
    op.drop_index(op.f('ix_model_training_runs_id'), table_name='model_training_runs')
    op.drop_table('model_training_runs')
