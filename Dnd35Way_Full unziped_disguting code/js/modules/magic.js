// ============================================================
// magic.js — Module Magie V1
//
// PHASE-MAGIC V1 — STABILISÉ (2025-03)
// ──────────────────────────────────────
// Cycle complet implémenté et validé : draft → known → prepared → cast
//   LABO     : création, édition, suppression, apprentissage
//   CONNUS   : liste filtrée, préparation
//   PRÉPARÉS : liste du jour, lancement, badge état
//   LANCEMENT: _magCastSpell — effets → AppState.buffs, hp.temp, snapshot figé
//
// CONTRAT V1 — hp.temp
// ─────────────────────
// Les PV temporaires d'un sort sont copiés dans chr.hp.temporary
// au moment du lancement :
//   AppState.character.hp.temporary = Math.max(
//     AppState.character.hp.temporary || 0, ef.value
//   );
// C'est chr.hp.temporary qui fait foi pour adjustHP().
// SIMPLIFICATION PRODUIT V1 : highest wins, non cumulatif.
// DND35-CHECK : en D&D 3.5 RAW, les PV temp expirent selon la durée du sort.
//
// CONTRAT V1 — effets calculés
// ─────────────────────────────
// Seuls les effets avec target/bonusType/value entier impactent la fiche.
// Les effets descriptifs (ef.descriptive = true) sont informatifs, jamais appliqués.
// Snapshot figé au lancement : modifier un sort post-lancement ne change pas le buff actif.
//
// SCHÉMA grimoire[] (AppState.grimoire[])
// ────────────────────────────────────────
//   { id, status:'draft'|'known', name, level, school,
//     tags[], effects[], description, notes, addedAt }
// ATTENTION : status est injecté par loadState() si absent (migration legacy).
//
// SCHÉMA preparedSpell (AppState.preparedSpells[])
// ─────────────────────────────────────────────────
//   { id, grimoireId, state:'prepared'|'cast',
//     effectsSnapshot[], castAt }
//
// TODO-MAGIC : résumé des emplacements de sorts (spellSlotUsage) non implémenté.
//   AppState.spellSlotUsage existe dans state.js mais n'est pas encore peuplé
//   par ce module. À implémenter quand la fiche PJ affiche un compteur de slots.
// ============================================================

// ── Couleurs par niveau de sort ───────────────────────────────
const _SPELL_LEVEL_COLORS = [
  '#888','#4a9a50','#4a80b4','#9a4ab4','#b4844a',
  '#b44a4a','#4ab4a0','#b4a04a','#7a4ab4','#b44a80'
];

// ── Tags proposés dans le formulaire de création ─────────────
const _LAB_TAGS = [
  'Buff','Soin','Dégâts','Contrôle','Protection','Mobilité',
  'Zone','Feu','Utilitaire','Détection','Mort-vivant','Voyage'
];

// ── État interne ──────────────────────────────────────────────
let _magicActiveTab = 'prepared';
let _magicDetailId  = null;   // id du sort dont le détail est ouvert
let _magLabDetailId = null;   // id du sort du labo dont le détail est ouvert

// ── Point d'entrée ───────────────────────────────────────────
function renderMagic() {
  showMagicTab(_magicActiveTab);
}

// ── Routing sous-onglets ─────────────────────────────────────
function showMagicTab(tab) {
  _magicActiveTab = tab;
  const active   = 'flex:1;padding:6px 10px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;background:var(--bg2);border:1px solid var(--gold);color:var(--gold);border-radius:5px;cursor:pointer;';
  const inactive = 'flex:1;padding:6px 10px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;background:transparent;border:1px solid var(--border);color:var(--text-dim);border-radius:5px;cursor:pointer;';
  ['prepared','known','lab'].forEach(t => {
    const btn = document.getElementById('magic-tab-' + t);
    if (btn) btn.style.cssText = t === tab ? active : inactive;
  });
  const panel = document.getElementById('magic-panel');
  if (!panel) return;
  if (tab === 'prepared') _magRenderPrepared(panel);
  else if (tab === 'known') _magRenderKnown(panel);
  else if (tab === 'lab')   _magRenderLab(panel);
}

// ── Toggle détail carte Préparés ─────────────────────────────
function _magToggleDetail(psId) {
  _magicDetailId = _magicDetailId === psId ? null : psId;
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderPrepared(panel);
}

// ── Toggle détail carte Labo ──────────────────────────────────
function _magLabToggleDetail(spId) {
  _magLabDetailId = _magLabDetailId === spId ? null : spId;
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderLab(panel);
}

// ============================================================
// SOUS-ONGLET : PRÉPARÉS
// ============================================================
function _magRenderPrepared(el) {
  const all    = AppState.preparedSpells || [];
  const ready  = all.filter(p => p.state === 'prepared').length;
  const active = all.filter(p => p.state === 'active').length;
  const cast   = all.filter(p => p.state === 'cast').length;

  // ── État vide ──────────────────────────────────────────
  if (all.length === 0) {
    el.innerHTML = `
      <div style="padding:40px 24px;text-align:center;">
        <div style="font-size:36px;margin-bottom:14px;opacity:.6;">⚡</div>
        <div style="font-family:Cinzel,serif;font-size:13px;letter-spacing:2px;
                    color:var(--gold-dim);margin-bottom:12px;">SORTS PRÉPARÉS</div>
        <div style="font-size:13px;color:var(--text-dim);line-height:1.8;
                    max-width:300px;margin:0 auto 16px;">
          Aucun sort préparé pour aujourd'hui.
        </div>
        <button onclick="showMagicTab('known')"
          style="padding:6px 16px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;
                 background:rgba(180,140,60,0.12);border:1px solid var(--gold-dim);
                 color:var(--gold);border-radius:5px;cursor:pointer;">
          → Aller aux Sorts connus
        </button>
      </div>`;
    return;
  }

  // ── En-tête compteurs ──────────────────────────────────
  const header = `
    <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
      <div style="flex:1;min-width:72px;background:var(--bg3);
                  border:1px solid ${ready>0?'rgba(74,154,80,0.4)':'var(--border)'};
                  border-radius:6px;padding:7px 10px;text-align:center;">
        <div style="font-size:20px;font-weight:700;color:${ready>0?'var(--green)':'var(--text-dim)'};">${ready}</div>
        <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;
                    letter-spacing:1px;margin-top:1px;">DISPO</div>
      </div>
      ${active > 0 ? `
      <div style="flex:1;min-width:72px;background:rgba(180,140,60,0.06);
                  border:1px solid var(--gold-dim);border-radius:6px;padding:7px 10px;text-align:center;">
        <div style="font-size:20px;font-weight:700;color:var(--gold);">${active}</div>
        <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;
                    letter-spacing:1px;margin-top:1px;">ACTIF${active!==1?'S':''}</div>
      </div>` : ''}
      <div style="flex:1;min-width:72px;background:var(--bg3);
                  border:1px solid var(--border);border-radius:6px;padding:7px 10px;text-align:center;">
        <div style="font-size:20px;font-weight:700;color:var(--text-dim);">${cast}</div>
        <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;
                    letter-spacing:1px;margin-top:1px;">UTILISÉ${cast!==1?'S':''}</div>
      </div>
    </div>`;

  // Tri : disponibles → actifs → utilisés ; à niveau égal par ordre de préparation (id)
  const stateOrder = { prepared:0, active:1, cast:2 };
  const sorted = [...all].sort((a,b) => {
    const sd = (stateOrder[a.state]??9) - (stateOrder[b.state]??9);
    return sd !== 0 ? sd : (a.id < b.id ? -1 : 1);
  });

  const cards = sorted.map(ps => _magBuildPreparedCard(ps)).join('');
  el.innerHTML = header + `<div>${cards}</div>`;
}

