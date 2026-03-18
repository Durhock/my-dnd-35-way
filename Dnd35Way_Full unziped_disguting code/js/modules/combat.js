// ============================================================
// combat.js — Onglet Combat (v2)
//
// Un seul écran, pas de sous-onglets.
// Ordre : Jets d'attaque → Tableau toucher → Jets de dégâts →
//         Tableau dégâts → Config armes → Bonus manuels → CA check
//
// Lit : AppState.combat, rules.js
// Ne lance PAS les dés — annonce les formules.
// ============================================================

// ── Arme active sélectionnée ─────────────────────────────────
let _activeWeaponId = null;

// ── Constantes ────────────────────────────────────────────────
const COMBAT_STATS    = ['STR','DEX','CON','INT','WIS','CHA'];
const COMBAT_STAT_FR  = { STR:'FOR', DEX:'DEX', CON:'CON', INT:'INT', WIS:'SAG', CHA:'CHA' };
const HAND_LABELS     = { main:'Principale', off:'Secondaire', two:'Deux mains', natural:'Naturelle', free:'Libre' };
const TYPE_LABELS     = { melee:'Mêlée', ranged:'Distance', natural:'Naturelle', other:'Autre' };
const BONUS_FR        = {
  enhancement:'Amélioration', morale:'Moral', luck:'Chance', competence:'Compétence',
  sacred:'Sacré', profane:'Profane', dodge:'Esquive', circumstance:'Circonstance',
  untyped:'Sans type', racial:'Racial', insight:'Intuition', penalty:'Malus'
};

const DEFAULT_WEAPONS = [
  { id:'wpn_1', label:'Mêlée 1',        type:'melee',   hand:'main',    visible:true  },
  { id:'wpn_2', label:'Mêlée 2',        type:'melee',   hand:'off',     visible:false },
  { id:'wpn_3', label:'Distance',       type:'ranged',  hand:'main',    visible:false },
  { id:'wpn_4', label:'Arme naturelle', type:'natural', hand:'natural', visible:false },
  { id:'wpn_5', label:'Libre / autre',  type:'other',   hand:'free',    visible:false },
];

// ── Init AppState.combat ─────────────────────────────────────
function _initCombatState() {
  if (!AppState.combat) AppState.combat = {};
  if (!AppState.combat.weapons)     AppState.combat.weapons     = DEFAULT_WEAPONS.map(_makeWeapon);
  if (!AppState.combat.globalBuffs) AppState.combat.globalBuffs = [];
  if (!AppState.combat.acTargets)   AppState.combat.acTargets   = [];
}

function _makeWeapon(d = {}) {
  return {
    id:           d.id    || 'wpn_' + Date.now(),
    label:        d.label || 'Arme',
    visible:      d.visible !== undefined ? d.visible : true,
    name:         d.name  || '',
    type:         d.type  || 'melee',
    hand:         d.hand  || 'main',
    attackStat:   d.attackStat   || 'STR',
    dmgDice:      d.dmgDice      || '1d8',
    dmgStat:      d.dmgStat      || 'STR',
    dmgStatMult:  d.dmgStatMult  !== undefined ? d.dmgStatMult : 1.0,
    critRange:    d.critRange    || 20,
    critMult:     d.critMult     || 2,
    range:        d.range        || '',
    notes:        d.notes        || '',
    enhancements: d.enhancements || 0,
    extraAttacks: d.extraAttacks || [],
    localBuffs:   d.localBuffs   || [],
  };
}

// ── Obtenir l'arme active ────────────────────────────────────
function _activeWeapon() {
  _initCombatState();
  const ws = AppState.combat.weapons;
  if (!ws.length) return _makeWeapon();
  // Chercher l'id sélectionné, fallback premier visible, fallback premier
  return ws.find(w => w.id === _activeWeaponId && w.visible)
      || ws.find(w => w.visible)
      || ws[0];
}

