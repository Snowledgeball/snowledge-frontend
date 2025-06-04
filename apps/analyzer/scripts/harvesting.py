import os
import asyncio
from typing import List
from datetime import datetime
from dotenv import load_dotenv
from bson.int64 import Int64

from discord_tools.discord_fetcher import DiscordFetcher
from db_tools.mongo_tool import MongoTool

# ============
# Function: load_token_from_env
# ------------
# DESCRIPTION: Load the Discord bot token from the .env.dev file at the project root.
# PARAMS: None
# RETURNS: str (token)
# ============
def load_token_from_env() -> str:
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env.dev'))
    load_dotenv(env_path)
    token = os.getenv('DISCORD_BOT_TOKEN')
    if not token:
        raise RuntimeError('DISCORD_BOT_TOKEN not found in .env.dev')
    return token

# ============
# Function: ensure_server_in_db
# ------------
# DESCRIPTION: Check and insert the Discord server in the collection if absent.
# PARAMS:
#   - mongo (MongoTool): MongoTool instance
#   - guild_id (int): Server ID
#   - guild_name (str): Server name
# RETURNS: None
# ============
def ensure_server_in_db(mongo: MongoTool, guild_id: int, guild_name: str) -> None:
    if not mongo.db.discord_servers.find_one({'_id': guild_id}):
        mongo.db.discord_servers.insert_one({'_id': guild_id, 'user_id': Int64(42), 'name': guild_name})

# ============
# Function: ensure_channel_in_db
# ------------
# DESCRIPTION: Check and insert the Discord channel in the collection if absent.
# PARAMS:
#   - mongo (MongoTool): MongoTool instance
#   - channel_id (int): Channel ID
#   - channel_name (str): Channel name
#   - guild_id (int): Parent server ID
# RETURNS: None
# ============
def ensure_channel_in_db(mongo: MongoTool, channel_id: int, channel_name: str, guild_id: int) -> None:
    if not mongo.db.discord_channels.find_one({'_id': channel_id}):
        mongo.db.discord_channels.insert_one({'_id': channel_id, 'name': channel_name, 'server_id': guild_id})

# ============
# Function: get_last_message_id
# ------------
# DESCRIPTION: Retrieve the last stored message ID for a given channel.
# PARAMS:
#   - mongo (MongoTool): MongoTool instance
#   - channel_id (int): Channel ID
# RETURNS: int | None
# ============
def get_last_message_id(mongo: MongoTool, channel_id: int):
    doc = mongo.db.discord_messages.find_one({'channel_id': channel_id}, sort=[('_id', -1)])
    return doc['_id'] if doc else None

# ============
# Function: insert_new_messages
# ------------
# DESCRIPTION: Insert new messages into the discord_messages collection.
# PARAMS:
#   - mongo (MongoTool): MongoTool instance
#   - messages (List[dict]): List of messages to insert
# RETURNS: None
# ============
def insert_new_messages(mongo: MongoTool, messages: List[dict]) -> None:
    docs = []
    for m in messages:
        doc = {
            '_id': Int64(m['id']),
            'channel_id': Int64(m['channel_id']),
            'user_id': Int64(m['author_user_id']),
            'author_name': m['author_name'],
            'content': m['content'],
            'created_at': m['created_at'],
            'fetched_at': m['fetched_at'],
        }
        if m.get('parent_message_id') is not None:
            doc['parent_message_id'] = Int64(m['parent_message_id'])
        docs.append(doc)
    if docs:
        mongo.db.discord_messages.insert_many(docs)

# ============
# Function: list_guild_channels
# ------------
# DESCRIPTION: Return the list of accessible text channels for a given server.
# PARAMS:
#   - token (str): Discord bot token
#   - guild_id (int): Server ID
# RETURNS: List[dict] (id, name)
# ============
async def list_guild_channels(token: str, guild_id: int) -> List[dict]:
    fetcher = DiscordFetcher(token=token)
    await fetcher.connect()
    try:
        guilds = await fetcher.list_guilds()
        if guild_id not in guilds:
            print(f"Guild {guild_id} not accessible by the bot.")
            return []
        return await fetcher.list_channels(guild_id)
    finally:
        await fetcher.close()

# ============
# Function: main
# ------------
# DESCRIPTION: Main entry point of the script. Collects new messages for a given server and list of channels, with optional time filtering.
# PARAMS: None (uses argparse)
# RETURNS: None
# ============
async def main():
    import argparse
    parser = argparse.ArgumentParser(description="Discord harvesting script")
    parser.add_argument('--list-channels', action='store_true', help='List text channels of the server')
    parser.add_argument('--guild', type=int, required=True, help='Guild (server) ID')
    parser.add_argument('--channels', type=int, nargs='+', help='List of channel IDs to fetch')
    parser.add_argument('--after', type=str, help='ISO timestamp (UTC) or snowflake ID for start of period')
    parser.add_argument('--before', type=str, help='ISO timestamp (UTC) or snowflake ID for end of period')
    parser.add_argument('--dotenv', type=str, default=None, help='Path to .env file for MongoDB')
    args = parser.parse_args()

    token = load_token_from_env()

    if args.list_channels:
        channels = await list_guild_channels(token, args.guild)
        print(f"Channels for guild {args.guild}:")
        for c in channels:
            print(f"{c['id']}: {c['name']}")
        return

    if not args.channels:
        print("You must specify at least one channel with --channels or use --list-channels.")
        return

    mongo = MongoTool(dotenv_path=args.dotenv)
    fetcher = DiscordFetcher(token=token)
    await fetcher.connect()
    try:
        guilds = await fetcher.list_guilds()
        if args.guild not in guilds:
            print(f"Guild {args.guild} not accessible by the bot.")
            return
        ensure_server_in_db(mongo, args.guild, guilds[args.guild])
        channels = await fetcher.list_channels(args.guild)
        channel_map = {int(c['id']): c['name'] for c in channels}
        for channel_id in args.channels:
            if channel_id not in channel_map:
                print(f"Channel {channel_id} not accessible in guild {args.guild}.")
                continue
            ensure_channel_in_db(mongo, channel_id, channel_map[channel_id], args.guild)
            after_id = int(args.after) if args.after and args.after.isdigit() else get_last_message_id(mongo, channel_id)
            new_messages = await fetcher.fetch_messages(args.guild, channel_id, after_id=after_id)
            if args.after and not (args.after.isdigit()):
                try:
                    after_dt = datetime.fromisoformat(args.after)
                    new_messages = [m for m in new_messages if m['created_at'] >= after_dt]
                except Exception:
                    pass
            if args.before:
                try:
                    before_dt = datetime.fromisoformat(args.before)
                    new_messages = [m for m in new_messages if m['created_at'] <= before_dt]
                except Exception:
                    pass
            insert_new_messages(mongo, new_messages)
            print(f"Channel {channel_id}: {len(new_messages)} new messages inserted.")
    finally:
        await fetcher.close()

if __name__ == "__main__":
    asyncio.run(main())
