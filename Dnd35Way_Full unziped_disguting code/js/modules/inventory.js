// ============================================================
// inventory.js — Module Inventaire
// AppState.inventory[]  — instances possédées
// AppState.equipment{}  — refs instanceId (source de vérité équipement)
// AppState.wallet{}     — bourse pp/gp/sp/cp
// AppState.walletLog[]  — historique simple { id, amount, currency, note, timestamp }
// ============================================================

// ── Helpers wallet ────────────────────────────────────────────
function _walletAdd(amount, currency, note) {
  const cur = currency || 'gp';
  AppState.wallet[cur] = Math.max(0, (AppState.wallet[cur] || 0) + amount);
  AppState.walletLog.push({
    id:        'wl_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
    amount:    amount,
    currency:  cur,
    note:      note || '',
    timestamp: Date.now(),
  });
}
function _walletDeduct(amount, currency, note) { _walletAdd(-Math.abs(amount), currency||'gp', note); }
function _walletGpTotal() {
  const w = AppState.wallet;
  return (w.pp||0)*10 + (w.gp||0) + (w.sp||0)/10 + (w.cp||0)/100;
}

// ── Instance factory ──────────────────────────────────────────
function _createItemInstance(dbId, overrides) {
  const db = dbId ? (ITEM_DB[dbId] || {}) : {};
  const inst = {
    instanceId:  'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
    itemDbId:    dbId || null,
    customItem:  null,
    quantity:    1,
    paid:        db.gp || 0,
    notes:       '',
    // ── Overrides: écrasent les champs du catalogue sans le modifier ──
    overrides: {
      name:        '',   // si renseigné, remplace le nom du catalogue
      description: '',   // description personnalisée
      priceGp:     null, // null = utilise paid/catalogue
      weightKg:    null, // null = utilise catalogue
    },
    // ── Méta-données narratives ────────────────────────────────────
    meta: {
      origin:    '',   // "Trouvé sur un capitaine mort-vivant"
      owner:     '',   // "Appartient à Itsuki"
      toReturn:  false,
      questItem: false,
      questNote: '',
    },
    // ── Tags ──────────────────────────────────────────────────────
    tags: [],
    // ── Bonus d'instance (forge appliquée manuellement) ───────────
    instanceEffects: [],
  };
  if (overrides) Object.assign(inst, overrides);
  return inst;
}

// ── Résout le nom effectif d'une instance ─────────────────────
function _instName(inst) {
  if (inst.overrides?.name) return inst.overrides.name;
  if (inst.customItem) return inst.customItem.name?.fr || inst.instanceId;
  const db = inst.itemDbId ? ITEM_DB[inst.itemDbId] : null;
  return db?.name || inst.instanceId;
}

// ── Résout le poids effectif (override > catalogue) ──────────
function _instWeightKg(inst) {
  if (inst.overrides?.weightKg !== null && inst.overrides?.weightKg !== undefined && inst.overrides?.weightKg !== '') return parseFloat(inst.overrides.weightKg)||0;
  const db = inst.itemDbId ? ITEM_DB[inst.itemDbId] : null;
  return db?.wKg || inst.customItem?.weightKg || 0;
}

// ── Résout la valeur unitaire (override > paid > catalogue) ──
function _instPriceGp(inst) {
  if (inst.overrides?.priceGp !== null && inst.overrides?.priceGp !== undefined && inst.overrides?.priceGp !== '') return parseFloat(inst.overrides.priceGp)||0;
  return inst.paid || 0;
}

// ── Buy workflow: Boutique → Inventaire + déduction Bourse ───
function buyFromShop(dbId) {
  const db = ITEM_DB[dbId];
  if (!db) return;
  const price   = db.gp || 0;
  const gpAvail = _walletGpTotal();
  if (price > 0 && gpAvail < price) {
    if (!confirm(`Fonds insuffisants (${gpAvail.toLocaleString()} po dispo, ${price.toLocaleString()} po requis).\nAjouter quand même ?`)) return;
  }
  AppState.inventory.push(_createItemInstance(dbId, { paid: price }));
  if (price > 0) _walletDeduct(price, 'gp', `Achat : ${db.name}`);
  _shopSelId = null;
  autosave();
  showToast(`✓ ${db.name} ajouté à l'inventaire`, 'success');
  renderInvShop();
}

// ── Compat helpers (rétro-compat avec autres modules) ─────────
function calcTotalWealth() {
  const gpMoney = _walletGpTotal();
  const gpItems = AppState.inventory.reduce((s,i)=>s+_instPriceGp(i)*(i.quantity||1),0);
  return { gpMoney, gpItems, total: gpMoney+gpItems };
}
function renderMoneyPanel(targetId) {
  const el=document.getElementById(targetId||'money-panel'); if(!el) return;
  const w=AppState.wallet;
  el.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:8px;">${[['PP','#d0d0ff',w.pp||0],['PO','#ffd060',w.gp||0],['PA','#c0c0c0',w.sp||0],['PC','#c07040',w.cp||0]].map(([a,c,v])=>`<div style="text-align:center;background:${c}11;border:1px solid ${c}33;border-radius:5px;padding:5px;"><div style="font-size:16px;font-weight:700;color:${c};">${v.toLocaleString()}</div><div style="font-size:9px;font-family:Cinzel,serif;color:var(--text-dim);">${a}</div></div>`).join('')}</div>`;
}
function openAddItemManual()       { _invAddManual(); }
function openEditItemModal(id)     { _invEditNotes(id); }
function removeItemConfirm(id,nm)  { _invRemove(id,nm); }
function toggleItemEquipped(id) {
  if (isEquipped(id)) { const sl=getEquippedSlot(id); if(sl) _equipRemove(sl,id); }
  else { const i=AppState.inventory.find(x=>x.instanceId===id); const db=i?.itemDbId?ITEM_DB[i.itemDbId]:null; const slot=i?.customItem?.slot||db?.slot||'slotless'; _equipSet(slot,id); }
  renderInvInventory();
}


// ─── Boutique ────────────────────────────────────────────────
let _invPage     = 'inventory';
let _shopSelId   = null;
let _forgeSelId  = null;
let _forgeUpgSel = null;

function showInvPage(page) {
  _invPage = page;
  // Forge et Transfer neutralisés V1 — containers présents mais jamais activés
  ['shop','inventory','equipment','purse'].forEach(p => {
    const el  = document.getElementById('inv-page-'+p);
    const btn = document.getElementById('invtab-'+p);
    if (el)  el.classList.toggle('hidden', p !== page);
    if (btn) btn.classList.toggle('active', p === page);
  });
  if (page === 'shop')      renderInvShop();
  if (page === 'inventory') renderInvInventory();
  if (page === 'equipment') renderInvEquipment();
  if (page === 'purse')     renderInvPurse();
}
function renderInventory() { showInvPage(_invPage || 'inventory'); }


// ─── BOUTIQUE v2 ─────────────────────────────────────────────
// Layout : bandeau haut | sidebar 200px | liste catalogue | fiche détaillée
// Sidebar contextuelle : filtres/tris changent selon la catégorie active

let _shopActiveCat = '';   // '' = tous, ou 'weapon','armor','shield'...
let _shopFilters   = { search:'', cat:'', source:'', magic:'', prof:'', hands:'',
                       damageType:'', armorClass:'', slot:'', sortBy:'name', sortDir:1 };

function renderInvShop() {
  const el = document.getElementById('inv-page-shop');
  if (!el) return;

  const gpAvail     = _walletGpTotal();
  const customCount = (AppState.customItems || []).length;
  const q           = _shopFilters.search || '';

  el.innerHTML = `
    <!-- Bandeau -->
    <div style="display:flex;gap:12px;align-items:center;background:var(--bg3);
                border:1px solid var(--border);border-radius:6px;padding:8px 14px;
                margin-bottom:12px;flex-wrap:wrap;">
      <div>
        <div class="cinzel" style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">BOURSE</div>
        <div style="font-size:15px;font-weight:700;color:var(--gold);">${gpAvail.toLocaleString(undefined,{maximumFractionDigits:0})} po</div>
      </div>
      <div style="width:1px;height:28px;background:var(--border);"></div>
      <div>
        <div class="cinzel" style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">MA BIBLIOTHÈQUE</div>
        <div style="font-size:13px;color:var(--text-bright);">${customCount} objet${customCount!==1?'s':''}</div>
      </div>
      <input id="shop-q" type="text" placeholder="🔍 Rechercher…"
        style="flex:1;min-width:140px;font-size:12px;"
        value="${q.replace(/"/g,'&quot;')}"
        oninput="_shopFilters.search=this.value;_shopRenderList();">
      <select id="shop-cat-filter" style="font-size:11px;" onchange="_shopFilters.cat=this.value;_shopRenderList();">
        <option value="">Toutes catégories</option>
        ${Object.entries(ITEM_CATEGORIES_FR).map(([k,v])=>`<option value="${k}" ${_shopFilters.cat===k?'selected':''}>${v}</option>`).join('')}
      </select>
      <button class="btn btn-primary btn-small" onclick="_shopOpenCustomCreator()" style="font-size:11px;">✦ Créer un objet</button>
    </div>

    <!-- Layout : liste + détail -->
    <div style="display:grid;grid-template-columns:1fr 380px;gap:12px;height:calc(100vh - 240px);">
      <div style="display:flex;flex-direction:column;min-height:0;overflow:hidden;">
        <div id="shop-list-count" style="font-size:11px;color:var(--text-dim);margin-bottom:5px;flex-shrink:0;"></div>
        <div id="shop-list-inner" style="flex:1;overflow-y:auto;background:var(--bg3);
             border:1px solid var(--border);border-radius:6px;min-height:0;"></div>
      </div>
      <div id="shop-detail-panel" style="overflow-y:auto;min-height:0;">
        <div id="shop-quickpick" style="padding:20px;text-align:center;color:var(--text-dim);">
          <div style="font-size:36px;margin-bottom:10px;">✦</div>
          <div class="cinzel" style="color:var(--gold-dim);font-size:11px;letter-spacing:2px;margin-bottom:8px;">MA BIBLIOTHÈQUE</div>
          <div style="font-size:12px;margin-bottom:16px;">Créez des objets personnalisés pour les retrouver ici et les ajouter à votre inventaire à volonté.</div>
          <button class="btn btn-primary" onclick="_shopOpenCustomCreator()">✦ Créer un objet</button>
        </div>
      </div>
    </div>

    <div id="shop-custom-modal"></div>`;

  _shopRenderList();
}

// ── Sidebar contextuelle ──────────────────────────────────────
function _shopRenderSidebar() {
  // NEUTRALISÉ — shop V1 custom uniquement, pas de sidebar ITEM_DB
  const sb = document.getElementById('shop-sidebar');
  if (sb) sb.innerHTML = '';
}
function _shopListHeaders() {
  const cat = _shopActiveCat;
  if (cat === 'weapon')  return ['NOM','MAÎTRISE','MAINS','DÉGÂTS','CRITIQUE','PORTÉE','POIDS','PRIX'];
  if (cat === 'armor')   return ['NOM','CATÉG.','BONUS CA','DEX MAX','MALUS ARM.','ÉCHEC ARC.','POIDS','PRIX'];
  if (cat === 'shield')  return ['NOM','BONUS CA','MALUS','POIDS','PRIX'];
  if (cat === 'wondrous'||cat==='ring') return ['NOM','SLOT','BONUS MAG.','POIDS','PRIX'];
  if (cat === 'potion'||cat==='scroll'||cat==='wand'||cat==='consumable') return ['NOM','SOURCE','POIDS','PRIX'];
  return ['NOM','CATÉGORIE','POIDS','PRIX'];
}

const PROF_FR = { simple:'Simple', martial:'Martial', exotic:'Exotique' };
const HANDS_FR = { light:'Légère', '1h':'1 main', '2h':'2 mains', ranged:'Distance' };
const ARMOR_CLASS_FR = { light:'Légère', medium:'Intermédiaire', heavy:'Lourde' };

// ── Labels courts pour l'aperçu effets ───────────────────────
const _EFF_TARGET_SHORT = {
  'ability.STR':'FOR','ability.DEX':'DEX','ability.CON':'CON',
  'ability.INT':'INT','ability.WIS':'SAG','ability.CHA':'CHA',
  'defense.armor':'CA arm.','defense.shield':'CA boucl.',
  'defense.deflection':'CA défl.','defense.naturalArmor':'CA nat.',
  'defense.dodge':'CA esq.','defense.sacred':'CA sacré','defense.insight':'CA ins.',
  'save.all':'JDS','save.fortitude':'VIG','save.reflex':'RÉF','save.will':'VOL',
  'combat.attack':'Att.','combat.damage':'Dég.','combat.initiative':'Init.',
};
function _shopEffPreview(effects) {
  return (effects||[]).filter(e=>!e.descriptive&&e.target&&e.value!==0)
    .map(e=>{
      const label = _EFF_TARGET_SHORT[e.target] || e.target.split('.').pop();
      const sign  = e.value > 0 ? '+' : '';
      return `<span style="font-size:9px;padding:1px 5px;border-radius:3px;margin-right:2px;
        background:${e.value>0?'rgba(74,154,80,0.15)':'rgba(180,60,60,0.15)'};
        color:${e.value>0?'var(--green)':'var(--red)'};
        border:1px solid ${e.value>0?'rgba(74,154,80,0.3)':'rgba(180,60,60,0.3)'};">${label} ${sign}${e.value}</span>`;
    }).join('');
}

