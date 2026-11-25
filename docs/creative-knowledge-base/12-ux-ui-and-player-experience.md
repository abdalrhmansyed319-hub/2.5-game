# 12 — UX/UI and Player Experience

> **Technical Bridge (Phase 1)**: Connects directly to [`KB-07 UI & UX Engineering`](../knowledge-base/07-ui-and-ux-engineering.md), [`Lab 08 Responsive UI Architecture`](../../labs/lab_08_responsive_ui_architecture/README.md) (Containers, AccessKit, Godot 4.7 `Control.offset_transform_*`).  
> **Scope**: UX vs. UI, information architecture, diegetic vs. non-diegetic HUD design, menu & flow ergonomics, inventory/dialogue/map/settings UX, multi-input navigation parity, accessibility, and clarity-first design (*Into the Breach* principles).

---

## 1. UX Is Everything the Player Perceives, Decides, and Feels

UI is the pixels and widgets on screen; **UX (User Experience)** is the complete cognitive and emotional journey of operating the game — from pressing Start, understanding what happened in combat, managing items, navigating menus with a controller, adjusting volume/subtitles, to knowing where to go next after a 3-day break.

### Five Laws of Exceptional Game UX
1. **Clarity Over Decoration (*Into the Breach* Principle)**: Every icon, number, and frame must earn its screen real estate. If a mechanic cannot be clearly communicated on screen, simplify the mechanic or redesign the indicator before shipping confusion.
2. **Zero-Click / Glanceable Critical Information**: Information needed *every second* (health/danger, stamina/ammo, active interaction prompt, current threat telegraph) must read instantaneously in peripheral vision without opening a menu.
3. **Progressive Disclosure**: Keep the default HUD quiet and clean; reveal detailed numbers, stat breakdowns, lore, and build comparisons cleanly on hover/focus/inspect (optional detail layer).
4. **Immediate Confirming Feedback**: Every button hover, focus shift, click, tab switch, purchase, equip, and invalid action must give immediate crisp visual + audio feedback (`Control.offset_transform_*` micro-response in Godot 4.7 + subtle UI SFX).
5. **Forgiveness & Reversibility**: Confirm destructive actions (Delete Save, Reset Defaults, Quit Unsaved); keep non-destructive navigation instant (zero "Are you sure you want to equip this?" spam!).

---

## 2. HUD Design: Diegetic, Spatial, and Minimalist Strategies

Choose the HUD integration model intentionally to match the game's identity:
- **Diegetic (In-World)**: State lives on the character or environment itself (e.g., lantern brightness, cracked armor, glowing weapon charge, physical signpost) -> maximum immersion, requires crystal-clear readability testing!
- **Spatial (World-Anchored Overlay)**: Contextual floating `[Interact]` prompts, enemy telegraph markers, subtle stagger/HP pips near damaged enemies -> keeps eyes glued to the action instead of darting to screen corners!
- **Non-Diegetic (Screen-Edge HUD)**: Corner bars, counters, minimap -> fast, conventional, zero ambiguity; keep pushed cleanly into safe-area margins (`MarginContainer`) with translucent/low-clutter framing so the playable center viewport breathes.
- **Dynamic / Contextual HUD**: Auto-fade static bars slightly when full and out of combat, smoothly popping back to 100% opacity the millisecond values change or danger enters.

---

## 3. Core Interface Archetypes — Best Practices

| Interface | Core Player Goal | Must-Have Ergonomics | Common Anti-Patterns to Avoid |
| --- | --- | --- | --- |
| **Main & Pause Menus** | Resume playing fast, manage saves/settings safely | `Continue` / `Resume` pre-focused at top; instant pause-in / pause-out; never bury `Settings` or `Quit` 4 submenus deep | Slow unskippable intro logos; losing gamepad focus when returning from submenus |
| **Inventory / Equipment** | Compare, equip, organize, and use items effortlessly | Side-by-side stat delta preview (`+4` green / `-2` red with directional arrows for colorblind clarity!), quick-equip/quick-transfer hotkeys, clear category tabs & sorting | Tedious drag-only grids broken on controllers; walls of unformatted text |
| **Dialogue UI** | Read comfortably at natural pace & choose clearly | Clean speaker identity (name + portrait/accent), 1–2 sentences per beat, fast text-reveal skip without accidentally skipping the whole box, clear highlighted choice focus | Auto-advancing dialogue faster than reading speed; tiny low-contrast text over bright backgrounds |
| **Map Interface** | Orient self, recall locked doors/mysteries, plan route | Distinct visual difference between explored vs. unexplored exits, optional player pins/markers, region names, clear current-location pulse | Cluttered icon vomit hiding actual spatial topology |
| **Settings Menu** | Tailor comfort, visuals, audio, and accessibility | Categorized tabs (Gameplay/Accessibility, Controls/Remapping, Audio [Master/Music/SFX/Voice sliders], Video [Display/VSync/Scale]); live immediate preview (e.g., sound test blip on SFX slider!) | Requiring game restart for audio/UI scale changes; missing subtitles or screen-shake toggles |

---

## 4. Multi-Input Parity & Inclusive Accessibility Design

- **Seamless Input Switching**: Automatically swap displayed button prompts (Keyboard/Mouse glyphs <-> Xbox/PlayStation/Switch controller glyphs) the moment input arrives from a new device; guarantee wrap-around focus loops (`Lab 08`) and zero soft-locked modals!
- **Accessibility Baseline**:
  - Scalable font sizes & high-contrast text backing boxes (minimum WCAG-grade luminance contrast >= 4.5:1 on body text).
  - Subtitles with speaker labels and optional directional sound captions for critical audio cues.
  - Colorblind-safe iconography (shape + value + label alongside hue).
  - Reduced-motion toggle (disabling camera shake, flashes, and UI bounce tweens — demonstrated in `Lab 08`).
  - AccessKit screen-reader metadata (`accessibility_name`, `accessibility_description`, `accessibility_live` in Godot 4.5–4.7).
