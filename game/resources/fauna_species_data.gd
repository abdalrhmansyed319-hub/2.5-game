class_name FaunaSpeciesData
extends Resource
## Typed production Resource definition for a VERDANT SIGNAL Autonomous Fauna Species.
## Mirrors the 4-state readable ecology schema in docs/concept/data/fauna.json.

@export var id: StringName = &""
@export var scientific_name: String = ""
@export var common_name: String = ""
@export var ecological_role: StringName = &"herbivore"
@export var locomotion_type: StringName = &"terrestrial"
@export var social_structure: StringName = &"solitary"
@export var activity_window: StringName = &"diurnal"
@export var temperament: StringName = &"shy"
@export var is_legendary_keystone: bool = false
@export var habitat_biomes: PackedStringArray = PackedStringArray()
@export var diet_ids: PackedStringArray = PackedStringArray()
@export var weather_reaction: StringName = &""
@export var player_interaction: StringName = &""
@export var is_ecotype_variant: bool = false
@export var parent_species_id: StringName = &""
