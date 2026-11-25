# *VERDANT SIGNAL* — Production Godot 4 Project (`game/`)

> **Project Root**: `game/project.godot`  
> **Minimum Godot Feature Baseline**: **Godot `4.3+`** (`TileMapLayer`, 2D `physics_interpolation`, `AudioStreamInteractive` / `AudioStreamSynchronized`). Compatible cleanly with Godot `4.3`, `4.4`, `4.5`, `4.6`, and `4.7+` on Windows.  
> **Current Stage**: **Controlled Pre-Production Bootstrap** — ready for Windows Godot verification (`DDL-015`) and the **Stage 05 Visual & Streaming Prototype Gate** (`DDL-011` / `Deliverable Y`). No full game systems or mass assets have been implemented yet.

---

## Directory Architecture (Modular Feature-First Layout)

> **Why there is no separate top-level `scripts/` folder**: Following our Phase 1 Godot Engineering Standard (`docs/knowledge-base/01-godot-engine-architecture.md`), GDScript files are **co-located beside the scenes, resources, and domain modules they own** (`scenes/boot/`, `autoload/`, `resources/`, `characters/`, `systems/`, `world/`, `ui/`) instead of splitting `.tscn` and `.gd` across disconnected parallel trees.

| Folder | Role in Production |
| --- | --- |
| `autoload/` | Strictly lean global coordinators (`game_state.gd`, `audio_director.gd`) |
| `audio/` | `default_bus_layout.tres` (5-Tier Audio Bus Hierarchy + `CaveReverb` send) & future sound assets |
| `assets/` | Production pixel-art tilesets, spritesheets, icons (`icon.svg`), fonts — all gated by `tools/asset_inspector.py` & `Nearest` import rules |
| `characters/` | Dr. Mara Lin (`16×24` oblique 3/4 controller) and 4-state autonomous fauna actors |
| `resources/` | Typed Godot `Resource` schemas (`BiomeData`, `FloraSpeciesData`, `FaunaSpeciesData`, `WeatherEventData`) compiled from `docs/concept/data/*.json` |
| `scenes/` | Entry scenes (`scenes/boot/main.tscn` Windows environment diagnostics) & future main/menu/overlay compositions |
| `shaders/` | Pixel-art 1D LUT day/night color grading, wind sway, water reflections, and overscan smooth-camera shaders |
| `systems/` | Modular gameplay systems (3×3 chunk streaming, 4-state ecology, Acoustic Field Lens, Camp Synthesis Board, delta-save) |
| `tests/` | Automated Godot unit/integration checks & Stage 05/06 Windows `p99 < 14 ms` streaming benchmarks |
| `ui/` | Crisp high-res UI overlay (Field Codex, Open-Question Synthesis Board, subtle diegetic HUD) |
| `world/` | Continental Mosaic `64×64`-tile chunks, feathered Hero Landmark prefabs, and *Rimlands Awakening* Vertical Slice (`4×4` chunks) |

---

## Quick First-Run Check on Windows

1. Open **Godot 4.3+** Project Manager on Windows.
2. Click **Import** -> browse to `<repo-folder>/game/project.godot` -> click **Import & Edit**.
3. Wait for initial asset scan (`.godot/` generates locally and stays ignored by Git!).
4. Press **`F5`** to run `scenes/boot/main.tscn` — copy the printed telemetry from the **Output** dock (`GODOT VER`, `RENDERER`, `GPU`, `MONITOR`, `AUDIO BUS`) so we can lock your exact Windows baseline (`DDL-015`) before Stage 05!
