extends Node
## Minimal global session coordinator for VERDANT SIGNAL (Production).
##
## Architecture Rule (Phase 1 Tech KB-01): Keep autoloads strictly lean.
## Gameplay systems belong inside modular scene trees (systems/, world/, characters/),
## never stuffed into global singletons.

signal phase_changed(previous_phase: StringName, current_phase: StringName)
signal field_sample_recorded(feature_name: String, total_samples: int)

const PROJECT_TITLE: String = "VERDANT SIGNAL"
const PLANET_DESIGNATION: String = "Oura-IV (Catalog K-419b)"
const PROTAGONIST_NAME: String = "Dr. Mara Lin"
const BASE_TILE_SIZE_PX: int = 16
const CHUNK_SIZE_TILES: int = 64
const DEFAULT_VIEWPORT_SIZE: Vector2i = Vector2i(640, 360)

var current_phase: StringName = &"boot_diagnostics"
var sampled_features: PackedStringArray = PackedStringArray()


func set_phase(next_phase: StringName) -> void:
	if next_phase == current_phase:
		return
	var previous_phase: StringName = current_phase
	current_phase = next_phase
	phase_changed.emit(previous_phase, current_phase)


func record_field_sample(feature_name: String) -> bool:
	if feature_name.is_empty() or sampled_features.has(feature_name):
		return false
	sampled_features.append(feature_name)
	field_sample_recorded.emit(feature_name, sampled_features.size())
	return true


func get_sample_count() -> int:
	return sampled_features.size()
