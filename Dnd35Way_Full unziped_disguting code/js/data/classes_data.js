const CLASS_REF = {
  // ─── CLASSES DE BASE (PHB) ───────────────────────────────
  class_barbarian: { name:'Barbare',    nameEn:'Barbarian', hitDie:12, babProg:'full',   fort:'good', ref:'poor', will:'poor', spPerLvl:4, source:'PHB', category:'core', spellType:'none',   isPrestige:false, icon:'🪓', role:'martial', desc:'Guerrier primitif qui entre en rage, gagnant force et résistance au combat.', primaryAbilities:['STR','CON'],
    classSkills:['skill_climb','skill_handle_animal','skill_intimidate','skill_jump','skill_listen','skill_ride','skill_survival','skill_swim'] },
  class_bard:      { name:'Barde',      nameEn:'Bard',      hitDie:6,  babProg:'medium', fort:'poor', ref:'good', will:'medium', spPerLvl:6, source:'PHB', category:'core', spellType:'arcane', isPrestige:false, icon:'♪', role:'hybrid', desc:'Artiste et magicien mêlant inspiration musicale et magie arcane.', primaryAbilities:['CHA','INT'],
    classSkills:['skill_appraise','skill_bluff','skill_concentration','skill_diplomacy','skill_disguise','skill_gather_information','skill_hide','skill_jump','skill_knowledge_arcana','skill_knowledge_history','skill_listen','skill_move_silently','skill_perform','skill_sense_motive','skill_spellcraft','skill_tumble','skill_use_magic_device'] },
  class_cleric:    { name:'Clerc',      nameEn:'Cleric',    hitDie:8,  babProg:'medium', fort:'good', ref:'poor', will:'good',   spPerLvl:2, source:'PHB', category:'core', spellType:'divine', isPrestige:false, icon:'✡', role:'divine', desc:'Prêtre guerrier canaliseur de magie divine, disposant de domaines.', primaryAbilities:['WIS','STR'],
    classSkills:['skill_concentration','skill_diplomacy','skill_heal','skill_knowledge_arcana','skill_knowledge_history','skill_knowledge_religion','skill_knowledge_planes','skill_sense_motive','skill_spellcraft'] },
  class_druid:     { name:'Druide',     nameEn:'Druid',     hitDie:8,  babProg:'medium', fort:'good', ref:'poor', will:'good',   spPerLvl:4, source:'PHB', category:'core', spellType:'divine', isPrestige:false, icon:'🌿', role:'divine', desc:'Gardien de la nature maniant la magie druidique et la métamorphose animale.', primaryAbilities:['WIS','CON'],
    classSkills:['skill_concentration','skill_diplomacy','skill_handle_animal','skill_heal','skill_knowledge_nature','skill_listen','skill_ride','skill_sense_motive','skill_spellcraft','skill_spot','skill_survival','skill_swim'] },
  class_fighter:   { name:'Guerrier',   nameEn:'Fighter',   hitDie:10, babProg:'full',   fort:'good', ref:'poor', will:'poor',   spPerLvl:2, source:'PHB', category:'core', spellType:'none',   isPrestige:false, icon:'⚔', role:'martial', desc:'Combattant polyvalent maîtrisant armes et armures, accumule des dons de combat.', primaryAbilities:['STR','CON'],
    classSkills:['skill_climb','skill_handle_animal','skill_intimidate','skill_jump','skill_ride','skill_swim'] },
  class_monk:      { name:'Moine',      nameEn:'Monk',      hitDie:8,  babProg:'medium', fort:'good', ref:'good', will:'good',   spPerLvl:4, source:'PHB', category:'core', spellType:'none',   isPrestige:false, icon:'☯', role:'martial', desc:'Maître des arts martiaux à mains nues, alliant discipline mentale et physique.', primaryAbilities:['WIS','DEX'],
    classSkills:['skill_balance','skill_climb','skill_concentration','skill_diplomacy','skill_escape_artist','skill_hide','skill_jump','skill_knowledge_arcana','skill_knowledge_religion','skill_listen','skill_move_silently','skill_perform','skill_sense_motive','skill_spot','skill_swim','skill_tumble'] },
  class_paladin:   { name:'Paladin',    nameEn:'Paladin',   hitDie:10, babProg:'full',   fort:'good', ref:'poor', will:'poor',   spPerLvl:2, source:'PHB', category:'core', spellType:'divine', isPrestige:false, icon:'⚜', role:'divine', desc:'Champion divin loyal bon, guidé par un code strict. Immunité aux maladies, soins par imposition des mains.', primaryAbilities:['STR','CHA'],
    classSkills:['skill_concentration','skill_diplomacy','skill_handle_animal','skill_heal','skill_knowledge_religion','skill_ride','skill_sense_motive'] },
  class_ranger:    { name:'Rôdeur',     nameEn:'Ranger',    hitDie:8,  babProg:'full',   fort:'good', ref:'good', will:'poor',   spPerLvl:6, source:'PHB', category:'core', spellType:'divine', isPrestige:false, icon:'🏹', role:'martial', desc:'Chasseur et traqueur expert, capable d\'utiliser magie de nature et style de combat à deux armes.', primaryAbilities:['DEX','WIS'],
    classSkills:['skill_climb','skill_handle_animal','skill_heal','skill_hide','skill_knowledge_nature','skill_listen','skill_move_silently','skill_ride','skill_search','skill_spot','skill_survival','skill_swim','skill_use_rope'] },
  class_rogue:     { name:'Roublard',   nameEn:'Rogue',     hitDie:6,  babProg:'medium', fort:'poor', ref:'good', will:'poor',   spPerLvl:8, source:'PHB', category:'core', spellType:'none',   isPrestige:false, icon:'🗡', role:'martial', desc:'Expert en infiltration, pièges et attaques sournois. Attaque sournoise +1d6 tous les 2 niveaux.', primaryAbilities:['DEX','INT'],
    classSkills:['skill_appraise','skill_balance','skill_bluff','skill_climb','skill_diplomacy','skill_disable_device','skill_disguise','skill_escape_artist','skill_forgery','skill_gather_information','skill_hide','skill_intimidate','skill_jump','skill_listen','skill_move_silently','skill_open_lock','skill_search','skill_sense_motive','skill_sleight_of_hand','skill_spot','skill_swim','skill_tumble','skill_use_magic_device','skill_use_rope'] },
  class_sorcerer:  { name:'Ensorceleur', nameEn:'Sorcerer',  hitDie:4,  babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'PHB', category:'core', spellType:'arcane', isPrestige:false, icon:'🔮', role:'arcane', desc:'Magicien au pouvoir inné, qui lance des sorts sans les mémoriser. Sorts connus limités mais réservoirs illimités.', primaryAbilities:['CHA','INT'],
    classSkills:['skill_bluff','skill_concentration','skill_knowledge_arcana','skill_spellcraft'] },
  class_wizard:    { name:'Magicien',   nameEn:'Wizard',    hitDie:4,  babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'PHB', category:'core', spellType:'arcane', isPrestige:false, icon:'✦', role:'arcane', desc:'Arcaniste savant préparant des sorts depuis un grimoire. Spécialisation possible.', primaryAbilities:['INT','DEX'],
    classSkills:['skill_concentration','skill_decipher_script','skill_knowledge_arcana','skill_knowledge_planes','skill_knowledge_religion','skill_knowledge_nature','skill_spellcraft'] },

  // ─── COMPLETE ADVENTURER ─────────────────────────────────
  class_ninja:     { name:'Ninja',      nameEn:'Ninja',     hitDie:6,  babProg:'medium', fort:'poor', ref:'good', will:'poor',   spPerLvl:6, source:'CA', category:'supplement', spellType:'none',   isPrestige:false, icon:'🌙', role:'martial', desc:'Espion et assassin oriental. Ki comme ressource, invisibilité à volonté.', primaryAbilities:['DEX','WIS'],
    classSkills:['skill_balance','skill_bluff','skill_climb','skill_diplomacy','skill_disable_device','skill_disguise','skill_escape_artist','skill_hide','skill_jump','skill_listen','skill_move_silently','skill_open_lock','skill_search','skill_sense_motive','skill_sleight_of_hand','skill_spot','skill_swim','skill_tumble','skill_use_rope'] },
  class_scout:     { name:'Éclaireur',  nameEn:'Scout',     hitDie:8,  babProg:'medium', fort:'poor', ref:'good', will:'poor',   spPerLvl:8, source:'CA', category:'supplement', spellType:'none',   isPrestige:false, icon:'🔭', role:'martial', desc:'Combattant mobile spécialisé dans le déplacement en combat. Dégâts bonus en mouvement.', primaryAbilities:['DEX','INT'],
    classSkills:['skill_balance','skill_climb','skill_escape_artist','skill_hide','skill_jump','skill_knowledge_nature','skill_listen','skill_move_silently','skill_ride','skill_search','skill_spot','skill_survival','skill_swim','skill_tumble','skill_use_rope'] },
  class_spellthief:{ name:'Voleur de sorts', nameEn:'Spellthief', hitDie:6, babProg:'medium', fort:'poor', ref:'good', will:'poor', spPerLvl:6, source:'CA', category:'supplement', spellType:'arcane', isPrestige:false, icon:'⚗', role:'hybrid', desc:'Roublard arcaniste capable de voler des sorts à ses ennemis.', primaryAbilities:['INT','DEX'],
    classSkills:['skill_bluff','skill_concentration','skill_diplomacy','skill_disable_device','skill_disguise','skill_escape_artist','skill_gather_information','skill_hide','skill_knowledge_arcana','skill_listen','skill_move_silently','skill_open_lock','skill_search','skill_sense_motive','skill_sleight_of_hand','skill_spot','skill_spellcraft','skill_tumble','skill_use_magic_device'] },

  // ─── COMPLETE ARCANE ─────────────────────────────────────
  class_warlock:   { name:'Démoniste',  nameEn:'Warlock',   hitDie:6,  babProg:'medium', fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'CompArc', category:'supplement', spellType:'invocations', isPrestige:false, icon:'👁', role:'arcane', desc:'Utilisateur d\'invocations surnatural non-préparées. Eldritch Blast évolutif.', primaryAbilities:['CHA','CON'],
    classSkills:['skill_bluff','skill_concentration','skill_diplomacy','skill_disguise','skill_intimidate','skill_knowledge_arcana','skill_knowledge_planes','skill_knowledge_religion','skill_sense_motive','skill_spellcraft','skill_use_magic_device'] },
  class_wu_jen:    { name:'Wu Jen',     nameEn:'Wu Jen',    hitDie:4,  babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'CompArc', category:'supplement', spellType:'arcane', isPrestige:false, icon:'☯', role:'arcane', desc:'Magicien oriental avec tabous et magie des éléments.', primaryAbilities:['INT','WIS'],
    classSkills:['skill_concentration','skill_knowledge_arcana','skill_knowledge_nature','skill_spellcraft'] },

  // ─── COMPLETE DIVINE ─────────────────────────────────────
  class_favored_soul:{ name:'Âme sacrée', nameEn:'Favored Soul', hitDie:8, babProg:'medium', fort:'good', ref:'poor', will:'good', spPerLvl:2, source:'CD', category:'supplement', spellType:'divine', isPrestige:false, icon:'✨', role:'divine', desc:'Clerc inné, lanceur de sorts divins sans préparation.', primaryAbilities:['CHA','WIS'],
    classSkills:['skill_concentration','skill_diplomacy','skill_heal','skill_knowledge_religion','skill_sense_motive','skill_spellcraft'] },
  class_shugenja:  { name:'Shugenja',   nameEn:'Shugenja',  hitDie:8,  babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'CD', category:'supplement', spellType:'divine', isPrestige:false, icon:'🔥', role:'divine', desc:'Prêtre élémentaire oriental spécialisé dans un élément.', primaryAbilities:['CHA','WIS'],
    classSkills:['skill_concentration','skill_knowledge_arcana','skill_knowledge_nature','skill_knowledge_religion','skill_spellcraft'] },
  class_spirit_shaman:{ name:'Chaman',  nameEn:'Spirit Shaman', hitDie:8, babProg:'medium', fort:'good', ref:'poor', will:'good', spPerLvl:4, source:'CD', category:'supplement', spellType:'divine', isPrestige:false, icon:'🦅', role:'divine', desc:'Communique avec les esprits de la nature. Guide spirituel.',primaryAbilities:['CHA','WIS'],
    classSkills:['skill_concentration','skill_diplomacy','skill_handle_animal','skill_heal','skill_knowledge_nature','skill_knowledge_planes','skill_sense_motive','skill_spellcraft','skill_survival'] },

  // ─── COMPLETE WARRIOR ────────────────────────────────────
  class_hexblade:  { name:'Hexlame',    nameEn:'Hexblade',  hitDie:10, babProg:'full',   fort:'poor', ref:'poor', will:'medium', spPerLvl:2, source:'CW', category:'supplement', spellType:'arcane', isPrestige:false, icon:'🖤', role:'hybrid', desc:'Guerrier arcaniste lançant des malédictions en combat.', primaryAbilities:['CHA','STR'],
    classSkills:['skill_bluff','skill_concentration','skill_diplomacy','skill_intimidate','skill_knowledge_arcana','skill_ride','skill_spellcraft'] },
  class_samurai:   { name:'Samouraï',   nameEn:'Samurai',   hitDie:10, babProg:'full',   fort:'good', ref:'poor', will:'good',   spPerLvl:2, source:'CW', category:'supplement', spellType:'none',   isPrestige:false, icon:'⛩', role:'martial', desc:'Guerrier oriental lié au code du bushidô. Capacités de défiance et kiai.',primaryAbilities:['STR','CHA'],
    classSkills:['skill_diplomacy','skill_handle_animal','skill_intimidate','skill_knowledge_history','skill_ride','skill_sense_motive'] },

  // ─── PLAYER'S HANDBOOK II ────────────────────────────────
  class_beguiler:  { name:'Trompeur',   nameEn:'Beguiler',  hitDie:6,  babProg:'medium', fort:'poor', ref:'poor', will:'good',   spPerLvl:6, source:'PHBII', category:'supplement', spellType:'arcane', isPrestige:false, icon:'💜', role:'arcane', desc:'Arcaniste spécialisé dans les sorts d\'illusion et d\'enchantement. Sorts connus automatiquement selon niveau.',primaryAbilities:['INT','CHA'],
    classSkills:['skill_appraise','skill_bluff','skill_concentration','skill_decipher_script','skill_diplomacy','skill_disguise','skill_gather_information','skill_hide','skill_knowledge_arcana','skill_listen','skill_move_silently','skill_search','skill_sense_motive','skill_sleight_of_hand','skill_spellcraft','skill_spot','skill_tumble','skill_use_magic_device'] },
  class_duskblade: { name:'Lame du crépuscule', nameEn:'Duskblade', hitDie:8, babProg:'full', fort:'good', ref:'poor', will:'medium', spPerLvl:2, source:'PHBII', category:'supplement', spellType:'arcane', isPrestige:false, icon:'⚔', role:'hybrid', desc:'Guerrier-mage canalisant des sorts à travers ses armes.',primaryAbilities:['INT','STR'],
    classSkills:['skill_climb','skill_concentration','skill_jump','skill_knowledge_arcana','skill_ride','skill_spellcraft','skill_swim','skill_tumble'] },
  class_knight:    { name:'Chevalier',  nameEn:'Knight',    hitDie:10, babProg:'full',   fort:'good', ref:'poor', will:'medium', spPerLvl:2, source:'PHBII', category:'supplement', spellType:'none',   isPrestige:false, icon:'🏰', role:'martial', desc:'Combattant défensif maniant l\'écu. Défis tactiques et protection des alliés.',primaryAbilities:['STR','CON'],
    classSkills:['skill_diplomacy','skill_handle_animal','skill_intimidate','skill_knowledge_history','skill_knowledge_nobility','skill_ride','skill_sense_motive'] },

  // ─── TOME OF BATTLE ──────────────────────────────────────
  class_crusader:  { name:'Croisé',     nameEn:'Crusader',  hitDie:10, babProg:'full',   fort:'good', ref:'poor', will:'good',   spPerLvl:4, source:'ToB', category:'tome_of_battle', spellType:'maneuvers', isPrestige:false, icon:'⚔', role:'martial', desc:'Guerrier divin initié utilisant les manœuvres de Devoted Spirit. Pool de dégâts retardés.', primaryAbilities:['STR','CHA'],
    classSkills:['skill_balance','skill_climb','skill_concentration','skill_diplomacy','skill_heal','skill_intimidate','skill_jump','skill_knowledge_history','skill_knowledge_religion','skill_ride','skill_sense_motive','skill_swim','skill_tumble'] },
  class_warblade:  { name:'Lame de guerre', nameEn:'Warblade', hitDie:12, babProg:'full', fort:'good', ref:'poor', will:'poor',  spPerLvl:4, source:'ToB', category:'tome_of_battle', spellType:'maneuvers', isPrestige:false, icon:'⚔', role:'martial', desc:'Guerrier martial initié expert en Iron Heart, Diamond Mind et Tiger Claw.', primaryAbilities:['STR','INT'],
    classSkills:['skill_balance','skill_climb','skill_concentration','skill_diplomacy','skill_intimidate','skill_jump','skill_knowledge_history','skill_knowledge_local','skill_ride','skill_sense_motive','skill_swim','skill_tumble'] },
  class_swordsage: { name:'Sage de l\'épée', nameEn:'Swordsage', hitDie:8, babProg:'medium', fort:'poor', ref:'good', will:'good', spPerLvl:6, source:'ToB', category:'tome_of_battle', spellType:'maneuvers', isPrestige:false, icon:'🌪', role:'martial', desc:'Guerrier-mystique agile maîtrisant Desert Wind, Shadow Hand et Setting Sun.', primaryAbilities:['WIS','DEX'],
    classSkills:['skill_balance','skill_climb','skill_concentration','skill_diplomacy','skill_hide','skill_jump','skill_knowledge_arcana','skill_knowledge_history','skill_knowledge_local','skill_knowledge_religion','skill_listen','skill_move_silently','skill_perform','skill_ride','skill_search','skill_sense_motive','skill_spot','skill_swim','skill_tumble','skill_use_rope'] },

  // ─── EXPANDED PSIONICS HANDBOOK ──────────────────────────
  class_psion:     { name:'Psion',      nameEn:'Psion',     hitDie:4,  babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'XPH', category:'psionic', spellType:'psionic', isPrestige:false, icon:'🧠', role:'psionic', desc:'Utilisateur de pouvoirs psioniques. Points de pouvoir au lieu d\'emplacements de sorts. Disciplines psioniques.',primaryAbilities:['INT','CON'],
    classSkills:['skill_concentration','skill_craft','skill_knowledge_psionics','skill_psicraft'] },
  class_psychic_warrior:{ name:'Guerrier psychique', nameEn:'Psychic Warrior', hitDie:8, babProg:'medium', fort:'good', ref:'poor', will:'medium', spPerLvl:4, source:'XPH', category:'psionic', spellType:'psionic', isPrestige:false, icon:'🧠', role:'hybrid', desc:'Guerrier qui canalise la psionie pour améliorer son combat.',primaryAbilities:['STR','WIS'],
    classSkills:['skill_autohypnosis','skill_climb','skill_concentration','skill_hide','skill_intimidate','skill_jump','skill_knowledge_psionics','skill_listen','skill_move_silently','skill_psicraft','skill_ride','skill_search','skill_spot','skill_swim','skill_tumble'] },
  class_wilder:    { name:'Wilder',     nameEn:'Wilder',    hitDie:6,  babProg:'medium', fort:'poor', ref:'poor', will:'good',   spPerLvl:4, source:'XPH', category:'psionic', spellType:'psionic', isPrestige:false, icon:'🧠', role:'psionic', desc:'Psion inné à fort potentiel, capable de surgir mais risquant l\'épuisement psionique.',primaryAbilities:['CHA','WIS'],
    classSkills:['skill_autohypnosis','skill_balance','skill_bluff','skill_climb','skill_concentration','skill_escape_artist','skill_intimidate','skill_knowledge_psionics','skill_listen','skill_move_silently','skill_psicraft','skill_sense_motive','skill_spot','skill_swim','skill_tumble'] },
  class_soulknife: { name:'Soulknife',  nameEn:'Soulknife', hitDie:10, babProg:'medium', fort:'poor', ref:'good', will:'medium', spPerLvl:4, source:'XPH', category:'psionic', spellType:'psionic', isPrestige:false, icon:'⚡', role:'martial', desc:'Crée une lame mentale de force psychique. Peut frapper n\'importe quelle créature physique ou incorporelle.',primaryAbilities:['DEX','WIS'],
    classSkills:['skill_autohypnosis','skill_balance','skill_climb','skill_concentration','skill_hide','skill_intimidate','skill_jump','skill_knowledge_psionics','skill_listen','skill_move_silently','skill_psicraft','skill_ride','skill_search','skill_sense_motive','skill_spot','skill_tumble'] },

  // ─── MAGIC OF INCARNUM ───────────────────────────────────
  class_incarnate: { name:'Incarnat',   nameEn:'Incarnate',  hitDie:8, babProg:'medium', fort:'good', ref:'poor', will:'medium', spPerLvl:4, source:'MoI', category:'incarnum', spellType:'incarnum', isPrestige:false, icon:'💠', role:'divine', desc:'Utilisateur d\'Incarnum, façonnant des mésoulas pour des bonus à la demande.',primaryAbilities:['CHA','WIS'],
    classSkills:['skill_concentration','skill_craft','skill_diplomacy','skill_heal','skill_knowledge_arcana','skill_knowledge_planes','skill_knowledge_religion','skill_spellcraft'] },
  class_totemist:  { name:'Totémiste',  nameEn:'Totemist',   hitDie:8, babProg:'medium', fort:'good', ref:'poor', will:'medium', spPerLvl:4, source:'MoI', category:'incarnum', spellType:'incarnum', isPrestige:false, icon:'🐾', role:'martial', desc:'Utilisateur d\'Incarnum lié aux totems animaux. Développe des attaques naturelles.',primaryAbilities:['WIS','CON'],
    classSkills:['skill_climb','skill_concentration','skill_craft','skill_handle_animal','skill_heal','skill_knowledge_arcana','skill_knowledge_nature','skill_survival','skill_swim'] },
  class_soulborn:  { name:'Soulborn',   nameEn:'Soulborn',   hitDie:10,babProg:'full',   fort:'good', ref:'poor', will:'poor',   spPerLvl:2, source:'MoI', category:'incarnum', spellType:'incarnum', isPrestige:false, icon:'💠', role:'martial', desc:'Guerrier Incarnum aligné. Mésoulas offensives et défensives centrées sur l\'alignement.',primaryAbilities:['WIS','STR'],
    classSkills:['skill_concentration','skill_craft','skill_intimidate','skill_knowledge_arcana','skill_knowledge_religion','skill_sense_motive'] },

  // ─── COMPLETE CHAMPION ────────────────────────────────────
  class_champion:  { name:'Champion',   nameEn:'Champion',   hitDie:8, babProg:'full',   fort:'good', ref:'poor', will:'medium', spPerLvl:4, source:'CC', category:'supplement', spellType:'divine', isPrestige:false, icon:'⚜', role:'divine', desc:'Guerrier sacré polyvalent dédié à une cause divine. Capacités de conviction et de défense des alliés.',primaryAbilities:['STR','WIS'],
    classSkills:['skill_concentration','skill_diplomacy','skill_handle_animal','skill_heal','skill_knowledge_religion','skill_ride','skill_sense_motive'] },
  class_divine_agent:{ name:'Agent divin', nameEn:'Divine Agent', hitDie:6, babProg:'medium', fort:'poor', ref:'good', will:'good', spPerLvl:6, source:'CC', category:'supplement', spellType:'divine', isPrestige:false, icon:'✡', role:'hybrid', desc:'Espion au service d\'une divinité, mêlant furtivité et miracles divins.',primaryAbilities:['WIS','DEX'],
    classSkills:['skill_bluff','skill_concentration','skill_diplomacy','skill_disguise','skill_hide','skill_knowledge_religion','skill_listen','skill_move_silently','skill_sense_motive','skill_spellcraft','skill_spot'] },

  // ─── COMPLETE MAGE ───────────────────────────────────────
  class_warmage:   { name:'Mage de guerre', nameEn:'Warmage', hitDie:6, babProg:'medium', fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'CompMage', category:'supplement', spellType:'arcane', isPrestige:false, icon:'💥', role:'arcane', desc:'Arcaniste de combat avec liste de sorts de destruction prédéfinie. Armoriser spontané.',primaryAbilities:['CHA','CON'],
    classSkills:['skill_concentration','skill_intimidate','skill_knowledge_arcana','skill_spellcraft'] },
  class_dread_necromancer: { name:'Nécromancien redoutable', nameEn:'Dread Necromancer', hitDie:6, babProg:'medium', fort:'poor', ref:'poor', will:'good', spPerLvl:2, source:'CompMage', category:'supplement', spellType:'arcane', isPrestige:false, icon:'💀', role:'arcane', desc:'Nécromancien inné utilisant la magie noire de manière spontanée. Canalisation négative.',primaryAbilities:['CHA','INT'],
    classSkills:['skill_bluff','skill_concentration','skill_diplomacy','skill_disguise','skill_hide','skill_intimidate','skill_knowledge_arcana','skill_knowledge_religion','skill_move_silently','skill_spellcraft'] },

  // ─── COMPLETE SCOUNDREL ───────────────────────────────────
  class_swashbuckler: { name:'Duelliste flamboyant', nameEn:'Swashbuckler', hitDie:10, babProg:'full',  fort:'good', ref:'good', will:'poor',   spPerLvl:4, source:'CAdv', category:'supplement', spellType:'none',   isPrestige:false, icon:'🗡', role:'martial', desc:'Combattant agile et charismatique. Grâce, DEX aux dégâts, défense acrobatique.',primaryAbilities:['DEX','INT'],
    classSkills:['skill_balance','skill_bluff','skill_climb','skill_diplomacy','skill_escape_artist','skill_gather_information','skill_intimidate','skill_jump','skill_listen','skill_perform','skill_sense_motive','skill_swim','skill_tumble','skill_use_rope'] },

  // ─── MINIATURES HANDBOOK ─────────────────────────────────
  class_healer:    { name:'Guérisseur',  nameEn:'Healer',    hitDie:8, babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:4, source:'MinHB', category:'supplement', spellType:'divine', isPrestige:false, icon:'❤', role:'divine', desc:'Soigneur pur doté de magie curative puissante. Peut soigner les morts-vivants aussi.',primaryAbilities:['WIS','CHA'],
    classSkills:['skill_concentration','skill_diplomacy','skill_heal','skill_knowledge_religion','skill_sense_motive','skill_spellcraft'] },
  class_marshal:   { name:'Maréchal',    nameEn:'Marshal',   hitDie:8, babProg:'medium', fort:'poor', ref:'poor', will:'good',   spPerLvl:4, source:'MinHB', category:'supplement', spellType:'none',   isPrestige:false, icon:'🏛', role:'martial', desc:'Chef de guerre donnant des auras d\'inspiration à son groupe. Bonus passifs au groupe.',primaryAbilities:['CHA','WIS'],
    classSkills:['skill_diplomacy','skill_gather_information','skill_heal','skill_intimidate','skill_knowledge_history','skill_knowledge_nobility','skill_listen','skill_perform','skill_ride','skill_sense_motive','skill_spot'] },

  // ─── CLASSES DE PRESTIGE ADDITIONNELLES ──────────────────
  class_abjurant_champion: { name:'Champion d\'abjuration', nameEn:'Abjurant Champion', hitDie:10, babProg:'full', fort:'good',ref:'poor',will:'poor', spPerLvl:2, source:'CompMage', category:'prestige', spellType:'arcane', isPrestige:true, icon:'🛡',role:'hybrid',
    desc:'Guerrier-mage spécialisé en abjuration. +BBA complet, sorts arcanes avancent.',prerequisites:'BBA +5, sorts arcanes de 1er niv, 1 sort d\'abjuration',
    classSkills:['skill_concentration','skill_diplomacy','skill_knowledge_arcana','skill_knowledge_dungeoneering','skill_knowledge_planes','skill_ride','skill_spellcraft','skill_swim'] },
  class_jade_phoenix_mage: { name:'Mage Phénix de jade', nameEn:'Jade Phoenix Mage', hitDie:4, babProg:'full', fort:'poor',ref:'poor',will:'good', spPerLvl:2, source:'ToB', category:'prestige', spellType:'arcane', isPrestige:true, icon:'🔥',role:'hybrid',
    desc:'Initié ToB qui avance aussi les sorts arcaniques. Utilise maniements pour alimenter la magie.',prerequisites:'Maniement de niveau 4, sorts arcanes 3e niv.',
    classSkills:['skill_concentration','skill_knowledge_arcana','skill_knowledge_planes','skill_spellcraft','skill_tumble'] },
  class_ruby_knight_vindicator: { name:'Vindicateur du Chevalier rubis', nameEn:'Ruby Knight Vindicator', hitDie:10, babProg:'full', fort:'good',ref:'poor',will:'good', spPerLvl:4, source:'ToB', category:'prestige', spellType:'divine', isPrestige:true, icon:'♦',role:'divine',
    desc:'Initié ToB doté de magie divine. Restauration des maniements par magie divine.',prerequisites:'Maniement Devoted Spirit niv.4, sorts divins 3e niv.',
    classSkills:['skill_balance','skill_concentration','skill_diplomacy','skill_heal','skill_knowledge_religion','skill_sense_motive','skill_tumble'] },
  class_war_mind:  { name:'Esprit de guerre', nameEn:'War Mind', hitDie:10, babProg:'full', fort:'good',ref:'poor',will:'poor', spPerLvl:4, source:'XPH', category:'prestige', spellType:'psionic', isPrestige:true, icon:'🧠',role:'hybrid',
    desc:'Guerrier psionique spécialisé en combat. Pouvoirs de combat psionique.',prerequisites:'BBA +5, 3 pouvoirs psioniques',
    classSkills:['skill_autohypnosis','skill_climb','skill_concentration','skill_intimidate','skill_jump','skill_knowledge_psionics','skill_psicraft','skill_swim','skill_tumble'] },
  class_cerebremancer: { name:'Cérébremancien', nameEn:'Cerebremancer', hitDie:4, babProg:'poor', fort:'poor',ref:'poor',will:'good', spPerLvl:2, source:'XPH', category:'prestige', spellType:'both', isPrestige:true, icon:'🧠',role:'psionic',
    desc:'Avance simultanément sort arcaniques et pouvoirs psioniques.',prerequisites:'Sorts arcanes 2e niv., pouvoirs psioniques 2e niv.',
    classSkills:['skill_concentration','skill_knowledge_arcana','skill_knowledge_psionics','skill_psicraft','skill_spellcraft'] },
  class_sacred_exorcist: { name:'Exorciste sacré', nameEn:'Sacred Exorcist', hitDie:8, babProg:'medium', fort:'good',ref:'poor',will:'good', spPerLvl:4, source:'CD', category:'prestige', spellType:'divine', isPrestige:true, icon:'✡',role:'divine',
    desc:'Prêtre spécialisé dans le bannissement des morts-vivants et créatures extraplanaires.',prerequisites:'Turn Undead, Knowledge (religion) 8 rangs, Alignement bon',
    classSkills:['skill_concentration','skill_diplomacy','skill_heal','skill_knowledge_planes','skill_knowledge_religion','skill_sense_motive','skill_spellcraft'] },
  class_nature_shaman: { name:'Chaman de nature', nameEn:'Nature\'s Warrior', hitDie:8, babProg:'full', fort:'good',ref:'good',will:'poor', spPerLvl:4, source:'CD', category:'prestige', spellType:'divine', isPrestige:true, icon:'🌿',role:'divine',
    desc:'Gardien de la nature combinant magie druidique et combat instinctif.',prerequisites:'BBA +4, sorts divins 2e niv., Knowledge nature 4 rangs',
    classSkills:['skill_handle_animal','skill_heal','skill_hide','skill_knowledge_nature','skill_listen','skill_move_silently','skill_ride','skill_spot','skill_survival','skill_swim'] },
  class_arcane_archer:   { name:'Archer arcane',    nameEn:'Arcane Archer',   hitDie:8,  babProg:'full',  fort:'good',ref:'good',will:'poor',  spPerLvl:4, source:'DMG', category:'prestige', spellType:'arcane', isPrestige:true, icon:'🏹', role:'martial',
    desc:'Archer elfe ou demi-elfe capable d\'enchanter ses flèches. Prérequis: BBA +6, sorts arcanes 1er niv.', prerequisites:'BBA +6, Arme de prédilection (arc), Sort arcane de 1er niv., Race elfe ou demi-elfe',
    classSkills:['skill_hide','skill_listen','skill_move_silently','skill_ride','skill_search','skill_spot','skill_survival','skill_use_rope'] },
  class_assassin:        { name:'Assassin',          nameEn:'Assassin',        hitDie:6,  babProg:'medium',fort:'poor',ref:'good',will:'poor',  spPerLvl:4, source:'DMG', category:'prestige', spellType:'arcane', isPrestige:true, icon:'🗡', role:'martial',
    desc:'Tuer d\'un coup par attaque mortelle. Prérequis: Furtivité maîtrisée, alignement mauvais.', prerequisites:'Hide 8 rangs, Move Silently 8 rangs, Aligne mauvais',
    classSkills:['skill_balance','skill_bluff','skill_climb','skill_diplomacy','skill_disable_device','skill_disguise','skill_escape_artist','skill_forgery','skill_gather_information','skill_hide','skill_intimidate','skill_jump','skill_listen','skill_move_silently','skill_open_lock','skill_search','skill_sense_motive','skill_sleight_of_hand','skill_spot','skill_swim','skill_tumble','skill_use_magic_device','skill_use_rope'] },
  class_blackguard:      { name:'Chevalier noir',    nameEn:'Blackguard',      hitDie:10, babProg:'full',  fort:'good',ref:'poor',will:'poor',  spPerLvl:2, source:'DMG', category:'prestige', spellType:'divine', isPrestige:true, icon:'💀', role:'divine',
    desc:'Paladin de la noirceur servant les dieux du mal. Contrepoids maléfique du paladin.', prerequisites:'BBA +6, Intimidation 5 rangs, Knowledge Religion 2 rangs, Alignement Mauvais',
    classSkills:['skill_concentration','skill_diplomacy','skill_handle_animal','skill_heal','skill_hide','skill_intimidate','skill_knowledge_religion','skill_ride','skill_sense_motive'] },
  class_dragon_disciple: { name:'Disciple du dragon', nameEn:'Dragon Disciple', hitDie:12, babProg:'full', fort:'good',ref:'poor',will:'medium', spPerLvl:2, source:'DMG', category:'prestige', spellType:'arcane', isPrestige:true, icon:'🐉', role:'hybrid',
    desc:'Descendant de dragon qui développe ses attributs draconiques. Bonus FOR, CON, armure naturelle.', prerequisites:'Sorts arcanes 1er niv., pas lanceur de sorts spontanés, Draconic',
    classSkills:['skill_concentration','skill_diplomacy','skill_escape_artist','skill_gather_information','skill_knowledge_arcana','skill_listen','skill_sense_motive','skill_spellcraft','skill_spot','skill_survival'] },
  class_eldritch_knight: { name:'Chevalier mystique', nameEn:'Eldritch Knight', hitDie:6, babProg:'full',  fort:'good',ref:'poor',will:'poor',  spPerLvl:2, source:'DMG', category:'prestige', spellType:'arcane', isPrestige:true, icon:'⚔', role:'hybrid',
    desc:'Guerrier-mage combinant magie arcane et combat armé. Avance magie et BBA simultanément.', prerequisites:'BBA +6, Sorts arcanes 3e niv.',
    classSkills:['skill_concentration','skill_decipher_script','skill_jump','skill_knowledge_arcana','skill_knowledge_nobility','skill_ride','skill_sense_motive','skill_spellcraft','skill_swim','skill_use_magic_device'] },
  class_mystic_theurge:  { name:'Théurge mystique',  nameEn:'Mystic Theurge',  hitDie:4,  babProg:'poor',  fort:'poor',ref:'poor',will:'good',  spPerLvl:2, source:'DMG', category:'prestige', spellType:'both',   isPrestige:true, icon:'☯', role:'arcane',
    desc:'Avance simultanément sorts arcaniques ET divins. Theurge le plus polyvalent.', prerequisites:'Sorts arcanes 2e niv., Sorts divins 2e niv.',
    classSkills:['skill_concentration','skill_decipher_script','skill_knowledge_arcana','skill_knowledge_religion','skill_sense_motive','skill_spellcraft'] },
  class_loremaster:      { name:'Maître du savoir',  nameEn:'Loremaster',      hitDie:4,  babProg:'poor',  fort:'poor',ref:'poor',will:'good',  spPerLvl:4, source:'DMG', category:'prestige', spellType:'arcane', isPrestige:true, icon:'📖', role:'arcane',
    desc:'Érudit arcane accumulant secrets et connaissances. Secrets mystiques aux niveaux impairs.', prerequisites:'Secrets arcanes 7e niv., Knowledge (arcana et histoire) 10 rangs',
    classSkills:['skill_appraise','skill_decipher_script','skill_gather_information','skill_handle_animal','skill_heal','skill_knowledge_arcana','skill_knowledge_architecture','skill_knowledge_dungeoneering','skill_knowledge_geography','skill_knowledge_history','skill_knowledge_local','skill_knowledge_nature','skill_knowledge_nobility','skill_knowledge_planes','skill_knowledge_religion','skill_perform','skill_search','skill_spellcraft','skill_use_magic_device'] },
  class_shadowdancer:    { name:'Danseur des ombres', nameEn:'Shadowdancer',    hitDie:8,  babProg:'medium',fort:'poor',ref:'good',will:'poor',  spPerLvl:6, source:'DMG', category:'prestige', spellType:'none',   isPrestige:true, icon:'🌑', role:'martial',
    desc:'Maître de la furtivité qui se téléporte entre les ombres. Attaque depuis les ténèbres.', prerequisites:'Hide 10, Perform (Danse) 5, Move Silently 8, Combat Reflexes, Dodge, Mobility',
    classSkills:['skill_balance','skill_diplomacy','skill_disguise','skill_escape_artist','skill_hide','skill_jump','skill_listen','skill_move_silently','skill_perform','skill_search','skill_sense_motive','skill_spot','skill_tumble','skill_use_rope'] },
  class_hierophant:      { name:'Hiérophante',        nameEn:'Hierophant',      hitDie:8,  babProg:'medium',fort:'good',ref:'poor',will:'good',  spPerLvl:2, source:'DMG', category:'prestige', spellType:'divine', isPrestige:true, icon:'✝', role:'divine',
    desc:'Sommet de la magie divine. Pouvoirs divins exceptionnels dont guérison de masse.', prerequisites:'Sorts divins 7e niv.',
    classSkills:['skill_concentration','skill_diplomacy','skill_heal','skill_knowledge_arcana','skill_knowledge_history','skill_knowledge_religion','skill_knowledge_planes','skill_sense_motive','skill_spellcraft','skill_survival'] },
  class_archmage:        { name:'Archimage',           nameEn:'Archmage',        hitDie:4,  babProg:'poor',  fort:'poor',ref:'poor',will:'good',  spPerLvl:2, source:'DMG', category:'prestige', spellType:'arcane', isPrestige:true, icon:'✦', role:'arcane',
    desc:'Sommet de la magie arcane. Hauts arcanes permettant la manipulation absolue des sorts.', prerequisites:'Sorts arcanes 7e niv., Knowledge (arcana) 15 rangs, Spell Focus ×2',
    classSkills:['skill_concentration','skill_decipher_script','skill_knowledge_arcana','skill_knowledge_planes','skill_spellcraft'] },

  // ─── CLASSES PNJ (NPC) ───────────────────────────────────
  class_npc_adept:      { name:'Adepte',         nameEn:'Adept',       hitDie:6,  babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:2, source:'DMG', category:'npc', spellType:'divine', isPrestige:false, icon:'🌀', role:'divine',   desc:'Classe PNJ pour lanceurs de sorts divins mineurs. Sorts innés limités.', primaryAbilities:['WIS'], classSkills:['skill_concentration','skill_craft','skill_handle_animal','skill_heal','skill_knowledge_arcana','skill_knowledge_nature','skill_profession','skill_spellcraft','skill_survival'] },
  class_npc_aristocrat: { name:'Aristocrate',    nameEn:'Aristocrat',  hitDie:8,  babProg:'medium', fort:'poor', ref:'poor', will:'medium', spPerLvl:4, source:'DMG', category:'npc', spellType:'none',   isPrestige:false, icon:'👑', role:'martial',  desc:'Classe PNJ pour nobles et dirigeants. Bonnes compétences sociales.', primaryAbilities:['CHA','INT'], classSkills:['skill_appraise','skill_bluff','skill_diplomacy','skill_disguise','skill_forgery','skill_gather_information','skill_intimidate','skill_knowledge_arcana','skill_knowledge_history','skill_knowledge_nobility','skill_listen','skill_perform','skill_ride','skill_sense_motive','skill_spot','skill_swim'] },
  class_npc_commoner:   { name:'Roturier',       nameEn:'Commoner',    hitDie:4,  babProg:'poor',   fort:'poor', ref:'poor', will:'poor',   spPerLvl:2, source:'DMG', category:'npc', spellType:'none',   isPrestige:false, icon:'🌾', role:'martial',  desc:'Classe PNJ de base pour paysans et gens ordinaires. Aucun avantage de classe.', primaryAbilities:['STR','CON'], classSkills:['skill_climb','skill_craft','skill_handle_animal','skill_jump','skill_listen','skill_profession','skill_ride','skill_spot','skill_survival','skill_swim'] },
  class_npc_expert:     { name:'Expert',         nameEn:'Expert',      hitDie:6,  babProg:'medium', fort:'poor', ref:'poor', will:'medium', spPerLvl:6, source:'DMG', category:'npc', spellType:'none',   isPrestige:false, icon:'🔧', role:'martial',  desc:'Classe PNJ pour artisans, marchands, professionnels. Choisit 10 compétences de classe.', primaryAbilities:['INT','DEX'], classSkills:[] },
  class_npc_warrior:    { name:'Guerrier (PNJ)', nameEn:'Warrior',     hitDie:8,  babProg:'medium', fort:'good', ref:'poor', will:'poor',   spPerLvl:2, source:'DMG', category:'npc', spellType:'none',   isPrestige:false, icon:'🗡', role:'martial',  desc:'Classe PNJ pour soldats et gardes. BBA moyen, sans dons bonus.', primaryAbilities:['STR','CON'], classSkills:['skill_climb','skill_handle_animal','skill_intimidate','skill_jump','skill_ride','skill_swim'] },

  // ─── HYBRID / AUTRES CLASSES DE BASE ─────────────────────
  class_archivist:      { name:'Archiviste',     nameEn:'Archivist',   hitDie:6,  babProg:'poor',   fort:'poor', ref:'poor', will:'good',   spPerLvl:4, source:'HoH', category:'hybrid', spellType:'divine', isPrestige:false, icon:'📜', role:'divine',   desc:'Érudit qui prépare TOUS les sorts divins depuis un grimoire spécial. Accès à toutes les listes divines.', primaryAbilities:['INT','WIS'], classSkills:['skill_concentration','skill_decipher_script','skill_heal','skill_knowledge_arcana','skill_knowledge_dungeoneering','skill_knowledge_history','skill_knowledge_planes','skill_knowledge_religion','skill_sense_motive','skill_spellcraft','skill_use_magic_device'] },
  class_artificer:      { name:'Artificier',     nameEn:'Artificer',   hitDie:6,  babProg:'medium', fort:'poor', ref:'poor', will:'good',   spPerLvl:4, source:'ECS', category:'hybrid', spellType:'arcane', isPrestige:false, icon:'⚙',  role:'arcane',   desc:'Inventeur d\'Eberron créant des objets magiques et des homoncules. Points d\'infusion à la place de sorts.', primaryAbilities:['INT','DEX'], classSkills:['skill_appraise','skill_concentration','skill_craft','skill_decipher_script','skill_disable_device','skill_knowledge_arcana','skill_open_lock','skill_search','skill_spellcraft','skill_use_magic_device','skill_use_rope'] },
  class_dragon_shaman:  { name:'Chaman du dragon', nameEn:'Dragon Shaman', hitDie:10, babProg:'full', fort:'good', ref:'poor', will:'medium', spPerLvl:2, source:'PHBII', category:'hybrid', spellType:'none', isPrestige:false, icon:'🐉', role:'martial', desc:'Guerrier-soutien draconique exhalant le souffle du dragon et emettant des auras de groupe.', primaryAbilities:['CHA','CON'], classSkills:['skill_climb','skill_concentration','skill_diplomacy','skill_heal','skill_intimidate','skill_jump','skill_knowledge_arcana','skill_listen','skill_ride','skill_spot','skill_survival','skill_swim'] },
  class_factotum:       { name:'Factotum',       nameEn:'Factotum',    hitDie:8,  babProg:'medium', fort:'poor', ref:'good', will:'medium', spPerLvl:6, source:'DUNGEONSCAPE', category:'hybrid', spellType:'arcane', isPrestige:false, icon:'🎭', role:'hybrid', desc:'Touche-à-tout ultime. Dépense des points d\'inspiration pour imiter n\'importe quelle compétence de classe.', primaryAbilities:['INT','DEX'], classSkills:['skill_appraise','skill_balance','skill_bluff','skill_climb','skill_concentration','skill_craft','skill_decipher_script','skill_diplomacy','skill_disable_device','skill_disguise','skill_escape_artist','skill_gather_information','skill_heal','skill_hide','skill_intimidate','skill_jump','skill_knowledge_arcana','skill_listen','skill_move_silently','skill_open_lock','skill_perform','skill_ride','skill_search','skill_sense_motive','skill_sleight_of_hand','skill_spot','skill_spellcraft','skill_swim','skill_tumble','skill_use_magic_device','skill_use_rope'] },

  // ─── PRESTIGE DMG MANQUANTS ───────────────────────────────
  class_arcane_trickster: { name:'Filou arcaniste', nameEn:'Arcane Trickster', hitDie:4, babProg:'medium', fort:'poor',ref:'good', will:'good',  spPerLvl:4, source:'DMG', category:'prestige', spellType:'arcane', isPrestige:true, icon:'🎲', role:'hybrid',
    desc:'Combine magie arcane et compétences de roublard. Attaque sournoise + sorts arcaniques avancent.', prerequisites:'BBA +2, Attaque sournoise 2d6, sorts arcanes 3e niv., Hide 8 rangs',
    classSkills:['skill_appraise','skill_balance','skill_bluff','skill_climb','skill_decipher_script','skill_diplomacy','skill_disable_device','skill_escape_artist','skill_gather_information','skill_hide','skill_jump','skill_knowledge_arcana','skill_listen','skill_move_silently','skill_open_lock','skill_search','skill_sense_motive','skill_sleight_of_hand','skill_spot','skill_spellcraft','skill_tumble','skill_use_magic_device','skill_use_rope'] },
  class_duelist:          { name:'Duelliste',        nameEn:'Duelist',          hitDie:10, babProg:'full',  fort:'poor',ref:'good', will:'poor',  spPerLvl:4, source:'DMG', category:'prestige', spellType:'none',   isPrestige:true, icon:'🗡', role:'martial',
    desc:'Escrimeur acrobatique qui se bat avec panache. CA augmentée (INT au lieu de bouclier). Frappes précises.', prerequisites:'BBA +6, Perform 3, Tumble 5, Dodge, Mobility, Weapon Finesse',
    classSkills:['skill_balance','skill_bluff','skill_escape_artist','skill_jump','skill_listen','skill_perform','skill_ride','skill_sense_motive','skill_spot','skill_tumble'] },
  class_thaumaturgist:    { name:'Thaumaturge',      nameEn:'Thaumaturgist',    hitDie:4,  babProg:'poor',  fort:'poor',ref:'poor', will:'good',  spPerLvl:2, source:'DMG', category:'prestige', spellType:'divine', isPrestige:true, icon:'🌀', role:'divine',
    desc:'Spécialiste de la convocation des créatures extraplanaires. Améliore les sorts de convocation.', prerequisites:'Sorts divins 3e niv., Knowledge (religion ou planes) 6 rangs',
    classSkills:['skill_concentration','skill_diplomacy','skill_knowledge_arcana','skill_knowledge_planes','skill_knowledge_religion','skill_sense_motive','skill_spellcraft'] },

  // ─── PRESTIGE TOME OF BATTLE ──────────────────────────────
  class_master_of_nine:   { name:'Maître des Neuf', nameEn:'Master of Nine',   hitDie:8,  babProg:'full',  fort:'good',ref:'good', will:'good',  spPerLvl:6, source:'ToB', category:'prestige', spellType:'maneuvers', isPrestige:true, icon:'⭐', role:'martial',
    desc:'Initié de haut niveau ayant maîtrisé toutes les disciplines de manœuvres. Accès aux 9 disciplines.', prerequisites:'BBA +14, maniements de niv. 5 dans 4 disciplines, 2 postures, Iron Will, Combat Reflexes',
    classSkills:['skill_balance','skill_climb','skill_concentration','skill_diplomacy','skill_hide','skill_intimidate','skill_jump','skill_knowledge_history','skill_listen','skill_move_silently','skill_ride','skill_sense_motive','skill_spot','skill_swim','skill_tumble'] },
  class_bloodclaw_master: { name:'Maître des Griffes de sang', nameEn:'Bloodclaw Master', hitDie:8, babProg:'full', fort:'good',ref:'poor',will:'poor',  spPerLvl:4, source:'ToB', category:'prestige', spellType:'maneuvers', isPrestige:true, icon:'🐯', role:'martial',
    desc:'Initié Tiger Claw qui développe ses attaques naturelles. Griffes en combat à mains nues.', prerequisites:'BBA +5, Tiger Claw niv.3, Two-Weapon Fighting',
    classSkills:['skill_balance','skill_climb','skill_hide','skill_intimidate','skill_jump','skill_knowledge_nature','skill_move_silently','skill_survival','skill_swim','skill_tumble'] },
  class_deepstone_sentinel: { name:'Sentinelle du Granit profond', nameEn:'Deepstone Sentinel', hitDie:12, babProg:'full', fort:'good',ref:'poor',will:'poor', spPerLvl:2, source:'ToB', category:'prestige', spellType:'maneuvers', isPrestige:true, icon:'🪨', role:'martial',
    desc:'Initié Stone Dragon dont la défense devient imprenable. Posture d\'immobilité totale.', prerequisites:'BBA +6, Stone Dragon niv.3, Toughness',
    classSkills:['skill_climb','skill_intimidate','skill_jump','skill_knowledge_dungeoneering','skill_knowledge_history','skill_sense_motive','skill_swim','skill_tumble'] },
  class_eternal_blade:    { name:'Lame éternelle',   nameEn:'Eternal Blade',    hitDie:8,  babProg:'full',  fort:'good',ref:'poor', will:'good',  spPerLvl:4, source:'ToB', category:'prestige', spellType:'maneuvers', isPrestige:true, icon:'✨', role:'martial',
    desc:'Initié Diamond Mind qui accède aux secrets des manœuvres ancestrales. Connaissances de combat.', prerequisites:'BBA +7, Diamond Mind niv.3, Knowledge (history) 9 rangs',
    classSkills:['skill_balance','skill_concentration','skill_diplomacy','skill_jump','skill_knowledge_history','skill_listen','skill_ride','skill_sense_motive','skill_spot','skill_swim','skill_tumble'] },

  // ─── PRESTIGE PSIONIQUE ───────────────────────────────────
  class_elocater:         { name:'Élocataire',      nameEn:'Elocater',         hitDie:6,  babProg:'medium', fort:'poor',ref:'good', will:'medium', spPerLvl:6, source:'XPH', category:'prestige', spellType:'psionic', isPrestige:true, icon:'⚡', role:'psionic',
    desc:'Psion acrobate capable de se téléporter comme manœuvre de mouvement. Maîtrise spatiale.', prerequisites:'4 pouvoirs psioniques, Tumble 8, Spring Attack',
    classSkills:['skill_autohypnosis','skill_balance','skill_concentration','skill_escape_artist','skill_jump','skill_knowledge_psionics','skill_listen','skill_move_silently','skill_psicraft','skill_sense_motive','skill_spot','skill_tumble'] },
  class_slayer:           { name:'Éliminateur',      nameEn:'Slayer',           hitDie:8,  babProg:'full',   fort:'good',ref:'poor', will:'poor',   spPerLvl:4, source:'XPH', category:'prestige', spellType:'psionic', isPrestige:true, icon:'☠', role:'psionic',
    desc:'Guerrier psionique anti-aberration. Capacités spéciales contre les créatures à anomalie mentale.', prerequisites:'BBA +4, 1 pouvoir psionique, Knowledge (dungeoneering) 4 rangs',
    classSkills:['skill_autohypnosis','skill_climb','skill_concentration','skill_hide','skill_intimidate','skill_jump','skill_knowledge_dungeoneering','skill_knowledge_psionics','skill_listen','skill_move_silently','skill_psicraft','skill_spot','skill_swim','skill_tumble'] },
  class_thrallherd:       { name:'Maître d\'esclaves psioniques', nameEn:'Thrallherd', hitDie:4, babProg:'poor', fort:'poor',ref:'poor',will:'good', spPerLvl:2, source:'XPH', category:'prestige', spellType:'psionic', isPrestige:true, icon:'🧠', role:'psionic',
    desc:'Psion contrôleur de masse. Attire des serviteurs psioniques et esclave mental puissant.', prerequisites:'4e niv. lanceur psionique, Thrall, Knowledge (psionics) 6 rangs',
    classSkills:['skill_bluff','skill_concentration','skill_diplomacy','skill_disguise','skill_gather_information','skill_knowledge_psionics','skill_psicraft','skill_sense_motive'] },
};

