# Gestion avancée des branches BD Neon avec GitHub (Branche par branche)

Ce guide explique comment créer automatiquement une branche Neon pour chaque branche GitHub, permettant d'isoler complètement les environnements de développement.

## Avantages de cette approche

- ✅ **Isolation complète** : Chaque branche a sa propre base de données
- ✅ **Pas de conflits** : Les migrations peuvent être développées indépendamment
- ✅ **Tests isolés** : Chaque feature peut être testée avec son propre schéma
- ✅ **Workflow propre** : Pas besoin de coordonner les modifications de BD entre les développeurs

## Configuration nécessaire

1. **Compte Neon** avec un plan permettant plusieurs branches
2. **Clé API Neon** avec permissions pour gérer les branches
3. **Git Hooks** configurés sur les postes des développeurs

## Installation du système automatisé

### 1. Structure des fichiers

Créez cette structure dans votre projet :

```
projet/
├── scripts/
│   ├── git-hooks/
│   │   ├── neon-branch-manager.sh
│   │   ├── post-checkout
│   │   └── post-commit
│   └── setup-neon-automation.sh
```

### 2. Script principal (neon-branch-manager.sh)

```bash
#!/bin/bash

# Configuration
NEON_API_KEY="votre_clé_api"
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
  local endpoint="$branch_name.cloud.neon.tech"

  echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$endpoint/$DB_NAME?sslmode=require" > .env.local
  echo "✅ Fichier .env.local mis à jour pour pointer vers la branche '$branch_name'."
}

# Logique principale
main() {
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
  if ! branch_exists "$CURRENT_BRANCH"; then
    # Obtenir l'ID de la branche parente
    PARENT_ID=$(get_branch_id "$PARENT_BRANCH")

    # Si l'ID de parent n'est pas trouvé, utiliser "develop" comme fallback
    if [ -z "$PARENT_ID" ]; then
      echo "⚠️ Branche parente '$PARENT_BRANCH' non trouvée, utilisation de 'develop'."
      PARENT_ID="develop"
    fi

    # Créer la branche Neon
    create_neon_branch "$CURRENT_BRANCH" "$PARENT_ID"
  else
    echo "ℹ️ La branche Neon '$CURRENT_BRANCH' existe déjà."
  fi

  # Mettre à jour le fichier .env.local
  update_env_file "$CURRENT_BRANCH"
}

# Exécution
main
```

### 3. Hook Git post-checkout

```bash
#!/bin/bash
# scripts/git-hooks/post-checkout

PREV_HEAD=$1
NEW_HEAD=$2
BRANCH_CHECKOUT=$3

# Ne s'exécute que lors du checkout d'une branche, pas pour les fichiers
if [ $BRANCH_CHECKOUT -eq 1 ]; then
  # Lancer le gestionnaire de branche Neon
  bash scripts/git-hooks/neon-branch-manager.sh
fi

exit 0
```

### 4. Hook Git post-commit

```bash
#!/bin/bash
# scripts/git-hooks/post-commit

# En cas de premier commit sur une nouvelle branche
bash scripts/git-hooks/neon-branch-manager.sh

exit 0
```

### 5. Script d'installation

