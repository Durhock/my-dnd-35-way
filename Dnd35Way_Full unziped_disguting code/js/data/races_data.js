const RACE_DB = {
  // ── RACES DE BASE (PHB) ─────────────────────────────────────
  race_human: {
    nameEn:"Human", nameFr:"Humain", baseRace:"human",
    source:"PHB", size:"Moyen", speed:30, la:0, isCore:true,
    abilityMods:{},
    vision:["Vision normale"],
    autoLanguages:["Commun"],
    bonusLanguages:["Toute (au choix)"],
    traits:[
      "1 don supplémentaire au niveau 1",
      "+4 points de compétences au niveau 1, +1 par niveau suivant",
      "Classe de prédilection : toute (au choix)"
    ],
    skills:{},
    saves:{},
    weapons:[],
    desc:"Les humains sont la race la plus répandue et la plus versatile du monde. Leur adaptabilité leur confère une grande flexibilité de construction."
  },
  race_dwarf: {
    nameEn:"Dwarf", nameFr:"Nain", baseRace:"dwarf",
    source:"PHB", size:"Moyen", speed:20, la:0, isCore:true,
    abilityMods:{ CON:2, CHA:-2 },
    vision:["Vision dans le noir 60 ft."],
    autoLanguages:["Commun","Nain"],
    bonusLanguages:["Géant","Gnome","Gobelin","Orque","Terran","Souterrain"],
    traits:[
      "Stabilité : +4 aux tests pour résister au bousculade/renversement",
      "+2 aux JS contre poison",
      "+2 aux JS contre sorts et effets magiques",
      "+1 aux jets d'attaque contre orques et gobelinoïdes",
      "+4 à la CA contre créatures de taille Géante",
      "+2 aux tests d'Appréciation liés à la pierre ou métal",
      "Sens de la profondeur : détecte pentes, passages, profondeur souterraine",
      "Classe de prédilection : Guerrier"
    ],
    skills:{ skill_appraise:2, skill_craft_stone:2, skill_craft_metal:2 },
    saves:{ poison:2, magic:2 },
    weapons:["Hache de bataille naine","Lance de jet naine"],
    desc:"Robustes et tenaces, les nains vivent dans des cités souterraines creusées dans la roche. Maîtres de l'artisanat, ils sont réputés pour leur endurance et leur résistance à la magie."
  },
  race_elf: {
    nameEn:"Elf (High Elf)", nameFr:"Elfe (Elfe haut)", baseRace:"elf",
    source:"PHB", size:"Moyen", speed:30, la:0, isCore:true,
    abilityMods:{ DEX:2, CON:-2 },
    vision:["Vision nocturne (Low-light vision)"],
    autoLanguages:["Commun","Elfe"],
    bonusLanguages:["Draconique","Gnoll","Gnome","Gobelin","Orque","Sylvain"],
    traits:[
      "Immunité aux effets magiques de sommeil",
      "+2 aux JS contre enchantements",
      "+2 aux tests d'Écouter, Fouiller et Repérer",
      "Détection automatique des portes secrètes (1/6 en passant)",
      "Classe de prédilection : Magicien"
    ],
    skills:{ skill_listen:2, skill_search:2, skill_spot:2 },
    saves:{ enchantment:2 },
    weapons:["Arc long","Arc long composite","Épée longue","Épée effilée"],
    desc:"Gracieux et raffinés, les elfes haut vivent dans des forêts éternelles. Leur longue vie leur permet de maîtriser les arcanes comme peu d'autres races."
  },
  race_gnome: {
    nameEn:"Gnome", nameFr:"Gnome", baseRace:"gnome",
    source:"PHB", size:"Petit", speed:20, la:0, isCore:true,
    abilityMods:{ CON:2, STR:-2 },
    vision:["Vision nocturne (Low-light vision)"],
    autoLanguages:["Commun","Gnome"],
    bonusLanguages:["Draconique","Nain","Elfe","Géant","Gobelin","Orque"],
    traits:[
      "+2 aux JS contre illusions",
      "+1 aux jets d'attaque contre kobolds et gobelinoïdes",
      "+4 à la CA contre créatures de taille Grande ou plus",
      "+2 aux tests d'Écouter",
      "+2 aux tests d'Artisanat (alchimie)",
      "Sort mineur : parler aux animaux (fouisseurs, 1/j)",
      "Classe de prédilection : Barde ou Illusionniste"
    ],
    skills:{ skill_listen:2, skill_craft_alchemy:2 },
    saves:{ illusion:2 },
    weapons:["Hachette de cavalier gnome","Pic de cavalier gnome"],
    desc:"Petits et vifs d'esprit, les gnomes adorent les illusions, les mécanismes et les animaux. Leur curiosité naturelle en fait des aventuriers polyvalents."
  },
  race_half_elf: {
    nameEn:"Half-Elf", nameFr:"Demi-Elfe", baseRace:"half_elf",
    source:"PHB", size:"Moyen", speed:30, la:0, isCore:true,
    abilityMods:{},
    vision:["Vision nocturne (Low-light vision)"],
    autoLanguages:["Commun","Elfe"],
    bonusLanguages:["Toute (au choix)"],
    traits:[
      "Immunité aux effets magiques de sommeil",
      "+2 aux JS contre enchantements",
      "+1 aux tests d'Écouter, Fouiller et Repérer",
      "+2 aux tests de Diplomatie et Rassembler des informations",
      "Absence de classe de prédilection (toutes au ¾ du coût)",
      "Classe de prédilection : toute"
    ],
    skills:{ skill_diplomacy:2, skill_gather_info:2, skill_listen:1, skill_search:1, skill_spot:1 },
    saves:{ enchantment:2 },
    weapons:[],
    desc:"Nés de l'union d'un humain et d'un elfe, les demi-elfes bénéficient du meilleur des deux races. Leur charme naturel les rend particulièrement habiles en société."
  },
  race_halfling: {
    nameEn:"Halfling", nameFr:"Halfelin", baseRace:"halfling",
    source:"PHB", size:"Petit", speed:20, la:0, isCore:true,
    abilityMods:{ DEX:2, STR:-2 },
    vision:["Vision normale"],
    autoLanguages:["Commun","Halfelin"],
    bonusLanguages:["Elfe","Gnome","Nain","Gobelin","Orque"],
    traits:[
      "+2 aux JS contre peur",
      "+1 aux jets d'attaque au lancer",
      "+2 aux tests d'Escalade, Écouter, Saut et Déplacement silencieux",
      "+1 à tous les jets de sauvegarde",
      "Classe de prédilection : Roublard"
    ],
    skills:{ skill_climb:2, skill_listen:2, skill_jump:2, skill_move_silently:2 },
    saves:{ all:1, fear:2 },
    weapons:[],
    desc:"Petits et discrets, les halfelins sont des voyageurs nés. Leur courage naturel et leur agilité exceptionnelle compensent amplement leur petite taille."
  },
  race_half_orc: {
    nameEn:"Half-Orc", nameFr:"Demi-Orque", baseRace:"half_orc",
    source:"PHB", size:"Moyen", speed:30, la:0, isCore:true,
    abilityMods:{ STR:2, INT:-2, CHA:-2 },
    vision:["Vision dans le noir 60 ft."],
    autoLanguages:["Commun","Orque"],
    bonusLanguages:["Nain","Gobelin","Abyssal"],
    traits:[
      "Classe de prédilection : Barbare"
    ],
    skills:{},
    saves:{},
    weapons:[],
    desc:"Fruits d'une union entre humains et orques, les demi-orques sont forts et robustes. Souvent mal compris, ils font des guerriers redoutables."
  },
  // ── SOUS-RACES ELFIQUES ─────────────────────────────────────
  race_elf_gray: {
    nameEn:"Gray Elf", nameFr:"Elfe gris", baseRace:"elf",
    source:"PHB", size:"Moyen", speed:30, la:0, isCore:true,
    abilityMods:{ DEX:2, INT:2, STR:-2, CON:-2 },
    vision:["Vision nocturne (Low-light vision)"],
    autoLanguages:["Commun","Elfe"],
    bonusLanguages:["Draconique","Gnoll","Gnome","Gobelin","Orque","Sylvain"],
    traits:[
      "Immunité aux effets magiques de sommeil",
      "+2 aux JS contre enchantements",
      "+2 aux tests d'Écouter, Fouiller et Repérer",
      "Détection automatique des portes secrètes",
      "Classe de prédilection : Magicien"
    ],
    skills:{ skill_listen:2, skill_search:2, skill_spot:2 },
    saves:{ enchantment:2 },
    weapons:["Arc long","Arc long composite","Épée longue","Épée effilée"],
    desc:"Les plus raffinés des elfes, les elfes gris sont réputés pour leur intelligence supérieure. Ils sont souvent perçus comme hautains mais leur maîtrise des arcanes est inégalée."
  },
  race_elf_wood: {
    nameEn:"Wood Elf", nameFr:"Elfe sylvestre", baseRace:"elf",
    source:"PHB", size:"Moyen", speed:30, la:0, isCore:true,
    abilityMods:{ STR:2, DEX:2, CON:-2, INT:-2, CHA:-2 },
    vision:["Vision nocturne (Low-light vision)"],
    autoLanguages:["Commun","Elfe"],
    bonusLanguages:["Gnoll","Gobelin","Orque","Sylvain"],
    traits:[
      "Immunité aux effets magiques de sommeil",
      "+2 aux JS contre enchantements",
      "+2 aux tests d'Écouter, Fouiller et Repérer",
      "Détection automatique des portes secrètes",
      "Classe de prédilection : Rôdeur"
    ],
    skills:{ skill_listen:2, skill_search:2, skill_spot:2 },
    saves:{ enchantment:2 },
    weapons:["Arc long","Arc long composite","Épée longue","Épée effilée"],
    desc:"Vivant en harmonie totale avec la forêt, les elfes sylvestres sont les plus sauvages de leur espèce. Forts et agiles, ils excellent comme rôdeurs et guerriers de la nature."
  },
  race_elf_wild: {
    nameEn:"Wild Elf", nameFr:"Elfe sauvage", baseRace:"elf",
    source:"PHB", size:"Moyen", speed:30, la:0, isCore:true,
    abilityMods:{ DEX:2, INT:-2 },
    vision:["Vision nocturne (Low-light vision)"],
    autoLanguages:["Elfe"],
    bonusLanguages:["Commun","Gnoll","Gobelin","Orque","Sylvain"],
    traits:[
      "Immunité aux effets magiques de sommeil",
      "+2 aux JS contre enchantements",
      "+2 aux tests d'Écouter, Fouiller et Repérer",
      "Détection automatique des portes secrètes",
      "Classe de prédilection : Ensorceleur"
    ],
    skills:{ skill_listen:2, skill_search:2, skill_spot:2 },
    saves:{ enchantment:2 },
    weapons:["Arc long","Arc long composite","Épée longue","Épée effilée"],
    desc:"Nomades et imprévisibles, les elfes sauvages sont les moins civilisés des elfes. Ils vivent dans les jungles et forêts les plus reculées, suivant des traditions chamaniques anciennes."
  },
  race_elf_aquatic: {
    nameEn:"Aquatic Elf", nameFr:"Elfe aquatique", baseRace:"elf",
    source:"MM", size:"Moyen", speed:30, la:0, isCore:false,
    abilityMods:{ DEX:2, CON:-2 },
    vision:["Vision dans le noir 60 ft.","Vision nocturne (Low-light vision)"],
    autoLanguages:["Commun","Elfe","Aquatique"],
    bonusLanguages:["Abyssal","Draconique","Géant","Gobelin","Orque"],
    traits:[
      "Respiration aquatique (peut respirer sous l'eau indéfiniment)",
      "Déplacement nage 40 ft.",
      "Immunité aux effets magiques de sommeil",
      "+2 aux JS contre enchantements",
      "+2 aux tests d'Écouter, Fouiller et Repérer"
    ],
    skills:{ skill_listen:2, skill_search:2, skill_spot:2 },
    saves:{ enchantment:2 },
    weapons:["Filet","Trident","Arc long (en surface)"],
    desc:"Habitants des profondeurs marines et des lacs, les elfes aquatiques possèdent des branchies en plus de poumons. Ils peuvent vivre aussi bien sous l'eau que sur terre."
  },
  race_elf_drow: {
    nameEn:"Drow (Dark Elf)", nameFr:"Drow (Elfe noir)", baseRace:"elf",
    source:"MM", size:"Moyen", speed:30, la:2, isCore:false,
    abilityMods:{ DEX:2, INT:2, CHA:2, CON:-2 },
    vision:["Vision dans le noir 120 ft."],
    autoLanguages:["Commun","Elfe","Profond commun (Underdark)"],
    bonusLanguages:["Abyssal","Draconique","Gnome de rocher profond","Gobelin","Gnome","Orque"],
    traits:[
      "Immunité aux effets magiques de sommeil",
      "+2 aux JS contre enchantements",
      "+2 aux tests d'Écouter, Fouiller et Repérer",
      "Résistance à la magie 11 + niveau de classe",
      "Pouvoirs magiques innés (1/j): lumières dansantes, obscurité, lueur de fée",
      "Sensibilité à la lumière : ébloui en lumière vive",
      "Classe de prédilection : Magicien (M) / Clerc (F)"
    ],
    skills:{ skill_listen:2, skill_search:2, skill_spot:2 },
    saves:{ enchantment:2, spell:2 },
    weapons:["Arbalète à main","Épée courte"],
    desc:"Les elfes noirs des profondeurs, les drows sont des créatures chaotiques et maléfiques adorant Lolth. Leur résistance magique innée et leurs capacités dans l'obscurité en font des adversaires redoutables. Ajustement de niveau +2."
  },
  // ── SOUS-RACES NAINES ───────────────────────────────────────
  race_dwarf_deep: {
    nameEn:"Deep Dwarf (Underdark)", nameFr:"Nain des profondeurs", baseRace:"dwarf",
    source:"Underdark", size:"Moyen", speed:20, la:0, isCore:false,
    abilityMods:{ CON:2, CHA:-4 },
    vision:["Vision dans le noir 90 ft."],
    autoLanguages:["Commun","Nain","Profond commun"],
    bonusLanguages:["Géant","Gnome profond","Gobelin","Orque","Terran"],
    traits:[
      "+2 aux JS contre poison",
      "+2 aux JS contre sorts et effets magiques",
      "+1 aux jets d'attaque contre orques et gobelinoïdes",
      "+4 à la CA contre créatures de taille Géante",
      "Sens de la profondeur amélioré",
      "Classe de prédilection : Guerrier"
    ],
    skills:{},
    saves:{ poison:2, magic:2 },
    weapons:["Hache de bataille naine","Lance de jet naine"],
    desc:"Vivant dans les profondeurs les plus reculées du monde souterrain, les nains des profondeurs ont adapté leur vision dans le noir à des distances exceptionnelles. Plus sombres que leurs cousins."
  },
  race_dwarf_duergar: {
    nameEn:"Duergar (Gray Dwarf)", nameFr:"Duergar (Nain gris)", baseRace:"dwarf",
    source:"MM", size:"Moyen", speed:20, la:2, isCore:false,
    abilityMods:{ CON:2, WIS:2, STR:-2, CHA:-4 },
    vision:["Vision dans le noir 120 ft."],
    autoLanguages:["Commun","Nain","Profond commun"],
    bonusLanguages:["Géant","Gobelin","Orque","Terran"],
    traits:[
      "Immunité aux paralysies, illusions, poisons",
      "+2 aux JS contre sorts et effets magiques",
      "Pouvoirs magiques innés (1/j) : agrandissement, invisibilité",
      "Sensibilité à la lumière : ébloui en lumière vive",
      "Classe de prédilection : Guerrier"
    ],
    skills:{},
    saves:{ magic:2 },
    weapons:["Hache de bataille naine"],
    desc:"Nains corrompus vivant dans le Underdark, les duergars sont sombres, impitoyables et esclaves. Leurs pouvoirs d'invisibilité et d'agrandissement en font des adversaires dangereux. Ajustement de niveau +2."
  },
  // ── GNOMES ALTERNATIFS ──────────────────────────────────────
  race_gnome_deep: {
    nameEn:"Deep Gnome (Svirfneblin)", nameFr:"Gnome des profondeurs (Svirfneblin)", baseRace:"gnome",
    source:"MM", size:"Petit", speed:20, la:3, isCore:false,
    abilityMods:{ DEX:2, WIS:2, STR:-2, CHA:-4 },
    vision:["Vision dans le noir 120 ft."],
    autoLanguages:["Commun","Gnome","Profond commun"],
    bonusLanguages:["Elfe","Terran","Draconique"],
    traits:[
      "Résistance à la magie 11 + niveau de classe",
      "+2 aux tests de Déplacement silencieux et Se cacher (souterrain)",
      "Pouvoirs magiques innés (1/j) : brume de pierre, obscurité, flou",
      "Sens de la profondeur",
      "Classe de prédilection : Roublard"
    ],
    skills:{ skill_hide:2, skill_move_silently:2 },
    saves:{},
    weapons:[],
    desc:"Habitants secrets du Underdark, les gnomes des profondeurs sont parmi les rares créatures non-maléfiques à survivre dans ces ténèbres. Leur résistance magique et leur furtivité sont légendaires. Ajustement de niveau +3."
  },
  // ── RACES PLANAIRES / DEMI-CÉLESTES ─────────────────────────
  race_aasimar: {
    nameEn:"Aasimar", nameFr:"Aasimar", baseRace:"human",
    source:"MM", size:"Moyen", speed:30, la:1, isCore:false,
    abilityMods:{ WIS:2, CHA:2 },
    vision:["Vision dans le noir 60 ft."],
    autoLanguages:["Commun","Céleste"],
    bonusLanguages:["Draconique","Elfe","Gnome","Halfelin","Sylvain"],
    traits:[
      "Résistance acide/froid/électricité : 5",
      "Pouvoir magique inné (1/j) : lumière du jour",
      "+2 aux tests d'Écouter et Repérer",
      "Sous-type Extérieur (natif)",
      "Classe de prédilection : Paladin"
    ],
    skills:{ skill_listen:2, skill_spot:2 },
    saves:{},
    weapons:[],
    desc:"Descendants d'êtres célestes, les aasimars irradient une lumière intérieure divine. Leur héritage angélique leur confère des résistances et une connexion naturelle avec les forces du Bien. Ajustement de niveau +1."
  },
  race_tiefling: {
    nameEn:"Tiefling", nameFr:"Tiefelin", baseRace:"human",
    source:"MM", size:"Moyen", speed:30, la:1, isCore:false,
    abilityMods:{ DEX:2, INT:2, CHA:-2 },
    vision:["Vision dans le noir 60 ft."],
    autoLanguages:["Commun","Infernal"],
    bonusLanguages:["Abyssal","Draconique","Infernal","Orque"],
    traits:[
      "Résistance froid/feu/électricité : 5",
      "Pouvoir magique inné (1/j) : ténèbres",
      "+2 aux tests de Bluff et Discrétion",
      "Sous-type Extérieur (natif)",
      "Classe de prédilection : Roublard"
    ],
    skills:{ skill_bluff:2, skill_hide:2 },
    saves:{},
    weapons:[],
    desc:"Descendants de démons ou diables, les tiefelins portent en eux une trace de malveillance planaire. Leurs cornes et leur regard perçant trahissent leur héritage infernal. Ajustement de niveau +1."
  },
  // ── RACES DE SUPPLEMENT ─────────────────────────────────────
  race_goliath: {
    nameEn:"Goliath", nameFr:"Goliath", baseRace:"goliath",
    source:"Races of Stone", size:"Moyen", speed:30, la:0, isCore:false,
    abilityMods:{ STR:4, CON:2, DEX:-2, WIS:-2 },
    vision:["Vision normale"],
    autoLanguages:["Commun","Géant"],
    bonusLanguages:["Aquatique","Gnome","Sylvain","Terran"],
    traits:[
      "Capacité d'endurance naturelle : 1 fois/jour, réduire les dégâts d'un coup de 3 à 6",
      "Puissant : compte comme Grande taille pour encombrement",
      "Compétiteur naturel : +2 à tous les tests et jets opposés",
      "Classe de prédilection : Barbare"
    ],
    skills:{},
    saves:{},
    weapons:[],
    desc:"Géants des montagnes vivant en altitude, les goliaths sont des guerriers nés. Leur culture de la compétition et leur force physique en font des barbares et guerriers exceptionnels."
  },
};

/**
 * Retourne la race actuellement sélectionnée depuis RACE_DB.
 * @returns {object|null}
 */

// ============================================================
// ITEM_DB — Base officielle d'objets D&D 3.5 (SRD + PHB + DMG)
// ============================================================