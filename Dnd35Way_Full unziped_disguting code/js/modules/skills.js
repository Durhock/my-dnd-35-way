// ============================================================
// skills.js — Gestion des rangs de compétences
//
// Responsabilité : mutations de AppState.skillEntries uniquement.
// Ce module gère :
//   - ranks (rangs investis par le joueur)
//   - misc  (modificateurs divers du personnage)
//   - classSkill (formation manuelle, auto-détectée depuis classes)
//
// Ce module NE calcule PAS les totaux finaux de compétence.
// Les totaux sont calculés par rules.js via getSkillTotal().
//
// Calculs délégués à rules.js :
//   getSkillTotal(entry)       → total compétence (rangs + mod + bonus)
//   getClassSkillsForChar()    → compétences de classe selon les niveaux
//   getMaxRanks(isClassSkill)  → maximum de rangs autorisés
//   getMod(ability)            → modificateur de caractéristique
//   getTotalSkillPoints()      → total points disponibles
//   getSpentSkillPoints()      → points dépensés
//
// Structure d'une entrée dans AppState.skillEntries :
//   { skillId, ranks, misc, classSkill }
//
// SECTIONS :
//   1. Mutations AppState.skillEntries
//   2. Render (renderSkills)
// ============================================================


// ═══════════════════════════════════════════════════════════
// SECTION 1 — Mutations AppState.skillEntries
// ═══════════════════════════════════════════════════════════

/**
 * Retourne l'entrée d'une compétence (crée si absente).
 * N'est pas visible à l'extérieur — usage interne aux mutations.
 */
function _getOrCreateSkillEntry(skillId) {
  let entry = AppState.skillEntries.find(e => e.skillId === skillId);
  if (!entry) {
    entry = { skillId, ranks: 0, misc: 0, classSkill: false };
    AppState.skillEntries.push(entry);
  }
  return entry;
}

/** Modifie les rangs investis dans une compétence. */
function setSkillRanksDirect(skillId, val) {
  const entry = _getOrCreateSkillEntry(skillId);
  entry.ranks = Math.max(0, parseInt(val) || 0);
  renderSkills();
}

/** Modifie le modificateur divers d'une compétence. */
function setSkillMisc(skillId, val) {
  const entry = _getOrCreateSkillEntry(skillId);
  entry.misc = parseInt(val) || 0;
  renderSkills();
}

/** Modifie le flag de formation manuelle d'une compétence. */
function setClassSkill(skillId, val) {
  const entry = _getOrCreateSkillEntry(skillId);
  entry.classSkill = !!val;
  renderSkills();
}

/** Ajoute toutes les compétences de SKILL_REF dans AppState.skillEntries (si absentes). */
function addAllSkills() {
  Object.keys(SKILL_REF).forEach(skillId => {
    if (!AppState.skillEntries.find(e => e.skillId === skillId)) {
      AppState.skillEntries.push({ skillId, ranks: 0, misc: 0, classSkill: false });
    }
  });
  renderSkills();
}


// ═══════════════════════════════════════════════════════════
// SECTION 2 — Render
// ═══════════════════════════════════════════════════════════

