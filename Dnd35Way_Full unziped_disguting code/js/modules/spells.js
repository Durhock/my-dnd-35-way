// ============================================================
// spells.js — Gestion des sorts du personnage
//
// Responsabilité : bibliothèque, préparation, grimoire, casting.
// Ce module ne calcule pas de stats — il délègue à rules.js.
//
// Structure des sorts dans AppState :
//
//   AppState.spells[]          → sorts CONNUS du personnage
//     {id, dbId, name, level, school, duration, range,
//      description, savingThrow, isCustom, official, …}
//
//   AppState.preparedSpells[]  → sorts PRÉPARÉS (runtime du jour)
//     {id, dbId, name, baseLevel, preparedLevel, metamagic[],
//      metamagicCost, metamagicMode, divineMetamagicUsed,
//      turnUndeadSpent, isPersistent, state, expiresAt?}
//      state : 'prepared' | 'cast' | 'active'
//
//   AppState.spellSlotUsage{}  → emplacements consommés {lvl: count}
//
//   AppState.spellbook[]       → LEGACY — migré vers preparedSpells
//
// Helpers de calcul (dans rules.js) :
//   getWisdomBonusSlots()
//   getClericSlotsPerDay()
//   getFilteredSpellDB()
//   getSpellLevelForChar()
//   getPrepCountByLevel()
//   getSpellDC()
//   getTurnUndeadInfo()
//   getMod()
//
// SECTIONS :
//   1. Helpers référence (getSpellNameFr, métamagie)
//   2. Mutations : sorts connus
//   3. Mutations : sorts préparés
//   4. Mutations : emplacements de sorts
//   5. Lien sorts → buffs (castPreparedSpell, uncast, expire)
//   6. Long rest
//   7. Render — Préparation (renderSpells, source filters)
//   8. Render — Bibliothèque (renderSpellList, buildSpellLibraryCard)
//   9. Render — Modal préparation (openPrepareModal, updatePrepModal, confirmPrepareSpell)
//  10. Render — Grimoire (renderGrimoire, renderGrimoirePrepared, buildGrimoireCard)
//  11. Render — Sorts custom
//  12. UI bindings / legacy stubs
// ============================================================


// ═══════════════════════════════════════════════════════════
// SECTION 1 — Helpers référence
// ═══════════════════════════════════════════════════════════

/** Traduction FR d'un sort depuis SPELL_NAMES_FR. */

// ── Lookup combiné SPELL_DB + SPELL_DB_SPC ─────────────────────────────────
function _getSpell(id) {
  return _getSpell(id) || (typeof SPELL_DB_SPC !== 'undefined' ? SPELL_DB_SPC[id] : null) || null;
}


function getSpellNameFr(spellId) {
  return SPELL_NAMES_FR[spellId] || '';
}

/**
 * Map des dons de métamagie reconnus par le système.
 * Centralisé ici pour que openPrepareModal et confirmPrepareSpell utilisent la même table.
 */
const _MM_FEAT_MAP = {
  feat_extend_spell:     { id: 'extend',   name: 'Extend Spell',     cost: 1, desc: 'Durée ×2' },
  feat_empower_spell:    { id: 'empower',  name: 'Empower Spell',    cost: 2, desc: 'Variables ×1.5' },
  feat_maximize_spell:   { id: 'maximize', name: 'Maximize Spell',   cost: 3, desc: 'Variables max' },
  feat_quicken_spell:    { id: 'quicken',  name: 'Quicken Spell',    cost: 4, desc: 'Action libre' },
  feat_persistent_spell: { id: 'persist',  name: 'Persistent Spell', cost: 6, desc: 'Durée 24 heures' },
  feat_widen_spell:      { id: 'widen',    name: 'Widen Spell',      cost: 3, desc: 'Zone ×2' },
  feat_heighten_spell:   { id: 'heighten', name: 'Heighten Spell',   cost: 0, desc: 'Niveau variable' },
  feat_still_spell:      { id: 'still',    name: 'Still Spell',      cost: 1, desc: 'Sans composante somatique' },
  feat_silent_spell:     { id: 'silent',   name: 'Silent Spell',     cost: 1, desc: 'Sans composante verbale' },
  feat_enlarge_spell:    { id: 'enlarge',  name: 'Enlarge Spell',    cost: 1, desc: 'Portée ×2' },
};

/** Retourne les dons de métamagie possédés par le personnage. */
function _getMetamagicOptions() {
  return Object.entries(_MM_FEAT_MAP)
    .filter(([featId]) => hasFeat(featId))
    .map(([, mm]) => mm);
}


// ═══════════════════════════════════════════════════════════
// SECTION 2 — Mutations : sorts connus (AppState.spells)
// ═══════════════════════════════════════════════════════════

/**
 * Structure d'un sort connu (instance dans AppState.spells).
 * Référence SPELL_DB via dbId — ne duplique pas les données de référence.
 */
function _makeKnownSpell(dbId) {
  const sp = _getSpell(dbId);
  if (!sp) return null;
  return {
    id:           'char_' + dbId,
    dbId,
    name:         sp.name,
    level:        getSpellLevelForChar(sp),   // ← rules.js
    school:       sp.school,
    duration:     sp.duration,
    range:        sp.range,
    description:  sp.desc,
    savingThrow:  sp.save,
    isCustom:     false,
  };
}

/** Ajoute un sort de SPELL_DB aux sorts connus. */
function addSpellFromDB(spellId) {
  if (AppState.spells.some(s => s.dbId === spellId)) {
    renderSpellList();
    return;
  }
  const entry = _makeKnownSpell(spellId);
  if (entry) AppState.spells.push(entry);
  renderSpellList();
  const counters = document.getElementById('spell-prep-counters');
  if (counters) renderSpells();
}

/** Retire un sort connu (et ses préparations) de AppState. */
function removeSpellFromChar(spellId) {
  AppState.spells         = AppState.spells.filter(s => s.dbId !== spellId && s.id !== spellId);
  AppState.preparedSpells = AppState.preparedSpells.filter(p => p.dbId !== spellId);
  renderSpellList();
}

// Aliases de compatibilité
function removeSpellFromDB(spellId) { removeSpellFromChar(spellId); }
function removeSpell(spellId)       { removeSpellFromChar(spellId); }


// ═══════════════════════════════════════════════════════════
// SECTION 3 — Mutations : sorts préparés (AppState.preparedSpells)
// ═══════════════════════════════════════════════════════════

/**
 * Structure d'un sort préparé (runtime).
 * state : 'prepared' | 'cast' | 'active'
 */
function _makePreparedSpell(dbId, options = {}) {
  const sp = _getSpell(dbId);
  if (!sp) return null;
  return {
    id:                  'ps_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
    dbId,
    name:                sp.name,
    baseLevel:           options.baseLevel    ?? getSpellLevelForChar(sp),   // ← rules.js
    preparedLevel:       options.preparedLevel ?? getSpellLevelForChar(sp),  // ← rules.js
    metamagic:           options.metamagic     ?? [],
    metamagicCost:       options.metamagicCost ?? 0,
    metamagicMode:       options.metamagicMode ?? 'normal',      // 'normal' | 'divine_metamagic'
    divineMetamagicUsed: options.divineMetamagicUsed ?? 0,
    turnUndeadSpent:     options.turnUndeadSpent     ?? 0,
    isPersistent:        options.isPersistent ?? false,
    state:               'prepared',
  };
}


// ═══════════════════════════════════════════════════════════
// SECTION 4 — Mutations : emplacements de sorts
// ═══════════════════════════════════════════════════════════

/** Bascule l'utilisation d'un emplacement (dot UI dans la bibliothèque). */
function toggleSpellSlotUsage(level, idx) {
  const current = AppState.spellSlotUsage[level] || 0;
  AppState.spellSlotUsage[level] = idx < current ? idx : idx + 1;
  renderSpells();
}

/** Bascule l'utilisation d'un slot depuis le grimoire. */
function toggleGrimoireSlot(lvl, idx) {
  const cur = AppState.spellSlotUsage[lvl] || 0;
  AppState.spellSlotUsage[lvl] = idx < cur ? idx : idx + 1;
  renderGrimoire();
}

/** Consomme un emplacement de sort au lancer. */
function _consumeSlot(preparedLevel) {
  AppState.spellSlotUsage[preparedLevel] = (AppState.spellSlotUsage[preparedLevel] || 0) + 1;
}

/** Libère un emplacement (annulation). */
function _freeSlot(preparedLevel) {
  if ((AppState.spellSlotUsage[preparedLevel] || 0) > 0) AppState.spellSlotUsage[preparedLevel]--;
}


// ═══════════════════════════════════════════════════════════
// SECTION 5 — Lien sorts → buffs
// ═══════════════════════════════════════════════════════════

/**
 * Lance un sort préparé.
 * Si le sort a un buff associé dans BUFF_DB, active ce buff via makeBuff().
 * Ne modifie pas les stats directement — buffs.js + rules.js s'en chargent.
 */
