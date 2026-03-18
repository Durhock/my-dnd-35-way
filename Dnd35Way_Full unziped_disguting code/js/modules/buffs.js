// ============================================================
// buffs.js — Gestionnaire d'effets actifs
//
// Responsabilité : GESTION DES BUFFS UNIQUEMENT.
// Ce module ne calcule pas de statistiques.
//
// Les buffs sont lus par rules.js via collectBonuses() :
//   - AppState.buffs.filter(b => b.isActive && b.isSelf)
//   - puis b.effects → [{target, bonusType, value}]
//
// Structure d'un buff dans AppState.buffs :
//   id               — identifiant unique
//   dbId             — clé dans BUFF_DB (null si custom)
//   sourceType       — 'spell' | 'item' | 'feat' | 'class' | 'racial' | 'other'
//   sourceId         — référence source (spellId, itemId, featId…) ou null
//   name             — nom affiché (FR)
//   nameEn           — nom anglais
//   isActive         — boolean — lu par rules.js
//   isSelf           — boolean — true si les effets s'appliquent au perso
//   isSelfOnly       — boolean — true si le sort ne peut cibler que soi
//   uiTargetType     — 'self' | 'creature_touched' | 'aoe_…' | 'item_weapon' | …
//   casterLevel      — niveau d'incantation au moment du lancer
//   target           — string — 'self' | nom allié | nom objet
//   spellId          — clé dans SPELL_DB (null si non-sort)
//   duration         — { formula: string }
//   remainingDuration — null (décompte optionnel, non implémenté)
//   effects          — [{target, bonusType, value}] — lu par collectBonuses()
//   effectsLabel     — string — résumé lisible des effets
//
// SECTIONS :
//   1. Création de buffs
//   2. Mutations d'état (activation, suppression)
//   3. Render — Affichage principal
//   4. Render — Carte de buff
//   5. Render — Quickbar fiche
//   6. Modal — Lancer un sort
//   7. Modal — Buff personnalisé
//   8. Helpers UI (addEffectRow, removeEffectRow, showSpellSourceInfo)
// ============================================================


// ═══════════════════════════════════════════════════════════
// SECTION 1 — Création de buffs
// ═══════════════════════════════════════════════════════════

/**
 * Crée une instance de buff à partir de BUFF_DB.
 * Ne modifie pas AppState — l'appelant pousse dans AppState.buffs.
 *
 * @param {string} dbId     Clé dans BUFF_DB
 * @param {object} options  { casterLevel, isSelf, target }
 * @returns {object|null}
 */
function makeBuff(dbId, options = {}) {
  const entry = BUFF_DB[dbId];
  if (!entry) return null;

  const cl     = options.casterLevel || AppState.levels.length || 1;
  const isSelf = options.isSelf !== undefined
    ? options.isSelf
    : (entry.uiTargetType === 'self' || !!entry.isSelfOnly);

  return {
    id:                'buff_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    dbId,
    sourceType:        'spell',
    sourceId:          entry.spellId || null,
    name:              entry.nameFr || entry.name,
    nameEn:            entry.name,
    isActive:          true,
    isSelf,
    isSelfOnly:        !!entry.isSelfOnly,
    uiTargetType:      entry.uiTargetType,
    casterLevel:       cl,
    target:            options.target || (isSelf ? 'self' : ''),
    spellId:           entry.spellId || null,
    duration:          { formula: entry.durationFormula },
    remainingDuration: null,
    // effects : tableau [{target, bonusType, value}] — lu par collectBonuses()
    effects:           entry.effects(cl),
    effectsLabel:      entry.effectsLabel ? entry.effectsLabel(cl) : '',
  };
}

/**
 * Crée un buff personnalisé (hors BUFF_DB).
 * Utilisé par addBuff() via le modal custom.
 *
 * @param {object} params
 * @returns {object}
 */
function _makeCustomBuff(params) {
  return {
    id:                'buff_custom_' + Date.now(),
    dbId:              null,
    sourceType:        params.sourceType || 'other',
    sourceId:          null,
    name:              params.name,
    nameEn:            params.name,
    isActive:          true,
    isSelf:            params.isSelf,
    isSelfOnly:        false,
    uiTargetType:      params.isSelf ? 'self' : 'creature_touched',
    casterLevel:       AppState.levels.length || 1,
    target:            params.isSelf ? 'self' : '',
    spellId:           null,
    duration:          { formula: params.durationFormula || '?' },
    remainingDuration: null,
    // effects : [{target, bonusType, value}] — structure minimale pour collectBonuses()
    effects:           params.effects || [],
    effectsLabel:      '',
  };
}


