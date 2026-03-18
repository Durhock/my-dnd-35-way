// ============================================================
// levelup.js — Progression du personnage
//
// Responsabilité : ajouter / retirer des niveaux dans AppState.levels.
// Mutations AppState :
//   AppState.levels[]                → progression du personnage
//   AppState.character.levelTotal    → mis à jour après chaque ajout/retrait
//   AppState.character.abilityScores → incréments levelUp lors d'une aug. de carac.
//   AppState.character.hp.current    → ajusté si dépasse le nouveau max
//   AppState.feats[]                 → don ajouté/retiré avec le niveau
//
// Calculs délégués à rules.js :
//   getSkillPointsForLevel()         → points de compétence gagnés
//   getBAB() / getBABProgressionString()
//   getHPMax()
//   getMod()
//
// SECTIONS :
//   1. UI state
//   2. Mutations AppState (addLevel, removeLastLevel)
//   3. Render (renderLevelUp)
//   4. UI bindings (selectClass, filterLuClassSelect, rollHPDie)
// ============================================================


// ═══════════════════════════════════════════════════════════
// SECTION 1 — UI state
// ═══════════════════════════════════════════════════════════

/** Dernière classe sélectionnée — conservée entre les re-renders. */
let _lastSelectedClassId = 'class_fighter';


// ═══════════════════════════════════════════════════════════
// SECTION 2 — Mutations AppState
// ═══════════════════════════════════════════════════════════

/**
 * Ajoute un niveau de classe au personnage.
 * Toutes les mutations AppState sont atomiques dans cette fonction.
 */
function addLevel() {
  const classId = document.getElementById('lu-class')?.value;
  if (!classId) return;

  const hp          = parseInt(document.getElementById('lu-hp')?.value) || 1;
  const feat        = document.getElementById('lu-feat')?.value || '';
  const features    = document.getElementById('lu-features')?.value || '';
  const abilityInc  = document.getElementById('lu-ability-inc')?.value || '';
  const cls         = CLASS_REF[classId];
  const newLevel    = AppState.levels.length + 1;

  // Structure d'un niveau — cohérente avec AppState.levels[]
  const lvlObj = {
    id:                     `lvl_${String(newLevel).padStart(3,'0')}`,
    characterId:            AppState.character.id,
    levelNumber:            newLevel,
    classId,
    hitDie:                 cls ? `d${cls.hitDie}` : 'd8',
    hpRolled:               hp,
    skillPointsGained:      0,           // calculé ci-dessous via rules.js
    abilityIncreaseApplied: abilityInc !== '',
    abilityIncreaseAbility: abilityInc || null,
    featChosenId:           feat || null,
    classFeaturesGained:    features ? features.split(',').map(s => s.trim()).filter(Boolean) : [],
  };

  // Calcul des points de compétence (délégué à rules.js après push)
  AppState.levels.push(lvlObj);
  lvlObj.skillPointsGained = getSkillPointsForLevel(lvlObj);  // ← rules.js
  AppState.character.levelTotal = AppState.levels.length;

  // Augmentation de caractéristique
  if (abilityInc && AppState.character.abilityScores[abilityInc]) {
    AppState.character.abilityScores[abilityInc].levelUp =
      (AppState.character.abilityScores[abilityInc].levelUp || 0) + 1;
  }

  // Don choisi
  if (feat && !AppState.feats.find(f => f.id === feat)) {
    AppState.feats.push({ id: feat, name: feat.replace('feat_','').replace(/_/g,' ') });
  }

  // PV : initialiser current si c'est le premier niveau
  if (AppState.character.hp.current === 0) {
    AppState.character.hp.current = getHPMax();  // ← rules.js
  }

  // Réinitialiser les champs volatils (garder la classe sélectionnée)
  ['lu-features','lu-ability-inc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  addLog('⬆', 'Niveau +1', `${cls ? cls.name : classId} niv.${newLevel} — ${hp} PV`);
  _lastSelectedClassId = classId;
  autosave();
  // Always show progression page after adding a level so the table is visible
  showBuildPage('progression');
}

/**
 * Retire le dernier niveau ajouté.
 * Inverse toutes les mutations appliquées par addLevel().
 */
function removeLastLevel() {
  if (AppState.levels.length === 0) return;
  const last = AppState.levels[AppState.levels.length - 1];

  // Annuler l'augmentation de caractéristique (stockée sur l'objet niveau)
  if (last.abilityIncreaseAbility && AppState.character.abilityScores[last.abilityIncreaseAbility]) {
    AppState.character.abilityScores[last.abilityIncreaseAbility].levelUp =
      Math.max(0, (AppState.character.abilityScores[last.abilityIncreaseAbility].levelUp || 0) - 1);
  } else if (last.abilityIncreaseApplied) {
    addLog('⚠️', 'Annulation niveau', `Niv.${last.levelNumber} retiré — ajustez manuellement la carac. augmentée.`);
  }

  // Retirer le don accordé à ce niveau
  if (last.featChosenId) {
    const idx = AppState.feats.findIndex(f => f.id === last.featChosenId);
    if (idx !== -1) AppState.feats.splice(idx, 1);
  }

  addLog('↩', 'Niveau retiré', `Niv.${last.levelNumber} (${CLASS_REF[last.classId]?.name || last.classId}) annulé`);
  AppState.levels.pop();
  AppState.character.levelTotal = AppState.levels.length;

  // Ajuster les PV courants si nécessaire
  const newMax = getHPMax();  // ← rules.js
  if (AppState.character.hp.current > newMax) AppState.character.hp.current = newMax;

  autosave();
  renderSheet();
  showBuildPage('progression');  // stay on progression page, update table immediately
}


// ═══════════════════════════════════════════════════════════
// SECTION 3 — Render
// ═══════════════════════════════════════════════════════════

function renderLevelUp() {
  // Table des niveaux
  const tbody = document.getElementById('level-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  AppState.levels.forEach((lvl, idx) => {
    const cls = CLASS_REF[lvl.classId];
    const tr  = document.createElement('tr');
    if (idx === AppState.levels.length - 1) tr.className = 'current-level';
    tr.innerHTML = `
      <td class="text-gold cinzel">${lvl.levelNumber}</td>
      <td>${cls ? cls.name : lvl.classId}</td>
      <td>${lvl.hpRolled || '—'}</td>
      <td>${lvl.skillPointsGained || 0}</td>
      <td class="text-dim small">${lvl.featChosenId || '—'}</td>
      <td class="text-dim small">${(lvl.classFeaturesGained || []).join(', ') || '—'}</td>
      <td>${idx === AppState.levels.length - 1
        ? `<button onclick="removeLastLevel()" class="btn btn-danger btn-small" style="padding:1px 7px;font-size:11px;" title="Supprimer ce niveau">✕</button>`
        : ''}</td>`;
    tbody.appendChild(tr);
  });

  // BAB actuel — via rules.js
  const bab    = getBAB();                         // ← rules.js
  const babDiv = document.getElementById('bab-progression-display');
  if (babDiv) babDiv.innerHTML = `
    <div class="stat-box">
      <div><div class="stat-label">BBA ACTUEL</div></div>
      <div class="stat-value text-gold">${getBABProgressionString(bab)}</div>
    </div>
    <div class="mt-8 small text-dim">
      Prochain seuil d'attaque : BBA ${Math.ceil(bab / 5) * 5 + 1}
    </div>`;
}