function _magBuildPreparedCard(ps) {
  const spDb   = (typeof SPELL_DB !== 'undefined') ? SPELL_DB[ps.dbId] : null;
  const spGrim = (AppState.grimoire||[]).find(s => s.id === ps.grimoireId);
  const name   = ps.name || spGrim?.name || spDb?.nameFr || spDb?.name || '—';
  const school = spGrim?.school || spDb?.school || '';
  const dur    = spGrim?.durationText || spDb?.duration || '';
  const lvl    = ps.preparedLevel ?? ps.baseLevel ?? ps.level ?? 0;
  const lvlCol = _SPELL_LEVEL_COLORS[Math.min(lvl, 9)];
  const state  = ps.state || 'prepared';
  const isOpen = _magicDetailId === ps.id;

  // Tags : max 2, depuis spGrim uniquement (pas de dbId dans le flux V1)
  const tags = (spGrim?.tags||[]).slice(0,2).map(t =>
    `<span style="font-size:9px;padding:1px 5px;border-radius:3px;
                  background:var(--bg2);border:1px solid var(--border);
                  color:var(--text-dim);">${t}</span>`
  ).join('');

  // Badge statut
  const badge = {
    prepared: '<span style="font-size:10px;color:var(--green);">✓ Dispo</span>',
    active:   '<span style="font-size:10px;color:var(--gold);">⚡ Actif</span>',
    cast:     '<span style="font-size:10px;color:var(--text-dim);">⊘ Utilisé</span>',
  }[state] || '';

  // Infoline droite : durée si présente, sinon école
  const infoRight = dur
    ? `<span style="font-size:10px;color:var(--text-dim);white-space:nowrap;">⏱ ${dur}</span>`
    : school
      ? `<span style="font-size:10px;color:var(--text-dim);">${school}</span>`
      : '';

  const detail = isOpen ? _magBuildPreparedDetail(ps, spDb, spGrim) : '';
  const opacity = state === 'cast' ? 'opacity:.45;' : '';
  const border  = state === 'active' ? 'var(--gold-dim)' : 'var(--border)';
  const bg      = state === 'active' ? 'rgba(180,140,60,0.05)' : 'var(--bg3)';

  return `
    <div style="border:1px solid ${border};border-radius:6px;margin-bottom:5px;
                ${opacity}background:${bg};">
      <div onclick="_magToggleDetail('${ps.id}')"
           style="display:flex;align-items:center;gap:9px;padding:8px 11px;cursor:pointer;">
        <!-- Bulle niveau -->
        <div style="width:24px;height:24px;border-radius:50%;flex-shrink:0;
                    background:${lvlCol}22;color:${lvlCol};border:1px solid ${lvlCol}55;
                    display:flex;align-items:center;justify-content:center;
                    font-family:Cinzel,serif;font-size:10px;font-weight:700;">${lvl}</div>
        <!-- Nom + infos ligne 1 -->
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
            <span style="font-size:13px;font-family:Cinzel,serif;color:var(--text-bright);
                         text-decoration:${state==='cast'?'line-through':'none'};">${name}</span>
            ${tags}
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap;">
            ${badge}
            ${school && !dur ? '' : school ? `<span style="font-size:10px;color:var(--text-dim);">· ${school}</span>` : ''}
          </div>
        </div>
        <!-- Durée à droite + chevron -->
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          ${infoRight}
          <span style="color:var(--text-dim);font-size:11px;">${isOpen?'▲':'▼'}</span>
        </div>
      </div>
      ${detail}
    </div>`;
}

function _magBuildPreparedDetail(ps, spDb, spGrim) {
  const state = ps.state || 'prepared';
  const src   = spGrim || {};   // seule source V1 (flux grimoire → préparé)

  // Description
  const desc = src.description || spDb?.desc || '';

  // Infos règles — depuis spGrim (source principale) puis spDb si absent
  const ruleLines = [
    ['⌛', src.castingTime   || null],
    ['⏱', src.durationText  || null],
    ['↗', src.rangeText     || spDb?.range || null],
    ['◎', src.targetText    || null],
    ['⛨ JS', src.savingThrowText || (spDb?.save && spDb.save !== 'None' ? spDb.save : null)],
    ['RM', src.spellResistanceText || null],
    ['📖', spDb?.source_abbr ? `${spDb.source_abbr}${spDb.page?' p.'+spDb.page:''}` : null],
  ].filter(([,v]) => v);

  // Tags complets
  const tagBadges = (src.tags||[]).map(t =>
    `<span style="font-size:10px;background:var(--bg2);border:1px solid var(--border);
                  border-radius:3px;padding:2px 6px;color:var(--text-dim);">${t}</span>`
  ).join('');

  // Zone action — deux niveaux visuels distincts
  // Indicateur de buff actif lié à ce sort
  const activeBuff = AppState.buffs.find(b => b.preparedId === ps.id && b.isActive);
  const buffBadge  = activeBuff
    ? `<span style="font-size:10px;color:var(--green);font-style:italic;">⚡ Buff actif sur la fiche</span>`
    : '';

  const actionZone = state === 'prepared' ? `
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px;
                padding-top:10px;border-top:1px solid var(--border);">
      <button onclick="_magCastSpell('${ps.id}')"
        style="padding:5px 16px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;
               border-radius:5px;cursor:pointer;
               background:rgba(180,140,60,0.2);border:1px solid var(--gold-dim);
               color:var(--gold);">
        ⚡ Lancer
      </button>
      <button onclick="_magRemovePrepared('${ps.id}')"
        style="padding:5px 12px;font-size:11px;border-radius:5px;cursor:pointer;
               background:rgba(180,60,60,0.08);border:1px solid rgba(180,60,60,0.25);
               color:var(--red-dim);">
        ✕ Retirer
      </button>
    </div>` : state === 'cast' ? `
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);
                display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      ${buffBadge}
      <span style="font-size:11px;color:var(--text-dim);font-style:italic;">
        Sort lancé — réinitialisé au Repos long.
      </span>
      <button onclick="_magCancelCast('${ps.id}')"
        style="padding:4px 12px;font-size:10px;border-radius:4px;cursor:pointer;
               background:rgba(180,120,0,0.1);border:1px solid rgba(180,120,0,0.3);
               color:var(--gold-dim);"
        title="Annule le lancer — le sort redevient disponible, le buff est retiré">
        ↩ Annuler le lancer
      </button>
      ${activeBuff ? `<button onclick="_magEndBuff('${ps.id}')"
        style="padding:4px 12px;font-size:10px;border-radius:4px;cursor:pointer;
               background:rgba(80,80,80,0.15);border:1px solid rgba(120,120,120,0.3);
               color:var(--text-dim);"
        title="Termine le buff sans récupérer le sort">
        ⏹ Terminer le buff
      </button>` : ''}
    </div>` : `
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
      <span style="font-size:11px;color:var(--gold);font-style:italic;">⚡ Effet en cours.</span>
    </div>`;

  return `
    <div style="border-top:1px solid var(--border);padding:10px 11px 12px 43px;">
      ${desc ? `<div style="font-size:12px;color:var(--text-dim);font-style:italic;
                             line-height:1.5;margin-bottom:9px;">
                  ${desc.slice(0,500)}${desc.length>500?'…':''}
                </div>` : ''}
      ${ruleLines.length ? `
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;">
          ${ruleLines.map(([lbl, val]) =>
            `<div><span style="font-size:10px;color:var(--text-dim);">${lbl}</span>
                  <span style="font-size:11px;margin-left:3px;">${val}</span></div>`
          ).join('')}
        </div>` : ''}
      ${tagBadges ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">${tagBadges}</div>` : ''}
      ${_magCompLine(src)}
      ${_magRenderEffectList(src, true)}
      ${actionZone}
    </div>`;
}

// ============================================================
// SOUS-ONGLET : LABO
// ============================================================
function _magRenderLab(el) {
  const all    = AppState.grimoire || [];
  const drafts = all.filter(s => s.status === 'draft');
  const known  = all.filter(s => s.status === 'known');

  // ── En-tête + bouton créer ──────────────────────────────
  const header = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <div>
        <div style="font-family:Cinzel,serif;font-size:13px;letter-spacing:2px;color:var(--gold-dim);">LABO</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:2px;">
          ${drafts.length} brouillon${drafts.length!==1?'s':''} · ${known.length} appris
        </div>
      </div>
      <button onclick="_magOpenCreateSpell()"
        style="padding:6px 14px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;
               background:rgba(180,140,60,0.15);border:1px solid var(--gold-dim);
               color:var(--gold);border-radius:5px;cursor:pointer;">
        + Créer un sort
      </button>
    </div>`;

  // ── État vide ───────────────────────────────────────────
  if (all.length === 0) {
    el.innerHTML = header + `
      <div style="padding:32px 16px;text-align:center;background:var(--bg3);
                  border:1px solid var(--border);border-radius:8px;">
        <div style="font-size:28px;margin-bottom:10px;opacity:.5;">🧪</div>
        <div style="font-size:13px;color:var(--text-dim);line-height:1.8;">
          Aucun sort dans le labo.<br>
          <span style="font-size:11px;font-style:italic;">
            Créez votre premier sort avec le bouton ci-dessus.
          </span>
        </div>
      </div>`;
    return;
  }

  // ── Liste : brouillons puis appris ──────────────────────
  const makeSectionHeader = (label, count) =>
    count > 0 ? `<div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:2px;
                              color:var(--text-dim);margin:12px 0 6px;">${label} (${count})</div>` : '';

  const draftCards = drafts.map(sp => _magLabBuildCard(sp)).join('');
  const knownCards = known.map(sp => _magLabBuildCard(sp)).join('');

  el.innerHTML = header
    + makeSectionHeader('BROUILLONS', drafts.length) + draftCards
    + makeSectionHeader('APPRIS', known.length)      + knownCards;
}

