// ============================================================
// sheet.js — Affichage de la fiche personnage
//
// Responsabilité : AFFICHAGE UNIQUEMENT.
// Ce module lit AppState et appelle rules.js.
// Il ne contient aucune logique métier ni calcul de valeurs dérivées.
//
// ÉTAT DU MODULE (reprise 2025-03) :
//   VERIFIED     : toutes les fonctions _render* sont auditées et fonctionnelles.
//   KEEP-FOR-REUSE : _renderIdentity, _renderAbilityScores, _renderHP, _renderDefense,
//                    _renderCombat, _renderBuffQuickbar, renderSheetSkills,
//                    _renderDeclarativeDefenses, adjustHP, adjustTempHP.
//   TODO-FICHE   : Section 11 (renderAbilities + UI capacités) appartient à l'onglet
//                  CAPACITÉS, pas à la fiche. À déplacer dans abilities.js ou
//                  un futur capacities.js lors de l'ouverture du chantier CAPACITÉS.
//   DEPENDS-ON   : INVENTAIRE pour la table d'armes équipées dans _renderCombat.
//                  MAGIE pour le résumé des emplacements de sorts (non implémenté ici).
//
// Toutes les valeurs calculées viennent de rules.js :
//   getAbilityTotal()     → score de caractéristique
//   getMod()              → modificateur
//   getACComponents()     → CA / CA contact / CA pris au dépourvu
//   getSaveTotal()        → jets de sauvegarde
//   getBAB()              → bonus de base à l'attaque
//   getBABProgressionString() → chaîne "+10/+5/+0"
//   getInitiative()       → initiative
//   getGrappleBonus()     → lutte
//   getAttackBonus()      → bonus d'attaque d'une arme
//   getAttackSequence()   → séquence d'attaques
//   getHPMax()            → PV maximum
//   getSkillTotal()       → total d'une compétence
//
// SECTIONS :
//   1. Helpers d'affichage (sign, format)
//   2. Render — Identité
//   3. Render — Caractéristiques
//   4. Render — Points de vie
//   5. Render — Défense (CA, jets de sauvegarde)
//   6. Render — Combat offensif (BAB, attaques, déplacement)
//   7. Render — Buffs actifs
//   8. Render principal (renderSheet)
//   9. Render — Compétences (renderSheetSkills)
//  10. Mutations HP (adjustHP, adjustTempHP)
//  11. Capacités de classe (renderAbilities + UI bindings)
// ============================================================


// ═══════════════════════════════════════════════════════════
// SECTION 1 — Helpers d'affichage
// ═══════════════════════════════════════════════════════════

/** Formate un nombre avec signe : +3, −1, +0 */
function _sign(n) { return (n >= 0 ? '+' : '') + n; }

/** Retourne les icônes de classe par classId */
const _CLASS_ICONS = {
  class_cleric:'✡', class_wizard:'✦', class_fighter:'⚔', class_rogue:'🗡',
  class_druid:'🌿', class_paladin:'⚜', class_ranger:'🏹', class_bard:'♪',
  class_barbarian:'🪓', class_sorcerer:'🔮', class_monk:'☯'
};

/** Compte les niveaux par classe depuis AppState.levels */
function _classLevelCounts() {
  const counts = {};
  AppState.levels.forEach(l => { counts[l.classId] = (counts[l.classId] || 0) + 1; });
  return counts;
}


// ═══════════════════════════════════════════════════════════
// SECTION 2 — Render : Identité
// ═══════════════════════════════════════════════════════════

function _renderIdentity() {
  const chr = AppState.character;

  // Nav bar
  document.getElementById('nav-name').textContent  = chr.name || '—';
  document.getElementById('nav-level').textContent = chr.levelTotal ? `Nv.${chr.levelTotal}` : '';

  // Portrait
  const portraitWrap = document.getElementById('sheet-portrait-wrap');
  if (portraitWrap) {
    portraitWrap.innerHTML = chr.portrait
      ? `<div class="portrait-zone" style="cursor:default;border-style:solid;"><img src="${chr.portrait}" alt="Portrait" style="width:100%;height:100%;object-fit:cover;"></div>`
      : '';
  }

  // Icône classe principale
  const classIconEl = document.getElementById('sheet-class-icon');
  if (classIconEl) {
    const counts = _classLevelCounts();
    const primary = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '';
    classIconEl.textContent = _CLASS_ICONS[primary] || '⚔';
  }

  // Identité
  document.getElementById('sheet-name').textContent = chr.name || '—';
  const raceEntry = RACE_DB[chr.raceId];
  document.getElementById('sheet-identity').textContent =
    `${raceEntry ? raceEntry.nameFr : (chr.raceId || '—')} — ${chr.alignment || '—'} — Niv. ${chr.levelTotal || 0}`;
  document.getElementById('sheet-age').textContent    = chr.age || '—';
  document.getElementById('sheet-size').textContent   = chr.size || '—';
  document.getElementById('sheet-height').textContent = `${chr.heightMeters || '—'}m`;
  document.getElementById('sheet-weight').textContent = `${chr.weightKg || '—'}kg`;

  // Tags de classe
  const classDiv = document.getElementById('sheet-classes');
  classDiv.innerHTML = '';
  Object.entries(_classLevelCounts()).forEach(([cid, count]) => {
    const cls  = CLASS_REF[cid];
    const span = document.createElement('span');
    span.className   = 'tag tag-class';
    span.textContent = `${cls ? cls.name : cid} ${count}`;
    classDiv.appendChild(span);
  });
}


// ═══════════════════════════════════════════════════════════
// SECTION 3 — Render : Caractéristiques
// ═══════════════════════════════════════════════════════════

