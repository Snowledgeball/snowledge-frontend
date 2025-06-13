"""
Tool: DiscordFetcher
------------
DESCRIPTION:
- Provides a reusable, stateful interface for interacting with Discord.
- Maintains a persistent connection to the Discord gateway.
- Lists all connected guilds (servers) and their readable text channels.
- Fetches the entire message history from a specified channel.
- Aggregates message content, attachments, and embeds.
- Logs each major step for traceability and debugging.
"""

import asyncio
from typing import List, Dict, Any
from datetime import datetime
import sys
import os

# ============
# Add project root to PYTHONPATH for robust absolute imports
# ============
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import nextcord
from nextcord import Intents

from config.config import load_env, get_env_var

# ============
# Class: DiscordFetcher
# ------------
# DESCRIPTION:
#   Maintains a persistent Discord client connection and
#   provides methods to list guilds, channels, and fetch all messages.
# PARAMS: None
# RETURNS: None
# ============
class DiscordFetcher:
    def __init__(self, token: str):
        """
        ============
        Function: __init__
        ------------
        DESCRIPTION: Constructor for DiscordFetcher. Initializes the Discord client with the provided token and sets up the on_ready event to signal when the client is connected.
        PARAMS:
        - token (str): Discord Bot Token for authentication.
        RETURNS: None
        ============
        """
        self.token = token
        self.client = nextcord.Client(intents=self._create_intents())
        self._ready = asyncio.Event()

        @self.client.event
        async def on_ready():
            self._ready.set()

    def _create_intents(self) -> Intents:
        """
        ============
        Function: _create_intents
        ------------
        DESCRIPTION: Create and return the Discord Intents required for the bot to access guild and message content information.
        PARAMS: None
        RETURNS: Intents instance with guilds and message_content enabled.
        ============
        """
        intents = Intents.default()
        intents.guilds = True
        intents.message_content = True
        return intents

    async def connect(self) -> None:
        """
        ============
        Function: connect
        ------------
        DESCRIPTION: Starts the Discord client asynchronously and waits until the client is ready (on_ready event triggered).
        PARAMS: None
        RETURNS: None
        ============
        """
        loop = asyncio.get_event_loop()
        loop.create_task(self.client.start(self.token))
        await self._ready.wait()

    async def close(self) -> None:
        """
        ============
        Function: close
        ------------
        DESCRIPTION: Closes the Discord client connection gracefully.
        PARAMS: None
        RETURNS: None
        ============
        """
        await self.client.close()

    async def list_guilds(self) -> Dict[int, str]:
        """
        ============
        Function: list_guilds
        ------------
        DESCRIPTION: Returns a dictionary mapping each guild's ID to its name for all guilds the bot is connected to.
        PARAMS: None
        RETURNS: Dict[int, str] - Mapping of guild_id to guild_name.
        ============
        """
        return {guild.id: guild.name for guild in self.client.guilds}

    async def list_channels(self, guild_id: int) -> List[Dict[str, str]]:
        """
        ============
        Function: list_channels
        ------------
        DESCRIPTION: Lists all text channels in the specified guild where the bot has permission to read messages.
        PARAMS:
        - guild_id (int): The ID of the guild to list channels from.
        RETURNS: List[Dict[str, str]] - Each dict contains 'id' and 'name' of a channel.
        ============
        """
        guild = self.client.get_guild(guild_id)
        if not guild:
            raise ValueError(f"Guild {guild_id} not found")
        return [
            {"id": str(ch.id), "name": ch.name}
            for ch in guild.text_channels
            if ch.permissions_for(guild.me).read_messages
        ]

    async def fetch_messages(
        self,
        guild_id: int,
        channel_id: int,
        after_id: int | None = None,          # ← NEW : delta fetch
    ) -> List[Dict[str, Any]]:
        """
        ============
        Function: fetch_messages
        ------------
        DESCRIPTION:
            Fetch every message in a text channel *after* `after_id`
            (Snowflake). If `after_id` is None, the whole history is
            returned. Attachments and embeds are appended inline.

        PARAMS:
        - guild_id (int): Guild ID.
        - channel_id (int): Channel ID.
        - after_id (int | None): Snowflake ID of the last stored message.

        RETURNS:
            List[Dict] where each dict matches the DB schema:
            {
            'id'            : discord_id (BIGINT),
            'channel_id'    : discord_id (BIGINT),
            'author_user_id': discord_id (BIGINT),
            'author_name'   : str,
            'content'       : str,
            'created_at'    : datetime,      # original timestamp (UTC)
            'fetched_at'    : datetime       # retrieval timestamp (UTC)
            }
        ============
        """
        guild = self.client.get_guild(guild_id)
        if guild is None:
            raise ValueError(f"Guild {guild_id} not found")

        channel = guild.get_channel(channel_id)
        if not isinstance(channel, nextcord.TextChannel):
            raise ValueError(f"Channel {channel_id} is not a text channel")

        perms = channel.permissions_for(guild.me)
        if not (perms.read_messages and perms.read_message_history):
            raise ValueError(f"Missing permissions on channel {channel_id}")

        history_kwargs = {"limit": None, "oldest_first": True}
        if after_id is not None:
            history_kwargs["after"] = nextcord.Object(id=after_id)

        messages: List[Dict[str, Any]] = []
        async for msg in channel.history(**history_kwargs):
            text = msg.content or ""
            if msg.attachments:
                text += " [Attachments: " + ", ".join(a.url for a in msg.attachments) + "]"
            if msg.embeds:
                text += " [Embeds present]"

            parent_id = msg.reference.message_id if msg.reference else None

            messages.append(
                {
                    "id": int(msg.id),                   # ← Snowflake ID BIGINT
                    "channel_id": int(channel_id),
                    "parent_message_id": int(parent_id) if parent_id else None,
                    "author_name": getattr(msg.author, 'display_name', msg.author.name),
                    "author_user_id": int(msg.author.id),
                    "content": text,
                    "created_at": msg.created_at,        # datetime in UTC
                    "fetched_at": datetime.utcnow(),
                }
            )
        return messages

