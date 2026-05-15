# Calendrier Supplément Raclette — Présentation & justification

## Pourquoi un calendrier de guilde ?

La guilde Supplément Raclette organise régulièrement des activités collectives : donjons, boss de guilde, concours de skins, challenges internes et bientôt même des raids ! Jusqu'ici, la coordination reposait entièrement sur Discord — des messages qui se noient dans le fil, des créneaux oubliés, des compositions improvisées le jour J.

Trois problèmes concrets revenaient souvent :

- **"Il y avait un run ce soir ?"** — L'annonce était passée inaperçue dans le channel.
- **"On a besoin d'un Tank, qui est dispo ?"** — Impossible de savoir à l'avance sans pinger tout le monde.
- **"Le Concours de skins se termine quand ?"** — L'info était quelque part dans l'historique Discord.

Le calendrier répond directement à ces problèmes.

---

## Ce que permet le calendrier

### Planifier et visualiser
- Vue semaine et mois pour avoir une vision d'ensemble des activités à venir
- Bande dédiée aux **événements longue durée** (concours, challenges) qui s'étirent sur plusieurs jours
- Code couleur : **doré** = tu participes, **bleu** = disponible, tu peux rejoindre

### Organiser une activité
- N'importe quel membre peut proposer un événement en cliquant sur un créneau
- Champs disponibles : nom, date, horaires, rôle de l'organisateur, places max, niveau requis, description
- Visible instantanément sur le calendrier de **tous les membres connectés** (temps réel)

### Composer une équipe
- Chaque membre indique sa **classe** (Iop, Crâ, Eniripsa…) dans son profil
- Chaque participant choisit son **rôle** lors de l'inscription (Tank, Heal, Ret PM, Do Pou, Do Crit…)
- La fiche d'événement affiche la composition en cours : qui joue quoi, combien de places restantes

### Rechercher
- Barre de recherche en haut : retrouve un événement par nom, par créateur ou par n'importe quel participant inscrit

### Modération
- Un compte administrateur (`BlueCheese`) peut **modifier ou supprimer** n'importe quel événement en cas d'erreur ou d'abus

### Intégration Discord
- Un bot Discord permet de consulter le calendrier **sans quitter Discord** :
  - `/semaine` — calendrier visuel de la semaine avec navigation ← →
  - `/creer` — proposer un événement via formulaire
  - `/rejoindre`, `/quitter` — s'inscrire ou se désinscrire
  - `/modifier`, `/supprimer` — gérer ses événements

---

## Avantages

| Avantage | Détail |
|---|---|
| **Zéro friction** | Pas de compte à créer, pas de mot de passe — juste un pseudo en jeu |
| **Temps réel** | Les inscriptions et nouveaux événements apparaissent instantanément pour tout le monde |
| **Composition visible** | Classe + rôle de chaque participant lisible avant de rejoindre |
| **Gratuit** | Hébergé sur Vercel (site) + Supabase (base de données) — 0 € pour l'usage d'une guilde |
| **Accessible partout** | Navigateur web sur PC ou mobile, sans installation |
| **Vue longue durée** | Les concours et challenges sur plusieurs semaines sont bien représentés |
| **Recherche** | Retrouver tous les événements d'un membre en un mot-clé |
| **Open source** | Le code appartient à la guilde, modifiable à volonté |
| **Administration simple** | Le compte Admin peut intervenir en temps réél pour corriger une erreur ou un abus |
| **Evolutivité** | Partant d'un besoin simple, une solution minimaliste a été développée. Le projet peut grandir pour répondre à des besoins plus larges |

---

## Inconvénients et limites

| Limite | Explication |
|---|---|
| **Pas d'authentification réelle** | N'importe qui connaissant ton pseudo peut s'inscrire ou créer un événement en ton nom. L'outil repose sur la confiance au sein de la guilde — il n'est pas conçu pour un usage public. |
| **Pas de notifications push** | Le calendrier ne prévient pas quand quelqu'un rejoint ton événement ou quand un nouveau run est proposé. Il faut penser à consulter le site (ou activer les annonces via le bot Discord). |
| **Pas d'événements récurrents** | Un run hebdomadaire fixe doit être recréé manuellement chaque semaine. |
| **Dépendance Supabase** | La base de données est hébergée sur le tier gratuit de Supabase (500 Mo, ~50 000 requêtes/jour). Largement suffisant pour une guilde, mais une interruption de service Supabase affecte le calendrier. |
| **Bot Discord à héberger** | Le bot doit tourner sur une machine allumée en permanence (PC). Il ne fonctionne pas de façon autonome dans le cloud sur le tier gratuit. |
| **Sécurité admin basique** | Le mot de passe administrateur est inclus dans le code compilé du site. Il est obfusqué mais pas inviolable. Suffisant pour un usage de guilde, pas pour des données sensibles. Une évolution sera à prévoir en cas de mise à grande échelle. |
| **Pas d'historique** | Les événements passés restent visibles dans le calendrier mais il n'y a pas de page "archives" dédiée. |

---

## Pour qui est cet outil ?

Le calendrier est conçu pour une **guilde fermée et soudée**, où les membres se connaissent et se font confiance. Il n'est pas adapté à un usage public ou à une communauté ouverte à des inconnus — l'absence d'authentification serait alors un problème réel.

Dans ce contexte (Supplément Raclette), il remplace avantageusement les messages Discord éparpillés et donne à chaque membre une vision claire des activités à venir, de la composition disponible, et des créneaux libres.

---

*Calendrier développé pour Supplément Raclette — code source disponible dans le dépôt de la guilde.*