// ═══════════════════════════════════════════════════════════
// SECTION 2 — Mutations d'état
// Toutes les mutations modifient AppState.buffs et appellent renderAll().
// Aucune ne modifie AppState.stats / AppState.ac / AppState.saves.
// ═══════════════════════════════════════════════════════════

/** Active ou désactive un buff. rules.js lira isActive au prochain rendu. */
function toggleBuff(buffId) {
  const buff = AppState.buffs.find(b => b.id === buffId);
  if (!buff) return;
  buff.isActive = !buff.isActive;
  renderAll();
}

/** Point d'entrée depuis la fiche (sheet.js). */
function toggleBuffFromSheet(buffId) {
  toggleBuff(buffId);
}

/** Supprime un buff de AppState.buffs. */
function _removeBuff(buffId) {
  AppState.buffs = AppState.buffs.filter(b => b.id !== buffId);
  renderAll();
}


// ═══════════════════════════════════════════════════════════
// SECTION 3 — Render : Affichage principal
// ═══════════════════════════════════════════════════════════

function renderBuffs() {
  const selfContainer = document.getElementById('self-buffs-container');
  const tierContainer = document.getElementById('tier-buffs-container');
  if (!selfContainer || !tierContainer) return;

  const selfBuffs  = AppState.buffs.filter(b => b.isSelf);
  const tierBuffs  = AppState.buffs.filter(b => !b.isSelf);
  const activeCount = AppState.buffs.filter(b => b.isActive).length;

  document.getElementById('buff-active-count').textContent = `${activeCount} ${t('lbl_active_count')}`;
  document.getElementById('self-buff-count').textContent   = selfBuffs.length ? `${selfBuffs.length}` : '';
  document.getElementById('tier-buff-count').textContent   = tierBuffs.length ? `${tierBuffs.length}` : '';

  // Résumé des effets actifs (affichage seul — les valeurs viennent de AppState.buffs)
  const impactBox  = document.getElementById('buff-impact-box');
  const impactText = document.getElementById('buff-impact-text');
  const activeEffects = AppState.buffs
    .filter(b => b.isActive && b.isSelf)
    .flatMap(b => b.effects || []);

  if (activeEffects.length > 0) {
    impactBox.style.display = '';
    impactText.textContent = activeEffects.map(ef => {
      const sign = ef.value > 0 ? '+' : '';
      return `${ef.target.replace(/^(ability|defense|save|combat)\./, '')} ${sign}${ef.value} (${ef.bonusType})`;
    }).join(' · ');
  } else {
    impactBox.style.display = 'none';
  }

  // Self buffs
  if (selfBuffs.length === 0) {
    selfContainer.innerHTML = `<div class="small text-dim text-center" style="padding:20px;">
      Aucun self buff.<br>Utilisez <strong>⚡ Lancer un sort</strong> et choisissez "Soi-même".
    </div>`;
  } else {
    selfContainer.innerHTML = '';
    selfBuffs.forEach(buff => selfContainer.appendChild(_buildBuffCard(buff, 'self')));
  }

  // Tier buffs
  if (tierBuffs.length === 0) {
    tierContainer.innerHTML = `<div class="small text-dim text-center" style="padding:20px;">
      Aucun tier buff.<br>Les sorts lancés sur un allié apparaissent ici.
    </div>`;
  } else {
    tierContainer.innerHTML = '';
    tierBuffs.forEach(buff => tierContainer.appendChild(_buildBuffCard(buff, 'tier')));
  }

  updateSheetBuffPanel();
}


// ═══════════════════════════════════════════════════════════
// SECTION 4 — Render : Carte de buff
// ═══════════════════════════════════════════════════════════

