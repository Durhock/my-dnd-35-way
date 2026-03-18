// ============================================================
// journal.js — Journal de bord de campagne
//
// AppState.journal = {
//   campaign:{}, encyclopedia:{entries:[]},
//   sessions:[], personalLog:[]
// }
// ============================================================

// ── UI State ─────────────────────────────────────────────────
let _jTab        = 'campaign';   // active sub-tab
let _jEncSel     = null;         // selected encyclopedia entry id
let _jSesSel     = null;         // selected session id
let _jEncFilter  = { type:'', search:'' };
let _jSearchQ    = '';

// ── Helpers ───────────────────────────────────────────────────
function _jId() { return 'j_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }

// Auto-expand textarea to content height
function _autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.max(el.scrollHeight, parseInt(el.dataset.minHeight||'0')) + 'px';
}

// Apply auto-resize to all textareas in the journal sub-pages
function _jInitTextareas() {
  document.querySelectorAll('#j-subpage textarea, #j-ses-detail textarea, #j-enc-detail textarea').forEach(ta => {
    ta.style.overflow = 'hidden';
    ta.style.resize   = 'none';
    _autoResize(ta);
    if (!ta._jResizeWired) {
      ta.addEventListener('input', () => _autoResize(ta));
      ta._jResizeWired = true;
    }
  });
}

// Fullscreen writing mode
function _jFullscreen(ta) {
  const overlay = document.createElement('div');
  overlay.id = 'j-fs-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg1);z-index:9000;display:flex;flex-direction:column;padding:32px 12%;box-sizing:border-box;';
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border);';
  bar.innerHTML = '<span class="cinzel" style="font-size:10px;color:var(--gold-dim);letter-spacing:2px;">MODE ÉCRITURE — Échap ou ✕ pour fermer</span><button id="j-fs-close" style="font-size:12px;padding:4px 14px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);border-radius:4px;cursor:pointer;">✕ Fermer</button>';
  const ta2 = document.createElement('textarea');
  ta2.style.cssText = 'flex:1;width:100%;font-size:15px;line-height:1.85;background:transparent;border:none;color:var(--text-bright);resize:none;outline:none;font-family:inherit;';
  ta2.value = ta.value;
  ta2.placeholder = ta.placeholder || '';
  const wc = document.createElement('div');
  wc.style.cssText = 'font-size:10px;color:var(--text-dim);text-align:right;margin-top:6px;';
  ta2.oninput = () => {
    ta.value = ta2.value;
    ta.dispatchEvent(new Event('input', {bubbles:true}));
    const w = ta2.value.trim() ? ta2.value.trim().split(/\s+/).length : 0;
    wc.textContent = w + ' mot' + (w!==1?'s':'') + ' · ' + ta2.value.length + ' car.';
  };
  ta2.dispatchEvent(new Event('input'));
  const close = () => { overlay.remove(); document.removeEventListener('keydown', esc); };
  const esc   = (e) => { if (e.key==='Escape') close(); };
  document.addEventListener('keydown', esc);
  overlay.appendChild(bar);
  overlay.appendChild(ta2);
  overlay.appendChild(wc);
  document.body.appendChild(overlay);
  ta2.focus();
  ta2.setSelectionRange(ta2.value.length, ta2.value.length);
  bar.querySelector('#j-fs-close').onclick = close;
}
function _jJournal() {
  if (!AppState.journal) AppState.journal = { campaign:{}, encyclopedia:{entries:[]}, sessions:[], personalLog:[] };
  if (!AppState.journal.encyclopedia) AppState.journal.encyclopedia = { entries:[] };
  if (!AppState.journal.sessions)   AppState.journal.sessions = [];
  if (!AppState.journal.personalLog) AppState.journal.personalLog = [];
  if (!AppState.journal.campaign)   AppState.journal.campaign = {};
  return AppState.journal;
}

const J_ENTRY_TYPES = [
  ['npc',      '👤 PNJ',         '#cc8844'],
  ['city',     '🏙 Ville',        '#6688cc'],
  ['region',   '🗺 Région',       '#44aa88'],
  ['faction',  '⚔ Faction',       '#cc6644'],
  ['place',    '📍 Lieu',          '#88aa44'],
  ['artifact', '✨ Artefact',      '#aa66cc'],
  ['event',    '⚡ Événement',     '#cc4488'],
  ['rumor',    '💬 Rumeur',        '#888888'],
];
const J_TYPE_MAP = Object.fromEntries(J_ENTRY_TYPES.map(([id,,col])=>[id,col]));
const J_TYPE_LABEL = Object.fromEntries(J_ENTRY_TYPES.map(([id,lbl])=>[id,lbl]));

const J_MOODS = ['Neutre','Triomphant','Sombre','Épique','Tendu','Mélancolique','Joyeux','Mystérieux'];

