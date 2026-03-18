function collectBonuses(targets) {
  const targetSet = Array.isArray(targets) ? new Set(targets) : new Set([targets]);
  const list = [];

  const push = (ef, source) => {
    if (!targetSet.has(ef.target)) return;
    list.push({
      value:     ef.value || 0,
      bonusType: ef.bonusType || 'untyped',
      source:    source,
      isPenalty: (ef.value || 0) < 0,
    });
  };

  // Items équipés
  AppState.items.filter(i => i.equipped).forEach(item => {
    (item.effects || []).forEach(ef => push(ef, item.name));
  });

  // Self buffs actifs
  AppState.buffs.filter(b => b.isActive && b.isSelf).forEach(buff => {
    (buff.effects || []).forEach(ef => push(ef, buff.name || buff.nameEn));
  });

  // Capacités de classe — toggle actif uniquement
  if (AppState.abilityStates) {
    Object.entries(CLASS_ABILITIES_DB).forEach(([abId, ab]) => {
      if (ab.type === 'active_toggle' && AppState.abilityStates[`ca_state_${abId}`] && ab.effects) {
        ab.effects.forEach(ef => {
          const normalised = { ...ef };
          // Normalise 'STR' → 'ability.STR'
          if (['STR','DEX','CON','INT','WIS','CHA'].includes(ef.target)) {
            normalised.target = `ability.${ef.target}`;
          }
          push(normalised, ab.name);
        });
      }
    });
  }

  return list;
}

/**
 * Résout une liste de bonus en appliquant les règles de stacking.
 *
 * @param {Array} bonusList   Résultat de collectBonuses()
 * @param {boolean} splitPenalties  Si true, les malus (valeur < 0) stackent toujours
 * @returns {{ total, byType, breakdown[] }}
 */
function resolveBonuses(bonusList, splitPenalties = true) {
  // Séparer bonus positifs et malus
  const positives = splitPenalties ? bonusList.filter(b => b.value >= 0) : bonusList;
  const penalties = splitPenalties ? bonusList.filter(b => b.value < 0)  : [];

  // Grouper par type
  const groups = {};
  positives.forEach(b => {
    const bt = b.bonusType || 'untyped';
    if (!groups[bt]) groups[bt] = [];
    groups[bt].push(b);
  });

  const byType = {};
  const breakdown = [];

  Object.entries(groups).forEach(([bt, entries]) => {
    const rule = BONUS_STACKING_RULES[bt] || 'highest';
    let resolved;
    if (rule === 'stack') {
      const val = entries.reduce((s, e) => s + e.value, 0);
      resolved = { value: val, active: entries, suppressed: [] };
    } else {
      // highest only — trier par valeur desc, garder le max, ignorer les autres
      const sorted = [...entries].sort((a, b) => b.value - a.value);
      resolved = {
        value:      sorted[0].value,
        active:     [sorted[0]],
        suppressed: sorted.slice(1),
      };
    }
    byType[bt] = resolved;
    if (resolved.value !== 0) {
      breakdown.push({ bonusType: bt, value: resolved.value, source: resolved.active.map(e => e.source).join(', ') });
    }
  });

  // Malus : toujours cumulatifs
  const penaltyTotal = penalties.reduce((s, b) => s + b.value, 0);
  if (penaltyTotal !== 0) {
    breakdown.push({ bonusType: 'penalty', value: penaltyTotal, source: penalties.map(e => e.source).join(', ') });
  }

  const total = Object.values(byType).reduce((s, g) => s + g.value, 0) + penaltyTotal;

  return { total, byType, breakdown };
}

/**
 * Construit un HTML de breakdown lisible pour les tooltips/modals.
 */
