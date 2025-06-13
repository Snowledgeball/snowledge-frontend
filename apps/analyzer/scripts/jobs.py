from datetime import datetime
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Charger le .env.dev à la racine du projet
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env.dev'))

MG_HOST     = os.getenv("MG_HOST", "localhost")
MG_PORT     = os.getenv("MG_PORT", "27017")
MG_NAME     = os.getenv("MG_NAME")
MG_USER     = os.getenv("MG_USER")
MG_PASSWORD = os.getenv("MG_PASSWORD")

if not all([MG_HOST, MG_PORT, MG_NAME, MG_USER, MG_PASSWORD]):
    raise EnvironmentError("Vérifie que MG_HOST, MG_PORT, MG_NAME, MG_USER et MG_PASSWORD sont définis dans .env.dev")

MONGO_URI = f"mongodb://{MG_USER}:{MG_PASSWORD}@{MG_HOST}:{MG_PORT}/{MG_NAME}?authSource=admin"
client    = MongoClient(MONGO_URI)
db        = client[MG_NAME]

# Renseigne ici les valeurs souhaitées
AFTER = ""  # exemple: "2024-06-01T00:00:00" ou ""
BEFORE = "" # exemple: "2024-06-10T00:00:00" ou ""

job = {
    "discordId": "607857449315336214",  # Remplace par ton Discord ID
    "serverId": 1328288256172888115,      # Remplace par ton Server ID
    "channels": [1328288256172888000],    # Remplace par tes Channel IDs
    "status": "pending",
    "created_at": datetime.utcnow()
}

if AFTER:
    job["after"] = AFTER
if BEFORE:
    job["before"] = BEFORE

db.discord_harvest_jobs.insert_one(job)
print("Job inserted !")