```bash
#!/bin/bash
# scripts/setup-neon-automation.sh

echo "🚀 Configuration de l'automatisation Git-Neon..."

# Demander les informations de connexion Neon
read -p "Clé API Neon: " NEON_API_KEY
read -p "ID du projet Neon: " NEON_PROJECT_ID
read -p "Utilisateur DB Neon: " DB_USER
read -s -p "Mot de passe DB Neon: " DB_PASSWORD
echo ""
read -p "Nom de la base de données Neon [neondb]: " DB_NAME
DB_NAME=${DB_NAME:-neondb}

# Mettre à jour le script avec les informations
sed -i '' "s/NEON_API_KEY=\"votre_clé_api\"/NEON_API_KEY=\"$NEON_API_KEY\"/" scripts/git-hooks/neon-branch-manager.sh
sed -i '' "s/NEON_PROJECT_ID=\"votre_id_projet\"/NEON_PROJECT_ID=\"$NEON_PROJECT_ID\"/" scripts/git-hooks/neon-branch-manager.sh
sed -i '' "s/DB_USER=\"postgres\"/DB_USER=\"$DB_USER\"/" scripts/git-hooks/neon-branch-manager.sh
sed -i '' "s/DB_PASSWORD=\"votre_mot_de_passe\"/DB_PASSWORD=\"$DB_PASSWORD\"/" scripts/git-hooks/neon-branch-manager.sh
sed -i '' "s/DB_NAME=\"neondb\"/DB_NAME=\"$DB_NAME\"/" scripts/git-hooks/neon-branch-manager.sh

# Rendre les scripts exécutables
chmod +x scripts/git-hooks/neon-branch-manager.sh
chmod +x scripts/git-hooks/post-checkout
chmod +x scripts/git-hooks/post-commit

# Installer les Git hooks
cp scripts/git-hooks/post-checkout .git/hooks/
cp scripts/git-hooks/post-commit .git/hooks/

echo "✅ L'automatisation Git-Neon est configurée !"
echo "📝 Lorsque vous changez de branche ou créez un commit, le .env.local sera automatiquement mis à jour."
```

## Comment utiliser le système

### Installation pour chaque développeur

1. Clonez le repo
2. Exécutez le script d'installation :
   ```bash
   bash scripts/setup-neon-automation.sh
   ```
3. Entrez vos informations d'API Neon

### Workflow quotidien

1. Créez ou changez de branche normalement :

   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

2. Le hook s'exécutera automatiquement et :

   - Vérifiera si une branche Neon avec ce nom existe
   - Si non, créera la branche à partir de develop
   - Mettra à jour votre .env.local pour utiliser cette branche

3. Développez normalement avec les migrations :

   ```bash
   npx prisma migrate dev --name ma_migration
   ```

4. Lorsque vous changez de branche, votre .env.local est automatiquement mis à jour

## Hiérarchie des branches

```
main (production)
└── staging (préproduction)
    └── develop (développement)
        ├── feature/a
        ├── feature/b
        └── feature/c
```

## Nettoyage des branches

Pour éviter d'avoir trop de branches Neon (et les coûts associés), créez un workflow GitHub pour nettoyer les branches après merge :

```yaml
# .github/workflows/cleanup-neon-branch.yml
name: Cleanup Neon Branch

on:
  pull_request:
    types: [closed]
    branches:
      - develop
      - staging
      - main

jobs:
  cleanup:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Delete Neon Branch
        run: |
          BRANCH_NAME="${{ github.event.pull_request.head.ref }}"
          BRANCH_ID=$(curl -s "https://console.neon.tech/api/v2/projects/${{ secrets.NEON_PROJECT_ID }}/branches" \
            -H "Authorization: Bearer ${{ secrets.NEON_API_KEY }}" | \
            jq -r '.branches[] | select(.name=="'$BRANCH_NAME'") | .id')

          if [ -n "$BRANCH_ID" ]; then
            curl -X DELETE "https://console.neon.tech/api/v2/projects/${{ secrets.NEON_PROJECT_ID }}/branches/$BRANCH_ID" \
              -H "Authorization: Bearer ${{ secrets.NEON_API_KEY }}"
            echo "✅ Branche Neon '$BRANCH_NAME' supprimée"
          else
            echo "⚠️ Branche Neon '$BRANCH_NAME' non trouvée"
          fi
```

## Considérations finales

- Ajoutez `.env.local` à votre `.gitignore`
- Cette approche peut augmenter les coûts sur Neon selon votre plan
- Les branches doivent être régulièrement nettoyées
- Envisagez un timeout pour supprimer automatiquement les branches inactives
