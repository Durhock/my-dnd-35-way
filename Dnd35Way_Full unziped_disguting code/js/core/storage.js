// ============================================================
// storage.js — Persistance du personnage
//
// Chemin canonique : localStorage, clé SAVE_KEY ('dnd35_char_v1')
//
// API publique :
//   saveToLocalStorage()     → sauvegarde AppState
//   loadFromLocalStorage()   → charge AppState, retourne bool
//   exportJSON()             → téléchargement fichier JSON
//   importJSON()             → import depuis fichier JSON
//   resetCharacter()         → réinitialise le personnage actif
//   autosave()               → alias de saveToLocalStorage
//   loadSampleData()         → données de démonstration (Shruikhan)
// ============================================================

const SAVE_KEY = 'dnd35_char_v1';

// ── Sauvegarde ───────────────────────────────────────────────
function saveToLocalStorage() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(AppState));
    const el = document.getElementById('save-indicator');
    if (el) {
      el.textContent = '✓ Sauvegardé';
      el.style.color = 'var(--green)';
      setTimeout(() => { el.textContent = ''; }, 2000);
    }
  } catch(e) { console.warn('Save failed', e); }
}

// ── Chargement ───────────────────────────────────────────────
function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    _applyData(saved);
    return true;
  } catch(e) { console.warn('Load failed', e); return false; }
}

