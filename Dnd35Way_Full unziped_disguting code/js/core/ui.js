// ============================================================
// ui.js — Utilitaires UI partagés
//
// Fonctions :
//   showToast()              → notification temporaire
//   buildItemTooltipHtml()   → tooltip objet inventaire (HTML)
//   buildItemTooltip()       → tooltip objet (texte plat, legacy)
//   openMoneyModal()         → modal gestion monnaie
//   saveMoney()              → sauvegarde monnaie
//   applyMoneyTx()           → transaction rapide depuis modal
//   showBreakdown()          → modal décomposition d'un stat
//   closeModal()             → ferme un modal par ID
//   closeBreakdown()         → ferme le modal breakdown
//   showTab()                → navigation entre onglets
//   renderAll()              → re-render complet (fiche + onglet actif)
//   addLog()                 → entrée programmatique dans AppState.log[]
// ============================================================

function showToast(msg, type) {
  let el = document.getElementById('inv-toast');
  if (!el) { el=document.createElement('div'); el.id='inv-toast'; el.style.cssText='position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;opacity:0;transition:opacity 0.3s;'; document.body.appendChild(el); }
  el.textContent=msg;
  el.style.background = type==='success'?'rgba(80,160,80,0.9)':type==='error'?'rgba(180,60,60,0.9)':'rgba(80,120,200,0.9)';
  el.style.color='#fff'; el.style.opacity='1';
  clearTimeout(el._timer);
  el._timer=setTimeout(()=>{el.style.opacity='0';},2500);
}

function buildItemTooltipHtml(item) {
  const acq = ITEM_ACQTYPES.find(a=>a.id===item.acquisitionType)||{label:'?',color:'#888'};
  const catLabel = ITEM_CATEGORIES_FR[item.category]||item.category||'—';
  const SLOT_LABELS = {head:'Tête',neck:'Cou',shoulders:'Épaules',chest:'Torse',waist:'Taille',
    arms:'Bras',hands:'Mains',armor:'Armure',main_hand:'Main principale',off_hand:'Main secondaire',
    ring1:'Anneau gauche',ring2:'Anneau droit',feet:'Pieds',shield:'Bouclier',none:'Aucun'};
  const effects = (item.effects||[]).map(e =>
    `<div class="tt-eff">◆ ${e.bonusType.replace(/_/g,' ')} ${e.value>0?'+':''}${e.value} → ${e.target}</div>`
  ).join('');
  const priceDiff = item.officialPriceGp != null && item.officialPriceGp !== item.pricePaid;
  return `
    <div class="tt-name">${item.name}</div>
    <div class="tt-row"><span>Catégorie</span><span>${catLabel}</span></div>
    ${item.slot && item.slot!=='none'?`<div class="tt-row"><span>Emplacement</span><span>${SLOT_LABELS[item.slot]||item.slot}</span></div>`:''}
    ${item.quantity>1?`<div class="tt-row"><span>Quantité</span><span>×${item.quantity}</span></div>`:''}
    ${item.weightKg?`<div class="tt-row"><span>Poids</span><span>${item.weightKg} kg</span></div>`:''}
    ${item.officialPriceGp!=null?`<div class="tt-row"><span>Prix officiel</span><span>${item.officialPriceGp.toLocaleString()} po</span></div>`:''}
    <div class="tt-row"><span>${priceDiff?'Prix payé':'Valeur'}</span><span>${(item.pricePaid||item.valueGp||0).toLocaleString()} po</span></div>
    ${effects?`<div style="margin-top:5px;">${effects}</div>`:''}
    ${item.description?`<div class="tt-desc">${item.description}</div>`:''}
    <div class="tt-acq" style="color:${acq.color};">
      Origine : ${acq.label}${item.acquisitionNote?' — '+item.acquisitionNote:''}
    </div>`;
}

