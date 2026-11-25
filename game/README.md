# *VERDANT SIGNAL* — Production Godot 4 Project (`game/`)

> **Project Root**: `game/project.godot`  
> **Verified Windows Target Baseline**: **Godot `4.7.2-stable` (Official)** · **Windows** · **Intel HD Graphics 3000** (`1366×768 @ 60 Hz`) · **`GL Compatibility`** renderer (OpenGL 3 with automatic ANGLE fallback on OpenGL 3.1 GPUs).  
> **Current Stage**: **Controlled Pre-Production Bootstrap** — hardened for Godot `4.7.2` + `GL Compatibility`, ready for Stage 05 Visual & Streaming Prototype Gate. No full game systems or mass assets have been implemented yet.

---

## Conservative Graphics & Performance Baseline (Intel HD Graphics 3000 Minimum Spec)

Because Intel HD Graphics 3000 caps at **Direct3D 10.1 / OpenGL 3.1** on Windows (requiring Godot's `GL Compatibility` renderer with ANGLE translation), initial production obeys strict low-overhead 2D rules without compromising *VERDANT SIGNAL*'s painterly pixel-art identity:
- **Canvas & Pixel Purity**: Keep `480×270` native viewport (`960×540` `2×` preview window), `Nearest` texture filtering, `msaa_2d = 0`, `hdr_2d = false`, and pixel-snapped transforms/vertices.
- **Lightweight 2D Rendering First**: Prefer baked/painterly sprite craft, `CanvasModulate` + lightweight 1D LUT color grading, and simple UV wind/water shaders over expensive multi-pass post-processing.
- **Strict Restraint on Fill-Rate Traps**: Avoid unnecessary real-time `PointLight2D` / `LightOccluder2D` shadow passes, stacked full-screen alpha overlays, and dense particle clouds unless measured directly on Intel HD 3000 hardware.
- **Decoupled Simulation**: Keep physics, chunk streaming, and 4-state autonomous ecology timing independent of rendering frame rate.

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