// ── Ligne d'affichage pour un objet custom dans le shop ───────
function _shopCustomRow(it) {
  const cat    = ITEM_CATEGORIES_FR[it.category] || it.category || '—';
  const effPrv = _shopEffPreview(it.effects);
  const icon   = (typeof _CAT_ICONS !== 'undefined' && _CAT_ICONS[it.category]) || '📦';
  return `<tr style="border-bottom:1px solid var(--border);cursor:pointer;"
    onclick="_shopRenderCustomDetail('${it.id}')"
    onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background=''">
    <td style="padding:6px 8px;">
      <span style="color:var(--text-bright);font-weight:600;">${icon} ${it.name?.fr||'—'}</span>
    </td>
    <td style="padding:6px 8px;font-size:10px;color:var(--text-dim);">${cat}</td>
    <td style="padding:6px 8px;">${effPrv || '<span style="font-size:9px;color:var(--text-dim);">—</span>'}</td>
    <td style="padding:6px 8px;text-align:right;color:var(--gold);font-size:11px;white-space:nowrap;">
      ${(it.priceGp||0).toLocaleString()} po
    </td>
  </tr>`;
}

// ── Fiche détail d'un objet custom ───────────────────────────
function _shopRenderCustomDetail(customId) {
  const panel = document.getElementById('shop-detail-panel');
  if (!panel) return;
  const it = (AppState.customItems||[]).find(c => c.id === customId);
  if (!it) return;
  const qp = document.getElementById('shop-quickpick');
  if (qp) qp.style.display = 'none';

  const isMagic = (it.effects||[]).filter(e=>!e.descriptive&&e.value!==0).length > 0;
  const effList = isMagic
    ? (it.effects||[]).filter(e=>!e.descriptive&&e.value!==0)
        .map(e=>`<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);">
          <span style="font-size:11px;color:var(--text-dim);">${_EFF_TARGET_SHORT[e.target]||e.target||'—'}</span>
          <span style="color:${e.value>0?'var(--green)':'var(--red)'};font-weight:600;">
            ${e.value>0?'+':''}${e.value}
            <span style="font-size:9px;color:var(--text-dim);margin-left:3px;">${e.bonusType||''}</span>
          </span>
        </div>`).join('')
    : '<div style="color:var(--text-dim);font-style:italic;font-size:11px;padding:4px 0;">Aucun effet calculé</div>';

  const gpAvail = _walletGpTotal();
  const price   = it.priceGp || 0;
  const canBuy  = price === 0 || gpAvail >= price;
  const cat     = ITEM_CATEGORIES_FR[it.category] || it.category || '—';
  const icon    = (typeof _CAT_ICONS!=='undefined'&&_CAT_ICONS[it.category])||'📦';

  panel.innerHTML = `<div style="padding:14px;">
    <!-- En-tête -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
      <div>
        <div style="font-size:16px;font-weight:700;color:var(--text-bright);">${icon} ${it.name?.fr||'—'}</div>
        <div style="font-size:10px;color:var(--text-dim);margin-top:2px;">${cat} · ${it.slot||'sans empl.'} · ${(it.weightKg||0)} kg</div>
      </div>
      <button onclick="renderInvShop()"
        style="font-size:10px;background:none;border:none;color:var(--text-dim);cursor:pointer;padding:2px;">← Retour</button>
    </div>

    <!-- Description -->
    ${it.description?.fr ? `<div style="font-size:12px;padding:8px;background:var(--bg3);border-radius:4px;margin-bottom:10px;color:var(--text-bright);">${it.description.fr}</div>` : ''}

    <!-- Effets -->
    <div style="font-size:9px;color:var(--gold-dim);font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:4px;">EFFETS CALCULÉS</div>
    <div style="margin-bottom:14px;">${effList}</div>

    <!-- Actions principales -->
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;">
      <span style="font-size:15px;font-weight:700;color:${canBuy?'var(--gold)':'var(--red)'};">${price.toLocaleString()} po</span>
      <button onclick="buyCustomItem('${customId}')" ${canBuy?'':'disabled'}
        style="flex:1;padding:7px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;
               border-radius:5px;cursor:pointer;
               background:${canBuy?'rgba(180,140,60,0.2)':'var(--bg3)'};
               border:1px solid ${canBuy?'var(--gold-dim)':'var(--border)'};
               color:${canBuy?'var(--gold)':'var(--text-dim)'};">
        ${price===0?'✓ Prendre gratuitement':'🛒 Ajouter à l\'inventaire'}
      </button>
    </div>

    <!-- Actions édition -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--border);">
      <button onclick="_ccDuplicate('${customId}')"
        style="padding:5px 10px;font-size:10px;border-radius:4px;cursor:pointer;
               background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);"
        title="Créer une copie indépendante de cet objet">
        ⧉ Dupliquer
      </button>
      <button onclick="_ccCreateFrom('${customId}')"
        style="padding:5px 10px;font-size:10px;border-radius:4px;cursor:pointer;
               background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);"
        title="Ouvrir le builder avec les champs de cet objet préremplis">
        ✏ Créer à partir de
      </button>
      <button onclick="_ccDeleteCustomItem('${customId}')"
        style="padding:5px 10px;font-size:10px;border-radius:4px;cursor:pointer;margin-left:auto;
               background:rgba(180,60,60,0.1);border:1px solid rgba(180,60,60,0.3);color:var(--red-dim);">
        ✕ Supprimer
      </button>
    </div>
  </div>`;
}

// ── Ajouter un objet custom du shop à l'inventaire ───────────
function buyCustomItem(customId) {
  const it = (AppState.customItems||[]).find(c => c.id === customId);
  if (!it) return;
  const price = it.priceGp || 0;
  if (price > 0 && _walletGpTotal() < price) {
    if (!confirm(`Fonds insuffisants (${_walletGpTotal().toFixed(0)} po dispo).\nAjouter quand même ?`)) return;
  }
  const customItem = {
    name:        it.name,
    category:    it.category,
    slot:        it.slot || '',
    priceGp:     it.priceGp,
    weightKg:    it.weightKg,
    description: it.description,
    effects:     it.effects || [],
    ...(it.wData ? { wData: it.wData } : {}),
    ...(it.aData ? { aData: it.aData } : {}),
  };
  const inst = _createItemInstance(null, { customItem, paid: price });
  AppState.inventory.push(inst);
  if (price > 0) _walletDeduct(price, 'gp', `Achat : ${it.name?.fr||it.id}`);
  autosave();
  showToast(`✓ ${it.name?.fr||'Objet'} ajouté à l'inventaire`, 'success');
  _shopRenderCustomDetail(customId); // rafraîchir pour mettre à jour la bourse
}

// ── Supprimer un objet custom du catalogue ───────────────────
function _ccDeleteCustomItem(customId) {
  const it = (AppState.customItems||[]).find(c => c.id === customId);
  if (!it) return;
  if (!confirm(`Supprimer "${it.name?.fr||customId}" du shop ?\nLes exemplaires dans l'inventaire sont conservés.`)) return;
  AppState.customItems = (AppState.customItems||[]).filter(c => c.id !== customId);
  autosave();
  showToast('Objet supprimé du shop', 'info');
  renderInvShop();
}

// ── Dupliquer un objet custom ─────────────────────────────────
function _ccDuplicate(customId) {
  const src = (AppState.customItems||[]).find(c => c.id === customId);
  if (!src) return;
  const copy = JSON.parse(JSON.stringify(src)); // deep clone
  copy.id = 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,5);
  copy.name = { ...copy.name, fr: (copy.name?.fr||'') + ' (copie)' };
  copy.createdAt = Date.now();
  if (!AppState.customItems) AppState.customItems = [];
  AppState.customItems.push(copy);
  autosave();
  showToast(`✓ "${copy.name.fr}" dupliqué`, 'success');
  renderInvShop();
}

// ── Réouvrir le builder prérempli depuis un objet existant ────
function _ccCreateFrom(customId) {
  const src = (AppState.customItems||[]).find(c => c.id === customId);
  if (!src) return;
  // Ouvrir le builder, puis préremplir les champs après rendu
  _ccEffectRows = Math.max(1, (src.effects||[]).filter(e=>!e.descriptive&&e.value!==0).length);
  _shopOpenCustomCreator();
  // Attendre que le DOM soit prêt
  requestAnimationFrame(() => {
    const type = src.category || 'misc';
    _ccSelectType(type);
    // Préremplir les champs communs
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val||''; };
    set('cc-name', src.name?.fr || '');
    set('cc-price', src.priceGp || 0);
    set('cc-weight', src.weightKg || 0);
    set('cc-desc', src.description?.fr || '');
    set('cc-notes', '');
    // Champs spécifiques
    if (type === 'weapon' && src.wData) {
      set('cc-dmg', src.wData.damageMedium || '');
      set('cc-crit', src.wData.critical || '');
      set('cc-dmgtype', (src.wData.damageType||[]).join(', '));
      set('cc-range', src.wData.range || '');
    } else if ((type === 'armor' || type === 'shield') && src.aData) {
      set('cc-ac-bonus', src.aData.armorBonus || 0);
      set('cc-ac-maxdex', src.aData.maxDex === 99 ? '' : src.aData.maxDex);
      set('cc-ac-penalty', src.aData.penalty || 0);
      set('cc-ac-arcfail', src.aData.arcane_fail || 0);
      set('cc-sh-bonus', src.aData.armorBonus || 0);
      set('cc-sh-penalty', src.aData.penalty || 0);
    } else if (type === 'wondrous') {
      set('cc-slot', src.slot || '');
    }
    // Préremplir les effets calculés
    const effs = (src.effects||[]).filter(e=>!e.descriptive&&e.value!==0);
    effs.forEach((e,i) => {
      set(`cc-ef-tgt-${i}`, e.target || '');
      set(`cc-ef-btype-${i}`, e.bonusType || '');
      set(`cc-ef-val-${i}`, e.value ?? '');
    });
  });
}

function _shopListRow(id, it) {
  const isMagic = (it.effects||[]).length > 0;
  const isSelected = _shopSelId === id;
  const bgSel = isSelected ? 'background:var(--bg3);' : '';
  const goldName = isMagic ? 'color:var(--gold-light);font-weight:600;' : 'color:var(--text-bright);';
  const cat = _shopActiveCat;

  const nameFr = `<div style="${goldName}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;" title="${it.name}">${isMagic?'✨ ':''}${it.name}</div>
    <div style="font-size:9px;color:var(--text-dim);">${it.nameEn||''}</div>`;
  const prix = `<span style="color:var(--gold);font-weight:600;white-space:nowrap;">${it.gp.toLocaleString()} po</span>`;
  const poids = `<span style="color:var(--text-dim);">${it.wKg||0} kg</span>`;

  let cells = [];
  if (cat === 'weapon') {
    const wc = it.wClass || {};
    const wd = it.wData || {};
    cells = [
      nameFr,
      `<span style="font-size:10px;color:var(--text-dim);">${PROF_FR[wc.prof]||'—'}</span>`,
      `<span style="font-size:10px;color:var(--text-dim);">${HANDS_FR[wc.hands]||'—'}</span>`,
      `<span style="font-size:12px;font-weight:600;color:var(--text-bright);">${wd.damageMedium||'—'}</span>`,
      `<span style="font-size:10px;color:var(--text-dim);">${wd.critical||'—'}</span>`,
      `<span style="font-size:10px;color:var(--text-dim);">${wd.range||'—'}</span>`,
      poids, prix,
    ];
  } else if (cat === 'armor') {
    const ad = it.aData || {};
    cells = [
      nameFr,
      `<span style="font-size:10px;color:var(--text-dim);">${ARMOR_CLASS_FR[it.armorClass]||'—'}</span>`,
      `<span style="color:var(--green);font-weight:700;">+${ad.bonus||'—'}</span>`,
      `<span style="font-size:10px;color:var(--text-dim);">${ad.maxDex!==undefined?'+'+ad.maxDex:'—'}</span>`,
      `<span style="font-size:10px;color:${(ad.penalty||0)<0?'var(--red)':'var(--text-dim)'};">${ad.penalty||0}</span>`,
      `<span style="font-size:10px;color:var(--text-dim);">${ad.arcane_fail!==undefined?ad.arcane_fail+'%':'—'}</span>`,
      poids, prix,
    ];
  } else if (cat === 'shield') {
    const sd = it.sData || {};
    const shBonus = (it.effects||[]).find(e=>e.bonusType==='shield')?.value;
    cells = [
      nameFr,
      `<span style="color:var(--green);font-weight:700;">${shBonus!==undefined?'+'+shBonus:'—'}</span>`,
      `<span style="font-size:10px;color:${(sd.acp||0)<0?'var(--red)':'var(--text-dim)'};">${sd.acp||'—'}</span>`,
      poids, prix,
    ];
  } else if (cat === 'wondrous' || cat === 'ring') {
    const enh = (it.effects||[]).find(e=>e.bonusType==='enhancement')?.value;
    cells = [
      nameFr,
      `<span style="font-size:10px;color:var(--text-dim);">${it.slot||'—'}</span>`,
      enh!==undefined?`<span style="color:var(--gold);font-weight:700;">+${enh}</span>`:`<span style="color:var(--text-dim);">—</span>`,
      poids, prix,
    ];
  } else {
    const catFr = ITEM_CATEGORIES_FR[it.cat]||it.cat;
    cells = [nameFr, `<span style="font-size:10px;color:var(--text-dim);">${catFr}</span>`, poids, prix];
  }

  return `<tr style="border-bottom:1px solid var(--border);cursor:pointer;${bgSel}"
    onclick="_shopSelId='${id}';_shopRenderDetail('${id}');"
    onmouseenter="if('${id}'!=='${_shopSelId}')this.style.background='rgba(255,255,255,0.03)'"
    onmouseleave="if('${id}'!=='${_shopSelId}')this.style.background=''">
    ${cells.map(c=>`<td style="padding:5px 8px;">${c}</td>`).join('')}
  </tr>`;
}

