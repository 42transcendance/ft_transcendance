# ft_transcendance — User Management & Architecture Nuxt 3
 
## 📋 Table des matières
 
- [Vue d'ensemble](#-vue-densemble)
- [Stack technique](#-stack-technique)
- [Architecture des fichiers](#-architecture-des-fichiers)
- [Fonctionnalités](#-fonctionnalités)
- [Flux d'authentification](#-flux-dauthentification)
- [API Server](#-api-server)
- [Composables](#-composables)
---
 
## 🌐 Vue d'ensemble
 
Cette partie du projet **ft_transcendance** couvre la gestion des utilisateurs et la personnalisation des profils. Elle est développée avec **Nuxt 3** et **TypeScript**, et assure l'authentification, la recherche d'utilisateurs, l'édition de profil et l'upload d'avatars.
 
---
 
## 🛠 Stack technique
 
| Couche | Technologie |
|---|---|
| Frontend | Nuxt 3 (Vue.js), TypeScript, CSS Scoped |
| Backend | Nitro (H3 server), Node.js FS |
| Base de données | Prisma ORM |
| Stockage | Upload local avec nommage UUID |
 
---
 
## 📁 Architecture des fichiers
 
```text
src/
├── app/
│   ├── components/
│   │   ├── NavBtns/                  # Boutons de navigation
│   │   │   ├── GameBtn.vue           # Accès à la page de jeu
│   │   │   ├── HomeBtn.vue           # Retour à l'accueil
│   │   │   ├── LoginBtn.vue          # Bouton de connexion
│   │   │   ├── LogoutBtn.vue         # Bouton de déconnexion
│   │   │   ├── ProfileBtn.vue        # Accès au profil utilisateur
│   │   │   ├── SearchBar.vue         # Barre de recherche d'utilisateurs
│   │   │   ├── SigninBtn.vue         # Bouton d'inscription
│   │   │   └── TitleBtn.vue          # Bouton titre / logo
│   │   ├── NavTypes/                 # Variantes de la barre de navigation
│   │   │   ├── GuestBar.vue          # Nav pour utilisateurs non connectés
│   │   │   └── UserBar.vue           # Nav pour utilisateurs connectés
│   │   ├── Navbar.vue                # Composant racine de navigation
│   │   └── Profile.vue               # Composant d'affichage du profil
│   │
│   ├── composables/
│   │   ├── useAuth.ts                # Logique d'authentification (login, logout, create, currentUser)
│   │   └── useProfile.ts             # Logique de chargement et mise à jour du profil
│   │
│   ├── layouts/
│   │   └── default.vue               # Layout global (Navbar + profile window)
│   │
│   ├── middleware/
│   │   └── auth.ts                   # Garde de navigation (vérifie le cookie auth_token)
│   │
│   └── pages/
│       ├── game/                     # Page de jeu
│       ├── profile/
│       │   └── [id].vue              # Page de profil dynamique par ID utilisateur
│       ├── index.vue                 # Page d'accueil
│       ├── login.vue                 # Page de connexion
│       ├── rules.vue                 # Règles du jeu
│       └── signin.vue                # Page d'inscription
│
├── prisma/                           # Schéma et migrations Prisma (ORM)
│
└── server/
    ├── api/
    │   └── users/
    │       ├── [id].ts               # GET — Récupération d'un utilisateur par ID
    │       ├── auth.get.ts           # GET — Vérification du token d'authentification
    │       ├── create.post.ts        # POST — Création d'un nouvel utilisateur
    │       ├── login.post.ts         # POST — Connexion et émission du cookie
    │       ├── logout.post.ts        # POST — Déconnexion et suppression du cookie
    │       ├── search.get.ts         # GET — Recherche d'utilisateur par nom
    │       └── upload-avatar.post.ts # POST — Upload et validation de l'avatar
    └── routes/
        └── uploads/
            └── [file].get.ts         # GET — Serveur de fichiers statiques (avatars)
```
 
---
 
## 🚀 Fonctionnalités
 
### 🔍 Recherche d'utilisateurs
 
- **`SearchBar.vue`** — Barre de recherche réactive intégrée à la navigation.
- Requête vers `/api/users/search` à chaque saisie.
- Chargement des données via le composable `useProfile.ts`.
- Ouverture du layout profile si l'utilisateur est trouvé.
- Feedback visuel (placeholder dynamique, couleur d'erreur) si aucun résultat.
### 👤 Gestion du profil
 
- **`/profile/[id].vue`** — Page dynamique paramétrée par l'ID utilisateur.
- **Upload d'avatar** — Prévisualisation côté client instantanée + envoi vers `/api/users/upload-avatar`.
### 🔐 Authentification & Sécurité
 
- **`middleware/auth.ts`** — Protège les routes sensibles côté client et serveur (SSR).
- Vérification du cookie `auth_token` avant chaque navigation.
- **`/api/users/auth.get.ts`** — Endpoint de validation du token côté serveur.
- **Upload sécurisé** — Contrôle strict du type MIME et de la taille des fichiers.
- Nommage des avatars par **UUID** pour éviter les collisions.
### 🧭 Navigation contextuelle
 
- **`GuestBar.vue`** — Affiche les boutons Login et Sign In pour les visiteurs.
- **`UserBar.vue`** — Affiche les boutons Profile et Logout pour les utilisateurs connectés.
- Le composant `Navbar.vue` bascule entre les deux variantes selon l'état d'authentification.
---
 
## 🔑 Flux d'authentification
 
```
Utilisateur
    │
    ├─► [GET] /api/users/auth     ← Vérifie le cookie auth_token à chaque navigation
    │         │
    │         ├── Valide   → Accès autorisé, données utilisateur disponibles
    │         └── Invalide → Redirection vers /login (via middleware auth.ts)
    │
    ├─► [POST] /api/users/login   ← Identifiants envoyés
    │         │
    │         └── Succès → Émission du cookie auth_token + redirection
    │
    ├─► [POST] /api/users/create  ← Inscription d'un nouvel utilisateur
    │
    └─► [POST] /api/users/logout  ← Suppression du cookie + redirection
```
 
---
 
## 🌐 API Server
 
Tous les endpoints sont exposés sous `/api/users/` via le serveur **Nitro (H3)**.
 
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/users/auth` | Vérifie la validité du token d'auth |
| `GET` | `/api/users/search` | Recherche un utilisateur par nom |
| `GET` | `/api/users/:id` | Récupère le profil d'un utilisateur |
| `POST` | `/api/users/create` | Crée un nouveau compte utilisateur |
| `POST` | `/api/users/login` | Connecte un utilisateur et pose le cookie |
| `POST` | `/api/users/logout` | Déconnecte et supprime le cookie |
| `POST` | `/api/users/upload-avatar` | Upload et valide l'image de profil |
| `GET` | `/uploads/:file` | Sert les fichiers d'avatars statiques |
 
---
 
## 🧩 Composables
 
### `useAuth.ts`
Centralise la logique d'authentification :
- État réactif de l'utilisateur connecté.
- Fonctions `login()`, `logout()`, `create()`.
### `useProfile.ts`
Update des données liées à la recherche de profils et au layout associé

# 🔐 Cybersecurity Module — WAF/ModSecurity + HashiCorp Vault

**Module type:** Major (2 points)  
**Implemented by:** ebenoist  
**Project:** ft_transcendence — École 42 Paris

---

## Overview

This module implements a hardened security layer in front of the application stack, combining:

- **ModSecurity** (WAF) — a Web Application Firewall that inspects and filters all incoming HTTP traffic
- **OWASP Core Rule Set (CRS)** — 913 rules that detect and block the most common web attacks
- **HashiCorp Vault** — a secrets management system that encrypts and isolates all sensitive credentials

---

## Architecture

```
Internet
    ↓
nginx + ModSecurity (port 8443 HTTPS / 8080 HTTP)
    ↓  ← OWASP CRS: 913 rules active
    ↓  ← TLS 1.2/1.3 encryption
    ↓
If request is clean → proxy_pass to Nuxt app (port 3000)
If request is malicious → 403 Forbidden
    ↓
Nuxt.js application
    ↓
PostgreSQL database
    ↑
HashiCorp Vault (port 8200)
← stores all secrets (DB credentials, API keys, JWT secrets)
← auto-unseal on container startup
```

All services run in a shared Docker network (`service_mesh`) and are orchestrated via `docker-compose.yml`.

---

## WAF — ModSecurity + nginx

### What it does

ModSecurity is integrated as an nginx module. Every HTTP request passes through it before reaching the application. The OWASP Core Rule Set (CRS) provides the detection rules.

### Configuration

**File:** `security/nginx/modsecurity/modsecurity.conf`

```
SecRuleEngine On
SecRequestBodyAccess On
SecResponseBodyAccess On
SecResponseBodyMimeType text/plain text/html application/json
Include /etc/modsecurity/crs/crs-setup.conf
Include /usr/share/modsecurity-crs/rules/*.conf
```

- `SecRuleEngine On` — active blocking mode (not just detection)
- `SecRequestBodyAccess On` — inspects POST body (catches form-based attacks)
- `SecResponseBodyAccess On` — inspects responses (catches data leaks)

### nginx configuration

**File:** `security/nginx/nginx.conf`

The nginx.conf file is the main configuration file for nginx. It tells nginx exactly how to behave as a web server and reverse proxy.

1. Loads the ModSecurity module
	-load_module modules/ngx_http_modsecurity_module.so;

2. Activates ModSecurity globally
	modsecurity on;
	modsecurity_rules_file /etc/modsecurity/modsecurity.conf;

3. Redirects HTTP to HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}

4. Handles HTTPS connections
server {
    listen 443 ssl;
    ssl_certificate     /etc/nginx/ssl/transcendence.crt;
    ssl_certificate_key /etc/nginx/ssl/transcendence.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
}

5. Forwards clean requests to the Nuxt app
location / {
    proxy_pass http://app:3000;
}

Once a request passes ModSecurity inspection, nginx forwards it to the Nuxt application running on port 3000 inside the Docker network.

Summary in one sentence
nginx.conf is the brain of the nginx container — it defines the traffic flow from the outside world to your application, enforcing HTTPS encryption and ModSecurity filtering on every single request.

### SSL/TLS

A self-signed certificate is generated at build time inside the nginx Dockerfile:

TLS (Transport Layer Security) is a cryptographic protocol that creates a secure, encrypted tunnel between a client (browser) and a server (nginx). It ensures that nobody can read or tamper with the data in transit.

HTTPS = HTTP + TLS

### Attacks blocked (tested and confirmed)

| Attack type | Example payload | Result |
|-------------|----------------|--------|
| SQL Injection | `?id=1' OR '1'='1` | 403 Forbidden ✅ |
| XSS | `?q=<script>alert(1)</script>` | 403 Forbidden ✅ |
| Path Traversal | `?file=../../etc/passwd` | 403 Forbidden ✅ |
| Remote Code Execution | `?cmd=; rm -rf /` | 403 Forbidden ✅ |
| Scanner Detection | Nikto, sqlmap user-agents | 403 Forbidden ✅ |
| Local File Inclusion | `?page=../../../../etc/shadow` | 403 Forbidden ✅ |

### OWASP CRS rules loaded

```
ModSecurity-nginx v1.0.3 (rules loaded inline/local/remote: 0/913/0)
```

Key rule files active:
- `REQUEST-941-APPLICATION-ATTACK-XSS.conf`
- `REQUEST-942-APPLICATION-ATTACK-SQLI.conf`
- `REQUEST-930-APPLICATION-ATTACK-LFI.conf`
- `REQUEST-932-APPLICATION-ATTACK-RCE.conf`
- `REQUEST-912-DOS-PROTECTION.conf`
- `REQUEST-913-SCANNER-DETECTION.conf`
- And 30+ more...

---

## HashiCorp Vault — Secrets Management

### What it does

In a standard project, sensitive credentials (database passwords, API keys, JWT
secrets) are stored in plain '/secrets'. This is a security risk — if someone
gains access to the filesystem, all secrets are immediately readable.

Vault solves this by acting as an **encrypted secrets store**. Instead of reading
credentials from a plain file, services query Vault at startup using a token.
Vault verifies the token, then returns the decrypted secret. All data stored in
Vault is encrypted at rest using AES-256.
Without Vault:                    With Vault:
.env file (plain text)            Vault (AES-256 encrypted)
POSTGRES_PASSWORD=transcendence   secret/transcendence/postgres
← anyone with file access         ← only accessible with a valid token
can read this                     and only when Vault is unsealed


### How Vault starts — the seal/unseal mechanism

Vault uses a **seal/unseal** system to protect secrets even if the physical disk
is stolen. When Vault starts, all its data is encrypted and inaccessible — this
is the **sealed** state. To make secrets accessible, an unseal key must be
provided.

**File:** `security/vault/tools/init.sh`

The script handles two scenarios automatically :


### Security model — full flow
Docker starts the vault container
↓
Vault boots in SEALED state
(all data encrypted — nothing accessible)
↓
init.sh runs automatically
↓
vault operator unseal $UNSEAL_KEY
↓
Vault is now UNSEALED
(secrets decrypted in memory — accessible via API)
↓
Service requests a secret with a valid token:
GET /v1/secret/transcendence/postgres
X-Vault-Token: hvs.xxxxxxxxxxxx
↓
Vault verifies the token → returns decrypted value
↓
Without a valid token:
{"errors": ["permission denied"]}

The unseal key and root token are stored in `secrets/postgres.env`
(gitignored) as a backup in case the Docker volume is lost.

### Why does Postgres get its credentials from the secret folder? 

PostgreSQL is an infrastructure service that starts before everything else — it needs its credentials immediately. Vault is used to protect secrets used by the application, which can query Vault dynamically. This is the standard DevSecOps approach: Vault is used for application secrets, not to bootstrap the infrastructure itself.

### Proof of access control

```bash
# Attempting to read secrets without a token → access denied
curl http://localhost:8200/v1/secret/transcendence/postgres
{"errors":["permission denied"]}

# Vault is running and unsealed
curl http://localhost:8200/v1/sys/health
{"initialized":true,"sealed":false,"standby":false,...}

# Reading secrets with a valid root token
curl -H "X-Vault-Token: hvs.xxxxxxxxxxxx" \
     http://localhost:8200/v1/secret/transcendence/postgres
{"data":{"database_url":"postgresql://...","password":"...","user":"..."}}
```


## How to run

```bash
# Build and start all services (postgres, vault, app, nginx)
make up

# Verify all four containers are running
make status

# Test that ModSecurity blocks SQL injection
curl -k "https://localhost:8443/?id=1%27%20OR%20%271%27%3D%271"
# → 403 Forbidden

# Test that ModSecurity blocks XSS
curl -k "https://localhost:8443/?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
# → 403 Forbidden

# Test that Vault rejects unauthenticated requests
curl http://localhost:8200/v1/secret/transcendence/postgres
# → {"errors":["permission denied"]}

# Access Vault web UI
# URL   : http://localhost:8200
# Method: Token
# Token : value of VAULT_ROOT_TOKEN in secrets/postgres.env
```
## Why this module matters

In a production environment, these two components are industry standards:

- **ModSecurity + OWASP CRS** is used by major companies to protect their APIs and web applications from the OWASP Top 10 vulnerabilities
- **HashiCorp Vault** is the reference tool for secrets management in DevSecOps environments — used by Thales, Airbus, BNP Paribas, and many others

