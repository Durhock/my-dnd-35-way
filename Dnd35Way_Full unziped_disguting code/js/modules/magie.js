// ============================================================
// magie.js — Module Magie
//
// 1. Grimoire     — création et gestion des sorts du joueur
// 2. Répertoire   — sorts retenus pour la session
// 3. Préparation  — sélection du jour
// 4. Sorts préparés — AppState.preparedSpells[] avec état lancé
// ============================================================

let _magTab     = 'grimoire';
let _magGrimoireSel = null;  // sort sélectionné dans le grimoire
let _magGrimoireEditId = null; // sort en cours d'édition
// ── Spell DB combinée : SPELL_DB (PHB) + SPELL_DB_SPC (SpC) ─────────────────
// SPELL_DB a priorité sur SPELL_DB_SPC pour les entrées en doublon (overrides)
function _getSpellDB() {
  if (typeof SPELL_DB === 'undefined') return {};
  return (typeof SPELL_DB_SPC !== 'undefined')
    ? Object.assign({}, SPELL_DB_SPC, SPELL_DB)
    : SPELL_DB;
}

// ── Chargement différé des descriptions longues (SpC) ────────
// Le fichier ~780 KB n'est chargé qu'au premier accès à une description.
let _spellDescCache = null;
let _spellDescPromise = null;

async function _loadSpellDescriptions() {
  if (_spellDescCache) return _spellDescCache;
  if (_spellDescPromise) return _spellDescPromise;
  _spellDescPromise = fetch('spc_spell_descriptions_en.json')
    .then(r => r.json())
    .then(data => { _spellDescCache = data; window.SPELL_DESCRIPTIONS = data; return data; })
    .catch(err => {
      console.warn('spc_spell_descriptions_en.json non chargé:', err);
      _spellDescCache = {};
      return {};
    });
  return _spellDescPromise;
}

async function getSpellDescription(nameEn) {
  const db = await _loadSpellDescriptions();
  return db[nameEn]?.description || null;
}




let _magRepSel  = null;   // sort sélectionné dans répertoire

const _SPELL_TAGS_PREDEF = ['Soin','Dégâts','Buff','Debuff','Contrôle','Mobilité','Protection','Détection','Invocation','Téléportation','Utilitaire'];
const _TAG_COLORS = {
  'Soin':'#4aba6a','Dégâts':'#e06060','Buff':'#c9933a','Debuff':'#cc6644',
  'Contrôle':'#9966cc','Protection':'#5588cc','Mobilité':'#44aaaa',
  'Détection':'#8899ee','Invocation':'#aa7744','Téléportation':'#cc44cc','Utilitaire':'#888888','Vol':'#6699ee','Vitesse':'#55aacc',
};
// Tag auto (règle) vs tag joueur (répertoire) :
// auto  = issu de _deriveSpellTags(), couleur par rôle, lecture seule
// joueur = issu de spellbook[].tags, pastille bleue, modifiable
const _SCHOOL_FR = { Abjuration:'Abjuration', Conjuration:'Invocation', Divination:'Divination',
  Enchantment:'Enchantement', Evocation:'Évocation', Illusion:'Illusion',
  Necromancy:'Nécromancie', Transmutation:'Transmutation', Universal:'Universel' };
const _CLASS_FR = { wizard:'Magicien', sorcerer:'Ensorceleur', cleric:'Prêtre',
  druid:'Druide', paladin:'Paladin', ranger:'Rôdeur', bard:'Barde' };


// ══════════════════════════════════════════════════════════════
// _spellName — règle d'affichage FR/VO (réutilisable partout)
// main = nom principal (FR si dispo, sinon VO)
// sub  = nom secondaire (VO si différent du main, sinon '')
// ══════════════════════════════════════════════════════════════
function _spellName(sp, id) {
  const fr = (sp && (sp.nameFr || '')) ||
             (typeof SPELL_NAMES_FR !== 'undefined' ? (SPELL_NAMES_FR[id] || '') : '');
  const vo = (sp && sp.name) || '';
  if (fr && vo) {
    if (fr.trim().toLowerCase() === vo.trim().toLowerCase()) return { main:fr, sub:'' };
    return { main:fr, sub:vo };
  }
  if (fr) return { main:fr, sub:'' };
  if (vo) return { main:vo, sub:'' };
  return { main: id || '?', sub:'' };
}

// ── Guard: ensure spellbook exists ───────────────────────────
function _magBook() {
  if (!AppState.spellbook) AppState.spellbook = [];
  return AppState.spellbook;
}

