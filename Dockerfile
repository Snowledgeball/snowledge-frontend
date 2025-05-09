FROM node:18

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./
COPY turbo.json ./

# Installer les dépendances globales
RUN npm install -g turbo

# Installer les dépendances du projet racine
RUN npm install

# Copier le reste du code source
COPY . .

# Installer les dépendances de tous les sous-projets avec --force
RUN npm install --workspaces --force

# Exposer les ports
EXPOSE 3000 3001 3002

# Commande de démarrage par défaut
CMD ["npm", "run", "dev"] 