function _renderAbilityScores() {
  const container = document.getElementById('ability-cards-container');
  container.innerHTML = '';

  const abilityFullNames = {
    STR: t('ab_str'), DEX: t('ab_dex'), CON: t('ab_con'),
    INT: t('ab_int'), WIS: t('ab_wis'), CHA: t('ab_cha')
  };

  Object.keys(AppState.character.abilityScores).forEach(ab => {
    const scores   = AppState.character.abilityScores[ab];
    const total    = getAbilityTotal(ab);   // ← rules.js
    const mod      = getMod(ab);            // ← rules.js
    const hasTemp  = (scores.tempBonus || 0) !== 0;

    const card = document.createElement('div');
    card.className = 'ability-card';
    card.style.cursor = 'default';
    card.innerHTML = `
      <div class="ability-label" style="cursor:pointer;" onclick="showBreakdown('ability_${ab}')" title="Voir le détail">${abilityFullNames[ab]}</div>
      <div class="ability-score" style="cursor:pointer;" onclick="showBreakdown('ability_${ab}')">${total}</div>
      <div class="ability-mod"   style="cursor:pointer;" onclick="showBreakdown('ability_${ab}')">${_sign(mod)}</div>
      <div style="margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px;">
        <span style="font-size:10px;color:${hasTemp ? 'var(--gold)' : 'var(--text-dim)'};">±temp</span>
        <input type="number" value="${scores.tempBonus || 0}"
          style="width:42px;text-align:center;font-size:12px;padding:1px 2px;
                 background:${hasTemp ? 'rgba(201,147,58,0.15)' : 'var(--bg4)'};
                 border:1px solid ${hasTemp ? 'var(--gold)' : 'var(--border)'};
                 border-radius:3px;color:${hasTemp ? 'var(--gold-light)' : 'var(--text-dim)'};"
          onchange="setAbilityTempBonus('${ab}', this.value)"
          onclick="event.stopPropagation()"
          title="Bonus/malus temporaire (sort ennemi, poison, magie...)">
      </div>
      <div class="ability-breakdown-hint" onclick="showBreakdown('ability_${ab}')">▶ détail</div>
    `;
    container.appendChild(card);
  });
}


// ═══════════════════════════════════════════════════════════
// SECTION 4 — Render : Points de vie
// ═══════════════════════════════════════════════════════════

function _renderHP() {
  const chr   = AppState.character;
  const hpMax = getHPMax();   // ← rules.js
  const hpCur = Math.min(chr.hp.current, hpMax);
  chr.hp.current = hpCur;

  document.getElementById('hp-current').textContent = hpCur;
  document.getElementById('hp-max').textContent     = hpMax;

  const hpPct = hpMax > 0 ? Math.max(0, hpCur / hpMax * 100) : 0;
  const bar   = document.getElementById('hp-bar-fill');
  bar.style.width      = hpPct + '%';
  bar.style.background = hpPct > 50
    ? 'linear-gradient(90deg, var(--green-dim), var(--green))'
    : hpPct > 25
      ? 'linear-gradient(90deg, #7a6000, #c9a000)'
      : 'linear-gradient(90deg, var(--red-dim), var(--red))';
  document.getElementById('nav-hp-fill').style.width = hpPct + '%';

  // PV Temporaires
  // Source unique : chr.hp.temporary (boutons manuels + copié depuis buffs de sort au lancement)
  // Règle V1 : quand un sort avec hp.temp est lancé, le module Magie copie la valeur dans
  // chr.hp.temporary = Math.max(chr.hp.temporary, ef.value) — le compteur fait foi pour adjustHP
  const tempHP = chr.hp.temporary || 0;
  const tempEl = document.getElementById('hp-temp-val');
  tempEl.textContent = tempHP > 0 ? '+' + tempHP : tempHP;
  tempEl.style.color = tempHP > 0 ? '#ffffff' : 'rgba(255,255,255,0.35)';
  document.getElementById('hp-temp-bar').style.width = (hpMax > 0 ? Math.min(100, tempHP / hpMax * 100) : 0) + '%';

  // Condition D&D 3.5
  const condRow    = document.getElementById('hp-condition-row');
  const statusLabel = document.getElementById('hp-status-label');
  let condition = '', condColor = 'var(--text-dim)';
  if      (hpCur >= hpMax)  { condition = 'En pleine forme';        condColor = 'var(--green)'; }
  else if (hpCur >  0)      { condition = 'Blessé';                 condColor = 'var(--gold-dim)'; }
  else if (hpCur === 0)     { condition = 'Invalide (0 PV)';        condColor = 'var(--red)'; }
  else if (hpCur >= -9)     { condition = `Mourant (${hpCur} PV)`;  condColor = 'var(--red)'; }
  else                      { condition = 'Mort (-10 PV)';          condColor = 'var(--red)'; }
  statusLabel.textContent  = condition;
  statusLabel.style.color  = condColor;
  condRow.style.display    = hpCur < hpMax ? '' : 'none';
  condRow.innerHTML = `<span style="color:var(--text-dim)">ℹ️ Seuils : </span>
    <span style="color:var(--gold-dim)">Invalide à 0 PV</span> •
    <span style="color:var(--red-dim)">Mourant à -1–-9 PV</span> •
    <span style="color:var(--red)">Mort à -10 PV</span>`;
}


// ═══════════════════════════════════════════════════════════
// SECTION 5 — Render : Défense (CA, jets de sauvegarde)
// ═══════════════════════════════════════════════════════════

