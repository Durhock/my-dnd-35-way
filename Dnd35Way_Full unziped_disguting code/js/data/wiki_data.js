const WIKI_DB = [

  // ── APPLICATION ────────────────────────────────────────────────
  { id:'app_overview', cat:'📖 Application', title:'Vue d\'ensemble',
    keywords:['application','outil','présentation','fonctionnement','comment utiliser'],
    body:`<p class="wiki-p">Ce gestionnaire de personnage D&D 3.5 couvre deux grandes zones :</p>
<div class="wiki-formula">⚒ BUILD CHARACTER → création & configuration du personnage
🎲 GAMEPLAY (Fiche / Préparation / Grimoire / Buffs) → utilisation en jeu</div>
<p class="wiki-p">La zone BUILD regroupe toutes les étapes de création : race, caractéristiques, classes, dons, compétences. La zone GAMEPLAY donne accès à la fiche de jeu, la gestion des sorts préparés, le grimoire et les buffs actifs.</p>
<div class="wiki-note">💡 <strong>Flux recommandé :</strong> BUILD → Infos → Carac → Classes → Dons → Compétences → Résumé → ▶ GAMEPLAY</div>`
  },

  { id:'app_build', cat:'📖 Application', title:'BUILD — sous-pages',
    keywords:['build','création','personnage','construire','sous-pages','étapes'],
    body:`<div class="wiki-section-title">Navigation BUILD</div>
<table class="wiki-table"><thead><tr><th>Page</th><th>Contenu</th><th>Priorité</th></tr></thead><tbody>
<tr><td>📋 Infos Générales</td><td>Nom, alignement, race, portrait, roleplay</td><td>Étape 1</td></tr>
<tr><td>🎲 Caractéristiques</td><td>Scores de base, point-buy, mods raciaux</td><td>Étape 2</td></tr>
<tr><td>⚔ Classes</td><td>Niveaux de classe, DV, BBA, capacités</td><td>Étape 3</td></tr>
<tr><td>✦ Dons</td><td>Sélection depuis la base de 80+ dons</td><td>Étape 4</td></tr>
<tr><td>📚 Compétences</td><td>Rangs investis, compétences de classe</td><td>Étape 5</td></tr>
<tr><td>📊 Résumé</td><td>Récapitulatif complet avant de jouer</td><td>Étape 6</td></tr>
</tbody></table>
<div class="wiki-note">💡 Le bouton <strong>▶ PASSER AU GAMEPLAY</strong> sur la page Résumé bascule vers l'onglet FICHE.</div>`
  },

  { id:'app_generalinfo', cat:'📖 Application', title:'Infos Générales — guide',
    keywords:['infos générales','nom','race','alignement','portrait','roleplay','identité'],
    body:`<div class="wiki-section-title">Champs disponibles</div>
<p class="wiki-p"><strong>Nom, âge, divinité, taille, poids, langues</strong> — données mécaniques et narratives.</p>
<p class="wiki-p"><strong>Alignement</strong> — deux axes indépendants : <em>Loi/Chaos</em> et <em>Bien/Mal</em>, combinés automatiquement (ex: Loyal + Bon = Loyal Bon).</p>
<p class="wiki-p"><strong>Portrait</strong> — upload d'image optionnel, affiché sur la Fiche.</p>
<div class="wiki-section-title">Champs Roleplay (optionnels)</div>
<p class="wiki-p">Ces champs n'ont aucun effet mécanique. Ils aident à construire une identité de personnage cohérente pour le jeu de rôle :</p>
<table class="wiki-table"><thead><tr><th>Champ</th><th>Exemple</th></tr></thead><tbody>
<tr><td>Motivation</td><td>Protéger l'équilibre de la vie et de la mort</td></tr>
<tr><td>Objectif</td><td>Détruire l'empire nécromantique</td></tr>
<tr><td>Trait de personnalité</td><td>Stratège calme, jamais impulsif</td></tr>
<tr><td>Couleur préférée</td><td>Bleu nuit</td></tr>
<tr><td>Plat préféré</td><td>Ragoût d'agneau épicé</td></tr>
<tr><td>Faiblesse</td><td>Confiance excessive envers les pèlerins</td></tr>
<tr><td>Habitude</td><td>Fait tourner ses grains de prière</td></tr>
</tbody></table>`
  },

  { id:'app_sheet', cat:'📖 Application', title:'FICHE — guide',
    keywords:['fiche','sheet','gameplay','personnage','statistiques','affichage'],
    body:`<p class="wiki-p">La FICHE affiche l'état complet du personnage en temps réel. Tous les calculs tiennent compte simultanément des équipements équipés et des buffs actifs.</p>
<div class="wiki-section-title">Sections de la Fiche</div>
<table class="wiki-table"><thead><tr><th>Bloc</th><th>Contenu</th></tr></thead><tbody>
<tr><td>PV / Barres</td><td>PV actuels, max, temporaires avec décomposition</td></tr>
<tr><td>Caractéristiques</td><td>Totaux avec modificateurs, boutons de détail</td></tr>
<tr><td>CA</td><td>CA normale / contact / pris de court</td></tr>
<tr><td>Combat</td><td>BBA, jets de sauvegarde, initiative</td></tr>
<tr><td>Attaques</td><td>Armes équipées avec bonus calculés</td></tr>
<tr><td>Compétences</td><td>Totaux calculés, rang + mod carac + divers</td></tr>
</tbody></table>
<div class="wiki-note">💡 Cliquez le bouton <strong>Détail</strong> à côté de n'importe quelle statistique pour voir la décomposition complète des bonus.</div>`
  },

  { id:'app_prep', cat:'📖 Application', title:'PRÉPARATION — guide',
    keywords:['préparation','sort','préparer','emplacement','slot','per day'],
    body:`<div class="wiki-section-title">Flux de préparation</div>
<div class="wiki-formula">① Bibliothèque (sorts connus)
  → ② Clic "Préparer" → Fenêtre de préparation
  → ③ Choix métamagie (dons actifs) + Divine Métamagie
  → ④ Sorts préparés du jour
  → ⑤ Lancer → Sort dépensé (état : cast)</div>
<div class="wiki-section-title">Emplacements par niveau</div>
<p class="wiki-p">Les emplacements disponibles sont calculés selon le niveau de clerc et le modificateur de SAG. La barre de chaque niveau affiche les emplacements utilisés/total en temps réel.</p>
<div class="wiki-section-title">Métamagie à la préparation</div>
<p class="wiki-p">Seuls les dons de métamagie sélectionnés dans BUILD → Dons apparaissent dans la fenêtre de préparation. Chaque don augmente le niveau d'emplacement requis.</p>
<div class="wiki-note">⚠ Si un sort avec métamagie dépasse le niveau 9, il ne peut pas être préparé.</div>`
  },

  { id:'app_grimoire', cat:'📖 Application', title:'GRIMOIRE — guide',
    keywords:['grimoire','sort','connu','bibliothèque','liste','persistant'],
    body:`<p class="wiki-p">Le GRIMOIRE liste tous les sorts connus du personnage. Il permet :</p>
<ul style="color:var(--text-dim);font-size:13px;line-height:1.8;padding-left:20px;">
<li>D'ajouter des sorts depuis la bibliothèque complète SRD (~140 sorts)</li>
<li>De voir les sorts persistants actifs (durée 24h)</li>
<li>De filtrer par école, niveau, source</li>
<li>De consulter les détails de chaque sort</li>
</ul>
<div class="wiki-note">💡 Un sort doit être dans le Grimoire pour pouvoir être préparé depuis l'onglet PRÉPARATION.</div>`
  },

  { id:'app_buffs', cat:'📖 Application', title:'BUFFS — guide',
    keywords:['buff','bonus','temporaire','actif','barre rapide','effet','isSelf'],
    body:`<p class="wiki-p">Un buff est un ensemble d'effets temporaires actifs sur le personnage. Chaque buff peut modifier plusieurs statistiques simultanément.</p>
<div class="wiki-section-title">Barre Rapide</div>
<p class="wiki-p">La barre rapide en haut de la page permet d'activer/désactiver les buffs favoris d'un clic. Les changements sont immédiatement reflétés dans toutes les statistiques.</p>
<div class="wiki-section-title">Conditions d'application</div>
<div class="wiki-formula">Un buff modifie les calculs SI ET SEULEMENT SI :
  • isActive = true (buff activé)
  • isSelf = true (buff ciblant le personnage lui-même)</div>
<div class="wiki-note">⚠ Un buff créé mais non activé n'a aucun effet. Vérifiez l'interrupteur isActive si un buff ne semble pas appliquer ses bonus.</div>`
  },

  // ── CRÉATION DE PERSONNAGE ──────────────────────────────────────
  { id:'cc_workflow', cat:'⚒ Création', title:'Workflow de création — étape par étape',
    keywords:['workflow','étapes','création','order','guide','pas à pas'],
    body:`<div class="wiki-section-title">Ordre recommandé</div>
<div class="wiki-formula">1. Race → définit les mods de carac, taille, vitesse, langues
2. Point-buy → assignation des scores de base (25 pts)
3. Classes → niveaux, progression BBA/JS, dés de vie
4. Dons → sélection et vérification des prérequis
5. Compétences → investissement des rangs
6. Équipement → dans INVENTAIRE
7. Sorts → ajout au grimoire</div>
<div class="wiki-note">💡 Dans cette application, les étapes 1 à 5 se font dans BUILD CHARACTER. L'équipement et les sorts se gèrent dans les onglets INVENTAIRE et GRIMOIRE.</div>`
  },

  { id:'cc_ability_gen', cat:'⚒ Création', title:'Génération des caractéristiques',
    keywords:['caractéristiques','point-buy','scores','génération','base','coût','25 points'],
    body:`<div class="wiki-section-title">Méthode Point-Buy (25 points — standard)</div>
<p class="wiki-p">Chaque caractéristique commence à 8. Le coût pour monter un score est non-linéaire :</p>
<table class="wiki-table"><thead><tr><th>Score</th><th>Coût cumulatif</th><th>Coût marginal</th></tr></thead><tbody>
<tr><td>8</td><td>0</td><td>—</td></tr>
<tr><td>9</td><td>1</td><td>1</td></tr>
<tr><td>10</td><td>2</td><td>1</td></tr>
<tr><td>11</td><td>3</td><td>1</td></tr>
<tr><td>12</td><td>4</td><td>1</td></tr>
<tr><td>13</td><td>5</td><td>1</td></tr>
<tr><td>14</td><td>6</td><td>1</td></tr>
<tr><td>15</td><td>8</td><td>2</td></tr>
<tr><td>16</td><td>10</td><td>2</td></tr>
<tr><td>17</td><td>13</td><td>3</td></tr>
<tr><td>18</td><td>16</td><td>3</td></tr>
</tbody></table>
<div class="wiki-note">💡 Les mods raciaux s'appliquent APRÈS le point-buy. Exemple : 8 base + Elfe (+2 DEX) = DEX 10 (mod +0).</div>`
  },

  { id:'cc_ability_mods', cat:'⚒ Création', title:'Modificateurs de caractéristiques',
    keywords:['modificateur','mod','caractéristique','formule','table'],
    body:`<div class="wiki-section-title">Formule</div>
<div class="wiki-formula">Modificateur = floor( (Score total − 10) / 2 )</div>
<table class="wiki-table"><thead><tr><th>Score</th><th>Mod</th><th>Score</th><th>Mod</th></tr></thead><tbody>
<tr><td>1</td><td>−5</td><td>14–15</td><td>+2</td></tr>
<tr><td>2–3</td><td>−4</td><td>16–17</td><td>+3</td></tr>
<tr><td>4–5</td><td>−3</td><td>18–19</td><td>+4</td></tr>
<tr><td>6–7</td><td>−2</td><td>20–21</td><td>+5</td></tr>
<tr><td>8–9</td><td>−1</td><td>22–23</td><td>+6</td></tr>
<tr><td>10–11</td><td>0</td><td>24–25</td><td>+7</td></tr>
<tr><td>12–13</td><td>+1</td><td>26–27</td><td>+8</td></tr>
</tbody></table>
<div class="wiki-note">💡 L'application calcule et affiche automatiquement tous les modificateurs en tenant compte des bonus raciaux, d'objet et de buff.</div>`
  },

  { id:'cc_level_up', cat:'⚒ Création', title:'Progression de niveau',
    keywords:['niveau','level up','amélioration','caractéristique niveau','dés de vie','montée'],
    body:`<div class="wiki-section-title">Règles de montée en niveau</div>
<p class="wiki-p">Tous les 4 niveaux (4, 8, 12, 16, 20), le personnage gagne +1 à une caractéristique de son choix.</p>
<div class="wiki-formula">PV gagnés par niveau = jet de dé de vie + mod CON<br>Minimum 1 PV par niveau</div>
<div class="wiki-section-title">Classes multiclassées</div>
<p class="wiki-p">Les BBA, JS et DV des différentes classes se cumulent selon leurs progressions respectives. Quand on ajoute un niveau dans BUILD, choisir la bonne classe est important.</p>
<div class="wiki-note">⚠ Si un niveau est retiré (bouton "Supprimer dernier niveau"), les augmentations de carac liées à ce niveau ne sont pas automatiquement annulées — ajustez manuellement dans Caractéristiques.</div>`
  },

  { id:'cc_feats', cat:'⚒ Création', title:'Dons — progression et règles',
    keywords:['don','feat','prérequis','métamagie','sélection','progression'],
    body:`<div class="wiki-section-title">Progression standard</div>
<p class="wiki-p">Dons gratuits aux niveaux : <strong>1, 3, 6, 9, 12, 15, 18</strong>. Les Humains reçoivent un don supplémentaire au niveau 1.</p>
<div class="wiki-section-title">Dons de classe bonus</div>
<p class="wiki-p">Certaines classes accordent des dons bonus : le Guerrier (dons de combat tous les 2 niveaux), le Mage (Écriture de parchemins au nv 1), etc.</p>
<div class="wiki-section-title">Prérequis</div>
<p class="wiki-p">Dans BUILD → Dons, chaque don affiche ses prérequis avec un indicateur ✔/✖ calculé en temps réel selon les niveaux, BBA et autres dons sélectionnés.</p>
<div class="wiki-section-title">Dons de métamagie (coût en slots)</div>
<table class="wiki-table"><thead><tr><th>Don</th><th>Effet</th><th>+Slots</th></tr></thead><tbody>
<tr><td>Enlarge Spell</td><td>Portée ×2</td><td>+1</td></tr>
<tr><td>Extend Spell</td><td>Durée ×2</td><td>+1</td></tr>
<tr><td>Silent Spell</td><td>Sans composante verbale</td><td>+1</td></tr>
<tr><td>Still Spell</td><td>Sans composante somatique</td><td>+1</td></tr>
<tr><td>Empower Spell</td><td>Variables ×1,5</td><td>+2</td></tr>
<tr><td>Maximize Spell</td><td>Variables au maximum</td><td>+3</td></tr>
<tr><td>Widen Spell</td><td>Zone ×2</td><td>+3</td></tr>
<tr><td>Quicken Spell</td><td>Action libre</td><td>+4</td></tr>
<tr><td>Persistent Spell</td><td>Durée 24h</td><td>+6</td></tr>
</tbody></table>`
  },

  { id:'cc_skills', cat:'⚒ Création', title:'Compétences — règles complètes',
    keywords:['compétence','rang','points','classe','hors classe','max','skill','rangs max'],
    body:`<div class="wiki-section-title">Points de compétences disponibles</div>
<div class="wiki-formula">Par niveau = max(1, points_classe + mod_INT)<br>Au niveau 1 : × 4 (quadruplé)</div>
<table class="wiki-table"><thead><tr><th>Classe</th><th>Points/niveau</th></tr></thead><tbody>
<tr><td>Roublard</td><td>8 + mod INT</td></tr>
<tr><td>Barde, Rôdeur, Druide</td><td>4 + mod INT</td></tr>
<tr><td>Clerc, Barbare, Paladin, Guerrier</td><td>2 + mod INT</td></tr>
<tr><td>Magicien, Ensorceleur</td><td>2 + mod INT</td></tr>
</tbody></table>
<div class="wiki-section-title">Maximum de rangs</div>
<div class="wiki-formula">Compétence de classe (CS) : niveau_perso + 3
Hors compétence de classe : floor( (niveau_perso + 3) / 2 )</div>
<div class="wiki-section-title">Bonus de compétence de classe</div>
<p class="wiki-p">Investir ≥1 rang dans une compétence de classe donne +3 bonus de compétence inclus automatiquement dans le total.</p>
<div class="wiki-note">💡 Question fréquente : <em>Pourquoi ne puis-je pas investir plus de rangs ici ?</em> → Le maximum est niveau+3. A niveau 5, max 8 rangs en CS, 4 rangs hors CS.</div>`
  },

  // ── COMBAT ────────────────────────────────────────────────────
  { id:'combat_ac', cat:'⚔ Combat', title:'Classe d\'Armure (CA)',
    keywords:['CA','armure','classe armure','AC','toucher','plat','contact','touch','flat-footed','déviation'],
    body:`<div class="wiki-section-title">Formule</div>
<div class="wiki-formula">CA = 10 + armure + bouclier + DEX + taille + déviation + naturelle + parade + esquive + divers</div>
<div class="wiki-section-title">Variantes de CA</div>
<table class="wiki-table"><thead><tr><th>Type</th><th>Exclut</th><th>Usage</th></tr></thead><tbody>
<tr><td>CA normale</td><td>—</td><td>Attaque standard</td></tr>
<tr><td>CA de contact</td><td>Armure, bouclier, armure naturelle</td><td>Sorts de toucher, attaques de contact</td></tr>
<tr><td>CA pris de court</td><td>DEX si positif, esquive</td><td>Pris par surprise, immobilisé</td></tr>
</tbody></table>
<div class="wiki-section-title">Règles de cumul CA</div>
<p class="wiki-p">Les bonus d'<strong>armure</strong>, de <strong>bouclier</strong>, d'<strong>armure naturelle</strong> et de <strong>déviation</strong> ne se cumulent pas avec d'autres bonus du même type. Les bonus d'<strong>esquive</strong> se cumulent toujours.</p>
<div class="wiki-note">💡 <em>Pourquoi ma CA n'augmente pas si j'active deux buffs d'Armure ?</em> → Seul le bonus d'armure le plus élevé s'applique.</div>`
  },

  { id:'combat_bab', cat:'⚔ Combat', title:'Bonus de Base à l\'Attaque (BBA)',
    keywords:['BBA','BAB','attaque','progression','bonus attaque','full','medium','poor'],
    body:`<div class="wiki-section-title">Progressions par classe</div>
<table class="wiki-table"><thead><tr><th>Progression</th><th>Classes</th><th>Par niveau</th></tr></thead><tbody>
<tr><td>Rapide (full)</td><td>Guerrier, Paladin, Rôdeur, Barbare</td><td>+1 par niveau</td></tr>
<tr><td>Moyenne (medium)</td><td>Clerc, Druide, Barde, Roublard</td><td>+¾ par niveau</td></tr>
<tr><td>Lente (poor)</td><td>Magicien, Ensorceleur</td><td>+½ par niveau</td></tr>
</tbody></table>
<div class="wiki-section-title">Attaques multiples (itératives)</div>
<div class="wiki-formula">BBA +6/+1 → 2 attaques
BBA +11/+6/+1 → 3 attaques
BBA +16/+11/+6/+1 → 4 attaques</div>
<div class="wiki-section-title">Multiclassage</div>
<p class="wiki-p">Les BBA de plusieurs classes s'additionnent avant d'être tronqués. Un Clerc5/Guerrier5 a BBA = floor(5×¾) + 5 = 3+5 = +8.</p>`
  },

  { id:'combat_saves', cat:'⚔ Combat', title:'Jets de sauvegarde',
    keywords:['JS','sauvegarde','vigueur','réflexes','volonté','fort','ref','will','résistance'],
    body:`<div class="wiki-section-title">Formule</div>
<div class="wiki-formula">Jet de sauvegarde = base_classe + mod_carac + résistance + divers</div>
<table class="wiki-table"><thead><tr><th>Jet</th><th>Carac</th><th>Contre</th></tr></thead><tbody>
<tr><td>Vigueur (Fort)</td><td>CON</td><td>Poison, maladie, effets physiques</td></tr>
<tr><td>Réflexes (Ref)</td><td>DEX</td><td>Zones d'effet, pièges, explosions</td></tr>
<tr><td>Volonté (Will)</td><td>SAG</td><td>Sorts mentaux, enchantements, peur</td></tr>
</tbody></table>
<div class="wiki-section-title">Bases par classe (niveau 1)</div>
<table class="wiki-table"><thead><tr><th>Classe</th><th>Fort</th><th>Ref</th><th>Will</th></tr></thead><tbody>
<tr><td>Clerc, Druide</td><td>Bonne (+2)</td><td>Mauvaise</td><td>Bonne (+2)</td></tr>
<tr><td>Guerrier, Barbare</td><td>Bonne (+2)</td><td>Mauvaise</td><td>Mauvaise</td></tr>
<tr><td>Paladin, Rôdeur</td><td>Bonne (+2)</td><td>Mauvaise</td><td>Mauvaise</td></tr>
<tr><td>Roublard, Barde</td><td>Mauvaise</td><td>Bonne (+2)</td><td>Mauvaise</td></tr>
<tr><td>Magicien</td><td>Mauvaise</td><td>Mauvaise</td><td>Bonne (+2)</td></tr>
</tbody></table>
<div class="wiki-formula">Bonne : commence à +2, +1 tous les 2 niveaux
Mauvaise : commence à 0, +1 tous les 3 niveaux</div>`
  },

  { id:'combat_hp', cat:'⚔ Combat', title:'Points de Vie (PV)',
    keywords:['PV','HP','points de vie','dé de vie','temporaire','temp HP','mort','inconscience'],
    body:`<div class="wiki-section-title">Calcul des PV max</div>
<div class="wiki-formula">PV max = Σ (dés de vie) + (mod CON × niveau) + bonus divers</div>
<p class="wiki-p">Au niveau 1, le dé de vie donne toujours son maximum. Aux niveaux suivants, le dé est lancé (ou une valeur fixe peut être utilisée selon la table du MJ).</p>
<div class="wiki-section-title">PV temporaires</div>
<p class="wiki-p">Les PV temporaires forment un tampon absorbant les dégâts avant les PV normaux. Plusieurs sources de PV temp ne se cumulent pas — seul le total le plus élevé s'applique.</p>
<div class="wiki-formula">Dégâts → d'abord les PV temp → puis les PV normaux
Soins → restaurent uniquement les PV normaux (pas les temp)</div>
<div class="wiki-section-title">États</div>
<table class="wiki-table"><thead><tr><th>PV</th><th>État</th></tr></thead><tbody>
<tr><td>≥ 1</td><td>Normal</td></tr>
<tr><td>0</td><td>Inconscient</td></tr>
<tr><td>-1 à -9</td><td>Mourant (perd 1 PV/round)</td></tr>
<tr><td>-10 ou moins</td><td>Mort</td></tr>
</tbody></table>
<div class="wiki-note">💡 <em>Pourquoi mes dégâts touchent d'abord les PV temp ?</em> → L'application applique automatiquement ce tampon dans la logique d'ajustement des PV.</div>`
  },

  { id:'combat_init', cat:'⚔ Combat', title:'Initiative',
    keywords:['initiative','ordre','combat','dextérité','amélioration réflexe'],
    body:`<div class="wiki-section-title">Formule</div>
<div class="wiki-formula">Initiative = mod DEX + bonus divers (don Improved Initiative : +4)</div>
<p class="wiki-p">L'initiative est un jet de d20 + modificateur d'initiative au début du combat. Un résultat égal se tranche par le modificateur d'initiative.</p>`
  },

  // ── MAGIE ───────────────────────────────────────────────────
  { id:'magic_dc', cat:'✨ Magie', title:'Degré de Difficulté des sorts (DD)',
    keywords:['DD','DC','difficulté','sort','résistance','sauvegarde sort','spell DC'],
    body:`<div class="wiki-section-title">Formule</div>
<div class="wiki-formula">DD = 10 + niveau_sort + modificateur_incantation</div>
<table class="wiki-table"><thead><tr><th>Classe</th><th>Carac d'incantation</th></tr></thead><tbody>
<tr><td>Clerc, Druide, Paladin, Rôdeur</td><td>SAG</td></tr>
<tr><td>Magicien</td><td>INT</td></tr>
<tr><td>Ensorceleur, Barde</td><td>CHA</td></tr>
</tbody></table>
<p class="wiki-p"><strong>Spell Focus</strong> ajoute +1 au DD des sorts d'une école. <strong>Greater Spell Focus</strong> ajoute +1 supplémentaire (cumulables).</p>
<div class="wiki-note">💡 Exemple : Clerc nv 10, SAG 20 (mod +5), prépare <em>Guérison critique</em> (nv 4) → DD = 10 + 4 + 5 = 19</div>`
  },

  { id:'magic_slots', cat:'✨ Magie', title:'Emplacements de sorts par jour',
    keywords:['emplacement','slot','sort','clerc','par jour','niveau sort','bonus sagesse'],
    body:`<div class="wiki-section-title">Emplacements bonus (SAG)</div>
<div class="wiki-formula">Pour chaque niveau de sort N ≤ mod SAG : +1 emplacement/jour</div>
<p class="wiki-p">Exemple : Clerc avec SAG 16 (mod +3) → 1 emplacement bonus pour les niveaux 1, 2 et 3.</p>
<div class="wiki-section-title">Table Clerc — niveaux 1-5</div>
<table class="wiki-table"><thead><tr><th>Nv Clerc</th><th>Nv0</th><th>Nv1</th><th>Nv2</th><th>Nv3</th><th>Nv4</th></tr></thead><tbody>
<tr><td>1</td><td>3</td><td>1+bon.</td><td>—</td><td>—</td><td>—</td></tr>
<tr><td>2</td><td>4</td><td>2+bon.</td><td>—</td><td>—</td><td>—</td></tr>
<tr><td>3</td><td>4</td><td>2+bon.</td><td>1+bon.</td><td>—</td><td>—</td></tr>
<tr><td>4</td><td>5</td><td>3+bon.</td><td>2+bon.</td><td>—</td><td>—</td></tr>
<tr><td>5</td><td>5</td><td>3+bon.</td><td>2+bon.</td><td>1+bon.</td><td>—</td></tr>
<tr><td>7</td><td>6</td><td>4+bon.</td><td>3+bon.</td><td>2+bon.</td><td>1+bon.</td></tr>
</tbody></table>
<div class="wiki-note">⚠ <em>Pourquoi ne puis-je pas préparer plus de sorts de niveau 3 ?</em> → Vérifiez le niveau de clerc et le mod SAG — les emplacements sont calculés depuis ces deux valeurs.</div>`
  },

  { id:'magic_metamagic', cat:'✨ Magie', title:'Métamagie — règles',
    keywords:['métamagie','metamagic','slot','emplacement','niveau sort','préparation','coût'],
    body:`<div class="wiki-section-title">Principe</div>
<p class="wiki-p">Un sort avec métamagie occupe un emplacement de niveau supérieur. Pour un lanceur préparé (clerc, druide, magicien), la métamagie est choisie à la préparation.</p>
<div class="wiki-formula">Niveau emplacement = niveau_sort_base + coût_métamagie</div>
<p class="wiki-p">Exemple : <em>Bénédiction</em> (nv 1) + Persistent Spell (+6) = emplacement de niveau 7.</p>
<div class="wiki-section-title">Gating dans l'application</div>
<p class="wiki-p">Dans BUILD → Dons, sélectionnez les dons de métamagie souhaités. Ils apparaîtront alors dans la fenêtre de préparation (onglet PRÉPARATION).</p>
<div class="wiki-note">⚠ <em>Pourquoi je ne vois pas de dons de métamagie à la préparation ?</em> → Allez dans BUILD → Dons et sélectionnez un ou plusieurs dons de type Métamagie.</div>`
  },

  { id:'magic_divine_mm', cat:'✨ Magie', title:'Divine Métamagie',
    keywords:['divine metamagic','divine métamagie','renvoi','turn undead','tentatives','persistent'],
    body:`<div class="wiki-section-title">Principe (Complete Divine)</div>
<p class="wiki-p">Le don <strong>Divine Metamagic</strong> permet à un clerc de dépenser des tentatives de renvoi des morts-vivants pour appliquer un don de métamagie <em>sans augmenter le niveau de l'emplacement</em>.</p>
<div class="wiki-formula">Tentatives dépensées = coût en slots de la métamagie choisie
Exemple : Divine MM (Persistent) = 6 tentatives pour 0 coût de slot</div>
<div class="wiki-section-title">Conditions dans l'application</div>
<p class="wiki-p">Pour utiliser la Divine Métamagie dans la fenêtre de préparation, le personnage doit :</p>
<ul style="color:var(--text-dim);font-size:13px;line-height:1.8;padding-left:20px;">
<li>Avoir sélectionné le don <strong>Divine Metamagic</strong> dans BUILD → Dons</li>
<li>Avoir sélectionné le don de métamagie correspondant</li>
<li>Avoir des tentatives de renvoi disponibles</li>
</ul>
<div class="wiki-note">💡 Divine MM (Persistent) est l'une des combinaisons les plus puissantes du jeu. Un sort comme <em>Persistant Aura Héroïque</em> peut durer 24h sans coût d'emplacement.</div>`
  },

  { id:'magic_persistent', cat:'✨ Magie', title:'Sorts persistants',
    keywords:['persistant','persistent','24h','durée','divine metamagic','personal','touch'],
    body:`<div class="wiki-section-title">Règles Persistent Spell</div>
<p class="wiki-p">Prérequis : <strong>Persistent Spell</strong> + <strong>Extend Spell</strong>. Ne fonctionne que sur les sorts dont la cible est <em>Personal</em> ou <em>Touch</em>.</p>
<p class="wiki-p">Le sort dure <strong>24 heures</strong>. Il occupe un emplacement 6 niveaux plus élevé (ou 0 avec Divine Métamagie).</p>
<div class="wiki-section-title">Dans cette application</div>
<p class="wiki-p">Un sort marqué comme persistant reste dans la liste des sorts actifs de la fiche jusqu'à la fin de sa durée ou jusqu'à dispense manuelle.</p>`
  },

  // ── BONUS & CUMUL ──────────────────────────────────────────
  { id:'stacking_rules', cat:'⚖ Bonus et Cumul', title:'Règles de cumul des bonus',
    keywords:['cumul','stacking','bonus','armure','bouclier','enhancement','moral','sacré','esquive','même type'],
    body:`<div class="wiki-section-title">Règle fondamentale D&D 3.5</div>
<p class="wiki-p">Les bonus de <strong>même type</strong> ne se cumulent PAS entre eux — seul le plus élevé s'applique. Les bonus de <strong>types différents</strong> se cumulent toujours.</p>
<table class="wiki-table"><thead><tr><th>Type de bonus</th><th>Cumul</th><th>Usage typique</th></tr></thead><tbody>
<tr><td>Esquive</td><td><span class="wiki-tag wiki-tag-good">SE CUMULE</span></td><td>Dons, sorts ciblés</td></tr>
<tr><td>Circonstance</td><td><span class="wiki-tag wiki-tag-good">SE CUMULE</span></td><td>Aide d'un allié</td></tr>
<tr><td>Non typé</td><td><span class="wiki-tag wiki-tag-good">SE CUMULE</span></td><td>Bénédiction, Héroïsme</td></tr>
<tr><td>Armure</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Armures, Sort Armure de mage</td></tr>
<tr><td>Bouclier</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Boucliers, Shield of Faith</td></tr>
<tr><td>Amélioration</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Objets magiques +X</td></tr>
<tr><td>Moral</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Inspirations, Bravade</td></tr>
<tr><td>Armure naturelle</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Race, Barkskin</td></tr>
<tr><td>Déviation</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Ring of Protection</td></tr>
<tr><td>Sacré / Profane</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Bonus divins, maudits</td></tr>
<tr><td>Chance</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Clover, Bless</td></tr>
<tr><td>Résistance</td><td><span class="wiki-tag wiki-tag-bad">NE SE CUMULE PAS</span></td><td>Capes de résistance</td></tr>
</tbody></table>
<div class="wiki-note">💡 Cette application applique ces règles automatiquement via le moteur BONUS_STACKING_RULES. Cliquez <strong>Détail</strong> sur n'importe quelle stat pour voir quels bonus s'appliquent et pourquoi.</div>`
  },

  { id:'stacking_items', cat:'⚖ Bonus et Cumul', title:'Objets magiques et cumul',
    keywords:['objet magique','item','enhancement','anneau','armure magique','cumuler objets'],
    body:`<p class="wiki-p">La plupart des objets magiques accordent des bonus d'<strong>Amélioration</strong> (Enhancement). Deux objets donnant tous deux un bonus Amélioration à la même statistique ne se cumulent pas.</p>
<div class="wiki-note">⚠ Exemple : <em>Gants de force +2</em> et sort <em>Bull's Strength</em> (+4 Amélioration). Seul le +4 s'applique à STR — les +2 des gants sont ignorés tant que le sort est actif.</div>
<p class="wiki-p">Exception notable : <strong>Ioun Stone (Dusty Rose)</strong> donne un bonus d'Armure Insight +1 à la CA — qui se cumule avec tous les autres types.</p>`
  },

  { id:'stacking_buff_debug', cat:'⚖ Bonus et Cumul', title:'Pourquoi ce buff ne s\'applique pas ?',
    keywords:['buff','ne s\'applique pas','debug','vérification','isActive','isSelf'],
    body:`<div class="wiki-section-title">Checklist de débogage</div>
<p class="wiki-p">Si un buff actif ne semble pas modifier les statistiques :</p>
<table class="wiki-table"><thead><tr><th>Vérification</th><th>Solution</th></tr></thead><tbody>
<tr><td>isActive = false</td><td>Activez le buff (interrupteur dans BUFFS)</td></tr>
<tr><td>isSelf = false</td><td>Cochez "Ciblant soi-même" dans les options du buff</td></tr>
<tr><td>Bonus du même type déjà supérieur</td><td>Normal — la règle de cumul s'applique</td></tr>
<tr><td>Buff modifiant une statistique non affichée</td><td>Vérifiez dans Détail de la stat concernée</td></tr>
</tbody></table>
<div class="wiki-note">💡 Les buffs apparaissent dans la décomposition (bouton Détail) même s'ils ne s'appliquent pas à cause des règles de cumul — avec la mention "ignoré (dominé par X)".</div>`
  },

  // ── GLOSSAIRE ────────────────────────────────────────────────
  { id:'gloss_bab', cat:'📚 Glossaire', title:'BBA — Bonus de Base à l\'Attaque',
    keywords:['BBA','BAB','base attack bonus','attaque bonus de base'],
    body:`<p class="wiki-p">Progression de bonus d'attaque accordée par la classe, indépendante des modificateurs de caractéristiques. Voir <span class="wiki-link" onclick="wikiOpen('combat_bab')">→ BBA complet</span>.</p>`
  },
  { id:'gloss_ac', cat:'📚 Glossaire', title:'CA — Classe d\'Armure',
    keywords:['CA','AC','armor class','classe armure'],
    body:`<p class="wiki-p">Score représentant la difficulté à toucher un personnage. Inclut armure, bouclier, DEX, taille et autres mods. Voir <span class="wiki-link" onclick="wikiOpen('combat_ac')">→ CA complète</span>.</p>`
  },
  { id:'gloss_dc', cat:'📚 Glossaire', title:'DD — Degré de Difficulté',
    keywords:['DD','DC','difficulty class','degré difficulté'],
    body:`<p class="wiki-p">Seuil à égaler ou dépasser pour réussir un jet. Pour les sorts : DD = 10 + niveau sort + mod incantation. Voir <span class="wiki-link" onclick="wikiOpen('magic_dc')">→ DD des sorts</span>.</p>`
  },
  { id:'gloss_sr', cat:'📚 Glossaire', title:'RM — Résistance à la Magie',
    keywords:['RM','SR','résistance magie','spell resistance'],
    body:`<p class="wiki-p">Valeur que le lanceur doit égaler avec 1d20 + niveau de lanceur pour que son sort affecte la cible. Exemple : RM 15 → le lanceur doit obtenir 15+ au total.</p>`
  },
  { id:'gloss_aoo', cat:'📚 Glossaire', title:'AO — Attaque d\'Opportunité',
    keywords:['AO','AoO','attaque opportunité','attack of opportunity'],
    body:`<p class="wiki-p">Attaque gratuite déclenchée quand un ennemi provoque une réaction dans une case menacée. Actions provoquantes : se déplacer hors d'une case menacée, lancer un sort, ramasser un objet au sol.</p>`
  },
  { id:'gloss_cs', cat:'📚 Glossaire', title:'CC — Compétence de Classe',
    keywords:['CC','CS','class skill','compétence de classe','rangs'],
    body:`<p class="wiki-p">Une compétence listée comme compétence de classe coûte 1 point/rang (hors CC : 2 pts/rang) et offre +3 dès le 1er rang. Voir <span class="wiki-link" onclick="wikiOpen('cc_skills')">→ Règles compétences</span>.</p>`
  },
  { id:'gloss_la', cat:'📚 Glossaire', title:'AjN — Ajustement de Niveau',
    keywords:['LA','AjN','level adjustment','ajustement niveau'],
    body:`<p class="wiki-p">Pénalité appliquée aux races très puissantes. LA +2 = un nv 5 est traité comme nv 7 pour l'XP requis. Races concernées : Drow (LA+2), Aasimar (LA+1), Tiefelin (LA+1), Duergar (LA+2), Svirfneblin (LA+3).</p>`
  },
  { id:'gloss_cr', cat:'📚 Glossaire', title:'FP — Facteur de Puissance',
    keywords:['FP','CR','challenge rating','facteur puissance'],
    body:`<p class="wiki-p">Indicateur de la difficulté d'un ennemi ou d'un défi. Un groupe de 4 personnages de niveau N devrait avoir un défi équitable contre un monstre de FP N.</p>`
  },
  { id:'gloss_xp', cat:'📚 Glossaire', title:'XP — Points d\'Expérience',
    keywords:['XP','experience','points expérience','monter niveau'],
    body:`<p class="wiki-p">Points gagnés après les rencontres, utilisés pour monter de niveau. La quantité d'XP nécessaire pour chaque niveau est fixe : nv2 = 1000, nv3 = 3000, nv4 = 6000… nv20 = 190 000.</p>`
  },
  { id:'gloss_spell_level', cat:'📚 Glossaire', title:'Niveau de sort',
    keywords:['niveau sort','spell level','0 1 2 3 4 5 6 7 8 9','nv sort'],
    body:`<p class="wiki-p">Mesure de la puissance d'un sort (0 à 9). À ne pas confondre avec le niveau du personnage ou de la classe. Un emplacement de niveau 3 peut accueillir n'importe quel sort de niveau ≤3.</p>`
  },

  // ── FAQ ─────────────────────────────────────────────────────
  { id:'faq_ac_why', cat:'❓ FAQ', title:'Pourquoi ma CA est-elle à cette valeur ?',
    keywords:['CA valeur','pourquoi CA','CA incorrecte','expliquer CA'],
    body:`<p class="wiki-p">La CA est calculée selon la formule : 10 + tous les bonus actifs (armure, DEX, bouclier, naturel, déviation, esquive…). Pour voir le détail :</p>
<div class="wiki-formula">FICHE → bouton "Détail" à côté de la CA</div>
<p class="wiki-p">Vérifiez que vos buffs d'armure sont bien activés et que l'armure/le bouclier sont équipés dans INVENTAIRE.</p>`
  },
  { id:'faq_spell_slot_why', cat:'❓ FAQ', title:'Pourquoi je n\'ai plus d\'emplacement ?',
    keywords:['emplacement','slot','plus de sort','préparer','disponible'],
    body:`<p class="wiki-p">Le nombre d'emplacements par niveau dépend du niveau de clerc ET du mod de SAG. Si un sort avec métamagie monte au niveau 7+ et que vous n'avez pas d'emplacement 7, il ne peut pas être préparé.</p>
<div class="wiki-formula">Emplacements disponibles = table_clerc[nv][slot_level] + bonus_SAG</div>
<p class="wiki-p">Vérifiez dans PRÉPARATION la barre d'emplacements en haut de chaque colonne de niveau.</p>`
  },
  { id:'faq_stack_why', cat:'❓ FAQ', title:'Pourquoi ce bonus ne se cumule pas ?',
    keywords:['ne se cumule','stacking','bonus ignoré','même type','domination'],
    body:`<p class="wiki-p">En D&D 3.5, les bonus du même type ne se cumulent pas. Si deux buffs accordent tous les deux un bonus d'Armure, seul le plus élevé s'applique.</p>
<p class="wiki-p">Cliquez <strong>Détail</strong> sur la statistique concernée pour voir quels bonus sont appliqués, lesquels sont ignorés, et pourquoi.</p>
<p class="wiki-p">Voir <span class="wiki-link" onclick="wikiOpen('stacking_rules')">→ Règles de cumul complètes</span>.</p>`
  },
  { id:'faq_meta_why', cat:'❓ FAQ', title:'Pourquoi la métamagie n\'apparaît pas ?',
    keywords:['métamagie','ne vois pas','préparation','don métamagie'],
    body:`<p class="wiki-p">Les dons de métamagie n'apparaissent dans la fenêtre de préparation que s'ils ont été sélectionnés dans BUILD → Dons.</p>
<div class="wiki-formula">BUILD → Dons → sélectionner un don de type Métamagie</div>
<p class="wiki-p">Allez dans BUILD → Dons, filtrez par type "Métamagie", et activez les dons souhaités.</p>`
  },
  { id:'faq_skill_max', cat:'❓ FAQ', title:'Combien de rangs max dans une compétence ?',
    keywords:['rangs max','maximum rangs','compétence limite','invest'],
    body:`<p class="wiki-p">Le maximum de rangs investissables dans une compétence dépend du niveau du personnage :</p>
<div class="wiki-formula">Compétence de classe : niveau_perso + 3
Hors classe : floor( (niveau_perso + 3) / 2 )</div>
<p class="wiki-p">Exemple au niveau 5 : max 8 rangs (CS), max 4 rangs (hors CS).</p>`
  },


  // ── ARTICLES COMPLETS (règles D&D 3.5) ─────────────────────
// ════════════════════════════════════════════════════════════
// CATÉGORIE : Caractéristiques
// ════════════════════════════════════════════════════════════

{ id:'stat_strength', cat:'💪 Caractéristiques', title:'Force (FOR)',
  aliases:['str','for','force'],
  keywords:['force','for','str','physique','corps','musculature','attaque','dégâts','mêlée'],
  body:`<p class="wiki-p"><strong>La Force (FOR)</strong> mesure la puissance physique, musculaire et athlétique d'un personnage.</p>
<div class="wiki-formula">Modificateur de FOR = (Valeur − 10) / 2, arrondi à l'inférieur</div>
<p class="wiki-p"><strong>Applications mécaniques :</strong></p>
<ul class="wiki-list">
  <li><strong>Attaque en mêlée</strong> : le mod. de FOR s'ajoute au jet d'attaque</li>
  <li><strong>Dégâts en mêlée</strong> : le mod. de FOR s'ajoute aux dégâts (×1.5 à deux mains, ×0.5 en main secondaire)</li>
  <li><strong>Lutte (Grapple)</strong> : le mod. de FOR s'ajoute au jet de lutte</li>
  <li><strong>Compétences</strong> : Escalade, Natation, Saut</li>
  <li><strong>Capacité de charge</strong> : détermine le poids maximum transportable</li>
</ul>
<div class="wiki-example">Exemple : FOR 16 → mod. +3. Un guerrier avec BBA +5 et FOR 16 a un jet d'attaque de d20+8. Avec une arme à deux mains il ajoute +4 (×1.5 arrondi) aux dégâts.</div>`,
  related:['stat_modifier','attack_melee','damage_melee','combat_grapple']
},

{ id:'stat_dexterity', cat:'💪 Caractéristiques', title:'Dextérité (DEX)',
  aliases:['dex','dextérité'],
  keywords:['dextérité','dex','agilité','réflexes','esquive','initiative','distance','ca'],
  body:`<p class="wiki-p"><strong>La Dextérité (DEX)</strong> mesure l'agilité, les réflexes, l'équilibre et la précision des mouvements.</p>
<div class="wiki-formula">Modificateur de DEX = (Valeur − 10) / 2, arrondi à l'inférieur</div>
<p class="wiki-p"><strong>Applications mécaniques :</strong></p>
<ul class="wiki-list">
  <li><strong>CA</strong> : le mod. de DEX s'ajoute à la Classe d'Armure (sauf pris au dépourvu ou immobilisé)</li>
  <li><strong>Attaque à distance</strong> : le mod. de DEX s'ajoute au jet d'attaque</li>
  <li><strong>Initiative</strong> : le mod. de DEX s'ajoute à l'initiative</li>
  <li><strong>Réflexes</strong> : le mod. de DEX s'ajoute au jet de Réflexes</li>
  <li><strong>Compétences</strong> : Camouflage, Déplacement silencieux, Crochetage, Escamotage</li>
</ul>
<div class="wiki-example">Exemple : DEX 14 → mod. +2. Initiative de base = d20+2. La CA du personnage inclut +2 sauf s'il est pris au dépourvu.</div>`,
  related:['stat_modifier','defense_ac','save_reflex','init_formula']
},

{ id:'stat_constitution', cat:'💪 Caractéristiques', title:'Constitution (CON)',
  aliases:['con','constitution'],
  keywords:['constitution','con','pvh','santé','endurance','concentration','vigueur'],
  body:`<p class="wiki-p"><strong>La Constitution (CON)</strong> représente la santé, l'endurance et la vitalité.</p>
<div class="wiki-formula">Modificateur de CON = (Valeur − 10) / 2, arrondi à l'inférieur</div>
<p class="wiki-p"><strong>Applications mécaniques :</strong></p>
<ul class="wiki-list">
  <li><strong>Points de vie</strong> : le mod. de CON s'ajoute à chaque dé de vie (par niveau)</li>
  <li><strong>Vigueur</strong> : le mod. de CON s'ajoute au jet de Vigueur</li>
  <li><strong>Concentration</strong> : CON n'affecte pas directement Concentration (c'est une compétence basée sur le modificateur de classe)</li>
</ul>
<div class="wiki-note">⚠ Une CON de 0 signifie mort immédiate. Réduire la CON via drain/dommage peut être létal.</div>
<div class="wiki-example">Exemple : Guerrier niv.5, d10 de vie, CON 14 (+2). PV maximum = 5 × (moyenne_dé + 2). Si tous les dés donnent 6 : 5 × (6+2) = 40 PV.</div>`,
  related:['stat_modifier','hp_formula','save_fortitude']
},

{ id:'stat_intelligence', cat:'💪 Caractéristiques', title:'Intelligence (INT)',
  aliases:['int','intelligence'],
  keywords:['intelligence','int','compétences','langues','sorts magicien','points compétence'],
  body:`<p class="wiki-p"><strong>L'Intelligence (INT)</strong> mesure la capacité d'apprentissage, de raisonnement et de mémorisation.</p>
<div class="wiki-formula">Modificateur d'INT = (Valeur − 10) / 2, arrondi à l'inférieur</div>
<p class="wiki-p"><strong>Applications mécaniques :</strong></p>
<ul class="wiki-list">
  <li><strong>Points de compétences</strong> : le mod. d'INT s'ajoute aux points gagnés par niveau (minimum 1)</li>
  <li><strong>Langues bonus</strong> : chaque point de mod. d'INT donne une langue supplémentaire au niv.1</li>
  <li><strong>Sorts de Magicien</strong> : le mod. d'INT détermine les sorts bonus et le DD des sorts</li>
</ul>
<div class="wiki-formula">Points de compétences niv.1 = (pts_classe + mod.INT) × 4
Points de compétences niv.2+ = pts_classe + mod.INT (minimum 1)</div>
<div class="wiki-example">Exemple : Roublard (8 pts/niv) avec INT 14 (+2) → 10 pts/niveau. Au niveau 1 : 40 pts. Un INT négatif réduit les points mais le minimum par niveau reste 1.</div>`,
  related:['stat_modifier','skill_points','magic_caster_level']
},

{ id:'stat_wisdom', cat:'💪 Caractéristiques', title:'Sagesse (SAG)',
  aliases:['sag','wis','sagesse','wisdom'],
  keywords:['sagesse','sag','wis','perception','volonté','clerc','druide','sorts divins'],
  body:`<p class="wiki-p"><strong>La Sagesse (SAG)</strong> représente la perspicacité, l'intuition, la perception et la connexion spirituelle.</p>
<div class="wiki-formula">Modificateur de SAG = (Valeur − 10) / 2, arrondi à l'inférieur</div>
<p class="wiki-p"><strong>Applications mécaniques :</strong></p>
<ul class="wiki-list">
  <li><strong>Volonté</strong> : le mod. de SAG s'ajoute au jet de Volonté</li>
  <li><strong>Sorts de Clerc / Druide / Paladin / Rôdeur</strong> : le mod. de SAG détermine sorts bonus et DD</li>
  <li><strong>Compétences</strong> : Détection (Spot), Écoute (Listen), Psychologie (Sense Motive), Premiers soins (Heal)</li>
</ul>
<div class="wiki-example">Exemple : Clerc SAG 16 (+3). DD de ses sorts = 10 + niveau_sort + 3. Son jet de Volonté de base intègre +3 avant le bonus de classe.</div>`,
  related:['stat_modifier','save_will','magic_dc','magic_divine']
},

{ id:'stat_charisma', cat:'💪 Caractéristiques', title:'Charisme (CHA)',
  aliases:['cha','charisme','charisma'],
  keywords:['charisme','cha','social','diplomatie','intimidation','ensorceleur','barde','paladin'],
  body:`<p class="wiki-p"><strong>Le Charisme (CHA)</strong> mesure la force de personnalité, la présence naturelle et le magnétisme social.</p>
<div class="wiki-formula">Modificateur de CHA = (Valeur − 10) / 2, arrondi à l'inférieur</div>
<p class="wiki-p"><strong>Applications mécaniques :</strong></p>
<ul class="wiki-list">
  <li><strong>Sorts d'Ensorceleur / Barde</strong> : le mod. de CHA détermine sorts bonus et DD</li>
  <li><strong>Paladin</strong> : bonus aux jets de Vigueur via CHA (capacité Divine Grace)</li>
  <li><strong>Renvoi des morts-vivants</strong> : le mod. de CHA influence le renvoi</li>
  <li><strong>Compétences</strong> : Diplomatie, Bluff, Intimidation, Déguisement, Représentation</li>
</ul>
<div class="wiki-example">Exemple : Barde CHA 18 (+4). DD de ses sorts = 10 + niveau_sort + 4. Son bonus de Diplomatie intègre +4 avant tout rang.</div>`,
  related:['stat_modifier','magic_caster_level','skill_charisma_skills']
},

{ id:'stat_modifier', cat:'💪 Caractéristiques', title:'Modificateur de caractéristique',
  aliases:['mod','modificateur','ability modifier'],
  keywords:['modificateur','mod','table','calcul','valeur','score','bonus malus'],
  body:`<p class="wiki-p">Le <strong>modificateur</strong> est la valeur effectivement utilisée dans les calculs — pas le score brut.</p>
<div class="wiki-formula">Modificateur = floor((Score − 10) / 2)

Exemples :
 Score  →  Modificateur
   1    →  −5
   3    →  −4
   5    →  −3
   7    →  −2
   9    →  −1
  10    →   0
  11    →   0
  12    →  +1
  13    →  +1
  14    →  +2
  15    →  +2
  16    →  +3
  17    →  +3
  18    →  +4
  20    →  +5
  24    →  +7</div>
<div class="wiki-note">💡 Les scores pairs et impairs donnent le même modificateur. Passer de 14 à 15 ne change rien — passer de 15 à 16 donne +1 au mod.</div>
<div class="wiki-example">Exemple : INT 13 → mod. +1. INT 14 → mod. +2. Un point de différence de score pair/impair peut valoir un point de compétence par niveau.</div>`,
  related:['stat_strength','stat_dexterity','stat_constitution','stat_intelligence']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Jets fondamentaux
// ════════════════════════════════════════════════════════════

{ id:'attack_melee', cat:'⚔ Jets fondamentaux', title:'Jet d\'attaque en mêlée',
  aliases:['attaque mêlée','melee attack','corps à corps'],
  keywords:['attaque','mêlée','toucher','bba','force','taille','jet'],
  body:`<p class="wiki-p">Le jet d'attaque en mêlée détermine si un coup atteint sa cible.</p>
<div class="wiki-formula">Jet d'attaque mêlée = d20 + BBA + mod.FOR + mod.Taille + bonus divers

Résultat ≥ CA cible → TOUCHÉ</div>
<p class="wiki-p"><strong>Composants :</strong></p>
<ul class="wiki-list">
  <li><strong>BBA</strong> : Bonus de Base à l'Attaque selon la classe et le niveau</li>
  <li><strong>Mod. FOR</strong> : modificateur de Force (peut être remplacé par DEX avec Attaque en finesse)</li>
  <li><strong>Mod. Taille</strong> : +1 (Petit), 0 (Moyen), −1 (Grand), −2 (Très Grand)…</li>
  <li><strong>Bonus divers</strong> : amélioration d'arme, sorts (Faveur divine…), dons</li>
</ul>
<div class="wiki-example">Exemple : Guerrier niv.6 (BBA +6), FOR 16 (+3), arme +1, taille Moyen → d20 + 6 + 3 + 0 + 1 = d20+10. Si la CA de la cible est 18, il touche sur 8+.</div>`,
  related:['bab_formula','stat_strength','defense_ac','combat_crit','damage_melee']
},

{ id:'damage_melee', cat:'⚔ Jets fondamentaux', title:'Jet de dégâts en mêlée',
  aliases:['dégâts mêlée','melee damage'],
  keywords:['dégâts','mêlée','force','multiplicateur','dé','damage'],
  body:`<p class="wiki-p">Le jet de dégâts détermine les points de vie retirés après un touché.</p>
<div class="wiki-formula">Dégâts mêlée = Dé_arme + mod.FOR + bonus_arme + bonus_divers

Tenue :
  Main principale (une main)  → +mod.FOR ×1.0
  Deux mains                  → +mod.FOR ×1.5 (arrondi inférieur)
  Main secondaire             → +mod.FOR ×0.5 (min. 0 si positif)</div>
<div class="wiki-note">⚠ Si le mod. de FOR est négatif, il s'applique intégralement quelle que soit la tenue.</div>
<div class="wiki-example">Exemple : Épée longue (1d8), FOR 18 (+4), arme +2. Main principale → 1d8+4+2 = 1d8+6. Deux mains → 1d8+6+2 = 1d8+8 (×1.5 arrondi = +6).</div>`,
  related:['attack_melee','stat_strength','combat_crit']
},

{ id:'attack_ranged', cat:'⚔ Jets fondamentaux', title:'Jet d\'attaque à distance',
  aliases:['attaque distance','ranged attack'],
  keywords:['distance','dex','arc','arbalète','projectile','portée','incrément'],
  body:`<p class="wiki-p">Le jet d'attaque à distance utilise la DEX au lieu de la FOR pour toucher.</p>
<div class="wiki-formula">Jet d'attaque distance = d20 + BBA + mod.DEX + mod.Taille + bonus_divers
  − 2 par incrément de portée au-delà du premier (max 5 incréments)</div>
<div class="wiki-example">Exemple : Archer BBA +4, DEX 16 (+3), arc +1. Portée de base 30m. Au-delà de 30m et jusqu'à 60m : d20+4+3+1−2 = d20+6. Au-delà de 60m : d20+4.</div>`,
  related:['bab_formula','stat_dexterity','damage_ranged']
},

{ id:'damage_ranged', cat:'⚔ Jets fondamentaux', title:'Jet de dégâts à distance',
  aliases:['dégâts distance','ranged damage'],
  keywords:['dégâts','distance','arc','arbalète','force','dex'],
  body:`<p class="wiki-p">Les armes à distance n'ajoutent généralement pas le modificateur de FOR aux dégâts.</p>
<div class="wiki-formula">Dégâts distance = Dé_arme + bonus_arme + bonus_divers
  (sans mod. FOR sauf arcs à poulies / armes de jet)</div>
<p class="wiki-p">Exceptions :</p>
<ul class="wiki-list">
  <li><strong>Arc à poulies (Composite)</strong> : ajoute le mod. FOR s'il est positif</li>
  <li><strong>Armes de jet (hache, dague…)</strong> : ajoutent le mod. FOR</li>
</ul>
<div class="wiki-example">Exemple : Arc court (1d6), bonus +0, aucune FOR → dégâts = 1d6. Arc court à poulies avec FOR 14 (+2) → 1d6+2.</div>`,
  related:['attack_ranged','stat_strength']
},

{ id:'init_formula', cat:'⚔ Jets fondamentaux', title:'Initiative',
  aliases:['initiative','init'],
  keywords:['initiative','ordre de jeu','dex','premier','combat'],
  body:`<p class="wiki-p">L'initiative détermine l'ordre d'action au début d'un combat.</p>
<div class="wiki-formula">Initiative = d20 + mod.DEX + bonus divers

Bonus divers possibles :
  Don Vigilance accrue → +4
  Sorts / capacités spéciales
  Armure de mage (−) → selon l'armure portée</div>
<p class="wiki-p">En cas d'égalité : comparaison du mod. DEX, puis tirage au sort.</p>
<div class="wiki-example">Exemple : DEX 14 (+2), don Vigilance accrue. Initiative = d20+2+4 = d20+6. Un résultat de 17 signifie initiative 23.</div>`,
  related:['stat_dexterity','combat_actions','combat_readied_action']
},

{ id:'bab_formula', cat:'⚔ Jets fondamentaux', title:'BBA — Bonus de Base à l\'Attaque',
  aliases:['bab','bonus de base','base attack bonus'],
  keywords:['bba','bab','attaque','progression','classe','niveau','itérative'],
  body:`<p class="wiki-p">Le <strong>BBA</strong> est un bonus progressif déterminé par la classe et le niveau, représentant l'expertise au combat.</p>
<div class="wiki-formula">Attaques itératives (si BBA ≥ 6) :
  BBA  1– 5 → 1 attaque
  BBA  6–10 → 2 attaques (BBA et BBA−5)
  BBA 11–15 → 3 attaques (BBA, BBA−5, BBA−10)
  BBA 16–20 → 4 attaques

Progressions par classe :
  Guerrier, Barbare, Paladin, Rôdeur → +1/niv (rapide)
  Clerc, Druide, Roublard, Barde     → +3/4 niv (moyen)
  Magicien, Ensorceleur              → +1/2 niv (lent)</div>
<div class="wiki-example">Exemple : Guerrier niv.8 → BBA +8/+3. Deux attaques au corps à corps. BBA +13 → trois attaques +13/+8/+3.</div>`,
  related:['attack_melee','attack_ranged','combat_full_attack']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Défense
// ════════════════════════════════════════════════════════════

{ id:'defense_ac', cat:'🛡 Défense', title:'Classe d\'Armure (CA)',
  aliases:['ca','ac','classe armure','armor class'],
  keywords:['ca','ac','défense','armure','bouclier','dextérité','taille','classe armure'],
  body:`<p class="wiki-p">La <strong>CA</strong> est le seuil à atteindre pour toucher un personnage en combat.</p>
<div class="wiki-formula">CA = 10 + bonus_armure + bonus_bouclier + mod.DEX + mod.Taille + bonus_divers

Exemples de bonus :
  Armure de cuir          → +2 (armure)
  Rondache                → +2 (bouclier)
  Bague de protection +1  → +1 (déflexion)
  Agilité naturelle       → mod. DEX</div>
<p class="wiki-p"><strong>Les bonus de même type ne se cumulent pas</strong> (seul le plus grand est retenu).</p>
<div class="wiki-example">Exemple : Cotte de mailles (+5), rondache (+2), DEX 14 (+2), taille Moyen (0). CA = 10+5+2+2 = 19.</div>`,
  related:['defense_ac_touch','defense_ac_flat','bonus_armor','bonus_types']
},

{ id:'defense_ac_touch', cat:'🛡 Défense', title:'CA de contact',
  aliases:['ca contact','touch ac','contact attack'],
  keywords:['ca contact','touch','sorts','attaque contact','incorporel'],
  body:`<p class="wiki-p">La <strong>CA de contact</strong> ignore tous les bonus d'armure et de bouclier. Elle est utilisée pour les attaques de contact (sorts à contact, incorporels, certains spéciaux).</p>
<div class="wiki-formula">CA de contact = 10 + mod.DEX + mod.Taille + bonus_déflexion + bonus_esquive + bonus_divers

(N'inclut PAS : armure, bouclier, armure naturelle)</div>
<div class="wiki-example">Exemple : Mage en robe de mage (+0 armure), DEX 12 (+1), bague de protection +2. CA normale = 13, CA de contact = 10+1+2 = 13. Mage en cotte de mailles (+5), même DEX et bague : CA normale = 18, CA de contact = 13 (armure ignorée).</div>`,
  related:['defense_ac','defense_ac_flat','magic_touch_spells']
},

{ id:'defense_ac_flat', cat:'🛡 Défense', title:'CA pris au dépourvu',
  aliases:['flat-footed','pris au dépourvu','flat footed'],
  keywords:['pris au dépourvu','flat-footed','initiative','surprise','flanqué','dex perdue'],
  body:`<p class="wiki-p">Un personnage <strong>pris au dépourvu</strong> perd son bonus de DEX à la CA. Cela survient avant son premier tour en combat, ou sous certaines conditions.</p>
<div class="wiki-formula">CA pris au dépourvu = CA − mod.DEX − bonus_esquive
  (bonus_esquive ignorés également)

Conditions déclenchantes :
  - N'a pas encore agi en combat
  - Ne voit pas l'attaquant
  - Attaque par surprise (round de surprise)</div>
<div class="wiki-note">💡 Certaines classes (Roublard niveau 2+ : "Esquive instinctive") gardent leur DEX même pris au dépourvu.</div>
<div class="wiki-example">Exemple : DEX 14 (+2), CA normale 17. CA pris au dépourvu = 17−2 = 15. Un roublard ennemi peut infliger une attaque sournoise contre cette CA réduite.</div>`,
  related:['defense_ac','defense_ac_touch','combat_surprise']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Jets de sauvegarde
// ════════════════════════════════════════════════════════════

{ id:'save_fortitude', cat:'💊 Sauvegardes', title:'Vigueur (Fortitude)',
  aliases:['vigueur','fortitude','fort save'],
  keywords:['vigueur','fortitude','poison','maladie','constitution','mort','drain'],
  body:`<p class="wiki-p">Le jet de <strong>Vigueur</strong> protège contre les effets physiques : poison, maladie, effets de mort, drain de Constitution, etc.</p>
<div class="wiki-formula">Vigueur = bonus_classe + mod.CON + bonus_divers

Progressions par classe :
  Rapide (+2/2 niv) : Barbare, Guerrier, Paladin, Rôdeur
  Lente  (+1/3 niv) : Barde, Clerc, Druide, Magicien, Roublard, Ensorceleur</div>
<div class="wiki-example">Exemple : Guerrier niv.5 (bonus Vigueur +4), CON 14 (+2). Vigueur = 4+2 = +6. Face à un poison DD 15 : il doit faire d20+6 ≥ 15, soit un résultat de 9+.</div>`,
  related:['save_reflex','save_will','save_vs_spell','stat_constitution']
},

{ id:'save_reflex', cat:'💊 Sauvegardes', title:'Réflexes (Reflex)',
  aliases:['réflexes','reflex','ref save'],
  keywords:['réflexes','reflex','explosion','zone','dextérité','esquiver','demi-dégâts'],
  body:`<p class="wiki-p">Le jet de <strong>Réflexes</strong> protège contre les effets de zone et permet d'esquiver partiellement : boule de feu, souffle de dragon, pièges.</p>
<div class="wiki-formula">Réflexes = bonus_classe + mod.DEX + bonus_divers

En cas de réussite face à un effet "demi-dégâts" :
  → Seulement la moitié des dégâts.
En cas d'échec :
  → Dégâts complets.</div>
<div class="wiki-example">Exemple : Roublard niv.4 (bonus Réfl +4), DEX 16 (+3). Réflexes = 4+3 = +7. Boule de feu DD 14 : résultat 9+ pour moitié de dégâts.</div>`,
  related:['save_fortitude','save_will','save_vs_spell','stat_dexterity']
},

{ id:'save_will', cat:'💊 Sauvegardes', title:'Volonté (Will)',
  aliases:['volonté','will','will save'],
  keywords:['volonté','will','charme','contrôle','enchantement','sagesse','mental'],
  body:`<p class="wiki-p">Le jet de <strong>Volonté</strong> protège contre les effets mentaux et magiques : charme, domination, peur, illusions, enchantements.</p>
<div class="wiki-formula">Volonté = bonus_classe + mod.SAG + bonus_divers

Progressions par classe :
  Rapide (+2/2 niv) : Barde, Clerc, Druide, Magicien, Ensorceleur
  Lente  (+1/3 niv) : Barbare, Guerrier, Paladin, Rôdeur, Roublard</div>
<div class="wiki-example">Exemple : Mage niv.6 (bonus Volonté +5), SAG 12 (+1). Volonté = 5+1 = +6. Face à un Charme-personne DD 14 : résultat 8+ pour résister.</div>`,
  related:['save_fortitude','save_reflex','save_vs_spell','magic_dc','stat_wisdom']
},

{ id:'save_vs_spell', cat:'💊 Sauvegardes', title:'Sauvegarde contre un sort — exemple complet',
  aliases:['save vs spell','sauvegarde sort','résister sort','volonté contre sort'],
  keywords:['sauvegarde','sort','volonté','vigueur','réflexes','dd','résister','enchantement'],
  body:`<p class="wiki-p">Cet article explique comment résoudre un jet de sauvegarde face à un sort.</p>
<div class="wiki-formula">Étape 1 — Le lanceur calcule le DD du sort :
  DD = 10 + niveau_du_sort + modificateur_stat_lanceur
  (INT pour Magicien, SAG pour Clerc/Druide, CHA pour Ensorceleur/Barde)

Étape 2 — La cible choisit sa sauvegarde :
  Volonté     → sorts d'enchantement, illusion mentale
  Réflexes    → sorts de zone (boule de feu, etc.)
  Vigueur     → sorts physiques (drain, pétrification)
  Aucune (−)  → sorts sans sauvegarde

Étape 3 — La cible lance d20 + bonus_sauvegarde :
  ≥ DD → RÉUSSITE (effet annulé ou réduit)
  < DD → ÉCHEC (effet complet)</div>
<div class="wiki-example"><strong>Exemple concret — Charme-personne vs Guerrier :</strong><br>
• Mage niv.7, INT 18 (+4), lance Charme-personne (niv.1)<br>
• DD = 10 + 1 + 4 = <strong>DD 15</strong><br>
• Guerrier niv.5, SAG 10 (+0), Volonté +1 (classe lente)<br>
• Jet de Volonté = d20 + 1<br>
• Pour réussir : d20 + 1 ≥ 15 → nécessite un résultat de <strong>14+</strong><br>
• Probabilité de réussite ≈ 35%</div>`,
  related:['save_will','save_fortitude','save_reflex','magic_dc','magic_caster_level']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Magie
// ════════════════════════════════════════════════════════════

{ id:'magic_dc', cat:'✨ Magie', title:'DD des sorts (Difficulté)',
  aliases:['dd','dc','difficulté sort','spell dc'],
  keywords:['dd','dc','difficulté','sort','résister','classe incantation','sagesse','intelligence','charisme'],
  body:`<p class="wiki-p">Le <strong>DD</strong> (Difficulté) est le seuil à atteindre pour qu'une cible résiste à un sort avec une sauvegarde.</p>
<div class="wiki-formula">DD = 10 + Niveau du sort + Modificateur de la caractéristique d'incantation

Caractéristique d'incantation par classe :
  Magicien   → INT
  Clerc      → SAG
  Druide     → SAG
  Paladin    → SAG
  Rôdeur     → SAG
  Ensorceleur→ CHA
  Barde      → CHA</div>
<div class="wiki-example">Exemple : Ensorceleur CHA 18 (+4), lance Éclair (niv.3). DD = 10+3+4 = 17. La cible doit faire d20+Réflexes ≥ 17 pour ne subir que la moitié des dégâts.</div>`,
  related:['save_vs_spell','magic_caster_level','magic_spell_level','stat_intelligence']
},

{ id:'magic_caster_level', cat:'✨ Magie', title:'NLS — Niveau de Lanceur de Sorts',
  aliases:['nls','caster level','niveau lanceur','niveau lanceur de sorts'],
  keywords:['nls','niveaux','lanceur','sort','portée','durée','effets','progression'],
  body:`<p class="wiki-p">Le <strong>NLS</strong> détermine la puissance des sorts : portée, durée, nombre de dés de dégâts, résistance à la magie.</p>
<div class="wiki-formula">NLS = niveau de classe (lanceur de sorts)
  (peut être modifié par dons comme Maîtrise des sorts)</div>
<p class="wiki-p"><strong>Usages du NLS :</strong></p>
<ul class="wiki-list">
  <li>Portée et durée des sorts ("par niveau de lanceur")</li>
  <li>Dégâts : Boule de feu inflige 1d6 par NLS (max 10d6)</li>
  <li>Test contre la Résistance à la Magie (RM)</li>
  <li>Test de Dissipation</li>
</ul>
<div class="wiki-example">Exemple : Magicien niv.8 (NLS 8). Boule de feu → 8d6 dégâts. Durée "1 round/NLS" → 8 rounds. Test contre RM 20 : d20+8 ≥ 20, soit 12+.</div>`,
  related:['magic_dc','magic_resistance','magic_dispel','magic_spell_level']
},

{ id:'magic_resistance', cat:'✨ Magie', title:'Résistance à la Magie (RM)',
  aliases:['rm','mr','résistance magie','spell resistance','magic resistance'],
  keywords:['rm','mr','résistance','magie','sort','test','annuler','dépasser'],
  body:`<p class="wiki-p">La <strong>Résistance à la Magie (RM)</strong> est une valeur numérique. Le lanceur de sorts doit la "dépasser" pour affecter la créature.</p>
<div class="wiki-formula">Test RM = d20 + NLS du lanceur ≥ RM de la cible
  → Réussite : sort affecte normalement
  → Échec : sort annulé</div>
<p class="wiki-p">Le test de RM est distinct de la sauvegarde. Une cible peut réussir le test RM ET sa sauvegarde.</p>
<div class="wiki-note">⚠ Certains sorts ne permettent pas de sauvegarde mais sont bloqués par la RM. D'autres ignorent la RM.</div>
<div class="wiki-example">Exemple : Elfe (RM 11), Magicien niv.6. Test RM = d20+6 ≥ 11 → réussi sur 5+. Probabilité de passer la RM ≈ 80%.</div>`,
  related:['magic_caster_level','magic_dispel','save_vs_spell']
},

{ id:'magic_dispel', cat:'✨ Magie', title:'Dissipation de la magie',
  aliases:['dissipation','dispel magic','annuler sort'],
  keywords:['dissipation','dissiper','annuler','sort','dispel','magic','niveau'],
  body:`<p class="wiki-p">La <strong>Dissipation</strong> annule un sort ou un effet magique actif.</p>
<div class="wiki-formula">Test de Dissipation ciblée :
  d20 + NLS du dissipeur ≥ 11 + NLS du lanceur original
  (plafonné à +10 sur le dé)</div>
<div class="wiki-example">Exemple : Clerc niv.7 dissipe un Mur de feu d'un Mage niv.10. Test : d20+7 ≥ 21. Il faut 14+ sur le d20. Probabilité ≈ 35%.</div>`,
  related:['magic_caster_level','magic_resistance','magic_concentration']
},

{ id:'magic_concentration', cat:'✨ Magie', title:'Test de Concentration',
  aliases:['concentration','concentration check'],
  keywords:['concentration','sort','blessé','incantation','dd','interrompre'],
  body:`<p class="wiki-p">Un lanceur de sorts blessé ou perturbé pendant l'incantation doit réussir un <strong>test de Concentration</strong> pour ne pas perdre le sort.</p>
<div class="wiki-formula">Test de Concentration = d20 + bonus_Concentration

DD si blessé :
  DD = 10 + dégâts_subis + niveau_sort

DD si sort continu et blessé :
  DD = 10 + dégâts_subis + 2 × niveau_sort</div>
<div class="wiki-example">Exemple : Mage lance Boule de feu (niv.3), reçoit 8 points de dégâts juste avant. DD = 10+8+3 = 21. Il doit faire d20+Concentration ≥ 21.</div>`,
  related:['magic_caster_level','magic_spell_components','magic_dc']
},

{ id:'magic_spell_level', cat:'✨ Magie', title:'Niveau de sort',
  aliases:['niveau de sort','spell level','niveau magie'],
  keywords:['niveau sort','0','1','2','3','niveau','oraison','sorts bonus','emplacement'],
  body:`<p class="wiki-p">Le <strong>niveau de sort</strong> est une valeur de 0 à 9 qui mesure la puissance d'un sort. À ne pas confondre avec le niveau du lanceur.</p>
<ul class="wiki-list">
  <li>Sorts de <strong>niveau 0</strong> (oraisons) : basiques, peuvent être utilisés librement</li>
  <li>Sorts de <strong>niveau 1–9</strong> : nécessitent des emplacements de sorts</li>
</ul>
<div class="wiki-formula">Emplacements bonus selon la caractéristique d'incantation :
  Valeur 12–13 → +1 emplacement niv.1
  Valeur 14–15 → +1 niv.1, +1 niv.2
  Valeur 16–17 → +1 niv.1/2/3
  (continue jusqu'à niv.9)</div>
<div class="wiki-example">Exemple : Clerc SAG 16 (+3). Il obtient 1 emplacement bonus de niveau 1, 2 et 3 (emplacements au-delà de ce que donne son niveau de classe).</div>`,
  related:['magic_dc','magic_caster_level','magic_prepared_vs_spontaneous']
},

{ id:'magic_prepared_vs_spontaneous', cat:'✨ Magie', title:'Sorts préparés / spontanés / connus',
  aliases:['préparés','spontanés','connus','prepared','spontaneous'],
  keywords:['sorts préparés','connus','spontanés','magicien','clerc','ensorceleur','barde','memoriser'],
  body:`<p class="wiki-p">Il y a deux systèmes fondamentalement différents.</p>
<div class="wiki-formula"><strong>Sorts PRÉPARÉS (Magicien, Clerc, Druide)</strong>
  Chaque matin → choisit quels sorts mémoriser dans ses emplacements
  Peut mémoriser le même sort plusieurs fois
  Lance exactement les sorts mémorisés

<strong>Sorts CONNUS / SPONTANÉS (Ensorceleur, Barde)</strong>
  Connaît un nombre limité de sorts (fixes)
  Peut lancer n'importe lequel de ses sorts connus autant de fois que ses emplacements le permettent</div>
<div class="wiki-note">💡 Les Clercs et Druides préparent leurs sorts mais ont accès à toute leur liste. Les Magiciens doivent d'abord apprendre les sorts dans leur grimoire.</div>`,
  related:['magic_spell_level','magic_caster_level','magic_dc']
},

{ id:'magic_spell_components', cat:'✨ Magie', title:'Composantes des sorts',
  aliases:['composantes','components','verbal','somatique','matériel','focus'],
  keywords:['composantes','v','s','m','f','verbal','somatique','matériel','focus','sort'],
  body:`<p class="wiki-p">La plupart des sorts nécessitent des <strong>composantes</strong> pour être lancés.</p>
<div class="wiki-formula">V — Verbal : incantation vocale (muselé → impossible)
S — Somatique : gestes précis des mains (entravé → impossible)
M — Matériel : consommé lors du lancement (souvent trivial)
F — Focus : non consommé, doit être en main
DF — Focus divin : symbole sacré (Clerc, Druide)</div>
<div class="wiki-note">💡 Le sort Silence (zone) empêche toute composante verbale. Un lanceur entravé ne peut pas utiliser de composante somatique.</div>`,
  related:['magic_concentration','magic_caster_level']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Compétences
// ════════════════════════════════════════════════════════════

{ id:'skill_ranks', cat:'📚 Compétences', title:'Rangs de compétence',
  aliases:['rangs','skill ranks','points compétence'],
  keywords:['rangs','compétence','points','investir','maximum','niveaux'],
  body:`<p class="wiki-p">Les <strong>rangs</strong> représentent la formation ou l'expérience dans une compétence. On les investit à chaque montée de niveau.</p>
<div class="wiki-formula">Points de compétences gagnés :
  Niveau 1 : (pts_classe + mod.INT) × 4 — minimum 4
  Niveau 2+ : pts_classe + mod.INT — minimum 1

Maximum de rangs :
  Compétence de classe  → niveau_perso + 3
  Hors-classe           → (niveau_perso + 3) / 2 (arrondi bas)</div>
<div class="wiki-example">Exemple : Roublard niv.3 (8 pts/niv), INT 12 (+1). Obtient 9 pts/niveau. Max rangs compétence de classe = 6. Max hors-classe = 3.</div>`,
  related:['skill_class_vs_cross','skill_take10','stat_intelligence']
},

{ id:'skill_class_vs_cross', cat:'📚 Compétences', title:'Compétence de classe / Hors-classe',
  aliases:['compétence classe','class skill','cross class','hors-classe'],
  keywords:['compétence classe','hors-classe','coût','rang','1 pt','2 pts','cross-class'],
  body:`<p class="wiki-p">Une <strong>compétence de classe</strong> coûte 1 point par rang. Une compétence <strong>hors-classe</strong> coûte 2 points par rang et a un maximum inférieur.</p>
<div class="wiki-formula">Compétence de classe : 1 pt → 1 rang (max niv+3)
Hors-classe : 2 pts → 1 rang (max (niv+3)/2)</div>
<p class="wiki-p">Le total d'une compétence est identique quel que soit le coût.</p>
<div class="wiki-example">Exemple : Escalade est une compétence de classe pour un Guerrier. 1 pt = 1 rang. Pour un Magicien, c'est hors-classe : 2 pts = 1 rang. À niv.5, max rangs Guerrier = 8, max rangs Magicien = 4.</div>`,
  related:['skill_ranks','skill_total','stat_intelligence']
},

{ id:'skill_total', cat:'📚 Compétences', title:'Total d\'une compétence',
  aliases:['total compétence','skill check','test compétence'],
  keywords:['total','compétence','modificateur','rang','bonus','test','dd'],
  body:`<p class="wiki-p">Le <strong>total d'une compétence</strong> est la valeur ajoutée au d20 lors d'un test.</p>
<div class="wiki-formula">Total compétence = Rangs + Mod. caractéristique associée + bonus divers

Bonus divers possibles :
  Synergies (+2 depuis une autre compétence à ≥5 rangs)
  Dons (Acrobatique → +2 Équilibre/Saut)
  Circonstances (outil adapté, aide d'un allié…)</div>
<div class="wiki-example">Exemple : Diplomatie 5 rangs, CHA 14 (+2), don Sociable (+2 synergie Bluff). Total = 5+2+2 = +9. Face à un DD 15 : résultat de 6+ pour réussir.</div>`,
  related:['skill_ranks','skill_class_vs_cross','skill_take10']
},

{ id:'skill_take10', cat:'📚 Compétences', title:'Prendre 10 / Prendre 20',
  aliases:['prendre 10','prendre 20','take 10','take 20'],
  keywords:['prendre','10','20','stress','danger','temps','automatique','compétence'],
  body:`<p class="wiki-p">Ces règles permettent d'éviter le dé dans certaines situations.</p>
<div class="wiki-formula"><strong>Prendre 10</strong> :
  Hors combat, sans pression, situation normale
  → Considérer un résultat de 10 sur le d20
  Résultat = 10 + bonus_compétence

<strong>Prendre 20</strong> :
  Hors combat, temps disponible (~2 minutes), possibilité d'essayer en boucle
  → Considérer un résultat de 20
  Résultat = 20 + bonus_compétence
  ⚠ Implique que tous les échecs intermédiaires ont eu lieu</div>
<div class="wiki-example">Exemple : Crochetage +8. Prendre 10 = 18 (réussit la plupart des serrures courantes). Prendre 20 = 28 (réussit presque tout, mais prend du temps).</div>`,
  related:['skill_ranks','skill_total','skill_class_vs_cross']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Combat
// ════════════════════════════════════════════════════════════

{ id:'combat_actions', cat:'⚔ Combat', title:'Types d\'actions',
  aliases:['actions','action libre','rapide','mouvement','simple','complexe','round complet'],
  keywords:['action','libre','rapide','mouvement','simple','complexe','round complet','standard'],
  body:`<p class="wiki-p">À chaque round, un personnage peut effectuer plusieurs types d'actions.</p>
<div class="wiki-formula">Par round (dans l'ordre habituel) :
  1 action complexe (= 1 action simple + 1 déplacement)
  OU  1 action simple + 1 action de déplacement
  OU  1 action de déplacement + 1 action de déplacement (courir)
  + actions rapides/libres illimitées (dans la raison)

Durée approximative :
  Action libre      → 0 temps (parler, lâcher un objet)
  Action rapide     → ≤ 1 par round (sort métamagique, etc.)
  Déplacement       → se déplacer, dégainer, ramasser
  Simple (Standard) → attaque, sort 1 round, boire potion
  Complexe          → charge, attaque totale, courir, sort ≥ 1 round</div>`,
  related:['combat_full_attack','combat_charge','bab_formula']
},

{ id:'combat_full_attack', cat:'⚔ Combat', title:'Attaque totale',
  aliases:['attaque totale','full attack','attaques multiples'],
  keywords:['attaque totale','full attack','itérative','multiples','round complet','bba'],
  body:`<p class="wiki-p">L'<strong>attaque totale</strong> (action complexe) permet d'utiliser toutes les attaques itératives du BBA.</p>
<div class="wiki-formula">Avec BBA +11/+6/+1 → 3 attaques dans le round
  (doit rester immobile ou au plus déplacer de 1,5m)</div>
<p class="wiki-p">Pour bénéficier d'une attaque totale, le personnage ne peut pas se déplacer de plus d'un "pas de placement" (1,5m) ce round.</p>
<div class="wiki-example">Exemple : Guerrier niv.12, BBA +12/+7/+2. 3 attaques à +12, +7, +2. S'il se déplace normalement, il ne fait qu'une seule attaque.</div>`,
  related:['bab_formula','combat_actions','attack_melee']
},

{ id:'combat_crit', cat:'⚔ Combat', title:'Critique',
  aliases:['critique','critical','crit','20 naturel','menace'],
  keywords:['critique','crit','20','menace','multiplicateur','confirmation','dégâts'],
  body:`<p class="wiki-p">Un coup critique inflige des dégâts multipliés.</p>
<div class="wiki-formula">1. Menace critique : jet d'attaque dans la plage critique de l'arme
   (20 pour la plupart, 18–20 pour épée longue, 19–20 pour coutelas)
2. Confirmation : second jet d'attaque contre la même CA
   → Si touché → critique confirmé
3. Dégâts critiques = dés_de_dégâts × multiplicateur
   (×2 pour la plupart, ×3 pour hache, ×4 pour pic de guerre)</div>
<div class="wiki-note">⚠ Un 20 naturel TOUCHE TOUJOURS mais ne confirme pas forcément le critique.</div>
<div class="wiki-example">Exemple : Hache à deux mains (×3), FOR 16 (+3), arme +1. Dégâts normaux = 1d12+4. Critique confirmé = 3d12+12.</div>`,
  related:['attack_melee','damage_melee','bab_formula']
},

{ id:'combat_opportunity', cat:'⚔ Combat', title:'Attaque d\'opportunité',
  aliases:['aoo','attaque opportunité','opportunity attack','zone de contrôle'],
  keywords:['attaque opportunité','aoo','zone contrôle','quitter','maladroit','lancer sort','potion'],
  body:`<p class="wiki-p">Une <strong>attaque d'opportunité (AO)</strong> est une attaque gratuite déclenchée par certains actes imprudents dans la zone de menace d'un ennemi.</p>
<div class="wiki-formula">Zone de menace : 1,5m pour les armes de taille Moyenne
Déclencheurs classiques :
  - Se déplacer hors de la zone de menace sans Retraite
  - Lancer un sort avec composante somatique
  - Utiliser un objet (potion, parchemin)
  - Se lever de terre
  - Effectuer une action de mêlée à distance

Limite : 1 AO par round par défaut (don Réflexes de combat → plusieurs)</div>
<div class="wiki-note">💡 La "Retraite" (action complexe) permet de quitter la zone de menace adjacente sans AO.</div>`,
  related:['combat_actions','combat_full_attack','bab_formula']
},

{ id:'combat_charge', cat:'⚔ Combat', title:'Charge',
  aliases:['charge','charge attack','foncer'],
  keywords:['charge','foncer','bonus','attaque','ca','pénalité','mouvement','distance'],
  body:`<p class="wiki-p">La <strong>charge</strong> est un mouvement rapide suivi d'une seule attaque avec des bonus/malus spécifiques.</p>
<div class="wiki-formula">Charge = mouvement jusqu'à 2× vitesse en ligne droite + 1 attaque
  Bonus d'attaque : +2
  Pénalité de CA : −2 jusqu'au prochain tour
  Armes d'hast : infligent ×2 dégâts contre une charge</div>`,
  related:['combat_actions','attack_melee']
},

{ id:'combat_grapple', cat:'⚔ Combat', title:'Lutte (Grapple)',
  aliases:['lutte','grapple','grappling','saisir'],
  keywords:['lutte','grapple','saisir','immobiliser','force','bba','taille'],
  body:`<p class="wiki-p">La <strong>lutte</strong> permet d'immobiliser un adversaire.</p>
<div class="wiki-formula">Test de Lutte = d20 + BBA + mod.FOR + mod.Taille
  Taille : Petit −4, Moyen 0, Grand +4, TGrand +8…

Processus :
  1. Toucher (attaque mêlée sans arme → AO si pas du don Lutte améliorée)
  2. Jet de Lutte (opposé) : gagnant immobilise le perdant</div>`,
  related:['attack_melee','stat_strength','bab_formula']
},

{ id:'combat_surprise', cat:'⚔ Combat', title:'Surprise et round de surprise',
  aliases:['surprise','embuscade','round surprise'],
  keywords:['surprise','ambush','embuscade','round','flat-footed','pris au dépourvu'],
  body:`<p class="wiki-p">Le <strong>round de surprise</strong> est un round spécial au début d'un combat où certains participants ne peuvent pas agir.</p>
<div class="wiki-formula">Lors d'une embuscade :
  1. Jet de Discrétion (attaquants) vs Détection (défenseurs)
  2. Qui perd le jet → surpris (pris au dépourvu, ne peut pas agir pendant le round de surprise)

Round de surprise :
  Personnages non surpris → 1 action simple ou déplacement
  Personnages surpris → ne font rien</div>
<div class="wiki-note">💡 Un personnage surpris EST pris au dépourvu (perd DEX à la CA) pendant tout le round de surprise.</div>`,
  related:['defense_ac_flat','init_formula','combat_actions']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Bonus et cumuls
// ════════════════════════════════════════════════════════════

{ id:'bonus_types', cat:'⚖ Bonus et Cumul', title:'Types de bonus et règles de cumul',
  aliases:['cumul','bonus','stacking','types bonus','armure','moral','chance','esquive'],
  keywords:['cumul','bonus','types','armure','bouclier','moral','chance','esquive','déflexion','sacré','profane','compétence','naturel','sans type'],
  body:`<p class="wiki-p"><strong>Règle fondamentale :</strong> les bonus de même type ne se cumulent pas — seul le plus grand est retenu.</p>
<div class="wiki-formula">TYPES QUI NE CUMULENT PAS (prendre le plus grand) :
  Armure       → bonus d'armure
  Bouclier     → bonus de bouclier
  Amélioration → +X sur une statistique, arme ou armure
  Armure nat.  → armure naturelle
  Déflexion    → bonus de déflexion à la CA
  Moral        → sorts Héroïsme, Rage, Aide
  Luck/Chance  → sorts de Luck
  Sacré/Profane→ sorts sacrés ou profanes
  Compétence   → sorts de compétence

TYPES QUI CUMULENT :
  Esquive      → bonus d'esquive (cumule avec tous)
  Sans type    → bonus non nommés (cumulent entre eux et avec tout)
  Pénalités    → cumulent toujours</div>
<div class="wiki-example">Exemple : Héroïsme (+2 moral attaque) + Chant de barde (+1 moral attaque) → total moral = +2 (pas +3). Ajouter un bonus d'esquive +1 → total = +3 (cumule).</div>`,
  related:['bonus_armor','defense_ac','save_vs_spell']
},

{ id:'bonus_armor', cat:'⚖ Bonus et Cumul', title:'Bonus d\'armure',
  aliases:['bonus armure','armor bonus'],
  keywords:['armure','bonus','cuir','cotte mailles','harnois','ca'],
  body:`<p class="wiki-p">Le <strong>bonus d'armure</strong> s'ajoute à la CA. Deux armures ne se cumulent pas.</p>
<div class="wiki-formula">Armures courantes (bonus armure) :
  Robe de mage      → +0
  Armure de cuir    → +2
  Cuir clouté       → +3
  Chemise de mailles→ +4
  Cotte de mailles  → +5
  Cuirasse          → +6
  Demi-plate        → +7
  Harnois complet   → +8</div>`,
  related:['defense_ac','bonus_types']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Conditions et états
// ════════════════════════════════════════════════════════════

{ id:'condition_list', cat:'🤕 Conditions', title:'États et conditions — liste',
  aliases:['conditions','états','effets','status','paralysé','aveuglé','étourdi'],
  keywords:['condition','état','paralysé','aveuglé','étourdi','fatigué','épuisé','invisible','effrayé','paniqué','secoué','nauséeux','inconscient','mourant','mort'],
  body:`<p class="wiki-p">Référence rapide des conditions de combat.</p>
<table class="wiki-table"><thead><tr><th>Condition</th><th>Effets principaux</th></tr></thead><tbody>
<tr><td><strong>Aveuglé</strong></td><td>−2 CA, perd DEX à CA, 50% chance de rater attaque, ennemis bénéficient du camouflage total</td></tr>
<tr><td><strong>Paralysé</strong></td><td>Ne peut pas agir, DEX et FOR = 0, adjacents infligent coup de grâce</td></tr>
<tr><td><strong>Étourdi</strong></td><td>Perd ses actions, −2 CA, perd DEX à CA</td></tr>
<tr><td><strong>Fatigué</strong></td><td>−2 FOR et DEX, ne peut pas courir ni charger</td></tr>
<tr><td><strong>Épuisé</strong></td><td>−6 FOR et DEX, se déplace à la moitié de vitesse</td></tr>
<tr><td><strong>Invisible</strong></td><td>+2 attaque, attaquants ont 50% miss chance (camouflage)</td></tr>
<tr><td><strong>Effrayé</strong></td><td>Fuit l'ennemi, −2 attaque / sauvegarde / test compétence</td></tr>
<tr><td><strong>Paniqué</strong></td><td>Fuit en abandonnant tout, pire que effrayé</td></tr>
<tr><td><strong>Secoué</strong></td><td>−2 attaque / sauvegarde / test de compétence</td></tr>
<tr><td><strong>Nauséeux</strong></td><td>Seulement actions de déplacement autorisées</td></tr>
<tr><td><strong>Inconscient</strong></td><td>PV entre −1 et −9, coup de grâce possible</td></tr>
<tr><td><strong>Mourant</strong></td><td>PV négatifs, perd 1 PV/round sauf stabilisation</td></tr>
<tr><td><strong>Mort</strong></td><td>PV ≤ −10 (ou coup mortel)</td></tr>
</tbody></table>`,
  related:['hp_formula','save_vs_spell','magic_concentration']
},

{ id:'hp_formula', cat:'🤕 Conditions', title:'Points de vie, inconscience, mort',
  aliases:['pv','hp','mort','inconscient','mourant','soins'],
  keywords:['pv','hp','points vie','mort','inconscient','négatifs','coup de grâce','stabiliser'],
  body:`<p class="wiki-p">Les <strong>points de vie</strong> représentent la capacité à encaisser des blessures.</p>
<div class="wiki-formula">PV maximum = somme des dés de vie + mod.CON × niveau

Seuils critiques :
   PV > 0    → état normal
   PV = 0    → hors combat (ne peut plus agir)
  −1 à −9   → mourant (perd 1 PV/round, 10% chance naturelle de stabiliser)
  PV ≤ −10  → mort instantanée</div>
<div class="wiki-note">💡 Un Soins légers (1d8+NLS, max +5) peut ramener un mourant au-dessus de 0 PV.</div>
<div class="wiki-example">Exemple : Guerrier à −3 PV. Il est mourant. Sans soins, il fera un jet de CON (10% de chance) pour se stabiliser. Sinon, il atteint −4, −5… jusqu'à −10 et la mort.</div>`,
  related:['condition_list','save_fortitude','stat_constitution']
},

// ════════════════════════════════════════════════════════════
// CATÉGORIE : Formules de calcul (références)
// ════════════════════════════════════════════════════════════

{ id:'formulas_all', cat:'📐 Formules', title:'Formules de calcul — référence complète',
  aliases:['formules','calculs','référence','formule','résumé','récapitulatif'],
  keywords:['formule','calcul','référence','bab','ca','initiative','dégâts','attaque','sauvegarde','compétence','pv'],
  body:`<p class="wiki-p">Référence rapide de toutes les formules principales de D&D 3.5.</p>
<div class="wiki-section-title">Caractéristiques</div>
<div class="wiki-formula">Modificateur = floor((Score − 10) / 2)</div>

<div class="wiki-section-title">Attaque</div>
<div class="wiki-formula">Jet attaque mêlée  = d20 + BBA + mod.FOR + mod.Taille + bonus
Jet attaque distanc = d20 + BBA + mod.DEX + mod.Taille + bonus
  (−2 par incrément de portée supplémentaire)</div>

<div class="wiki-section-title">Dégâts</div>
<div class="wiki-formula">Dégâts mêlée       = dé_arme + mod.FOR (×1.5 deux mains, ×0.5 secondaire) + bonus
Dégâts distance    = dé_arme + bonus (sans FOR, sauf arme de jet / arc composite)</div>

<div class="wiki-section-title">Initiative</div>
<div class="wiki-formula">Initiative = d20 + mod.DEX + bonus divers</div>

<div class="wiki-section-title">Défense</div>
<div class="wiki-formula">CA normale        = 10 + armure + bouclier + mod.DEX + taille + divers
CA de contact     = 10 + mod.DEX + taille + déflexion + esquive
CA pris au dépourvu = CA − mod.DEX − bonus_esquive</div>

<div class="wiki-section-title">Sauvegardes</div>
<div class="wiki-formula">Vigueur   = bonus_classe + mod.CON + divers
Réflexes  = bonus_classe + mod.DEX + divers
Volonté   = bonus_classe + mod.SAG + divers</div>

<div class="wiki-section-title">Magie</div>
<div class="wiki-formula">DD sort   = 10 + niveau_sort + mod.stat_incantation
Test RM   = d20 + NLS ≥ RM cible
Test Conc.= d20 + Concentration ≥ 10 + dégâts + niv.sort
Dissipation= d20 + NLS ≥ 11 + NLS ennemi</div>

<div class="wiki-section-title">Compétences</div>
<div class="wiki-formula">Total compétence   = rangs + mod.carac + divers
Pts compétences niv.1 = (pts_classe + mod.INT) × 4
Pts compétences niv.2+= pts_classe + mod.INT (min.1)
Max rangs classe      = niveau + 3
Max rangs hors-classe = (niveau + 3) / 2</div>

<div class="wiki-section-title">Points de vie</div>
<div class="wiki-formula">PV max = Σ(dés_vie_par_niveau + mod.CON)</div>

<div class="wiki-section-title">BBA — Attaques itératives</div>
<div class="wiki-formula">BBA  1– 5 → 1 attaque
BBA  6–10 → 2 attaques (+BBA / +BBA−5)
BBA 11–15 → 3 attaques
BBA 16–20 → 4 attaques</div>`,
  related:['stat_modifier','attack_melee','defense_ac','save_vs_spell','magic_dc','skill_ranks','bab_formula','hp_formula']
},

];

// ── WIKI STATE ──────────────────────────────────────────────────
