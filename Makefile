.PHONY: setup setup-dev run run-dev stop stop-dev deploy start-workers stop-workers install-dependencies restart-dev

setup:
	docker compose -f compose.prod.yaml build

setup-dev:
	docker compose -f compose.dev.yaml build

run:
	docker compose -f compose.prod.yaml up -d

run-dev:
	docker compose -f compose.dev.yaml up -d --remove-orphans

stop:
	docker compose -f compose.prod.yaml down

stop-dev:
	docker compose -f compose.dev.yaml down

restart-dev:
	docker compose -f compose.dev.yaml down
	docker compose -f compose.dev.yaml build
	docker compose -f compose.dev.yaml up -d --remove-orphans

install-dependencies:
	sudo apt update && sudo apt install ffmpeg

_pull:
	git pull

deploy: _pull setup run

start-workers:
	@echo "Iniciando workers em background..."
	@nohup $(shell pwd)/scripts/run_workers.sh > workers.log 2>&1 &
	@echo "Workers iniciados com sucesso! Verifique workers.log para logs."

stop-workers:
	@echo "Parando workers..."
	@pkill -f run_workers.sh || true
	@echo "Workers parados com sucesso!"