function _renderDefense() {
  const chr = AppState.character;

  // CA — valeurs issues de rules.js uniquement
  const ac = getACComponents();   // ← rules.js : { total, touch, ff }
  const tempAcTotal = (chr.tempAcMods || []).reduce((s, m) => s + (+m.value || 0), 0);

  document.getElementById('sheet-ac').textContent    = ac.total + tempAcTotal;
  document.getElementById('sheet-ac-touch').textContent = ac.touch + tempAcTotal;
  document.getElementById('sheet-ac-ff').textContent    = ac.ff   + tempAcTotal;

  // Composantes CA (détail inline)
  const acInline = document.getElementById('ac-components-inline');
  acInline.innerHTML = '';
  const acData   = getACComponents(true).components;  // ← rules.js
  const acLabels = {
    armor: t('ac_armor'), shield: t('ac_shield'), dex: 'DEX',
    size:  t('ac_size'),  natural: t('ac_natural'), deflect: t('ac_deflect'),
    dodge: t('ac_dodge'), luck:    t('ac_luck'),    sacred:  t('ac_sacred'), insight: t('ac_insight')
  };
  Object.entries(acData).forEach(([k, v]) => {
    if (v !== 0) {
      const span = document.createElement('span');
      span.className = 'ac-comp';
      span.innerHTML = `${acLabels[k] || k} <span>${_sign(v)}</span>`;
      acInline.appendChild(span);
    }
  });
  if (tempAcTotal !== 0) {
    const span = document.createElement('span');
    span.className   = 'ac-comp';
    span.style.borderColor = tempAcTotal > 0 ? 'var(--green)' : 'var(--red)';
    span.style.color       = tempAcTotal > 0 ? 'var(--green)' : 'var(--red)';
    span.innerHTML = `Temp <span>${_sign(tempAcTotal)}</span>`;
    acInline.appendChild(span);
  }

  // Inputs modificateurs CA temporaires
  const acTempWrap = document.getElementById('ac-temp-mods-wrap');
  if (acTempWrap) {
    acTempWrap.innerHTML = (chr.tempAcMods || []).map((m, i) => `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:5px;">
        <input type="number" value="${m.value || 0}" style="width:52px;text-align:center;font-size:12px;"
          onchange="AppState.character.tempAcMods[${i}].value=+this.value; renderSheet();" placeholder="0">
        <input type="text" value="${m.reason || ''}" style="flex:1;font-size:11px;"
          oninput="AppState.character.tempAcMods[${i}].reason=this.value;"
          placeholder="Raison (ex: charge, couvert…)">
      </div>`).join('');
  }

  // Jets de sauvegarde — values from rules.js
  const saveRow  = document.getElementById('save-row');
  saveRow.innerHTML = '';
  const saveData = [
    { key: 'fortitude', abbr: 'VIG', label: t('save_fort').toUpperCase() },
    { key: 'reflex',    abbr: 'REF', label: t('save_reflex').toUpperCase() },
    { key: 'will',      abbr: 'VOL', label: t('save_will').toUpperCase() },
  ];
  saveData.forEach(s => {
    const base      = getSaveTotal(s.key);  // ← rules.js
    const tempMods  = (chr.tempSaveMods || {})[s.key] || [];
    const tempTotal = tempMods.reduce((sum, m) => sum + (+m.value || 0), 0);
    const final     = base + tempTotal;

    const box = document.createElement('div');
    box.className = 'save-box';
    box.style.cursor = 'pointer';
    box.onclick      = () => showBreakdown('save_' + s.key);
    box.innerHTML    = `
      <div class="save-label">${s.abbr}</div>
      <div class="save-value">${_sign(final)}</div>
      ${tempTotal !== 0 ? `<div style="font-size:9px;color:${tempTotal>0?'var(--green)':'var(--red)'};">${_sign(tempTotal)} temp</div>` : ''}`;
    saveRow.appendChild(box);
  });

  // Inputs modificateurs de jets de sauvegarde temporaires
  const saveTempWrap = document.getElementById('save-temp-mods-wrap');
  if (saveTempWrap) {
    saveTempWrap.innerHTML = saveData.map(s => {
      const mods = (chr.tempSaveMods || {})[s.key] || [];
      return `<div style="margin-bottom:6px;">
        <div style="font-size:10px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:3px;">${s.label}</div>
        ${mods.map((m, i) => `
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:3px;">
          <input type="number" value="${m.value || 0}" style="width:52px;text-align:center;font-size:12px;"
            onchange="AppState.character.tempSaveMods['${s.key}'][${i}].value=+this.value;renderSheet();" placeholder="0">
          <input type="text" value="${m.reason || ''}" style="flex:1;font-size:11px;"
            oninput="AppState.character.tempSaveMods['${s.key}'][${i}].reason=this.value;"
            placeholder="Ex: béni, fatigué…">
        </div>`).join('')}
      </div>`;
    }).join('');
  }
}


// ═══════════════════════════════════════════════════════════
// SECTION 6 — Render : Combat offensif
// ═══════════════════════════════════════════════════════════

