const BUFF_DB = {
  // ── NIVEAU 1 ──────────────────────────────────────────────
  bdb_shield_of_faith: {
    name: "Shield of Faith",
    nameFr: "Bouclier de la Foi",
    clericLevel: 1,
    source: "Player's Handbook p.278",
    sourceShort: "PHB",
    targetOfficial: "Creature touched",
    uiTargetType: "creature_touched",
    isSelfOnly: false,
    durationFormula: "1 minute/level",
    spellId: "spell_shield_of_faith",
    desc: "Bonus de déflection à la CA. +2 + 1 par tranche de 6 niveaux (max +5).",
    effects: (cl) => [
      { target: "defense.deflection", bonusType: "deflection", value: Math.min(5, 2 + Math.floor(cl / 6)) }
    ],
    effectsLabel: (cl) => `+${Math.min(5, 2 + Math.floor(cl / 6))} déflection CA`
  },
  bdb_endure_elements: {
    name: "Endure Elements",
    nameFr: "Endurer les éléments",
    clericLevel: 1,
    source: "Player's Handbook p.226",
    sourceShort: "PHB",
    targetOfficial: "Creature touched",
    uiTargetType: "creature_touched",
    isSelfOnly: false,
    durationFormula: "24 hours",
    spellId: "spell_endure_elements",
    desc: "Protection contre la chaleur et le froid extrêmes (environnementaux).",
    effects: () => [],
    effectsLabel: () => "Immunité chaleur/froid environnemental",
    trackOnly: true
  },
  bdb_conviction: {
    name: "Conviction",
    nameFr: "Conviction",
    clericLevel: 1,
    source: "Spell Compendium p.51",
    sourceShort: "SpC",
    targetOfficial: "Creature touched",
    uiTargetType: "creature_touched",
    isSelfOnly: false,
    durationFormula: "10 minutes/level",
    desc: "+2 morale JS, +1 par tranche de 6 niveaux de lanceur.",
    effects: (cl) => {
      const bonus = 2 + Math.floor(cl / 6);
      return [
        { target: "save.fortitude", bonusType: "morale", value: bonus },
        { target: "save.reflex",    bonusType: "morale", value: bonus },
        { target: "save.will",      bonusType: "morale", value: bonus }
      ];
    },
    effectsLabel: (cl) => `+${2 + Math.floor(cl / 6)} moral tous JS`
  },

  // ── NIVEAU 2 ──────────────────────────────────────────────
  bdb_delay_poison: {
    name: "Delay Poison",
    nameFr: "Retarder le poison",
    clericLevel: 2,
    source: "Player's Handbook p.217",
    sourceShort: "PHB",
    targetOfficial: "Creature touched",
    uiTargetType: "creature_touched",
    isSelfOnly: false,
    durationFormula: "1 hour/level",
    desc: "Les effets de poison sont suspendus jusqu'à la fin du sort.",
    effects: () => [],
    effectsLabel: () => "Poison suspendu",
    trackOnly: true
  },

  // ── NIVEAU 3 ──────────────────────────────────────────────
  bdb_prayer: {
    name: "Prayer",
    nameFr: "Prière",
    clericLevel: 3,
    source: "Player's Handbook p.264",
    sourceShort: "PHB",
    targetOfficial: "Allies and enemies in 40-ft radius burst centered on you",
    uiTargetType: "aoe_allies_and_enemies_centered_on_self",
    isSelfOnly: false,
    durationFormula: "1 round/level",
    spellId: "spell_prayer",
    desc: "+1 chance aux jets d'attaque, dégâts, JS, compétences pour les alliés. Pénalité inverse pour les ennemis.",
    effects: () => [
      { target: "combat.attack",  bonusType: "luck", value: 1 },
      { target: "combat.damage",  bonusType: "luck", value: 1 },
      { target: "save.fortitude", bonusType: "luck", value: 1 },
      { target: "save.reflex",    bonusType: "luck", value: 1 },
      { target: "save.will",      bonusType: "luck", value: 1 },
    ],
    effectsLabel: () => "+1 chance ATK / DMG / JS"
  },
  bdb_magic_vestment: {
    name: "Magic Vestment",
    nameFr: "Vêtement magique",
    clericLevel: 3,
    source: "Player's Handbook p.251",
    sourceShort: "PHB",
    targetOfficial: "Armor or shield touched",
    uiTargetType: "item_armor_or_shield",
    isSelfOnly: false,
    durationFormula: "1 hour/level",
    spellId: "spell_magic_vestment",
    desc: "Bonus d'altération sur armure ou bouclier touché. +1 par tranche de 4 niveaux (max +5).",
    effects: (cl) => [
      { target: "defense.armor", bonusType: "enhancement", value: Math.min(5, Math.floor(cl / 4)) }
    ],
    effectsLabel: (cl) => `+${Math.min(5, Math.floor(cl / 4))} altération armure`,
    trackOnly: true  // s'applique à l'objet, pas aux stats perso directement
  },
  bdb_greater_magic_weapon: {
    name: "Greater Magic Weapon",
    nameFr: "Arme magique suprême",
    clericLevel: 3,
    source: "Player's Handbook p.251",
    sourceShort: "PHB",
    targetOfficial: "Weapon touched",
    uiTargetType: "item_weapon",
    isSelfOnly: false,
    durationFormula: "1 hour/level",
    desc: "Bonus d'altération sur arme touchée. +1 par tranche de 4 niveaux (max +5).",
    effects: (cl) => [],
    effectsLabel: (cl) => `+${Math.min(5, Math.floor(cl / 4))} altération arme`,
    trackOnly: true
  },
  bdb_water_breathing: {
    name: "Water Breathing",
    nameFr: "Respiration aquatique",
    clericLevel: 3,
    source: "Player's Handbook p.300",
    sourceShort: "PHB",
    targetOfficial: "Living creatures touched",
    uiTargetType: "multi_creatures_touched",
    isSelfOnly: false,
    durationFormula: "2 hours/level",
    desc: "Les cibles peuvent respirer sous l'eau.",
    effects: () => [],
    effectsLabel: () => "Respiration sous-marine",
    trackOnly: true
  },

  // ── NIVEAU 4 ──────────────────────────────────────────────
  bdb_divine_power: {
    name: "Divine Power",
    nameFr: "Pouvoir divin",
    clericLevel: 4,
    source: "Player's Handbook p.224",
    sourceShort: "PHB",
    targetOfficial: "You",
    uiTargetType: "self",
    isSelfOnly: true,
    durationFormula: "1 round/level",
    spellId: "spell_divine_power",
    desc: "BBA = niveau du personnage, +6 altération Force, 1 PV temp/niveau, attaque supplémentaire.",
    effects: (cl) => [
      { target: "ability.STR",              bonusType: "enhancement",  value: 6 },
      { target: "combat.baseAttackOverride", bonusType: "special",      value: cl },
      { target: "hp.temp",                  bonusType: "special",       value: cl }
    ],
    effectsLabel: (cl) => `BBA=${cl}, +6 altér. FOR, ${cl} PV temp`
  },

  // ── NIVEAU 5 ──────────────────────────────────────────────
  bdb_righteous_might: {
    name: "Righteous Might",
    nameFr: "Juste Puissance",
    clericLevel: 5,
    source: "Player's Handbook p.273",
    sourceShort: "PHB",
    targetOfficial: "You",
    uiTargetType: "self",
    isSelfOnly: true,
    durationFormula: "1 round/level",
    spellId: "spell_righteous_might",
    desc: "+4 taille FOR, +2 taille CON, +2 altération armure naturelle, catégorie de taille +1, RD selon alignement.",
    effects: () => [
      { target: "ability.STR",        bonusType: "size",        value: 4 },
      { target: "ability.CON",        bonusType: "size",        value: 2 },
      { target: "ability.DEX",        bonusType: "size",        value: -2 },
      { target: "defense.naturalArmor", bonusType: "natural_armor", value: 2 }
    ],
    effectsLabel: () => "+4 taille FOR, +2 taille CON, -2 DEX, +2 armure nat."
  },
  bdb_spell_resistance: {
    name: "Spell Resistance",
    nameFr: "Résistance à la magie",
    clericLevel: 5,
    source: "Player's Handbook p.281",
    sourceShort: "PHB",
    targetOfficial: "Creature touched",
    uiTargetType: "creature_touched",
    isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "RM = 12 + niveau de lanceur.",
    effects: (cl) => [
      { target: "defense.spellResistance", bonusType: "special", value: 12 + cl }
    ],
    effectsLabel: (cl) => `RM = ${12 + cl}`
  },
  bdb_surge_of_fortune: {
    name: "Surge of Fortune",
    nameFr: "Surge de fortune",
    clericLevel: 5,
    source: "Complete Champion p.128",
    sourceShort: "CC",
    targetOfficial: "You",
    uiTargetType: "self",
    isSelfOnly: true,
    durationFormula: "1 round/level",
    desc: "+2 chance ATK, DMG, JS, compétences, carac. Peut être dissipé pour traiter un jet comme un 20 naturel.",
    effects: () => [
      { target: "combat.attack",  bonusType: "luck", value: 2 },
      { target: "combat.damage",  bonusType: "luck", value: 2 },
      { target: "save.fortitude", bonusType: "luck", value: 2 },
      { target: "save.reflex",    bonusType: "luck", value: 2 },
      { target: "save.will",      bonusType: "luck", value: 2 },
    ],
    effectsLabel: () => "+2 chance ATK / DMG / JS / compétences"
  },
  bdb_righteous_wrath: {
    name: "Righteous Wrath of the Faithful",
    nameFr: "Juste Colère du Fidèle",
    clericLevel: 5,
    source: "Spell Compendium p.176",
    sourceShort: "SpC",
    targetOfficial: "Allies in burst centered on you",
    uiTargetType: "aoe_allies_centered_on_self",
    isSelfOnly: false,
    durationFormula: "1 round/level",
    desc: "+3 moral aux jets d'attaque et de dégâts, attaque supplémentaire pour tous les alliés dans la zone.",
    effects: () => [
      { target: "combat.attack", bonusType: "morale", value: 3 },
      { target: "combat.damage", bonusType: "morale", value: 3 }
    ],
    effectsLabel: () => "+3 moral ATK / DMG + attaque supp."
  },
  bdb_holy_transformation_lesser: {
    name: "Holy Transformation, Lesser",
    nameFr: "Sainte Transformation, mineure",
    clericLevel: 5,
    source: "Spell Compendium p.117",
    sourceShort: "SpC",
    targetOfficial: "You",
    uiTargetType: "self",
    isSelfOnly: true,
    durationFormula: "1 round/level",
    desc: "+4 altération FOR et CON, +2 sacré ATK et JS, +2 altération armure nat., vision dans le noir 18m, résistance 10 acide/froid/élec.",
    effects: () => [
      { target: "ability.STR",        bonusType: "enhancement",  value: 4 },
      { target: "ability.CON",        bonusType: "enhancement",  value: 4 },
      { target: "combat.attack",      bonusType: "sacred",       value: 2 },
      { target: "save.fortitude",     bonusType: "sacred",       value: 2 },
      { target: "save.reflex",        bonusType: "sacred",       value: 2 },
      { target: "save.will",          bonusType: "sacred",       value: 2 },
      { target: "defense.naturalArmor", bonusType: "enhancement", value: 2 }
    ],
    effectsLabel: () => "+4 altér. FOR/CON, +2 sacré ATK/JS, +2 armure nat."
  },

  // ── NIVEAU 6 ──────────────────────────────────────────────
  bdb_superior_resistance: {
    name: "Superior Resistance",
    nameFr: "Résistance supérieure",
    clericLevel: 6,
    source: "Spell Compendium p.174",
    sourceShort: "SpC",
    targetOfficial: "Creature touched",
    uiTargetType: "creature_touched",
    isSelfOnly: false,
    durationFormula: "24 hours",
    desc: "+6 résistance à tous les jets de sauvegarde.",
    effects: () => [
      { target: "save.fortitude", bonusType: "resistance", value: 6 },
      { target: "save.reflex",    bonusType: "resistance", value: 6 },
      { target: "save.will",      bonusType: "resistance", value: 6 }
    ],
    effectsLabel: () => "+6 résistance tous JS"
  ,

  // ════════════════════════════════════════════════════════════
  // BUFFS v18 — Sorts multi-classes (Clerc, Magicien, Druide, Barde)
  // Structure : effects(cl) => liste d'effets lus par collectBonuses()
  // ════════════════════════════════════════════════════════════

  // ── Clerc ────────────────────────────────────────────────────
  bdb_bless: {
    name: "Bless", nameFr: "Bénédiction",
    clericLevel: 1, source: "Player's Handbook p.206", sourceShort: "PHB",
    targetOfficial: "Allies in 50 ft", uiTargetType: "aoe_allies", isSelfOnly: false,
    durationFormula: "1 minute/level", spellId: "spell_bless",
    desc: "+1 moral aux jets d'attaque et aux JD contre la peur pour vous et vos alliés.",
    description: { fr: "+1 moral aux jets d'attaque et aux jets de sauvegarde contre la peur.", en: "+1 morale bonus on attack rolls and saves against fear." },
    effects: (cl) => [
      { target: "combat.attack",   bonusType: "morale", value: 1 },
      { target: "save.all",        bonusType: "morale", value: 1 }
    ],
    effectsLabel: (cl) => "+1 moral ATK, +1 moral JS"
  },

  bdb_aid: {
    name: "Aid", nameFr: "Aide",
    clericLevel: 2, source: "Player's Handbook p.196", sourceShort: "PHB",
    targetOfficial: "Living creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level", spellId: null,
    desc: "+1 moral aux jets d'attaque et aux JD, +1d8 + 1/niveau PV temporaires.",
    description: { fr: "+1 moral ATK et JS, +1d8+niveau PV temporaires.", en: "+1 morale bonus on attack rolls and saves, +1d8+level temporary hp." },
    effects: (cl) => [
      { target: "combat.attack", bonusType: "morale",  value: 1 },
      { target: "save.all",      bonusType: "morale",  value: 1 },
      { target: "hp.temp",       bonusType: "untyped",  value: Math.min(1 + cl, 1 + cl) }
    ],
    effectsLabel: (cl) => `+1 moral ATK/JS, +${1 + cl} PV temp`
  },

  bdb_death_ward: {
    name: "Death Ward", nameFr: "Protection contre la mort",
    clericLevel: 4, source: "Player's Handbook p.217", sourceShort: "PHB",
    targetOfficial: "Living creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level", spellId: null,
    desc: "Immunité aux effets de mort instantanée et aux niveaux négatifs.",
    description: { fr: "Immunité aux effets de mort instantanée et aux niveaux négatifs.", en: "Immunity to death spells and effects, negative energy drain." },
    effects: (cl) => [],
    effectsLabel: (cl) => "Immunité mort instantanée + niveaux nég."
  },

  bdb_divine_favor_buff: {
    name: "Divine Favor", nameFr: "Faveur divine",
    clericLevel: 1, source: "Player's Handbook p.224", sourceShort: "PHB",
    targetOfficial: "You", uiTargetType: "self", isSelfOnly: true,
    durationFormula: "1 minute",
    desc: "+1 sanctifié par tranche de 3 niveaux (max +3) aux jets d'attaque et de dégâts.",
    description: { fr: "+1 sacré par tranche de 3 niveaux (max +3) aux jets d'attaque et dégâts.", en: "+1 luck bonus per 3 levels (max +3) on attack and damage rolls." },
    effects: (cl) => [
      { target: "combat.attack", bonusType: "luck", value: Math.min(3, Math.floor(cl / 3) + 1) },
      { target: "combat.damage", bonusType: "luck", value: Math.min(3, Math.floor(cl / 3) + 1) }
    ],
    effectsLabel: (cl) => `+${Math.min(3, Math.floor(cl/3)+1)} chance ATK/DMG`
  },

  bdb_bears_endurance: {
    name: "Bear's Endurance", nameFr: "Vigueur de l'ours",
    clericLevel: 2, source: "Player's Handbook p.203", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "+4 amélioration à la Constitution.",
    description: { fr: "+4 bonus d'amélioration à la Constitution.", en: "+4 enhancement bonus to Constitution." },
    effects: (cl) => [{ target: "ability.CON", bonusType: "enhancement", value: 4 }],
    effectsLabel: (cl) => "+4 CON"
  },

  bdb_bulls_strength: {
    name: "Bull's Strength", nameFr: "Force du taureau",
    clericLevel: 2, source: "Player's Handbook p.207", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "+4 amélioration à la Force.",
    description: { fr: "+4 bonus d'amélioration à la Force.", en: "+4 enhancement bonus to Strength." },
    effects: (cl) => [{ target: "ability.STR", bonusType: "enhancement", value: 4 }],
    effectsLabel: (cl) => "+4 STR"
  },

  bdb_owls_wisdom: {
    name: "Owl's Wisdom", nameFr: "Sagesse du hibou",
    clericLevel: 2, source: "Player's Handbook p.259", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "+4 amélioration à la Sagesse.",
    description: { fr: "+4 bonus d'amélioration à la Sagesse.", en: "+4 enhancement bonus to Wisdom." },
    effects: (cl) => [{ target: "ability.WIS", bonusType: "enhancement", value: 4 }],
    effectsLabel: (cl) => "+4 WIS"
  },

  bdb_cats_grace: {
    name: "Cat's Grace", nameFr: "Grâce du chat",
    clericLevel: 2, source: "Player's Handbook p.208", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "+4 amélioration à la Dextérité.",
    description: { fr: "+4 bonus d'amélioration à la Dextérité.", en: "+4 enhancement bonus to Dexterity." },
    effects: (cl) => [{ target: "ability.DEX", bonusType: "enhancement", value: 4 }],
    effectsLabel: (cl) => "+4 DEX"
  },

  bdb_eagles_splendor: {
    name: "Eagle's Splendor", nameFr: "Splendeur de l'aigle",
    clericLevel: 2, source: "Player's Handbook p.225", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "+4 amélioration au Charisme.",
    description: { fr: "+4 bonus d'amélioration au Charisme.", en: "+4 enhancement bonus to Charisma." },
    effects: (cl) => [{ target: "ability.CHA", bonusType: "enhancement", value: 4 }],
    effectsLabel: (cl) => "+4 CHA"
  },

  bdb_fox_cunning: {
    name: "Fox's Cunning", nameFr: "Ruse du renard",
    clericLevel: 2, source: "Player's Handbook p.233", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "+4 amélioration à l'Intelligence.",
    description: { fr: "+4 bonus d'amélioration à l'Intelligence.", en: "+4 enhancement bonus to Intelligence." },
    effects: (cl) => [{ target: "ability.INT", bonusType: "enhancement", value: 4 }],
    effectsLabel: (cl) => "+4 INT"
  },

  bdb_freedom_of_movement: {
    name: "Freedom of Movement", nameFr: "Liberté de mouvement",
    clericLevel: 4, source: "Player's Handbook p.233", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "10 minutes/level",
    desc: "Ignorez les effets magiques de contrainte de mouvement (enchevêtrement, paralysie, etc.).",
    description: { fr: "Ignorez les contraintes magiques de déplacement (enchevêtrement, paralysie, télékinésie).", en: "Move and act normally despite magical constraints (entangle, paralyze, telekinesis)." },
    effects: (cl) => [],
    effectsLabel: (cl) => "Immunité contraintes mouvement"
  },

  bdb_protection_from_evil: {
    name: "Protection from Evil", nameFr: "Protection contre le mal",
    clericLevel: 1, source: "Player's Handbook p.266", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level",
    desc: "+2 déviation CA, +2 résistance JS contre les attaques/sorts du Mal.",
    description: { fr: "+2 déflexion CA et +2 résistance aux JS contre les créatures Mauvaises.", en: "+2 deflection to AC and +2 resistance to saves against evil creatures." },
    effects: (cl) => [
      { target: "defense.deflection", bonusType: "deflection", value: 2 },
      { target: "save.all",           bonusType: "resistance", value: 2 }
    ],
    effectsLabel: (cl) => "+2 déflexion CA, +2 résistance JS"
  },

  bdb_spell_immunity: {
    name: "Spell Immunity", nameFr: "Immunité aux sorts",
    clericLevel: 4, source: "Player's Handbook p.282", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "10 minutes/level",
    desc: "Immunité à un sort de niveau 4 ou moins par tranche de 4 niveaux (max 4 sorts).",
    description: { fr: "Immunité à 1 sort (niv.≤4) par tranche de 4 niveaux de lanceur (max 4).", en: "Immunity to one spell of 4th level or lower per 4 caster levels (max 4 spells)." },
    effects: (cl) => [],
    effectsLabel: (cl) => `Immunité ${Math.min(4, Math.floor(cl/4))} sort(s)`
  },

  // ── Magicien / Ensorceleur ────────────────────────────────────
  bdb_mage_armor_buff: {
    name: "Mage Armor", nameFr: "Armure de mage",
    clericLevel: 1, source: "Player's Handbook p.249", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 hour/level", spellId: "spell_mage_armor",
    desc: "+4 CA armure (bonus d'armure). Pas de malus aux tests.",
    description: { fr: "+4 bonus d'armure à la CA. Aucun malus aux tests de compétence.", en: "+4 armor bonus to AC. No armor check penalty." },
    effects: (cl) => [{ target: "defense.armor", bonusType: "armor", value: 4 }],
    effectsLabel: (cl) => "+4 armure CA"
  },

  bdb_shield_buff: {
    name: "Shield", nameFr: "Bouclier",
    clericLevel: 1, source: "Player's Handbook p.278", sourceShort: "PHB",
    targetOfficial: "You", uiTargetType: "self", isSelfOnly: true,
    durationFormula: "1 minute/level", spellId: "spell_shield",
    desc: "+4 CA bouclier, immunité aux Projectiles magiques.",
    description: { fr: "+4 bonus de bouclier à la CA. Immunité aux Projectiles magiques.", en: "+4 shield bonus to AC. Immunity to magic missile." },
    effects: (cl) => [{ target: "defense.shield", bonusType: "shield", value: 4 }],
    effectsLabel: (cl) => "+4 bouclier CA"
  },

  bdb_haste_buff: {
    name: "Haste", nameFr: "Hâte",
    clericLevel: 3, source: "Player's Handbook p.239", sourceShort: "PHB",
    targetOfficial: "One creature/level", uiTargetType: "multi_creatures_touched", isSelfOnly: false,
    durationFormula: "1 round/level", spellId: "spell_haste",
    desc: "+1 attaque supplémentaire, +1 CA esquive, +9 m déplacement, +1 jets d'attaque/Réflexes.",
    description: { fr: "+1 attaque supplémentaire, +1 esquive CA, +30 ft mouvement, +1 attaque et Réflexes.", en: "+1 extra attack, +1 dodge AC, +30 ft speed, +1 to attacks and Reflex saves." },
    effects: (cl) => [
      { target: "defense.dodge",  bonusType: "dodge",  value: 1 },
      { target: "combat.attack",  bonusType: "untyped", value: 1 },
      { target: "save.reflex",    bonusType: "untyped", value: 1 }
    ],
    effectsLabel: (cl) => "+1 attaque, +1 esquive CA, +1 Réflexes"
  },

  bdb_heroism_buff: {
    name: "Heroism", nameFr: "Héroïsme",
    clericLevel: 2, source: "Player's Handbook p.240", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "10 minutes/level", spellId: "spell_heroism",
    desc: "+2 moral aux jets d'attaque, jets de sauvegarde et tests de compétence.",
    description: { fr: "+2 bonus moral aux attaques, jets de sauvegarde et compétences.", en: "+2 morale bonus on attack rolls, saving throws, and skill checks." },
    effects: (cl) => [
      { target: "combat.attack", bonusType: "morale", value: 2 },
      { target: "save.all",      bonusType: "morale", value: 2 }
    ],
    effectsLabel: (cl) => "+2 moral ATK/JS/Compétences"
  },

  bdb_blur_buff: {
    name: "Blur", nameFr: "Flou",
    clericLevel: 2, source: "Player's Handbook p.206", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level", spellId: "spell_blur",
    desc: "20% de chances de rater toutes les attaques contre la cible.",
    description: { fr: "Toutes les attaques contre la cible ont 20% de chances de rater.", en: "All attacks against the target have a 20% miss chance." },
    effects: (cl) => [],
    effectsLabel: (cl) => "20% dissimulation"
  },

  bdb_invisibility_buff: {
    name: "Invisibility", nameFr: "Invisibilité",
    clericLevel: 2, source: "Player's Handbook p.245", sourceShort: "PHB",
    targetOfficial: "You or creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 minute/level", spellId: "spell_invisibility",
    desc: "Cible invisible. +2 attaque, -2 CA pour les attaquants. Fin si la cible attaque.",
    description: { fr: "Cible invisible. Fin si attaque. +2 aux attaques de la cible, -2 CA adversaires.", en: "Target invisible until they attack. +2 to target's attacks, attackers at -2 AC." },
    effects: (cl) => [
      { target: "combat.attack", bonusType: "untyped", value: 2 }
    ],
    effectsLabel: (cl) => "Invisible (+2 ATK)"
  },

  bdb_mirror_image_buff: {
    name: "Mirror Image", nameFr: "Image miroir",
    clericLevel: 2, source: "Player's Handbook p.254", sourceShort: "PHB",
    targetOfficial: "You", uiTargetType: "self", isSelfOnly: true,
    durationFormula: "1 minute/level", spellId: "spell_mirror_image",
    desc: "1d4+1 images illusoires absorbent les attaques à votre place.",
    description: { fr: "1d4+1 images illusoires. Chaque attaque a une chance de toucher une image.", en: "1d4+1 illusory duplicates. Each attack may hit an image instead." },
    effects: (cl) => [],
    effectsLabel: (cl) => "1d4+1 images (dissimulation)"
  },

  bdb_stoneskin: {
    name: "Stoneskin", nameFr: "Peau de pierre",
    clericLevel: 4, source: "Player's Handbook p.284", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "10 minutes/level or until discharged", spellId: "spell_stoneskin_wiz",
    desc: "RD 10/adamantite jusqu'à 10 PV/niveau absorbés (max 150).",
    description: { fr: "Réduction de dégâts 10/adamantite, jusqu'à 10 points par niveau absorbés (max 150).", en: "DR 10/adamantine until 10 hp/level absorbed (max 150)." },
    effects: (cl) => [],
    effectsLabel: (cl) => `RD 10/adamantite (${Math.min(150, cl*10)} PV max)`
  },

  bdb_protection_from_arrows_buff: {
    name: "Protection from Arrows", nameFr: "Protection contre les flèches",
    clericLevel: 2, source: "Player's Handbook p.266", sourceShort: "PHB",
    targetOfficial: "Creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "1 hour/level", spellId: "spell_protection_from_arrows",
    desc: "RD 10/magie aux dégâts d'armes à distance jusqu'à 10 PV/niveau (max 100).",
    description: { fr: "RD 10/magie aux dégâts d'armes à distance jusqu'à 10 PV/niveau (max 100).", en: "DR 10/magic against ranged weapons, up to 10 hp/level absorbed (max 100)." },
    effects: (cl) => [],
    effectsLabel: (cl) => `RD 10/magie distance (${Math.min(100, cl*10)} PV max)`
  },

  // ── Druide ───────────────────────────────────────────────────
  bdb_barkskin_buff: {
    name: "Barkskin", nameFr: "Peau d'écorce",
    clericLevel: 2, source: "Player's Handbook p.202", sourceShort: "PHB",
    targetOfficial: "Living creature touched", uiTargetType: "creature_touched", isSelfOnly: false,
    durationFormula: "10 minutes/level", spellId: "spell_barkskin",
    desc: "+2 armure naturelle à la CA (+1 supplémentaire par 3 niveaux au-delà du 3e, max +5).",
    description: { fr: "+2 armure naturelle (+1 tous les 3 niveaux au-delà du 3e, max +5).", en: "+2 natural armor bonus (+1 per 3 levels beyond 3rd, max +5)." },
    effects: (cl) => [
      { target: "defense.naturalArmor", bonusType: "natural_armor",
        value: Math.min(5, 2 + Math.floor(Math.max(0, cl - 3) / 3)) }
    ],
    effectsLabel: (cl) => `+${Math.min(5, 2 + Math.floor(Math.max(0, cl-3)/3))} armure naturelle`
  },

  // ── Barde ────────────────────────────────────────────────────
  bdb_inspire_courage: {
    name: "Inspire Courage", nameFr: "Inspiration héroïque",
    clericLevel: 1, source: "Player's Handbook p.29", sourceShort: "PHB",
    targetOfficial: "Allies within 30 ft", uiTargetType: "aoe_allies", isSelfOnly: false,
    durationFormula: "5 rounds after bardic music ends",
    desc: "+1 moral aux jets d'attaque et aux jets de dégâts pour les alliés.",
    description: { fr: "+1 moral aux attaques et aux dégâts. Évolue avec le niveau.", en: "+1 morale bonus on attacks and damage. Scales with bard level." },
    effects: (cl) => [
      { target: "combat.attack", bonusType: "morale", value: Math.floor(1 + cl / 6) },
      { target: "combat.damage", bonusType: "morale", value: Math.floor(1 + cl / 6) }
    ],
    effectsLabel: (cl) => `+${Math.floor(1 + cl/6)} moral ATK/DMG`
  }
}
};

// Types de cible — labels et icônes