// ── Fiche détaillée ───────────────────────────────────────────
function _shopRenderDetail(dbId) {
  const panel = document.getElementById('shop-detail-panel');
  if (!panel) return;
  const it = ITEM_DB[dbId];
  if (!it) return;
  // Masquer le panel accès rapide quand un item est sélectionné
  const qp = document.getElementById('shop-quickpick');
  if (qp) qp.style.display = 'none';

  const gpAvail   = _walletGpTotal();
  const canAfford = gpAvail >= it.gp;
  const isMagic   = (it.effects||[]).length > 0;
  const catFr     = ITEM_CATEGORIES_FR[it.cat] || it.cat;

  // ── Stats block by type ──────────────────────────────────
  let statsHtml = '';

  if (it.cat === 'weapon' && it.wData) {
    const wd = it.wData, wc = it.wClass||{};
    const tags = (wc.tags||[]).filter(t=>!['slashing','piercing','bludgeoning','ranged'].includes(t));
    statsHtml = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
        ${[
          ['Dégâts',    wd.damageMedium||'—',   true],
          ['Critique',  wd.critical||'—',        false],
          ['Maîtrise',  PROF_FR[wc.prof]||'—',   false],
          ['Maniabilité',HANDS_FR[wc.hands]||'—',false],
          ['Portée',    wd.range||'—',            false],
          ['Type',      (wd.damageType||[]).join(' / ')||'—', false],
        ].map(([label,val,highlight])=>`
        <div style="background:var(--bg3);border-radius:4px;padding:6px 8px;">
          <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">${label.toUpperCase()}</div>
          <div style="font-size:${highlight?'15':'12'}px;font-weight:${highlight?700:400};color:${highlight?'var(--gold)':'var(--text-bright)'};">${val}</div>
        </div>`).join('')}
      </div>
      ${tags.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
        ${tags.map(t=>`<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:rgba(100,120,220,0.12);border:1px solid rgba(100,120,220,0.3);color:#8899ee;">${t}</span>`).join('')}
      </div>`:''}`;
  } else if (it.cat === 'armor' && it.aData) {
    const ad = it.aData;
    statsHtml = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
        ${[
          ['Bonus CA',   `+${ad.bonus}`,          true],
          ['Catégorie',  ARMOR_CLASS_FR[it.armorClass]||'—', false],
          ['DEX max',    ad.maxDex!==undefined?'+'+ad.maxDex:'—', false],
          ['Malus armure',ad.penalty||0,           false],
          ['Échec arc.', ad.arcane_fail!==undefined?ad.arcane_fail+'%':'—', false],
          ['Vitesse',    ad.speed?ad.speed+'m':'—', false],
        ].map(([label,val,highlight])=>`
        <div style="background:var(--bg3);border-radius:4px;padding:6px 8px;">
          <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">${label.toUpperCase()}</div>
          <div style="font-size:${highlight?'16':'12'}px;font-weight:${highlight?700:400};color:${highlight?'var(--green)':'var(--text-bright)'};">${val}</div>
        </div>`).join('')}
      </div>`;
  } else if (it.cat === 'shield') {
    const sd = it.sData||{};
    const shBonus = (it.effects||[]).find(e=>e.bonusType==='shield')?.value;
    statsHtml = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
        ${[
          ['Bonus CA',   shBonus!==undefined?'+'+shBonus:'—', true],
          ['ACP',        sd.acp||'—',              false],
          ['Échec arc.', sd.arcFail!==undefined?sd.arcFail+'%':'—', false],
        ].map(([label,val,highlight])=>`
        <div style="background:var(--bg3);border-radius:4px;padding:6px 8px;">
          <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">${label.toUpperCase()}</div>
          <div style="font-size:${highlight?'16':'12'}px;font-weight:${highlight?700:400};color:${highlight?'var(--green)':'var(--text-bright)'};">${val}</div>
        </div>`).join('')}
      </div>`;
  }

  // ── Magic effects ──
  const magicHtml = isMagic ? `
    <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:5px;">BONUS MAGIQUES</div>
    ${(it.effects||[]).map(e=>`
    <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);font-size:11px;">
      <span style="color:var(--text-dim);">${e.target||'—'}</span>
      <span style="color:var(--gold-dim);">${e.bonusType}</span>
      <span style="font-weight:700;color:${e.value>0?'var(--green)':'var(--red)'};">${e.value>0?'+':''}${e.value}</span>
    </div>`).join('')}
    <div style="margin-bottom:10px;"></div>` : '';

  panel.innerHTML = `
    <!-- En-tête -->
    <div style="padding:12px 14px;border-bottom:1px solid var(--border);margin-bottom:10px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div style="flex:1;">
          <div class="cinzel" style="font-size:16px;color:${isMagic?'var(--gold-light)':'var(--text-bright)'};font-weight:700;line-height:1.2;">${it.name}</div>
          <div style="font-size:11px;color:var(--text-dim);font-style:italic;">${it.nameEn||''}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="cinzel" style="font-size:18px;color:var(--gold);font-weight:700;">${it.gp.toLocaleString()} po</div>
          <div style="font-size:10px;color:${canAfford?'var(--green)':'var(--red)'};">${canAfford?'✓ Finançable':'✗ Insuffisant'}</div>
        </div>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;">
        <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">${catFr}</span>
        <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">${it.source}</span>
        ${it.slot&&it.slot!=='none'?`<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">Slot: ${it.slot}</span>`:''}
        ${it.wKg?`<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">⚖ ${it.wKg} kg</span>`:''}
        ${isMagic?'<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(100,120,220,0.12);border:1px solid rgba(100,120,220,0.3);color:#8899ee;">✨ Magique</span>':''}
      </div>
    </div>

    <div style="padding:0 14px 14px;">
      ${statsHtml}
      ${it.desc?`<div style="background:var(--bg3);border-left:3px solid var(--gold-dim);padding:8px 12px;border-radius:0 4px 4px 0;margin-bottom:10px;font-size:11px;color:var(--text-dim);line-height:1.6;">${it.desc}</div>`:''}
      ${magicHtml}

      <!-- Achat -->
      <div style="padding:10px;background:var(--bg3);border-radius:5px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <div style="font-size:11px;color:var(--text-dim);">Bourse : <strong style="color:var(--gold);">${gpAvail.toLocaleString(undefined,{maximumFractionDigits:0})} po</strong></div>
          ${!canAfford?`<div style="font-size:10px;color:var(--red);">Manque ${(it.gp-gpAvail).toLocaleString(undefined,{maximumFractionDigits:0})} po</div>`:''}
        </div>
        <button class="btn btn-primary" style="font-size:13px;padding:8px 20px;white-space:nowrap;" onclick="buyFromShop('${dbId}')">
          🛒 Acheter
        </button>
      </div>
    </div>`;
}

// ─── BUILDER CUSTOM PAR TYPE ─────────────────────────────────
// Remplace l'ancien modal fixe par un builder dynamique adapté au type.
// Ouvrir depuis la Boutique (+) ou l'Inventaire (+).
// Schéma de sortie : customItem{name,category,slot,wData?,aData?,effects[],description,priceGp,weightKg}

const _CC_TYPES = [
  { id:'weapon',   label:'⚔ Arme',                  icon:'⚔' },
  { id:'armor',    label:'🛡 Armure',                icon:'🛡' },
  { id:'shield',   label:'🔰 Bouclier',              icon:'🔰' },
  { id:'wondrous', label:'✨ Objet merveilleux / Bijou', icon:'✨' },
  { id:'consumable',label:'🧪 Consommable / Potion', icon:'🧪' },
  { id:'misc',     label:'📦 Loot / Objet libre',    icon:'📦' },
];

const _CC_SLOTS = [
  {id:'',        label:'— Aucun slot —'},
  {id:'head',    label:'Tête'},
  {id:'face',    label:'Visage'},
  {id:'neck',    label:'Gorge / Cou'},
  {id:'shoulders',label:'Épaules'},
  {id:'chest',   label:'Torse'},
  {id:'body',    label:'Corps entier'},
  {id:'waist',   label:'Taille'},
  {id:'arms',    label:'Bras'},
  {id:'hands',   label:'Mains'},
  {id:'feet',    label:'Pieds'},
  {id:'ring1',   label:'Anneau (G.)'},
  {id:'ring2',   label:'Anneau (D.)'},
  {id:'slotless',label:'Sans emplacement'},
];

const _CC_EFFECT_TARGETS = [
  {id:'ability.STR',  label:'Force'},
  {id:'ability.DEX',  label:'Dextérité'},
  {id:'ability.CON',  label:'Constitution'},
  {id:'ability.INT',  label:'Intelligence'},
  {id:'ability.WIS',  label:'Sagesse'},
  {id:'ability.CHA',  label:'Charisme'},
  {id:'defense.deflection',  label:'CA Déflexion'},
  {id:'defense.naturalArmor',label:'CA Armure naturelle'},
  {id:'defense.dodge',       label:'CA Esquive'},
  {id:'defense.sacred',      label:'CA Sacré'},
  {id:'save.all',      label:'Tous jets de save'},
  {id:'save.fortitude',label:'Vigueur'},
  {id:'save.reflex',   label:'Réflexes'},
  {id:'save.will',     label:'Volonté'},
  {id:'combat.initiative', label:'Initiative'},
  {id:'combat.attack',     label:'Jets d\'attaque'},
];
const _CC_BONUS_TYPES = [
  {id:'enhancement',    label:'Altération'},
  {id:'morale',         label:'Moral'},
  {id:'luck',           label:'Chance'},
  {id:'sacred',         label:'Sacré'},
  {id:'resistance',     label:'Résistance'},
  {id:'deflection',     label:'Déflexion'},
  {id:'natural_armor',  label:'Armure naturelle'},
  {id:'dodge',          label:'Esquive (cumul)'},
  {id:'untyped',        label:'Sans type (cumul)'},
];

let _ccEffectRows = 1; // nombre de lignes d'effets calculés affichées

function _shopOpenCustomCreator() {
  _ccEffectRows = 1;
  // Nettoyer tout ancien modal
  document.getElementById('cc-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'cc-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:1000;' +
    'display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:24px 0;';
  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
                width:560px;max-width:95vw;padding:0 0 20px;">
      <div class="panel-header" style="padding:14px 18px;border-radius:8px 8px 0 0;">
        <span class="panel-title cinzel" style="letter-spacing:1px;">✦ CRÉER UN OBJET</span>
        <button class="btn btn-secondary btn-small" onclick="document.getElementById('cc-overlay').remove()">✕</button>
      </div>
      <!-- Sélection du type -->
      <div style="padding:14px 18px 10px;">
        <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:8px;">TYPE D'OBJET</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${_CC_TYPES.map(t => `
            <button onclick="_ccSelectType('${t.id}')" id="cctype-${t.id}"
              style="padding:6px 12px;font-size:11px;border-radius:5px;cursor:pointer;
                     background:var(--bg3);border:1px solid var(--border);color:var(--text-dim);">
              ${t.label}
            </button>`).join('')}
        </div>
      </div>
      <!-- Champs dynamiques -->
      <div id="cc-fields" style="padding:0 18px;"></div>
      <!-- Actions -->
      <div id="cc-actions" style="display:none;padding:14px 18px 0;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="document.getElementById('cc-overlay').remove()">Annuler</button>
        <button class="btn btn-secondary" onclick="_ccSave(false)"
          title="Créer l'objet dans le shop uniquement — l'ajouter à l'inventaire plus tard">
          📋 Ajouter au shop
        </button>
        <button class="btn btn-primary" onclick="_ccSave(true)">✓ Shop + Inventaire</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function _ccSelectType(type) {
  // Highlight bouton actif
  _CC_TYPES.forEach(t => {
    const btn = document.getElementById('cctype-' + t.id);
    if (!btn) return;
    const active = t.id === type;
    btn.style.background    = active ? 'rgba(180,140,60,0.2)'    : 'var(--bg3)';
    btn.style.borderColor   = active ? 'var(--gold-dim)'          : 'var(--border)';
    btn.style.color         = active ? 'var(--gold)'              : 'var(--text-dim)';
  });
  document.getElementById('cc-fields').dataset.type = type;
  document.getElementById('cc-fields').innerHTML = _ccFieldsHTML(type);
  document.getElementById('cc-actions').style.display = 'flex';
}

function _ccFieldsHTML(type) {
  const tOpts = _CC_EFFECT_TARGETS.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
  const bOpts = _CC_BONUS_TYPES.map(b => `<option value="${b.id}">${b.label}</option>`).join('');
  const slotOpts = _CC_SLOTS.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
  const g = (label, html, full) =>
    `<div class="form-group${full?' full':''}">
       <label style="font-size:10px;">${label}</label>${html}
     </div>`;
  const inp = (id, placeholder='', type='text', extra='') =>
    `<input type="${type}" id="${id}" placeholder="${placeholder}" ${extra}
       style="font-size:12px;width:100%;">`;
  const tex = (id, rows=2, placeholder='') =>
    `<textarea id="${id}" rows="${rows}" style="font-size:12px;width:100%;resize:vertical;"
       placeholder="${placeholder}"></textarea>`;
  const effRows = () => {
    let rows = '';
    for (let i = 0; i < _ccEffectRows; i++) {
      rows += `<div style="display:grid;grid-template-columns:1fr 1fr 60px 24px;gap:4px;margin-bottom:4px;">
        <select id="cc-ef-tgt-${i}" style="font-size:11px;"><option value="">— Cible —</option>${tOpts}</select>
        <select id="cc-ef-btype-${i}" style="font-size:11px;"><option value="">— Type bonus —</option>${bOpts}</select>
        <input type="number" id="cc-ef-val-${i}" placeholder="±val" step="1"
          style="font-size:11px;text-align:center;">
        ${i===0?`<button onclick="_ccAddEffRow()" title="Ajouter une ligne"
          style="padding:2px 6px;font-size:13px;cursor:pointer;background:var(--bg3);
                 border:1px solid var(--border);color:var(--gold);border-radius:3px;">+</button>`:
          `<button onclick="_ccRemoveEffRow(${i})" title="Supprimer"
          style="padding:2px 6px;font-size:11px;cursor:pointer;background:var(--bg3);
                 border:1px solid var(--border);color:var(--red-dim);border-radius:3px;">✕</button>`}
      </div>`;
    }
    return `<div class="form-group" style="grid-column:1/-1;">
      <label style="font-size:10px;">EFFETS CALCULÉS <span style="color:var(--text-dim);font-size:9px;">(optionnel)</span></label>
      <div id="cc-eff-rows">${rows}</div>
    </div>`;
  };

  const common = `
    ${g('NOM *', inp('cc-name', 'Nom de l\'objet…'))}
    ${g('PRIX (po)', inp('cc-price', '0', 'number', 'min="0" step="0.01"'))}`;
  const commonFull = `
    ${g('DESCRIPTION', tex('cc-desc', 2, 'Description, propriétés, histoire…'), true)}
    ${g('NOTES LIBRES', inp('cc-notes', 'Notes personnelles…'), true)}`;

  if (type === 'weapon') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      ${common}
      ${g('DÉGÂTS', inp('cc-dmg', '1d8', 'text', 'placeholder="1d8, 2d6..."'))}
      ${g('CRITIQUE', inp('cc-crit', '×2', 'text', 'placeholder="×2, 19-20/×2..."'))}
      ${g('TYPE DE DÉGÂTS', inp('cc-dmgtype', 'contondant, tranchant…'))}
      ${g('PORTÉE (si distance)', inp('cc-range', '18m ou vide'))}
      ${g('POIDS (kg)', inp('cc-weight', '1', 'number', 'min="0" step="0.1"'))}
      ${effRows()}
      ${commonFull}
    </div>`;

  if (type === 'armor') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      ${common}
      ${g('BONUS CA', inp('cc-ac-bonus', '0', 'number', 'min="0" max="20"'))}
      ${g('MAX DEX', inp('cc-ac-maxdex', '—', 'text', 'placeholder="ex: 2, ou vide"'))}
      ${g('MALUS D\'ARMURE', inp('cc-ac-penalty', '0', 'number', 'max="0"'))}
      ${g('ÉCHEC SORTS PROFANES (%)', inp('cc-ac-arcfail', '0', 'number', 'min="0" max="100" step="5"'))}
      ${g('POIDS (kg)', inp('cc-weight', '15', 'number', 'min="0" step="0.5"'))}
      ${commonFull}
    </div>`;

  if (type === 'shield') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      ${common}
      ${g('BONUS DE BOUCLIER', inp('cc-sh-bonus', '0', 'number', 'min="0" max="10"'))}
      ${g('MALUS ATTAQUE', inp('cc-sh-penalty', '0', 'number', 'max="0"'))}
      ${g('POIDS (kg)', inp('cc-weight', '3', 'number', 'min="0" step="0.5"'))}
      ${commonFull}
    </div>`;

  if (type === 'wondrous') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      ${common}
      ${g('POIDS (kg)', inp('cc-weight', '0', 'number', 'min="0" step="0.1"'))}
      <div class="form-group" style="grid-column:1/-1;">
        <label style="font-size:10px;">EMPLACEMENT</label>
        <select id="cc-slot" style="font-size:12px;width:100%;">${slotOpts}</select>
      </div>
      ${effRows()}
      ${commonFull}
    </div>`;

  if (type === 'consumable') return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      ${common}
      ${g('QUANTITÉ / CHARGES', inp('cc-qty', '1', 'number', 'min="1"'))}
      ${commonFull}
    </div>`;

  // misc / loot
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      ${common}
      ${g('POIDS (kg)', inp('cc-weight', '0', 'number', 'min="0" step="0.1"'))}
      ${commonFull}
    </div>`;
}

function _ccAddEffRow() {
  _ccEffectRows++;
  const type = document.getElementById('cc-fields')?.dataset.type || 'wondrous';
  document.getElementById('cc-fields').innerHTML = _ccFieldsHTML(type);
}
function _ccRemoveEffRow(idx) {
  if (_ccEffectRows > 1) { _ccEffectRows--; }
  const type = document.getElementById('cc-fields')?.dataset.type || 'wondrous';
  document.getElementById('cc-fields').innerHTML = _ccFieldsHTML(type);
}

function _ccSave(addToInventory = true) {
  const name = (document.getElementById('cc-name')?.value || '').trim();
  if (!name) { showToast('Le nom est obligatoire', 'error'); return; }

  const type    = document.getElementById('cc-fields')?.dataset.type || 'misc';
  const price   = parseFloat(document.getElementById('cc-price')?.value) || 0;
  const weight  = parseFloat(document.getElementById('cc-weight')?.value) || 0;
  const desc    = (document.getElementById('cc-desc')?.value  || '').trim();
  const notes   = (document.getElementById('cc-notes')?.value || '').trim();
  const qty     = parseInt(document.getElementById('cc-qty')?.value) || 1;

  // Effets calculés (wondrous + weapon)
  const effects = [];
  for (let i = 0; i < _ccEffectRows; i++) {
    const tgt   = document.getElementById(`cc-ef-tgt-${i}`)?.value   || '';
    const btype = document.getElementById(`cc-ef-btype-${i}`)?.value || '';
    const val   = parseInt(document.getElementById(`cc-ef-val-${i}`)?.value);
    if (tgt && btype && !isNaN(val) && val !== 0) {
      effects.push({ target: tgt, bonusType: btype, value: val });
    }
  }

  let customItem = {
    name:        { fr: name, en: '' },
    category:    type,
    slot:        '',
    priceGp:     price,
    weightKg:    weight,
    description: { fr: desc },
    effects,
  };

  if (type === 'weapon') {
    const dmg     = (document.getElementById('cc-dmg')?.value     || '').trim();
    const crit    = (document.getElementById('cc-crit')?.value    || '').trim();
    const dmgtype = (document.getElementById('cc-dmgtype')?.value || '').trim();
    const range   = (document.getElementById('cc-range')?.value   || '').trim();
    customItem.slot  = 'main_hand';
    customItem.wData = {
      damageMedium: dmg  || '1d4',
      critical:     crit || '×2',
      damageType:   dmgtype ? dmgtype.split(/[,/]+/).map(s=>s.trim()).filter(Boolean) : [],
      ...(range ? { range } : {}),
    };
  } else if (type === 'armor') {
    const bonus   = parseInt(document.getElementById('cc-ac-bonus')?.value)   || 0;
    const maxDex  = document.getElementById('cc-ac-maxdex')?.value?.trim();
    const penalty = parseInt(document.getElementById('cc-ac-penalty')?.value) || 0;
    const arcfail = parseInt(document.getElementById('cc-ac-arcfail')?.value) || 0;
    customItem.slot  = 'armor';
    customItem.aData = {
      armorBonus: bonus,
      maxDex:     maxDex && maxDex !== '—' && maxDex !== '' ? parseInt(maxDex) : 99,
      penalty:    penalty,
      arcane_fail: arcfail,
    };
    // Injecter l'effet armor automatiquement si bonus > 0
    if (bonus > 0 && !effects.find(e => e.target === 'defense.armor')) {
      customItem.effects = [{ target:'defense.armor', bonusType:'armor', value: bonus }, ...effects];
    }
  } else if (type === 'shield') {
    const bonus   = parseInt(document.getElementById('cc-sh-bonus')?.value)   || 0;
    const penalty = parseInt(document.getElementById('cc-sh-penalty')?.value) || 0;
    customItem.slot  = 'off_hand';
    customItem.aData = { armorBonus: bonus, penalty };
    if (bonus > 0) {
      customItem.effects = [{ target:'defense.shield', bonusType:'shield', value: bonus }, ...effects];
    }
  } else if (type === 'wondrous') {
    customItem.slot = document.getElementById('cc-slot')?.value || '';
  } else if (type === 'consumable') {
    // qty gérée sur l'instance
  }

  // Créer l'entrée catalogue custom
  const customEntry = {
    id: 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5),
    ...customItem,
    source: 'custom',
    createdAt: Date.now(),
  };
  if (!AppState.customItems) AppState.customItems = [];
  AppState.customItems.push(customEntry);

  // Optionnellement ajouter à l'inventaire
  if (addToInventory) {
    const inst = _createItemInstance(null, {
      customItem,
      paid:     price,
      notes,
      quantity: qty,
    });
    AppState.inventory.push(inst);
  }

  autosave();
  document.getElementById('cc-overlay')?.remove();
  const msg = addToInventory
    ? `✓ "${name}" ajouté au shop et à l'inventaire`
    : `✓ "${name}" ajouté au shop`;
  showToast(msg, 'success');
  // Rafraîchir le shop pour montrer le nouvel item
  if (_invPage === 'shop') renderInvShop();
  else renderInvInventory();
}

