"""Add alert feedback

Revision ID: c8d9e0f1a2b3
Revises: b3e4f5a6c7d8
Create Date: 2025-12-20

"""
from alembic import op
import sqlalchemy as sa

revision = 'c8d9e0f1a2b3'
down_revision = 'b3e4f5a6c7d8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('alerts', sa.Column('feedback', sa.String(length=20), nullable=True))
    op.create_index(op.f('ix_alerts_feedback'), 'alerts', ['feedback'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_alerts_feedback'), table_name='alerts')
    op.drop_column('alerts', 'feedback')
