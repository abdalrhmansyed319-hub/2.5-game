# 07 — UI and UX Engineering

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`Control.xml`, `Container.xml`, `Theme.xml`, official GUI, Accessibility, and Godot 4.5–4.7 release docs).  
> **Scope**: Control hierarchy, anchors/offsets vs. Containers, responsive multi-aspect layouts, Themes & Fonts, focus/gamepad navigation, accessibility (AccessKit), UI animation (`offset_transform_*` in 4.7), and decoupled HUD/menu architecture.

---

## 1. Layout Foundations: Anchors/Offsets vs. Containers

Godot's GUI system (`Control` nodes) uses **two complementary layout models**:

1. **Anchors & Offsets (Direct Children of Non-Container Controls / CanvasLayer)**:
   - Anchors (`0.0` to `1.0`) pin edges proportionally to the parent rect (e.g., Top-Right HUD panel uses `anchor_left = 1.0`, `anchor_right = 1.0`, `grow_horizontal = GROW_DIRECTION_BEGIN`).
   - Offsets define pixel margins relative to those anchors.
   - Always use Anchor Presets (`Full Rect`, `Center`, `Bottom Wide`, etc.) rather than eyeballing fixed pixel coordinates!
2. **Containers (`VBoxContainer`, `HBoxContainer`, `GridContainer`, `MarginContainer`, `PanelContainer`, `CenterContainer`, `FlowContainer`, `AspectRatioContainer`, `ScrollContainer`, `SplitContainer`, `TabContainer`)**:
   - Containers automatically calculate and overwrite child `position` and `size` based on each child's **`custom_minimum_size`** and **`size_flags_horizontal` / `size_flags_vertical`** (`SIZE_SHRINK_BEGIN`, `SIZE_FILL`, `SIZE_EXPAND`, `SIZE_EXPAND_FILL`, `SIZE_SHRINK_CENTER`, `SIZE_SHRINK_END`).
   - **Golden Layout Rule**: Never manually position/resize a direct child of a `Container`! Use `MarginContainer` for padding, `PanelContainer` for auto-fitting backgrounds around content, `Control` spacers (`SIZE_EXPAND_FILL`) for alignment, and `Container` theme constants (`separation`) for spacing.
   - *Godot 4.6 Enhancement*: `SplitContainer` can now hold more than two children; `ScrollContainer`, `Tree`, and `ItemList` support visual scroll hints; `Control.pivot_offset_ratio` allows percentage-based scaling/rotation pivots (e.g., `Vector2(0.5, 0.5)` for center pivot without writing resize handlers!).

### Responsive Multi-Resolution & Aspect Ratio Strategy
- Verify `display/window/stretch/mode` (`canvas_items` default for new projects in Godot 4.7) and `stretch/aspect` (`expand` default in 4.7).
- Because `expand` widens/tallens the viewport on Ultrawide (21:9) or 16:10/Steam Deck screens:
  - Pin HUD corners via anchors (`MarginContainer` set to `Full Rect` with safe-area padding).
  - Center modals/menus inside `CenterContainer` or anchored center rects with sensible `custom_minimum_size` and `custom_maximum_size` (available on `Control` in Godot 4.7!).
  - Test every UI scene at 1280×720 (16:9), 1280×800 (16:10), 1920×1080, 2560×1080 (21:9), and 800×600 before marking it done.

---

## 2. Themes, StyleBoxes, and Typography

- **Single Project Theme Hierarchy**: Assign a base `Theme` resource in `Project Settings > GUI > Theme > Custom` (or on your UI root). Override specific components using **Theme Type Variations** (e.g., `PrimaryButton`, `DangerButton`, `HeaderLabel`, `MutedCaption`) rather than slapping per-node `theme_override_*` hacks onto 40 separate buttons!
- **StyleBoxes**:
  - `StyleBoxFlat`: Resolution-independent vector rounded corners, borders, drop shadows, anti-aliasing — zero texture memory.
  - `StyleBoxTexture`: 9-slice (`texture_margin_*`) stylized pixel/painted frames; set `axis_stretch_*` consciously (`STRETCH` vs `TILE`).
  - `StyleBoxEmpty`: Useful for invisible focus/padding boxes.
- **Fonts**:
  - Use dynamic `.ttf`/`.otf` fonts with MSDF (`multichannel_signed_distance_field`) for crisp scaled vector UI, or bitmap/non-antialiased pixel fonts at integer sizes for pixel-art UI.
  - Note: Godot 4.7 updated `ResourceImporterDynamicFont` default `hinting` from `1` to `3`.
  - Use `RichTextLabel` with BBCode enabled for inline icons, highlighted stats, and dialogue effects; remember Godot 4.7 added relative font-size image scaling in `RichTextLabel`.

---

## 3. Input Routing, `mouse_filter`, and Controller/Keyboard Focus