// ============================================================
// TAGS DE CLASSE — Étiquettes de style de jeu
// ============================================================
const CLASS_TAGS = {
  class_barbarian: ['Martial','Tank','Bruiser'],
  class_bard:      ['Hybride','Soutien','Arcanique','Compétence'],
  class_cleric:    ['Divin','Soutien','Guérisseur','Tank'],
  class_druid:     ['Divin','Nature','Métamorphe','Invocateur'],
  class_fighter:   ['Martial','Tank','Polyvalent'],
  class_monk:      ['Martial','Mobile','Mains nues'],
  class_paladin:   ['Divin','Martial','Tank','Soutien'],
  class_ranger:    ['Martial','Nature','Mobile','Archer'],
  class_rogue:     ['Furtif','Compétence','Hybride'],
  class_sorcerer:  ['Arcanique','Inné','DD élevé'],
  class_wizard:    ['Arcanique','Polyvalent','Préparation'],
  class_ninja:     ['Furtif','Mobile','Ki'],
  class_scout:     ['Mobile','Furtif','Martial'],
  class_spellthief:['Hybride','Furtif','Anti-mage'],
  class_warlock:   ['Arcanique','Invocations','À volonté'],
  class_wu_jen:    ['Arcanique','Oriental','Élémentaire'],
  class_favored_soul:['Divin','Spontané','Soutien'],
  class_shugenja:  ['Divin','Oriental','Élémentaire'],
  class_spirit_shaman:['Divin','Nature','Esprits'],
  class_hexblade:  ['Arcanique','Martial','Malédictions'],
  class_samurai:   ['Martial','Oriental','Honneur'],
  class_beguiler:  ['Arcanique','Furtif','Contrôle'],
  class_duskblade: ['Hybride','Martial','Arcanique'],
  class_knight:    ['Martial','Tank','Défensif'],
  class_crusader:  ['Initiateur','Divin','Tank','Manœuvres'],
  class_warblade:  ['Initiateur','Martial','DPS','Manœuvres'],
  class_swordsage: ['Initiateur','Mobile','Furtif','Manœuvres'],
  class_psion:     ['Psionique','Contrôle','Polyvalent'],
  class_psychic_warrior:['Psionique','Martial','Hybride'],
  class_wilder:    ['Psionique','DPS','Émotionnel'],
  class_soulknife: ['Psionique','Martial','Lame mentale'],
  class_incarnate: ['Incarnum','Divin','Soutien'],
  class_totemist:  ['Incarnum','Martial','Animiste'],
  class_soulborn:  ['Incarnum','Martial','Alignement'],
  class_champion:  ['Divin','Martial','Soutien'],
  class_divine_agent:['Divin','Furtif','Espion'],
  class_warmage:   ['Arcanique','DPS','Combat'],
  class_dread_necromancer:['Arcanique','Mort-vivants','Inné'],
  class_swashbuckler:['Martial','Mobile','Élégant'],
  class_healer:    ['Divin','Guérisseur','Soutien'],
  class_marshal:   ['Martial','Soutien','Auras','Chef'],
  class_archivist: ['Divin','Érudit','Polyvalent','Grimoire'],
  class_artificer: ['Arcanique','Artisan','Objets magiques'],
  class_dragon_shaman:['Martial','Draconique','Auras','Soutien'],
  class_factotum:  ['Compétence','Polyvalent','Touche-à-tout'],
  class_npc_adept: ['PNJ','Divin','Basique'],
  class_npc_aristocrat:['PNJ','Social','Noblesse'],
  class_npc_commoner:['PNJ','Civil','Roturier'],
  class_npc_expert:['PNJ','Compétence','Artisan'],
  class_npc_warrior:['PNJ','Martial','Soldat'],
  class_arcane_archer:['Prestige','Martial','Arcanique','Archer'],
  class_arcane_trickster:['Prestige','Hybride','Furtif','Arcanique'],
  class_assassin:  ['Prestige','Furtif','Mort immédiate'],
  class_blackguard:['Prestige','Divin','Maléfique'],
  class_dragon_disciple:['Prestige','Draconique','Hybride'],
  class_duelist:   ['Prestige','Martial','Mobile','Élégant'],
  class_eldritch_knight:['Prestige','Hybride','Martial+Arc'],
  class_mystic_theurge:['Prestige','Arc+Div','Polyvalent'],
  class_loremaster:['Prestige','Arcanique','Érudit'],
  class_shadowdancer:['Prestige','Furtif','Téléportation'],
  class_hierophant:['Prestige','Divin','Apogée'],
  class_archmage:  ['Prestige','Arcanique','Apogée'],
  class_thaumaturgist:['Prestige','Divin','Convocation'],
  class_abjurant_champion:['Prestige','Hybride','Abjuration'],
  class_jade_phoenix_mage:['Prestige','Hybride','Arc+Manœ'],
  class_ruby_knight_vindicator:['Prestige','Divin','Manœuvres'],
  class_master_of_nine:['Prestige','Initiateur','Élite'],
  class_bloodclaw_master:['Prestige','Initiateur','Griffes'],
  class_deepstone_sentinel:['Prestige','Initiateur','Tank'],
  class_eternal_blade:['Prestige','Initiateur','Historique'],
  class_war_mind:  ['Prestige','Psionique','Martial'],
  class_cerebremancer:['Prestige','Psionique','Arc+Psi'],
  class_elocater:  ['Prestige','Psionique','Mobile'],
  class_slayer:    ['Prestige','Psionique','Anti-aberration'],
  class_thrallherd:['Prestige','Psionique','Contrôle'],
  class_sacred_exorcist:['Prestige','Divin','Anti-morts-vivants'],
  class_nature_shaman:['Prestige','Divin','Nature'],
};