function formatBonusBreakdown(breakdown, base = 0, label = '') {
  if (!breakdown.length && base === 0) return '<span class="text-dim">Aucun bonus</span>';
  const typeLabels = {
    enhancement: 'Amélioration', size: 'Taille', morale: 'Moral',
    luck: 'Chance', sacred: 'Sacré', profane: 'Profane',
    inherent: 'Inné', alchemical: 'Alchimique', racial: 'Racial',
    insight: 'Intuition', competence: 'Compétence', resistance: 'Résistance',
    deflection: 'Déflexion', natural_armor: 'Arm. naturelle', armor: 'Armure',
    shield: 'Bouclier', dodge: 'Esquive', circumstance: 'Circonstance',
    untyped: 'Sans type', penalty: 'Malus', special: 'Spécial',
  };
  let rows = '';
  if (base) rows += `<div class="flex-between mb-4"><span class="text-dim">Base</span><span class="text-bright">+${base}</span></div>`;
  breakdown.forEach(b => {
    const sign = b.value >= 0 ? '+' : '';
    rows += `<div class="flex-between mb-4">
      <span class="text-dim">${typeLabels[b.bonusType] || b.bonusType}</span>
      <span style="color:${b.value >= 0 ? 'var(--gold)' : 'var(--red)'}; font-size:12px;">
        ${sign}${b.value} <span class="text-dim" style="font-size:10px;">(${b.source})</span>
      </span>
    </div>`;
  });
  return rows;
}

function getAbilityTotal(ability, withBreakdown = false) {
  const chr = AppState.character;
  const scores = chr.abilityScores[ability];
  if (!scores) return 10;

  // Collecte depuis items + buffs + capacités
  const bonusList = collectBonuses(`ability.${ability}`);

  // Résoudre
  const { total: bonusTotal, byType, breakdown } = resolveBonuses(bonusList, true);

  // Composantes fixes du score
  const base    = scores.base     || 10;
  const racial  = scores.racial   || 0;
  const levelUp = scores.levelUp  || 0;
  const inherent= scores.inherent || 0;
  const tempBonus = scores.tempBonus || 0;

  // Inherent depuis items/buffs déjà compté via collectBonuses
  // racial et levelUp sont dans les scores de base (non collectés via effets)
  const fixedBase = base + racial + levelUp + tempBonus;
  // Note: inherent depuis le score de base (Wish via interface) est dans scores.inherent
  // inherent depuis buffs est collecté via collectBonuses
  const total = fixedBase + scores.inherent + bonusTotal;

  if (!withBreakdown) return total;

  return {
    total,
    base,
    racial,
    levelUp,
    inherent: scores.inherent,
    tempBonus,
    breakdown,
    byType,
    // Backward compat
    enhancement: byType.enhancement || { value: 0, active: [], suppressed: [] },
    size:        byType.size        || { value: 0, active: [], suppressed: [] },
    morale:      byType.morale      || { value: 0, active: [], suppressed: [] },
    luck:        byType.luck        || { value: 0, active: [], suppressed: [] },
    sacred:      byType.sacred      || { value: 0, active: [], suppressed: [] },
  };
}


function getMod(ability) {
  return Math.floor((getAbilityTotal(ability) - 10) / 2);
}

// Compétences de classe du personnage (union de toutes ses classes)
function getClassSkillsForChar() {
  const cs = new Set();
  AppState.levels.forEach(l => {
    (CLASS_REF[l.classId]?.classSkills || []).forEach(s => cs.add(s));
  });
  return cs;
}

// Max rangs autorisés en D&D 3.5
function getMaxRanks(isClassSkill) {
  const charLvl = AppState.levels.length || 1;
  return isClassSkill ? charLvl + 3 : Math.floor((charLvl + 3) / 2);
}

// Coût Point Buy D&D 3.5 pour un score de base
function pointBuyCost(score) {
  const costs = { 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:6, 15:8, 16:10, 17:13, 18:16 };
  return costs[score] !== undefined ? costs[score] : (score < 8 ? -(8 - score) : 20);
}

function getTotalPointBuy() {
  return Object.values(AppState.character.abilityScores)
    .reduce((sum, sc) => sum + pointBuyCost(sc.base), 0);
}

// Sorts "connus" (ajoutés dans l'onglet Sorts) — pour filtrer le grimoire
function getLearnedSpells() {
  return AppState.spells.filter(s => !s.isCustom || s.isCustom);
  // = tous ceux dans AppState.spells (ajoutés depuis la DB ou custom)
}

