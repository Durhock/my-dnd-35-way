function renderAbout() {
  const el = document.getElementById('about-content');
  if (!el) return;

  el.innerHTML = `
  <div style="max-width:860px;margin:0 auto;padding-bottom:40px;">

    <!-- ── HERO ─────────────────────────────────────────── -->
    <div style="text-align:center;padding:40px 20px 32px;border-bottom:1px solid var(--border);margin-bottom:32px;">
      <div style="font-family:'Cinzel',serif;font-size:32px;font-weight:900;color:var(--gold-light);letter-spacing:4px;line-height:1.1;text-shadow:0 0 40px rgba(201,147,58,0.3);">
        My DnD 3.5 Way !
      </div>
      <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold-dim);letter-spacing:4px;margin-top:6px;">
        by Durhock
      </div>
      <div style="margin-top:16px;font-size:13px;color:var(--text-dim);font-style:italic;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.6;">
        Un outil pour D&amp;D 3.5 · A tool for D&amp;D 3.5
      </div>
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <span style="font-size:10px;padding:3px 10px;border-radius:10px;background:rgba(201,147,58,0.1);border:1px solid rgba(201,147,58,0.25);color:var(--gold-dim);font-family:'Cinzel',serif;letter-spacing:1px;">D&amp;D 3.5</span>
        <span style="font-size:10px;padding:3px 10px;border-radius:10px;background:rgba(100,150,220,0.1);border:1px solid rgba(100,150,220,0.25);color:#8899cc;font-family:'Cinzel',serif;letter-spacing:1px;">SRD</span>
        <span style="font-size:10px;padding:3px 10px;border-radius:10px;background:rgba(80,180,80,0.1);border:1px solid rgba(80,180,80,0.25);color:#80c080;font-family:'Cinzel',serif;letter-spacing:1px;">Open Source</span>
        <span style="font-size:10px;padding:3px 10px;border-radius:10px;background:rgba(180,80,180,0.1);border:1px solid rgba(180,80,180,0.25);color:#c080c0;font-family:'Cinzel',serif;letter-spacing:1px;">Skaven Engineering</span>
      </div>
    </div>

    <!-- ── BILINGUAL CONTENT ─────────────────────────────── -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:32px;">

      <!-- FR -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🇫🇷 &nbsp;FRANÇAIS</span>
        </div>
        <div class="panel-body" style="padding:18px;font-size:13px;color:var(--text-dim);line-height:1.75;">
          <p style="margin:0 0 14px;font-size:14px;color:var(--text-bright);font-weight:600;">My DnD 3.5 Way !</p>
          <p style="margin:0 0 12px;">Quand j'ai commencé Dungeons &amp; Dragons 3.5, j'ai passé plus de temps à chercher des règles qu'à jouer.</p>
          <p style="margin:0 0 8px;">Entre&nbsp;:</p>
          <ul style="margin:0 0 12px;padding-left:18px;display:flex;flex-direction:column;gap:3px;">
            <li>les forums vieux de 20 ans</li>
            <li>les wikis incomplets</li>
            <li>les discussions interminables sur les règles</li>
            <li>les guides dispersés</li>
          </ul>
          <p style="margin:0 0 12px;">…on finit vite avec 15 onglets ouverts et plusieurs PDFs.</p>
          <p style="margin:0 0 12px;">Le système D&amp;D 3.5 est génial, mais l'information est souvent éparpillée. Beaucoup de ressources commencent aussi à vieillir ou disparaître.</p>
          <p style="margin:0 0 8px;font-weight:600;color:var(--gold-dim);">L'idée est simple :</p>
          <p style="margin:0 0 12px;">Réunir au même endroit tout ce qu'il faut pour créer et jouer un personnage.</p>
          <p style="margin:0 0 8px;">Dans cet outil on peut trouver&nbsp;:</p>
          <ul style="margin:0 0 14px;padding-left:18px;display:flex;flex-direction:column;gap:3px;">
            <li>classes &amp; progressions</li>
            <li>dons</li>
            <li>sorts</li>
            <li>objets &amp; inventaire</li>
            <li>règles utiles</li>
            <li>création de personnage</li>
            <li>buffs</li>
            <li>wiki intégré</li>
          </ul>
          <p style="margin:0;font-size:12px;color:var(--text-dim);font-style:italic;">Bref : un point d'accès central pour D&amp;D 3.5.</p>
          <div style="margin-top:14px;padding:10px 12px;background:rgba(201,147,58,0.06);border-left:3px solid var(--gold-dim);border-radius:3px;font-size:11px;color:var(--text-dim);">
            Ce projet a été possible grâce à l'arrivée d'outils modernes et surtout à la montée en puissance de l'IA.
          </div>
        </div>
      </div>

      <!-- EN -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🇬🇧 &nbsp;ENGLISH</span>
        </div>
        <div class="panel-body" style="padding:18px;font-size:13px;color:var(--text-dim);line-height:1.75;">
          <p style="margin:0 0 14px;font-size:14px;color:var(--text-bright);font-weight:600;">My DnD 3.5 Way !</p>
          <p style="margin:0 0 12px;">When I first started Dungeons &amp; Dragons 3.5, I spent more time searching for rules than actually playing.</p>
          <p style="margin:0 0 8px;">Between:</p>
          <ul style="margin:0 0 12px;padding-left:18px;display:flex;flex-direction:column;gap:3px;">
            <li>20-year-old forums</li>
            <li>incomplete wikis</li>
            <li>endless rule debates</li>
            <li>scattered guides</li>
          </ul>
          <p style="margin:0 0 12px;">…you quickly end up with dozens of tabs and multiple PDFs open.</p>
          <p style="margin:0 0 12px;">D&amp;D 3.5 is an amazing system, but the information is often fragmented and difficult to navigate. Many resources are also aging or disappearing.</p>
          <p style="margin:0 0 8px;font-weight:600;color:var(--gold-dim);">The goal is simple:</p>
          <p style="margin:0 0 12px;">Gather in one place the information needed to build and play a character.</p>
          <p style="margin:0 0 8px;">This tool aggregates:</p>
          <ul style="margin:0 0 14px;padding-left:18px;display:flex;flex-direction:column;gap:3px;">
            <li>classes &amp; progressions</li>
            <li>feats</li>
            <li>spells</li>
            <li>items &amp; inventory</li>
            <li>useful rules</li>
            <li>character creation</li>
            <li>buffs</li>
            <li>integrated wiki</li>
          </ul>
          <p style="margin:0;font-size:12px;color:var(--text-dim);font-style:italic;">In short: a central entry point for D&amp;D 3.5.</p>
          <div style="margin-top:14px;padding:10px 12px;background:rgba(201,147,58,0.06);border-left:3px solid var(--gold-dim);border-radius:3px;font-size:11px;color:var(--text-dim);">
            This project was made possible thanks to modern tools and especially the rise of AI.
          </div>
        </div>
      </div>
    </div>

    <!-- ── CRÉATEUR ───────────────────────────────────────── -->
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-header">
        <span class="panel-title">⚔ &nbsp;CRÉATEUR / CREATOR</span>
      </div>
      <div class="panel-body" style="padding:20px;">
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(201,147,58,0.15);border:2px solid var(--gold-dim);display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0;">
            🐀
          </div>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:var(--gold-light);letter-spacing:2px;margin-bottom:4px;">Durhock</div>
            <div style="font-size:13px;color:var(--text-dim);margin-bottom:3px;font-style:italic;">
              Projet créé par Durhock — joueur de D&amp;D 3.5, amateur de règles complexes et maître Skaven autoproclamé.
            </div>
            <div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">
              Created by Durhock — D&amp;D 3.5 enthusiast, rule digger, and self-proclaimed Skaven master.
            </div>
            <a href="https://ko-fi.com/durhock" target="_blank" rel="noopener"
              style="display:inline-flex;align-items:center;gap:7px;padding:6px 14px;
                     background:rgba(255,94,91,0.08);border:1px solid rgba(255,94,91,0.25);
                     border-radius:6px;text-decoration:none;
                     font-size:11px;color:#ff8a87;font-family:'Cinzel',serif;letter-spacing:1px;
                     transition:background 0.2s;"
              onmouseenter="this.style.background='rgba(255,94,91,0.16)'"
              onmouseleave="this.style.background='rgba(255,94,91,0.08)'">
              ☕ Support the project — Ko-fi
            </a>
            <div style="margin-top:5px;font-size:10px;color:var(--text-dim);">
              <a href="https://ko-fi.com/durhock" target="_blank" rel="noopener"
                style="color:var(--text-dim);text-decoration:none;"
                onmouseenter="this.style.color='var(--gold)'" onmouseleave="this.style.color='var(--text-dim)'">
                ko-fi.com/durhock
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── SOUTIEN / SUPPORT ──────────────────────────────── -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">🍺 &nbsp;SOUTIEN (FR)</span></div>
        <div class="panel-body" style="padding:18px;font-size:13px;color:var(--text-dim);line-height:1.75;">
          <p style="margin:0 0 10px;">Si vous voulez soutenir le projet :</p>
          <ul style="margin:0 0 12px;padding-left:18px;list-style:none;">
            <li>🍺 une bière</li>
            <li>🍺🍺 ou deux bières</li>
            <li>🍺🍺🍺 ou trois bières</li>
          </ul>
          <p style="margin:0;font-size:12px;color:var(--gold-dim);font-style:italic;">Mais si on dépasse deux bières, prévois aussi des cacahuètes — j'aurai probablement faim.</p>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><span class="panel-title">🍺 &nbsp;SUPPORT (EN)</span></div>
        <div class="panel-body" style="padding:18px;font-size:13px;color:var(--text-dim);line-height:1.75;">
          <p style="margin:0 0 10px;">If you want to support the project:</p>
          <ul style="margin:0 0 12px;padding-left:18px;list-style:none;">
            <li>🍺 one beer</li>
            <li>🍺🍺 two beers</li>
            <li>🍺🍺🍺 or three beers</li>
          </ul>
          <p style="margin:0;font-size:12px;color:var(--gold-dim);font-style:italic;">But if we reach three beers, please also bring peanuts — I will probably be hungry.</p>
        </div>
      </div>
    </div>

    <!-- ── CONTACT ────────────────────────────────────────── -->
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-header"><span class="panel-title">✉ &nbsp;CONTACT</span></div>
      <div class="panel-body" style="padding:18px;display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
        <div style="font-size:13px;color:var(--text-dim);">
          <span style="color:var(--text-bright);font-weight:600;">Contact (FR) :</span>
          <a href="mailto:durhock@gmail.com" style="color:var(--gold);margin-left:8px;text-decoration:none;font-family:'Cinzel',serif;font-size:12px;">durhock@gmail.com</a>
        </div>
        <div style="font-size:13px;color:var(--text-dim);">
          <span style="color:var(--text-bright);font-weight:600;">Contact (EN):</span>
          <a href="mailto:durhock@gmail.com" style="color:var(--gold);margin-left:8px;text-decoration:none;font-family:'Cinzel',serif;font-size:12px;">durhock@gmail.com</a>
        </div>
      </div>
    </div>

    <!-- ── EASTER EGG BUTTON ──────────────────────────────── -->
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-header"><span class="panel-title">🔮 &nbsp;SAGESSE / WISDOM</span></div>
      <div class="panel-body" style="padding:18px;text-align:center;">
        <div id="about-wisdom-text" style="font-size:13px;color:var(--text-dim);font-style:italic;line-height:1.7;min-height:40px;margin-bottom:14px;">
          Cliquez pour consulter la sagesse sacrée de Durhock.<br>
          <span style="font-size:11px;color:var(--text-dim);">Click to consult the sacred wisdom of Durhock.</span>
        </div>
        <button onclick="_about_wisdom()"
          style="padding:8px 24px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:2px;background:rgba(100,60,200,0.12);border:1px solid rgba(100,60,200,0.35);color:#b090f0;border-radius:6px;cursor:pointer;transition:all 0.2s;"
          onmouseenter="this.style.background='rgba(100,60,200,0.2)'" onmouseleave="this.style.background='rgba(100,60,200,0.12)'">
          🔮 Consulter la sagesse sacrée
        </button>
        <div style="margin-top:8px;font-size:10px;color:var(--text-dim);font-style:italic;">Consult the sacred wisdom</div>
      </div>
    </div>

    <!-- ── LANGUAGE SWITCHER ────────────────────────────── -->
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-header"><span class="panel-title">🌍 LANGUE / LANGUAGE</span></div>
      <div class="panel-body" style="padding:18px;">
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:14px;">
          Choisissez la langue de l'interface.<br>
          <span style="font-size:11px;font-style:italic;">Choose the interface language.</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button onclick="setLang('fr')" class="lang-opt-big">🇫🇷 Français</button>
          <button onclick="setLang('en')" class="lang-opt-big">🇬🇧 English</button>
          <button onclick="setLang('de')" class="lang-opt-big">🇩🇪 Deutsch</button>
          <button onclick="setLang('zh')" class="lang-opt-big">🇨🇳 中文</button>
          <button onclick="setLang('ko')" class="lang-opt-big">🇰🇷 한국어</button>
          <button onclick="setLang('kl')" class="lang-opt-big" style="border-color:rgba(180,80,180,0.4);color:#c080c0;">⚔ tlhIngan</button>
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text-dim);font-style:italic;">
          Certains contenus (descriptions de sorts, règles) restent dans leur langue source.<br>
          Some content (spell descriptions, rules) remains in its source language.
        </div>
      </div>
    </div>

    <!-- ── DURHOCK CLICK ZONE ─────────────────────────────── -->
    <div style="text-align:center;padding:16px;color:var(--text-dim);">
      <span style="font-size:10px;font-family:'Cinzel',serif;letter-spacing:2px;">My DnD 3.5 Way !  ·  </span>
      <span id="about-durhock-click"
        style="font-size:10px;font-family:'Cinzel',serif;letter-spacing:2px;color:var(--gold-dim);cursor:pointer;transition:color 0.2s;"
        onmouseenter="this.style.color='var(--gold)'" onmouseleave="this.style.color='var(--gold-dim)'">
        by Durhock
      </span>
      <span style="font-size:10px;color:var(--text-dim);font-style:italic;margin-left:10px;">· yes yes ·</span>
    </div>

  </div>`;
}

