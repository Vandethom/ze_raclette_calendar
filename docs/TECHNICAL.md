# Documentation technique — Calendrier Ze Raclette

## Stack technologique

| Couche        | Technologie                     | Gratuit | Raison du choix |
|---------------|---------------------------------|---------|-----------------|
| Frontend      | React 18 + TypeScript + Vite    | ✅      | Écosystème mature, DX rapide |
| Styles        | Tailwind CSS v3                 | ✅      | Utilitaire, pas de CSS mort |
| Calendrier    | FullCalendar v6 (React)         | ✅ MIT  | Référence open-source, vue semaine/mois, interactions |
| Backend / DB  | Supabase (PostgreSQL)           | ✅      | Tier gratuit généreux, RLS, Realtime, pas de CB requise |
| Temps réel    | Supabase Realtime (WebSocket)   | ✅      | Inclus dans Supabase, subscriptions Postgres |
| Icônes        | Lucide React                    | ✅ ISC  | Léger, tree-shakable |
| Dates         | date-fns v3                     | ✅ MIT  | Léger, locale FR native |
| Hébergement   | Vercel / Netlify                | ✅      | Tier gratuit, déploiement GitHub auto |

---

## Architecture du projet

```
ze_raclette_calendar/
├── src/
│   ├── components/
│   │   ├── CalendarView.tsx       # Wrapper FullCalendar, conversion events → fcEvents
│   │   ├── CreateEventModal.tsx   # Formulaire de création d'événement
│   │   ├── EventDetailModal.tsx   # Détail + rejoindre/quitter/supprimer
│   │   ├── Navbar.tsx             # Barre de navigation + bouton pseudo
│   │   ├── PseudoSetup.tsx        # Modale de saisie de pseudo (1ère visite)
│   │   └── Toast.tsx              # Notifications flottantes
│   ├── hooks/
│   │   ├── useEvents.ts           # CRUD events + participants + Realtime
│   │   └── useToast.ts            # Gestion des notifications
│   ├── lib/
│   │   └── supabase.ts            # Initialisation du client Supabase
│   ├── types/
│   │   └── index.ts               # Interfaces TypeScript
│   ├── App.tsx                    # Orchestration : état global + modals
│   ├── main.tsx                   # Point d'entrée React
│   └── index.css                  # Tailwind + overrides FullCalendar
├── supabase/
│   └── migrations/
│       └── 001_initial.sql        # Schéma PostgreSQL à appliquer dans Supabase
├── docs/
│   ├── FUNCTIONAL.md
│   └── TECHNICAL.md
├── .env.example                   # Template des variables d'environnement
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Modèle de données

### Table `events`

```sql
id              uuid        PK, généré automatiquement
dungeon_name    text        NOT NULL
creator_pseudo  text        NOT NULL
date_start      timestamptz NOT NULL
date_end        timestamptz NOT NULL
max_participants integer    CHECK(2–20), nullable
level           integer     CHECK(1–230), nullable
description     text        nullable
created_at      timestamptz DEFAULT now()
```

### Table `participants`

```sql
id          uuid        PK
event_id    uuid        FK → events(id) ON DELETE CASCADE
pseudo      text        NOT NULL
joined_at   timestamptz DEFAULT now()

UNIQUE(event_id, pseudo)   -- anti-doublon
```

### Relations
- Un événement a **zéro ou plusieurs participants** (table `participants`).
- Le **créateur** n'est pas dans `participants` : il est stocké dans `events.creator_pseudo`.
- La suppression d'un événement entraîne la **suppression en cascade** de ses participants.

---

## Sécurité (RLS)

Supabase Row Level Security est activé sur les deux tables. Les politiques actuelles sont **ouvertes** (lecture/écriture publique) car il n'y a pas d'authentification.

> ⚠️ **Trade-off conscient** : un membre pourrait techniquement supprimer l'événement d'un autre en appelant l'API directement. Pour un usage en guilde (groupe de confiance), ce niveau de sécurité est acceptable.  
> Pour renforcer : ajouter Supabase Auth et une politique `DELETE USING (creator_pseudo = auth.jwt()->>'pseudo')`.

---

## Flux de données

```
Utilisateur clique "Rejoindre"
        │
        ▼
App.tsx : handleJoin()
        │
        ▼
useEvents.ts : joinEvent(eventId, pseudo)
        │
        ▼
Supabase : INSERT INTO participants ...
        │
        ├─► Supabase Realtime broadcast
        │         │
        │         ▼
        │   useEvents.ts : fetchEvents() déclenché
        │         │
        │         ▼
        │   React re-render → calendrier mis à jour
        │   pour TOUS les membres ouverts sur le site
        │
        ▼
App.tsx : fetchEventWithParticipants() → setDetailEvent(updated)
        │
        ▼
EventDetailModal se met à jour localement
```

---

## Variables d'environnement

| Variable                  | Description |
|---------------------------|-------------|
| `VITE_SUPABASE_URL`       | URL du projet Supabase (Project Settings > API) |
| `VITE_SUPABASE_ANON_KEY`  | Clé publique anonyme (Project Settings > API) |

Ces variables sont préfixées `VITE_` pour être exposées au bundle client par Vite.  
Ne jamais mettre la clé `service_role` côté client.

---

## Intégration Discord (roadmap)

L'alerte Discord sera implémentée via une **Supabase Edge Function** (Deno, gratuit) :

1. Créer un webhook dans le canal Discord cible.
2. Créer la fonction `supabase/functions/notify-discord/index.ts`.
3. Ajouter un **Database Webhook** Supabase sur `INSERT INTO events` → appelle la Edge Function.
4. La fonction formate le message et POST sur le webhook Discord.

```typescript
// Exemple de payload Discord
{
  content: `🗡️ **${event.creator_pseudo}** propose **${event.dungeon_name}**\n📅 ${formattedDate} · ⏰ ${startTime}\n👥 ${spots} place(s) disponible(s)${event.level ? `\n⭐ Niveau ${event.level}` : ''}`
}
```

---

## Déploiement (Vercel)

1. `git push` sur `main` (ou connexion du repo à Vercel).
2. Vercel détecte Vite automatiquement.
3. Ajouter les variables d'env dans **Project Settings > Environment Variables**.
4. Build command : `npm run build` / Output dir : `dist`.

Aucun serveur backend à gérer : tout passe par Supabase.