// Keep renderShopList as alias for filter oninput
function renderShopList() { _shopRenderList(); }



// ─── INVENTAIRE ──────────────────────────────────────────────
// ── Icônes par catégorie ──────────────────────────────────────
const _CAT_ICONS = {
  weapon:'⚔', armor:'🛡', shield:'🔰', wondrous:'✨', ring:'💍',
  wand:'🪄', staff:'🔱', rod:'⚙', scroll:'📜', consumable:'🧪',
  potion:'🧪', gear:'🎒', ammo:'🏹', treasure:'💎', quest:'⚜', misc:'📦',
};

function renderInvInventory() {
  const el=document.getElementById('inv-page-inventory');
  if (!el) return;
  const inv=AppState.inventory;
  const totalWkg=inv.reduce((s,i)=>s+_instWeightKg(i)*(i.quantity||1),0);
  const totalVal=inv.reduce((s,i)=>s+_instPriceGp(i)*(i.quantity||1),0);
  const toSellItems = inv.filter(i=>(i.tags||[]).includes('à vendre'));
  const toSellCount = toSellItems.length;
  const toSellVal   = toSellItems.reduce((s,i)=>s+_instPriceGp(i)*(i.quantity||1),0);
  const walletTotal = _walletGpTotal();

  el.innerHTML=`
    <!-- Bandeau stats -->
    <div style="display:flex;gap:12px;background:var(--bg3);border:1px solid var(--border);
                border-radius:6px;padding:8px 14px;margin-bottom:12px;align-items:center;flex-wrap:wrap;">
      <div><div class="cinzel" style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">OBJETS</div>
           <div style="font-size:18px;font-weight:700;color:var(--gold);">${inv.length}</div></div>
      <div style="width:1px;height:28px;background:var(--border);"></div>
      <div><div class="cinzel" style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">POIDS</div>
           <div style="font-size:13px;color:var(--text-bright);">${totalWkg.toFixed(1)} kg</div></div>
      <div><div class="cinzel" style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">VALEUR INV.</div>
           <div style="font-size:13px;color:var(--gold);">${totalVal.toLocaleString()} po</div></div>
      <div style="width:1px;height:28px;background:var(--border);"></div>
      <div style="cursor:pointer;" onclick="showInvPage('purse')" title="Voir la bourse">
        <div class="cinzel" style="font-size:9px;color:var(--text-dim);letter-spacing:1px;">💰 BOURSE</div>
        <div style="font-size:14px;font-weight:700;color:var(--gold);">${walletTotal.toLocaleString(undefined,{maximumFractionDigits:0})} po</div>
      </div>
      ${toSellCount>0?`<div style="width:1px;height:28px;background:var(--border);"></div>
      <div style="padding:4px 10px;background:rgba(220,160,0,0.12);border:1px solid rgba(220,160,0,0.35);
           border-radius:5px;cursor:pointer;" onclick="_invFilterSell()" title="Filtrer les objets à vendre">
        <div class="cinzel" style="font-size:9px;color:#e0a000;letter-spacing:1px;">À VENDRE</div>
        <div style="font-size:12px;font-weight:700;color:#e0a000;">${toSellCount} obj · ${toSellVal.toLocaleString()} po</div>
      </div>`:''}
      <div style="margin-left:auto;display:flex;gap:6px;">
        <button class="btn btn-secondary btn-small" onclick="_invAddManual()">+ Manuel</button>
        <button class="btn btn-primary btn-small" onclick="_shopOpenCustomCreator()">✦ Créer objet</button>
        <button class="btn btn-secondary btn-small" style="color:var(--text-dim);font-size:10px;"
          onclick="if(typeof resetInventory==='function')resetInventory()" title="Réinitialiser l'inventaire avec les items de démo">⟳ Reset</button>
      </div>
    </div>

    <!-- Filtres -->
    <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;align-items:center;">
      <input type="text" id="inv-q" placeholder="🔍 Chercher…" style="width:150px;font-size:12px;"
        oninput="_invRefreshList()">
      <select id="inv-fcat" style="font-size:11px;" onchange="_invRefreshList()">
        <option value="">Toutes catégories</option>
        ${Object.entries(ITEM_CATEGORIES_FR).map(([k,v])=>`<option value="${k}">${_CAT_ICONS[k]||''} ${v}</option>`).join('')}
      </select>
      <select id="inv-fstate" style="font-size:11px;" onchange="_invRefreshList()">
        <option value="">Tous états</option>
        <option value="equipped">⚔ Équipés</option>
        <option value="sell">💰 À vendre</option>
        <option value="quest">⚜ Quête</option>
      </select>
      <select id="inv-ftag" style="font-size:11px;" onchange="_invRefreshList()">
        <option value="">Tous tags</option>
        ${[..._invAllTags()].map(t=>`<option value="${t}">${t}</option>`).join('')}
      </select>
      <button class="btn btn-secondary btn-small" id="inv-filter-reset"
        onclick="_invResetFilters()" style="font-size:10px;">✕ Réinitialiser</button>
    </div>

    <!-- Tableau -->
    <div class="panel" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr style="border-bottom:2px solid var(--border);">
          <th style="text-align:left;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;width:28px;"></th>
          <th style="text-align:left;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">NOM</th>
          <th style="text-align:center;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">QTÉ</th>
          <th style="text-align:right;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">POIDS</th>
          <th style="text-align:right;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">PRIX</th>
          <th style="text-align:center;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">ÉTAT</th>
          <th style="padding:5px 8px;"></th>
        </tr></thead>
        <tbody id="inv-list-body"></tbody>
      </table>
      <div id="inv-empty-msg" class="hidden" style="padding:32px;text-align:center;color:var(--text-dim);font-style:italic;">
        Inventaire vide — créez ou achetez des objets.
      </div>
    </div>`;
  _invRefreshList();
}

