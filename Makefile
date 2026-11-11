.PHONY: help dev-up dev-down dev-logs run build test clean

help: ## Tampilkan daftar perintah yang tersedia
	@echo "Perintah yang tersedia untuk DistribuCore:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev-up: ## Jalankan container PostgreSQL & Redis di background
	docker compose up -d

dev-down: ## Hentikan container PostgreSQL & Redis
	docker compose down

dev-logs: ## Pantau log container database
	docker compose logs -f

run: ## Jalankan Backend Fiber API lokal
	cd apps/api && go run cmd/server/main.go

build: ## Kompilasi binary Backend API ke apps/api/bin/server
	cd apps/api && go build -o bin/server cmd/server/main.go

test: ## Jalankan seluruh unit & integration test Go
	cd apps/api && go test -v -race ./...

clean: ## Bersihkan file binary hasil kompilasi
	rm -rf apps/api/bin
