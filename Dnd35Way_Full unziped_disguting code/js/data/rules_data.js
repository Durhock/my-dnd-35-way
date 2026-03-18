const UI_TARGET_LABELS = {
  self:                                  { label: "Soi-même (You)",         icon: "👤", color: "var(--green)" },
  creature_touched:                      { label: "Créature touchée",        icon: "🤝", color: "var(--gold)" },
  item_weapon:                           { label: "Arme touchée",            icon: "⚔️", color: "var(--red)" },
  item_armor_or_shield:                  { label: "Armure / Bouclier",       icon: "🛡️", color: "#4a7ab5" },
  aoe_allies_centered_on_self:           { label: "Zone alliés (centré)",    icon: "🌟", color: "var(--gold)" },
  aoe_allies_and_enemies_centered_on_self:{ label: "Zone alliés+ennemis",   icon: "💫", color: "#c94080" },
  multi_creatures_touched:               { label: "Plusieurs créatures",     icon: "👥", color: "var(--gold-dim)" }
};

// ============================================================
// SOURCE_REGISTRY — Types de sources de sorts D&D 3.5
// ============================================================
const SOURCE_REGISTRY = {
  // ── OFFICIEL ─────────────────────────────────────────────
  official: {
    type: 'official',
    label: 'Officiel WotC',
    labelShort: 'Official',
    color: 'var(--gold)',
    bg: 'rgba(180,140,60,0.15)',
    border: 'var(--gold-dim)',
    icon: '📖',
    is_official: true,
    sources: {
      PHB:  { name: "Player's Handbook",        abbr: "PHB",  ref: "3.5e Core" },
      DMG:  { name: "Dungeon Master's Guide",    abbr: "DMG",  ref: "3.5e Core" },
      SRD:  { name: "System Reference Document", abbr: "SRD",  ref: "OGL" },
      SC:   { name: "Spell Compendium",          abbr: "SpC",  ref: "WotC supplement" },
      CD:   { name: "Complete Divine",           abbr: "CD",   ref: "WotC supplement" },
      CA:   { name: "Complete Arcane",           abbr: "CArc", ref: "WotC supplement" },
      CC:   { name: "Complete Champion",         abbr: "CC",   ref: "WotC supplement" },
      CM:   { name: "Complete Mage",             abbr: "CM",   ref: "WotC supplement" },
      CAdv: { name: "Complete Adventurer",       abbr: "CAdv", ref: "WotC supplement" },
      LM:   { name: "Libris Mortis",             abbr: "LM",   ref: "WotC supplement" },
      SS:   { name: "Sandstorm",                 abbr: "SS",   ref: "WotC supplement" },
      FB:   { name: "Frostburn",                 abbr: "FB",   ref: "WotC supplement" },
      HoH:  { name: "Heroes of Horror",          abbr: "HoH",  ref: "WotC supplement" },
      BoED: { name: "Book of Exalted Deeds",     abbr: "BoED", ref: "WotC supplement" },
      BoVD: { name: "Book of Vile Darkness",     abbr: "BoVD", ref: "WotC supplement" },
      FRCS: { name: "Forgotten Realms CS",       abbr: "FRCS", ref: "Campaign Setting" },
      ECS:  { name: "Eberron Campaign Setting",  abbr: "ECS",  ref: "Campaign Setting" },
    }
  },
  // ── MAGAZINE ─────────────────────────────────────────────
  magazine: {
    type: 'magazine',
    label: 'Magazine / Semi-officiel',
    labelShort: 'Magazine',
    color: '#a0c060',
    bg: 'rgba(120,180,60,0.12)',
    border: 'rgba(120,180,60,0.4)',
    icon: '📰',
    is_official: false,
    sources: {
      DM:   { name: "Dragon Magazine",  abbr: "DM",  ref: "Dragon Magazine" },
      DUN:  { name: "Dungeon Magazine",  abbr: "Dun", ref: "Dungeon Magazine" },
      WEB:  { name: "Wizards Web Article", abbr: "Web", ref: "WotC Online" },
    }
  },
  // ── COMMUNAUTÉ ───────────────────────────────────────────
  community: {
    type: 'community',
    label: 'Communauté (Gemmaline…)',
    labelShort: 'Community',
    color: '#6a9fd8',
    bg: 'rgba(74,120,180,0.12)',
    border: 'rgba(74,120,180,0.4)',
    icon: '🌐',
    is_official: false,
    sources: {
      GML:  { name: "Gemmaline",         abbr: "GML", ref: "Communauté FR" },
      FAN:  { name: "Contenu fan",        abbr: "Fan", ref: "Community" },
    }
  },
  // ── CUSTOM ───────────────────────────────────────────────
  custom: {
    type: 'custom',
    label: 'Personnalisé',
    labelShort: 'Custom',
    color: '#c080e0',
    bg: 'rgba(180,80,220,0.10)',
    border: 'rgba(180,80,220,0.35)',
    icon: '⚗️',
    is_official: false,
    sources: {
      USR: { name: "Sort personnalisé", abbr: "Custom", ref: "Homebrew" },
    }
  }
};

// Helper: retourne les métadonnées de source depuis un sort

const EQUIPMENT_SLOTS = [
  { id: "head",     label: "Tête" },
  { id: "neck",     label: "Cou" },
  { id: "chest",    label: "Torse" },
  { id: "armor",    label: "Armure" },
  { id: "shield",   label: "Bouclier" },
  { id: "waist",    label: "Taille" },
  { id: "main_hand",label: "Main princ." },
  { id: "off_hand", label: "Main sec." },
  { id: "arms",     label: "Bras" },
  { id: "hands",    label: "Mains" },
  { id: "ring1",    label: "Anneau G" },
  { id: "ring2",    label: "Anneau D" },
  { id: "feet",     label: "Pieds" },
];

