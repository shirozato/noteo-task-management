"""add new fields and water table

Revision ID: b3e4f5a6b7c8
Revises: a9f1c448cdc8
Create Date: 2026-05-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b3e4f5a6b7c8'
down_revision: Union[str, Sequence[str], None] = 'a9f1c448cdc8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users — add avatar, avatar_color, water_goal, water_unit
    op.add_column('users', sa.Column('avatar', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('avatar_color', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('water_goal', sa.Integer(), nullable=False, server_default='2000'))
    op.add_column('users', sa.Column('water_unit', sa.String(length=10), nullable=False, server_default='ml'))

    # tasks — add tags, archived_at, done_at
    op.add_column('tasks', sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'))
    op.add_column('tasks', sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('done_at', sa.DateTime(timezone=True), nullable=True))

    # habits — add color, freq, days, size, wide, archived_at
    op.add_column('habits', sa.Column('color', sa.String(length=20), nullable=False, server_default='default'))
    op.add_column('habits', sa.Column('freq', sa.String(length=20), nullable=False, server_default='daily'))
    op.add_column('habits', sa.Column('days', sa.String(length=7), nullable=False, server_default='1111111'))
    op.add_column('habits', sa.Column('size', sa.String(length=1), nullable=False, server_default='m'))
    op.add_column('habits', sa.Column('wide', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('habits', sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True))

    # water_entries table
    op.create_table(
        'water_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uid', sa.UUID(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('logged_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_water_entries_id'), 'water_entries', ['id'], unique=False)
    op.create_index(op.f('ix_water_entries_uid'), 'water_entries', ['uid'], unique=True)
    op.create_index(op.f('ix_water_entries_date'), 'water_entries', ['date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_water_entries_date'), table_name='water_entries')
    op.drop_index(op.f('ix_water_entries_uid'), table_name='water_entries')
    op.drop_index(op.f('ix_water_entries_id'), table_name='water_entries')
    op.drop_table('water_entries')

    op.drop_column('habits', 'archived_at')
    op.drop_column('habits', 'wide')
    op.drop_column('habits', 'size')
    op.drop_column('habits', 'days')
    op.drop_column('habits', 'freq')
    op.drop_column('habits', 'color')

    op.drop_column('tasks', 'done_at')
    op.drop_column('tasks', 'archived_at')
    op.drop_column('tasks', 'tags')

    op.drop_column('users', 'water_unit')
    op.drop_column('users', 'water_goal')
    op.drop_column('users', 'avatar_color')
    op.drop_column('users', 'avatar')
