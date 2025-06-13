#!/usr/bin/env python3
"""
File: init_mongo_collections.py
--------------------------------
DESCRIPTION: Create MongoDB collections for Discord & YouTube harvesting
with JSON Schema validation and indexes, using environment variables.
USAGE: python init_mongo_collections.py
REQUIRES: 'pymongo', 'python-dotenv'
"""

from datetime import timedelta
import os
from pymongo import MongoClient, IndexModel, ASCENDING, DESCENDING
from dotenv import load_dotenv

# ------------------------------------------------------------
#               1) Helpers
# ------------------------------------------------------------
def make_long_schema(description: str = "") -> dict:
    return {"bsonType": "long", "minimum": 1, "description": description}


def make_string_schema(description: str = "", pattern: str = None) -> dict:
    schema = {"bsonType": "string", "description": description}
    if pattern:
        schema["pattern"] = pattern
    return schema


def ttl_in_seconds(days: int) -> int:
    return int(timedelta(days=days).total_seconds())


# ------------------------------------------------------------
#               2) Load env & connect
# ------------------------------------------------------------
# Charger explicitement le fichier .env.dev à la racine du projet
load_dotenv(dotenv_path="/Users/macleo/Desktop/Snowledge-collecte/.env.dev")

MG_HOST     = os.getenv("MG_HOST", "localhost")
MG_PORT     = os.getenv("MG_PORT")
MG_NAME     = os.getenv("MG_NAME")
MG_USER     = os.getenv("MG_USER")
MG_PASSWORD = os.getenv("MG_PASSWORD")

if not all([MG_HOST, MG_PORT, MG_NAME, MG_USER, MG_PASSWORD]):
    raise EnvironmentError("Vérifie que MG_HOST, MG_PORT, MG_NAME, MG_USER et MG_PASSWORD sont définis dans .env.dev")

MONGO_URI = MONGO_URI = f"mongodb://{MG_USER}:{MG_PASSWORD}@{MG_HOST}:{MG_PORT}/{MG_NAME}?authSource=admin"
client    = MongoClient(MONGO_URI)
db        = client[MG_NAME]

print(f"Connected to MongoDB at {MG_HOST}:{MG_PORT}, database '{MG_NAME}'")

