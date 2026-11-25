# Phase 3 Deliverable C — Complete Production Pipeline (Stages 01–10)

> **Purpose**: End-to-end professional game production workflow from initial user discovery through release preparation, with strict entry/exit gates, verification levels (`L1–L6`), and persistent memory updates at every stage.

---

## 1. Master 10-Stage Pipeline Overview

| Stage | Name | Primary Objective | Mandatory Exit Gate (Before Advancing) | Project Memory Docs Updated |
| --- | --- | --- | --- | --- |
| **01** | **Project Discovery** | Capture confirmed vision, perspective, platform, constraints, Godot version, and user preferences | User approves Discovery Summary (`[CONFIRMED]` vs. `[UNRESOLVED]` clear) | `01`, `19`, `20` |
| **02** | **Creative & Technical Concept** | Define Core Identity, USPs, Core Loop, Pillars, Scope, and explore 2–3 directions if open | User selects and locks core concept & scope boundaries | `01`, `03`, `13`, `14` |
| **03** | **Game Design Documentation** | Author living GDD + Creative Direction Document covering loop, mechanics, controls, world, UI, audio, accessibility | Living GDD approved as v1 baseline; Decision Logs active | `02`, `03`, `06`–`11`, `14` |
| **04** | **Asset & Resource Audit** *(Mandatory Gate)* | Programmatically (`asset_inspector.py`) & visually (`read_file`) catalog ALL user assets; verify scale, style, seams, gaps | Complete Asset Catalog (`05`) approved; missing asset plan agreed | `05`, `19` |
| **05** | **Technical Architecture** | Lock actual Godot version, folder layout, scene ownership, autoloads, signals, data resources, save/UI/audio/test specs | Technical Architecture (`04`) & Roadmap (`12`) signed off | `04`, `12`, `13` |
| **06** | **Prototyping (Greybox)** | Build minimal playable proof of Core Movement, Primary Verbs, Core Loop, Camera, and key feedback (zero excess polish) | Core loop proven fun/clear (`L5`/`L6` tested); major design risks retired | `08`, `15`, `16`, `18`, `20` |
| **07** | **Vertical Slice** | Deliver one representative finished section uniting gameplay, level, verified user assets, lighting, audio, UI, & target framerate | Vertical Slice hits studio quality bar across all disciplines & approved by user | `02`–`11`, `15`, `17`, `20` |
| **08** | **Full Production** | Expand rooms, enemies, progression, narrative, and content in disciplined dependency-ordered milestones | All scoped milestones implemented, integrated, and regression-checked | `06`–`12`, `15`–`18`, `20` |
| **09** | **Quality & Refinement** | Polish game feel, animations, level flow, squint-test readability, audio balance, difficulty curve, accessibility, & `p99` frames | Friction & weak beats removed; zero critical/high bugs; accessibility verified | `15`, `16`, `17`, `18`, `19` |
| **10** | **Release Preparation** | Final full-playthrough QA, clean export templates, save migration/corruption tests, settings/controls validation, release notes | Verified release checklist (`L6` where executable), honest known limitations | `15`–`20` |

---

## 2. Critical Stage Guardrails
- **Never skip Stage 04 (Asset Audit)** before designing real environments: building rooms on assumed tile dimensions or missing inner corners guarantees wasted rework.
- **Never mistake Stage 06 (Prototype) for Stage 07 (Vertical Slice)**: Prototypes validate *if the core mechanic feels good* using gray boxes; Vertical Slices prove *the real production quality bar and pipeline cost* using real assets, audio, UI, and lighting.
- **Never freeze Stage 03 (GDD) permanently**: The GDD is a living source of truth updated through explicit entries in `13-technical-decision-log.md` and `14-creative-decision-log.md` whenever playtesting teaches a better answer!
- **Never declare Stage 10 (Release Ready) without real evidence**: Every unverified platform, untested save path, or unprofiled level must be disclosed transparently in `19-known-limitations.md`.