// ── Calcul séquence d'attaque ────────────────────────────────
function _calcAttack(wpn) {
  const bab     = getBAB();
  const stat    = wpn.attackStat || 'STR';
  const statMod = getMod(stat);
  const sizeMap = { Fine:8, Diminutive:4, Tiny:2, Small:1, Medium:0, Large:-1, Huge:-2, Gargantuan:-4, Colossal:-8 };
  const sizeAtt = sizeMap[AppState.character.size || 'Medium'] || 0;
  const enh     = wpn.enhancements || 0;
  const twf     = wpn.hand === 'off' ? -4 : 0;

  // Buffs actifs (AppState.buffs) via moteur
  const attList = collectBonuses('combat.attack');
  const { total: globalMisc, breakdown: attBreakdown } = resolveBonuses(attList, true);

  // Bonus locaux manuels actifs
  const localAtt = (wpn.localBuffs || [])
    .filter(b => b.active && (b.affects === 'attack' || b.affects === 'both'))
    .reduce((s, b) => s + (parseInt(b.value) || 0), 0);

  // Bonus globaux manuels actifs
  const globalAtt = (AppState.combat.globalBuffs || [])
    .filter(b => b.active && (b.affects === 'attack' || b.affects === 'both'))
    .reduce((s, b) => s + (parseInt(b.value) || 0), 0);

  const base = bab + statMod + sizeAtt + enh + globalMisc + localAtt + globalAtt + twf;

  // Séquence itérative
  const sequence = [];
  if (bab <= 0) {
    sequence.push(base);
  } else {
    let cur = bab;
    while (cur > 0) { sequence.push(base - (bab - cur)); cur -= 5; }
  }

  return { sequence, base, bab, statMod, sizeAtt, enh, globalMisc, globalAtt, localAtt, twf,
           stat, attBreakdown };
}

// ── Calcul dégâts ────────────────────────────────────────────
function _calcDamage(wpn) {
  const stat     = wpn.dmgStat || 'STR';
  const statMod  = getMod(stat);
  const mult     = parseFloat(wpn.dmgStatMult) || 1.0;
  const modFinal = Math.floor(statMod * mult);
  const enh      = wpn.enhancements || 0;

  const dmgList  = collectBonuses('combat.damage');
  const { total: globalMisc, breakdown: dmgBreakdown } = resolveBonuses(dmgList, true);

  const localDmg = (wpn.localBuffs || [])
    .filter(b => b.active && (b.affects === 'damage' || b.affects === 'both'))
    .reduce((s, b) => s + (parseInt(b.value) || 0), 0);

  const globalDmg = (AppState.combat.globalBuffs || [])
    .filter(b => b.active && (b.affects === 'damage' || b.affects === 'both'))
    .reduce((s, b) => s + (parseInt(b.value) || 0), 0);

  const total = modFinal + enh + globalMisc + localDmg + globalDmg;

  return { dice: wpn.dmgDice || '1d8', total, modFinal, mult, statMod, enh,
           globalMisc, globalDmg, localDmg, stat, dmgBreakdown };
}

// ── Formatage ────────────────────────────────────────────────
function _fmtSign(n) { return (n >= 0 ? '+' : '') + n; }
function _fmtDmg(d)  { return d.dice + (d.total !== 0 ? _fmtSign(d.total) : ''); }
function _fmtCrit(w) {
  const r = w.critRange || 20;
  return (r < 20 ? r + '–20' : '20') + '/×' + (w.critMult || 2);
}

