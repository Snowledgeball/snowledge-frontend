# Guide simplifié : Déployer Next.js sur OVH Public Cloud

Ce guide présente une approche simplifiée mais évolutive pour déployer votre application Next.js sur OVH Public Cloud.

## Vue d'ensemble

Nous allons configurer :

- Une seule instance OVH Public Cloud (évolutive ultérieurement)
- Docker et Docker Compose pour la conteneurisation
- NGINX comme reverse proxy avec SSL
- Un processus de déploiement simple

## Étape 1 : Créer l'instance OVH

1. **Connectez-vous** à votre espace client OVH
2. Allez dans **Public Cloud** → **Instances**
3. Cliquez sur **Créer une instance**
4. Sélectionnez :
   - **Région** : (choisissez la plus proche de vos utilisateurs)
   - **Image** : Ubuntu 22.04
   - **Type d'instance** : B2-7 (2 vCPU, 7 Go RAM) - bon équilibre pour commencer
   - **Nom** : nextjs-production
   - **Clé SSH** : ajoutez votre clé publique

## Étape 2 : Configurer le DNS

1. Dans votre gestionnaire de domaine, créez un enregistrement A :
   ```
   Type: A
   Nom: @ (ou www ou sous-domaine)
   Valeur: [IP_DE_VOTRE_INSTANCE]
   TTL: 3600
   ```

## Étape 3 : Configurer le serveur

Connectez-vous à votre instance :

```bash
ssh ubuntu@[IP_DE_VOTRE_INSTANCE]
```

### Installation des dépendances

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker et autres outils
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
sudo apt install -y docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session pour appliquer les changements de groupe
# (déconnectez-vous et reconnectez-vous, ou exécutez):
newgrp docker
```

### Structure du projet

```bash
# Créer la structure du projet
mkdir -p ~/nextjs-app/{nginx/conf.d,nginx/ssl,data,logs}
cd ~/nextjs-app
```

## Étape 4 : Créer les fichiers de configuration

### Docker Compose

Créez le fichier `docker-compose.yml` :

```bash
cat > ~/nextjs-app/docker-compose.yml << 'EOF'
version: '3'

services:
  nextjs:
    image: ${NEXT_IMAGE:-ghcr.io/your-username/nextjs-app:latest}
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL:-}
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:stable-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs:/var/log/nginx
    depends_on:
      - nextjs
EOF
```

### Configuration NGINX

Créez le fichier de configuration NGINX :

```bash
cat > ~/nextjs-app/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirection vers HTTPS
    location / {
        return 301 https://$host$request_uri;
    }

    # Pour Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/yourdomain.com/privkey.pem;

    # Proxy configuration
    location / {
        proxy_pass http://nextjs:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets
    location /_next/static/ {
        proxy_pass http://nextjs:3000/_next/static/;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static/ {
        proxy_pass http://nextjs:3000/static/;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Logs
    access_log /var/log/nginx/nextjs.access.log;
    error_log /var/log/nginx/nextjs.error.log;
}
EOF
```

## Étape 5 : Configurer SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt-get update
sudo apt-get install -y certbot

# Créer le répertoire pour la vérification
mkdir -p ~/nextjs-app/certbot/www
chmod -R 755 ~/nextjs-app/certbot

# Obtenir le certificat
sudo certbot certonly --webroot -w ~/nextjs-app/certbot/www -d yourdomain.com -d www.yourdomain.com

# Copier les certificats
mkdir -p ~/nextjs-app/nginx/ssl/live/yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/* ~/nextjs-app/nginx/ssl/live/yourdomain.com/
sudo chown -R ubuntu:ubuntu ~/nextjs-app/nginx/ssl

# Script de renouvellement
cat > ~/renew-cert.sh << 'EOF'
#!/bin/bash
sudo certbot renew --quiet
sudo cp /etc/letsencrypt/live/yourdomain.com/* ~/nextjs-app/nginx/ssl/live/yourdomain.com/
cd ~/nextjs-app && docker-compose restart nginx
EOF

chmod +x ~/renew-cert.sh

# Ajouter au cron
(crontab -l 2>/dev/null; echo "0 3 * * * ~/renew-cert.sh") | crontab -
```

## Étape 6 : Configurer l'application Next.js

Dans votre projet Next.js local, créez un Dockerfile :

```Dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Ajoutez un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Modifiez votre `next.config.js` :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Important pour Docker
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;
```

## Étape 7 : Mettre en place le déploiement

### Option 1 : Déploiement manuel

1. **Construire l'image localement** :

```bash
docker build -t ghcr.io/your-username/nextjs-app:latest .
docker push ghcr.io/your-username/nextjs-app:latest
```

2. **Sur le serveur** :

```bash
cd ~/nextjs-app
docker-compose pull
docker-compose up -d
```

### Option 2 : GitHub Actions (automatisé)

Créez le fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy to OVH

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/nextjs-app:latest

      - name: Deploy to OVH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.OVH_HOST }}
          username: ${{ secrets.OVH_USERNAME }}
          key: ${{ secrets.OVH_SSH_KEY }}
          script: |
            cd ~/nextjs-app
            docker-compose pull
            docker-compose down
            docker-compose up -d
```

Configurez les secrets dans GitHub :

- `OVH_HOST` : l'adresse IP de votre instance
- `OVH_USERNAME` : usuellement "ubuntu"
- `OVH_SSH_KEY` : votre clé SSH privée

## Étape 8 : Surveillance de base

```bash
# Installer htop pour la surveillance du système
sudo apt install -y htop

# Script simple de surveillance
cat > ~/monitor.sh << 'EOF'
#!/bin/bash

echo "======= SYSTÈME ======="
uptime
echo ""
echo "======= MÉMOIRE ======="
free -h
echo ""
echo "======= DISQUE ========"
df -h
echo ""
echo "======= DOCKER ========"
docker ps -a
echo ""
echo "======= LOGS =========="
tail -n 20 ~/nextjs-app/logs/nextjs.error.log
EOF

chmod +x ~/monitor.sh
```

## Évolution vers une architecture scalable

Lorsque vous aurez besoin d'évoluer, voici les prochaines étapes :

### 1. Passer à plusieurs instances

1. Créez des instances supplémentaires avec la même configuration
2. Configurez un Load Balancer OVH
3. Mettez à jour votre DNS pour pointer vers le Load Balancer

### 2. Ajouter une base de données externe

1. Créez une base de données OVH ou utilisez un service géré
2. Mettez à jour `DATABASE_URL` dans votre application

### 3. Passer au clustering avec Docker Swarm

```bash
# Sur le premier nœud (manager)
docker swarm init --advertise-addr $(hostname -i)

# Sur les nœuds supplémentaires (workers)
docker swarm join --token [TOKEN] [MANAGER-IP]:2377
```

Modifiez le `docker-compose.yml` pour le format Swarm :

```yaml
version: "3.8"
services:
  nextjs:
    image: ghcr.io/your-username/nextjs-app:latest
    deploy:
      replicas: 3
      # Autres configurations
```

### 4. Monitoring avancé

1. Installez Prometheus et Grafana via Docker Compose
2. Ajoutez des exporteurs pour collecter des métriques

## Récapitulatif

Cette configuration simple mais évolutive vous permet de :

1. Déployer facilement votre application Next.js sur OVH
2. Bénéficier d'un HTTPS sécurisé avec renouvellement automatique
3. Avoir une base solide pour évoluer vers une architecture plus complexe

Pour aller plus loin, consultez le guide complet qui détaille une architecture plus robuste avec clustering, monitoring avancé, et haute disponibilité.
