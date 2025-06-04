"""
Module: mongo_storage.py
------------------------
DESCRIPTION: Centralizes all MongoDB read/write logic for Discord, YouTube, and other platforms. This module is intended to be imported and used by orchestrators (CLI, API, etc.) and should not be run directly. Do not add sys.path manipulations here; handle PYTHONPATH in entry scripts only.
"""

from typing import List, Dict, Any, Optional
from config.config import load_env, get_env_var
from pymongo import MongoClient

class MongoStorage:
    """
    ============
    Class: MongoStorage
    ------------
    DESCRIPTION: Handles storage and retrieval of all collections in MongoDB for Discord, YouTube, and other platforms.
    PARAMS: None (connection info loaded from env)
    RETURNS: None
    ============
    """

    def __init__(self):
        """
        ============
        Function: __init__
        ------------
        DESCRIPTION: Initialize MongoDB connection using environment variables.
        PARAMS: None
        RETURNS: None
        ============
        """
        load_env()
        self.client = MongoClient(
            f"mongodb://{get_env_var('MG_USER')}:{get_env_var('MG_PASSWORD')}@{get_env_var('MG_HOST')}:{get_env_var('MG_PORT')}/{get_env_var('MG_NAME')}?authSource=admin"
        )
        self.db = self.client[get_env_var('MG_NAME')]

    # ===== Discord =====
    def get_discord_servers(self) -> List[Dict[str, Any]]:
        return list(self.db.discord_servers.find({}))

    def add_discord_server(self, server: Dict[str, Any]) -> Any:
        return self.db.discord_servers.insert_one(server).inserted_id

    def delete_discord_server(self, server_id: int) -> Any:
        return self.db.discord_servers.delete_one({'_id': server_id})

    def get_discord_channels(self, server_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = {'server_id': server_id} if server_id else {}
        return list(self.db.discord_channels.find(query))

    def add_discord_channel(self, channel: Dict[str, Any]) -> Any:
        return self.db.discord_channels.insert_one(channel).inserted_id

    def delete_discord_channel(self, channel_id: int) -> Any:
        return self.db.discord_channels.delete_one({'_id': channel_id})

    def save_discord_messages(self, messages: List[dict]) -> None:
        """
        ============
        Function: save_discord_messages
        ------------
        DESCRIPTION: Insert a list of Discord messages into the database, adapting field names and types to match the MongoDB schema.
        PARAMS: messages (List[dict]) - List of Discord message dicts to insert.
        RETURNS: None
        ============
        """
        cleaned = []
        for msg in messages:
            # Ensure '_id' is the Discord message snowflake (int)
            if 'id' in msg:
                msg['_id'] = msg.pop('id')
            # Rename 'author_user_id' to 'user_id' if present
            if 'author_user_id' in msg:
                msg['user_id'] = msg.pop('author_user_id')
            # Remove 'parent_message_id' if None (Mongo expects long or not present)
            if msg.get('parent_message_id') is None:
                msg.pop('parent_message_id', None)
            # Remove any field with value None that is not allowed by schema
            # (add more fields here if needed)
            cleaned.append(msg)
        if cleaned:
            self.db.discord_messages.insert_many(cleaned)

    def get_discord_messages(self, filters: Optional[dict] = None) -> List[dict]:
        return list(self.db.discord_messages.find(filters or {}))

    def add_harvest_job(self, job: dict) -> Any:
        """
        ============
        Function: add_harvest_job
        ------------
        DESCRIPTION: Insert a new Discord harvest job in the database.
        PARAMS: job (dict) - Job parameters and metadata.
        RETURNS: Inserted job ID
        ============
        """
        return self.db.discord_harvest_jobs.insert_one(job).inserted_id

    def get_next_pending_job(self) -> Optional[dict]:
        """
        ============
        Function: get_next_pending_job
        ------------
        DESCRIPTION: Fetch and mark as 'running' the next pending Discord harvest job (FIFO order).
        PARAMS: None
        RETURNS: The job document or None if no pending job.
        ============
        """
        job = self.db.discord_harvest_jobs.find_one_and_update(
            {"status": "pending"},
            {"$set": {"status": "running"}},
            sort=[("created_at", 1)]
        )
        return job

    def update_job_status(self, job_id, status, **kwargs):
        """
        ============
        Function: update_job_status
        ------------
        DESCRIPTION: Update the status and additional fields of a Discord harvest job.
        PARAMS:
        - job_id: The ObjectId of the job
        - status: New status string
        - kwargs: Additional fields to update
        RETURNS: None
        ============
        """
        update = {"status": status}
        update.update(kwargs)
        self.db.discord_harvest_jobs.update_one({"_id": job_id}, {"$set": update})

    # ===== YouTube =====
    def get_youtube_accounts(self) -> List[Dict[str, Any]]:
        return list(self.db.youtube_accounts.find({}))

    def add_youtube_account(self, account: Dict[str, Any]) -> Any:
        return self.db.youtube_accounts.insert_one(account).inserted_id

    def get_youtube_videos(self, account_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = {'account_id': account_id} if account_id else {}
        return list(self.db.youtube_videos.find(query))

    def add_youtube_video(self, video: Dict[str, Any]) -> Any:
        return self.db.youtube_videos.insert_one(video).inserted_id

    def save_youtube_comments(self, comments: List[dict]) -> None:
        if comments:
            self.db.youtube_comments.insert_many(comments)

    def get_youtube_comments(self, filters: Optional[dict] = None) -> List[dict]:
        return list(self.db.youtube_comments.find(filters or {}))

    # ===== Generic CRUD for any collection =====
    def list_collections(self) -> List[str]:
        return self.db.list_collection_names()

    def list_documents_in_collection(self, collection_name: str, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        return list(self.db[collection_name].find().skip(skip).limit(limit))