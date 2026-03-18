function renderGrimoire() {
  const wisMod = getMod('WIS');
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const clericLvl = classLevels['class_cleric'] || 0;

  // ── Emplacements du jour ──────────────────────────────────
  const slotsPanel = document.getElementById('grimoire-slots-panel');
  if (slotsPanel) {
    slotsPanel.innerHTML = '';
    if (clericLvl > 0) {
      const slotsPerDay = getClericSlotsPerDay(clericLvl, wisMod);
      // Calculer les slots utilisés = sorts lancés (state:cast) par niveau
      const usedByLevel = {};
      (AppState.preparedSpells||[]).filter(p => p.state === 'cast').forEach(p => {
        const lvl = p.preparedLevel ?? p.baseLevel ?? 0;
        usedByLevel[lvl] = (usedByLevel[lvl]||0) + 1;
      });

      slotsPerDay.forEach((total, lvl) => {
        if (total === 0 && lvl > 0) return;
        const used = usedByLevel[lvl] || 0;
        const free = total - used;
        const label = lvl === 0 ? t('lbl_cantrips') : `Nv ${lvl}`;
        const dc = lvl === 0 ? '—' : `DC ${10+lvl+wisMod}`;
        const dots = Array(total).fill(0).map((_,i) => {
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

      // Recap total
      const totalSlots = slotsPerDay.reduce((s,v)=>s+v,0);
      const totalUsed  = Object.values(usedByLevel).reduce((s,v)=>s+v,0);
      const recap = document.createElement('div');
      recap.style.cssText = 'border-top:1px solid var(--border);padding-top:8px;margin-top:4px;';
      recap.innerHTML = `<div class="flex-between small">
        <span class="text-dim">Total utilisés</span>
        <span class="text-bright"><strong>${totalUsed}</strong>/${totalSlots}</span>
      </div>`;
      slotsPanel.appendChild(recap);

    } else {
      slotsPanel.innerHTML = '<div class="text-dim small">Pas de classe de lanceur.</div>';
    }
  }

  renderGrimoirePrepared();
}

function renderGrimoirePrepared() {
  const panel  = document.getElementById('grimoire-prepared-panel');
  const countEl = document.getElementById('grimoire-prepared-count');
  if (!panel) return;

  // Migrer les anciens spellbook vers preparedSpells si nécessaire
  if ((AppState.spellbook||[]).length > 0 && (AppState.preparedSpells||[]).length === 0) {
    AppState.spellbook.forEach(entry => {
      AppState.preparedSpells = AppState.preparedSpells || [];
      const sp = (typeof SPELL_DB !== 'undefined') ? SPELL_DB[entry.spellId] : null;
      AppState.preparedSpells.push({
        id: entry.id,
        dbId: entry.spellId,
        name: entry.spellName || (sp?.name||entry.spellId),
        baseLevel: entry.slotLevel,
        preparedLevel: entry.slotLevel,
        metamagic: [],
        divineMetamagicUsed: 0,
        state: entry.used ? 'cast' : 'prepared',
      });
    });
    AppState.spellbook = [];
  }

  const stateFilter = document.getElementById('grimoire-filter-state')?.value || '';
  const prepared = (AppState.preparedSpells||[]).filter(p => !stateFilter || p.state === stateFilter);
  const total = (AppState.preparedSpells||[]).length;
  const available = (AppState.preparedSpells||[]).filter(p => p.state === 'prepared').length;
  const castCount  = (AppState.preparedSpells||[]).filter(p => p.state === 'cast').length;
  const activeCount= (AppState.preparedSpells||[]).filter(p => p.state === 'active').length;

  if (countEl) {
    countEl.innerHTML = `
      <span style="color:var(--green); font-size:12px; margin-right:8px;">✓ ${available} disponibles</span>
      <span style="color:var(--text-dim); font-size:12px; margin-right:8px;">⊘ ${castCount} lancés</span>
      ${activeCount > 0 ? `<span style="color:var(--gold); font-size:12px;">⚡ ${activeCount} actifs</span>` : ''}
    `;
  }

  panel.innerHTML = '';

  if (total === 0) {
    panel.innerHTML = `<div class="small text-dim text-center" style="padding:40px;">
      <div style="font-size:32px;margin-bottom:12px;">📋</div>
      Aucun sort préparé.<br>
      <span style="font-style:italic;">Préparez des sorts dans l'onglet <strong>PRÉPARATION</strong>.</span><br>
      <button class="btn btn-primary btn-small mt-12" onclick="showTab('spells')">→ Préparer des sorts</button>
    </div>`;
    return;
  }

  if (prepared.length === 0) {
    panel.innerHTML = `<div class="small text-dim text-center" style="padding:20px;">Aucun sort correspondant au filtre.</div>`;
    return;
  }

  // Grouper par niveau de slot préparé
  const byLevel = {};
  prepared.forEach(p => {
    const lvl = p.preparedLevel ?? p.baseLevel ?? 0;
    if (!byLevel[lvl]) byLevel[lvl] = [];
    byLevel[lvl].push(p);
  });

  Object.keys(byLevel).sort((a,b)=>+a-+b).forEach(lvl => {
    const hdr = document.createElement('div');
    hdr.style.cssText = `
      display:flex; align-items:center; gap:8px; padding:6px 8px; margin-bottom:6px;
      background:var(--bg3); border-left:3px solid ${LEVEL_COLORS[lvl]||'#888'};
      border-radius:0 4px 4px 0;
    `;
    hdr.innerHTML = `
      <span class="cinzel" style="color:${LEVEL_COLORS[lvl]};font-size:12px;letter-spacing:2px;">${+lvl===0?'ORAISONS':'NIVEAU '+lvl}</span>
      <span class="small text-dim">${byLevel[lvl].length} sort${byLevel[lvl].length>1?'s':''}</span>
    `;
    panel.appendChild(hdr);

    byLevel[lvl].forEach(p => {
      panel.appendChild(buildGrimoireCard(p));
    });
  });
}

function buildGrimoireCard(ps) {
  const sp = ps.dbId ? ((typeof SPELL_DB !== 'undefined') ? SPELL_DB[ps.dbId] : null) : null;
  const spName = ps.name || sp?.name || '?';
  const spDesc = sp?.desc || '';
  const state = ps.state || 'prepared';
  const stateColors = {
    prepared: 'var(--green)',
    cast:     'var(--text-dim)',
    active:   'var(--gold)',
  };
  const stateLabels = {
    prepared: '✓ Disponible',
    cast:     '⊘ Lancé',
    active:   '⚡ Actif',
  };
  const stateIcons = { prepared:'', cast:'line-through', active:'' };

  const card = document.createElement('div');
  card.style.cssText = `
    display:flex; align-items:flex-start; gap:10px; padding:10px 12px; margin-bottom:6px;
    border:1px solid ${state==='prepared'?'var(--border)':state==='active'?'var(--gold-dim)':'var(--border)'};
    background:${state==='cast'?'var(--bg3)':state==='active'?'rgba(180,140,60,0.06)':'var(--bg3)'};
    border-radius:5px; opacity:${state==='cast'?'0.6':'1'};
  `;

  // Level dot
  const lvl = ps.preparedLevel ?? ps.baseLevel ?? 0;
  const lvlBubble = document.createElement('div');
  lvlBubble.style.cssText = `
    width:26px;height:26px;border-radius:50%;flex-shrink:0;margin-top:2px;
    background:${LEVEL_COLORS[lvl]||'#888'}22;color:${LEVEL_COLORS[lvl]||'#888'};
    border:1px solid ${LEVEL_COLORS[lvl]||'#888'}44;
    display:flex;align-items:center;justify-content:center;
    font-family:'Cinzel',serif;font-size:11px;font-weight:700;
  `;
  lvlBubble.textContent = lvl;

  // Info
  const info = document.createElement('div');
  info.style.flex = '1';
  info.style.minWidth = '0';
  // Build metamagic badges
  const mmBadges = [];
  if (ps.metamagic?.length) {
    const MM_LABELS = { extend:'Extend', empower:'Empower', maximize:'Maximize',
      quicken:'Quicken', persist:'Persist', widen:'Widen',
      heighten:'Heighten', still:'Still', silent:'Silent' };
    const mmNames = ps.metamagic.map(m => MM_LABELS[m] || m).join(' + ');
    mmBadges.push(`<span style="font-size:10px;background:rgba(160,80,220,0.15);color:#c080e0;border:1px solid rgba(160,80,220,0.3);border-radius:3px;padding:1px 5px;">✦ ${mmNames}</span>`);
  }
  if (ps.isPersistent) {
    mmBadges.push(`<span style="font-size:10px;background:rgba(60,180,120,0.15);color:var(--green);border:1px solid rgba(60,180,120,0.4);border-radius:3px;padding:1px 5px;">⏳ PERSISTANT 24h</span>`);
  }
  if (ps.metamagicMode === 'divine_metamagic' && ps.divineMetamagicUsed > 0) {
    mmBadges.push(`<span style="font-size:10px;background:rgba(180,140,60,0.15);color:var(--gold-dim);border:1px solid var(--gold-dim);border-radius:3px;padding:1px 5px;">✨ Div.MM (${ps.divineMetamagicUsed} renvois)</span>`);
  }
  if (ps.baseLevel !== ps.preparedLevel && !ps.isPersistent && ps.metamagicMode !== 'divine_metamagic') {
    mmBadges.push(`<span style="font-size:10px;color:var(--text-dim);border:1px solid var(--border);border-radius:3px;padding:1px 4px;">Nv${ps.baseLevel}→Nv${ps.preparedLevel}</span>`);
  }

  info.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">
      <span style="font-size:13px;font-family:'Cinzel',serif;color:var(--text-bright);text-decoration:${state==='cast'?'line-through':'none'};">${spName}</span>
      <span style="font-size:11px;color:${stateColors[state]};font-style:italic;">${stateLabels[state]}</span>
      ${mmBadges.join('')}
    </div>
    ${spDesc ? `<div class="small text-dim" style="font-style:italic;line-height:1.3;">${spDesc.slice(0,90)}${spDesc.length>90?'…':''}</div>` : ''}
    ${sp ? `<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
      <span class="small text-dim">${sp.school}</span>
      <span class="small text-dim">•</span>
      <span class="small text-dim">⏱ ${ps.isPersistent && state==='active' ? '<span style="color:var(--green);">24 heures</span>' : sp.duration}</span>
      ${sp.save&&sp.save!=='None' ? `<span class="small text-dim">• JS: ${sp.save}</span>` : ''}
    </div>` : ''}
  `;

  // Actions
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-direction:column;gap:4px;flex-shrink:0;align-items:flex-end;';

  if (state === 'prepared') {
    const castBtn = document.createElement('button');
    castBtn.className = 'btn btn-primary btn-small';
    castBtn.innerHTML = '⚡ Lancer';
    castBtn.onclick = () => castPreparedSpell(ps.id);

    // Check if this spell creates a buff
    const hasBuff = ps.dbId && Object.values(BUFF_DB).some(b => b.spellId === ps.dbId);
    if (hasBuff) {
      castBtn.innerHTML = '⚡ Lancer + Buff';
      castBtn.style.background = 'rgba(180,140,60,0.3)';
    }
    actions.appendChild(castBtn);
  } else if (state === 'cast') {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-secondary btn-small';
    undoBtn.innerHTML = '↩ Annuler';
    undoBtn.onclick = () => uncastPreparedSpell(ps.id);
    actions.appendChild(undoBtn);
  } else if (state === 'active') {
    const expireBtn = document.createElement('button');
    expireBtn.className = 'btn btn-secondary btn-small';
    expireBtn.innerHTML = '⊘ Expirer';
    expireBtn.onclick = () => expirePreparedSpell(ps.id);
    actions.appendChild(expireBtn);
  }

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-danger btn-small';
  removeBtn.style.cssText = 'width:24px;height:24px;padding:0;text-align:center;';
  removeBtn.textContent = '×';
  removeBtn.title = 'Retirer de la préparation';
  removeBtn.onclick = () => {
    AppState.preparedSpells = (AppState.preparedSpells||[]).filter(p => p.id !== ps.id);
    renderGrimoire();
  };

  actions.appendChild(removeBtn);

  card.appendChild(lvlBubble);
  card.appendChild(info);
  card.appendChild(actions);
  return card;
}

function _castPreparedSpellDB(psId) {
  const ps = (AppState.preparedSpells||[]).find(p => p.id === psId);
  if (!ps || ps.state !== 'prepared') return;

  const matchingBuff = ps.dbId ? Object.entries(BUFF_DB).find(([k,b]) => b.spellId === ps.dbId) : null;

  if (matchingBuff) {
    const [buffDbId, buffEntry] = matchingBuff;
    ps.state = 'active';
    const existing = AppState.buffs.find(b => b.dbId === buffDbId && b.isSelf);
    if (existing) {
      existing.isActive = true;
      existing.casterLevel = AppState.levels.length || 1;
      existing.effects = resolveBuffEffects(existing);
      if (ps.isPersistent) {
        existing.isPersistent = true;
        existing.durationLabel = '24 heures';
        existing.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      }
    } else {
      const newBuff = makeBuff(buffDbId, { isSelf: true });
      if (newBuff) {
        if (ps.isPersistent) {
          newBuff.isPersistent = true;
          newBuff.durationLabel = '24 heures';
          newBuff.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        }
        AppState.buffs.push(newBuff);
      }
    }
  } else {
    ps.state = 'cast';
  }

  // Les sorts persistants ne consomment pas d'emplacement supplémentaire
  // (le slot a déjà été "bloqué" à la préparation)
  // Les sorts normaux consomment leur slot en étant lancés
  if (!ps.isPersistent) {
    const lvl = ps.preparedLevel ?? ps.baseLevel ?? 0;
    if (!AppState.spellSlotUsage) AppState.spellSlotUsage = {};
    AppState.spellSlotUsage[lvl] = (AppState.spellSlotUsage[lvl]||0) + 1;
  }

  renderAll();
}

function uncastPreparedSpell(psId) {
  const ps = (AppState.preparedSpells||[]).find(p => p.id === psId);
  if (!ps) return;
  const lvl = ps.preparedLevel ?? ps.baseLevel ?? 0;
  if (ps.state === 'cast' || ps.state === 'active') {
    if ((AppState.spellSlotUsage?.[lvl]||0) > 0) AppState.spellSlotUsage[lvl]--;
  }
  ps.state = 'prepared';
  // Désactiver le buff associé si applicable
  if (ps.dbId) {
    const matchingBuff = AppState.buffs.find(b => {
      const bEntry = BUFF_DB[b.dbId||''];
      return bEntry?.spellId === ps.dbId;
    });
    if (matchingBuff) matchingBuff.isActive = false;
  }
  renderAll();
}

function expirePreparedSpell(psId) {
  const ps = (AppState.preparedSpells||[]).find(p => p.id === psId);
  if (!ps) return;
  ps.state = 'cast';
  // Désactiver le buff associé
  if (ps.dbId) {
    const matchingBuff = AppState.buffs.find(b => {
      const bEntry = BUFF_DB[b.dbId||''];
      return bEntry?.spellId === ps.dbId;
    });
    if (matchingBuff) matchingBuff.isActive = false;
  }
  renderAll();
}

function longRest() {
  // Sorts PERSISTANTS (Persistent Spell, 24h) : survivent au repos long
  // → on vérifie expiresAt si disponible, sinon on garde si isPersistent
  const now = Date.now();

  // Réinitialise les emplacements de sorts
  AppState.spellSlotUsage = {};

  // Réinitialise les sorts préparés — persistants restent actifs si pas expirés
  (AppState.preparedSpells || []).forEach(ps => {
    if (ps.isPersistent && ps.state === 'active') {
      // Vérifier si le sort a expiré (si expiresAt est défini)
      if (ps.expiresAt && now > ps.expiresAt) {
        ps.state = 'cast';   // expiré
      }
      // sinon → reste 'active' (durée 24h pas encore écoulée)
    } else {
      ps.state = 'prepared'; // non-persistants redeviennent préparés
    }
  });

  // Legacy spellbook
  if (AppState.spellbook) AppState.spellbook.forEach(e => e.used = false);

  // Réinitialise les charges de capacités de classe
  if (AppState.abilityStates) {
    Object.keys(AppState.abilityStates).forEach(k => {
      if (k.startsWith('ca_charges_')) AppState.abilityStates[k] = 0;
    });
  }

  // Désactiver les buffs de sorts NON persistants
  AppState.buffs.forEach(b => {
    if (!b.spellId && !b.dbId) return; // buffs manuels → intacts
    if (b.isPersistent) {
      if (b.expiresAt && now > b.expiresAt) b.isActive = false; // expiré
      // sinon → reste actif
    } else {
      b.isActive = false;
    }
  });

  AppState.log = AppState.log || [];
  const persistCount = (AppState.preparedSpells || []).filter(ps => ps.isPersistent && ps.state === 'active').length;
  AppState.log.unshift({
    date: new Date().toLocaleString('fr-FR'),
    text: `☀️ Repos long — emplacements et charges réinitialisés.${persistCount > 0 ? ` ${persistCount} sort(s) persistant(s) toujours actif(s).` : ''}`
  });
  renderAll();
  alert(`☀️ Repos long terminé. Emplacements et charges réinitialisés.${persistCount > 0 ? `\n⏳ ${persistCount} sort(s) persistant(s) toujours actif(s).` : ''}`);
}

function toggleGrimoireSlot(lvl, idx) {
  if (!AppState.spellSlotUsage) AppState.spellSlotUsage = {};
  const cur = AppState.spellSlotUsage[lvl] || 0;
  AppState.spellSlotUsage[lvl] = idx < cur ? idx : idx + 1;
  renderGrimoire();
}

function addToGrimoire() { /* legacy no-op */ }
function castFromGrimoire(id) { castPreparedSpell(id); }
function uncastFromGrimoire(id) { uncastPreparedSpell(id); }
function removeFromGrimoire(id) {
  AppState.preparedSpells = (AppState.preparedSpells||[]).filter(p => p.id !== id);
  renderGrimoire();
}