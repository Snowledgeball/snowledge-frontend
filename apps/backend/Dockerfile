FROM node:22

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Installer NestJS CLI globalement
RUN npm install -g @nestjs/cli

# Installer les dépendances du projet
RUN npm install && npm cache clean --force

# Copier le reste du code source
COPY . .

# Exposer le port
EXPOSE 3002

# Commande de démarrage
CMD ["npm", "run", "dev"]