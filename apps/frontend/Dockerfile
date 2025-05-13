FROM node:22

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./
COPY tsconfig.json next.config.ts ./

# Installer les dépendances du projet
RUN npm install && npm cache clean --force

# Copier le reste du code source
COPY . .

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "run", "dev", "--", "--port", "3001"] 