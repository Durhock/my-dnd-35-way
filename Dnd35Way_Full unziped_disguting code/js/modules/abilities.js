function renderAbilities() {
  const container = document.getElementById('abilities-container');
  const customList = document.getElementById('custom-abilities-list');
  if (!container) return;
  container.innerHTML = '';

  const available = getAvailableClassAbilities();
  const filterType = document.getElementById('ability-filter-type')?.value || '';
  const filterCat = document.getElementById('ability-filter-cat')?.value || '';

  const filtered = available.filter(ab => {
    if (filterType && ab.type !== filterType) return false;
    if (filterCat && ab.category !== filterCat) return false;
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
    if (!byClass[clsName]) byClass[clsName] = [];
    byClass[clsName].push(ab);
  });

  const catIcons = { combat:'⚔️', defense:'🛡️', divine:'✨', transform:'🐺', exploration:'🗺️', social:'💬', special:'⭐' };
  const typeColors = { active_toggle:'var(--green)', active_limited:'var(--gold)', passive:'var(--text-dim)' };
  const typeBadges = {
    active_toggle: '<span class="ability-type-badge badge-active">ACTIF — TOGGLE</span>',
    active_limited: '<span class="ability-type-badge badge-limited">ACTIF — LIMITÉ</span>',
    passive: '<span class="ability-type-badge badge-passive">PASSIF</span>'
  };

  Object.entries(byClass).forEach(([className, abilities]) => {
    const section = document.createElement('div');
    section.style.marginBottom = '20px';
    const classHdr = document.createElement('div');
    classHdr.style.cssText = 'border-bottom:1px solid var(--border-bright); margin-bottom:10px; padding-bottom:6px;';
    classHdr.innerHTML = `<span class="cinzel" style="color:var(--gold-light);font-size:13px;letter-spacing:2px;">${className.toUpperCase()}</span>`;
    section.appendChild(classHdr);

    abilities.forEach(ab => {
      const stateKey = `ca_state_${ab.id}`;
      const chargesKey = `ca_charges_${ab.id}`;
      const isActive = AppState.abilityStates?.[stateKey] || false;
      const usedCharges = AppState.abilityStates?.[chargesKey] || 0;

      // Calculer le max de charges
      let maxCharges = 0;
      const classLvl = ab.classLvl;
      if (ab.type === 'active_limited') {
        if (ab.id === 'ca_turn_undead') maxCharges = 3 + getMod('CHA');
        else if (ab.id === 'ca_smite_evil') maxCharges = 1 + Math.floor(classLvl / 5);
        else if (ab.id === 'ca_remove_disease') maxCharges = Math.floor(classLvl / 3);
        else if (ab.resource?.per === 'week') maxCharges = Math.floor(classLvl / 3);
        else maxCharges = Math.max(1, 1 + Math.floor((classLvl - 1) / 4)); // default
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
          <span style="font-size:16px;">${catIcons[ab.category]||'•'}</span>
          ${typeBadges[ab.type] || ''}
          <span style="flex:1; font-size:14px; color:${isActive ? 'var(--gold-light)' : 'var(--text-bright)'}; font-weight:600;">${ab.name}</span>
          <span style="font-size:11px; color:var(--text-dim);">nv.${ab.minLevel}+</span>
          <span style="color:var(--text-dim); font-size:11px;">▼</span>
        </div>
        <div style="padding:0 14px 10px 14px;">${controlHtml}</div>
        <div id="detail_${ab.id}" style="display:none; padding:10px 14px; border-top:1px solid var(--border); font-size:13px;">
          <div style="font-style:italic; color:var(--text-dim); margin-bottom:8px;">${ab.desc}</div>
          ${ab.mechanic ? `<div class="info-box" style="margin-bottom:6px;"><strong>⚙️ Mécanique :</strong> ${ab.mechanic}</div>` : ''}
          ${ab.formula ? `<div><span class="text-dim">Formule :</span> <code style="background:var(--bg4);padding:1px 6px;border-radius:2px;color:var(--gold);">${ab.formula.replace('barbLvl',classLvl).replace('clericLvl',classLvl).replace('palLvl',classLvl).replace('druidLvl',classLvl).replace('rogueLvl',classLvl)}</code></div>` : ''}
          ${ab.subChoices ? `<div style="margin-top:8px;"><span class="small text-dim">Sous-formes disponibles :</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">${ab.subChoices.filter(sc => classLvl >= sc.minLevel).map(sc => `<span style="background:var(--bg4);border:1px solid var(--border);padding:2px 8px;border-radius:10px;font-size:12px;">${sc.label}</span>`).join('')}</div></div>` : ''}
          <div class="small text-dim mt-8">Source : ${ab.source}</div>
        </div>`;

      section.appendChild(card);
    });

    container.appendChild(section);
  });

  // Capacités custom
  if (customList) {
    const customAbs = AppState.classAbilities?.filter(ab => ab.isCustom) || [];
    if (customAbs.length > 0) {
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
          <div class="small text-dim" style="font-style:italic;">${ab.desc||''}</div>
          ${ab.maxCharges > 0 ? `
            <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
              <div style="display:flex;gap:3px;">${Array(ab.maxCharges).fill(0).map((_,i)=>`<div class="charge-pip ${i < (ab.usedCharges||0) ? 'used' : 'available'}" onclick="toggleCustomAbilityCharge('${ab.id}',${i})"></div>`).join('')}</div>
              <span class="small text-dim">${ab.maxCharges-(ab.usedCharges||0)}/${ab.maxCharges}</span>
            </div>` : ''
          }`;
        customList.appendChild(div);
      });
    }
  }
}

function toggleAbility(abId) {
  if (!AppState.abilityStates) AppState.abilityStates = {};
  const key = `ca_state_${abId}`;
  AppState.abilityStates[key] = !AppState.abilityStates[key];
  renderAbilities();
  renderSheet(); // recalculer CA/stats si buff
}

function toggleAbilityDetail(detailId) {
  const el = document.getElementById(detailId);
  if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
}

function useAbilityCharge(abId) {
  if (!AppState.abilityStates) AppState.abilityStates = {};
  const key = `ca_charges_${abId}`;
  const cur = AppState.abilityStates[key] || 0;
  // Calculer max
  const ab = CLASS_ABILITIES_DB[abId];
  const classLevels = {};
  AppState.levels.forEach(l => { classLevels[l.classId] = (classLevels[l.classId] || 0) + 1; });
  const classLvl = classLevels[ab?.classId] || 0;
  let maxCharges = 10;
  if (abId === 'ca_turn_undead') maxCharges = 3 + getMod('CHA');
  else if (abId === 'ca_smite_evil') maxCharges = 1 + Math.floor(classLvl / 5);
  if (cur < maxCharges) AppState.abilityStates[key] = cur + 1;
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
  ab.usedCharges = idx < (ab.usedCharges||0) ? idx : idx + 1;
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
    modal.id = 'custom-ability-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:480px;">
        <div class="modal-header">
          <span class="modal-title">➕ CAPACITÉ PERSONNALISÉE</span>
          <button class="modal-close" onclick="this.closest('.modal-overlay').classList.add('hidden')">×</button>
        </div>
        <div class="modal-body" style="display:grid;gap:10px;">
          <div><label class="form-label">Nom *</label><input id="cab-name" class="form-input" placeholder="Ex: Rage de la Panthère, Smite du Soleil..."></div>
          <div><label class="form-label">Description / Effets</label><textarea id="cab-desc" class="form-input" rows="2" placeholder="Décrivez les effets..."></textarea></div>
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
  const nameEl = document.getElementById('cab-name');
  if (!nameEl) return; // modal pas encore créé
  const name = nameEl.value.trim();
  if (!name) { showToast && showToast('Nom requis', 'error'); return; }
  const ab = {
    id: 'custom_ab_' + Date.now(),
    isCustom: true,
    name,
    desc:       document.getElementById('cab-desc')?.value    || '',
    type:       document.getElementById('cab-type')?.value    || 'passive',
    maxCharges: parseInt(document.getElementById('cab-charges')?.value) || 0,
    usedCharges: 0
  };
  if (!AppState.classAbilities) AppState.classAbilities = [];
  AppState.classAbilities.push(ab);
  autosave();
  document.getElementById('custom-ability-modal')?.classList.add('hidden');
  renderAbilities();
}

// ── Repos long — réinitialise les charges de capacités de classe ─────────
function longRest() {
  // VERIFIED — comportement V1 validé en cadrage (2025-03).
  // Étapes : charges capacités → sorts préparés → buffs sorts → hp.temp.
  // SIMPLIFICATION V1 : hp.temp remis à 0 au repos long.
  // DND35-CHECK : en RAW, les PV temp expirent selon durée du sort, pas au repos.
  // ── 1. Charges de capacités de classe ────────────────────
  if (AppState.abilityStates) {
    Object.keys(AppState.abilityStates).forEach(k => {
      if (k.startsWith('ca_charges_')) AppState.abilityStates[k] = 0;
    });
  }

  // ── 2. Réinitialiser les sorts préparés ──────────────────
  // Mécanisme applicatif V1 — les sorts redeviennent disponibles.
  (AppState.preparedSpells || []).forEach(ps => {
    ps.state = 'prepared';
    delete ps.castAt;
  });

  // ── 3. Supprimer les buffs de sorts ───────────────────────
  // Les buffs créés par des sorts (sourceType:'spell') sont retirés.
  // Les buffs permanents (templates raciaux, etc.) sont conservés.
  AppState.buffs = (AppState.buffs || []).filter(b => b.sourceType !== 'spell');

  // ── 4. Réinitialiser les PV temporaires ──────────────────
  // Mécanisme applicatif V1 — simplification.
  // DND35-CHECK : en D&D 3.5, les PV temp expirent selon la durée du sort.
  // En V1, on les remet à 0 au repos long pour garantir la cohérence.
  AppState.character.hp.temporary = 0;

  autosave();
  if (typeof renderSheet === 'function') renderSheet();
  renderAbilities();
  if (typeof showToast === 'function')
    showToast('Repos long — sorts, charges et PV temporaires réinitialisés', 'success');
}
