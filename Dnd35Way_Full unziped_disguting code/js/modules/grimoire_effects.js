// ============================================================
// grimoire_effects.js — Effets déclaratifs du Grimoire
//
// Philosophie : déclaratif, pas automatique.
// Le joueur déclare ses effets, l'app les applique proprement.
// ============================================================

// ── Vocabulaire d'effets (lisible joueur) ────────────────────
// ex : placeholder du champ valeur.
// Règle : pour les effets runtime (targets non vide), ex = entier seul, sans type de bonus.
// Le type de bonus est TOUJOURS saisi séparément via le sélecteur dédié.
// Pour les effets narratifs (targets vide), ex = texte libre.
const _EFFET_DEF = [
  // Caractéristiques
  { key:'STR', label:'Force',            ex:'4',  targets:[{target:'ability.STR', bonusType:'enhancement'}] },
  { key:'DEX', label:'Dextérité',        ex:'2',  targets:[{target:'ability.DEX', bonusType:'enhancement'}] },
  { key:'CON', label:'Constitution',     ex:'4',  targets:[{target:'ability.CON', bonusType:'enhancement'}] },
  { key:'INT', label:'Intelligence',     ex:'2',  targets:[{target:'ability.INT', bonusType:'enhancement'}] },
  { key:'WIS', label:'Sagesse',          ex:'2',  targets:[{target:'ability.WIS', bonusType:'enhancement'}] },
  { key:'CHA', label:'Charisme',         ex:'4',  targets:[{target:'ability.CHA', bonusType:'enhancement'}] },
  // CA
  { key:'ca_deflection', label:'CA — Parade',       ex:'2',  targets:[{target:'defense.deflection', bonusType:'deflection'}] },
  { key:'ca_armor',      label:'CA — Armure',        ex:'4',  targets:[{target:'defense.armor',      bonusType:'armor'}] },
  { key:'ca_shield',     label:'CA — Bouclier',      ex:'2',  targets:[{target:'defense.shield',     bonusType:'shield'}] },
  { key:'ca_natural',    label:'CA — Armure nat.',   ex:'2',  targets:[{target:'defense.naturalArmor', bonusType:'natural_armor'}] },
  { key:'ca_dodge',      label:'CA — Esquive',       ex:'1',  targets:[{target:'defense.dodge',      bonusType:'dodge'}] },
  { key:'ca_sacred',     label:'CA — Sacré',         ex:'2',  targets:[{target:'defense.sacred',     bonusType:'sacred'}] },
  { key:'ca_luck',       label:'CA — Chance',        ex:'1',  targets:[{target:'defense.luck',       bonusType:'luck'}] },
  // Combat
  { key:'attack',  label:'Attaque',      ex:'2',  targets:[{target:'combat.attack',     bonusType:'morale'}] },
  { key:'damage',  label:'Dégâts',       ex:'2',  targets:[{target:'combat.damage',     bonusType:'enhancement'}] },
  { key:'init',    label:'Initiative',   ex:'4',  targets:[{target:'combat.initiative', bonusType:'enhancement'}] },
  // Jets de sauvegarde
  { key:'save_all',  label:'Tous les JS', ex:'2',  targets:[{target:'save.all',       bonusType:'resistance'}] },
  { key:'save_fort', label:'Vigueur',     ex:'2',  targets:[{target:'save.fortitude', bonusType:'morale'}] },
  { key:'save_ref',  label:'Réflexes',    ex:'2',  targets:[{target:'save.reflex',    bonusType:'dodge'}] },
  { key:'save_will', label:'Volonté',     ex:'2',  targets:[{target:'save.will',      bonusType:'morale'}] },
  // PV
  { key:'pv_temp', label:'PV temporaires', ex:'10', targets:[{target:'hp.temp', bonusType:'untyped'}] },
  // Compétences
  { key:'skill_all', label:'Toutes compétences', ex:'2', targets:[{target:'skill.all', bonusType:'competence'}] },
  // Narratifs — texte libre, non calculés automatiquement
  { key:'soin',       label:'Soins',               ex:'2d8+5',           targets:[] },
  { key:'speed',      label:'Vitesse',              ex:'+9 m',            targets:[] },
  { key:'fly',        label:'Vol',                  ex:'18 m (bonne)',    targets:[] },
  { key:'resistance', label:'Résistance énergie',   ex:'feu 10',          targets:[] },
  { key:'dr',         label:'Réduction dégâts',     ex:'5/argent',        targets:[] },
  { key:'special',    label:'Effet spécial',        ex:'immunité poison', targets:[] },
  { key:'libre',      label:'Note libre',           ex:'',                targets:[] },
];

const _BONUS_TYPE_FR = {
  enhancement:'altération', morale:'moral', competence:'compétence',
  luck:'chance', insight:'intuition', dodge:'esquive', sacred:'sacré',
  profane:'maudit', resistance:'résistance', deflection:'parade',
  armor:'armure', shield:'bouclier', natural_armor:'armure naturelle',
  untyped:'', size:'taille',
};

function getEffetDef()   { return _EFFET_DEF; }
function getBonusTypeFR(){ return _BONUS_TYPE_FR; }

