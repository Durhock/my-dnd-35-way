const SKILL_REF = {
  skill_concentration:        { name: "Concentration", nameEn: "Concentration",             keyAbility: "CON", trainedOnly: false },
  skill_heal:                 { name: "Premiers soins",                     keyAbility: "WIS", trainedOnly: false },
  skill_knowledge_religion:   { name: "Connaissances (religion)", nameEn: "Knowledge (Religion)",  keyAbility: "INT", trainedOnly: true },
  skill_knowledge_planes:     { name: "Connaissances (plans)", nameEn: "Knowledge (The Planes)",     keyAbility: "INT", trainedOnly: true },
  skill_knowledge_arcana:     { name: "Connaissances (arcanes)", nameEn: "Knowledge (Arcana)",   keyAbility: "INT", trainedOnly: true },
  skill_knowledge_nature:     { name: "Connaissances (nature)", nameEn: "Knowledge (Nature)",    keyAbility: "INT", trainedOnly: true },
  skill_spellcraft:           { name: "Art de la magie", nameEn: "Spellcraft",           keyAbility: "INT", trainedOnly: true },
  skill_diplomacy:            { name: "Diplomatie", nameEn: "Diplomacy",                keyAbility: "CHA", trainedOnly: false },
  skill_sense_motive:         { name: "Psychologie", nameEn: "Sense Motive",     keyAbility: "WIS", trainedOnly: false },
  skill_listen:               { name: "Écoute", nameEn: "Listen",                   keyAbility: "WIS", trainedOnly: false },
  skill_spot:                 { name: "Détection", nameEn: "Spot",                   keyAbility: "WIS", trainedOnly: false },
  skill_hide:                 { name: "Camouflage", nameEn: "Hide",                 keyAbility: "DEX", trainedOnly: false, acp: true },
  skill_move_silently:        { name: "Déplacement silencieux", nameEn: "Move Silently",    keyAbility: "DEX", trainedOnly: false, acp: true },
  skill_climb:                { name: "Escalade", nameEn: "Climb",                  keyAbility: "STR", trainedOnly: false, acp: true },
  skill_swim:                 { name: "Natation", nameEn: "Swim",                  keyAbility: "STR", trainedOnly: false, acp: true },
  skill_tumble:               { name: "Acrobaties", nameEn: "Tumble",                keyAbility: "DEX", trainedOnly: true, acp: true },
  skill_search:               { name: "Fouille", nameEn: "Search",                  keyAbility: "INT", trainedOnly: false },
  skill_open_lock:            { name: "Crochetage", nameEn: "Open Lock",                keyAbility: "DEX", trainedOnly: true },
  skill_disable_device:       { name: "Désamorçage", nameEn: "Disable Device",               keyAbility: "INT", trainedOnly: true },
  skill_intimidate:           { name: "Intimidation", nameEn: "Intimidate",              keyAbility: "CHA", trainedOnly: false },
  skill_bluff:                { name: "Bluff", nameEn: "Bluff",                     keyAbility: "CHA", trainedOnly: false },
  skill_use_magic_device:     { name: "Util. obj magiques", nameEn: "Use Magic Device", keyAbility: "CHA", trainedOnly: true },
  skill_ride:                 { name: "Équitation", nameEn: "Ride",                keyAbility: "DEX", trainedOnly: false },
  skill_handle_animal:        { name: "Dressage",                  keyAbility: "CHA", trainedOnly: true },
  // ── Compétences SRD complètes (ajoutées v18) ─────────────────
  // Structure bilingue : name = FR (affichage UI), nameEn = EN (référence officielle)
  // description.fr / description.en = texte bilingue complet

  skill_appraise: {
    name: "Estimation", nameEn: "Appraise", keyAbility: "INT", trainedOnly: false,
    description: {
      fr: "Évaluer la valeur d'un objet. Test INT + Estimation : DC 12 pour objet courant, DC 15-20 pour objet exotique.",
      en: "Estimate the value of an item. INT check DC 12 common item, DC 15-20 for exotic."
    }
  },
  skill_balance: {
    name: "Équilibre", nameEn: "Balance", keyAbility: "DEX", trainedOnly: false, acp: true,
    description: {
      fr: "Marcher sur des surfaces étroites, instables ou glissantes. DC variable selon la surface.",
      en: "Move across narrow, unsteady, or slippery surfaces. DC varies by surface type."
    }
  },
  skill_craft: {
    name: "Artisanat", nameEn: "Craft", keyAbility: "INT", trainedOnly: false,
    description: {
      fr: "Créer un objet d'un artisanat particulier. Chaque spécialité est une compétence distincte.",
      en: "Create an item of a particular craft. Each craft specialty is a separate skill."
    }
  },
  skill_decipher_script: {
    name: "Déchiffrement", nameEn: "Decipher Script", keyAbility: "INT", trainedOnly: true,
    description: {
      fr: "Déchiffrer un texte écrit dans un alphabet ou une langue inconnue. DC 20 pour un écrit simple.",
      en: "Decipher writing in an unfamiliar language or alphabet. DC 20 for a simple message."
    }
  },
  skill_disguise: {
    name: "Déguisement", nameEn: "Disguise", keyAbility: "CHA", trainedOnly: false,
    description: {
      fr: "Se déguiser en une autre personne. Modificateurs selon l'écart de taille, de genre, d'espèce.",
      en: "Change your appearance. Modifiers for difference in size, gender, or race."
    }
  },
  skill_escape_artist: {
    name: "Évasion", nameEn: "Escape Artist", keyAbility: "DEX", trainedOnly: false, acp: true,
    description: {
      fr: "S'échapper de liens, manotes ou étreintes. DC 20 menottes, DC 30 ligoté avec corde.",
      en: "Escape from bonds, manacles, or grapples. DC 20 manacles, DC 30 rope."
    }
  },
  skill_forgery: {
    name: "Contrefaçon", nameEn: "Forgery", keyAbility: "INT", trainedOnly: false,
    description: {
      fr: "Falsifier des documents. Test opposé Contrefaçon vs Repérer/Sens de la motivation.",
      en: "Forge documents. Opposed Forgery vs Spot or Sense Motive check."
    }
  },
  skill_gather_information: {
    name: "Collecte d'informations", nameEn: "Gather Information", keyAbility: "CHA", trainedOnly: false,
    description: {
      fr: "Recueillir des rumeurs ou des informations locales. DC 10 pour infos générales, DC 20+ secrets.",
      en: "Gather rumors and local information. DC 10 general, DC 20+ for secrets."
    }
  },
  skill_jump: {
    name: "Saut", nameEn: "Jump", keyAbility: "STR", trainedOnly: false, acp: true,
    description: {
      fr: "Sauter en longueur, hauteur ou en bas. DC = distance en pieds pour un saut en longueur.",
      en: "Jump horizontally, vertically, or down. DC equals distance in feet for long jump."
    }
  },
  skill_knowledge_dungeoneering: {
    name: "Connaissances (exploration souterraine)", nameEn: "Knowledge (Dungeoneering)",
    keyAbility: "INT", trainedOnly: true,
    description: {
      fr: "Aberrations, monstres souterrains, géologie, architecture des donjons, spéléologie.",
      en: "Aberrations, underground monsters, geology, dungeon architecture, spelunking."
    }
  },
  skill_knowledge_engineering: {
    name: "Connaissances (architecture et ingénierie)", nameEn: "Knowledge (Engineering)",
    keyAbility: "INT", trainedOnly: true,
    description: {
      fr: "Bâtiments, ponts, forteresses, mécanique, architecture militaire.",
      en: "Buildings, bridges, fortifications, mechanical devices, military architecture."
    }
  },
  skill_knowledge_geography: {
    name: "Connaissances (géographie)", nameEn: "Knowledge (Geography)",
    keyAbility: "INT", trainedOnly: true,
    description: {
      fr: "Terres, terrains, climat, personnes notables, localisation des zones habitées.",
      en: "Lands, terrain, climate, notable people, location of settlements."
    }
  },
  skill_knowledge_history: {
    name: "Connaissances (histoire)", nameEn: "Knowledge (History)",
    keyAbility: "INT", trainedOnly: true,
    description: {
      fr: "Guerres, colonies, migrations, fondations, royaumes anciens, dynasties.",
      en: "Wars, colonies, migrations, foundings, ancient kingdoms, dynasties."
    }
  },
  skill_knowledge_local: {
    name: "Connaissances (folklore local)", nameEn: "Knowledge (Local)",
    keyAbility: "INT", trainedOnly: true,
    description: {
      fr: "Célébrités locales, légendes, rumeurs régionales, personnalités, guildes, histoire locale.",
      en: "Local celebrities, legends, rumors, notables, guilds, local history."
    }
  },
  skill_knowledge_nobility: {
    name: "Connaissances (noblesse et royauté)", nameEn: "Knowledge (Nobility & Royalty)",
    keyAbility: "INT", trainedOnly: true,
    description: {
      fr: "Généalogies nobles, héraldique, protocole de cour, maisons nobles, politiques royales.",
      en: "Lineages, heraldry, court protocols, noble houses, royal politics."
    }
  },
  skill_perform: {
    name: "Représentation", nameEn: "Perform", keyAbility: "CHA", trainedOnly: false,
    description: {
      fr: "Jouer de la musique, chanter, danser, conter. La Barderie est une application de cette compétence.",
      en: "Play music, sing, dance, orate, or act. Bardic music uses this skill."
    }
  },
  skill_profession: {
    name: "Profession", nameEn: "Profession", keyAbility: "WIS", trainedOnly: true,
    description: {
      fr: "Exercer un métier non couvert par Artisanat. Rapporte de l'argent entre les aventures.",
      en: "Practice a trade or profession not covered by Craft. Earns money between adventures."
    }
  },
  skill_sleight_of_hand: {
    name: "Escamotage", nameEn: "Sleight of Hand", keyAbility: "DEX", trainedOnly: true, acp: true,
    description: {
      fr: "Dissimuler un objet, voler à la tire, escamoter. Test opposé vs Repérer.",
      en: "Palm objects, pick pockets, conceal small items. Opposed by Spot."
    }
  },
  skill_speak_language: {
    name: "Langues", nameEn: "Speak Language", keyAbility: "NONE", trainedOnly: true,
    description: {
      fr: "Apprendre une nouvelle langue. Chaque rang dans cette compétence octroie une langue supplémentaire.",
      en: "Learn a new language. Each rank in this skill grants knowledge of one additional language."
    }
  },
  skill_survival: {
    name: "Survie", nameEn: "Survival", keyAbility: "WIS", trainedOnly: false,
    description: {
      fr: "Trouver de la nourriture et de l'eau, suivre des pistes, éviter de se perdre, prévoir la météo.",
      en: "Find food and water, track creatures, avoid getting lost, predict weather."
    }
  },
  skill_use_rope: {
    name: "Utilisation de cordes", nameEn: "Use Rope", keyAbility: "DEX", trainedOnly: false,
    description: {
      fr: "Nouer, attacher, ligoter. DC 10 nœud simple, DC 15 ligoter quelqu'un solidement.",
      en: "Knot, bind, or tie up. DC 10 simple knot, DC 15 to securely bind a creature."
    }
  },

  // ── Skills absent from DB — added for completeness ──────
  skill_knowledge_monsters: { name: "Co : monstres",    nameEn: "Knowledge (Dungeoneering)", keyAbility: "INT", trainedOnly: true,  description: { fr: "Identifier aberrations, vases, vermine. Synonyme de Exploration souterraine selon contexte.", en: "Identify aberrations, oozes, vermin. Context-specific alias of Dungeoneering." } },
  skill_control_shape:      { name: "Contrôle de forme", nameEn: "Control Shape",             keyAbility: "WIS", trainedOnly: false, source: "PHB - Lycanthropes uniquement", description: { fr: "Lycanthropes uniquement — résister à la métamorphose involontaire.", en: "Lycanthropes only — resist involuntary shape change." } },
  // ── Psionic skills — XPH (Expanded Psionics Handbook) ──
  skill_autohypnosis:       { name: "Autohypnose",       nameEn: "Autohypnosis",              keyAbility: "WIS", trainedOnly: true,  source: "XPH", description: { fr: "XPH — Résister à la douleur, neutraliser les états négatifs.", en: "XPH — Resist pain and negative conditions." } },
  skill_knowledge_psionics: { name: "Co : psionique",    nameEn: "Knowledge (Psionics)",      keyAbility: "INT", trainedOnly: true,  source: "XPH", description: { fr: "XPH — Connaissances sur les disciplines psioniques.", en: "XPH — Psionic lore and disciplines." } },
  skill_psicraft:           { name: "Art psi",            nameEn: "Psicraft",                  keyAbility: "INT", trainedOnly: true,  source: "XPH", description: { fr: "XPH — Identifier et utiliser les pouvoirs psioniques.", en: "XPH — Identify and use psionic powers." } },
  skill_use_psionic_device: { name: "Util. obj psioniques", nameEn: "Use Psionic Device",     keyAbility: "CHA", trainedOnly: true,  source: "XPH", description: { fr: "XPH — Utiliser des objets psioniques.", en: "XPH — Use psionic items regardless of type." } },

};

// ============================================================
// BASE DE DONNÉES DES DONS — D&D 3.5 (PHB, Complete Series)
// Chaque don : nameEn, nameFr, type, source, prereqs[], desc, [slotCost pour métamagie]
// Types de prérequis : {type:'ability',key,min} | {type:'feat',key} | {type:'bab',min}
//                      {type:'caster_level',min} | {type:'skill',key,min} | {type:'special',text}
// ============================================================