function getBAB() {
  let bab = 0;
  AppState.levels.forEach(lvl => {
    const cls = CLASS_REF[lvl.classId];
    if (!cls) return;
    const prog = cls.babProg;
    if (prog === 'full')        bab += 1;
    else if (prog === 'medium') bab += 0.75;
    else if (prog === 'poor')   bab += 0.5;
  });

  const charLvl = AppState.levels.length || 0;

  // Override BAB depuis buffs actifs (ex. Divine Power = BAB égal au niveau total)
  let babOverride = -1;
  AppState.buffs.filter(b => b.isActive && b.isSelf).forEach(b => {
    (b.effects || []).forEach(ef => {
      if (ef.target === 'combat.baseAttackOverride') {
        babOverride = Math.max(babOverride, charLvl);
      }
      if (ef.target === 'combat.babBonus' && typeof ef.value === 'number') {
        bab += ef.value; // bonus additif au BBA
      }
    });
  });

  // Vérifier aussi si un sort du grimoire avec effect BAB est "casté" (marqué used dans spellbook)
  // Divine Power via grimoire lancé
  if (AppState.spellbook) {
    AppState.spellbook.forEach(g => {
      if (!g.used) return; // seulement si le sort a été lancé
      const sp = SPELL_DB[g.spellId];
      if (sp?.formula && sp.formula.includes('BAB=char_level')) {
        babOverride = Math.max(babOverride, charLvl);
      }
    });
  }

  if (babOverride >= 0) return babOverride;
  return Math.floor(bab);
}

function getBABProgressionString(bab) {
  if (bab <= 0) return '+0';
  const attacks = [];
  let current = bab;
  while (current > 0) {
    attacks.push('+' + current);
    current -= 5;
  }
  return attacks.join('/');
}

/**
 * Retourne les informations sur le Renvoi des morts-vivants du personnage.
 * Utilisé pour la Divine Métamagie et l'affichage des charges.
 */
function getTurnUndeadInfo() {
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId]||0) + 1; });
  const hasTurnUndead = classLevels['class_cleric'] > 0 || classLevels['class_paladin'] > 0;
  if (!hasTurnUndead) return { total: 0, used: 0, available: 0 };

  const total = Math.max(0, 3 + getMod('CHA'));
  // Charges utilisées dans le système de capacités
  const chargesUsed = AppState.abilityStates?.['ca_charges_ca_turn_undead'] || 0;
  // Charges supplémentaires dépensées via Divine Métamagie (sorts préparés non réinitialisés)
  const dmmUsed = (AppState.preparedSpells || [])
    .filter(ps => ps.divineMetamagicUsed > 0 && ps.state !== 'prepared')
    .reduce((s, ps) => s + ps.turnUndeadSpent, 0);
  const used = Math.min(total, chargesUsed + dmmUsed);
  return { total, used, available: Math.max(0, total - used) };
}

function getSaveBase(saveType) {
  let base = 0;
  AppState.levels.forEach(lvl => {
    const cls = CLASS_REF[lvl.classId];
    if (!cls) return;
    const prog = cls[saveType];
    if (prog === 'good') base += 2/3;
    else base += 1/3;
  });
  return Math.floor(base) + (AppState.levels.length > 0 ? (CLASS_REF[AppState.levels[0]?.classId]?.[saveType] === 'good' ? 2 : 0) : 0);
}

function getSaveTotal(saveType, withBreakdown = false) {
  const abilityMap = { fortitude: 'CON', reflex: 'DEX', will: 'WIS' };
  const abilityMod = getMod(abilityMap[saveType]);
  const base = getSaveBase(saveType);

  // Collecte depuis toutes les sources — cible 'save.X' ET 'save.all'
  const bonusList = collectBonuses([`save.${saveType}`, 'save.all']);

  const { total: bonusTotal, byType, breakdown } = resolveBonuses(bonusList, true);

  const total = base + abilityMod + bonusTotal;

  if (!withBreakdown) return total;

  // Format breakdown for display
  const bd = formatBonusBreakdown(breakdown);

  // Backward compat fields
  return {
    total, base, abilityMod,
    resistance:  (byType.resistance?.value  || 0),
    luck:        (byType.luck?.value        || 0),
    morale:      (byType.morale?.value      || 0),
    sacred:      (byType.sacred?.value      || 0),
    profane:     (byType.profane?.value     || 0),
    insight:     (byType.insight?.value     || 0),
    competence:  (byType.competence?.value  || 0),
    alchemical:  (byType.alchemical?.value  || 0),
    misc:        (byType.untyped?.value     || 0),
    breakdown,
    byType,
    breakdownHtml: bd,
  };
}