function renderSkills() {
  const tbody = document.getElementById('skills-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const charClassSkills = getClassSkillsForChar();  // ← rules.js
  const charLvl         = AppState.levels.length || 1;

  // Points de compétence — via rules.js
  const totalPoints = getTotalSkillPoints();   // ← rules.js
  const spentPoints = getSpentSkillPoints();   // ← rules.js
  const overspent   = spentPoints > totalPoints;

  const summaryEl = document.getElementById('skill-points-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="flex-between mb-8">
        <span class="text-dim small">Points disponibles</span>
        <span class="cinzel bold" style="color:var(--gold)">${totalPoints}</span>
      </div>
      <div class="flex-between mb-8">
        <span class="text-dim small">Points dépensés</span>
        <span class="${overspent ? 'text-red' : 'text-green'} bold cinzel">${spentPoints}</span>
      </div>
      <div class="flex-between mb-8">
        <span class="text-dim small">Restants</span>
        <span class="${overspent ? 'text-red' : 'text-bright'} bold cinzel">${totalPoints - spentPoints}</span>
      </div>
      <div class="small text-dim mb-8" style="border-top:1px solid var(--border);padding-top:6px;">
        Max rangs CS : <strong style="color:var(--gold)">${charLvl + 3}</strong> &nbsp;|&nbsp;
        Max rangs hors CS : <strong style="color:var(--text-dim)">${Math.floor((charLvl + 3) / 2)}</strong>
      </div>
      <button class="btn btn-primary btn-small" onclick="addAllSkills()" style="width:100%;">Ajouter toutes les compétences</button>`;
  }

  // Liste complète (SKILL_REF + entrées existantes)
  const allSkillIds = new Set([
    ...Object.keys(SKILL_REF),
    ...AppState.skillEntries.map(e => e.skillId),
  ]);

  Array.from(allSkillIds).sort((a, b) => {
    return (SKILL_REF[a]?.name || a).localeCompare(SKILL_REF[b]?.name || b);
  }).forEach(skillId => {
    const ref = SKILL_REF[skillId];
    if (!ref) return;

    const entry = AppState.skillEntries.find(e => e.skillId === skillId)
      || { skillId, ranks: 0, misc: 0, classSkill: false };

    const isAutoCS = charClassSkills.has(skillId);
    const isCS     = isAutoCS || entry.classSkill;
    const maxRanks = getMaxRanks(isCS);                   // ← rules.js
    const overRank = entry.ranks > maxRanks;

    // Affichage du total — via rules.js (sans recalculer ici)
    const total    = getSkillTotal(entry);                 // ← rules.js
    const abilityMod = getMod(ref.keyAbility);            // ← rules.js (pour affichage seul)

    const tr = document.createElement('tr');
    if (overRank) tr.style.background = 'rgba(180,40,40,0.08)';

    tr.innerHTML = `
      <td style="padding:4px 8px;">
        <div style="display:flex;align-items:center;gap:5px;">
          ${isAutoCS
            ? `<span title="Compétence de classe (${CLASS_REF[AppState.levels[0]?.classId]?.name||'classe'})" style="display:inline-flex;width:16px;height:16px;background:var(--gold);border-radius:50%;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:var(--bg1);flex-shrink:0;">C</span>`
            : `<span style="display:inline-block;width:16px;"></span>`}
          <span style="font-size:13px;color:${isAutoCS ? 'var(--gold-light)' : 'var(--text-bright)'};">${ref.name}</span>
          ${ref.nameEn ? `<span style="font-size:10px;color:var(--text-dim);margin-left:4px;font-style:italic;">${ref.nameEn}</span>` : ""}
          ${ref.source ? `<span style="font-size:9px;color:var(--gold-dim);border:1px solid var(--gold-dim);border-radius:8px;padding:0 4px;margin-left:2px;">${ref.source.split(" ")[0]}</span>` : ""}
          ${ref.trainedOnly ? '<span style="font-size:9px;color:var(--purple);border:1px solid var(--purple);border-radius:8px;padding:0 4px;margin-left:2px;">entraîné</span>' : ""}
        </div>
      </td>
      <td class="text-dim cinzel small" style="text-align:center;padding:4px;">${ref.keyAbility}</td>
      <td style="text-align:center;padding:4px;">
        <input type="number" value="${entry.ranks}" min="0" max="${maxRanks * 2}"
          style="width:46px;text-align:center;padding:2px 4px;font-size:13px;font-family:'Cinzel',serif;
                 color:${overRank ? 'var(--red)' : 'var(--text-bright)'};
                 background:${overRank ? 'rgba(180,40,40,0.15)' : 'var(--bg4)'};
                 border:1px solid ${overRank ? 'var(--red)' : 'var(--border)'};border-radius:3px;"
          onchange="setSkillRanksDirect('${skillId}', this.value)"
          title="${overRank ? '⚠ Dépasse le maximum (' + maxRanks + ' rangs)' : 'Max : ' + maxRanks + ' rangs'}">
        ${overRank ? `<div style="font-size:9px;color:var(--red);margin-top:1px;">max ${maxRanks}</div>` : ''}
      </td>
      <td style="text-align:center;padding:4px;" class="${abilityMod >= 0 ? 'text-green' : 'text-red'} bold cinzel">
        ${abilityMod >= 0 ? '+' : ''}${abilityMod}
      </td>
      <td style="text-align:center;padding:4px;">
        <input type="number" value="${entry.misc || 0}"
          style="width:46px;text-align:center;padding:2px 4px;font-size:12px;background:var(--bg4);border:1px solid var(--border);border-radius:3px;color:var(--text-bright);"
          onchange="setSkillMisc('${skillId}', this.value)">
      </td>
      <td style="text-align:center;padding:4px;" class="cinzel bold">
        <span style="color:${total >= 10 ? 'var(--gold)' : total >= 5 ? 'var(--text-bright)' : 'var(--text-dim)'};font-size:15px;">${total >= 0 ? '+' : ''}${total}</span>
      </td>
      <td style="text-align:center;padding:4px;">
        <label style="display:flex;gap:3px;align-items:center;justify-content:center;font-size:10px;cursor:pointer;color:var(--text-dim);" title="Compétence de classe manuelle">
          <input type="checkbox" ${isCS ? 'checked' : ''} ${isAutoCS ? 'disabled' : ''} onchange="setClassSkill('${skillId}', this.checked)">
          <span style="color:${isAutoCS ? 'var(--gold-dim)' : 'var(--text-dim)'};">CS</span>
        </label>
      </td>`;
    tbody.appendChild(tr);
  });
}