function _magLabBuildCard(sp) {
  const lvl      = sp.level || 0;
  const lvlColor = _SPELL_LEVEL_COLORS[Math.min(lvl, 9)];
  const isOpen   = _magLabDetailId === sp.id;
  const isKnown  = sp.status === 'known';

  const badge = isKnown
    ? `<span style="font-size:10px;color:var(--green);font-style:italic;">✓ Appris</span>`
    : `<span style="font-size:10px;color:var(--text-dim);font-style:italic;">Brouillon</span>`;

  const tagBadges = (sp.tags||[]).slice(0,3).map(t =>
    `<span style="font-size:9px;background:var(--bg2);border:1px solid var(--border);
                  border-radius:3px;padding:1px 5px;color:var(--text-dim);">${t}</span>`
  ).join('');

  const detail = isOpen ? _magLabBuildDetail(sp) : '';

  return `
    <div style="border:1px solid ${isKnown?'rgba(74,154,80,0.3)':'var(--border)'};border-radius:6px;
                margin-bottom:6px;background:${isKnown?'rgba(74,154,80,0.04)':'var(--bg3)'};">
      <div onclick="_magLabToggleDetail('${sp.id}')"
           style="display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;">
        <div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;
                    background:${lvlColor}22;color:${lvlColor};border:1px solid ${lvlColor}55;
                    display:flex;align-items:center;justify-content:center;
                    font-family:Cinzel,serif;font-size:11px;font-weight:700;">${lvl}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-family:Cinzel,serif;color:var(--text-bright);">${sp.name||'Sans nom'}</div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px;">
            ${badge}
            ${sp.school ? `<span style="font-size:10px;color:var(--text-dim);">· ${sp.school}</span>` : ''}
            ${tagBadges}
          </div>
        </div>
        <span style="color:var(--text-dim);font-size:12px;flex-shrink:0;">${isOpen?'▲':'▼'}</span>
      </div>
      ${detail}
    </div>`;
}

// ── Helper : ligne composantes lisible ───────────────────────
// Retourne une chaîne HTML compacte ou '' si aucune composante
function _magCompLine(sp) {
  const comp = sp?.components;
  if (!comp) return '';
  const types = (comp.types||[]).join(', ');
  if (!types && !comp.description && !comp.cost) return '';
  let parts = [];
  if (types)            parts.push(`<strong style="color:var(--text-bright);">${types}</strong>`);
  if (comp.description) parts.push(comp.description);
  if (comp.cost)        parts.push(`<em style="color:var(--text-dim);">${comp.cost}</em>`);
  if (comp.consumed)    parts.push('<span style="font-size:10px;color:var(--red-dim);">consommée</span>');
  return `<div style="font-size:11px;margin-bottom:6px;">
    <span style="font-size:10px;color:var(--text-dim);margin-right:4px;">Comp.</span>${parts.join(' · ')}
  </div>`;
}

function _magLabBuildDetail(sp) {
  const isKnown = sp.status === 'known';
  const tags    = (sp.tags||[]).map(t =>
    `<span style="font-size:10px;background:var(--bg2);border:1px solid var(--border);
                  border-radius:3px;padding:2px 6px;color:var(--text-dim);">${t}</span>`
  ).join('');

  // Bloc infos règles — champs lecture rapide
  const INFO_FIELDS = [
    ['⌛', sp.castingTime],
    ['⏱', sp.durationText],
    ['↗', sp.rangeText],
    ['◎', sp.targetText],
    ['⛨ JS', sp.savingThrowText],
    ['RM', sp.spellResistanceText],
  ].filter(([,v]) => v);
  const infoLines = INFO_FIELDS.map(([lbl, val]) =>
    `<span style="font-size:10px;color:var(--text-dim);">${lbl}</span> <span style="font-size:11px;">${val}</span>`
  );

  const compLine = _magCompLine(sp);

  return `
    <div style="border-top:1px solid var(--border);padding:10px 12px 12px 48px;">
      ${sp.description ? `<div style="font-size:12px;color:var(--text-dim);font-style:italic;line-height:1.5;margin-bottom:10px;">${sp.description.slice(0,500)}${sp.description.length>500?'…':''}</div>` : ''}
      ${infoLines.length ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;">${infoLines.map(l=>`<div>${l}</div>`).join('')}</div>` : ''}
      ${compLine}
      ${tags ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${tags}</div>` : ''}

      <!-- Liste effets existants -->
      ${_magRenderEffectList(sp)}

      <!-- Zone injection formulaire effet -->
      <div id="_ef-zone-${sp.id}"></div>

      <!-- Actions principales -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
        <button onclick="_magOpenEffectForm('${sp.id}')"
          style="padding:4px 12px;font-size:11px;border-radius:4px;cursor:pointer;
                 background:rgba(180,140,60,0.12);border:1px solid var(--gold-dim);color:var(--gold);">
          + Effet
        </button>
        <button onclick="_magLabEditSpell('${sp.id}')"
          style="padding:4px 12px;font-size:11px;border-radius:4px;cursor:pointer;
                 background:var(--bg2);border:1px solid var(--border);color:var(--text-bright);">
          ✎ Modifier
        </button>
        ${!isKnown ? `<button onclick="_magLabLearnSpell('${sp.id}')"
          style="padding:4px 12px;font-size:11px;border-radius:4px;cursor:pointer;
                 background:rgba(74,154,80,0.15);border:1px solid rgba(74,154,80,0.4);color:var(--green);">
          → Apprendre
        </button>` : `<span style="font-size:10px;color:var(--green);align-self:center;font-style:italic;">✓ Déjà appris</span>`}
        <button onclick="_magLabDeleteSpell('${sp.id}')"
          style="padding:4px 10px;font-size:11px;border-radius:4px;cursor:pointer;
                 background:rgba(180,60,60,0.1);border:1px solid rgba(180,60,60,0.3);color:var(--red);">
          ✕
        </button>
      </div>
    </div>`;
}

// ── Apprendre un sort ─────────────────────────────────────────
function _magLabLearnSpell(spId) {
  const sp = (AppState.grimoire||[]).find(s => s.id === spId);
  if (!sp) return;
  sp.status = 'known';
  autosave();
  if (typeof showToast === 'function') showToast(`"${sp.name}" appris !`, 'success');
  showMagicTab('lab');
}

// ── Supprimer un sort du labo ─────────────────────────────────
function _magLabDeleteSpell(spId) {
  const sp  = (AppState.grimoire||[]).find(s => s.id === spId);
  const name = sp?.name || 'ce sort';
  if (!confirm(`Supprimer "${name}" du labo ? Cette action est irréversible.`)) return;
  AppState.grimoire = (AppState.grimoire||[]).filter(s => s.id !== spId);
  if (_magLabDetailId === spId) _magLabDetailId = null;
  autosave();
  showMagicTab('lab');
}

// ── Modifier un sort (réouvre le formulaire) ──────────────────
function _magLabEditSpell(spId) {
  _magOpenCreateSpell(spId);
}

