// ============================================================
// wiki.js — Module Wiki D&D 3.5
// Targets existing HTML DOM:
//   #wiki-nav        → sidebar categories
//   #wiki-search     → search input  
//   #wiki-article    → article / content panel
// ============================================================

// ── Moteur de recherche ──────────────────────────────────────
function _wikiScore(article, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  let score = 0;
  const title = (article.title || '').toLowerCase();
  if (title === q)           score += 100;
  if (title.includes(q))     score += 40;
  (article.aliases || []).forEach(a => {
    const al = a.toLowerCase();
    if (al === q)           score += 80;
    if (al.includes(q))     score += 30;
  });
  (article.keywords || []).forEach(kw => {
    const k = kw.toLowerCase();
    if (k === q)            score += 20;
    if (k.includes(q))      score += 8;
  });
  if ((article.body || '').toLowerCase().includes(q)) score += 2;
  return score;
}

// ── renderRules : point d'entrée ─────────────────────────────
function renderRules() {
  _wikiBuildSidebar();
  // Afficher l'accueil si le panel est vide
  const article = document.getElementById('wiki-article');
  if (article && !article.dataset.wikiLoaded) {
    _wikiShowWelcome();
  }
}

// ── Construction de la sidebar ────────────────────────────────
function _wikiBuildSidebar() {
  const nav = document.getElementById('wiki-nav');
  if (!nav) return;

  const db = (typeof WIKI_DB !== 'undefined') ? WIKI_DB : [];
  if (!db.length) {
    nav.innerHTML = '<div style="padding:12px;font-size:11px;color:var(--text-dim);">Données non chargées.</div>';
    return;
  }

  // Collect unique categories in order of appearance
  const cats = [];
  db.forEach(a => { if (!cats.includes(a.cat)) cats.push(a.cat); });

  // Clear and rebuild via DOM API — no innerHTML, no encoding risk, no post-hoc patching
  nav.innerHTML = '';
  cats.forEach((cat) => {
    const count = db.filter(a => a.cat === cat).length;

    const div = document.createElement('div');
    div.className = 'wiki-nav-cat';
    div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 14px;cursor:pointer;border-left:3px solid transparent;font-size:12px;color:var(--text-dim);transition:all 0.12s;';

    const label = document.createElement('span');
    label.textContent = cat;  // safe — no encoding issues

    const badge = document.createElement('span');
    badge.textContent = count;
    badge.style.cssText = 'font-size:10px;background:var(--bg3);padding:1px 5px;border-radius:8px;color:var(--text-dim);';

    div.appendChild(label);
    div.appendChild(badge);

    div.addEventListener('mouseenter', function() {
      if (!this.classList.contains('wiki-active')) this.style.background = 'var(--bg3)';
    });
    div.addEventListener('mouseleave', function() {
      if (!this.classList.contains('wiki-active')) this.style.background = '';
    });
    div.addEventListener('click', () => _wikiShowCat(cat));

    nav.appendChild(div);
  });
}

// ── Accueil ───────────────────────────────────────────────────
function _wikiShowWelcome() {
  const article = document.getElementById('wiki-article');
  if (!article) return;

  const shortcuts = [
    ['bab_formula',       'BBA'],
    ['attack_melee',      "Jet d'attaque"],
    ['defense_ac',        'Classe d\'Armure'],
    ['defense_ac_touch',  'CA de contact'],
    ['save_vs_spell',     'Volonté contre sort'],
    ['magic_caster_level','NLS'],
    ['magic_resistance',  'Résistance à la magie'],
    ['formulas_all',      'Toutes les formules'],
    ['condition_list',    'États & conditions'],
    ['stat_modifier',     'Modificateur de carac.'],
  ];

  article.innerHTML = `
    <div style="text-align:center;padding:32px 20px 20px;">
      <div style="font-size:40px;margin-bottom:10px;">📖</div>
      <div class="cinzel" style="color:var(--gold);font-size:16px;letter-spacing:3px;margin-bottom:6px;">WIKI D&amp;D 3.5</div>
      <div style="font-size:12px;color:var(--text-dim);line-height:1.6;margin-bottom:20px;">
        Base de connaissance des règles.<br>
        Cliquez une catégorie à gauche ou cherchez un terme.
      </div>
      <div id="wiki-shortcuts" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;"></div>
    </div>`;

  // Inject shortcut buttons safely
  const sc = document.getElementById('wiki-shortcuts');
  shortcuts.forEach(([id, label]) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-small';
    btn.style.fontSize = '11px';
    btn.textContent = label;
    btn.addEventListener('click', () => wikiOpen(id));
    sc.appendChild(btn);
  });

  article.dataset.wikiLoaded = 'welcome';
}