function castPreparedSpell(psId) {
  const ps = AppState.preparedSpells.find(p => p.id === psId);
  if (!ps || ps.state !== 'prepared') return;

  // Chercher un buff correspondant dans BUFF_DB
  const matchingBuffEntry = ps.dbId
    ? Object.entries(BUFF_DB).find(([, b]) => b.spellId === ps.dbId)
    : null;

  if (matchingBuffEntry) {
    const [buffDbId, buffEntry] = matchingBuffEntry;
    ps.state = 'active';

    // Mettre à jour ou créer le buff dans AppState.buffs
    const existing = AppState.buffs.find(b => b.dbId === buffDbId && b.isSelf);
    const cl = AppState.levels.length || 1;
    if (existing) {
      existing.isActive      = true;
      existing.casterLevel   = cl;
      // Recalculer les effets du buff avec le niveau d'incantation actuel
      existing.effects       = buffEntry.effects(cl);
      existing.effectsLabel  = buffEntry.effectsLabel ? buffEntry.effectsLabel(cl) : '';
      if (ps.isPersistent) {
        existing.isPersistent  = true;
        existing.durationLabel = '24 heures';
        existing.expiresAt     = Date.now() + 24 * 60 * 60 * 1000;
      }
    } else {
      const newBuff = makeBuff(buffDbId, { isSelf: true });  // ← buffs.js
      if (newBuff) {
        if (ps.isPersistent) {
          newBuff.isPersistent  = true;
          newBuff.durationLabel = '24 heures';
          newBuff.expiresAt     = Date.now() + 24 * 60 * 60 * 1000;
        }
        AppState.buffs.push(newBuff);
      }
    }
  } else {
    ps.state = 'cast';
  }

  // Consommer le slot (sauf sorts persistants qui ont déjà bloqué leur slot à la préparation)
  if (!ps.isPersistent) {
    _consumeSlot(ps.preparedLevel ?? ps.baseLevel ?? 0);
  }

  renderAll();
}

/** Annule le lancer d'un sort (remet à 'prepared'). */
function uncastPreparedSpell(psId) {
  const ps = AppState.preparedSpells.find(p => p.id === psId);
  if (!ps) return;
  const lvl = ps.preparedLevel ?? ps.baseLevel ?? 0;
  if (ps.state === 'cast' || ps.state === 'active') _freeSlot(lvl);
  ps.state = 'prepared';

  // Désactiver le buff associé
  if (ps.dbId) {
    const matchingBuff = AppState.buffs.find(b => {
      const entry = BUFF_DB[b.dbId || ''];
      return entry?.spellId === ps.dbId;
    });
    if (matchingBuff) matchingBuff.isActive = false;
  }
  renderAll();
}

/** Expire un sort actif (passe à 'cast', désactive le buff). */
function expirePreparedSpell(psId) {
  const ps = AppState.preparedSpells.find(p => p.id === psId);
  if (!ps) return;
  ps.state = 'cast';
  if (ps.dbId) {
    const matchingBuff = AppState.buffs.find(b => {
      const entry = BUFF_DB[b.dbId || ''];
      return entry?.spellId === ps.dbId;
    });
    if (matchingBuff) matchingBuff.isActive = false;
  }
  renderAll();
}


// ═══════════════════════════════════════════════════════════
// SECTION 6 — Long rest
// ═══════════════════════════════════════════════════════════

function longRest() {
  const now = Date.now();

  // Réinitialise les emplacements
  AppState.spellSlotUsage = {};

  // Sorts préparés : persistants actifs survivent si pas expirés
  AppState.preparedSpells.forEach(ps => {
    if (ps.isPersistent && ps.state === 'active') {
      if (ps.expiresAt && now > ps.expiresAt) ps.state = 'cast';
      // sinon → reste 'active'
    } else {
      ps.state = 'prepared';
    }
  });

  // Legacy
  AppState.spellbook.forEach(e => e.used = false);

  // Charges de capacités de classe
  if (AppState.abilityStates) {
    Object.keys(AppState.abilityStates).forEach(k => {
      if (k.startsWith('ca_charges_')) AppState.abilityStates[k] = 0;
    });
  }

  // Buffs de sorts : désactiver les non-persistants
  AppState.buffs.forEach(b => {
    if (!b.spellId && !b.dbId) return; // buffs manuels → intacts
    if (b.isPersistent) {
      if (b.expiresAt && now > b.expiresAt) b.isActive = false;
    } else {
      b.isActive = false;
    }
  });

  const persistCount = AppState.preparedSpells.filter(ps => ps.isPersistent && ps.state === 'active').length;
  AppState.log.unshift({
    date: new Date().toLocaleString('fr-FR'),
    text: `☀️ Repos long — emplacements et charges réinitialisés.${persistCount > 0 ? ` ${persistCount} sort(s) persistant(s) toujours actif(s).` : ''}`
  });

  renderAll();
  alert(`☀️ Repos long terminé. Emplacements et charges réinitialisés.${persistCount > 0 ? `\n⏳ ${persistCount} sort(s) persistant(s) toujours actif(s).` : ''}`);
}


// ═══════════════════════════════════════════════════════════
// SECTION 7 — Render : Préparation
// ═══════════════════════════════════════════════════════════

