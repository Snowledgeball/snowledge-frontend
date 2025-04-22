FROM node:18-alpine AS base

# Dossier de travail
WORKDIR /app

# Installation des dépendances
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Construction de l'application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Génération du modèle Prisma et build de l'application
RUN npx prisma generate
RUN npm run build

# Image de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copie des fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Exposition du port 3000
EXPOSE 3000

# Variable d'environnement pour écouter sur toutes les interfaces
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Commande de démarrage
CMD ["node", "server.js"] 