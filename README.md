# 📅 Calendrier — Ze Raclette

Calendrier collaboratif pour la guilde **Ze Raclette** sur Dofus. Propose des donjons, rejoins ceux des autres, retrouvez-vous en jeu.

## Démarrage rapide

### 1. Créer le projet Supabase (gratuit, pas de CB)

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Ouvrir **SQL Editor** et coller le contenu de [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql)
3. Cliquer **Run** pour créer les tables

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` avec les valeurs trouvées dans **Project Settings > API** de Supabase :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Installer et lancer

```bash
npm install
npm run dev
```

L'app tourne sur [http://localhost:5173](http://localhost:5173).

---

## Fonctionnalités

- **Calendrier** : vues semaine (desktop) et mois (mobile)
- **Créer un événement** : donjon, date/heure, places max, niveau, description
- **Rejoindre / quitter** un événement en un clic
- **Temps réel** : les inscriptions sont visibles instantanément pour tous
- **Pseudo unique** : identification par pseudo en jeu, stocké en localStorage
- **Suppression** : le créateur peut supprimer son événement

## Roadmap

- [ ] Intégration Discord (webhook sur création d'événement)
- [ ] Filtres par type d'activité
- [ ] Rappels (notifications navigateur)
- [ ] Page de gestion des événements passés

## Stack

React · TypeScript · Vite · Supabase · FullCalendar · Tailwind CSS — **100 % gratuit**

## Documentation

- [Fonctionnelle](docs/FUNCTIONAL.md)
- [Technique](docs/TECHNICAL.md)