// ─────────────────────────────────────────────────────────────
// RENDER PRINCIPAL — un seul écran
// ─────────────────────────────────────────────────────────────
function renderCombat() {
  _initCombatState();
  const el = document.getElementById('tab-combat');
  if (!el) return;

  const wpn  = _activeWeapon();
  if (wpn) _activeWeaponId = wpn.id;

  const att  = _calcAttack(wpn);
  const dmg  = _calcDamage(wpn);
  const crit = _fmtCrit(wpn);

  // ── Sélecteur d'arme ──────────────────────────────────────
  const weapons   = AppState.combat.weapons;
  const selectorHtml = weapons.map(w => `
    <button onclick="combatSelectWeapon('${w.id}')" class="btn btn-small ${w.id === wpn.id ? 'btn-primary' : 'btn-secondary'}"
      style="font-size:12px;padding:4px 12px;${!w.visible ? 'opacity:0.4;' : ''}">
      ${w.label || w.name || 'Arme'}
    </button>`).join('') + (weapons.length < 5
      ? `<button onclick="combatAddWeapon()" class="btn btn-secondary btn-small" style="font-size:11px;padding:4px 10px;">+ Arme</button>`
      : '');

  // ── Séquence d'attaque ────────────────────────────────────
  const mainSeqHtml = att.sequence.map((v, i) => `
    <div style="display:flex;align-items:baseline;gap:6px;">
      <span class="text-dim small" style="min-width:70px;">Attaque ${i + 1}</span>
      <span style="font-family:'Cinzel',serif;font-size:22px;color:var(--gold-light);font-weight:700;">d20 ${_fmtSign(v)}</span>
    </div>`).join('');

  const extraHtml = (wpn.extraAttacks || []).map(ea => `
    <div style="display:flex;align-items:baseline;gap:6px;">
      <span class="text-dim small" style="min-width:70px;">+ ${ea.source}</span>
      <span style="font-family:'Cinzel',serif;font-size:22px;color:var(--gold);font-weight:700;">d20 ${_fmtSign(att.base + (parseInt(ea.bonus) || 0))}</span>
    </div>`).join('');

  // ── Tableau toucher ───────────────────────────────────────
  const attRows = [
    ['BBA',              _fmtSign(att.bab),        att.bab !== 0],
    [COMBAT_STAT_FR[att.stat] || att.stat, _fmtSign(att.statMod), att.statMod !== 0],
    ['Taille',           _fmtSign(att.sizeAtt),    att.sizeAtt !== 0],
    ['Magie arme',       _fmtSign(att.enh),         att.enh !== 0],
  ];
  // Ajouter lignes issues du moteur (buffs actifs)
  att.attBreakdown.forEach(bd => {
    attRows.push([(BONUS_FR[bd.bonusType] || bd.bonusType) + ' (' + bd.source + ')', _fmtSign(bd.value), true]);
  });
  // Bonus globaux manuels attaque
  (AppState.combat.globalBuffs || []).filter(b => b.active && (b.affects === 'attack' || b.affects === 'both'))
    .forEach(b => attRows.push([(b.source || 'Manuel') + (b.bonusType ? ' [' + (BONUS_FR[b.bonusType]||b.bonusType) + ']' : ''), _fmtSign(parseInt(b.value)||0), true]));
  // Bonus locaux actifs attaque
  (wpn.localBuffs || []).filter(b => b.active && (b.affects === 'attack' || b.affects === 'both'))
    .forEach(b => attRows.push([(b.source || 'Local') + (b.bonusType ? ' [' + (BONUS_FR[b.bonusType]||b.bonusType) + ']' : ''), _fmtSign(parseInt(b.value)||0), true]));
  if (att.twf !== 0) attRows.push(['Bimanuel (main sec.)', _fmtSign(att.twf), true]);

  const attTableHtml = attRows.filter(r => r[2]).map(([label, val]) =>
    `<tr><td class="text-dim small" style="padding:2px 8px 2px 0;">${label}</td><td style="text-align:right;padding:2px 0;font-family:'Cinzel',serif;color:${val.startsWith('-')?'var(--red)':'var(--green)'};">${val}</td></tr>`
  ).join('') + `<tr style="border-top:1px solid var(--border);"><td class="cinzel small" style="padding:4px 8px 2px 0;color:var(--gold);">TOTAL</td><td style="text-align:right;font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:var(--gold-light);">${_fmtSign(att.base)}</td></tr>`;

  // ── Dégâts ────────────────────────────────────────────────
  const dmgDisplay = _fmtDmg(dmg);

  const dmgRows = [
    ['Dé de base',       dmg.dice,                           true],
    [COMBAT_STAT_FR[dmg.stat] + ' ×' + dmg.mult, _fmtSign(dmg.modFinal), dmg.modFinal !== 0],
    ['Magie arme',       _fmtSign(dmg.enh),                  dmg.enh !== 0],
  ];
  dmg.dmgBreakdown.forEach(bd =>
    dmgRows.push([(BONUS_FR[bd.bonusType] || bd.bonusType) + ' (' + bd.source + ')', _fmtSign(bd.value), true])
  );
  (AppState.combat.globalBuffs || []).filter(b => b.active && (b.affects === 'damage' || b.affects === 'both'))
    .forEach(b => dmgRows.push([(b.source || 'Manuel') + (b.bonusType ? ' [' + (BONUS_FR[b.bonusType]||b.bonusType) + ']' : ''), _fmtSign(parseInt(b.value)||0), true]));
  (wpn.localBuffs || []).filter(b => b.active && (b.affects === 'damage' || b.affects === 'both'))
    .forEach(b => dmgRows.push([(b.source || 'Local') + (b.bonusType ? ' [' + (BONUS_FR[b.bonusType]||b.bonusType) + ']' : ''), _fmtSign(parseInt(b.value)||0), true]));

  const dmgTableHtml = dmgRows.filter(r => r[2]).map(([label, val]) =>
    `<tr><td class="text-dim small" style="padding:2px 8px 2px 0;">${label}</td><td style="text-align:right;padding:2px 0;font-family:'Cinzel',serif;color:${String(val).startsWith('-')?'var(--red)':'var(--green)'};">${val}</td></tr>`
  ).join('') + `<tr style="border-top:1px solid var(--border);"><td class="cinzel small" style="padding:4px 8px 2px 0;color:var(--gold);">TOTAL</td><td style="text-align:right;font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:var(--text-bright);">${dmgDisplay}</td></tr>`;

  // ── Config armes (collapsible) ────────────────────────────
  const weaponFormsHtml = weapons.map((w, i) => _buildWeaponForm(w, i === 0)).join('');

  // ── Bonus manuels inline ──────────────────────────────────
  const bonusRowsHtml = (AppState.combat.globalBuffs || []).map((b, i) =>
    _buildBonusRow(b, i, wpn.id)
  ).join('');

  // ── AC targets ────────────────────────────────────────────
  const acHtml = (AppState.combat.acTargets || []).map((t, i) => _buildACRow(t, i)).join('');

  el.innerHTML = `
  <!-- ═══════════ SÉLECTEUR D'ARME ═══════════ -->
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
    <span class="cinzel small text-dim" style="letter-spacing:1px;font-size:10px;margin-right:4px;">ARME ACTIVE :</span>
    ${selectorHtml}
  </div>

  <!-- ═══════════ BLOC ATTAQUE ═══════════ -->
  <div class="panel mb-12">
    <div class="panel-header">
      <span class="panel-title cinzel" style="letter-spacing:2px;">⚔ ATTAQUE — ${wpn.label || wpn.name || 'Arme'}</span>
      <button class="btn btn-secondary btn-small" onclick="combatAddExtraAttack('${wpn.id}')" style="font-size:11px;">+ Attaque supp.</button>
    </div>
    <div class="panel-body" style="display:grid;grid-template-columns:1fr auto;gap:16px;">
      <!-- Séquence -->
      <div>
        ${mainSeqHtml}
        ${extraHtml}
      </div>
      <!-- Tableau toucher -->
      <div style="min-width:220px;">
        <div class="cinzel" style="font-size:9px;letter-spacing:2px;color:var(--gold-dim);margin-bottom:4px;">DÉCOMPOSITION TOUCHER</div>
        <table style="width:100%;border-collapse:collapse;">${attTableHtml}</table>
      </div>
    </div>
  </div>

  <!-- ═══════════ BLOC DÉGÂTS ═══════════ -->
  <div class="panel mb-12">
    <div class="panel-header">
      <span class="panel-title cinzel" style="letter-spacing:2px;">🎲 DÉGÂTS</span>
      <span class="text-dim small">Crit : ${crit}</span>
    </div>
    <div class="panel-body" style="display:grid;grid-template-columns:1fr auto;gap:16px;">
      <!-- Résultat -->
      <div>
        <div style="font-family:'Cinzel',serif;font-size:28px;color:var(--text-bright);font-weight:700;line-height:1.1;">${dmgDisplay}</div>
        <div class="text-dim small" style="margin-top:4px;">critique ${crit}</div>
        ${(wpn.localBuffs||[]).filter(b=>b.active && b.dmgNote).map(b=>`<div class="small" style="color:var(--gold-dim);margin-top:2px;">+ ${b.dmgNote}</div>`).join('')}
      </div>
      <!-- Tableau dégâts -->
      <div style="min-width:220px;">
        <div class="cinzel" style="font-size:9px;letter-spacing:2px;color:var(--gold-dim);margin-bottom:4px;">DÉCOMPOSITION DÉGÂTS</div>
        <table style="width:100%;border-collapse:collapse;">${dmgTableHtml}</table>
      </div>
    </div>
  </div>

  <!-- ═══════════ CONFIGURATION DES ARMES (repliable) ═══════════ -->
  <div class="panel mb-12">
    <div class="panel-header" onclick="combatToggleSection('combat-weapons-body')" style="cursor:pointer;">
      <span class="panel-title">⚙ CONFIGURATION DES ARMES</span>
      <span id="combat-weapons-toggle" class="text-dim small">▾ Déplier</span>
    </div>
    <div id="combat-weapons-body" class="hidden">
      ${weaponFormsHtml}
    </div>
  </div>

  <!-- ═══════════ BONUS MANUELS ═══════════ -->
  <div class="panel mb-12">
    <div class="panel-header">
      <span class="panel-title">✨ BONUS MANUELS (toucher / dégâts)</span>
      <button class="btn btn-secondary btn-small" onclick="combatAddGlobalBuff()">+ Ajouter</button>
    </div>
    <div id="combat-bonus-body" style="${(AppState.combat.globalBuffs||[]).length === 0 ? '' : ''}">
      ${(AppState.combat.globalBuffs||[]).length === 0
        ? '<div class="panel-body"><div class="text-dim small">Aucun bonus manuel. Les buffs actifs (onglet Buffs) sont déjà inclus.</div></div>'
        : `<table style="width:100%;font-size:12px;border-collapse:collapse;"><thead><tr style="border-bottom:1px solid var(--border);">
            <th class="text-dim small" style="text-align:left;padding:5px 8px;">Source</th>
            <th class="text-dim small" style="width:100px;">Type</th>
            <th class="text-dim small" style="width:80px;">Affecte</th>
            <th class="text-dim small" style="width:55px;text-align:center;">Valeur</th>
            <th class="text-dim small" style="width:50px;text-align:center;">Actif</th>
            <th style="width:28px;"></th></tr></thead>
            <tbody>${bonusRowsHtml}</tbody></table>`
      }
    </div>
  </div>

  <!-- ═══════════ CA CHECK CIBLES ═══════════ -->
  <div class="panel mb-12">
    <div class="panel-header">
      <span class="panel-title">🎯 CA CIBLES ESTIMÉES</span>
      <button class="btn btn-secondary btn-small" onclick="combatAddACTarget()">+ Cible</button>
    </div>
    <div id="combat-ac-body">
      ${(AppState.combat.acTargets||[]).length === 0
        ? '<div class="panel-body"><div class="text-dim small">Si jet de 22 rate et 25 touche → CA estimée 23–25.</div></div>'
        : `<div class="panel-body" style="display:flex;flex-wrap:wrap;gap:10px;">${acHtml}</div>`
      }
    </div>
  </div>`;
}