// ── Main entry point ─────────────────────────────────────────
function renderMagie() {
  const el = document.getElementById('magie-content');
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;gap:4px;padding:8px 0 10px;border-bottom:1px solid var(--border);
                margin-bottom:12px;flex-wrap:wrap;">
      ${[
        ['grimoire',  '📖 Grimoire'],
        ['repertory', '🗒 Répertoire'],
        ['prepare',   '⚗ Préparation'],
        ['prepared',  '⚡ Sorts préparés'],
      ].map(([id,label])=>`
      <button onclick="_magTab='${id}';renderMagie();"
        style="padding:5px 14px;font-size:11px;font-family:Cinzel,serif;letter-spacing:1px;
               background:${_magTab===id?'var(--bg3)':'transparent'};
               border:1px solid ${_magTab===id?'var(--gold)':'var(--border)'};
               color:${_magTab===id?'var(--gold)':'var(--text-dim)'};
               border-radius:4px;cursor:pointer;">${label}</button>`).join('')}
    </div>
    <div id="mag-subpage" style="height:calc(100vh - 152px);overflow:hidden;"></div>`;
  switch(_magTab) {
    case 'grimoire':  _magRenderGrimoire(); break;
    case 'repertory': _magRenderRepertory(); break;
    case 'prepare':   _magRenderPrepare(); break;
    case 'prepared':  _magRenderPrepared(); break;
  }
}

// ══════════════════════════════════════════════════════════════
// 1. BIBLIOTHÈQUE
// ══════════════════════════════════════════════════════════════

// ── Compteurs contextuels (source + classe) ────────────────────
// Compte les sorts qui passeraient les filtres SANS tenir compte
// du filtre source/classe en cours de calcul.

// [Library function _magCountFiltered removed — replaced by Grimoire]


// Compteur par source (abbr) — ignore le filtre source actuel

// [Library function _magCountBySource removed — replaced by Grimoire]


// Compteur par classe — ignore le filtre classe actuel

// [Library function _magCountByClass removed — replaced by Grimoire]



// [Library function _magRenderLibrary removed — replaced by Grimoire]



// [Library function _magToggleLibTag removed — replaced by Grimoire]



// [Library function _magRefreshLibrary removed — replaced by Grimoire]


function _deriveSpellTags(sp) {
  // ── Override manuel : si le sort a des tags explicites dans SPELL_DB, ils priment ──
  if (sp.tags && Array.isArray(sp.tags) && sp.tags.length) return sp.tags;

  const tags = [];
  const name   = (sp.nameFr || sp.name || '').toLowerCase();
  const ename  = (sp.name || '').toLowerCase();
  const desc   = (sp.description?.fr || sp.desc || '').toLowerCase();
  const form   = (sp.formula || '').toLowerCase();
  const school = (sp.school || '').toLowerCase();
  const save   = (sp.save || '').toLowerCase();
  const nd     = name + ' ' + ename + ' ' + desc + ' ' + form;

  // ── SOIN ─────────────────────────────────────────────────────
  // Soigne des PV (pas juste "PV temp" comme effet secondaire d'un buff)
  if (/gu[eé]r|soigne|soins\b|heal\b|cure\b/.test(nd) ||
      /\dd\d.*pv|pv.*\dd\d|temporary hit point/.test(nd)) {
    tags.push('Soin');
  }

  // ── DÉGÂTS ───────────────────────────────────────────────────
  // Requiert des dés de dégâts (Xd6...) OU "inflige" explicite
  // ≠ "+1 aux dégâts" (buff) — on ne capture pas "dégâts" seul
  if (!tags.includes('Soin') &&
      (/\dd\d/.test(nd) || /\binflig/.test(nd)) &&
      /d[eé]g[aâ]t|damage\b|foudre|fire\b|feu\b|acid\b|cold\b|froid\b|sonic\b/.test(nd)) {
    tags.push('Dégâts');
  }

  // ── BUFF ──────────────────────────────────────────────────────
  // Bonus numériques sur lanceur / alliés, ou effets de renforcement
  if (/\+\d.*(force\b|str\b|dex\b|con\b|wis\b|int\b|cha\b|bba\b|ca\b|attaque|attack|compét|skill|save|jet|arme)/.test(nd) ||
      /\battaques? suppl[eé]|extra attack|hâte\b|haste\b|moral\b|bless\b|divine favor\b/.test(nd) ||
      /arme \+\d|weapon \+\d|magic weapon\b|enhanced weapon/.test(nd)) {
    tags.push('Buff');
  }

  // ── DEBUFF ────────────────────────────────────────────────────
  // Malus appliqués explicitement à des ENNEMIS ou cibles hostiles
  // ≠ auto-malus du lanceur (ex: -2 DEX de Righteous Might)
  // ≠ "pas de malus" (négation dans Mage Armor)
  if (/ennemis?.*-\d|-\d.*ennemis?|adversaire.*-\d|-\d.*adversaire/.test(nd) ||
      /\bslow\b|lenteur\b|exhaust\b|fatigue\b/.test(nd) ||
      (/malus/.test(nd) && !/pas de malus|no penalt/.test(nd)) ||
      /\-\d.*(attaque|attack|save|jet).*ennemi|\-\d.*tous.*ennemi/.test(nd)) {
    tags.push('Debuff');
  }

  // ── CONTRÔLE ─────────────────────────────────────────────────
  // Incapacite ou empêche d'agir (effet hostile)
  // ≠ résistance à la peur ("contre la peur"), ≠ "harmless"
  if (/paralys|hold\b|charm\b|domin|confus|sleep\b|sommeil\b|fascin|stun\b|immobilis/.test(nd) ||
      (/\bpeur\b|fear\b/.test(nd) && !/contre la peur|vs peur|against fear|save.*fear/.test(nd)) ||
      (/composante verbale|verbal component/.test(nd) && /impossible|ne peut|can.t cast/.test(nd)) ||
      (save === 'will neg' && school === 'enchantment')) {
    tags.push('Contrôle');
  }

  // ── PROTECTION ───────────────────────────────────────────────
  // Effets défensifs substantiels (pas un +1 CA mineur comme effet secondaire)
  if (/\bdr \d|damage reduction|ward\b|sanctuary\b/.test(nd) ||
      /miss chance|chance.*rater|20%.*attaque|attaque.*20%/.test(nd) ||
      /resist.*(feu|fire|acid|cold|elec|sonic|lightning)/.test(nd) ||
      /\+[2-9]\d*.*(ca\b|ac\b|armor bonus|natural armor|deflect)|armure.*bonus/.test(nd)) {
    tags.push('Protection');
  }
  // Abjuration = protection par nature (sauf soin, sauf dégâts)
  if (school === 'abjuration' && !tags.includes('Protection') &&
      !tags.includes('Soin') && !tags.includes('Dégâts')) {
    tags.push('Protection');
  }
  // Illusion défensive explicite (blur, displacement)
  if (school === 'illusion' && /flou|blur\b|displacement|20%|déplac/.test(nd) &&
      !tags.includes('Protection')) {
    tags.push('Protection');
  }

  // ── MOBILITÉ ─────────────────────────────────────────────────
  if (/\bfly\b|\bvol\b|vole\b|flight\b|vitesse|speed\b|longstride|overland/.test(nd) &&
      !/téléport|dimension door/.test(nd)) {
    tags.push('Mobilité');
  }
  // Haste = mobilité (accélération), même si +CA esquive minor
  if (/haste\b|hâte\b/.test(nd) && !tags.includes('Mobilité')) {
    tags.push('Mobilité');
  }

  // ── DÉTECTION ────────────────────────────────────────────────
  // Seulement les sorts qui cherchent explicitement une information
  // ≠ school=Divination seul (trop large : Guidance est Divination mais c'est un Buff)
  if (/\bdetect\b|détect\b|scry|true see|true seeing|discern\b|locat\b|reveal\b|read magic|see invis/.test(nd)) {
    tags.push('Détection');
  }

  // ── INVOCATION ───────────────────────────────────────────────
  if (/\bsummon\b|convoc|invoque|appel.*cr[eé]at|call.*creature|monstr/.test(nd)) {
    tags.push('Invocation');
  }

  // ── TÉLÉPORTATION ────────────────────────────────────────────
  if (/\bteleport\b|dimension door\b|porte dimens|plane shift|word of recall\b/.test(nd)) {
    tags.push('Téléportation');
  }

  // ── UTILITAIRE ───────────────────────────────────────────────
  // Aucun autre tag = utilitaire, ou sorts de service explicites
  if (!tags.length) {
    tags.push('Utilitaire');
  } else if (/crée\b|create\b|purif|mend\b|lumiè|lumière|unlock|communicat\b|speak\b|tongue|water\b|food\b/.test(nd)) {
    if (!tags.includes('Utilitaire')) tags.push('Utilitaire');
  }

  // ── MAX 3 TAGS — priorité par pertinence joueur ──────────────
  const PRIORITY = ['Soin','Dégâts','Buff','Debuff','Contrôle','Invocation',
                    'Téléportation','Mobilité','Protection','Détection','Utilitaire'];
  const sorted = [...new Set(tags)].sort((a,b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
  return sorted.slice(0, 3);
}



// [Library function _magToggleLevel removed — replaced by Grimoire]


// Génère le HTML du panneau sources (SOURCE_REGISTRY + AppState.sourceFilters)

// [Library function _magSourcePanel removed — replaced by Grimoire]



// [Library function _magToggleSourceType removed — replaced by Grimoire]



// [Library function _magToggleSourceBook removed — replaced by Grimoire]



// ══════════════════════════════════════════════════════════════
// _magSpellDetailHtml — Fiche complète d'un sort (HTML)
// Réutilisable dans Bibliothèque, Répertoire, Préparation.
// sp   = entrée _getSpellDB()[dbId]
// dbId = clé du sort
// opts = { showNotes: bookEntry, extraBtns: htmlString }
// ══════════════════════════════════════════════════════════════
// ── Traductions abréviations D&D 3.5 → FR ────────────────────
const _TM = {
  '1 std':            '1 action',
  '1 round':          '1 round',
  '1 min':            '1 min',
  '10 min':           '10 min',
  '30 min':           '30 min',
  '1 hour':           '1 heure',
  '24 hours':         '24 heures',
  '3 rounds':         '3 rounds',
  '6 rounds':         '6 rounds',
  'Free action':      'Action libre',
  'Swift action':     'Action rapide',
  'Immediate action': 'Action immédiate',
};
const _RN = {
  'Touch':          'Contact',
  'Personal':       'Personnelle',
  'Close':          'Courte (7m)',
  'Medium':         'Moyenne (30m)',
  'Long':           'Longue (120m)',
  'Unlimited':      'Illimitée',
  'See text':       'Voir texte',
  'Personal/Touch': 'Perso./Contact',
  '0 ft':           '0 m',
  '10 ft':          '3 m',
  '60 ft':          '18 m',
  '50 ft':          '15 m',
};
const _SV = {
  'None':            'Aucun',
  'Will neg':        'Vol. annule',
  'Will half':       'Vol. demi',
  'Will neg (harm)': 'Vol. annule (inoff.)',
  'Fort neg':        'Vig. annule',
  'Fort partial':    'Vig. partiel',
  'Ref half':        'Réf. demi',
  'Ref neg':         'Réf. annule',
  'Will disbelief':  'Vol. incrédulité',
  'Will partial':    'Vol. partiel',
  'See text':        'Voir texte',
};
const _SR = { 'Yes': 'Oui', 'No': 'Non', 'Yes (harmless)': 'Oui (inoff.)' };
function _loc(v, t) { return (v && t[v]) || v || '-'; }


function _magSpellDetailHtml(sp, dbId, opts) {
  if (!sp) return '<div style="padding:12px;color:var(--text-dim);font-style:italic;">Sort non trouvé.</div>';
  opts = opts || {};

  const { main: nameFr, sub: nameEn } = _spellName(sp, dbId);
  const lvObj  = sp.level || sp.classes || {};
  const desc   = sp.description?.fr || sp.desc || '';
  const descEn = sp.description?.en  || '';
  const tags   = _deriveSpellTags(sp);

  // ── Niveaux par classe ──────────────────────────────────────
  const levelRows = typeof lvObj === 'number'
    ? `<div style="font-size:12px;font-weight:700;color:var(--gold);">${lvObj}</div>`
    : Object.entries(lvObj).map(([cls, lv]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;">
          <span style="font-size:11px;color:var(--text-dim);">${_CLASS_FR[cls] || cls}</span>
          <span style="font-size:12px;color:var(--gold);font-weight:700;">${lv}</span>
        </div>`).join('');

  // ── Tags dérivés ────────────────────────────────────────────
  const tagHtml = tags.map(t => {
    const col = _TAG_COLORS[t] || '#8899cc';
    return `<span style="font-size:9px;padding:1px 7px;border-radius:8px;font-weight:600;letter-spacing:0.3px;background:${col}18;color:${col};border:1px solid ${col}44;">${t}</span>`;
  }).join(' ');

  // ── Composantes détaillées ──────────────────────────────────
  const COMP_LABELS = { V:'Verbale', S:'Somatique', M:'Matérielle', F:'Focalisateur',
    DF:'Foc. divin', XP:'Coût XP', B:'B.', R:'R.' };
  const compDetail = (sp.comp || []).map(c => `
    <span title="${COMP_LABELS[c] || c}" style="font-size:10px;padding:0 5px;border-radius:3px;background:var(--bg2);border:1px solid var(--border);color:var(--text-dim);">${c}</span>`
  ).join(' ');

  // ── Ligne de fiche ──────────────────────────────────────────
  const row = (icon, label, val, highlight) => val ? `
    <div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:baseline;">
      <span style="color:var(--text-dim);flex:0 0 115px;font-size:10px;">${icon ? icon + ' ' : ''}${label}</span>
      <span style="color:${highlight ? 'var(--gold)' : 'var(--text-bright)'};flex:1;">${val}</span>
    </div>` : '';

  // ── Source label ────────────────────────────────────────────
  const sourceLabel = [sp.source_name || sp.source, sp.page ? `p.${sp.page}` : null]
    .filter(Boolean).join(', ');

  // ── Formula (résumé mécanique) ──────────────────────────────
  const formulaHtml = sp.formula ? `
    <div style="background:rgba(180,140,60,0.08);border:1px solid var(--gold-dim);border-radius:4px;
                padding:5px 10px;margin:6px 0;font-size:11px;color:var(--gold-dim);font-style:italic;">
      ⚡ ${sp.formula}
    </div>` : '';

  // ── Notes joueur (si répertoire) ───────────────────────────
  const bookEntry = opts.showNotes;
  const notesHtml = bookEntry ? `
    <div style="margin-top:10px;">
      <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:4px;">MES NOTES</div>
      <textarea rows="3" style="width:100%;font-size:12px;resize:vertical;background:var(--bg2);"
        placeholder="Tactique, conditions d'usage, combos…"
        oninput="_magBook().find(e=>e.id==='${bookEntry.id}').notes=this.value;autosave();">${(bookEntry.notes || '').replace(/</g, '&lt;')}</textarea>
    </div>` : '';

  // ── Description EN (optionnelle) ────────────────────────────
  const descEnHtml = descEn && descEn !== desc ? `
    <details style="margin-top:6px;">
      <summary style="font-size:10px;color:var(--text-dim);cursor:pointer;user-select:none;">▶ English original</summary>
      <div style="font-size:11px;color:var(--text-dim);line-height:1.6;margin-top:4px;font-style:italic;">${descEn}</div>
    </details>` : '';

  return `
    <!-- En-tête -->
    <div style="margin-bottom:10px;">
      <div style="display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
        <div class="cinzel" style="font-size:16px;color:var(--gold);font-weight:700;flex:1;">${nameFr}</div>
        ${opts.extraBtns || ''}
      </div>
      ${nameEn ? `<div style="font-size:11px;color:var(--text-dim);font-style:italic;margin-bottom:4px;">${nameEn}</div>` : ''}
      ${autoTagHtml ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${autoTagHtml}</div>` : ''}
    </div>

    <!-- Fiche de règles -->
    <div style="background:var(--bg3);border-radius:5px;padding:8px 12px;margin-bottom:8px;">
      <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:5px;">RÈGLES</div>
      ${row('⏱','Incantation', _loc(sp.time||sp.castingTime,_TM))}
      ${row('🎯','Portée',      _loc(sp.range,_RN))}
      ${row('👁','Cible',       sp.target || sp.area || sp.effect)}
      ${row('⏳','Durée',       sp.duration)}
      ${row('⚠','Sauvegarde',  _loc(sp.save,_SV))}
      ${row('🛡','Rés. magie',  _loc(sp.sr,_SR))}
    </div>

    <!-- Composantes + Classe + Source -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
      <div style="background:var(--bg3);border-radius:4px;padding:6px 10px;">
        <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:4px;">COMPOSANTES</div>
        <div style="display:flex;gap:3px;flex-wrap:wrap;">${compDetail || '<span style="color:var(--text-dim);font-size:11px;">—</span>'}</div>
      </div>
      <div style="background:var(--bg3);border-radius:4px;padding:6px 10px;">
        <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:2px;">ÉCOLE</div>
        <div style="font-size:11px;color:var(--text-bright);">${sp.school ? (_SCHOOL_FR[sp.school] || sp.school) : '—'}</div>
      </div>
    </div>

    <!-- Niveaux par classe -->
    ${Object.keys(lvObj).length ? `
    <div style="background:var(--bg3);border-radius:4px;padding:6px 10px;margin-bottom:8px;">
      <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:4px;">NIVEAUX PAR CLASSE</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;">${levelRows}</div>
    </div>` : ''}

    <!-- Formule mécanique si dispo -->
    ${formulaHtml}

    <!-- Description -->
    <div id="spell-desc-${dbId || nameEn.replace(/[^a-z0-9]/gi,'_')}"
         data-spell-name="${nameEn}"
         style="margin-bottom:6px;">
      ${desc ? `
      <div style="background:var(--bg3);border-radius:4px;padding:10px 12px;font-size:12px;color:var(--text-dim);line-height:1.7;">
        ${desc}
      </div>
      ${descEnHtml}` : `
      <div style="background:var(--bg3);border-radius:4px;padding:10px 12px;font-size:12px;color:var(--text-dim);line-height:1.7;text-align:center;">
        <span style="color:var(--text-dim);font-style:italic;font-size:11px;">⏳ Chargement de la description…</span>
      </div>`}
    </div>

    <!-- Source -->
    ${sourceLabel ? `<div style="font-size:10px;color:var(--text-dim);text-align:right;margin-bottom:4px;">📖 ${sourceLabel}</div>` : ''}

    <!-- Notes joueur -->
    ${notesHtml}`;
}


// ── Injection asynchrone de la description longue ────────────
async function _injectSpellDescription(nameEn, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const longDesc = await getSpellDescription(nameEn);
  if (!longDesc) return;

  // Only inject if the long description is meaningfully longer than what's shown
  // This avoids replacing a rich FR description with an EN one that's shorter
  const currentText = (container.textContent || '').trim();
  if (longDesc.length <= currentText.length + 50) return;

  // Render with paragraph breaks
  const rendered = longDesc
    .split(/\n\n+/)
    .map(para => `<p style="margin:0 0 8px;">${para.replace(/\n/g,'<br>')}</p>`)
    .join('');

  container.innerHTML = `
    <div style="background:var(--bg3);border-radius:4px;padding:10px 12px;
                font-size:12px;color:var(--text-dim);line-height:1.7;margin-bottom:6px;">
      ${rendered}
    </div>`;
}

function _magRenderSpellDetail(dbId) {
  const panel = document.getElementById('mlib-detail');
  if (!panel) return;
  const sp = _getSpellDB()[dbId];
  const inBook = _magBook().some(e=>e.dbId===dbId);
  const btns = `<button class="btn ${inBook?'btn-secondary':'btn-primary'} btn-small" style="flex-shrink:0;"
    onclick="_magToggleBook('${dbId}')">${inBook ? '✓ Possédé' : '+ Répertoire'}</button>`;

  panel.innerHTML = `
    <div class="panel" style="height:100%;display:flex;flex-direction:column;">
      <div class="panel-body" style="padding:12px;overflow-y:auto;flex:1;">
        ${_magSpellDetailHtml(sp, dbId, { extraBtns: btns })}
      </div>
    </div>`;

  // Inject long description asynchronously if not already in sp.desc
  if (sp && sp.name) {
    const containerId = 'spell-desc-' + (dbId || sp.name).replace(/[^a-z0-9]/gi,'_');
    _injectSpellDescription(sp.name, containerId);
  }
}


function _magToggleBook(dbId) {
  const book = _magBook();
  const idx  = book.findIndex(e=>e.dbId===dbId);
  if (idx>=0) {
    book.splice(idx,1);
    showToast('Sort retiré du répertoire', 'info');
  } else {
    const sp = _getSpellDB()[dbId];
    book.push({ id:'sb_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), dbId, tags:[], notes:'', addedAt:Date.now() });
    showToast(`"${sp?.nameFr||sp?.name||dbId}" ajouté au répertoire`, 'success');
  }
  autosave();
  // library refresh removed
}


// ══════════════════════════════════════════════════════════════
// 2. RÉPERTOIRE
// ══════════════════════════════════════════════════════════════
function _magRenderRepertory() {
  const el = document.getElementById('mag-subpage');
  if (!el) return;
  const book = _magBook();

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:260px 1fr;gap:12px;height:100%;">
      <div style="display:flex;flex-direction:column;gap:6px;min-height:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;color:var(--text-dim);">${book.length} sort${book.length!==1?'s':''}</span>
          <button class="btn btn-secondary btn-small" onclick="_magTab='grimoire';renderMagie();">+ Grimoire</button>
        </div>
        <input type="text" id="mrep-q" placeholder="🔍 Chercher…" style="font-size:11px;width:100%;"
          oninput="_magRefreshRepertory()">
        <div style="flex:1;overflow-y:auto;background:var(--bg3);border:1px solid var(--border);border-radius:5px;min-height:0;" id="mrep-list">
        </div>
      </div>
      <div id="mrep-detail" style="overflow-y:auto;min-height:0;">
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-dim);text-align:center;">
          <div><div style="font-size:28px;">🗒</div><div class="cinzel" style="font-size:10px;color:var(--gold-dim);letter-spacing:2px;margin-top:6px;">SÉLECTIONNEZ UN SORT</div></div>
        </div>
      </div>
    </div>`;
  _magRefreshRepertory();
}

