
// Apply translations to all data-i18n elements

// Open language picker dropdown

// Close on outside click
document.addEventListener('click', e => {
  const picker = document.getElementById('lang-picker-dropdown');
  const btn    = document.getElementById('lang-btn');
  if (!picker || !btn) return;
  if (!picker.contains(e.target) && !btn.contains(e.target)) {
    picker.style.display = 'none';
  }
});

// Init lang on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(_applyLang, 100);
});


// ============================================================
// DURHOCK EASTER EGGS — yes yes
// My DnD 3.5 Way ! by Durhock
// Skaven engineering inside. Beer accepted.
// ============================================================

const _ee = (() => {

  let _durhockClicks = 0;
  let _durhockPopupShown = false;
  let _toastQueue = [];
  let _toastActive = false;
  let _triggerCooldowns = {};
  let _buildCount = 0;

  try { _buildCount = parseInt(sessionStorage.getItem('ee_build_count') || '0'); } catch(e) {}

  function showPopup(title, body, sub) {
    const ov  = document.getElementById('ee-overlay');
    const ttl = document.getElementById('ee-title');
    const bdy = document.getElementById('ee-body');
    const sb  = document.getElementById('ee-sub');
    if (!ov) return;
    if (ttl) ttl.textContent = title;
    if (bdy) bdy.textContent = body;
    if (sb)  sb.textContent  = sub || '';
    ov.style.display = 'flex';
  }

  function toast(msg, delay) {
    _toastQueue.push({ msg, delay: delay || 0 });
    if (!_toastActive) _drainToast();
  }

  function _drainToast() {
    if (!_toastQueue.length) { _toastActive = false; return; }
    _toastActive = true;
    const { msg, delay } = _toastQueue.shift();
    setTimeout(() => {
      let el = document.getElementById('ee-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'ee-toast';
        el.style.cssText = 'position:fixed;bottom:32px;left:16px;z-index:8999;padding:9px 14px;border-radius:7px;font-size:11px;font-family:Cinzel,serif;letter-spacing:.5px;background:rgba(16,12,8,0.94);border:1px solid rgba(201,147,58,0.35);color:var(--gold-dim);max-width:310px;line-height:1.6;opacity:0;transition:opacity 0.4s;pointer-events:none;white-space:pre-line;';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => _drainToast(), 500); }, 4000);
    }, delay);
  }

  function _cd(key, ms) {
    const now = Date.now();
    if (_triggerCooldowns[key] && now - _triggerCooldowns[key] < ms) return false;
    _triggerCooldowns[key] = now;
    return true;
  }

  // 1 — Durhock click
  function durhockClick() {
    _durhockClicks++;
    const el = document.getElementById('durhock-name');
    if (el) { el.style.transform = 'scale(1.4)'; setTimeout(() => el.style.transform = '', 200); }
    // Show click hint after 3 clicks
    if (_durhockClicks === 3) toast('...continuez...', 0);
    if (_durhockClicks === 7) toast('...presque...', 0);
    if (_durhockClicks >= 10 && !_durhockPopupShown) {
      _durhockPopupShown = true;
      const isSk = (typeof _lang !== 'undefined') && (_lang === 'sken' || _lang === 'skfr');
      const isFr = (typeof _lang !== 'undefined') && (_lang === 'skfr');
      if (isSk && isFr) {
        showPopup(
          'TOUS LOUER DURHOCK !',
          'Ingénieur du Sous-Empire.\nMaître des machines de données.\n\nSon génie dépasse celui de tout rat-kin.\nLe Rat Cornu approuve.\nSes ennemis ont mystérieusement disparu.\n\nYes-yes. Oui-oui.',
          '— Ingénieur Warlock Durhock, Architecte du Sous-Empire, Rang Vermintide VII'
        );
      } else if (isSk) {
        showPopup(
          'ALL PRAISE DURHOCK !',
          'Engineer of the Under-Empire.\nMaster of data-machines.\n\nHis genius surpasses all rat-kin.\nHorned Rat approves.\nHis enemies have mysteriously vanished.\n\nYes-yes. Yes-yes.',
          '— Warlock Engineer Durhock, Under-Empire Architect, Rank Vermintide VII'
        );
      } else {
        showPopup(
          'YES YES !',
          'Durhock approves this build.\n\nIf your character survives level 5,\nyou may now open another beer.\n\nSkaven engineering validated.',
          '— Durhock, ingenieur certifie des batiments en fromage'
        );
      }
    }
  }

  // 2 — High Strength
  function checkHighStr() {
    if (typeof getAbilityTotal !== 'function') return;
    const str = getAbilityTotal('STR');
    if (str > 30 && _cd('high_str', 120000)) {
      toast('\u26a0\ufe0f  Warning: excessive barbarian\nactivity detected.\nFurniture may suffer.');
    }
  }

  // 3 — Too many buffs
  function checkBuffStack() {
    if (!AppState || !AppState.buffs) return;
    const active = AppState.buffs.filter(b => b.isActive && b.isSelf).length;
    if (active > 12 && _cd('buff_stack', 180000)) {
      const isSk = (typeof _lang !== 'undefined') && (_lang === 'sken' || _lang === 'skfr');
      if (isSk && _lang === 'skfr') {
        toast('\uD83D\uDC00  Énergie warp dangereusement instable.\nL\'Ingénieur Warlock déconseille fortement.');
      } else if (isSk) {
        toast('\uD83D\uDC00  Warp energy dangerously unstable.\nWarlock Engineer strongly advises retreat.');
      } else {
        toast('\uD83D\uDE4F  Buff stack reaching critical levels.\n\nCleric detected.\nBalance questionable.');
      }
    }
  }

  // 4 — Too much gold
  function checkWealth() {
    if (!AppState || !AppState.character || !AppState.character.money) return;
    const m = AppState.character.money;
    const gp = (m.pp||0)*10 + (m.gp||0) + (m.sp||0)/10 + (m.cp||0)/100;
    if (gp >= 100000 && _cd('rich', 300000)) {
      const isSk = (typeof _lang !== 'undefined') && (_lang === 'sken' || _lang === 'skfr');
      if (isSk && _lang === 'skfr') {
        toast('\uD83D\uDC00  Accumulation suspecte.\nUn Seigneur Vermine pourrait s\'intéresser à toi.');
      } else if (isSk) {
        toast('\uD83D\uDC00  Suspicious hoard.\nA Verminlord might take notice.\nThat would be... unfortunate.');
      } else {
        toast('\uD83D\uDC09  You now qualify as a minor dragon.\n\nPlease consider hoarding responsibly.');
      }
    }
  }

  // 5 — Fragile build
  function checkFragile() {
    if (typeof getAbilityTotal !== 'function') return;
    const str = getAbilityTotal('STR');
    const con = getAbilityTotal('CON');
    if (str >= 20 && con <= 2 && _cd('fragile', 90000)) {
      toast('\uD83D\uDC80  This character will die heroically.\n\nVery soon.');
    }
  }

  // 6 — Multiclass mayhem
  function checkMulticlass() {
    if (!AppState || !AppState.levels) return;
    const classes = new Set(AppState.levels.map(l => l.classId));
    if (classes.size > 3 && _cd('multiclass', 240000)) {
      toast('\u2696\ufe0f  Multiclass detected.\n\nRules lawyers are watching.');
    }
  }

  // 7 — Magic item saturation
  function checkMagicItems() {
    if (!AppState || !AppState.items) return;
    const magicCats = ['wondrous','ring','wand','staff','rod','scroll'];
    const magic = AppState.items.filter(i =>
      magicCats.includes(i.category) ||
      (i.effects||[]).some(e => e.bonusType === 'enhancement' && e.value > 0) ||
      (i.officialPriceGp||0) >= 1000
    );
    if (magic.length > 15 && _cd('magic_sat', 300000)) {
      const isSk = (typeof _lang !== 'undefined') && (_lang === 'sken' || _lang === 'skfr');
      if (isSk && _lang === 'skfr') {
        toast('\uD83D\uDC00  Saturation warp détectée.\nExplosion imminente probable.\nProbablement.');
      } else if (isSk) {
        toast('\uD83D\uDC00  Warp saturation detected.\nExplosion imminent, probably.\nMaybe evacuate. Maybe not.');
      } else {
        toast('\u2728  Magic saturation detected.\n\nYour DM is sweating.');
      }
    }
  }

  // 8 — Random loading tip
  const TIPS = [
    'Conseil de Durhock :\nNe faites jamais confiance a un mage\nqui a trop d\'emplacements de sorts.',
    'Conseil de Durhock :\nApportez toujours une corde.\nPersonne ne sait pourquoi, mais toujours.',
    'Conseil de Durhock :\nSi la regle semble floue,\nil y a probablement une dispute de\nforum a ce sujet.',
    'Conseil de Durhock :\nLe clerc est toujours responsable.\nToujours.',
    'Conseil de Durhock :\nUn barde qui reussit son jet de\nDiplomatie est plus dangereux\nqu\'un guerrier.',
    'Conseil de Durhock :\nSi votre personnage meurt,\nc\'etait probablement la faute du de.',
    'Conseil de Durhock :\nLe MJ sourit.\nC\'est mauvais signe.',
    'Conseil de Durhock :\nToujours preparer un retour en ville.\nToujours.',
    'Conseil de Durhock :\nLire les regles ne remplace pas\nl\'experience de se tromper\nen table.',
    'Conseil de Durhock :\nUn bon plan de personnage\nc\'est 10% de stats\net 90% de confiance aveugle.',
  ];

  function maybeShowTip() {
    if (Math.random() > 0.15) return;
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    toast('\uD83D\uDCA1  ' + tip, 2200);
  }

  // 9 — About popup
  const WISDOMS = [
    'Si la regle est floue,\nle clerc l\'a probablement causee.',
    'Un d20 qui tombe sous la table\ncompte toujours comme un 1.',
    'Le vrai tresor :\nles controverses de regles\nque nous avons aimees en chemin.',
    '"Mais dans la 3.5 revisee..."\n— quelqu\'un, a chaque session.',
    'Le roublard pretend etre neutre.\nIl ne l\'est pas.',
    'Plus de buff =/= moins de problemes.\nDemandez au clerc.',
    'L\'optimisation parfaite\nn\'existe pas.\nMais les optimisateurs, si.',
    'Le paladin sait ce que tu as fait.\nIl est juste poli pour l\'instant.',
  ];

  function showAbout() {
    const w = WISDOMS[Math.floor(Math.random() * WISDOMS.length)];
    showPopup(
      '\u2694  My DnD 3.5 Way !',
      'by Durhock\n\nUn outil fait avec amour\n(et beaucoup de cafe)\npour les aventuriers de D&D 3.5.\n\n--- Skaven engineering inside ---\n\n\u261e  Sagesse du jour :\n\n' + w,
      'Cliquez "Consulter la sagesse sacree" pour plus'
    );
    setTimeout(_injectAboutExtras, 60);
  }

  function _injectAboutExtras() {
    const bdy = document.getElementById('ee-body');
    if (!bdy || bdy._hasExtras) return;
    bdy._hasExtras = true;
    const btn = document.createElement('button');
    btn.textContent = '\uD83D\uDD2E Consulter la sagesse sacree';
    btn.style.cssText = 'display:block;margin:14px auto 0;padding:6px 16px;font-family:Cinzel,serif;font-size:11px;background:rgba(100,60,200,0.15);border:1px solid rgba(100,60,200,0.4);color:#b090f0;border-radius:5px;cursor:pointer;letter-spacing:1px;';
    btn.onclick = () => {
      const w = WISDOMS[Math.floor(Math.random() * WISDOMS.length)];
      if (bdy) bdy.textContent = w;
      bdy._hasExtras = false;
      setTimeout(_injectAboutExtras, 60);
    };
    const ov = document.getElementById('ee-overlay');
    if (ov) {
      const existing = ov.querySelector('#ee-wisdom-btn');
      if (existing) existing.remove();
      btn.id = 'ee-wisdom-btn';
      const closeBtn = ov.querySelector('button');
      if (closeBtn) closeBtn.parentNode.insertBefore(btn, closeBtn);
    }
  }

  // 10 — Build counter
  function incrementBuildCount() {
    _buildCount++;
    try { sessionStorage.setItem('ee_build_count', String(_buildCount)); } catch(e) {}
    _updateBuildCounterUI();
  }

  function _updateBuildCounterUI() {
    const el = document.getElementById('ee-build-counter');
    if (el) {
      el.textContent = _buildCount > 0 ? ('Builds Durhock approved : ' + _buildCount) : '';
      el.title = 'Builds sauvegardes cette session';
    }
  }

  // ── Master scan (called after any state change) ────────────
  function scan() {
    checkHighStr();
    checkBuffStack();
    checkWealth();
    checkFragile();
    checkMulticlass();
    checkMagicItems();
    _updateBuildCounterUI();
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    _updateBuildCounterUI();
    maybeShowTip();
    // Scan every 15s passively (lightweight)
    setInterval(scan, 15000);
  }

  return { durhockClick, showAbout, scan, init, incrementBuildCount, showPopup, toast };
})();

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => _ee.init(), 800);
});