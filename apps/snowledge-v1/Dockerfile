FROM node:22

WORKDIR /app

# Désactiver le binary engine de Prisma qui cause des problèmes sur ARM64
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY next.config.ts tsconfig.json ./

# Installer les dépendances
RUN npm install && \
    npx prisma generate && \
    npm cache clean --force

# Copier le reste de l'application
COPY . .

# Reconstruire les modules natifs (si nécessaire)
RUN npm rebuild bcrypt --build-from-source

# Exposer le port
EXPOSE 3005

# Commande de démarrage
CMD ["npm", "run", "dev"]