function getACComponents(withBreakdown = false) {
  const dexMod = getMod('DEX');
  const sizeBonus = { Fine:8, Diminutive:4, Tiny:2, Small:1, Medium:0, Large:-1, Huge:-2, Gargantuan:-4, Colossal:-8 };
  const sizeAC = sizeBonus[AppState.character.size || 'Medium'] || 0;

  // Max DEX from equipped armor
  let maxDexCap = 99;
  AppState.items.filter(i => i.equipped && i.armorData?.maxDex !== undefined)
    .forEach(item => { maxDexCap = Math.min(maxDexCap, item.armorData.maxDex); });
  const effectiveDex = maxDexCap === 99 ? dexMod : Math.min(dexMod, maxDexCap);

  // Build a synthetic bonus list for AC
  // Items with armorData inject typed bonuses
  const rawList = [];

  AppState.items.filter(i => i.equipped).forEach(item => {
    if (item.armorData) {
      const bonus = item.armorData.armorBonus || 0;
      if (bonus > 0) {
        // Is it a shield or an armor?
        const isShield = item.subcategory === 'shield' || item.category === 'armor' && item.subcategory === 'shield';
        const type = isShield ? 'shield' : 'armor';
        rawList.push({ target: `defense.${type}`, bonusType: type, value: bonus, source: item.name });
      }
    }
    (item.effects || []).forEach(ef => {
      // Normalise legacy target names
      const t = ef.target;
      if (!t || !t.startsWith('defense.')) return;
      rawList.push({ target: t, bonusType: ef.bonusType || inferBonusTypeFromTarget(t), value: ef.value, source: item.name });
    });
  });

  AppState.buffs.filter(b => b.isActive && b.isSelf).forEach(buff => {
    (buff.effects || []).forEach(ef => {
      const t = ef.target;
      if (!t || !t.startsWith('defense.')) return;
      rawList.push({ target: t, bonusType: ef.bonusType || inferBonusTypeFromTarget(t), value: ef.value, source: buff.name || buff.nameEn });
    });
  });

  // Helper: infer bonusType from target path when not explicit
  function inferBonusTypeFromTarget(t) {
    if (t === 'defense.armor')        return 'armor';
    if (t === 'defense.shield')       return 'shield';
    if (t === 'defense.naturalArmor') return 'natural_armor';
    if (t === 'defense.deflection')   return 'deflection';
    if (t === 'defense.dodge')        return 'dodge';
    if (t === 'defense.luck')         return 'luck';
    if (t === 'defense.sacred')       return 'sacred';
    if (t === 'defense.insight')      return 'insight';
    return 'untyped';
  }

  // Group and resolve by bonus type using central engine
  const { byType, breakdown } = resolveBonuses(rawList, true);

  const get = (bt) => byType[bt]?.value || 0;

  const armor   = get('armor');
  const shield  = get('shield');
  const natural = get('natural_armor');
  const deflect = get('deflection');
  const dodge   = get('dodge');   // already stacks via BONUS_STACKING_RULES
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
    breakdown,
    byType,
  };
}

function getInitiative() {
  return getMod('DEX');
}

function getHPMax() {
  let max = 0;
  AppState.levels.forEach(lvl => {
    max += (lvl.hpRolled || 1) + getMod('CON');
  });
  // Buff: temporary HP
  const tempBuff = AppState.buffs.filter(b => b.isActive && b.isSelf).reduce((acc, b) => {
    const ef = (b.effects || []).find(e => e.target === 'hp.temp');
    return acc + (ef ? ef.value : 0);
  }, 0);
  return max + tempBuff;
}

function getSkillTotal(entry, withBreakdown = false) {
  const ref = SKILL_REF[entry.skillId];
  if (!ref) return withBreakdown ? { total: 0, breakdown: [] } : 0;
  const abilityMod = getMod(ref.keyAbility);
  const classBonus = entry.classSkill && entry.ranks > 0 ? 3 : 0;

  // Collect typed bonuses targeting this skill
  const bonusList = collectBonuses([`skill.${entry.skillId}`, 'skill.all']);
  const { total: bonusTotal, breakdown } = resolveBonuses(bonusList, true);

  const total = entry.ranks + abilityMod + classBonus + (entry.misc || 0) + bonusTotal;

  if (!withBreakdown) return total;
  return { total, ranks: entry.ranks, abilityMod, classBonus, misc: entry.misc || 0, bonusTotal, breakdown };
}