# Prisma — Guide complet

## C'est quoi Prisma ?

Prisma est un **ORM** (Object-Relational Mapper) pour Node.js et TypeScript. Il fait le lien entre ton code JavaScript et ta base de données PostgreSQL.

Sans Prisma, tu écris du SQL brut :
```sql
SELECT * FROM "User" WHERE email = 'test@test.com';
```

Avec Prisma, tu écris du JavaScript :
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'test@test.com' }
});
```

Prisma génère le SQL pour toi, gère les relations entre tables, et te donne un client entièrement typé.

---

## Installation

```bash
npm install @prisma/client
npm install --save-dev prisma
```

Initialiser Prisma dans ton projet :
```bash
npx prisma init
```

Ça crée :
```
prisma/
└── schema.prisma   ← fichier de configuration
.env                ← contient DATABASE_URL
```

---

## Le fichier schema.prisma

C'est la source de vérité de ta base de données. Il contient trois parties :

### 1. Connexion à la DB
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Générateur de client
```prisma
generator client {
  provider = "prisma-client-js"
}
```

### 3. Tes modèles (= tes tables)
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String
  password  String
  createdAt DateTime @default(now())
}
```

Chaque `model` = une table PostgreSQL.
Chaque ligne = une colonne.

---

## Le fichier .env

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ma_base
```

Format : `postgresql://USER:PASSWORD@HOST:PORT/NOM_DB`

> Ne jamais commit le `.env` — ajoute-le dans `.gitignore`.
> Fournis toujours un `.env.example` avec les clés sans valeurs.

---

## Les migrations

Une migration est un fichier SQL généré automatiquement par Prisma.
Il décrit les changements à appliquer à la base de données.

Les migrations sont stockées dans `prisma/migrations/` et versionnées avec Git.

### Workflow

```
Tu modifies schema.prisma
        ↓
npx prisma migrate dev --name nom_migration
        ↓
Prisma génère le SQL et l'applique à la DB
        ↓
Tu commit prisma/migrations/
        ↓
Tes collègues font npx prisma migrate deploy
```

---

## Commandes essentielles

### Développement

```bash
# Créer et appliquer une nouvelle migration
npx prisma migrate dev --name init

# Régénérer le client après modification du schéma
npx prisma generate

# Ouvrir l'interface visuelle de la DB (port 5555)
npx prisma studio

# Réinitialiser complètement la DB (⚠ supprime toutes les données)
npx prisma migrate reset
```

### Production / Docker

```bash
# Appliquer les migrations existantes sans en créer de nouvelles
npx prisma migrate deploy
```

### Via le Makefile du projet

```bash
make migrate-dev    # crée une nouvelle migration
make migrate        # applique les migrations (prod)
make generate       # régénère le client
make studio         # ouvre Prisma Studio
make db-reset       # remet la DB à zéro
make db-shell       # ouvre un shell psql
```

---

## Utiliser le client Prisma dans le code

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Créer un enregistrement
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    username: 'john',
    password: 'hashed_password',
  }
});

// Lire un enregistrement
const user = await prisma.user.findUnique({
  where: { id: 'uuid-ici' }
});

// Lire plusieurs enregistrements
const users = await prisma.user.findMany({
  where: { isOnline: true }
});

// Mettre à jour
const user = await prisma.user.update({
  where: { id: 'uuid-ici' },
  data: { isOnline: false }
});

// Supprimer
await prisma.user.delete({
  where: { id: 'uuid-ici' }
});

// Inclure des relations
const user = await prisma.user.findUnique({
  where: { id: 'uuid-ici' },
  include: {
    stats: true,
    sentMessages: true,
  }
});
```

---

## Modifier le schéma après coup

Si tu veux ajouter une colonne ou une table :

1. Modifie `prisma/schema.prisma`
2. Lance `make migrate-dev` (te demande un nom)
3. Prisma génère le SQL de la différence et l'applique
4. Commit le nouveau fichier dans `prisma/migrations/`

Exemple — ajouter un champ `bio` au modèle `User` :
```prisma
model User {
  ...
  bio String?   ← ajout
}
```
```bash
make migrate-dev
# nom : add_bio_to_user
```

---

## Structure du projet

```
database/
├── prisma/
│   ├── schema.prisma          ← schéma de la DB
│   └── migrations/
│       └── 20260420_init/
│           └── migration.sql  ← SQL généré automatiquement
├── src/
│   └── index.js               ← serveur Express + client Prisma
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env                       ← ne pas commit
└── .env.example               ← à commit
```

---

## Ressources

- Documentation officielle : https://www.prisma.io/docs
- Prisma schema reference : https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Prisma Client API : https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
