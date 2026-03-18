// ============================================================
// AppState — Source unique de vérité du personnage et de la session
//
// Structure :
//   character   → identité, caractéristiques, PV, déplacements
//   levels      → progression (niveaux pris)
//   items       → inventaire
//   spells      → sorts connus
//   preparedSpells → sorts préparés du jour
//   spellbook   → LEGACY (maintenu pour compat grimoire)
//   spellSlotUsage → emplacements utilisés
//   sourceFilters  → préférence utilisateur (sources de sorts)
//   classAbilities → capacités de classe
//   abilityStates  → états des capacités {id: bool|int}
//   buffs       → buffs actifs/inactifs
//   skillEntries → compétences du personnage
//   feats       → dons
//   log         → journal de session
//   transactions → historique monétaire
// ============================================================

const AppState = {

  // ── Identité et attributs du personnage ──────────────────
  character: {
    id: 'char_001',
    name: '',
    alignment: 'Neutre Bon',
    alignmentLaw: 'Neutre',
    alignmentMoral: 'Bon',
    raceId: 'race_human',
    size: 'Medium',
    type: 'Humanoid',
    age: 0,
    heightMeters: 1.75,
    weightKg: 70,
    deity: '',
    xp: 0,
    levelTotal: 0,
    languages: [],
    notes: '',
    portrait: null,
    templates: [],
    // money moved to AppState.wallet (top-level)
    identity: {
      motivation: '',
      goal: '',
      personalityTrait: '',
      favoriteColor: '',
      favoriteFood: '',
      weakness: '',
      habit: ''
    },
    // Méthode de génération des caractéristiques (UI guide seulement)
    gender:       '',            // 'M' | 'F' | '' (pour calcul IMG)
    abilityMethod: 'pointbuy',   // méthode d'attribution (indicatif)
    abilityMethodNotes: '',
    levelUpBonuses: { 4:'', 8:'', 12:'', 16:'', 20:'' },
    // Informations complémentaires (Le PJ tab — distinct de Concept)
    info: {
      nickname:    '',   // surnom / titre
      origin:      '',   // région / pays d'origine
      culture:     '',   // peuple / milieu / culture
      affiliation: '',   // ordre / guilde / groupe
      appearance:  '',   // apparence physique brève
      corpulence:  '',   // corpulence manuelle (override IMC auto)
      deity2:      ''    // divinité secondaire
    },  // 'pointbuy' | 'dice' | 'standard' | 'manual'
    // Concept RP du personnage
    concept: {
      // ── Bloc 0 — existants ──────────────────────────────
      archetype:   '',  // chevalier déchu, prêtre errant…
      mainFlaw:    '',  // arrogance, naïveté…
      expression:  '',  // tic, citation, geste…
      fear:        '',  // peur ou faiblesse
      goal:        '',  // objectif narratif
      extraNotes:  '',  // notes libres
      // ── Bloc 1 — Essence ────────────────────────────────
      heroName:    '',  // nom héroïque / surnom
      howSeen:     '',  // comment les autres le décrivent
      // ── Bloc 2 — Failles & moteur ───────────────────────
      temptation:  '',  // pouvoir, vengeance, connaissance…
      // ── Bloc 3 — Psychologie ────────────────────────────
      deepWish:    '',  // que veut vraiment ce personnage ?
      regret:      '',  // ce qu'il regrette le plus
      wouldChange: '',  // ce qui pourrait le faire changer de camp
      // ── Bloc 4 — Relations ──────────────────────────────
      ally:        '',  // allié principal
      enemy:       '',  // ennemi personnel
      protects:    '',  // personne protégée
      // ── Bloc 5 — Symbolique ─────────────────────────────
      animalSelf:  '',  // si ce personnage était un animal
      fetish:      '',  // objet fétiche
      typicalLine: '', // phrase typique
      // ── Bloc 6 — Habitudes ──────────────────────────────
      ritual:      '',  // rituel quotidien
      habit:       ''   // tic ou manie (distinct de expression)
    },
    tempAcMods: [
      { value: 0, reason: '' },
      { value: 0, reason: '' }
    ],
    tempSaveMods: {
      fortitude: [{ value: 0, reason: '' }, { value: 0, reason: '' }],
      reflex:    [{ value: 0, reason: '' }, { value: 0, reason: '' }],
      will:      [{ value: 0, reason: '' }, { value: 0, reason: '' }]
    },
    defenses: {
      dr:          [],   // [{value:5, type:'argent'}]
      immunities:  [],   // [{type:'poison'}]
      resistances: []    // [{type:'feu', value:10}]
    },
    hp: { baseMax: 0, temporary: 0, current: 0, nonLethal: 0 },
    movement: { land: 30, fly: 0, swim: 0, climb: 0, burrow: 0 },
    abilityScores: {
      STR: { base: 10, racial: 0, levelUp: 0, inherent: 0, enhancement: 0, size: 0, morale: 0, luck: 0, sacred: 0, untyped: 0, penalty: 0, tempBonus: 0 },
      DEX: { base: 10, racial: 0, levelUp: 0, inherent: 0, enhancement: 0, size: 0, morale: 0, luck: 0, sacred: 0, untyped: 0, penalty: 0, tempBonus: 0 },
      CON: { base: 10, racial: 0, levelUp: 0, inherent: 0, enhancement: 0, size: 0, morale: 0, luck: 0, sacred: 0, untyped: 0, penalty: 0, tempBonus: 0 },
      INT: { base: 10, racial: 0, levelUp: 0, inherent: 0, enhancement: 0, size: 0, morale: 0, luck: 0, sacred: 0, untyped: 0, penalty: 0, tempBonus: 0 },
      WIS: { base: 10, racial: 0, levelUp: 0, inherent: 0, enhancement: 0, size: 0, morale: 0, luck: 0, sacred: 0, untyped: 0, penalty: 0, tempBonus: 0 },
      CHA: { base: 10, racial: 0, levelUp: 0, inherent: 0, enhancement: 0, size: 0, morale: 0, luck: 0, sacred: 0, untyped: 0, penalty: 0, tempBonus: 0 }
    }
  },

  // ── Progression ──────────────────────────────────────────
  levels: [],

  // ── INVENTAIRE — niveau 2 : instances possédées ─────────────
  // Chaque instance : instanceId, itemDbId, customItem, quantity,
  //   paid, forSale, identified, acquisitionType, acquisitionNote,
  //   manualPriceGp, manualWeightLb, notes, container
  // NE PAS stocker .equipped ici — source de vérité : equipment{}
  inventory: [],
  // inventory instance (simple): { instanceId, itemDbId, customItem, quantity, paid, notes }
  // customItem = null si objet catalogue, sinon objet complet (custom/looted/etc.)

  // ── ÉQUIPEMENT — niveau 3 : références d'instanceId ──────────
  // Valeur = instanceId (string) ou null. slotless = tableau.
  equipment: {
    head: null, face: null, neck: null,
    shoulders: null, chest: null, body: null,
    waist: null, arms: null, hands: null, feet: null,
    ring1: null, ring2: null,
    armor: null, shield: null,
    main_hand: null, off_hand: null, range: null,
    slotless: [],
  },

  // ── BOURSE ────────────────────────────────────────────────────
  wallet: { pp: 0, gp: 0, sp: 0, cp: 0 },
  walletLog: [],
  // walletLog entry (simple): { id, amount, currency, note, timestamp }
  // amount > 0 = gain, < 0 = dépense. note = texte libre du joueur.

  // ── ITEMS ACTIFS ─────────────────────────────────────────────
  // instanceId[] des items dont les effets sont actifs sur la fiche.
  // Par défaut : tout item équipé est actif (_equipSet l'ajoute automatiquement).
  // Le joueur peut désactiver sans déséquiper (bouton dans l'équipement).
  // V1 : équipé = passif, actif = effets appliqués à la fiche.
  activeItems: [],

  // ── CATALOGUE CUSTOM ─────────────────────────────────────────
  // Objets créés par le joueur via le builder custom.
  // Apparaissent dans le shop et peuvent être ajoutés à l'inventaire.
  // Schéma : { id, name:{fr}, category, slot, priceGp, weightKg,
  //            description:{fr}, effects[], wData?, aData?, createdAt }
  customItems: [],

  // ── FORGE — niveau 4 : projets d'amélioration ────────────────
  forgeProjects: [],
  // forgeProject: { projectId, baseInventoryInstanceId,

  // ── JOURNAL DE BORD ──────────────────────────────────────────
  journal: {
    campaign: {
      title:'', subtitle:'', gm:'', startDate:'', tone:'',
      summary:'', worldContext:'', factions:[], timeline:[], tags:[]
    },
    encyclopedia: { entries:[] },
    // entry: { id, type, name, status, tags[], summary, content,
    //          linkedEntryIds[], sessionIds[], notes, createdAt }
    // types: city|region|npc|faction|place|artifact|event|rumor
    sessions: [],
    // session: { id, num, date, title, summary, notes,
    //            locations[], npcs[], loot[], events[],
    //            unresolved[], linkedEntryIds[], tags[] }
    personalLog: [],
    // entry: { id, date, sessionId, title, mood, content }
  },

  // ── FORGE — niveau 4 : projets d'amélioration ────────────────
  // forgeProject: { projectId, baseInventoryInstanceId,
  //   baseItemSnapshot, targetType, enhancementBonus,
  //   specialProperties[], projectedPriceGp, deltaPriceGp, notes }

  // ── MAGIE — 4 états séparés ──────────────────────────────
  // Catalogue : SPELL_DB (data/, read-only)
  // Répertoire : sorts retenus par le joueur
  spellbook: [],
  grimoire:  [],      // sorts personnels créés par le joueur
  // entry: { id, dbId, tags:[], notes:'', addedAt }
  spells: [],  // alias rétro-compat → toujours vide si spellbook est utilisé

  // Préparation du jour
  preparedSpells: [],
  // entry: { id, dbId, level, metamagic:[], cast:false, castAt:null }

  // Slots consommés aujourd'hui { '1':count, … }
  spellSlotUsage: {},

  // ── Buffs ────────────────────────────────────────────────
  buffs: [],

  // ── Capacités de classe ───────────────────────────────────
  classAbilities: [],  // liste des capacités actives/passives
  abilityStates: {},   // états courants {ca_state_id: bool, ca_charges_id: int}

  // ── Compétences ──────────────────────────────────────────
  skillEntries: [],

  // ── Dons ─────────────────────────────────────────────────
  feats: [],

  // ── Journal de session ───────────────────────────────────
  log: [],
  fightRound:  0,
  fightLog:    [],

  // ── Préférences utilisateur (session) ────────────────────
  sourceFilters: { official: true, magazine: true, community: false, custom: true },

  // ── Combat ───────────────────────────────────────────────
  // Profils d'arme, buffs offensifs manuels, cibles CA
  // Initialisé par _initCombatState() dans combat.js
  combat: {
    weapons:     [],   // jusqu'à 5 profils d'arme
    globalBuffs: [],   // bonus globaux manuels offensifs
    acTargets:   []    // cibles pour estimation AC
  },

  // ── Filtres bibliothèque de sorts ─────────────────────────
  spellFilters: {
    level:'', school:'', class:'', source:'', search:'',
    tags: [],   // tags fonctionnels : soin, dégâts, buff, debuff, contrôle…
    selectedOnly: false,
  }
};