# ------------------------------------------------------------
#               3) Collection definitions
# ------------------------------------------------------------
definitions = {
    "discord_servers": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["_id", "user_id", "name"],
                "properties": {
                    "_id": make_long_schema("Discord guild snowflake"),
                    "user_id": make_long_schema("Internal user ID (SQL)"),
                    "name": make_string_schema("Server name")
                }
            }
        },
        "indexes": [IndexModel([("user_id", ASCENDING)], name="idx_user")]
    },
    "discord_channels": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["_id", "server_id", "name"],
                "properties": {
                    "_id": make_long_schema("Channel snowflake"),
                    "server_id": make_long_schema("FK → discord_servers"),
                    "name": make_string_schema("Channel name")
                }
            }
        },
        "indexes": [IndexModel([("server_id", ASCENDING)], name="idx_server")]
    },
    "discord_messages": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["_id", "channel_id", "user_id", "created_at"],
                "properties": {
                    "_id": make_long_schema("Message snowflake"),
                    "channel_id": make_long_schema("FK → discord_channels"),
                    "user_id": make_long_schema("FK → user table"),
                    "parent_message_id": make_long_schema("Parent message snowflake (if reply)"),
                    "content": {"bsonType": ["string", "null"]},
                    "created_at": {"bsonType": "date"},
                    "fetched_at": {"bsonType": "date"}
                }
            }
        },
        "indexes": [
            IndexModel([("channel_id", ASCENDING), ("created_at", DESCENDING)], name="idx_channel_created"),
            IndexModel([("user_id", ASCENDING)], name="idx_user"),
            IndexModel([("parent_message_id", ASCENDING)], name="idx_parent"),
            IndexModel([("fetched_at", DESCENDING)], name="idx_fetched_ttl", expireAfterSeconds=ttl_in_seconds(365))
        ]
    },
    "discord_harvest_jobs": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["discordId", "serverId", "channels", "status", "created_at"],
                "properties": {
                    "discordId": make_string_schema("Discord user ID of the server admin"),
                    "serverId": make_long_schema("Discord server (guild) snowflake"),
                    "channels": {
                        "bsonType": "array",
                        "items": make_long_schema("Channel snowflake"),
                        "description": "List of channel IDs"
                    },
                    "after": make_string_schema("ISO timestamp or snowflake ID for start of period"),
                    "before": make_string_schema("ISO timestamp or snowflake ID for end of period"),
                    "status": make_string_schema("Job status: pending, done, failed, running"),
                    "created_at": {"bsonType": "date", "description": "Job creation date"},
                    "finished_at": {"bsonType": "date", "description": "Job finish date"},
                    "inserted": {"bsonType": "int", "description": "Number of inserted messages"},
                    "error": make_string_schema("Error message if failed")
                }
            }
        },
        "indexes": [
            IndexModel([("status", ASCENDING)], name="idx_status"),
            IndexModel([("created_at", DESCENDING)], name="idx_created"),
            IndexModel([("serverId", ASCENDING)], name="idx_server")
        ]
    },
    "youtube_channels": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["_id", "user_id", "handle"],
                "properties": {
                    "_id": make_string_schema("YouTube channel id"),
                    "user_id": make_long_schema("Internal user ID (SQL)"),
                    "handle": make_string_schema("Handle YouTube", pattern="^@.+")
                }
            }
        },
        "indexes": [IndexModel([("user_id", ASCENDING)], name="idx_user")]
    },
    "youtube_videos": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["_id", "channel_id", "title", "published_at"],
                "properties": {
                    "_id": make_string_schema("Video id"),
                    "channel_id": make_string_schema("FK → youtube_channels"),
                    "title": make_string_schema("Video title"),
                    "published_at": {"bsonType": "date"}
                }
            }
        },
        "indexes": [
            IndexModel([("channel_id", ASCENDING), ("published_at", DESCENDING)], name="idx_channel_published")
        ]
    },
    "youtube_comments": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["_id", "video_id", "user_id", "created_at"],
                "properties": {
                    "_id": make_string_schema("Comment id"),
                    "video_id": make_string_schema("FK → youtube_videos"),
                    "user_id": make_long_schema("Internal user ID (SQL)"),
                    "parent_comment_id": make_string_schema("Parent comment id"),
                    "content": {"bsonType": ["string", "null"]},
                    "created_at": {"bsonType": "date"},
                    "fetched_at": {"bsonType": "date"},
                    "replies": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "object",
                            "required": ["reply_id", "author_user_id", "created_at"],
                            "properties": {
                                "reply_id": make_string_schema("Reply id"),
                                "author_user_id": make_string_schema("User id"),
                                "content": {"bsonType": ["string", "null"]},
                                "created_at": {"bsonType": "date"}
                            }
                        }
                    }
                }
            }
        },
        "indexes": [
            IndexModel([("video_id", ASCENDING), ("created_at", DESCENDING)], name="idx_video_created"),
            IndexModel([("parent_comment_id", ASCENDING)], name="idx_parent"),
            IndexModel([("user_id", ASCENDING)], name="idx_user")
        ]
    },
    "analysis_results": {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["creator_id", "platform", "prompt_key", "result", "created_at"],
                "properties": {
                    "creator_id": make_long_schema("Internal user ID (SQL)"),
                    "platform": make_string_schema("Platform name"),
                    "prompt_key": make_string_schema("Prompt template key"),
                    "llm_model": make_string_schema("LLM model name"),
                    "scope": {"bsonType": "object"},
                    "period": {"bsonType": "object"},
                    "result": {"bsonType": "object"},
                    "created_at": {"bsonType": "date"}
                }
            }
        },
        "indexes": [
            IndexModel([("creator_id", ASCENDING), ("created_at", DESCENDING)], name="idx_creator_date"),
            IndexModel([("scope.channels", ASCENDING)], name="idx_scope_channels", sparse=True)
        ]
    }
}

# ------------------------------------------------------------
#               4) Create / update collections
# ------------------------------------------------------------
for name, cfg in definitions.items():
    if name in db.list_collection_names():
        print(f"• Collection '{name}' already exists → applying validator/index updates")
        db.command("collMod", name, validator=cfg["validator"])
        coll = db[name]
    else:
        print(f"• Creating collection '{name}'")
        coll = db.create_collection(name, validator=cfg["validator"])
    coll.create_indexes(cfg["indexes"])

print("Initialization complete ✅")