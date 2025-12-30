#!/usr/bin/env python
import sys
import os
sys.path.insert(0, '.')

from alembic.config import Config
from alembic import command

alembic_ini_path = "customers/alembic.ini" if os.path.exists("customers/alembic.ini") else "alembic.ini"
alembic_cfg = Config(alembic_ini_path)
command.upgrade(alembic_cfg, "heads")
print("Migration completed successfully!")
