# Guide de déploiement professionnel de Next.js sur OVH Public Cloud

## Table des matières

- [Introduction](#introduction)
- [Prérequis](#prérequis)
- [Architecture globale](#architecture-globale)
- [Provisionnement de l'infrastructure](#provisionnement-de-linfrastructure)
- [Configuration du serveur](#configuration-du-serveur)
- [Déploiement de l'application](#déploiement-de-lapplication)
- [Sécurisation](#sécurisation)
- [Monitoring et observabilité](#monitoring-et-observabilité)
- [Automatisation et CI/CD](#automatisation-et-cicd)
- [Mise à l'échelle](#mise-à-léchelle)
- [Maintenance et mises à jour](#maintenance-et-mises-à-jour)
- [Sauvegarde et reprise après sinistre](#sauvegarde-et-reprise-après-sinistre)
- [Annexes](#annexes)

## Introduction

Ce guide détaille la mise en place d'une infrastructure professionnelle, scalable et sécurisée pour héberger une application Next.js sur OVH Public Cloud. L'architecture proposée utilise des conteneurs Docker, NGINX comme reverse proxy, et intègre des solutions de monitoring et d'automatisation.

## Prérequis

- Un compte OVH Public Cloud
- Un domaine configuré dans OVH ou un autre registrar
- Connaissance de base de Linux, Docker et Next.js
- Application Next.js fonctionnelle en local
- Accès Git pour le code source (GitHub, GitLab, etc.)

### Outils nécessaires

```bash
# Sur votre machine locale
apt update && apt install -y \
  git \
  terraform \
  python3-pip \
  jq

# Installer OpenStack CLI
pip install python-openstackclient
```

## Architecture globale

L'architecture proposée est conçue pour être évolutive et résiliente :

```
                                   +-------------------+
                                   |  OVH Load Balancer|
                                   +-------------------+
                                             |
                                             v
+------------------+   +------------------+   +------------------+
|  Instance App 1  |   |  Instance App 2  |   |  Instance App n  |
|  +------------+  |   |  +------------+  |   |  +------------+  |
|  |   NGINX    |  |   |  |   NGINX    |  |   |  |   NGINX    |  |
|  +------------+  |   |  +------------+  |   |  +------------+  |
|  +------------+  |   |  +------------+  |   |  +------------+  |
|  |  Next.js   |  |   |  |  Next.js   |  |   |  |  Next.js   |  |
|  +------------+  |   |  +------------+  |   |  +------------+  |
+------------------+   +------------------+   +------------------+
          |                     |                      |
          v                     v                      v
+-------------------------------------------------------+
|                  Base de données partagée             |
|             (PostgreSQL/MySQL OVH Database)           |
+-------------------------------------------------------+
          |                     |                      |
          v                     v                      v
+-------------------------------------------------------+
|                  Stockage d'objets                    |
|               (OVH Object Storage)                    |
+-------------------------------------------------------+
```

## Provisionnement de l'infrastructure

### Configuration avec Terraform

Commencez par créer un fichier `main.tf` pour définir votre infrastructure :

```hcl
# main.tf
terraform {
  required_providers {
    openstack = {
      source = "terraform-provider-openstack/openstack"
      version = "~> 1.49.0"
    }
  }
}

provider "openstack" {
  auth_url    = "https://auth.cloud.ovh.net/v3"
  domain_name = "default"
  region      = var.region
}

# Réseau privé
resource "openstack_networking_network_v2" "private_network" {
  name           = "nextjs-network"
  admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "private_subnet" {
  name            = "nextjs-subnet"
  network_id      = openstack_networking_network_v2.private_network.id
  cidr            = "192.168.1.0/24"
  ip_version      = 4
  dns_nameservers = ["1.1.1.1", "8.8.8.8"]
}

# Routeur pour connecter au réseau public
resource "openstack_networking_router_v2" "router" {
  name                = "nextjs-router"
  admin_state_up      = true
  external_network_id = data.openstack_networking_network_v2.public_network.id
}

resource "openstack_networking_router_interface_v2" "router_interface" {
  router_id = openstack_networking_router_v2.router.id
  subnet_id = openstack_networking_subnet_v2.private_subnet.id
}

# Groupe de sécurité
resource "openstack_networking_secgroup_v2" "secgroup" {
  name        = "nextjs-secgroup"
  description = "Security group for Next.js application"
}

# Règles de sécurité
resource "openstack_networking_secgroup_rule_v2" "secgroup_rule_ssh" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup.id
}

resource "openstack_networking_secgroup_rule_v2" "secgroup_rule_http" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 80
  port_range_max    = 80
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup.id
}

resource "openstack_networking_secgroup_rule_v2" "secgroup_rule_https" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 443
  port_range_max    = 443
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.secgroup.id
}

# Configuration de l'instance
resource "openstack_compute_instance_v2" "nextjs_instances" {
  count           = var.instance_count
  name            = "nextjs-app-${count.index + 1}"
  image_id        = var.image_id
  flavor_id       = var.flavor_id
  key_pair        = var.keypair_name
  security_groups = [openstack_networking_secgroup_v2.secgroup.name]

  network {
    uuid = openstack_networking_network_v2.private_network.id
  }

  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu
  EOF
}

# IP flottante pour chaque instance
resource "openstack_networking_floatingip_v2" "floatingip" {
  count = var.instance_count
  pool  = "Ext-Net"
}

resource "openstack_compute_floatingip_associate_v2" "floatingip_associate" {
  count       = var.instance_count
  floating_ip = openstack_networking_floatingip_v2.floatingip[count.index].address
  instance_id = openstack_compute_instance_v2.nextjs_instances[count.index].id
}

# Base de données (non créée par Terraform, à faire manuellement via OVH)
# Stockage objet (à configurer manuellement via OVH)

# Outputs
output "instance_ips" {
  value = [
    for i in range(var.instance_count) :
    "${openstack_compute_instance_v2.nextjs_instances[i].name}: ${openstack_networking_floatingip_v2.floatingip[i].address}"
  ]
}
```

Créez un fichier `variables.tf` pour les variables :

```hcl
# variables.tf
variable "region" {
  description = "OVH Region to deploy infrastructure (GRA, SBG, etc.)"
  default     = "GRA11"
}

variable "instance_count" {
  description = "Number of instances to provision"
  default     = 2
  type        = number
}

variable "image_id" {
  description = "ID of the Ubuntu image to use"
  default     = "Ubuntu 22.04"
}

variable "flavor_id" {
  description = "ID of the instance flavor to use"
  default     = "b2-7" # 7GB RAM, 2 vCPUs
}

variable "keypair_name" {
  description = "Name of the keypair to use"
}
```

Appliquez la configuration Terraform :

```bash
# Initialiser
terraform init

# Planifier
terraform plan -out=tfplan

# Appliquer
terraform apply "tfplan"
```

## Configuration du serveur

### 1. Connexion initiale

```bash
# Récupérer l'IP des instances
SSH_IP=$(terraform output -json instance_ips | jq -r '.[0]' | cut -d':' -f2 | tr -d ' ')

# Se connecter en SSH
ssh ubuntu@$SSH_IP
```

### 2. Configuration de Docker Swarm (pour clustering)

```bash
# Sur le premier nœud (manager)
docker swarm init --advertise-addr $(hostname -i)

# Récupérer le token pour les workers
JOIN_TOKEN=$(docker swarm join-token worker -q)
echo $JOIN_TOKEN

# Sur les autres nœuds (depuis votre machine en SSH)
ssh ubuntu@WORKER_IP "docker swarm join --token $JOIN_TOKEN MANAGER_IP:2377"

# Vérifier les nœuds
docker node ls
```

### 3. Structure de fichiers

```bash
# Créer la structure du projet
mkdir -p ~/nextjs-stack/{nginx,data,config,secrets,monitoring}
cd ~/nextjs-stack
```

### 4. Configuration Docker Compose

Créez un fichier `docker-compose.yml` :

```yaml
version: "3.8"

services:
  nextjs:
    image: ${REGISTRY:-ghcr.io/your-username}/nextjs-app:${TAG:-latest}
    deploy:
      mode: replicated
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
        max_attempts: 3
        window: 120s
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    configs:
      - source: app_config
        target: /app/config.json
    secrets:
      - source: app_secrets
        target: /app/secrets.json
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/api/health",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  nginx:
    image: nginx:stable-alpine
    deploy:
      mode: replicated
      replicas: 2
      placement:
        constraints: [node.role == worker]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - nginx-logs:/var/log/nginx
    depends_on:
      - nextjs
    networks:
      - app-network

configs:
  app_config:
    file: ./config/app-config.json

secrets:
  app_secrets:
    file: ./secrets/app-secrets.json

volumes:
  nginx-logs:
    driver: local

networks:
  app-network:
    driver: overlay
```

### 5. Configuration NGINX

Créez un fichier `nginx/conf.d/default.conf` :

```nginx
upstream nextjs_upstream {
    server nextjs:3000;
    keepalive 64;
}

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
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';";

    # Proxy configuration
    location / {
        proxy_pass http://nextjs_upstream;
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
        proxy_pass http://nextjs_upstream/_next/static/;
        proxy_cache_valid 60m;
        proxy_buffering on;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static/ {
        proxy_pass http://nextjs_upstream/static/;
        proxy_cache_valid 60m;
        proxy_buffering on;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
    }

    # Logs
    access_log /var/log/nginx/nextjs.access.log;
    error_log /var/log/nginx/nextjs.error.log;
}
```

## Déploiement de l'application

### 1. Configuration du Dockerfile pour Next.js

Créez un `Dockerfile` dans votre projet Next.js :

```Dockerfile
# Dockerfile - à la racine de votre projet Next.js
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

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper permissions
USER nextjs

# Expose port and define command
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Configuration du next.config.js

Modifiez votre `next.config.js` :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["your-domain.com", "storage.ovh.net"],
  },
  // Autres configurations...
};

module.exports = nextConfig;
```

### 3. CI/CD avec GitHub Actions

Créez un fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy to OVH Public Cloud

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

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ghcr.io/${{ github.repository_owner }}/nextjs-app
          tags: |
            type=sha,format=short
            type=ref,event=branch
            type=semver,pattern={{version}}
            latest

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to OVH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.OVH_HOST }}
          username: ${{ secrets.OVH_USERNAME }}
          key: ${{ secrets.OVH_SSH_KEY }}
          port: 22
          script: |
            cd ~/nextjs-stack
            export TAG=$(echo '${{ steps.meta.outputs.tags }}' | head -n 1 | cut -d':' -f2)
            export REGISTRY=ghcr.io/${{ github.repository_owner }}
            export DATABASE_URL=${{ secrets.DATABASE_URL }}
            docker stack deploy -c docker-compose.yml nextjs-stack --with-registry-auth
```

## Sécurisation

### 1. Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt-get update
sudo apt-get install -y certbot

# Générer des certificats
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copier les certificats
mkdir -p ~/nextjs-stack/nginx/ssl/live/yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/* ~/nextjs-stack/nginx/ssl/live/yourdomain.com/
sudo chown -R ubuntu:ubuntu ~/nextjs-stack/nginx/ssl
```

### 2. Renouvellement automatique

Créez un script de renouvellement `renew-certs.sh` :

```bash
#!/bin/bash
sudo certbot renew --quiet
sudo cp /etc/letsencrypt/live/yourdomain.com/* ~/nextjs-stack/nginx/ssl/live/yourdomain.com/
docker service update --force nextjs-stack_nginx
```

Configurez un cron job :

```bash
chmod +x renew-certs.sh
(crontab -l 2>/dev/null; echo "0 3 * * * ~/renew-certs.sh") | crontab -
```

## Monitoring et observabilité

### 1. Configuration de Prometheus et Grafana

Créez un fichier `docker-compose.monitoring.yml` :

```yaml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.console.libraries=/etc/prometheus/console_libraries"
      - "--web.console.templates=/etc/prometheus/consoles"
      - "--web.enable-lifecycle"
    deploy:
      placement:
        constraints: [node.role == manager]
    ports:
      - "9090:9090"
    networks:
      - monitoring-network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    deploy:
      placement:
        constraints: [node.role == manager]
    ports:
      - "3000:3000"
    networks:
      - monitoring-network

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - "--path.procfs=/host/proc"
      - "--path.rootfs=/rootfs"
      - "--path.sysfs=/host/sys"
      - "--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)"
    deploy:
      mode: global
    networks:
      - monitoring-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    deploy:
      mode: global
    networks:
      - monitoring-network

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring-network:
    driver: overlay
```

Créez la configuration Prometheus :

```bash
mkdir -p monitoring/prometheus
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    dns_sd_configs:
      - names:
        - 'tasks.node-exporter'
        type: 'A'
        port: 9100

  - job_name: 'cadvisor'
    dns_sd_configs:
      - names:
        - 'tasks.cadvisor'
        type: 'A'
        port: 8080

  - job_name: 'nextjs'
    metrics_path: /api/metrics
    dns_sd_configs:
      - names:
        - 'tasks.nextjs'
        type: 'A'
        port: 3000
EOF
```

### 2. Déploiement de la stack de monitoring

```bash
docker stack deploy -c docker-compose.monitoring.yml monitoring-stack
```

## Automatisation et CI/CD

### 1. Mise en place d'une chaîne de déploiement continue

Pour un déploiement continu plus avancé, utilisez un fichier de configuration `.github/workflows/deploy.yml` comme indiqué précédemment.

### 2. Tests automatisés

Ajoutez des tests automatisés à votre workflow GitHub Actions :

```yaml
# Extrait à ajouter au workflow
- name: Install dependencies
  run: npm ci

- name: Lint
  run: npm run lint

- name: Test
  run: npm test

- name: Type check
  run: npm run type-check
```

## Mise à l'échelle

### 1. Mise à l'échelle horizontale

Pour ajouter de nouveaux nœuds au cluster :

```bash
# Sur le manager
docker swarm join-token worker

# Sur le nouveau nœud
docker swarm join --token <TOKEN> <MANAGER-IP>:2377

# Mise à jour du nombre de répliques
docker service scale nextjs-stack_nextjs=5
```

### 2. Configuration de Load Balancer OVH

Configurez un Load Balancer OVH pour répartir le trafic entre vos instances :

1. Accédez au panneau de contrôle OVH
2. Créez un Load Balancer
3. Configurez les backends (adresses IP des instances)
4. Configurez le frontend (ports 80/443)
5. Activez la surveillance de santé

## Maintenance et mises à jour

### 1. Mises à jour du système

```bash
# Sur chaque nœud, programmez des mises à jour régulières
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Mises à jour Docker

```bash
# Vérifier les services
docker service ls

# Mettre à jour un service spécifique
docker service update --image ghcr.io/your-username/nextjs-app:new-tag nextjs-stack_nextjs
```

## Sauvegarde et reprise après sinistre

### 1. Configuration des sauvegardes

Créez un script de sauvegarde `backup.sh` :

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR

# Sauvegarde des configurations
tar -czf $BACKUP_DIR/nextjs_config_$TIMESTAMP.tar.gz -C ~/nextjs-stack nginx docker-compose.yml

# Nettoyer les anciennes sauvegardes
find $BACKUP_DIR -name "nextjs_*" -type f -mtime +14 -delete

# Télécharger sur OVH Object Storage
aws s3 cp $BACKUP_DIR/nextjs_config_$TIMESTAMP.tar.gz s3://votre-bucket/backups/ \
  --endpoint-url https://s3.gra.cloud.ovh.net
```

### 2. Plan de reprise après sinistre

Créez un document détaillant les étapes de reprise après sinistre :

1. Provisionner de nouvelles instances via Terraform
2. Restaurer les configurations depuis les sauvegardes
3. Redéployer les conteneurs Docker
4. Vérifier le fonctionnement de l'application

## Annexes

### Outils de surveillance supplémentaires

- Uptime Robot pour la surveillance externe
- Loki pour la centralisation des logs
- ELK Stack pour l'analyse des logs

### Documentation et ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Docker Swarm](https://docs.docker.com/engine/swarm/)
- [Documentation OVH Public Cloud](https://docs.ovh.com/fr/public-cloud/)
- [Terraform Registry](https://registry.terraform.io/providers/terraform-provider-openstack/openstack/latest)