// ── Modale de création / édition ─────────────────────────────
function _magOpenCreateSpell(spId) {
  const existing = spId ? (AppState.grimoire||[]).find(s=>s.id===spId) : null;
  const title    = existing ? `Modifier — ${existing.name}` : 'Créer un sort';

  // Supprimer une éventuelle modale ouverte
  document.getElementById('_mag-create-modal')?.remove();

  const modal = document.createElement('div');
  modal.id    = '_mag-create-modal';
  modal.className = 'modal-overlay';
  modal.style.zIndex = '1000';

  const currentTags = new Set(existing?.tags || []);
  const tagBtns = _LAB_TAGS.map(t => {
    const on = currentTags.has(t);
    return `<button id="mctag_${t}" onclick="_magToggleTag('${t}')"
      style="padding:3px 8px;font-size:10px;border-radius:4px;cursor:pointer;margin:2px;
             background:${on?'rgba(180,140,60,0.25)':'var(--bg2)'};
             border:1px solid ${on?'var(--gold-dim)':'var(--border)'};
             color:${on?'var(--gold)':'var(--text-dim)'};">${t}</button>`;
  }).join('');

  const SCHOOLS = ['Abjuration','Invocation','Divination','Enchantement','Évocation','Illusion','Nécromancie','Transmutation','Universel'];
  const schoolOpts = SCHOOLS.map(s => `<option value="${s}" ${existing?.school===s?'selected':''}>${s}</option>`).join('');
  const levelOpts  = [0,1,2,3,4,5,6,7,8,9].map(n => `<option value="${n}" ${(existing?.level??0)===n?'selected':''}>${n===0?'Tour de magie':n}</option>`).join('');

  modal.innerHTML = `
    <div class="modal-content" style="max-width:500px;">
      <div class="modal-header">
        <span class="modal-title">&#x1F9EA; ${title}</span>
        <button class="modal-close" onclick="document.getElementById('_mag-create-modal').remove()">×</button>
      </div>
      <div class="modal-body" style="display:grid;gap:10px;">

        <!-- Identité -->
        <div><label class="form-label">Nom *</label>
          <input id="mc-name" class="form-input" value="${existing?.name||''}" placeholder="Nom du sort…"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div><label class="form-label">Niveau</label>
            <select id="mc-level" class="form-input">${levelOpts}</select></div>
          <div><label class="form-label">École</label>
            <select id="mc-school" class="form-input"><option value="">—</option>${schoolOpts}</select></div>
        </div>
        <div><label class="form-label">Tags</label>
          <div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:4px;">${tagBtns}</div></div>

        <!-- Lecture rapide -->
        <div style="border-top:1px solid var(--border);padding-top:8px;
                    font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;
                    color:var(--text-dim);margin-bottom:2px;">LECTURE RAPIDE</div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div><label class="form-label">Temps d'incantation</label>
            <input id="mc-casttime" class="form-input" value="${existing?.castingTime||''}"
              placeholder="ex : 1 action, 1 round…"></div>
          <div><label class="form-label">Durée</label>
            <input id="mc-duration" class="form-input" value="${existing?.durationText||''}"
              placeholder="ex : 1 round/niv, instantané…"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div><label class="form-label">Portée</label>
            <input id="mc-range" class="form-input" value="${existing?.rangeText||''}"
              placeholder="ex : Contact, Proche, 9 m…"></div>
          <div><label class="form-label">Cible / Zone</label>
            <input id="mc-target" class="form-input" value="${existing?.targetText||''}"
              placeholder="ex : 1 créature, Zone 9 m…"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div><label class="form-label">Jet de sauvegarde</label>
            <input id="mc-save" class="form-input" value="${existing?.savingThrowText||''}"
              placeholder="ex : Volonté annule, Néant…"></div>
          <div><label class="form-label">Résistance à la magie</label>
            <input id="mc-rm" class="form-input" value="${existing?.spellResistanceText||''}"
              placeholder="ex : Oui, Non…"></div>
        </div>

        <!-- Composantes -->
        <div style="border-top:1px solid var(--border);padding-top:8px;
                    font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;
                    color:var(--text-dim);margin-bottom:6px;">COMPOSANTES</div>

        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
          ${['V','S','M','F','DF'].map(comp => {
            const checked = (existing?.components?.types||[]).includes(comp);
            return `<label style="display:flex;align-items:center;gap:5px;cursor:pointer;
                                  padding:3px 10px;border-radius:4px;font-size:12px;
                                  background:${checked?'rgba(180,140,60,0.2)':'var(--bg2)'};
                                  border:1px solid ${checked?'var(--gold-dim)':'var(--border)'};
                                  color:${checked?'var(--gold)':'var(--text-dim)'};">
                      <input type="checkbox" id="mc-comp-${comp}" value="${comp}"
                             ${checked?'checked':''} style="accent-color:var(--gold);cursor:pointer;">
                      ${comp}
                    </label>`;
          }).join('')}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px;">
          <div><label class="form-label">Description composante</label>
            <input id="mc-comp-desc" class="form-input" value="${existing?.components?.description||''}"
              placeholder="ex : poudre d'argent fin, plume…"></div>
          <div><label class="form-label">Coût</label>
            <input id="mc-comp-cost" class="form-input" value="${existing?.components?.cost||''}"
              placeholder="ex : 25 po, 1 po…"></div>
        </div>

        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;
                       color:var(--text-dim);margin-bottom:4px;">
          <input type="checkbox" id="mc-comp-consumed"
                 ${existing?.components?.consumed?'checked':''}
                 style="accent-color:var(--gold);cursor:pointer;">
          Composante consommée au lancement
          <!-- DND35-CHECK : F et DF ne sont jamais consommés en D&D 3.5 — non vérifié en V1 -->
        </label>

        <!-- Description -->
        <div><label class="form-label">Description / Notes</label>
          <textarea id="mc-desc" class="form-input" rows="3"
            placeholder="Effets, règles maison, notes…">${existing?.description||''}</textarea></div>

        <div style="font-size:10px;color:var(--text-dim);font-style:italic;
                    border-top:1px solid var(--border);padding-top:8px;">
          Les effets calculables (bonus FOR, CA, JS…) seront ajoutables dans une prochaine itération.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="_magSaveSpell('${spId||''}')">
          ${existing ? 'Enregistrer' : 'Créer'}
        </button>
        <button class="btn btn-secondary" onclick="document.getElementById('_mag-create-modal').remove()">
          Annuler
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);
}

// ── Toggle tag dans la modale ────────────────────────────────
function _magToggleTag(tag) {
  const btn = document.getElementById('mctag_' + tag);
  if (!btn) return;
  const on = btn.style.color.includes('var(--gold)') || btn.style.color === 'var(--gold)';
  btn.style.background = on ? 'var(--bg2)' : 'rgba(180,140,60,0.25)';
  btn.style.border     = on ? '1px solid var(--border)' : '1px solid var(--gold-dim)';
  btn.style.color      = on ? 'var(--text-dim)' : 'var(--gold)';
}

// ── Sauvegarder le sort ──────────────────────────────────────
function _magSaveSpell(spId) {
  const name = document.getElementById('mc-name')?.value.trim();
  if (!name) {
    if (typeof showToast === 'function') showToast('Le nom est obligatoire', 'error');
    return;
  }

  // Collecter les tags sélectionnés
  const tags = _LAB_TAGS.filter(t => {
    const btn = document.getElementById('mctag_' + t);
    return btn && (btn.style.color === 'var(--gold)' || btn.style.color.includes('gold'));
  });

  const data = {
    name,
    level:               parseInt(document.getElementById('mc-level')?.value) || 0,
    school:              document.getElementById('mc-school')?.value || '',
    description:         document.getElementById('mc-desc')?.value.trim() || '',
    tags,
    // Champs lecture rapide — texte libre, aucune interprétation V1
    castingTime:         document.getElementById('mc-casttime')?.value.trim() || '',
    durationText:        document.getElementById('mc-duration')?.value.trim() || '',
    rangeText:           document.getElementById('mc-range')?.value.trim() || '',
    targetText:          document.getElementById('mc-target')?.value.trim() || '',
    savingThrowText:     document.getElementById('mc-save')?.value.trim() || '',
    spellResistanceText: document.getElementById('mc-rm')?.value.trim() || '',
    // DND35-CHECK : spellResistanceText = "la RM adverse peut bloquer ce sort"
    // À valider : sens exact selon la classe et le sort. Non interprété en V1.
    // Composantes — objet unique, aucune interprétation runtime en V1
    components: {
      types:       ['V','S','M','F','DF'].filter(t =>
                     document.getElementById('mc-comp-' + t)?.checked),
      description: document.getElementById('mc-comp-desc')?.value.trim() || '',
      cost:        document.getElementById('mc-comp-cost')?.value.trim() || '',
      consumed:    document.getElementById('mc-comp-consumed')?.checked ?? false,
      // DND35-CHECK : F et DF ne sont pas consommés en D&D 3.5.
      // En V1, le champ consumed est laissé libre — pas d'application de règle.
      // DND35-CHECK : un sort peut avoir plusieurs composantes M distinctes.
      // En V1, une seule description/coût — simplification acceptable.
    },
  };

  if (!AppState.grimoire) AppState.grimoire = [];

  if (spId) {
    const sp = AppState.grimoire.find(s => s.id === spId);
    if (sp) { Object.assign(sp, data); }
  } else {
    AppState.grimoire.push({
      id:      'g_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,5),
      status:  'draft',
      effects: [],
      notes:   '',
      addedAt: Date.now(),
      ...data,
    });
  }

  autosave();
  document.getElementById('_mag-create-modal')?.remove();
  if (typeof showToast === 'function') showToast(spId ? `"${name}" mis à jour` : `"${name}" créé`, 'success');
  showMagicTab('lab');
}

// ============================================================
// SOUS-ONGLET : CONNUS
// ============================================================
// ── État interne CONNUS ───────────────────────────────────────
let _magKnownDetailId = null;   // id du sort dont le détail est ouvert dans CONNUS
let _magKnownSearch   = '';     // filtre texte courant

// ── Toggle détail carte CONNUS ────────────────────────────────
function _magKnownToggleDetail(spId) {
  _magKnownDetailId = _magKnownDetailId === spId ? null : spId;
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderKnown(panel);
}

// ── Mise à jour de la recherche ───────────────────────────────
function _magKnownSearch_update(val) {
  _magKnownSearch = (val || '').toLowerCase().trim();
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderKnown(panel);
}

// ============================================================
// PONT CONNUS → PRÉPARÉS
// ============================================================

// ── Préparer un sort connu ────────────────────────────────────
// Crée une instance dans AppState.preparedSpells[].
// Un même sort peut être préparé plusieurs fois (instance séparée à chaque appel).
// Schéma V1 : { id, grimoireId, name, level, state:'prepared' }
// Le détail complet (school, description…) est résolu dynamiquement
// depuis AppState.grimoire[] via grimoireId — pas de snapshot lourd nécessaire.
function _magPrepareSpell(spId) {
  const sp = (AppState.grimoire||[]).find(s => s.id === spId);
  if (!sp) return;

  if (!AppState.preparedSpells) AppState.preparedSpells = [];
  AppState.preparedSpells.push({
    id:          'prep_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,4),
    grimoireId:  sp.id,
    name:        sp.name,     // snapshot — fallback si grimoire est modifié après
    level:       sp.level || 0,
    state:       'prepared',
  });

  autosave();
  if (typeof showToast === 'function') showToast(`"${sp.name}" préparé`, 'success');

  // Basculer sur Préparés pour confirmer visuellement
  showMagicTab('prepared');
}

// ── Retirer un sort préparé ───────────────────────────────────
// Disponible uniquement pour state:'prepared' (pas pour cast/active).
// Confirmation demandée pour éviter les clics accidentels.
function _magRemovePrepared(prepId) {
  const ps   = (AppState.preparedSpells||[]).find(p => p.id === prepId);
  const name = ps?.name || 'ce sort';
  if (!confirm(`Retirer "${name}" des sorts préparés ?`)) return;
  AppState.preparedSpells = (AppState.preparedSpells||[]).filter(p => p.id !== prepId);
  autosave();
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderPrepared(panel);
}

// ── Annuler un lancer ─────────────────────────────────────────
// Le sort redevient disponible (state → 'prepared'), le buff lié est retiré.
// Usage : correction d'erreur ou test — pas une fin normale de sort.
function _magCancelCast(prepId) {
  const ps = (AppState.preparedSpells||[]).find(p => p.id === prepId);
  if (!ps || ps.state !== 'cast') return;
  // Retirer le buff lié
  AppState.buffs = (AppState.buffs||[]).filter(b => b.preparedId !== prepId);
  // Remettre le sort disponible
  ps.state = 'prepared';
  delete ps.castAt;
  autosave();
  if (typeof renderSheet === 'function') renderSheet();
  if (typeof showToast === 'function') showToast(`"${ps.name}" — lancer annulé`, 'info');
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderPrepared(panel);
}

// ── Terminer un buff ──────────────────────────────────────────
// Le buff s'arrête (isActive → false), le sort RESTE lancé (state = 'cast').
// Le sort ne redevient PAS disponible — sémantique normale de fin de durée.
function _magEndBuff(prepId) {
  const ps   = (AppState.preparedSpells||[]).find(p => p.id === prepId);
  const buff = (AppState.buffs||[]).find(b => b.preparedId === prepId && b.isActive);
  if (!buff) return;
  buff.isActive = false;
  autosave();
  if (typeof renderSheet === 'function') renderSheet();
  if (typeof showToast === 'function') showToast(`"${ps?.name || 'Buff'}" — terminé`, 'info');
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderPrepared(panel);
}

// ── CONNUS V1 ─────────────────────────────────────────────────
function _magRenderKnown(el) {
  const all   = (AppState.grimoire || []).filter(s => s.status === 'known');
  const query = _magKnownSearch;

  // Filtre texte (nom + école si disponible, sans surcharge)
  const filtered = query
    ? all.filter(s => (s.name||'').toLowerCase().includes(query)
                   || (s.school||'').toLowerCase().includes(query))
    : all;

  // Tri : niveau croissant, puis alphabétique
  const sorted = [...filtered].sort((a, b) => {
    const lvlDiff = (a.level||0) - (b.level||0);
    if (lvlDiff !== 0) return lvlDiff;
    return (a.name||'').localeCompare(b.name||'', 'fr', { sensitivity:'base' });
  });

  // ── État vide ──────────────────────────────────────────
  if (all.length === 0) {
    el.innerHTML = `
      <div style="padding:40px 24px;text-align:center;">
        <div style="font-size:36px;margin-bottom:14px;opacity:.6;">📚</div>
        <div style="font-family:Cinzel,serif;font-size:13px;letter-spacing:2px;
                    color:var(--gold-dim);margin-bottom:12px;">SORTS CONNUS</div>
        <div style="font-size:13px;color:var(--text-dim);line-height:1.8;max-width:300px;margin:0 auto 16px;">
          Aucun sort appris pour le moment.<br>
          <span style="font-size:11px;font-style:italic;">
            Créez vos sorts dans le Labo<br>puis cliquez "Apprendre".
          </span>
        </div>
        <button onclick="showMagicTab('lab')"
          style="padding:6px 16px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;
                 background:rgba(180,140,60,0.12);border:1px solid var(--gold-dim);
                 color:var(--gold);border-radius:5px;cursor:pointer;">
          → Aller au Labo
        </button>
      </div>`;
    return;
  }

  // ── En-tête ────────────────────────────────────────────
  const header = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <div style="font-family:Cinzel,serif;font-size:13px;letter-spacing:2px;color:var(--gold-dim);">
        SORTS CONNUS
        <span style="font-size:11px;color:var(--text-dim);letter-spacing:0;
                     font-family:inherit;margin-left:6px;">
          ${sorted.length}${sorted.length !== all.length ? ' / ' + all.length : ''}
        </span>
      </div>
      <input
        type="text"
        placeholder="Rechercher…"
        oninput="_magKnownSearch_update(this.value)"
        value="${_magKnownSearch.replace(/"/g,'&quot;')}"
        style="padding:4px 10px;font-size:12px;border-radius:5px;
               background:var(--bg3);border:1px solid var(--border);
               color:var(--text-bright);width:150px;outline:none;">
    </div>`;

  // ── Résultat vide après filtre ─────────────────────────
  if (sorted.length === 0) {
    el.innerHTML = header + `
      <div style="padding:24px;text-align:center;background:var(--bg3);
                  border:1px solid var(--border);border-radius:6px;">
        <span style="font-size:12px;color:var(--text-dim);font-style:italic;">
          Aucun sort ne correspond à « ${_magKnownSearch} ».
        </span>
      </div>`;
    return;
  }

  // ── Liste des cartes ───────────────────────────────────
  const cards = sorted.map(sp => _magKnownBuildCard(sp)).join('');
  el.innerHTML = header + `<div>${cards}</div>`;
}

