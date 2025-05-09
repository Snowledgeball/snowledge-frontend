#!/bin/bash
set -e

echo "🔒 ATTENTION: Ce script utilise des informations de connexion sensibles"
echo "   Si vous prévoyez de partager ce code, assurez-vous de créer un fichier .env"
echo "   pour stocker vos identifiants et ne PAS les exposer dans ce script."

# Charger les variables d'environnement si le fichier .env existe
if [ -f ".env" ]; then
  echo "🔄 Chargement des variables d'environnement depuis .env"
  export $(grep -v '^#' .env | xargs)
fi

# Demander les informations si elles ne sont pas définies
if [ -z "$OVH_HOST" ]; then
  read -p "Hôte PostgreSQL OVH: " OVH_HOST
fi

if [ -z "$OVH_PORT" ]; then
  read -p "Port PostgreSQL OVH [5432]: " OVH_PORT
  OVH_PORT=${OVH_PORT:-5432}
fi

if [ -z "$OVH_USER" ]; then
  read -p "Utilisateur PostgreSQL OVH: " OVH_USER
fi

if [ -z "$OVH_PASSWORD" ]; then
  read -sp "Mot de passe PostgreSQL OVH: " OVH_PASSWORD
  echo
fi

if [ -z "$OVH_DATABASE" ]; then
  read -p "Nom de la base de données OVH [defaultdb]: " OVH_DATABASE
  OVH_DATABASE=${OVH_DATABASE:-defaultdb}
fi

# Chemin du fichier de sauvegarde
BACKUP_FILE="./database/backup/snowledge_backup.sql"

echo "🔄 Création d'une sauvegarde de la base de données OVH..."
echo "📊 Connexion à $OVH_HOST:$OVH_PORT avec l'utilisateur $OVH_USER"

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p ./database/backup

# Exécuter pg_dump avec SSL requis
PGPASSWORD="$OVH_PASSWORD" pg_dump \
  -h "$OVH_HOST" \
  -p "$OVH_PORT" \
  -U "$OVH_USER" \
  -d "$OVH_DATABASE" \
  -F c \
  --no-owner \
  --no-acl \
  -f "$BACKUP_FILE" \
  --verbose \
  -w \
  --ssl-mode=require

# Vérifier si le dump a réussi
if [ $? -eq 0 ]; then
  echo "✅ Sauvegarde créée avec succès : $BACKUP_FILE"
  echo "🔍 Maintenant, vous pouvez démarrer votre environnement Docker avec 'make up'"
  echo "   La base de données sera automatiquement restaurée."
else
  echo "❌ Erreur lors de la création de la sauvegarde"
  exit 1
fi 