// ── Afficher une catégorie ────────────────────────────────────
function _wikiShowCat(cat) {
  // Update sidebar highlight
  const _nav1 = document.getElementById('wiki-nav');
  if (_nav1) _nav1.querySelectorAll('.wiki-nav-cat').forEach(btn => {
    const label = btn.querySelector('.wiki-cat-label');
    const active = label && label.textContent === cat;
    btn.classList.toggle('wiki-active', active);
    btn.style.background  = active ? 'rgba(201,147,58,0.1)' : '';
    btn.style.borderLeft  = active ? '3px solid var(--gold-dim)' : '3px solid transparent';
    btn.style.color       = active ? 'var(--gold-light)' : 'var(--text-dim)';
  });

  const db = (typeof WIKI_DB !== 'undefined') ? WIKI_DB : [];
  const articles = db.filter(a => a.cat === cat);
  const panel = document.getElementById('wiki-article');
  if (!panel) return;

  // Build list
  const wrapper = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'cinzel';
  header.style.cssText = 'color:var(--gold);font-size:14px;letter-spacing:2px;margin-bottom:12px;';
  header.textContent = cat;
  wrapper.appendChild(header);

  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
  articles.forEach(a => {
    const row = document.createElement('div');
    row.style.cssText = 'padding:9px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:5px;cursor:pointer;';
    row.addEventListener('mouseenter', () => { row.style.background = 'var(--bg4)'; });
    row.addEventListener('mouseleave', () => { row.style.background = 'var(--bg3)'; });
    row.addEventListener('click', () => wikiOpen(a.id));

    const title = document.createElement('div');
    title.style.cssText = 'font-size:13px;color:var(--text-bright);font-weight:600;';
    title.textContent = a.title;
    row.appendChild(title);

    if (a.aliases && a.aliases.length) {
      const aliases = document.createElement('div');
      aliases.style.cssText = 'font-size:10px;color:var(--text-dim);margin-top:2px;';
      aliases.textContent = a.aliases.join(' · ');
      row.appendChild(aliases);
    }
    list.appendChild(row);
  });
  wrapper.appendChild(list);

  panel.innerHTML = '';
  panel.appendChild(wrapper);
  panel.dataset.wikiLoaded = 'cat:' + cat;
}

// ── Afficher un article ───────────────────────────────────────
function wikiOpen(id) {
  const db = (typeof WIKI_DB !== 'undefined') ? WIKI_DB : [];
  const art = db.find(a => a.id === id);
  if (!art) return;

  // Highlight sidebar category
  const _nav2 = document.getElementById('wiki-nav');
  if (_nav2) _nav2.querySelectorAll('.wiki-nav-cat').forEach(btn => {
    const label = btn.querySelector('.wiki-cat-label');
    const active = label && label.textContent === art.cat;
    btn.classList.toggle('wiki-active', active);
    btn.style.background = active ? 'rgba(201,147,58,0.08)' : '';
    btn.style.borderLeft = active ? '3px solid var(--gold-dim)' : '3px solid transparent';
    btn.style.color      = active ? 'var(--gold-light)' : 'var(--text-dim)';
  });

  const panel = document.getElementById('wiki-article');
  if (!panel) return;

  const wrapper = document.createElement('div');

  // Header
  const hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:baseline;gap:8px;margin-bottom:14px;flex-wrap:wrap;';
  const titleEl = document.createElement('div');
  titleEl.className = 'cinzel';
  titleEl.style.cssText = 'font-size:18px;color:var(--gold);letter-spacing:1px;';
  titleEl.textContent = art.title;
  const catEl = document.createElement('div');
  catEl.style.cssText = 'font-size:10px;color:var(--text-dim);border:1px solid var(--border);border-radius:3px;padding:1px 6px;';
  catEl.textContent = art.cat;
  hdr.appendChild(titleEl);
  hdr.appendChild(catEl);
  wrapper.appendChild(hdr);

  // Aliases
  if (art.aliases && art.aliases.length) {
    const alDiv = document.createElement('div');
    alDiv.style.cssText = 'margin-bottom:12px;font-size:11px;color:var(--text-dim);';
    alDiv.textContent = '🔗 ';
    art.aliases.forEach((a, i) => {
      const code = document.createElement('code');
      code.style.cssText = 'background:var(--bg3);padding:1px 6px;border-radius:3px;margin-right:3px;';
      code.textContent = a;
      alDiv.appendChild(code);
    });
    wrapper.appendChild(alDiv);
  }

  // Body (HTML from data)
  const body = document.createElement('div');
  body.className = 'wiki-body';
  body.innerHTML = art.body || '';
  wrapper.appendChild(body);

  // Related articles
  if (art.related && art.related.length) {
    const relSection = document.createElement('div');
    relSection.style.cssText = 'margin-top:20px;padding-top:14px;border-top:1px solid var(--border);';
    const relLabel = document.createElement('div');
    relLabel.className = 'cinzel';
    relLabel.style.cssText = 'font-size:9px;color:var(--text-dim);letter-spacing:2px;margin-bottom:6px;';
    relLabel.textContent = 'ARTICLES LIÉS';
    relSection.appendChild(relLabel);
    const relBtns = document.createElement('div');
    relBtns.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;';
    art.related.forEach(rid => {
      const rel = db.find(a => a.id === rid);
      if (rel) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-small';
        btn.style.fontSize = '11px';
        btn.textContent = rel.title;
        btn.addEventListener('click', () => wikiOpen(rid));
        relBtns.appendChild(btn);
      }
    });
    relSection.appendChild(relBtns);
    wrapper.appendChild(relSection);
  }

  panel.innerHTML = '';
  panel.appendChild(wrapper);
  panel.dataset.wikiLoaded = id;
}