// ── Carte CONNUS ──────────────────────────────────────────────
function _magKnownBuildCard(sp) {
  const lvl      = sp.level || 0;
  const lvlColor = _SPELL_LEVEL_COLORS[Math.min(lvl, 9)];
  const isOpen   = _magKnownDetailId === sp.id;

  const tagBadges = (sp.tags||[]).slice(0,3).map(t =>
    `<span style="font-size:9px;background:var(--bg2);border:1px solid var(--border);
                  border-radius:3px;padding:1px 5px;color:var(--text-dim);">${t}</span>`
  ).join('');

  const infoLine = [
    sp.school,
    lvl === 0 ? 'Tour de magie' : `Niveau ${lvl}`
  ].filter(Boolean).join(' · ');

  const detail = isOpen ? _magKnownBuildDetail(sp) : '';

  return `
    <div style="border:1px solid var(--border);border-radius:6px;
                margin-bottom:5px;background:var(--bg3);">
      <div onclick="_magKnownToggleDetail('${sp.id}')"
           style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;">
        <div style="width:24px;height:24px;border-radius:50%;flex-shrink:0;
                    background:${lvlColor}22;color:${lvlColor};border:1px solid ${lvlColor}55;
                    display:flex;align-items:center;justify-content:center;
                    font-family:Cinzel,serif;font-size:10px;font-weight:700;">${lvl}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-family:Cinzel,serif;
                      color:var(--text-bright);">${sp.name||'Sans nom'}</div>
          ${(infoLine||tagBadges) ? `
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:2px;">
            ${infoLine ? `<span style="font-size:10px;color:var(--text-dim);">${infoLine}</span>` : ''}
            ${tagBadges}
          </div>` : ''}
        </div>
        <span style="color:var(--text-dim);font-size:11px;flex-shrink:0;">${isOpen?'▲':'▼'}</span>
      </div>
      ${detail}
    </div>`;
}

