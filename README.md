# Snowledge – Plateforme de Social Learning

## 🎯 Aperçu du Projet

**Snowledge** est une plateforme de social learning qui vise à réinventer l’apprentissage collaboratif à l’ère du Web3, tout en garantissant une **expérience fluide de type Web2**. Elle permet aux utilisateurs de créer, rejoindre et animer des communautés éducatives, tout en s’appuyant sur la **blockchain Starknet** pour gérer une identité numérique via des **Soulbound Tokens (SBTs)**.

> **Objectif :** Apporter les bénéfices du Web3 (traçabilité, transparence, ownership) sans imposer de barrières techniques.

---

## 🚀 Fonctionnalités Clés

### 👥 Comptes & Identité Blockchain

- Création de compte = Mint automatique d’un **SBT** sur Starknet.
- Le SBT sert d’identité décentralisée et historise :
  - Les communautés rejointes et créées
  - (À venir) Les contributions, la réputation, etc.
- Aucun portefeuille requis : **expérience utilisateur 100 % Web2**.

### 📚 Communautés d’Apprentissage

- Création ou adhésion gratuite à des communautés.
- Chaque communauté comprend :
  - Un **chat temps réel** (multi-canaux)
  - Une **FAQ communautaire**
  - Un onglet de **contenus éducatifs**
  - Un espace pour **propositions & contributions**
  - _(À venir : cours & masterclass)_

### 🧑‍🏫 Outils pour Créateurs

- Édition de posts éducatifs via un éditeur riche (**BlockNoyr**).
- Catégorisation, modification post-publication, sauvegarde en brouillon.
- Dashboard de gestion :
  - Modération des membres
  - Suivi des contenus et candidatures

### 🧑‍🤝‍🧑 Parcours Contributeur

- Tout utilisateur peut postuler comme contributeur.
- Une fois accepté :
  - Il peut proposer des contenus
  - Chaque post est soumis à un vote (> 50 % = publication)

### 🔁 Collaboration & Évolution du Contenu

- Possibilité de :
  - Créer un post original
  - Reprendre ou modifier un post existant
- Modifications soumises au **vote communautaire**

### 🧠 Système de Propositions

- Propositions de sujets ouvertes à tous les membres
- Votes communautaires pour valider les sujets intéressants
- Base de réflexion pour de futurs contenus

### 🧾 Structure d’une Communauté

- **Général** : Chat & FAQ
- **Contenus** : Posts validés
- **Contributions** : Brouillons, propositions, suggestions
- _(À venir : cours, masterclass)_

### 🔔 Notifications

- Nouveaux contenus publiés
- Votes, validations ou rejets
- Changement de rôle ou exclusion
- Nouvelles propositions ou modifications

---

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

- `apps/snowledge-v1/.env` - Pour l'application principale (port 3001)
- `apps/frontend/.env` - Pour le frontend (port 3000)
- `apps/backend/.env` - Pour le backend (port 4000)

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

# Utiliser Docker en mode natif ARM64

Nous utilisons maintenant Docker en mode natif ARM64. Cela résout les problèmes avec Prisma et bcrypt.

Si vous avez d'autres problèmes, essayez de supprimer complètement le dossier node_modules et les images Docker avec :

# Utiliser Docker en mode natif ARM64

Nous utilisons maintenant Docker en mode natif ARM64. Cela résout les problèmes avec Prisma et bcrypt.

Si vous avez d'autres problèmes, essayez de supprimer complètement le dossier node_modules et les images Docker avec :

```bash
docker-compose down --rmi all
rm -rf apps/snowledge-v1/node_modules
docker-compose up -d
```