// ── Main render ───────────────────────────────────────────────
function renderJournal() {
  const el = document.getElementById('journal-content');
  if (!el) return;

  el.innerHTML = `
    <!-- Sub-nav -->
    <div style="display:flex;gap:4px;padding:8px 0 10px;border-bottom:1px solid var(--border);margin-bottom:12px;flex-wrap:wrap;">
      ${[
        ['campaign',   '🗺 Campagne'],
        ['encyclopedia','📚 Encyclopédie'],
        ['sessions',   '📅 Sessions'],
        ['personal',   '✍ Journal'],
        ['search',     '🔍 Recherche'],
      ].map(([id,label])=>`
      <button onclick="_jTab='${id}';renderJournal();"
        style="padding:5px 14px;font-size:11px;font-family:Cinzel,serif;letter-spacing:1px;
               background:${_jTab===id?'var(--bg3)':'transparent'};border:1px solid ${_jTab===id?'var(--gold)':'var(--border)'};
               color:${_jTab===id?'var(--gold)':'var(--text-dim)'};border-radius:4px;cursor:pointer;">
        ${label}
      </button>`).join('')}
      <div style="margin-left:auto;display:flex;gap:6px;">
        <button onclick="importJournal()"
          style="padding:5px 12px;font-size:11px;background:transparent;border:1px solid var(--border);
                 color:var(--text-dim);border-radius:4px;cursor:pointer;"
          title="Importer un Journal de bord (fichier JSON)">⬆ Importer</button>
        <button onclick="exportJournal()"
          style="padding:5px 12px;font-size:11px;background:var(--bg3);border:1px solid var(--gold-dim);
                 color:var(--gold-dim);border-radius:4px;cursor:pointer;"
          title="Exporter le Journal de bord (fichier JSON)">⬇ Exporter</button>
      </div>
    </div>
    <!-- Sub-page -->
    <div id="j-subpage" style="height:calc(100vh - 150px);overflow:hidden;"></div>`;

  switch (_jTab) {
    case 'campaign':    _jRenderCampaign(); break;
    case 'encyclopedia':_jRenderEncyclopedia(); break;
    case 'sessions':    _jRenderSessions(); break;
    case 'personal':    _jRenderPersonal(); break;
    case 'search':      _jRenderSearch(); break;
  }
  setTimeout(_jInitTextareas, 0);
}

// ══════════════════════════════════════════════════════════════
// 1. CAMPAGNE
// ══════════════════════════════════════════════════════════════
function _jRenderCampaign() {
  const el  = document.getElementById('j-subpage');
  if (!el) return;
  const j   = _jJournal();
  const c   = j.campaign;
  const inp = (id, val, ph, full) =>
    `<input type="text" id="jc-${id}" value="${(val||'').replace(/"/g,'&quot;')}"
      placeholder="${ph}" style="font-size:12px;${full?'width:100%;':''}"
      oninput="AppState.journal.campaign['${id}']=this.value;autosave();">`;

  el.innerHTML = `
    <div style="max-width:800px;overflow-y:auto;height:100%;padding-right:8px;">
      <div class="panel mb-14">
        <div class="panel-header">
          <span class="panel-title cinzel" style="letter-spacing:1px;">🗺 CAMPAGNE</span>
        </div>
        <div class="panel-body" style="padding:14px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:10px;">TITRE DE LA CAMPAGNE</label>
              ${inp('title', c.title, 'Les Héritiers du Vide…', true)}
            </div>
            <div class="form-group">
              <label style="font-size:10px;">SOUS-TITRE</label>
              ${inp('subtitle', c.subtitle, 'Saison 1…', true)}
            </div>
            <div class="form-group">
              <label style="font-size:10px;">MAÎTRE DE JEU</label>
              ${inp('gm', c.gm, 'Nom du MJ…', true)}
            </div>
            <div class="form-group">
              <label style="font-size:10px;">DATE DE DÉBUT</label>
              <input type="date" id="jc-startDate" value="${c.startDate||''}"
                style="font-size:12px;width:100%;"
                oninput="AppState.journal.campaign.startDate=this.value;autosave();">
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label style="font-size:10px;">TON / GENRE</label>
              ${inp('tone', c.tone, 'Heroïque-fantasy sombre, politique, survival…', true)}
            </div>
          </div>

          <div class="form-group mb-10">
            <label style="font-size:10px;">RÉSUMÉ COURT</label>
            <textarea id="jc-summary" style="font-size:13px;width:100%;min-height:160px;line-height:1.7;overflow:hidden;resize:none;" data-min-height="160"
              placeholder="Pitch de la campagne en 2-3 phrases…"
              oninput="AppState.journal.campaign.summary=this.value;autosave();">${c.summary||''}</textarea>
          </div>

          <div class="form-group mb-10">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><label style="font-size:10px;">MONDE / CONTEXTE GÉNÉRAL</label><button onclick="_jFullscreen(this.closest('div').nextElementSibling)" style="font-size:9px;padding:1px 7px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);border-radius:3px;cursor:pointer;">⛶</button></div>
            <textarea id="jc-worldContext" style="font-size:13px;width:100%;min-height:280px;line-height:1.7;overflow:hidden;resize:none;" data-min-height="280"
              placeholder="Géographie, histoire, magie, politique, religions, factions…"
              oninput="AppState.journal.campaign.worldContext=this.value;autosave();">${c.worldContext||''}</textarea>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="panel mb-14">
        <div class="panel-header">
          <span class="panel-title cinzel" style="letter-spacing:1px;">⏳ CHRONOLOGIE</span>
          <button class="btn btn-secondary btn-small" onclick="_jAddTimeline()">+ Événement</button>
        </div>
        <div class="panel-body" style="padding:10px;" id="jc-timeline-list">
          ${(c.timeline||[]).length===0
            ? '<div class="text-dim small" style="padding:8px;">Aucun événement — ajoutez des points de chronologie.</div>'
            : (c.timeline||[]).map((ev,i)=>`
              <div style="display:flex;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);">
                <input type="text" value="${(ev.date||'').replace(/"/g,'&quot;')}" placeholder="Date" style="width:90px;font-size:11px;"
                  oninput="AppState.journal.campaign.timeline[${i}].date=this.value;autosave();">
                <input type="text" value="${(ev.text||'').replace(/"/g,'&quot;')}" placeholder="Description…" style="flex:1;font-size:11px;"
                  oninput="AppState.journal.campaign.timeline[${i}].text=this.value;autosave();">
                <button class="btn btn-danger btn-small" style="font-size:10px;"
                  onclick="AppState.journal.campaign.timeline.splice(${i},1);autosave();_jRenderCampaign();">✕</button>
              </div>`).join('')}
        </div>
      </div>

      <!-- Tags -->
      <div class="panel">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🏷 TAGS</span></div>
        <div class="panel-body" style="padding:10px;">
          <input type="text" id="jc-tags-input"
            value="${(c.tags||[]).join(', ')}"
            placeholder="fantôme, politique, magie ancienne, complot…"
            style="font-size:12px;width:100%;"
            oninput="AppState.journal.campaign.tags=this.value.split(',').map(t=>t.trim()).filter(Boolean);autosave();">
          <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">Séparer par des virgules</div>
        </div>
      </div>
    </div>`;
}