function _renderCombat() {
  const bab  = getBAB();          // ← rules.js
  const init = getInitiative();   // ← rules.js
  const grap = getGrappleBonus(); // ← rules.js

  document.getElementById('sheet-init').textContent    = _sign(init);
  document.getElementById('sheet-bab').textContent     = getBABProgressionString(bab);  // ← rules.js
  document.getElementById('sheet-grapple').textContent = _sign(grap);

  // Table d'attaques
  const tbody = document.getElementById('attack-table-body');
  tbody.innerHTML = '';

  // VERIFIED — Lot 4 INVENTAIRE.
  // Filtre : catégorie résolue depuis customItem.category OU ITEM_DB[id].cat
  // wData   : depuis customItem.wData OU ITEM_DB[id].wData
  // name    : override → customItem.name.fr → catalogue → instanceId
  // mode    : wData.range présente = distance, sinon mêlée
  // dmgEnh  : somme des effets combat.damage dans instanceEffects + base effects
  const equippedWeapons = AppState.inventory.filter(i => {
    if (!isEquipped(i.instanceId)) return false;
    const cat = i.customItem?.category || (i.itemDbId ? ITEM_DB[i.itemDbId]?.cat : null);
    return cat === 'weapon';
  });

  // Helper : résout le nom d'une instance sans dépendre de _instName (inventory.js)
  const _wName = inst => inst.overrides?.name
    || inst.customItem?.name?.fr
    || (inst.itemDbId ? ITEM_DB[inst.itemDbId]?.name : null)
    || inst.instanceId;

  // Helper : somme les bonus combat.damage d'une instance (instanceEffects + base effects)
  const _wDmgEnh = inst => {
    const base = inst.customItem?.effects || (inst.itemDbId ? ITEM_DB[inst.itemDbId]?.effects || [] : []);
    const inst_ = inst.instanceEffects || [];
    return [...base, ...inst_]
      .filter(e => e.target === 'combat.damage' && typeof e.value === 'number')
      .reduce((s, e) => s + e.value, 0);
  };

  if (equippedWeapons.length === 0) {
    // Attaque à mains nues via rules.js
    const unarmedBonus    = getAttackBonus(null, 'melee');    // ← rules.js
    const unarmedSequence = getAttackSequence(null, 'melee'); // ← rules.js
    const strMod          = getMod('STR');                    // ← rules.js
    const dmgStr          = '1d3' + (strMod !== 0 ? _sign(strMod) : '');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-dim">${t('lbl_unarmed')}</td>
      <td>${unarmedSequence.map(v => _sign(v)).join('/')}</td>
      <td>${dmgStr}</td>
      <td>×2</td>
      <td class="text-dim small">contondant</td>`;
    tbody.appendChild(tr);
  }

  equippedWeapons.forEach(weapon => {
    const db   = weapon.itemDbId ? ITEM_DB[weapon.itemDbId] : null;
    const wd   = weapon.customItem?.wData || db?.wData || {};
    const mode = wd.range ? 'ranged' : 'melee';
    const sequence = getAttackSequence(weapon, mode); // ← rules.js

    const abilMod = getMod(mode === 'ranged' ? 'DEX' : 'STR');
    const dmgEnh  = _wDmgEnh(weapon);
    const dmgMod  = abilMod + dmgEnh;
    const dmgBase = wd.damageMedium || '1d4';
    const dmgStr  = dmgBase + (dmgMod !== 0 ? _sign(dmgMod) : '');
    const crit    = wd.critical || '×2';
    const range   = wd.range ? ` · ${wd.range}` : '';
    const dmgType = (wd.damageType || []).join(', ');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-bright">${_wName(weapon)}</td>
      <td class="text-gold">${sequence.map(v => _sign(v)).join('/')}</td>
      <td>${dmgStr}</td>
      <td>${crit}</td>
      <td class="text-dim small">${dmgType}${range}</td>`;
    tbody.appendChild(tr);
  });

  // Déplacements
  const movePanel = document.getElementById('movement-panel');
  movePanel.innerHTML = '';
  const moveLabels = {
    land:   t('mv_land'),  fly:    t('mv_fly'),
    swim:   t('mv_swim'),  climb:  t('mv_climb'), burrow: t('mv_burrow')
  };
  let hasMove = false;
  Object.entries(AppState.character.movement).forEach(([k, v]) => {
    if (v > 0) {
      hasMove = true;
      const div = document.createElement('div');
      div.className = 'stat-box';
      const meters = Math.round(v * 0.3);
      div.innerHTML = `<div class="stat-label">${(moveLabels[k] || k).toUpperCase()}</div><div class="stat-value">${meters}m</div>`;
      movePanel.appendChild(div);
    }
  });
  if (!hasMove) {
    const div = document.createElement('div');
    div.className = 'stat-box';
    div.innerHTML = `<div class="stat-label">${t('mv_land').toUpperCase()}</div><div class="stat-value">9m</div>`;
    movePanel.appendChild(div);
  }
}


// ═══════════════════════════════════════════════════════════
// SECTION 7 — Render : Buffs actifs (quickbar fiche)
// ═══════════════════════════════════════════════════════════

