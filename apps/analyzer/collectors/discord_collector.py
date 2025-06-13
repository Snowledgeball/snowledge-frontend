"""
Module: discord_collector.py
---------------------------
DESCRIPTION: Provides all business logic for connecting to Discord, listing guilds/channels, and fetching messages. 
This module is intended to be imported and used by orchestrators (CLI, API, etc.) and should not be run directly.
Do not add sys.path manipulations here; handle PYTHONPATH in entry scripts only.
"""

from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
import nextcord
from nextcord import Intents
from config.config import load_env, get_env_var

class DiscordCollector:
    """
    ============
    Class: DiscordCollector
    ------------
    DESCRIPTION: Collects and manages Discord data (guilds, channels, messages) using a bot token.
    PARAMS: None (token is loaded from env)
    RETURNS: None
    ============
    """

    def __init__(self, token: Optional[str] = None):
        """
        ============
        Function: __init__
        ------------
        DESCRIPTION: Initialize the collector with a Discord bot token.
        PARAMS:
        - token (str|None): Discord bot token. If None, loaded from env.
        RETURNS: None
        ============
        """
        load_env()
        self.token = token or get_env_var("DISCORD_BOT_TOKEN")
        self.client = nextcord.Client(intents=self._create_intents())
        self._ready = asyncio.Event()
        self._register_events()

    def _create_intents(self) -> Intents:
        intents = Intents.default()
        intents.guilds = True
        intents.message_content = True
        return intents

    def _register_events(self):
        @self.client.event
        async def on_ready():
            self._ready.set()

    async def connect(self) -> None:
        loop = asyncio.get_event_loop()
        loop.create_task(self.client.start(self.token))
        await self._ready.wait()

    async def close(self) -> None:
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
        after_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        ============
        Function: fetch_messages
        ------------
        DESCRIPTION: Fetch every message in a text channel *after* `after_id` (Snowflake). If `after_id` is None, the whole history is returned. Attachments and embeds are appended inline.
        PARAMS:
        - guild_id (int): Guild ID.
        - channel_id (int): Channel ID.
        - after_id (int | None): Snowflake ID of the last stored message.
        RETURNS: List[Dict] (see schema)
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
            # Drop messages with empty content after attachments/embeds
            if not text.strip():
                continue
            messages.append(
                {
                    "id": int(msg.id),
                    "channel_id": int(channel_id),
                    "parent_message_id": int(parent_id) if parent_id else None,
                    "author_name": getattr(msg.author, 'display_name', msg.author.name),
                    "author_user_id": int(msg.author.id),
                    "content": text,
                    "created_at": msg.created_at,
                    "fetched_at": datetime.utcnow(),
                }
            )
        return messages

    async def collect(
        self,
        guild: int,
        channels: List[int],
        after: Optional[str] = None,
        before: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        ============
        Function: collect
        ------------
        DESCRIPTION: Collect messages from specified channels in a guild, with optional time filtering.
        PARAMS:
        - guild (int): Guild/server ID
        - channels (List[int]): List of channel IDs
        - after (str|None): ISO timestamp or snowflake ID
        - before (str|None): ISO timestamp or snowflake ID
        RETURNS: List[Dict] of messages
        ============
        """
        await self.connect()
        all_messages = []
        try:
            for channel_id in channels:
                after_id = int(after) if after and after.isdigit() else None
                messages = await self.fetch_messages(guild, channel_id, after_id=after_id)
                if after and not (after.isdigit()):
                    after_dt = datetime.fromisoformat(after)
                    messages = [m for m in messages if m['created_at'] >= after_dt]
                if before:
                    before_dt = datetime.fromisoformat(before)
                    messages = [m for m in messages if m['created_at'] <= before_dt]
                all_messages.extend(messages)
        finally:
            await self.close()
        return all_messages

    async def get_guild_and_channels_info(self, guild_id: int) -> dict:
        """
        ============
        Function: get_guild_and_channels_info
        ------------
        DESCRIPTION: Returns the guild name and a list of its text channels (id, name) for the given guild_id.
        PARAMS:
        - guild_id (int): Guild/server ID
        RETURNS: dict with 'guild_id', 'guild_name', 'channels' (list of dicts with 'id' and 'name')
        ============
        """
        await self.connect()
        try:
            guild = self.client.get_guild(guild_id)
            if not guild:
                raise ValueError(f"Guild {guild_id} not found")
            channels = [
                {"id": int(ch.id), "name": ch.name}
                for ch in guild.text_channels
                if ch.permissions_for(guild.me).read_messages
            ]
            return {
                "guild_id": int(guild.id),
                "guild_name": guild.name,
                "channels": channels
            }
        finally:
            await self.close()