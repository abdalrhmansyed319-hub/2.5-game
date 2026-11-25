# Deliverable R — Available Tools and Capabilities Audit

> **Honesty Rule (Part 6)**: Every capability and limitation below was **directly probed and verified inside this live workspace environment** (`Linux x86_64`, 2 vCPUs, 3.8 GiB RAM) rather than assumed!

---

## 1. Verified Local Environment & CLI Capabilities

| Tool / Runtime | Verified Status | Exact Capabilities for Game Development | Verified Limitations |
| --- | --- | --- | --- |
| **`python3` (`3.11.2`) + stdlib (`json`, `sqlite3`, `csv`, `xml`, `zlib`)** | **PRESENT** (`/usr/bin/python3`) | Build fast zero-dependency data validators, JSON-to-Godot exporters, ecological graph checkers, procedural chunk simulators, Markdown doc generators | Cannot execute GDScript or render Godot scenes directly |
| **`/tmp/gdtools-venv` (`Pillow 13.0.0`, `gdtoolkit 4.5.0`)** | **INSTALLABLE & VERIFIED** (via allowlisted `pypi.org`) | Pixel-accurate PNG inspection, sprite/tileset analysis, WCAG contrast math, visual diagram/chunk PNG generation, `gdparse` AST & `gdlint` static linting | Non-persisted across container resets (fast 6-second reinstall via `pip` when needed) |
| **`convert` (ImageMagick)** | **PRESENT** (`/usr/bin/convert`) | Batch sprite-sheet slicing, color-depth quantization, palette extraction, contact-sheet stitching | CLI raster manipulation only; not an interactive pixel editor |
| **`node` / `npm` / `npx`** | **PRESENT** (`/usr/local/bin/node`) | Could power local web-based JSON species/biome browser/editor dashboards (served live via `start_process`!) | Unused so far; Python handles all current studio CLI/imaging tasks more cleanly |
| **`git` & `gh` + `rg` + `jq`** | **PRESENT** | Full branch/diff/history management, GitHub collaboration, lightning-fast code/JSON search & querying | Outbound network limited strictly to GitHub, npm, and PyPI allowlist |
| **Godot Official XML Reference (`/tmp/godot-ref`)** | **CLONABLE (`4.7.2-stable`, `816–837` XML classes depending on sparse modules)** | Exact class/method/property/constant/annotation static API auditing (`tools/verify_labs.py`) | Static symbol check ONLY — NOT a live runtime engine, and **does NOT indicate what Godot version is installed on the user's Windows machine!** |

---

## 2. Verified Agent-Level Multimodal & Research Capabilities

| Agent Capability | Verified Status | Direct Game-Dev Utility | Verified Limitations |
| --- | --- | --- | --- |
| **`read_file` (Multimodal Vision on PNG/JPG/WebP)** | **VERIFIED & USED** | Real visual inspection of tilesets, pixel seams, inner corners, 5-band palette squint tests, and chunk layouts (already caught & verified 8 real visual/design defects across Phases 2 & 4!) | Static frame inspection only — cannot evaluate 60 FPS motion smoothness |
| **`web_search` & `fetch_page`** | **VERIFIED & USED** | Primary GDC/CEDEC/developer research, Godot version migration checks, market/comparable game analysis | External research only; always separate verified facts from studio opinion |
| **`generate_image`** | **AVAILABLE** | Isolated moodboards or art-direction proof concepts (strictly when explicitly desired) | AI imagery is NOT crisp pixel-aligned production tilesets; must never mass-generate game assets |
| **`start_process`** | **AVAILABLE** | Can host interactive local browser tools (e.g., visual Flora/Fauna Database Explorer or Chunk Inspector web app) | For live web tools only; cannot run Godot desktop GUI |

---

## 3. Explicitly MISSING Capabilities (Hard Sandbox Boundaries)

| Missing Binary / Capability | Status | Concrete Production Impact & Workaround |
| --- | --- | --- |
| **`godot` / `godot4` Engine Binary** | **MISSING** *(release asset CDNs blocked by egress allowlist)* | **Zero `L5` Runtime Execution or `L6` Live Playtesting inside this container!** Must run live scenes, shaders, audio, and profiling on the user's host machine (or a Godot-installed CI runner). |
| **`aseprite` / Pixel Art GUI Editor** | **MISSING** | Hand-painted production pixel art & frame animation must be authored externally (e.g., Aseprite) and imported into our verified `tools/asset_inspector.py` + `read_file` QA pipeline! |
| **`ffmpeg` / Audio DAW** | **MISSING** | Audio mastering/transcoding happens externally; studio designs exact bus layouts, stems, and surface mappings cleanly for Godot import. |
| **`blender` / `graphviz` (`dot`)** | **MISSING** | Solved cleanly for 2D diagrams via our custom Pillow visualizers (`tools/ecosystem_visualizer.py`); no 3D modeling needed for our 2D Oblique 3/4 Pixel Art direction! |
