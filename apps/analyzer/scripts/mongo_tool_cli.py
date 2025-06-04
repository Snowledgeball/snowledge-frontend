"""
Tool: MongoTool
------------
DESCRIPTION:
Simple interface for CRUD operations on MongoDB collections:
    - discord_servers, discord_channels, discord_messages
    - youtube_channels, youtube_videos, youtube_comments
"""

import os
import sys
from typing import List, Dict, Any, Optional
from pymongo import MongoClient

# ============
# Add project root to PYTHONPATH for robust absolute imports
# ============
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config.config import load_env, get_env_var

# ============
# Class: MongoTool
# ------------
# DESCRIPTION:
#   Provides methods to list, add, and delete documents in MongoDB collections.
# PARAMS: None
# RETURNS: None
# ============
class MongoTool:
    def __init__(self, dotenv_path: Optional[str] = None) -> None:
        """
        ============
        Function: __init__
        ------------
        DESCRIPTION: Initialize MongoDB connection using environment variables.
        PARAMS:
        - dotenv_path (str|None): Path to .env file (default: None)
        RETURNS: None
        ============
        """
        load_env()
        self.client = MongoClient(
            f"mongodb://{get_env_var('MG_USER')}:{get_env_var('MG_PASSWORD')}@{get_env_var('MG_HOST')}:{get_env_var('MG_PORT')}/{get_env_var('MG_NAME')}?authSource=admin"
        )
        self.db = self.client[get_env_var('MG_NAME')]

    # ============
    # Function: list_discord_servers
    # ------------
    # DESCRIPTION: List all Discord servers.
    # PARAMS: None
    # RETURNS: List[Dict]
    # ============
    def list_discord_servers(self) -> List[Dict[str, Any]]:
        return list(self.db.discord_servers.find({}))

    # ============
    # Function: add_discord_server
    # ------------
    # DESCRIPTION: Add a new Discord server.
    # PARAMS: server (dict)
    # RETURNS: Inserted ID
    # ============
    def add_discord_server(self, server: Dict[str, Any]) -> Any:
        return self.db.discord_servers.insert_one(server).inserted_id

    # ============
    # Function: delete_discord_server
    # ------------
    # DESCRIPTION: Delete a Discord server by _id.
    # PARAMS: server_id (int)
    # RETURNS: Delete result
    # ============
    def delete_discord_server(self, server_id: int) -> Any:
        return self.db.discord_servers.delete_one({'_id': server_id})

    # ============
    # Function: list_discord_channels
    # ------------
    # DESCRIPTION: List all Discord channels.
    # PARAMS: None
    # RETURNS: List[Dict]
    # ============
    def list_discord_channels(self) -> List[Dict[str, Any]]:
        return list(self.db.discord_channels.find({}))

    # Add other methods for other collections...

# ============
# Function: list_collections
# ------------
# DESCRIPTION: List all collection names in the database.
# PARAMS: mongo_tool (MongoTool)
# RETURNS: List[str]
# ============
def list_collections(mongo_tool: MongoTool) -> list:
    return mongo_tool.db.list_collection_names()

# ============
# Function: list_documents_in_collection
# ------------
# DESCRIPTION: List documents in a given collection, with optional limit and skip for pagination.
# PARAMS:
#   - mongo_tool (MongoTool): MongoTool instance
#   - collection_name (str): Name of the collection
#   - skip (int): Number of documents to skip (default: 0)
#   - limit (int): Max number of documents to return (default: 10)
# RETURNS: List[Dict]
# ============
def list_documents_in_collection(mongo_tool: MongoTool, collection_name: str, skip: int = 0, limit: int = 10) -> list:
    return list(mongo_tool.db[collection_name].find().skip(skip).limit(limit))

# ============
# Function: main_menu
# ------------
# DESCRIPTION: Affiche le menu principal et gère la navigation utilisateur.
# PARAMS: mongo_tool (MongoTool)
# RETURNS: None
# ============
def main_menu(mongo_tool: MongoTool) -> None:
    import pprint
    while True:
        print("\n=== MongoTool CLI Menu ===")
        print("1. List all collections")
        print("2. Explore a collection")
        print("3. Quit")
        choice = input("Select an option: ").strip()
        if choice == "1":
            collections = list_collections(mongo_tool)
            print("\nCollections:")
            for col in collections:
                print(f"- {col}")
        elif choice == "2":
            collections = list_collections(mongo_tool)
            print("\nAvailable collections:")
            for idx, col in enumerate(collections):
                print(f"{idx+1}. {col}")
            col_choice = input("Select collection number: ").strip()
            if not col_choice.isdigit() or int(col_choice) < 1 or int(col_choice) > len(collections):
                print("Invalid selection.")
                continue
            selected_col = collections[int(col_choice)-1]
            explore_collection(mongo_tool, selected_col)
        elif choice == "3":
            print("Exiting. Closing MongoDB connection...")
            mongo_tool.client.close()
            break
        else:
            print("Invalid option. Please try again.")

# ============
# Function: explore_collection
# ------------
# DESCRIPTION: Permet de naviguer dans les documents d'une collection (pagination simple).
# PARAMS:
#   - mongo_tool (MongoTool)
#   - collection_name (str)
# RETURNS: None
# ============
def explore_collection(mongo_tool: MongoTool, collection_name: str) -> None:
    import pprint
    skip = 0
    limit = 5
    while True:
        docs = list_documents_in_collection(mongo_tool, collection_name, skip=skip, limit=limit)
        print(f"\nDocuments in '{collection_name}' (showing {skip+1} to {skip+len(docs)}):")
        for idx, doc in enumerate(docs, start=skip+1):
            print(f"\n--- Document {idx} ---")
            pprint.pprint(doc)
        print("\nOptions: [N]ext page, [P]revious page, [B]ack to menu")
        nav = input("Choice: ").strip().lower()
        if nav == "n":
            skip += limit
        elif nav == "p":
            skip = max(0, skip - limit)
        elif nav == "b":
            break
        else:
            print("Invalid input.")

# ============
# CLI principal avec menu interactif
# ============
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="MongoTool CLI")
    parser.add_argument("--dotenv", type=str, default=None, help="Chemin du fichier .env à charger")
    args = parser.parse_args()

    tool = MongoTool(dotenv_path=args.dotenv)
    try:
        main_menu(tool)
    except KeyboardInterrupt:
        print("\nInterruption. Fermeture de la connexion MongoDB...")
        tool.client.close()