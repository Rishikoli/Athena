"""add_ivfflat_index

Revision ID: 79e3bf612534
Revises: f8d19ee46639
Create Date: 2026-04-08 08:45:24.157185

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79e3bf612534'
down_revision: Union[str, Sequence[str], None] = 'f8d19ee46639'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        "CREATE INDEX ON workflow_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        "DROP INDEX IF EXISTS workflow_memory_embedding_idx;"
    )