// ── Formulaire de configuration d'une arme ───────────────────
function _buildWeaponForm(w, expanded) {
  const bodyId = 'wpn-body-' + w.id;
  const statOpts = COMBAT_STATS.map(s =>
    `<option value="${s}" ${w.attackStat===s?'selected':''}>${COMBAT_STAT_FR[s]}</option>`).join('');
  const dmgStatOpts = COMBAT_STATS.map(s =>
    `<option value="${s}" ${w.dmgStat===s?'selected':''}>${COMBAT_STAT_FR[s]}</option>`).join('');
  const multOpts = ['0.5','1.0','1.5'].map(m =>
    `<option value="${m}" ${String(w.dmgStatMult)===m?'selected':''}>${m}×</option>`).join('');

  const extraHtml = (w.extraAttacks||[]).map((ea, ei) =>
    `<span style="background:var(--bg3);border:1px solid var(--gold-dim);border-radius:4px;padding:2px 7px;font-size:11px;display:inline-flex;gap:5px;align-items:center;">
      ${ea.source} ${_fmtSign(parseInt(ea.bonus)||0)}
      <button onclick="combatRemoveExtraAttack('${w.id}',${ei})" style="background:none;border:none;color:var(--red);cursor:pointer;padding:0;font-size:11px;">×</button>
    </span>`
  ).join('');

  return `
  <div class="panel-body" style="border-top:1px solid var(--border);padding-top:10px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <input type="checkbox" ${w.visible?'checked':''} onchange="combatToggleWeapon('${w.id}',this.checked)" title="Arme visible dans le sélecteur">
      <strong class="cinzel" style="color:var(--gold-dim);font-size:12px;">${w.label}</strong>
      <button class="btn btn-danger btn-small" onclick="combatRemoveWeapon('${w.id}')" style="margin-left:auto;">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Nom arme</label>
        <input type="text" value="${w.name||''}" placeholder="${w.label}" style="font-size:12px;"
          oninput="combatSetWeapon('${w.id}','name',this.value)"></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Label</label>
        <input type="text" value="${w.label||''}" style="font-size:12px;"
          oninput="combatSetWeapon('${w.id}','label',this.value);renderCombat()"></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Type</label>
        <select style="font-size:12px;" onchange="combatSetWeapon('${w.id}','type',this.value)">
          ${Object.entries(TYPE_LABELS).map(([v,l])=>`<option value="${v}" ${w.type===v?'selected':''}>${l}</option>`).join('')}
        </select></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Tenue</label>
        <select style="font-size:12px;" onchange="combatSetWeapon('${w.id}','hand',this.value);renderCombat()">
          ${Object.entries(HAND_LABELS).map(([v,l])=>`<option value="${v}" ${w.hand===v?'selected':''}>${l}</option>`).join('')}
        </select></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Bonus magie (+X)</label>
        <input type="number" value="${w.enhancements||0}" min="0" max="10" style="font-size:12px;"
          oninput="combatSetWeapon('${w.id}','enhancements',+this.value);renderCombat()"></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Stat toucher</label>
        <select style="font-size:12px;" onchange="combatSetWeapon('${w.id}','attackStat',this.value);renderCombat()">${statOpts}</select></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Dé de dégâts</label>
        <input type="text" value="${w.dmgDice||'1d8'}" style="font-size:12px;"
          oninput="combatSetWeapon('${w.id}','dmgDice',this.value);renderCombat()"></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Stat dégâts</label>
        <select style="font-size:12px;" onchange="combatSetWeapon('${w.id}','dmgStat',this.value);renderCombat()">${dmgStatOpts}</select></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Multiplicateur stat</label>
        <select style="font-size:12px;" onchange="combatSetWeapon('${w.id}','dmgStatMult',parseFloat(this.value));renderCombat()">${multOpts}</select></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Plage critique</label>
        <input type="number" value="${w.critRange||20}" min="14" max="20" style="font-size:12px;"
          oninput="combatSetWeapon('${w.id}','critRange',+this.value);renderCombat()"></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Mult. critique</label>
        <input type="number" value="${w.critMult||2}" min="2" max="5" style="font-size:12px;"
          oninput="combatSetWeapon('${w.id}','critMult',+this.value);renderCombat()"></div>
      <div class="form-group" style="margin:0;"><label style="font-size:10px;">Portée</label>
        <input type="text" value="${w.range||''}" placeholder="9 m…" style="font-size:12px;"
          oninput="combatSetWeapon('${w.id}','range',this.value)"></div>
    </div>
    <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
      <span class="text-dim small" style="font-size:10px;">Attaques supp. :</span>
      ${extraHtml}
      <button class="btn btn-secondary btn-small" onclick="combatAddExtraAttack('${w.id}')" style="font-size:11px;">+ Ajouter</button>
    </div>
    <div class="form-group" style="margin:8px 0 0;">
      <label style="font-size:10px;">Notes</label>
      <textarea rows="1" style="font-size:12px;resize:none;" placeholder="Effets spéciaux…"
        oninput="combatSetWeapon('${w.id}','notes',this.value)">${w.notes||''}</textarea>
    </div>
  </div>`;
}