// ============================================================
// Selectors — helpers métier qui lisent AppState
// (dépendent de FEAT_DB, RACE_DB, TEMPLATE_DB, getBAB, getAbilityTotal)
// ============================================================

function hasFeat(featId) {
  return AppState.feats.some(f => f.id === featId);
}

function checkFeatPrereqs(featId) {
  const feat = FEAT_DB[featId];
  if (!feat) return { met: true, details: [] };
  const bab = getBAB();
  const details = feat.prereqs.map(p => {
    let met = false, text = '';
    if (p.type === 'ability') {
      const total = getAbilityTotal(p.key);
      met = total >= p.min;
      text = `${p.key} ${p.min} (actuel : ${total})`;
    } else if (p.type === 'feat') {
      met = hasFeat(p.key);
      const pf = FEAT_DB[p.key];
      text = `Don : ${pf ? pf.nameFr || pf.nameEn : p.key}`;
    } else if (p.type === 'bab') {
      met = bab >= p.min;
      text = `BBA +${p.min} (actuel : ${bab})`;
    } else if (p.type === 'caster_level') {
      met = AppState.levels.length >= p.min;
      text = `Niveau de lanceur ${p.min}+`;
    } else if (p.type === 'skill') {
      const entry = AppState.skillEntries.find(e => e.skillId === p.key);
      met = entry ? entry.ranks >= p.min : false;
      text = `${SKILL_REF[p.key]?.name || p.key} ${p.min} rangs`;
    } else if (p.type === 'special') {
      met = true;
      text = `⚠ ${p.text}`;
    }
    return { text, met };
  });
  return { met: details.every(d => d.met), details };
}

function getSelectedMetamagicFeats() {
  return AppState.feats
    .map(f => FEAT_DB[f.id])
    .filter(f => f && f.type === 'metamagic');
}

function getCurrentRace() {
  return RACE_DB[AppState.character.raceId] || null;
}

function getCharacterLA() {
  const raceEntry = RACE_DB[AppState.character.raceId];
  const raceLa = raceEntry ? (raceEntry.la || 0) : 0;
  const templateLa = (AppState.character.templates || []).reduce((sum, tid) => {
    const t = TEMPLATE_DB[tid];
    return sum + (t ? (t.la || 0) : 0);
  }, 0);
  return raceLa + templateLa;
}

function getECL() {
  return AppState.levels.length + getCharacterLA();
}
