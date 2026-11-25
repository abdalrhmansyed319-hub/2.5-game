# 09 — Game Systems Architecture

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`NavigationAgent2D/3D.xml`, `Resource.xml`, `FileAccess.xml`, `DirAccess.xml`, `HMACContext.xml`, `JSON.xml`).  
> **Scope**: Modular, genre-agnostic architecture patterns for Inventory, Equipment, Combat/Health, Interaction, Quests, Dialogue, Save/Load, Checkpoints, Achievements, Progression, Enemy AI, Navigation, Procedural Generation, Object Pooling, Events, and Game State Management.

---

## 1. Core Architectural Rule: Data, Logic, and Presentation Separation

Every major gameplay system follows a **3-layer separation**:
1. **Static Definition Layer (`Resource` blueprints)**: Immutable authored data (`ItemDefinition`, `SkillDefinition`, `QuestDefinition`, `EnemyProfile`) stored in `.tres` files.
2. **Runtime State & Logic Layer (Pure `RefCounted` models or modular `Node` components)**: Validates mutations, enforces invariants, emits typed signals (`changed`, `completed`, `damaged`), and serializes cleanly to/from dictionaries. **Zero UI or visual dependencies.**
3. **Presentation Layer (Visuals, Audio, UI Views)**: Listens to logic-layer signals to render sprites, HUD bars, animations, and sound effects.

---

## 2. Combat, Health, and Damage Architecture

### Decoupled Component Pipeline
Avoid burying damage math inside player/enemy scripts. Compose four focused pieces:
1. **`DamagePacket` (`RefCounted` DTO)**: `amount: float`, `damage_type: StringName`, `source: Node`, `knockback_vector: Vector2/3`, `is_critical: bool`, `hit_position: Vector2/3`.
2. **`HealthComponent` (`Node`)**: Owns `max_health`, `current_health`, invulnerability window (`invulnerability_timer`), damage modifier pipeline (resistances/armor hooks), signals (`damaged(packet, applied_amount)`, `healed(amount)`, `health_changed(current, max)`, `depleted()`).
3. **`Hitbox` (`Area2D/3D`, `monitoring = true`, `monitorable = false`)**: Carries a `DamagePacket` template and tracks per-swing hit targets (`_hit_registry: Array[Object]`) so one swing never hits the same hurtbox twice.
4. **`Hurtbox` (`Area2D/3D`, `monitoring = false`, `monitorable = true`)**: Receives hits, forwards them to its linked `HealthComponent` (with team/faction filtering), and emits `hit_received(packet)`.

*Why this wins*: Crates, destructible walls, bosses, traps, and players all reuse the exact same `HealthComponent` + `Hurtbox` with zero inheritance gymnastics!

---

## 3. Interaction System Architecture

- **`Interactable` component (`Area2D/3D`, `monitoring = false`, `monitorable = true`)**:
  - Properties: `prompt_text: String`, `priority: int`, `is_enabled: bool`, `requires_line_of_sight: bool`.
  - Methods: `can_interact(interactor: Node) -> bool`, `interact(interactor: Node) -> bool`.
  - Signals: `interacted(interactor: Node)`, `focused(interactor: Node)`, `unfocused(interactor: Node)`.
- **`Interactor` component (`Area2D/3D`, `monitoring = true`, `monitorable = false`)**:
  - Maintains overlapping candidates, periodically (or on overlap/movement change) scores candidates by `(priority, facing alignment, inverse distance, optional LOS raycast)`, tracks `_active_target`, emits `active_target_changed(previous, current)` for a decoupled UI prompt, and calls `interact()` on input.

---

## 4. Inventory & Equipment Architecture

- **`ItemDefinition` (`Resource`)**: `id: StringName`, `display_name: String`, `category: StringName`, `max_stack: int`, `weight: float`, `icon: Texture2D`, `tags: Array[StringName]`, optional `effects: Array[Resource]`.
- **`InventorySlot` (`RefCounted`)**: `item: ItemDefinition`, `quantity: int`, `instance_data: Dictionary` (for durability, enchantments, custom rolls — keeps `ItemDefinition` immutable!).
- **`InventoryContainer` (`RefCounted` or `Node`)**:
  - Fixed-slot array (`Array[InventorySlot]`) with atomic transactional methods (`can_add`, `add_item -> remainder`, `remove_item -> bool`, `move_or_swap`, `split_stack`, `count_item`, `total_weight`).
  - Emits granular signals (`slot_updated(index)`, `inventory_changed()`).
- **Equipment System**: Separate `EquipmentContainer` keyed by typed `SlotType` (`HEAD`, `BODY`, `MAIN_HAND`, etc.) validating `item.category` compatibility and exposing aggregated stat modifiers (`StatModifier` list) consumed by a `StatsComponent` (base + additive + multiplicative pipeline).

---

## 5. Quest, Dialogue, Progression, and Achievement Systems

### Quest System (Event-Driven State Graph)
- **`QuestDefinition` (`Resource`)**: `quest_id`, `title`, `objectives: Array[QuestObjectiveDef]`, `prerequisites`, `rewards`.
- **`QuestObjectiveDef` (`Resource`)**: Data-driven condition (`event_type: StringName`, `target_id: StringName`, `required_count: int`).
- **`QuestManager`**: Tracks active/completed/failed `QuestState` entries, listens to domain events (e.g., `entity_defeated`, `item_acquired`, `area_reached`), increments matching objective progress, and emits `quest_updated` / `quest_completed`.

