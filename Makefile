# FlowNote Development Commands
# Usage: make <command>

.PHONY: help dev up down logs clean db-shell test

# Default target
help:
	@echo "FlowNote Development Commands"
	@echo ""
	@echo "Usage: make <command>"
	@echo ""
	@echo "Commands:"
	@echo "  dev          Start all services with live output"
	@echo "  up           Start all services in background"
	@echo "  down         Stop all services"
	@echo "  logs         View all logs"
	@echo "  logs-b       View backend logs"
	@echo "  logs-f       View frontend logs"
	@echo "  clean        Stop and remove all containers, volumes"
	@echo "  db-shell     Open PostgreSQL shell"
	@echo "  db-reset     Reset database (destructive)"
	@echo "  test         Run all tests in containers"
	@echo "  test-e2e     Run E2E tests"
	@echo "  tools        Start with optional tools (Adminer)"
	@echo ""

# ============================================
# Core Commands
# ============================================

dev:
	docker compose -f docker-compose.dev.yml up --build

up:
	docker compose -f docker-compose.dev.yml up -d --build

down:
	docker compose -f docker-compose.dev.yml down

restart:
	docker compose -f docker-compose.dev.yml restart

rebuild:
	docker compose -f docker-compose.dev.yml up -d --build --force-recreate

# ============================================
# Logs
# ============================================

logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-b:
	docker compose -f docker-compose.dev.yml logs -f backend

logs-f:
	docker compose -f docker-compose.dev.yml logs -f frontend

logs-db:
	docker compose -f docker-compose.dev.yml logs -f db

# ============================================
# Database
# ============================================

db-shell:
	docker compose -f docker-compose.dev.yml exec db psql -U flownote -d flownote_dev

db-reset:
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.dev.yml up -d db
	@echo "Waiting for database..."
	@sleep 5
	docker compose -f docker-compose.dev.yml exec backend npm run migration:run

# ============================================
# Testing
# ============================================

test:
	docker compose -f docker-compose.dev.yml exec backend npm test

test-e2e:
	docker compose -f docker-compose.dev.yml exec backend npm run test:e2e

test-cov:
	docker compose -f docker-compose.dev.yml exec backend npm run test:cov

# ============================================
# Cleanup
# ============================================

clean:
	docker compose -f docker-compose.dev.yml down -v --rmi local --remove-orphans
	docker system prune -f

clean-all:
	docker compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	docker system prune -af

# ============================================
# Optional Tools
# ============================================

tools:
	docker compose -f docker-compose.dev.yml --profile tools up -d

# ============================================
# Status & Health
# ============================================

status:
	docker compose -f docker-compose.dev.yml ps

health:
	@echo "=== Service Health ==="
	@docker compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "=== Backend Health ==="
	@curl -s http://localhost:3000/health || echo "Backend not responding"
	@echo ""
	@echo "=== Frontend Health ==="
	@curl -s http://localhost:5173 > /dev/null && echo "Frontend OK" || echo "Frontend not responding"