// ── Ligne bonus manuel ────────────────────────────────────────
function _buildBonusRow(b, i, wpnId) {
  const typeOpts = Object.entries(BONUS_FR).filter(([k])=>k!=='penalty').map(([v,l]) =>
    `<option value="${v}" ${b.bonusType===v?'selected':''}>${l}</option>`).join('');
  return `<tr style="border-bottom:1px solid var(--border);">
    <td style="padding:4px 8px;"><input type="text" value="${b.source||''}" placeholder="Source (sort, don…)" style="width:100%;font-size:11px;"
      oninput="combatSetGlobalBuff(${i},'source',this.value)"></td>
    <td><select style="font-size:11px;width:100%;" onchange="combatSetGlobalBuff(${i},'bonusType',this.value)">${typeOpts}</select></td>
    <td><select style="font-size:11px;" onchange="combatSetGlobalBuff(${i},'affects',this.value)">
      <option value="attack" ${b.affects==='attack'?'selected':''}>Toucher</option>
      <option value="damage" ${b.affects==='damage'?'selected':''}>Dégâts</option>
      <option value="both"   ${b.affects==='both'  ?'selected':''}>Les deux</option>
    </select></td>
    <td><input type="number" value="${b.value||0}" style="width:50px;font-size:11px;text-align:center;"
      onchange="combatSetGlobalBuff(${i},'value',+this.value);renderCombat()"></td>
    <td style="text-align:center;"><input type="checkbox" ${b.active?'checked':''}
      onchange="combatSetGlobalBuff(${i},'active',this.checked);renderCombat()"></td>
    <td><button class="btn btn-danger btn-small" style="padding:1px 5px;" onclick="combatRemoveGlobalBuff(${i})">✕</button></td>
  </tr>`;
}

