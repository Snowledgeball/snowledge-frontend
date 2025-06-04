"""
Module: full_api.py
------------------------
DESCRIPTION: Exposes API endpoints for harvesting Discord data and storing it in MongoDB. 
Intended to be run with FastAPI (e.g., via uvicorn). 
Handles input validation and orchestrates the collector and storage layers. 
Do not add sys.path manipulations here; handle PYTHONPATH in entry scripts only if needed.
"""

import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from storage.mongo_storage import MongoStorage
from collectors.discord_collector import DiscordCollector
from bson import ObjectId
from dateutil.relativedelta import relativedelta
from llm.analyse import analyse
from dateutil.parser import parse as parse_date

app = FastAPI()

class DiscordHarvestRequest(BaseModel):
    discordId: str = Field(..., description="Discord user ID of the server administrator (not the bot ID)")
    serverId: int = Field(..., description="Discord server (guild) ID")
    channels: List[int] = Field(..., description="List of channel IDs to fetch")
    after: Optional[str] = Field(None, description="ISO timestamp or snowflake ID for start of period")
    before: Optional[str] = Field(None, description="ISO timestamp or snowflake ID for end of period")

class DiscordAnalyzeRequest(BaseModel):
    creator_id: int = Field(..., description="Internal user ID (SQL, obligatoire)")
    serverId: int = Field(..., description="Discord server (guild) ID")
    channelId: int = Field(..., description="Discord channel ID")
    model_name: str = Field(..., description="LLM model name to use")
    prompt_key: str = Field(..., description="Prompt key from discord_prompts.yaml")
    period: str = Field(..., description="Period to analyze: last_day, last_week, last_month")

@app.post("/discord/harvest")
async def discord_harvest(request: DiscordHarvestRequest):
    """
    =========
    Endpoint: /discord/harvest [POST]
    ------------
    DESCRIPTION: Insert a harvesting job for Discord messages in MongoDB. The daemon will process it asynchronously.
    PARAMS: DiscordHarvestRequest (JSON body)
    RETURNS: JSON with job_id and status
    =========
    """
    storage = MongoStorage()
    job = {
        "discordId": request.discordId,
        "serverId": request.serverId,
        "channels": request.channels,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    if request.after:
        job["after"] = request.after
    if request.before:
        job["before"] = request.before
    job_id = storage.add_harvest_job(job)
    return {"job_id": str(job_id), "status": "queued"}

@app.get("/discord/channels/{server_id}")
async def list_discord_channels(server_id: int):
    """
    =========
    Endpoint: /discord/channels/{server_id} [GET]
    ------------
    DESCRIPTION: Lists all text channels (id, name) for a given Discord server (guild) by connecting temporarily to Discord.
    PARAMS: server_id (path)
    RETURNS: List of channels (id, name)
    =========
    """
    collector = DiscordCollector()
    try:
        await collector.connect()
        guild = collector.client.get_guild(server_id)
        if not guild:
            raise HTTPException(status_code=404, detail=f"Guild {server_id} not found or bot not a member.")
        channels = [
            {"id": str(ch.id), "name": ch.name}
            for ch in guild.text_channels
            if ch.permissions_for(guild.me).read_messages
        ]
        return {"server_id": str(guild.id), "server_name": guild.name, "channels": channels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await collector.close()

@app.get("/discord/harvest/status/{job_id}")
def get_harvest_job_status(job_id: str):
    """
    =========
    Endpoint: /discord/harvest/status/{job_id} [GET]
    ------------
    DESCRIPTION: Allows to track the status and result of a Discord harvesting job.
    PARAMS: job_id (path)
    RETURNS: Status, number of inserted messages, finish date, error if any
    =========
    """
    storage = MongoStorage()
    try:
        job = storage.db.discord_harvest_jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job_id format")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": str(job["_id"]),
        "status": job["status"],
        "inserted": job.get("inserted"),
        "finished_at": job.get("finished_at"),
        "error": job.get("error")
    }

@app.get("/discord/servers")
async def list_discord_servers():
    """
    =========
    Endpoint: /discord/servers [GET]
    ------------
    DESCRIPTION: Lists all servers (guilds) the bot is connected to, with their Snowflake (id) and name.
    PARAMS: None
    RETURNS: List of servers (id, name)
    =========
    """
    collector = DiscordCollector()
    try:
        await collector.connect()
        servers = [
            {"id": str(guild.id), "name": guild.name}
            for guild in collector.client.guilds
        ]
        return {"servers": servers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await collector.close()

@app.post("/discord/analyze")
async def discord_analyze(request: DiscordAnalyzeRequest):
    """
    =========
    Endpoint: /discord/analyze [POST]
    ------------
    DESCRIPTION: Analyze Discord messages in a channel over a given period using a selected LLM model and prompt.
    PARAMS: DiscordAnalyzeRequest (JSON body, creator_id obligatoire)
    RETURNS: LLM analysis result
    =========
    """
    # 1. Compute date range
    now = datetime.utcnow()
    if request.period == "last_day":
        since = now - relativedelta(days=1)
    elif request.period == "last_week":
        since = now - relativedelta(weeks=1)
    elif request.period == "last_month":
        since = now - relativedelta(months=1)
    else:
        raise HTTPException(status_code=400, detail="Invalid period. Use last_day, last_week, or last_month.")

    # 2. Fetch messages from MongoDB (already harvested)
    storage = MongoStorage()
    filters = {
        "channel_id": request.channelId,
        "created_at": {"$gte": since, "$lte": now}
    }
    messages = storage.get_discord_messages(filters)
    if not messages:
        return {"result": None, "message": "No messages found for this period."}

    # Trie du plus ancien au plus récent
    for m in messages:
        if isinstance(m["created_at"], str):
            m["created_at"] = parse_date(m["created_at"])
    messages = sorted(messages, key=lambda m: m["created_at"])

    # 3. Format messages for the prompt
    formatted = []
    for msg in messages:
        dt = msg["created_at"].strftime("%Y-%m-%d %H:%M")
        user = msg.get("author_name", str(msg.get("user_id", "?")))
        content = msg["content"]
        formatted.append(f"[{dt}] {user}: {content}")

    # 4. Appel à l'API OVH via analyse.py
    try:
        ovh_response = analyse(
            model_name=request.model_name,
            prompt_name=request.prompt_key,
            user_content=formatted
        )
        # 5. Stockage du résultat dans analysis_results
        analysis_doc = {
            "creator_id": int(request.creator_id),
            "platform": "discord",
            "prompt_key": request.prompt_key,
            "llm_model": request.model_name,
            "scope": {
                "server_id": request.serverId,
                "channel_id": request.channelId
            },
            "period": {
                "from": since,
                "to": now
            },
            "result": ovh_response,
            "created_at": datetime.utcnow()
        }
        storage.db.analysis_results.insert_one(analysis_doc)
        return ovh_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

# Prepare here other analysis endpoints to come
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.full_api:app", host="0.0.0.0", port=8000, reload=False)