### `mouse_filter` Hygiene (Top Cause of "Unclickable UI" Bugs!)
- `MOUSE_FILTER_STOP (0)`: Consumes mouse events (buttons, clickable panels, modal blockers).
- `MOUSE_FILTER_PASS (1)`: Processes mouse events AND bubbles them up to parent controls.
- `MOUSE_FILTER_IGNORE (2)`: Completely transparent to mouse input. **ALWAYS set `MOUSE_FILTER_IGNORE` on decorative overlays, HUD root containers, Vignettes, Label overlays, and transition ColorRects when inactive**, otherwise they silently swallow mouse clicks meant for gameplay or underlying buttons!

### Input Consumption Order (Crucial!)
Godot dispatches `InputEvent` in strict order:
1. `_input(event)` (global, before UI — reserve for system hotkeys like fullscreen/screenshot/pause).
2. `Control._gui_input(event)` (UI controls consume clicks/nav keys and mark event handled via `accept_event()`).
3. `_shortcut_input(event)` (keyboard shortcuts).
4. `_unhandled_key_input(event)` -> `_unhandled_input(event)` (gameplay world clicks, camera drag, interact/attack actions).
**Rule**: Put gameplay click/key listeners in `_unhandled_input()` so clicking a HUD button never accidentally fires a weapon in the world behind it!

### Full Keyboard & Gamepad Navigation Architecture
- Configure standard UI actions (`ui_up`, `ui_down`, `ui_left`, `ui_right`, `ui_accept`, `ui_cancel`, `ui_focus_next`, `ui_focus_prev`) mapped cleanly to both keyboard and gamepad D-pad/stick/face buttons.
- Whenever a menu/modal opens, **explicitly call `first_control.grab_focus()`** (or restore the previously focused control on pop) so gamepad/keyboard users are never stranded with `null` focus!
- Wire explicit `focus_neighbor_top/bottom/left/right` (or wrap-around links on lists/grids) where Godot's geometric auto-neighbor heuristic can get confused (e.g., uneven grids, tabbed sidebars).
- Maintain a **UI Screen Stack** (`push_screen` / `pop_screen`) that saves/restores focus owner per screen and handles `ui_cancel` uniformly.

---

## 4. Accessibility Engineering (Godot 4.5–4.7)

Godot 4.5 integrated **AccessKit** screen-reader support natively on `Control` nodes (refined in 4.6–4.7 with `AccessibilityServer`):
- Populate `accessibility_name` and `accessibility_description` on icon-only buttons, sliders, and HUD indicators.
- Use `accessibility_labeled_by_nodes` / `accessibility_described_by_nodes` to associate labels with inputs, and `accessibility_live` (`AccessibilityServer.AccessibilityLiveMode` in 4.7) for live announcements (toast notifications, dialogue lines, critical warnings).
- Design for **colorblind safety** (never convey status via red/green color alone — pair with distinct icons, patterns, or labels), **scalable text/UI scale factor**, **remappable controls**, and **reduced motion** toggles (skipping UI shake/flash tweens).

---

## 5. UI Animation Without Fighting Containers (Godot 4.7 Game-Changer!)

Historically in Godot 4.0–4.6, animating a button's `position`, `rotation`, or `scale` inside a `VBoxContainer`/`GridContainer` broke whenever the container re-sorted, or caused hover-jitter when scaling shrank the button's hitbox out from under the mouse cursor.

**Godot 4.7 solved this natively with `Control` Offset Transforms** (verified `Control.xml`):
- `offset_transform_enabled: bool`
- `offset_transform_position: Vector2` / `offset_transform_position_ratio: Vector2`
- `offset_transform_rotation: float`
- `offset_transform_scale: Vector2`
- `offset_transform_pivot: Vector2` / `offset_transform_pivot_ratio: Vector2`
- `offset_transform_visual_only: bool` (defaults to `true` — animation never invalidates hover/mouse hit-testing!)

```gdscript
func animate_hover(btn: Control, hovered: bool) -> void:
	btn.offset_transform_enabled = true
	btn.offset_transform_pivot_ratio = Vector2(0.5, 0.5)
	var target_scale := Vector2(1.06, 1.06) if hovered else Vector2.ONE
	var tween := btn.create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(btn, "offset_transform_scale", target_scale, 0.1)
```
*(Fallback for pre-4.7 targets: wrap the animated visual inside a fixed-size `Control` container slot and animate the inner child.)*

---

## 6. Decoupled UI Architecture (HUD, Inventory, Dialogue)

- **Strict Unidirectional Data Flow (MVVM / Presenter Pattern)**:
  - Gameplay models (`HealthComponent`, `InventoryContainer`, `QuestTracker`, `DialogueRunner`) have **ZERO** references to `Control` nodes.
  - UI views subscribe to model signals (`health_changed`, `slot_changed`, `line_presented`) to update visuals, and invoke explicit command methods on controllers/models (`inventory.try_use_slot(idx)`, `dialogue.choose_option(idx)`).
  - Always guard UI binding with clean `bind(model)` / `unbind()` methods that disconnect old signals when switching targets or closing panels — preventing stale signal callbacks and ghost updates.
- **Avoid Per-Frame UI String Formatting**: Never rebuild `Label.text = "HP: %d / %d" % [...]` inside `_process()` every frame! Update labels **only** when the underlying value actually changes via signal.