### Dialogue System (Graph / Scripted Data)
- Represent dialogue as pure data (`DialogueGraph` resource or compiled JSON/DSL lines with `speaker_id`, `text_key` for localization, `conditions`, `choices`, and `actions`/`effects`).
- Keep `DialogueRunner` decoupled from UI: emits `line_displayed(line)`, `choices_presented(choices)`, `action_requested(action_id, params)`, `dialogue_finished()`.

### Achievements & Progression
- **Achievements**: Pure observer subscribing to domain counters/events (`StatsLedger`) and comparing thresholds against `AchievementDefinition` resources; decoupled platform backend adapter (Steam/local JSON).
- **Progression / Stats**: Never hardcode `damage = base + 5` across scripts. Use a `StatValue` calculator (`(base + flat_sum) * (1.0 + percent_sum) * multiplier_product`) with dirty-flag caching whenever modifiers are added/removed.

---

## 6. Enemy AI & Navigation Systems

### AI Architecture Spectrum (Pick Simplest That Fits!)
1. **Finite State Machine (FSM)**: Explicit states (`Idle`, `Patrol`, `Chase`, `Attack`, `Search`, `Return`, `Stagger`) with clean `enter()`, `exit()`, `physics_update(delta)` and explicit transition requests. Best default for 80% of game AI.
2. **Hierarchical FSM (HFSM)**: Groups shared transitions (e.g., `Alive` superstate handles `take_damage -> Stagger` / `death -> Dead` without duplicating transition logic in every substate).
3. **Behavior Trees (BT)**: Composable Selector/Sequence/Decorator/Action trees — shines when AI needs many prioritized contextual behaviors with dynamic interruption/re-evaluation.
4. **Utility AI**: Scores candidate actions by normalized response curves — shines for sims, squads, and emergent tactical agents.

### Perception & Steering Separation
- Separate **Perception** (`VisionSensor`: FOV dot product + range + occlusion `RayCast`, `HearingSensor`: radius/event listener, `MemoryStore`: last known position + suspicion decay timer) from **Decision** (FSM/BT) and **Locomotion** (`NavigationAgent2D/3D` + steering/velocity controller).
- **Navigation Best Practices (Godot 4.x)**:
  - Throttle `NavigationAgent.target_position` updates (e.g., every `0.15–0.25 s` or when target moves beyond threshold) — do NOT re-query pathfinding every physics frame for 50 enemies!
  - If `avoidance_enabled = true`, submit desired velocity via `agent.set_velocity(desired)` and apply movement inside the `velocity_computed(safe_velocity)` callback (not directly!).
  - Wait one physics frame after scene load before first path query (`NavigationServer` synchronizes maps on physics step!).

---

## 7. Save, Load, and Checkpoint Systems

### Security & Format Decision (CRITICAL!)
- **NEVER use `ResourceLoader.load()` on untrusted `.tres`/`.res` user save files in multiplayer/shared-save scenarios** — Godot `.tres` files can embed arbitrary executable GDScript (`GDScript` sub-resources)!
- **Recommended Safe Format**: Versioned **JSON** (or binary `FileAccess` / `var_to_bytes(data)` with `allow_objects = false`) + optional **`HMACContext` (SHA-256)** integrity check for tamper detection.
- **Schema Migration Pipeline**:
  - Store `"schema_version": int` at root.
  - Run pure sequential migrators (`v1 -> v2 -> v3`) on load before hydrating game state so old player saves never break across patches!
- **Atomic Crash-Safe Writes**:
  1. Write full payload to `user://saves/slot_0.sav.tmp` and call `file.flush()` / `file.close()`.
  2. Rotate existing `slot_0.sav` -> `slot_0.sav.bak` (backup).
  3. Atomically replace via `DirAccess.rename_absolute(tmp_path, final_path)`.
  4. On load, if primary file fails parsing/HMAC, transparently fall back to `.bak` and log a warning.
- **Checkpoints**: Lightweight in-memory snapshot (or quick-save trigger) storing player spawn anchor + dirty world delta flags (opened doors, collected pickups, defeated bosses — keyed by stable persistent IDs, NOT runtime NodePaths that break if nodes get renamed!).

---

## 8. Object Pooling, Procedural Generation, Event Systems, & Game State

- **Object Pooling**: Pre-allocate frequently spawned short-lived entities (projectiles, hit sparks, floating numbers). Enforce strict `on_acquire()` (reset transforms, velocity, health, `reset_physics_interpolation()`, enable process/visibility) and `on_release()` (zero velocity, disable collision deferred, `PROCESS_MODE_DISABLED`, hide) contracts!
- **Procedural Generation**: Always drive RNG from an explicit local **`RandomNumberGenerator`** instance with a logged `seed` (NEVER global `randi()`/`randf()`), ensuring 100% deterministic bug reproduction from a single seed string.
- **Game State Management & Scene Transitions**: Explicit top-level state coordinator (`BOOT` -> `TITLE` -> `LOADING` -> `PLAYING` -> `PAUSED` -> `TRANSITIONING`) owning `get_tree().paused`, input mode locking during transitions, and threaded level loading (`ResourceLoader.load_threaded_request`).
- **Event Systems**: Prefer direct typed signals between collaborating nodes; reserve a thin **Scoped EventBus** strictly for decoupled cross-domain broadcasts (e.g., `achievement_trigger`, `audio_stinger_requested`, `quest_world_event`).