function _jAddTimeline() {
  const j = _jJournal();
  if (!j.campaign.timeline) j.campaign.timeline = [];
  j.campaign.timeline.push({ date:'', text:'' });
  autosave();
  _jRenderCampaign();
}

// ══════════════════════════════════════════════════════════════
// 2. ENCYCLOPÉDIE
// ══════════════════════════════════════════════════════════════
function _jRenderEncyclopedia() {
  const el = document.getElementById('j-subpage');
  if (!el) return;
  const j  = _jJournal();
  const entries = j.encyclopedia.entries;
  const { type: fType, search: fSearch } = _jEncFilter;

  const filtered = entries.filter(e => {
    if (fType && e.type !== fType) return false;
    if (fSearch) {
      const q = fSearch.toLowerCase();
      return e.name.toLowerCase().includes(q) || (e.summary||'').toLowerCase().includes(q) || (e.tags||[]).some(t=>t.toLowerCase().includes(q));
    }
    return true;
  });

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:260px 1fr;gap:14px;height:100%;">

      <!-- Sidebar -->
      <div style="display:flex;flex-direction:column;gap:6px;min-height:0;">
        <button class="btn btn-primary btn-small" onclick="_jEncNew()" style="width:100%;font-size:11px;">+ Nouvelle fiche</button>
        <input type="text" placeholder="🔍 Chercher…" style="font-size:11px;width:100%;"
          value="${fSearch.replace(/"/g,'&quot;')}"
          oninput="_jEncFilter.search=this.value;_jRenderEncyclopedia();">
        <div style="display:flex;flex-wrap:wrap;gap:3px;">
          <button onclick="_jEncFilter.type='';_jRenderEncyclopedia();"
            class="btn btn-small ${!fType?'btn-primary':'btn-secondary'}" style="font-size:9px;">Tous</button>
          ${J_ENTRY_TYPES.map(([id,lbl,col])=>`
          <button onclick="_jEncFilter.type='${id}';_jRenderEncyclopedia();"
            style="font-size:9px;padding:2px 6px;border-radius:3px;cursor:pointer;
                   background:${fType===id?col+'22':'transparent'};
                   border:1px solid ${fType===id?col:'var(--border)'};
                   color:${fType===id?col:'var(--text-dim)'};">${lbl}</button>`).join('')}
        </div>
        <div style="font-size:9px;color:var(--text-dim);padding:0 2px;">${filtered.length} fiche${filtered.length!==1?'s':''}</div>
        <div style="flex:1;overflow-y:auto;background:var(--bg3);border:1px solid var(--border);border-radius:5px;min-height:0;">
          ${filtered.length===0
            ? '<div style="padding:16px;text-align:center;color:var(--text-dim);font-size:11px;font-style:italic;">Aucune fiche</div>'
            : filtered.map(e=>{
                const col = J_TYPE_MAP[e.type]||'#888';
                const isSelected = _jEncSel === e.id;
                return `<div onclick="_jEncSel='${e.id}';_jRenderEncyclopedia();"
                  style="padding:7px 10px;border-bottom:1px solid var(--border);cursor:pointer;
                         background:${isSelected?'var(--bg2)':'transparent'};
                         border-left:3px solid ${isSelected?'var(--gold)':'transparent'};">
                  <div style="font-size:12px;color:${isSelected?'var(--gold)':'var(--text-bright)'};">${e.name}</div>
                  <div style="font-size:9px;color:${col};">${J_TYPE_LABEL[e.type]||e.type}</div>
                  ${e.tags?.length?`<div style="font-size:9px;color:var(--text-dim);">${e.tags.slice(0,3).join(' · ')}</div>`:''}
                </div>`;
              }).join('')}
        </div>
      </div>

      <!-- Fiche -->
      <div style="overflow-y:auto;min-height:0;" id="j-enc-detail">
        ${_jEncSel ? '' : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-dim);text-align:center;">
          <div><div style="font-size:32px;">📚</div><div class="cinzel" style="font-size:11px;letter-spacing:2px;color:var(--gold-dim);margin-top:8px;">SÉLECTIONNEZ UNE FICHE</div></div>
        </div>`}
      </div>
    </div>`;

  if (_jEncSel) { _jEncRenderDetail(_jEncSel); setTimeout(_jInitTextareas, 0); }
}

function _jEncNew(prefill) {
  const j = _jJournal();
  const e = {
    id: _jId(), type: prefill?.type||'npc', name: prefill?.name||'',
    status:'', tags:[], summary: prefill?.summary||'', content:'',
    linkedEntryIds:[], sessionIds: prefill?.sessionId?[prefill.sessionId]:[], notes:'',
    createdAt: Date.now(),
  };
  j.encyclopedia.entries.push(e);
  _jEncSel = e.id;
  autosave();
  _jRenderEncyclopedia();
}

