import { Waves, Skull, KeyRound, Sparkles, Trophy, ArrowLeft, Gem, MapPin } from 'lucide-react'
import {
  StrategySection, MonsterBlock, SpellRow, TacticList, StratTip, RewardBox, SimpleTable,
} from './StrategyUI'

export function GigalodonStrategy({ onBack }: { onBack: () => void }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex-shrink-0 flex items-center gap-1.5 text-gray-400 hover:text-white border border-[#30363d] hover:border-amber-400/50 rounded-lg px-3 py-2 transition-colors text-sm"
        >
          <ArrowLeft size={14} /> Stratégies
        </button>
        <div className="text-center flex-1 space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Waves className="text-violet-400" size={22} />
            Gouffre du Gigalodon
          </h1>
          <p className="text-gray-500 text-sm">Raid 8-16 joueurs · Source : dofuspourlesnoobs.com</p>
        </div>
      </div>

      {/* Structure du raid */}
      <StrategySection title="Structure du raid" icon={<Sparkles size={18} />}>
        <TacticList items={[
          'Étage -1 : Avant-poste des explorateurs',
          'Étage -2 : Plateau de la Mureine',
          'Étage -3 : Falaise noyée (énigme)',
          'Étage -4 : Terrier d\'Exécrabe',
          'Étage -5 : Ossuaire abyssal (farm fragments)',
          'Étage -6 : Sombrefond de Willorque',
          'Combat final : Le Gigalodon',
        ]} />
        <StratTip>Le raid est chronométré (1h). Le combat final doit être lancé avant l'expiration du timer en parlant au Coffre.</StratTip>
      </StrategySection>

      {/* Intensité lumineuse */}
      <StrategySection title="Mécanique générale : Intensité lumineuse" icon={<Sparkles size={18} />} accent="violet">
        <p className="text-sm text-gray-400">
          L'intensité (0 à 4) module la difficulté des monstres via l'effet <span className="text-white">« Idées noires »</span>.
          Plus elle est basse, plus les monstres sont forts (mais le score gagné est plus élevé).
        </p>
        <SimpleTable rows={[
          ['Intensité 0', '+200% PV, +1000 puissance, +2PM, agressif (10 cases, 5 sec)'],
          ['Intensité 1', '+100% PV, +500 puissance, +1PM'],
          ['Intensité 2', '+50% PV, +250 puissance'],
          ['Intensité 3', '+20% PV, +100 puissance'],
          ['Intensité 4', 'Aucun bonus monstre — combats les plus rapides'],
        ]} />
        <p className="text-xs text-gray-500">
          Coût en Sel des profondeurs : 1 sel → intensité 1, 3 sels → intensité 2 (4 cumulés), 6 sels → intensité 3 (10 cumulés), 10 sels → intensité 4 (20 cumulés).
        </p>
        <StratTip color="violet">Pour la majorité des combats, montez l'intensité à 4 pour aller vite. Ne descendez qu'à 3 si vous cherchez du score supplémentaire et que le groupe est solide.</StratTip>
      </StrategySection>

      {/* Emplacements du Sel des profondeurs */}
      <StrategySection title="Emplacements du Sel des profondeurs" icon={<MapPin size={18} />} accent="violet">
        <p className="text-sm text-gray-400">
          Les gisements ne nécessitent aucun métier. Temps de repop estimé : <span className="text-white">5 à 10 minutes</span>.
        </p>
        <SimpleTable rows={[
          ['Étage -1', '[3,2] · [2,2] · [4,2] · [3,3]'],
          ['Étage -2', '[3,5] · [2,6] · [4,6] · [3,7] · [4,7] (×2) · [5,9] (passage secret)'],
          ['Étage -3', '[2,10] · [3,10] · [1,11] · [2,12]'],
          ['Étage -4', '[6,11] · [7,10] · [8,10] (×2)'],
          ['Étage -5', '[11,14] · [12,14] · [12,13] · [11,13]'],
        ]} />
        <StratTip color="violet">Désignez 1-2 joueurs « récolteurs » qui passent miner pendant que le reste du groupe avance ou combat — ça évite de perdre du temps de raid collectivement.</StratTip>
      </StrategySection>

      {/* Étage -1 */}
      <StrategySection title="Étage -1 — Avant-poste des explorateurs" icon={<Skull size={18} />}>
        <p className="text-sm text-gray-400">Objectif : éliminer les 18 groupes de monstres (5 maps, 3-4 groupes par map).</p>

        <MonsterBlock name="Madrépire">
          <SpellRow name="KO'rail" effect="450 dégâts air" zone="carré 3×3, portée 7PO" cooldown="2×/tour, 1 par cible" />
          <SpellRow name="Récidif" effect="550 dégâts feu + attire 4 cases" zone="croix 4, portée 7PO" cooldown="1×/tour" />
        </MonsterBlock>

        <MonsterBlock name="Kokayou">
          <SpellRow name="Épinade" effect="450 dégâts terre (sur lui-même)" zone="étoile 3" cooldown="1×/tour" />
          <SpellRow name="Hydrage" effect="400 dégâts eau + vol de vie" zone="mêlée" cooldown="2×/tour, 1 par cible" />
        </MonsterBlock>

        <TacticList items={[
          'Pas de mécanique complexe : divisez le raid en 3-4 groupes de 3-6 joueurs pour aller vite.',
          'Maintenez l\'intensité à 3-4.',
        ]} />
      </StrategySection>

      {/* Étage -2 : Mureine */}
      <StrategySection title="Étage -2 — Plateau de la Mureine" icon={<Skull size={18} />} accent="red">
        <MonsterBlock name="Mureine (boss)" hp="51 000" tags={['accompagnée de 1 Madrépire, 1 Kokayou, 1 Léviatank']}>
          <SpellRow name="Impératrice (passif)" effect="Gagne 100 puissance/tour par Murare en vie — débuffable" />
          <SpellRow name="Cuirage" effect="800 dégâts air + 2000 bouclier à tous les Murares en ligne" zone="ligne, portée 7PO" cooldown="1×/tour" />
          <SpellRow name="Disperssssion" effect="700 dégâts eau + invoque 1 Murare au contact de la cible" zone="portée 10PO" cooldown="2×/tour, 1 par cible" />
          <SpellRow name="Triplicité" effect="1150 dégâts terre" zone="fourche 4, mêlée" cooldown="1×/tour" />
        </MonsterBlock>

        <MonsterBlock name="Murares (invocations, max 10)">
          <SpellRow name="Antidote (passif)" effect="Retire tous les « Corroside » en zone cercle 2 autour d'elle à sa mort" />
          <SpellRow name="Corroside" effect="400 dégâts feu + état Corroside cumulable (chaque tic de dégâts ajoute 250 dégâts feu, max 10×/tour)" zone="portée 5PO" cooldown="2×/tour, 1 par cible" />
          <SpellRow name="Faufilette" effect="Échange de position + donne 2PM à un allié" zone="ligne, portée 5PO" cooldown="1×/tour" />
        </MonsterBlock>

        <TacticList items={[
          'La clé du combat : tenir la Mureine à distance pour limiter ses invocations de Murares.',
          'Option A — Retrait de PM massif (2 personnages dédiés) pour la garder loin.',
          'Option B — Tank qui bloque Mureine + Murares dans un coin, le reste du groupe tacle les Murares.',
          'Éliminez les 3 monstres d\'accompagnement (Madrépire, Kokayou, Léviatank) en premier.',
          'Montez l\'intensité à 4 avant de lancer le combat, et allez vite.',
        ]} />

        <RewardBox items={[
          '1× Unité de Mureine (1000 points de score)',
          'Fragment de clé n°2 pour tout le groupe',
          '+1 Sel des profondeurs minimum',
        ]} />
      </StrategySection>

      {/* Étage -3 */}
      <StrategySection title="Étage -3 — Falaise noyée" icon={<Sparkles size={18} />} accent="violet">
        <p className="text-sm text-gray-400">Objectif : résoudre l'énigme du Luminarium (pas de combat).</p>
        <p className="text-sm text-gray-300">
          Puzzle « Lights Out » 4×4 : cliquer sur un poisson-lanterne change son état ainsi que celui de tous ses voisins adjacents.
          Objectif : allumer les 16 poissons.
        </p>
        <TacticList items={[
          'Procédez ligne par ligne, du haut vers le bas.',
          'Cliquez sous les poissons éteints de la ligne du dessus pour les rallumer.',
          'Un seul joueur s\'occupe de l\'énigme (~30 secondes) ; les autres peuvent miner du Sel des profondeurs en attendant.',
          'Ne montez pas l\'intensité lumineuse ici, aucun combat n\'a lieu.',
        ]} />
      </StrategySection>

      {/* Étage -4 : Exécrabe */}
      <StrategySection title="Étage -4 — Terrier d'Exécrabe" icon={<Skull size={18} />} accent="red">
        <p className="text-sm text-gray-400">Objectif : vaincre l'Exécrabe ET résoudre son énigme de statues après le combat.</p>

        <MonsterBlock name="Exécrabe (boss)" hp="100 000" tags={['Indéplaçable', '2 Calarmure, 1 Kokayou, 1 Écaillon, 1 Léviatank']}>
          <SpellRow name="Crustank (passif)" effect="Change d'apparence à 4 seuils de PV : 80k, 60k, 40k, 20k" />
          <SpellRow name="Canopince" effect="600 dégâts eau OU air (aléatoire)" zone="mêlée" cooldown="2×/tour, 1 par cible" />
          <SpellRow name="Encornage" effect="850 dégâts terre + repousse 7 cases" zone="ligne, portée 2PO" cooldown="1×/tour" />
          <SpellRow name="Bisque" effect="950 dégâts (élément variable selon la forme actuelle)" zone="Coquillage : cercle 3 · Oursin : étoile 4 · Perle : carré 3 · Poulpe : cône 4 — portée 7PO" cooldown="1×/tour" />
        </MonsterBlock>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-2">
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Effets aux seuils de forme</p>
          <SimpleTable rows={[
            ['Coquillage', '+5000 bouclier (infini)'],
            ['Oursin', 'Renvoie 20% des dégâts reçus'],
            ['Perle', 'Retire 63 PO à tout le groupe (2 tours, non débuffable)'],
            ['Poulpe', 'Attire tout le groupe en ligne/diagonale sur 10 cases'],
          ]} />
          <p className="text-xs text-amber-400/80">⚠️ L'ordre des 4 apparitions est aléatoire à chaque raid — notez-le, il sert pour l'énigme finale.</p>
        </div>

        <MonsterBlock name="Calarmure">
          <SpellRow name="Armucus" effect="600% bouclier (2 tours)" zone="portée 6PO" cooldown="2×/tour, 1 par cible" />
          <SpellRow name="Encornéant" effect="550 dégâts air" zone="cercle 3, portée 6PO" cooldown="2×/tour, 1 par cible" />
        </MonsterBlock>
        <MonsterBlock name="Léviatank">
          <SpellRow name="Absolutte" effect="S'avance de 5 cases + 325 dégâts air" zone="cône 2, ligne 5PO" cooldown="2×/tour, 1 par cible" />
          <SpellRow name="Branchiche" effect="450 dégâts feu + glyphe 2 tours (250 dégâts feu si traversé)" zone="mêlée" cooldown="1×/tour" />
        </MonsterBlock>
        <MonsterBlock name="Écaillon">
          <SpellRow name="Enfourchage" effect="450 dégâts feu + repousse 3 cases" zone="ligne 4, portée 6PO" cooldown="2×/tour, 1 par cible" />
          <SpellRow name="Tridémence" effect="550 dégâts terre" zone="cône 1, mêlée" cooldown="1×/tour" />
        </MonsterBlock>

        <TacticList items={[
          'Montez l\'intensité à 4 avant le combat.',
          'Éliminez d\'abord tous les monstres d\'accompagnement.',
          'Retrait de PM conseillé : l\'Exécrabe a 64% d\'esquive PM, donc ne comptez pas l\'immobiliser totalement.',
          'Notez précisément l\'ordre des 4 formes (statues qui s\'illuminent au changement de forme).',
          'Minimum 8 joueurs conseillé (faisable à 6 avec un stuff correct).',
        ]} />

        <StratTip color="red">
          Énigme post-combat : cliquez les 4 statues dans l'ordre exact des seuils observés pendant le combat. Une erreur coûte -1000 points de score. Les statues s'illuminent en bleu si l'ordre est correct.
        </StratTip>

        <RewardBox items={[
          '1× Rancune d\'Exécrabe (5000 points de score)',
          '1× Pince d\'Exécrabe (ouvre un raccourci étage -2 → -4)',
          'Fragment de clé n°3 pour tout le groupe',
          '+1 Sel des profondeurs minimum',
        ]} />
      </StrategySection>

      {/* Raccourci */}
      <StrategySection title="Raccourci spécial" icon={<KeyRound size={18} />}>
        <p className="text-sm text-gray-400">
          Position [6,10] sur la carte « Falaise noyée ». Seul le porteur de la Pince d'Exécrabe peut l'ouvrir.
          Mène directement en [4,7] (map de la Mureine).
        </p>
        <StratTip>Aucune Luminomachine sur ce chemin : la lumière peut être à 0, et les monstres peuvent y être agressifs. Restez groupés.</StratTip>
      </StrategySection>

      {/* Étage -5 */}
      <StrategySection title="Étage -5 — Ossuaire abyssal" icon={<KeyRound size={18} />}>
        <p className="text-sm text-gray-400">Objectif : obtenir les 4 fragments de clé (fragments 2 et 3 déjà acquis sur Mureine et Exécrabe).</p>

        <SimpleTable rows={[
          ['Fragment 1', 'Tous les monstres du raid · 1% base (5% à 5000 pts, 10% à 7000 pts, 20% à 10000 pts)'],
          ['Fragment 4', 'Uniquement Krak\'Haine · 1% base + bonus de score'],
        ]} />

        <MonsterBlock name="Krak'Haine">
          <SpellRow name="Abjection" effect="150 dégâts (élément variable)" zone="ligne infinie, mêlée" cooldown="2×/tour" />
          <SpellRow name="Férosignal (sur lui-même)" effect="Retire 1PM à tout le groupe (non esquivable, 1 tour) ; les monstres proches gagnent 1PM" cooldown="1×/tour" />
        </MonsterBlock>

        <TacticList items={[
          'Étage très dépendant du RNG sur le drop des fragments.',
          'Déposez vos trésors avant d\'arriver ici pour augmenter le taux de drop.',
          'Visez un score de 10 000 points avant cet étage pour un taux de 20% sur le fragment 1.',
          'Privilégiez les groupes contenant 2 Krak\'Haine pour le fragment 4.',
          'Montez l\'intensité à 4 pour des combats rapides — les groupes repopent vite.',
        ]} />
        <StratTip color="red">Bug connu : la transition de carte en [12,13] casse parfois l'Autofollow du groupe.</StratTip>
      </StrategySection>

      {/* Étage -6 : Willorque */}
      <StrategySection title="Étage -6 — Sombrefond de Willorque" icon={<Skull size={18} />} accent="red">
        <MonsterBlock name="Willorque (boss)" hp="62 000" tags={['Enraciné', 'pas d\'Idées noires', '10 Poissons Lanterne (550 000 PV, 200% résistance, inéliminables)']}>
          <SpellRow name="C'est assez (passif, sur lui-même)" effect="Gagne 1 à 10 PM selon le Light Count (1PM à 90% → 10PM à 0%) ; devient invisible si Light Count ≤40% ; applique « Switch » au Poisson Lanterne le plus proche" cooldown="1×/tour" />
          <SpellRow name="Écholok" effect="950 dégâts feu + applique « Switch »" zone="portée 5PO" cooldown="1×/tour" />
          <SpellRow name="Sombre Chant (sur lui-même)" effect="Dégâts feu variables (jusqu'à 500+ selon Light Count, ~1400 au seuil)" zone="cercle 10" cooldown="1×/tour" />
        </MonsterBlock>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-2">
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Mécanique « Light Count »</p>
          <p className="text-xs text-gray-400">
            4 Poissons Lanterne allumés au départ (6 éteints). Chaque poisson allumé = +10% de Light Count.
            À 100%, Willorque perd 20% de résistance pendant 1 tour.
          </p>
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mt-2">Effet « Switch »</p>
          <p className="text-xs text-gray-400">
            Le Poisson Lanterne le plus proche de la cible change d'état, ainsi que tous ceux alignés avec lui.
            « Allumer » soigne Willorque de 20% de ses PV max si un joueur est à ≤3PO. « Éteindre » infligent 20% des PV actuels en dégâts neutres aux joueurs à ≤3PO.
          </p>
          <p className="text-xs text-amber-400/80 mt-2">⚠️ Au seuil de 43 400 PV : tous les Poissons Lanterne s'éteignent (Light Count → 0%, map très sombre).</p>
        </div>

        <TacticList items={[
          'Avoir un Pandawa dans le groupe est vivement conseillé.',
          'Bloquez Willorque dans un coin à l\'aide du Pandawa, loin des Poissons Lanterne (évite de les déclencher en mêlée).',
          'Placez 2 personnages en mêlée pour le tacler.',
          'Ignorez complètement la mécanique du Light Count — elle n\'est pas nécessaire pour gagner.',
          'Sans Pandawa : entourez-le avec 4 personnages (moins de contrôle, plus de risques liés aux Poissons Lanterne).',
          'Résistance feu utile mais pas indispensable si le heal suit.',
        ]} />

        <RewardBox items={[
          '1× Noirceur de Willorque (10 000 points de score)',
          '+1 Sel des profondeurs minimum',
        ]} />
      </StrategySection>

      {/* Combat final */}
      <StrategySection title="Combat final — Le Gigalodon" icon={<Trophy size={18} />} accent="violet">
        <p className="text-sm text-gray-400">
          Lancé en parlant au Coffre avant l'expiration du timer du raid. Durée max 3 tours (victoire automatique au tour 4 via « Gigalodoom »).
          Le Gigalodon joue 2 fois par tour (début et milieu de tour). Sa hitbox couvre plusieurs cases (glyphe rouge) : toute case touchée subit des dégâts.
        </p>

        <MonsterBlock name="Gigalodon">
          <SpellRow name="Gigarâle (sur lui-même)" effect="700 dégâts terre aux joueurs à ≤2PO d'un allié/invocation, se propage en cercle 2 autour de chaque touché" cooldown="1×/tour" />
          <SpellRow name="Maxquale" effect="500 dégâts air, portée infinie" cooldown="5×/tour, 1 par cible" />
          <SpellRow name="Ultrasplash (sur lui-même)" effect="700 dégâts eau" zone="cône de chaque côté" cooldown="1×/tour" />
          <SpellRow name="Tournageoire (sur lui-même)" effect="700 dégâts terre + repousse 7 cases (certaines cases ne repoussent pas)" zone="cercle 6" cooldown="1×/tour" />
        </MonsterBlock>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-2">
          <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">Mécanique « Les dents de l'amer »</p>
          <p className="text-xs text-gray-400">
            3 cases en mêlée face au Gigalodon. Un joueur présent sur l'une d'elles au début de son tour est attrapé dans la gueule
            (passe automatiquement son tour) ; un glyphe noir reste à sa place.
          </p>
          <p className="text-xs text-gray-400">
            <span className="text-white">Tour suivant :</span> si quelqu'un se trouve sur le glyphe, le joueur attrapé est OS et le nouveau prend sa place.
            Si personne n'est sur le glyphe, le joueur attrapé est recraché (80% de ses PV actuels en dégâts terre, immunité 1 tour).
          </p>
        </div>

        <TacticList items={[
          'Restez en diagonale par rapport au Gigalodon pour éviter Ultrasplash.',
          'Restez à 3 cases ou plus d\'un allié pour limiter la propagation de Gigarâle.',
          'Ne mettez jamais 3 joueurs en même temps sur les cases de mêlée (risque d\'agression « Dents de l\'amer »).',
          'Restez loin des bords du bassin pour éviter d\'être repoussé hors zone par Tournageoire.',
          'Combat facile dans l\'absolu : l\'enjeu est de maximiser les dégâts en 3 tours, pas de survivre.',
          'Classes à privilégier pour le boost de dégâts : Iop, Pandawa, Huppermage, Sram, Zobal, Ouginak.',
          'Eliotrope utile pour les portails/repositionnement rapide.',
          'Stuff dégâts max recommandé, Dofus Nébuleux (bonus tours 1 et 3), trophées Arcaniste / Impétueux.',
        ]} />

        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-2">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Score selon les dégâts infligés</p>
          <SimpleTable rows={[
            ['10 000 dégâts', '1 000 pts'], ['20 000', '2 000 pts'], ['40 000', '3 000 pts'],
            ['70 000', '4 000 pts'], ['100 000', '5 000 pts'], ['130 000', '6 000 pts'],
            ['160 000', '7 000 pts'], ['200 000', '8 000 pts'], ['250 000', '9 000 pts'],
            ['300 000', '10 000 pts'], ['400 000', '11 000 pts'], ['500 000', '12 000 pts'],
            ['600 000', '13 000 pts'], ['800 000', '14 000 pts'], ['1 000 000', '15 000 pts'],
          ]} />
        </div>
      </StrategySection>

      {/* Tableau des loots */}
      <StrategySection title="Tableau des loots" icon={<Gem size={18} />} accent="violet">
        <p className="text-sm text-gray-400">Ressources communes (récoltées en mineant le Sel des profondeurs, donnent des points de score) :</p>
        <SimpleTable rows={[
          ['Sel des profondeurs', 'Aucun point — utilisé pour monter l\'intensité lumineuse'],
          ['Quartz', '2 points'],
          ['Opale', '4 points'],
          ['Amazonite', '6 points'],
          ['Aventurine', '10 points'],
          ['Lapiz', '15 points'],
          ['Jais', '20 points'],
          ['Onyx', '30 points'],
        ]} />

        <p className="text-sm text-gray-400 pt-1">Butins uniques de boss :</p>
        <SimpleTable rows={[
          ['Unité de Mureine', 'Drop Mureine (étage -2) · 1000 points · unique sur un personnage'],
          ['Rancune d\'Exécrabe', 'Drop Exécrabe (étage -4) · 5000 points'],
          ['Pince d\'Exécrabe', 'Drop Exécrabe (étage -4) · ouvre le raccourci -2 → -4'],
          ['Noirceur de Willorque', 'Drop Willorque (étage -6) · 10 000 points'],
        ]} />

        <p className="text-sm text-gray-400 pt-1">Fragments de clé (nécessaires pour accéder au combat final) :</p>
        <SimpleTable rows={[
          ['Fragment 1', 'Tous monstres du raid · 1% base → jusqu\'à 20% selon le score (5% à 5000 pts, 10% à 7000 pts, 20% à 10000 pts)'],
          ['Fragment 2', 'Garanti sur Mureine (étage -2)'],
          ['Fragment 3', 'Garanti sur Exécrabe (étage -4)'],
          ['Fragment 4', 'Uniquement Krak\'Haine (étage -5) · 1% base + bonus de score'],
        ]} />
        <StratTip color="violet">Plus le score du raid est élevé avant l'étage -5, plus le taux de drop des fragments 1 et 4 augmente — viser 10 000 points avant cet étage donne 20% de chances par monstre.</StratTip>
      </StrategySection>

      {/* Récap timing */}
      <section className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-white font-bold text-base mb-4">
          <Sparkles size={16} className="text-amber-400" /> Récapitulatif de timing (raid 1h)
        </h2>
        <SimpleTable rows={[
          ['Étage -1', 'Diviser en 3-4 groupes de 3-6 joueurs, intensité 3-4'],
          ['Étage -2', 'Intensité 4, foncer sur la Mureine'],
          ['Étage -3', '1 joueur résout l\'énigme (~30s), les autres minent du Sel'],
          ['Étage -4', 'Intensité 4, Exécrabe puis retour déposer les trésors avant -5'],
          ['Étage -5', 'Intensité 4, farm du fragment jusqu\'à obtention (très RNG)'],
          ['Étage -6', 'Combat Willorque directement'],
          ['Gigalodon', 'À lancer en dernier avant la fin du timer, maximiser les dégâts'],
        ]} />
        <p className="text-xs text-gray-500 mt-3">Score cible recommandé : 10 000 points avant le Gigalodon (taux de drop fragment à 20%).</p>
      </section>

      <p className="text-center text-xs text-gray-600 pb-4">
        Source : <span className="text-gray-500">dofuspourlesnoobs.com/gouffre-du-gigalodon.html</span>
      </p>
    </div>
  )
}