// ── Translation effets grimoire → runtime ────────────────────
function grimEffectsToRuntime(effects) {
  const runtime = [];
  (effects || []).forEach(ef => {
    const def = _EFFET_DEF.find(d => d.key === ef.type);
    if (!def || !def.targets.length) return;
    // value stocké comme number (V1) ou string legacy
    const n = typeof ef.value === 'number' ? ef.value : parseInt(ef.value);
    if (!n || isNaN(n)) return;
    def.targets.forEach(({target, bonusType}) =>
      runtime.push({ target, bonusType: ef.bonusType || bonusType, value: n })
    );
  });
  return runtime;
}

function grimEffectsLabel(effects) {
  return (effects || []).map(ef => {
    const def = _EFFET_DEF.find(d => d.key === ef.type);
    const label = def ? def.label : ef.type;
    const isRuntime = def && def.targets.length > 0;
    if (isRuntime) {
      const n = typeof ef.value === 'number' ? ef.value : parseInt(ef.value);
      const sign = n > 0 ? '+' : '';
      const btFr = ef.bonusType ? (_BONUS_TYPE_FR[ef.bonusType] || ef.bonusType) : '';
      return btFr ? label + ' ' + sign + n + ' (' + btFr + ')' : label + ' ' + sign + n;
    }
    return label + ' : ' + (ef.value || '—');
  }).join(' · ');
}

// ── castPreparedSpell — point d'entrée unifié ─────────────────
// Cas 1 : sort du Grimoire custom (ps.grimoireId) → grimEffectsToRuntime
// Cas 2 : sort de la DB officielle (ps.dbId) → BUFF_DB via _castPreparedSpellDB
function castPreparedSpell(psId) {
  const ps = (AppState.preparedSpells || []).find(p => p.id === psId);
  if (!ps) return;

  // Cas 1 — sort custom du grimoire personnel
  if (ps.grimoireId) {
    const sp = (AppState.grimoire || []).find(s => s.id === ps.grimoireId);
    if (!sp) return;

    const runtimeEffects = grimEffectsToRuntime(sp.effects);
    const isBuff = runtimeEffects.length > 0 || (sp.tags||[]).includes('Buff');

    if (isBuff) {
      if ((AppState.buffs||[]).find(b => b.sourceGrimoireId === sp.id && b.isActive)) {
        if (typeof showToast==='function') showToast(`"${sp.name}" déjà actif`, 'info');
        return;
      }
      if (!AppState.buffs) AppState.buffs = [];
      AppState.buffs.push({
        id: 'buff_spell_' + Date.now().toString(36),
        dbId: null,
        sourceType: 'spell',
        sourceGrimoireId: sp.id,
        sourcePrepId: ps.id,
        name: sp.name,
        nameEn: sp.nameEn || sp.name,
        isActive: true,
        isSelf: true,
        isSelfOnly: false,
        uiTargetType: 'self',
        casterLevel: AppState.levels.length || 1,
        target: 'self',
        spellId: null,
        duration: { formula: sp.durationText || '?' },
        remainingDuration: null,
        effects: runtimeEffects,
        effectsLabel: grimEffectsLabel(sp.effects),
        school: sp.school || '',
        source: 'Grimoire',
      });
      if (typeof autosave==='function') autosave();
      if (typeof renderAll==='function') renderAll();
      const msg = runtimeEffects.length > 0 ? 'actif — effets appliqués' : 'lancé';
      if (typeof showToast==='function') showToast(`"${sp.name}" ${msg}`, 'success');
    } else {
      if (typeof showToast==='function') showToast(`"${sp.name}" lancé`, 'info');
    }
    fightLogAdd(`${sp.name} lancé${sp.level ? ` (niv.${sp.level})` : ''}`);
    return;
  }

  // Cas 2 — sort officiel DB → déléguer à grimoire.js
  if (typeof _castPreparedSpellDB === 'function') {
    _castPreparedSpellDB(psId);
  }
}

// ══════════════════════════════════════════════════════════════
// FIGHT LOG — compteur de rounds + suivi
// ══════════════════════════════════════════════════════════════
function fightRound() { return AppState.fightRound || 0; }

function fightRoundSet(n) {
  AppState.fightRound = Math.max(0, n);
  if (typeof autosave==='function') autosave();
  if (typeof _magRenderFightLog==='function') _magRenderFightLog();
}

function fightLogAdd(text) {
  if (!AppState.fightLog) AppState.fightLog = [];
  AppState.fightLog.unshift({
    id: Date.now().toString(36),
    round: fightRound(),
    text,
    ts: Date.now()
  });
  // Keep last 100 entries
  if (AppState.fightLog.length > 100) AppState.fightLog = AppState.fightLog.slice(0, 100);
  if (typeof autosave==='function') autosave();
  if (typeof _magRenderFightLog==='function') _magRenderFightLog();
}

function fightLogClear() {
  AppState.fightLog = [];
  AppState.fightRound = 0;
  if (typeof autosave==='function') autosave();
  if (typeof _magRenderFightLog==='function') _magRenderFightLog();
}