function _jEncRenderDetail(id) {
  const panel = document.getElementById('j-enc-detail');
  if (!panel) return;
  const j = _jJournal();
  const e = j.encyclopedia.entries.find(x=>x.id===id);
  if (!e) return;

  // Linked entries for display
  const linked = (e.linkedEntryIds||[]).map(lid=>j.encyclopedia.entries.find(x=>x.id===lid)).filter(Boolean);
  // Sessions linked
  const linkedSess = (e.sessionIds||[]).map(sid=>j.sessions.find(s=>s.id===sid)).filter(Boolean);
  // All entries for linking autocomplete
  const others = j.encyclopedia.entries.filter(x=>x.id!==id);

  panel.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div style="display:flex;gap:8px;align-items:center;flex:1;">
          <select style="font-size:11px;border:1px solid var(--border);background:var(--bg3);color:${J_TYPE_MAP[e.type]||'var(--text-dim)'};"
            onchange="AppState.journal.encyclopedia.entries.find(x=>x.id==='${id}').type=this.value;autosave();_jRenderEncyclopedia();">
            ${J_ENTRY_TYPES.map(([t,l])=>`<option value="${t}" ${e.type===t?'selected':''}>${l}</option>`).join('')}
          </select>
          <input type="text" value="${e.name.replace(/"/g,'&quot;')}" placeholder="Nom…"
            style="flex:1;font-size:14px;font-weight:600;color:var(--text-bright);background:transparent;border:none;border-bottom:1px solid var(--border);"
            oninput="AppState.journal.encyclopedia.entries.find(x=>x.id==='${id}').name=this.value;autosave();">
        </div>
        <button class="btn btn-danger btn-small" onclick="_jEncDelete('${id}')">Supprimer</button>
      </div>
      <div class="panel-body" style="padding:12px;">

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div class="form-group">
            <label style="font-size:10px;">STATUT</label>
            <input type="text" value="${(e.status||'').replace(/"/g,'&quot;')}" placeholder="Vivant, Disparu, Inconnu…"
              style="font-size:12px;width:100%;"
              oninput="AppState.journal.encyclopedia.entries.find(x=>x.id==='${id}').status=this.value;autosave();">
          </div>
          <div class="form-group">
            <label style="font-size:10px;">TAGS</label>
            <input type="text" value="${(e.tags||[]).join(', ')}" placeholder="ami, dangereux, mystère…"
              style="font-size:12px;width:100%;"
              oninput="AppState.journal.encyclopedia.entries.find(x=>x.id==='${id}').tags=this.value.split(',').map(t=>t.trim()).filter(Boolean);autosave();">
          </div>
        </div>

        <div class="form-group mb-10">
          <label style="font-size:10px;">RÉSUMÉ</label>
          <textarea style="width:100%;font-size:13px;min-height:120px;line-height:1.7;overflow:hidden;resize:none;" placeholder="Description courte…" data-min-height="120"
            oninput="AppState.journal.encyclopedia.entries.find(x=>x.id==='${id}').summary=this.value;autosave();">${e.summary||''}</textarea>
        </div>

        <div class="form-group mb-10">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><label style="font-size:10px;">CONTENU DÉTAILLÉ</label><button onclick="_jFullscreen(this.closest('div').nextElementSibling)" style="font-size:9px;padding:1px 7px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);border-radius:3px;cursor:pointer;">⛶</button></div>
          <textarea style="width:100%;font-size:13px;min-height:450px;line-height:1.7;overflow:hidden;resize:none;font-family:inherit;" data-min-height="450"
            placeholder="Histoire, description, rôle, apparence, motivations…"
            oninput="AppState.journal.encyclopedia.entries.find(x=>x.id==='${id}').content=this.value;autosave();">${e.content||''}</textarea>
        </div>

        <div class="form-group mb-10">
          <label style="font-size:10px;">NOTES</label>
          <textarea style="width:100%;font-size:13px;min-height:100px;line-height:1.7;overflow:hidden;resize:none;" placeholder="Notes personnelles, suspicions…" data-min-height="100"
            oninput="AppState.journal.encyclopedia.entries.find(x=>x.id==='${id}').notes=this.value;autosave();">${e.notes||''}</textarea>
        </div>

        <!-- Liens vers d'autres fiches -->
        <div style="margin-bottom:10px;">
          <label style="font-size:10px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">LIENS</label>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;">
            ${linked.map(lk=>`<span style="font-size:10px;padding:1px 7px;border-radius:10px;background:${J_TYPE_MAP[lk.type]||'#888'}22;color:${J_TYPE_MAP[lk.type]||'#888'};border:1px solid ${J_TYPE_MAP[lk.type]||'#888'}44;cursor:pointer;"
              onclick="_jEncSel='${lk.id}';_jRenderEncyclopedia();">${lk.name}</span>`).join('')}
          </div>
          <select style="font-size:10px;width:100%;" onchange="_jEncLink('${id}',this.value);this.value='';">
            <option value="">+ Lier une fiche…</option>
            ${others.filter(o=>!(e.linkedEntryIds||[]).includes(o.id)).map(o=>`<option value="${o.id}">${J_TYPE_LABEL[o.type]||o.type} — ${o.name}</option>`).join('')}
          </select>
        </div>

        <!-- Sessions liées -->
        ${linkedSess.length?`<div style="font-size:10px;color:var(--text-dim);margin-bottom:6px;font-family:Cinzel,serif;letter-spacing:1px;">SESSIONS LIÉES</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
          ${linkedSess.map(s=>`<span style="font-size:10px;padding:1px 7px;border-radius:10px;background:rgba(100,120,220,0.12);color:#8899ee;border:1px solid rgba(100,120,220,0.3);cursor:pointer;"
            onclick="_jTab='sessions';_jSesSel='${s.id}';renderJournal();">Session ${s.num||'?'} — ${s.title||'Sans titre'}</span>`).join('')}
        </div>`:''}

      </div>
    </div>`;
}

function _jEncLink(entryId, linkedId) {
  if (!linkedId) return;
  const j = _jJournal();
  const e = j.encyclopedia.entries.find(x=>x.id===entryId);
  if (!e) return;
  if (!e.linkedEntryIds) e.linkedEntryIds = [];
  if (!e.linkedEntryIds.includes(linkedId)) e.linkedEntryIds.push(linkedId);
  autosave();
  _jEncRenderDetail(entryId);
}

function _jEncDelete(id) {
  if (!confirm('Supprimer cette fiche ?')) return;
  const j = _jJournal();
  j.encyclopedia.entries = j.encyclopedia.entries.filter(e=>e.id!==id);
  _jEncSel = null;
  autosave();
  _jRenderEncyclopedia();
}

// ══════════════════════════════════════════════════════════════
// 3. SESSIONS
// ══════════════════════════════════════════════════════════════
function _jRenderSessions() {
  const el = document.getElementById('j-subpage');
  if (!el) return;
  const j = _jJournal();
  const sessions = [...j.sessions].sort((a,b)=>(b.num||0)-(a.num||0));

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:260px 1fr;gap:14px;height:100%;">

      <!-- Liste sessions -->
      <div style="display:flex;flex-direction:column;gap:6px;min-height:0;">
        <button class="btn btn-primary btn-small" onclick="_jSessionNew()" style="width:100%;">+ Nouvelle session</button>
        <div style="flex:1;overflow-y:auto;background:var(--bg3);border:1px solid var(--border);border-radius:5px;min-height:0;">
          ${sessions.length===0
            ? '<div style="padding:16px;text-align:center;color:var(--text-dim);font-size:11px;font-style:italic;">Aucune session</div>'
            : sessions.map(s=>{
                const isSelected = _jSesSel === s.id;
                return `<div onclick="_jSesSel='${s.id}';_jRenderSessions();"
                  style="padding:7px 10px;border-bottom:1px solid var(--border);cursor:pointer;
                         background:${isSelected?'var(--bg2)':'transparent'};
                         border-left:3px solid ${isSelected?'var(--gold)':'transparent'};">
                  <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                    <span class="cinzel" style="font-size:10px;color:${isSelected?'var(--gold)':'var(--gold-dim)'};">SESSION ${s.num||'?'}</span>
                    <span style="font-size:9px;color:var(--text-dim);">${s.date||''}</span>
                  </div>
                  <div style="font-size:11px;color:${isSelected?'var(--text-bright)':'var(--text-dim)'};">${s.title||'Sans titre'}</div>
                  ${s.tags?.length?`<div style="font-size:9px;color:var(--text-dim);margin-top:2px;">${s.tags.slice(0,3).join(' · ')}</div>`:''}
                </div>`;
              }).join('')}
        </div>
      </div>

      <!-- Fiche session -->
      <div style="overflow-y:auto;min-height:0;" id="j-ses-detail">
        ${_jSesSel ? '' : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-dim);text-align:center;">
          <div><div style="font-size:32px;">📅</div><div class="cinzel" style="font-size:11px;letter-spacing:2px;color:var(--gold-dim);margin-top:8px;">SÉLECTIONNEZ UNE SESSION</div></div>
        </div>`}
      </div>
    </div>`;

  if (_jSesSel) { _jSessionRenderDetail(_jSesSel); setTimeout(_jInitTextareas, 0); }
}

function _jSessionNew() {
  const j = _jJournal();
  const nextNum = j.sessions.reduce((max,s)=>Math.max(max,s.num||0),0)+1;
  const s = {
    id: _jId(), num: nextNum, date:'', title:'', summary:'', notes:'',
    locations:[], npcs:[], loot:[], events:[], unresolved:[],
    linkedEntryIds:[], tags:[],
  };
  j.sessions.push(s);
  _jSesSel = s.id;
  autosave();
  _jRenderSessions();
}

function _jSessionRenderDetail(id) {
  const panel = document.getElementById('j-ses-detail');
  if (!panel) return;
  const j = _jJournal();
  const s = j.sessions.find(x=>x.id===id);
  if (!s) return;

  const linkedEntries = (s.linkedEntryIds||[]).map(eid=>j.encyclopedia.entries.find(e=>e.id===eid)).filter(Boolean);
  const allEntries = j.encyclopedia.entries;

  const listField = (field, placeholder, label) => {
    const arr = s[field]||[];
    return `<div style="margin-bottom:8px;">
      <label style="font-size:10px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">${label}</label>
      <div style="display:flex;flex-direction:column;gap:3px;margin-top:3px;" id="jses-${field}-list">
        ${arr.map((v,i)=>`<div style="display:flex;gap:4px;align-items:center;">
          <input type="text" value="${v.replace(/"/g,'&quot;')}" style="flex:1;font-size:11px;"
            oninput="AppState.journal.sessions.find(x=>x.id==='${id}').${field}[${i}]=this.value;autosave();">
          <button class="btn btn-danger btn-small" style="font-size:10px;padding:1px 5px;"
            onclick="AppState.journal.sessions.find(x=>x.id==='${id}').${field}.splice(${i},1);autosave();_jSessionRenderDetail('${id}');">✕</button>
        </div>`).join('')}
      </div>
      <button class="btn btn-secondary btn-small" style="font-size:10px;margin-top:3px;width:100%;"
        onclick="AppState.journal.sessions.find(x=>x.id==='${id}').${field}.push('');autosave();_jSessionRenderDetail('${id}');">+ ${placeholder}</button>
    </div>`;
  };

  panel.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div style="display:flex;gap:8px;align-items:center;flex:1;">
          <span class="cinzel" style="font-size:11px;color:var(--gold-dim);white-space:nowrap;">SESSION</span>
          <input type="number" value="${s.num||''}" min="1" style="width:50px;font-size:13px;text-align:center;"
            oninput="AppState.journal.sessions.find(x=>x.id==='${id}').num=parseInt(this.value)||0;autosave();">
          <input type="text" value="${(s.title||'').replace(/"/g,'&quot;')}" placeholder="Titre de la session…"
            style="flex:1;font-size:14px;font-weight:600;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text-bright);"
            oninput="AppState.journal.sessions.find(x=>x.id==='${id}').title=this.value;autosave();">
        </div>
        <input type="date" value="${s.date||''}" style="font-size:11px;flex-shrink:0;"
          oninput="AppState.journal.sessions.find(x=>x.id==='${id}').date=this.value;autosave();">
        <button class="btn btn-danger btn-small" onclick="_jSessionDelete('${id}')">✕</button>
      </div>
      <div class="panel-body" style="padding:12px;">
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div>
            <div class="form-group mb-8">
              <label style="font-size:10px;">RÉSUMÉ</label>
              <textarea style="width:100%;font-size:13px;min-height:220px;line-height:1.7;overflow:hidden;resize:none;" placeholder="Ce qui s'est passé…" data-min-height="220"
                oninput="AppState.journal.sessions.find(x=>x.id==='${id}').summary=this.value;autosave();">${s.summary||''}</textarea>
            </div>
            <div class="form-group mb-8">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><label style="font-size:10px;">NOTES LONGUES</label><button onclick="_jFullscreen(this.closest('div').nextElementSibling)" style="font-size:9px;padding:1px 7px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);border-radius:3px;cursor:pointer;">⛶</button></div>
              <textarea style="width:100%;font-size:13px;min-height:550px;line-height:1.7;overflow:hidden;resize:none;" placeholder="Détails, dialogues, retournements…" data-min-height="550"
                oninput="AppState.journal.sessions.find(x=>x.id==='${id}').notes=this.value;autosave();">${s.notes||''}</textarea>
            </div>
          </div>
          <div>
            ${listField('locations', 'Lieu', 'LIEUX VISITÉS')}
            ${listField('npcs', 'PNJ', 'PNJ RENCONTRÉS')}
            ${listField('loot', 'Objet / monnaie', 'LOOT')}
            ${listField('events', 'Événement', 'ÉVÉNEMENTS CLÉS')}
            ${listField('unresolved', 'Question', 'QUESTIONS EN SUSPENS')}
          </div>
        </div>

        <!-- Tags -->
        <div class="form-group mt-8">
          <label style="font-size:10px;">TAGS</label>
          <input type="text" value="${(s.tags||[]).join(', ')}" placeholder="combat, révélation, repos, voyage…"
            style="font-size:12px;width:100%;"
            oninput="AppState.journal.sessions.find(x=>x.id==='${id}').tags=this.value.split(',').map(t=>t.trim()).filter(Boolean);autosave();">
        </div>

        <!-- Création de fiche depuis session -->
        <div style="margin-top:12px;padding:10px;background:var(--bg3);border-radius:5px;border:1px solid var(--border);">
          <div style="font-size:10px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:6px;">CRÉER UNE FICHE ENCYCLOPÉDIE</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${J_ENTRY_TYPES.map(([type,label,col])=>`
            <button onclick="_jEncNewFromSession('${id}','${type}')"
              style="font-size:10px;padding:2px 8px;border-radius:3px;cursor:pointer;
                     background:${col}11;border:1px solid ${col}44;color:${col};">
              + ${label}
            </button>`).join('')}
          </div>
        </div>

        <!-- Fiches liées -->
        ${linkedEntries.length?`<div style="margin-top:10px;">
          <div style="font-size:10px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:5px;">FICHES LIÉES</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${linkedEntries.map(e=>`<span onclick="_jTab='encyclopedia';_jEncSel='${e.id}';renderJournal();"
              style="font-size:10px;padding:1px 7px;border-radius:10px;cursor:pointer;
                     background:${J_TYPE_MAP[e.type]||'#888'}22;color:${J_TYPE_MAP[e.type]||'#888'};
                     border:1px solid ${J_TYPE_MAP[e.type]||'#888'}44;">${e.name}</span>`).join('')}
          </div>
        </div>`:''}
      </div>
    </div>`;
}

