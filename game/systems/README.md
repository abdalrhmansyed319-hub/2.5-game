# `game/systems/` — Core Gameplay, Ecology & Streaming Systems

Planned Stage 05/06 modular production systems (`docs/concept/16-technical-feasibility-and-godot-architecture.md`):
- `chunk_streaming/` — `3×3` active `64×64`-tile threaded chunk loader (`ResourceLoader.load_threaded_request`).
- `ecology/` — Deterministic Chunk Ecological State Windows (`time_of_day × weather × conduct_delta`) & `4 Hz` staggered fauna scheduler.
- `science/` — 3-Tier Field Codex mastery, Acoustic Field Lens spectrum overlay, and Open-Question Synthesis Board engine.
- `survival/` — Exertion Stamina, Botanical Rations, Suit Environmental Envelope, and 4 situational afflictions.
- `save/` — Compact atomic delta-save architecture adapted from Phase 1 `labs/lab_07_save_load_system/`.