function renderSpells() {
  const wisMod    = getMod('WIS');            // ← rules.js
  const wisTotal  = getAbilityTotal('WIS');   // ← rules.js
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const clericLvl   = classLevels['class_cleric'] || 0;
  const casterLevel = AppState.levels.length;

  // Filtres sources
  const sourcePanel = document.getElementById('source-filter-panel');
  if (sourcePanel) renderSourceFilterPanel(sourcePanel);

  // Compteurs par niveau
  const countersEl = document.getElementById('spell-prep-counters');
  if (countersEl) {
    const slotsPerDay = clericLvl > 0 ? getClericSlotsPerDay(clericLvl, wisMod) : [];  // ← rules.js
    const prepCounts  = getPrepCountByLevel();                                           // ← rules.js
    let html = '<span class="cinzel small text-dim" style="margin-right:8px;letter-spacing:1px;">PRÉP.</span>';
    slotsPerDay.forEach((total, lvl) => {
      if (total === 0 && lvl > 0) return;
      const prepared = prepCounts[lvl] || 0;
      const over     = prepared > total;
      const label    = lvl === 0 ? 'Ora.' : `Nv${lvl}`;
      html += `<div style="
        padding:4px 10px;border-radius:4px;font-size:12px;font-family:'Cinzel',serif;
        background:${over ? 'rgba(200,60,40,0.2)' : 'var(--bg4)'};
        border:1px solid ${over ? 'var(--red)' : 'var(--border)'};
        color:${over ? 'var(--red)' : prepared > 0 ? 'var(--gold)' : 'var(--text-dim)'};
        display:flex;flex-direction:column;align-items:center;gap:1px;cursor:default;"
        title="${over ? '⚠ Dépassement — '+prepared+'/'+total+' préparés' : prepared+'/'+total+' préparés'}">
        <span>${label}</span>
        <span style="font-size:11px;${over ? 'color:var(--red)' : ''}">${prepared}/${total}${over ? ' ⚠' : ''}</span>
      </div>`;
    });
    if (!slotsPerDay.length) html += '<span class="small text-dim">Ajoutez des niveaux de lanceur pour voir les compteurs</span>';
    countersEl.innerHTML = html;
  }

  // Emplacements / Jour
  const slotsPanel = document.getElementById('spell-slots-panel');
  if (slotsPanel) {
    slotsPanel.innerHTML = '';
    if (clericLvl > 0) {
      const slotsPerDay = getClericSlotsPerDay(clericLvl, wisMod);  // ← rules.js
      slotsPanel.innerHTML = `<div class="small text-dim mb-8">Clerc niv.${clericLvl} · SAG ${wisTotal} (mod ${wisMod >= 0 ? '+' : ''}${wisMod})</div>`;
      slotsPerDay.forEach((total, lvl) => {
        if (total === 0 && lvl > 0) return;
        const used  = AppState.spellSlotUsage[lvl] || 0;
        const label = lvl === 0 ? t('lbl_cantrips') : `Niveau ${lvl}`;
        const dc    = lvl === 0 ? '—' : `DC ${getSpellDC(lvl, 'WIS')}`;  // ← rules.js
        const dots  = Array(total).fill(0).map((_, i) =>
          `<div class="spell-slot ${i < used ? 'used' : 'available'}" onclick="toggleSpellSlotUsage(${lvl},${i})" style="cursor:pointer;"></div>`
        ).join('');
        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom:10px;';
        row.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span class="cinzel small" style="color:${LEVEL_COLORS[lvl]};letter-spacing:1px;">${label}</span>
            <span class="small text-dim">${dc} · <strong style="color:var(--text-bright)">${total - used}</strong>/${total}</span>
          </div>
          <div style="display:flex;gap:3px;flex-wrap:wrap;">${dots}</div>`;
        slotsPanel.appendChild(row);
      });
    } else {
      slotsPanel.innerHTML = '<div class="small text-dim">Pas de niveau clerc.</div>';
    }
  }

  // Stats SAG / DC
  const statsPanel = document.getElementById('spell-stats-panel');
  if (statsPanel) {
    const learnedByLevel = {};
    AppState.spells.filter(s => !s.isCustom).forEach(s => {
      const lvl = s.dbId ? (_getSpell(s.dbId)?.level?.cleric ?? s.level) : (s.level ?? 0);
      learnedByLevel[lvl] = (learnedByLevel[lvl] || 0) + 1;
    });
    const slotsPerDay = clericLvl > 0 ? getClericSlotsPerDay(clericLvl, wisMod) : [];
    statsPanel.innerHTML = `
      <div class="flex-between mb-8">
        <span class="text-dim small">${t('lbl_caster_level')}</span><span class="text-bright bold">${casterLevel}</span>
      </div>
      <div class="flex-between mb-8">
        <span class="text-dim small">${t('lbl_spells_panel')}</span><span class="text-bright bold">${AppState.spells.length}</span>
      </div>
      ${slotsPerDay.length ? `
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <thead><tr style="border-bottom:1px solid var(--border);">
          <th class="cinzel small text-dim" style="padding:2px 4px;text-align:left;font-size:10px;">NV</th>
          <th class="cinzel small text-dim" style="padding:2px 4px;text-align:center;font-size:10px;">SAG</th>
          <th class="cinzel small text-dim" style="padding:2px 4px;text-align:center;font-size:10px;">SLOTS</th>
          <th class="cinzel small text-dim" style="padding:2px 4px;text-align:center;font-size:10px;">SEL.</th>
          <th class="cinzel small text-dim" style="padding:2px 4px;text-align:center;font-size:10px;">DC</th>
        </tr></thead>
        <tbody>${slotsPerDay.map((slots, lvl) => {
          if (slots === 0 && lvl > 0) return '';
          const sagMin = lvl === 0 ? 0 : 10 + lvl;
          const ok  = wisTotal >= sagMin || lvl === 0;
          const sel = learnedByLevel[lvl] || 0;
          const dc  = lvl === 0 ? '—' : `${getSpellDC(lvl, 'WIS')}`;  // ← rules.js
          return `<tr>
            <td class="cinzel small" style="color:${LEVEL_COLORS[lvl]};padding:2px 4px;">${lvl}</td>
            <td style="padding:2px 4px;text-align:center;" class="${ok?'text-green':'text-red'}">${ok?'✓':`${sagMin}`}</td>
            <td style="padding:2px 4px;text-align:center;" class="text-bright bold">${slots}</td>
            <td style="padding:2px 4px;text-align:center;" class="${sel>0?'text-gold':'text-dim'}">${sel}</td>
            <td style="padding:2px 4px;text-align:center;" class="text-dim small">${dc}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>` : ''}`;
  }

  // Titre bibliothèque
  const libTitle = document.getElementById('spell-lib-title');
  if (libTitle) {
    const classNames = Object.keys(classLevels).map(c => CLASS_REF[c]?.name || c).join(', ');
    libTitle.textContent = `BIBLIOTHÈQUE — ${classNames || 'Choisissez une classe'}`;
  }

  // Restore persisted filters from AppState before rendering the list
  const sf = AppState.spellFilters || {};
  const lvlEl    = document.getElementById('spell-filter-level');
  const schoolEl = document.getElementById('spell-filter-school');
  const selEl    = document.getElementById('spell-filter-selected');
  if (lvlEl    && sf.level    !== undefined) lvlEl.value      = sf.level;
  if (schoolEl && sf.school   !== undefined) schoolEl.value   = sf.school;
  if (selEl    && sf.selectedOnly !== undefined) selEl.checked = sf.selectedOnly;
  // spell-filter-class is injected dynamically by renderSpellList; restore after injection
  // by passing the stored value via a flag read in renderSpellList
  AppState.spellFilters._pendingClass = sf.class || '';

  renderSpellList();
}

// ── Source filter panel ──────────────────────────────────────

function renderSourceFilterPanel(panel) {
  const filters = AppState.sourceFilters;
  panel.innerHTML = '';
  Object.entries(SOURCE_REGISTRY).forEach(([typeKey, registry]) => {
    const enabled = filters[typeKey] !== false;
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom:10px;';
    const header = document.createElement('label');
    header.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;margin-bottom:4px;';
    header.innerHTML = `
      <input type="checkbox" ${enabled ? 'checked' : ''} onchange="toggleSourceType('${typeKey}', this.checked)">
      <span style="font-size:10px;background:${registry.bg};color:${registry.color};border:1px solid ${registry.border};border-radius:3px;padding:1px 5px;font-family:'Cinzel',serif;">${registry.icon} ${registry.labelShort.toUpperCase()}</span>
      <span class="small text-dim" style="font-size:11px;">${registry.label}</span>`;
    const bookList = document.createElement('div');
    bookList.style.cssText = `padding-left:18px;${enabled ? '' : 'opacity:0.4;pointer-events:none;'}`;
    bookList.id = `src-books-${typeKey}`;
    Object.entries(registry.sources).forEach(([bookKey, book]) => {
      const bookEnabled = filters[`${typeKey}_${bookKey}`] !== false;
      const bookCount = Object.values(SPELL_DB).filter(s => s.source_type === typeKey && s.source_abbr === bookKey).length;
      if (bookCount === 0 && typeKey !== 'custom') return;
      const bookLabel = document.createElement('label');
      bookLabel.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;margin-bottom:2px;';
      bookLabel.innerHTML = `
        <input type="checkbox" ${bookEnabled ? 'checked' : ''} onchange="toggleSourceBook('${typeKey}', '${bookKey}', this.checked)">
        <span style="background:var(--bg4);color:var(--text-dim);border:1px solid var(--border);border-radius:2px;padding:0px 4px;font-size:10px;font-family:'Cinzel',serif;">${book.abbr}</span>
        <span class="small text-dim" style="font-size:11px;">${book.name.length > 22 ? book.name.slice(0,22)+'…' : book.name}</span>
        ${bookCount > 0 ? `<span class="small text-dim" style="font-size:10px;margin-left:auto;">${bookCount}</span>` : ''}`;
      bookList.appendChild(bookLabel);
    });
    section.appendChild(header);
    section.appendChild(bookList);
    panel.appendChild(section);
  });
}

function toggleSourceType(typeKey, enabled) {
  AppState.sourceFilters[typeKey] = enabled;
  const bookList = document.getElementById(`src-books-${typeKey}`);
  if (bookList) { bookList.style.opacity = enabled ? '1' : '0.4'; bookList.style.pointerEvents = enabled ? '' : 'none'; }
  renderSpellList();
  const counters = document.getElementById('spell-prep-counters');
  if (counters) renderSpells();
}

function toggleSourceBook(typeKey, bookKey, enabled) {
  AppState.sourceFilters[`${typeKey}_${bookKey}`] = enabled;
  renderSpellList();
}

function toggleAllSources() {
  const allOn = Object.values(AppState.sourceFilters).every(v => v !== false);
  Object.keys(SOURCE_REGISTRY).forEach(k => {
    AppState.sourceFilters[k] = allOn ? false : true;
    Object.keys(SOURCE_REGISTRY[k].sources).forEach(bk => {
      AppState.sourceFilters[`${k}_${bk}`] = allOn ? false : true;
    });
  });
  if (allOn) AppState.sourceFilters.official = true;
  renderSpells();
}


// ═══════════════════════════════════════════════════════════
// SECTION 8 — Render : Bibliothèque
// ═══════════════════════════════════════════════════════════

function renderSpellList() {
  const container = document.getElementById('spell-list-container');
  if (!container) return;

  // Inject class filter if not yet present
  const schoolSel = document.getElementById('spell-filter-school');
  if (schoolSel && !document.getElementById('spell-filter-class')) {
    const classSelect = document.createElement('select');
    classSelect.id = 'spell-filter-class';
    classSelect.style.cssText = 'width:130px;font-size:12px;';
    classSelect.onchange = renderSpellList;
    const classOpts = [
      {v:'', l:'Toutes classes'},
      {v:'cleric', l:'Clerc'},
      {v:'wizard', l:'Magicien'},
      {v:'sorcerer', l:'Ensorceleur'},
      {v:'druid', l:'Druide'},
      {v:'bard', l:'Barde'},
      {v:'paladin', l:'Paladin'},
      {v:'ranger', l:'Rôdeur'},
    ];
    classOpts.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.v; opt.textContent = o.l;
      classSelect.appendChild(opt);
    });
    schoolSel.parentNode.insertBefore(classSelect, schoolSel.nextSibling);
    // Restore persisted class filter after injection
    const pending = AppState.spellFilters?._pendingClass || '';
    if (pending) classSelect.value = pending;
  }

  const search      = (document.getElementById('spell-search')?.value || '').toLowerCase();
  const lvlFilter   = document.getElementById('spell-filter-level')?.value;
  const schoolFilter = document.getElementById('spell-filter-school')?.value;
  const classFilter  = document.getElementById('spell-filter-class')?.value || '';
  const selectedOnly = document.getElementById('spell-filter-selected')?.checked;

  // Persist filters to AppState so they survive tab switches
  if (!AppState.spellFilters) AppState.spellFilters = {};
  AppState.spellFilters.level        = lvlFilter   || '';
  AppState.spellFilters.school       = schoolFilter || '';
  AppState.spellFilters.class        = classFilter;
  AppState.spellFilters.selectedOnly = !!selectedOnly;

  const allSpells = getFilteredSpellDB();  // ← rules.js

  // Classes du personnage (pour le tag visuel "hors classe")
  const charClassKeys = AppState.levels
    .map(l => l.classId.replace('class_', ''))
    .filter((v, i, a) => a.indexOf(v) === i);

  let shown = allSpells.filter(sp => {
    const spLevel = getSpellLevelForChar(sp);  // ← rules.js
    if (lvlFilter !== '' && lvlFilter !== undefined && parseInt(lvlFilter) !== spLevel) return false;
    if (schoolFilter && sp.school !== schoolFilter) return false;
    // Filter by class
    if (classFilter) {
      const spClasses = sp.classes || sp.level || {};
      if (spClasses[classFilter] === undefined) return false;
    }
    if (search) {
      const nameEn = (sp.name || '').toLowerCase();
      const nameFr = getSpellNameFr(sp.id || sp.dbId || '').toLowerCase();
      const desc   = (sp.desc || '').toLowerCase();
      if (!nameEn.includes(search) && !nameFr.includes(search) && !desc.includes(search)) return false;
    }
    const isSelected = AppState.spells.some(s => s.dbId === sp.id || s.id === sp.id);
    if (selectedOnly && !isSelected) return false;
    return true;
  });

  shown.sort((a, b) => {
    const la = getSpellLevelForChar(a), lb = getSpellLevelForChar(b);
    return la - lb || (a.name || '').localeCompare(b.name || '');
  });

  const libCount = document.getElementById('spell-lib-count');
  if (libCount) libCount.textContent = `${shown.length} sorts`;

  container.innerHTML = '';
  if (shown.length === 0) {
    container.innerHTML = `<div class="text-dim small text-center" style="padding:30px;">
      Aucun sort correspondant.<br><span style="font-style:italic;">Vérifiez les filtres sources ou la recherche.</span>
    </div>`;
    return;
  }

  const byLevel = {};
  shown.forEach(sp => {
    const lvl = getSpellLevelForChar(sp);
    (byLevel[lvl] = byLevel[lvl] || []).push(sp);
  });

  Object.keys(byLevel).sort((a, b) => +a - +b).forEach(lvl => {
    const hdr = document.createElement('div');
    hdr.style.cssText = `
      display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:6px;margin-top:10px;
      background:var(--bg3);border-left:3px solid ${LEVEL_COLORS[lvl]||'#888'};
      border-radius:0 4px 4px 0;position:sticky;top:0;z-index:1;`;
    const lvlLabel = +lvl === 0 ? 'ORAISONS' : `NIVEAU ${lvl}`;
    hdr.innerHTML = `
      <span class="cinzel" style="color:${LEVEL_COLORS[lvl]};font-size:12px;letter-spacing:2px;">${lvlLabel}</span>
      <span class="small text-dim">${byLevel[lvl].length} sort${byLevel[lvl].length > 1 ? 's' : ''}</span>`;
    container.appendChild(hdr);
    byLevel[lvl].forEach(sp => container.appendChild(buildSpellLibraryCard(sp)));
  });
}

function buildSpellLibraryCard(sp) {
  const spId      = sp.id;
  const spLevel   = getSpellLevelForChar(sp);  // ← rules.js
  const isSelected = AppState.spells.some(s => s.dbId === spId || s.id === spId);
  const prepCount = AppState.preparedSpells.filter(p => p.dbId === spId || p.id === spId).length;
  const srcMeta   = getSourceMeta(sp);          // ← rules.js
  const classTags = getSpellClassTags(sp);       // ← rules.js
  const nameFr    = getSpellNameFr(spId);
  // Determine if this spell belongs to any of the character's classes
  const charClassIds = AppState.levels.map(l => l.classId.replace('class_', '')).filter((v,i,a)=>a.indexOf(v)===i);
  const spClasses = sp.classes || sp.level || {};
  const isInCharClass = charClassIds.length === 0 || charClassIds.some(cls => spClasses[cls] !== undefined);

  const card = document.createElement('div');
  card.style.cssText = `
    display:flex;align-items:flex-start;gap:10px;padding:10px 12px;margin-bottom:6px;
    border:1px solid ${isSelected ? 'var(--gold-dim)' : 'var(--border)'};
    background:${isSelected ? 'rgba(180,140,60,0.07)' : 'var(--bg3)'};
    border-radius:5px;transition:border-color 0.15s;`;
  card.onmouseenter = () => { card.style.borderColor = 'var(--gold-dim)'; };
  card.onmouseleave = () => { card.style.borderColor = isSelected ? 'var(--gold-dim)' : 'var(--border)'; };

  const lvlBubble = document.createElement('div');
  lvlBubble.style.cssText = `
    width:28px;height:28px;border-radius:50%;flex-shrink:0;margin-top:2px;
    background:${LEVEL_COLORS[spLevel]||'#888'}22;color:${LEVEL_COLORS[spLevel]||'#888'};
    border:1px solid ${LEVEL_COLORS[spLevel]||'#888'}44;
    display:flex;align-items:center;justify-content:center;
    font-family:'Cinzel',serif;font-size:12px;font-weight:700;`;
  lvlBubble.textContent = spLevel;

  const info = document.createElement('div');
  info.style.cssText = 'flex:1;min-width:0;';

  const classTagsHtml = classTags.map(ct =>
    `<span style="background:${ct.color}22;color:${ct.color};border:1px solid ${ct.color}44;border-radius:3px;padding:0px 4px;font-size:10px;font-family:'Cinzel',serif;" title="${ct.cls} nv${ct.lvl}">${ct.label}${ct.lvl}</span>`
  ).join('');

  info.innerHTML = `
    <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px;">
      <span style="font-size:13px;color:${isSelected?'var(--gold-light)':'var(--text-bright)'};font-family:'Cinzel',serif;font-weight:600;">${sp.name}</span>
      <span style="background:${srcMeta.bg};color:${srcMeta.color};border:1px solid ${srcMeta.border};border-radius:3px;padding:0px 5px;font-size:10px;font-family:'Cinzel',serif;">${srcMeta.abbr||'PHB'}</span>
      ${classTagsHtml}
      ${!isInCharClass ? '<span style="background:rgba(180,60,60,0.15);color:var(--red);border:1px solid rgba(180,60,60,0.4);border-radius:3px;padding:0px 5px;font-size:10px;" title="Sort hors classe du personnage">⚠ hors classe</span>' : ''}
    </div>
    ${nameFr ? `<div style="margin-bottom:3px;"><span style="font-size:11px;color:var(--gold-dim);font-style:italic;">⟶ ${nameFr}</span></div>` : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
      <span class="small text-dim">${sp.school||'—'}</span>
      <span class="small text-dim">•</span>
      <span class="small text-dim">Comp. ${(sp.comp||[]).join(',')}</span>
      <span class="small text-dim">•</span>
      <span class="small text-dim">⏱ ${sp.duration||'—'}</span>
      ${sp.save && sp.save !== 'None' ? `<span class="small text-dim">• JS: ${sp.save}</span>` : ''}
      ${sp.sr === 'Yes' ? '<span class="small text-dim">• RM: Oui</span>' : ''}
    </div>
    <div style="font-size:12px;color:var(--text-dim);font-style:italic;line-height:1.4;">${(sp.desc||'').length>100?(sp.desc||'').slice(0,100)+'…':(sp.desc||'')}</div>`;

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-direction:column;gap:4px;flex-shrink:0;align-items:flex-end;';

  if (isSelected) {
    const prepBtn = document.createElement('button');
    prepBtn.className = 'btn btn-primary btn-small';
    prepBtn.innerHTML = '📋 Préparer';
    prepBtn.onclick   = () => openPrepareModal(spId);

    const prepInfo = document.createElement('div');
    prepInfo.style.cssText = 'font-size:11px;text-align:center;';
    prepInfo.innerHTML = prepCount > 0
      ? `<span style="color:var(--gold);">✓ ${prepCount}×</span>`
      : '<span class="text-dim">Non préparé</span>';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-secondary btn-small';
    removeBtn.innerHTML = '✕ Retirer';
    removeBtn.onclick   = () => { removeSpellFromChar(spId); renderSpells(); };

    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn btn-secondary btn-small';
    infoBtn.style.fontSize = '10px';
    infoBtn.innerHTML = 'ℹ️ Détails';
    infoBtn.onclick   = () => showSpellSourceInfo(spId);

    actions.appendChild(prepBtn);
    actions.appendChild(prepInfo);
    actions.appendChild(infoBtn);
    actions.appendChild(removeBtn);
  } else {
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-secondary btn-small';
    addBtn.innerHTML = '+ Ajouter';
    addBtn.title     = 'Ajouter aux sorts connus du personnage';
    addBtn.onclick   = () => addSpellFromDB(spId);

    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn btn-secondary btn-small';
    infoBtn.style.fontSize = '10px';
    infoBtn.innerHTML = 'ℹ️';
    infoBtn.onclick   = () => showSpellSourceInfo(spId);

    actions.appendChild(addBtn);
    actions.appendChild(infoBtn);
  }

  card.appendChild(lvlBubble);
  card.appendChild(info);
  card.appendChild(actions);
  return card;
}


// ═══════════════════════════════════════════════════════════
// SECTION 9 — Render : Modal préparation
// ═══════════════════════════════════════════════════════════

function openPrepareModal(spellId) {
  const sp = _getSpell(spellId);
  if (!sp) return;

  const spLevel     = getSpellLevelForChar(sp);  // ← rules.js
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const clericLvl   = classLevels['class_cleric'] || 0;
  const wisMod      = getMod('WIS');              // ← rules.js
  const slotsPerDay = clericLvl > 0 ? getClericSlotsPerDay(clericLvl, wisMod) : [];  // ← rules.js
  const turnInfo    = getTurnUndeadInfo();         // ← rules.js
  const prepCount   = AppState.preparedSpells.filter(p => p.dbId === spellId).length;
  const MM_OPTIONS  = _getMetamagicOptions();

  const slotOptions = slotsPerDay.map((total, lvl) => {
    if (lvl < spLevel || total === 0) return null;
    const usedByPrep = AppState.preparedSpells.filter(p => p.preparedLevel === lvl && p.state === 'prepared').length;
    const usedByCast = AppState.spellSlotUsage[lvl] || 0;
    const free       = total - usedByPrep - usedByCast;
    return { lvl, total, free };
  }).filter(Boolean);

  let modal = document.getElementById('prepare-spell-modal');
  if (!modal) {
    modal           = document.createElement('div');
    modal.id        = 'prepare-spell-modal';
    modal.className = 'modal-overlay';
    modal.onclick   = e => { if (e.target === modal) modal.classList.add('hidden'); };
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width:540px;">
      <div class="modal-header">
        <span class="modal-title cinzel">📋 Préparer — ${sp.name}${getSpellNameFr(spellId) ? ` <span style="font-size:12px;color:var(--gold-dim);font-style:italic;">· ${getSpellNameFr(spellId)}</span>` : ''}</span>
        <button class="modal-close" onclick="document.getElementById('prepare-spell-modal').classList.add('hidden')">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:10px;margin-bottom:14px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="cinzel" style="color:var(--gold-light);">${sp.name}</span>
            <span class="small text-dim">Nv${spLevel} · ${sp.school}</span>
            <span class="small text-dim">⏱ ${sp.duration}</span>
          </div>
          <div class="small text-dim" style="margin-top:6px;font-style:italic;">${(sp.desc||'').slice(0,120)}…</div>
          ${prepCount > 0 ? `<div class="small" style="color:var(--gold);margin-top:4px;">✓ Déjà préparé ${prepCount}× aujourd'hui</div>` : ''}
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label class="form-label">Mode de préparation</label>
          <div style="display:flex;gap:8px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;flex:1;border:1px solid var(--border);border-radius:4px;padding:8px;background:var(--bg3);">
              <input type="radio" name="mm-mode" value="normal" checked onchange="updatePrepModal()">
              <div><div class="small text-bright">Standard</div><div style="font-size:10px;color:var(--text-dim);">Métamagie → augmente le slot</div></div>
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;flex:1;border:1px solid var(--gold-dim);border-radius:4px;padding:8px;background:rgba(180,140,60,0.06);${turnInfo.total === 0 ? 'opacity:0.4;pointer-events:none;' : ''}">
              <input type="radio" name="mm-mode" value="divine" onchange="updatePrepModal()" ${turnInfo.total === 0 ? 'disabled' : ''}>
              <div>
                <div class="small" style="color:var(--gold);">✨ Divine Métamagie</div>
                <div style="font-size:10px;color:var(--text-dim);">Métamagie → dépense des renvois</div>
                <div style="font-size:10px;color:var(--gold-dim);">Renvois : ${turnInfo.available}/${turnInfo.total} disponibles</div>
              </div>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Dons de Métamagie</label>
          ${MM_OPTIONS.length === 0 ? `
            <div style="padding:10px;background:var(--bg4);border-radius:4px;border:1px solid var(--border);text-align:center;">
              <div class="small text-dim">Aucun don de métamagie sélectionné.</div>
              <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">Ajoutez des dons de métamagie dans <strong>BUILD → Dons</strong>.</div>
            </div>` : `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;" id="prep-metamagic-list">
            ${MM_OPTIONS.map(mm => `
              <label style="display:flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:4px;padding:6px 8px;cursor:pointer;background:var(--bg3);">
                <input type="checkbox" name="prep-mm" value="${mm.id}" data-cost="${mm.cost}" onchange="updatePrepModal()">
                <div>
                  <div class="small" style="color:var(--text-bright);">${mm.name}</div>
                  <div style="font-size:10px;color:var(--text-dim);">${mm.cost > 0 ? '+'+mm.cost+' niv.' : 'variable'} · ${mm.desc}</div>
                </div>
              </label>`).join('')}
          </div>`}
        </div>
        <div id="heighten-section" class="form-group hidden">
          <label class="form-label">Niveau cible (Heighten Spell)</label>
          <select id="heighten-target-level" onchange="updatePrepModal()" style="width:100%;">
            ${[1,2,3,4,5,6,7,8,9].filter(l => l > spLevel).map(l => `<option value="${l}">Niveau ${l}</option>`).join('')}
          </select>
        </div>
        <div id="slot-select-section" class="form-group">
          <label class="form-label">Emplacement utilisé</label>
          <select id="prep-slot-level" onchange="updatePrepModal()" style="width:100%;">
            ${slotOptions.map(s => `
              <option value="${s.lvl}" ${s.lvl === spLevel ? 'selected' : ''} style="${s.free <= 0 ? 'color:var(--red)' : ''}">
                Niveau ${s.lvl} — ${s.free}/${s.total} libres${s.free <= 0 ? ' ⚠ Plein' : ''}
              </option>`).join('')}
          </select>
        </div>
        <div id="prep-summary" style="margin-top:10px;padding:10px;background:var(--bg4);border-radius:4px;border:1px solid var(--border);min-height:60px;">
          <div class="cinzel small text-dim" style="margin-bottom:4px;">RÉSUMÉ DE PRÉPARATION</div>
          <div id="prep-summary-text" class="small text-bright"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px;">
          <button class="btn btn-primary" style="flex:1;" id="btn-confirm-prepare" onclick="confirmPrepareSpell('${spellId}')">✓ Préparer ce sort</button>
          <button class="btn btn-secondary" onclick="document.getElementById('prepare-spell-modal').classList.add('hidden')">Annuler</button>
        </div>
      </div>
    </div>`;

  modal.classList.remove('hidden');
  modal._prepContext = { spellId, spLevel, slotsPerDay, turnInfo, slotOptions };
  setTimeout(() => updatePrepModal(), 20);
}

function updatePrepModal() {
  const modal = document.getElementById('prepare-spell-modal');
  if (!modal?._prepContext) return;
  const { spellId, spLevel, slotsPerDay, turnInfo, slotOptions } = modal._prepContext;
  const sp = _getSpell(spellId);
  if (!sp) return;

  const isDivine    = document.querySelector('input[name="mm-mode"]:checked')?.value === 'divine';
  const checkedMMs  = [...document.querySelectorAll('input[name="prep-mm"]:checked')];
  const mmCostTotal = checkedMMs.reduce((s, i) => s + parseInt(i.dataset.cost || 0), 0);
  const mmNames     = checkedMMs.map(i => i.closest('label').querySelector('.small').textContent.trim());
  const hasPersist  = checkedMMs.some(i => i.value === 'persist');
  const hasHeighten = checkedMMs.some(i => i.value === 'heighten');
  const heightenTarget = hasHeighten
    ? parseInt(document.getElementById('heighten-target-level')?.value || (spLevel + 1))
    : 0;

  document.getElementById('heighten-section')?.classList.toggle('hidden', !hasHeighten);

  const effectiveCost = hasHeighten ? Math.max(mmCostTotal, heightenTarget - spLevel) : mmCostTotal;
  const finalSlot     = isDivine ? spLevel : Math.min(9, spLevel + effectiveCost);

  const slotSelect = document.getElementById('prep-slot-level');
  if (slotSelect && !isDivine) {
    [...slotSelect.options].forEach(opt => {
      const lvl = parseInt(opt.value);
      opt.selected   = (lvl === finalSlot);
      opt.style.fontWeight = lvl === finalSlot ? 'bold' : '';
    });
  }

  const summaryEl  = document.getElementById('prep-summary-text');
  const btnConfirm = document.getElementById('btn-confirm-prepare');
  if (!summaryEl) return;

  let valid = true, summaryHtml = '';
  if (isDivine) {
    const canAfford = effectiveCost <= turnInfo.available;
    valid = canAfford;
    summaryHtml = `
      <div><span style="color:var(--gold);">${sp.name}</span> préparé en slot <strong>Nv${spLevel}</strong></div>
      ${mmNames.length ? `<div style="color:var(--text-dim);">Avec : ${mmNames.join(', ')}</div>` : ''}
      <div style="color:${canAfford?'var(--gold-dim)':'var(--red)'};margin-top:4px;">
        ✨ Divine Métamagie — Renvois dépensés : <strong>${effectiveCost}</strong> / disponibles : <strong>${turnInfo.available}</strong>
        ${!canAfford ? ' <span style="color:var(--red);">⚠ Insuffisant !</span>' : ''}
      </div>
      ${hasPersist ? '<div style="color:var(--green);margin-top:2px;">⏳ Sort PERSISTANT — durée 24 heures</div>' : ''}`;
  } else {
    const slotFree = slotOptions.find(s => s.lvl === finalSlot)?.free ?? 0;
    valid = slotFree > 0;
    summaryHtml = `
      <div><span style="color:var(--gold);">${sp.name}</span> préparé en slot <strong>Nv${finalSlot}</strong></div>
      ${mmNames.length ? `<div style="color:var(--text-dim);">Métamagie : ${mmNames.join(', ')} (+${effectiveCost} niveau${effectiveCost>1?'x':''})</div>` : ''}
      ${!valid ? '<div style="color:var(--red);">⚠ Aucun emplacement libre à ce niveau !</div>' : ''}
      ${hasPersist ? '<div style="color:var(--green);margin-top:2px;">⏳ Sort PERSISTANT — durée 24 heures</div>' : ''}`;
  }
  summaryEl.innerHTML = summaryHtml;
  if (btnConfirm) btnConfirm.disabled = !valid;
}

function confirmPrepareSpell(spellId) {
  const sp = _getSpell(spellId);
  if (!sp) return;
  const spLevel = getSpellLevelForChar(sp);  // ← rules.js

  const isDivine    = document.querySelector('input[name="mm-mode"]:checked')?.value === 'divine';
  const checkedMMs  = [...document.querySelectorAll('input[name="prep-mm"]:checked')];
  const mmList      = checkedMMs.map(i => i.value);
  const mmCostTotal = checkedMMs.reduce((s, i) => s + parseInt(i.dataset.cost || 0), 0);
  const hasHeighten = mmList.includes('heighten');
  const heightenTarget = hasHeighten
    ? parseInt(document.getElementById('heighten-target-level')?.value || spLevel + 1)
    : 0;
  const effectiveCost  = hasHeighten ? Math.max(mmCostTotal, heightenTarget - spLevel) : mmCostTotal;
  const isPersistent   = mmList.includes('persist');
  const finalSlotLevel = isDivine ? spLevel : Math.min(9, spLevel + effectiveCost);

  // Divine Metamagic : déduire des charges de renvoi
  if (isDivine && effectiveCost > 0) {
    if (!AppState.abilityStates) AppState.abilityStates = {};
    const key = 'ca_charges_ca_turn_undead';
    AppState.abilityStates[key] = (AppState.abilityStates[key] || 0) + effectiveCost;
  }

  const ps = _makePreparedSpell(spellId, {
    baseLevel:           spLevel,
    preparedLevel:       finalSlotLevel,
    metamagic:           mmList,
    metamagicCost:       effectiveCost,
    metamagicMode:       isDivine ? 'divine_metamagic' : 'normal',
    divineMetamagicUsed: isDivine ? effectiveCost : 0,
    turnUndeadSpent:     isDivine ? effectiveCost : 0,
    isPersistent,
  });
  if (ps) AppState.preparedSpells.push(ps);

  document.getElementById('prepare-spell-modal')?.classList.add('hidden');
  renderSpells();
}

function openPrepareAllModal() {
  const count = AppState.preparedSpells.length;
  if (count === 0) { alert('Aucun sort préparé. Cliquez "Préparer" sur les sorts de votre choix.'); return; }
  if (confirm(`${count} sort(s) préparé(s). Envoyer au Grimoire pour jouer ?`)) showTab('grimoire');
}


// ═══════════════════════════════════════════════════════════
// SECTION 10 — Render : Grimoire
// ═══════════════════════════════════════════════════════════

function renderGrimoire() {
  const wisMod = getMod('WIS');  // ← rules.js
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const clericLvl = classLevels['class_cleric'] || 0;

  const slotsPanel = document.getElementById('grimoire-slots-panel');
  if (slotsPanel) {
    slotsPanel.innerHTML = '';
    if (clericLvl > 0) {
      const slotsPerDay = getClericSlotsPerDay(clericLvl, wisMod);  // ← rules.js
      const usedByLevel = {};
      AppState.preparedSpells.filter(p => p.state === 'cast').forEach(p => {
        const lvl = p.preparedLevel ?? p.baseLevel ?? 0;
        usedByLevel[lvl] = (usedByLevel[lvl] || 0) + 1;
      });

      slotsPerDay.forEach((total, lvl) => {
        if (total === 0 && lvl > 0) return;
        const used  = usedByLevel[lvl] || 0;
        const free  = total - used;
        const label = lvl === 0 ? t('lbl_cantrips') : `Nv ${lvl}`;
        const dc    = lvl === 0 ? '—' : `DC ${getSpellDC(lvl, 'WIS')}`;  // ← rules.js
        const dots  = Array(total).fill(0).map((_, i) => {
          const isUsed = i < used;
          return `<div class="spell-slot ${isUsed?'used':'available'}" style="cursor:pointer;" title="${isUsed?'Utilisé':'Disponible'}" onclick="toggleGrimoireSlot(${lvl},${i})"></div>`;
        }).join('');
        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom:12px;';
        row.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span class="cinzel small" style="color:${LEVEL_COLORS[lvl]};letter-spacing:1px;">${label}</span>
            <span class="small"><strong style="color:var(--text-bright)">${free}</strong><span class="text-dim">/${total}</span></span>
          </div>
          <div style="display:flex;gap:3px;flex-wrap:wrap;">${dots}</div>
          <div class="small text-dim" style="margin-top:2px;text-align:right;">${dc}</div>`;
        slotsPanel.appendChild(row);
      });

      const totalSlots = slotsPerDay.reduce((s, v) => s + v, 0);
      const totalUsed  = Object.values(usedByLevel).reduce((s, v) => s + v, 0);
      const recap = document.createElement('div');
      recap.style.cssText = 'border-top:1px solid var(--border);padding-top:8px;margin-top:4px;';
      recap.innerHTML = `<div class="flex-between small"><span class="text-dim">Total utilisés</span><span class="text-bright"><strong>${totalUsed}</strong>/${totalSlots}</span></div>`;
      slotsPanel.appendChild(recap);
    } else {
      slotsPanel.innerHTML = '<div class="text-dim small">Pas de classe de lanceur.</div>';
    }
  }

  renderGrimoirePrepared();
}