// ── Détail CONNUS ─────────────────────────────────────────────
function _magKnownBuildDetail(sp) {
  const allTags = (sp.tags||[]).map(t =>
    `<span style="font-size:10px;background:var(--bg2);border:1px solid var(--border);
                  border-radius:3px;padding:2px 6px;color:var(--text-dim);">${t}</span>`
  ).join('');

  const INFO_FIELDS_K = [
    ['⌛', sp.castingTime],
    ['⏱', sp.durationText],
    ['↗', sp.rangeText],
    ['◎', sp.targetText],
    ['⛨ JS', sp.savingThrowText],
    ['RM', sp.spellResistanceText],
  ].filter(([,v]) => v);
  const infoLines = INFO_FIELDS_K.map(([lbl, val]) =>
    `<span style="font-size:10px;color:var(--text-dim);">${lbl}</span> <span style="font-size:11px;">${val}</span>`
  );

  return `
    <div style="border-top:1px solid var(--border);padding:10px 12px 12px 46px;">
      ${sp.description
        ? `<div style="font-size:12px;color:var(--text-dim);font-style:italic;
                       line-height:1.5;margin-bottom:10px;">
             ${sp.description.slice(0,500)}${sp.description.length>500?'…':''}
           </div>`
        : ''}
      ${infoLines.length
        ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;">
             ${infoLines.map(l=>`<div>${l}</div>`).join('')}
           </div>`
        : ''}
      ${_magCompLine(sp)}
      ${allTags
        ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${allTags}</div>`
        : ''}
      ${_magRenderEffectList(sp, true)}
      <button onclick="_magPrepareSpell('${sp.id}')"
        style="padding:4px 14px;font-family:Cinzel,serif;font-size:10px;letter-spacing:1px;
               background:rgba(74,154,80,0.15);border:1px solid rgba(74,154,80,0.4);
               color:var(--green);border-radius:4px;cursor:pointer;">
        → Préparer
      </button>
    </div>`;
}

// ============================================================
// EFFETS STRUCTURÉS V1 — Phase 6
// Saisie, stockage, affichage. PAS de runtime, PAS de buff.
//
// FORMAT EFFET CALCULÉ :
//   { target:'ability.STR', bonusType:'enhancement', value:4 }
//
// FORMAT NOTE DESCRIPTIVE :
//   { descriptive:true, text:'Vision dans le noir 18 m.' }
//
// hp.temp : stocké comme effet calculé dans grimoire[].effects[]
//   MAIS au lancement (Phase 7), le code doit écrire dans
//   chr.hp.temporary — PAS dans buffs[].effects[].
//   // DND35-CHECK : hp.temp = "highest wins" en D&D 3.5 (non cumulatif)
// ============================================================

// ── Table de mapping UI → target runtime ─────────────────────
// VERIFIED — cibles V1 alignées avec getACComponents() et getSaveTotal() dans rules.js.
// Toute nouvelle cible ajoutée ici doit être consommée par collectBonuses() dans rules.js.
const _EFFECT_TARGETS = {
  // Caractéristiques
  'STR':'ability.STR', 'DEX':'ability.DEX', 'CON':'ability.CON',
  'INT':'ability.INT', 'WIS':'ability.WIS', 'CHA':'ability.CHA',
  // CA
  'ca_armor':     'defense.armor',        // vérifié getACComponents
  'ca_shield':    'defense.shield',       // vérifié getACComponents
  'ca_natural':   'defense.naturalArmor', // vérifié getACComponents
  'ca_deflection':'defense.deflection',   // vérifié getACComponents
  'ca_dodge':     'defense.dodge',        // vérifié getACComponents — STACK
  'ca_sacred':    'defense.sacred',       // vérifié getACComponents
  // Sauvegardes
  'save_fort':'save.fortitude', 'save_ref':'save.reflex',
  'save_will':'save.will',      'save_all':'save.all',
  // Divers
  'init':    'combat.initiative',
  'attack':  'combat.attack',
  'hp_temp': 'hp.temp',  // cas spécial Phase 7
};

// Catégories UI → cibles disponibles
const _EFFECT_CATS = {
  char:   { label:'Caractéristique', cibles:[
    ['STR','Force'],['DEX','Dextérité'],['CON','Constitution'],
    ['INT','Intelligence'],['WIS','Sagesse'],['CHA','Charisme']
  ]},
  ca:     { label:'CA', cibles:[
    ['ca_armor','Armure'],['ca_shield','Bouclier'],
    ['ca_natural','Armure naturelle'],['ca_deflection','Déflection'],
    ['ca_dodge','Esquive'],['ca_sacred','Sacré']
  ]},
  save:   { label:'Jet de sauvegarde', cibles:[
    ['save_fort','Vigueur'],['save_ref','Réflexes'],
    ['save_will','Volonté'],['save_all','Tous les JS']
  ]},
  init:   { label:'Initiative', cibles:null },
  attack: { label:'Attaque',    cibles:null },
  hp_temp:{ label:'PV temporaires', cibles:null },
};

// Types de bonus CA valides — mapping direct bonusType → target runtime
// VERIFIED: pour la CA, le type de bonus suffit à déterminer la target.
// Pas de sous-cible séparée : armor → defense.armor, shield → defense.shield, etc.
const _CA_BONUS_TYPES = [
  ['armor',        'Armure',           'defense.armor'],
  ['shield',       'Bouclier',         'defense.shield'],
  ['natural_armor','Armure naturelle', 'defense.naturalArmor'],
  ['deflection',   'Déflection',       'defense.deflection'],
  ['dodge',        'Esquive',          'defense.dodge'],
  ['sacred',       'Sacré',            'defense.sacred'],
];

// Types de bonus avec stacking
const _BONUS_TYPES = [
  ['enhancement','Altération'],   ['morale','Moral'],
  ['luck','Chance'],              ['sacred','Sacré'],
  ['resistance','Résistance'],    ['deflection','Déflection'],
  ['natural_armor','Armure nat.'],['dodge','Esquive'],
  ['armor','Armure'],             ['shield','Bouclier'],
  ['untyped','Sans type'],
];

// Labels FR pour affichage
const _TARGET_LABELS = Object.fromEntries(
  Object.entries(_EFFECT_CATS).flatMap(([,cat]) =>
    (cat.cibles || [[cat.label.toLowerCase(), cat.label]]).map(([k,v]) => [k,v])
  )
);
const _BONUS_LABELS = Object.fromEntries(_BONUS_TYPES);

// ── Validation d'un effet calculé ────────────────────────────
function _isValidCalcEffect(cat, cible, val, btype) {
  const n = parseInt(val, 10);
  if (isNaN(n) || n === 0) return false;
  if (!cat) return false;
  const catDef = _EFFECT_CATS[cat];
  if (!catDef) return false;
  // CA : bonusType suffit, pas de cible séparée
  if (cat === 'ca') return !!btype && _CA_BONUS_TYPES.some(([k]) => k === btype);
  // hp.temp n'a pas de bonusType
  if (cat === 'hp_temp') return true;
  // Autres catégories avec sous-cibles
  if (catDef.cibles && !cible) return false;
  return !!btype;
}

// ── Preview temps réel ────────────────────────────────────────
function _magEffectPreview(cat, cible, val, btype) {
  if (!cat) return '—';
  const n = parseInt(val, 10);
  if (isNaN(n) || n === 0) return '—';
  const catDef = _EFFECT_CATS[cat];
  if (!catDef) return '—';
  const sign = n > 0 ? '+' : '';
  if (cat === 'hp_temp') return `PV temporaires ${sign}${n}`;
  if (cat === 'ca') {
    if (!btype) return '—';
    const entry = _CA_BONUS_TYPES.find(([k]) => k === btype);
    if (!entry) return '—';
    const stackNote = btype === 'dodge' ? ' (cumul)' : '';
    return `CA ${entry[1]} ${sign}${n}${stackNote}`;
  }
  const targetKey = catDef.cibles ? cible : cat;
  if (catDef.cibles && !cible) return '—';
  const label = _TARGET_LABELS[targetKey] || targetKey;
  if (!btype) return '—';
  const bl = _BONUS_LABELS[btype] || btype;
  return `${label} ${sign}${n} (${bl})`;
}

function _magUpdatePreview() {
  const pre = document.getElementById('_ef-preview');
  if (!pre) return;
  const cat   = document.getElementById('_ef-cat')?.value   || '';
  const cible = document.getElementById('_ef-cible')?.value || '';
  const val   = document.getElementById('_ef-val')?.value   || '';
  const btype = document.getElementById('_ef-btype')?.value || '';
  const txt   = _magEffectPreview(cat, cible, val, btype);
  pre.textContent = txt;
  pre.style.color = txt === '—' ? 'var(--text-dim)' : 'var(--gold)';
  const btn = document.getElementById('_ef-add-btn');
  if (btn) btn.disabled = txt === '—';
}