// ── Ligne cible CA ────────────────────────────────────────────
function _buildACRow(t, i) {
  const acStr = (t.acMin || t.acMax)
    ? `<span style="font-family:'Cinzel',serif;color:var(--gold);font-size:16px;">${t.acMin||'?'}–${t.acMax||'?'}</span>`
    : '<span class="text-dim small">—</span>';
  return `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px;min-width:180px;max-width:240px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <input type="text" value="${t.name||''}" placeholder="Nom cible" style="font-size:12px;font-family:'Cinzel',serif;background:none;border:none;border-bottom:1px solid var(--border);width:120px;color:var(--text-bright);"
        oninput="combatSetACTarget(${i},'name',this.value)">
      <button class="btn btn-danger btn-small" style="padding:1px 4px;" onclick="combatRemoveACTarget(${i})">✕</button>
    </div>
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
      <div class="form-group" style="margin:0;flex:1;"><label style="font-size:9px;">CA min</label>
        <input type="number" value="${t.acMin||''}" placeholder="—" style="font-size:12px;text-align:center;"
          onchange="combatSetACTarget(${i},'acMin',+this.value||0)"></div>
      <span class="text-dim" style="padding-top:16px;">–</span>
      <div class="form-group" style="margin:0;flex:1;"><label style="font-size:9px;">CA max</label>
        <input type="number" value="${t.acMax||''}" placeholder="—" style="font-size:12px;text-align:center;"
          onchange="combatSetACTarget(${i},'acMax',+this.value||0)"></div>
    </div>
    <div style="text-align:center;margin-bottom:6px;">${acStr}</div>
    <input type="text" value="${t.notes||''}" placeholder="Notes, DR, résistances…" style="width:100%;font-size:11px;"
      oninput="combatSetACTarget(${i},'notes',this.value)">
  </div>`;
}