function _jEncNewFromSession(sessionId, type) {
  const name = prompt(`Nom de la nouvelle fiche (${J_TYPE_LABEL[type]||type}) :`) || '';
  if (!name.trim()) return;
  const j = _jJournal();
  const e = {
    id: _jId(), type, name: name.trim(), status:'', tags:[],
    summary:'', content:'', linkedEntryIds:[], sessionIds:[sessionId], notes:'',
    createdAt: Date.now(),
  };
  j.encyclopedia.entries.push(e);
  // Link from session
  const s = j.sessions.find(x=>x.id===sessionId);
  if (s) { if (!s.linkedEntryIds) s.linkedEntryIds=[]; s.linkedEntryIds.push(e.id); }
  autosave();
  showToast(`✓ Fiche "${name}" créée dans l'encyclopédie`, 'success');
  _jSessionRenderDetail(sessionId);
}

function _jSessionDelete(id) {
  if (!confirm('Supprimer cette session ?')) return;
  const j = _jJournal();
  j.sessions = j.sessions.filter(s=>s.id!==id);
  _jSesSel = null;
  autosave();
  _jRenderSessions();
}

// ══════════════════════════════════════════════════════════════
// 4. JOURNAL PERSONNEL
// ══════════════════════════════════════════════════════════════
function _jRenderPersonal() {
  const el = document.getElementById('j-subpage');
  if (!el) return;
  const j = _jJournal();
  const log = [...j.personalLog].sort((a,b)=>b.createdAt-a.createdAt);

  el.innerHTML = `
    <div style="height:100%;overflow-y:auto;">
      <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
        <button class="btn btn-primary btn-small" onclick="_jPersonalNew()">+ Nouvelle entrée</button>
      </div>
      ${log.length===0
        ? '<div style="text-align:center;padding:40px;color:var(--text-dim);font-style:italic;">Aucune entrée. Commencez à écrire le journal de votre personnage.</div>'
        : log.map(e=>{
            const s = j.sessions.find(x=>x.id===e.sessionId);
            return `<div class="panel mb-10">
              <div class="panel-header">
                <div style="flex:1;display:flex;gap:8px;align-items:center;">
                  <input type="date" value="${e.date||''}" style="font-size:11px;"
                    oninput="AppState.journal.personalLog.find(x=>x.id==='${e.id}').date=this.value;autosave();">
                  <input type="text" value="${(e.title||'').replace(/"/g,'&quot;')}"
                    placeholder="Titre de l'entrée…"
                    style="flex:1;font-size:13px;font-weight:600;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text-bright);"
                    oninput="AppState.journal.personalLog.find(x=>x.id==='${e.id}').title=this.value;autosave();">
                  <select style="font-size:10px;"
                    oninput="AppState.journal.personalLog.find(x=>x.id==='${e.id}').mood=this.value;autosave();">
                    <option value="">Humeur…</option>
                    ${J_MOODS.map(m=>`<option value="${m}" ${e.mood===m?'selected':''}>${m}</option>`).join('')}
                  </select>
                </div>
                <button class="btn btn-danger btn-small" style="font-size:10px;"
                  onclick="_jPersonalDelete('${e.id}')">✕</button>
              </div>
              <div class="panel-body" style="padding:10px;">
                ${s?`<div style="font-size:10px;color:#8899ee;margin-bottom:6px;cursor:pointer;" onclick="_jTab='sessions';_jSesSel='${s.id}';renderJournal();">→ Session ${s.num||'?'} — ${s.title||''}</div>`:''}
                <textarea style="width:100%;font-size:13px;min-height:420px;line-height:1.7;overflow:hidden;resize:none;font-family:inherit;" data-min-height="420"
                  placeholder="Pensées, émotions, observations du personnage…"
                  oninput="AppState.journal.personalLog.find(x=>x.id==='${e.id}').content=this.value;autosave();">${e.content||''}</textarea>
                ${j.sessions.length?`<div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
                  <span style="font-size:10px;color:var(--text-dim);">Session liée :</span>
                  <select style="font-size:10px;" onchange="AppState.journal.personalLog.find(x=>x.id==='${e.id}').sessionId=this.value;autosave();">
                    <option value="">— aucune —</option>
                    ${j.sessions.map(ses=>`<option value="${ses.id}" ${e.sessionId===ses.id?'selected':''}>${ses.num||'?'} — ${ses.title||'Sans titre'}</option>`).join('')}
                  </select>
                </div>`:''}
              </div>
            </div>`;
          }).join('')}
    </div>`;
}

