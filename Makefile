# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ebenoist <ebenoist@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/01/28 13:30:24 by emmab           #+#    #+#              #
#    Updated: 2026/04/14 21:01:36 by ebenoist         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

all: up

LOGIN		:= $(shell whoami)
DATA_PATH	:= /home/$(LOGIN)/data

up:
	mkdir -p /home/${USER}/data/mariadb /home/${USER}/data/wordpress /home/${USER}/data/grafana /home/${USER}/data/vault
	docker compose -f ./srcs/docker_compose.yml up -d --build

down:
	docker compose -f ./srcs/docker_compose.yml down

stop:
	docker compose -f ./srcs/docker_compose.yml stop

start:
	docker compose -f ./srcs/docker_compose.yml start

re: down up

clean: down
	docker system prune -af

fclean: clean
	sudo rm -rf /home/${USER}/data/mariadb/*
	sudo rm -rf /home/${USER}/data/wordpress/*
	sudo rm -rf /home/${USER}/data/grafana/*
	sudo rm -rf /home/${USER}/data/vault/*

status:
	docker ps

logs:
	docker compose -f ./srcs/docker_compose.yml logs -f

.PHONY: all up down stop start re clean fclean status logs