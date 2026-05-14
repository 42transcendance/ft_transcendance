# Database Schema (PK / FK visible)

Source of truth: `src/prisma/schema.prisma`

## Legend

- **PK**: Primary Key
- **FK**: Foreign Key
- **UK**: Unique Key
- **IDX**: Indexed column

## Tables

### User

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid (String) | **PK** | default: `uuid()` |
| email | String | **UK** | user email, unique |
| username | String | **UK** | user handle, unique |
| password | String |  | hashed password |
| avatarUrl | String? | nullable | optional avatar |
| isOnline | Int | default `0` | online status flag |
| lastSeenAt | DateTime? | nullable | last activity timestamp |

Relations:
- `User.id` -> `Friendship.senderId` (1 to many)
- `User.id` -> `Friendship.receiverId` (1 to many)
- `User.id` -> `GlobalMessage.senderId` (1 to many, nullable on delete)

### Friendship

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid (String) | **PK** | default: `uuid()` |
| senderId | uuid (String) | **FK** -> `User.id` | sender user id |
| receiverId | uuid (String) | **FK** -> `User.id` | receiver user id |
| status | enum | default `PENDING` | `PENDING`, `ACCEPTED`, `DECLINED` |

Composite constraints:
- **UK**: `(senderId, receiverId)`

### GlobalMessage

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid (String) | **PK** | default: `uuid()` |
| content | String |  | message content |
| senderId | uuid (String)? | **FK** -> `User.id` | nullable, `ON DELETE SET NULL` |
| senderUsername | String |  | denormalized display username |
| createdAt | DateTime | **IDX** | default: `now()` |

Indexes:
- **IDX** on `createdAt`

## Relationship overview

- `User` 1 -> N `Friendship` (as sender)
- `User` 1 -> N `Friendship` (as receiver)
- `User` 1 -> N `GlobalMessage`
- If a `User` is deleted, `GlobalMessage.senderId` is set to `NULL`.

## Quick SQL checks

```sql
-- List tables
\dt

-- Describe one table
\d "User"
\d "Friendship"
\d "GlobalMessage"

-- Check friendship uniqueness pair
SELECT sender_id, receiver_id, COUNT(*)
FROM "Friendship"
GROUP BY sender_id, receiver_id
HAVING COUNT(*) > 1;

-- Last messages with sender linkage
SELECT id, "senderId", "senderUsername", "createdAt"
FROM "GlobalMessage"
ORDER BY "createdAt" DESC
LIMIT 20;
```
