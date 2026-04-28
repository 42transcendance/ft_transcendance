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