function _invFilterSell() {
  const sel = document.getElementById('inv-fstate');
  if (sel) { sel.value = 'sell'; _invRefreshList(); }
}
function _invResetFilters() {
  const ids = ['inv-q','inv-fcat','inv-fstate','inv-ftag'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  _invRefreshList();
}

function _invRefreshList() {
  const body  = document.getElementById('inv-list-body');
  const empty = document.getElementById('inv-empty-msg');
  if (!body) return;

  const q      = (document.getElementById('inv-q')?.value||'').toLowerCase();
  const cat    = document.getElementById('inv-fcat')?.value||'';
  const state  = document.getElementById('inv-fstate')?.value||'';
  const tagF   = document.getElementById('inv-ftag')?.value||'';

  const items = AppState.inventory.filter(i => {
    const name = _instName(i).toLowerCase();
    const db   = i.itemDbId ? ITEM_DB[i.itemDbId] : null;
    const icat = i.customItem?.category || db?.cat || '';
    const tags = i.tags || [];
    if (cat    && icat !== cat) return false;
    if (state === 'equipped' && !isEquipped(i.instanceId)) return false;
    if (state === 'sell'     && !tags.includes('à vendre')) return false;
    if (state === 'quest'    && !i.meta?.questItem) return false;
    if (tagF   && !tags.includes(tagF)) return false;
    if (q && !name.includes(q) && !(i.notes||'').toLowerCase().includes(q) &&
        !(i.meta?.origin||'').toLowerCase().includes(q)) return false;
    return true;
  });

  if (!items.length) {
    body.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  // Tri : équipés en tête, puis à vendre, puis par nom
  items.sort((a, b) => {
    const aeq = isEquipped(a.instanceId) ? 0 : 1;
    const beq = isEquipped(b.instanceId) ? 0 : 1;
    if (aeq !== beq) return aeq - beq;
    const asell = (a.tags||[]).includes('à vendre') ? 0 : 1;
    const bsell = (b.tags||[]).includes('à vendre') ? 0 : 1;
    if (asell !== bsell) return asell - bsell;
    return _instName(a).localeCompare(_instName(b));
  });

  body.innerHTML = items.map(i => {
    const db     = i.itemDbId ? ITEM_DB[i.itemDbId] : null;
    const name   = _instName(i);
    const icat   = i.customItem?.category || db?.cat || '';
    const icon   = _CAT_ICONS[icat] || '📦';
    const wkg    = _instWeightKg(i);
    const price  = _instPriceGp(i);
    const eq     = isEquipped(i.instanceId);
    const slot   = getEquippedSlot(i.instanceId);
    const tags   = i.tags || [];
    const toSell = tags.includes('à vendre');
    const nameEsc = name.replace(/'/g, "\\'");

    // Badges état
    const eqBadge   = eq ? `<span style="font-size:9px;padding:1px 6px;border-radius:3px;
        background:rgba(74,154,80,0.18);color:var(--green);border:1px solid var(--green);">
        ⚔ ${slot||'Équipé'}</span>` : '';
    const sellBadge = toSell ? `<span style="font-size:9px;padding:1px 6px;border-radius:3px;
        background:rgba(220,160,0,0.15);color:#e0a000;border:1px solid rgba(220,160,0,0.4);
        cursor:pointer;" onclick="_invToggleTag('${i.instanceId}','à vendre',this)">💰 À vendre</span>` : '';
    const questBadge = i.meta?.questItem ? `<span style="font-size:9px;padding:1px 5px;border-radius:3px;
        background:rgba(200,147,58,0.15);color:var(--gold);border:1px solid rgba(200,147,58,0.3);">⚜ Quête</span>` : '';
    const returnBadge = i.meta?.toReturn ? `<span style="font-size:9px;padding:1px 5px;border-radius:3px;
        background:rgba(220,80,80,0.12);color:var(--red);border:1px solid rgba(220,80,80,0.25);">↩ À rendre</span>` : '';

    // Tags non-spéciaux (sauf à vendre affiché séparément)
    const otherTags = tags.filter(t => t !== 'à vendre').map(t =>
      `<span style="font-size:9px;padding:0 5px;border-radius:8px;
          background:rgba(100,130,220,0.1);color:#8899cc;border:1px solid rgba(100,130,220,0.2);">${t}</span>`
    ).join('');

    const badges = [eqBadge, sellBadge, questBadge, returnBadge].filter(Boolean).join(' ');

    // Bouton équiper/déséquiper rapide
    const equipBtn = !eq
      ? `<button class="btn btn-secondary btn-small" style="font-size:9px;padding:2px 7px;"
           onclick="toggleItemEquipped('${i.instanceId}')" title="Équiper">⚔</button>`
      : `<button class="btn btn-secondary btn-small" style="font-size:9px;padding:2px 7px;
           color:var(--green);" onclick="toggleItemEquipped('${i.instanceId}')" title="Déséquiper">↩</button>`;

    // Bouton basculer "à vendre" rapide
    const sellBtn = `<button class="btn btn-secondary btn-small" style="font-size:9px;padding:2px 7px;
        ${toSell?'color:#e0a000;':''}"
        onclick="_invQuickToggleSell('${i.instanceId}')" title="${toSell?'Retirer à vendre':'Marquer à vendre'}">
        💰</button>`;

    // Fond légèrement coloré pour les équipés et à vendre
    const rowBg = eq ? 'background:rgba(74,154,80,0.04);' :
                  toSell ? 'background:rgba(220,160,0,0.04);' : '';

    return `<tr style="border-bottom:1px solid var(--border);${rowBg}"
      onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background='${eq?'rgba(74,154,80,0.04)':toSell?'rgba(220,160,0,0.04)':''}'">
      <td style="padding:6px 6px;text-align:center;font-size:16px;">${icon}</td>
      <td style="padding:6px 8px;max-width:240px;">
        <div style="font-weight:600;color:${eq?'var(--green)':toSell?'#e0a000':'var(--text-bright)'};">${name}</div>
        ${badges?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px;">${badges}</div>`:''}
        ${otherTags?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${otherTags}</div>`:''}
        ${i.meta?.origin?`<div style="font-size:10px;color:var(--text-dim);font-style:italic;margin-top:1px;">${i.meta.origin}</div>`:''}
        ${i.notes?`<div style="font-size:10px;color:var(--text-dim);">${i.notes}</div>`:''}
      </td>
      <td style="padding:6px 8px;text-align:center;font-weight:600;">${i.quantity||1}</td>
      <td style="padding:6px 8px;text-align:right;color:var(--text-dim);font-size:11px;">${(wkg*(i.quantity||1)).toFixed(1)} kg</td>
      <td style="padding:6px 8px;text-align:right;color:var(--gold);font-size:11px;">${price?price.toLocaleString()+' po':'—'}</td>
      <td style="padding:4px 6px;text-align:center;">
        <div style="display:flex;gap:3px;justify-content:center;">
          ${equipBtn}${sellBtn}
        </div>
      </td>
      <td style="padding:5px 6px;white-space:nowrap;">
        <div style="display:flex;gap:3px;">
          <button class="btn btn-secondary btn-small" style="font-size:10px;padding:2px 8px;"
            onclick="_invOpenEdit('${i.instanceId}')">✏</button>
          <button class="btn btn-danger btn-small" style="font-size:10px;padding:2px 6px;"
            onclick="_invRemove('${i.instanceId}','${nameEsc}')">✕</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function _invQuickToggleSell(instanceId) {
  const inst = AppState.inventory.find(i => i.instanceId === instanceId);
  if (!inst) return;
  if (!inst.tags) inst.tags = [];
  const idx = inst.tags.indexOf('à vendre');
  if (idx >= 0) inst.tags.splice(idx, 1);
  else inst.tags.push('à vendre');
  autosave();
  renderInvInventory();
}

function _invAllTags() {
  const _INV_PREDEFINED_TAGS = ['à vendre','à garder','loot','quête','volé','à rendre','prêté','important','rare','danger','cadeau','forgé'];
  const custom = AppState.inventory.flatMap(i => i.tags||[]);
  return [...new Set([..._INV_PREDEFINED_TAGS, ...custom])].sort();
}

function _invOpenEdit(instanceId) {
  const inst = AppState.inventory.find(i => i.instanceId === instanceId);
  if (!inst) return;
  // Remove existing overlay
  document.getElementById('inv-edit-overlay')?.remove();

  const db      = inst.itemDbId ? ITEM_DB[inst.itemDbId] : null;
  const baseName  = db?.name || inst.customItem?.name?.fr || inst.instanceId;
  const baseDesc  = db?.desc || inst.customItem?.description?.fr || '';
  const basePrice = db?.gp   || inst.customItem?.priceGp || 0;
  const baseWkg   = db?.wKg  || inst.customItem?.weightKg || 0;

  // Ensure sub-objects exist
  if (!inst.overrides) inst.overrides = { name:'', description:'', priceGp:null, weightKg:null };
  if (!inst.meta)      inst.meta      = { origin:'', owner:'', toReturn:false, questItem:false, questNote:'' };
  if (!inst.tags)      inst.tags      = [];

  const allTags = _invAllTags();

  const overlay = document.createElement('div');
  overlay.id = 'inv-edit-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:500;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px 0;';

  const save = (field, path, value) => {
    const i = AppState.inventory.find(x => x.instanceId === instanceId);
    if (!i) return;
    if (path === 'root')       i[field] = value;
    else if (path === 'overrides') { if (!i.overrides) i.overrides={}; i.overrides[field] = value; }
    else if (path === 'meta')  { if (!i.meta) i.meta={}; i.meta[field] = value; }
    autosave();
    // Refresh badges in list without full re-render
    if (document.getElementById('inv-list-body')) _invRefreshList();
  };

  const tagBtns = allTags.map(t => {
    const active = inst.tags.includes(t);
    return `<button id="itag-${t.replace(/[^a-z]/gi,'_')}" onclick="_invToggleTag('${instanceId}','${t.replace(/'/g,"\'")}',this)"
      style="font-size:10px;padding:2px 9px;border-radius:10px;cursor:pointer;margin:2px;
             background:${active?'rgba(100,130,220,0.2)':'transparent'};
             border:1px solid ${active?'rgba(100,130,220,0.5)':'var(--border)'};
             color:${active?'#8899cc':'var(--text-dim)'};">${t}</button>`;
  }).join('');

  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;width:660px;max-width:95vw;padding:0 0 20px;">
      <!-- Header -->
      <div class="panel-header" style="padding:14px 18px;border-radius:8px 8px 0 0;">
        <span class="panel-title cinzel" style="letter-spacing:1px;">✏ ÉDITER — ${baseName}</span>
        <button class="btn btn-secondary btn-small" onclick="document.getElementById('inv-edit-overlay').remove();_invRefreshList();">✕ Fermer</button>
      </div>

      <div style="padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">

        <!-- Colonne gauche : identité -->
        <div>
          <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:8px;">IDENTITÉ</div>

          <div class="form-group mb-8">
            <label style="font-size:10px;">NOM PERSONNALISÉ <span style="color:var(--text-dim);font-size:9px;">(laissez vide pour garder "${baseName}")</span></label>
            <input type="text" value="${(inst.overrides.name||'').replace(/"/g,'&quot;')}" placeholder="${baseName}"
              style="font-size:13px;width:100%;"
              oninput="_invSave('${instanceId}','name','overrides',this.value)">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div class="form-group">
              <label style="font-size:10px;">QUANTITÉ</label>
              <input type="number" min="1" value="${inst.quantity||1}" style="font-size:12px;width:100%;"
                oninput="_invSave('${instanceId}','quantity','root',parseInt(this.value)||1)">
            </div>
            <div class="form-group">
              <label style="font-size:10px;">PRIX PAYÉ (po)</label>
              <input type="number" min="0" step="0.01" value="${inst.paid||0}" style="font-size:12px;width:100%;"
                oninput="_invSave('${instanceId}','paid','root',parseFloat(this.value)||0)">
            </div>
            <div class="form-group">
              <label style="font-size:10px;">VALEUR ESTIMÉE (po) <span style="font-size:9px;color:var(--text-dim);">override</span></label>
              <input type="number" min="0" step="0.01" placeholder="${basePrice}" style="font-size:12px;width:100%;"
                value="${inst.overrides.priceGp!==null&&inst.overrides.priceGp!==undefined?inst.overrides.priceGp:''}"
                oninput="_invSave('${instanceId}','priceGp','overrides',this.value===''?null:parseFloat(this.value))">
            </div>
            <div class="form-group">
              <label style="font-size:10px;">POIDS (kg) <span style="font-size:9px;color:var(--text-dim);">override</span></label>
              <input type="number" min="0" step="0.1" placeholder="${baseWkg}" style="font-size:12px;width:100%;"
                value="${inst.overrides.weightKg!==null&&inst.overrides.weightKg!==undefined?inst.overrides.weightKg:''}"
                oninput="_invSave('${instanceId}','weightKg','overrides',this.value===''?null:parseFloat(this.value))">
            </div>
          </div>

          <div class="form-group mb-8">
            <label style="font-size:10px;">DESCRIPTION PERSONNALISÉE <span style="font-size:9px;color:var(--text-dim);">override</span></label>
            <textarea rows="4" style="width:100%;font-size:12px;resize:vertical;" placeholder="${baseDesc||'Description…'}"
              oninput="_invSave('${instanceId}','description','overrides',this.value)">${(inst.overrides.description||'').replace(/</g,'&lt;')}</textarea>
          </div>

          <div class="form-group">
            <label style="font-size:10px;">NOTES LIBRES</label>
            <textarea rows="3" style="width:100%;font-size:12px;resize:vertical;" placeholder="Notes personnelles…"
              oninput="_invSave('${instanceId}','notes','root',this.value)">${(inst.notes||'').replace(/</g,'&lt;')}</textarea>
          </div>
        </div>

        <!-- Colonne droite : narratif -->
        <div>
          <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:8px;">NARRATIF</div>

          <div class="form-group mb-8">
            <label style="font-size:10px;">ORIGINE / OBTENU VIA</label>
            <input type="text" value="${(inst.meta.origin||'').replace(/"/g,'&quot;')}"
              placeholder="Trouvé sur un capitaine mort-vivant…"
              style="font-size:12px;width:100%;"
              oninput="_invSave('${instanceId}','origin','meta',this.value)">
          </div>

          <div class="form-group mb-8">
            <label style="font-size:10px;">APPARTIENT À</label>
            <input type="text" value="${(inst.meta.owner||'').replace(/"/g,'&quot;')}"
              placeholder="PNJ, faction, joueur…"
              style="font-size:12px;width:100%;"
              oninput="_invSave('${instanceId}','owner','meta',this.value)">
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 8px;background:var(--bg3);border-radius:4px;">
              <input type="checkbox" ${inst.meta.toReturn?'checked':''}
                onchange="_invSave('${instanceId}','toReturn','meta',this.checked)">
              <span>↩ À rendre</span>
            </label>
            <label style="font-size:12px;display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 8px;background:var(--bg3);border-radius:4px;">
              <input type="checkbox" ${inst.meta.questItem?'checked':''}
                onchange="_invSave('${instanceId}','questItem','meta',this.checked)">
              <span>⚜ Objet de quête</span>
            </label>
          </div>

          <div class="form-group mb-10">
            <label style="font-size:10px;">NOTE DE QUÊTE / CONTEXTE</label>
            <textarea rows="3" style="width:100%;font-size:12px;resize:vertical;"
              placeholder="Importance, contexte, mission liée…"
              oninput="_invSave('${instanceId}','questNote','meta',this.value)">${(inst.meta.questNote||'').replace(/</g,'&lt;')}</textarea>
          </div>

          <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:6px;">TAGS</div>
          <div style="margin-bottom:8px;">${tagBtns}</div>
          <div style="display:flex;gap:6px;">
            <input type="text" id="inv-tag-custom-${instanceId}" placeholder="Tag personnalisé…"
              style="flex:1;font-size:11px;"
              onkeydown="if(event.key==='Enter'){_invAddCustomTag('${instanceId}');event.preventDefault();}">
            <button class="btn btn-secondary btn-small" onclick="_invAddCustomTag('${instanceId}')">+ Ajouter</button>
          </div>
        </div>
      </div>

      <!-- Source info (read-only) -->
      ${db||inst.customItem?`<div style="margin:0 18px;padding:8px 12px;background:var(--bg3);border-radius:5px;font-size:10px;color:var(--text-dim);">
        <strong>Référence catalogue :</strong> ${db?.name||inst.customItem?.name?.fr||'—'}
        ${db?`· ${db.source||''}  · ${db.gp} po · ${db.wKg||0} kg`:''}
        ${inst.overrides?.name||inst.overrides?.priceGp!==null||inst.overrides?.weightKg!==null?'<span style="color:var(--green);margin-left:8px;">• Champs modifiés localement</span>':''}
      </div>`:''}
    </div>`;

  document.body.appendChild(overlay);
}

function _invSave(instanceId, field, path, value) {
  const inst = AppState.inventory.find(i => i.instanceId === instanceId);
  if (!inst) return;
  if (path === 'root')      inst[field] = value;
  else if (path === 'overrides') { if (!inst.overrides) inst.overrides={}; inst.overrides[field] = value; }
  else if (path === 'meta')     { if (!inst.meta) inst.meta={}; inst.meta[field] = value; }
  autosave();
}

function _invToggleTag(instanceId, tag, btn) {
  const inst = AppState.inventory.find(i => i.instanceId === instanceId);
  if (!inst) return;
  if (!inst.tags) inst.tags = [];
  const idx = inst.tags.indexOf(tag);
  if (idx >= 0) {
    inst.tags.splice(idx, 1);
    btn.style.background = 'transparent';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = 'var(--text-dim)';
  } else {
    inst.tags.push(tag);
    btn.style.background = 'rgba(100,130,220,0.2)';
    btn.style.borderColor = 'rgba(100,130,220,0.5)';
    btn.style.color = '#8899cc';
  }
  autosave();
  if (document.getElementById('inv-list-body')) _invRefreshList();
}

function _invAddCustomTag(instanceId) {
  const input = document.getElementById('inv-tag-custom-'+instanceId);
  const tag   = (input?.value||'').trim().toLowerCase();
  if (!tag) return;
  const inst  = AppState.inventory.find(i => i.instanceId === instanceId);
  if (!inst) return;
  if (!inst.tags) inst.tags = [];
  if (!inst.tags.includes(tag)) {
    inst.tags.push(tag);
    autosave();
    // Re-render the edit panel to show new tag
    _invOpenEdit(instanceId);
  }
  if (input) input.value = '';
}


function _invAddManual() {
  const name=prompt('Nom de l\'objet :');
  if (!name||!name.trim()) return;
  const paidStr=prompt('Prix payé (po, laisser vide = 0) :', '0');
  const paid=parseFloat(paidStr)||0;
  const inst=_createItemInstance(null,{
    customItem:{name:{fr:name.trim(),en:''},category:'misc',priceGp:paid,weightKg:0,description:{fr:''},effects:[]},
    paid, notes:''
  });
  AppState.inventory.push(inst);
  autosave();
  _invRefreshList();
}

function _invEditNotes(instanceId) {
  const inst=AppState.inventory.find(i=>i.instanceId===instanceId);
  if (!inst) return;
  const notes=prompt('Notes :', inst.notes||'');
  if (notes===null) return;
  inst.notes=notes;
  autosave();
  _invRefreshList();
}

function _invRemove(instanceId, name) {
  if (!confirm(`Supprimer "${name}" de l'inventaire ?`)) return;
  AppState.inventory=AppState.inventory.filter(i=>i.instanceId!==instanceId);
  // Remove from equipment if equipped
  const eq=AppState.equipment;
  Object.keys(eq).forEach(slot=>{
    if (slot==='slotless') eq.slotless=(eq.slotless||[]).filter(id=>id!==instanceId);
    else if (eq[slot]===instanceId) eq[slot]=null;
  });
  autosave();
  renderInvInventory();
}


