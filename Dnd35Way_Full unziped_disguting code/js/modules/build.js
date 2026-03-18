// ============================================================
// build.js — Construction et édition du personnage
//
// Responsabilités :
//   - wizard de création (BUILD wizard)
//   - édition des 7 pages BUILD (identité, race, carac, progression, dons, compétences, résumé)
//   - lecture des référentiels (RACE_DB, CLASS_REF, FEAT_DB) sans les modifier
//   - mutation de AppState.character, AppState.levels, AppState.feats
//
// Mutations AppState :
//   AppState.character.*       → identité, attributs, templates, ACFs
//   AppState.levels[]          → premier niveau (wizard)
//   AppState.feats[]           → dons sélectionnés
//
// Calculs délégués à rules.js :
//   getMod(), getAbilityTotal(), getBAB(), getTotalPointBuy(), pointBuyCost()
//
// SECTIONS :
//   1. UI state (wizard + build page nav)
//   2. Wizard de création
//   3. BUILD — Informations générales
//   4. BUILD — Race
//   5. BUILD — Caractéristiques
//   6. BUILD — Classes / Progression
//   7. BUILD — Dons
//   8. BUILD — Compétences (BUILD view, pas skills.js)
//   9. BUILD — Résumé
//  10. Journal
//  11. À Propos
// ============================================================

// ═══════════════════════════════════════════════════════════
// SECTION 1 — UI state
// ═══════════════════════════════════════════════════════════

let wizardStep = 0;
const wizardStepCount = 6;

const WIZARD_STEPS = [
  renderWizardIdentity,
  renderWizardRaceClass,
  renderWizardAbilities,
  renderWizardSkills,
  renderWizardFeats,
  renderWizardEquipment,
];

function gotoWizardStep(step) {
  wizardStep = step;
  const steps = document.querySelectorAll('.wizard-step');
  steps.forEach((s, i) => {
    s.classList.toggle('active', i === step);
    s.classList.toggle('done', i < step);
  });
  WIZARD_STEPS[step]();
}


// ═══════════════════════════════════════════════════════════
// SECTION 2 — Wizard de création
// ═══════════════════════════════════════════════════════════

