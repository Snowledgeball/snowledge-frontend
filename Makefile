.PHONY: up down restart logs ps import-ovh backup clean reset help rebuild

# Variables
COMPOSE = docker-compose

help:
	@echo "Commandes disponibles :"
	@echo "  make up        - Démarrer tous les conteneurs"
	@echo "  make down      - Arrêter tous les conteneurs"
	@echo "  make restart   - Redémarrer tous les conteneurs"
	@echo "  make logs      - Afficher les logs de tous les conteneurs"
	@echo "  make ps        - Afficher l'état des conteneurs"
	@echo "  make import-ovh - Importer la base de données depuis OVH"
	@echo "  make backup    - Créer une sauvegarde de la base de données locale"
	@echo "  make clean     - Nettoyer les volumes Docker (DANGER: perte de données)"
	@echo "  make reset     - Réinitialiser tout l'environnement (DANGER: perte de données)"
	@echo "  make rebuild   - Reconstruire complètement le projet"

# Démarrer les conteneurs
up:
	$(COMPOSE) up -d
	@echo "✅ Tous les services sont démarrés"
	@echo "📊 Frontend: http://localhost:3001"
	@echo "🔌 Backend: http://localhost:3002"
	@echo "🚀 Snowledge-v1: http://localhost:3000"

# Arrêter les conteneurs
down:
	$(COMPOSE) down
	@echo "✅ Tous les services sont arrêtés"

# Redémarrer les conteneurs
restart: down up

# Afficher les logs
logs:
	$(COMPOSE) logs -f

# État des conteneurs
ps:
	$(COMPOSE) ps

# Importer depuis OVH
import-ovh:
	@echo "🔄 Import depuis OVH..."
	@./database/dump_from_ovh.sh
	@echo "🔄 Redémarrage des conteneurs pour appliquer les changements..."
	@$(COMPOSE) restart postgres
	@echo "✅ Base de données importée avec succès"

# Sauvegarder la base locale
backup:
	@echo "🔄 Sauvegarde de la base de données locale..."
	@$(COMPOSE) exec postgres pg_dump -U postgres -d snowledge -F c -f /backup/snowledge_backup.sql
	@echo "✅ Sauvegarde créée avec succès : ./database/backup/snowledge_backup.sql"

# Nettoyer volumes (DANGER)
clean:
	@echo "⚠️ ATTENTION: Cette action va supprimer toutes les données dans les volumes Docker"
	@echo "Appuyez sur Ctrl+C pour annuler ou sur Entrée pour continuer"
	@read confirmation
	$(COMPOSE) down -v
	@echo "✅ Volumes nettoyés"

# Réinitialiser tout (DANGER)
reset:
	@echo "⚠️ ATTENTION: Cette action va tout réinitialiser (volumes, images, conteneurs)"
	@echo "Appuyez sur Ctrl+C pour annuler ou sur Entrée pour continuer"
	@read confirmation
	$(COMPOSE) down -v --rmi all
	rm -rf ./database/backup/*.sql
	@echo "✅ Environnement réinitialisé"

# Rebuild from scratch
rebuild:
	@echo "🔄 Reconstruire complètement le projet..."
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "✅ Reconstruction terminée" 