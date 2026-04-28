"""add_full_name_to_users

Revision ID: 50e96a9ed85b
Revises: 438d5b7ea652
Create Date: 2026-04-27 12:16:06.820768

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50e96a9ed85b'
down_revision: Union[str, None] = '438d5b7ea652'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'full_name')