// Mise à jour dynamique du select cible et bonus selon catégorie
function _magEffectCatChange() {
  const cat    = document.getElementById('_ef-cat')?.value || '';
  const catDef = _EFFECT_CATS[cat];
  if (!catDef) return;

  const cibleRow = document.getElementById('_ef-cible-row');
  const cibleSel = document.getElementById('_ef-cible');
  const btypeRow = document.getElementById('_ef-btype-row');
  const btypeSel = document.getElementById('_ef-btype');

  if (cat === 'ca') {
    // CA : pas de sous-cible — le type de bonus suffit (mapping direct bonusType → target)
    cibleRow.style.display = 'none';
    cibleSel.value = '';
    btypeRow.style.display = '';
    btypeSel.innerHTML = `<option value="">— Type de bonus CA —</option>` +
      _CA_BONUS_TYPES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
  } else if (catDef.cibles) {
    cibleRow.style.display = '';
    cibleSel.innerHTML = `<option value="">— Choisir —</option>` +
      catDef.cibles.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
    btypeRow.style.display = cat === 'hp_temp' ? 'none' : '';
    // Remettre la liste complète des bonus types pour les autres catégories
    btypeSel.innerHTML = `<option value="">— Type de bonus —</option>` +
      _BONUS_TYPES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
  } else {
    cibleRow.style.display = 'none';
    cibleSel.value = '';
    btypeRow.style.display = cat === 'hp_temp' ? 'none' : '';
    btypeSel.innerHTML = `<option value="">— Type de bonus —</option>` +
      _BONUS_TYPES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
  }

  // Aide contextuelle
  const hint = document.getElementById('_ef-hint');
  if (hint) {
    if (cat === 'hp_temp') {
      hint.textContent = 'PV temporaires : valeur saisie = PV max de la source.';
      hint.style.display = '';
    } else if (cat === 'ca') {
      hint.textContent = 'CA : le type de bonus détermine la cible (armure, bouclier…). Esquive se cumule toujours.';
      hint.style.display = '';
    } else {
      hint.style.display = 'none';
    }
  }
  _magUpdatePreview();
}

// ── Ouvrir le formulaire d'effet dans le contexte du détail Labo ──
function _magOpenEffectForm(spId) {
  const existing = document.getElementById('_ef-panel-' + spId);
  if (existing) { existing.remove(); return; } // toggle

  const container = document.getElementById('_ef-zone-' + spId);
  if (!container) return;

  const catOpts = Object.entries(_EFFECT_CATS)
    .map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');
  const btypeOpts = _BONUS_TYPES
    .map(([k,l]) => `<option value="${k}">${l}</option>`).join('');

  const panel = document.createElement('div');
  panel.id = '_ef-panel-' + spId;
  panel.style.cssText = 'border:1px solid var(--border);border-radius:6px;' +
    'background:var(--bg2);padding:10px 12px;margin-top:8px;';

  panel.innerHTML = `
    <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;
                color:var(--gold-dim);margin-bottom:8px;">AJOUTER UN EFFET</div>

    <!-- Choix type -->
    <div style="display:flex;gap:6px;margin-bottom:10px;">
      <button id="_ef-type-calc" onclick="_magEffectTypeSelect('${spId}','calc')"
        style="flex:1;padding:4px 8px;font-size:11px;border-radius:4px;cursor:pointer;
               background:rgba(180,140,60,0.2);border:1px solid var(--gold-dim);color:var(--gold);">
        ⚡ Effet calculé
      </button>
      <button id="_ef-type-desc" onclick="_magEffectTypeSelect('${spId}','desc')"
        style="flex:1;padding:4px 8px;font-size:11px;border-radius:4px;cursor:pointer;
               background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">
        📝 Note descriptive
      </button>
    </div>

    <!-- Formulaire calculé -->
    <div id="_ef-form-calc-${spId}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
        <div>
          <select id="_ef-cat" onchange="_magEffectCatChange()" class="form-input"
            style="font-size:11px;">
            <option value="">— Catégorie —</option>${catOpts}
          </select>
        </div>
        <div>
          <input id="_ef-val" type="number" step="1" class="form-input"
            placeholder="Valeur (ex: 4)" oninput="_magUpdatePreview()"
            style="font-size:11px;">
        </div>
      </div>
      <div id="_ef-cible-row" style="margin-bottom:6px;display:none;">
        <select id="_ef-cible" onchange="_magUpdatePreview()" class="form-input"
          style="font-size:11px;">
          <option value="">— Cible —</option>
        </select>
      </div>
      <div id="_ef-btype-row" style="margin-bottom:6px;">
        <select id="_ef-btype" onchange="_magUpdatePreview()" class="form-input"
          style="font-size:11px;">
          <option value="">— Type de bonus —</option>${btypeOpts}
        </select>
      </div>
      <div id="_ef-hint" style="font-size:10px;color:var(--text-dim);
           font-style:italic;margin-bottom:6px;display:none;"></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span id="_ef-preview"
          style="flex:1;font-size:12px;color:var(--text-dim);font-style:italic;">—</span>
        <button id="_ef-add-btn" disabled onclick="_magSaveCalcEffect('${spId}')"
          style="padding:4px 14px;font-size:11px;border-radius:4px;cursor:pointer;
                 background:rgba(180,140,60,0.15);border:1px solid var(--gold-dim);
                 color:var(--gold);">Ajouter</button>
      </div>
    </div>

    <!-- Formulaire descriptif -->
    <div id="_ef-form-desc-${spId}" style="display:none;">
      <textarea id="_ef-desc-txt" class="form-input" rows="2"
        placeholder="Ex: Le sujet gagne la vision dans le noir 18 m."
        style="font-size:11px;margin-bottom:6px;"></textarea>
      <div style="text-align:right;">
        <button onclick="_magSaveDescEffect('${spId}')"
          style="padding:4px 14px;font-size:11px;border-radius:4px;cursor:pointer;
                 background:var(--bg3);border:1px solid var(--border);color:var(--text-bright);">
          Ajouter
        </button>
      </div>
    </div>`;

  container.appendChild(panel);
}

function _magEffectTypeSelect(spId, type) {
  const btnCalc = document.getElementById('_ef-type-calc');
  const btnDesc = document.getElementById('_ef-type-desc');
  const formCalc = document.getElementById('_ef-form-calc-' + spId);
  const formDesc = document.getElementById('_ef-form-desc-' + spId);
  if (!btnCalc || !btnDesc) return;
  if (type === 'calc') {
    btnCalc.style.cssText = 'flex:1;padding:4px 8px;font-size:11px;border-radius:4px;cursor:pointer;background:rgba(180,140,60,0.2);border:1px solid var(--gold-dim);color:var(--gold);';
    btnDesc.style.cssText = 'flex:1;padding:4px 8px;font-size:11px;border-radius:4px;cursor:pointer;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);';
    if (formCalc) formCalc.style.display = '';
    if (formDesc) formDesc.style.display = 'none';
  } else {
    btnDesc.style.cssText = 'flex:1;padding:4px 8px;font-size:11px;border-radius:4px;cursor:pointer;background:rgba(74,154,80,0.15);border:1px solid rgba(74,154,80,0.4);color:var(--green);';
    btnCalc.style.cssText = 'flex:1;padding:4px 8px;font-size:11px;border-radius:4px;cursor:pointer;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);';
    if (formCalc) formCalc.style.display = 'none';
    if (formDesc) formDesc.style.display = '';
  }
}

function _magSaveCalcEffect(spId) {
  const sp    = (AppState.grimoire||[]).find(s => s.id === spId);
  if (!sp) return;
  const cat   = document.getElementById('_ef-cat')?.value   || '';
  const cible = document.getElementById('_ef-cible')?.value || '';
  const val   = parseInt(document.getElementById('_ef-val')?.value, 10);
  const btype = document.getElementById('_ef-btype')?.value || '';
  if (!_isValidCalcEffect(cat, cible, val, btype)) return;

  let target;
  if (cat === 'ca') {
    // CA : target déduite du bonusType directement — pas de cible intermédiaire
    const entry = _CA_BONUS_TYPES.find(([k]) => k === btype);
    if (!entry) return;
    target = entry[2];
  } else {
    const catDef    = _EFFECT_CATS[cat];
    const targetKey = catDef.cibles ? cible : cat;
    target = _EFFECT_TARGETS[targetKey];
    if (!target) return;
  }

  if (!sp.effects) sp.effects = [];
  const ef = { target, value: val };
  if (cat !== 'hp_temp') ef.bonusType = btype;
  // hp.temp : cas spécial Phase 7 — stocké ici pour affichage uniquement
  // Au lancement, écrire dans chr.hp.temporary (pas dans buffs[])
  // DND35-CHECK : hp.temp = highest wins, non cumulatif
  sp.effects.push(ef);
  autosave();
  document.getElementById('_ef-panel-' + spId)?.remove();
  // Re-rendre le détail
  _magLabDetailId = spId;
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderLab(panel);
}