// ─── BOURSE ───────────────────────────────────────────────────
function renderInvPurse() {
  const el=document.getElementById('inv-page-purse');
  if (!el) return;
  const w=AppState.wallet;
  const gpTotal=_walletGpTotal();
  const log=[...(AppState.walletLog||[])].reverse();
  const DEVISE=[{id:'gp',label:'PO — Or',color:'#ffd060'},{id:'pp',label:'PP — Platine',color:'#d0d0ff'},{id:'sp',label:'PA — Argent',color:'#c0c0c0'},{id:'cp',label:'PC — Cuivre',color:'#c07040'}];
  el.innerHTML=`
    <div style="display:grid;grid-template-columns:340px 1fr;gap:16px;">
      <div style="display:flex;flex-direction:column;gap:12px;">
        <!-- Solde -->
        <div class="panel">
          <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;">💰 BOURSE</span></div>
          <div class="panel-body" style="padding:14px;">
            ${DEVISE.map(d=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);">
              <div style="width:30px;height:30px;border-radius:50%;background:${d.color}22;border:2px solid ${d.color}55;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${d.color};">${d.id.toUpperCase()}</div>
              <div style="flex:1;">
                <input type="number" min="0" value="${w[d.id]||0}" style="font-size:16px;font-weight:700;color:${d.color};background:transparent;border:none;width:120px;"
                  oninput="AppState.wallet['${d.id}']=Math.max(0,parseFloat(this.value)||0);autosave();">
                <div style="font-size:10px;color:var(--text-dim);">${d.label}</div>
              </div>
            </div>`).join('')}
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-size:11px;color:var(--text-dim);">Total</span>
              <span class="cinzel" style="font-size:18px;font-weight:700;color:var(--gold);">${gpTotal.toLocaleString(undefined,{maximumFractionDigits:2})} po</span>
            </div>
          </div>
        </div>
        <!-- Ajouter une entrée -->
        <div class="panel">
          <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;font-size:11px;">✏ AJOUTER UNE ENTRÉE</span></div>
          <div class="panel-body" style="padding:12px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
              <div><label style="font-size:10px;color:var(--text-dim);">MONTANT</label>
                <input id="wl-amount" type="number" min="0" step="0.01" placeholder="0" style="width:100%;font-size:13px;"></div>
              <div><label style="font-size:10px;color:var(--text-dim);">DEVISE</label>
                <select id="wl-currency" style="width:100%;font-size:12px;">
                  ${DEVISE.map(d=>`<option value="${d.id}">${d.id.toUpperCase()}</option>`).join('')}
                </select></div>
            </div>
            <input id="wl-note" type="text" placeholder="Note libre (Vente épée +7po, Récompense MJ…)"
              style="width:100%;font-size:12px;margin-bottom:10px;">
            <div style="display:flex;gap:6px;">
              <button class="btn btn-secondary" style="flex:1;font-size:12px;" onclick="_walletManual(-1)">— Dépenser</button>
              <button class="btn btn-primary"   style="flex:1;font-size:12px;" onclick="_walletManual(1)">+ Recevoir</button>
            </div>
          </div>
        </div>
        <!-- Aide revente -->
        <div class="panel">
          <div class="panel-header"><span class="panel-title cinzel" style="letter-spacing:1px;font-size:10px;">🔢 CALCULATEUR DE REVENTE</span></div>
          <div class="panel-body" style="padding:12px;">
            <div style="background:var(--bg3);border-left:3px solid var(--gold-dim);padding:8px 12px;border-radius:0 4px 4px 0;margin-bottom:10px;">
              <div style="font-size:11px;color:var(--text-dim);line-height:1.6;">
                En règle générale, un objet se revend à <strong style="color:var(--gold);">50 %</strong> de sa valeur de marché. Le MJ peut modifier ce montant selon le contexte.
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input id="resell-val" type="number" min="0" placeholder="Valeur de l'objet (po)" style="flex:1;font-size:12px;"
                oninput="document.getElementById('resell-result').textContent=(Math.floor((parseFloat(this.value)||0)/2)).toLocaleString()+' po';">
              <div style="text-align:center;min-width:80px;">
                <div style="font-size:9px;color:var(--text-dim);">REVENTE EST.</div>
                <div id="resell-result" class="cinzel" style="font-size:16px;color:var(--gold);font-weight:700;">0 po</div>
              </div>
            </div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:6px;font-style:italic;">
              Ce calcul est indicatif — ajoutez la somme manuellement ci-dessus.
            </div>
          </div>
        </div>
      </div>
      <!-- Historique -->
      <div class="panel" style="display:flex;flex-direction:column;">
        <div class="panel-header">
          <span class="panel-title cinzel" style="letter-spacing:1px;">📜 HISTORIQUE</span>
          <span class="small text-dim">${log.length} entrée${log.length!==1?'s':''}</span>
          ${log.length?`<button class="btn btn-danger btn-small" onclick="if(confirm('Effacer l\'historique ?')){AppState.walletLog=[];autosave();renderInvPurse();}">Effacer</button>`:''}
        </div>
        <div style="overflow-y:auto;flex:1;max-height:calc(100vh - 180px);">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead style="position:sticky;top:0;background:var(--bg2);">
              <tr style="border-bottom:2px solid var(--border);">
                <th style="text-align:left;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">DATE</th>
                <th style="text-align:left;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">NOTE</th>
                <th style="text-align:right;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">MONTANT</th>
                <th style="text-align:center;padding:5px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">DEV.</th>
              </tr>
            </thead>
            <tbody>
              ${log.length
                ?log.map(entry=>{
                    const d=new Date(entry.timestamp||0);
                    const dt=d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
                    const amt=entry.amount||0;
                    const col=amt>0?'var(--green)':amt<0?'var(--red)':'var(--text-dim)';
                    return `<tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:5px 8px;font-size:10px;color:var(--text-dim);white-space:nowrap;">${dt}</td>
                      <td style="padding:5px 8px;color:var(--text-dim);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${(entry.note||'').replace(/"/g,'&quot;')}">${entry.note||'—'}</td>
                      <td style="padding:5px 8px;text-align:right;font-weight:600;color:${col};">${amt>0?'+':''}${amt.toLocaleString()}</td>
                      <td style="padding:5px 8px;text-align:center;font-size:10px;color:var(--text-dim);">${(entry.currency||'gp').toUpperCase()}</td>
                    </tr>`;
                  }).join('')
                :'<tr><td colspan="4" style="padding:32px;text-align:center;color:var(--text-dim);font-style:italic;">Aucune transaction.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function _walletManual(sign) {
  const amt=parseFloat(document.getElementById('wl-amount')?.value)||0;
  const cur=document.getElementById('wl-currency')?.value||'gp';
  const note=(document.getElementById('wl-note')?.value||'').trim()||'Transaction manuelle';
  if (!amt) return;
  _walletAdd(sign*amt, cur, note);
  document.getElementById('wl-amount').value='';
  document.getElementById('wl-note').value='';
  autosave();
  renderInvPurse();
}