function renderGrimoirePrepared() {
  const panel   = document.getElementById('grimoire-prepared-panel');
  const countEl = document.getElementById('grimoire-prepared-count');
  if (!panel) return;

  // Migration LEGACY spellbook → preparedSpells
  if (AppState.spellbook.length > 0 && AppState.preparedSpells.length === 0) {
    AppState.spellbook.forEach(entry => {
      const sp = _getSpell(entry.spellId);
      AppState.preparedSpells.push({
        id:                  entry.id,
        dbId:                entry.spellId,
        name:                entry.spellName || sp?.name || entry.spellId,
        baseLevel:           entry.slotLevel,
        preparedLevel:       entry.slotLevel,
        metamagic:           [],
        divineMetamagicUsed: 0,
        state:               entry.used ? 'cast' : 'prepared',
      });
    });
    AppState.spellbook = [];
  }

  const stateFilter = document.getElementById('grimoire-filter-state')?.value || '';
  const prepared    = AppState.preparedSpells.filter(p => !stateFilter || p.state === stateFilter);
  const available   = AppState.preparedSpells.filter(p => p.state === 'prepared').length;
  const castCount   = AppState.preparedSpells.filter(p => p.state === 'cast').length;
  const activeCount = AppState.preparedSpells.filter(p => p.state === 'active').length;

  if (countEl) {
    countEl.innerHTML = `
      <span style="color:var(--green);font-size:12px;margin-right:8px;">✓ ${available} disponibles</span>
      <span style="color:var(--text-dim);font-size:12px;margin-right:8px;">⊘ ${castCount} lancés</span>
      ${activeCount > 0 ? `<span style="color:var(--gold);font-size:12px;">⚡ ${activeCount} actifs</span>` : ''}`;
  }

  panel.innerHTML = '';

  if (AppState.preparedSpells.length === 0) {
    panel.innerHTML = `<div class="small text-dim text-center" style="padding:40px;">
      <div style="font-size:32px;margin-bottom:12px;">📋</div>
      Aucun sort préparé.<br><span style="font-style:italic;">Préparez des sorts dans l'onglet <strong>PRÉPARATION</strong>.</span><br>
      <button class="btn btn-primary btn-small mt-12" onclick="showTab('spells')">→ Préparer des sorts</button>
    </div>`;
    return;
  }

  if (prepared.length === 0) {
    panel.innerHTML = '<div class="small text-dim text-center" style="padding:20px;">Aucun sort correspondant au filtre.</div>';
    return;
  }

  const byLevel = {};
  prepared.forEach(p => {
    const lvl = p.preparedLevel ?? p.baseLevel ?? 0;
    (byLevel[lvl] = byLevel[lvl] || []).push(p);
  });

  Object.keys(byLevel).sort((a, b) => +a - +b).forEach(lvl => {
    const hdr = document.createElement('div');
    hdr.style.cssText = `
      display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:6px;
      background:var(--bg3);border-left:3px solid ${LEVEL_COLORS[lvl]||'#888'};border-radius:0 4px 4px 0;`;
    hdr.innerHTML = `
      <span class="cinzel" style="color:${LEVEL_COLORS[lvl]};font-size:12px;letter-spacing:2px;">${+lvl===0?'ORAISONS':'NIVEAU '+lvl}</span>
      <span class="small text-dim">${byLevel[lvl].length} sort${byLevel[lvl].length>1?'s':''}</span>`;
    panel.appendChild(hdr);
    byLevel[lvl].forEach(p => panel.appendChild(buildGrimoireCard(p)));
  });
}

