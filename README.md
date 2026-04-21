
# ft_transcendance — Base de données & Prisma

## Qu'est-ce qu'une base de données ?

Une **base de données** est un système permettant de stocker, organiser et gérer des informations de façon structurée. Dans le contexte d'une application web, elle sert à conserver toutes les données importantes : utilisateurs, messages, scores, relations, etc. La base de données permet de retrouver, modifier ou supprimer ces informations rapidement et de façon sécurisée.

Dans ce projet, la base de données utilisée est **PostgreSQL**, une solution relationnelle robuste et performante.

## Présentation

Ce projet utilise **PostgreSQL** comme base de données relationnelle et **Prisma** comme ORM pour Node.js.

### Qu'est-ce qu'un ORM ?

Un **ORM** (Object-Relational Mapping, ou « mapping objet-relationnel ») est un outil qui fait le lien entre la base de données (tables, lignes) et le code (objets, classes). Il permet de manipuler les données de la base comme des objets dans le code, sans écrire de SQL brut. Cela simplifie les requêtes, la gestion des relations et la maintenance du code.

Prisma facilite la gestion des données, des relations et des migrations, tout en offrant un client typé pour interagir avec la base.

---

## Installation & Configuration

1. **Installer les dépendances** :
   ```bash
   npm install @prisma/client
   npm install --save-dev prisma
   ```

2. **Initialiser Prisma** :
   ```bash
   npx prisma init
   ```
   Cela crée le dossier `prisma/` avec le fichier `schema.prisma` et un fichier `.env` pour la variable `DATABASE_URL`.

3. **Configurer la base de données** :
   - Modifier la variable `DATABASE_URL` dans `.env` pour pointer vers votre instance PostgreSQL.

---

## Schéma de la base de données

Le schéma est défini dans `prisma/schema.prisma`. Les principales entités sont :

- **User** : Utilisateur (email, username, mot de passe, avatar, stats, etc.)
- **Friendship** : Relations d’amitié (statut : pending, accepted, declined)
- **Block** : Utilisateurs bloqués
- **Conversation** & **Participant** : Conversations (groupes ou privées) et participants
- **Message** : Messages envoyés dans les conversations
- **Match** : Parties de jeu (joueurs, scores, statut)
- **UserStats** : Statistiques utilisateur (victoires, défaites, niveau, xp)

Les relations sont gérées via des clés étrangères et des tables de liaison.

---

## Migrations & Génération du client

- **Créer une migration** :
  ```bash
  npx prisma migrate dev
  ```
- **Générer le client Prisma** :
  ```bash
  npx prisma generate
  ```

---

## Utilisation dans le code

Exemple d’utilisation du client Prisma :
```js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer un utilisateur par email
const user = await prisma.user.findUnique({
  where: { email: 'test@test.com' }
});
```

---

## Bonnes pratiques

- **Modifier le schéma dans `prisma/schema.prisma` puis lancer une migration** :
  Cela garantit que la structure de la base reste synchronisée avec le code et que toutes les modifications sont traçables et reproductibles.

- **Ne jamais modifier la base directement sans passer par Prisma** :
  Passer par Prisma permet d’éviter les incohérences, les erreurs manuelles et assure que le client Prisma reste à jour avec la structure réelle de la base.

- **Toujours versionner les migrations** :
  Versionner les migrations permet de garder un historique des évolutions de la base, de collaborer à plusieurs sans conflit et de revenir en arrière facilement en cas de problème.

---

## Ressources utiles

- [Documentation Prisma](https://www.prisma.io/docs/)
- [Prisma ORM sur GitHub](https://github.com/prisma/prisma)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Sources

- [Documentation Prisma](https://www.prisma.io/docs/)
- [Prisma ORM sur GitHub](https://github.com/prisma/prisma)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Wikipedia — Base de données](https://fr.wikipedia.org/wiki/Base_de_donn%C3%A9es)

---

## Auteur
Dilan BHUJOO
Projet 42 — ft_transcendance
