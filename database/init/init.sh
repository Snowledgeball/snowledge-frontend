#!/bin/bash
set -e

# Variables
BACKUP_FILE="/backup/snowledge_backup.sql"

# Vérifier si le fichier de sauvegarde existe
if [ -f "$BACKUP_FILE" ]; then
  echo "📦 Restauration de la base de données à partir de $BACKUP_FILE"
  
  # Restaurer la base de données
  pg_restore -U postgres -d snowledge -c "$BACKUP_FILE" || psql -U postgres -d snowledge -f "$BACKUP_FILE"
  
  echo "✅ Base de données restaurée avec succès!"
else
  echo "⚠️ Aucun fichier de sauvegarde trouvé à $BACKUP_FILE"
  echo "💡 La base de données sera initialisée vide"
fi 