// ═══════════════════════════════════════════════════════════
// SECTION 4 — UI bindings
// ═══════════════════════════════════════════════════════════

/**
 * Sélectionne une classe dans l'interface Level Up.
 * Source unique de vérité pour la synchronisation dropdown ↔ tuiles ↔ badges.
 */
function selectClass(classId) {
  if (!classId || !CLASS_REF[classId]) return;
  _lastSelectedClassId = classId;

  const sel = document.getElementById('lu-class');
  if (sel && sel.value !== classId) sel.value = classId;

  document.querySelectorAll('[id^="core-tile-"]').forEach(btn => {
    const isActive = btn.id === `core-tile-${classId}`;
    btn.classList.toggle('active-tile', isActive);
    btn.style.borderColor = isActive ? 'var(--gold)'              : 'var(--border)';
    btn.style.background  = isActive ? 'rgba(201,147,58,0.18)'   : 'var(--bg3)';
    btn.style.color       = isActive ? 'var(--gold-light)'        : 'var(--text-dim)';
  });

  const cls = CLASS_REF[classId];
  const badge = document.getElementById('lu-hitdie-badge');
  if (badge && cls) badge.textContent = `d${cls.hitDie}`;
  const suggestEl = document.getElementById('lu-hp-suggest');
  if (suggestEl && cls) suggestEl.textContent = `max:${cls.hitDie}  moy:${Math.ceil(cls.hitDie/2)+1}`;

  renderClassPreview(classId);
}

/** Filtre la liste déroulante de classes (recherche textuelle). */
function filterLuClassSelect(q) {
  const sel = document.getElementById('lu-class');
  if (!sel) return;
  const ql      = q.trim().toLowerCase();
  const current = sel.value;
  Array.from(sel.options).forEach(opt => {
    opt.style.display = !ql || opt.text.toLowerCase().includes(ql) || opt.value.toLowerCase().includes(ql) ? '' : 'none';
  });
  if (ql && sel.value !== current) {
    const first = Array.from(sel.options).find(o => o.style.display !== 'none' && o.value);
    if (first) selectClass(first.value);
  }
}

/** Lance le dé de vie de la classe sélectionnée et remplit le champ HP. */
function rollHPDie() {
  const classId = document.getElementById('lu-class')?.value;
  const cls     = CLASS_REF[classId];
  const die     = cls ? cls.hitDie : 8;
  const el      = document.getElementById('lu-hp');
  if (el) el.value = Math.floor(Math.random() * die) + 1;
}