// About wisdom helper
const _ABOUT_WISDOMS = [
  'Si la règle est floue,\nle clerc l\'a probablement causée.\n\nIf the rule is unclear,\nthe cleric probably caused it.',
  'Un d20 qui tombe sous la table\ncompte toujours comme un 1.\n\nA d20 that falls off the table\nalways counts as a 1.',
  'Le vrai trésor,\nc\'est les controverses de règles\nque nous avons aimées en chemin.\n\nThe real treasure\nwas the rule arguments\nwe made along the way.',
  '"Mais dans la 3.5 révisée..."\n— quelqu\'un, à chaque session.\n\n"But in the revised 3.5..."\n— someone, every session.',
  'Le roublard prétend être neutre.\nIl ne l\'est pas.\n\nThe rogue claims to be neutral.\nHe is not.',
  'Plus de buff ≠ moins de problèmes.\nDemandez au clerc.\n\nMore buffs ≠ fewer problems.\nAsk the cleric.',
  'L\'optimisation parfaite n\'existe pas.\nMais les optimisateurs, si.\n\nPerfect optimization doesn\'t exist.\nBut optimizers do.',
  'Le paladin sait ce que tu as fait.\nIl est juste poli pour l\'instant.\n\nThe paladin knows what you did.\nHe\'s just being polite for now.',
  'Toujours apporter une corde.\nPersonne ne sait pourquoi,\nmais toujours.\n\nAlways bring rope.\nNo one knows why,\nbut always.',
  'Ne jamais faire confiance\nà un magicien avec trop d\'emplacements.\n\nNever trust a wizard\nwith too many spell slots.',
];

let _aboutWisdomIdx = -1;
function _about_wisdom() {
  _aboutWisdomIdx = (_aboutWisdomIdx + 1) % _ABOUT_WISDOMS.length;
  const el = document.getElementById('about-wisdom-text');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s';
    el.textContent = _ABOUT_WISDOMS[_aboutWisdomIdx];
    el.style.opacity = '1';
  }, 200);
}