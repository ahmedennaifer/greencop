"""add notification tables

Revision ID: g7563df7ed45
Revises: f6452ce6dc34
Create Date: 2025-12-30 12:00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'g7563df7ed45'
down_revision = 'f6452ce6dc34'
branch_labels = None
depends_on = None


def upgrade():
    # Create notification_settings table
    op.create_table(
        'notification_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('webhook_url', sa.String(500), nullable=True),
        sa.Column('email_enabled', sa.Boolean(), server_default='true'),
        sa.Column('webhook_enabled', sa.Boolean(), server_default='false'),
        sa.Column('notify_training_start', sa.Boolean(), server_default='false'),
        sa.Column('notify_training_complete', sa.Boolean(), server_default='true'),
        sa.Column('notify_anomaly', sa.Boolean(), server_default='true'),
        sa.Column('notify_alert_surge', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['customers.id'], ondelete='CASCADE')
    )

    # Create notification_history table
    op.create_table(
        'notification_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('event_type', sa.String(50), nullable=True),
        sa.Column('channel', sa.String(20), nullable=True),
        sa.Column('status', sa.String(20), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('sent_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('notification_history')
    op.drop_table('notification_settings')