function _renderBuffQuickbar() {
  // Quickbar désactivée (module BUFFS retiré de l'interface)
  const sheetBuffBar = document.getElementById('sheet-buff-quickbar');
  if (sheetBuffBar) sheetBuffBar.style.display = 'none';

  const summary = document.getElementById('active-buffs-summary');
  if (!summary) return;

  // Objets équipés ET actifs avec des effets calculés
  const activeItemEffects = typeof getActiveEquippedItems === 'function'
    ? getActiveEquippedItems().filter(item => {
        const db = item.itemDbId ? ITEM_DB[item.itemDbId] : null;
        const effects = item.customItem?.effects || db?.effects || item.instanceEffects || [];
        return effects.some(e => !e.descriptive && e.target && e.value !== 0);
      })
    : [];

  // Buffs de sorts actifs (flux MAGIE V1)
  const activeSpellBuffs = (AppState.buffs || []).filter(
    b => b.isActive && b.sourceType === 'spell' && b.grimoireId
  );

  if (activeItemEffects.length === 0 && activeSpellBuffs.length === 0) {
    summary.innerHTML = '<span class="text-dim small">Aucun effet actif</span>';
    return;
  }

  const _BONUS_LABELS_SHORT = {
    enhancement:'Alté.', morale:'Moral', luck:'Chance', sacred:'Sacré',
    resistance:'Rés.', deflection:'Défl.', natural_armor:'Arm.nat.',
    dodge:'Esq.', armor:'Armure', shield:'Bouclier', untyped:'',
  };
  const _TARGET_LABELS_SHORT = {
    'ability.STR':'FOR', 'ability.DEX':'DEX', 'ability.CON':'CON',
    'ability.INT':'INT', 'ability.WIS':'SAG', 'ability.CHA':'CHA',
    'defense.armor':'CA arm.', 'defense.shield':'CA boucl.',
    'defense.deflection':'CA défl.', 'defense.naturalArmor':'CA nat.',
    'defense.dodge':'CA esq.', 'defense.sacred':'CA sacré',
    'save.all':'Tous JS', 'save.fortitude':'VIG', 'save.reflex':'RÉF', 'save.will':'VOL',
    'combat.attack':'Attaque', 'combat.initiative':'Init.',
  };

  let html = '';

  // Section objets
  if (activeItemEffects.length > 0) {
    html += `<div class="cinzel" style="font-size:8px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:4px;">OBJETS</div>`;
    html += activeItemEffects.map(item => {
      const db = item.itemDbId ? ITEM_DB[item.itemDbId] : null;
      const name = item.customItem?.name?.fr || db?.name || item.instanceId;
      const effects = [...(item.customItem?.effects || db?.effects || []), ...(item.instanceEffects||[])]
        .filter(e => !e.descriptive && e.target && e.value !== 0);
      const effStr = effects.map(e => {
        const tl = _TARGET_LABELS_SHORT[e.target] || e.target;
        const bl = _BONUS_LABELS_SHORT[e.bonusType] || e.bonusType;
        const sign = e.value > 0 ? '+' : '';
        return `${tl} ${sign}${e.value}${bl?' ('+bl+')':''}`;
      }).join(', ');
      return `<div style="display:flex;align-items:baseline;gap:6px;padding:2px 0;
                          border-bottom:1px solid var(--border);">
        <span style="font-size:11px;color:var(--gold-dim);">✦</span>
        <span style="font-size:11px;color:var(--text-bright);flex:1;">${name}</span>
        <span style="font-size:10px;color:var(--green);">${effStr}</span>
      </div>`;
    }).join('');
  }

  // Section sorts
  if (activeSpellBuffs.length > 0) {
    if (activeItemEffects.length > 0) html += `<div style="margin-top:6px;"></div>`;
    html += `<div class="cinzel" style="font-size:8px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:4px;">SORTS</div>`;
    html += activeSpellBuffs.map(b => {
      const dur = b.durationText ? ` <span style="font-size:10px;color:var(--text-dim);">· ${b.durationText}</span>` : '';
      return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;
                          border-bottom:1px solid var(--border);">
        <span style="font-size:11px;color:var(--gold);">⚡</span>
        <span style="font-size:12px;color:var(--text-bright);flex:1;">${b.name}</span>${dur}
      </div>`;
    }).join('');
  }

  summary.innerHTML = html;
}


// ═══════════════════════════════════════════════════════════
// SECTION 8 — Render principal
// ═══════════════════════════════════════════════════════════

function renderSheet() {
  autosave();

  _renderIdentity();
  _renderAbilityScores();
  _renderHP();
  _renderDefense();
  _renderCombat();
  _renderBuffQuickbar();
  _renderDeclarativeDefenses();
  _renderBuffShortcuts();

  // updateSheetBuffPanel(); // NEUTRALISÉ
  renderSheetSkills('');
  // Résumé des profils d'arme configurés dans l'onglet Combat
  if (typeof renderCombatSummaryForSheet === 'function') renderCombatSummaryForSheet();
}


// ═══════════════════════════════════════════════════════════
// SECTION 8b — Render : Raccourcis buffs (fiche PJ)
// Affiche les sorts préparés lançables et les buffs actifs.
// Appelle _magCastSpell / _magEndBuff directement — zéro duplication de logique.
// ═══════════════════════════════════════════════════════════

function _renderBuffShortcuts() {
  const panel = document.getElementById('sheet-buff-shortcuts-panel');
  const el    = document.getElementById('sheet-buff-shortcuts');
  if (!panel || !el) return;

  const prepared = (AppState.preparedSpells || []).filter(ps => ps.state === 'prepared' || ps.state === 'cast');

  if (prepared.length === 0) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = '';

  el.innerHTML = prepared.map(ps => {
    const activeBuff = (AppState.buffs || []).find(b => b.preparedId === ps.id && b.isActive);
    const isCast     = ps.state === 'cast';
    const levelBadge = ps.level != null
      ? `<span style="font-size:9px;color:var(--text-dim);margin-left:4px;">Nv.${ps.level}</span>`
      : '';

    if (!isCast) {
      // Sort disponible → bouton Lancer
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;
                           border-bottom:1px solid var(--border);">
        <span style="flex:1;font-size:12px;color:var(--text-bright);">${ps.name}${levelBadge}</span>
        <button onclick="if(typeof _magCastSpell==='function')_magCastSpell('${ps.id}')"
          style="padding:3px 12px;font-family:Cinzel,serif;font-size:10px;letter-spacing:1px;
                 border-radius:4px;cursor:pointer;
                 background:rgba(180,140,60,0.2);border:1px solid var(--gold-dim);color:var(--gold);">
          ⚡ Lancer
        </button>
      </div>`;
    } else if (activeBuff) {
      // Sort lancé avec buff actif → badge + bouton Terminer
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;
                           border-bottom:1px solid var(--border);">
        <span style="font-size:11px;color:var(--green);">⚡</span>
        <span style="flex:1;font-size:12px;color:var(--text-bright);">${ps.name}${levelBadge}</span>
        <span style="font-size:10px;color:var(--green);font-style:italic;">Actif</span>
        <button onclick="if(typeof _magEndBuff==='function')_magEndBuff('${ps.id}')"
          style="padding:3px 10px;font-size:10px;border-radius:4px;cursor:pointer;
                 background:rgba(80,80,80,0.15);border:1px solid rgba(120,120,120,0.3);
                 color:var(--text-dim);">
          ⏹
        </button>
      </div>`;
    } else {
      // Sort lancé, buff terminé
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;
                           border-bottom:1px solid var(--border);opacity:0.5;">
        <span style="flex:1;font-size:12px;color:var(--text-dim);">${ps.name}${levelBadge}</span>
        <span style="font-size:10px;color:var(--text-dim);font-style:italic;">Terminé</span>
      </div>`;
    }
  }).join('');
}


// ═══════════════════════════════════════════════════════════
// SECTION 9 — Render : Compétences (dashboard fiche)
// ═══════════════════════════════════════════════════════════

function renderSheetSkills(filter) {
  const el = document.getElementById('sheet-skills-list');
  if (!el) return;
  const q = (filter || '').toLowerCase().trim();
  const abLabel = { STR:'FOR', DEX:'DEX', CON:'CON', INT:'INT', WIS:'SAG', CHA:'CHA' };

  const allSkills = Object.entries(SKILL_REF).map(([id, ref]) => {
    const entry = AppState.skillEntries.find(e => e.skillId === id) || { skillId: id, ranks: 0, misc: 0, classSkill: false };
    const total = getSkillTotal(entry);  // ← rules.js
    return { id, ref, entry, total };
  });

  const shown = q
    ? allSkills.filter(s => s.ref.name.toLowerCase().includes(q) || (abLabel[s.ref.keyAbility] || '').toLowerCase().includes(q))
    : allSkills.filter(s => s.entry.ranks > 0 || !q);

  shown.sort((a, b) => (b.entry.ranks - a.entry.ranks) || a.ref.name.localeCompare(b.ref.name));

  if (shown.length === 0) {
    el.innerHTML = '<div class="text-dim small text-center" style="padding:16px;">Aucune compétence</div>';
    return;
  }

  el.innerHTML = shown.map(s => {
    const tv   = s.total;
    const isCs = s.entry.classSkill;
    const hasR = s.entry.ranks > 0;
    return `<div style="display:flex;align-items:center;padding:5px 12px;border-bottom:1px solid var(--border);gap:8px;${hasR ? '' : 'opacity:0.45;'}">
      <span style="flex:1;font-size:12px;color:var(--text-bright);">${s.ref.name}</span>
      ${isCs ? '<span style="font-size:9px;color:var(--gold-dim);font-family:Cinzel,serif;">CC</span>' : ''}
      <span style="font-size:10px;color:var(--text-dim);width:26px;text-align:center;">${abLabel[s.ref.keyAbility] || '—'}</span>
      <span style="font-family:Cinzel,serif;font-size:13px;font-weight:700;
        color:${tv > 5 ? 'var(--gold-light)' : tv > 0 ? 'var(--text-bright)' : 'var(--text-dim)'};
        min-width:32px;text-align:right;">${_sign(tv)}</span>
    </div>`;
  }).join('');
}