function buildGrimoireCard(ps) {
  const sp     = ps.dbId ? _getSpell(ps.dbId) : null;
  const spName = ps.name || sp?.name || '?';
  const state  = ps.state || 'prepared';
  const stateColors  = { prepared: 'var(--green)', cast: 'var(--text-dim)', active: 'var(--gold)' };
  const stateLabels  = { prepared: '✓ Disponible', cast: '⊘ Lancé', active: '⚡ Actif' };

  const card = document.createElement('div');
  card.style.cssText = `
    display:flex;align-items:flex-start;gap:10px;padding:10px 12px;margin-bottom:6px;
    border:1px solid ${state==='active'?'var(--gold-dim)':'var(--border)'};
    background:${state==='cast'?'var(--bg3)':state==='active'?'rgba(180,140,60,0.06)':'var(--bg3)'};
    border-radius:5px;opacity:${state==='cast'?'0.6':'1'};`;

  const lvl = ps.preparedLevel ?? ps.baseLevel ?? 0;
  const lvlBubble = document.createElement('div');
  lvlBubble.style.cssText = `
    width:26px;height:26px;border-radius:50%;flex-shrink:0;margin-top:2px;
    background:${LEVEL_COLORS[lvl]||'#888'}22;color:${LEVEL_COLORS[lvl]||'#888'};
    border:1px solid ${LEVEL_COLORS[lvl]||'#888'}44;
    display:flex;align-items:center;justify-content:center;
    font-family:'Cinzel',serif;font-size:11px;font-weight:700;`;
  lvlBubble.textContent = lvl;

  const mmBadges = [];
  if (ps.metamagic?.length) {
    const MM_LABELS = { extend:'Extend', empower:'Empower', maximize:'Maximize',
      quicken:'Quicken', persist:'Persist', widen:'Widen',
      heighten:'Heighten', still:'Still', silent:'Silent', enlarge:'Enlarge' };
    mmBadges.push(`<span style="font-size:10px;background:rgba(160,80,220,0.15);color:#c080e0;border:1px solid rgba(160,80,220,0.3);border-radius:3px;padding:1px 5px;">✦ ${ps.metamagic.map(m=>MM_LABELS[m]||m).join(' + ')}</span>`);
  }
  if (ps.isPersistent) mmBadges.push(`<span style="font-size:10px;background:rgba(60,180,120,0.15);color:var(--green);border:1px solid rgba(60,180,120,0.4);border-radius:3px;padding:1px 5px;">⏳ PERSISTANT 24h</span>`);
  if (ps.metamagicMode === 'divine_metamagic' && ps.divineMetamagicUsed > 0)
    mmBadges.push(`<span style="font-size:10px;background:rgba(180,140,60,0.15);color:var(--gold-dim);border:1px solid var(--gold-dim);border-radius:3px;padding:1px 5px;">✨ Div.MM (${ps.divineMetamagicUsed} renvois)</span>`);
  if (ps.baseLevel !== ps.preparedLevel && !ps.isPersistent && ps.metamagicMode !== 'divine_metamagic')
    mmBadges.push(`<span style="font-size:10px;color:var(--text-dim);border:1px solid var(--border);border-radius:3px;padding:1px 4px;">Nv${ps.baseLevel}→Nv${ps.preparedLevel}</span>`);

  const info = document.createElement('div');
  info.style.cssText = 'flex:1;min-width:0;';
  const desc = sp?.desc || '';
  info.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">
      <span style="font-size:13px;font-family:'Cinzel',serif;color:var(--text-bright);text-decoration:${state==='cast'?'line-through':'none'};">${spName}</span>
      <span style="font-size:11px;color:${stateColors[state]};font-style:italic;">${stateLabels[state]}</span>
      ${mmBadges.join('')}
    </div>
    ${desc ? `<div class="small text-dim" style="font-style:italic;line-height:1.3;">${desc.slice(0,90)}${desc.length>90?'…':''}</div>` : ''}
    ${sp ? `<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
      <span class="small text-dim">${sp.school}</span>
      <span class="small text-dim">•</span>
      <span class="small text-dim">⏱ ${ps.isPersistent && state==='active' ? '<span style="color:var(--green);">24 heures</span>' : sp.duration}</span>
      ${sp.save && sp.save!=='None' ? `<span class="small text-dim">• JS: ${sp.save}</span>` : ''}
    </div>` : ''}`;

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-direction:column;gap:4px;flex-shrink:0;align-items:flex-end;';

  if (state === 'prepared') {
    const castBtn = document.createElement('button');
    castBtn.className = 'btn btn-primary btn-small';
    const hasBuff = ps.dbId && Object.values(BUFF_DB).some(b => b.spellId === ps.dbId);
    castBtn.innerHTML = hasBuff ? '⚡ Lancer + Buff' : '⚡ Lancer';
    if (hasBuff) castBtn.style.background = 'rgba(180,140,60,0.3)';
    castBtn.onclick = () => castPreparedSpell(ps.id);
    actions.appendChild(castBtn);
  } else if (state === 'cast') {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-secondary btn-small';
    undoBtn.innerHTML = '↩ Annuler';
    undoBtn.onclick   = () => uncastPreparedSpell(ps.id);
    actions.appendChild(undoBtn);
  } else if (state === 'active') {
    const expireBtn = document.createElement('button');
    expireBtn.className = 'btn btn-secondary btn-small';
    expireBtn.innerHTML = '⊘ Expirer';
    expireBtn.onclick   = () => expirePreparedSpell(ps.id);
    actions.appendChild(expireBtn);
  }

  const removeBtn = document.createElement('button');
  removeBtn.className   = 'btn btn-danger btn-small';
  removeBtn.style.cssText = 'width:24px;height:24px;padding:0;text-align:center;';
  removeBtn.textContent = '×';
  removeBtn.title       = 'Retirer de la préparation';
  removeBtn.onclick     = () => {
    AppState.preparedSpells = AppState.preparedSpells.filter(p => p.id !== ps.id);
    renderGrimoire();
  };
  actions.appendChild(removeBtn);

  card.appendChild(lvlBubble);
  card.appendChild(info);
  card.appendChild(actions);
  return card;
}


// ═══════════════════════════════════════════════════════════
// SECTION 11 — Render : Sorts custom
// ═══════════════════════════════════════════════════════════

function renderCustomSpells() {
  const container = document.getElementById('custom-spell-list');
  if (!container) return;
  const customs = AppState.spells.filter(s => s.isCustom);
  if (customs.length === 0) {
    container.innerHTML = '<div class="small text-dim text-center" style="padding:20px;">Aucun sort custom créé. Cliquez <strong>+ Créer un sort</strong>.</div>';
    return;
  }
  container.innerHTML = '';
  const schoolColors = { Abjuration:'var(--blue)', Conjuration:'var(--green)', Divination:'#c9a040', Enchantment:'var(--purple)', Evocation:'var(--red)', Illusion:'#50a0a0', Necromancy:'#808080', Transmutation:'#80a040' };
  customs.forEach(sp => {
    const div = document.createElement('div');
    div.style.cssText = 'background:var(--bg3);border:1px solid var(--gold-dim);border-radius:4px;padding:12px 14px;margin-bottom:8px;';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="background:rgba(201,147,58,0.2);color:var(--gold);border:1px solid var(--gold-dim);padding:1px 6px;border-radius:8px;font-size:9px;font-family:'Cinzel',serif;">⚗️ CRAFTED</span>
        <span style="font-size:15px;color:var(--gold-light);font-weight:600;">${sp.name}</span>
        <span style="color:${schoolColors[sp.school]||'var(--text-dim)'};font-style:italic;font-size:12px;">${sp.school}</span>
        <span style="margin-left:auto;color:var(--text-dim);font-size:12px;">Niv. ${sp.level}</span>
        <button class="btn btn-danger btn-small" onclick="removeCustomSpell('${sp.id}')">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:var(--text-dim);margin-bottom:8px;">
        <span>Durée : ${sp.duration||'—'}</span><span>Portée : ${sp.range||'—'}</span>
        <span>JS : ${sp.savingThrow||'—'}</span><span>Source : ${sp.official?'Officiel':'Non officiel'}</span>
      </div>
      <div style="font-size:13px;font-style:italic;color:var(--text-dim);">${sp.description||''}</div>
      ${sp.official === false ? '<div style="margin-top:6px;font-size:11px;color:var(--gold-dim);">⚠️ Sort inventé / non officiel</div>' : ''}
      <button class="btn btn-secondary btn-small mt-8" onclick="addSpellFromCustom('${sp.id}')">+ Ajouter au grimoire</button>`;
    container.appendChild(div);
  });
}