// ============================================================
// RÉFÉRENCES SOURCES — Page de livre par classe
// ============================================================
const CLASS_SOURCE_REFS = {
  // PHB Core
  class_barbarian: { full:'Player\'s Handbook', page:25,  url:'https://www.d20srd.org/srd/classes/barbarian.htm' },
  class_bard:      { full:'Player\'s Handbook', page:26,  url:'https://www.d20srd.org/srd/classes/bard.htm' },
  class_cleric:    { full:'Player\'s Handbook', page:30,  url:'https://www.d20srd.org/srd/classes/cleric.htm' },
  class_druid:     { full:'Player\'s Handbook', page:33,  url:'https://www.d20srd.org/srd/classes/druid.htm' },
  class_fighter:   { full:'Player\'s Handbook', page:37,  url:'https://www.d20srd.org/srd/classes/fighter.htm' },
  class_monk:      { full:'Player\'s Handbook', page:40,  url:'https://www.d20srd.org/srd/classes/monk.htm' },
  class_paladin:   { full:'Player\'s Handbook', page:43,  url:'https://www.d20srd.org/srd/classes/paladin.htm' },
  class_ranger:    { full:'Player\'s Handbook', page:47,  url:'https://www.d20srd.org/srd/classes/ranger.htm' },
  class_rogue:     { full:'Player\'s Handbook', page:49,  url:'https://www.d20srd.org/srd/classes/rogue.htm' },
  class_sorcerer:  { full:'Player\'s Handbook', page:54,  url:'https://www.d20srd.org/srd/classes/sorcerer.htm' },
  class_wizard:    { full:'Player\'s Handbook', page:57,  url:'https://www.d20srd.org/srd/classes/wizard.htm' },
  // DMG Prestige
  class_arcane_archer:  { full:'Dungeon Master\'s Guide', page:176, url:'https://www.d20srd.org/srd/prestigeClasses/arcaneArcher.htm' },
  class_arcane_trickster:{ full:'Dungeon Master\'s Guide',page:182, url:'https://www.d20srd.org/srd/prestigeClasses/arcaneTrickster.htm' },
  class_archmage:       { full:'Dungeon Master\'s Guide', page:179, url:'https://www.d20srd.org/srd/prestigeClasses/archmage.htm' },
  class_assassin:       { full:'Dungeon Master\'s Guide', page:180, url:'https://www.d20srd.org/srd/prestigeClasses/assassin.htm' },
  class_blackguard:     { full:'Dungeon Master\'s Guide', page:181, url:'https://www.d20srd.org/srd/prestigeClasses/blackguard.htm' },
  class_dragon_disciple:{ full:'Dungeon Master\'s Guide', page:183, url:'https://www.d20srd.org/srd/prestigeClasses/dragonDisciple.htm' },
  class_duelist:        { full:'Dungeon Master\'s Guide', page:184, url:'https://www.d20srd.org/srd/prestigeClasses/duelist.htm' },
  class_eldritch_knight:{ full:'Dungeon Master\'s Guide', page:187, url:'https://www.d20srd.org/srd/prestigeClasses/eldritchKnight.htm' },
  class_hierophant:     { full:'Dungeon Master\'s Guide', page:188, url:'https://www.d20srd.org/srd/prestigeClasses/hierophant.htm' },
  class_loremaster:     { full:'Dungeon Master\'s Guide', page:189, url:'https://www.d20srd.org/srd/prestigeClasses/loremaster.htm' },
  class_mystic_theurge: { full:'Dungeon Master\'s Guide', page:190, url:'https://www.d20srd.org/srd/prestigeClasses/mysticTheurge.htm' },
  class_shadowdancer:   { full:'Dungeon Master\'s Guide', page:191, url:'https://www.d20srd.org/srd/prestigeClasses/shadowdancer.htm' },
  class_thaumaturgist:  { full:'Dungeon Master\'s Guide', page:192, url:'https://www.d20srd.org/srd/prestigeClasses/thaumaturgist.htm' },
  // Complete series
  class_ninja:         { full:'Complete Adventurer',   page:5  },
  class_scout:         { full:'Complete Adventurer',   page:10 },
  class_spellthief:    { full:'Complete Adventurer',   page:13 },
  class_warlock:       { full:'Complete Arcane',       page:5  },
  class_wu_jen:        { full:'Complete Arcane',       page:14 },
  class_warmage:       { full:'Complete Arcane',       page:11 },
  class_favored_soul:  { full:'Complete Divine',       page:6  },
  class_shugenja:      { full:'Complete Divine',       page:10 },
  class_spirit_shaman: { full:'Complete Divine',       page:13 },
  class_hexblade:      { full:'Complete Warrior',      page:5  },
  class_samurai:       { full:'Complete Warrior',      page:8  },
  class_beguiler:      { full:'Player\'s Handbook II', page:6  },
  class_duskblade:     { full:'Player\'s Handbook II', page:19 },
  class_knight:        { full:'Player\'s Handbook II', page:26 },
  class_dragon_shaman: { full:'Player\'s Handbook II', page:12 },
  class_dread_necromancer:{ full:'Heroes of Horror',   page:84 },
  class_swashbuckler:  { full:'Complete Warrior',      page:11 },
  class_marshal:       { full:'Miniatures Handbook',   page:11 },
  class_healer:        { full:'Miniatures Handbook',   page:5  },
  class_champion:      { full:'Complete Champion',     page:31 },
  class_divine_agent:  { full:'Complete Champion',     page:35 },
  // Tome of Battle
  class_crusader:      { full:'Tome of Battle',        page:8,  url:'https://dnd.wizards.com' },
  class_warblade:      { full:'Tome of Battle',        page:20 },
  class_swordsage:     { full:'Tome of Battle',        page:15 },
  class_jade_phoenix_mage:    { full:'Tome of Battle', page:42 },
  class_ruby_knight_vindicator:{ full:'Tome of Battle',page:46 },
  class_master_of_nine:       { full:'Tome of Battle', page:32 },
  class_bloodclaw_master:     { full:'Tome of Battle', page:36 },
  class_deepstone_sentinel:   { full:'Tome of Battle', page:38 },
  class_eternal_blade:        { full:'Tome of Battle', page:40 },
  // XPH Psionic
  class_psion:          { full:'Expanded Psionics Handbook', page:7  },
  class_psychic_warrior:{ full:'Expanded Psionics Handbook', page:14 },
  class_wilder:         { full:'Expanded Psionics Handbook', page:19 },
  class_soulknife:      { full:'Expanded Psionics Handbook', page:23 },
  class_war_mind:       { full:'Expanded Psionics Handbook', page:153 },
  class_cerebremancer:  { full:'Expanded Psionics Handbook', page:145 },
  class_elocater:       { full:'Expanded Psionics Handbook', page:148 },
  class_slayer:         { full:'Expanded Psionics Handbook', page:155 },
  class_thrallherd:     { full:'Expanded Psionics Handbook', page:157 },
  // Incarnum
  class_incarnate:     { full:'Magic of Incarnum', page:20 },
  class_totemist:      { full:'Magic of Incarnum', page:31 },
  class_soulborn:      { full:'Magic of Incarnum', page:26 },
  // Hybrid / other
  class_archivist:     { full:'Heroes of Horror',     page:82  },
  class_artificer:     { full:'Eberron Campaign Setting', page:29 },
  class_factotum:      { full:'Dungeonscape',         page:12  },
  // DMG NPC
  class_npc_adept:     { full:'Dungeon Master\'s Guide', page:107, url:'https://www.d20srd.org/srd/npcClasses/adept.htm' },
  class_npc_aristocrat:{ full:'Dungeon Master\'s Guide', page:107, url:'https://www.d20srd.org/srd/npcClasses/aristocrat.htm' },
  class_npc_commoner:  { full:'Dungeon Master\'s Guide', page:107, url:'https://www.d20srd.org/srd/npcClasses/commoner.htm' },
  class_npc_expert:    { full:'Dungeon Master\'s Guide', page:107, url:'https://www.d20srd.org/srd/npcClasses/expert.htm' },
  class_npc_warrior:   { full:'Dungeon Master\'s Guide', page:107, url:'https://www.d20srd.org/srd/npcClasses/warrior.htm' },
};
// ============================================================
// DONNÉES ÉTENDUES DES CLASSES — Descriptions, capacités, progression
// ============================================================
const CLASS_EXTRA = {

  // ─── PHB CORE ───────────────────────────────────────────────

  class_barbarian: {
    descLong: `Le barbare est un guerrier sauvage et intuitif qui puise dans une fureur intérieure. Issu de cultures tribales ou de frontières sauvages, il excelle dans le combat brutal et rapide. Contrairement au guerrier discipliné, le barbare se bat à l\'instinct, laissant sa rage le propulser au-delà des limites humaines normales. Sa robustesse exceptionnelle et sa vitesse de déplacement en font un combattant d\'avant-garde redoutable.`,
    features: [
      { icon:'💢', name:'Rage', desc:'Entre en rage pour +4 FOR, +4 CON, +2 jets de moral, –2 CA. Dure CON mod + 3 rounds. 1/jour au niv.1, +1/jour tous les 4 niveaux.' },
      { icon:'🔥', name:'Rage implacable (Indomitable Will)', desc:'À partir du niv.14, bonus de +4 contre les sorts et effets d\'enchantement en rage.' },
      { icon:'⚡', name:'Vitesse sans armure', desc:'+10 ft de déplacement en armure légère ou sans armure. +5 ft tous les 3 niveaux suivants.' },
      { icon:'🛡', name:'Résistance au danger', desc:'Niv.2. Bonus de +1 aux jets de Réflexes et Vigueur (bonus compétence).' },
      { icon:'⚔', name:'Combat sans retrait (Trap Sense)', desc:'Niv.3. +1 Réflexes et CA contre les pièges. Augmente tous les 3 niveaux.' },
      { icon:'🦾', name:'Réduction des dégâts', desc:'Niv.7. RD 1/—. Augmente de 1 tous les 3 niveaux (max 5/— au niv.19).' },
    ],
    progressionHighlights: [
      { level:1,  text:'Rage 1/jour, Vitesse sans armure, Combat débraillé' },
      { level:2,  text:'Résistance au danger +1' },
      { level:3,  text:'Sens du piège +1' },
      { level:4,  text:'Rage 2/jour' },
      { level:5,  text:'Vitesse sans armure +20 ft au total' },
      { level:7,  text:'RD 1/—' },
      { level:10, text:'Rage 3/jour' },
      { level:11, text:'Rage plus grande' },
      { level:14, text:'Rage indomptable' },
      { level:17, text:'Rage titanesque' },
      { level:20, text:'Rage 5/jour, Vitesse +40 ft, RD 5/—' },
    ],
    spellcastingInfo: null,
    specialMechanics: [
      { icon:'💢', name:'Fatigue post-rage', desc:'Après la rage, le barbare est fatigué pour le reste de la rencontre. La grande rage le rend épuisé.' },
      { icon:'⚠', name:'Restrictions en rage', desc:'Ne peut pas utiliser de compétences ou capacités basées sur la Concentration, l\'Art de la magie, ou les dons de création en rage.' },
    ],
    guideUrl: null,
  },

  class_bard: {
    descLong: `Le barde est un artiste voyageur dont la magie émane de la musique et des contes. Il incarne l\'idéal de l\'aventurier polyvalent : capable de combattre, de lancer des sorts et d\'inspirer ses alliés par sa performance. Ses connaissances encyclopédiques et ses talents sociaux en font le diplomate idéal du groupe. Si ses capacités individuelles n\'égalent jamais celles d\'un spécialiste, sa polyvalence unique en fait un atout précieux dans toute équipe.`,
    features: [
      { icon:'🎵', name:'Inspiration bardique', desc:'Utilise son charisme pour inspirer ses alliés. Courage bardique (+1 att/dégâts), Compétence bardique (+comp.), Fascination (ensorcelle), Suggestion bardique, contre-chant.' },
      { icon:'✨', name:'Magie bardique', desc:'Lance des sorts arcaniques de manière spontanée sans grimoire. Liste unique alliant sorts arcaniques et divins.' },
      { icon:'📚', name:'Connaissances bardiques', desc:'Peut tenter un jet de connaissance sur n\'importe quel domaine. Bonus = niveaux de barde + mod. INT.' },
      { icon:'🤝', name:'Jack of all trades', desc:'Peut tenter tout jet de compétence même non formé.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Inspiration bardique, Magie (sorts de niv.1), Contre-chant, Fascination' },
      { level:2,  text:'Sorts de niv.1 (2 sorts)' },
      { level:3,  text:'Inspiration: Courage bardique' },
      { level:6,  text:'Suggestion bardique' },
      { level:9,  text:'Sorts de niv.4' },
      { level:14, text:'Inspiration: Défi bardique' },
      { level:20, text:'Sorts de niv.6, Inspiration puissante' },
    ],
    spellcastingInfo: { ability:'CHA', prep:false, spellbook:false, spontaneous:true,
      note:'Lance spontanément depuis une liste fixe. Aucune préparation requise. Sorts de niveaux 0–6 (jusqu\'au niv.20 de barde).' },
    specialMechanics: [
      { icon:'🎵', name:'Inspiration bardique par jour', desc:'Utilisations = 3 + mod. CHA par jour. Chaque utilisation déclenche une performance musicale, vocale ou gestuelle.' },
    ],
    guideUrl: null,
  },

  class_cleric: {
    descLong: `Le clerc est le serviteur armé d\'une divinité, qui canalise la puissance divine pour soigner ses alliés, repousser les morts-vivants et frapper ses ennemis. Plus qu\'un simple soigneur, le clerc peut se battre en armure lourde et dispose d\'une liste de sorts parmi les plus puissantes du jeu. La sélection de deux domaines divins lui offre des sorts supplémentaires et des capacités uniques selon sa foi.`,
    features: [
      { icon:'🙏', name:'Sorts divins', desc:'Prépare des sorts divins accordés par sa divinité chaque matin. Accès à tous les sorts de sa liste si SAG suffisante.' },
      { icon:'☀', name:'Canalisation divine (Turn/Rebuke Undead)', desc:'Repousse ou détruit les morts-vivants (ou les commande si mauvais alignement). Utilisations = 3 + mod. CHA/jour.' },
      { icon:'⛪', name:'Domaines divins', desc:'Choisit 2 domaines liés à sa divinité. Chaque domaine accorde un sort par niveau et une capacité spéciale.' },
      { icon:'🌟', name:'Sorts de domaine', desc:'Un emplacement de sort supplémentaire par niveau, utilisé uniquement pour les sorts de domaine.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Sorts divins, Turn Undead, Domaines ×2' },
      { level:5,  text:'Sorts de niv.3 (Lumière du jour, Guérison des maladies…)' },
      { level:9,  text:'Sorts de niv.5 (Retour à la vie, Symbole de douleur…)' },
      { level:13, text:'Sorts de niv.7 (Résurrection, Régénération…)' },
      { level:17, text:'Sorts de niv.9 (Miracle, Résurrection suprême…)' },
    ],
    spellcastingInfo: { ability:'WIS', prep:true, spellbook:false, spontaneous:false,
      note:'Accès à toute la liste cléricale si SAG suffisante. Sorts de soins peuvent être préparés spontanément en sacrifiant un emplacement de sort quelconque.' },
    specialMechanics: [
      { icon:'⛪', name:'Alignement et divinité', desc:'Les sorts de descripteur [Mal] ne peuvent être lancés par un clerc bon, et vice versa. Un clerc neutre choisit d\'orienter ses capacités anti-morts-vivants.' },
      { icon:'☀', name:'Turn Undead', desc:'Jet 2d6 + mod CHA + niv clerc : si résultat ≥ DV, les morts-vivants fuient. Si résultat ≥ DV+10, ils sont détruits.' },
    ],
    guideUrl: null,
  },

  class_druid: {
    descLong: `Le druide est le gardien mystique de la nature, qui tire ses pouvoirs des forces primordiales du monde naturel. Sa relation avec la nature lui confère une liste de sorts unique centrée sur les éléments et la faune, ainsi que la capacité extraordinaire de se transformer en animal. Son lien avec un animal compagnon en fait une classe doublement puissante sur le terrain.`,
    features: [
      { icon:'🌿', name:'Sorts de nature', desc:'Sorts divins centrés sur la nature, les animaux et les éléments. Prépare depuis la liste druidique chaque matin.' },
      { icon:'🐺', name:'Animal compagnon', desc:'Lien magique avec un animal compagnon qui gagne des capacités à mesure que le druide progresse.' },
      { icon:'🔄', name:'Métamorphose sauvage (Wild Shape)', desc:'Niv.5. Se transforme en animal de taille P à G, 1/jour (+1/jour tous les 2 niveaux). Durée 1 h/niv. de druide.' },
      { icon:'🌳', name:'Empathie sauvage', desc:'Interagit avec les animaux comme avec Diplomatie. Peut apaiser les animaux hostiles.' },
      { icon:'🍃', name:'Déplacement sylvestre', desc:'Niv.2. Ne laisse aucune trace naturelle. Niv.3 : immunité aux pièges naturels. Niv.4 : résistance élémentaire.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Sorts, Animal compagnon, Empathie sauvage, Langue de la nature' },
      { level:2,  text:'Déplacement sylvestre (pas de traces)' },
      { level:4,  text:'Résistance (acide, froid, feu, électricité) 10' },
      { level:5,  text:'Métamorphose sauvage 1/jour (P–G animaux)' },
      { level:9,  text:'Venom Immunity, Métamorphose 4/jour' },
      { level:13, text:'Wild Shape : Plante' },
      { level:16, text:'Wild Shape : Élémentaire' },
      { level:18, text:'Corps de la nature (immunités élémentaires)' },
    ],
    spellcastingInfo: { ability:'WIS', prep:true, spellbook:false, spontaneous:false,
      note:'Prépare ses sorts divins depuis la liste druidique. Peut sacrifier un emplacement pour un sort de convocation de la nature de même niveau.' },
    specialMechanics: [
      { icon:'🔄', name:'Métamorphose sauvage', desc:'Récupère PV en se transformant et en reprenant forme humaine. Obtient toutes les capacités naturelles de l\'animal (attaques naturelles, sens, déplacement) mais pas les capacités surnaturelles.' },
      { icon:'⚠', name:'Code druidique', desc:'Un druide portant armure métallique perd ses sorts et capacités jusqu\'à s\'en défaire. Doit rester de nature vraie non mauvaise.' },
    ],
    guideUrl: null,
  },

  class_fighter: {
    descLong: `Le guerrier est le maître incontesté des armes et de l\'armure. Doté du meilleur dé de vigueur après le barbare, du plus grand nombre de dons de combat de tout le jeu, et du meilleur bonus de base à l\'attaque, il est l\'archétype du combattant pur. Si son contenu de classe semble simple, c\'est par sa personnalisation via les dons et les styles de combat qu\'il brille. Chaque don de guerrier peut être rempli avec n\'importe quel don de combat, ce qui le rend infiniment adaptable.`,
    features: [
      { icon:'⚔', name:'Dons de combat (Bonus Feats)', desc:'Obtient un don de combat supplémentaire au niv.1, 2, puis tous les 2 niveaux. Total : 11 dons de guerrier sur 20 niveaux.' },
      { icon:'🏋', name:'Proficiences d\'armure et d\'armes', desc:'Toutes les armures (légères, intermédiaires, lourdes) et tous les boucliers, plus toutes les armes courantes et de guerre.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Don de guerrier, Don de guerrier' },
      { level:2,  text:'Don de guerrier' },
      { level:4,  text:'Don de guerrier' },
      { level:6,  text:'Don de guerrier' },
      { level:8,  text:'Don de guerrier' },
      { level:10, text:'Don de guerrier' },
      { level:12, text:'Don de guerrier' },
      { level:14, text:'Don de guerrier' },
      { level:16, text:'Don de guerrier' },
      { level:18, text:'Don de guerrier' },
      { level:20, text:'Don de guerrier' },
    ],
    spellcastingInfo: null,
    specialMechanics: [
      { icon:'📖', name:'Requalification de dons (3.5 PHB II)', desc:'Le guerrier peut remplacer un don de guerrier lors de l\'obtention d\'un nouveau niveau pour en choisir un autre.' },
      { icon:'⚔', name:'Polyvalence', desc:'Aucune restriction sur les dons de guerrier autorisés. Tout don portant le sous-type [Combat] est accessible, y compris ceux des suppléments.' },
    ],
    guideUrl: null,
  },

  class_monk: {
    descLong: `Le moine est un guerrier ascétique qui a consacré son corps et son esprit à la discipline martiale. Sans armes ni armures, il frappe avec une puissance croissante et se déplace à une vitesse surhumaine. À haut niveau, il transcende les limites physiques, devenant presque surnaturel. Sa progression unique en fait l\'une des classes les plus satisfaisantes à thématiser, même si elle requiert une planification soigneuse.`,
    features: [
      { icon:'✊', name:'Attaque à mains nues', desc:'Inflige des dégâts de plus en plus importants (d6 → d10 → 2d6…). Compte comme arme magique à partir du niv.4.' },
      { icon:'💨', name:'Vitesse de déplacement', desc:'+10 ft au niv.3, +10 ft tous les 3 niveaux. Au niv.18 : +60 ft de base.' },
      { icon:'🌊', name:'Esquive surnaturelle', desc:'Niv.2. Ne perd jamais son bonus DEX à la CA. Niv.4 : Vision mystérieuse (Slow Fall), Immobilité.' },
      { icon:'⚡', name:'Attaque en frappe (Flurry of Blows)', desc:'Attaque supplémentaire à chaque round avec pénalité, puis sans pénalité à haut niveau.' },
      { icon:'🧘', name:'Sérénité (Still Mind)', desc:'Niv.3. +2 aux JS contre enchantements.' },
      { icon:'🌟', name:'Ki Strike', desc:'Niv.4. Attaque comme arme magique. Niv.10 : lawful. Niv.16 : adamantine.' },
      { icon:'🔮', name:'Résistance à la magie', desc:'Niv.13. RM = 10 + niv. de moine.' },
      { icon:'♾', name:'Corps de diamant (Diamond Body)', desc:'Niv.11. Immunité aux poisons.' },
      { icon:'🌅', name:'Corps éternel (Timeless Body)', desc:'Niv.17. Cesse de vieillir physiquement.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Attaque à mains nues (d6), Tourbillon de coups, Bonus DEX à CA, Don de moine' },
      { level:2,  text:'Chute ralentie, Don de moine' },
      { level:3,  text:'Vitesse +10 ft, Toujours alerte' },
      { level:4,  text:'Ki Strike (magique)' },
      { level:5,  text:'Esquive surnaturelle améliorée' },
      { level:9,  text:'Amélioration du tourbillon (vitesse normale)' },
      { level:11, text:'Corps de diamant (immunité poisons)' },
      { level:13, text:'Résistance à la magie (10 + niv)' },
      { level:15, text:'Tourbillon à pleine vitesse' },
      { level:17, text:'Corps éternel' },
      { level:19, text:'Langue du Soleil et de la Lune' },
      { level:20, text:'Âme pure (détecte alignement à volonté)' },
    ],
    spellcastingInfo: null,
    specialMechanics: [
      { icon:'⚠', name:'Contraintes strictes', desc:'Doit être d\'alignement Loyal. Ne peut pas porter d\'armure ni de bouclier. Ne peut pas manier d\'armes normales sans perdre ses capacités de classe.' },
      { icon:'🤜', name:'Table des dégâts mains nues', desc:'1 : 1d6 → 4 : 1d8 → 8 : 1d10 → 12 : 2d6 → 16 : 2d8 → 20 : 2d10.' },
    ],
    guideUrl: null,
  },

  class_paladin: {
    descLong: `Le paladin est le champion par excellence de la loi et du bien. Alliant les capacités martiales du guerrier à des pouvoirs divins uniques, il est difficile à tuer et inspire ses alliés par sa seule présence. Sa progression lente de magie divine est compensée par une autonomie de survie exceptionnelle. Son monture de guerre divine et sa résistance aux maladies et poisons en font un compagnon précieux dans n\'importe quelle quête.`,
    features: [
      { icon:'✨', name:'Aura du bien', desc:'Aura de puissance Bonne détectable magiquement.' },
      { icon:'🌟', name:'Détection du mal', desc:'À volonté, détecte les auras mauvaises comme le sort.' },
      { icon:'💎', name:'Châtiment du mal (Smite Evil)', desc:'1/jour + 1/5 niveaux. Ajoute CHA à l\'attaque, niveaux de paladin aux dégâts contre créature mauvaise.' },
      { icon:'🙏', name:'Grâce divine (Divine Grace)', desc:'Niv.2. Ajoute le modificateur de CHA à tous les jets de sauvegarde.' },
      { icon:'❤', name:'Imposition des mains (Lay on Hands)', desc:'Niv.2. Soigne niv.paladin × CHA PV par jour. Peut soigner maladies.' },
      { icon:'☀', name:'Aura de courage', desc:'Niv.3. Alliés dans 10 ft : +4 aux jets contre la peur. Immunité au paladin.' },
      { icon:'🛡', name:'Résistance divine', desc:'Niv.3. Immunité aux maladies naturelles (pas surnaturelles).' },
      { icon:'⚔', name:'Sorts divins', desc:'Niv.4. Lance des sorts divins de bas niveau. Uniquement du niv.1 au 4.' },
      { icon:'🐴', name:'Monture de guerre divine', desc:'Niv.5. Invoque sa monture céleste de guerre.' },
      { icon:'🚫', name:'Expulsion des morts-vivants', desc:'Niv.4. Turn Undead comme clerc de niveau –3.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Aura du bien, Détection du mal, Châtiment du mal 1/jour' },
      { level:2,  text:'Grâce divine (+CHA à tous les JS), Imposition des mains' },
      { level:3,  text:'Aura de courage, Résistance divine' },
      { level:4,  text:'Sorts divins (niv.1), Expulsion des morts-vivants' },
      { level:5,  text:'Monture de guerre divine, Châtiment du mal 2/jour' },
      { level:11, text:'Châtiment du mal 3/jour' },
    ],
    spellcastingInfo: { ability:'WIS', prep:true, spellbook:false, spontaneous:false,
      note:'Sorts de niv.1 à 4 uniquement. Accès à la liste de sorts de paladin, préparés chaque jour.' },
    specialMechanics: [
      { icon:'⚠', name:'Code du paladin', desc:'Doit rester Loyal Bon. Un paladin qui enfreint son code perd tous ses sorts et capacités jusqu\'à expiation. Doit obéir à des règles de conduite strictes.' },
      { icon:'💀', name:'Immunité aux maladies', desc:'Immunisé dès le niv.3 aux maladies naturelles. L\'imposition des mains peut aussi soigner les maladies.' },
    ],
    guideUrl: null,
  },

  class_ranger: {
    descLong: `Le rôdeur est un guerrier aguerri des étendues sauvages, expert dans le traque et la chasse. Sa particularité réside dans son ennemi juré : une catégorie de créatures contre lesquelles il gagne des bonus croissants à l\'attaque et aux dégâts. Sa maîtrise du combat à deux armes ou à l\'arc, combinée à une magie de nature légère et un animal compagnon, en fait un combattant polyvalent et indépendant.`,
    features: [
      { icon:'🎯', name:'Ennemi juré (Favored Enemy)', desc:'Bonus +2 att/dégâts/comp. contre une catégorie (humanoides, morts-vivants, etc.). +2 supplémentaires tous les 5 niveaux.' },
      { icon:'🌳', name:'Terrain de prédilection (Favored Terrain)', desc:'Bonus aux compétences de nature dans un environnement familier.' },
      { icon:'🐺', name:'Animal compagnon', desc:'Niv.4. Compagnon animal comme druide de niveau –3.' },
      { icon:'⚔', name:'Style de combat', desc:'Niv.2. Choisit Tir à l\'arc (Improved Precise Shot) ou Combat à 2 armes (Deux-Armes Amélioré). Niv.11 : don avancé.' },
      { icon:'🌿', name:'Sorts de nature', desc:'Niv.4. Lance des sorts divins de bas niveau (niv.1–4).' },
    ],
    progressionHighlights: [
      { level:1,  text:'Ennemi juré ×1, Empathie sauvage' },
      { level:2,  text:'Style de combat (Archerie ou 2 armes)' },
      { level:3,  text:'Pistage, Endurance' },
      { level:4,  text:'Animal compagnon, Sorts de nature (niv.1)' },
      { level:5,  text:'Ennemi juré ×2' },
      { level:6,  text:'Terrain de prédilection' },
      { level:11, text:'Style de combat amélioré (don avancé)' },
      { level:15, text:'Ennemi juré ×4' },
    ],
    spellcastingInfo: { ability:'WIS', prep:true, spellbook:false, spontaneous:false,
      note:'Sorts de niv.1 à 4 uniquement. Liste de sorts dérivée de la liste druidique et cléricale.' },
    specialMechanics: [],
    guideUrl: null,
  },

  class_rogue: {
    descLong: `Le roublard est le maître des compétences, de la discrétion et des coups portés au bon moment. Avec le plus grand nombre de points de compétences du jeu partagé avec le barde et l\'éclaireur, il peut assurer de nombreux rôles utilitaires. Sa capacité signature, l\'attaque sournoise, transforme chaque attaque en surprise ou de flanc en un coup dévastateur. À haut niveau, ses talents spéciaux lui permettent de se spécialiser dans une direction unique.`,
    features: [
      { icon:'🗡', name:'Attaque sournoise (Sneak Attack)', desc:'Inflige +1d6 dégâts supplémentaires par deux niveaux (max +10d6 au niv.20) si la cible est privée de son bonus DEX à la CA ou flanquée.' },
      { icon:'⚡', name:'Esquive surnaturelle (Uncanny Dodge)', desc:'Niv.2. Garde le bonus DEX même surpris. Niv.4 : Esquive impossible à prendre en flanc.' },
      { icon:'🔍', name:'Chercher les pièges (Trapfinding)', desc:'Peut trouver et désamorcer des pièges de DD 20+. Seul le roublard peut le faire (pas les non-roublards).' },
      { icon:'🌟', name:'Talents spéciaux (Special Abilities)', desc:'À partir du niv.10, un talent spécial tous les 2 niveaux. Options : Attaque handicapante, Sens camouflé, Amélioration de la chance…' },
    ],
    progressionHighlights: [
      { level:1,  text:'Attaque sournoise +1d6, Chercher les pièges' },
      { level:2,  text:'Esquive surnaturelle' },
      { level:3,  text:'Attaque sournoise +2d6' },
      { level:4,  text:'Esquive surnaturelle améliorée' },
      { level:5,  text:'+3d6' },
      { level:10, text:'+5d6, 1er talent spécial' },
      { level:15, text:'+8d6, 3ème talent spécial' },
      { level:20, text:'+10d6, 5ème talent spécial' },
    ],
    spellcastingInfo: null,
    specialMechanics: [
      { icon:'🗡', name:'Immunité à l\'attaque sournoise', desc:'Ne fonctionne pas contre les créatures sans constitution (morts-vivants), celles qui voient invisible, ou celles insensibles aux critiques.' },
    ],
    guideUrl: null,
  },

  class_sorcerer: {
    descLong: `L\'ensorceleur tire son pouvoir d\'un héritage magique dans son sang — qu\'il soit d\'origine draconique, céleste ou autre. Contrairement au magicien, il n\'a pas besoin de grimoire : ses sorts sont inscrits dans son âme. Il lance spontanément depuis les sorts qu\'il connaît, avec un nombre d\'emplacements de sorts supérieur à celui du magicien. Sa flexibilité en combat est inégalée, au prix d\'une liste de sorts plus restreinte.`,
    features: [
      { icon:'🔮', name:'Sorts arcaniques innés', desc:'Lance spontanément depuis les sorts qu\'il connaît. Aucune préparation. Plus d\'emplacements que le magicien.' },
      { icon:'🐉', name:'Familier', desc:'Peut appeler un familier magique (chat, corbeau, chouette, rat...) qui confère des avantages passifs.' },
    ],
    progressionHighlights: [
      { level:1,  text:'4 sorts connus de niv.0, 2 de niv.1; Familier' },
      { level:4,  text:'Sorts de niv.2' },
      { level:7,  text:'Sorts de niv.4' },
      { level:10, text:'Sorts de niv.5' },
      { level:14, text:'Sorts de niv.7' },
      { level:17, text:'Sorts de niv.9' },
      { level:20, text:'9 sorts de niv.9 connus, 4 emplacements/jour' },
    ],
    spellcastingInfo: { ability:'CHA', prep:false, spellbook:false, spontaneous:true,
      note:'Sorts connus définitivement (impossible de les changer facilement). Partage la liste de sorts du magicien. Aucune spécialisation d\'école disponible.' },
    specialMechanics: [],
    guideUrl: null,
  },

  class_wizard: {
    descLong: `Le magicien est le lanceur de sorts arcaniques le plus puissant et le plus polyvalent du jeu. Sa force réside dans son grimoire : en principe, il peut apprendre tous les sorts arcaniques qui existent. Chaque jour, il prépare soigneusement ses sorts depuis son grimoire, ce qui lui permet d\'adapter son arsenal à n\'importe quelle situation. Sa faiblesse en combat physique est compensée par des sorts capables de changer le cours d\'une rencontre entière.`,
    features: [
      { icon:'📖', name:'Grimoire et préparation', desc:'Prépare chaque jour une sélection de sorts depuis son grimoire. Commence avec 3 + INT sorts de niv.0 et 1.' },
      { icon:'⭐', name:'Spécialisation (École de magie)', desc:'Peut se spécialiser dans une école, gagnant un emplacement supplémentaire par niveau au prix d\'écoles interdites.' },
      { icon:'🐱', name:'Familier', desc:'Peut appeler un familier magique conférant des bonus passifs (ex: chat +2 Promenade Silencieuse).' },
      { icon:'✏', name:'Copier des sorts', desc:'Peut copier des parchemins ou d\'autres grimoires pour enrichir le sien (coût en or et temps).' },
      { icon:'🎓', name:'Dons de scribe de parchemins', desc:'Don gratuit Scribe Scroll au niv.1.' },
      { icon:'🌟', name:'Dons bonus', desc:'Dons de métamagie ou création d\'objets aux niveaux 5, 10, 15, 20.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Grimoire, Familier, Scribe Scroll (don gratuit), Sorts niv.1' },
      { level:3,  text:'Sorts niv.2' },
      { level:5,  text:'Sorts niv.3, Don de bonus (métamagie ou création)' },
      { level:7,  text:'Sorts niv.4' },
      { level:9,  text:'Sorts niv.5' },
      { level:11, text:'Sorts niv.6' },
      { level:13, text:'Sorts niv.7' },
      { level:15, text:'Sorts niv.8, Don de bonus' },
      { level:17, text:'Sorts niv.9' },
      { level:20, text:'Don de bonus' },
    ],
    spellcastingInfo: { ability:'INT', prep:true, spellbook:true, spontaneous:false,
      note:'Doit étudier son grimoire 1 heure chaque matin. Peut apprendre tout sort arcanique. Nécessite un score d\'Intelligence de 10 + niveau du sort minimum.' },
    specialMechanics: [
      { icon:'⭐', name:'Spécialisation d\'école', desc:'Une école choisie. +1 emplacement de sort par niveau pour l\'école choisie. Deux écoles interdites (sauf Universal impossible à interdire).' },
    ],
    guideUrl: 'https://forums.giantitp.com/showthread.php?t=94774',
  },

  // ─── TOME OF BATTLE ─────────────────────────────────────────

  class_crusader: {
    descLong: `Le croisé est un guerrier divin initié aux arts martiaux mystiques de Devoted Spirit. Contrairement au paladin, sa connexion au divin se manifeste à travers des manœuvres martiales puissantes plutôt que des sorts. Sa mécanique de pool de dégâts retardés le rend exceptionnellement résistant en combat prolongé. Sa récupération aléatoire de manœuvres l\'oblige à une adaptabilité tactique unique.`,
    features: [
      { icon:'⚔', name:'Manœuvres et postures', desc:'Connaît un nombre croissant de manœuvres (coups spéciaux) et postures (états passifs permanents) des disciplines Devoted Spirit, Stone Dragon, White Raven.' },
      { icon:'🛡', name:'Pool de dégâts retardés', desc:'Une partie des dégâts reçus est retardée à la fin du round. Si le croisé n\'a pas agi, les dégâts retardés sont annulés.' },
      { icon:'🔄', name:'Récupération de manœuvres (aléatoire)', desc:'Chaque round au début de son tour, le croisé regagne aléatoirement une manœuvre dépensée. Encourage à dépenser toutes ses manœuvres.' },
      { icon:'✝', name:'Imposition des mains divine', desc:'Peut poser les mains pour soigner, à partir du niv.2.' },
    ],
    progressionHighlights: [
      { level:1,  text:'5 manœuvres connues, 4 manœuvres prêtes, 1 posture; Imposition des mains' },
      { level:4,  text:'8 manœuvres, Pool de dégâts retardés' },
      { level:8,  text:'12 manœuvres, 7 prêtes' },
      { level:12, text:'Accès aux manœuvres de niv.6' },
      { level:20, text:'18 manœuvres connues, 12 prêtes' },
    ],
    spellcastingInfo: null,
    specialMechanics: [
      { icon:'🎲', name:'Récupération aléatoire', desc:'Au début de chaque tour, si toutes les manœuvres sont dépensées, le croisé regagne 1d4+1 manœuvres aléatoires.' },
      { icon:'⏱', name:'Pool de dégâts retardés', desc:'Chaque hit retarde 50% des dégâts. À la fin du round, si le croisé a agit normalement, les dégâts retardés sont appliqués normalement. Sinon ils disparaissent.' },
    ],
    guideUrl: null,
  },

  class_warblade: {
    descLong: `La lame de guerre est le guerrier initié par excellence — un combattant qui a perfectionné ses techniques au point d\'atteindre un niveau quasi-mystique. Expert en Iron Heart, Tiger Claw, Diamond Mind et White Raven, il combine brutalité offensive et précision tactique. Sa récupération de manœuvres active (action rapide) lui donne un contrôle total sur son arsenal de combat.`,
    features: [
      { icon:'⚔', name:'Manœuvres et postures', desc:'Disciplines : Iron Heart (précision), Tiger Claw (brutalité), Diamond Mind (concentration), White Raven (commandement).' },
      { icon:'🔄', name:'Récupération active', desc:'Action rapide pour récupérer toutes ses manœuvres dépensées. Contrôle total de ses ressources.' },
      { icon:'🧠', name:'Concentration martiale', desc:'Peut utiliser Concentration pour améliorer ses attaques (Discipline Diamond Mind).' },
    ],
    progressionHighlights: [
      { level:1,  text:'5 manœuvres, 4 prêtes, 1 posture; Force du guerrier (+INT att)' },
      { level:6,  text:'Récupération active améliorée' },
      { level:12, text:'Manœuvres de niv.6' },
      { level:17, text:'Manœuvres de niv.9' },
    ],
    spellcastingInfo: null,
    specialMechanics: [
      { icon:'⚡', name:'Récupération active (Standard Action)', desc:'En sacrifiant une action standard, récupère toutes les manœuvres dépensées. Peut devenir action libre à haut niveau.' },
    ],
    guideUrl: null,
  },

  class_swordsage: {
    descLong: `Le sage de l\'épée est le plus mystique et mobile des initiés du Tome of Battle. Il puise dans les disciplines Shadow Hand, Desert Wind et Setting Sun — des techniques orientées furtivité, rapidité et manipulation. Sa capacité à récupérer ses manœuvres via une pleine concentration en fait le plus tactique des trois initiés.`,
    features: [
      { icon:'🌪', name:'Disciplines Shadow Hand, Desert Wind, Setting Sun', desc:'Manœuvres offensives combinant furtivité, mobilité et contres. Desert Wind : dégâts de feu. Setting Sun : retournements d\'attaque.' },
      { icon:'🔄', name:'Récupération par concentration', desc:'En se concentrant une action complète, récupère toutes ses manœuvres. Vulnérable pendant cette action.' },
      { icon:'🛡', name:'Bonus de sagesse à la CA', desc:'Niv.2. Ajoute SAG à la CA en armure légère.' },
      { icon:'⚡', name:'Frappe rapide', desc:'Peut attaquer comme action rapide avec certaines manœuvres.' },
    ],
    progressionHighlights: [
      { level:1,  text:'6 manœuvres, 4 prêtes, 1 posture; Vitesse +10 ft' },
      { level:2,  text:'+SAG à CA en armure légère' },
      { level:5,  text:'Évasion' },
      { level:9,  text:'Amélioration de l\'esquive' },
    ],
    spellcastingInfo: null,
    specialMechanics: [],
    guideUrl: null,
  },

  // ─── PSIONIQUE ───────────────────────────────────────────────

  class_psion: {
    descLong: `Le psion est l\'équivalent psionique du magicien — un utilisateur de pouvoirs mentaux qui les prépare depuis une liste fixe mais les lance via un pool de Points de Pouvoir. Sa discipline choisie (Clairsentience, Métacroyance, Psychocinétique, Psychométabolisme, Psychoportation, Télépathie) définit son accès aux pouvoirs et lui confère des capacités spéciales.`,
    features: [
      { icon:'🧠', name:'Points de pouvoir (PP)', desc:'Pool d\'énergie psionique dépensée pour manifester des pouvoirs. Se régénère après repos.' },
      { icon:'🎯', name:'Discipline psionique', desc:'Choisit une des 6 disciplines au niv.1. Accès préférentiel à cette discipline et capacité spéciale liée.' },
      { icon:'🌀', name:'Pouvoirs connus', desc:'Apprend un nombre croissant de pouvoirs de niv.1 à 9. Peut augmenter les pouvoirs (augmentation) en dépensant plus de PP.' },
    ],
    progressionHighlights: [
      { level:1,  text:'3 pouvoirs connus, PP selon discipline; Discipline choisie' },
      { level:5,  text:'Pouvoirs de niv.3; Bonus de don psionique' },
      { level:10, text:'Pouvoirs de niv.5' },
      { level:15, text:'Pouvoirs de niv.8' },
      { level:20, text:'Pouvoirs de niv.9; Maîtrise mentale' },
    ],
    spellcastingInfo: { ability:'INT', prep:false, spellbook:false, spontaneous:true,
      note:'Manifeste des pouvoirs psioniques en dépensant des Points de Pouvoir. La plupart des sorts arcaniques ont un équivalent psionique.' },
    specialMechanics: [
      { icon:'💡', name:'Augmentation', desc:'Peut dépenser des PP supplémentaires lors de la manifestation pour amplifier les effets d\'un pouvoir (plus de dégâts, plus de cibles, durée plus longue…).' },
    ],
    guideUrl: null,
  },

  // ─── WARLOCK ─────────────────────────────────────────────────

  class_warlock: {
    descLong: `Le démoniste est un utilisateur de magie arcane surnatural qui a conclu un pacte avec une entité puissante — démon, fée ou diable. Ses invocations fonctionnent comme des sorts mais sont utilisables à volonté, sans limite quotidienne. Son Eldritch Blast est une attaque à distance fiable qui évolue toute sa carrière. Il ne lance pas de sorts au sens traditionnel : toutes ses capacités sont des pouvoirs surnaturels.`,
    features: [
      { icon:'💥', name:'Eldritch Blast', desc:'Attaque à distance énergétique (1d6 par 2 niveaux). Modifiable par des Essences et Formes d\'invocation. Action standard, portée 60 ft.' },
      { icon:'👁', name:'Invocations', desc:'Pouvoirs surnaturels à volonté choisis parmi une liste croissante. Catégories : Moindres, Moindres ×, Supérieures, Sombres.' },
      { icon:'👿', name:'Détection magique (Detect Magic)', desc:'À volonté en permanence.' },
      { icon:'🛡', name:'Résistance au mal (Fiendish Resilience)', desc:'Récupère rapidement des blessures comme l\'Accélération du sort.' },
    ],
    progressionHighlights: [
      { level:1,  text:'Eldritch Blast 1d6, Détection magique, 2 invocations mineures' },
      { level:5,  text:'Eldritch Blast 3d6, Invocations de Lesser (niveau 3)' },
      { level:10, text:'Eldritch Blast 5d6' },
      { level:16, text:'Eldritch Blast 8d6, Invocations Sombres (Dark)' },
      { level:20, text:'Eldritch Blast 9d6' },
    ],
    spellcastingInfo: { ability:'CHA', prep:false, spellbook:false, spontaneous:true,
      note:'Pouvoirs surnaturels à volonté, pas des sorts. Ne peut pas être contresortilèges. Ignore les composantes matérielles et verbales dans certains cas.' },
    specialMechanics: [
      { icon:'♾', name:'À volonté sans limite', desc:'Contrairement aux autres lanceurs de sorts, le démoniste n\'a pas de limite journalière d\'utilisation de ses invocations et de son Eldritch Blast.' },
      { icon:'💥', name:'Essences et Formes', desc:'Les Essences modifient le type de dégâts de l\'Eldritch Blast. Les Formes modifient sa forme (cône, ligne, explosion…).' },
    ],
    guideUrl: null,
  },

  // ─── INCARNUM ────────────────────────────────────────────────

  class_incarnate: {
    descLong: `L\'incarnat est un utilisateur du système de magie Incarnum — une forme de magie basée sur des constructions d\'âme appelées mésoulas. Il façonne ces mésoulas et les lie à des points de chakra sur son corps pour obtenir des bonus. Sa ressource principale, l\'Essentia, peut être redistribuée librement entre ses mésoulas chaque tour, ce qui en fait un système de personnalisation dynamique.`,
    features: [
      { icon:'💠', name:'Mésoulas', desc:'Construit et équipe des mésoulas à des points de chakra. Chaque mésoula offre un type de bonus selon l\'Essentia investie.' },
      { icon:'⚡', name:'Essentia', desc:'Pool de points distribués dans les mésoulas en début de chaque tour. Redistribuable librement en action libre.' },
      { icon:'🌀', name:'Chakra binds', desc:'À haut niveau, peut lier une mésoula directement à un chakra pour des pouvoirs améliorés.' },
    ],
    progressionHighlights: [
      { level:1,  text:'2 mésoulas, 1 Essentia, Alignement soul' },
      { level:5,  text:'4 mésoulas, Chakra bind (Crown/Feet/Hands)' },
      { level:10, text:'6 mésoulas, Chakra bind (Arms/Brow/Shoulders)' },
      { level:15, text:'Chakra bind (Throat/Waist)' },
      { level:20, text:'Chakra bind (Heart)' },
    ],
    spellcastingInfo: null,
    specialMechanics: [
      { icon:'⚡', name:'Redistribution de l\'Essentia', desc:'Action libre au début du tour pour réassigner l\'Essentia entre les mésoulas. Crée un système de personnalisation dynamique.' },
    ],
    guideUrl: null,
  },
};
// ============================================================
const ACF_DB = {
  // ─── BARBARE ─────────────────────────────────────────────
  acf_whirling_frenzy:    { classId:'class_barbarian', nameFr:'Frénésie tourbillonnaire', nameEn:'Whirling Frenzy', source:'UA', levelReplaced:1, featureReplaced:'ca_rage', desc:'Remplace Rage. Attaque supplémentaire par round (−2 att.), +4 DEX instead of +4 STR/CON.' },
  acf_lion_totem:         { classId:'class_barbarian', nameFr:'Totem du lion',            nameEn:'Lion Totem',      source:'UA', levelReplaced:1, featureReplaced:'ca_rage', desc:'Remplace Rage. Charge sans pénalité CA + Pounce (attaque complète après charge).' },
  acf_berserker:          { classId:'class_barbarian', nameFr:'Berserk',                  nameEn:'Berserker',       source:'CW', levelReplaced:1, featureReplaced:'ca_rage', desc:'Variante de rage : +6 STR/CON mais restrictions mentales plus sévères.' },
  // ─── CLERC ───────────────────────────────────────────────
  acf_cloistered_cleric:  { classId:'class_cleric',    nameFr:'Clerc cloîtré',            nameEn:'Cloistered Cleric',source:'UA',levelReplaced:1, featureReplaced:'martial_proficiency', desc:'Perd armures/armes lourdes, gagne Lore, Scribe Scroll, bonus aux compétences de Connaissances.' },
  acf_divine_oracle:      { classId:'class_cleric',    nameFr:'Oracle divin',             nameEn:'Divine Oracle',   source:'CD', levelReplaced:1, featureReplaced:'heavy_armor', desc:'Remplace armures lourdes. Prophétie divine, bonus aux jets de sauvegarde.' },
  // ─── DRUIDE ──────────────────────────────────────────────
  acf_cityscape_druid:    { classId:'class_druid',     nameFr:'Druide citadin',           nameEn:'Urban Druid',     source:'UA', levelReplaced:1, featureReplaced:'wild_shape', desc:'Adapté au milieu urbain. Remplace Wild Shape par des capacités liées aux rues.' },
  acf_greenbound_druid:   { classId:'class_druid',     nameFr:'Druide lié au vert',       nameEn:'Greenbound Druid',source:'Lib3', levelReplaced:1, featureReplaced:'animal_companion', desc:'Compagnon animal remplacé par un être végétal animé.' },
  // ─── GUERRIER ─────────────────────────────────────────────
  acf_dungeon_crasher:    { classId:'class_fighter',   nameFr:'Casseur de donjon',        nameEn:'Dungeon Crasher', source:'DUNGEONSCAPE', levelReplaced:2, featureReplaced:'bonus_feat_2', desc:'Don bonus de niveau 2 remplacé par Dungeon Crasher: bâtons comme une porte, dégâts ×5 lors de bousculade.' },
  acf_zhentarim_soldier:  { classId:'class_fighter',   nameFr:'Soldat Zhentarim',         nameEn:'Zhentarim Soldier',source:'PHBII', levelReplaced:1, featureReplaced:'bonus_feat_1', desc:'Don bonus de niv 1 → Menace intimidante et +1 aux dégâts en groupe.' },
  // ─── PALADIN ─────────────────────────────────────────────
  acf_knight_chalice:     { classId:'class_paladin',   nameFr:'Chevalier du Calice',      nameEn:'Knight of the Chalice', source:'CD', levelReplaced:1, featureReplaced:'detect_evil', desc:'Remplace Détection du mal. Pouvoirs anti-démon, résistance à la possession.' },
  acf_paladin_of_freedom: { classId:'class_paladin',   nameFr:'Paladin de la liberté',    nameEn:'Paladin of Freedom', source:'UA', levelReplaced:1, featureReplaced:'code_of_conduct', desc:'Paladin chaotique bon. Remplace le code restrictif par une défense de la liberté individuelle.' },
  // ─── RÔDEUR ──────────────────────────────────────────────
  acf_ranger_dws:         { classId:'class_ranger',    nameFr:'Style combat 1 arme',      nameEn:'Single Weapon Fighting', source:'PHBII', levelReplaced:2, featureReplaced:'combat_style', desc:'Style combat 1 arme au lieu de 2 armes ou arc.' },
  // ─── ENSORCELEUR ──────────────────────────────────────────
  acf_fey_touched:        { classId:'class_sorcerer',  nameFr:'Touché des fées',          nameEn:'Fey-Touched',     source:'CompMage', levelReplaced:1, featureReplaced:'familiar', desc:'Familier remplacé par pouvoir féérique: Charme personne ou Sommeil amélioré 1×/jour.' },
  // ─── BARDE ───────────────────────────────────────────────
  acf_collector_stories:  { classId:'class_bard',      nameFr:'Collecteur d\'histoires',  nameEn:'Collector of Stories', source:'PHBII', levelReplaced:1, featureReplaced:'bardic_music_1', desc:'Remplace une musique bardique : bonus de compétence et connaissance des monstres.' },
};