// ═══════════════════════════════════════════════════════════
// SECTION 10 — Mutations HP
// ═══════════════════════════════════════════════════════════

function adjustHP(dir) {
  const val = parseInt(document.getElementById('hp-adj-val').value) || 1;
  const chr = AppState.character;
  const hpMax = getHPMax();  // ← rules.js

  if (dir < 0) {
    // Dégâts — absorbés par PV temporaires en premier (règle D&D 3.5)
    let dmg = val;
    const currentTemp = chr.hp.temporary || 0;
    if (currentTemp > 0) {
      const absorbed = Math.min(currentTemp, dmg);
      chr.hp.temporary = currentTemp - absorbed;
      dmg -= absorbed;
    }
    if (dmg > 0) chr.hp.current = Math.max(-10, chr.hp.current - dmg);
  } else {
    // Soins — ne restaure que les PV normaux
    chr.hp.current = Math.min(hpMax, chr.hp.current + val);
  }
  renderSheet();
}

function adjustTempHP(dir) {
  const val = parseInt(document.getElementById('hp-temp-adj').value) || 1;
  AppState.character.hp.temporary = Math.max(0, (AppState.character.hp.temporary || 0) + dir * val);
  renderSheet();
}


// ═══════════════════════════════════════════════════════════
// SECTION 11 — Capacités de classe (renderAbilities + UI bindings)
// TODO-FICHE : ce bloc n'appartient pas à sheet.js.
// Il gère l'onglet CAPACITÉS (renderAbilities, toggleAbility, charges…).
// À déplacer dans abilities.js ou un futur capacities.js.
// Pas de bug actif ici — déplacement à faire à l'ouverture du chantier CAPACITÉS.
// ═══════════════════════════════════════════════════════════

