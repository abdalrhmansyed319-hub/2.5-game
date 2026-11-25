extends Node
## Minimal global session coordinator for VERDANT SIGNAL (Production Bootstrap).
##
## Architecture Rule (Phase 1 Tech KB-01): Keep autoloads strictly lean.
## Gameplay systems belong inside modular scene trees (systems/, world/, characters/),
## never stuffed into global singletons.

signal phase_changed(previous_phase: StringName, current_phase: StringName)

const PROJECT_TITLE: String = "VERDANT SIGNAL"
const PLANET_DESIGNATION: String = "Oura-IV (Catalog K-419b)"
const PROTAGONIST_NAME: String = "Dr. Mara Lin"
const BASE_TILE_SIZE_PX: int = 16
const CHUNK_SIZE_TILES: int = 64
const DEFAULT_VIEWPORT_SIZE: Vector2i = Vector2i(480, 270)

var current_phase: StringName = &"boot_diagnostics"


func set_phase(next_phase: StringName) -> void:
	if next_phase == current_phase:
		return
	var previous_phase: StringName = current_phase
	current_phase = next_phase
	phase_changed.emit(previous_phase, current_phase)