function _buildBuffCard(buff, mode) {
  const isActive = buff.isActive;
  const card = document.createElement('div');
  card.className = 'buff-card' + (isActive ? ' active' : '');
  card.style.cssText = `
    border:1px solid ${isActive ? (mode === 'self' ? 'var(--green-dim)' : 'rgba(74,120,180,0.4)') : 'var(--border)'};
    background:${isActive ? (mode === 'self' ? 'rgba(74,154,80,0.08)' : 'rgba(74,120,180,0.08)') : 'var(--bg3)'};
    border-radius:6px; padding:12px; margin-bottom:10px; display:flex; gap:10px; align-items:flex-start;
    transition: all 0.15s;`;

  // Toggle switch
  const toggle = document.createElement('div');
  toggle.className = 'buff-toggle' + (isActive ? ' on' : '');
  toggle.style.marginTop = '2px';
  toggle.onclick = () => toggleBuff(buff.id);

  // Corps de la carte
  const info = document.createElement('div');
  info.style.flex = '1';

  const sourceShort = buff.dbId ? (BUFF_DB[buff.dbId]?.sourceShort || '') : 'Custom';
  const targetInfo  = UI_TARGET_LABELS[buff.uiTargetType] || {};

  // Labels lisibles pour les cibles d'effets
  const _effectTargetLabel = (target) => {
    const map = {
      'ability.STR': 'FOR', 'ability.DEX': 'DEX', 'ability.CON': 'CON',
      'ability.INT': 'INT', 'ability.WIS': 'SAG', 'ability.CHA': 'CHA',
      'combat.attack': 'ATK', 'combat.damage': 'DMG',
      'combat.baseAttackOverride': 'BBA→',
      'defense.naturalArmor': 'Armure nat.', 'defense.deflection': 'Déflexion CA',
      'defense.armor': 'Armure', 'defense.spellResistance': 'RM',
      'save.fortitude': t('save_fort'), 'save.reflex': t('save_reflex'), 'save.will': t('save_will'),
      'save.all': t('lbl_all_saves'), 'hp.temp': t('lbl_temp_hp_short'),
    };
    return map[target] || target.replace(/^[^.]+\./, '');
  };

  const effectsHtml = (buff.effects || []).length > 0
    ? buff.effects.map(ef => {
        const sign = ef.value > 0 ? '+' : '';
        return `<span class="buff-effect-tag" style="${isActive ? 'color:var(--gold-dim);border-color:var(--gold-dim);' : ''}">
          ${_effectTargetLabel(ef.target)} ${sign}${ef.value}
          <em style="opacity:0.6;font-size:10px;">${ef.bonusType}</em>
        </span>`;
      }).join('')
    : buff.effectsLabel
      ? `<span class="buff-effect-tag" style="color:var(--text-dim);font-style:italic;">${buff.effectsLabel}</span>`
      : '<span class="text-dim small" style="font-style:italic;">Effets non appliqués à la fiche</span>';

  info.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
      <span class="cinzel" style="color:${isActive ? 'var(--text-bright)' : 'var(--text-dim)'};font-size:13px;">${buff.name}</span>
      ${buff.nameEn && buff.nameEn !== buff.name ? `<span class="small text-dim" style="font-style:italic;">(${buff.nameEn})</span>` : ''}
      ${sourceShort ? `<span style="background:var(--bg4);color:var(--text-dim);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-size:10px;font-family:'Cinzel',serif;">${sourceShort}</span>` : ''}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
      <span style="font-size:11px;color:${targetInfo.color || 'var(--text-dim)'};">${targetInfo.icon || ''} ${targetInfo.label || buff.uiTargetType || ''}</span>
      ${buff.target && buff.target !== 'self' ? `<span class="small" style="color:var(--gold-dim);">→ ${buff.target}</span>` : ''}
      <span class="small text-dim">⏱ ${buff.duration?.formula || '—'}</span>
    </div>
    <div class="buff-effects">${effectsHtml}</div>`;

  const removeBtn = document.createElement('button');
  removeBtn.className   = 'btn btn-danger btn-small';
  removeBtn.style.cssText = 'width:24px;height:24px;padding:0;line-height:24px;text-align:center;flex-shrink:0;';
  removeBtn.textContent = '×';
  removeBtn.title       = 'Supprimer ce buff';
  removeBtn.onclick     = () => _removeBuff(buff.id);

  card.appendChild(toggle);
  card.appendChild(info);
  card.appendChild(removeBtn);
  return card;
}

// Alias public (appelé depuis l'ancien code)
function buildBuffCard(buff, mode) { return _buildBuffCard(buff, mode); }


// ═══════════════════════════════════════════════════════════
// SECTION 5 — Render : Quickbar fiche
// ═══════════════════════════════════════════════════════════

function updateSheetBuffPanel() {
  const panel = document.getElementById('sheet-buff-quickbar-panel');
  const bar   = document.getElementById('sheet-buff-quickbar');
  if (!panel || !bar) return;

  // Always show panel (player can add buffs from here)
  panel.style.display = '';

  const activeBufsList = AppState.buffs.filter(b => b.isActive);
  const hasBuffs = AppState.buffs.length > 0;

  bar.innerHTML = (hasBuffs ? AppState.buffs.map(b => `
    <button class="btn btn-small" onclick="toggleBuffFromSheet('${b.id}')" style="
      background:${b.isActive ? (b.isSelf ? 'rgba(74,154,80,0.25)' : 'rgba(74,120,180,0.25)') : 'var(--bg4)'};
      border:1px solid ${b.isActive ? (b.isSelf ? 'var(--green-dim)' : 'rgba(74,120,180,0.5)') : 'var(--border)'};
      color:${b.isActive ? 'var(--text-bright)' : 'var(--text-dim)'};
      padding:4px 8px;font-size:12px;white-space:nowrap;">
      ${b.isActive ? '⚡' : '○'} ${b.name || b.nameEn || '?'}
    </button>`).join('') : '<span style="font-size:11px;color:var(--text-dim);font-style:italic;padding:4px 8px;">Aucun buff actif</span>') +
  `<button class="btn btn-secondary btn-small" onclick="openAddBuffModal()"
    style="font-size:11px;padding:3px 10px;">+ Déclarer</button>`;
}


// ═══════════════════════════════════════════════════════════
// SECTION 6 — Modal : Lancer un sort
// ═══════════════════════════════════════════════════════════

let _cbmSelectedDbId = null;

function openCastBuffModal() {
  let modal = document.getElementById('cast-buff-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'cast-buff-modal';
    modal.className = 'modal-overlay';
    modal.onclick   = e => { if (e.target === modal) modal.classList.add('hidden'); };
    modal.innerHTML = `
      <div class="modal-content" style="max-width:560px;">
        <div class="modal-header">
          <span class="modal-title cinzel">⚡ Lancer un sort / Activer un buff</span>
          <button class="modal-close" onclick="document.getElementById('cast-buff-modal').classList.add('hidden')">×</button>
        </div>
        <div class="modal-body">
          <div id="cbm-step1">
            <div class="small text-dim mb-8">Sélectionner le sort à lancer :</div>
            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <input type="text" id="cbm-search" placeholder="Rechercher..." style="flex:1;" oninput="filterCastBuffList()">
              <select id="cbm-level-filter" onchange="filterCastBuffList()" style="width:120px;">
                <option value="">Tous niveaux</option>
                ${[1,2,3,4,5,6,7].map(l => `<option value="${l}">Niveau ${l}</option>`).join('')}
              </select>
            </div>
            <div id="cbm-spell-list" style="max-height:320px;overflow-y:auto;display:grid;gap:6px;"></div>
          </div>
          <div id="cbm-step2" class="hidden">
            <button class="btn btn-secondary btn-small mb-12" onclick="cbmBackToStep1()">← Retour</button>
            <div id="cbm-selected-spell-info" style="margin-bottom:14px;"></div>
            <div id="cbm-target-section"></div>
            <div style="display:flex;gap:8px;margin-top:16px;">
              <button class="btn btn-primary" onclick="cbmConfirmCast()" style="flex:1;">⚡ Lancer</button>
              <button class="btn btn-secondary" onclick="document.getElementById('cast-buff-modal').classList.add('hidden')">Annuler</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  cbmBackToStep1();
  modal.classList.remove('hidden');
  filterCastBuffList();
}

