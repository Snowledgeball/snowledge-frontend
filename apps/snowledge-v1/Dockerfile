FROM node:18-slim

WORKDIR /app

# Installer les outils de build nécessaires
RUN apt-get update && apt-get install -y \
    openssl \
    build-essential \
    python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Désactiver le binary engine de Prisma qui cause des problèmes sur ARM64
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary

# Copier d'abord les fichiers de configuration pour installer les dépendances
COPY package.json .
COPY package-lock.json* .
COPY prisma ./prisma/
COPY next.config.ts .
COPY tsconfig.json .

# Installer les dépendances
RUN npm install

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste de l'application
COPY . .

# Reconstruire les modules natifs
RUN npm rebuild bcrypt --build-from-source

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "dev"]