function removeCustomSpell(id) {
  AppState.spells = AppState.spells.filter(s => s.id !== id);
  renderCustomSpells();
}

function addSpellFromCustom(id) {
  showTab('grimoire');
  setTimeout(() => { const sel = document.getElementById('grimoire-add-select'); if (sel) sel.value = id; }, 100);
}

function openCustomSpellModal() {
  let modal = document.getElementById('custom-spell-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'custom-spell-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:520px;">
        <div class="modal-header">
          <span class="modal-title">⚗️ CRÉER UN SORT CUSTOM</span>
          <button class="modal-close" onclick="this.closest('.modal-overlay').classList.add('hidden')">×</button>
        </div>
        <div class="modal-body" style="display:grid;gap:10px;">
          <div style="background:rgba(201,147,58,0.1);border:1px solid var(--gold-dim);border-radius:3px;padding:8px;font-size:12px;color:var(--gold);">
            Les sorts custom sont marqués <strong>⚗️ CRAFTED</strong>.
          </div>
          <div><label class="form-label">Nom du sort *</label><input id="cs-name" class="form-input" placeholder="Ex: Sphère de lave"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><label class="form-label">Niveau (0-9)</label><input id="cs-level" type="number" min="0" max="9" value="1" class="form-input"></div>
            <div><label class="form-label">École</label>
              <select id="cs-school" class="form-input">${['Abjuration','Conjuration','Divination','Enchantment','Evocation','Illusion','Necromancy','Transmutation','Universal'].map(s=>`<option>${s}</option>`).join('')}</select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><label class="form-label">Composantes</label><input id="cs-comp" class="form-input" value="V, S"></div>
            <div><label class="form-label">Temps d'incantation</label><input id="cs-time" class="form-input" value="1 std"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><label class="form-label">Portée</label><input id="cs-range" class="form-input" placeholder="Touch, Close…"></div>
            <div><label class="form-label">Durée</label><input id="cs-dur" class="form-input" placeholder="1 round/lvl…"></div>
          </div>
          <div><label class="form-label">Jet de sauvegarde</label><input id="cs-save" class="form-input" placeholder="Will neg, Fort half, None…"></div>
          <div><label class="form-label">Description / Effets</label><textarea id="cs-desc" class="form-input" rows="3" placeholder="Décrivez les effets du sort…"></textarea></div>
          <div><label class="form-label">Formule (optionnel)</label><input id="cs-formula" class="form-input" placeholder="Ex: 1d6/lvl max 10d6"></div>
          <div style="display:flex;gap:12px;align-items:center;">
            <label style="display:flex;gap:6px;align-items:center;cursor:pointer;font-size:13px;">
              <input type="radio" name="cs-official" value="official" checked><span style="color:var(--green);">✓ Officiel (SRD/publié)</span>
            </label>
            <label style="display:flex;gap:6px;align-items:center;cursor:pointer;font-size:13px;">
              <input type="radio" name="cs-official" value="crafted"><span style="color:var(--gold);">⚗️ Inventé / Non officiel</span>
            </label>
          </div>
          <button class="btn btn-primary" onclick="saveCustomSpell()" style="margin-top:8px;">Créer le sort</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.classList.remove('hidden');
}

function saveCustomSpell() {
  const name = document.getElementById('cs-name').value.trim();
  if (!name) return alert('Nom requis');
  const isOfficial = document.querySelector('input[name="cs-official"]:checked')?.value === 'official';
  AppState.spells.push({
    id:           'custom_' + Date.now(),
    dbId:         null,
    isCustom:     true,
    official:     isOfficial,
    name,
    level:        parseInt(document.getElementById('cs-level').value) || 0,
    school:       document.getElementById('cs-school').value,
    comp:         document.getElementById('cs-comp').value,
    time:         document.getElementById('cs-time').value,
    range:        document.getElementById('cs-range').value,
    duration:     document.getElementById('cs-dur').value,
    savingThrow:  document.getElementById('cs-save').value,
    description:  document.getElementById('cs-desc').value,
    formula:      document.getElementById('cs-formula').value,
    effects:      [],
  });
  document.getElementById('custom-spell-modal').classList.add('hidden');
  renderCustomSpells();
}


// ═══════════════════════════════════════════════════════════
// SECTION 12 — UI bindings / Legacy stubs
// ═══════════════════════════════════════════════════════════

// Popup info source sort (partagée avec buffs.js)
function showSpellSourceInfo(spellId) {
  const sp = _getSpell(spellId);
  if (!sp) return;
  let modal = document.getElementById('spell-source-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'spell-source-modal';
    modal.className = 'modal-overlay';
    modal.onclick   = e => { if (e.target === modal) modal.classList.add('hidden'); };
    modal.innerHTML = `
      <div class="modal-content" style="max-width:400px;">
        <div class="modal-header">
          <span class="modal-title" id="ssm-title"></span>
          <button class="modal-close" onclick="document.getElementById('spell-source-modal').classList.add('hidden')">×</button>
        </div>
        <div class="modal-body" id="ssm-body"></div>
      </div>`;
    document.body.appendChild(modal);
  }
  const _ssmDescId = 'ssm-desc-' + spellId.replace(/[^a-z0-9]/gi,'_');
  document.getElementById('ssm-title').textContent = sp.name;
  document.getElementById('ssm-body').innerHTML = `
    <div style="display:grid;gap:10px;">
      <div>
        <div class="small text-dim" style="margin-bottom:3px;">Nom original (anglais)</div>
        <div style="font-size:18px;font-family:'Cinzel',serif;color:var(--gold-light);">${sp.name}</div>
      </div>
      <div><div class="small text-dim" style="margin-bottom:3px;">École</div><div style="font-size:14px;color:var(--text-bright);">${sp.school}</div></div>
      <div><div class="small text-dim" style="margin-bottom:3px;">Source</div><div style="font-size:14px;color:var(--text-bright);">${sp.source||'SRD'} — <em>Player's Handbook D&D 3.5</em></div></div>
      <div><div class="small text-dim" style="margin-bottom:3px;">Composantes</div><div style="font-size:14px;">${(sp.comp||[]).join(', ')}</div></div>
      ${sp.formula ? `<div><div class="small text-dim" style="margin-bottom:3px;">Formule officielle</div><code style="background:var(--bg4);padding:4px 8px;border-radius:3px;color:var(--gold);font-size:13px;">${sp.formula}</code></div>` : ''}
      <div id="${_ssmDescId}" style="background:var(--bg3);border:1px solid var(--border);border-radius:3px;padding:8px;font-size:12px;color:var(--text-dim);font-style:italic;">${sp.desc || ''}</div>
    </div>`;
  modal.classList.remove('hidden');
  // Inject long description if available
  if (sp.name && typeof _injectSpellDescription === 'function') {
    _injectSpellDescription(sp.name, _ssmDescId);
  }
}

// Legacy stubs
function switchSpellSub(sub)   { /* no-op */ }
function addToGrimoire()        { /* no-op */ }
function castFromGrimoire(id)   { castPreparedSpell(id); }
function uncastFromGrimoire(id) { uncastPreparedSpell(id); }
function removeFromGrimoire(id) {
  AppState.preparedSpells = AppState.preparedSpells.filter(p => p.id !== id);
  renderGrimoire();
}
// addSpell() — stub pour le bouton du modal add-spell-modal
function addSpell() { if (typeof saveCustomSpell === 'function') saveCustomSpell(); }
