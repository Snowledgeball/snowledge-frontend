# Snowledge App

## Commandes rapides (Make)

Pour simplifier l'utilisation de Docker, utilisez ces commandes :

```bash
# Afficher l'aide
make help

# Démarrer tous les services
make up

# Importer la base de données depuis OVH
make import-ovh

# Sauvegarder la base de données locale
make backup

# Arrêter tous les services
make down

# Reconstruire complètement le projet
make rebuild
```

## Variables d'environnement par application

Chaque application a son propre fichier `.env` qui est monté dans le conteneur Docker :

- `apps/snowledge-v1/.env` - Pour l'application principale (port 3000)
- `apps/frontend/.env` - Pour le frontend (port 3001)
- `apps/backend/.env` - Pour le backend (port 3002)

Ces fichiers sont automatiquement ignorés par Git via le `.gitignore`, donc vos identifiants ne seront pas partagés.

Vous pouvez personnaliser ces fichiers avec vos propres variables d'environnement.

## Sécurité et variables d'environnement

⚠️ **IMPORTANT** : Pour protéger vos données sensibles, créez un fichier `.env` à la racine du projet :

```bash
# PostgreSQL local
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=snowledge

# PostgreSQL OVH (informations sensibles)
OVH_HOST=postgresql-host.database.cloud.ovh.net
OVH_PORT=5432
OVH_USER=votre_utilisateur
OVH_PASSWORD=votre_mot_de_passe
OVH_DATABASE=defaultdb
```

Ce fichier `.env` est déjà exclu de Git dans le `.gitignore`, donc vos identifiants ne seront pas partagés.

Si le fichier `.env` n'existe pas, le script `dump_from_ovh.sh` vous demandera ces informations de manière interactive.

## Gestion de la base de données PostgreSQL

### Sauvegarder la base de données

#### Depuis le conteneur Docker local

Pour créer une sauvegarde de la base de données qui sera automatiquement restaurée par tous les membres de l'équipe :

```bash
# Méthode simple avec make
make backup

# OU méthode manuelle
docker-compose exec postgres pg_dump -U postgres -d snowledge -F c -f /backup/snowledge_backup.sql
```

#### Depuis la base de données OVH

Pour importer une base de données depuis OVH :

1. Installez PostgreSQL sur votre machine locale (pour avoir l'outil pg_dump) :

   - Sur Mac : `brew install postgresql`
   - Sur Ubuntu/Debian : `sudo apt install postgresql-client`

2. Exécutez la commande :

   ```bash
   make import-ovh
   ```

3. La base sera automatiquement importée et disponible dans tous les conteneurs

### Restauration automatique

La restauration est automatique :

1. Placez votre fichier de sauvegarde dans `./database/backup/snowledge_backup.sql`
2. Quand quelqu'un exécute `make up` ou `docker-compose up`, la base de données est automatiquement restaurée

### Restauration manuelle

Si vous avez besoin de restaurer manuellement :

```bash
docker-compose exec postgres pg_restore -U postgres -d snowledge -c /backup/snowledge_backup.sql
```