// ── renderClassPreview ─────────────────────────────────────
/**
 * Peuple #lu-class-preview (carte compacte) et #prog-class-summary
 * avec les stats essentielles de la classe sélectionnée.
 * Appelée depuis selectClass() et _refreshBuildClassData().
 */
function renderClassPreview(classId) {
  const c = CLASS_REF ? CLASS_REF[classId] : null;
  const previewEl  = document.getElementById('lu-class-preview');
  const summaryEl  = document.getElementById('prog-class-summary');
  const nameEl     = document.getElementById('prog-class-name');
  const bodyEl     = document.getElementById('prog-class-body');

  if (!c) {
    if (previewEl)  previewEl.style.display = 'none';
    if (summaryEl)  summaryEl.style.display = 'none';
    return;
  }

  const BAB_LBL  = { full: 'Complet', medium: 'Moyen', poor: 'Faible' };
  const SAVE_LBL = { good: '✅ Bon', poor: '❌ Faible', medium: '☑ Moyen' };
  const SPELL_LBL = { none:'—', arcane:'Arc.', divine:'Div.', both:'Arc.+Div.',
    maneuvers:'Manœuvres', psionic:'Psion.', invocations:'Invoc.', incarnum:'Incarn.' };
  const hitDieColor = c.hitDie >= 10 ? 'var(--green)' : c.hitDie >= 8 ? 'var(--gold)' : 'var(--text-dim)';

  // Compact inline card (#lu-class-preview)
  if (previewEl) {
    previewEl.style.display = '';
    previewEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:18px;">${c.icon || '⚔'}</span>
        <div>
          <div class="cinzel" style="color:var(--gold-light);font-size:13px;">${c.name}</div>
          ${c.nameEn && c.nameEn !== c.name ? `<div style="font-size:10px;color:var(--text-dim);">${c.nameEn}</div>` : ''}
        </div>
        <span style="margin-left:auto;font-size:10px;background:var(--bg4);border:1px solid var(--border);border-radius:3px;padding:1px 5px;color:var(--text-dim);">${c.source || ''}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;font-size:11px;">
        <div style="text-align:center;">
          <div style="color:var(--text-dim);font-size:9px;margin-bottom:2px;">DV</div>
          <div style="font-weight:700;color:${hitDieColor};font-family:'Cinzel',serif;">d${c.hitDie}</div>
        </div>
        <div style="text-align:center;">
          <div style="color:var(--text-dim);font-size:9px;margin-bottom:2px;">BBA</div>
          <div style="font-weight:600;color:var(--gold);">${BAB_LBL[c.babProg] || c.babProg}</div>
        </div>
        <div style="text-align:center;">
          <div style="color:var(--text-dim);font-size:9px;margin-bottom:2px;">Comp./Nv</div>
          <div style="font-weight:600;color:var(--text-bright);">${c.spPerLvl}+INT</div>
        </div>
        <div style="text-align:center;">
          <div style="color:var(--text-dim);font-size:9px;margin-bottom:2px;">Magie</div>
          <div style="font-weight:600;color:var(--text-bright);">${SPELL_LBL[c.spellType] || '—'}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-top:5px;font-size:10px;">
        <span>Vig: <span style="color:${c.fort==='good'?'var(--green)':'var(--text-dim)'};">${SAVE_LBL[c.fort]}</span></span>
        <span>Réf: <span style="color:${c.ref==='good'?'var(--green)':'var(--text-dim)'};">${SAVE_LBL[c.ref]}</span></span>
        <span>Vol: <span style="color:${c.will==='good'?'var(--green)':'var(--text-dim)'};">${SAVE_LBL[c.will]}</span></span>
      </div>`;
  }

  // Detailed summary panel (#prog-class-summary)
  if (summaryEl && nameEl && bodyEl) {
    summaryEl.style.display = '';
    nameEl.textContent = `${c.icon || ''}  ${c.name}`;
    const csCount = (c.classSkills || []).length;
    const tags = (typeof CLASS_TAGS !== 'undefined' && CLASS_TAGS[classId]) ? CLASS_TAGS[classId] : [];
    bodyEl.innerHTML = `
      <p style="color:var(--text-dim);font-style:italic;font-size:12px;margin:0 0 8px;">${(c.desc || '').slice(0, 120)}${(c.desc || '').length > 120 ? '…' : ''}</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11px;margin-bottom:6px;">
        ${tags.slice(0,6).map(t => `<span style="background:var(--bg4);border:1px solid var(--border);border-radius:3px;padding:1px 5px;color:var(--text-dim);">${t}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--text-dim);">
        Compétences de classe : <strong style="color:var(--gold);">${csCount}</strong>
        ${csCount > 0 ? `<span style="color:var(--text-dim);"> — ${(c.classSkills || []).slice(0,4).map(s => (typeof SKILL_REF !== 'undefined' && SKILL_REF[s]) ? SKILL_REF[s].name : s).join(', ')}${csCount > 4 ? '…' : ''}</span>` : ''}
      </div>`;
  }
}

/** Legacy alias. */
function updateLuHitDie() {
  const sel = document.getElementById('lu-class');
  if (sel) selectClass(sel.value);
}