// ── Mutations AppState.combat ─────────────────────────────────
function combatSelectWeapon(id) { _activeWeaponId = id; renderCombat(); }
function combatToggleSection(id) {
  const el = document.getElementById(id);
  const tog = document.getElementById(id.replace('-body','-toggle'));
  if (el) { el.classList.toggle('hidden'); }
  if (tog) { tog.textContent = el.classList.contains('hidden') ? '▾ Déplier' : '▴ Replier'; }
}

function combatSetWeapon(id, key, val) {
  _initCombatState();
  const w = AppState.combat.weapons.find(w => w.id === id);
  if (w) { w[key] = val; autosave(); }
}
function combatToggleWeapon(id, visible) {
  _initCombatState();
  const w = AppState.combat.weapons.find(w => w.id === id);
  if (w) { w.visible = visible; autosave(); renderCombat(); }
}
function combatAddWeapon() {
  _initCombatState();
  if (AppState.combat.weapons.length >= 5) return;
  const wpn = _makeWeapon({ label: 'Arme ' + (AppState.combat.weapons.length + 1) });
  AppState.combat.weapons.push(wpn);
  autosave(); renderCombat();
}
function combatRemoveWeapon(id) {
  _initCombatState();
  AppState.combat.weapons = AppState.combat.weapons.filter(w => w.id !== id);
  if (_activeWeaponId === id) _activeWeaponId = null;
  autosave(); renderCombat();
}