// Legacy plain-text tooltip (kept for non-JS title fallback)
function buildItemTooltip(item) {
  const acq = ITEM_ACQTYPES.find(a=>a.id===item.acquisitionType)||{label:'?'};
  return [
    item.name,
    `Catégorie: ${ITEM_CATEGORIES_FR[item.category]||item.category}`,
    item.slot && item.slot!=='none'?`Emplacement: ${item.slot}`:'',
    item.description||'',
    (item.effects||[]).map(e=>`${e.bonusType} ${e.value>0?'+':''}${e.value} → ${e.target}`).join('\n'),
    `Poids: ${item.weightKg||0} kg`,
    item.officialPriceGp!=null?`Prix officiel: ${item.officialPriceGp.toLocaleString()} po`:'',
    `Valeur: ${(item.pricePaid||item.valueGp||0).toLocaleString()} po`,
    `Origine: ${acq.label}${item.acquisitionNote?' — '+item.acquisitionNote:''}`,
  ].filter(Boolean).join('\n');
}

function openMoneyModal() {
  const m = AppState.wallet || {pp:0,gp:0,sp:0,cp:0};
  ['pp','gp','sp','cp'].forEach(c => {
    const el = document.getElementById('money-'+c);
    if (el) el.value = m[c]||0;
  });
  document.getElementById('money-modal').classList.remove('hidden');
}

function saveMoney() {
  if (!AppState.wallet) AppState.wallet = {pp:0,gp:0,sp:0,cp:0};
  ['pp','gp','sp','cp'].forEach(c => {
    const el = document.getElementById('money-'+c);
    if (el) AppState.wallet[c] = parseInt(el.value)||0;
  });
  autosave();
  closeModal('money-modal');
  renderInventory();
}

function applyMoneyTx(sign) {
  if (!AppState.wallet) AppState.wallet = {pp:0,gp:0,sp:0,cp:0};
  const coin = document.getElementById('money-tx-coin').value;
  const amt = parseInt(document.getElementById('money-tx-amount').value)||0;
  AppState.wallet[coin] = Math.max(0, (AppState.wallet[coin]||0) + sign * amt);
  const el = document.getElementById('money-'+coin);
  if (el) el.value = AppState.wallet[coin];
  autosave();
}