// ============================================================
// GABARITS (TEMPLATES) — D&D 3.5
// ============================================================
const TEMPLATE_DB = {
  tpl_half_dragon: {
    id:'tpl_half_dragon', nameFr:'Demi-dragon', nameEn:'Half-Dragon', source:'MM', la:3,
    sizeChange:null, typeChange:'Dragon', subtypeAdded:[],
    abilityMods:{STR:8,CON:2},
    naturalArmorBonus:4,
    specialAbilities:['Immunité au souffle draconique (type variable)','Ténèbres parfaites ou Vision dans l\'obscurité 18m','Vol 2×vitesse de base (manœuvrabilité mauvaise)','Attaque de griffes (1d4 pour créature M) + Attaque de morsure'],
    desc:'Personnage croisé avec un dragon. Puissance draconique et immunité élémentaire selon le dragon parent.',
    prerequisites:'Doit être vivant, non-mort ou construction sans vie.',
  },
  tpl_half_celestial: {
    id:'tpl_half_celestial', nameFr:'Demi-céleste', nameEn:'Half-Celestial', source:'MM', la:4,
    sizeChange:null, typeChange:null, subtypeAdded:['Extraplanaire'],
    abilityMods:{STR:2,DEX:2,CON:2,INT:2,WIS:2,CHA:4},
    naturalArmorBonus:1,
    specialAbilities:['Vol (2× vitesse, bonne manœuvrabilité)','Résistance acide/froid/électricité 10','DR 5/magie','RM = NV+11 (min 13)','Immunité aux maladies','Sorts innés divins selon le niveau (Protection du Bien, Bénédiction, Aide, Délivrer des afflictions…)','Lumière permanente'],
    desc:'Descendant d\'un être céleste. Ailes, résistances protectrices, accès limité à la magie divine.',
    prerequisites:'Aucun',
  },
  tpl_half_fiend: {
    id:'tpl_half_fiend', nameFr:'Demi-fiélon', nameEn:'Half-Fiend', source:'MM', la:4,
    sizeChange:null, typeChange:null, subtypeAdded:['Extraplanaire'],
    abilityMods:{STR:4,DEX:4,CON:2,INT:4,WIS:2,CHA:2},
    naturalArmorBonus:1,
    specialAbilities:['Ailes (Vol 2× vitesse, manœuvrabilité moyenne)','Résistance acide/froid/feu/électricité 10','DR 5/magie','RM = NV+11 (min 13)','Immunité au poison','Ténèbres (à volonté)','Sorts innés maléfiques (Ombres obscurcissantes, Empoisonnement, Contagion…)'],
    desc:'Descendant d\'un fiélon. Traits maléfiques, résistances infernales et sorts ténébreux innés.',
    prerequisites:'Aucun',
  },
  tpl_celestial: {
    id:'tpl_celestial', nameFr:'Céleste', nameEn:'Celestial Creature', source:'MM', la:0,
    sizeChange:null, typeChange:null, subtypeAdded:['Extraplanaire'],
    abilityMods:{INT:2,WIS:2,CHA:2},
    naturalArmorBonus:1,
    specialAbilities:['RM = NV+5','DR 5/mal ou 10/mal (selon DV)','Résistance acide/froid/électricité 10','Smite Evil (1×/jour, +DV dégâts)'],
    desc:'Créature d\'un plan bon. Habituellement utilisé pour les créatures invoquées, pas les PJ.',
    prerequisites:'Uniquement pour créatures BBA ≥ 1 ou à la discrétion du DM.',
  },
  tpl_fiendish: {
    id:'tpl_fiendish', nameFr:'Fiélon', nameEn:'Fiendish Creature', source:'MM', la:0,
    sizeChange:null, typeChange:null, subtypeAdded:['Extraplanaire'],
    abilityMods:{INT:2,WIS:2},
    naturalArmorBonus:1,
    specialAbilities:['RM = NV+5','DR 5/bien ou 10/bien','Résistance feu/froid 10','Smite Good (1×/jour)'],
    desc:'Créature d\'un plan mauvais. Principalement pour créatures invoquées ou PJ avec permission DM.',
    prerequisites:'Uniquement pour créatures BBA ≥ 1 ou à la discrétion du DM.',
  },
  tpl_vampire: {
    id:'tpl_vampire', nameFr:'Vampire', nameEn:'Vampire', source:'MM', la:8,
    sizeChange:null, typeChange:'Mort-vivant', subtypeAdded:['Augmenté'],
    abilityMods:{STR:6,DEX:4,INT:2,WIS:2,CHA:4},
    naturalArmorBonus:6,
    specialAbilities:['Immunité mort-vivant (charme, poison, sommeil, maladies, états liés à la constitution)','DR 10/argent et magie','Résistances froid/électricité 10','RM = NV+5','Vol (forme de nuage ou chauve-souris)','Drainer les niveaux (toucher énergisant)','Charme regard','Domination','Régénération 5 (sauf feu, acide, dégâts sacrés)','Faiblesse : soleil, eau courante, pieux de bois'],
    desc:'Mort-vivant puissant aux capacités de domination et drain. LA+8 exige un groupe puissant.',
    prerequisites:'Créature humanoïde ou monstrueuse-humanoïde uniquement. Alignement non recommandé bon.',
  },
  tpl_werewolf: {
    id:'tpl_werewolf', nameFr:'Loup-garou', nameEn:'Werewolf', source:'MM', la:2,
    sizeChange:null, typeChange:null, subtypeAdded:['Lycanthrope'],
    abilityMods:{STR:2,DEX:2,CON:4},
    naturalArmorBonus:2,
    specialAbilities:['Formes : humaine, hybride, loup','Morsure infectieuse (lycanthropie)','Contrôle en forme hybride/loup','Odorat amélioré','Immunité au froid'],
    desc:'Lycanthrope loup. Transformations et morsure infectieuse. LA+2 relativement abordable.',
    prerequisites:'Humanoïde ou humanoïde monstrueux, taille M ou P.',
  },
};

