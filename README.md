# My DnD 3.5 Way!
**by Durhock**

started march 2026

**V1 : its worked, but still on improvement ! **
> A standalone local D&D 3.5 companion tool  
> Un compagnon de table local pour D&D 3.5

---

## EN

## What is it?

**My DnD 3.5 Way!** is a standalone local tool built to make **D&D 3.5 actual play** more practical and less fragmented.

Playing D&D 3.5 often means juggling character sheets, spells, items, forum threads, PDFs, notes, and scattered rule references. This project was built to bring the most useful parts together in one place, in a tool that can be used locally, with no installation, no server, and no internet required.

## Current status

This project is **already functional and usable locally**, but it is still under **active development**.

Some modules are already stable in their V1 scope, while others are still being refined, cleaned up, or expanded over time. The goal is not to fake completeness, but to ship something genuinely useful for play and improve it step by step.

## What is currently included?

Current V1 scope includes:

- **Character sheet**: stats, AC, saves, HP, speed, combat basics
- **Build tools**: races, classes, feats, skills, progression support
- **Magic**: spellbook, prepared spells, active spell buffs
- **Inventory**: inventory management, equipped items, item effects on the sheet
- **Personal shop**: custom item handling
- **Abilities**: active and passive class abilities
- **SRD wiki**: in-app rules reference
- **Journal**: session notes and campaign tracking

## Project philosophy

This project follows a few simple principles:

- **Player-first**: the tool should help people play, not simulate all of D&D 3.5
- **Local-first**: no forced online dependency
- **Simple before exhaustive**: useful first, more advanced later
- **No fake automation**: if a rule is not fully handled, the tool should not pretend otherwise
- **Editable and practical**: free-text fallback matters when full automation is not appropriate

## Tech stack

- **Vanilla JavaScript / HTML / CSS**
- **No dependencies**
- **localStorage** for local saves
- **Single-file browser use**: open it locally and use it directly

```text
index.html          ← single entry point
app.js              ← initialization
js/
  core/             ← state, rules, storage, ui, calculations
  modules/          ← sheet, magic, inventory, build, abilities, wiki...
  data/             ← ITEM_DB, SPELL_DB, CLASS_DB, FEAT_DB, SKILL_DB...
assets/             ← fonts, icons
Architecture principles

The tool is structured around a few core ideas:

Data / instance / runtime separation

a definition in a database

an instance owned by the character

active effects applied at runtime

Centralized AppState

one local source of truth

No full rules engine

the app assists actual play, it does not try to simulate every rule interaction

Free-text fallback

when a rule or edge case is not fully structured, the tool should still remain usable

Data currently integrated

Current integrated data coverage includes:

Spells: PHB + full SRD reference base

Items: PHB, DMG, MIC

Classes: all standard D&D 3.5 PHB base classes

Feats: PHB + additional content

Skills: full SRD base

Races: standard PHB races

Wiki: core SRD rules reference

Current limits

This is important: the project is usable, but it is not presented as a complete rules engine. Current limits include:

no full combat simulation

no multiplayer in V1

some datasets are still being expanded or cleaned

some modules may still evolve structurally

some rule-heavy behaviors are intentionally assisted rather than fully automated

How to use
git clone https://github.com/YOUR_REPO/my-dnd-35-way.git
cd my-dnd-35-way
# then open index.html in your browser

No install. No server. No internet required.

Feedback / contributing

This is still a personal project in active construction.

Feedback, ideas, bug reports, and practical test returns are welcome.

Contact: durhock@gmail.com

Support

If you want to support the project, a Ko-fi link may be added here later.

Support is appreciated, but testing, feedback, and real-play usage already help a lot.

License

Code: MIT

SRD / OGL content: Open Game License v1.0a
