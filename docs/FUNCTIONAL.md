# Documentation fonctionnelle — Calendrier Ze Raclette

## Contexte

Site de guilde pour le jeu **Dofus**. Ce module est le calendrier collaboratif permettant aux membres d'organiser et de rejoindre des événements en jeu (donjons, boss, events…).

---

## Concepts métier

### Pseudo
- Chaque membre s'identifie **uniquement par son pseudo en jeu** (pas de nom, pas d'email, pas de compte).
- Le pseudo est saisi lors de la première visite et stocké en localStorage.
- Il peut être modifié à tout moment depuis la navbar.
- Il sert d'identité pour toutes les actions (créer, rejoindre, quitter).

### Événement
Un événement représente une activité planifiée en jeu. Il contient :

| Champ              | Obligatoire | Description |
|--------------------|-------------|-------------|
| `dungeon_name`     | Oui         | Nom du donjon ou de l'activité |
| `creator_pseudo`   | Oui         | Pseudo du membre organisateur |
| `date_start`       | Oui         | Date et heure de début |
| `date_end`         | Oui         | Date et heure de fin |
| `max_participants` | Non         | Nombre maximum de personnes (créateur inclus). Entre 2 et 20 |
| `level`            | Non         | Niveau requis / suggéré (1–230) |
| `description`      | Non         | Notes libres (prérequis, stuff attendu…) |

### Participants
- Les membres qui rejoignent un événement sont des **participants**.
- Le créateur n'est **pas** dans la table `participants` : il est toujours compté séparément.
- Le décompte affiché inclut toujours le créateur : `participants.length + 1`.
- Un même pseudo ne peut rejoindre le même événement qu'une seule fois (contrainte unique en base).

---

## Parcours utilisateurs

### 1. Première visite
1. L'utilisateur arrive sur le site.
2. La modale **"Définir mon pseudo"** s'affiche automatiquement.
3. Il saisit son pseudo en jeu et confirme.
4. Le pseudo est enregistré dans le localStorage et il accède au calendrier.

### 2. Proposer un événement (ex. : Kohuky propose Comte Harebourg)
1. Kohuky clique sur le dimanche 10/05/2026 dans le calendrier.
2. La modale **"Proposer un événement"** s'ouvre avec la date pré-remplie.
3. Il renseigne :
   - Nom du donjon : *Comte Harebourg*
   - Début : *18:00*, Fin : *20:00*
   - Places max : *4* (3 participants + lui)
   - Niveau : *200*
4. Il clique **"Créer l'événement"**.
5. L'événement apparaît sur le calendrier en **jaune/doré** (couleur des événements où l'on est impliqué).

### 3. Rejoindre un événement
1. Un membre voit l'événement sur le calendrier en **bleu** (non rejoint).
2. Il clique dessus pour ouvrir le détail.
3. Il vérifie les infos : donjon, horaire, places restantes, liste des inscrits.
4. Il clique **"Rejoindre"**.
5. Son pseudo apparaît dans la liste et le compteur se met à jour en temps réel pour tous.

### 4. Quitter un événement
1. L'utilisateur ouvre le détail d'un événement qu'il a rejoint.
2. Il clique **"Quitter"**.
3. Il est retiré de la liste de participants.

### 5. Supprimer un événement (créateur uniquement)
1. Le créateur ouvre le détail de son événement.
2. Il clique l'icône poubelle.
3. Une confirmation s'affiche.
4. Il confirme : l'événement est supprimé pour tous les membres.

---

## Comportements notables

- **Temps réel** : les modifications (inscription, désinscription, création, suppression) sont reflétées instantanément pour tous les membres ouverts sur le site grâce aux subscriptions Supabase Realtime.
- **Couleurs du calendrier** :
  - 🟡 Ambre/doré : événements créés par l'utilisateur ou auxquels il participe.
  - 🔵 Bleu : événements des autres membres.
- **Événement complet** : quand toutes les places sont prises, le bouton "Rejoindre" est remplacé par "Événement complet".
- **Vue calendrier** :
  - Desktop : vue semaine (timeGrid) par défaut.
  - Mobile : vue mois (dayGrid) par défaut.

---

## Intégration Discord (à venir)

Un webhook Discord sera configuré pour poster automatiquement une alerte dans un canal dédié à chaque création d'événement, sous la forme :

> **Kohuky** — Comte Harebourg · Dimanche à 18h · Niveau 200 · 3 places restantes

Cette fonctionnalité sera implémentée via une **Supabase Edge Function** (gratuite) déclenchée par un trigger sur la table `events`.