function filterCastBuffList() {
  const search    = (document.getElementById('cbm-search')?.value || '').toLowerCase();
  const lvlFilter = document.getElementById('cbm-level-filter')?.value;
  const list      = document.getElementById('cbm-spell-list');
  if (!list) return;
  list.innerHTML = '';

  const learned = new Set((AppState.spells || []).map(s => s.dbId).filter(Boolean));

  Object.entries(BUFF_DB).forEach(([dbId, entry]) => {
    if (lvlFilter && String(entry.clericLevel) !== lvlFilter) return;
    const nameMatch = entry.name.toLowerCase().includes(search) || (entry.nameFr || '').toLowerCase().includes(search);
    if (search && !nameMatch) return;

    const inLibrary = learned.has(entry.spellId || '');
    const tInfo     = UI_TARGET_LABELS[entry.uiTargetType] || {};
    const cl        = AppState.levels.length || 1;

    const card = document.createElement('div');
    card.style.cssText = `
      border:1px solid var(--border);border-radius:5px;padding:10px 12px;
      cursor:pointer;background:var(--bg3);display:flex;align-items:center;gap:10px;
      ${!inLibrary ? 'opacity:0.55;' : ''}`;
    card.onmouseenter = () => { if (inLibrary) card.style.borderColor = 'var(--gold-dim)'; };
    card.onmouseleave = () => { card.style.borderColor = 'var(--border)'; };
    card.onclick      = () => { if (inLibrary) cbmSelectSpell(dbId); };
    card.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:rgba(180,140,60,0.15);
           display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">
        ${entry.uiTargetType === 'self' ? '👤' : entry.uiTargetType.includes('aoe') ? '🌟' : entry.uiTargetType.includes('item') ? '⚔️' : '🤝'}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span class="cinzel" style="font-size:13px;color:var(--text-bright);">${entry.nameFr || entry.name}</span>
          <span class="small text-dim" style="font-style:italic;">${entry.name}</span>
          <span style="background:var(--bg4);color:var(--text-dim);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-size:10px;">${entry.sourceShort}</span>
          ${!inLibrary ? '<span style="color:var(--red);font-size:10px;">⚠ non appris</span>' : ''}
        </div>
        <div class="small text-dim" style="margin-top:2px;">
          Nv${entry.clericLevel} · ${tInfo.icon || ''} ${tInfo.label || entry.targetOfficial} · ⏱ ${entry.durationFormula}
        </div>
        <div class="small" style="color:var(--gold-dim);margin-top:2px;font-style:italic;">${entry.effectsLabel ? entry.effectsLabel(cl) : entry.desc.slice(0, 80) + '…'}</div>
      </div>
      <div style="color:var(--gold);font-size:18px;flex-shrink:0;">›</div>`;
    list.appendChild(card);
  });

  if (list.childElementCount === 0) {
    list.innerHTML = '<div class="text-dim small text-center" style="padding:20px;">Aucun sort correspondant.</div>';
  }
}

function cbmSelectSpell(dbId) {
  _cbmSelectedDbId = dbId;
  const entry   = BUFF_DB[dbId];
  const cl      = AppState.levels.length || 1;
  const step1   = document.getElementById('cbm-step1');
  const step2   = document.getElementById('cbm-step2');
  const infoDiv = document.getElementById('cbm-selected-spell-info');
  const targetSection = document.getElementById('cbm-target-section');

  step1.classList.add('hidden');
  step2.classList.remove('hidden');

  const tInfo = UI_TARGET_LABELS[entry.uiTargetType] || {};
  infoDiv.innerHTML = `
    <div style="background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:12px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span style="font-size:24px;">${tInfo.icon || '✨'}</span>
        <div>
          <div class="cinzel" style="color:var(--gold-light);font-size:15px;">${entry.nameFr || entry.name}</div>
          <div class="small text-dim">${entry.name} · ${entry.source}</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <span class="small"><span class="text-dim">Niv. sort :</span> <strong class="text-bright">${entry.clericLevel}</strong></span>
        <span class="small"><span class="text-dim">Cible :</span> <strong class="text-bright">${entry.targetOfficial}</strong></span>
        <span class="small"><span class="text-dim">Durée :</span> <strong class="text-bright">${entry.durationFormula}</strong></span>
        <span class="small"><span class="text-dim">NC :</span> <strong class="text-bright">${cl}</strong></span>
      </div>
      ${entry.effectsLabel ? `<div class="small" style="margin-top:8px;color:var(--gold-dim);font-style:italic;">Effets : ${entry.effectsLabel(cl)}</div>` : ''}
    </div>`;

  // Sélecteur de cible
  if (entry.isSelfOnly) {
    targetSection.innerHTML = `
      <div style="background:rgba(74,154,80,0.12);border:1px solid var(--green-dim);border-radius:6px;padding:12px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">👤</span>
        <div>
          <div class="cinzel small" style="color:var(--green);">TARGET : YOU</div>
          <div class="small text-dim">Ce sort ne peut cibler que vous-même.</div>
        </div>
      </div>
      <input type="hidden" id="cbm-is-self" value="true">`;

  } else if (entry.uiTargetType === 'creature_touched' || entry.uiTargetType === 'multi_creatures_touched') {
    targetSection.innerHTML = `
      <div class="small text-dim mb-8">Ce sort peut être lancé sur vous ou sur un allié :</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
        <div id="cbm-target-self" onclick="cbmSetTarget('self')" style="
          border:2px solid var(--green);border-radius:6px;padding:12px;text-align:center;
          cursor:pointer;background:rgba(74,154,80,0.15);">
          <div style="font-size:24px;">👤</div>
          <div class="cinzel small" style="color:var(--green);">Soi-même</div>
          <div class="small text-dim" style="margin-top:4px;">Effets appliqués à la fiche</div>
        </div>
        <div id="cbm-target-ally" onclick="cbmSetTarget('ally')" style="
          border:2px solid var(--border);border-radius:6px;padding:12px;text-align:center;
          cursor:pointer;background:var(--bg3);">
          <div style="font-size:24px;">🤝</div>
          <div class="cinzel small" style="color:var(--gold-dim);">Un allié</div>
          <div class="small text-dim" style="margin-top:4px;">Tier buff — slot consommé</div>
        </div>
      </div>
      <div id="cbm-ally-name-section" class="hidden">
        <input type="text" id="cbm-ally-name" placeholder="Nom de l'allié (optionnel)" style="width:100%;box-sizing:border-box;">
      </div>
      <input type="hidden" id="cbm-is-self" value="true">`;

  } else if (entry.uiTargetType.includes('aoe')) {
    targetSection.innerHTML = `
      <div style="background:rgba(180,140,60,0.1);border:1px solid var(--gold-dim);border-radius:6px;padding:12px;">
        <div class="cinzel small" style="color:var(--gold);margin-bottom:6px;">Sort de zone — ${tInfo.label || entry.targetOfficial}</div>
        <div class="small text-dim">${entry.desc}</div>
        <div class="small" style="margin-top:8px;color:var(--gold-dim);">Les effets s'appliquent sur vous (centré sur vous).</div>
      </div>
      <input type="hidden" id="cbm-is-self" value="true">`;

  } else if (entry.uiTargetType === 'item_weapon' || entry.uiTargetType === 'item_armor_or_shield') {
    const itemType = entry.uiTargetType === 'item_weapon' ? 'weapon' : 'armor';
    const icon     = entry.uiTargetType === 'item_weapon' ? '⚔️' : '🛡️';
    const label    = entry.uiTargetType === 'item_weapon' ? 'Arme touchée' : 'Armure ou bouclier touché';
    const items    = (AppState.inventory || []).filter(it => isEquipped(it.instanceId) && it.category === itemType);
    targetSection.innerHTML = `
      <div class="small text-dim mb-8">${icon} ${label} — choisissez un équipement :</div>
      <div id="cbm-item-list" style="display:grid;gap:6px;margin-bottom:10px;">
        ${items.length
          ? items.map(it => `
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;border:1px solid var(--border);border-radius:4px;padding:8px;background:var(--bg3);">
              <input type="radio" name="cbm-item" value="${it.id}"> ${it.name}
            </label>`).join('')
          : '<div class="text-dim small">Aucun équipement de ce type équipé.</div>'}
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;border:1px solid var(--border);border-radius:4px;padding:8px;background:var(--bg3);">
          <input type="radio" name="cbm-item" value="__other"> Autre (saisir le nom)
        </label>
      </div>
      <input type="text" id="cbm-item-other-name" placeholder="Nom de l'objet" style="width:100%;box-sizing:border-box;display:none;">
      <input type="hidden" id="cbm-is-self" value="false">`;
    setTimeout(() => {
      document.querySelectorAll('input[name="cbm-item"]').forEach(r => {
        r.addEventListener('change', () => {
          const otherInput = document.getElementById('cbm-item-other-name');
          if (otherInput) otherInput.style.display = r.value === '__other' ? '' : 'none';
        });
      });
    }, 50);
  } else {
    targetSection.innerHTML = `<input type="hidden" id="cbm-is-self" value="false">`;
  }
}

function cbmSetTarget(mode) {
  const selfCard    = document.getElementById('cbm-target-self');
  const allyCard    = document.getElementById('cbm-target-ally');
  const allySection = document.getElementById('cbm-ally-name-section');
  const isSelfInput = document.getElementById('cbm-is-self');
  if (!selfCard || !allyCard) return;
  if (mode === 'self') {
    selfCard.style.borderColor = 'var(--green)';
    selfCard.style.background  = 'rgba(74,154,80,0.15)';
    allyCard.style.borderColor = 'var(--border)';
    allyCard.style.background  = 'var(--bg3)';
    allySection?.classList.add('hidden');
    if (isSelfInput) isSelfInput.value = 'true';
  } else {
    allyCard.style.borderColor = '#4a78b5';
    allyCard.style.background  = 'rgba(74,120,180,0.15)';
    selfCard.style.borderColor = 'var(--border)';
    selfCard.style.background  = 'var(--bg3)';
    allySection?.classList.remove('hidden');
    if (isSelfInput) isSelfInput.value = 'false';
  }
}

function cbmBackToStep1() {
  document.getElementById('cbm-step1')?.classList.remove('hidden');
  document.getElementById('cbm-step2')?.classList.add('hidden');
  _cbmSelectedDbId = null;
}

function cbmConfirmCast() {
  if (!_cbmSelectedDbId) return;
  const entry = BUFF_DB[_cbmSelectedDbId];
  if (!entry) return;

  const isSelfInput = document.getElementById('cbm-is-self');
  const isSelf      = isSelfInput ? isSelfInput.value === 'true' : entry.uiTargetType === 'self';

  let targetLabel = isSelf ? 'self' : '';
  if (!isSelf) {
    const allyInput = document.getElementById('cbm-ally-name');
    if (allyInput?.value?.trim()) targetLabel = allyInput.value.trim();
    const checkedItem = document.querySelector('input[name="cbm-item"]:checked');
    if (checkedItem) {
      if (checkedItem.value === '__other') {
        targetLabel = document.getElementById('cbm-item-other-name')?.value?.trim() || 'Objet inconnu';
      } else {
        const item = (AppState.inventory || []).find(it => it.id === checkedItem.value);
        targetLabel = item?.name || checkedItem.value;
      }
    }
  }

  const cl   = AppState.levels.length || 1;
  const buff = makeBuff(_cbmSelectedDbId, { casterLevel: cl, isSelf, target: targetLabel });
  if (!buff) return;

  // Mise à jour si le même sort est déjà dans AppState.buffs (isSelf uniquement)
  const existing = AppState.buffs.find(b => b.dbId === _cbmSelectedDbId && b.isSelf);
  if (existing && isSelf) {
    existing.isActive      = true;
    existing.casterLevel   = cl;
    existing.effects       = entry.effects(cl);
    existing.effectsLabel  = entry.effectsLabel ? entry.effectsLabel(cl) : '';
  } else {
    AppState.buffs.push(buff);
  }

  document.getElementById('cast-buff-modal').classList.add('hidden');
  renderAll();
}


// ═══════════════════════════════════════════════════════════
// SECTION 7 — Modal : Buff personnalisé
// ═══════════════════════════════════════════════════════════

function openAddBuffModal() {
  let modal = document.getElementById('add-buff-modal');
  if (modal) {
    document.getElementById('buff-name-input').value   = '';
    document.getElementById('buff-source-input').value = 'spell';
    document.getElementById('buff-dur-val').value      = '';
    const container = document.getElementById('buff-effects-builder');
    if (container) container.innerHTML = '';
    addEffectRow();
    modal.classList.remove('hidden');
    return;
  }
  modal           = document.createElement('div');
  modal.id        = 'add-buff-modal';
  modal.className = 'modal-overlay hidden';
  modal.onclick   = e => { if (e.target === modal) modal.classList.add('hidden'); };
  modal.innerHTML = `
    <div class="modal-content" style="max-width:480px;">
      <div class="modal-header">
        <span class="modal-title cinzel">+ Buff Personnalisé</span>
        <button class="modal-close" onclick="document.getElementById('add-buff-modal').classList.add('hidden')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input id="buff-name-input" type="text" placeholder="Ex: Bardic Inspiration" style="width:100%;">
        </div>
        <div class="form-group" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div>
            <label class="form-label">Type de source</label>
            <select id="buff-source-input" style="width:100%;">
              <option value="spell">Sort</option>
              <option value="item">Objet magique</option>
              <option value="feat">Don</option>
              <option value="class">Capacité de classe</option>
              <option value="racial">Racial</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label class="form-label">Cible</label>
            <select id="buff-target-self" style="width:100%;">
              <option value="true">Soi-même (Self)</option>
              <option value="false">Allié / Objet (Tier)</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div>
            <label class="form-label">Durée (valeur)</label>
            <input id="buff-dur-val" type="number" placeholder="10" style="width:100%;">
          </div>
          <div>
            <label class="form-label">Unité</label>
            <select id="buff-dur-unit" style="width:100%;">
              <option value="round">round(s)</option>
              <option value="minute">minute(s)</option>
              <option value="hour">heure(s)</option>
              <option value="day">jour(s)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Effets</label>
          <div id="buff-effects-builder"></div>
          <button class="btn btn-secondary btn-small mt-8" onclick="addEffectRow()">+ Ajouter un effet</button>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" onclick="addBuff()" style="flex:1;">Créer le buff</button>
          <button class="btn btn-secondary" onclick="document.getElementById('add-buff-modal').classList.add('hidden')">Annuler</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  addEffectRow();
  modal.classList.remove('hidden');
}

function addBuff() {
  const name = document.getElementById('buff-name-input')?.value?.trim();
  if (!name) return;

  const isSelf  = document.getElementById('buff-target-self')?.value === 'true';
  const rows    = document.querySelectorAll('.buff-effect-row');
  const effects = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input, select');
    const val    = parseInt(inputs[0]?.value);
    const btype  = inputs[1]?.value;
    const target = inputs[2]?.value;
    // Structure minimale requise par collectBonuses() : {target, bonusType, value}
    if (!isNaN(val)) effects.push({ target, bonusType: btype, value: val });
  });

  const buff = _makeCustomBuff({
    name,
    sourceType:      document.getElementById('buff-source-input')?.value || 'other',
    isSelf,
    durationFormula: `${document.getElementById('buff-dur-val')?.value || '?'} ${document.getElementById('buff-dur-unit')?.value || 'round'}`,
    effects,
  });

  AppState.buffs.push(buff);
  document.getElementById('add-buff-modal')?.classList.add('hidden');
  renderAll();
}


