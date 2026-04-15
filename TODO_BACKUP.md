# 🔄 Backup & Disaster Recovery — TODO

## 1. Créer le container backup
- [ ] Créer `srcs/requirements/bonus/backup/Dockerfile`
  - Base : `debian:bookworm`
  - Installer les clients nécessaires selon tes services (ex: client DB, `cron`, `gzip`, `tar`)
- [ ] Créer `srcs/requirements/bonus/backup/tools/entrypoint.sh`
  - Lance le cron daemon en foreground

## 2. Script de backup (`backup.sh`)
- [ ] Créer `srcs/requirements/bonus/backup/tools/backup.sh`
- [ ] Pour chaque **base de données** :
  ```
  # Dump de la DB (adapter la commande selon le SGBD utilisé)
  <db_dump_command> | gzip > /backups/db/backup_$(date +%Y%m%d_%H%M).sql.gz
  ```
- [ ] Pour chaque **volume de données** (fichiers applicatifs, uploads, etc.) :
  ```
  tar -czf /backups/data/backup_$(date +%Y%m%d_%H%M).tar.gz -C /chemin/du/volume .
  ```
- [ ] Rotation : garder les N derniers backups, supprimer les plus anciens
  ```
  ls -t /backups/db/*.sql.gz | tail -n +$((N+1)) | xargs rm -f
  ls -t /backups/data/*.tar.gz | tail -n +$((N+1)) | xargs rm -f
  ```
- [ ] Crontab : définir la fréquence
  ```
  0 * * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
  ```

## 3. Script de restore (`restore.sh`)
- [ ] Créer `srcs/requirements/bonus/backup/tools/restore.sh`
- [ ] Restore la DB depuis le dernier dump :
  ```
  gunzip < /backups/db/LATEST.sql.gz | <db_restore_command>
  ```
- [ ] Restore les fichiers depuis la dernière archive :
  ```
  tar -xzf /backups/data/LATEST.tar.gz -C /chemin/du/volume/
  ```
- [ ] Gérer les permissions après restauration

## 4. Docker Compose — ajouter le service
- [ ] Ajouter dans `docker_compose.yml` :
  ```yaml
  backup:
    build:
      context: requirements/bonus/backup
      dockerfile: Dockerfile
    container_name: backup
    networks:
      - ft_transcendance
    restart: on-failure
    env_file: .env
    secrets:
      - <les secrets nécessaires pour accéder à la DB>
    volumes:
      - <volume_app>:/chemin/app:ro        # lecture seule pour backup
      - backups:/backups                    # stockage des sauvegardes
    depends_on:
      - <service_db>
      - <service_app>
  ```
- [ ] Ajouter le volume `backups` :
  ```yaml
  backups:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /home/dbhujoo/data/backups
  ```

## 5. Makefile — ajouter les targets
- [ ] `make backup` : déclenche un backup manuellement
  ```
  docker exec backup /usr/local/bin/backup.sh
  ```
- [ ] `make restore` : restaure depuis le dernier backup
  ```
  docker exec backup /usr/local/bin/restore.sh
  ```
- [ ] Créer les dossiers backup dans la target de setup :
  ```
  mkdir -p /home/dbhujoo/data/backups/db
  mkdir -p /home/dbhujoo/data/backups/data
  ```

## 6. Test disaster recovery
- [ ] Vérifier que les backups se créent (`ls /home/dbhujoo/data/backups/`)
- [ ] `make fclean` → tout détruire
- [ ] `make re` → tout remonter from scratch
- [ ] `make restore` → restaurer les données depuis le backup
- [ ] Vérifier que tout est revenu comme avant

## ⚠️ À compléter quand tu connais ton stack
- [ ] Quel(s) SGBD (PostgreSQL, MariaDB, MongoDB, ...) → adapter le client + les commandes dump/restore
- [ ] Quels volumes de données sauvegarder
- [ ] Quels secrets sont nécessaires pour accéder à la DB
- [ ] La fréquence de backup (toutes les heures ? tous les jours ?)
- [ ] Le nombre de backups à garder en rotation (N)
