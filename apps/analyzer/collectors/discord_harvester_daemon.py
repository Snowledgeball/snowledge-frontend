"""
Module: discord_harvester_daemon.py
-----------------------------------
DESCRIPTION: Discord bot daemon that stays connected and processes harvesting jobs from MongoDB.
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import asyncio
from datetime import datetime
from dotenv import load_dotenv
import nextcord
from storage.mongo_storage import MongoStorage

# Charger le token Discord depuis .env.dev
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env.dev'))
token = os.getenv('DISCORD_BOT_TOKEN')

intents = nextcord.Intents.default()
intents.guilds = True
intents.message_content = True

client = nextcord.Client(intents=intents)
storage = MongoStorage()

def filter_new_messages(db, messages):
    """
    ============
    Function: filter_new_messages
    ------------
    DESCRIPTION: Filter out messages whose _id already exists in the discord_messages collection.
    PARAMS:
    - db: MongoDB database instance
    - messages: List[dict] of messages to check
    RETURNS: List[dict] of messages not yet in the database
    ============
    """
    if not messages:
        return []
    ids = [msg["id"] for msg in messages]
    existing_ids = set(
        doc["_id"] for doc in db.discord_messages.find({"_id": {"$in": ids}}, {"_id": 1})
    )
    return [msg for msg in messages if msg["id"] not in existing_ids]

async def poll_jobs():
    await client.wait_until_ready()
    print("[Daemon] Polling jobs started.")
    while not client.is_closed():
        job = storage.get_next_pending_job()
        if not job:
            await asyncio.sleep(2)
            continue
        print(f"[Daemon] Nouveau job à traiter : {job}")
        try:
            # 1. Fetch guild and channels info
            guild = client.get_guild(job["serverId"])
            if not guild:
                raise ValueError(f"Guild {job['serverId']} not found or bot not a member.")
            channels = [ch for ch in guild.text_channels if ch.id in job["channels"]]
            # 2. Add server/channel if not present
            if not storage.db.discord_servers.find_one({'_id': job["serverId"]}):
                storage.add_discord_server({'_id': job["serverId"], 'user_id': int(job["discordId"]), 'name': guild.name})
            for ch in channels:
                if not storage.db.discord_channels.find_one({'_id': ch.id}):
                    storage.add_discord_channel({'_id': ch.id, 'name': ch.name, 'server_id': job["serverId"]})
            # 3. Fetch messages for each channel
            all_messages = []
            for ch in channels:
                after_id = None
                if job.get("after") and str(job["after"]).isdigit():
                    after_id = int(job["after"])
                history_kwargs = {"limit": None, "oldest_first": True}
                if after_id:
                    history_kwargs["after"] = nextcord.Object(id=after_id)
                messages = []
                async for msg in ch.history(**history_kwargs):
                    text = msg.content or ""
                    if msg.attachments:
                        text += " [Attachments: " + ", ".join(a.url for a in msg.attachments) + "]"
                    if msg.embeds:
                        text += " [Embeds present]"
                    parent_id = msg.reference.message_id if msg.reference else None
                    if not text.strip():
                        continue
                    messages.append({
                        "id": int(msg.id),
                        "channel_id": int(ch.id),
                        "parent_message_id": int(parent_id) if parent_id else None,
                        "author_name": getattr(msg.author, 'display_name', msg.author.name),
                        "author_user_id": int(msg.author.id),
                        "content": text,
                        "created_at": msg.created_at,
                        "fetched_at": datetime.utcnow(),
                    })
                # Filtrage after/before par date si besoin
                if job.get("after") and not str(job["after"]).isdigit():
                    after_dt = datetime.fromisoformat(job["after"])
                    messages = [m for m in messages if m['created_at'] >= after_dt]
                if job.get("before"):
                    before_dt = datetime.fromisoformat(job["before"])
                    messages = [m for m in messages if m['created_at'] <= before_dt]
                all_messages.extend(messages)
            # 4. Filtrer et insérer uniquement les nouveaux messages
            new_messages = filter_new_messages(storage.db, all_messages)
            storage.save_discord_messages(new_messages)
            # 5. Update job as done
            storage.update_job_status(
                job["_id"],
                "done",
                finished_at=datetime.utcnow(),
                inserted=len(new_messages)
            )
            print(f"Job {job['_id']} done: {len(new_messages)} new messages.")
        except Exception as e:
            storage.update_job_status(
                job["_id"],
                "failed",
                finished_at=datetime.utcnow(),
                error=str(e)
            )
            print(f"Job {job['_id']} failed: {e}")

@client.event
async def on_ready():
    print(f"[Discord Harvester Daemon] Bot connecté en tant que {client.user}")
    client.loop.create_task(poll_jobs())

if __name__ == "__main__":
    client.run(token)