// ─── ÉQUIPEMENT (stub — reprend renderInvEquipment de la passe précédente) ──
function renderInvEquipment() {
  const el=document.getElementById('inv-page-equipment');
  if (!el) return;
  const SLOTS=[
    {id:'head',label:'Tête',icon:'👑'},{id:'face',label:'Visage',icon:'🎭'},
    {id:'neck',label:'Gorge/Cou',icon:'📿'},{id:'shoulders',label:'Épaules',icon:'🧣'},
    {id:'chest',label:'Torse',icon:'👕'},{id:'body',label:'Corps entier',icon:'🧥'},
    {id:'waist',label:'Taille',icon:'⚜'},{id:'arms',label:'Bras',icon:'💪'},
    {id:'hands',label:'Mains',icon:'🧤'},{id:'feet',label:'Pieds',icon:'👢'},
    {id:'ring1',label:'Anneau G.',icon:'💍'},{id:'ring2',label:'Anneau D.',icon:'💍'},
    {id:'armor',label:'Armure',icon:'🛡'},{id:'shield',label:'Bouclier',icon:'🛡'},
    {id:'main_hand',label:'Arme princ.',icon:'⚔'},{id:'off_hand',label:'Main sec.',icon:'🗡'},
    {id:'range',label:'Distance',icon:'🏹'},{id:'slotless',label:'Sans slot',icon:'✦'},
  ];
  const eq=AppState.equipment||{};
  const equippedIds=getEquippedInstanceIds();
  const equippedItems=getEquippedItems();
  const allEffects=[];
  equippedItems.forEach(inst=>{
    const db=inst.itemDbId?ITEM_DB[inst.itemDbId]:null;
    const effects=inst.customItem?.effects||db?.effects||[];
    const name=inst.customItem?.name?.fr||db?.name||inst.instanceId;
    effects.forEach(e=>allEffects.push({...e,_source:name}));
    if (!effects.length){
      const ad=db?.aData;
      if (ad?.armorBonus){
        const tgt=inst.itemDbId&&ITEM_DB[inst.itemDbId]?.cat==='shield'?'defense.shield':'defense.armor';
        allEffects.push({target:tgt,bonusType:tgt.includes('shield')?'shield':'armor',value:ad.armorBonus,_source:name});
      }
    }
  });
  function slotCard(s){
    if (s.id==='slotless'){
      const slotItems=(eq.slotless||[]).map(id=>AppState.inventory.find(i=>i.instanceId===id)).filter(Boolean);
      return `<div class="equip-slot" style="${slotItems.length?'':'border-style:dashed;opacity:0.7;'}">
        <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;">${s.icon} ${s.label.toUpperCase()}</div>
        ${slotItems.map(i=>{const db=i.itemDbId?ITEM_DB[i.itemDbId]:null;const nm=i.customItem?.name?.fr||db?.name||i.instanceId;
          return `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
            <span style="font-size:11px;color:var(--gold-light);">${nm}</span>
            <button class="btn btn-danger btn-small" style="font-size:9px;padding:1px 4px;" onclick="_equipRemove('slotless','${i.instanceId}')">✕</button>
          </div>`;}).join('')}
        <select style="width:100%;font-size:10px;margin-top:4px;" onchange="if(this.value){_equipSet('slotless',this.value);this.value='';}">
          <option value="">+ Ajouter…</option>
          ${AppState.inventory.filter(i=>!isEquipped(i.instanceId)).map(i=>{const db=i.itemDbId?ITEM_DB[i.itemDbId]:null;const nm=i.customItem?.name?.fr||db?.name||i.instanceId;return `<option value="${i.instanceId}">${nm}</option>`;}).join('')}
        </select>
      </div>`;
    }
    const instId=eq[s.id]||null;
    const inst=instId?AppState.inventory.find(i=>i.instanceId===instId):null;
    const db=inst?.itemDbId?ITEM_DB[inst.itemDbId]:null;
    const name=inst?inst.customItem?.name?.fr||db?.name||inst.instanceId:null;
    const candidates=AppState.inventory.filter(i=>!isEquipped(i.instanceId)||(i.itemDbId&&ITEM_DB[i.itemDbId]?.slot===s.id)||(i.customItem?.slot===s.id));
    if (inst) return `<div class="equip-slot filled">
      <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;">${s.icon} ${s.label.toUpperCase()}</div>
      <div style="font-size:12px;color:var(--gold-light);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</div>
      <div style="display:flex;gap:4px;margin-top:5px;">
        <button class="btn btn-danger btn-small" style="flex:1;font-size:10px;" onclick="_equipRemove('${s.id}','${instId}')">↩ Retirer</button>
        <button onclick="toggleItemActive('${instId}')"
          style="padding:2px 8px;font-size:10px;border-radius:4px;cursor:pointer;
                 background:${isItemActive(instId)?'rgba(74,154,80,0.2)':'rgba(80,80,80,0.15)'};
                 border:1px solid ${isItemActive(instId)?'var(--green)':'var(--border)'};
                 color:${isItemActive(instId)?'var(--green)':'var(--text-dim)'};"
          title="${isItemActive(instId)?'Effets actifs — cliquer pour désactiver':'Effets inactifs — cliquer pour activer'}">
          ${isItemActive(instId)?'⚡ Actif':'○ Inactif'}
        </button>
      </div>
    </div>`;
    return `<div class="equip-slot" style="border-style:dashed;opacity:0.75;">
      <div style="font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;">${s.icon} ${s.label.toUpperCase()}</div>
      <select style="width:100%;font-size:11px;margin-top:4px;" onchange="_equipSet('${s.id}',this.value)">
        <option value="">— équiper —</option>
        ${AppState.inventory.filter(i=>!isEquipped(i.instanceId)).map(i=>{const dbi=i.itemDbId?ITEM_DB[i.itemDbId]:null;const nm=i.customItem?.name?.fr||dbi?.name||i.instanceId;return `<option value="${i.instanceId}">${nm}</option>`;}).join('')}
      </select>
    </div>`;
  }
  const col1=SLOTS.slice(0,10).map(slotCard).join('');
  const col2=SLOTS.slice(10).map(slotCard).join('');
  const bonusRows=allEffects.length?allEffects.map(e=>`<tr style="border-bottom:1px solid var(--border);">
    <td style="padding:4px 8px;font-size:11px;color:var(--text-bright);">${e._source}</td>
    <td style="padding:4px 8px;font-size:11px;color:var(--text-dim);">${e.target||'—'}</td>
    <td style="padding:4px 8px;font-size:11px;color:var(--gold-dim);">${e.bonusType||'—'}</td>
    <td style="padding:4px 8px;font-size:12px;font-weight:700;color:${e.value>0?'var(--green)':'var(--red)'};text-align:right;">${e.value>0?'+':''}${e.value}</td>
  </tr>`).join(''):`<tr><td colspan="4" style="padding:16px;text-align:center;color:var(--text-dim);font-style:italic;">Aucun bonus actif.</td></tr>`;
  el.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr 280px;gap:12px;">
    <div><div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;margin-bottom:7px;">CORPS &amp; VÊTEMENTS</div><div style="display:flex;flex-direction:column;gap:5px;">${col1}</div></div>
    <div><div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;margin-bottom:7px;">ARMES &amp; ACCESSOIRES</div><div style="display:flex;flex-direction:column;gap:5px;">${col2}</div></div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div class="panel"><div class="panel-header"><span class="panel-title cinzel" style="font-size:10px;letter-spacing:1px;">✨ BONUS ACTIFS (${allEffects.length})</span></div>
        <div style="overflow-y:auto;max-height:300px;"><table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead style="position:sticky;top:0;background:var(--bg2);"><tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:4px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">SOURCE</th>
            <th style="text-align:left;padding:4px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">CIBLE</th>
            <th style="text-align:left;padding:4px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">TYPE</th>
            <th style="text-align:right;padding:4px 8px;font-size:9px;color:var(--text-dim);font-family:Cinzel,serif;letter-spacing:1px;">VAL.</th>
          </tr></thead><tbody>${bonusRows}</tbody></table></div></div>
    </div>
  </div>`;
}

function _equipSet(slot, instanceId) {
  if (!instanceId) return;
  const eq = AppState.equipment;
  if (slot === 'slotless') { if (!eq.slotless.includes(instanceId)) eq.slotless.push(instanceId); }
  else eq[slot] = instanceId;
  // Activer automatiquement à l'équipement (comportement par défaut V1)
  if (!AppState.activeItems) AppState.activeItems = [];
  if (!AppState.activeItems.includes(instanceId)) AppState.activeItems.push(instanceId);
  autosave(); renderInvEquipment();
  if (typeof renderSheet === 'function') renderSheet();
}
function _equipRemove(slot, instanceId) {
  const eq = AppState.equipment;
  if (slot === 'slotless') eq.slotless = (eq.slotless || []).filter(id => id !== instanceId);
  else if (eq[slot] === instanceId) eq[slot] = null;
  // Désactiver automatiquement au déséquipement
  AppState.activeItems = (AppState.activeItems || []).filter(id => id !== instanceId);
  autosave(); renderInvEquipment();
  if (typeof renderSheet === 'function') renderSheet();
}

// ── Activer / désactiver les effets d'un item équipé ─────────
function toggleItemActive(instanceId) {
  if (!AppState.activeItems) AppState.activeItems = [];
  const idx = AppState.activeItems.indexOf(instanceId);
  if (idx >= 0) AppState.activeItems.splice(idx, 1);
  else AppState.activeItems.push(instanceId);
  autosave();
  renderInvEquipment();
  if (typeof renderSheet === 'function') renderSheet();
}

// ─── FORGE ─────────────────────────────── stub
function renderInvForge() {
  const el=document.getElementById('inv-page-forge');
  if (!el) return;
  const upgradeable=AppState.inventory.filter(i=>{
    const db=i.itemDbId?ITEM_DB[i.itemDbId]:null;
    const cat=i.customItem?.category||db?.cat||'';
    return ['weapon','armor','shield'].includes(cat);
  });
  const listHtml=upgradeable.length
    ?upgradeable.map(i=>{const db=i.itemDbId?ITEM_DB[i.itemDbId]:null;const nm=i.customItem?.name?.fr||db?.name||i.instanceId;const catFr=ITEM_CATEGORIES_FR[i.customItem?.category||db?.cat||'']||'';const hist=(i.forgeHistory||[]).length;return `<div class="shop-row${_forgeSelId===i.instanceId?' selected':''}" onclick="_forgeSelId='${i.instanceId}';_forgeUpgSel=null;renderInvForge();">
      <div style="flex:1;min-width:0;"><div style="font-size:12px;color:${_forgeSelId===i.instanceId?'var(--gold-light)':'var(--text-bright)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${nm}</div>
      <div style="font-size:10px;color:var(--text-dim);">${catFr}${hist?` · ${hist} upgrade${hist>1?'s':''}`:''}</div></div>
      <div style="font-size:11px;color:var(--gold);text-align:right;">${(i.paid||0).toLocaleString()} po</div>
    </div>`;}).join('')
    :'<div style="padding:24px;text-align:center;color:var(--text-dim);font-style:italic;">Aucune arme / armure dans l\'inventaire.</div>';
  el.innerHTML=`<div style="display:grid;grid-template-columns:260px 1fr;gap:14px;height:calc(100vh - 200px);">
    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
      <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:2px;">OBJETS AMÉLIORABLES (${upgradeable.length})</div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;overflow-y:auto;flex:1;min-height:0;">${listHtml}</div>
    </div>
    <div id="forge-detail" style="overflow-y:auto;min-height:0;">
      ${_forgeSelId?'':'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-dim);text-align:center;"><div style="font-size:36px;margin-bottom:10px;">⚗</div><div class=\'cinzel\' style=\'color:var(--gold-dim);letter-spacing:2px;\'>SÉLECTIONNEZ UN OBJET</div></div>'}
    </div>
  </div>`;
  if (_forgeSelId) _renderForgeDetail(_forgeSelId);
}

function _renderForgeDetail(instanceId) {
  const panel=document.getElementById('forge-detail');
  if (!panel) return;
  const inst=AppState.inventory.find(i=>i.instanceId===instanceId);
  if (!inst) return;
  const db=inst.itemDbId?ITEM_DB[inst.itemDbId]:null;
  const name=inst.customItem?.name?.fr||db?.name||inst.instanceId;
  const cat=inst.customItem?.category||db?.cat||'';
  const isWeapon=cat==='weapon';
  const enhList=isWeapon?FORGE_UPGRADES.weapon_enhancement:FORGE_UPGRADES.armor_enhancement;
  const propList=isWeapon?FORGE_UPGRADES.weapon_properties:FORGE_UPGRADES.armor_properties;
  // curEnh: derive from forge project history (simulation) — NOT from instanceEffects
  const curEnh=(inst.forgeHistory||[]).reduce((s,h)=>{
    const id=h.upgradeId||'';
    const e=[...FORGE_UPGRADES.weapon_enhancement,...FORGE_UPGRADES.armor_enhancement].find(x=>x.id===id);
    return e?Math.max(s,e.bonus):s;
  },0);
  const gpAvail=_walletGpTotal();
  const catFr=ITEM_CATEGORIES_FR[cat]||cat;
  const sel=_forgeUpgSel?(enhList.find(e=>e.id===_forgeUpgSel)||propList.find(p=>p.id===_forgeUpgSel)):null;
  let applyCost=0,costNote='',canApply=false,blockReason='';
  if (sel){
    if (sel.bonus!==undefined){
      const oldCost=curEnh>0?(enhList.find(e=>e.bonus===curEnh)?.baseCost||0):0;
      applyCost=sel.baseCost-oldCost;
      costNote=`Coût cible : ${sel.baseCost.toLocaleString()} po − coût actuel : ${oldCost.toLocaleString()} po = ${applyCost.toLocaleString()} po`;
      canApply=sel.bonus>curEnh;
      if (!canApply) blockReason='L\'objet est déjà à ce niveau ou supérieur.';
    } else {
      applyCost=sel.cost;costNote=`${sel.label} : ${sel.cost.toLocaleString()} po`;
      canApply=curEnh>0&&!(inst.forgeHistory||[]).some(h=>h.upgradeId===sel.id);
      if (curEnh===0) blockReason='Nécessite au moins +1 d\'amélioration d\'abord.';
      else if (!canApply) blockReason='Propriété déjà appliquée.';
    }
  }
  const canAfford=applyCost<=gpAvail;
  const hist=(inst.forgeHistory||[]);  // forge history = projets simulés uniquement
  panel.innerHTML=`<div style="background:rgba(100,120,220,0.08);border:1px solid rgba(100,120,220,0.25);border-radius:5px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:var(--text-dim);">
    <strong style="color:#8899ee;">⚗ Mode simulation</strong> — La Forge calcule et planifie. Elle n'applique aucun effet mécanique et ne débite pas la bourse.
    Pour utiliser l'objet amélioré, éditez-le manuellement dans l'<button onclick="showInvPage('inventory')" style="background:none;border:none;color:var(--gold);cursor:pointer;font-size:12px;text-decoration:underline;">Inventaire</button>.
  </div>
  <div class="panel">
    <div class="panel-header"><span class="panel-title cinzel">⚗ ${name}</span><span class="small text-dim">${catFr} · ${curEnh?'+'+curEnh:' non magique'}</span></div>
    <div class="panel-body" style="padding:14px;">
      ${hist.length?`<div style="margin-bottom:12px;">${hist.map(h=>`<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);padding:2px 0;border-bottom:1px solid var(--border);"><span>${h.desc}</span><span>${h.cost>0?h.cost.toLocaleString()+' po':'gratuit'} · ${h.date||''}</span></div>`).join('')}</div>`:''}
      <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:7px;">BONUS +1 À +5</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;">
        ${enhList.map(e=>`<div class="forge-option${_forgeUpgSel===e.id?' selected':''}" onclick="_forgeUpgSel='${e.id}';_renderForgeDetail('${instanceId}');" style="${e.bonus<=curEnh?'opacity:0.4;cursor:not-allowed;':'cursor:pointer;'}">
          <div style="font-size:15px;font-weight:700;color:var(--gold);">${e.label}</div>
          <div style="font-size:10px;color:var(--text-dim);">${e.baseCost.toLocaleString()} po</div>
          ${e.bonus===curEnh?'<div style="font-size:9px;color:var(--green);">✔ Actuel</div>':''}
        </div>`).join('')}
      </div>
      <div class="cinzel" style="font-size:9px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:7px;">PROPRIÉTÉS${curEnh===0?' <span style="color:var(--red);">(nécessite +1)</span>':''}</div>
      <div style="display:grid;gap:4px;margin-bottom:14px;">
        ${propList.map(p=>{const has=(inst.forgeHistory||[]).some(h=>h.upgradeId===p.id);const dis=curEnh===0||has;return `<div class="forge-option${_forgeUpgSel===p.id?' selected':''}" onclick="${dis?'':` _forgeUpgSel='${p.id}';_renderForgeDetail('${instanceId}');`}" style="${dis?'opacity:0.5;cursor:not-allowed;':'cursor:pointer;'}">
          <div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;color:var(--text-bright);">${p.label}${has?' <span style="font-size:9px;color:var(--green);">✔</span>':''}</div><div style="font-size:11px;color:var(--text-dim);">${p.desc}</div></div>
          <div style="font-size:11px;color:var(--gold);white-space:nowrap;">${p.cost.toLocaleString()} po</div>
        </div>`;}).join('')}
      </div>
      ${sel?`<div style="background:rgba(201,147,58,0.08);border:1px solid rgba(201,147,58,0.3);border-radius:5px;padding:10px;margin-bottom:10px;">
        <div style="font-size:12px;color:var(--text-dim);">${costNote}</div>
        ${!canAfford?`<div style="font-size:11px;color:var(--red);margin-top:4px;">✗ Fonds insuffisants</div>`:''}
        ${blockReason?`<div style="font-size:11px;color:var(--red);margin-top:4px;">⚠ ${blockReason}</div>`:''}
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" style="flex:1;${!canApply?'opacity:0.5;cursor:not-allowed;':''}"
          ${canApply?`onclick="_applyForge('${instanceId}','${sel.id}',${applyCost})"`:''}>
          ⚗ Enregistrer le projet
        </button>
        <button class="btn btn-secondary" onclick="_forgeUpgSel=null;_renderForgeDetail('${instanceId}')">Annuler</button>
      </div>`:`<div style="color:var(--text-dim);font-size:12px;font-style:italic;text-align:center;padding:14px;background:var(--bg3);border-radius:5px;">Sélectionnez un bonus ou une propriété.</div>`}
    </div>
  </div>`;
}

function _applyForge(instanceId, upgradeId, cost) {
  // FORGE = SIMULATEUR UNIQUEMENT
  // Cette fonction enregistre un projet dans l'historique de forge de l'instance
  // Elle ne modifie PAS instanceEffects, ne débite PAS la bourse automatiquement.
  //
  // Si le joueur veut appliquer réellement l'amélioration :
  //   → éditer l'objet dans l'Inventaire (bouton ✏)
  //   → ajouter les vrais effets via instanceEffects dans l'Inventaire
  //   → gérer la dépense manuellement dans la Bourse

  const inst = AppState.inventory.find(i => i.instanceId === instanceId);
  if (!inst) return;
  const db     = inst.itemDbId ? ITEM_DB[inst.itemDbId] : null;
  const isWeap = (inst.customItem?.category || db?.cat || '') === 'weapon';
  const enh  = [...FORGE_UPGRADES.weapon_enhancement, ...FORGE_UPGRADES.armor_enhancement].find(e => e.id === upgradeId);
  const prop = [...FORGE_UPGRADES.weapon_properties,   ...FORGE_UPGRADES.armor_properties].find(p => p.id === upgradeId);
  const upg  = enh || prop;
  if (!upg) return;

  const name = inst.customItem?.name?.fr || db?.name || inst.instanceId;
  const desc = enh ? `Projet +${upg.bonus} (${upg.baseCost.toLocaleString()} po)` : `Projet "${upg.label}" (${upg.cost.toLocaleString()} po)`;

  if (!confirm(`Enregistrer le projet de forge "${upg.label}" pour ${name} ?\n\nCoût estimé : ${cost.toLocaleString()} po\n\nCette action n'applique aucun effet mécanique et ne débite pas la bourse.\nVous devrez éditer l'objet manuellement dans l'Inventaire.`)) return;

  // Record in forge history only — no runtime effect, no wallet deduction
  if (!inst.forgeHistory) inst.forgeHistory = [];
  inst.forgeHistory.push({
    upgradeId, desc, cost,
    date:   new Date().toLocaleDateString('fr-FR'),
    status: 'projet',   // 'projet' | 'appliqué' (marqué manuellement par le joueur)
  });

  _forgeUpgSel = null;
  autosave();
  showToast(`⚗ Projet "${upg.label}" enregistré — appliquez manuellement dans l'Inventaire.`, 'info');
  renderInvForge();
}

function renderInvTransfer() {
  const el=document.getElementById('inv-page-transfer');
  if (!el) return;
  el.innerHTML=`<div style="padding:20px;color:var(--text-dim);font-size:13px;">Export/Import d'inventaire — à venir.</div>`;
}


// Legacy compat stubs

// ── Stubs compat — modals legacy (add-item-modal / item-shop-modal)
function addItem()              { showInvPage('inventory'); closeModal('add-item-modal'); }
function purchaseSelectedItem() { showInvPage('shop');      closeModal('item-shop-modal'); }
function clearShopSelection()   { closeModal('item-shop-modal'); }