# ============
# CLI MODE
# ============
if __name__ == "__main__":
    """
    Mode CLI interactif pour naviguer dans les serveurs et canaux Discord accessibles par le bot.
    """
    import argparse
    import getpass

    def print_menu(options, title="Choisis une option :"):
        print(f"\n{title}")
        for i, (key, val) in enumerate(options.items(), 1):
            print(f"  {i}. {val} (Snowflake: {key})")
        print("  0. Quitter")

    parser = argparse.ArgumentParser(description="DiscordFetcher CLI - Explore guilds and channels")
    args = parser.parse_args()

    load_env()
    token = get_env_var("DISCORD_BOT_TOKEN")
    if not token:
        print("Erreur : la variable DISCORD_BOT_TOKEN n'est pas définie dans .env.dev.")
        exit(1)

    fetcher = DiscordFetcher(token)

    async def cli_main():
        await fetcher.connect()
        try:
            while True:
                guilds = await fetcher.list_guilds()
                if not guilds:
                    print("Aucun serveur trouvé.")
                    break
                guild_options = {str(gid): name for gid, name in guilds.items()}
                print_menu(guild_options, "Serveurs disponibles :")
                choice = input("Numéro du serveur : ").strip()
                if choice == "0":
                    break
                try:
                    idx = int(choice) - 1
                    guild_id = list(guild_options.keys())[idx]
                except (ValueError, IndexError):
                    print("Choix invalide.")
                    continue
                channels = await fetcher.list_channels(int(guild_id))
                if not channels:
                    print("Aucun canal lisible trouvé dans ce serveur.")
                    continue
                channel_options = {c["id"]: c["name"] for c in channels}
                print_menu(channel_options, f"Canaux du serveur '{guild_options[guild_id]}' :")
                chan_choice = input("Numéro du canal : ").strip()
                if chan_choice == "0":
                    continue
                try:
                    chan_idx = int(chan_choice) - 1
                    channel_id = list(channel_options.keys())[chan_idx]
                except (ValueError, IndexError):
                    print("Choix de canal invalide.")
                    continue
                print(f"\nTu as sélectionné : {channel_options[channel_id]} (ID: {channel_id}, Snowflake: {channel_id})")
                fetch = input("Voulez-vous afficher les messages de ce canal ? (o/n) : ").strip().lower()
                if fetch == "o":
                    print("\nRécupération des messages...")
                    try:
                        messages = await fetcher.fetch_messages(int(guild_id), int(channel_id))
                        if not messages:
                            print("Aucun message trouvé.")
                        else:
                            for msg in messages:
                                print("-" * 40)
                                print(f"Message Snowflake: {msg['id']}")
                                print(f"Auteur: {msg['author_name']} (Snowflake: {msg['author_user_id']})")
                                print(f"Date: {msg['created_at']}")
                                print(f"Parent Snowflake: {msg['parent_message_id']}")
                                print(f"Contenu: {msg['content']}")
                    except Exception as e:
                        print(f"Erreur lors du fetch: {e}")
                else:
                    print("(Pas de récupération de messages dans ce mode, navigation seulement.)")
        finally:
            await fetcher.close()

    asyncio.run(cli_main())