import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path
from dotenv import load_dotenv

# ============
# Function: get_project_root
# ------------
# DESCRIPTION: Return the absolute path to the project root.
# PARAMS: None
# RETURNS: Path
# ============
def get_project_root() -> Path:
    return Path(__file__).resolve().parents[2]

# ============
# Function: load_env
# ------------
# DESCRIPTION: Load environment variables from the .env.dev file at project root.
# PARAMS: None
# RETURNS: None
# ============
def load_env():
    root = get_project_root()
    env_file = root / ".env.dev"
    load_dotenv(dotenv_path=env_file)

# ============
# Function: get_env_var
# ------------
# DESCRIPTION: Get an environment variable, loading .env.dev if needed.
# PARAMS:
#   - key: str, variable name
#   - default: any, default value if not set
# RETURNS: str or default
# ============
def get_env_var(key: str, default=None):
    if key not in os.environ:
        load_env()
    return os.getenv(key, default)

# ============
# Function: configure_logging
# ------------
# DESCRIPTION: Set up logging to file and console with rotation.
# PARAMS:
#   - level: int, logging level (default: INFO)
#   - filename: str, name of the log file under LOGS_DIR
# RETURNS: None
# ============
def configure_logging(level: int = logging.INFO, filename: str = "discord_trend.log"):

    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    # rotate at 10 MB, keep 5 backups
    file_handler = RotatingFileHandler(
        filename=filename,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(level)
    root.addHandler(file_handler)
    root.addHandler(console_handler)