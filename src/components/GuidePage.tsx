import {
  Calendar, Users, Sword, Search, PlusCircle,
  LogIn, LogOut, Trash2, Clock, Shield,
  Swords, CalendarCheck, Zap,
} from 'lucide-react'

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
      <h2 className="flex items-center gap-2.5 text-white font-bold text-lg">
        <span className="text-amber-400">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm text-gray-300">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs mt-0.5">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}

function Badge({ label, color = 'amber' }: { label: string; color?: 'amber' | 'blue' | 'gray' }) {
  const cls = {
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    gray: 'bg-[#30363d] text-gray-400 border-[#30363d]',
  }[color]
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
      {label}
    </span>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-300/80">
      <span className="flex-shrink-0">💡</span>
      <span>{children}</span>
    </div>
  )
}

function TableRow({ cols }: { cols: React.ReactNode[] }) {
  return (
    <tr className="border-t border-[#30363d]">
      {cols.map((c, i) => (
        <td key={i} className={`py-2 px-3 text-sm ${i === 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
          {c}
        </td>
      ))}
    </tr>
  )
}

export function GuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

      {/* Header */}
      <div className="text-center space-y-2 pb-2">
        <h1 className="text-2xl font-bold text-white">Guide du calendrier</h1>
        <p className="text-gray-500 text-sm">Tout ce que tu peux faire sur le site, en moins de 5 minutes.</p>
      </div>

      {/* Première connexion */}
      <Section title="Première connexion" icon={<Users size={18} />}>
        <p className="text-sm text-gray-400">
          À ta première visite, une fenêtre s'ouvre et te demande ton <span className="text-white font-medium">pseudo en jeu</span>.
        </p>
        <ol className="space-y-3">
          <Step n={1}>Saisis exactement ton pseudo Dofus (celui que tes collègues reconnaissent) et ta classe en jeu.</Step>
          <Step n={2}>Clique <span className="text-white font-medium">Confirmer</span> — il sera retenu pour toutes tes prochaines visites.</Step>
        </ol>
        <Tip>Pour changer de pseudo ou de classe plus tard, clique sur ton pseudo en haut à droite de la page.</Tip>
      </Section>

      {/* Le calendrier */}
      <Section title="Le calendrier" icon={<Calendar size={18} />}>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Navigue entre les vues et les semaines grâce aux boutons en haut du calendrier :</p>
          <div className="overflow-x-auto rounded-lg border border-[#30363d]">
            <table className="w-full">
              <tbody>
                <TableRow cols={['< >', 'Semaine précédente / suivante']} />
                <TableRow cols={["Aujourd'hui", 'Revenir à la semaine en cours']} />
                <TableRow cols={['Mois / Semaine / Jour', 'Changer de vue']} />
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-400 pt-1">Chaque bloc coloré sur le calendrier est un événement :</p>
          <div className="flex flex-wrap gap-2">
            <Badge label="Bloc doré — tu as créé ou tu participes" color="amber" />
            <Badge label="Bloc bleu — événement d'un autre membre" color="blue" />
          </div>

          <p className="text-sm text-gray-400 text-xs">
            Les <span className="text-white">événements longue durée</span> (concours, challenges…) apparaissent dans la bande <span className="text-amber-400 font-medium">Long</span> en haut du calendrier et s'étirent sur plusieurs jours.
          </p>
        </div>
      </Section>

      {/* Proposer un événement */}
      <Section title="Proposer un événement" icon={<PlusCircle size={18} />}>
        <ol className="space-y-3">
          <Step n={1}>Clique sur un <span className="text-white font-medium">créneau du calendrier</span> (le jour et l'heure qui t'intéressent).</Step>
          <Step n={2}>La fenêtre de création s'ouvre avec la date pré-remplie.</Step>
          <Step n={3}>Remplis les informations ci-dessous, puis clique <span className="text-white font-medium">Créer l'événement</span>.</Step>
        </ol>

        <div className="space-y-4 pt-1">
          <div>
            <p className="text-sm text-white font-medium mb-2">Événement court (donjon, boss…)</p>
            <div className="overflow-x-auto rounded-lg border border-[#30363d]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0d1117]">
                    <th className="text-left text-xs text-gray-500 py-2 px-3 font-medium">Champ</th>
                    <th className="text-left text-xs text-gray-500 py-2 px-3 font-medium">Obligatoire</th>
                    <th className="text-left text-xs text-gray-500 py-2 px-3 font-medium">Exemple</th>
                  </tr>
                </thead>
                <tbody>
                  <TableRow cols={["Nom de l'événement", 'Oui', 'Comte Harebourg']} />
                  <TableRow cols={['Date', 'Oui', '10/05/2026']} />
                  <TableRow cols={['Heure de début', 'Oui', '18:00']} />
                  <TableRow cols={['Heure de fin', 'Oui', '20:00']} />
                  <TableRow cols={['Ton rôle', 'Non', 'Tank, Heal, Do Crit…']} />
                  <TableRow cols={['Places max', 'Non', '4 (toi + 3 autres)']} />
                  <TableRow cols={['Niveau', 'Non', '200']} />
                  <TableRow cols={['Description', 'Non', '"Stuff Do Crit recommandé"']} />
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-sm text-white font-medium mb-2">Événement longue durée (concours, challenge…)</p>
            <p className="text-sm text-gray-400 mb-2">
              Active le bouton <span className="text-white font-medium">"Événement sur plusieurs jours"</span> pour faire apparaître un champ "Date de fin". Les champs d'heure disparaissent.
            </p>
          </div>

          <div>
            <p className="text-sm text-white font-medium mb-2 flex items-center gap-1.5"><Shield size={13} className="text-amber-400" /> Choisir ton rôle</p>
            <div className="overflow-x-auto rounded-lg border border-[#30363d]">
              <table className="w-full">
                <tbody>
                  <TableRow cols={['Tank', 'Protection, aggro']} />
                  <TableRow cols={['Heal', 'Soins']} />
                  <TableRow cols={['Ret PM', 'Retrait de PM']} />
                  <TableRow cols={['Do Pou', 'Dommages de zone / poussée']} />
                  <TableRow cols={['Do Crit', 'Dommages critiques']} />
                  <TableRow cols={['Autre (préciser)', 'Saisis ton propre rôle librement']} />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Tip>Sur mobile, utilise le bouton <span className="font-medium">+ Proposer un événement</span> en bas de l'écran.</Tip>
      </Section>

      {/* Activités sans date — Envies */}
      <Section title='Proposer une activité sans date ("Envie")' icon={<Swords size={18} />}>
        <p className="text-sm text-gray-400">
          Tu veux organiser un donjon ou une farm mais personne n'est disponible au même moment ?
          Propose une <span className="text-white font-medium">Envie</span> : les membres indiquent leurs disponibilités
          et dès qu'un créneau convient à tout le monde, l'événement se crée.
        </p>

        <div>
          <p className="text-sm text-white font-medium mb-2">Créer une Envie</p>
          <ol className="space-y-3">
            <Step n={1}>Clique sur <span className="text-white font-medium">Proposer</span> dans le bandeau <span className="text-amber-400 font-medium">Activités sans date</span> au-dessus du calendrier.</Step>
            <Step n={2}>Indique le nom de l'activité, le nombre de joueurs nécessaires et une deadline optionnelle.</Step>
            <Step n={3}>La carte apparaît dans le bandeau, visible de tous les membres.</Step>
          </ol>
        </div>

        <div>
          <p className="text-sm text-white font-medium mb-2">Voter sur les créneaux</p>
          <ol className="space-y-3">
            <Step n={1}>Clique sur une carte d'Envie pour ouvrir la grille de disponibilités (14 jours × 3 créneaux).</Step>
            <Step n={2}>Clique sur les cases qui te conviennent — tes cases s'affichent en ambre.</Step>
            <Step n={3}>Quand assez de joueurs cochent le même créneau, il se met en évidence avec une <span className="text-amber-400">⭐</span>.</Step>
          </ol>
        </div>

        <div className="flex gap-2 bg-[#0d1117]/60 border border-[#30363d] rounded-lg px-4 py-3 text-sm text-gray-300 items-start">
          <Zap size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            Dès qu'un créneau a assez de joueurs, le <span className="text-white font-medium">créateur de l'Envie</span> peut cliquer
            sur <span className="text-amber-400 font-medium">Planifier</span> pour convertir l'Envie en événement planifié
            avec la date et l'heure pré-remplies.
          </span>
        </div>

        <Tip>Tu peux supprimer ta propre Envie depuis sa fiche si elle n'est plus d'actualité. L'administrateur peut aussi le faire.</Tip>
      </Section>

      {/* Disponibilités */}
      <Section title="Mes disponibilités" icon={<CalendarCheck size={18} />}>
        <p className="text-sm text-gray-400">
          La page <span className="text-white font-medium">Dispos</span> (bouton dans la barre de navigation) te permet de
          renseigner tes créneaux habituels de la semaine — heure par heure, de 8h à 23h.
          Ton profil est public et consultable par tous les membres.
        </p>

        <div>
          <p className="text-sm text-white font-medium mb-2">Renseigner ses dispos</p>
          <ol className="space-y-3">
            <Step n={1}>Clique sur <span className="text-white font-medium">Dispos</span> dans la barre de navigation en haut.</Step>
            <Step n={2}>Clique sur les cases de la grille pour les cocher ou les décocher. Chaque case représente une heure (ex : 18h = disponible de 18h à 19h).</Step>
            <Step n={3}>Ajoute une note optionnelle (ex : "Dispo après 19h en semaine") et clique <span className="text-white font-medium">Enregistrer</span>.</Step>
          </ol>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#30363d]">
          <table className="w-full">
            <tbody>
              <TableRow cols={['Case ambre (semaine)', 'Disponible sur ce créneau']} />
              <TableRow cols={['Case ambre vif (week-end)', 'Disponible le samedi ou dimanche']} />
              <TableRow cols={['Case sombre', 'Créneau non renseigné']} />
            </tbody>
          </table>
        </div>

        <Tip>Un résumé textuel ("Lundi : 18h–22h · Mercredi : 14h–20h") est généré automatiquement sous la grille.</Tip>
      </Section>

      {/* Rejoindre */}
      <Section title="Rejoindre un événement" icon={<LogIn size={18} />}>
        <ol className="space-y-3">
          <Step n={1}>Clique sur un événement <Badge label="bleu" color="blue" /> qui t'intéresse.</Step>
          <Step n={2}>La fiche s'ouvre : activité, date, horaires, places restantes, liste des membres inscrits.</Step>
          <Step n={3}>Choisis ton rôle dans le menu déroulant (optionnel).</Step>
          <Step n={4}>Clique <span className="text-white font-medium">Rejoindre</span> — ton pseudo apparaît dans la liste en temps réel.</Step>
        </ol>
        <Tip>Si l'événement affiche <span className="font-medium text-red-400">Complet</span>, toutes les places sont prises mais tu peux quand même consulter la fiche.</Tip>
      </Section>

      {/* Quitter */}
      <Section title="Quitter un événement" icon={<LogOut size={18} />}>
        <ol className="space-y-3">
          <Step n={1}>Clique sur l'événement <Badge label="doré" color="amber" /> auquel tu participes.</Step>
          <Step n={2}>Clique <span className="text-white font-medium">Quitter</span>.</Step>
          <Step n={3}>Ta place se libère immédiatement pour un autre membre.</Step>
        </ol>
      </Section>

      {/* Supprimer */}
      <Section title="Supprimer un événement" icon={<Trash2 size={18} />}>
        <p className="text-sm text-gray-400">Seul <span className="text-white font-medium">l'organisateur</span> peut supprimer son événement.</p>
        <ol className="space-y-3">
          <Step n={1}>Clique sur ton événement.</Step>
          <Step n={2}>Clique sur l'icône <span className="text-white font-medium">poubelle</span> (en bas à droite de la fiche).</Step>
          <Step n={3}>Confirme la suppression — tous les participants sont retirés automatiquement.</Step>
        </ol>
      </Section>

      {/* Recherche */}
      <Section title="Rechercher" icon={<Search size={18} />}>
        <p className="text-sm text-gray-400">
          Utilise la barre de recherche en haut de la page pour trouver un événement par son nom,
          son créateur ou n'importe quel participant.
        </p>
        <p className="text-sm text-gray-400">
          Les <span className="text-white font-medium">joueurs mentionnés</span> dans les résultats apparaissent sous forme de cartes en haut de la liste.
          Clique sur une carte pour consulter les disponibilités hebdomadaires de ce joueur.
        </p>
        <Tip>Tape le pseudo d'un membre pour voir tous ses événements ET accéder à son profil de disponibilités.</Tip>
      </Section>

      {/* Temps réel */}
      <Section title="Temps réel" icon={<Clock size={18} />}>
        <p className="text-sm text-gray-400">
          Le calendrier et les Envies se mettent à jour <span className="text-white font-medium">automatiquement</span> pour tout le monde.
          Tu n'as pas besoin de rafraîchir la page pour voir les nouvelles inscriptions, les nouveaux événements
          ou les votes sur les créneaux d'une Envie.
        </p>
      </Section>

      {/* Récapitulatif */}
      <section className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-white font-bold text-base mb-4">
          <Sword size={16} className="text-amber-400" /> Récapitulatif rapide
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[#30363d]">
          <table className="w-full">
            <tbody>
              <TableRow cols={['Créer un événement court', 'Cliquer sur un créneau → remplir le formulaire']} />
              <TableRow cols={['Créer un événement long', 'Activer "Plusieurs jours" → choisir début et fin']} />
              <TableRow cols={['Proposer une Envie', 'Bandeau "Activités sans date" → "Proposer"']} />
              <TableRow cols={['Voter sur une Envie', 'Cliquer sur une carte d\'Envie → cocher les créneaux']} />
              <TableRow cols={['Planifier une Envie', 'Cliquer "Planifier" sur un créneau ⭐ (créateur uniquement)']} />
              <TableRow cols={['Mes disponibilités', 'Bouton "Dispos" dans la barre de navigation']} />
              <TableRow cols={['Voir les dispos d\'un membre', 'Rechercher son pseudo → cliquer sur sa carte joueur']} />
              <TableRow cols={['Préciser son rôle', 'Menu "Ton rôle" dans le formulaire de création']} />
              <TableRow cols={['Rejoindre', 'Cliquer sur un événement bleu → "Rejoindre"']} />
              <TableRow cols={['Quitter', 'Cliquer sur l\'événement doré → "Quitter"']} />
              <TableRow cols={['Supprimer', 'Cliquer sur son événement → icône poubelle']} />
              <TableRow cols={['Changer de pseudo / classe', 'Cliquer sur son pseudo en haut à droite']} />
              <TableRow cols={['Rechercher', 'Barre de recherche en haut de la page']} />
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-center text-xs text-gray-600 pb-4">En cas de problème, contacte un officier de guilde.</p>
    </div>
  )
}
