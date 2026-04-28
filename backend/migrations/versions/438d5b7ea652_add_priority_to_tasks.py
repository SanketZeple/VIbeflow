"""Add priority to tasks

Revision ID: 438d5b7ea652
Revises: ddb4ddbdcab7
Create Date: 2026-04-27 11:32:54.576522

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '438d5b7ea652'
down_revision: Union[str, None] = 'ddb4ddbdcab7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('priority', sa.String(length=50), nullable=False, server_default='Medium'))


def downgrade() -> None:
    op.drop_column('tasks', 'priority')