// ── Helper interne : applique un objet sauvegardé à AppState ─
function _applyData(saved) {
  if (saved.character) {
    Object.assign(AppState.character, saved.character);
    // Garanties de structure pour champs ajoutés après v1
    if (!AppState.character.tempAcMods)
      AppState.character.tempAcMods = [{value:0,reason:''},{value:0,reason:''}];
    if (!AppState.character.defenses)
      AppState.character.defenses = { dr:[], immunities:[], resistances:[] };
        if (!AppState.character.tempSaveMods)
      AppState.character.tempSaveMods = {
        fortitude: [{value:0,reason:''},{value:0,reason:''}],
        reflex:    [{value:0,reason:''},{value:0,reason:''}],
        will:      [{value:0,reason:''},{value:0,reason:''}]
      };
    if (!AppState.character.identity)  AppState.character.identity  = {};
    if (!AppState.character.concept) AppState.character.concept = { archetype:'', mainFlaw:'', expression:'', fear:'', goal:'', extraNotes:'', heroName:'', howSeen:'', temptation:'', deepWish:'', regret:'', wouldChange:'', ally:'', enemy:'', protects:'', animalSelf:'', fetish:'', typicalLine:'', ritual:'', habit:'' };
    else {
      const _c = AppState.character.concept;
      const _cDefaults = { heroName:'', howSeen:'', temptation:'', deepWish:'', regret:'', wouldChange:'', ally:'', enemy:'', protects:'', animalSelf:'', fetish:'', typicalLine:'', ritual:'', habit:'' };
      Object.entries(_cDefaults).forEach(([k,v]) => { if (_c[k] === undefined) _c[k] = v; });
    }
    if (AppState.character.gender === undefined) AppState.character.gender = '';
    if (AppState.character.abilityMethodNotes === undefined) AppState.character.abilityMethodNotes = '';
    if (!AppState.character.levelUpBonuses) AppState.character.levelUpBonuses = { 4:'', 8:'', 12:'', 16:'', 20:'' };
    else { [4,8,12,16,20].forEach(n => { if (AppState.character.levelUpBonuses[n] === undefined) AppState.character.levelUpBonuses[n] = ''; }); }
    if (!AppState.character.info)      AppState.character.info      = { nickname:'', origin:'', culture:'', affiliation:'', appearance:'', corpulence:'', deity2:'' };
    else { if (AppState.character.info.corpulence === undefined) AppState.character.info.corpulence = ''; if (AppState.character.info.deity2 === undefined) AppState.character.info.deity2 = ''; }
    if (AppState.character.abilityMethod === undefined) AppState.character.abilityMethod = 'pointbuy';
    // wallet is now top-level; this guard kept for old-save compat
    if (!AppState.character.money) AppState.character.money = {pp:0,gp:0,sp:0,cp:0};
  }

  // ── Migration: character.money → AppState.wallet ─────────────
  // Old saves stored money inside character; new model is top-level wallet
  if (saved.character?.money && !saved.wallet) {
    Object.assign(AppState.wallet, saved.character.money);
  } else if (saved.wallet) {
    Object.assign(AppState.wallet, saved.wallet);
  }
  // ── Migration: items → inventory ────────────────────────────
  // Old saves used AppState.items with .equipped on instances.
  // New model uses AppState.inventory (no .equipped) + AppState.equipment{}.
  if (saved.items && !saved.inventory) {
    // Convert old item instances to new format
    AppState.inventory = (saved.items || []).map(i => ({
      instanceId:     i.id || ('inv_' + Date.now() + '_' + Math.random().toString(36).slice(2,7)),
      itemDbId:       i.sourceRef || null,
      customItem:     i.isCustom ? {
        name: { fr: i.name, en: i.nameEn || '' },
        category: i.category, slot: i.slot, priceGp: i.pricePaid||0,
        weightLb: (i.weightKg||0) * 2.20462,
        description: { fr: i.description || '' }, effects: i.effects || [],
        aData: i.armorData || i.aData, wData: i.weaponData || i.wData,
      } : null,
      quantity:        i.quantity || 1,
      paid:            i.pricePaid || 0,
      forSale:         false,
      identified:      true,
      acquisitionType: i.acquisitionType || 'other',
      acquisitionNote: i.acquisitionNote || '',
      manualPriceGp:   null,
      manualWeightLb:  null,
      notes:           i.notes || '',
      container:       null,
      // Temp: keep isCustom/name for migration checks
      _migratedFrom:   i.id || null,
    }));
    // Rebuild equipment{} from old .equipped flags
    const eq = AppState.equipment;
    AppState.inventory.forEach(inst => {
      const oldItem = (saved.items||[]).find(i => i.id === inst._migratedFrom);
      if (oldItem?.equipped && oldItem.slot) {
        if (oldItem.slot === 'slotless') {
          if (!eq.slotless.includes(inst.instanceId)) eq.slotless.push(inst.instanceId);
        } else if (eq[oldItem.slot] === null || eq[oldItem.slot] === undefined) {
          eq[oldItem.slot] = inst.instanceId;
        }
      }
    });
  } else if (saved.inventory) {
    AppState.inventory = saved.inventory;
  }
  if (saved.equipment) Object.assign(AppState.equipment, saved.equipment);
  if (saved.walletLog)     AppState.walletLog     = saved.walletLog;
  if (saved.forgeProjects) AppState.forgeProjects = saved.forgeProjects;
  if (saved.customItems)   AppState.customItems   = saved.customItems;
  // ── Migration activeItems ─────────────────────────────────
  // Anciens saves sans activeItems → tous les items équipés sont actifs par défaut.
  // isItemActive() gère ce cas (retourne true si activeItems est vide).
  if (saved.activeItems) AppState.activeItems = saved.activeItems;
  else AppState.activeItems = []; // vide = compat : tous équipés = actifs

  // ── Migration: transactions → walletLog ─────────────────────
  if (saved.transactions && !saved.walletLog) {
    AppState.walletLog = (saved.transactions||[]).map(tx => ({
      id:        tx.id || ('wl_'+Date.now()+'_'+Math.random().toString(36).slice(2,5)),
      type:      tx.type || 'other',
      amount:    tx.amount || 0,
      currency:  tx.currency || 'gp',
      note:      tx.desc || tx.note || '',
      linkedInventoryInstanceId: null,
      timestamp: tx.timestamp || Date.now(),
    }));
  }

  const fields = [
    'levels','journal','spellbook','grimoire','spells','preparedSpells','fightRound','fightLog','spellSlotUsage','spellFilters',
    'sourceFilters','combat','classAbilities','abilityStates',
    'buffs','skillEntries','feats','log'
  ];
  fields.forEach(k => { if (saved[k] !== undefined) AppState[k] = saved[k]; });

  // ── Migration feats ───────────────────────────────────────
  (AppState.feats || []).forEach(f => {
    if (f.count === undefined) f.count = 1;
    if (f.notes === undefined) f.notes = '';
  });

  // ── Migration aData.bonus → aData.armorBonus ──────────────
  // Ancien format des items custom : aData.bonus. Nouveau : aData.armorBonus.
  // getACComponents lit armorBonus — migrer silencieusement au chargement.
  (AppState.inventory || []).forEach(inst => {
    const ad = inst.customItem?.aData;
    if (ad && ad.bonus !== undefined && ad.armorBonus === undefined) {
      ad.armorBonus = ad.bonus;
      delete ad.bonus;
    }
  });

  // ── Migration buffs legacy ────────────────────────────────
  // Les buffs créés par BUFF_DB (makeBuff) ont dbId mais pas de grimoireId.
  // Le flux MAGIE V1 crée des buffs avec grimoireId défini.
  // Règle V1 : un buff sans grimoireId n'est pas issu du flux MAGIE actif.
  // On force isActive:false sur ces buffs legacy pour ne pas polluer Active Effects.
  (AppState.buffs || []).forEach(b => {
    if (b.sourceType === 'spell' && !b.grimoireId) b.isActive = false;
  });

  // AppState.spells[] — ancien tableau de sorts, remplacé par grimoire[]
  // Vidé car aucun module actif ne le lit.
  AppState.spells = [];

  // AppState.spellbook[] — ancienne source de migration spellbook→preparedSpells
  // Le module grimoire.js qui faisait cette migration n'est plus chargé.
  AppState.spellbook = [];

  // AppState.preparedSpells[] — peut contenir des entrées issues de deux anciennes sources :
  // 1. grimoire.js : { dbId, state:'prepared' } — pas de grimoireId → déjà filtré
  // 2. magie.js    : { grimoireId, cast:false }  — a grimoireId mais pas de state → reliquat
  // Règle V1 : une entrée valide doit avoir grimoireId ET state string défini.
  // Toute entrée avec cast:boolean (schéma magie.js) est legacy → supprimée.
  AppState.preparedSpells = (AppState.preparedSpells || []).filter(
    ps => typeof ps.grimoireId === 'string' && ps.grimoireId.length > 0
       && typeof ps.state === 'string'
  );

  // AppState.grimoire[] — peut contenir des sorts créés par l'ancien labo (magie.js)
  // sans champ status. Ces sorts sont des créations utilisateur intentionnelles.
  // Migration douce : on leur injecte status:'draft' pour les rendre visibles dans le LABO V1.
  (AppState.grimoire || []).forEach(sp => {
    if (typeof sp.status !== 'string') sp.status = 'draft';
  });

  // ── Sorts de test — merge dans grimoire ──────────────────
  // Injectés à chaque chargement si absents. IDs fixes gtest_* → idempotent.
  // MERGE (pas écrasement) — les sorts créés via l'UI sont préservés.
  const _TEST_SPELLS = [
    {
      id: 'gtest_resistance_sup', status: 'known',
      name: 'Resistance, Superior', level: 6, school: 'Abjuration',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '24 heures',
      rangeText: 'Contact', targetText: 'Créature touchée',
      savingThrowText: 'Volonté annule (inoffensif)', spellResistanceText: 'Oui (inoffensif)',
      components: { types: ['V','S','M','DF'], description: '', cost: '', consumed: false },
      description: 'Bonus de résistance +6 aux jets de sauvegarde.',
      effects: [{ target: 'save.all', bonusType: 'resistance', value: 6 }],
      notes: '', addedAt: 0,
    },
    {
      id: 'gtest_conviction', status: 'known',
      name: 'Conviction', level: 1, school: 'Abjuration',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '10 minutes/niveau',
      rangeText: 'Contact', targetText: 'Créature touchée',
      savingThrowText: 'Volonté annule (inoffensif)', spellResistanceText: 'Oui (inoffensif)',
      components: { types: ['V','S','M'], description: '', cost: '', consumed: false },
      description: 'Bonus de moral +2 aux jets de sauvegarde (+1 par tranche de 6 NLS, max +5).',
      effects: [{ target: 'save.all', bonusType: 'morale', value: 2 }],
      notes: "Valeur de l'effet à ajuster selon le NLS.", addedAt: 0,
    },
    {
      id: 'gtest_shield_of_faith', status: 'known',
      name: 'Shield of Faith', level: 1, school: 'Abjuration',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '1 minute/niveau',
      rangeText: 'Contact', targetText: 'Créature touchée',
      savingThrowText: 'Volonté annule (inoffensif)', spellResistanceText: 'Oui (inoffensif)',
      components: { types: ['V','S','M'], description: '', cost: '', consumed: false },
      description: 'Bonus de déflection à la CA, +2 puis +1/6 NLS, max +5.',
      effects: [{ target: 'defense.deflection', bonusType: 'deflection', value: 2 }],
      notes: "Valeur de l'effet à ajuster selon le NLS.", addedAt: 0,
    },
    {
      id: 'gtest_divine_power', status: 'known',
      name: 'Divine Power', level: 4, school: 'Evocation',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '1 round/niveau',
      rangeText: 'Personnelle', targetText: 'Vous',
      savingThrowText: 'Néant', spellResistanceText: 'Non',
      components: { types: ['V','S','DF'], description: '', cost: '', consumed: false },
      description: 'BBA = niveau du personnage, +6 Force (altération), 1 PV temporaire/NLS.',
      effects: [
        { target: 'ability.STR', bonusType: 'enhancement', value: 6 },
        { descriptive: true, text: 'BBA devient égal au niveau du personnage (non calculé automatiquement en V1).' },
        { descriptive: true, text: 'PV temporaires : 1 par NLS — à saisir manuellement.' },
      ],
      notes: 'BBA override et PV temp non calculés automatiquement en V1.', addedAt: 0,
    },
  ];
  if (!AppState.grimoire) AppState.grimoire = [];
  const _existingIds = new Set(AppState.grimoire.map(s => s.id));
  _TEST_SPELLS.forEach(sp => { if (!_existingIds.has(sp.id)) AppState.grimoire.push(sp); });
}

