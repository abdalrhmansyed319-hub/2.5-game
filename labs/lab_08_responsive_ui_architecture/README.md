# Lab 08 — Responsive UI & Accessibility Architecture (Godot 4.7)

## 1. Objective
Build a responsive, multi-aspect-ratio, keyboard/gamepad-first UI harness utilizing Godot's Container layout model, strict `mouse_filter` hygiene, AccessKit `accessibility_name` properties (Godot 4.5+), automatic focus save/restore and wrap-around neighbor wiring, reduced-motion accessibility support, and Godot 4.7's container-safe `Control.offset_transform_*` micro-animations.

## 2. Technical Approach
- Construct layout purely with Containers (`MarginContainer -> CenterContainer -> PanelContainer -> MarginContainer -> VBoxContainer`) under a full-rect `Control` with `mouse_filter = MOUSE_FILTER_IGNORE` on wrapper containers so background input is never accidentally swallowed.
- Leverage Godot 4.7 `Control.offset_transform_enabled`, `offset_transform_visual_only = true`, `offset_transform_pivot_ratio = Vector2(0.5, 0.5)`, and `offset_transform_scale` so hover/focus scale tweens work natively inside `VBoxContainer` without fighting layout sorts or flickering mouse hit-tests!
- Track and cleanly disconnect all bound `Callable` callbacks and kill active `Tween` instances on `_exit_tree()`.
- Support `reduced_motion` toggle to immediately snap state without motion animations.

## 3. Architecture
```text
ResponsiveMenuView (Control, full-rect, MOUSE_FILTER_IGNORE)
└── SafeMargin (MarginContainer, 32px safe area)
    └── CenterAnchor (CenterContainer)
        └── PanelCard (PanelContainer, min_width = 320px)
            └── CardPadding (MarginContainer, 24px)
                └── ActionList (VBoxContainer, separation = 12px)
                    ├── TitleLabel
                    ├── PrimaryAction (Button, focus wrap <-> CloseAction)
                    ├── SecondaryAction (Button)
                    └── CloseAction (Button)
```

## 4. Implementation
- `responsive_menu_view.gd`: Controller handling focus stack restoration, wrap-around `focus_neighbor_top/bottom`, Godot 4.7 `offset_transform_scale` tweening, `ui_cancel` handling, and clean teardown.
- `responsive_menu_view.tscn`: Responsive container scene with AccessKit `accessibility_name` attributes and `NodePath` array bindings.

## 5. Testing Process
- **Code Written**: Complete (1 `.gd` script + 1 `.tscn` scene).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, Godot `4.7.2-stable` XML Class-Ref API checks (`Control.offset_transform_enabled`, `offset_transform_visual_only`, `offset_transform_pivot_ratio`, `offset_transform_scale`, `accessibility_name`, `focus_neighbor_top/bottom`), and `.tscn` structure validation.
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; planned tests verify 16:9 / 16:10 / 21:9 / 4:3 window resizing, keyboard/gamepad wrap-around focus navigation, focus restore on `close_menu()`, and zero orphan/tween errors on scene free).

## 6. Problems Encountered
- Bound `Callable`s created via `.bind()` are distinct `Callable` instances — disconnecting them requires storing the exact bound `Callable` references in `_bound_callbacks` rather than passing a fresh `.bind()` call during `_exit_tree()`.
- Keyboard focus + mouse hover can fire back-to-back on the same button; killing any existing active Tween per button instance ID (`_button_tweens[key]`) guarantees smooth non-fighting transitions.

## 7. Final Result
A clean, reusable Godot 4.7 UI screen pattern combining responsive layouts, full controller navigation, AccessKit metadata, and zero-jitter Container animations.

## 8. Possible Improvements
- Wrap inside a `UIScreenStack` coordinator managing multiple nested modal screens with automatic dimming backdrop and pause-mode synchronization.
- Extract visual styling into a shared project `Theme` resource with `ThemeTypeVariation` classes.