function _magRefreshRepertory() {
  const listEl = document.getElementById('mrep-list');
  if (!listEl) return;
  const q = (document.getElementById('mrep-q')?.value||'').toLowerCase();
  const book = _magBook();

  const items = book.filter(e=>{
    const sp = _getSpellDB()[e.dbId];
    const name = (sp?.nameFr||sp?.name||e.dbId).toLowerCase();
    return !q || name.includes(q) || (e.notes||'').toLowerCase().includes(q) || (e.tags||[]).some(t=>t.toLowerCase().includes(q));
  });

  listEl.innerHTML = items.length
    ? items.map(e=>{
        const sp=_getSpellDB()[e.dbId];
        const { main: spName } = _spellName(sp, e.dbId);
        const levelObj=sp?.level||sp?.classes||{};
        const lv=typeof levelObj==='number'?levelObj:(Object.values(levelObj)[0]??'?');
        const isSelected=_magRepSel===e.id;
        return `<div onclick="_magRepSel='${e.id}';_magRefreshRepertory();_magRenderRepDetail('${e.id}');"
          style="padding:7px 10px;border-bottom:1px solid var(--border);cursor:pointer;
                 background:${isSelected?'var(--bg2)':'transparent'};
                 border-left:3px solid ${isSelected?'var(--gold)':'transparent'};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;">
            <span style="font-size:12px;color:${isSelected?'var(--gold)':'var(--text-bright)'};font-weight:600;">${spName}</span>
            <span style="font-size:9px;color:var(--text-dim);flex-shrink:0;">Nv.${lv}</span>
          </div>
          ${sp?.school?`<div style="font-size:10px;color:var(--text-dim);">${_SCHOOL_FR[sp.school]||sp.school}${sp.time?' · '+sp.time:''}</div>`:''}
          ${(e.tags||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">
            ${e.tags.map(t=>`<span style="font-size:8px;padding:0 4px;border-radius:8px;background:rgba(100,120,220,0.12);color:#8899cc;">${t}</span>`).join('')}
          </div>`:''}
          ${e.notes?`<div style="font-size:10px;color:var(--text-dim);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.notes}</div>`:''}
        </div>`;
      }).join('')
    : '<div style="padding:20px;text-align:center;color:var(--text-dim);font-style:italic;">Répertoire vide — ajoutez des sorts depuis la Bibliothèque.</div>';
}

function _magRenderRepDetail(entryId) {
  const panel = document.getElementById('mrep-detail');
  if (!panel) return;
  const entry = _magBook().find(e=>e.id===entryId);
  if (!entry) return;
  const sp    = _getSpellDB()[entry.dbId];
  const allTags = [...new Set([..._SPELL_TAGS_PREDEF, ...(entry.tags||[])])];

  const btns = `<button class="btn btn-danger btn-small" onclick="_magRemoveFromBook('${entryId}')">Retirer</button>`;

  // Tags UI
  const tagUI = `
    <div style="margin-bottom:10px;">
      <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:5px;">MES TAGS</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:5px;">
        ${allTags.map(t => {
          const active = (entry.tags||[]).includes(t);
          return `<button onclick="_magToggleRepTag('${entryId}','${t}',this)"
            style="font-size:9px;padding:1px 6px;border-radius:8px;cursor:pointer;
                   background:${active?'rgba(100,120,220,0.2)':'transparent'};
                   border:1px solid ${active?'rgba(100,120,220,0.5)':'var(--border)'};
                   color:${active?'#8899cc':'var(--text-dim)'};">${t}</button>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:5px;">
        <input type="text" id="mrep-tag-custom" placeholder="Tag perso…" style="flex:1;font-size:10px;"
          onkeydown="if(event.key==='Enter'){_magAddRepTag('${entryId}');event.preventDefault();}">
        <button class="btn btn-secondary btn-small" onclick="_magAddRepTag('${entryId}')">+</button>
      </div>
    </div>
    <button class="btn btn-primary" style="width:100%;font-size:12px;margin-bottom:12px;"
      onclick="_magPrepareFromRep('${entry.dbId}')">⚗ Préparer ce sort</button>
    <hr style="border:none;border-top:1px solid var(--border);margin-bottom:10px;">`;

  panel.innerHTML = `
    <div class="panel" style="height:100%;display:flex;flex-direction:column;">
      <div class="panel-body" style="padding:12px;overflow-y:auto;flex:1;">
        ${_magSpellDetailHtml(sp, entry.dbId, { extraBtns: btns, showNotes: entry })}
        ${tagUI}
      </div>
    </div>`;

  // Inject long description asynchronously
  if (sp && sp.name) {
    const _repContainerId = 'spell-desc-' + (entryId || sp.name).replace(/[^a-z0-9]/gi,'_');
    _injectSpellDescription(sp.name, _repContainerId);
  }
}


function _magToggleRepTag(entryId, tag, btn) {
  const entry = _magBook().find(e=>e.id===entryId);
  if (!entry) return;
  if (!entry.tags) entry.tags=[];
  const idx = entry.tags.indexOf(tag);
  if (idx>=0) { entry.tags.splice(idx,1); btn.style.background='transparent'; btn.style.borderColor='var(--border)'; btn.style.color='var(--text-dim)'; }
  else { entry.tags.push(tag); btn.style.background='rgba(100,120,220,0.2)'; btn.style.borderColor='rgba(100,120,220,0.5)'; btn.style.color='#8899cc'; }
  autosave();
}

function _magAddRepTag(entryId) {
  const input = document.getElementById('mrep-tag-custom');
  const tag = (input?.value||'').trim().toLowerCase();
  if (!tag) return;
  const entry = _magBook().find(e=>e.id===entryId);
  if (!entry) return;
  if (!entry.tags) entry.tags=[];
  if (!entry.tags.includes(tag)) { entry.tags.push(tag); autosave(); _magRenderRepDetail(entryId); }
  if (input) input.value='';
}

function _magRemoveFromBook(entryId) {
  if (!confirm('Retirer ce sort du répertoire ?')) return;
  AppState.spellbook = _magBook().filter(e=>e.id!==entryId);
  _magRepSel = null;
  autosave();
  _magRenderRepertory();
}

function _magPrepareFromRep(dbId) {
  _magTab='prepare'; renderMagie();
}

// Préparer un sort depuis le grimoire (sort custom)
function _magPrepareFromGrimoire(spellId) {
  const sp = _magGrimoire().find(s=>s.id===spellId);
  if (!sp) return;
  // Add a prepared entry for the grimoire spell
  if (!AppState.preparedSpells) AppState.preparedSpells = [];
  // Check if already prepared
  if (AppState.preparedSpells.some(p=>p.grimoireId===spellId)) {
    showToast('Ce sort est déjà préparé', 'info'); return;
  }
  AppState.preparedSpells.push({
    id: 'prep_g_'+Date.now().toString(36),
    grimoireId: spellId,
    name: sp.name,
    level: sp.level ?? 0,
    school: sp.school || '',
    cast: false,
    isCustom: true,
  });
  autosave();
  showToast(`"${sp.name}" ajouté aux sorts préparés`, 'success');
}

// ══════════════════════════════════════════════════════════════
// 3. PRÉPARATION
// ══════════════════════════════════════════════════════════════
function _magRenderPrepare() {
  const el = document.getElementById('mag-subpage');
  if (!el) return;

  const wisMod    = typeof getMod==='function' ? getMod('WIS') : 0;
  const intMod    = typeof getMod==='function' ? getMod('INT') : 0;
  const classLevels = {};
  AppState.levels.forEach(l=>{ classLevels[l.classId]=(classLevels[l.classId]||0)+1; });
  const clericLvl = classLevels['class_cleric']||0;
  const wizLvl    = classLevels['class_wizard']||0;
  const casterMod = clericLvl>=wizLvl ? wisMod : intMod;
  const casterLabel = clericLvl>=wizLvl ? 'Prêtre (SAG)' : wizLvl ? 'Magicien (INT)' : 'Personnage';

  const slotsPerDay = clericLvl>0
    ? (typeof getClericSlotsPerDay==='function' ? getClericSlotsPerDay(clericLvl, wisMod) : [])
    : [];

  const prepCounts = typeof getPrepCountByLevel==='function' ? getPrepCountByLevel() : {};
  const book = _magBook();
  const maxLevel = slotsPerDay.reduce((m,slots,i)=>slots>0?i:m, 0);

  const rulesBlock = `
    <div class="panel mb-10" style="flex-shrink:0;">
      <div class="panel-header" style="cursor:pointer;" onclick="document.getElementById('mag-prep-rules').style.display=document.getElementById('mag-prep-rules').style.display==='none'?'':'none'">
        <span class="panel-title cinzel" style="font-size:10px;letter-spacing:1px;">📖 RÈGLES DE PRÉPARATION</span>
        <span style="font-size:12px;color:var(--text-dim);">▼</span>
      </div>
      <div id="mag-prep-rules" style="display:none;padding:10px 14px;font-size:11px;color:var(--text-dim);line-height:1.7;">
        <strong style="color:var(--text-bright);">Sorts quotidiens :</strong> Un lanceur de sorts préparés (clerc, druide, magicien) choisit ses sorts après un repos complet (8h).
        Le nombre de sorts par niveau est déterminé par la classe et la caractéristique de lancement.<br>
        <strong style="color:var(--text-bright);">Sorts multiples :</strong> Un même sort peut être préparé plusieurs fois.
        Chaque préparation occupe un emplacement distinct.<br>
        <strong style="color:var(--text-bright);">Métamagie :</strong> Augmente le niveau effectif du sort. Un sort Maximisé (don) utilise un emplacement de +3 niveaux.
      </div>
    </div>`;

  const levelBlocks = slotsPerDay.map((slots, lv)=>{
    if (lv===0 && clericLvl>0) return '';  // oraisons gratuites
    if (!slots) return '';
    const prepped = prepCounts[lv]||0;
    const available = book.filter(e=>{
      const sp=_getSpellDB()[e.dbId];
      if (!sp) return false;
      const spLevels=sp.level||sp.classes||{};
      const cls=clericLvl>0?'cleric':'wizard';
      const spLv=typeof spLevels==='number'?spLevels:(spLevels[cls]??-1);
      return spLv===lv;
    });
    const slotBar = Array.from({length:slots},(_,i)=>`
      <div style="width:18px;height:18px;border-radius:3px;border:1px solid var(--border);
                  background:${i<prepped?'var(--gold)':'var(--bg3)'};"></div>`).join('');
    return `
      <div class="panel mb-8">
        <div class="panel-header">
          <span class="panel-title cinzel" style="font-size:11px;letter-spacing:1px;">NIVEAU ${lv}</span>
          <div style="display:flex;gap:3px;align-items:center;">${slotBar}</div>
          <span style="font-size:11px;color:${prepped>=slots?'var(--red)':'var(--text-dim)'};">${prepped}/${slots}</span>
        </div>
        <div class="panel-body" style="padding:8px;">
          ${available.length===0
            ? '<div style="font-size:11px;color:var(--text-dim);font-style:italic;">Aucun sort de ce niveau dans le répertoire.</div>'
            : available.map(e=>{
                const sp=_getSpellDB()[e.dbId];
                const name=sp?.nameFr||sp?.name||e.dbId;
                const alreadyPrepped=AppState.preparedSpells.filter(p=>p.dbId===e.dbId&&(p.level??0)===lv).length;
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 6px;border-bottom:1px solid var(--border);border-radius:3px;"
                    onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background=''">
                  <div style="flex:1;cursor:pointer;" onclick="_magShowPrepSpellDetail('${e.dbId}')">
                    <div style="font-size:12px;color:var(--text-bright);font-weight:600;">${name}</div>
                    ${sp?.time?`<div style="font-size:9px;color:var(--text-dim);">⏱ ${sp.time}  ·  ${sp.range||''}  ·  ⏳ ${sp.duration||''}</div>`:''}
                    ${alreadyPrepped?`<span style="font-size:9px;color:var(--gold);">×${alreadyPrepped} préparé${alreadyPrepped>1?'s':''}</span>`:''}
                  </div>
                  <button class="btn btn-secondary btn-small" style="font-size:10px;"
                    onclick="_magAddPrepped('${e.dbId}',${lv})" ${prepped>=slots?'disabled style="opacity:0.4;"':''}>
                    + Préparer
                  </button>
                </div>`;
              }).join('')}
          ${available.length===0?`<button class="btn btn-secondary btn-small" style="margin-top:4px;font-size:10px;width:100%;" onclick="_magTab='repertory';renderMagie();">Ajouter des sorts au répertoire</button>`:''}
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div style="overflow-y:auto;height:100%;">
      <div style="display:grid;grid-template-columns:1fr 300px;gap:12px;">
        <div>
          ${rulesBlock}
          ${slotsPerDay.some(s=>s>0)
            ? levelBlocks || '<div class="text-dim small">Aucun emplacement disponible à ce niveau.</div>'
            : `<div style="padding:24px;text-align:center;color:var(--text-dim);">
                <div style="font-size:28px;margin-bottom:8px;">⚗</div>
                <div class="cinzel" style="font-size:11px;letter-spacing:2px;color:var(--gold-dim);">AUCUNE CLASSE LANCEUSE</div>
                <div style="font-size:12px;margin-top:6px;">Le personnage n'a pas de classe lanceuse de sorts préparés détectée.</div>
               </div>`}
        </div>
        <div>
          <div class="panel">
            <div class="panel-header"><span class="panel-title cinzel" style="font-size:10px;letter-spacing:1px;">RÉSUMÉ PRÉPARATION</span></div>
            <div class="panel-body" style="padding:10px;">
              <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;">${casterLabel} · Mod +${casterMod}</div>
              ${slotsPerDay.map((slots,lv)=>slots>0?`
              <div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0;border-bottom:1px solid var(--border);">
                <span style="color:var(--text-dim);">Niveau ${lv}</span>
                <span style="color:${(prepCounts[lv]||0)>=slots?'var(--gold)':'var(--text-dim)'};">${prepCounts[lv]||0}/${slots}</span>
              </div>`:''
              ).join('')}
              <div style="margin-top:10px;">
                <div style="font-size:11px;font-weight:600;color:var(--text-bright);margin-bottom:4px;">${AppState.preparedSpells.length} sort${AppState.preparedSpells.length!==1?'s':''} préparé${AppState.preparedSpells.length!==1?'s':''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function _magAddPrepped(dbId, level) {
  const ps = {
    id:       'ps_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
    dbId,
    level:    level,
    metamagic:[],
    cast:     false,
    castAt:   null,
  };
  AppState.preparedSpells.push(ps);
  autosave();
  _magRenderPrepare();
}

// ══════════════════════════════════════════════════════════════
// 4. SORTS PRÉPARÉS
// ══════════════════════════════════════════════════════════════
function _magRenderPrepared() {
  const el = document.getElementById('mag-subpage');
  if (!el) return;
  const prepared = AppState.preparedSpells||[];
  const cast    = prepared.filter(p=>p.cast).length;
  const total   = prepared.length;

  // Group by level
  const byLevel = {};
  prepared.forEach(ps=>{
    const lv=ps.level??0;
    (byLevel[lv]=byLevel[lv]||[]).push(ps);
  });

  const levelBlocks = Object.keys(byLevel).sort((a,b)=>a-b).map(lv=>{
    const spells = byLevel[lv];
    return `
      <div class="panel mb-10">
        <div class="panel-header">
          <span class="panel-title cinzel" style="font-size:11px;letter-spacing:1px;">NIVEAU ${lv}</span>
          <span style="font-size:11px;color:var(--text-dim);">${spells.filter(p=>!p.cast).length} / ${spells.length} disponibles</span>
        </div>
        <div>
          ${spells.map(ps=>{
            // Résolution : sort DB officiel OU sort custom du grimoire
            const spDb   = ps.dbId      ? _getSpellDB()[ps.dbId]                          : null;
            const spGrim = ps.grimoireId ? _magGrimoire().find(s=>s.id===ps.grimoireId) : null;
            const name   = spGrim?.name || spDb?.nameFr || spDb?.name || ps.name || '?';
            const castTime = ps.castAt
              ? new Date(ps.castAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
              : '';
            // Infoline durée/portée — supporte sorts DB et sorts custom
            const _PREP_RANGE_FR = {personal:'Pers.',touch:'Contact',close:'Proche',medium:'Moy.',long:'Longue'};
            const _prepRange = spGrim?.range
              ? (spGrim.range.mode==='numeric' ? (spGrim.range.value ? spGrim.range.value+' m' : '')
                : (_PREP_RANGE_FR[spGrim.range.category] || spGrim.range.category || ''))
              : (spDb?.range || '');
            const _prepDur  = spGrim?.durationText || spDb?.duration || '';
            const _prepTime = spGrim?.castingTime   || spDb?.time    || '';
            const _prepInfo = [
              _prepTime  ? '⏱ '+_prepTime  : null,
              _prepRange ? '↗ '+_prepRange : null,
              _prepDur   ? '⌛ '+_prepDur   : null,
            ].filter(Boolean).join(' · ');
            return `<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid var(--border);
                                opacity:${ps.cast?0.45:1};">
              <div style="flex:1;cursor:pointer;" onclick="_magShowPrepDetail('${ps.dbId||''}','${ps.grimoireId||''}')">
                <div style="font-size:12px;color:${ps.cast?'var(--text-dim)':'var(--text-bright)'};
                            text-decoration:${ps.cast?'line-through':'none'};font-weight:${ps.cast?400:600};">
                  ${name}${ps.metamagic?.length?` <span style="font-size:9px;color:var(--gold-dim);">[${ps.metamagic.join(',')}]</span>`:''}
                </div>
                ${_prepInfo?`<div style="font-size:9px;color:var(--text-dim);">${_prepInfo}</div>`:''}
                ${ps.cast&&castTime?`<div style="font-size:9px;color:var(--text-dim);">Lancé à ${castTime}</div>`:''}
              </div>
              <div style="display:flex;gap:3px;flex-shrink:0;">
                ${!ps.cast
                  ? `<button class="btn btn-primary btn-small" style="font-size:10px;padding:2px 10px;"
                      onclick="_magCastSpell('${ps.id}')">⚡ Lancer</button>`
                  : `<button class="btn btn-secondary btn-small" style="font-size:10px;padding:2px 8px;"
                      onclick="_magUncastSpell('${ps.id}')">↩ Annuler</button>`}
                <button class="btn btn-danger btn-small" style="font-size:10px;padding:2px 6px;"
                  onclick="_magRemovePrepped('${ps.id}')">✕</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div style="overflow-y:auto;height:100%;">
      <!-- Actions globales -->
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
        <div style="flex:1;">
          <span style="font-size:13px;font-weight:600;color:var(--text-bright);">${total} sort${total!==1?'s':''} préparé${total!==1?'s':''}</span>
          ${cast?`<span style="font-size:11px;color:var(--text-dim);margin-left:8px;">· ${cast} lancé${cast!==1?'s':''}</span>`:''}
        </div>
        ${cast?`<button class="btn btn-secondary btn-small" onclick="_magResetCast(false)">↩ Annuler tous les lancers</button>`:''}
        <button class="btn btn-primary btn-small" onclick="_magLongRest()">🌙 Repos long</button>
      </div>

      ${total===0
        ? `<div style="text-align:center;padding:40px;color:var(--text-dim);">
            <div style="font-size:28px;margin-bottom:8px;">⚡</div>
            <div class="cinzel" style="font-size:11px;letter-spacing:2px;color:var(--gold-dim);">AUCUN SORT PRÉPARÉ</div>
            <div style="font-size:12px;margin-top:6px;">Allez dans l'onglet Préparation pour préparer vos sorts du jour.</div>
            <button class="btn btn-primary btn-small" style="margin-top:12px;" onclick="_magTab='prepare';renderMagie();">⚗ Aller à Préparation</button>
           </div>`
        : levelBlocks}
    </div>`;
}

// Popup de détail d'un sort depuis Préparation ou Sorts préparés

function _magShowPrepDetail(dbId, grimoireId) {
  if (grimoireId) _magShowGrimoirePrepDetail(grimoireId);
  else if (dbId) _magShowPrepSpellDetail(dbId);
}

function _magShowGrimoirePrepDetail(spellId) {
  // Show a grimoire spell in a prep detail popup
  const sp = _magGrimoire().find(s=>s.id===spellId);
  if (!sp) return;
  document.getElementById('mag-spell-popup')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'mag-spell-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:800;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.onclick = e=>{ if(e.target===overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
                width:480px;max-width:95vw;max-height:80vh;display:flex;flex-direction:column;">
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:10px 14px;border-bottom:1px solid var(--border);">
        <span style="font-family:Cinzel,serif;font-size:14px;color:var(--gold);">${sp.name}</span>
        <button onclick="document.getElementById('mag-spell-popup').remove()"
          style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:18px;">✕</button>
      </div>
      <div style="padding:14px;overflow-y:auto;font-size:12px;color:var(--text-dim);line-height:1.7;">
        <!-- Fiche règles compacte -->
        <div style="background:var(--bg3);border-radius:5px;padding:7px 10px;margin-bottom:10px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;font-size:11px;">
            ${sp.class?`<span><b style="color:var(--text-bright);">Classe</b> ${_CLASS_FR[sp.class]||sp.class}</span>`:''}
            ${sp.level!==undefined?`<span><b style="color:var(--text-bright);">Niveau</b> ${sp.level}</span>`:''}
            ${sp.school?`<span><b style="color:var(--text-bright);">École</b> ${_SCHOOL_FR[sp.school]||sp.school}</span>`:''}
            ${sp.castingTime?`<span><b style="color:var(--text-bright);">Incantation</b> ${sp.castingTime}</span>`:''}
            ${sp.range?(()=>{const RANGE_FR={personal:'Personnelle',touch:'Contact',close:'Proche',medium:'Moyenne',long:'Longue'};const rl=sp.range.mode==='numeric'?(sp.range.value?sp.range.value+' m':'—'):(RANGE_FR[sp.range.category]||sp.range.category||'—');return `<span><b style="color:var(--text-bright);">Portée</b> ${rl}</span>`;})():''}
            ${sp.spellTarget?`<span><b style="color:var(--text-bright);">Cible</b> ${sp.spellTarget}</span>`:''}
            ${sp.durationText?`<span><b style="color:var(--text-bright);">Durée</b> ${sp.durationText}</span>`:''}
            ${sp.savingThrow?.label?`<span><b style="color:var(--text-bright);">JS</b> ${sp.savingThrow.label}</span>`:''}
            ${sp.spellResistance&&sp.spellResistance!==''?`<span><b style="color:var(--text-bright);">RM</b> ${sp.spellResistance==='yes'?'Oui':sp.spellResistance==='no'?'Non':sp.spellResistance}</span>`:''}
            ${sp.source?`<span style="grid-column:1/-1;"><b style="color:var(--text-bright);">Source</b> ${sp.source}</span>`:''}
          </div>
        </div>
        ${sp.description?`<div style="white-space:pre-wrap;">${sp.description}</div>`:'<em style="color:var(--text-dim);">Pas de description.</em>'}
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function _magShowPrepSpellDetail(dbId) {
  document.getElementById('mag-spell-popup')?.remove();
  const sp = _getSpellDB()[dbId];
  if (!sp) return;
  const overlay = document.createElement('div');
  overlay.id = 'mag-spell-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:800;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.onclick = (e) => { if (e.target===overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
                width:520px;max-width:95vw;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);flex-shrink:0;">
        <span class="cinzel" style="font-size:11px;color:var(--gold-dim);letter-spacing:1px;">FICHE DU SORT</span>
        <button onclick="document.getElementById('mag-spell-popup').remove()"
          style="font-size:12px;padding:2px 10px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);border-radius:3px;cursor:pointer;">✕</button>
      </div>
      <div style="padding:14px;overflow-y:auto;flex:1;">
        ${_magSpellDetailHtml(sp, dbId, {})}
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // Inject long description asynchronously
  if (sp && sp.name) {
    const _prepContainerId = 'spell-desc-' + (dbId || sp.name).replace(/[^a-z0-9]/gi,'_');
    _injectSpellDescription(sp.name, _prepContainerId);
  }
}


function _magCastSpell(psId) {
  const ps = AppState.preparedSpells.find(p=>p.id===psId);
  if (!ps||ps.cast) return;
  ps.cast=true; ps.castAt=Date.now();
  autosave();
  _magRenderPrepared();
  // Try to activate matching buff
  if (typeof castPreparedSpell==='function') castPreparedSpell(psId);
}

function _magUncastSpell(psId) {
  const ps = AppState.preparedSpells.find(p=>p.id===psId);
  if (!ps) return;
  ps.cast=false; ps.castAt=null;
  autosave();
  _magRenderPrepared();
}

function _magRemovePrepped(psId) {
  AppState.preparedSpells = AppState.preparedSpells.filter(p=>p.id!==psId);
  autosave();
  _magRenderPrepared();
}

function _magResetCast(confirm_) {
  if (!confirm_&&!confirm('Annuler tous les lancers ?')) return;
  AppState.preparedSpells.forEach(ps=>{ ps.cast=false; ps.castAt=null; });
  autosave();
  _magRenderPrepared();
}

function _magLongRest() {
  if (!confirm('Repos long : vider tous les sorts préparés et réinitialiser les emplacements ?')) return;
  AppState.preparedSpells = [];
  AppState.spellSlotUsage = {};
  autosave();
  showToast('Repos long — sorts préparés réinitialisés', 'success');
  _magTab='prepare'; renderMagie();
}


// ══════════════════════════════════════════════════════════════
// GRIMOIRE — Création et gestion des sorts personnels du joueur
// ══════════════════════════════════════════════════════════════

// ── Données grimoire ─────────────────────────────────────────
function _magGrimoire() {
  if (!AppState.grimoire) AppState.grimoire = [];
  return AppState.grimoire;
}

const _GRIMOIRE_TAGS = [
  'Soin','Dégâts','Buff','Debuff','Contrôle','Protection',
  'Mobilité','Détection','Invocation','Téléportation','Utilitaire','Zone','Vol','Vitesse'
];

// getEffetDef() moved to grimoire_effects.js as _EFFET_DEF (accessible via getEffetDef())

// ── ID helper ─────────────────────────────────────────────────
function _grimId() {
  return 'g_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,5);
}

// ══════════════════════════════════════════════════════════════
// GRIMOIRE — Rendu principal
// ══════════════════════════════════════════════════════════════
function _magRenderGrimoire() {
  _magGrimoireSubTabActive = _magGrimoireSubTabActive || 'spells';
  const el = document.getElementById('mag-subpage');
  if (!el) return;
  const grimoire = _magGrimoire();

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:280px 1fr;gap:12px;height:100%;">

      <!-- Colonne gauche : liste + actions -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;overflow:hidden;">

        <!-- Références magie -->
        <details style="background:var(--bg3);border-radius:6px;padding:6px 10px;">
          <summary style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);cursor:pointer;user-select:none;list-style:none;">
            📚 RÉFÉRENCES MAGIE ▸
          </summary>
          <div style="margin-top:8px;font-size:10px;color:var(--text-dim);line-height:1.7;">

            <div style="font-size:9px;font-weight:700;color:var(--gold-dim);margin-bottom:2px;">SOURCES OFFICIELLES</div>
            <div style="margin-bottom:6px;">
              <strong style="color:var(--text-bright);">Player's Handbook (PHB)</strong> — Chapitre 11, pp.181-300<br>
              <strong style="color:var(--text-bright);">Spell Compendium (SpC)</strong> — Sorts A–Z<br>
              <strong style="color:var(--text-bright);">Complete Divine / Arcane / Warrior</strong> — sorts de prestige<br>
              <em style="color:var(--text-dim);">Ces livres font autorité sur les règles.</em>
            </div>

            <div style="font-size:9px;font-weight:700;color:var(--gold-dim);margin-bottom:2px;">RÉFÉRENCES EN LIGNE (VO)</div>
            <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px;">
              <a href="https://www.d20srd.org/srd/spells/" target="_blank"
                 style="color:var(--text-dim);text-decoration:underline;">d20srd.org — SRD officiel VO (gratuit)</a>
              <a href="https://www.dandwiki.com/wiki/3.5e_Spells" target="_blank"
                 style="color:var(--text-dim);text-decoration:underline;">D&D Wiki — index communautaire</a>
            </div>

            <div style="font-size:9px;font-weight:700;color:var(--gold-dim);margin-bottom:2px;">RESSOURCES COMMUNAUTAIRES FR</div>
            <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px;">
              <a href="https://www.aidedd.org/dnd/sorts.php" target="_blank"
                 style="color:var(--text-dim);text-decoration:underline;">AideDD.org — sorts 3.5 en français</a>
              <a href="https://www.pathfinderfr.org/wiki/index.php/Sorts" target="_blank"
                 style="color:var(--text-dim);text-decoration:underline;">PathfinderFR.org — référence proche</a>
            </div>

            <div style="font-size:9px;color:var(--text-dim);font-style:italic;border-top:1px solid var(--border);padding-top:4px;">
              ⚠ Les ressources communautaires peuvent contenir des erreurs ou différer des règles officielles.
            </div>
          </div>
        </details>

        <!-- Search + add -->
        <div style="display:flex;gap:6px;align-items:center;">
          <input type="text" id="grim-q" placeholder="🔍 Chercher…"
            style="flex:1;font-size:11px;"
            oninput="_magRefreshGrimoire()">
          <button class="btn btn-primary btn-small" onclick="_magOpenSpellForm(null)">+ Nouveau</button>
        </div>

        <!-- Filtre tags -->
        <div id="grim-tag-filters" style="display:flex;flex-wrap:wrap;gap:3px;">
          ${_GRIMOIRE_TAGS.map(t=>`
            <button id="grim-tf-${t}" onclick="_magToggleGrimoireTag('${t}')"
              title="${{
                'Soin':'Restaure des PV','Dégâts':'Inflige des dégâts',
                'Buff':'Améliore les stats','Debuff':'Pénalise un ennemi',
                'Contrôle':'Immobilise ou contrôle','Protection':'Protège ou défend',
                'Mobilité':'Modifie le déplacement','Détection':'Révèle ou détecte',
                'Invocation':'Convoque une créature','Téléportation':'Déplace instantanément',
                'Utilitaire':'Effet divers','Zone':'Affecte plusieurs cibles',
              }[t]||t}"
              style="font-size:9px;padding:1px 7px;border-radius:8px;cursor:pointer;
                     background:transparent;border:1px solid var(--border);
                     color:var(--text-dim);">${t}</button>`).join('')}
          <button onclick="_magClearGrimoireTags()"
            style="font-size:9px;padding:1px 7px;border-radius:8px;cursor:pointer;
                   background:transparent;border:1px solid var(--border);color:var(--text-dim);">✕ Tout</button>
        </div>

        <!-- Stats -->
        <div style="font-size:10px;color:var(--text-dim);" id="grim-count">${grimoire.length} sort${grimoire.length!==1?'s':''}</div>

        <!-- Liste scrollable -->
        <div id="grim-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:3px;"></div>
      </div>

      <!-- Colonne droite : détail sort ou fight log -->
      <div id="grim-detail" style="overflow-y:auto;padding-right:4px;">
        <div style="height:100%;display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;color:var(--text-dim);">
            <div style="font-size:28px;margin-bottom:8px;">📖</div>
            <div style="font-size:12px;">Sélectionne un sort</div>
            <div style="font-size:11px;margin-top:4px;">ou crée-en un nouveau</div>
          </div>
        </div>
      </div>
      <!-- Fight Log panel (replaces detail when fightlog sub-tab active) -->
      <div id="grim-fightlog" style="display:none;overflow-y:auto;padding-right:4px;"></div>

    </div>`;

  _magRefreshGrimoire();
}

// ── Tag filter state ──────────────────────────────────────────
let _magGrimoireTagFilter = [];

function _magToggleGrimoireTag(tag) {
  const idx = _magGrimoireTagFilter.indexOf(tag);
  if (idx >= 0) _magGrimoireTagFilter.splice(idx, 1);
  else _magGrimoireTagFilter.push(tag);
  _magRefreshGrimoire();
}
function _magClearGrimoireTags() {
  _magGrimoireTagFilter = [];
  _magRefreshGrimoire();
}

// ── Refresh list ──────────────────────────────────────────────
function _magRefreshGrimoire() {
  const list = document.getElementById('grim-list');
  const count = document.getElementById('grim-count');
  if (!list) return;

  const q = (document.getElementById('grim-q')?.value||'').toLowerCase();
  const grimoire = _magGrimoire();

  // Update tag filter buttons
  _GRIMOIRE_TAGS.forEach(t => {
    const btn = document.getElementById(`grim-tf-${t}`);
    if (!btn) return;
    const active = _magGrimoireTagFilter.includes(t);
    const col = _TAG_COLORS[t] || '#8899cc';
    btn.style.background = active ? col+'22' : 'transparent';
    btn.style.borderColor = active ? col : 'var(--border)';
    btn.style.color       = active ? col : 'var(--text-dim)';
  });

  const filtered = grimoire.filter(sp => {
    if (q && !sp.name.toLowerCase().includes(q)
          && !(sp.nameEn||'').toLowerCase().includes(q)
          && !(sp.description||'').toLowerCase().includes(q)) return false;
    if (_magGrimoireTagFilter.length > 0) {
      if (!_magGrimoireTagFilter.every(t => (sp.tags||[]).includes(t))) return false;
    }
    return true;
  });

  if (count) count.textContent = `${filtered.length}/${grimoire.length} sort${grimoire.length!==1?'s':''}`;

  const byLevel = {};
  filtered.forEach(sp => {
    const lv = sp.level ?? '?';
    (byLevel[lv] = byLevel[lv] || []).push(sp);
  });

  list.innerHTML = '';
  Object.keys(byLevel).sort((a,b)=>a-b).forEach(lv => {
    // Level header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);padding:4px 2px 2px;';
    hdr.textContent = lv === '?' ? 'Niveau ?' : `Niveau ${lv}`;
    list.appendChild(hdr);

    byLevel[lv].forEach(sp => {
      const active = _magGrimoireSel === sp.id;
      const div = document.createElement('div');
      div.style.cssText = `padding:5px 8px;border-radius:5px;cursor:pointer;
        background:${active?'var(--bg3)':'transparent'};
        border:1px solid ${active?'var(--gold-dim)':'transparent'};`;
      div.onclick = () => { _magGrimoireSel = sp.id; _magRefreshGrimoire(); _magRenderGrimoireDetail(sp.id); };

      const tagHtml = (sp.tags||[]).slice(0,3).map(t => {
        const col = _TAG_COLORS[t] || '#8899cc';
        return `<span style="font-size:8px;padding:0 5px;border-radius:6px;background:${col}22;color:${col};border:1px solid ${col}44;">${t}</span>`;
      }).join(' ');

      // Indicateur runtime dans la liste
      const _listRt = (sp.effects||[]).filter(ef => {
        const d = getEffetDef().find(x => x.key === ef.type);
        return d && d.targets.length > 0;
      }).length;
      // Portée courte
      const _RANGE_SHORT = {personal:'Pers.',touch:'Contact',close:'Proche',medium:'Moy.',long:'Longue'};
      let _listRange = '';
      if (sp.range) {
        _listRange = sp.range.mode === 'numeric'
          ? (sp.range.value ? sp.range.value + ' m' : '')
          : (_RANGE_SHORT[sp.range.category] || sp.range.category || '');
      }
      const _listMeta = [
        _listRange             ? _listRange                    : null,
        sp.durationText        ? sp.durationText               : null,
        _listRt > 0            ? '⚡ ×' + _listRt             : null,
        sp.savingThrow?.label  ? '🛡 ' + sp.savingThrow.label : null,
      ].filter(Boolean).join(' · ');

      div.innerHTML = `
        <div style="font-size:12px;color:var(--text-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sp.name}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
          <div style="font-size:10px;color:var(--text-dim);">${_CLASS_FR[sp.class]||sp.class||''} ${sp.school?'· '+(_SCHOOL_FR[sp.school]||sp.school):''}</div>
          <div style="display:flex;gap:2px;">${tagHtml}</div>
        </div>
        ${_listMeta ? `<div style="font-size:9px;color:var(--text-dim);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0.75;">${_listMeta}</div>` : ''}`;
      list.appendChild(div);
    });
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:20px;font-size:11px;color:var(--text-dim);">
      ${grimoire.length === 0 ? 'Aucun sort — crée ton premier sort !' : 'Aucun résultat'}
    </div>`;
  }
}

// ══════════════════════════════════════════════════════════════
// GRIMOIRE — Détail d'un sort
// ══════════════════════════════════════════════════════════════
function _magRenderGrimoireDetail(spellId) {
  const panel = document.getElementById('grim-detail');
  if (!panel) return;
  const sp = _magGrimoire().find(s => s.id === spellId);
  if (!sp) return;

  const tagHtml = _GRIMOIRE_TAGS.map(t => {
    const active = (sp.tags||[]).includes(t);
    const col = _TAG_COLORS[t] || '#8899cc';
    return `<button onclick="_magGrimoireToggleTag('${spellId}','${t}')"
      style="font-size:9px;padding:1px 8px;border-radius:8px;cursor:pointer;
             background:${active?col+'22':'transparent'};
             border:1px solid ${active?col:'var(--border)'};
             color:${active?col:'var(--text-dim)'};">${t}</button>`;
  }).join('');

  const effetsHtml = (sp.effects||[]).map((ef,i) => {
    const def       = getEffetDef().find(x => x.key === ef.type);
    const typeLabel = def?.label || ef.type;
    const isRuntime = def && def.targets.length > 0;
    let valueDisplay = '';
    if (isRuntime) {
      const n    = typeof ef.value === 'number' ? ef.value : parseInt(ef.value);
      const sign = n > 0 ? '+' : '';
      const btFr = ef.bonusType ? (getBonusTypeFR()[ef.bonusType] || ef.bonusType) : '';
      valueDisplay = btFr
        ? `<span style="color:var(--text-bright);font-weight:600;">${sign}${n}</span>
           <span style="font-size:10px;color:var(--text-dim);margin-left:3px;">${btFr}</span>
           <span style="font-size:9px;color:var(--green);margin-left:4px;">→ fiche</span>`
        : `<span style="color:var(--text-bright);font-weight:600;">${sign}${n}</span>`;
    } else {
      valueDisplay = `<span style="color:var(--text-dim);font-style:italic;">${ef.value || '—'}</span>`;
    }
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;
                  border-bottom:1px solid var(--border);font-size:11px;">
        <span style="color:var(--text-dim);min-width:130px;">${typeLabel}</span>
        <span style="flex:1;">${valueDisplay}</span>
        <button onclick="_magGrimoireDeleteEffect('${spellId}',${i})"
          style="font-size:10px;color:var(--text-dim);background:none;border:none;cursor:pointer;padding:0 4px;">✕</button>
      </div>`;
  }).join('');

  // ── Construire l'étiquette portée ─────────────────────────────
  let rangeLabel = '';
  if (sp.range) {
    const RANGE_FR = {personal:'Personnelle',touch:'Contact',close:'Proche',medium:'Moyenne',long:'Longue'};
    rangeLabel = sp.range.mode === 'numeric'
      ? (sp.range.value ? sp.range.value + ' m' : '—')
      : (RANGE_FR[sp.range.category] || sp.range.category || '—');
  }

  // ── JDS label ─────────────────────────────────────────────────
  const saveLabel = sp.savingThrow?.label || '';
  const srLabel   = sp.spellResistance === 'yes' ? 'Oui' : sp.spellResistance === 'no' ? 'Non' : sp.spellResistance === 'harmless' ? 'Inoffensif' : '';

  // ── Tags pour l'étiquette ─────────────────────────────────────
  const tagChips = (sp.tags||[]).map(t => {
    const col = _TAG_COLORS[t] || '#8899cc';
    return `<span style="font-size:9px;padding:0 6px;border-radius:8px;background:${col}22;color:${col};border:1px solid ${col}44;">${t}</span>`;
  }).join('');

  // ── Indicateur runtime ─────────────────────────────────────
  const runtimeCount = (sp.effects||[]).filter(ef => {
    const def = getEffetDef().find(d => d.key === ef.type);
    return def && def.targets.length > 0;
  }).length;
  const runtimeBadge = runtimeCount > 0
    ? `<span style="font-size:9px;padding:0 6px;border-radius:8px;background:rgba(74,186,106,0.15);color:var(--green);border:1px solid rgba(74,186,106,0.3);">⚡ ${runtimeCount} effet${runtimeCount>1?'s':''} → fiche</span>`
    : '';

  // ── Étiquette compacte ────────────────────────────────────────
  const infoItems = [
    sp.castingTime   ? '⏱ ' + sp.castingTime : null,
    rangeLabel       ? '↗ ' + rangeLabel      : null,
    sp.spellTarget   ? '◎ ' + sp.spellTarget  : null,
    sp.durationText  ? '⌛ ' + sp.durationText : null,
    saveLabel        ? '🛡 JS : ' + saveLabel   : null,
    srLabel          ? 'RM : ' + srLabel        : null,
  ].filter(Boolean);

  panel.innerHTML = `
    <div style="padding:4px;">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div>
          <div style="font-family:Cinzel,serif;font-size:16px;color:var(--gold);">${sp.name}</div>
          ${sp.nameEn ? `<div style="font-size:11px;color:var(--text-dim);font-style:italic;">${sp.nameEn}</div>` : ''}
        </div>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-primary btn-small" onclick="_magPrepareFromGrimoire('${spellId}')">⚗ Préparer</button>
          <button class="btn btn-secondary btn-small" onclick="_magOpenSpellForm('${spellId}')">✎ Modifier</button>
          <button class="btn btn-danger btn-small" onclick="_magGrimoireDelete('${spellId}')">✕</button>
        </div>
      </div>

      <!-- Étiquette compacte (lecture rapide en jeu) -->
      ${(infoItems.length || tagChips || runtimeBadge) ? `
      <div style="background:var(--bg3);border-left:2px solid var(--gold-dim);border-radius:0 4px 4px 0;
                  padding:6px 10px;margin-bottom:8px;">
        ${infoItems.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px 14px;margin-bottom:${tagChips||runtimeBadge?'5px':'0'};">
          ${infoItems.map(x => `<span style="font-size:11px;color:var(--text-dim);">${x}</span>`).join('')}
        </div>` : ''}
        ${(tagChips || runtimeBadge) ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">${tagChips}${runtimeBadge}</div>` : ''}
      </div>` : ''}

      <!-- Buff actif si sort est lancé -->
      ${(() => {
        const activeBuff = (AppState.buffs||[]).find(b=>b.sourceGrimoireId===sp.id&&b.isActive);
        if (!activeBuff) return '';
        return `<div style="background:rgba(74,186,106,0.12);border:1px solid var(--green-dim);border-radius:5px;
                             padding:6px 10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-size:10px;color:var(--green);font-weight:700;">⚡ BUFF ACTIF</span>
            ${activeBuff.effectsLabel ? `<div style="font-size:10px;color:var(--text-dim);margin-top:1px;">${activeBuff.effectsLabel}</div>` : ''}
          </div>
          <button class="btn btn-small" onclick="toggleBuff('${activeBuff.id}');_magRenderGrimoireDetail('${spellId}')"
            style="font-size:10px;background:rgba(74,186,106,0.2);">Désactiver</button>
        </div>`;
      })()}

      <!-- Fiche règles -->
      <div style="background:var(--bg3);border-radius:5px;padding:8px 12px;margin-bottom:8px;font-size:11px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;">
          ${sp.class ? `<div><span style="color:var(--text-dim);">Classe </span><strong>${_CLASS_FR[sp.class]||sp.class}</strong></div>` : ''}
          ${sp.level !== undefined ? `<div><span style="color:var(--text-dim);">Niveau </span><strong>${sp.level}</strong></div>` : ''}
          ${sp.school ? `<div><span style="color:var(--text-dim);">École </span>${_SCHOOL_FR[sp.school]||sp.school}</div>` : ''}
          ${sp.castingTime ? `<div><span style="color:var(--text-dim);">Incantation </span>${sp.castingTime}</div>` : ''}
          ${rangeLabel ? `<div><span style="color:var(--text-dim);">Portée </span>${rangeLabel}</div>` : ''}
          ${sp.spellTarget ? `<div><span style="color:var(--text-dim);">Cible </span>${sp.spellTarget}</div>` : ''}
          ${sp.durationText ? `<div><span style="color:var(--text-dim);">Durée </span>${sp.durationText}</div>` : ''}
          ${saveLabel ? `<div><span style="color:var(--text-dim);">Jet sauvegarde </span>${saveLabel}</div>` : ''}
          ${srLabel ? `<div><span style="color:var(--text-dim);">Rés. magie </span>${srLabel}</div>` : ''}
          ${sp.source ? `<div style="grid-column:1/-1;"><span style="color:var(--text-dim);">Source </span>${sp.source}</div>` : ''}
        </div>
      </div>

      <!-- Tags -->
      <div style="margin-bottom:8px;">
        <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);margin-bottom:5px;">TAGS</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;">${tagHtml}</div>
      </div>

      <!-- Effets structurés -->
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);">EFFETS</div>
          <button class="btn btn-secondary btn-small" onclick="_magOpenEffectForm('${spellId}')">+ Effet</button>
        </div>
        ${effetsHtml || '<div style="font-size:11px;color:var(--text-dim);font-style:italic;">Aucun effet structuré</div>'}
      </div>

      <!-- Description -->
      ${sp.description ? `
      <div style="margin-bottom:8px;">
        <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);margin-bottom:5px;">DESCRIPTION</div>
        <div style="background:var(--bg3);border-radius:4px;padding:10px 12px;font-size:12px;
                    color:var(--text-dim);line-height:1.7;white-space:pre-wrap;">${sp.description}</div>
      </div>` : ''}

      <!-- Notes -->
      <div>
        <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);margin-bottom:4px;">NOTES</div>
        <textarea rows="3" style="width:100%;font-size:12px;resize:vertical;background:var(--bg2);"
          placeholder="Tactique, conditions d'usage, combos…"
          oninput="_magGrimoireUpdateNotes('${spellId}',this.value)">${(sp.notes||'').replace(/</g,'&lt;')}</textarea>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// GRIMOIRE — Actions sur les sorts
// ══════════════════════════════════════════════════════════════

function _magGrimoireToggleTag(spellId, tag) {
  const sp = _magGrimoire().find(s=>s.id===spellId);
  if (!sp) return;
  if (!sp.tags) sp.tags = [];
  const idx = sp.tags.indexOf(tag);
  if (idx >= 0) sp.tags.splice(idx,1); else sp.tags.push(tag);
  autosave();
  _magRenderGrimoireDetail(spellId);
  _magRefreshGrimoire();
}

function _magGrimoireUpdateNotes(spellId, val) {
  const sp = _magGrimoire().find(s=>s.id===spellId);
  if (!sp) return;
  sp.notes = val;
  autosave();
}

function _magGrimoireDelete(spellId) {
  if (!confirm('Supprimer ce sort du grimoire ?')) return;
  const g = _magGrimoire();
  const idx = g.findIndex(s=>s.id===spellId);
  if (idx >= 0) g.splice(idx,1);
  _magGrimoireSel = null;
  autosave();
  _magRenderGrimoire();
}

function _magGrimoireDeleteEffect(spellId, effectIdx) {
  const sp = _magGrimoire().find(s=>s.id===spellId);
  if (!sp || !sp.effects) return;
  sp.effects.splice(effectIdx,1);
  autosave();
  _magRenderGrimoireDetail(spellId);
}

// ══════════════════════════════════════════════════════════════
// GRIMOIRE — Formulaire de création / édition de sort
// ══════════════════════════════════════════════════════════════
function _magOpenSpellForm(spellId) {
  const existing = spellId ? _magGrimoire().find(s=>s.id===spellId) : null;
  const sp = existing || {};

  document.getElementById('mag-spell-popup')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'mag-spell-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:800;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto;';
  overlay.onclick = e => { if (e.target===overlay) overlay.remove(); };

  const classOptions = ['wizard','sorcerer','cleric','druid','paladin','ranger','bard','autre']
    .map(c=>`<option value="${c}" ${sp.class===c?'selected':''}>${_CLASS_FR[c]||c}</option>`).join('');
  const schoolOptions = ['Abjuration','Conjuration','Divination','Enchantment','Evocation','Illusion','Necromancy','Transmutation','Universal']
    .map(s=>`<option value="${s}" ${sp.school===s?'selected':''}>${_SCHOOL_FR[s]||s}</option>`).join('');

  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
                width:520px;max-width:95vw;">

      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:12px 16px;border-bottom:1px solid var(--border);">
        <span style="font-family:Cinzel,serif;font-size:14px;color:var(--gold);">
          ${spellId ? '✎ Modifier le sort' : '+ Nouveau sort'}
        </span>
        <button onclick="document.getElementById('mag-spell-popup').remove()"
          style="background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer;">✕</button>
      </div>

      <!-- Formulaire -->
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">

        <!-- Nom -->
        <div>
          <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">NOM DU SORT *</label>
          <input id="gf-name" type="text" placeholder="ex: Boule de feu" value="${sp.name||''}"
            style="width:100%;font-size:13px;">
        </div>

        <!-- Nom VO -->
        <div>
          <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">NOM VO (optionnel)</label>
          <input id="gf-nameen" type="text" placeholder="ex: Fireball" value="${sp.nameEn||''}"
            style="width:100%;font-size:13px;">
        </div>

        <!-- Classe + Niveau -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">CLASSE</label>
            <select id="gf-class" style="width:100%;font-size:13px;">
              <option value="">—</option>${classOptions}
            </select>
          </div>
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">NIVEAU</label>
            <input id="gf-level" type="number" min="0" max="9" value="${sp.level??''}"
              style="width:100%;font-size:13px;" placeholder="0–9">
          </div>
        </div>

        <!-- École + Source -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">ÉCOLE</label>
            <select id="gf-school" style="width:100%;font-size:13px;">
              <option value="">—</option>${schoolOptions}
            </select>
          </div>
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">SOURCE</label>
            <input id="gf-source" type="text" placeholder="ex: PHB p.241" value="${sp.source||''}"
              style="width:100%;font-size:13px;">
          </div>
        </div>

        <!-- Durée + Incantation -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">DURÉE</label>
            <input id="gf-duration" type="text" placeholder="ex: 1 round/niv, concentration…"
              value="${sp.durationText||''}" style="width:100%;font-size:13px;">
          </div>
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">INCANTATION</label>
            <input id="gf-casttime" type="text" placeholder="ex: 1 action, 1 round…"
              value="${sp.castingTime||''}" style="width:100%;font-size:13px;">
          </div>
        </div>

        <!-- Portée + Cible -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">PORTÉE</label>
            <select id="gf-range-mode" style="font-size:12px;width:100%;margin-bottom:4px;" onchange="_magUpdateRangeForm()">
              <option value="">— non renseignée —</option>
              <option value="personal">Personnelle</option>
              <option value="touch">Contact</option>
              <option value="close">Proche (7,5 m + 1,5 m/2 niv)</option>
              <option value="medium">Moyenne (30 m + 3 m/niv)</option>
              <option value="long">Longue (120 m + 12 m/niv)</option>
              <option value="numeric">Distance fixe (mètres)</option>
            </select>
            <div id="gf-range-num-row" style="display:none;">
              <input id="gf-range-value" type="number" min="0" placeholder="ex: 9"
                style="width:60%;font-size:12px;"> <span style="font-size:11px;color:var(--text-dim);">m</span>
            </div>
          </div>
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">CIBLE / ZONE</label>
            <input id="gf-target" type="text" placeholder="ex: 1 créature, soi-même, 9 m rayon…"
              value="${sp.spellTarget||''}" style="width:100%;font-size:13px;">
          </div>
        </div>

        <!-- JDS + RM -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">JET DE SAUVEGARDE</label>
            <select id="gf-save" style="width:100%;font-size:12px;">
              <option value="">Aucun</option>
              <option value="will_negates">Volonté annule</option>
              <option value="fort_negates">Vigueur annule</option>
              <option value="ref_half">Réflexes 1/2</option>
              <option value="will_half">Volonté 1/2</option>
              <option value="fort_partial">Vigueur partiel</option>
              <option value="harmless">Inoffensif</option>
              <option value="other">Autre (voir description)</option>
            </select>
          </div>
          <div>
            <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">RÉSIST. MAGIE</label>
            <select id="gf-sr" style="width:100%;font-size:12px;">
              <option value="">Non renseignée</option>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
              <option value="harmless">Inoffensif</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">DESCRIPTION (copier-coller le texte complet)</label>
          <textarea id="gf-desc" rows="6" style="width:100%;font-size:12px;resize:vertical;"
            placeholder="Colle ici la description officielle ou tes propres notes sur le sort…">${sp.description||''}</textarea>
        </div>

        <!-- Boutons -->
        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:4px;">
          <button class="btn btn-secondary" onclick="document.getElementById('mag-spell-popup').remove()">Annuler</button>
          <button class="btn btn-primary" onclick="_magSaveSpellForm('${spellId||''}')">
            ${spellId ? 'Enregistrer' : 'Créer le sort'}
          </button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Pré-remplir portée
  const rm = document.getElementById('gf-range-mode');
  if (rm && sp.range) {
    rm.value = sp.range.mode === 'numeric' ? 'numeric' : (sp.range.category || '');
    if (sp.range.mode === 'numeric') {
      const numRow = document.getElementById('gf-range-num-row');
      if (numRow) numRow.style.display = '';
      const rv = document.getElementById('gf-range-value');
      if (rv && sp.range.value) rv.value = sp.range.value;
    }
  }
  // Pré-remplir JDS
  if (sp.savingThrow?.key) {
    const sv = document.getElementById('gf-save');
    if (sv) sv.value = sp.savingThrow.key;
  }
  // Pré-remplir RM
  if (sp.spellResistance) {
    const sr = document.getElementById('gf-sr');
    if (sr) sr.value = sp.spellResistance;
  }

  document.getElementById('gf-name')?.focus();
}

function _magUpdateRangeForm() {
  const mode = document.getElementById('gf-range-mode')?.value;
  const numRow = document.getElementById('gf-range-num-row');
  if (numRow) numRow.style.display = mode === 'numeric' ? '' : 'none';
}

function _magSaveSpellForm(spellId) {
  const name = document.getElementById('gf-name')?.value.trim();
  if (!name) { showToast('Le nom est obligatoire', 'error'); return; }

  // Portée : construire objet structuré
  const rangeMode  = document.getElementById('gf-range-mode')?.value || '';
  const rangeVal   = parseInt(document.getElementById('gf-range-value')?.value) || null;
  const _RANGE_LABELS_FR = {personal:'Personnelle',touch:'Contact',close:'Proche',medium:'Moyenne',long:'Longue'};
  const rangeObj   = rangeMode === 'numeric'
    ? { mode: 'numeric', value: rangeVal, unit: 'm', raw: rangeVal ? rangeVal + ' m' : '' }
    : rangeMode
      ? { mode: 'category', category: rangeMode, raw: _RANGE_LABELS_FR[rangeMode] || rangeMode }
      : null;

  // JDS : libellé lisible
  const saveLabels = {
    will_negates:'Volonté annule', fort_negates:'Vigueur annule', ref_half:'Réflexes 1/2',
    will_half:'Volonté 1/2', fort_partial:'Vigueur partiel', harmless:'Inoffensif', other:'Voir description'
  };
  const saveKey = document.getElementById('gf-save')?.value || '';

  const data = {
    name,
    nameEn:       document.getElementById('gf-nameen')?.value.trim() || '',
    class:        document.getElementById('gf-class')?.value || '',
    level:        parseInt(document.getElementById('gf-level')?.value) || 0,
    school:       document.getElementById('gf-school')?.value || '',
    source:       document.getElementById('gf-source')?.value.trim() || '',
    durationText: document.getElementById('gf-duration')?.value.trim() || '',
    castingTime:  document.getElementById('gf-casttime')?.value.trim() || '',
    range:        rangeObj,
    spellTarget:  document.getElementById('gf-target')?.value.trim() || '',
    savingThrow:  saveKey ? { key: saveKey, label: saveLabels[saveKey] || saveKey } : null,
    spellResistance: document.getElementById('gf-sr')?.value || '',
    description:  document.getElementById('gf-desc')?.value.trim() || '',
  };

  const grimoire = _magGrimoire();

  if (spellId) {
    // Edit existing
    const sp = grimoire.find(s=>s.id===spellId);
    if (sp) Object.assign(sp, data);
    showToast(`"${name}" mis à jour`, 'success');
  } else {
    // Create new
    const newSpell = { id: _grimId(), isCustom: true, tags: [], effects: [], notes: '', addedAt: Date.now(), ...data };
    grimoire.push(newSpell);
    _magGrimoireSel = newSpell.id;
    showToast(`"${name}" ajouté au grimoire`, 'success');
  }

  autosave();
  document.getElementById('mag-spell-popup')?.remove();
  _magRenderGrimoire();
  if (_magGrimoireSel) _magRenderGrimoireDetail(_magGrimoireSel);
}

// ══════════════════════════════════════════════════════════════
// GRIMOIRE — Formulaire ajout d'effet
// ══════════════════════════════════════════════════════════════
function _magOpenEffectForm(spellId) {
  document.getElementById('mag-effect-popup')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'mag-effect-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:900;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.onclick = e => { if (e.target===overlay) overlay.remove(); };

  const defs = getEffetDef();
  const typeOptions = defs.map(t =>
    `<option value="${t.key}">${t.label}</option>`
  ).join('');
  const bonusTypeOptions = Object.entries(getBonusTypeFR()).map(([k,v])=>
    `<option value="${k}">${v||k}</option>`
  ).join('');

  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;width:400px;max-width:95vw;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);">
        <span style="font-family:Cinzel,serif;font-size:13px;color:var(--gold);">+ Ajouter un effet</span>
        <button onclick="document.getElementById('mag-effect-popup').remove()"
          style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:16px;">✕</button>
      </div>
      <div style="padding:14px;display:flex;flex-direction:column;gap:10px;">

        <div>
          <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">TYPE D'EFFET</label>
          <select id="ef-type" style="width:100%;font-size:13px;" onchange="_magUpdateEffectForm()">
            ${typeOptions}
          </select>
        </div>

        <div>
          <label id="ef-value-label" style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">VALEUR</label>
          <!-- runtime : champ numérique -->
          <input id="ef-value-num" type="number" style="width:100%;font-size:13px;display:none;" placeholder="ex: 4">
          <!-- narratif : texte libre -->
          <input id="ef-value-txt" type="text" style="width:100%;font-size:13px;display:none;" placeholder="—">
        </div>

        <div id="ef-bonustype-row" style="display:none;">
          <label style="font-size:10px;color:var(--text-dim);display:block;margin-bottom:3px;">TYPE DE BONUS</label>
          <select id="ef-bonustype" style="width:100%;font-size:13px;">
            ${bonusTypeOptions}
          </select>
        </div>

        <div id="ef-target-info" style="font-size:10px;color:var(--gold-dim);padding:4px 8px;background:var(--bg3);border-radius:4px;display:none;">
          Appliqué automatiquement au calcul des stats
        </div>
        <div id="ef-narrative-info" style="font-size:10px;color:var(--text-dim);padding:4px 8px;background:var(--bg3);border-radius:4px;display:none;">
          Effet narratif — visible sur la fiche, non calculé automatiquement
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn btn-secondary" onclick="document.getElementById('mag-effect-popup').remove()">Annuler</button>
          <button class="btn btn-primary" onclick="_magSaveEffect('${spellId}')">Ajouter</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  _magUpdateEffectForm();
}

function _magUpdateEffectForm() {
  const typeKey = document.getElementById('ef-type')?.value;
  const defs = getEffetDef();
  const def = defs.find(d => d.key === typeKey);
  if (!def) return;

  const hasTargets = def.targets && def.targets.length > 0;

  // Afficher le bon champ valeur selon le type d'effet
  const numInput = document.getElementById('ef-value-num');
  const txtInput = document.getElementById('ef-value-txt');
  const lbl      = document.getElementById('ef-value-label');

  if (numInput) {
    numInput.style.display = hasTargets ? '' : 'none';
    if (hasTargets) { numInput.placeholder = def.ex || 'ex: 4'; numInput.focus(); }
  }
  if (txtInput) {
    txtInput.style.display = hasTargets ? 'none' : '';
    if (!hasTargets && def.ex) txtInput.placeholder = def.ex;
  }
  if (lbl) lbl.textContent = hasTargets ? 'VALEUR (entier, positif ou négatif)' : 'DESCRIPTION';

  const bonusRow    = document.getElementById('ef-bonustype-row');
  const targetInfo  = document.getElementById('ef-target-info');
  const narrativeInfo = document.getElementById('ef-narrative-info');

  if (bonusRow)      bonusRow.style.display    = hasTargets ? '' : 'none';
  if (targetInfo)    targetInfo.style.display  = hasTargets ? '' : 'none';
  if (narrativeInfo) narrativeInfo.style.display = hasTargets ? 'none' : '';

  if (hasTargets) {
    const defaultBT = def.targets[0].bonusType;
    const btSel = document.getElementById('ef-bonustype');
    if (btSel) btSel.value = defaultBT;
  }
}



function _magSaveEffect(spellId) {
  const type      = document.getElementById('ef-type')?.value;
  const bonusType = document.getElementById('ef-bonustype')?.value || '';
  const defs      = getEffetDef();
  const def       = defs.find(d => d.key === type);
  const isRuntime = def && def.targets.length > 0;

  let value;
  if (isRuntime) {
    // Effet runtime : valeur entière obligatoire, non nulle
    const raw = document.getElementById('ef-value-num')?.value;
    const n   = parseInt(raw);
    if (isNaN(n) || n === 0) {
      showToast('Valeur numérique requise (ex: 4 ou -2)', 'error');
      return;
    }
    value = n; // stocker comme number
  } else {
    // Effet narratif : texte libre, peut être vide
    value = document.getElementById('ef-value-txt')?.value.trim() || '';
  }

  const sp = _magGrimoire().find(s => s.id === spellId);
  if (!sp) return;
  if (!sp.effects) sp.effects = [];

  const ef = { type, value };
  if (isRuntime && bonusType) ef.bonusType = bonusType;
  sp.effects.push(ef);

  autosave();
  document.getElementById('mag-effect-popup')?.remove();
  _magRenderGrimoireDetail(spellId);
  showToast('Effet ajouté', 'success');
}


// ── Grimoire sub-tab switching ─────────────────────────────
let _magGrimoireSubTabActive = 'spells';

function _magGrimoireSubTab(tab) {
  _magGrimoireSubTabActive = tab;

  const styleActive   = 'padding:3px 10px;font-size:10px;border-radius:4px;cursor:pointer;background:var(--bg3);border:1px solid var(--gold);color:var(--gold);';
  const styleInactive = 'padding:3px 10px;font-size:10px;border-radius:4px;cursor:pointer;background:transparent;border:1px solid var(--border);color:var(--text-dim);';

  const spellsBtn  = document.getElementById('grim-st-spells');
  const logBtn     = document.getElementById('grim-st-fightlog');
  const searchBar  = document.getElementById('grim-search-bar');
  const tagFilters = document.getElementById('grim-tag-filters');
  const listPanel  = document.getElementById('grim-list');
  const countEl    = document.getElementById('grim-count');
  const detailPanel= document.getElementById('grim-detail');
  const logPanel   = document.getElementById('grim-fightlog');

  const isSpells = tab === 'spells';

  if (spellsBtn)  spellsBtn.style.cssText  = isSpells ? styleActive : styleInactive;
  if (logBtn)     logBtn.style.cssText     = isSpells ? styleInactive : styleActive;
  if (searchBar)  searchBar.style.display  = isSpells ? '' : 'none';
  if (tagFilters) tagFilters.style.display = isSpells ? '' : 'none';
  if (listPanel)  listPanel.style.display  = isSpells ? '' : 'none';
  if (countEl)    countEl.style.display    = isSpells ? '' : 'none';
  if (detailPanel)detailPanel.style.display= isSpells ? '' : 'none';
  if (logPanel)   logPanel.style.display   = isSpells ? 'none' : '';

  if (isSpells) _magRefreshGrimoire();
  else _magRenderFightLog();
}

// ── Fight Log render ─────────────────────────────────────────
function _magRenderFightLog() {
  const panel = document.getElementById('grim-fightlog');
  if (!panel) return;
  const round = AppState.fightRound || 0;
  const log   = AppState.fightLog || [];

  panel.innerHTML = `
    <div style="padding:4px;">
      <!-- Compteur de rounds -->
      <div style="background:var(--bg3);border-radius:6px;padding:10px 14px;margin-bottom:10px;">
        <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);margin-bottom:6px;">ROUND</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button onclick="fightRoundSet(${round-1})"
            style="width:32px;height:32px;font-size:18px;border-radius:50%;border:1px solid var(--border);
                   background:transparent;cursor:pointer;color:var(--text-dim);">−</button>
          <div style="font-size:32px;font-weight:700;color:var(--gold);min-width:40px;text-align:center;">${round}</div>
          <button onclick="fightRoundSet(${round+1})"
            style="width:32px;height:32px;font-size:18px;border-radius:50%;border:1px solid var(--border);
                   background:transparent;cursor:pointer;color:var(--gold);">+</button>
          <button onclick="fightRoundSet(0)"
            style="font-size:10px;padding:3px 8px;border-radius:4px;border:1px solid var(--border);
                   background:transparent;cursor:pointer;color:var(--text-dim);margin-left:4px;">Reset</button>
        </div>
      </div>

      <!-- Ajout entrée manuelle -->
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <input type="text" id="flog-text" placeholder="ex: Bouclier de la foi lancé, Initiative +3…"
          style="flex:1;font-size:11px;"
          onkeydown="if(event.key==='Enter')_magFightLogAddManual()">
        <button class="btn btn-secondary btn-small" onclick="_magFightLogAddManual()">+ Noter</button>
      </div>

      <!-- Buffs actifs depuis grimoire -->
      ${(() => {
        const activeBuff = (AppState.buffs||[]).filter(b=>b.isActive&&b.sourceGrimoireId);
        if (!activeBuff.length) return '';
        return `<div style="margin-bottom:10px;">
          <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);margin-bottom:4px;">SORTS ACTIFS</div>
          ${activeBuff.map(b=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;
                        background:rgba(74,186,106,0.1);border-radius:4px;margin-bottom:2px;">
              <div>
                <span style="font-size:11px;color:var(--text-bright);">⚡ ${b.name}</span>
                ${b.effectsLabel ? `<span style="font-size:10px;color:var(--text-dim);margin-left:6px;">${b.effectsLabel}</span>` : ''}
              </div>
              <button onclick="toggleBuff('${b.id}');_magRenderFightLog();"
                style="font-size:10px;padding:1px 8px;border-radius:4px;border:1px solid var(--border);
                       background:transparent;cursor:pointer;color:var(--text-dim);">Fin</button>
            </div>`).join('')}
        </div>`;
      })()}

      <!-- Log entries -->
      <div style="font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);
                  display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span>NOTES DE COMBAT (${log.length})</span>
        ${log.length ? `<button onclick="if(confirm('Effacer tout ?'))fightLogClear();"
          style="font-size:9px;color:var(--text-dim);background:none;border:none;cursor:pointer;">✕ Effacer</button>` : ''}
      </div>
      ${log.length === 0 ? '<div style="font-size:11px;color:var(--text-dim);font-style:italic;">Aucune entrée</div>' :
        log.map(e=>`
          <div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px;">
            <span style="color:var(--gold-dim);flex:0 0 52px;font-family:Cinzel,serif;">R.${e.round}</span>
            <span style="color:var(--text-dim);flex:1;">${e.text}</span>
            <button onclick="_magFightLogDelete('${e.id}')"
              style="font-size:10px;color:var(--text-dim);background:none;border:none;cursor:pointer;padding:0 4px;">✕</button>
          </div>`).join('')}
    </div>`;
}

function _magFightLogAddManual() {
  const inp = document.getElementById('flog-text');
  const text = inp?.value.trim();
  if (!text) return;
  if (typeof fightLogAdd === 'function') fightLogAdd(text);
  else {
    if (!AppState.fightLog) AppState.fightLog = [];
    AppState.fightLog.unshift({ id: Date.now().toString(36), round: AppState.fightRound||0, text, ts: Date.now() });
    if (typeof autosave==='function') autosave();
  }
  if (inp) inp.value = '';
  _magRenderFightLog();
}

function _magFightLogDelete(entryId) {
  AppState.fightLog = (AppState.fightLog||[]).filter(e=>e.id!==entryId);
  if (typeof autosave==='function') autosave();
  _magRenderFightLog();
}