// ── Export JSON ───────────────────────────────────────────────
function exportJSON() {
  const data = JSON.stringify(AppState, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = (AppState.character.name || 'personnage').replace(/\s+/g, '_') + '_dnd35.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import JSON ───────────────────────────────────────────────
function importJSON() {
  const input  = document.createElement('input');
  input.type   = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const saved = JSON.parse(ev.target.result);
        _applyData(saved);
        renderAll();
        saveToLocalStorage();
        alert('Personnage chargé avec succès !');
      } catch(e) { alert('Erreur de lecture du fichier JSON.'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── Reset personnage ─────────────────────────────────────────
// Efface les données du personnage actif.
// Conserve : sourceFilters (préférence utilisateur) et bases de données.
function resetCharacter() {
  const confirmed = window.confirm(
    'Réinitialiser le personnage actif ?\n\n' +
    '✓ Les bases de données (sorts, dons, races, wiki) sont conservées.\n' +
    '✗ Les données du personnage (build, niveaux, PV, sorts préparés, buffs…) seront effacées.\n\n' +
    'Cette action est irréversible.'
  );
  if (!confirmed) return;

  AppState.character = {
    id: 'char_001', name: '',
    alignment: 'Neutre Bon', alignmentLaw: 'Neutre', alignmentMoral: 'Bon',
    raceId: 'race_human', size: 'Medium', type: 'Humanoid',
    age: 0, heightMeters: 1.75, weightKg: 70, deity: '',
    xp: 0, levelTotal: 0, languages: [], notes: '',
    portrait: null, templates: [],
    money: { pp: 0, gp: 0, sp: 0, cp: 0 },
    identity: { motivation:'', goal:'', personalityTrait:'', favoriteColor:'', favoriteFood:'', weakness:'', habit:'' },
    tempAcMods: [{value:0,reason:''},{value:0,reason:''}],
    tempSaveMods: {
      fortitude: [{value:0,reason:''},{value:0,reason:''}],
      reflex:    [{value:0,reason:''},{value:0,reason:''}],
      will:      [{value:0,reason:''},{value:0,reason:''}]
    },
    hp: { baseMax:0, temporary:0, current:0, nonLethal:0 },
    movement: { land:30, fly:0, swim:0, climb:0, burrow:0 },
    abilityScores: {
      STR: { base:10, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      DEX: { base:10, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      CON: { base:10, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      INT: { base:10, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      WIS: { base:10, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      CHA: { base:10, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 }
    }
  };

  AppState.levels          = [];
  AppState.inventory       = [];
  AppState.walletLog       = [];
  AppState.equipment       = {head:null,face:null,neck:null,shoulders:null,chest:null,body:null,waist:null,arms:null,hands:null,feet:null,ring1:null,ring2:null,armor:null,shield:null,main_hand:null,off_hand:null,range:null,slotless:[]};
  AppState.wallet          = {pp:0,gp:0,sp:0,cp:0};
  AppState.forgeProjects   = [];
  AppState.spells          = [];
  AppState.preparedSpells  = [];
  AppState.spellbook       = [];
  AppState.spellSlotUsage  = {};
  AppState.classAbilities  = [];
  AppState.abilityStates   = {};
  AppState.buffs           = [];
  AppState.skillEntries    = [];
  AppState.feats           = [];
  AppState.log             = [];
  AppState.combat          = { weapons: [], globalBuffs: [], acTargets: [] };
  // sourceFilters conservé — préférence utilisateur

  try { localStorage.removeItem(SAVE_KEY); } catch(e) {}

  renderAll();
  showTab('build');
  showBuildPage('generalinfo');

  const ind = document.getElementById('save-indicator');
  if (ind) { ind.textContent = '✓ Personnage réinitialisé'; ind.style.color = 'var(--gold)'; setTimeout(() => { ind.textContent = ''; }, 3000); }
}

// ── Autosave ─────────────────────────────────────────────────
function autosave() {
  saveToLocalStorage();
}

// Autosave toutes les 30 secondes
setInterval(saveToLocalStorage, 30000);

// ── Réinitialiser l'inventaire uniquement ─────────────────────
// Purge AppState.inventory, equipment, activeItems et recharge les sample items.
// Ne touche pas au personnage, aux niveaux, aux sorts ni aux autres données.
function resetInventory() {
  const confirmed = window.confirm(
    'Réinitialiser l\'inventaire ?\n\n' +
    '✗ Tous les objets de l\'inventaire seront effacés.\n' +
    '✗ L\'équipement actuel sera réinitialisé.\n' +
    '✓ Les données du personnage (niveaux, sorts, compétences…) sont conservées.\n' +
    '✓ Les objets de démonstration de Shruikhan seront rechargés.\n\n' +
    'Cette action est irréversible.'
  );
  if (!confirmed) return;

  AppState.inventory    = [];
  AppState.equipment    = {
    head:null, face:null, neck:null, shoulders:null,
    chest:null, body:null, waist:null, arms:null, hands:null, feet:null,
    ring1:null, ring2:null, armor:null, shield:null,
    main_hand:null, off_hand:null, range:null, slotless:[]
  };
  AppState.activeItems  = [];
  AppState.wallet       = { pp:0, gp:0, sp:0, cp:0 };
  AppState.walletLog    = [];

  // Recharger les items sample de Shruikhan
  if (typeof loadSampleData === 'function') {
    // Charger seulement inventory/equipment/activeItems depuis loadSampleData
    const _inv = []; const _eq = {}; const _ai = [];
    // Extraction sécurisée via une copie temporaire
    const savedLvl = AppState.levels;
    const savedChr = AppState.character;
    loadSampleData();
    // Restaurer le personnage existant
    AppState.levels    = savedLvl;
    AppState.character = savedChr;
  }

  autosave();
  if (typeof renderSheet      === 'function') renderSheet();
  if (typeof renderInvInventory === 'function') renderInvInventory();
  if (typeof showToast === 'function') showToast('Inventaire réinitialisé', 'info');
}

// ============================================================
// Données de démonstration — Shruikhan Nv14 Clerc
// ============================================================
function loadSampleData() {
  const hpRolls = [8,7,6,8,5,7,4,8,6,7,5,8,7,6];
  AppState.levels = [];
  for (let i = 1; i <= 14; i++) {
    AppState.levels.push({
      id: `lvl_${String(i).padStart(3,'0')}`,
      characterId: 'char_001',
      levelNumber: i,
      classId: 'class_cleric',
      hitDie: 'd8',
      hpRolled: hpRolls[i-1],
      skillPointsGained: 2 + getMod('INT'),
      abilityIncreaseApplied: [4,8,12].includes(i),
      featChosenId: i === 1 ? 'feat_combat_casting' : i === 3 ? 'feat_spell_focus_necromancy' : null,
      classFeaturesGained: i === 1 ? ['Turn Undead','Spellcasting'] : ['Spellcasting Progression']
    });
  }

  // Override character defaults with sample values
  Object.assign(AppState.character, {
    id: 'char_001', name: 'Shruikhan',
    alignment: 'Neutre Bon', alignmentLaw: 'Neutre', alignmentMoral: 'Bon',
    raceId: 'race_human', age: 40, heightMeters: 1.70, weightKg: 110, deity: 'Peregrin',
    levelTotal: 14, languages: ['Géant','Infernal'],
    abilityScores: {
      STR: { base:18, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      DEX: { base:14, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      CON: { base:16, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      INT: { base:10, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      WIS: { base:15, racial:0, levelUp:2, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 },
      CHA: { base:11, racial:0, levelUp:0, inherent:0, enhancement:0, size:0, morale:0, luck:0, sacred:0, untyped:0, penalty:0, tempBonus:0 }
    }
  });

  AppState.inventory = [
    { instanceId:'samp_belt_str4',     itemDbId:null, customItem:{ name:{fr:'Ceinturon de Force géante +4',en:'Belt of Giant Strength +4'}, category:'wondrous', slot:'waist',  priceGp:16000, weightKg:0, description:{fr:'+4 Force'}, effects:[{target:'ability.STR',bonusType:'enhancement',value:4}] }, quantity:1, paid:16000, notes:'', overrides:{name:'',description:'',priceGp:null,weightKg:null}, meta:{origin:'',owner:'',toReturn:false,questItem:false,questNote:''}, tags:['important'], instanceEffects:[] },
    { instanceId:'samp_mithral_plate', itemDbId:null, customItem:{ name:{fr:'Harnois en mithral +1',en:'Mithral Full Plate +1'},           category:'armor',    slot:'armor',  priceGp:11500, weightKg:22.5, description:{fr:'CA +9, DEX max +2, malus -2, échec arcanique 25%.'}, effects:[{target:'defense.armor',bonusType:'armor',value:9}], aData:{armorBonus:9,maxDex:2,penalty:-2,arcane_fail:25} }, quantity:1, paid:11500, notes:'', overrides:{name:'',description:'',priceGp:null,weightKg:null}, meta:{origin:'',owner:'',toReturn:false,questItem:false,questNote:''}, tags:[], instanceEffects:[] },
    { instanceId:'samp_ring_prot3',    itemDbId:null, customItem:{ name:{fr:'Anneau de protection +3',en:'Ring of Protection +3'},          category:'ring',     slot:'ring1',  priceGp:18000, weightKg:0, description:{fr:'+3 parade à la CA.'}, effects:[{target:'defense.deflection',bonusType:'deflection',value:3}] }, quantity:1, paid:18000, notes:'', overrides:{name:'',description:'',priceGp:null,weightKg:null}, meta:{origin:'',owner:'',toReturn:false,questItem:false,questNote:''}, tags:[], instanceEffects:[] },
    { instanceId:'samp_amulet_nat2',   itemDbId:null, customItem:{ name:{fr:"Amulette d'armure naturelle +2",en:'Amulet of Natural Armor +2'}, category:'wondrous', slot:'neck',  priceGp:8000, weightKg:0, description:{fr:'+2 armure naturelle.'}, effects:[{target:'defense.naturalArmor',bonusType:'natural_armor',value:2}] }, quantity:1, paid:8000, notes:'', overrides:{name:'',description:'',priceGp:null,weightKg:null}, meta:{origin:'',owner:'',toReturn:false,questItem:false,questNote:''}, tags:[], instanceEffects:[] },
    { instanceId:'samp_cloak_res3',    itemDbId:null, customItem:{ name:{fr:'Cape de résistance +3',en:'Cloak of Resistance +3'},            category:'wondrous', slot:'chest', priceGp:9000, weightKg:0.5, description:{fr:'+3 à tous les jets de sauvegarde.'}, effects:[{target:'save.all',bonusType:'resistance',value:3}] }, quantity:1, paid:9000, notes:'', overrides:{name:'',description:'',priceGp:null,weightKg:null}, meta:{origin:'',owner:'',toReturn:false,questItem:false,questNote:''}, tags:[], instanceEffects:[] },
    { instanceId:'samp_mace2',         itemDbId:'idb_heavy_mace', customItem:null, quantity:1, paid:8312, notes:'+2 magique', overrides:{name:"Masse d'armes lourde +2",description:'',priceGp:null,weightKg:null}, meta:{origin:'',owner:'',toReturn:false,questItem:false,questNote:''}, tags:[], instanceEffects:[{target:'combat.attack',bonusType:'enhancement',value:2},{target:'combat.damage',bonusType:'enhancement',value:2}] },
    { instanceId:'samp_shield2',       itemDbId:'idb_shield_heavy_s', customItem:null, quantity:1, paid:4170, notes:'+2 magique', overrides:{name:'Bouclier lourd +2',description:'',priceGp:null,weightKg:null}, meta:{origin:'',owner:'',toReturn:false,questItem:false,questNote:''}, tags:[], instanceEffects:[{target:'defense.shield',bonusType:'shield',value:2}] },
  ];
  AppState.equipment = {
    head:null, face:null, neck:'samp_amulet_nat2', shoulders:null,
    chest:'samp_cloak_res3', body:null, waist:'samp_belt_str4',
    arms:null, hands:null, feet:null,
    ring1:'samp_ring_prot3', ring2:null,
    armor:'samp_mithral_plate', shield:'samp_shield2',
    main_hand:'samp_mace2', off_hand:null, range:null, slotless:[]
  };
  // Tous les items équipés sont actifs par défaut
  AppState.activeItems = ['samp_amulet_nat2','samp_cloak_res3','samp_belt_str4',
    'samp_ring_prot3','samp_mithral_plate','samp_shield2','samp_mace2'];

  AppState.buffs = [
    makeBuff('bdb_divine_power',       { isSelf:true }),
    makeBuff('bdb_righteous_might',    { isSelf:true }),
    makeBuff('bdb_prayer',             { isSelf:true }),
    makeBuff('bdb_shield_of_faith',    { isSelf:true }),
    makeBuff('bdb_superior_resistance',{ isSelf:true })
  ].filter(Boolean).map(b => { b.isActive = false; return b; });

  // Les sorts de référence restent dans SPELL_DB (read-only, data/).
  // AppState.spells[] n'est plus utilisé — vidé par loadState() au chargement.

  AppState.skillEntries = [
    { skillId:'skill_concentration',      ranks:17, misc:0, classSkill:true  },
    { skillId:'skill_heal',               ranks:8,  misc:0, classSkill:true  },
    { skillId:'skill_knowledge_religion', ranks:12, misc:0, classSkill:true  },
    { skillId:'skill_knowledge_planes',   ranks:5,  misc:0, classSkill:false },
    { skillId:'skill_spellcraft',         ranks:10, misc:0, classSkill:true  },
    { skillId:'skill_diplomacy',          ranks:4,  misc:0, classSkill:false },
    { skillId:'skill_sense_motive',       ranks:6,  misc:0, classSkill:true  }
  ];

  AppState.character.hp.current = getHPMax();

  // Sorts de test — injectés comme 'known' pour tests MAGIE V1
  AppState.grimoire = [
    {
      id: 'gtest_resistance_sup', status: 'known',
      name: 'Resistance, Superior', level: 6, school: 'Abjuration',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '24 heures',
      rangeText: 'Contact', targetText: 'Créature touchée',
      savingThrowText: 'Volonté annule (inoffensif)', spellResistanceText: 'Oui (inoffensif)',
      components: { types: ['V','S','M','DF'], description: '', cost: '', consumed: false },
      description: 'Bonus de résistance +6 aux jets de sauvegarde.',
      effects: [{ target: 'save.all', bonusType: 'resistance', value: 6 }],
      notes: '', addedAt: 0,
    },
    {
      id: 'gtest_conviction', status: 'known',
      name: 'Conviction', level: 1, school: 'Abjuration',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '10 minutes/niveau',
      rangeText: 'Contact', targetText: 'Créature touchée',
      savingThrowText: 'Volonté annule (inoffensif)', spellResistanceText: 'Oui (inoffensif)',
      components: { types: ['V','S','M'], description: '', cost: '', consumed: false },
      description: 'Bonus de moral +2 aux jets de sauvegarde (+1 par tranche de 6 NLS, max +5).',
      effects: [{ target: 'save.all', bonusType: 'morale', value: 2 }],
      notes: 'Valeur de l\'effet à ajuster selon le NLS.', addedAt: 0,
    },
    {
      id: 'gtest_shield_of_faith', status: 'known',
      name: 'Shield of Faith', level: 1, school: 'Abjuration',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '1 minute/niveau',
      rangeText: 'Contact', targetText: 'Créature touchée',
      savingThrowText: 'Volonté annule (inoffensif)', spellResistanceText: 'Oui (inoffensif)',
      components: { types: ['V','S','M'], description: '', cost: '', consumed: false },
      description: 'Bonus de déflection à la CA, +2 puis +1/6 NLS, max +5.',
      effects: [{ target: 'defense.deflection', bonusType: 'deflection', value: 2 }],
      notes: 'Valeur de l\'effet à ajuster selon le NLS.', addedAt: 0,
    },
    {
      id: 'gtest_divine_power', status: 'known',
      name: 'Divine Power', level: 4, school: 'Evocation',
      tags: ['Buff','Protection'],
      castingTime: '1 action standard', durationText: '1 round/niveau',
      rangeText: 'Personnelle', targetText: 'Vous',
      savingThrowText: 'Néant', spellResistanceText: 'Non',
      components: { types: ['V','S','DF'], description: '', cost: '', consumed: false },
      description: 'BBA = niveau du personnage, +6 Force (altération), 1 PV temporaire/NLS.',
      effects: [
        { target: 'ability.STR',  bonusType: 'enhancement', value: 6 },
        { target: 'combat.attack', bonusType: 'untyped', value: 0 }, // BBA override — informatif
        { descriptive: true, text: 'BBA devient égal au niveau du personnage (non calculé automatiquement en V1).' },
        { descriptive: true, text: 'PV temporaires : 1 par NLS — à saisir manuellement via PV temporaires.' },
      ],
      notes: 'BBA override et PV temp non calculés automatiquement en V1 — valeurs à ajuster manuellement.', addedAt: 0,
    },
  ];
}
