# scripts/git-hooks/neon-branch-manager.sh
#!/bin/bash

# Configuration
NEON_API_KEY="napi_i6ysewh518njs95wwmd6c7ivia7w3kl239u0viteynx9qa9fkgr8cqes2fbaj73p"
NEON_PROJECT_ID="votre_id_projet"
NEON_API_URL="https://console.neon.tech/api/v2"
DB_USER="postgres"  # Ou votre utilisateur Neon
DB_PASSWORD="votre_mot_de_passe"
DB_NAME="neondb"    # Ou votre nom de base de données

# Obtient le nom de la branche Git actuelle
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "detached")

# Fonction pour obtenir l'ID de la branche Neon par son nom
get_branch_id() {
  local branch_name=$1
  curl -s "$NEON_API_URL/projects/$NEON_PROJECT_ID/branches" \
    -H "Authorization: Bearer $NEON_API_KEY" | \
    grep -o '"id":"[^"]*","name":"'"$branch_name"'"' | \
    sed 's/.*"id":"\([^"]*\)".*/\1/'
}

# Fonction pour vérifier si une branche Neon existe
branch_exists() {
  local branch_name=$1
  local result=$(curl -s "$NEON_API_URL/projects/$NEON_PROJECT_ID/branches" \
    -H "Authorization: Bearer $NEON_API_KEY" | \
    grep -o '"name":"'"$branch_name"'"')
  
  if [ -n "$result" ]; then
    return 0  # Existe
  else
    return 1  # N'existe pas
  fi
}

# Fonction pour créer une branche Neon
create_neon_branch() {
  local branch_name=$1
  local parent_id=$2
  
  echo "🔄 Création de la branche Neon '$branch_name' depuis '$parent_id'..."
  
  curl -s -X POST "$NEON_API_URL/projects/$NEON_PROJECT_ID/branches" \
    -H "Authorization: Bearer $NEON_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "branch": {
        "name": "'"$branch_name"'",
        "parent_id": "'"$parent_id"'"
      }
    }'
    
  if [ $? -eq 0 ]; then
    echo "✅ Branche Neon '$branch_name' créée avec succès!"
  else
    echo "❌ Erreur lors de la création de la branche Neon."
  fi
}

# Fonction pour mettre à jour le .env.local
update_env_file() {
  local branch_name=$1
  
  # Créer l'URL de l'endpoint en fonction du nom de la branche
  # Utiliser exactement le même nom de branche que Git
  local endpoint="$branch_name.cloud.neon.tech"
  
  echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$endpoint/$DB_NAME?sslmode=require" > .env.local
  echo "✅ Fichier .env.local mis à jour pour pointer vers la branche '$branch_name'."
}

# Logique principale
main() {
  # Utiliser exactement le même nom de branche que Git pour Neon
  NEON_BRANCH_NAME="$CURRENT_BRANCH"
  
  # Ignorer pour HEAD detached
  if [ "$CURRENT_BRANCH" = "detached" ]; then
    echo "⚠️ HEAD détaché, aucune action prise."
    return 0
  fi
  
  # Déterminer la branche parente en fonction de la branche Git
  if [[ "$CURRENT_BRANCH" == feature/* ]]; then
    PARENT_BRANCH="develop"
  elif [ "$CURRENT_BRANCH" = "develop" ]; then
    PARENT_BRANCH="develop"
  elif [ "$CURRENT_BRANCH" = "staging" ]; then
    PARENT_BRANCH="develop"
  elif [ "$CURRENT_BRANCH" = "main" ]; then
    PARENT_BRANCH="staging"
  else
    PARENT_BRANCH="develop"  # Par défaut
  fi
  
  # Vérifier si la branche Neon existe déjà
  if ! branch_exists "$NEON_BRANCH_NAME"; then
    # Obtenir l'ID de la branche parente
    PARENT_ID=$(get_branch_id "$PARENT_BRANCH")
    
    # Si l'ID de parent n'est pas trouvé, utiliser "develop" comme fallback
    if [ -z "$PARENT_ID" ]; then
      echo "⚠️ Branche parente '$PARENT_BRANCH' non trouvée, utilisation de 'develop'."
      PARENT_ID="develop"
    fi
    
    # Créer la branche Neon
    create_neon_branch "$NEON_BRANCH_NAME" "$PARENT_ID"
  else
    echo "ℹ️ La branche Neon '$NEON_BRANCH_NAME' existe déjà."
  fi
  
  # Mettre à jour le fichier .env.local
  update_env_file "$NEON_BRANCH_NAME"
}

# Exécution
main