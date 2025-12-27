#!/usr/bin/env python
import sys
sys.path.insert(0, '.')

from alembic.config import Config
from alembic import command

alembic_cfg = Config("customers/alembic.ini")
command.upgrade(alembic_cfg, "head")
print("Migration completed successfully!")
