.PHONY: help install dev build start stop clean logs

help:
	@echo "URL Shortener - Available Commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development servers"
	@echo "  make build      - Build for production"
	@echo "  make docker-up  - Start with Docker Compose"
	@echo "  make docker-down - Stop Docker Compose"
	@echo "  make logs       - View Docker logs"
	@echo "  make clean      - Clean all dependencies"

install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed!"

dev:
	@echo "Starting development servers..."
	@echo "Make sure PostgreSQL and Redis are running!"
	@cd backend && npx prisma migrate dev && npm run dev &
	@cd frontend && npm run dev &

build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✅ Build complete!"

docker-up:
	@echo "Starting Docker Compose..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"

docker-down:
	@echo "Stopping Docker Compose..."
	docker-compose down
	@echo "✅ Services stopped!"

logs:
	docker-compose logs -f

clean:
	@echo "Cleaning dependencies..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist
	@echo "✅ Cleaned!"