function renderWizardIdentity() {
  const chr = AppState.character;
  document.getElementById('wizard-content').innerHTML = `
    <div class="creation-section">
      <div class="creation-section-title">IDENTITÉ DU PERSONNAGE</div>
      <div class="grid-2">
        <div class="form-group"><label data-i18n="lbl_name">NOM</label><input type="text" id="w-name" value="${chr.name}"></div>
        <div class="form-group">
          <label>ALIGNEMENT</label>
          <select id="w-alignment">
            ${['Loyal Bon','Neutre Bon','Chaotique Bon','Loyal Neutre','Neutre','Chaotique Neutre','Loyal Mauvais','Neutre Mauvais','Chaotique Mauvais'].map(a =>
              `<option ${chr.alignment === a ? 'selected' : ''}>${a}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group"><label>ÂGE</label><input type="number" id="w-age" value="${chr.age}" min="1"></div>
        <div class="form-group"><label>DIVINITÉ</label><input type="text" id="w-deity" value="${chr.deity || ''}"></div>
        <div class="form-group"><label>TAILLE (m)</label><input type="number" id="w-height" value="${chr.heightMeters}" step="0.01"></div>
        <div class="form-group"><label>POIDS (kg)</label><input type="number" id="w-weight" value="${chr.weightKg}" step="1"></div>
      </div>
      <div class="form-group"><label>LANGUES (séparées par des virgules)</label>
        <input type="text" id="w-languages" value="${chr.languages.join(', ')}">
      </div>
      <div class="form-group"><label>NOTES PERSONNELLES</label>
        <textarea id="w-notes" rows="3">${chr.notes}</textarea>
      </div>
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-primary" onclick="saveWizardIdentity()">Enregistrer & Continuer →</button>
    </div>
  `;
}

function saveWizardIdentity() {
  AppState.character.name = document.getElementById('w-name').value;
  AppState.character.alignment = document.getElementById('w-alignment').value;
  AppState.character.age = parseInt(document.getElementById('w-age').value) || 0;
  AppState.character.deity = document.getElementById('w-deity').value;
  AppState.character.heightMeters = parseFloat(document.getElementById('w-height').value) || 0;
  AppState.character.weightKg = parseFloat(document.getElementById('w-weight').value) || 0;
  AppState.character.languages = document.getElementById('w-languages').value.split(',').map(s=>s.trim()).filter(Boolean);
  AppState.character.notes = document.getElementById('w-notes').value;
  renderAll();
  gotoWizardStep(1);
}

function renderWizardRaceClass() {
  const chr = AppState.character;
  document.getElementById('wizard-content').innerHTML = `
    <div class="creation-section">
      <div class="creation-section-title">RACE</div>
      <div class="grid-3">
        ${[
          {id:'race_human', label:'Humain', bonus:'+1 don, +1 comp/nv', size:'M'},
          {id:'race_elf', label:'Elfe', bonus:'+2 DEX -2 CON', size:'M'},
          {id:'race_dwarf', label:'Nain', bonus:'+2 CON -2 CHA', size:'M'},
          {id:'race_halfling', label:'Halfelin', bonus:'+2 DEX -2 STR', size:'P'},
          {id:'race_half_orc', label:'Demi-Orc', bonus:'+2 STR -2 INT -2 CHA', size:'M'},
          {id:'race_gnome', label:'Gnome', bonus:'+2 CON -2 STR', size:'P'},
        ].map(r => `
          <div class="equip-slot ${chr.raceId === r.id ? 'filled' : ''}" onclick="changeRace('${r.id}')"
               style="cursor:pointer; text-align:center;">
            <div class="equip-slot-label">${r.size === 'P' ? 'Petit' : 'Moyen'}</div>
            <div class="equip-slot-item">${r.label}</div>
            <div class="equip-slot-bonus">${r.bonus}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="creation-section">
      <div class="creation-section-title">PREMIÈRE CLASSE</div>
      <div class="grid-3">
        ${Object.entries(CLASS_REF).map(([id, cls]) => `
          <div class="equip-slot" onclick="addFirstLevel('${id}')"
               style="cursor:pointer; text-align:center;">
            <div class="equip-slot-label">${cls.hitDie} — BBA ${cls.babProg}</div>
            <div class="equip-slot-item">${cls.name}</div>
            <div class="equip-slot-bonus">${cls.spPerLvl} comp/nv</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="gotoWizardStep(0)">← Retour</button>
      <button class="btn btn-primary" onclick="gotoWizardStep(2)">Continuer →</button>
    </div>
  `;
}

function changeRace(raceId) {
  const race = RACE_DB[raceId];
  if (!race) return;
  const chr = AppState.character;
  chr.raceId = raceId;

  // Reset all racial ability mods
  Object.keys(chr.abilityScores).forEach(ab => { chr.abilityScores[ab].racial = 0; });

  // Apply racial ability modifiers from DB
  Object.entries(race.abilityMods).forEach(([ab, val]) => {
    if (chr.abilityScores[ab]) chr.abilityScores[ab].racial = val;
  });

  // Size & speed
  chr.size = race.size;
  if (!chr.movement) chr.movement = {};
  chr.movement.land = race.speed;

  // Languages
  chr.languages = [...(race.autoLanguages || [])];

  autosave();
  selectedRacePreviewId = raceId;  // sync preview to newly applied race
  renderSheet();       // recalcule les totaux (FOR, taille, vitesse…)
  renderBuildRace();   // rafraîchit la liste + le panneau de détail immédiatement
  if (document.getElementById('ab-grid')) updateAbilitiesDisplay();
}

function addFirstLevel(classId) {
  if (AppState.levels.length === 0) {
    const cls = CLASS_REF[classId];
    AppState.levels.push({
      id: 'lvl_001',
      characterId: AppState.character.id,
      levelNumber: 1,
      classId,
      hitDie: `d${cls.hitDie}`,
      hpRolled: cls.hitDie, // Max au niv.1
      skillPointsGained: Math.max(1, cls.spPerLvl + getMod('INT')),
      abilityIncreaseApplied: false,
      featChosenId: null,
      classFeaturesGained: []
    });
    AppState.character.levelTotal = 1;
    AppState.character.hp.current = getHPMax();
  }
  renderAll();
  renderWizardRaceClass();
}

function renderWizardAbilities() {
  const chr = AppState.character;
  const totalCost = getTotalPointBuy();
  const budget = 25; // standard D&D 3.5
  const costColor = totalCost > budget ? 'var(--red)' : totalCost === budget ? 'var(--green)' : 'var(--gold)';

  // Table de coût point buy
  const costTable = [8,9,10,11,12,13,14,15,16,17,18].map(s =>
    `<span style="font-size:11px;color:var(--text-dim);">${s}=<strong style="color:var(--text-bright);">${pointBuyCost(s)}</strong></span>`
  ).join(' · ');

  document.getElementById('wizard-content').innerHTML = `
    <div class="creation-section">
      <div class="creation-section-title">CARACTÉRISTIQUES DE BASE</div>

      <!-- Point Buy tracker -->
      <div style="background:var(--bg3);border:1px solid ${costColor};border-radius:4px;padding:12px 16px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span class="cinzel" style="color:var(--gold);font-size:13px;letter-spacing:1px;">POINT BUY D&D 3.5</span>
          <span>
            <span style="font-size:24px;font-family:'Cinzel',serif;color:${costColor};font-weight:900;">${totalCost}</span>
            <span style="color:var(--text-dim);font-size:13px;"> / ${budget} pts</span>
            ${totalCost > budget ? '<span style="color:var(--red);font-size:11px;margin-left:6px;">⚠ Dépassé</span>' : ''}
            ${totalCost === budget ? '<span style="color:var(--green);font-size:11px;margin-left:6px;">✓ Standard</span>' : ''}
          </span>
        </div>
        <div style="background:var(--bg4);border-radius:3px;height:6px;margin-bottom:8px;overflow:hidden;">
          <div style="height:100%;width:${Math.min(100, totalCost/budget*100)}%;background:${costColor};transition:width 0.3s;border-radius:3px;"></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${costTable}</div>
        <div class="small text-dim" style="margin-top:6px;">Budget standard = 25 pts · Héroïque = 32 pts · Epic = 36 pts</div>
      </div>

      <div class="info-box" style="margin-bottom:12px;">Entrez les valeurs brutes (avant bonus raciaux). Les bonus raciaux sont appliqués automatiquement selon la race choisie.</div>
      <div class="grid-3">
        ${Object.entries(chr.abilityScores).map(([ab, scores]) => {
          const names = { STR:'Force', DEX:'Dextérité', CON:'Constitution', INT:'Intelligence', WIS:'Sagesse', CHA:'Charisme' };
          const total = getAbilityTotal(ab);
          const mod = getMod(ab);
          const cost = pointBuyCost(scores.base);
          return `
            <div class="ability-card" style="position:relative;">
              <div class="ability-label">${names[ab]}</div>
              <div class="ability-label" style="font-size:10px;color:var(--text-dim);">${ab}</div>
              <input type="number" value="${scores.base}" min="8" max="18"
                style="font-size:28px;text-align:center;font-family:'Cinzel',serif;color:var(--gold);background:transparent;border:none;border-bottom:2px solid var(--gold-dim);width:80px;margin:8px auto 4px;display:block;"
                onchange="setAbilityBase('${ab}', this.value)">
              <div class="ability-mod" style="margin-top:4px;">= ${total} <span style="color:${mod >= 0 ? 'var(--green)' : 'var(--red)'};">(${mod >= 0 ? '+' : ''}${mod})</span></div>
              ${scores.racial !== 0 ? `<div class="small text-dim">racial: ${scores.racial > 0 ? '+' : ''}${scores.racial}</div>` : ''}
              <div style="margin-top:6px;font-size:11px;color:var(--gold-dim);">Coût : <strong style="color:var(--gold);">${cost} pt${cost !== 1 ? 's' : ''}</strong></div>
              <!-- Bonus temp manuel -->
              <div style="margin-top:6px;display:flex;align-items:center;gap:4px;justify-content:center;">
                <span class="small text-dim">Temp :</span>
                <input type="number" value="${scores.tempBonus || 0}"
                  style="width:46px;text-align:center;font-size:12px;padding:1px 3px;background:${(scores.tempBonus||0) !== 0 ? 'rgba(201,147,58,0.15)' : 'var(--bg4)'};border:1px solid ${(scores.tempBonus||0) !== 0 ? 'var(--gold)' : 'var(--border)'};border-radius:3px;color:var(--text-bright);"
                  onchange="setAbilityTempBonus('${ab}', this.value)"
                  title="Bonus/malus temporaire (sort, blessure, poison...)">
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="gotoWizardStep(1)">← Retour</button>
      <button class="btn btn-primary" onclick="gotoWizardStep(3)">Continuer →</button>
    </div>
  `;
}

function setAbilityBase(ab, val) {
  AppState.character.abilityScores[ab].base = parseInt(val) || 10;
  renderSheet();       // update sheet values
  renderWizardAbilities();      // update wizard if open
  // Don't call renderAll() - would rebuild the abilities page and lose focus
}

function setAbilityTempBonus(ab, val) {
  AppState.character.abilityScores[ab].tempBonus = parseInt(val) || 0;
  renderSheet();
  renderWizardAbilities();
}

function renderWizardSkills() {
  document.getElementById('wizard-content').innerHTML = `
    <div class="creation-section">
      <div class="creation-section-title">COMPÉTENCES INITIALES</div>
      <div class="info-box">Allez dans l'onglet Compétences pour gérer les rangs en détail.</div>
      <p class="text-dim small">Les compétences peuvent être configurées dans l'onglet dédié. Cliquez Continuer pour passer aux dons.</p>
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="gotoWizardStep(2)">← Retour</button>
      <button class="btn btn-primary" onclick="gotoWizardStep(4)">Continuer →</button>
    </div>
  `;
}

function renderWizardFeats() {
  document.getElementById('wizard-content').innerHTML = `
    <div class="creation-section">
      <div class="creation-section-title">DONS INITIAUX</div>
      <div class="info-box">Les humains reçoivent un don supplémentaire au niveau 1. Dons disponibles aux niveaux 1, 3, 6, 9, 12, 15, 18.</div>
      <div class="form-group">
        <label>AJOUTER UN DON</label>
        <div style="display:flex; gap:8px;">
          <select id="w-feat-select" style="flex:1">
            <option value="feat_power_attack">Power Attack (PRÉ: FOR 13)</option>
            <option value="feat_cleave">Cleave (PRÉ: Power Attack)</option>
            <option value="feat_weapon_focus">Weapon Focus</option>
            <option value="feat_combat_casting">Combat Casting</option>
            <option value="feat_improved_initiative">Improved Initiative (+4 init)</option>
            <option value="feat_toughness">Toughness (+3 PV)</option>
            <option value="feat_spell_focus">Spell Focus</option>
            <option value="feat_augment_summoning">Augment Summoning</option>
            <option value="feat_extra_turning">Extra Turning</option>
          </select>
          <button class="btn btn-primary btn-small" onclick="addWizardFeat()">Ajouter</button>
        </div>
      </div>
      <div id="w-feat-list" class="mt-8">
        ${AppState.feats.map(f => `
          <div class="item-row">
            <span class="item-name">${f.id.replace('feat_','').replace(/_/g,' ')}</span>
            <button class="btn btn-danger btn-small" onclick="removeWizardFeat('${f.id}')">×</button>
          </div>
        `).join('') || '<div class="text-dim small">Aucun don</div>'}
      </div>
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="gotoWizardStep(3)">← Retour</button>
      <button class="btn btn-primary" onclick="gotoWizardStep(5)">Continuer →</button>
    </div>
  `;
}

function addWizardFeat() {
  const id = document.getElementById('w-feat-select').value;
  if (!AppState.feats.find(f => f.id === id)) {
    AppState.feats.push({ id, name: id.replace('feat_','').replace(/_/g,' ') });
  }
  renderWizardFeats();
}

function removeWizardFeat(id) {
  AppState.feats = AppState.feats.filter(f => f.id !== id);
  renderWizardFeats();
}

function renderWizardEquipment() {
  document.getElementById('wizard-content').innerHTML = `
    <div class="creation-section">
      <div class="creation-section-title">ÉQUIPEMENT DE DÉPART</div>
      <div class="info-box">Ajoutez l'équipement de départ. Utilisez aussi le module Inventaire pour un contrôle complet.</div>
      <div class="grid-2">
        <div>
          <div class="panel-title mb-8">ARMES RAPIDES</div>
          ${[
            {id:'item_longsword_1', name:'Épée longue', cat:'weapon', sub:'one_handed', slot:'main_hand', wData:{attackBonus:0,damageBonus:0,damageMedium:'1d8',critical:'19-20/×2',damageType:['tranchant']}},
            {id:'item_morningstar_1', name:'Masse d\'armes', cat:'weapon', sub:'one_handed', slot:'main_hand', wData:{attackBonus:0,damageBonus:0,damageMedium:'1d8',critical:'×2',damageType:['contondant','perforant']}},
            {id:'item_heavy_crossbow', name:'Arbalète lourde', cat:'weapon', sub:'ranged', slot:'main_hand', wData:{attackBonus:0,damageBonus:0,damageMedium:'1d10',critical:'19-20/×2',damageType:['perforant']}},
          ].map(w => `
            <div class="item-row">
              <span class="item-name">${w.name}</span>
              <button class="btn btn-primary btn-small" onclick='addQuickItem(${JSON.stringify(w)})'>Ajouter</button>
            </div>
          `).join('')}
        </div>
        <div>
          <div class="panel-title mb-8">ARMURES RAPIDES</div>
          ${[
            {id:'item_chain_mail', name:'Cotte de mailles', cat:'armor', sub:'medium_armor', slot:'armor', aData:{armorBonus:5, maxDex:2, armorCheckPenalty:-5, speed30:20}},
            {id:'item_full_plate', name:'Harnois', cat:'armor', sub:'heavy_armor', slot:'armor', aData:{armorBonus:8, maxDex:1, armorCheckPenalty:-6, speed30:20}},
            {id:'item_leather', name:'Armure de cuir', cat:'armor', sub:'light_armor', slot:'armor', aData:{armorBonus:2, maxDex:6, armorCheckPenalty:0, speed30:30}},
            {id:'item_shield_heavy', name:'Bouclier en acier', cat:'armor', sub:'shield', slot:'shield', aData:{armorBonus:2, maxDex:99, armorCheckPenalty:-2}},
          ].map(a => `
            <div class="item-row">
              <span class="item-name">${a.name}</span>
              <button class="btn btn-primary btn-small" onclick='addQuickItem(${JSON.stringify(a)})'>Ajouter</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="creation-section">
      <div class="creation-section-title" style="color:var(--green);">✓ PERSONNAGE CRÉÉ</div>
      <p class="text-dim small mb-12">Votre personnage est prêt. Accédez aux différents modules pour le compléter.</p>
      <button class="btn btn-primary" onclick="showTab('sheet')" style="font-size:14px; padding:12px 28px;">
        Aller à la Fiche Personnage →
      </button>
    </div>
  `;
}

function addQuickItem(itemData) {
  if (AppState.inventory.find(i => i.id === itemData.id)) return;
  const item = {
    id: itemData.id,
    name: itemData.name,
    category: itemData.cat,
    subcategory: itemData.sub,
    slot: itemData.slot,
    equipped: true,
    quantity: 1,
    weightKg: 0,
    valueGp: 0,
    description: '',
    effects: [],
    weaponData: itemData.wData || null,
    armorData: itemData.aData || null
  };
  AppState.inventory.push(item);
  renderAll();
}

// ============================================================
// RENDU — JOURNAL
// ============================================================

function renderLog() {
  const container = document.getElementById('log-entries');
  container.innerHTML = '';
  if (AppState.log.length === 0) {
    container.innerHTML = '<div class="text-dim small text-center" style="padding:20px">Aucune entrée de journal</div>';
    return;
  }
  [...AppState.log].reverse().forEach(entry => {
    const div = document.createElement('div');
    div.className = 'rule-card mb-8';
    div.innerHTML = `
      <div class="flex-between mb-4">
        <span class="small text-dim cinzel">${entry.date}</span>
        <button class="btn btn-danger btn-small" onclick="removeLogEntry('${entry.id}')">×</button>
      </div>
      <div>${entry.text}</div>
    `;
    container.appendChild(div);
  });
}

// ============================================================
// BUILD CHARACTER — NAVIGATION & RENDER
// ============================================================
let currentBuildPage = 'concept';

function showBuildPage(pageId) {
  currentBuildPage = pageId;
  document.querySelectorAll('.build-page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.build-tab').forEach(b => b.classList.remove('active'));
  const pageEl = document.getElementById('build-page-' + pageId);
  const btnEl  = document.getElementById('bnt-' + pageId);
  if (pageEl) pageEl.classList.remove('hidden');
  if (btnEl)  btnEl.classList.add('active');
  // Render the selected sub-page
  if      (pageId === 'concept')       renderBuildConcept();
  else if (pageId === 'generalinfo')   renderBuildGeneralInfo();
  else if (pageId === 'race')          renderBuildRace();
  else if (pageId === 'classlibrary')  renderBuildClassLibrary();
  else if (pageId === 'abilities')     renderBuildAbilities();
  else if (pageId === 'progression')   renderBuildProgression();
  else if (pageId === 'feats')         renderBuildFeats();
  else if (pageId === 'skills')        renderSkills();
  else if (pageId === 'summary')       renderBuildSummary();
}

// ── 1. INFOS GÉNÉRALES ─────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
// SECTION 3 — BUILD : Informations générales
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// SECTION — BUILD : Concept RP
// ═══════════════════════════════════════════════════════════

function renderBuildConcept() {
  const el = document.getElementById('build-page-concept');
  if (!el) return;
  // Always rebuild — fields restore from AppState on each render
  const c = AppState.character.concept || {};

  // ── Synthèse RP (générée) ──────────────────────────────
  const _rp = _generateConceptNarrative(c);

  el.innerHTML = `
    <div style="max-width:820px;margin:0 auto;">

      <!-- ═══ INTRO ═══ -->
      <div style="margin-bottom:14px;">
        <div class="cinzel" style="color:var(--gold);font-size:16px;letter-spacing:2px;">🎭 CONCEPT DU PERSONNAGE</div>
        <div class="small text-dim" style="margin-top:3px;">Champs purement narratifs — aide à la définition de la personnalité et du roleplay. Aucun impact mécanique.</div>
      </div>

      <!-- ═══ BLOC 1 — ARCHÉTYPE & ESSENCE ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🌟 ARCHÉTYPE &amp; ESSENCE</span></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label style="font-size:10px;">ARCHÉTYPE</label>
            <textarea id="concept-archetype" rows="3" style="font-size:12px;resize:vertical;width:100%;" placeholder="chevalier déchu, prêtre errant, érudit obsédé…" oninput="(AppState.character.concept=AppState.character.concept||{}).archetype=this.value;autosave();">${c.archetype||''}</textarea>
            <div class="small text-dim" style="margin-top:3px;font-size:10px;">chevalier déchu · prêtre errant · voleur des rues · érudit obsédé</div>
          </div>
          <div class="form-group">
            <label style="font-size:10px;">NOM HÉROÏQUE / SURNOM</label>
            <input type="text" id="concept-heroName" value="${c.heroName||''}" placeholder="Kael le Gris, La Lame des Ombres…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).heroName=this.value;autosave();">
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label style="font-size:10px;">COMMENT LES AUTRES DÉCRIVENT CE PERSONNAGE</label>
            <input type="text" id="concept-howSeen" value="${c.howSeen||''}" placeholder="courageux mais imprévisible, silencieux et observateur…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).howSeen=this.value;autosave();">
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 2 — FAILLES & MOTEUR ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">⚡ FAILLES &amp; MOTEUR</span></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label style="font-size:10px;">DÉFAUT PRINCIPAL</label>
            <textarea id="concept-mainFlaw" rows="3" style="font-size:12px;resize:vertical;width:100%;" placeholder="arrogance, naïveté, colère…" oninput="(AppState.character.concept=AppState.character.concept||{}).mainFlaw=this.value;autosave();">${c.mainFlaw||''}</textarea>
          </div>
          <div class="form-group">
            <label style="font-size:10px;">TENTATION PRINCIPALE</label>
            <input type="text" id="concept-temptation" value="${c.temptation||''}" placeholder="pouvoir, vengeance, connaissance, richesse…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).temptation=this.value;autosave();">
            <div class="small text-dim" style="margin-top:3px;font-size:10px;">Ce qui pourrait le faire trébucher ou le corrompre</div>
          </div>
          <div class="form-group">
            <label style="font-size:10px;">PEUR OU FAIBLESSE</label>
            <textarea id="concept-fear" rows="3" style="font-size:12px;resize:vertical;width:100%;" placeholder="peur de l'échec, peur du feu, culpabilité…" oninput="(AppState.character.concept=AppState.character.concept||{}).fear=this.value;autosave();">${c.fear||''}</textarea>
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 3 — PSYCHOLOGIE ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🧠 PSYCHOLOGIE</span></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group" style="grid-column:1/-1;">
            <label style="font-size:10px;">QUE VEUT VRAIMENT CE PERSONNAGE ?</label>
            <input type="text" id="concept-deepWish" value="${c.deepWish||''}" placeholder="être reconnu, protéger les siens, trouver la paix…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).deepWish=this.value;autosave();">
            <div class="small text-dim" style="margin-top:3px;font-size:10px;">Désir profond, au-delà de l'objectif déclaré</div>
          </div>
          <div class="form-group">
            <label style="font-size:10px;">CE QU'IL REGRETTE LE PLUS</label>
            <input type="text" id="concept-regret" value="${c.regret||''}" placeholder="une trahison, un abandon, un échec passé…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).regret=this.value;autosave();">
          </div>
          <div class="form-group">
            <label style="font-size:10px;">CE QUI POURRAIT LE FAIRE CHANGER DE CAMP</label>
            <input type="text" id="concept-wouldChange" value="${c.wouldChange||''}" placeholder="la mort d'un proche, une révélation, une trahison…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).wouldChange=this.value;autosave();">
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label style="font-size:10px;">OBJECTIF PERSONNEL</label>
            <textarea id="concept-goal" rows="3" style="font-size:12px;resize:vertical;width:100%;" placeholder="retrouver un artefact, prouver sa valeur, reconstruire un ordre…" oninput="(AppState.character.concept=AppState.character.concept||{}).goal=this.value;autosave();">${c.goal||''}</textarea>
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 4 — RELATIONS ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🤝 RELATIONS</span></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
          <div class="form-group">
            <label style="font-size:10px;">ALLIÉ PRINCIPAL</label>
            <input type="text" id="concept-ally" value="${c.ally||''}" placeholder="nom, lien…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).ally=this.value;autosave();">
          </div>
          <div class="form-group">
            <label style="font-size:10px;">ENNEMI PERSONNEL</label>
            <input type="text" id="concept-enemy" value="${c.enemy||''}" placeholder="nom, raison…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).enemy=this.value;autosave();">
          </div>
          <div class="form-group">
            <label style="font-size:10px;">PERSONNE PROTÉGÉE</label>
            <input type="text" id="concept-protects" value="${c.protects||''}" placeholder="famille, élève, inconnu…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).protects=this.value;autosave();">
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 5 — SYMBOLIQUE ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🌀 SYMBOLIQUE</span></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
          <div class="form-group">
            <label style="font-size:10px;">SI CE PERSONNAGE ÉTAIT UN ANIMAL</label>
            <input type="text" id="concept-animalSelf" value="${c.animalSelf||''}" placeholder="loup solitaire, corbeau observateur…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).animalSelf=this.value;autosave();">
          </div>
          <div class="form-group">
            <label style="font-size:10px;">OBJET FÉTICHE</label>
            <input type="text" id="concept-fetish" value="${c.fetish||''}" placeholder="médaillon, dague, livre…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).fetish=this.value;autosave();">
          </div>
          <div class="form-group">
            <label style="font-size:10px;">PHRASE TYPIQUE</label>
            <input type="text" id="concept-typicalLine" value="${c.typicalLine||''}" placeholder="Ce que ce personnage dit souvent…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).typicalLine=this.value;autosave();">
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 6 — HABITUDES ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🔄 HABITUDES</span></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label style="font-size:10px;">EXPRESSION OU TIC</label>
            <textarea id="concept-expression" rows="3" style="font-size:12px;resize:vertical;width:100%;" placeholder="cite son dieu, parle trop, marmonne…" oninput="(AppState.character.concept=AppState.character.concept||{}).expression=this.value;autosave();">${c.expression||''}</textarea>
          </div>
          <div class="form-group">
            <label style="font-size:10px;">TIC OU MANIE</label>
            <input type="text" id="concept-habit" value="${c.habit||''}" placeholder="fait tourner une pièce, vérifie ses armes avant de dormir…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).habit=this.value;autosave();">
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label style="font-size:10px;">RITUEL QUOTIDIEN</label>
            <input type="text" id="concept-ritual" value="${c.ritual||''}" placeholder="prière à l'aube, méditation, nettoyage de ses armes…" style="font-size:12px;"
              oninput="(AppState.character.concept=AppState.character.concept||{}).ritual=this.value;autosave();">
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 7 — NOTES LIBRES ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">📝 NOTES D'INTERPRÉTATION</span></div>
        <div class="panel-body">
          <textarea id="concept-notes" rows="8" style="width:100%;font-size:12px;resize:vertical;"
            placeholder="Notes libres, idées de roleplay, scènes envisagées, axes narratifs…"
            oninput="(AppState.character.concept=AppState.character.concept||{}).extraNotes=this.value;autosave();">${c.extraNotes||''}</textarea>
        </div>
      </div>

      <!-- ═══ BLOC 8 — QUESTIONS RP ═══ -->
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">💡 QUESTIONS D'INTERPRÉTATION</span></div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${[
              'Que pense ce personnage des lois et de l\u2019autorit\u00e9\u00a0?',
              'Comment r\u00e9agit-il face \u00e0 l\u2019injustice ou la souffrance d\u2019autrui\u00a0?',
              'Comment traite-t-il les inconnus qu\u2019il rencontre pour la premi\u00e8re fois\u00a0?',
              'A-t-il des loyaut\u00e9s qui pourraient entrer en conflit avec le groupe\u00a0?',
              'Qu\u2019est-ce qui pourrait le faire douter ou changer de camp\u00a0?',
              'Quels sont ses rites ou habitudes quotidiennes en aventure\u00a0?',
              'Comment r\u00e9agit-il face \u00e0 la mort d\u2019un alli\u00e9\u00a0?',
              'Qu\u2019est-ce qu\u2019il refuse absolument de faire, quelles que soient les circonstances\u00a0?',
              'Quel mensonge se raconte-t-il sur lui-m\u00eame\u00a0?',
              'Qu\u2019est-ce qui le fait vraiment rire ou sourire\u00a0?'
            ].map(q => `<div style="background:var(--bg3);border-left:3px solid var(--gold-dim);padding:10px 14px;border-radius:0 5px 5px 0;font-size:12px;color:var(--text-dim);font-style:italic;line-height:1.5;">${q}</div>`).join('')}
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 9 — SYNTHÈSE RP ═══ -->
      <div class="panel mb-14" style="border-color:var(--gold-dim);">
        <div class="panel-header" style="background:rgba(201,147,58,0.06);">
          <span class="panel-title cinzel" style="color:var(--gold-light);letter-spacing:1px;">🎭 SYNTHÈSE NARRATIVE</span>
          <span class="small text-dim">générée automatiquement depuis vos champs</span>
        </div>
        <div class="panel-body">
          ${_rp
            ? `<div style="font-size:13px;color:var(--text-dim);line-height:1.9;font-style:italic;">${_rp}</div>`
            : '<div class="small text-dim">Remplissez les champs ci-dessus pour générer une synthèse narrative.</div>'}
        </div>
      </div>

    </div>
  `;
}

function _generateConceptNarrative(c) {
  if (!c) return '';
  const parts = [];

  // Archétype
  if (c.archetype) {
    const heroStr = c.heroName ? `, connu sous le nom de <em>${c.heroName}</em>,` : '';
    parts.push(`Ce personnage est un(e) <strong>${c.archetype}</strong>${heroStr}.`);
  } else if (c.heroName) {
    parts.push(`Connu(e) sous le nom de <em>${c.heroName}</em>.`);
  }

  // Comment vu par les autres
  if (c.howSeen) parts.push(`Aux yeux des autres, il apparaît comme <em>${c.howSeen}</em>.`);

  // Failles
  const flawParts = [];
  if (c.mainFlaw)   flawParts.push(`son ${c.mainFlaw}`);
  if (c.temptation) flawParts.push(`une tentation pour ${c.temptation}`);
  if (c.fear)       flawParts.push(`une peur profonde : ${c.fear}`);
  if (flawParts.length) parts.push(`Ses failles le définissent autant que ses forces : ${flawParts.join(', ')}.`);

  // Psychologie
  if (c.deepWish) parts.push(`Ce qu'il veut vraiment, au fond, c'est <em>${c.deepWish}</em>.`);
  if (c.regret)   parts.push(`Il porte le regret de <em>${c.regret}</em>.`);
  if (c.goal)     parts.push(`Son objectif déclaré est de <em>${c.goal}</em>.`);

  // Relations
  const relParts = [];
  if (c.ally)     relParts.push(`il peut compter sur ${c.ally}`);
  if (c.enemy)    relParts.push(`il considère ${c.enemy} comme un ennemi`);
  if (c.protects) relParts.push(`il veille sur ${c.protects}`);
  if (relParts.length) parts.push(`Sur le plan des relations : ${relParts.join(' ; ')}.`);

  // Symbolique
  if (c.animalSelf && c.fetish) {
    parts.push(`Si on devait le comparer à un animal, ce serait un(e) <em>${c.animalSelf}</em>. Il porte toujours avec lui <em>${c.fetish}</em>.`);
  } else if (c.animalSelf) {
    parts.push(`Si on devait le comparer à un animal, ce serait un(e) <em>${c.animalSelf}</em>.`);
  } else if (c.fetish) {
    parts.push(`Il ne se déplace jamais sans <em>${c.fetish}</em>.`);
  }

  // Phrase typique
  if (c.typicalLine) parts.push(`On l'entend souvent dire : <em>"${c.typicalLine}"</em>`);

  // Habitudes
  if (c.ritual && c.habit) {
    parts.push(`Chaque jour, il s'accorde un rituel : <em>${c.ritual}</em>. Et on le reconnaît à cette habitude : <em>${c.habit}</em>.`);
  } else if (c.ritual) {
    parts.push(`Chaque jour, il s'accorde un rituel : <em>${c.ritual}</em>.`);
  } else if (c.habit) {
    parts.push(`On le reconnaît à cette habitude : <em>${c.habit}</em>.`);
  }

  // Pivot narratif
  if (c.wouldChange) parts.push(`Ce qui pourrait tout changer : <em>${c.wouldChange}</em>.`);

  return parts.join(' ');
}


function renderBuildGeneralInfo() {
  const chr = AppState.character;
  const nfo = chr.info || {};
  const el  = document.getElementById('build-page-generalinfo');
  if (!el) return;

  // ── IMC + IMG ────────────────────────────────────────────────
  const h      = parseFloat(chr.heightMeters) || 1.75;
  const w      = parseFloat(chr.weightKg)     || 70;
  const age    = parseInt(chr.age) || 25;
  const gender = chr.gender || '';
  const imcVal = h > 0 ? w / (h * h) : 0;
  const imc    = imcVal > 0 ? imcVal.toFixed(1) : '—';

  // IMG — Deurenberg 1991 : (1.20×IMC) + (0.23×Age) − (10.8×sexe) − 5.4
  // sexe : 1 = homme, 0 = femme
  let imgStr = '—';
  let imgNote = '';
  if (imcVal > 0 && gender) {
    const sexeNum = gender === 'M' ? 1 : 0;
    const imgVal  = (1.20 * imcVal) + (0.23 * age) - (10.8 * sexeNum) - 5.4;
    imgStr  = imgVal.toFixed(1) + ' %';
    // Classification IMG
    if (gender === 'M') {
      imgNote = imgVal < 8 ? 'insuffisant' : imgVal < 18 ? 'athlétique' : imgVal < 25 ? 'normal' : imgVal < 32 ? 'surpoids' : 'obèse';
    } else {
      imgNote = imgVal < 13 ? 'insuffisant' : imgVal < 25 ? 'athlétique' : imgVal < 32 ? 'normal' : imgVal < 38 ? 'surpoids' : 'obèse';
    }
  } else if (imcVal > 0) {
    imgStr = '— (indiquer le sexe)';
  }

  const CORP_AUTO = imcVal < 18  ? 'frêle'
    : imcVal < 21 ? 'mince'
    : imcVal < 25 ? 'athlétique'
    : imcVal < 30 ? 'robuste'
    : imcVal < 35 ? 'corpulent' : 'massif';
  const corpulence  = nfo.corpulence || CORP_AUTO;
  const CORP_OPTS   = ['frêle','mince','athlétique','robuste','corpulent','massif'];
  const corpSelOpts = CORP_OPTS.map(c =>
    `<option value="${c}" ${corpulence===c?'selected':''}>${c}</option>`
  ).join('');

  // ── Divinités PHB ───────────────────────────────────────────
  const DEITIES = [
    ['Pelor',          'NB',  'Soleil, Guérison'],
    ['Héironéous',     'LB',  'Justice, Valeur'],
    ['Hextor',         'LM',  'Tyrannie, Guerre'],
    ['Saint Cuthbert', 'LN',  'Raison, Dévotion'],
    ['Ehlonna',        'NB',  'Forêts, Nature'],
    ['Obad-Haï',       'N',   'Nature, Tempêtes'],
    ['Corellon Larethian','CB','Elfes, Magie'],
    ['Moradin',        'LB',  'Nains, Artisanat'],
    ['Yondalla',       'LB',  'Halfelins, Protection'],
    ['Boccob',         'N',   'Magie, Équilibre'],
    ['Wee Jas',        'LN',  'Mort, Magie'],
    ['Vecna',          'NM',  'Secrets, Non-mort'],
    ['Nerull',         'NM',  'Mort, Obscurité'],
    ['Gruumsh',        'CM',  'Orques, Pillage'],
    ['Lolth',          'CM',  'Araignées, Mensonges'],
  ];
  const deityListId = 'deities-list';
  const deity2ListId = 'deities-list-2';
  const deityOpts  = DEITIES.map(([n,a,d]) => `<option value="${n}">${n} — ${a} — ${d}</option>`).join('');
  const deity2Opts = `<option value="">— aucune —</option>` + DEITIES.map(([n,a,d]) => `<option value="${n}">${n} — ${a} — ${d}</option>`).join('');

  // ── Alignement ──────────────────────────────────────────────
  const LAW_OPTS   = ['Loyal','Neutre','Chaotique'];
  const MORAL_OPTS = ['Bon','Neutre','Mauvais'];
  const alignLaw   = chr.alignmentLaw   || 'Neutre';
  const alignMoral = chr.alignmentMoral || 'Bon';
  const alignFull  = (alignLaw === 'Neutre' && alignMoral === 'Neutre') ? 'Neutre Vrai' : `${alignLaw} ${alignMoral}`;

  const lawBtns = LAW_OPTS.map(v => {
    const active = alignLaw === v ? ' btn-primary' : ' btn-secondary';
    return `<button class="btn btn-small${active}" style="flex:1;font-size:11px;"
      onclick="AppState.character.alignmentLaw='${v}';AppState.character.alignment='${v} '+AppState.character.alignmentMoral;autosave();renderBuildGeneralInfo();">${v}</button>`;
  }).join('');
  const moralBtns = MORAL_OPTS.map(v => {
    const active = alignMoral === v ? ' btn-primary' : ' btn-secondary';
    return `<button class="btn btn-small${active}" style="flex:1;font-size:11px;"
      onclick="AppState.character.alignmentMoral='${v}';AppState.character.alignment=AppState.character.alignmentLaw+' ${v}';autosave();renderBuildGeneralInfo();">${v}</button>`;
  }).join('');

  const langTags = (chr.languages||[]).length
    ? (chr.languages||[]).map(l => `<span class="tag tag-bonus">${l}</span>`).join('')
    : '<span class="text-dim small">—</span>';

  const portraitHtml = chr.portrait
    ? `<img id="portrait-img" src="${chr.portrait}" alt="Portrait" style="width:110px;height:140px;object-fit:cover;border-radius:6px;">`
    : `<div style="text-align:center;color:var(--text-dim);padding:10px 0;"><div style="font-size:32px;margin-bottom:6px;">🖼</div><div style="font-size:10px;font-family:'Cinzel',serif;letter-spacing:1px;">PORTRAIT</div></div>`;

  el.innerHTML = `
    <datalist id="${deityListId}">${deityOpts}</datalist>
    <datalist id="${deity2ListId}">${deity2Opts}</datalist>

    <div style="max-width:820px;margin:0 auto;">

      <!-- ═══ BLOC 1 — IDENTITÉ ═══ -->
      <div class="panel mb-14">
        <div class="panel-header">
          <span class="panel-title cinzel" style="letter-spacing:2px;">👤 IDENTITÉ</span>
        </div>
        <div class="panel-body">
          <div style="display:flex;gap:20px;align-items:flex-start;">

            <!-- Portrait -->
            <div style="flex-shrink:0;">
              <div class="portrait-zone" id="portrait-zone"
                   onclick="document.getElementById('portrait-input').click()"
                   title="Cliquez pour charger un portrait"
                   style="width:110px;height:140px;cursor:pointer;border:2px dashed var(--border);border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                ${portraitHtml}
              </div>
              <input type="file" id="portrait-input" accept="image/*" style="display:none" onchange="loadPortrait(this)">
              ${chr.portrait ? `<button class="btn btn-secondary btn-small" style="width:110px;margin-top:5px;"
                onclick="AppState.character.portrait=null;autosave();renderBuildGeneralInfo();">✕ Retirer</button>` : ''}
            </div>

            <!-- Champs identité -->
            <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px;">

              <div class="form-group" style="grid-column:1/-1;">
                <label>NOM DU PERSONNAGE</label>
                <input type="text" id="bi-name" value="${chr.name||''}" style="font-size:15px;"
                  placeholder="Nom complet…"
                  oninput="AppState.character.name=this.value;renderSheet();autosave();">
              </div>

              <div class="form-group">
                <label>ALIGNEMENT — AXE LOI</label>
                <div style="display:flex;gap:5px;">${lawBtns}</div>
              </div>
              <div class="form-group">
                <label>ALIGNEMENT — AXE MORAL</label>
                <div style="display:flex;gap:5px;">${moralBtns}</div>
                <div class="small text-dim mt-4">→ <span class="cinzel" style="color:var(--gold-dim);">${alignFull}</span></div>
              </div>

              <div class="form-group">
                <label>ÂGE</label>
                <input type="number" id="bi-age" value="${chr.age||0}" min="0"
                  oninput="AppState.character.age=+this.value;autosave();">
              </div>

              <!-- Taille + Poids + IMC -->
              <div class="form-group">
                <label>TAILLE (m)</label>
                <input type="number" id="bi-height" value="${h}" step="0.01"
                  oninput="AppState.character.heightMeters=+this.value;autosave();renderBuildGeneralInfo();">
              </div>
              <div class="form-group">
                <label>POIDS (kg)</label>
                <input type="number" id="bi-weight" value="${w}"
                  oninput="AppState.character.weightKg=+this.value;autosave();renderBuildGeneralInfo();">
              </div>
              <!-- Sexe (nécessaire pour IMG) -->
              <div class="form-group" style="grid-column:1/-1;">
                <label>SEXE <span class="small text-dim">(utilisé pour le calcul IMG)</span></label>
                <div style="display:flex;gap:8px;">
                  ${['M','F',''].map(s => {
                    const label = s === 'M' ? '♂ Masculin' : s === 'F' ? '♀ Féminin' : '— Non précisé';
                    const active = gender === s ? ' btn-primary' : ' btn-secondary';
                    return `<button class="btn btn-small${active}" style="flex:1;font-size:11px;"
                      onclick="AppState.character.gender='${s}';autosave();renderBuildGeneralInfo();">${label}</button>`;
                  }).join('')}
                </div>
              </div>

              <!-- IMC + IMG row -->
              <div style="grid-column:1/-1;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px 14px;">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;align-items:start;margin-bottom:10px;">
                  <div>
                    <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;font-family:'Cinzel',serif;margin-bottom:2px;">IMC</div>
                    <div style="font-size:20px;font-family:'Cinzel',serif;font-weight:700;color:var(--gold-light);">${imc}</div>
                    <div style="font-size:9px;color:var(--text-dim);">poids / taille²</div>
                  </div>
                  <div>
                    <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;font-family:'Cinzel',serif;margin-bottom:2px;">IMG (masse graisseuse)</div>
                    <div style="font-size:20px;font-family:'Cinzel',serif;font-weight:700;color:var(--gold-light);">${imgStr}</div>
                    <div style="font-size:9px;color:var(--text-dim);">${imgNote ? imgNote : 'Deurenberg 1991'}</div>
                  </div>
                  <div>
                    <label style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">CORPULENCE</label>
                    <select style="font-size:12px;width:100%;margin-top:3px;"
                      onchange="(AppState.character.info=AppState.character.info||{}).corpulence=this.value;autosave();">
                      ${corpSelOpts}
                    </select>
                    <div style="font-size:9px;color:var(--text-dim);margin-top:3px;">Auto : <em>${CORP_AUTO}</em> — modifiable</div>
                  </div>
                </div>
              </div>

              <div class="form-group" style="grid-column:1/-1;">
                <label>LANGUES (séparées par des virgules)</label>
                <input type="text" id="bi-languages" value="${(chr.languages||[]).join(', ')}"
                  placeholder="Commun, Céleste, Draconique…"
                  oninput="AppState.character.languages=this.value.split(',').map(s=>s.trim()).filter(Boolean);autosave();">
                <div style="margin-top:4px;">${langTags}</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- ═══ BLOC DIVINITÉ ═══ -->
      <div class="panel mb-14">
        <div class="panel-header">
          <span class="panel-title cinzel" style="letter-spacing:2px;">🙏 DIVINITÉ</span>
        </div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">

            <div class="form-group">
              <label>DIVINITÉ PRINCIPALE</label>
              <input type="text" id="bi-deity" value="${chr.deity||''}"
                list="${deityListId}"
                placeholder="Pelor, Héironéous… (saisie libre)"
                oninput="AppState.character.deity=this.value;autosave();">
            </div>
            <div class="form-group">
              <label>DIVINITÉ SECONDAIRE <span class="text-dim small">(optionnelle)</span></label>
              <input type="text" value="${nfo.deity2||''}"
                list="${deity2ListId}"
                placeholder="Patron ancestral, divinité de guilde…"
                oninput="(AppState.character.info=AppState.character.info||{}).deity2=this.value;autosave();">
            </div>

          </div>

          <!-- Encadré d'aide -->
          <div style="background:var(--bg3);border-left:3px solid var(--gold-dim);border-radius:0 5px 5px 0;padding:10px 14px;">
            <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;margin-bottom:6px;">ℹ DIVINITÉS EN D&D 3.5</div>
            <div class="small text-dim" style="line-height:1.6;">
              Dans les univers D&D 3.5, les dieux existent réellement et font partie du tissu du monde.
              La plupart des personnages reconnaissent leur existence, même s'ils ne les vénèrent pas activement.
              Un personnage peut être <em>pieux</em> (prières quotidiennes, respect des préceptes),
              <em>nominal</em> (jure par son dieu sans vraiment pratiquer)
              ou <em>athée pragmatique</em> (reconnaît l'existence des dieux sans les révérer).
              Choisir une divinité enrichit le roleplay, motive des décisions morales et peut influencer les interactions avec les clercs et paladins.
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 2 — INFORMATIONS COMPLÉMENTAIRES ═══ -->
      <div class="panel mb-14">
        <div class="panel-header">
          <span class="panel-title cinzel" style="letter-spacing:2px;">📌 INFORMATIONS COMPLÉMENTAIRES</span>
          <span class="small text-dim">Identité générale — distinct de l'onglet Concept</span>
        </div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label>SURNOM / TITRE</label>
              <input type="text" value="${nfo.nickname||''}"
                placeholder="Kael le Gris, Dame du Nord…"
                oninput="(AppState.character.info=AppState.character.info||{}).nickname=this.value;autosave();">
            </div>
            <div class="form-group">
              <label>ORIGINE / RÉGION</label>
              <input type="text" value="${nfo.origin||''}"
                placeholder="Greyhawk, Côte des Épées…"
                oninput="(AppState.character.info=AppState.character.info||{}).origin=this.value;autosave();">
            </div>
            <div class="form-group">
              <label>CULTURE / PEUPLE / MILIEU</label>
              <input type="text" value="${nfo.culture||''}"
                placeholder="Nomade des plaines, Marchand urbain…"
                oninput="(AppState.character.info=AppState.character.info||{}).culture=this.value;autosave();">
            </div>
            <div class="form-group">
              <label>AFFILIATION / ORDRE / GROUPE</label>
              <input type="text" value="${nfo.affiliation||''}"
                placeholder="Guilde des mages, Ordre du Heaume…"
                oninput="(AppState.character.info=AppState.character.info||{}).affiliation=this.value;autosave();">
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label>APPARENCE PHYSIQUE</label>
              <input type="text" value="${nfo.appearance||''}"
                placeholder="Grand, cheveux noirs, cicatrice sur la joue gauche…"
                oninput="(AppState.character.info=AppState.character.info||{}).appearance=this.value;autosave();">
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ BLOC 3 — NOTES PERSONNELLES ═══ -->
      <div class="panel mb-14">
        <div class="panel-header">
          <span class="panel-title cinzel" style="letter-spacing:2px;">📜 NOTES PERSONNELLES</span>
          <span class="small text-dim">Histoire, origines, liens, secrets…</span>
        </div>
        <div class="panel-body">
          <textarea id="bi-notes" rows="8" style="width:100%;resize:vertical;"
            placeholder="Histoire du personnage, liens importants, secrets, objectifs à long terme, évolution envisagée…"
            oninput="AppState.character.notes=this.value;autosave();">${chr.notes||''}</textarea>
        </div>
      </div>

    </div>
  `;
}


function loadPortrait(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    AppState.character.portrait = e.target.result;
    renderBuildGeneralInfo();
    // Also refresh sheet if visible
    const sheetTab = document.getElementById('tab-sheet');
    if (sheetTab && !sheetTab.classList.contains('hidden')) renderSheet();
  };
  reader.readAsDataURL(file);
}

// ── BUILD RACE MODULE ─────────────────────────────────────────────
let selectedRacePreviewId = null;  // race consultée (preview) ≠ race appliquée au PJ

function _raceIcon(baseRace) {
  const icons = { human:'👤', dwarf:'⛏', elf:'🌿', gnome:'🔮',
    half_elf:'🌗', halfling:'🍀', half_orc:'⚔', goliath:'🏔',
    aasimar:'✨', tiefling:'🔥' };
  return icons[baseRace] || '🎭';
}

function __raceVisionIcon(v) {
  if (v.includes('noir'))    return '🌑';
  if (v.includes('nocturne'))return '🌙';
  return '👁';
}

function _raceAbilTags(mods) {
  const labels = { STR:'FOR', DEX:'DEX', CON:'CON', INT:'INT', WIS:'SAG', CHA:'CHA' };
  return Object.entries(mods).map(([ab, val]) => {
    const color = val > 0 ? 'var(--green)' : 'var(--red)';
    return `<span style="font-size:10px;background:var(--bg4);border:1px solid ${color};color:${color};border-radius:3px;padding:1px 5px;">${labels[ab]||ab} ${val > 0 ? '+' : ''}${val}</span>`;
  }).join('');
}

// ── Ligne compacte dans la liste ─────────────────────────────
function _buildRaceListRow(r, charRaceId, previewId) {
  const isChar    = r.id === charRaceId;
  const isPreview = r.id === previewId;
  const isSubrace = !['race_human','race_dwarf','race_elf','race_gnome',
    'race_half_elf','race_halfling','race_half_orc',
    'race_goliath','race_aasimar','race_tiefling'].includes(r.id);
  const indent   = isSubrace ? 'margin-left:14px;border-left:2px solid var(--border);padding-left:8px;' : '';
  const selBg    = isPreview ? 'background:var(--bg4);border-color:var(--gold-dim);' : '';
  const charMark = isChar ? '<span style="color:var(--gold);font-size:11px;margin-left:4px;" title="Race du PJ">✔</span>' : '';
  const abTags   = _raceAbilTags(r.abilityMods);
  const noMod    = Object.keys(r.abilityMods).length === 0;

  return `<div class="race-list-row" data-raceid="${r.id}"
    style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:5px;
           border:1px solid ${isPreview ? 'var(--gold-dim)' : 'transparent'};
           ${selBg}${indent}cursor:pointer;transition:background 0.12s;"
    onmouseenter="this.style.background='var(--bg4)'"
    onmouseleave="this.style.background='${isPreview ? 'var(--bg4)' : 'transparent'}'">
    <span style="font-size:16px;flex-shrink:0;">${_raceIcon(r.baseRace)}</span>
    <div style="flex:1;min-width:0;">
      <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
        <span style="font-size:12px;font-weight:700;color:${isPreview ? 'var(--gold-light)' : 'var(--text-bright)'};">${r.nameFr}</span>
        ${charMark}
        <span style="font-size:9px;color:var(--text-dim);border:1px solid var(--border);border-radius:3px;padding:0 3px;">${r.source}</span>
        ${r.la > 0 ? `<span style="font-size:9px;color:#ff9966;border:1px solid rgba(200,80,40,0.5);border-radius:3px;padding:0 3px;">LA +${r.la}</span>` : ''}
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:2px;align-items:center;">
        <span style="font-size:9px;color:var(--text-dim);">${r.size} · 🏃${r.speed}ft</span>
        ${r.vision.map(v => `<span style="font-size:9px;color:var(--text-dim);">${__raceVisionIcon(v)} ${v.replace('Vision dans le noir','VdN').replace('Vision nocturne','V.Noc').replace('Vision normale','—')}</span>`).join('')}
        ${noMod ? '' : abTags}
      </div>
    </div>
  </div>`;
}

// ── Panneau de détail complet ────────────────────────────────
function _buildRaceDetailPanel(r, charRaceId) {
  if (!r) return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center;">
      <div style="font-size:40px;margin-bottom:16px;">🧬</div>
      <div class="cinzel" style="color:var(--gold-dim);font-size:13px;letter-spacing:2px;">SÉLECTIONNEZ UNE RACE</div>
      <div class="text-dim small" style="margin-top:8px;">Cliquez sur une race dans la liste pour consulter sa fiche.</div>
    </div>`;

  const isChar    = r.id === charRaceId;
  const abTags    = _raceAbilTags(r.abilityMods);
  const noMod     = Object.keys(r.abilityMods).length === 0;
  const abEntries = Object.entries(r.abilityMods);

  const btnHtml = isChar
    ? `<button class="btn btn-secondary" style="width:100%;margin-top:16px;cursor:default;" disabled>
         ✔ Race actuelle du PJ
       </button>`
    : `<button class="btn btn-primary" style="width:100%;margin-top:16px;" data-apply-race="${r.id}">
         ▶ Choisir pour le PJ
       </button>`;

  const modBlock = noMod
    ? `<div class="text-dim small">Aucun modificateur (race humaine)</div>`
    : `<div style="display:flex;flex-wrap:wrap;gap:5px;">
        ${abEntries.map(([ab,v]) => {
          const labels = { STR:'Force', DEX:'Dextérité', CON:'Constitution', INT:'Intelligence', WIS:'Sagesse', CHA:'Charisme' };
          const color = v > 0 ? 'var(--green)' : 'var(--red)';
          return `<div style="text-align:center;background:var(--bg3);border:1px solid ${color};border-radius:6px;padding:6px 10px;min-width:70px;">
            <div style="font-size:9px;color:var(--text-dim);">${labels[ab]||ab}</div>
            <div style="font-size:18px;font-family:'Cinzel',serif;font-weight:700;color:${color};">${v > 0 ? '+' : ''}${v}</div>
          </div>`;
        }).join('')}
       </div>`;

  const traitsHtml = r.traits.length
    ? r.traits.map(t => `
        <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);">
          <span style="color:var(--gold-dim);flex-shrink:0;">◆</span>
          <span class="small" style="color:var(--text-dim);line-height:1.5;">${t}</span>
        </div>`).join('')
    : '<div class="text-dim small">Aucun trait particulier.</div>';

  const langHtml = `
    <div class="small" style="margin-bottom:4px;">
      <span style="color:var(--text-dim);">Automatiques : </span>
      <span style="color:var(--gold-dim);">${r.autoLanguages.join(', ')}</span>
    </div>
    ${r.bonusLanguages.length ? `<div class="small">
      <span style="color:var(--text-dim);">Bonus (au choix) : </span>
      <span style="color:var(--text-dim);font-style:italic;">${r.bonusLanguages.join(', ')}</span>
    </div>` : ''}`;

  const weaponsHtml = r.weapons.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">${r.weapons.map(w =>
        `<span style="font-size:11px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 8px;color:var(--text-dim);">${w}</span>`
      ).join('')}</div>`
    : `<div class="text-dim small">Aucune maîtrise raciale spécifique.</div>`;

  const statsHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <div style="padding:8px;background:var(--bg3);border-radius:5px;">
        <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">TAILLE</div>
        <div style="font-size:14px;color:var(--text-bright);font-weight:700;">${r.size}</div>
      </div>
      <div style="padding:8px;background:var(--bg3);border-radius:5px;">
        <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">VITESSE</div>
        <div style="font-size:14px;color:var(--text-bright);font-weight:700;">${r.speed} ft.</div>
      </div>
      <div style="padding:8px;background:var(--bg3);border-radius:5px;grid-column:1/-1;">
        <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;margin-bottom:3px;">VISION</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${r.vision.map(v => `<span style="font-size:11px;background:var(--bg4);border:1px solid var(--border);border-radius:3px;padding:1px 6px;color:var(--text-dim);">${__raceVisionIcon(v)} ${v}</span>`).join('')}
        </div>
      </div>
    </div>`;

  return `
    <div style="padding:16px 18px;overflow-y:auto;max-height:80vh;">
      <!-- Header -->
      <div style="margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-size:28px;">${_raceIcon(r.baseRace)}</span>
          <div>
            <div class="cinzel" style="font-size:16px;color:var(--gold-light);font-weight:700;">${r.nameFr}</div>
            <div class="small text-dim" style="font-style:italic;">${r.nameEn} · ${r.source}${r.la > 0 ? ` · <span style="color:#ff9966;">LA +${r.la}</span>` : ''}</div>
          </div>
        </div>
        ${isChar ? `<div style="background:rgba(74,154,80,0.12);border:1px solid var(--green);border-radius:5px;padding:6px 10px;font-size:12px;color:var(--green);">✔ Race actuelle du personnage</div>` : ''}
      </div>

      <!-- Stats -->
      ${statsHtml}

      <!-- Modificateurs -->
      <div style="margin-bottom:12px;">
        <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;margin-bottom:6px;">MODIFICATEURS DE CARACTÉRISTIQUES</div>
        ${modBlock}
      </div>

      <!-- Traits -->
      <div style="margin-bottom:12px;">
        <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;margin-bottom:6px;">TRAITS RACIAUX</div>
        ${traitsHtml}
      </div>

      <!-- Langues -->
      <div style="margin-bottom:12px;">
        <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;margin-bottom:6px;">LANGUES</div>
        ${langHtml}
      </div>

      <!-- Armes -->
      <div style="margin-bottom:12px;">
        <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;margin-bottom:6px;">MAÎTRISES D'ARMES RACIALES</div>
        ${weaponsHtml}
      </div>

      <!-- Description -->
      <div style="margin-bottom:12px;padding:10px 12px;background:var(--bg3);border-left:3px solid var(--gold-dim);border-radius:0 5px 5px 0;">
        <div class="small text-dim" style="line-height:1.6;font-style:italic;">${r.desc}</div>
      </div>

      <!-- Bouton choisir -->
      ${btnHtml}
    </div>`;
}

// ── Render principal ─────────────────────────────────────────
function renderBuildRace() {
  const el = document.getElementById('build-race-module');
  if (!el) return;

  const chr      = AppState.character;
  const charRaceId = chr.raceId;

  // Default preview to character's current race if nothing selected
  if (!selectedRacePreviewId) selectedRacePreviewId = charRaceId || null;

  // Group races
  const coreParents = ['race_human','race_dwarf','race_elf','race_gnome',
    'race_half_elf','race_halfling','race_half_orc'];
  const extras = ['race_goliath','race_aasimar','race_tiefling'];
  const groupLabels = {
    race_human:'Humain', race_dwarf:'Nain', race_elf:'Elfe',
    race_gnome:'Gnome', race_half_elf:'Demi-Elfe',
    race_halfling:'Halfelin', race_half_orc:'Demi-Orque',
    race_goliath:'Goliath (MM)', race_aasimar:'Planaire (MM)',
    race_tiefling:'Planaire (MM)'
  };
  const subraceParent = {
    race_elf_gray:'race_elf', race_elf_wood:'race_elf',
    race_elf_wild:'race_elf', race_elf_aquatic:'race_elf',
    race_elf_drow:'race_elf', race_dwarf_deep:'race_dwarf',
    race_dwarf_duergar:'race_dwarf', race_gnome_deep:'race_gnome'
  };

  // Build list HTML
  const allIds = Object.keys(RACE_DB);
  let listHtml = '';
  const rendered = new Set();

  [...coreParents, ...extras].forEach(parentId => {
    if (!RACE_DB[parentId]) return;
    listHtml += _buildRaceListRow({ id: parentId, ...RACE_DB[parentId] }, charRaceId, selectedRacePreviewId);
    rendered.add(parentId);
    // Subraces of this parent
    allIds.filter(id => subraceParent[id] === parentId).forEach(subId => {
      listHtml += _buildRaceListRow({ id: subId, ...RACE_DB[subId] }, charRaceId, selectedRacePreviewId);
      rendered.add(subId);
    });
  });
  // Any remaining races not yet rendered
  allIds.filter(id => !rendered.has(id)).forEach(id => {
    listHtml += _buildRaceListRow({ id, ...RACE_DB[id] }, charRaceId, selectedRacePreviewId);
  });

  const previewData = selectedRacePreviewId && RACE_DB[selectedRacePreviewId]
    ? { id: selectedRacePreviewId, ...RACE_DB[selectedRacePreviewId] }
    : null;

  const charRaceDisplay = charRaceId && RACE_DB[charRaceId]
    ? `<span style="color:var(--green);font-size:12px;">✔ ${RACE_DB[charRaceId].nameFr}</span>`
    : `<span class="text-dim small">Aucune sélection</span>`;

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 380px;min-height:600px;">

      <!-- COLONNE GAUCHE : liste -->
      <div style="display:flex;flex-direction:column;border-right:1px solid var(--border);">
        <div style="padding:10px 12px;border-bottom:1px solid var(--border);background:var(--bg3);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span class="cinzel small text-dim" style="font-size:10px;letter-spacing:2px;">${Object.keys(RACE_DB).length} RACES DISPONIBLES</span>
          </div>
          <div>Race PJ : ${charRaceDisplay}</div>
        </div>
        <div id="race-list-scroll" style="overflow-y:auto;flex:1;padding:8px;">
          ${listHtml}
        </div>
      </div>

      <!-- COLONNE DROITE : détail -->
      <div id="race-detail-panel">
        ${_buildRaceDetailPanel(previewData, charRaceId)}
      </div>

    </div>`;

  // Event delegation for left column (preview only)
  const listEl = el.querySelector('#race-list-scroll');
  listEl.onclick = function(e) {
    const row = e.target.closest('[data-raceid]');
    if (row) {
      selectedRacePreviewId = row.dataset.raceid;
      renderBuildRace();  // re-render with new preview
    }
  };

  // Event delegation for right column "Choisir pour le PJ" button
  const detailEl = el.querySelector('#race-detail-panel');
  detailEl.onclick = function(e) {
    const btn = e.target.closest('[data-apply-race]');
    if (btn) changeRace(btn.dataset.applyRace);
  };
}


// ── 2. CARACTÉRISTIQUES ─────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
// SECTION 5 — BUILD : Caractéristiques
// ═══════════════════════════════════════════════════════════

function renderBuildAbilities() {
  const chr = AppState.character;
  const el = document.getElementById('build-page-abilities');
  if (!el) return;

  // If shell already built, only refresh computed values
  if (document.getElementById('ab-grid')) {
    updateAbilitiesDisplay();
    const mSel = document.getElementById('ability-method-sel');
    if (mSel) mSel.value = chr.abilityMethod || 'pointbuy';
    const pbp = document.getElementById('pb-hint-panel');
    if (pbp) pbp.style.display = (chr.abilityMethod || 'pointbuy') === 'pointbuy' ? '' : 'none';
    _renderAbilityExtras();
    return;
  }

  const totalCost = getTotalPointBuy();
  const budget = 25;
  const costColor = totalCost > budget ? 'var(--red)' : totalCost === budget ? 'var(--green)' : 'var(--gold)';



  const abilities = ['STR','DEX','CON','INT','WIS','CHA'];
  const abilityNames = { STR:'Force', DEX:'Dextérité', CON:'Constitution', INT:'Intelligence', WIS:'Sagesse', CHA:'Charisme' };

  el.innerHTML = `
    <div id="ab-grid" style="max-width:900px; margin:0 auto; display:grid; grid-template-columns:280px 1fr; gap:16px; align-items:start;">
      <div class="panel" style="position:sticky; top:8px;">
        <div class="panel-header"><span class="panel-title">BUDGET POINT-BUY</span></div>
        <div class="panel-body">
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span class="text-dim small">Points utilisés</span>
            <span id="pb-total" class="bold cinzel" style="color:${costColor}; font-size:20px;">${totalCost}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span class="text-dim small">Budget standard</span>
            <span class="bold cinzel" style="color:var(--gold)">25</span>
          </div>
          <div style="width:100%;height:8px;background:var(--bg4);border-radius:4px;overflow:hidden;margin-bottom:10px;">
            <div id="pb-bar" style="height:100%;width:${Math.min(100,totalCost/budget*100)}%;background:${costColor};border-radius:4px;transition:width 0.3s;"></div>
          </div>
          <div class="small text-dim">Restants : <strong id="pb-left" style="color:${costColor}">${budget - totalCost}</strong></div>
          <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:8px;">
            <div class="small text-dim mb-4">Coût par valeur de base :</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${[8,9,10,11,12,13,14,15,16,17,18].map(s=>`<span style="font-size:11px;color:var(--text-dim);">${s}=<strong style="color:var(--text-bright);">${pointBuyCost(s)}</strong></span>`).join(' · ')}
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><span class="panel-title">CARACTÉRISTIQUES DE BASE</span></div>
        <div class="panel-body">
          ${abilities.map(ab => {
            const sc = chr.abilityScores[ab];
            const base = sc.base;
            const racial = sc.racial;
            const levelUp = sc.levelUp;
            const total = getAbilityTotal(ab);
            const mod = getMod(ab);
            const modStr = (mod >= 0 ? '+' : '') + mod;
            const cost = pointBuyCost(base);
            return `
            <div style="display:grid; grid-template-columns:140px 60px auto 60px 60px 60px; gap:8px; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
              <div>
                <div class="bold cinzel" style="color:var(--gold-light); font-size:13px;">${abilityNames[ab]}</div>
                <div class="small text-dim">${ab}</div>
              </div>
              <div style="text-align:center;">
                <div class="small text-dim mb-2">Base</div>
                <div style="display:flex; align-items:center; gap:3px;">
                  <button onclick="adjustBaseAbility('${ab}',-1)" class="btn btn-secondary btn-small" style="padding:1px 6px;">-</button>
                  <span id="ab-base-${ab}" class="bold cinzel" style="font-size:16px; color:var(--text-bright); min-width:24px; text-align:center;">${base}</span>
                  <button onclick="adjustBaseAbility('${ab}',1)" class="btn btn-secondary btn-small" style="padding:1px 6px;">+</button>
                </div>
                <div id="ab-cost-${ab}" class="small text-dim" style="font-size:10px; margin-top:2px;">Coût: ${cost}</div>
              </div>
              <div style="display:flex; gap:12px; align-items:center; padding:0 8px;">
                ${racial !== 0 ? `<span class="small" style="color:${racial>0?'var(--green)':'var(--red)'}">Racial ${racial>0?'+':''}${racial}</span>` : '<span class="small text-dim">—</span>'}
                ${levelUp > 0 ? `<span class="small" style="color:var(--blue);">Niv +${levelUp}</span>` : ''}
              </div>
              <div style="text-align:center;">
                <div class="small text-dim mb-2">Total</div>
                <span id="ab-total-${ab}" class="bold cinzel" style="font-size:20px; color:var(--gold-light);">${total}</span>
              </div>
              <div style="text-align:center;">
                <div class="small text-dim mb-2">Mod</div>
                <span id="ab-mod-${ab}" class="bold cinzel" style="font-size:18px; color:${mod>=0?'var(--green)':'var(--red)'};">${modStr}</span>
              </div>
            </div>`;
          }).join('')}
          <div style="margin-top:12px; text-align:right;">
            <button class="btn btn-secondary btn-small" onclick="resetAbilitiesToPointBuy()">Réinitialiser (8/8/8/8/8/8)</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bloc d'aide statique méthodes de génération -->
    <div style="margin-top:20px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:16px 20px;">
      <div class="cinzel small text-dim" style="font-size:10px;letter-spacing:2px;margin-bottom:10px;">ℹ️ MÉTHODES DE GÉNÉRATION EN D&D 3.5</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;">
        <div>
          <div class="cinzel" style="color:var(--gold-dim);font-size:11px;margin-bottom:3px;">POINT BUY</div>
          <div class="text-dim" style="line-height:1.5;">Commencez à 8 dans toutes les caractéristiques et dépensez 25 points. Le coût augmente exponentiellement au-delà de 14. Méthode équilibrée et recommandée en campagne.</div>
        </div>
        <div>
          <div class="cinzel" style="color:var(--gold-dim);font-size:11px;margin-bottom:3px;">JETS DE DÉS</div>
          <div class="text-dim" style="line-height:1.5;">Lancez 4d6, ignorez le résultat le plus bas, additionnez les trois restants. Répétez 6 fois. Méthode classique — peut produire des personnages très puissants ou très faibles.</div>
        </div>
        <div>
          <div class="cinzel" style="color:var(--gold-dim);font-size:11px;margin-bottom:3px;">VALEURS FIXES</div>
          <div class="text-dim" style="line-height:1.5;">Utilisez l'ensemble 15, 14, 13, 12, 10, 8 et répartissez librement. Aucun aléatoire — chaque joueur démarre avec la même somme de caractéristiques.</div>
        </div>
        <div>
          <div class="cinzel" style="color:var(--gold-dim);font-size:11px;margin-bottom:3px;">ATTRIBUTION MANUELLE (MJ)</div>
          <div class="text-dim" style="line-height:1.5;">Le maître de jeu attribue directement les valeurs. Utilisé pour les PNJ importants ou pour les campagnes à niveau de puissance contrôlé.</div>
        </div>
      </div>
    </div>
  `;
}

function updateAbilitiesDisplay() {
  // Refresh only computed values in the abilities page - called when shell (ab-grid) exists.
  const chr = AppState.character;
  const totalCost = getTotalPointBuy();  // ← rules.js
  const budget = 25;
  const costColor = totalCost > budget ? 'var(--red)' : totalCost === budget ? 'var(--green)' : 'var(--gold)';

  // Point-buy totals
  const pbTotal = document.getElementById('pb-total');
  const pbLeft  = document.getElementById('pb-left');
  const pbBar   = document.getElementById('pb-bar');
  if (pbTotal) { pbTotal.textContent = totalCost; pbTotal.style.color = costColor; }
  if (pbLeft)  { pbLeft.textContent  = budget - totalCost; pbLeft.style.color = costColor; }
  if (pbBar)   { pbBar.style.width   = Math.min(100, totalCost / budget * 100) + '%'; pbBar.style.background = costColor; }

  // Per-ability: base, cost, total, mod
  ['STR','DEX','CON','INT','WIS','CHA'].forEach(ab => {
    const sc    = chr.abilityScores[ab];
    const base  = sc?.base  || 10;
    const total = getAbilityTotal(ab);   // ← rules.js
    const mod   = getMod(ab);            // ← rules.js
    const cost  = (typeof pointBuyCost === 'function') ? pointBuyCost(base) : 0;
    const modStr = (mod >= 0 ? '+' : '') + mod;
    const modColor = mod >= 0 ? 'var(--green)' : 'var(--red)';

    const baseEl  = document.getElementById('ab-base-' + ab);
    const costEl  = document.getElementById('ab-cost-' + ab);
    const totalEl = document.getElementById('ab-total-' + ab);
    const modEl   = document.getElementById('ab-mod-'   + ab);

    if (baseEl)  baseEl.textContent  = base;
    if (costEl)  costEl.textContent  = 'Coût: ' + cost;
    if (totalEl) totalEl.textContent = total;
    if (modEl)   { modEl.textContent = modStr; modEl.style.color = modColor; }
  });
}


function adjustBaseAbility(ab, dir) {
  const sc = AppState.character.abilityScores[ab];
  const newBase = Math.max(8, Math.min(18, sc.base + dir));
  sc.base = newBase;
  renderBuildAbilities();
  renderSheet();
}

function resetAbilitiesToPointBuy() {
  Object.keys(AppState.character.abilityScores).forEach(ab => {
    AppState.character.abilityScores[ab].base = 8;
  });
  renderBuildAbilities();
  renderSheet();
}

// ── CLASS CONSTANTS ────────────────────────────────────────────
const _CLASS_CATEGORY_ORDER  = ['core','supplement','hybrid','tome_of_battle','psionic','incarnum','prestige','npc'];
const _CLASS_CATEGORY_LABELS = {
  core:'PHB — Classes de base', supplement:'Suppléments (Complete series / PHBII)',
  hybrid:'Hybrides & Autres bases', tome_of_battle:'Tome of Battle (Manœuvres)',
  psionic:'Psionique (XPH)', incarnum:'Incarnum (MoI)',
  prestige:'Classes de prestige (PRC)', npc:'Classes PNJ'
};

// ── CLASS LIBRARY PAGE ─────────────────────────────────────────
function renderBuildClassLibrary() {
  const el = document.getElementById('build-page-classlibrary');
  if (!el) return;

  // Build once
  if (!document.getElementById('classlib-list')) {
    el.innerHTML = `
    <div style="display:grid;grid-template-columns:260px 1fr;gap:16px;align-items:start;min-height:70vh;">

      <!-- LEFT: filtered list -->
      <div>
        <div class="panel" style="position:sticky;top:0;">
          <div class="panel-header">
            <span class="panel-title">⚔ CLASSES</span>
            <span class="small text-dim" id="classlib-count">${Object.keys(CLASS_REF).length} classes</span>
          </div>
          <div class="panel-body" style="padding:8px;">
            <input type="text" id="classlib-search" placeholder="🔍 Rechercher FR / EN / tag…"
              style="width:100%;font-size:12px;margin-bottom:6px;box-sizing:border-box;"
              oninput="renderClassLibList()">
            <div style="display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap;">
              <select id="classlib-cat" onchange="renderClassLibList()" style="flex:1;font-size:11px;min-width:80px;">
                <option value="">Toutes catégories</option>
                ${_CLASS_CATEGORY_ORDER.map(cat=>`<option value="${cat}">${_CLASS_CATEGORY_LABELS[cat]||cat}</option>`).join('')}
              </select>
              <select id="classlib-role" onchange="renderClassLibList()" style="flex:1;font-size:11px;min-width:80px;">
                <option value="">Tous rôles</option>
                <option value="martial">⚔ Martial</option>
                <option value="arcane">✨ Arcanique</option>
                <option value="divine">✝ Divin</option>
                <option value="hybrid">⚡ Hybride</option>
                <option value="psionic">🧠 Psionique</option>
                <option value="incarnum">💠 Incarnum</option>
              </select>
            </div>
            <label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer;margin-bottom:6px;">
              <input type="checkbox" id="classlib-prestige" onchange="renderClassLibList()">
              Prestige seulement
            </label>
          </div>
          <div id="classlib-list" style="max-height:calc(100vh - 300px);overflow-y:auto;"></div>
        </div>
      </div>

      <!-- RIGHT: detail panel -->
      <div id="classlib-detail">
        <div class="panel" style="padding:24px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">⚔</div>
          <div class="cinzel" style="font-size:16px;color:var(--gold);margin-bottom:8px;">Bibliothèque de classes</div>
          <p class="text-dim small">Sélectionnez une classe dans la liste pour voir ses détails.<br>
          Utilisez les filtres pour trouver la classe qui correspond à votre style de jeu.</p>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:20px;">
            ${_CLASS_CATEGORY_ORDER.filter(c=>c!=='npc').map(cat => {
              const cnt = Object.values(CLASS_REF).filter(c=>c.category===cat).length;
              return cnt ? `<span style="padding:4px 10px;border-radius:12px;font-size:11px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">${_CLASS_CATEGORY_LABELS[cat]||cat}: <strong style="color:var(--gold);">${cnt}</strong></span>` : '';
            }).join('')}
          </div>
        </div>
      </div>
    </div>`;
  }

  renderClassLibList();
}

function renderClassLibList() {
  const listEl = document.getElementById('classlib-list');
  const countEl = document.getElementById('classlib-count');
  if (!listEl) return;

  const q        = (document.getElementById('classlib-search')?.value||'').toLowerCase();
  const catF     = document.getElementById('classlib-cat')?.value||'';
  const roleF    = document.getElementById('classlib-role')?.value||'';
  const prestige = document.getElementById('classlib-prestige')?.checked||false;

  const BAB_FR = {full:'Complet',medium:'Moyen',poor:'Faible'};
  const filtered = Object.entries(CLASS_REF).filter(([id,c]) => {
    if (catF && c.category !== catF) return false;
    if (roleF && c.role !== roleF) return false;
    if (prestige && !c.isPrestige) return false;
    if (q) {
      const tags = (CLASS_TAGS[id]||[]).join(' ').toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !(c.nameEn||'').toLowerCase().includes(q) &&
          !(c.desc||'').toLowerCase().includes(q) && !tags.includes(q)) return false;
    }
    return true;
  });

  if (countEl) countEl.textContent = `${filtered.length} / ${Object.keys(CLASS_REF).length}`;
  if (!filtered.length) {
    listEl.innerHTML = '<div class="text-dim small text-center" style="padding:16px;">Aucun résultat.</div>';
    return;
  }

  // Group by category in display order
  const grouped = {};
  filtered.forEach(([id,c]) => { (grouped[c.category] = grouped[c.category]||[]).push([id,c]); });
  const _savedScroll = listEl.scrollTop;
  listEl.innerHTML = '';

  _CLASS_CATEGORY_ORDER.forEach(cat => {
    if (!grouped[cat]) return;
    const hdr = document.createElement('div');
    hdr.style.cssText = 'padding:4px 10px;background:var(--bg2);border-bottom:1px solid var(--border);border-top:1px solid var(--border);font-size:9px;font-family:Cinzel,serif;letter-spacing:1.5px;color:var(--gold-dim);position:sticky;top:0;z-index:1;';
    hdr.textContent = (_CLASS_CATEGORY_LABELS[cat]||cat).toUpperCase();
    listEl.appendChild(hdr);

    grouped[cat].forEach(([id, c]) => {
      const row = document.createElement('div');
      const isSelected = (_classLibSelected === id);
      row.style.cssText = `padding:8px 10px;border-bottom:1px solid var(--border);cursor:pointer;
        background:${isSelected ? 'rgba(201,147,58,0.1)' : 'transparent'};
        border-left:${isSelected ? '3px solid var(--gold)' : '3px solid transparent'};`;
      row.onmouseenter = () => { if (!isSelected) row.style.background = 'rgba(255,255,255,0.03)'; };
      row.onmouseleave = () => { if (!isSelected) row.style.background = 'transparent'; };
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:16px;width:20px;text-align:center;">${c.icon||'⚔'}</span>
          <div style="flex:1;min-width:0;">
            <div class="classlib-name" style="font-size:12px;font-weight:600;color:${isSelected?'var(--gold-light)':'var(--text-bright)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>
            ${c.nameEn&&c.nameEn!==c.name?`<div style="font-size:10px;color:var(--text-dim);">${c.nameEn}</div>`:''}
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:10px;color:var(--gold-dim);">d${c.hitDie}</div>
            <div style="font-size:9px;color:var(--text-dim);">${BAB_FR[c.babProg]||c.babProg}</div>
          </div>
        </div>`;
      row.onclick = () => {
        // 1. Update selection state
        _classLibSelected = id;
        // 2. Visual: deselect all rows, select this one — no full re-render needed
        const allRows = document.querySelectorAll('#classlib-list > div[data-classid]');
        allRows.forEach(r => {
          const sel = r.dataset.classid === id;
          r.style.background = sel ? 'rgba(201,147,58,0.1)' : 'transparent';
          r.style.borderLeft = sel ? '3px solid var(--gold)' : '3px solid transparent';
          const nameEl = r.querySelector('.classlib-name');
          if (nameEl) nameEl.style.color = sel ? 'var(--gold-light)' : 'var(--text-bright)';
        });
        // 3. Update detail panel
        showClassLibDetail(id);
      };
      row.dataset.classid = id;
      listEl.appendChild(row);
    });
  });
  listEl.scrollTop = _savedScroll;
}

let _classLibSelected = null;

function showClassLibDetail(classId) {
  const el = document.getElementById('classlib-detail');
  if (!el) return;
  const c = CLASS_REF[classId];
  if (!c) return;

  const extra = (typeof CLASS_EXTRA !== 'undefined') ? (CLASS_EXTRA[classId] || {}) : {};
  const BAB_FR   = {full:'Complet (+1/niv)', medium:'Moyen (+¾/niv)', poor:'Faible (+½/niv)'};
  const SAVE_LBL = {good:'✅ Bon', poor:'❌ Faible', medium:'☑ Moyen'};
  const SAVE_COLOR = {good:'var(--green)', poor:'var(--text-dim)', medium:'var(--gold)'};
  const ROLE_COLOR = {martial:'var(--red)',arcane:'#7a8fe8',divine:'var(--gold)',hybrid:'var(--green)',psionic:'#a080d0',incarnum:'#50b0a0'};
  const SPELL_LABEL = {none:'—', arcane:'Arcanique', divine:'Divin', both:'Arc. + Div.', maneuvers:'Manœuvres', psionic:'Psionique', invocations:'Invocations', incarnum:'Incarnum'};
  const AB_FR = {STR:'FOR',DEX:'DEX',CON:'CON',INT:'INT',WIS:'SAG',CHA:'CHA'};
  const tags = CLASS_TAGS[classId]||[];
  const ref  = CLASS_SOURCE_REFS[classId]||{};
  const hitDieColor = c.hitDie>=10?'var(--green)':c.hitDie>=8?'var(--gold)':'var(--text-dim)';
  const pAbilities = (c.primaryAbilities||[]).map(a=>AB_FR[a]||a);

  // ── Section builder helpers ──
  const sectionTitle = (title, icon='') =>
    `<div style="display:flex;align-items:center;gap:8px;margin:20px 0 10px;border-bottom:1px solid var(--border);padding-bottom:6px;">
       <span style="font-size:14px;">${icon}</span>
       <div style="font-size:10px;font-family:'Cinzel',serif;letter-spacing:2px;color:var(--gold-dim);font-weight:700;">${title}</div>
     </div>`;

  // ── DESCRIPTION ──
  const descBlock = `
    <p style="font-size:13px;color:var(--text-dim);font-style:italic;line-height:1.65;margin:0 0 10px;border-left:3px solid var(--gold-dim);padding-left:12px;">
      ${c.desc}
    </p>
    ${extra.descLong ? `<p style="font-size:13px;color:var(--text-bright);line-height:1.7;margin:0;">${extra.descLong}</p>` : ''}`;

  // ── STATS GRID ──
  const statsBlock = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0;">
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center;">
        <div style="font-size:9px;font-family:'Cinzel',serif;letter-spacing:1px;color:var(--text-dim);margin-bottom:4px;">DÉ DE VIE</div>
        <div style="font-size:30px;font-weight:700;color:${hitDieColor};font-family:'Cinzel',serif;">d${c.hitDie}</div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center;">
        <div style="font-size:9px;font-family:'Cinzel',serif;letter-spacing:1px;color:var(--text-dim);margin-bottom:4px;">BBA</div>
        <div style="font-size:12px;font-weight:700;color:var(--gold);margin-top:4px;line-height:1.3;">${BAB_FR[c.babProg]||c.babProg}</div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center;">
        <div style="font-size:9px;font-family:'Cinzel',serif;letter-spacing:1px;color:var(--text-dim);margin-bottom:4px;">COMP./NIV.</div>
        <div style="font-size:24px;font-weight:700;color:var(--gold-light);font-family:'Cinzel',serif;">${c.spPerLvl}<span style="font-size:12px;">+INT</span></div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center;">
        <div style="font-size:9px;font-family:'Cinzel',serif;letter-spacing:1px;color:var(--text-dim);margin-bottom:4px;">MAGIE</div>
        <div style="font-size:11px;font-weight:600;color:var(--text-bright);margin-top:4px;line-height:1.3;">${SPELL_LABEL[c.spellType]||c.spellType}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">
      ${[['Vigueur','fort'],['Réflexes','ref'],['Volonté','will']].map(([label,key])=>`
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px;text-align:center;">
        <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:1px;">${label.toUpperCase()}</div>
        <div style="font-size:12px;font-weight:600;margin-top:3px;color:${SAVE_COLOR[c[key]]||'var(--text-dim)'};">${SAVE_LBL[c[key]]||c[key]}</div>
      </div>`).join('')}
    </div>
    ${tags.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">
      ${tags.map(t=>`<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(100,150,200,0.12);color:#7aabcc;border:1px solid #7aabcc33;">${t}</span>`).join('')}
    </div>`:''}
    ${pAbilities.length?`<div style="font-size:12px;color:var(--text-dim);margin-bottom:4px;">
      <strong style="color:var(--text-bright);">Caractéristiques clés :</strong> ${pAbilities.join(', ')}
    </div>`:''}`;

  // ── PRÉREQUIS (prestige) ──
  const prereqBlock = c.prerequisites ? `
    ${sectionTitle('PRÉREQUIS','🔒')}
    <div style="background:rgba(200,160,60,0.07);border:1px solid rgba(200,160,60,0.2);border-radius:6px;padding:10px 14px;font-size:12px;color:var(--text-dim);">${c.prerequisites}</div>` : '';

  // ── CAPACITÉS DE CLASSE ──
  const featuresBlock = extra.features && extra.features.length ? `
    ${sectionTitle('CAPACITÉS DE CLASSE','⚡')}
    <div style="display:grid;gap:6px;">
      ${extra.features.map(f=>`
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px 12px;">
        <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:3px;">
          <span style="font-size:14px;">${f.icon||'▸'}</span>
          <span style="font-size:12px;font-weight:700;color:var(--gold-light);">${f.name}</span>
        </div>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.5;padding-left:20px;">${f.desc}</div>
      </div>`).join('')}
    </div>` : '';

  // ── PROGRESSION ──
  const progBlock = extra.progressionHighlights && extra.progressionHighlights.length ? `
    ${sectionTitle('PROGRESSION CLÉE','📈')}
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;overflow:hidden;">
      ${extra.progressionHighlights.map((p,i)=>`
      <div style="display:flex;gap:10px;align-items:baseline;padding:6px 12px;${i%2===0?'background:rgba(255,255,255,0.02)':''};">
        <span style="font-size:11px;font-family:'Cinzel',serif;color:var(--gold);font-weight:700;min-width:50px;">Niv.${p.level}</span>
        <span style="font-size:12px;color:var(--text-dim);">${p.text}</span>
      </div>`).join('')}
    </div>` : '';

  // ── MAGIE ──
  const spellBlock = extra.spellcastingInfo ? `
    ${sectionTitle('INCANTATION','✨')}
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px 14px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <div style="font-size:11px;color:var(--text-dim);">Caractéristique : <strong style="color:var(--gold);">${AB_FR[extra.spellcastingInfo.ability]||extra.spellcastingInfo.ability}</strong></div>
        <div style="font-size:11px;color:var(--text-dim);">Spontané : <strong style="color:var(--gold);">${extra.spellcastingInfo.spontaneous?'Oui':'Non'}</strong></div>
        <div style="font-size:11px;color:var(--text-dim);">Grimoire requis : <strong style="color:var(--gold);">${extra.spellcastingInfo.spellbook?'Oui':'Non'}</strong></div>
        <div style="font-size:11px;color:var(--text-dim);">Préparation : <strong style="color:var(--gold);">${extra.spellcastingInfo.prep?'Oui':'Non'}</strong></div>
      </div>
      ${extra.spellcastingInfo.note?`<div style="font-size:12px;color:var(--text-dim);line-height:1.5;font-style:italic;border-top:1px solid var(--border);padding-top:8px;">${extra.spellcastingInfo.note}</div>`:''}
    </div>` : '';

  // ── MÉCANIQUE SPÉCIALE ──
  const specialBlock = extra.specialMechanics && extra.specialMechanics.length ? `
    ${sectionTitle('MÉCANIQUES SPÉCIALES','🔧')}
    <div style="display:grid;gap:6px;">
      ${extra.specialMechanics.map(m=>`
      <div style="background:rgba(100,60,180,0.08);border:1px solid rgba(100,60,180,0.2);border-radius:6px;padding:10px 12px;">
        <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:3px;">
          <span style="font-size:14px;">${m.icon||'🔧'}</span>
          <span style="font-size:12px;font-weight:700;color:#b090f0;">${m.name}</span>
        </div>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.5;padding-left:20px;">${m.desc}</div>
      </div>`).join('')}
    </div>` : '';

  // ── COMPÉTENCES DE CLASSE ──
  const skillsBlock = c.classSkills && c.classSkills.length ? `
    ${sectionTitle('COMPÉTENCES DE CLASSE','📚')}
    <div style="display:flex;flex-wrap:wrap;gap:4px;">
      ${c.classSkills.map(sk=>{const sr=SKILL_REF[sk];return`<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">${sr?(sr.nameFr||sr.name):sk}</span>`;}).join('')}
    </div>` : '';

  // ── FOOTER ACTIONS ──
  const footerBlock = `
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding-top:16px;margin-top:20px;border-top:1px solid var(--border);">
      <div style="flex:1;">
        <div style="font-size:11px;color:var(--text-dim);">Source : <strong style="color:var(--gold);">${ref.full||c.source}</strong>${ref.page?` · p.${ref.page}`:''}</div>
      </div>
      <button class="btn btn-secondary" style="font-size:11px;" onclick="openClassWiki('${classId}')">📖 Wiki</button>
      ${ref.url?`<button class="btn btn-secondary" style="font-size:11px;" onclick="window.open('${ref.url}','_blank')">🔗 SRD</button>`:''}
      ${extra.guideUrl?`<button class="btn btn-secondary" style="font-size:11px;" onclick="window.open('${extra.guideUrl}','_blank')">📘 Guide</button>`:''}
      <button class="btn btn-primary" style="font-size:11px;" onclick="selectClassForProgression('${classId}')">⬆ Choisir</button>
    </div>`;

  el.innerHTML = `
  <div class="panel" style="overflow-y:auto;max-height:calc(100vh - 160px);">
    <!-- HEADER -->
    <div class="panel-header" style="padding:16px 20px;position:sticky;top:0;z-index:2;background:var(--bg2);">
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
        <span style="font-size:36px;line-height:1;flex-shrink:0;">${c.icon||'⚔'}</span>
        <div style="flex:1;min-width:0;">
          <div class="cinzel" style="font-size:19px;font-weight:700;color:var(--gold-light);">${c.name}</div>
          ${c.nameEn&&c.nameEn!==c.name?`<div style="font-size:12px;color:var(--text-dim);font-style:italic;">${c.nameEn}</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;">
          <span style="font-size:10px;padding:2px 9px;border-radius:10px;background:rgba(0,0,0,0.2);color:${ROLE_COLOR[c.role]||'var(--text-dim)'};border:1px solid currentColor;">${(c.role||'').toUpperCase()}</span>
          ${c.isPrestige?`<span style="font-size:9px;padding:2px 7px;border-radius:9px;background:rgba(200,60,60,0.15);color:var(--red);border:1px solid var(--red);">PRESTIGE</span>`:''}
          <span style="font-size:10px;color:var(--gold-dim);">${c.source}</span>
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div class="panel-body" style="padding:16px 20px 24px;">
      ${descBlock}
      ${statsBlock}
      ${prereqBlock}
      ${featuresBlock}
      ${progBlock}
      ${spellBlock}
      ${specialBlock}
      ${skillsBlock}
      ${footerBlock}
    </div>
  </div>`;
}

function selectClassForProgression(classId) {
  _lastSelectedClassId = classId;
  showBuildPage('progression');
  // After navigation the selector will be restored by _refreshBuildClassData()
  // Also show a brief toast
  const c = CLASS_REF[classId];
  if (c) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg3);border:1px solid var(--gold-dim);border-radius:8px;padding:10px 20px;font-family:Cinzel,serif;font-size:12px;color:var(--gold-light);z-index:9999;';
    toast.textContent = `${c.icon||''} ${c.name} sélectionné · ⬆ Progression de niveau`;
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(), 2500);
  }
}

// Build <optgroup>-grouped class select HTML from CLASS_REF
function _buildClassSelectHtml() {
  return _CLASS_CATEGORY_ORDER.map(cat => {
    const entries = Object.entries(CLASS_REF).filter(([,c]) => c.category === cat);
    if (!entries.length) return '';
    return `<optgroup label="${_CLASS_CATEGORY_LABELS[cat]||cat}">
      ${entries.map(([id,c]) => `<option value="${id}">${c.icon||''} ${c.name}${c.nameEn&&c.nameEn!==c.name?' / '+c.nameEn:''} — d${c.hitDie}</option>`).join('')}
    </optgroup>`;
  }).join('');
}

// ── PROGRESSION DE NIVEAU PAGE ─────────────────────────────────

// ═══════════════════════════════════════════════════════════
// SECTION 6 — BUILD : Classes / Progression
// ═══════════════════════════════════════════════════════════

function renderBuildProgression() {
  const el = document.getElementById('build-page-progression');
  if (!el) return;

  // ── INIT: always rebuild the shell to avoid stale state ──
  {
    el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 370px;gap:16px;align-items:start;">

      <!-- LEFT: progression table + templates + ACF -->
      <div>
        <div class="panel mb-12">
          <div class="panel-header">
            <span class="panel-title">⬆ PROGRESSION DE NIVEAU</span>
            <div id="build-class-badges" style="display:flex;gap:8px;align-items:center;"></div>
          </div>
          <div class="panel-body" style="padding:0;">
            <div style="max-height:360px;overflow-y:auto;">
              <table class="level-table" style="width:100%">
                <thead><tr>
                  <th style="width:36px;">NV</th>
                  <th data-i18n="th_class">CLASSE</th>
                  <th style="width:40px;">DV</th>
                  <th style="width:40px;">PV</th>
                  <th style="width:50px;">Comp.</th>
                  <th>Don / Capacités</th>
                  <th style="width:36px;"></th>
                </tr></thead>
                <tbody id="build-level-tbody"></tbody>
              </table>
            </div>
          </div>
          <div class="panel-body" style="border-top:1px solid var(--border);padding:8px 14px;" id="build-bab-block"></div>
        </div>

        <div class="panel mb-12">
          <div class="panel-header">
            <span class="panel-title">GABARITS (TEMPLATES)</span>
            <span class="small text-dim" id="template-header-info"></span>
          </div>
          <div class="panel-body">
            <div id="template-chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>
            <select id="template-select" style="width:100%;font-size:12px;margin-bottom:8px;">
              <option value="">— Choisir un gabarit —</option>
              ${Object.entries(TEMPLATE_DB).map(([id,t])=>`<option value="${id}">${t.nameFr} / ${t.nameEn} (LA +${t.la}) — ${t.source}</option>`).join('')}
            </select>
            <button class="btn btn-secondary btn-small" onclick="applyTemplate(document.getElementById('template-select').value)">+ Appliquer</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><span class="panel-title">VARIANTES DE CLASSE (ACF)</span><span class="small text-dim">Alternate Class Features</span></div>
          <div class="panel-body" id="acf-panel"><div class="text-dim small">Sélectionnez des niveaux de classe pour voir les ACF disponibles.</div></div>
        </div>
      </div>

      <!-- RIGHT: add level form -->
      <div>
        <div class="panel mb-12">
          <div class="panel-header">
            <span class="panel-title">⬆ AJOUTER UN NIVEAU</span>
            <span class="small text-dim">Niv. ${AppState.levels.length + 1}</span>
          </div>
          <div class="panel-body">

            <!-- Class selector -->
            <div class="form-group" style="margin-bottom:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                <label style="margin:0;">CLASSE</label>
                <button class="btn btn-secondary btn-small" style="font-size:9px;" onclick="showBuildPage('classlibrary')">⚔ Parcourir les classes</button>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <select id="lu-class" onchange="updateLuHitDie()" style="flex:1;font-size:12px;">
                  ${_buildClassSelectHtml()}
                </select>
                <span id="lu-hitdie-badge" style="padding:3px 10px;border-radius:12px;font-family:'Cinzel',serif;font-weight:700;font-size:13px;background:rgba(201,147,58,0.15);color:var(--gold-light);border:1px solid var(--gold-dim);white-space:nowrap;min-width:40px;text-align:center;">d8</span>
              </div>
            </div>

            <!-- Class preview -->
            <div id="lu-class-preview" style="display:none;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px;margin-bottom:10px;font-size:12px;"></div>

            <!-- HP -->
            <div class="form-group" style="margin-bottom:6px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                <label style="margin:0;">DÉ DE VIE LANCÉ</label>
                <span id="lu-hp-suggest" style="font-size:10px;color:var(--text-dim);"></span>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <input type="number" id="lu-hp" value="${_lastSelectedClassId && CLASS_REF[_lastSelectedClassId] ? Math.ceil(CLASS_REF[_lastSelectedClassId].hitDie/2)+1 : 5}" min="1" style="width:65px;">
                <button class="btn btn-secondary btn-small" onclick="rollHPDie()">🎲 Lancer</button>
                <button class="btn btn-secondary btn-small" onclick="document.getElementById('lu-hp').value=CLASS_REF[document.getElementById('lu-class').value]?.hitDie||8;">Max</button>
              </div>
            </div>

            <!-- Ability increase -->
            <div class="form-group" id="lu-ability-section" style="margin-bottom:6px;">
              <label>AUGM. CARAC. <span class="text-dim" style="font-size:10px;">(niv. 4, 8, 12…)</span></label>
              <select id="lu-ability-inc" style="font-size:12px;">
                <option value="">— aucune —</option>
                <option value="STR">FOR (STR)</option><option value="DEX">DEX</option><option value="CON">CON</option>
                <option value="INT">INT</option><option value="WIS">SAG (WIS)</option><option value="CHA">CHA</option>
              </select>
            </div>

            <!-- Feat -->
            <div class="form-group" style="margin-bottom:6px;">
              <label>DON <span class="text-dim" style="font-size:10px;">(si applicable)</span></label>
              <select id="lu-feat" style="font-size:12px;">
                <option value="">— aucun —</option>
                ${Object.entries(FEAT_DB).map(([id,f])=>`<option value="${id}">${f.nameFr||f.nameEn}</option>`).join('')}
              </select>
            </div>

            <!-- Features notes -->
            <div class="form-group" style="margin-bottom:10px;">
              <label>CAPACITÉS <span class="text-dim" style="font-size:10px;">(séparées par virgule)</span></label>
              <textarea id="lu-features" rows="2" placeholder="Ex: Turn Undead, Rage, Sneak Attack…" style="font-size:12px;"></textarea>
            </div>

            <div style="display:flex;gap:8px;">
              <button class="btn btn-primary" onclick="addLevel();" style="flex:2;font-size:13px;letter-spacing:1px;">⬆ AJOUTER LE NIVEAU</button>
              <button class="btn btn-danger"  onclick="removeLastLevel();" style="flex:1;font-size:11px;" title="Annuler le dernier niveau">↩ Annuler</button>
            </div>
          </div>
        </div>

        <!-- Quick class stats reminder (updates with selection) -->
        <div class="panel" id="prog-class-summary" style="display:none;">
          <div class="panel-header"><span class="panel-title" id="prog-class-name">CLASSE</span></div>
          <div class="panel-body" id="prog-class-body" style="font-size:12px;"></div>
        </div>
      </div>
    </div>`;
  }

  // ── UPDATE: refresh data parts ──
  _refreshBuildClassData();
}

// Keep old name as alias for any remaining references
function renderBuildClasses() { renderBuildProgression(); }

function _refreshBuildClassData() {
  // Badges (level / LA / ECL)
  const badgesEl = document.getElementById('build-class-badges');
  if (badgesEl) {
    badgesEl.innerHTML = `
      <span class="small text-dim">Niveau ${AppState.levels.length}</span>
      ${getCharacterLA()>0?`<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(200,60,60,0.15);color:var(--red);border:1px solid var(--red);">LA +${getCharacterLA()}</span>`:''}
      <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(201,147,58,0.15);color:var(--gold);border:1px solid var(--gold-dim);font-family:'Cinzel',serif;">ECL ${getECL()}</span>`;
  }

  // BAB block
  const babEl = document.getElementById('build-bab-block');
  if (babEl) babEl.innerHTML = renderBuildBabBlock();

  // Template header + chips
  const tplHeader = document.getElementById('template-header-info');
  if (tplHeader) tplHeader.textContent = `${(AppState.character.templates||[]).length} actif(s) · LA total: +${getCharacterLA()}`;
  const tplChips = document.getElementById('template-chips');
  if (tplChips) {
    tplChips.innerHTML = (AppState.character.templates||[]).map(tid => {
      const t = TEMPLATE_DB[tid];
      return t ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;background:rgba(200,60,60,0.12);border:1px solid var(--red);border-radius:12px;font-size:11px;">
        <span>${t.nameFr}</span><span style="color:var(--text-dim);font-size:10px;">LA+${t.la}</span>
        <button style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px;padding:0;" onclick="removeTemplate('${tid}')">✕</button>
      </span>` : '';
    }).join('') || '<span class="text-dim small">Aucun gabarit actif.</span>';
  }

  // Level progression table
  const tbody = document.getElementById('build-level-tbody');
  if (tbody) {
    if (AppState.levels.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-dim small text-center" style="padding:18px;">Aucun niveau — choisissez une classe et cliquez ⬆ Ajouter.</td></tr>';
    } else {
      tbody.innerHTML = '';
      AppState.levels.forEach((lvl, idx) => {
        const cls = CLASS_REF[lvl.classId];
        const isLast = idx === AppState.levels.length - 1;
        const tr = document.createElement('tr');
        if (isLast) tr.className = 'current-level';
        tr.innerHTML = `
          <td class="text-gold cinzel" style="text-align:center;">${lvl.levelNumber}</td>
          <td><span style="font-size:13px;">${cls?.icon||''}</span> ${cls ? cls.name : lvl.classId}</td>
          <td class="cinzel" style="color:var(--gold-dim);text-align:center;">${lvl.hitDie||'—'}</td>
          <td style="text-align:center;color:var(--green);">${lvl.hpRolled||'—'}</td>
          <td style="text-align:center;">${lvl.skillPointsGained||0}</td>
          <td class="text-dim small">${lvl.featChosenId?(FEAT_DB[lvl.featChosenId]?.nameFr||lvl.featChosenId):'—'}</td>
          <td style="text-align:center;">${isLast ? `<button onclick="removeLastLevel();" class="btn btn-danger btn-small" style="padding:1px 7px;font-size:11px;" title="Annuler ce niveau">✕</button>` : ''}</td>`;
        tbody.appendChild(tr);
      });
    }
  }

  // Restore selected class after re-render
  const sel = document.getElementById('lu-class');
  if (sel && _lastSelectedClassId) {
    sel.value = _lastSelectedClassId;
    // If value didn't stick (class not in list?), fall back to fighter
    if (!sel.value) sel.value = 'class_fighter';
  }
  // Sync the hitdie badge + preview to the current selection
  if (sel) {
    const cls = CLASS_REF[sel.value];
    const badge = document.getElementById('lu-hitdie-badge');
    if (badge && cls) badge.textContent = `d${cls.hitDie}`;
    const suggestEl = document.getElementById('lu-hp-suggest');
    if (suggestEl && cls) suggestEl.textContent = `max:${cls.hitDie} moy:${Math.ceil(cls.hitDie/2)+1}`;
    // Show preview only if user has already interacted (class !== default empty)
    if (_lastSelectedClassId) renderClassPreview(sel.value);
  }

  // Ability increase hint: suggest at levels 4,8,12,16,20
  const nextLvl = AppState.levels.length + 1;
  const abSection = document.getElementById('lu-ability-section');
  if (abSection) {
    const isAbilityLevel = nextLvl % 4 === 0;
    abSection.style.borderLeft = isAbilityLevel ? '3px solid var(--gold)' : 'none';
    abSection.style.paddingLeft = isAbilityLevel ? '8px' : '0';
    const lbl = abSection.querySelector('label');
    if (lbl) lbl.style.color = isAbilityLevel ? 'var(--gold-light)' : '';
  }

  renderClassRefList();
  renderAcfPanel();
}

function applyTemplate(tid) {
  if (!tid) return;
  const t = TEMPLATE_DB[tid];
  if (!t) return;
  if (!AppState.character.templates) AppState.character.templates = [];
  if (AppState.character.templates.includes(tid)) {
    alert(`Le gabarit "${t.nameFr}" est déjà appliqué.`);
    return;
  }
  AppState.character.templates.push(tid);
  // Apply ability mods
  Object.entries(t.abilityMods||{}).forEach(([ab, val]) => {
    if (AppState.character.abilityScores[ab]) {
      AppState.character.abilityScores[ab].racial = (AppState.character.abilityScores[ab].racial||0) + val;
    }
  });
  // Apply natural armor
  if (t.naturalArmorBonus) {
    const cur = AppState.character.abilityScores; // store in buff instead
    // We add a passive buff for the natural armor
    const buffId = 'tpl_nat_' + tid;
    AppState.buffs = AppState.buffs.filter(b=>b.id!==buffId);
    AppState.buffs.push({
      id: buffId, name: `${t.nameFr} — Armure nat.`, isActive:true, isSelf:true,
      spellId:null, duration:'permanent',
      effects:[{target:'defense.naturalArmor', bonusType:'natural_armor', value:t.naturalArmorBonus}]
    });
  }
  const detail = document.getElementById('template-detail');
  if (detail) detail.textContent = `✓ ${t.nameFr} appliqué. LA +${t.la}. Vérifiez les effets dans Caractéristiques.`;
  autosave(); renderAll(); renderBuildClasses();
}

function removeTemplate(tid) {
  const t = TEMPLATE_DB[tid];
  if (!t) return;
  AppState.character.templates = (AppState.character.templates||[]).filter(id=>id!==tid);
  // Revert ability mods
  Object.entries(t.abilityMods||{}).forEach(([ab, val]) => {
    if (AppState.character.abilityScores[ab]) {
      AppState.character.abilityScores[ab].racial = (AppState.character.abilityScores[ab].racial||0) - val;
    }
  });
  // Remove natural armor buff
  const buffId = 'tpl_nat_' + tid;
  AppState.buffs = AppState.buffs.filter(b=>b.id!==buffId);
  autosave(); renderAll(); renderBuildClasses();
}

function renderAcfPanel() {
  const el = document.getElementById('acf-panel');
  if (!el) return;
  // Get unique classes the character has
  const charClasses = [...new Set(AppState.levels.map(l=>l.classId))];
  if (charClasses.length === 0) {
    el.innerHTML = '<div class="text-dim small">Aucune classe sélectionnée.</div>';
    return;
  }
  // Get ACFs for these classes
  const applicable = Object.entries(ACF_DB).filter(([,acf]) => charClasses.includes(acf.classId));
  if (applicable.length === 0) {
    el.innerHTML = '<div class="text-dim small">Pas de variante connue pour ces classes.</div>';
    return;
  }
  const selected = AppState.character.acfs || [];
  el.innerHTML = applicable.map(([id, acf]) => {
    const isOn = selected.includes(id);
    const cls = CLASS_REF[acf.classId];
    return `<div style="padding:7px 0;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:flex-start;">
      <input type="checkbox" ${isOn?'checked':''} onchange="toggleAcf('${id}',this.checked)" style="margin-top:3px;flex-shrink:0;">
      <div style="flex:1;">
        <div style="font-size:12px;font-weight:600;color:var(--text-bright);">${acf.nameFr} <span style="font-size:10px;color:var(--text-dim);">(${acf.nameEn})</span></div>
        <div style="font-size:10px;color:var(--gold-dim);">${cls?cls.name:acf.classId} · ${acf.source} · remplace niv. ${acf.levelReplaced}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:2px;font-style:italic;">${acf.desc}</div>
      </div>
    </div>`;
  }).join('');
}

function toggleAcf(id, on) {
  if (!AppState.character.acfs) AppState.character.acfs = [];
  if (on) {
    if (!AppState.character.acfs.includes(id)) AppState.character.acfs.push(id);
  } else {
    AppState.character.acfs = AppState.character.acfs.filter(a=>a!==id);
  }
  autosave();
  renderAcfPanel();  // re-render so checkbox state is consistent
}

function renderClassRefList() {
  const el = document.getElementById('classref-list');
  if (!el) return;
  const q = (document.getElementById('classref-search')?.value||'').toLowerCase();
  const catF = document.getElementById('classref-cat')?.value||'';
  const roleF = document.getElementById('classref-role')?.value||'';
  const prestigeOnly = document.getElementById('classref-prestige-only')?.checked||false;
  const BAB_FR = {full:'Complet',medium:'Moyen',poor:'Faible'};
  const SAVE_FR = {good:'Bon',poor:'Faible',medium:'Moy'};
  const SPELL_FR = {none:'—',arcane:'Arc',divine:'Div',both:'Arc+Div',maneuvers:'Manœ',psionic:'Psi',invocations:'Inv',incarnum:'Inc'};

  const filtered = Object.entries(CLASS_REF).filter(([id,c]) => {
    if (catF && c.category !== catF) return false;
    if (roleF && c.role !== roleF) return false;
    if (prestigeOnly && !c.isPrestige) return false;
    if (q && !c.name.toLowerCase().includes(q) && !(c.nameEn||'').toLowerCase().includes(q) && !(c.desc||'').toLowerCase().includes(q)) return false;
    return true;
  });

  if (!filtered.length) { el.innerHTML = '<div class="text-dim small text-center" style="padding:16px;">Aucun résultat</div>'; return; }

  const CATEGORY_ORDER = ['core','supplement','hybrid','tome_of_battle','psionic','incarnum','prestige','npc'];
  const CATEGORY_LABELS = {core:'PHB Core',supplement:'Suppléments',hybrid:'Hybrides & Autres',tome_of_battle:'Tome of Battle',psionic:'Psionique',incarnum:'Incarnum',prestige:'Prestige',npc:'PNJ'};
  const grouped = {};
  filtered.forEach(([id,c])=>{ (grouped[c.category]=grouped[c.category]||[]).push([id,c]); });

  el.innerHTML = '';
  CATEGORY_ORDER.forEach(cat => {
    if (!grouped[cat]) return;
    const hdr = document.createElement('div');
    hdr.style.cssText = 'padding:4px 8px;background:var(--bg3);border-bottom:1px solid var(--border);font-size:9px;font-family:Cinzel,serif;letter-spacing:1px;color:var(--gold-dim);';
    hdr.textContent = (CATEGORY_LABELS[cat]||cat).toUpperCase();
    el.appendChild(hdr);
    grouped[cat].forEach(([id,c]) => {
      const row = document.createElement('div');
      row.style.cssText = 'padding:7px 10px;border-bottom:1px solid var(--border);cursor:pointer;';
      row.title = (c.desc||'') + (c.prerequisites?'\nPrérequis: '+c.prerequisites:'');
      row.onmouseenter=()=>row.style.background='rgba(255,255,255,0.04)';
      row.onmouseleave=()=>row.style.background='';
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="font-size:14px;">${c.icon||'⚔'}</span>
          <span style="font-size:12px;font-weight:600;color:var(--text-bright);">${c.name}</span>
          ${c.nameEn&&c.nameEn!==c.name?`<span style="font-size:10px;color:var(--text-dim);">/ ${c.nameEn}</span>`:''}
          ${c.isPrestige?'<span style="font-size:9px;padding:1px 4px;border-radius:6px;background:rgba(180,60,60,0.15);color:var(--red);border:1px solid #cc444433;">PRC</span>':''}
          <span style="margin-left:auto;display:flex;gap:4px;align-items:center;">
            <span style="font-size:10px;color:var(--gold-dim);">${c.source}</span>
            <button class="btn btn-secondary btn-small" style="font-size:9px;padding:1px 5px;" onclick="event.stopPropagation();openClassWiki('${id}')">📖</button>
          </span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:9px;color:var(--text-dim);margin-bottom:3px;">
          <span>d${c.hitDie}</span>
          <span>BBA: ${BAB_FR[c.babProg]||c.babProg}</span>
          <span>Vig: ${SAVE_FR[c.fort]||c.fort}</span>
          <span>Ref: ${SAVE_FR[c.ref]||c.ref}</span>
          <span>Vol: ${SAVE_FR[c.will]||c.will}</span>
          <span>${c.spPerLvl} comp./nv</span>
          <span>Magie: ${SPELL_FR[c.spellType]||c.spellType}</span>
        </div>
        ${(CLASS_TAGS[id]||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:3px;">
          ${(CLASS_TAGS[id]||[]).map(t=>`<span style="font-size:9px;padding:1px 5px;border-radius:8px;background:rgba(100,150,200,0.12);color:#7aabcc;border:1px solid #7aabcc33;">${t}</span>`).join('')}
        </div>`:''}`;
      row.onclick = () => {
        const sel = document.getElementById('lu-class');
        if (sel) {
          sel.value = id;
          _lastSelectedClassId = id;
          updateLuHitDie();
          // Scroll the add-level panel into view
          document.getElementById('lu-class')?.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
      };
      el.appendChild(row);
    });
  });
}

function renderBuildBabBlock() {
  const bab = getBAB();
  const babStr = getBABProgressionString(bab);
  return `<div style="display:flex;gap:16px;align-items:center;">
    <div><div class="small text-dim">BBA ACTUEL</div><div class="bold cinzel" style="color:var(--gold);font-size:18px;">${babStr}</div></div>
    <div class="text-dim small">Niv. total : <strong class="text-bright">${AppState.levels.length}</strong></div>
  </div>`;
}

// ── 4. DONS ─────────────────────────────────────────────────────
let featFilter = { search: '', type: 'all', source: 'all', showSelected: false };


// ═══════════════════════════════════════════════════════════
// SECTION 7 — BUILD : Dons
// ═══════════════════════════════════════════════════════════

function _buildFeatCards(shown, selectedFeatIds) {
  if (shown.length === 0) {
    return '<div class="text-dim small text-center" style="padding:30px;">Aucun don correspondant aux filtres.</div>';
  }
  return shown.map(([id, f]) => {
    const isSelected = selectedFeatIds.has(id);
    const preqs = checkFeatPrereqs(id);
    const typeBadgeColor = { general:'var(--text-dim)', combat:'var(--red)', spell:'#7a8fe8', metamagic:'var(--gold)', creation:'var(--green)', special:'#a080d0' }[f.type] || 'var(--text-dim)';
    const mmBadge = f.type === 'metamagic' ? `<span style="background:rgba(201,147,58,0.12);border:1px solid var(--gold-dim);border-radius:3px;padding:0 4px;font-size:9px;color:var(--gold-dim);">+${f.slotCost||1} slot</span>` : '';
    const prereqHtml = preqs.details.length === 0 ? '' : `
      <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;">
        ${preqs.details.map(d=>`<span class="${d.met?'prereq-met':'prereq-fail'}" style="font-size:10px;padding:1px 6px;border-radius:3px;">
          ${d.met?'✔':'✖'} ${d.text}
        </span>`).join('')}
      </div>`;
    return `
      <div class="feat-card ${isSelected?'feat-selected':''} ${!preqs.met&&!isSelected?'feat-disabled':''}" style="cursor:pointer;">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">
              <span style="font-weight:700;color:${isSelected?'var(--gold-light)':'var(--text-bright)'};font-size:13px;">${f.nameFr||f.nameEn}</span>
              <span style="font-size:11px;color:var(--gold-dim);font-style:italic;">${f.nameEn}</span>
              <span style="font-size:9px;background:var(--bg4);color:${typeBadgeColor};border:1px solid ${typeBadgeColor};border-radius:3px;padding:0 4px;">${f.type}</span>
              <span style="font-size:9px;color:var(--text-dim);">${f.source}</span>
              ${mmBadge}
            </div>
            <div style="font-size:12px;color:var(--text-dim);font-style:italic;">${f.desc||''}</div>
            ${prereqHtml}
          </div>
          <button onclick="${isSelected?`removeFeat('${id}')`:`addFeat('${id}')`}"
            class="btn btn-small ${isSelected?'btn-danger':'btn-primary'}" style="flex-shrink:0;white-space:nowrap;">
            ${isSelected ? '✕ Retirer' : '+ Choisir'}
          </button>
        </div>
      </div>`;
  }).join('');
}

function setFeatSource(fi, source) {
  if (AppState.feats[fi]) { AppState.feats[fi].source = source; autosave(); _refreshFeatsSelected(); }
}

function setFeatNotes(fi, notes) {
  if (AppState.feats[fi]) { AppState.feats[fi].notes = notes; autosave(); }
}

function setFeatCount(fi, n) {
  if (!AppState.feats[fi]) return;
  AppState.feats[fi].count = Math.max(1, parseInt(n)||1);
  autosave();
  _refreshFeatsSelected();
}

function _buildFeatsSummaryHtml() {
  if (!AppState.feats || AppState.feats.length === 0) return '';
  const SRC_OPTS = [['level','Niveau'],['racial','Racial'],['class_bonus','Classe bonus'],['mj','MJ'],['other','Autre']];
  const rows = AppState.feats.map((feat, fi) => {
    const fd      = FEAT_DB[feat.id] || {};
    const nameFr  = fd.nameFr || feat.name || feat.id;
    const nameEn  = fd.nameEn || feat.id;
    const desc    = fd.desc   || '';
    const isRep   = !!(fd.repeatable);
    const count   = feat.count || 1;
    const notes   = (feat.notes || '').replace(/"/g, '&quot;');
    const srcOpts = SRC_OPTS.map(([v,l]) =>
      `<option value="${v}" ${(feat.source||'level')===v?'selected':''}>${l}</option>`
    ).join('');

    const countCell = isRep
      ? `<td style="padding:4px 6px;text-align:center;white-space:nowrap;">
           <button class="btn btn-secondary" style="padding:1px 7px;font-size:14px;line-height:1;" onclick="setFeatCount(${fi},${count-1})">−</button>
           <span style="font-size:13px;font-weight:700;color:var(--gold);margin:0 5px;">${count}×</span>
           <button class="btn btn-secondary" style="padding:1px 7px;font-size:14px;line-height:1;" onclick="setFeatCount(${fi},${count+1})">+</button>
         </td>`
      : `<td style="padding:4px 6px;text-align:center;color:var(--text-dim);font-size:11px;">1</td>`;

    const repBadge = isRep
      ? ` <span style="font-size:9px;color:var(--gold-dim);border:1px solid var(--gold-dim);border-radius:3px;padding:0 3px;">×N</span>`
      : '';

    return `<tr style="border-bottom:1px solid var(--border);">
      <td style="padding:4px 6px;">
        <select style="font-size:11px;" onchange="setFeatSource(${fi},this.value)">${srcOpts}</select>
      </td>
      ${countCell}
      <td style="padding:4px 6px;min-width:140px;">
        <input type="text" value="${notes}"
          placeholder="arme, compétence, détails…"
          style="font-size:11px;width:100%;min-width:120px;"
          oninput="setFeatNotes(${fi},this.value)">
      </td>
      <td class="small" style="padding:4px 6px;color:var(--gold);white-space:nowrap;">${nameFr}${repBadge}</td>
      <td class="small text-dim" style="padding:4px 6px;font-style:italic;white-space:nowrap;">${nameEn}</td>
      <td class="small text-dim" style="padding:4px 6px;font-size:11px;">${desc}</td>
    </tr>`;
  }).join('');

  const totalCount = AppState.feats.reduce((s, f) => s + (f.count||1), 0);
  return `
    <div class="panel mb-12">
      <div class="panel-header">
        <span class="panel-title">☑ DONS SÉLECTIONNÉS</span>
        <span class="small text-dim">${AppState.feats.length} entrée(s) · ${totalCount} prise(s) au total</span>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          <thead><tr style="border-bottom:2px solid var(--border);">
            <th class="text-dim small" style="text-align:left;padding:5px 6px;width:100px;">Source</th>
            <th class="text-dim small" style="text-align:center;padding:5px 6px;width:70px;">Nbre</th>
            <th class="text-dim small" style="text-align:left;padding:5px 6px;min-width:140px;">Détails / Notes</th>
            <th class="text-dim small" style="text-align:left;padding:5px 6px;">Nom FR</th>
            <th class="text-dim small" style="text-align:left;padding:5px 6px;">Nom EN</th>
            <th class="text-dim small" style="text-align:left;padding:5px 6px;">Description</th>
          </tr></thead>
          <tbody>${rows}</
      </div>
    </div>`;
  _renderAbilityExtras();
}


// ============================================================
// renderBuildFeats — page Dons
//
// Structure fixe, deux blocs TOUJOURS présents :
//   #feats-selected-block  → tableau dons sélectionnés (haut)
//   #feats-catalog-block   → filtres + catalogue (bas)
//
// Toutes les actions (add/remove/filter) rafraîchissent les deux
// blocs indépendamment, sans jamais remplacer el.innerHTML.
// ============================================================

function renderBuildFeats() {
  const el = document.getElementById('build-page-feats');
  if (!el) return;

  // Build shell once; refresh content on subsequent calls
  if (!document.getElementById('feats-selected-block')) {
    el.innerHTML = `
      <div id="feats-selected-block" style="margin-bottom:16px;"></div>
      <div id="feats-catalog-block"></div>`;
  }

  _refreshFeatsSelected();
  _refreshFeatsCatalog();
}

// ── Bloc 1 : dons sélectionnés ───────────────────────────────
function _refreshFeatsSelected() {
  const wrap = document.getElementById('feats-selected-block');
  if (!wrap) return;
  wrap.innerHTML = _buildFeatsSummaryHtml();
}

// ── Bloc 2 : filtres + catalogue ────────────────────────────
function _refreshFeatsCatalog() {
  const wrap = document.getElementById('feats-catalog-block');
  if (!wrap) return;

  const selectedFeatIds = new Set(AppState.feats.map(f => f.id));
  const shown = Object.entries(FEAT_DB).filter(([id, f]) => {
    if (featFilter.showSelected && !selectedFeatIds.has(id)) return false;
    if (featFilter.type   !== 'all' && f.type   !== featFilter.type)   return false;
    if (featFilter.source !== 'all' && f.source !== featFilter.source) return false;
    if (featFilter.search) {
      const q = featFilter.search.toLowerCase();
      if (!f.nameEn.toLowerCase().includes(q) &&
          !f.nameFr.toLowerCase().includes(q) &&
          !(f.desc||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const types   = ['all','general','combat','spell','metamagic','creation','special'];
  const typeFr  = { all:'Tous', general:'Général', combat:'Combat', spell:'Sort',
                    metamagic:'Métamagie', creation:'Création', special:'Spécial' };
  const sources = ['all', ...new Set(Object.values(FEAT_DB).map(f => f.source))];

  const typeBtns = types.map(t =>
    `<button onclick="featFilter.type='${t}';_refreshFeatsCatalog();"
      class="btn btn-small ${featFilter.type===t?'btn-primary':'btn-secondary'}"
      style="font-size:10px;">${typeFr[t]||t}</button>`
  ).join('');

  const srcBtns = sources.map(s =>
    `<button onclick="featFilter.source='${s}';_refreshFeatsCatalog();"
      class="btn btn-small ${featFilter.source===s?'btn-primary':'btn-secondary'}"
      style="font-size:10px;">${s}</button>`
  ).join('');

  wrap.innerHTML = `
    <div style="display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:start;">

      <!-- Sidebar filtres -->
      <div style="position:sticky;top:8px;">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">FILTRES</span></div>
          <div class="panel-body">
            <input type="text" placeholder="🔍 Chercher…" style="width:100%;margin-bottom:8px;"
              value="${(featFilter.search||'').replace(/"/g,'&quot;')}"
              oninput="featFilter.search=this.value;_refreshFeatsCatalog();">
            <div class="small text-dim mb-4">TYPE</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${typeBtns}</div>
            <div class="small text-dim mb-4">SOURCE</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${srcBtns}</div>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;">
              <input type="checkbox" ${featFilter.showSelected?'checked':''}
                onchange="featFilter.showSelected=this.checked;_refreshFeatsCatalog();">
              Sélectionnés uniquement
            </label>
          </div>
        </div>
      </div>

      <!-- Catalogue -->
      <div>
        <div class="small text-dim mb-8">${shown.length} don${shown.length!==1?'s':''} affiché${shown.length!==1?'s':''}</div>
        <div>${_buildFeatCards(shown, selectedFeatIds)}</div>
      </div>
    </div>`;
}



function addFeat(featId) {
  const fd = FEAT_DB[featId];
  const isRepeatable = fd && !!fd.repeatable;
  if (!isRepeatable && AppState.feats.find(f => f.id === featId)) return;
  AppState.feats.push({ id: featId, name: fd ? (fd.nameFr || fd.nameEn) : featId,
    source: 'level', count: 1, notes: '' });
  autosave();
  _refreshFeatsSelected();
  _refreshFeatsCatalog();
}

function removeFeat(featId) {
  AppState.feats = AppState.feats.filter(f => f.id !== featId);
  autosave();
  _refreshFeatsSelected();
  _refreshFeatsCatalog();
}

// ── 6. RÉSUMÉ BUILD ─────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
// SECTION 9 — BUILD : Résumé
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// BUILD — RÉSUMÉ  (reconstruction complète)
//
// Lit AppState directement.
// Ne dépend d'aucune fonction externe sauf rules.js.
// Appelée par showBuildPage('summary').
// ═══════════════════════════════════════════════════════════

function renderBuildSummary() {
  const el = document.getElementById('build-page-summary');
  if (!el) return;

  const chr      = AppState.character;
  const nfo      = chr.info || {};
  const levels   = AppState.levels || [];
  const feats    = AppState.feats  || [];
  const skills   = AppState.skillEntries || [];

  // ── helpers locaux ──────────────────────────────────────
  const sign = n => (n >= 0 ? '+' : '') + n;
  const STAT_FR = { STR:'FOR', DEX:'DEX', CON:'CON', INT:'INT', WIS:'SAG', CHA:'CHA' };

  // ── 1. RACE ───────────────────────────────────────────────
  const race = chr.raceId ? RACE_DB[chr.raceId] : null;
  let raceHtml = '';
  if (race) {
    const abMods = Object.entries(race.abilityMods || {}).map(([ab,v]) => {
      const col = v > 0 ? 'var(--green)' : 'var(--red)';
      return `<span style="font-size:11px;border:1px solid ${col};color:${col};border-radius:3px;padding:1px 5px;">${STAT_FR[ab]||ab} ${v>0?'+':''}${v}</span>`;
    }).join(' ');
    const traitsHtml = (race.traits||[]).map(t =>
      `<li style="font-size:12px;color:var(--text-dim);line-height:1.6;">${t}</li>`
    ).join('');
    raceHtml = `
      <div class="panel mb-12">
        <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🧬 RACE &amp; HÉRITAGE</span></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <div style="font-size:16px;font-family:'Cinzel',serif;color:var(--gold-light);font-weight:700;margin-bottom:4px;">${race.nameFr}</div>
            <div class="small text-dim" style="margin-bottom:6px;font-style:italic;">${race.nameEn} · ${race.source}${race.la>0?' · <span style="color:#ff9966;">LA +'+race.la+'</span>':''}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <span style="font-size:11px;color:var(--text-dim);">📐 ${race.size}</span>
              <span style="font-size:11px;color:var(--text-dim);">🏃 ${race.speed} ft.</span>
              ${(race.vision||[]).map(v=>`<span style="font-size:11px;color:var(--text-dim);">👁 ${v}</span>`).join('')}
            </div>
            ${abMods ? `<div style="display:flex;gap:4px;flex-wrap:wrap;">${abMods}</div>` : '<div class="small text-dim">Aucun modificateur racial</div>'}
          </div>
          <div>
            <div style="font-size:10px;letter-spacing:1px;font-family:'Cinzel',serif;color:var(--gold-dim);margin-bottom:5px;">TRAITS RACIAUX</div>
            <ul style="margin:0;padding-left:14px;">${traitsHtml}</ul>
          </div>
        </div>
      </div>`;
  } else {
    raceHtml = `<div class="panel mb-12"><div class="panel-body"><span class="text-dim small">Aucune race sélectionnée — allez dans l'onglet Race.</span></div></div>`;
  }

  // ── 2. IDENTITÉ ───────────────────────────────────────────
  const h   = parseFloat(chr.heightMeters) || 0;
  const w   = parseFloat(chr.weightKg)     || 0;
  const age = parseInt(chr.age)            || 0;
  const imcVal  = h > 0 ? w / (h * h) : 0;
  const imcDisp = imcVal > 0 ? imcVal.toFixed(1) : '—';
  const corpulence = nfo.corpulence || (
    imcVal < 18 ? 'frêle' : imcVal < 21 ? 'mince' : imcVal < 25 ? 'athlétique' :
    imcVal < 30 ? 'robuste' : imcVal < 35 ? 'corpulent' : 'massif'
  );
  const alignStr = chr.alignmentLaw && chr.alignmentMoral
    ? (chr.alignmentLaw==='Neutre'&&chr.alignmentMoral==='Neutre' ? 'Neutre Vrai' : `${chr.alignmentLaw} ${chr.alignmentMoral}`)
    : '—';
  const idRows = [
    ['Nom',        chr.name     || '—'],
    ['Alignement', alignStr],
    ['Divinité',   chr.deity    || '—'],
    ['Âge',        age > 0 ? age+' ans' : '—'],
    ['Taille',     h > 0 ? h+' m' : '—'],
    ['Poids',      w > 0 ? w+' kg' : '—'],
    ['IMC',        imcVal > 0 ? `${imcDisp} (${corpulence})` : '—'],
    ['Langues',    (chr.languages||[]).join(', ') || '—'],
  ];
  if (nfo.nickname)    idRows.splice(1,0,['Surnom/Titre', nfo.nickname]);
  if (nfo.affiliation) idRows.push(['Affiliation', nfo.affiliation]);
  if (nfo.origin)      idRows.push(['Origine', nfo.origin]);
  const idHtml = idRows.map(([k,v]) =>
    `<tr><td style="font-size:11px;color:var(--text-dim);padding:3px 12px 3px 0;white-space:nowrap;">${k}</td><td style="font-size:12px;color:var(--text-bright);padding:3px 0;">${v}</td></tr>`
  ).join('');
  const identityHtml = `
    <div class="panel mb-12">
      <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">👤 IDENTITÉ</span></div>
      <div class="panel-body"><table style="border-collapse:collapse;width:100%;">${idHtml}</table></div>
    </div>`;

  // ── 3. CARACTÉRISTIQUES ───────────────────────────────────
  const STATS = ['STR','DEX','CON','INT','WIS','CHA'];
  const statRows = STATS.map(ab => {
    const total = getAbilityTotal(ab);
    const mod   = getMod(ab);
    const modColor = mod > 0 ? 'var(--green)' : mod < 0 ? 'var(--red)' : 'var(--text-dim)';
    return `<div style="text-align:center;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 10px;">
      <div style="font-size:10px;color:var(--text-dim);letter-spacing:1px;font-family:'Cinzel',serif;">${STAT_FR[ab]}</div>
      <div style="font-size:20px;font-family:'Cinzel',serif;font-weight:700;color:var(--gold-light);">${total}</div>
      <div style="font-size:14px;font-weight:700;color:${modColor};">${sign(mod)}</div>
    </div>`;
  }).join('');
  const statsHtml = `
    <div class="panel mb-12">
      <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">🎲 CARACTÉRISTIQUES</span></div>
      <div class="panel-body"><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;">${statRows}</div></div>
    </div>`;

  // ── 4. CLASSES & COMBAT ────────────────────────────────────
  const classCount = {};
  levels.forEach(l => { classCount[l.classId] = (classCount[l.classId]||0)+1; });
  const classLines = Object.entries(classCount).map(([id,n]) => {
    const c = CLASS_REF[id]; return (c ? c.name : id) + ' ' + n;
  }).join(' / ') || '—';
  const bab  = getBAB();
  const hp   = getHPMax();
  const fort = getSaveTotal('fortitude');
  const ref  = getSaveTotal('reflex');
  const will = getSaveTotal('will');
  const saveColor = v => v > 0 ? 'var(--green)' : 'var(--text-dim)';
  const combatRows = [
    ['Niveau total',   levels.length],
    ['Classe(s)',      classLines],
    ['BBA',            sign(bab)],
    ['PV max',         hp],
    ['Vigueur',        `<span style="color:${saveColor(fort)};font-weight:700;">${sign(fort)}</span>`],
    ['Réflexes',       `<span style="color:${saveColor(ref)};font-weight:700;">${sign(ref)}</span>`],
    ['Volonté',        `<span style="color:${saveColor(will)};font-weight:700;">${sign(will)}</span>`],
  ];
  const combatHtml = combatRows.map(([k,v]) =>
    `<tr><td style="font-size:11px;color:var(--text-dim);padding:3px 12px 3px 0;">${k}</td><td style="font-size:12px;color:var(--text-bright);padding:3px 0;">${v}</td></tr>`
  ).join('');
  const classCombatHtml = `
    <div class="panel mb-12">
      <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">⚔ CLASSES &amp; COMBAT</span></div>
      <div class="panel-body"><table style="border-collapse:collapse;width:100%;">${combatHtml}</table></div>
    </div>`;

  // ── 5. DONS ────────────────────────────────────────────────
  const featItems = feats.map(f => {
    const fd = FEAT_DB[f.id] || {};
    const name = fd.nameFr || f.name || f.id;
    const en   = fd.nameEn ? ` <span style="font-size:10px;color:var(--text-dim);font-style:italic;">${fd.nameEn}</span>` : '';
    const src  = f.source ? ` <span style="font-size:9px;color:var(--gold-dim);border:1px solid var(--gold-dim);border-radius:3px;padding:0 3px;">${f.source}</span>` : '';
    return `<li style="font-size:12px;color:var(--text-bright);padding:2px 0;">${name}${en}${src}</li>`;
  }).join('') || '<li class="text-dim small">Aucun don sélectionné.</li>';
  const featsHtml = `
    <div class="panel mb-12">
      <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">✦ DONS (${feats.length})</span></div>
      <div class="panel-body"><ul style="margin:0;padding-left:16px;">${featItems}</ul></div>
    </div>`;

  // ── 6. COMPÉTENCES (rangs > 0) ─────────────────────────────
  const activeSkills = skills.filter(s => (s.ranks||0) > 0);
  const skillItems = activeSkills.map(s => {
    const ref = SKILL_REF[s.skillId] || {};
    const total = getSkillTotal(s);
    return `<tr>
      <td style="font-size:12px;padding:3px 10px 3px 0;">${ref.name||s.skillId}${ref.nameEn?` <span style="font-size:10px;color:var(--text-dim);font-style:italic;">${ref.nameEn}</span>`:''}</td>
      <td style="text-align:center;font-size:11px;color:var(--text-dim);padding:3px 8px;">${s.ranks}</td>
      <td style="text-align:center;font-size:12px;font-weight:700;color:var(--gold);padding:3px 0;">${sign(total)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="3" class="text-dim small" style="padding:6px 0;">Aucun rang investi.</td></tr>`;
  const skillsHtml = `
    <div class="panel mb-12">
      <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">📚 COMPÉTENCES — RANGS > 0</span></div>
      <div class="panel-body">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left;font-size:10px;color:var(--text-dim);padding:3px 10px 6px 0;">Compétence</th>
            <th style="text-align:center;font-size:10px;color:var(--text-dim);padding:3px 8px;">Rangs</th>
            <th style="text-align:center;font-size:10px;color:var(--text-dim);padding:3px 0;">Total</th>
          </tr></thead>
          <tbody>${skillItems}</tbody>
        </table>
      </div>
    </div>`;

  // ── 7. INTERPRÉTATION RP ──────────────────────────────────
  const statVals = STATS.map(ab => [ab, getAbilityTotal(ab)]);
  statVals.sort((a,b) => b[1]-a[1]);
  const topStat = statVals[0][0];
  const botStat = statVals[5][0];
  const topMod  = getMod(topStat);
  const botMod  = getMod(botStat);

  const PROFILE_HIGH = {
    STR: 'Sa force physique est imposante et se remarque à la première impression. Il préfère les réponses directes, et son corps est son premier outil.',
    DEX: 'Son agilité se perçoit dans chaque geste — rapide, précis, économe. Il agit souvent avant que les autres aient fini de penser.',
    CON: 'Sa robustesse transpire dans sa posture et son endurance. Il est difficile à épuiser ou à décourager, même dans les situations les plus prolongées.',
    INT: 'Son intellect acéré ressort dans ses observations et ses questions. Il comprend vite, analyse les situations avec méthode et retient les détails.',
    WIS: 'Sa sagesse le rend difficile à tromper. Il perçoit ce que les autres manquent, et son jugement instinctif est souvent juste.',
    CHA: 'Sa présence naturelle attire l\'attention. Il sait parler, convaincre ou imposer sans forcer — les gens écoutent quand il prend la parole.',
  };
  const PROFILE_LOW = {
    STR: 'Sa corpulence modeste peut induire en erreur — il compense par d\'autres moyens, souvent plus efficaces que la force brute.',
    DEX: 'Ses mouvements sont moins agiles que la moyenne. Il préfère les approches directes et frontales à la finesse ou la discrétion.',
    CON: 'Sa fragilité physique relative l\'oblige à la prudence. Il sait que l\'endurance n\'est pas son atout principal.',
    INT: 'Sa réflexion est simple et directe. Il agit plus qu\'il ne théorise, et préfère l\'expérience à l\'analyse.',
    WIS: 'Son impulsivité peut le trahir. Il réagit vite aux situations sans toujours peser les conséquences à long terme.',
    CHA: 'Il est discret ou maladroit socialement. Sa réserve peut être prise pour de l\'arrogance, mais c\'est simplement sa nature.',
  };
  const RACE_INTRO = {
    human:    'Humain polyvalent, ce personnage ne bénéficie d\'aucun avantage racial particulier, mais n\'en est que plus malléable.',
    dwarf:    'La robustesse naine transparaît — méthodique, méfiant envers l\'étranger, difficile à décourager.',
    elf:      'La délicatesse elfique se lit dans ce personnage : long de vue, perceptif, avec une relation au temps différente des humains.',
    gnome:    'Ce personnage porte la curiosité gnome — rarement le plus imposant, mais souvent le plus surprenant.',
    half_elf: 'Ni tout à fait humain, ni pleinement elfe — adaptable, parfois en quête d\'appartenance.',
    halfling: 'La légèreté halfeline cache une résilience surprenante. Il réfléchit vite et préfère éviter les confrontations directes.',
    half_orc: 'L\'héritage orque impose une présence qu\'il peut embrasser ou dépasser selon son histoire personnelle.',
  };
  const DEITY_INFLUENCE = {
    'Pelor': 'En tant que fidèle de Pelor, il tend vers l\'optimisme et le soin des autres — la lumière comme métaphore de vie.',
    'Héironéous': 'Sous l\'égide d\'Héironéous, l\'honneur et le combat loyal ne sont pas des concepts abstraits mais des engagements quotidiens.',
    'Hextor': 'La dévotion à Hextor implique une vision hiérarchique stricte — force, obéissance, et domination comme vertus.',
    'Saint Cuthbert': 'Un fidèle de Saint Cuthbert applique les lois avec conviction — la raison et la discipline avant tout.',
    'Ehlonna': 'Sous la protection d\'Ehlonna, la nature n\'est pas un décor mais un partenaire — respecter le monde sauvage est une pratique spirituelle.',
    'Obad-Haï': 'La neutralité d\'Obad-Haï enseigne l\'équilibre — ni trop de civilisation, ni chaos pur. L\'harmonie naturelle prime.',
    'Moradin': 'Un nain fidèle à Moradin porte l\'artisanat comme une forme de prière — chaque objet bien fait honore le Forgeur d\'Âmes.',
    'Boccob': 'Sous Boccob, la magie est une fin en soi — connaître et cataloguer plutôt que convaincre ou dominer.',
    'Vecna': 'La dévotion à Vecna implique que le savoir est pouvoir, et que certains secrets valent tous les sacrifices.',
  };

  const raceKey   = race ? race.baseRace : null;
  const deityKey  = chr.deity ? chr.deity.trim() : '';
  const raceIntro = RACE_INTRO[raceKey] || (race ? `Ce personnage appartient à la race des ${race.nameFr}.` : '');
  const highDesc  = PROFILE_HIGH[topStat] || '';
  const lowDesc   = PROFILE_LOW[botStat]  || '';
  const deityDesc = DEITY_INFLUENCE[deityKey] || (deityKey ? `Sa dévotion à ${deityKey} colore sans doute certaines de ses décisions et réactions face au monde.` : '');

  const rpParagraphs = [raceIntro, highDesc, lowDesc, deityDesc].filter(Boolean);
  const rpHtml = `
    <div class="panel mb-12" style="border-color:var(--gold-dim);">
      <div class="panel-header" style="background:rgba(201,147,58,0.06);">
        <span class="panel-title cinzel" style="color:var(--gold-light);letter-spacing:1px;">🎭 INTERPRÉTATION ROLEPLAY</span>
        <span class="small text-dim">lecture narrative — indicatif</span>
      </div>
      <div class="panel-body">
        ${rpParagraphs.map(p => `<p style="font-size:13px;color:var(--text-dim);line-height:1.8;font-style:italic;margin:0 0 10px;">${p}</p>`).join('')}
        <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;">
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:6px 12px;">
            <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">DOMINANTE</div>
            <div style="font-size:13px;font-family:'Cinzel',serif;color:var(--green);">${STAT_FR[topStat]} ${sign(topMod)}</div>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:6px 12px;">
            <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">FAIBLE</div>
            <div style="font-size:13px;font-family:'Cinzel',serif;color:var(--red);">${STAT_FR[botStat]} ${sign(botMod)}</div>
          </div>
        </div>
      </div>
    </div>`;

  // ── CTA ────────────────────────────────────────────────────
  const ctaHtml = `
    <div style="text-align:center;margin-top:8px;">
      <button class="btn btn-primary" onclick="showTab('sheet')" style="padding:12px 32px;font-size:14px;letter-spacing:2px;font-family:'Cinzel',serif;">
        ▶ PASSER AU GAMEPLAY →
      </button>
    </div>`;

  // ── Assemble ───────────────────────────────────────────────
  el.innerHTML = `
    <div style="max-width:900px;margin:0 auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="cinzel" style="color:var(--gold);font-size:18px;letter-spacing:3px;">RÉSUMÉ DU PERSONNAGE</div>
          <div class="small text-dim">${chr.name||'Personnage sans nom'} · Niv.${levels.length} · ${race?race.nameFr:'Race inconnue'}</div>
        </div>
      </div>
      ${raceHtml}
      ${identityHtml}
      ${statsHtml}
      ${classCombatHtml}
      ${featsHtml}
      ${skillsHtml}
      ${rpHtml}
      ${ctaHtml}
    </div>`;
}


function addLogEntry() {
  const input = document.getElementById('log-input');
  const text = input.value.trim();
  if (!text) return;
  AppState.log.push({
    id: 'log_' + Date.now(),
    date: new Date().toLocaleDateString('fr-FR'),
    text
  });
  input.value = '';
  renderLog();
}

function removeLogEntry(id) {
  AppState.log = AppState.log.filter(e => e.id !== id);
  renderLog();
}

// Global aliases — ensures onclick attributes can always find these functions

// Global aliases
window.changeRace = changeRace;

function _renderAbilityExtras() {
  const chr = AppState.character;
  // Find or create the extras container
  let container = document.getElementById('ab-extra-panels');
  if (!container) {
    // Create it inside build-page-abilities, after ab-grid
    const page = document.getElementById('build-page-abilities');
    if (!page) return;
    container = document.createElement('div');
    container.id = 'ab-extra-panels';
    container.style.cssText = 'max-width:900px;margin:14px auto 0;';
    page.appendChild(container);
  }

  const charLvl = AppState.levels.length;
  const lub = chr.levelUpBonuses || {};
  const STATS  = ['STR','DEX','CON','INT','WIS','CHA'];
  const LABELS = { STR:'Force', DEX:'Dextérité', CON:'Constitution',
                   INT:'Intelligence', WIS:'Sagesse', CHA:'Charisme' };

  // ── Panel 1: Augmentations de niveau ──────────────────────────
  const levelRows = [4,8,12,16,20].map(lvl => {
    const locked  = charLvl < lvl;
    const chosen  = lub[lvl] || '';
    const opts    = '<option value="">— choisir —</option>' +
      STATS.map(s =>
        `<option value="${s}" ${chosen===s?'selected':''}>${LABELS[s]} (${s})</option>`
      ).join('');
    const badge   = locked
      ? `<span style="font-size:10px;color:var(--text-dim);border:1px solid var(--border);border-radius:3px;padding:1px 6px;">Niv.${lvl} requis — vous êtes niv.${charLvl}</span>`
      : chosen
        ? `<span style="font-size:10px;color:var(--green);border:1px solid var(--green);border-radius:3px;padding:1px 6px;">✔ +1 ${chosen} appliqué</span>`
        : `<span style="font-size:10px;color:var(--gold-dim);border:1px solid var(--gold-dim);border-radius:3px;padding:1px 6px;">À choisir</span>`;
    return `<tr style="border-bottom:1px solid var(--border);">
      <td style="padding:8px 10px;font-family:'Cinzel',serif;font-size:14px;color:var(--gold);font-weight:700;">${lvl}</td>
      <td style="padding:8px 10px;">
        <select style="font-size:12px;" ${locked?'disabled':''}
          onchange="_applyLevelUpBonus(${lvl},this.value)">
          ${opts}
        </select>
      </td>
      <td style="padding:8px 10px;">${badge}</td>
    </tr>`;
  }).join('');

  // ── Panel 2: Méthode d'attribution ────────────────────────────
  const METHOD_OPTS = [
    ['pointbuy',    'Point Buy 25 pts (standard PHB)'],
    ['pointbuy28',  'Point Buy 28 pts (légèrement héroïque)'],
    ['pointbuy32',  'Point Buy 32 pts (heroïque)'],
    ['4d6drop',     'Jets 4d6, garder les 3 meilleurs'],
    ['3d6straight', 'Jets 3d6 dans l\'ordre'],
    ['standard',    'Valeurs fixes 15/14/13/12/10/8'],
    ['elite',       'Valeurs fixes 15/14/13/12/11/10 (élite)'],
    ['mj',          'Attribution directe par le MJ'],
    ['other',       'Autre (voir notes)'],
  ];
  const method = chr.abilityMethod || 'pointbuy';
  const methodOpts = METHOD_OPTS.map(([v,l]) =>
    `<option value="${v}" ${method===v?'selected':''}>${l}</option>`
  ).join('');

  container.innerHTML = `
    <!-- ── Augmentations de niveau ──────────────────────────── -->
    <div class="panel mb-14">
      <div class="panel-header">
        <span class="panel-title cinzel" style="letter-spacing:1px;">⬆ AUGMENTATIONS DE NIVEAU</span>
        <span class="small text-dim">+1 à une caractéristique aux niveaux 4 · 8 · 12 · 16 · 20</span>
      </div>
      <div class="panel-body">
        <div class="small text-dim" style="margin-bottom:12px;line-height:1.6;">
          En D&amp;D 3.5, tous les 4 niveaux, le joueur augmente définitivement une caractéristique de +1.
          Ces bonus s'accumulent et s'appliquent immédiatement au calcul du total.
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:2px solid var(--border);">
            <th class="cinzel text-dim" style="font-size:10px;padding:5px 10px;letter-spacing:1px;">NIVEAU</th>
            <th class="cinzel text-dim" style="font-size:10px;padding:5px 10px;letter-spacing:1px;">CARACTÉRISTIQUE</th>
            <th class="cinzel text-dim" style="font-size:10px;padding:5px 10px;letter-spacing:1px;">STATUT</th>
          </tr></thead>
          <tbody>${levelRows}</tbody>
        </table>
      </div>
    </div>

    <!-- ── Méthode d'attribution ─────────────────────────────── -->
    <div class="panel mb-14">
      <div class="panel-header">
        <span class="panel-title cinzel" style="letter-spacing:1px;">📋 MÉTHODE D'ATTRIBUTION</span>
        <span class="small text-dim" style="margin-left:8px;">purement indicatif — aucun impact mécanique</span>
      </div>
      <div class="panel-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <div class="form-group">
            <label style="font-size:10px;">MÉTHODE UTILISÉE</label>
            <select style="font-size:12px;" onchange="AppState.character.abilityMethod=this.value;autosave();">
              ${methodOpts}
            </select>
          </div>
          <div class="form-group">
            <label style="font-size:10px;">NOTES <span class="text-dim small">(optionnel)</span></label>
            <input type="text" value="${(chr.abilityMethodNotes||'').replace(/"/g,'&quot;')}"
              placeholder="Jets supervisés, valeurs accordées, contexte…"
              style="font-size:12px;"
              oninput="AppState.character.abilityMethodNotes=this.value;autosave();">
          </div>
        </div>
        <div style="background:var(--bg3);border-left:3px solid var(--border);padding:8px 12px;border-radius:0 4px 4px 0;">
          <div class="small text-dim" style="line-height:1.7;font-size:11px;">
            <strong>Point Buy 25 :</strong> méthode standard PHB — chaque point au-dessus de 8 a un coût progressif.<br>
            <strong>Jets de dés :</strong> plus aléatoire, souvent plus héroïque — les valeurs ne sont pas modifiables après attribution.<br>
            <em>Ces informations sont purement indicatives et n'affectent pas les calculs.</em>
          </div>
        </div>
      </div>
    </div>`;
}

function _applyLevelUpBonus(level, stat) {
  if (!AppState.character.levelUpBonuses) AppState.character.levelUpBonuses = {};
  AppState.character.levelUpBonuses[level] = stat;
  autosave();
  renderSheet();
  _renderAbilityExtras();          // refresh badges immediately
  if (document.getElementById('ab-grid')) updateAbilitiesDisplay(); // refresh stat totals
}