function renderAbilities() {
  const container  = document.getElementById('abilities-container');
  const customList = document.getElementById('custom-abilities-list');
  if (!container) return;
  container.innerHTML = '';

  const available  = getAvailableClassAbilities();  // ← rules.js
  const filterType = document.getElementById('ability-filter-type')?.value || '';
  const filterCat  = document.getElementById('ability-filter-cat')?.value  || '';
  const filtered   = available.filter(ab => {
    if (filterType && ab.type !== filterType)         return false;
    if (filterCat  && ab.category !== filterCat)      return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="small text-dim text-center" style="padding:20px;">Aucune capacité disponible avec ces filtres.<br>Ajoutez des niveaux de classe dans l\'onglet <strong>Level Up</strong>.</div>';
    return;
  }

  // Grouper par classe
  const byClass = {};
  filtered.forEach(ab => {
    const cls = CLASS_REF[ab.classId];
    const clsName = cls ? cls.name : ab.classId;
    (byClass[clsName] = byClass[clsName] || []).push(ab);
  });

  const catIcons   = { combat:'⚔️', defense:'🛡️', divine:'✨', transform:'🐺', exploration:'🗺️', social:'💬', special:'⭐' };
  const typeBadges = {
    active_toggle:  '<span class="ability-type-badge badge-active">ACTIF — TOGGLE</span>',
    active_limited: '<span class="ability-type-badge badge-limited">ACTIF — LIMITÉ</span>',
    passive:        '<span class="ability-type-badge badge-passive">PASSIF</span>',
  };

  Object.entries(byClass).forEach(([className, abilities]) => {
    const section  = document.createElement('div');
    section.style.marginBottom = '20px';
    const classHdr = document.createElement('div');
    classHdr.style.cssText = 'border-bottom:1px solid var(--border-bright);margin-bottom:10px;padding-bottom:6px;';
    classHdr.innerHTML = `<span class="cinzel" style="color:var(--gold-light);font-size:13px;letter-spacing:2px;">${className.toUpperCase()}</span>`;
    section.appendChild(classHdr);

    abilities.forEach(ab => {
      const stateKey   = `ca_state_${ab.id}`;
      const chargesKey = `ca_charges_${ab.id}`;
      const isActive   = AppState.abilityStates?.[stateKey] || false;
      const usedCharges = AppState.abilityStates?.[chargesKey] || 0;
      const classLvl   = ab.classLvl;

      // Calcul max charges : délégué à getTurnUndeadInfo pour le turn undead, formules simples sinon
      let maxCharges = 0;
      if (ab.type === 'active_limited') {
        if      (ab.id === 'ca_turn_undead')    maxCharges = getTurnUndeadInfo().total;  // ← rules.js
        else if (ab.id === 'ca_smite_evil')     maxCharges = 1 + Math.floor(classLvl / 5);
        else if (ab.id === 'ca_remove_disease') maxCharges = Math.floor(classLvl / 3);
        else if (ab.resource?.per === 'week')   maxCharges = Math.floor(classLvl / 3);
        else                                    maxCharges = Math.max(1, 1 + Math.floor((classLvl - 1) / 4));
      }

      const card = document.createElement('div');
      card.className = `ability-card-class ${ab.type === 'active_toggle' && isActive ? 'active-toggle' : ab.type === 'passive' ? 'passive' : ''}`;

      let controlHtml = '';
      if (ab.type === 'active_toggle') {
        controlHtml = `
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn btn-small ${isActive ? 'btn-danger' : 'btn-primary'}" onclick="toggleAbility('${ab.id}')">
              ${isActive ? t('btn_deactivate') : t('btn_activate')}
            </button>
            ${isActive ? '<span style="color:var(--green);font-size:11px;font-style:italic;">⚡ EN COURS</span>' : ''}
          </div>`;
      } else if (ab.type === 'active_limited') {
        const pips = Array(maxCharges).fill(0).map((_, i) =>
          `<div class="charge-pip ${i < usedCharges ? 'used' : 'available'}"
            onclick="toggleAbilityCharge('${ab.id}', ${i})"
            title="${i < usedCharges ? 'Utilisée' : 'Disponible'}"></div>`
        ).join('');
        controlHtml = `
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="display:flex;gap:3px;flex-wrap:wrap;">${pips}</div>
            <span class="small text-dim">${maxCharges - usedCharges}/${maxCharges}</span>
            <button class="btn btn-secondary btn-small" onclick="useAbilityCharge('${ab.id}')">Utiliser</button>
          </div>`;
      } else {
        controlHtml = '<span class="small text-dim" style="font-style:italic;">Toujours actif</span>';
      }

      card.innerHTML = `
        <div class="ability-header" onclick="toggleAbilityDetail('detail_${ab.id}')">
          <span style="font-size:16px;">${catIcons[ab.category] || '•'}</span>
          ${typeBadges[ab.type] || ''}
          <span style="flex:1;font-size:14px;color:${isActive ? 'var(--gold-light)' : 'var(--text-bright)'};font-weight:600;">${ab.name}</span>
          <span style="font-size:11px;color:var(--text-dim);">nv.${ab.minLevel}+</span>
          <span style="color:var(--text-dim);font-size:11px;">▼</span>
        </div>
        <div style="padding:0 14px 10px 14px;">${controlHtml}</div>
        <div id="detail_${ab.id}" style="display:none;padding:10px 14px;border-top:1px solid var(--border);font-size:13px;">
          <div style="font-style:italic;color:var(--text-dim);margin-bottom:8px;">${ab.desc}</div>
          ${ab.mechanic ? `<div class="info-box" style="margin-bottom:6px;"><strong>⚙️ Mécanique :</strong> ${ab.mechanic}</div>` : ''}
          ${ab.formula  ? `<div><span class="text-dim">Formule :</span> <code style="background:var(--bg4);padding:1px 6px;border-radius:2px;color:var(--gold);">${ab.formula.replace('barbLvl',classLvl).replace('clericLvl',classLvl).replace('palLvl',classLvl).replace('druidLvl',classLvl).replace('rogueLvl',classLvl)}</code></div>` : ''}
          ${ab.subChoices ? `<div style="margin-top:8px;"><span class="small text-dim">Sous-formes :</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">${ab.subChoices.filter(sc => classLvl >= sc.minLevel).map(sc => `<span style="background:var(--bg4);border:1px solid var(--border);padding:2px 8px;border-radius:10px;font-size:12px;">${sc.label}</span>`).join('')}</div></div>` : ''}
          <div class="small text-dim mt-8">Source : ${ab.source}</div>
        </div>`;

      section.appendChild(card);
    });

    container.appendChild(section);
  });

  // Capacités custom
  if (customList) {
    const customAbs = AppState.classAbilities?.filter(ab => ab.isCustom) || [];
    customList.innerHTML = '';
    customAbs.forEach(ab => {
      const div = document.createElement('div');
      div.style.cssText = 'background:var(--bg3);border:1px solid var(--gold-dim);border-radius:4px;padding:12px 14px;margin-bottom:8px;';
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="background:rgba(201,147,58,0.2);color:var(--gold);border:1px solid var(--gold-dim);padding:1px 6px;border-radius:8px;font-size:9px;">CUSTOM</span>
          <span style="font-size:14px;font-weight:600;color:var(--gold-light);">${ab.name}</span>
          <span style="margin-left:auto;"></span>
          <button class="btn btn-danger btn-small" onclick="removeCustomAbility('${ab.id}')">×</button>
        </div>
        <div class="small text-dim" style="font-style:italic;">${ab.desc || ''}</div>
        ${ab.maxCharges > 0 ? `
          <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
            <div style="display:flex;gap:3px;">${Array(ab.maxCharges).fill(0).map((_,i)=>`<div class="charge-pip ${i<(ab.usedCharges||0)?'used':'available'}" onclick="toggleCustomAbilityCharge('${ab.id}',${i})"></div>`).join('')}</div>
            <span class="small text-dim">${ab.maxCharges-(ab.usedCharges||0)}/${ab.maxCharges}</span>
          </div>` : ''}`;
      customList.appendChild(div);
    });
  }
}

// ── UI bindings — Capacités ──────────────────────────────────

function toggleAbility(abId) {
  if (!AppState.abilityStates) AppState.abilityStates = {};
  AppState.abilityStates[`ca_state_${abId}`] = !AppState.abilityStates[`ca_state_${abId}`];
  renderAbilities();
  renderSheet(); // recalculer CA / stats si la capacité a des effets
}

function toggleAbilityDetail(detailId) {
  const el = document.getElementById(detailId);
  if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
}

function useAbilityCharge(abId) {
  if (!AppState.abilityStates) AppState.abilityStates = {};
  const key = `ca_charges_${abId}`;
  const cur = AppState.abilityStates[key] || 0;
  const max = abId === 'ca_turn_undead' ? getTurnUndeadInfo().total : 10;  // ← rules.js
  if (cur < max) AppState.abilityStates[key] = cur + 1;
  renderAbilities();
}

function toggleAbilityCharge(abId, idx) {
  if (!AppState.abilityStates) AppState.abilityStates = {};
  const key = `ca_charges_${abId}`;
  const cur = AppState.abilityStates[key] || 0;
  AppState.abilityStates[key] = idx < cur ? idx : idx + 1;
  renderAbilities();
}

function toggleCustomAbilityCharge(abId, idx) {
  const ab = AppState.classAbilities?.find(a => a.id === abId);
  if (!ab) return;
  ab.usedCharges = idx < (ab.usedCharges || 0) ? idx : idx + 1;
  renderAbilities();
}

function removeCustomAbility(id) {
  AppState.classAbilities = (AppState.classAbilities || []).filter(a => a.id !== id);
  renderAbilities();
}

function openCustomAbilityModal() {
  let modal = document.getElementById('custom-ability-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'custom-ability-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:480px;">
        <div class="modal-header">
          <span class="modal-title">➕ CAPACITÉ PERSONNALISÉE</span>
          <button class="modal-close" onclick="this.closest('.modal-overlay').classList.add('hidden')">×</button>
        </div>
        <div class="modal-body" style="display:grid;gap:10px;">
          <div><label class="form-label">Nom *</label><input id="cab-name" class="form-input" placeholder="Ex: Rage de la Panthère…"></div>
          <div><label class="form-label">Description / Effets</label><textarea id="cab-desc" class="form-input" rows="2" placeholder="Décrivez les effets…"></textarea></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>
              <label class="form-label">Type</label>
              <select id="cab-type" class="form-input">
                <option value="active_limited">Actif — Limité/jour</option>
                <option value="active_toggle">Actif — Toggle</option>
                <option value="passive">Passif</option>
              </select>
            </div>
            <div>
              <label class="form-label">Charges max (si limité)</label>
              <input id="cab-charges" type="number" min="0" max="99" value="3" class="form-input">
            </div>
          </div>
          <button class="btn btn-primary" onclick="saveCustomAbility()" style="margin-top:8px;">Créer</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.classList.remove('hidden');
}

function saveCustomAbility() {
  const name = document.getElementById('cab-name').value.trim();
  if (!name) return alert('Nom requis');
  const ab = {
    id:          'custom_ab_' + Date.now(),
    isCustom:    true,
    name,
    desc:        document.getElementById('cab-desc').value,
    type:        document.getElementById('cab-type').value,
    maxCharges:  parseInt(document.getElementById('cab-charges').value) || 0,
    usedCharges: 0,
  };
  if (!AppState.classAbilities) AppState.classAbilities = [];
  AppState.classAbilities.push(ab);
  document.getElementById('custom-ability-modal').classList.add('hidden');
  renderAbilities();
}

// ══════════════════════════════════════════════════════════════
// DÉFENSES DÉCLARATIVES — DR / Immunités / Résistances
// ══════════════════════════════════════════════════════════════
function _renderDeclarativeDefenses() {
  const el = document.getElementById('sheet-declarative-defenses');
  if (!el) return;
  const def = AppState.character.defenses || { dr:[], immunities:[], resistances:[] };

  const chip = (text, onDel) => `
    <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px 2px 10px;
                 border-radius:12px;background:var(--bg3);border:1px solid var(--border);
                 font-size:11px;color:var(--text-bright);margin:2px;">
      ${text}
      <button onclick="${onDel}" style="background:none;border:none;cursor:pointer;
              color:var(--text-dim);font-size:11px;padding:0 2px;line-height:1;">✕</button>
    </span>`;

  const section = (title, items, addFn) => `
    <div style="margin-bottom:8px;">
      <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;
                  color:var(--gold-dim);margin-bottom:4px;">${title}</div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;align-items:center;">
        ${items || '<span style="font-size:11px;color:var(--text-dim);font-style:italic;">aucune</span>'}
        <button onclick="${addFn}"
          style="font-size:10px;padding:1px 8px;border-radius:10px;border:1px dashed var(--border);
                 background:transparent;cursor:pointer;color:var(--text-dim);margin:2px;">+ Ajouter</button>
      </div>
    </div>`;

  const drChips  = (def.dr||[]).map((d,i) =>
    chip(`RD ${d.value}/${d.type}`, `_sheetDefenseDelete('dr',${i})`)).join('');
  const immChips = (def.immunities||[]).map((d,i) =>
    chip(`Immunite : ${d.type}`, `_sheetDefenseDelete('immunity',${i})`)).join('');
  const resChips = (def.resistances||[]).map((d,i) =>
    chip(`Res. ${d.type} ${d.value}`, `_sheetDefenseDelete('resistance',${i})`)).join('');

  el.innerHTML = `
    <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:6px;">
      DEFENSES SPECIALES
    </div>
    ${section('REDUCTION DE DEGATS', drChips, "_sheetDefenseAdd('dr')")}
    ${section('IMMUNITES',           immChips, "_sheetDefenseAdd('immunity')")}
    ${section('RESISTANCES',         resChips, "_sheetDefenseAdd('resistance')")}`;
}

function _sheetDefenseAdd(type) {
  if (!AppState.character.defenses)
    AppState.character.defenses = { dr:[], immunities:[], resistances:[] };
  const def = AppState.character.defenses;
  if (type === 'dr') {
    const v = prompt('Valeur (ex: 5/argent, 10/magie, 5/tout):', '5/argent');
    if (!v) return;
    const m = v.match(/^(\d+)\/(.+)$/);
    def.dr.push(m ? { value: parseInt(m[1]), type: m[2].trim(), note:'' }
                  : { value: 0, type: v.trim(), note:'' });
  } else if (type === 'immunity') {
    const v = prompt('Type (ex: poison, feu, peur):', '');
    if (!v) return;
    def.immunities.push({ type: v.trim(), note:'' });
  } else {
    const v = prompt('Type valeur (ex: feu 10):', '');
    if (!v) return;
    const m = v.match(/^(\w+)\s+(\d+)$/);
    def.resistances.push(m ? { type: m[1], value: parseInt(m[2]), note:'' }
                           : { type: v.trim(), value: 0, note:'' });
  }
  autosave();
  _renderDeclarativeDefenses();
}

function _sheetDefenseDelete(type, idx) {
  const def = AppState.character.defenses;
  if (!def) return;
  if (type === 'dr')         def.dr.splice(idx, 1);
  else if (type === 'immunity')   def.immunities.splice(idx, 1);
  else if (type === 'resistance') def.resistances.splice(idx, 1);
  autosave();
  _renderDeclarativeDefenses();
}
