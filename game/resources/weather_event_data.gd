class_name WeatherEventData
extends Resource
## Typed production Resource definition for a VERDANT SIGNAL Dynamic Planetary Event.
## Mirrors docs/concept/data/weather.json.

@export var id: StringName = &""
@export var display_name: String = ""
@export var cadence_tag: StringName = &""
@export var affected_biomes: PackedStringArray = PackedStringArray()
@export_range(0.0, 120.0, 1.0) var telegraph_lead_seconds: float = 60.0
@export_multiline var gameplay_effect_summary: String = ""
@export_multiline var visual_audio_cue_summary: String = ""