// ═══════════════════════════════════════════════════════════
// SECTION 8 — Helpers UI
// ═══════════════════════════════════════════════════════════

function addEffectRow() {
  const container = document.getElementById('buff-effects-builder');
  if (!container) return;
  const div = document.createElement('div');
  div.className   = 'buff-effect-row';
  div.style.cssText = 'display:grid;grid-template-columns:60px 1fr 1fr 24px;gap:6px;margin-bottom:6px;';
  div.innerHTML = `
    <input type="number" value="2" placeholder="+val">
    <select>
      <option value="enhancement">Enhancement</option>
      <option value="morale">Moral</option>
      <option value="luck">Chance</option>
      <option value="sacred">Sacré</option>
      <option value="profane">Profane</option>
      <option value="insight">Intuition</option>
      <option value="competence">Compétence</option>
      <option value="resistance">Résistance</option>
      <option value="deflection">Déflexion</option>
      <option value="natural_armor">Arm. naturelle</option>
      <option value="armor">Armure</option>
      <option value="shield">Bouclier</option>
      <option value="dodge">Esquive</option>
      <option value="circumstance">Circonstance</option>
      <option value="size">Taille</option>
      <option value="untyped">Sans type</option>
    </select>
    <select>
      <option value="ability.STR">Force</option>
      <option value="ability.DEX">Dextérité</option>
      <option value="ability.CON">Constitution</option>
      <option value="ability.INT">Intelligence</option>
      <option value="ability.WIS">Sagesse</option>
      <option value="ability.CHA">Charisme</option>
      <option value="defense.naturalArmor">Arm. naturelle</option>
      <option value="defense.armor">CA Armure</option>
      <option value="defense.shield">CA Bouclier</option>
      <option value="defense.deflection">Déflexion</option>
      <option value="defense.dodge">Esquive CA</option>
      <option value="combat.attack">Attaque</option>
      <option value="combat.damage">Dégâts</option>
      <option value="combat.initiative">Initiative</option>
      <option value="save.fortitude">JS Vigueur</option>
      <option value="save.reflex">JS Réflexes</option>
      <option value="save.will">JS Volonté</option>
      <option value="save.all">Tous JS</option>
      <option value="hp.temp">PV temporaires</option>
    </select>
    <button class="btn btn-danger btn-small" onclick="removeEffectRow(this)">×</button>`;
  container.appendChild(div);
}

function removeEffectRow(btn) {
  btn.closest('.buff-effect-row').remove();
}