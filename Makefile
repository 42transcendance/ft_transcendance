# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: dbhujoo <dbhujoo@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/01/28 13:30:24 by dbhujoo           #+#    #+#              #
#    Updated: 2026/04/16 15:20:26 by dbhujoo          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

all: up

up:
	mkdir -p /home/${USER}/data/grafana /home/${USER}/data/elasticsearch
	docker compose -f ./docker_compose.yml up -d --build

down:
	docker compose -f ./docker_compose.yml down

stop:
	docker compose -f ./docker_compose.yml stop

start:
	docker compose -f ./docker_compose.yml start

re: down up

clean: down
	docker system prune -af

fclean: clean
	rm -rf /home/${USER}/data/grafana/*
	rm -rf /home/${USER}/data/elasticsearch/*

status:
	docker ps

logs:
	docker compose -f ./docker_compose.yml logs -f

.PHONY: all up down stop start re clean fclean status logs