extends Node
## Minimal global session coordinator for VERDANT SIGNAL (Production V11.0).
##
## Architecture Rule (Phase 1 Tech KB-01): Keep autoloads strictly lean.
## Gameplay systems belong inside modular scene trees (systems/, world/, characters/),
## never stuffed into global singletons.

signal phase_changed(previous_phase: StringName, current_phase: StringName)
signal field_sample_recorded(feature_name: String, total_samples: int)
signal site_scanned(site_id: String, site_name: String)
signal insight_unlocked(insight_id: String, title: String, note: String)

const PROJECT_TITLE: String = "VERDANT SIGNAL"
const PLANET_DESIGNATION: String = "Oura-IV (Catalog K-419b)"
const PROTAGONIST_NAME: String = "Dr. Mara Lin"
const BASE_TILE_SIZE_PX: int = 16
const CHUNK_SIZE_TILES: int = 64
const DEFAULT_VIEWPORT_SIZE: Vector2i = Vector2i(640, 360)

var current_phase: StringName = &"boot_diagnostics"
var sampled_features: PackedStringArray = PackedStringArray()
var scanned_site_ids: PackedStringArray = PackedStringArray()
var sampled_site_ids: PackedStringArray = PackedStringArray()
var unlocked_insight_ids: PackedStringArray = PackedStringArray()


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


func record_scanned_site(site_id: String, site_name: String) -> bool:
	if site_id.is_empty() or scanned_site_ids.has(site_id):
		return false
	scanned_site_ids.append(site_id)
	site_scanned.emit(site_id, site_name)
	return true


func record_sampled_site(site_id: String, site_name: String) -> bool:
	if not site_id.is_empty() and not scanned_site_ids.has(site_id):
		scanned_site_ids.append(site_id)
	var is_new_id: bool = false
	if not site_id.is_empty() and not sampled_site_ids.has(site_id):
		sampled_site_ids.append(site_id)
		is_new_id = true
	var is_new_name: bool = record_field_sample(site_name)
	return is_new_id or is_new_name


func record_unlocked_insight(insight_id: String, title: String, note: String) -> bool:
	if insight_id.is_empty() or unlocked_insight_ids.has(insight_id):
		return false
	unlocked_insight_ids.append(insight_id)
	insight_unlocked.emit(insight_id, title, note)
	return true


func is_site_scanned(site_id: String) -> bool:
	return scanned_site_ids.has(site_id)


func is_site_sampled(site_id: String) -> bool:
	return sampled_site_ids.has(site_id)


func get_discovered_ids() -> PackedStringArray:
	var combined: PackedStringArray = scanned_site_ids.duplicate()
	for sid: String in sampled_site_ids:
		if not combined.has(sid):
			combined.append(sid)
	return combined


func get_sample_count() -> int:
	return sampled_features.size()


func get_discovered_count() -> int:
	return get_discovered_ids().size()


func get_insight_count() -> int:
	return unlocked_insight_ids.size()
