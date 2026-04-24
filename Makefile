# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: dbhujoo <dbhujoo@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/01/28 13:30:24 by dbhujoo           #+#    #+#              #
#    Updated: 2026/04/24 10:38:58 by dbhujoo          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

DOCKER_COMPOSE		= docker compose -f ./docker_compose.yml
PODMAN_COMPOSE		= PUID=$(shell id -u) podman-compose -f ./docker_compose_podman.yml
DATA_DIRS		= /home/${USER}/data/grafana /home/${USER}/data/elasticsearch
 
all: up
 
# ── Docker targets ────────────────────────────────────────────────────────────
 
up:
	mkdir -p $(DATA_DIRS)
	$(DOCKER_COMPOSE) up -d --build
 
down:
	$(DOCKER_COMPOSE) down
 
stop:
	$(DOCKER_COMPOSE) stop
 
start:
	$(DOCKER_COMPOSE) start
 
re: down up
 
clean: down
	docker system prune -af
 
fclean: clean
	rm -rf /home/${USER}/data/grafana/*
	rm -rf /home/${USER}/data/elasticsearch/*
 
status:
	docker ps
 
logs:
	$(DOCKER_COMPOSE) logs -f
 
# ── Podman targets (école 42 — rootless) ─────────────────────────────────────
 
podman-up:
	mkdir -p $(DATA_DIRS)
	systemctl --user start podman.socket
	$(PODMAN_COMPOSE) up -d --build
 
podman-down:
	$(PODMAN_COMPOSE) down
 
podman-stop:
	$(PODMAN_COMPOSE) stop
 
podman-start:
	$(PODMAN_COMPOSE) start
 
podman-re: podman-down podman-up
 
podman-clean: podman-down
	podman system prune -af
 
podman-fclean: podman-clean
	podman unshare rm -rf ~/data/grafana/*
	podman unshare rm -rf ~/data/elasticsearch/*
	
podman-status:
	podman ps
 
podman-logs:
	$(PODMAN_COMPOSE) logs -f
 
.PHONY: all up down stop start re clean fclean status logs \
        podman-up podman-down podman-stop podman-start podman-re \
        podman-clean podman-fclean podman-status podman-logs