function combatAddExtraAttack(wpnId) {
  const src = prompt('Source (ex: Hâte, Tir rapide…):');
  if (!src) return;
  const bonus = parseInt(prompt('Modificateur spécial (0 si aucun):') || '0') || 0;
  const w = AppState.combat.weapons.find(w => w.id === wpnId);
  if (!w) return;
  if (!w.extraAttacks) w.extraAttacks = [];
  w.extraAttacks.push({ source: src, bonus });
  autosave(); renderCombat();
}
function combatRemoveExtraAttack(wpnId, idx) {
  const w = AppState.combat.weapons.find(w => w.id === wpnId);
  if (w && w.extraAttacks) { w.extraAttacks.splice(idx, 1); autosave(); renderCombat(); }
}

function combatAddGlobalBuff() {
  _initCombatState();
  AppState.combat.globalBuffs.push({ id:'gbuf_'+Date.now(), source:'', bonusType:'morale', affects:'attack', value:0, active:true });
  autosave(); renderCombat();
}
function combatSetGlobalBuff(i, key, val) {
  if (AppState.combat.globalBuffs[i]) { AppState.combat.globalBuffs[i][key] = val; autosave(); }
}
function combatRemoveGlobalBuff(i) {
  AppState.combat.globalBuffs.splice(i, 1); autosave(); renderCombat();
}

function combatAddACTarget() {
  _initCombatState();
  AppState.combat.acTargets.push({ id:'tgt_'+Date.now(), name:'', acMin:0, acMax:0, notes:'' });
  autosave(); renderCombat();
}
function combatSetACTarget(i, key, val) {
  if (AppState.combat.acTargets[i]) { AppState.combat.acTargets[i][key] = val; autosave(); }
}
function combatRemoveACTarget(i) {
  AppState.combat.acTargets.splice(i, 1); autosave(); renderCombat();
}

// ── Résumé fiche PJ ───────────────────────────────────────────
function renderCombatSummaryForSheet() {
  const el = document.getElementById('sheet-combat-summary');
  if (!el) return;
  _initCombatState();
  const visible = AppState.combat.weapons.filter(w => w.visible);
  if (!visible.length) {
    el.innerHTML = '<span class="text-dim small">Configurer dans l\'onglet Combat.</span>';
    return;
  }
  el.innerHTML = visible.map(w => {
    const att = _calcAttack(w);
    const dmg = _calcDamage(w);
    return `<div style="display:flex;align-items:baseline;gap:8px;padding:3px 0;border-bottom:1px solid var(--border);">
      <span class="cinzel" style="color:var(--gold-light);font-size:11px;min-width:80px;">${w.label||w.name}</span>
      <span style="font-family:'Cinzel',serif;color:var(--gold);font-size:13px;">${att.sequence.map(v => 'd20 ' + _fmtSign(v)).join(' / ')}</span>
      <span class="text-dim">·</span>
      <span style="font-size:13px;">${_fmtDmg(dmg)}</span>
      <span class="text-dim small">· ${_fmtCrit(w)}</span>
    </div>`;
  }).join('');
}