// ── Recherche ─────────────────────────────────────────────────
function wikiSearch(query) {
  const panel = document.getElementById('wiki-article');
  if (!panel) return;

  if (!query || !query.trim()) {
    if (!panel.dataset.wikiLoaded || panel.dataset.wikiLoaded === 'welcome') {
      _wikiShowWelcome();
    }
    return;
  }

  const db = (typeof WIKI_DB !== 'undefined') ? WIKI_DB : [];
  const found = db
    .map(a => ({ ...a, _s: _wikiScore(a, query) }))
    .filter(a => a._s > 0)
    .sort((a, b) => b._s - a._s);

  // Single dominant result → open directly
  if (found.length === 1 ||
      (found.length > 1 && found[0]._s >= 80 && found[0]._s > found[1]._s * 2)) {
    return wikiOpen(found[0].id);
  }

  if (!found.length) {
    panel.innerHTML = '';
    const msg = document.createElement('div');
    msg.style.cssText = 'text-align:center;padding:40px;color:var(--text-dim);';
    msg.innerHTML = '<div style="font-size:24px;margin-bottom:8px;">🔍</div>';
    const t = document.createElement('div');
    t.textContent = `Aucun résultat pour "${query}"`;
    msg.appendChild(t);
    panel.appendChild(msg);
    panel.dataset.wikiLoaded = '';
    return;
  }

  // Build results list
  const wrapper = document.createElement('div');
  const hdr = document.createElement('div');
  hdr.className = 'cinzel';
  hdr.style.cssText = 'font-size:11px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:10px;';
  hdr.textContent = `🔍 ${found.length} résultat(s) pour "${query}"`;
  wrapper.appendChild(hdr);

  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
  found.forEach(a => {
    const row = document.createElement('div');
    row.style.cssText = 'padding:9px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:5px;cursor:pointer;';
    row.addEventListener('mouseenter', () => { row.style.background = 'var(--bg4)'; });
    row.addEventListener('mouseleave', () => { row.style.background = 'var(--bg3)'; });
    row.addEventListener('click', () => wikiOpen(a.id));

    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display:flex;align-items:baseline;gap:8px;';
    const t = document.createElement('span');
    t.style.cssText = 'font-size:13px;color:var(--text-bright);font-weight:600;';
    t.textContent = a.title;
    const c = document.createElement('span');
    c.style.cssText = 'font-size:10px;color:var(--text-dim);';
    c.textContent = a.cat;
    titleRow.appendChild(t); titleRow.appendChild(c);
    row.appendChild(titleRow);

    if (a.aliases && a.aliases.length) {
      const al = document.createElement('div');
      al.style.cssText = 'font-size:10px;color:var(--text-dim);margin-top:1px;';
      al.textContent = a.aliases.join(' · ');
      row.appendChild(al);
    }
    list.appendChild(row);
  });
  wrapper.appendChild(list);

  panel.innerHTML = '';
  panel.appendChild(wrapper);
  panel.dataset.wikiLoaded = '';
}

// ── Raccourcis depuis autres onglets ──────────────────────────
function openClassWiki(classId) {
  const map = {
    class_wizard:   'magic_prepared_vs_spontaneous',
    class_sorcerer: 'magic_prepared_vs_spontaneous',
    class_bard:     'magic_prepared_vs_spontaneous',
    class_rogue:    'skill_ranks',
    class_cleric:   'magic_dc',
    class_druid:    'magic_dc',
  };
  showTab('rules');
  wikiOpen(map[classId] || 'bab_formula');
}

// Legacy stubs
function buildClassWikiHtml() { return ''; }
function wikiRenderArticle(id) { wikiOpen(id); }