function showBreakdown(type) {
  const modal = document.getElementById('breakdown-modal');
  const title = document.getElementById('breakdown-modal-title');
  const content = document.getElementById('breakdown-modal-content');
  modal.classList.remove('hidden');

  // ── Helpers ──────────────────────────────────────────────────
  const TYPE_LABELS = {
    enhancement:'Amélioration', size:'Taille', morale:'Moral',
    luck:'Chance', sacred:'Sacré', profane:'Profane',
    inherent:'Inné', alchemical:'Alchimique', racial:'Racial',
    insight:'Intuition', competence:'Compétence', resistance:'Résistance',
    deflection:'Déflexion', natural_armor:'Armure naturelle', armor:'Armure',
    shield:'Bouclier', dodge:'Esquive (cumul)', circumstance:'Circonstance (cumul)',
    untyped:'Sans type (cumul)', penalty:'Malus', special:'Spécial',
  };
  const ABILITY_FULL = { STR:'Force', DEX:'Dextérité', CON:'Constitution', INT:'Intelligence', WIS:'Sagesse', CHA:'Charisme' };

  function renderBreakdownRows(rows) {
    return rows.map(r => {
      if (r.val === 0 && !r.always) return '';
      const valClass = r.val > 0 ? 'positive' : r.val < 0 ? 'negative' : 'zero';
      return `<div class="breakdown-row">
        <div>
          <div class="breakdown-label">${r.label}</div>
          ${r.source ? `<div class="small text-dim">${r.source}</div>` : ''}
          ${r.note   ? `<div class="small" style="color:var(--text-dim);font-style:italic;">${r.note}</div>` : ''}
        </div>
        <div class="breakdown-val ${valClass}">${r.val >= 0 && r.label !== 'Base' ? '+' : ''}${r.val}</div>
      </div>`;
    }).join('');
  }

  function renderSuppressed(byType) {
    let html = '';
    Object.entries(byType).forEach(([bt, g]) => {
      if (!g.suppressed?.length) return;
      g.suppressed.forEach(s => {
        html += `<div class="breakdown-row" style="opacity:0.5;">
          <div>
            <div class="breakdown-label" style="text-decoration:line-through;">${TYPE_LABELS[bt]||bt} — ${s.source}</div>
            <div class="small text-dim">Écarté (inférieur à +${g.active[0]?.value||0} de même type)</div>
          </div>
          <div class="breakdown-val ignored">+${s.value} ignoré</div>
        </div>`;
      });
    });
    return html;
  }

  // ── ability_X ────────────────────────────────────────────────
  if (type.startsWith('ability_')) {
    const ab = type.replace('ability_', '');
    const bd = getAbilityTotal(ab, true);
    const mod = getMod(ab);
    title.textContent = `Décomposition — ${ABILITY_FULL[ab] || ab}`;

    const fixedRows = [
      { label:'Base',                    val: bd.base,      always: true },
      { label:'Bonus racial',            val: bd.racial     },
      { label:'Montée de niveau',        val: bd.levelUp    },
      { label:'Inné (souhait…)',         val: bd.inherent   },
      { label:'Bonus temporaire (UI)',   val: bd.tempBonus  },
    ];
    let html = renderBreakdownRows(fixedRows);

    // Dynamic typed bonuses from items/buffs/abilities
    bd.breakdown.forEach(b => {
      const stacks = BONUS_STACKING_RULES[b.bonusType] === 'stack';
      html += `<div class="breakdown-row">
        <div>
          <div class="breakdown-label">${TYPE_LABELS[b.bonusType]||b.bonusType}${stacks ? ' (cumulable)' : ' (max)'}</div>
          <div class="small text-dim">${b.source}</div>
        </div>
        <div class="breakdown-val ${b.value > 0 ? 'positive' : b.value < 0 ? 'negative' : 'zero'}">${b.value >= 0 ? '+' : ''}${b.value}</div>
      </div>`;
    });

    html += `<div class="breakdown-total"><span>${ABILITY_FULL[ab]||ab}</span><span>${bd.total}</span></div>`;
    html += `<div class="flex-between"><span class="text-dim small">Modificateur</span><span class="text-gold cinzel" style="font-size:20px;">${mod >= 0 ? '+' : ''}${mod}</span></div>`;

    const suppressed = renderSuppressed(bd.byType);
    if (suppressed) {
      html += `<div class="section-divider"></div><div class="small text-dim mb-8">Bonus écartés (type en double, valeur inférieure) :</div>${suppressed}`;
    }
    content.innerHTML = html;
  }

  // ── CA ───────────────────────────────────────────────────────
  else if (type === 'ac' || type === 'ac-touch' || type === 'ac-ff') {
    title.textContent = 'Décomposition — Classe d\'Armure';
    const bd = getACComponents(true);
    const c = bd.components;

    const fixedRows = [
      { label:'Base',                    val:10,         always:true },
      { label:'Armure',                  val:c.armor,    note:'Highest only — cumule pas avec autre armure' },
      { label:'Bouclier',                val:c.shield,   note:'Highest only — cumule pas avec autre bouclier' },
      { label:'Dextérité (mod)',         val:c.dex       },
      { label:'Taille',                  val:c.size      },
      { label:'Armure naturelle',        val:c.natural,  note:'Highest only' },
      { label:'Déflexion',              val:c.deflect,  note:'Highest only — cumule avec bouclier' },
      { label:'Esquive',                 val:c.dodge,    note:'Toujours cumulable (Esquive, Hâte…)' },
      { label:'Chance',                  val:c.luck,     note:'Highest only' },
      { label:'Sacré',                   val:c.sacred,   note:'Highest only' },
      { label:'Intuition',              val:c.insight || 0, note:'Highest only' },
    ];
    let html = renderBreakdownRows(fixedRows);

    html += `<div class="breakdown-total"><span>CA totale</span><span>${bd.total}</span></div>`;
    html += `<div class="flex-between mt-8">
      <span class="text-dim small">CA Contact</span><span class="text-bright">${bd.touch}</span>
    </div>`;
    html += `<div class="flex-between">
      <span class="text-dim small">CA Pris au dépourvu</span><span class="text-bright">${bd.ff}</span>
    </div>`;

    // Stacking rule note
    html += `<div style="margin-top:10px;padding:8px;background:var(--bg4);border-radius:4px;border:1px solid var(--border);">
      <div class="cinzel small text-dim mb-4">RÈGLES D&D 3.5 — CUMUL CA</div>
      <div class="small text-dim">Bouclier ≠ Déflexion → <span style="color:var(--green);">cumulables</span></div>
      <div class="small text-dim">Deux boucliers → <span style="color:var(--red);">prendre le plus haut</span></div>
      <div class="small text-dim">Esquive → <span style="color:var(--green);">toujours cumulable</span></div>
    </div>`;

    const suppressed = renderSuppressed(bd.byType || {});
    if (suppressed) {
      html += `<div class="section-divider"></div><div class="small text-dim mb-8">Bonus écartés :</div>${suppressed}`;
    }
    content.innerHTML = html;
  }

  // ── Jets de sauvegarde ───────────────────────────────────────
  else if (type.startsWith('save_')) {
    const saveType = type.replace('save_', '');
    const saveNames = { fortitude:'Vigueur', reflex:'Réflexes', will:'Volonté' };
    const abMap = { fortitude:'CON', reflex:'DEX', will:'WIS' };
    title.textContent = `Décomposition — ${saveNames[saveType]}`;
    const bd = getSaveTotal(saveType, true);

    const fixedRows = [
      { label:'Base de classe',            val:bd.base,       always:true },
      { label:`Mod. ${abMap[saveType]}`,   val:bd.abilityMod  },
    ];
    let html = renderBreakdownRows(fixedRows);

    // All typed bonuses via new engine
    bd.breakdown.forEach(b => {
      const stacks = BONUS_STACKING_RULES[b.bonusType] === 'stack';
      html += `<div class="breakdown-row">
        <div>
          <div class="breakdown-label">${TYPE_LABELS[b.bonusType]||b.bonusType}${stacks?' (cumul)':' (max)'}</div>
          <div class="small text-dim">${b.source}</div>
        </div>
        <div class="breakdown-val ${b.value>0?'positive':b.value<0?'negative':'zero'}">${b.value>=0?'+':''}${b.value}</div>
      </div>`;
    });

    html += `<div class="breakdown-total"><span>${saveNames[saveType]}</span><span>${bd.total >= 0 ? '+' : ''}${bd.total}</span></div>`;

    const suppressed = renderSuppressed(bd.byType || {});
    if (suppressed) {
      html += `<div class="section-divider"></div><div class="small text-dim mb-8">Bonus écartés :</div>${suppressed}`;
    }
    content.innerHTML = html;
  }

  // ── BBA ──────────────────────────────────────────────────────
  else if (type === 'bab') {
    title.textContent = 'Décomposition — BBA / Bonus de Base à l\'Attaque';
    const bab = getBAB();
    let html = '';
    const classBabs = {};
    AppState.levels.forEach(lvl => {
      const cls = CLASS_REF[lvl.classId];
      if (!cls) return;
      if (!classBabs[lvl.classId]) classBabs[lvl.classId] = 0;
      const prog = cls.babProg;
      classBabs[lvl.classId] += prog==='full'?1 : prog==='medium'?0.75 : 0.5;
    });
    Object.entries(classBabs).forEach(([cid, val]) => {
      const cls = CLASS_REF[cid];
      html += `<div class="breakdown-row">
        <div class="breakdown-label">${cls?.name||cid}</div>
        <div class="breakdown-val positive">+${Math.floor(val)}</div>
      </div>`;
    });
    html += `<div class="breakdown-total"><span>BBA</span><span>${getBABProgressionString(bab)}</span></div>`;
    content.innerHTML = html;
  }

  // ── Initiative ───────────────────────────────────────────────
  else if (type === 'initiative') {
    title.textContent = 'Décomposition — Initiative';
    const init = getInitiative();
    content.innerHTML = `
      <div class="breakdown-row">
        <div class="breakdown-label">Modificateur de DEX</div>
        <div class="breakdown-val ${getMod('DEX')>=0?'positive':'negative'}">${getMod('DEX')>=0?'+':''}${getMod('DEX')}</div>
      </div>
      <div class="breakdown-total"><span>Initiative</span><span>${init>=0?'+':''}${init}</span></div>
    `;
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const el = document.getElementById(`tab-${tabId}`);
  if (el) el.classList.remove('hidden');
  // Highlight correct nav button
  const btn = document.querySelector(`.nav-tab[onclick="showTab('${tabId}')"]`);
  if (btn) btn.classList.add('active');

  if (tabId === 'build') {
    showBuildPage(currentBuildPage || 'generalinfo');
  }
  else if (tabId === 'sheet') renderSheet();
  // NEUTRALISÉ: else if (tabId === 'inventory') renderInventory();
  else if (tabId === 'inventory') renderInventory();
  // NEUTRALISÉ: else if (tabId === 'spells') renderSpells();
  // NEUTRALISÉ: else if (tabId === 'grimoire') renderGrimoire();
  else if (tabId === 'abilities') renderAbilities();
  else if (tabId === 'magic')     renderMagic();
  // NEUTRALISÉ: else if (tabId === 'combat')    renderCombat();
  // NEUTRALISÉ: else if (tabId === 'buffs') renderBuffs();
  else if (tabId === 'rules') renderRules();
  // NEUTRALISÉ: else if (tabId === 'log') renderLog();
  else if (tabId === 'journal') renderJournal();
  // NEUTRALISÉ: else if (tabId === 'magie')   renderMagie();
  else if (tabId === 'about') renderAbout();
  // Legacy wizard — redirected to Build (wizard replaced by Build module)
  else if (tabId === 'creation') { showTab('build'); return; }
  else if (tabId === 'levelup') renderLevelUp();
  else if (tabId === 'skills') renderSkills();
}

function renderAll() {
  renderSheet();
  // Re-render whichever tab is currently visible
  const active = document.querySelector('.tab-content:not(.hidden)');
  if (!active) return;
  const id = active.id.replace('tab-', '');
  if (id === 'build') showBuildPage(currentBuildPage || 'generalinfo');
  // NEUTRALISÉ: else if (id === 'inventory') renderInventory();
  else if (id === 'inventory') renderInventory();
  // NEUTRALISÉ: else if (id === 'spells') renderSpells();
  // NEUTRALISÉ: else if (id === 'grimoire') renderGrimoire();
  else if (id === 'abilities') renderAbilities();
  else if (id === 'magic')     renderMagic();
  // NEUTRALISÉ: else if (id === 'combat')    renderCombat();
  // NEUTRALISÉ: else if (id === 'buffs') renderBuffs();
  else if (id === 'skills') renderSkills();
  else if (id === 'rules') renderRules();
  else if (id === 'levelup') renderLevelUp();
  // NEUTRALISÉ: else if (id === 'magie')   renderMagie();
  else if (id === 'about') renderAbout();
}

function closeBreakdown() {
  document.getElementById('breakdown-modal').classList.add('hidden');
}
// Programmatic log entry — used by levelup.js and other modules
function addLog(icon, title, text) {
  AppState.log.unshift({
    id:   'log_' + Date.now(),
    date: new Date().toLocaleDateString('fr-FR'),
    text: `${icon} ${title} — ${text}`,
  });
  // Keep log bounded
  if (AppState.log.length > 500) AppState.log.length = 500;
}