function _jPersonalNew() {
  const j = _jJournal();
  const e = { id:_jId(), date:new Date().toISOString().slice(0,10), sessionId:'', title:'', mood:'', content:'', createdAt:Date.now() };
  j.personalLog.unshift(e);
  autosave();
  _jRenderPersonal();
}

function _jPersonalDelete(id) {
  if (!confirm('Supprimer cette entrée ?')) return;
  const j = _jJournal();
  j.personalLog = j.personalLog.filter(e=>e.id!==id);
  autosave();
  _jRenderPersonal();
}

// ══════════════════════════════════════════════════════════════
// 5. RECHERCHE
// ══════════════════════════════════════════════════════════════
function _jRenderSearch() {
  const el = document.getElementById('j-subpage');
  if (!el) return;

  el.innerHTML = `
    <div style="height:100%;display:flex;flex-direction:column;">
      <div style="margin-bottom:12px;">
        <input type="text" id="j-search-input" placeholder="🔍 Rechercher dans tout le journal…"
          style="width:100%;font-size:14px;padding:10px 14px;"
          value="${_jSearchQ.replace(/"/g,'&quot;')}"
          oninput="_jSearchQ=this.value;_jDoSearch();">
      </div>
      <div id="j-search-results" style="flex:1;overflow-y:auto;"></div>
    </div>`;

  if (_jSearchQ) _jDoSearch();
}

