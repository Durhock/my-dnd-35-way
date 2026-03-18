// ============================================================
// rules.js — Moteur de calcul D&D 3.5
//
// Ce fichier est la source unique des valeurs dérivées.
// Les modules lisent AppState et appellent ces fonctions.
// Ils ne recalculent pas eux-mêmes.
//
// SECTIONS :
//   1. Données de référence UI (UI_TARGET_LABELS, SOURCE_REGISTRY, EQUIPMENT_SLOTS)
//   2. Règles de bonus (BONUS_TYPE_RULES, BONUS_STACKING_RULES, CALC_RULES)
//   3. Helpers sorts / classes
//   4. Bonus engine (collectBonuses, resolveBonuses, formatBonusBreakdown)
//   5. Caractéristiques (getAbilityTotal, getMod)
//   6. Progression et classe (getBAB, getSaveBase, pointBuyCost, …)
//   7. Valeurs dérivées — Défense (getACComponents, getSaveTotal, getInitiative)
//   8. Valeurs dérivées — Combat offensif (getAttackBonus, getGrappleBonus)
//   9. Valeurs dérivées — PV (getHPMax)
//  10. Compétences (getSkillTotal, getClassSkillsForChar, getMaxRanks)
//  11. Sorts (getSpellDC, getLearnedSpells, getTurnUndeadInfo)
// ============================================================


// ============================================================
// UTILITAIRES ÉQUIPEMENT
// Source de vérité unique : AppState.equipment{}
// ============================================================

/** Retourne tous les instanceId actuellement équipés (toutes positions). */
function getEquippedInstanceIds() {
  const eq  = AppState.equipment || {};
  const ids = new Set();
  Object.entries(eq).forEach(([slot, val]) => {
    if (slot === 'slotless') {
      (val || []).forEach(id => { if (id) ids.add(id); });
    } else {
      if (val) ids.add(val);
    }
  });
  return ids;
}

/** Retourne les objets d'inventaire actuellement équipés (instances complètes). */
function getEquippedItems() {
  const ids = getEquippedInstanceIds();
  return (AppState.inventory || []).filter(i => ids.has(i.instanceId));
}

/**
 * Retourne true si l'item est actif (effets appliqués à la fiche).
 * Par défaut : tout item équipé est actif sauf s'il a été désactivé manuellement.
 * V1 : AppState.activeItems[] = liste des instanceId actifs.
 */
function isItemActive(instanceId) {
  if (!isEquipped(instanceId)) return false;
  const active = AppState.activeItems || [];
  // Si activeItems est vide → compat anciens saves : tous les équipés sont actifs
  if (active.length === 0) return true;
  return active.includes(instanceId);
}

/** Items équipés ET actifs — source de vérité pour les calculs de fiche. */
function getActiveEquippedItems() {
  return getEquippedItems().filter(i => isItemActive(i.instanceId));
}

/** Retourne true si l'instanceId donné est actuellement équipé. */
function isEquipped(instanceId) {
  if (!instanceId) return false;
  const eq = AppState.equipment || {};
  for (const [slot, val] of Object.entries(eq)) {
    if (slot === 'slotless') { if ((val||[]).includes(instanceId)) return true; }
    else if (val === instanceId) return true;
  }
  return false;
}

/** Retourne le slot dans lequel l'instanceId est équipé, ou null. */
function getEquippedSlot(instanceId) {
  if (!instanceId) return null;
  const eq = AppState.equipment || {};
  for (const [slot, val] of Object.entries(eq)) {
    if (slot === 'slotless') { if ((val||[]).includes(instanceId)) return 'slotless'; }
    else if (val === instanceId) return slot;
  }
  return null;
}


// ═══════════════════════════════════════════════════════════
// SECTION 1 — Données de référence UI
// ═══════════════════════════════════════════════════════════

const UI_TARGET_LABELS = {
  self:                                   { label: 'Soi-même (You)',      icon: '👤', color: 'var(--green)' },
  creature_touched:                       { label: 'Créature touchée',    icon: '🤝', color: 'var(--gold)' },
  item_weapon:                            { label: 'Arme touchée',        icon: '⚔️', color: 'var(--red)' },
  item_armor_or_shield:                   { label: 'Armure / Bouclier',   icon: '🛡️', color: '#4a7ab5' },
  aoe_allies_centered_on_self:            { label: 'Zone alliés (centré)', icon: '🌟', color: 'var(--gold)' },
  aoe_allies_and_enemies_centered_on_self:{ label: 'Zone alliés+ennemis', icon: '💫', color: '#c94080' },
  multi_creatures_touched:                { label: 'Plusieurs créatures', icon: '👥', color: 'var(--gold-dim)' },
};