function _magSaveDescEffect(spId) {
  const sp  = (AppState.grimoire||[]).find(s => s.id === spId);
  if (!sp) return;
  const txt = document.getElementById('_ef-desc-txt')?.value.trim();
  if (!txt) return;
  if (!sp.effects) sp.effects = [];
  sp.effects.push({ descriptive: true, text: txt });
  autosave();
  document.getElementById('_ef-panel-' + spId)?.remove();
  _magLabDetailId = spId;
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderLab(panel);
}

function _magDeleteEffect(spId, efIdx) {
  const sp = (AppState.grimoire||[]).find(s => s.id === spId);
  if (!sp || !sp.effects) return;
  sp.effects.splice(efIdx, 1);
  autosave();
  _magLabDetailId = spId;
  const panel = document.getElementById('magic-panel');
  if (panel) _magRenderLab(panel);
}

// ── Rendu de la liste des effets dans le détail LABO ─────────
function _magRenderEffectList(sp, readonly) {
  const effects = sp.effects || [];
  if (effects.length === 0) return '';

  const rows = effects.map((ef, i) => {
    const delBtn = readonly ? '' :
      `<button onclick="_magDeleteEffect('${sp.id}',${i})"
        style="padding:1px 6px;font-size:10px;border-radius:3px;cursor:pointer;flex-shrink:0;
               background:rgba(180,60,60,0.08);border:1px solid rgba(180,60,60,0.25);color:var(--red-dim);">✕</button>`;

    if (ef.descriptive) {
      return `<div style="display:flex;align-items:flex-start;gap:6px;padding:4px 0;
                           border-bottom:1px solid var(--border);">
        <span style="font-size:10px;color:var(--text-dim);flex-shrink:0;margin-top:1px;">📝</span>
        <span style="font-size:11px;color:var(--text-dim);font-style:italic;flex:1;">${ef.text||''}</span>
        ${delBtn}
      </div>`;
    }
    // Effet calculé — construire le label lisible
    const targetEntry = Object.entries(_EFFECT_TARGETS).find(([,v]) => v === ef.target);
    const tKey  = targetEntry ? targetEntry[0] : ef.target;
    const tLbl  = _TARGET_LABELS[tKey] || ef.target;
    const bLbl  = ef.bonusType ? (_BONUS_LABELS[ef.bonusType] || ef.bonusType) : '';
    const sign  = ef.value > 0 ? '+' : '';
    const isHpTemp = ef.target === 'hp.temp';
    const label = isHpTemp
      ? `PV temporaires ${sign}${ef.value}`
      : `${tLbl} ${sign}${ef.value}${bLbl ? ` (${bLbl})` : ''}`;
    return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;
                         border-bottom:1px solid var(--border);">
      <span style="font-size:10px;color:var(--gold-dim);flex-shrink:0;">⚡</span>
      <span style="font-size:11px;color:var(--text-bright);flex:1;">${label}</span>
      ${isHpTemp ? `<span style="font-size:9px;color:var(--text-dim);font-style:italic;">⚠ ph.7</span>` : ''}
      ${delBtn}
    </div>`;
  }).join('');

  const calcCount = effects.filter(e => !e.descriptive).length;
  const descCount = effects.filter(e =>  e.descriptive).length;
  const summary   = [
    calcCount > 0 ? `${calcCount} effet${calcCount>1?'s':''} calculé${calcCount>1?'s':''}` : null,
    descCount > 0 ? `${descCount} note${descCount>1?'s':''}` : null,
  ].filter(Boolean).join(' · ');

  // En mode édition (Labo, readonly=false), afficher l'aide de modification
  const editHint = readonly ? '' :
    `<div style="font-size:10px;color:var(--text-dim);font-style:italic;margin-top:4px;">
       Pour modifier un effet : supprimer ✕ puis recréer.
     </div>`;

  return `<div style="margin-bottom:8px;">
    <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;
                color:var(--text-dim);margin-bottom:4px;">${summary.toUpperCase()}</div>
    <div style="border:1px solid var(--border);border-radius:4px;
                background:var(--bg2);padding:4px 8px;">${rows}</div>
    ${editHint}
  </div>`;
}

// ============================================================
// PHASE 7 — LANCEMENT V1
//
// Règle de décision pour la création d'un buff runtime :
//   - sort avec effets calculés valides → buff créé dans AppState.buffs[]
//   - sort avec hp.temp → écrit dans chr.hp.temporary (cas spécial)
//   - sort sans effets calculés → simple marquage cast, pas de buff
//   - notes descriptives → ignorées au lancement
//
// Le buff runtime est un SNAPSHOT des effets au moment du lancement.
// Modifier le sort dans le Labo après lancement n'affecte pas le buff en cours.
//
// Reset repos long = mécanisme applicatif V1 de nettoyage.
// Pas une règle D&D 3.5 générale.
// DND35-CHECK : hp.temp expire selon la durée du sort, pas forcément au repos long.
// ============================================================

function _magCastSpell(prepId) {
  // PHASE-MAGIC V1 STABILISÉ — logique de lancement validée en cadrage.
  // Trois chemins : effets calculés → AppState.buffs (snapshot figé),
  //                 hp.temp → chr.hp.temporary (highest wins, non cumulatif),
  //                 effets descriptifs → ignorés au lancement.
  // Re-cast : le buff existant pour ce prepId est retiré avant d'en créer un nouveau.
  const ps = (AppState.preparedSpells || []).find(p => p.id === prepId);
  if (!ps || ps.state !== 'prepared') return;

  const sp = (AppState.grimoire || []).find(s => s.id === ps.grimoireId);
  const effects = sp?.effects || [];

  // ── Séparer les trois types d'effets ─────────────────────
  const calcEffects = effects.filter(ef =>
    !ef.descriptive &&
    ef.target && ef.target !== 'hp.temp' &&
    typeof ef.bonusType === 'string' && ef.bonusType.length > 0 &&
    typeof ef.value === 'number' && ef.value !== 0
  );
  const hpTempEffect = effects.find(ef =>
    !ef.descriptive && ef.target === 'hp.temp' &&
    typeof ef.value === 'number' && ef.value > 0
  );
  // Notes descriptives → ignorées au lancement

  // ── Créer le buff runtime si effets calculés présents ────
  if (calcEffects.length > 0) {
    if (!AppState.buffs) AppState.buffs = [];
    // Retirer un éventuel buff existant pour ce lancement (re-cast)
    AppState.buffs = AppState.buffs.filter(b => b.preparedId !== prepId);
    AppState.buffs.push({
      id:           'spell_' + prepId,
      name:         ps.name,
      isActive:     true,
      isSelf:       true,
      sourceType:   'spell',       // pour longRest()
      grimoireId:   ps.grimoireId, // traçabilité vers le sort source
      preparedId:   prepId,        // lien vers l'instance lancée
      durationText: sp?.durationText || '',  // informatif, non interprété
      effects:      calcEffects.map(ef => ({  // snapshot — copie figée
        target:    ef.target,
        bonusType: ef.bonusType,
        value:     ef.value,
      })),
    });
  }

  // ── Traitement spécial hp.temp ────────────────────────────
  if (hpTempEffect) {
    // Règle V1 : highest wins (D&D 3.5 — non cumulatif)
    // DND35-CHECK : validé en cadrage Phase 6. chr.hp.temporary = source unique.
    AppState.character.hp.temporary = Math.max(
      AppState.character.hp.temporary || 0,
      hpTempEffect.value
    );
  }

  // ── Marquer le sort comme lancé ───────────────────────────
  ps.state  = 'cast';
  ps.castAt = Date.now();

  // ── Toast informatif ──────────────────────────────────────
  const parts = [];
  if (calcEffects.length > 0) parts.push(`buff appliqué à la fiche`);
  if (hpTempEffect)            parts.push(`+${hpTempEffect.value} PV temporaires`);
  if (parts.length === 0)      parts.push(`sort tracé`);
  const msg = `"${ps.name}" lancé — ${parts.join(', ')}.`;
  if (typeof showToast === 'function') showToast(msg, 'success');

  autosave();
  if (typeof renderSheet === 'function') renderSheet();
  // Re-rendre PRÉPARÉS pour mettre à jour les badges
  const panel = document.getElementById('magic-panel');
  if (panel && typeof _magicActiveTab !== 'undefined' && _magicActiveTab === 'prepared') {
    _magRenderPrepared(panel);
  }
}