function _jDoSearch() {
  const res = document.getElementById('j-search-results');
  if (!res) return;
  const q = _jSearchQ.toLowerCase().trim();
  if (!q) { res.innerHTML = ''; return; }

  const j = _jJournal();
  const results = [];

  // Campaign
  const c = j.campaign;
  if ([c.title,c.subtitle,c.summary,c.worldContext].some(f=>(f||'').toLowerCase().includes(q))) {
    results.push({ cat:'Campagne', items:[{ label:c.title||'Campagne', excerpt:c.summary||c.worldContext||'', onClick:"_jTab='campaign';renderJournal();" }] });
  }

  // Encyclopedia
  const encHits = j.encyclopedia.entries.filter(e=>
    e.name.toLowerCase().includes(q)||
    (e.summary||'').toLowerCase().includes(q)||
    (e.content||'').toLowerCase().includes(q)||
    (e.tags||[]).some(t=>t.toLowerCase().includes(q))
  );
  if (encHits.length) results.push({
    cat:'Encyclopédie',
    items: encHits.map(e=>({ label:`${J_TYPE_LABEL[e.type]||e.type} — ${e.name}`, excerpt:e.summary||'', onClick:`_jTab='encyclopedia';_jEncSel='${e.id}';renderJournal();` }))
  });

  // Sessions
  const sesHits = j.sessions.filter(s=>
    (s.title||'').toLowerCase().includes(q)||
    (s.summary||'').toLowerCase().includes(q)||
    (s.notes||'').toLowerCase().includes(q)||
    (s.tags||[]).some(t=>t.toLowerCase().includes(q))||
    (s.npcs||[]).some(n=>n.toLowerCase().includes(q))||
    (s.events||[]).some(e=>e.toLowerCase().includes(q))
  );
  if (sesHits.length) results.push({
    cat:'Sessions',
    items: sesHits.map(s=>({ label:`Session ${s.num||'?'} — ${s.title||'Sans titre'}`, excerpt:s.summary||'', onClick:`_jTab='sessions';_jSesSel='${s.id}';renderJournal();` }))
  });

  // Personal log
  const logHits = j.personalLog.filter(e=>
    (e.title||'').toLowerCase().includes(q)||
    (e.content||'').toLowerCase().includes(q)
  );
  if (logHits.length) results.push({
    cat:'Journal personnel',
    items: logHits.map(e=>({ label:e.title||e.date||'Sans titre', excerpt:(e.content||'').slice(0,80), onClick:"_jTab='personal';renderJournal();" }))
  });

  if (!results.length) {
    res.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-dim);font-style:italic;">Aucun résultat pour "${_jSearchQ}"</div>`;
    return;
  }

  const total = results.reduce((s,r)=>s+r.items.length,0);
  res.innerHTML = `
    <div style="font-size:11px;color:var(--text-dim);margin-bottom:10px;">${total} résultat${total!==1?'s':''} pour "${_jSearchQ}"</div>
    ${results.map(r=>`
    <div class="panel mb-10">
      <div class="panel-header"><span class="panel-title cinzel" style="font-size:10px;letter-spacing:1px;">${r.cat.toUpperCase()} (${r.items.length})</span></div>
      <div class="panel-body" style="padding:6px;">
        ${r.items.map(item=>`<div onclick="${item.onClick}"
          style="padding:6px 8px;cursor:pointer;border-radius:3px;margin-bottom:3px;"
          onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background=''">
          <div style="font-size:12px;color:var(--gold);font-weight:600;">${item.label}</div>
          ${item.excerpt?`<div style="font-size:11px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.excerpt}</div>`:''}
        </div>`).join('')}
      </div>
    </div>`).join('')}`;
}

// ══════════════════════════════════════════════════════════════
// EXPORT / IMPORT JOURNAL
// Distinct du profil personnage (exportJSON / importJSON)
// ══════════════════════════════════════════════════════════════

function exportJournal() {
  const j = _jJournal();
  const payload = {
    _type:    'dnd35_journal',
    _version: 1,
    _date:    new Date().toISOString(),
    _app:     'My DnD 3.5 Way',
    campaign:    j.campaign     || {},
    encyclopedia:j.encyclopedia || { entries:[] },
    sessions:    j.sessions     || [],
    personalLog: j.personalLog  || [],
    links:       j.links        || {},
  };
  const title    = (j.campaign?.title || 'campagne').replace(/[^a-z0-9]/gi,'_').toLowerCase().slice(0,30);
  const filename = 'journal_' + title + '_' + new Date().toISOString().slice(0,10) + '.json';
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  showToast('Journal export\u00e9 : ' + filename, 'success');
}

function importJournal() {
  const input   = document.createElement('input');
  input.type    = 'file';
  input.accept  = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (data._type !== 'dnd35_journal') {
          alert('Ce fichier n\u2019est pas un export de Journal de bord.\n\nPour importer un profil personnage, utilisez le bouton de la barre de navigation.');
          return;
        }
        const campTitle = data.campaign?.title || 'sans titre';
        const sessCount = (data.sessions||[]).length;
        const encCount  = (data.encyclopedia?.entries||[]).length;
        const msg = 'Importer le journal "' + campTitle + '" ?\n\n'
          + '\u2022 ' + encCount + ' fiche' + (encCount!==1?'s':'') + ' encyclop\u00e9die\n'
          + '\u2022 ' + sessCount + ' session' + (sessCount!==1?'s':'') + '\n\n'
          + '\u26a0 Le journal actuel sera remplac\u00e9. Cette action est irr\u00e9versible.';
        if (!confirm(msg)) return;
        const j = _jJournal();
        j.campaign     = data.campaign     || {};
        j.encyclopedia = data.encyclopedia || { entries:[] };
        j.sessions     = data.sessions     || [];
        j.personalLog  = data.personalLog  || [];
        j.links        = data.links        || {};
        autosave();
        _jTab = 'campaign';
        renderJournal();
        showToast('Journal "' + campTitle + '" import\u00e9 avec succ\u00e8s', 'success');
      } catch(err) {
        alert('Erreur lors de la lecture du fichier.\n' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