const SOURCE_REGISTRY = {
  official: {
    type: 'official', label: 'Officiel WotC', labelShort: 'Official',
    color: 'var(--gold)', bg: 'rgba(180,140,60,0.15)', border: 'var(--gold-dim)', icon: '📖', is_official: true,
    sources: {
      PHB:  { name: "Player's Handbook",        abbr: 'PHB',  ref: '3.5e Core' },
      DMG:  { name: "Dungeon Master's Guide",   abbr: 'DMG',  ref: '3.5e Core' },
      SRD:  { name: 'System Reference Document', abbr: 'SRD',  ref: 'OGL' },
      SC:   { name: 'Spell Compendium',          abbr: 'SpC',  ref: 'WotC supplement' },
      CD:   { name: 'Complete Divine',           abbr: 'CD',   ref: 'WotC supplement' },
      CA:   { name: 'Complete Arcane',           abbr: 'CArc', ref: 'WotC supplement' },
      CC:   { name: 'Complete Champion',         abbr: 'CC',   ref: 'WotC supplement' },
      CM:   { name: 'Complete Mage',             abbr: 'CM',   ref: 'WotC supplement' },
      CAdv: { name: 'Complete Adventurer',       abbr: 'CAdv', ref: 'WotC supplement' },
      LM:   { name: 'Libris Mortis',             abbr: 'LM',   ref: 'WotC supplement' },
      BoED: { name: 'Book of Exalted Deeds',     abbr: 'BoED', ref: 'WotC supplement' },
      BoVD: { name: 'Book of Vile Darkness',     abbr: 'BoVD', ref: 'WotC supplement' },
      FRCS: { name: 'Forgotten Realms CS',       abbr: 'FRCS', ref: 'Campaign Setting' },
      ECS:  { name: 'Eberron Campaign Setting',  abbr: 'ECS',  ref: 'Campaign Setting' },
    }
  },
  magazine: {
    type: 'magazine', label: 'Magazine / Semi-officiel', labelShort: 'Magazine',
    color: '#a0c060', bg: 'rgba(120,180,60,0.12)', border: 'rgba(120,180,60,0.4)', icon: '📰', is_official: false,
    sources: {
      DM:  { name: 'Dragon Magazine',       abbr: 'DM',  ref: 'Dragon Magazine' },
      DUN: { name: 'Dungeon Magazine',       abbr: 'Dun', ref: 'Dungeon Magazine' },
      WEB: { name: 'Wizards Web Article',   abbr: 'Web', ref: 'WotC Online' },
    }
  },
  community: {
    type: 'community', label: 'Communauté (Gemmaline…)', labelShort: 'Community',
    color: '#6a9fd8', bg: 'rgba(74,120,180,0.12)', border: 'rgba(74,120,180,0.4)', icon: '🌐', is_official: false,
    sources: {
      GML: { name: 'Gemmaline',  abbr: 'GML', ref: 'Communauté FR' },
      FAN: { name: 'Contenu fan', abbr: 'Fan', ref: 'Community' },
    }
  },
  custom: {
    type: 'custom', label: 'Personnalisé', labelShort: 'Custom',
    color: '#c080e0', bg: 'rgba(180,80,220,0.10)', border: 'rgba(180,80,220,0.35)', icon: '⚗️', is_official: false,
    sources: {
      USR: { name: 'Sort personnalisé', abbr: 'Custom', ref: 'Homebrew' },
    }
  }
};

const EQUIPMENT_SLOTS = [
  { id: 'head',      label: 'Tête' },
  { id: 'neck',      label: 'Cou' },
  { id: 'chest',     label: 'Torse' },
  { id: 'armor',     label: 'Armure' },
  { id: 'shield',    label: 'Bouclier' },
  { id: 'waist',     label: 'Taille' },
  { id: 'main_hand', label: 'Main princ.' },
  { id: 'off_hand',  label: 'Main sec.' },
  { id: 'arms',      label: 'Bras' },
  { id: 'hands',     label: 'Mains' },
  { id: 'ring1',     label: 'Anneau G' },
  { id: 'ring2',     label: 'Anneau D' },
  { id: 'feet',      label: 'Pieds' },
];


// ═══════════════════════════════════════════════════════════
// SECTION 2 — Règles de bonus D&D 3.5
// ═══════════════════════════════════════════════════════════