// ============================================================
// CALCUL ECL — Effective Character Level
// ============================================================

// ============================================================
// CAPACITÉS DE CLASSE — Référentiel SRD D&D 3.5
// ============================================================
// Types : "active_limited" = X/jour | "active_toggle" = on/off | "passive" = toujours actif
// resource: { max: formule string, per: "day/encounter/rest" }
const CLASS_ABILITIES_DB = {
  // ─── BARBARE ─────────────────────────────────────────────
  ca_rage: {
    classId: "class_barbarian",
    name: "Rage",
    type: "active_toggle",
    category: "combat",
    resource: { per: "day", formulaKey: "rage_uses" },
    minLevel: 1,
    desc: "Frénésie de combat. +4 Force, +4 Constitution, +2 moral aux Vigueur, -2 CA. Dure 3 rounds + mod CON. Effets : +2 dégâts, +2 PV temp., -2 CA. Fatigué après.",
    source: "SRD PHB",
    effects: [
      { target: "STR", bonusType: "morale", value: 4 },
      { target: "CON", bonusType: "morale", value: 4 },
      { target: "save_fortitude", bonusType: "morale", value: 2 },
      { target: "save_will", bonusType: "morale", value: 2 },
      { target: "AC", bonusType: "morale", value: -2 }
    ],
    mechanic: "Max utilisations/jour = 1 (+1 par tranche de 4 niveaux de Barbare au-delà du 1er). Durée : 3 rounds + mod CON (calculé APRÈS le bonus de rage). Fatigué pendant 2× la durée de rage ensuite.",
    formula: "Utilisations = 1 + floor((barbLvl-1)/4)"
  },
  ca_greater_rage: {
    classId: "class_barbarian",
    name: "Rage supérieure",
    type: "active_toggle",
    category: "combat",
    resource: { per: "day", formulaKey: "rage_uses" },
    minLevel: 11,
    desc: "+6 Force, +6 Constitution, +3 moral aux Vigueur et Volonté, -2 CA.",
    source: "SRD PHB",
    effects: [
      { target: "STR", bonusType: "morale", value: 6 },
      { target: "CON", bonusType: "morale", value: 6 },
      { target: "save_fortitude", bonusType: "morale", value: 3 },
      { target: "save_will", bonusType: "morale", value: 3 },
      { target: "AC", bonusType: "morale", value: -2 }
    ],
    mechanic: "Remplace la Rage normale à partir du niveau 11 de Barbare.",
    formula: "Même calcul d'utilisations que Rage"
  },
  ca_indomitable_will: {
    classId: "class_barbarian",
    name: "Volonté indomptable",
    type: "passive",
    category: "defense",
    minLevel: 14,
    desc: "+4 bonus de morale aux jets de Volonté contre les sorts d'enchantement PENDANT la rage.",
    source: "SRD PHB",
    mechanic: "Passif. S'active automatiquement pendant la Rage."
  },
  ca_tireless_rage: {
    classId: "class_barbarian",
    name: "Rage infatigable",
    type: "passive",
    category: "defense",
    minLevel: 17,
    desc: "Plus de fatigue après la Rage.",
    source: "SRD PHB",
    mechanic: "Passif. Annule la pénalité de fatigue post-rage."
  },
  ca_mighty_rage: {
    classId: "class_barbarian",
    name: "Rage dévastatrice",
    type: "active_toggle",
    category: "combat",
    resource: { per: "day", formulaKey: "rage_uses" },
    minLevel: 20,
    desc: "+8 Force, +8 Constitution, +4 moral aux JS, -2 CA.",
    source: "SRD PHB",
    effects: [
      { target: "STR", bonusType: "morale", value: 8 },
      { target: "CON", bonusType: "morale", value: 8 },
      { target: "save_fortitude", bonusType: "morale", value: 4 },
      { target: "save_will", bonusType: "morale", value: 4 },
      { target: "AC", bonusType: "morale", value: -2 }
    ],
    mechanic: "Remplace la Rage supérieure au niveau 20."
  },
  ca_uncanny_dodge: {
    classId: "class_barbarian",
    name: "Esquive instinctive",
    type: "passive",
    category: "defense",
    minLevel: 2,
    desc: "Conserve le bonus DEX à la CA même pris au dépourvu ou face à un adversaire invisible.",
    source: "SRD PHB",
    mechanic: "Passif automatique."
  },
  ca_damage_reduction: {
    classId: "class_barbarian",
    name: "Réduction de dégâts",
    type: "passive",
    category: "defense",
    minLevel: 7,
    desc: "RD 1/—. Augmente de 1 tous les 3 niveaux (DR 1/— nv7, 2/— nv10, 3/— nv13, 4/— nv16, 5/— nv19).",
    source: "SRD PHB",
    mechanic: "Formula: DR = floor((barbLvl - 4) / 3) max 5. Type /—.",
    formula: "DR = floor((barbLvl-4)/3) max 5"
  },

  // ─── CLERC ───────────────────────────────────────────────
  ca_turn_undead: {
    classId: "class_cleric",
    name: "Renvoi des morts-vivants",
    type: "active_limited",
    category: "divine",
    resource: { per: "day", formulaKey: "turn_uses" },
    minLevel: 1,
    desc: "Renvoie, détruit (bon) ou commande (mauvais) les morts-vivants. 3 + mod CHA utilisations/jour. Jet : 1d20 + mod CHA + 2 (Knowledge Religion si 5 rangs).",
    source: "SRD PHB",
    mechanic: "Utilisations = 3 + mod CHA. Jet de renvoi 1d20 + mod CHA vs DC (11 + modificateur du MJ). Dégâts : 2d6 + niveau clerc + mod CHA.",
    formula: "Utilisations = 3 + mod(CHA). Jet = 1d20+mod(CHA). Dégâts = 2d6+clericLvl+mod(CHA)"
  },
  ca_lay_on_hands_paladin: {
    classId: "class_paladin",
    name: "Imposition des mains",
    type: "active_limited",
    category: "divine",
    resource: { per: "day", formulaKey: "loh_uses" },
    minLevel: 2,
    desc: "Soigne un total de palLvl × mod CHA PV par jour. Peut aussi soigner les maladies (1 utilisation). Se soigne lui-même ou autrui.",
    source: "SRD PHB",
    mechanic: "Pool = palLvl × mod CHA PV/jour. Peut être divisé entre plusieurs soins.",
    formula: "Pool PV/jour = paladinLvl × mod(CHA)"
  },
  ca_smite_evil: {
    classId: "class_paladin",
    name: "Châtiment du Mal",
    type: "active_limited",
    category: "combat",
    resource: { per: "day", formulaKey: "smite_uses" },
    minLevel: 1,
    desc: "+mod CHA à l'attaque, +niveau Paladin aux dégâts contre une créature maléfique. Raté sur non-maléfique.",
    source: "SRD PHB",
    mechanic: "Utilisations = 1 + 1 par tranche de 5 niveaux. +mod(CHA) attaque, +palLvl dégâts.",
    formula: "Utilisations = 1+floor(palLvl/5). +mod(CHA) ATK, +palLvl DMG vs evil"
  },
  ca_divine_grace: {
    classId: "class_paladin",
    name: "Grâce divine",
    type: "passive",
    category: "defense",
    minLevel: 2,
    desc: "+mod CHA à tous les jets de sauvegarde.",
    source: "SRD PHB",
    mechanic: "Passif automatique. S'applique aux 3 JS.",
    formula: "+mod(CHA) tous JS"
  },
  ca_aura_of_courage: {
    classId: "class_paladin",
    name: "Aura de courage",
    type: "passive",
    category: "defense",
    minLevel: 3,
    desc: "Immunité à la peur. Les alliés à moins de 3m gagnent +4 moral aux jets contre la peur.",
    source: "SRD PHB"
  },

  // ─── DRUIDE ──────────────────────────────────────────────
  ca_wild_shape: {
    classId: "class_druid",
    name: "Forme sauvage",
    type: "active_toggle",
    category: "transform",
    resource: { per: "day", formulaKey: "wildshape_uses" },
    minLevel: 5,
    desc: "Transformation en animal. Durée illimitée/utilisation. Gagne les stats physiques de la forme, conserve INT/SAG/CHA et compétences. PV séparés en forme.",
    source: "SRD PHB",
    mechanic: "Utilisations = 1/jour nv5, +1/jour chaque 2 niveaux. Formes disponibles selon niveau (Petite/Moyenne nv5, Grande nv8, Minuscule nv11). Durée = 1h/niveau druide.",
    formula: "Utilisations = floor((druidLvl-3)/2) max selon niveau",
    subChoices: [
      { id: "ws_small", label: "Petite bête (Petite)",  minLevel: 5 },
      { id: "ws_medium",label: "Bête Moyenne",          minLevel: 5 },
      { id: "ws_large", label: "Grande bête",           minLevel: 8 },
      { id: "ws_tiny",  label: "Très Petite bête",      minLevel: 11 },
      { id: "ws_plant", label: "Plante (Moy/Grande)",   minLevel: 12 },
      { id: "ws_elemental", label: "Élémentaire (Petite)", minLevel: 16 }
    ]
  },
  ca_nature_sense: {
    classId: "class_druid",
    name: "Sens de la nature",
    type: "passive",
    category: "exploration",
    minLevel: 1,
    desc: "+2 bonus non typé aux tests de Connaissances (nature) et Survie.",
    source: "SRD PHB",
    mechanic: "Passif automatique."
  },
  ca_woodland_stride: {
    classId: "class_druid",
    name: "Marche forestière",
    type: "passive",
    category: "exploration",
    minLevel: 2,
    desc: "Se déplace à vitesse normale dans les terrains difficiles naturels, sans subir de dégâts ni pénalités.",
    source: "SRD PHB"
  },
  ca_venom_immunity: {
    classId: "class_druid",
    name: "Immunité aux venins",
    type: "passive",
    category: "defense",
    minLevel: 9,
    desc: "Immunité aux poisons naturels (araignée, serpent, etc.). Pas les poisons magiques.",
    source: "SRD PHB"
  },

  // ─── ROUBLARD ─────────────────────────────────────────────
  ca_sneak_attack: {
    classId: "class_rogue",
    name: "Attaque sournoise",
    type: "passive",
    category: "combat",
    minLevel: 1,
    desc: "+1d6 dégâts par tranche de 2 niveaux si la cible est privée de DEX ou flanquée. Ne s'applique pas aux morts-vivants, plantes, constructions, sans organes vitaux.",
    source: "SRD PHB",
    mechanic: "Dés = floor((rogueLvl+1)/2). Ne s'applique que si conditions réunies.",
    formula: "Dés = ceil(rogueLvl/2)d6 dégâts supp."
  },
  ca_evasion: {
    classId: "class_rogue",
    name: "Esquive totale",
    type: "passive",
    category: "defense",
    minLevel: 2,
    desc: "Si JS Réflexes réussi contre un sort permettant demi-dégâts, subis 0 dégâts à la place.",
    source: "SRD PHB"
  },
  ca_trapfinding: {
    classId: "class_rogue",
    name: "Recherche de pièges",
    type: "passive",
    category: "exploration",
    minLevel: 1,
    desc: "Peut utiliser Fouiller pour trouver des pièges magiques (DC ≥20). Seuls les roublards (et quelques classes) peuvent le faire.",
    source: "SRD PHB"
  },
  ca_uncanny_dodge_rogue: {
    classId: "class_rogue",
    name: "Esquive instinctive (Roublard)",
    type: "passive",
    category: "defense",
    minLevel: 4,
    desc: "Conserve le bonus DEX même pris au dépourvu. Ne peut être flanqué qu'à nv12+ (ou 4 niveaux supplémentaires d'adversaire).",
    source: "SRD PHB"
  },
  ca_special_ability: {
    classId: "class_rogue",
    name: "Aptitude spéciale",
    type: "passive",
    category: "special",
    minLevel: 10,
    desc: "Obtenu au nv10 et par intervalles. Choix parmi : Attaque sournoise améliorée, Maîtrise des armes, Esquive totale améliorée, Talent, etc.",
    source: "SRD PHB",
    mechanic: "Au choix à nv10, 13, 16, 19."
  },

  // ─── GUERRIER ─────────────────────────────────────────────
  ca_fighter_bonus_feat: {
    classId: "class_fighter",
    name: "Don de combat supplémentaire",
    type: "passive",
    category: "special",
    minLevel: 1,
    desc: "Don supplémentaire à chaque niveau pair. Doit être un don de combat (liste Guerrier).",
    source: "SRD PHB",
    mechanic: "Niveaux : 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20."
  },
  ca_weapon_training: {
    classId: "class_fighter",
    name: "Maîtrise des armes",
    type: "passive",
    category: "combat",
    minLevel: 1,
    desc: "Maîtrise de toutes les armes de guerre et simples. Pas de malus de non-maîtrise.",
    source: "SRD PHB"
  },

  // ─── RÔDEUR ──────────────────────────────────────────────
  ca_favored_enemy: {
    classId: "class_ranger",
    name: "Ennemi favori",
    type: "passive",
    category: "combat",
    minLevel: 1,
    desc: "+2 bonus aux jets de dégâts et aux tests de Bluff, Écouter, Repérer, Survie contre le type d'ennemi choisi. +2 par tranche de 5 niveaux.",
    source: "SRD PHB",
    mechanic: "Choix à nv1, 5, 10, 15, 20. Bonus +2, puis +4, +6, etc.",
    formula: "+2 tous les 5 niveaux (max +10 au nv20)"
  },
  ca_wild_empathy: {
    classId: "class_ranger",
    name: "Empathie sauvage",
    type: "active_limited",
    category: "social",
    resource: { per: "encounter" },
    minLevel: 1,
    desc: "Améliorer l'attitude d'un animal comme une Diplomatie. Jet : 1d20 + niveau rôdeur + mod CHA.",
    source: "SRD PHB"
  },
  ca_camouflage: {
    classId: "class_ranger",
    name: "Camouflage",
    type: "passive",
    category: "exploration",
    minLevel: 13,
    desc: "Peut utiliser Se cacher dans les environnements naturels, même sans couverture.",
    source: "SRD PHB"
  },
  ca_swift_tracker: {
    classId: "class_ranger",
    name: "Pistage rapide",
    type: "passive",
    category: "exploration",
    minLevel: 8,
    desc: "Peut pister à vitesse normale sans -5 au jet. Peut pister à course avec -20.",
    source: "SRD PHB"
  },

  // ─── CLERC — CAPACITÉS DIVINES ────────────────────────────
  ca_divine_health: {
    classId: "class_paladin",
    name: "Santé divine",
    type: "passive",
    category: "defense",
    minLevel: 3,
    desc: "Immunité à toutes les maladies naturelles et magiques (y compris lycanthropie et maladie divine).",
    source: "SRD PHB"
  },
  ca_detect_evil: {
    classId: "class_paladin",
    name: "Détection du Mal",
    type: "active_toggle",
    category: "divine",
    resource: { per: "at_will" },
    minLevel: 1,
    desc: "Comme le sort Détection du Mal, à volonté. Concentration.",
    source: "SRD PHB"
  },
  ca_remove_disease: {
    classId: "class_paladin",
    name: "Guérison des maladies",
    type: "active_limited",
    category: "divine",
    resource: { per: "week", formulaKey: "rd_uses" },
    minLevel: 6,
    desc: "Comme le sort Guérison des maladies. Utilisations = 1/semaine par tranche de 3 niveaux au-delà du 3ème.",
    source: "SRD PHB",
    formula: "Utilisations = floor(palLvl/3)"
  },
  ca_special_mount: {
    classId: "class_paladin",
    name: "Monture spéciale",
    type: "active_toggle",
    category: "special",
    resource: { per: "day", formulaKey: "mount_hours" },
    minLevel: 5,
    desc: "Invocation d'une monture céleste liée. Dure 2h/niveau paladin/jour. Intelligence 6, parle avec le paladin.",
    source: "SRD PHB",
    formula: "Durée = 2×palLvl heures/jour"
  },
};

// Utilitaire : capacités disponibles selon les niveaux du personnage
// ============================================================
// BUFF_DB — Sorts officiels D&D 3.5 (avec types de cible & effets normalisés)
// ============================================================
// ui_target_type : self | creature_touched | item_weapon | item_armor_or_shield
//                  aoe_allies_centered_on_self | aoe_allies_and_enemies_centered_on_self
//                  multi_creatures_touched
// isSelfOnly : true = Target:You dans le PHB → ne peut JAMAIS être Tier Buff
// effects : tableau d'effets appliqués SI isSelf=true (sur la fiche perso)