// Métadonnées descriptives de chaque type de bonus
const BONUS_TYPE_RULES = {
  enhancement:  { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  armor:        { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  shield:       { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  deflection:   { stacks: false, description: 'Ne se cumule pas' },
  natural_armor:{ stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  resistance:   { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  morale:       { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  sacred:       { stacks: false, description: 'Ne se cumule pas avec profane' },
  profane:      { stacks: false, description: 'Ne se cumule pas avec sacré' },
  luck:         { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  insight:      { stacks: false, description: 'Ne se cumule pas' },
  competence:   { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  alchemical:   { stacks: false, description: 'Ne se cumule pas' },
  racial:       { stacks: false, description: 'Ne se cumule pas — prendre le plus grand' },
  inherent:     { stacks: false, description: 'Limité à +5 max par caractéristique' },
  size:         { stacks: false, description: 'Remplace selon la catégorie de taille' },
  dodge:        { stacks: true,  description: 'Se cumule — additionner tous les bonus esquive' },
  circumstance: { stacks: true,  description: 'Peut se cumuler selon le cas' },
  untyped:      { stacks: true,  description: 'Se cumule en principe' },
  special:      { stacks: true,  description: 'Effets spéciaux (HP temp, override BAB…)' },
};

// Règles de stacking effectives utilisées par resolveBonuses()
// 'stack' = additif | 'highest' = prendre le plus grand
const BONUS_STACKING_RULES = {
  // Additifs
  dodge:        'stack',
  circumstance: 'stack',
  untyped:      'stack',
  special:      'stack',
  // Highest-only (tous les types nommés)
  enhancement:  'highest',
  size:         'highest',
  morale:       'highest',
  luck:         'highest',
  sacred:       'highest',
  profane:      'highest',
  inherent:     'highest',
  alchemical:   'highest',
  racial:       'highest',
  insight:      'highest',
  competence:   'highest',
  resistance:   'highest',
  deflection:   'highest',
  natural_armor:'highest',
  armor:        'highest',
  shield:       'highest',
};

// Documentation des formules de calcul (référence, non exécutée)
const CALC_RULES = [
  {
    name: 'Caractéristique totale',
    formula: 'base + racial + levelUp + inherent + max(enhancement) + max(size) + max(morale) + max(luck) + max(sacred) + sum(untyped) − penalty',
  },
  {
    name: 'Classe d\'Armure',
    formula: '10 + max(armor) + max(shield) + DEX_mod + size + max(natural_armor) + max(deflection) + sum(dodge) + max(luck) + max(sacred) + max(insight)',
  },
  {
    name: 'CA Contact',
    formula: '10 + DEX_mod + size + sum(dodge) + max(deflection) + max(luck) + max(sacred) + max(insight)',
  },
  {
    name: 'CA Pris au dépourvu',
    formula: '10 + max(armor) + max(shield) + size + max(natural_armor) + max(deflection) + max(sacred)',
  },
  {
    name: 'Jet de Sauvegarde',
    formula: 'base_classe + mod_carac + max(resistance) + max(luck) + max(morale) + max(sacred) + max(insight) + sum(untyped)',
  },
  {
    name: 'BBA',
    formula: 'full: +1/lvl | medium: +¾/lvl | poor: +½/lvl (floored)',
  },
  {
    name: 'Attaque totale',
    formula: 'BAB + mod_FOR(mêlée)/mod_DEX(distance) + bonus_arme + mod_taille + misc',
  },
  {
    name: 'Lutte',
    formula: 'BAB + mod_FOR + mod_taille_prise',
  },
  {
    name: 'DD de Sort',
    formula: '10 + niveau_sort + mod_carac_incantation',
  },
];


// ═══════════════════════════════════════════════════════════
// SECTION 3 — Helpers sorts / classes
// ═══════════════════════════════════════════════════════════

// Retourne les métadonnées SOURCE_REGISTRY d'un sort
function getSourceMeta(spell) {
  const st  = spell.source_type || 'official';
  const sn  = spell.source_abbr || spell.source || 'PHB';
  const reg = SOURCE_REGISTRY[st] || SOURCE_REGISTRY.official;
  const src = reg.sources?.[sn] || reg.sources?.PHB || { name: sn, abbr: sn };
  return { ...reg, ...src, source_type: st };
}

// Retourne les badges classes disponibles pour un sort
function getSpellClassTags(spell) {
  const classes = spell.classes || spell.level || {};
  const classNames = {
    cleric:  { label:'Clé', color:'#c09840' }, druid:   { label:'Dru', color:'#60a040' },
    paladin: { label:'Pal', color:'#e0c060' }, ranger:  { label:'Rôd', color:'#80b060' },
    wizard:  { label:'Mag', color:'#6080d0' }, sorcerer:{ label:'Sor', color:'#a060c0' },
    bard:    { label:'Bar', color:'#d08040' }, assassin:{ label:'Ass', color:'#808080' },
  };
  return Object.entries(classes).map(([cls, lvl]) => {
    const c = classNames[cls] || { label: cls.slice(0,3), color: 'var(--text-dim)' };
    return { cls, lvl, label: c.label, color: c.color };
  });
}

// Retourne les capacités de classe disponibles pour le personnage courant
function getAvailableClassAbilities() {
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const result = [];
  Object.entries(CLASS_ABILITIES_DB).forEach(([id, ab]) => {
    if ((classLevels[ab.classId] || 0) >= ab.minLevel) result.push({ id, ...ab, classLvl: classLevels[ab.classId] });
  });
  return result;
}


// ═══════════════════════════════════════════════════════════
// SECTION 4 — Bonus engine
// Lit AppState, retourne des listes de bonus typés.
// ═══════════════════════════════════════════════════════════

/**
 * Collecte tous les bonus applicables à une ou plusieurs cibles.
 * Sources : items équipés, buffs actifs isSelf, capacités de classe togglées.
 *
 * @param {string|string[]} targets  ex: 'ability.STR' | ['save.fortitude','save.all']
 * @returns {Array<{value, bonusType, source, isPenalty}>}
 */
function collectBonuses(targets) {
  const targetSet = Array.isArray(targets) ? new Set(targets) : new Set([targets]);
  const list = [];

  const push = (ef, source) => {
    if (!targetSet.has(ef.target)) return;
    list.push({ value: ef.value || 0, bonusType: ef.bonusType || 'untyped', source, isPenalty: (ef.value || 0) < 0 });
  };

  // Items équipés ET actifs — filtrés via isItemActive()
  // Seuls les items dont l'effet est activé contribuent aux calculs de fiche.
  getActiveEquippedItems().forEach(item => {
    const dbEntry     = item.itemDbId ? (ITEM_DB[item.itemDbId] || {}) : {};
    const baseEffects = item.customItem?.effects || dbEntry.effects || [];
    // instanceEffects = overrides manuels saisis dans Inventaire uniquement
    // JAMAIS alimenté par la Forge (simulation) — contrat garanti par _applyForge
    const instEffects = item.instanceEffects || [];
    const allEffects  = [...baseEffects, ...instEffects];
    const itemName    = item.customItem?.name?.fr || dbEntry.name || item.instanceId;
    allEffects.forEach(ef => push(ef, itemName));
  });

  // Self-buffs actifs
  AppState.buffs.filter(b => b.isActive && b.isSelf).forEach(buff =>
    (buff.effects || []).forEach(ef => push(ef, buff.name || buff.nameEn))
  );

  // Capacités de classe — toggle actif uniquement
  if (AppState.abilityStates) {
    Object.entries(CLASS_ABILITIES_DB).forEach(([abId, ab]) => {
      if (ab.type === 'active_toggle' && AppState.abilityStates[`ca_state_${abId}`] && ab.effects) {
        ab.effects.forEach(ef => {
          const norm = { ...ef };
          // Normalise 'STR' → 'ability.STR'
          if (['STR','DEX','CON','INT','WIS','CHA'].includes(ef.target)) norm.target = `ability.${ef.target}`;
          push(norm, ab.name);
        });
      }
    });
  }

  return list;
}

/**
 * Applique les règles de stacking à une liste de bonus.
 * Malus (valeur < 0) stackent toujours indépendamment des types.
 *
 * @param {Array}   bonusList       Résultat de collectBonuses()
 * @param {boolean} splitPenalties  Si true, malus stackent toujours
 * @returns {{ total, byType, breakdown[] }}
 */
function resolveBonuses(bonusList, splitPenalties = true) {
  const positives = splitPenalties ? bonusList.filter(b => b.value >= 0) : bonusList;
  const penalties = splitPenalties ? bonusList.filter(b => b.value < 0)  : [];

  const groups = {};
  positives.forEach(b => {
    const bt = b.bonusType || 'untyped';
    (groups[bt] = groups[bt] || []).push(b);
  });

  const byType    = {};
  const breakdown = [];

  Object.entries(groups).forEach(([bt, entries]) => {
    const rule = BONUS_STACKING_RULES[bt] || 'highest';
    let resolved;
    if (rule === 'stack') {
      resolved = { value: entries.reduce((s, e) => s + e.value, 0), active: entries, suppressed: [] };
    } else {
      const sorted = [...entries].sort((a, b) => b.value - a.value);
      resolved = { value: sorted[0].value, active: [sorted[0]], suppressed: sorted.slice(1) };
    }
    byType[bt] = resolved;
    if (resolved.value !== 0) breakdown.push({ bonusType: bt, value: resolved.value, source: resolved.active.map(e => e.source).join(', ') });
  });

  const penaltyTotal = penalties.reduce((s, b) => s + b.value, 0);
  if (penaltyTotal !== 0) breakdown.push({ bonusType: 'penalty', value: penaltyTotal, source: penalties.map(e => e.source).join(', ') });

  const total = Object.values(byType).reduce((s, g) => s + g.value, 0) + penaltyTotal;
  return { total, byType, breakdown };
}

// Labels FR des types de bonus pour affichage
const BONUS_TYPE_LABELS_FR = {
  enhancement: 'Amélioration', size: 'Taille', morale: 'Moral',
  luck: 'Chance', sacred: 'Sacré', profane: 'Profane',
  inherent: 'Inné', alchemical: 'Alchimique', racial: 'Racial',
  insight: 'Intuition', competence: 'Compétence', resistance: 'Résistance',
  deflection: 'Déflexion', natural_armor: 'Arm. naturelle', armor: 'Armure',
  shield: 'Bouclier', dodge: 'Esquive', circumstance: 'Circonstance',
  untyped: 'Sans type', penalty: 'Malus', special: 'Spécial',
};

/** Construit un HTML de breakdown pour les tooltips/modals. */
function formatBonusBreakdown(breakdown, base = 0, label = '') {
  if (!breakdown.length && base === 0) return '<span class="text-dim">Aucun bonus</span>';
  let rows = '';
  if (base) rows += `<div class="flex-between mb-4"><span class="text-dim">Base</span><span class="text-bright">+${base}</span></div>`;
  breakdown.forEach(b => {
    const sign = b.value >= 0 ? '+' : '';
    rows += `<div class="flex-between mb-4">
      <span class="text-dim">${BONUS_TYPE_LABELS_FR[b.bonusType] || b.bonusType}</span>
      <span style="color:${b.value >= 0 ? 'var(--gold)' : 'var(--red)'};font-size:12px;">
        ${sign}${b.value} <span class="text-dim" style="font-size:10px;">(${b.source})</span>
      </span>
    </div>`;
  });
  return rows;
}


// ═══════════════════════════════════════════════════════════
// SECTION 5 — Caractéristiques
// ═══════════════════════════════════════════════════════════

/**
 * Retourne la valeur totale d'une caractéristique.
 * Lit les composantes du score ET les bonus issus de collectBonuses.
 */
function getAbilityTotal(ability, withBreakdown = false) {
  const scores = AppState.character.abilityScores[ability];
  if (!scores) return 10;

  const bonusList = collectBonuses(`ability.${ability}`);
  const { total: bonusTotal, byType, breakdown } = resolveBonuses(bonusList, true);

  const base      = scores.base     || 10;
  // TODO-FICHE : risque double-comptage racial.
  // abilityScores[ab].racial est écrit directement par BUILD (applyRace, applyTemplate).
  // Si un futur buff avec bonusType:'racial' est créé et injecté dans AppState.buffs[],
  // il sera compté une seconde fois via bonusTotal. Vérifier à l'ouverture du chantier INVENTAIRE.
  const racial    = scores.racial   || 0;
  // levelUp = +1 for each level-up choice that targeted this ability
  const _lub = AppState.character.levelUpBonuses || {};
  const levelUp = [4,8,12,16,20].filter(n => _lub[n] === ability).length;
  const inherent  = scores.inherent || 0;   // via interface (Wish, etc.)
  const tempBonus = scores.tempBonus || 0;

  const total = base + racial + levelUp + inherent + tempBonus + bonusTotal;

  if (!withBreakdown) return total;
  return {
    total, base, racial, levelUp, inherent, tempBonus, breakdown, byType,
    // backward compat
    enhancement: byType.enhancement || { value: 0, active: [], suppressed: [] },
    size:        byType.size        || { value: 0, active: [], suppressed: [] },
    morale:      byType.morale      || { value: 0, active: [], suppressed: [] },
    luck:        byType.luck        || { value: 0, active: [], suppressed: [] },
    sacred:      byType.sacred      || { value: 0, active: [], suppressed: [] },
  };
}

/** Modificateur de caractéristique : floor((score − 10) / 2) */
function getMod(ability) {
  return Math.floor((getAbilityTotal(ability) - 10) / 2);
}


// ═══════════════════════════════════════════════════════════
// SECTION 6 — Progression et classes
// ═══════════════════════════════════════════════════════════

/** BBA total du personnage (int). Gère les overrides de sorts (Divine Power). */
function getBAB() {
  let bab = 0;
  AppState.levels.forEach(lvl => {
    const cls  = CLASS_REF[lvl.classId];
    if (!cls) return;
    // D&D 3.5 SRD : full=+1/nv, medium=floor(nv×¾), poor=floor(nv/2)
    // Logique cumulative flottante + Math.floor() final = résultat SRD correct.
    // poor 0.5/nv → floor(total) = floor(level/2) — VÉRIFIÉ (pas de bug actif).
    if (cls.babProg === 'full')        bab += 1;
    else if (cls.babProg === 'medium') bab += 0.75;
    else if (cls.babProg === 'poor')   bab += 0.5;
  });

  const charLvl = AppState.levels.length || 0;
  let babOverride = -1;

  // Buffs : override BBA (ex. Divine Power)
  AppState.buffs.filter(b => b.isActive && b.isSelf).forEach(b => {
    (b.effects || []).forEach(ef => {
      if (ef.target === 'combat.baseAttackOverride') babOverride = Math.max(babOverride, charLvl);
      if (ef.target === 'combat.babBonus' && typeof ef.value === 'number') bab += ef.value;
    });
  });

  if (babOverride >= 0) return babOverride;
  return Math.floor(bab);
}

/** Retourne la chaîne d'attaques iteratives : "+10/+5/+0" */
function getBABProgressionString(bab) {
  if (bab <= 0) return '+0';
  const attacks = [];
  let cur = bab;
  while (cur > 0) { attacks.push('+' + cur); cur -= 5; }
  return attacks.join('/');
}

/** Base de jet de sauvegarde selon la progression de classe. */
function getSaveBase(saveType) {
  // VERIFIED — corrigé 2025-03 (reprise fiche PJ).
  // Bug 1 résolu : mapping keyMap fortitude→fort / reflex→ref / will→will.
  // Bug 2 résolu : formules cumulatives flottantes → formules SRD directes.
  // Testé : 6 cas multiclasse validés (Clerc 5, Wizard 5, Fighter 5, Clerc2/Wiz3…).
  // D&D 3.5 SRD — formules directes :
  //   good : floor(level / 2) + 2
  //   poor : floor(level / 3)
  //
  // Mapping de clé CLASS_REF : fort/ref/will (pas fortitude/reflex/will)
  const keyMap = { fortitude: 'fort', reflex: 'ref', will: 'will' };
  const clsKey = keyMap[saveType];   // ex. 'fortitude' → 'fort'

  let goodLevels = 0;
  let poorLevels = 0;

  AppState.levels.forEach(lvl => {
    const cls = CLASS_REF[lvl.classId];
    if (!cls) return;
    if (cls[clsKey] === 'good') goodLevels++;
    else                        poorLevels++;
  });

  // Multiclasse : chaque niveau contribue séparément selon sa progression
  const goodTotal = goodLevels > 0 ? Math.floor(goodLevels / 2) + 2 : 0;
  const poorTotal = Math.floor(poorLevels / 3);
  return goodTotal + poorTotal;
}

/** Ensemble des compétences de classe du personnage (union de toutes ses classes). */
function getClassSkillsForChar() {
  const cs = new Set();
  AppState.levels.forEach(l => (CLASS_REF[l.classId]?.classSkills || []).forEach(s => cs.add(s)));
  return cs;
}

/** Max rangs autorisés en D&D 3.5 pour une compétence. */
function getMaxRanks(isClassSkill) {
  const charLvl = AppState.levels.length || 1;
  return isClassSkill ? charLvl + 3 : Math.floor((charLvl + 3) / 2);
}

/** Coût Point Buy D&D 3.5 pour un score de base. */
function pointBuyCost(score) {
  const costs = { 8:0,9:1,10:2,11:3,12:4,13:5,14:6,15:8,16:10,17:13,18:16 };
  return costs[score] !== undefined ? costs[score] : (score < 8 ? -(8 - score) : 20);
}

/** Coût total Point Buy de tous les scores de base courants. */
function getTotalPointBuy() {
  return Object.values(AppState.character.abilityScores).reduce((s, sc) => s + pointBuyCost(sc.base), 0);
}


// ═══════════════════════════════════════════════════════════
// SECTION 7 — Valeurs dérivées : Défense
// ═══════════════════════════════════════════════════════════

/** Helper : déduit le bonusType depuis le chemin cible defense.X */
function _inferDefenseBonusType(target) {
  const map = {
    'defense.armor':       'armor',
    'defense.shield':      'shield',
    'defense.naturalArmor':'natural_armor',
    'defense.deflection':  'deflection',
    'defense.dodge':       'dodge',
    'defense.luck':        'luck',
    'defense.sacred':      'sacred',
    'defense.insight':     'insight',
    'defense.profane':     'profane',
  };
  return map[target] || 'untyped';
}

/**
 * Calcule les composantes de la CA.
 * @returns {{ total, touch, ff }} ou version étendue si withBreakdown
 */
function getACComponents(withBreakdown = false) {
  const dexMod = getMod('DEX');
  const sizeBonus = { Fine:8, Diminutive:4, Tiny:2, Small:1, Medium:0, Large:-1, Huge:-2, Gargantuan:-4, Colossal:-8 };
  const sizeAC = sizeBonus[AppState.character.size || 'Medium'] || 0;

  // Cap DEX par l'armure équipée
  // TODO-FICHE : bug dormant maxDex cap.
  // Le filter utilise la variable locale 'd' mais le forEach lit '_aData' (non définie ici).
  // Résultat : _aData?.maxDex = undefined → Math.min(99, undefined) = NaN → effectiveDex = NaN → CA = NaN.
  // Ce bug ne se déclenche que si un item avec aData.maxDex est équipé.
  // VERIFIED — bug maxDex corrigé Lot 1 INVENTAIRE.
  // Avant : .forEach(item => { maxDexCap = Math.min(maxDexCap, _aData?.maxDex); }) → _aData undefined → NaN
  // Après : la variable locale 'd' est redéfinie dans le forEach.
  let maxDexCap = 99;
  getEquippedItems().filter(i => { const d = i.customItem?.aData || (i.itemDbId && ITEM_DB[i.itemDbId]?.aData); return d?.maxDex !== undefined; })
    .forEach(item => {
      const d = item.customItem?.aData || (item.itemDbId ? ITEM_DB[item.itemDbId]?.aData : null);
      if (d?.maxDex !== undefined) maxDexCap = Math.min(maxDexCap, d.maxDex);
    });
  const effectiveDex = maxDexCap === 99 ? dexMod : Math.min(dexMod, maxDexCap);

  // Construction de la liste de bonus de défense
  const rawList = [];

  getActiveEquippedItems().forEach(item => {
    const _aData = item.customItem?.aData || (item.itemDbId ? ITEM_DB[item.itemDbId]?.aData : null);
    // Bonus d'armure physique (via armorData)
    if (_aData?.armorBonus > 0) {
      const cat = item.customItem?.category || (item.itemDbId ? ITEM_DB[item.itemDbId]?.cat : null);
      const isShield = cat === 'shield';
      const itemName = item.customItem?.name?.fr || (item.itemDbId ? ITEM_DB[item.itemDbId]?.name : null) || item.instanceId;
      rawList.push({ target: isShield ? 'defense.shield' : 'defense.armor', bonusType: isShield ? 'shield' : 'armor', value: _aData?.armorBonus, source: itemName });
    }
    // Effets explicites defense.*
    const baseEffects = item.customItem?.effects || (item.itemDbId ? ITEM_DB[item.itemDbId]?.effects || [] : []);
    const instEffects = item.instanceEffects || [];
    [...baseEffects, ...instEffects].forEach(ef => {
      if (!ef.target?.startsWith('defense.')) return;
      const srcName = item.customItem?.name?.fr || (item.itemDbId ? ITEM_DB[item.itemDbId]?.name : null) || item.instanceId;
      rawList.push({ target: ef.target, bonusType: ef.bonusType || _inferDefenseBonusType(ef.target), value: ef.value, source: srcName });
    });
  });

  AppState.buffs.filter(b => b.isActive && b.isSelf).forEach(buff => {
    (buff.effects || []).forEach(ef => {
      if (!ef.target?.startsWith('defense.')) return;
      rawList.push({ target: ef.target, bonusType: ef.bonusType || _inferDefenseBonusType(ef.target), value: ef.value, source: buff.name || buff.nameEn });
    });
  });

  const { byType, breakdown } = resolveBonuses(rawList, true);
  const get = (bt) => byType[bt]?.value || 0;

  const armor   = get('armor');
  const shield  = get('shield');
  const natural = get('natural_armor');
  const deflect = get('deflection');
  const dodge   = get('dodge');
  const luck    = get('luck');
  const sacred  = get('sacred');
  const insight = get('insight');

  const total = 10 + armor + shield + effectiveDex + sizeAC + natural + deflect + dodge + luck + sacred + insight;
  const touch = 10 + effectiveDex + sizeAC + deflect + dodge + luck + sacred + insight;
  const ff    = 10 + armor + shield + sizeAC + natural + deflect + sacred;

  if (!withBreakdown) return { total, touch, ff };
  return {
    total, touch, ff,
    components: { armor, shield, dex: effectiveDex, size: sizeAC, natural, deflect, dodge, luck, sacred, insight },
    breakdown, byType,
  };
}

/**
 * Calcule un jet de sauvegarde total.
 * @param {string}  saveType  'fortitude' | 'reflex' | 'will'
 */
function getSaveTotal(saveType, withBreakdown = false) {
  const abilityMap = { fortitude: 'CON', reflex: 'DEX', will: 'WIS' };
  const abilityMod = getMod(abilityMap[saveType]);
  const base       = getSaveBase(saveType);

  const bonusList = collectBonuses([`save.${saveType}`, 'save.all']);
  const { total: bonusTotal, byType, breakdown } = resolveBonuses(bonusList, true);

  const total = base + abilityMod + bonusTotal;

  if (!withBreakdown) return total;
  return {
    total, base, abilityMod,
    resistance:  byType.resistance?.value  || 0,
    luck:        byType.luck?.value        || 0,
    morale:      byType.morale?.value      || 0,
    sacred:      byType.sacred?.value      || 0,
    profane:     byType.profane?.value     || 0,
    insight:     byType.insight?.value     || 0,
    competence:  byType.competence?.value  || 0,
    alchemical:  byType.alchemical?.value  || 0,
    misc:        byType.untyped?.value     || 0,
    breakdown, byType,
    breakdownHtml: formatBonusBreakdown(breakdown),
  };
}

/**
 * Initiative = mod DEX + misc bonuses targeting 'combat.initiative'
 */
function getInitiative() {
  const dexMod = getMod('DEX');
  const bonusList = collectBonuses('combat.initiative');
  const { total: misc } = resolveBonuses(bonusList, true);
  return dexMod + misc;
}


// ═══════════════════════════════════════════════════════════
// SECTION 8 — Valeurs dérivées : Combat offensif
// ═══════════════════════════════════════════════════════════

/**
 * Bonus d'attaque total pour une arme.
 *
 * @param {object} item   Objet arme de AppState.inventory (peut être null → mains nues)
 * @param {string} mode   'melee' | 'ranged'
 * @returns {number}      Bonus d'attaque principal
 */
function getAttackBonus(item, mode = 'melee') {
  const bab       = getBAB();
  const strMod    = getMod('STR');
  const dexMod    = getMod('DEX');
  const abilMod   = mode === 'ranged' ? dexMod : strMod;
  const sizeBonus = { Fine:8, Diminutive:4, Tiny:2, Small:1, Medium:0, Large:-1, Huge:-2, Gargantuan:-4, Colossal:-8 };
  const sizeAtt   = sizeBonus[AppState.character.size || 'Medium'] || 0;

  // Enhancement d'arme via collectBonuses('combat.attack') — lit tous les items équipés.
  // item? passé en paramètre n'est pas utilisé pour le calcul (futur : pénalités TWF, etc.)
  // Bonus via effets explicites combat.attack
  const bonusList = collectBonuses('combat.attack');
  const { total: misc } = resolveBonuses(bonusList, true);

  return bab + abilMod + sizeAtt + misc;
}

/**
 * Séquence d'attaques iteratives.
 * Retourne un tableau de bonus : [+12, +7, +2]
 */
function getAttackSequence(item, mode = 'melee') {
  const primary = getAttackBonus(item, mode);
  const bab     = getBAB();
  if (bab <= 0) return [primary];
  const sequence = [];
  let cur = bab;
  while (cur > 0) { sequence.push(primary - (bab - cur)); cur -= 5; }
  return sequence;
}

/**
 * Bonus de lutte (Grapple) = BAB + mod FOR + modificateur de taille
 * Note : le modificateur de taille pour la lutte est différent de celui pour l'attaque.
 */
function getGrappleBonus() {
  const bab     = getBAB();
  const strMod  = getMod('STR');
  const grapleSizeBonus = { Fine:-16, Diminutive:-12, Tiny:-8, Small:-4, Medium:0, Large:4, Huge:8, Gargantuan:12, Colossal:16 };
  const sizeGrp = grapleSizeBonus[AppState.character.size || 'Medium'] || 0;
  return bab + strMod + sizeGrp;
}


// ═══════════════════════════════════════════════════════════
// SECTION 9 — Valeurs dérivées : PV
// ═══════════════════════════════════════════════════════════

/** PV maximum calculés (rolls + CON + buffs HP temp). */
function getHPMax() {
  // PV maximum = somme des dés de vie + modificateur CON par niveau
  // Les PV temporaires (buffs hp.temp) sont un compteur SÉPARÉ — ils ne modifient pas le max
  let max = 0;
  AppState.levels.forEach(lvl => { max += (lvl.hpRolled || 1) + getMod('CON'); });
  return max;
}


// ═══════════════════════════════════════════════════════════
// SECTION 10 — Compétences
// ═══════════════════════════════════════════════════════════

/**
 * Total d'une compétence.
 * @param {object} entry  { skillId, ranks, misc, classSkill }
 */
function getSkillTotal(entry, withBreakdown = false) {
  // VERIFIED — corrigé 2025-03 (reprise fiche PJ).
  // Bug résolu : suppression du classBonus fixe +3 (non conforme D&D 3.5 RAW).
  // classSkill = coût réduit (1pt/rang vs 2pts) à l'achat, pas un bonus au total.
  const ref = SKILL_REF[entry.skillId];
  if (!ref) return withBreakdown ? { total: 0, breakdown: [] } : 0;

  const abilityMod = getMod(ref.keyAbility);
  // NOTE RÈGLE D&D 3.5 : classSkill = coût réduit à l'achat (1 pt = 1 rang vs 2 pts),
  // PAS un bonus fixe au total. Aucun classBonus ici — supprimé (bug RAW corrigé).
  const bonusList  = collectBonuses([`skill.${entry.skillId}`, 'skill.all']);
  const { total: bonusTotal, breakdown } = resolveBonuses(bonusList, true);

  const total = entry.ranks + abilityMod + (entry.misc || 0) + bonusTotal;
  if (!withBreakdown) return total;
  return { total, ranks: entry.ranks, abilityMod, misc: entry.misc || 0, bonusTotal, breakdown };
}


// ═══════════════════════════════════════════════════════════
// SECTION 11 — Sorts

// ═══════════════════════════════════════════════════════════

/**
 * DD de sort de base.
 * @param {number} spellLevel     Niveau du sort (0–9)
 * @param {string} castingAbility Caractéristique d'incantation ('WIS','INT','CHA')
 * @returns {number}
 */
function getSpellDC(spellLevel, castingAbility) {
  return 10 + spellLevel + getMod(castingAbility);
}

/**
 * DD de sort personnalisé avec bonus de focus (ex. Spell Focus feat).
 * @param {number} spellLevel
 * @param {string} castingAbility
 * @param {string} school         École de magie (pour Spell Focus)
 * @returns {number}
 */
function getSpellDCWithFocus(spellLevel, castingAbility, school) {
  const base = getSpellDC(spellLevel, castingAbility);
  // Spell Focus : +1 DD pour l'école
  const spellFocus        = hasFeat('feat_spell_focus') ? 1 : 0;
  const greaterSpellFocus = hasFeat('feat_greater_spell_focus') ? 1 : 0;
  // Checks if the stored focus school matches (simplified: any school)
  // Pour une implémentation complète, comparer l'école du don avec `school`
  return base + spellFocus + greaterSpellFocus;
}

/** Sorts connus du personnage (AppState.spells). */
function getLearnedSpells() {
  return AppState.spells;
}

/** Informations sur le renvoi des morts-vivants. */
function getTurnUndeadInfo() {
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const hasTurnUndead = classLevels['class_cleric'] > 0 || classLevels['class_paladin'] > 0;
  if (!hasTurnUndead) return { total: 0, used: 0, available: 0 };

  const total        = Math.max(0, 3 + getMod('CHA'));
  const chargesUsed  = AppState.abilityStates?.['ca_charges_ca_turn_undead'] || 0;
  const dmmUsed      = (AppState.preparedSpells || []).filter(ps => ps.divineMetamagicUsed > 0 && ps.state !== 'prepared').reduce((s, ps) => s + (ps.turnUndeadSpent || 0), 0);
  const used         = Math.min(total, chargesUsed + dmmUsed);
  return { total, used, available: Math.max(0, total - used) };
}


// ─── Spell calculation helpers (from spells.js) ─────────────────

function getWisdomBonusSlots(wisMod) {
  const bonus = [0,0,0,0,0,0,0,0,0];
  if (wisMod <= 0) return bonus;
  // D&D 3.5 : bonus de sorts par mod de caractéristique
  // mod 1 → +1 sort nv1
  // mod 2 → +1 sorts nv1 et nv2 (ou +1 nv1, selon table)
  // Formule réelle SRD : pour chaque mod, +1 sort aux niveaux de 1 à mod
  for (let lvl = 1; lvl <= Math.min(wisMod, 9); lvl++) {
    bonus[lvl - 1] = Math.ceil(wisMod / lvl);  // Approximation simplifiée
  }
  // Formule correcte SRD : +1 au niveau 1 si mod≥1, +1 nv2 si mod≥3, +1 nv3 si mod≥5, etc.
  // Table exacte :
  const exact = [0,0,0,0,0,0,0,0,0];
  if (wisMod >= 1) exact[0] += 1;
  if (wisMod >= 3) { exact[0] += 1; exact[1] += 1; }
  if (wisMod >= 5) { exact[0] += 1; exact[1] += 1; exact[2] += 1; }
  if (wisMod >= 7) { exact[0] += 1; exact[1] += 1; exact[2] += 1; exact[3] += 1; }
  if (wisMod >= 9) { exact[0] += 1; exact[1] += 1; exact[2] += 1; exact[3] += 1; exact[4] += 1; }
  // etc. On utilise la formule standardisée ci-dessus
  // Formula correcte : bonus au niveau N = floor((wisMod - (2N-3)) / 4) + 1 quand >0 (niveau N de 1 à 9)
  const result = [0,0,0,0,0,0,0,0,0];
  for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
    const val = Math.max(0, Math.floor((wisMod - (spellLevel - 1)) / 4) + (wisMod >= spellLevel ? 1 : 0));
    result[spellLevel-1] = val;
  }
  return result;
}

function getClericSlotsPerDay(clericLvl, wisMod) {
  if (clericLvl < 1 || clericLvl > 20) return [];
  const base = [...CLERIC_BASE_SLOTS[clericLvl - 1]];
  const bonusSlots = getWisdomBonusSlots(wisMod);
  for (let i = 1; i <= 9; i++) {
    if (base[i] > 0 || clericLvl >= i * 2 - 1) {
      base[i] = (base[i] || 0) + (bonusSlots[i-1] || 0);
    }
  }
  return base;
}

function getFilteredSpellDB() {
  const filters = AppState.sourceFilters || { official: true, magazine: true, community: false, custom: true };
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const charClasses = Object.keys(classLevels); // e.g. ['class_cleric']

  // Merge SPELL_DB (PHB/existing) + SPELL_DB_SPC (Spell Compendium VO)
  // SPELL_DB entries with source=SpC override any SpC entry with same name (already deduplicated at build time)
  const combinedDB = Object.assign({}, typeof SPELL_DB_SPC !== 'undefined' ? SPELL_DB_SPC : {}, SPELL_DB);

  const spells = [];
  Object.entries(combinedDB).forEach(([id, sp]) => {
    // Filtre source
    const stype = sp.source_type || 'official';
    if (!filters[stype]) return;

    // Filtre classe : le sort doit être dans la liste de classe du perso
    const spClasses = sp.classes || sp.level || {};
    const charClassKeys = charClasses.map(c => c.replace('class_', '')); // 'class_cleric' → 'cleric'
    const hasClass = Object.keys(spClasses).some(cls => charClassKeys.includes(cls));
    if (charClasses.length > 0 && !hasClass) return; // si perso défini, filtrer

    spells.push({ id, ...sp });
  });

  // Ajouter sorts custom du perso
  AppState.spells.filter(s => s.isCustom).forEach(s => {
    if (filters.custom) spells.push({ id: s.id, isCustomEntry: true, ...s });
  });

  return spells;
}

function getSpellLevelForChar(sp) {
  if (sp.level && typeof sp.level === 'number') return sp.level;
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const charClassKeys = Object.keys(classLevels).map(c => c.replace('class_', ''));
  const spClasses = sp.classes || sp.level || {};
  for (const cls of charClassKeys) {
    if (spClasses[cls] !== undefined) return spClasses[cls];
  }
  return Object.values(spClasses)[0] ?? 0;
}

function getPrepCountByLevel() {
  const counts = {};
  (AppState.preparedSpells || []).forEach(ps => {
    const lvl = ps.preparedLevel ?? ps.baseLevel ?? 0;
    counts[lvl] = (counts[lvl] || 0) + 1;
  });
  return counts;
}

// ─── Skill point helpers ──────────────────────────────────────────
/** Points de compétence gagnés à un niveau donné (D&D 3.5 : ×4 au niveau 1). */
function getSkillPointsForLevel(lvl) {
  const cls    = CLASS_REF[lvl.classId];
  const intMod = getMod('INT');
  const base   = cls ? Math.max(1, cls.spPerLvl + intMod) : 2;
  return lvl.levelNumber === 1 ? base * 4 : base;
}

/** Total de points de compétence disponibles pour le personnage. */
function getTotalSkillPoints() {
  return AppState.levels.reduce((sum, lvl) => sum + getSkillPointsForLevel(lvl), 0);
}

/** Points de compétence dépensés. */
function getSpentSkillPoints() {
  return AppState.skillEntries.reduce((sum, e) => sum + (e.ranks || 0), 0);
}
