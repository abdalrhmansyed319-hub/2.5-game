class_name FloraSpeciesData
extends Resource
## Typed production Resource definition for a VERDANT SIGNAL Flora Species.
## Mirrors the verified zero-inflation taxonomy in docs/concept/data/flora.json.

@export var id: StringName = &""
@export var scientific_name: String = ""
@export var common_name: String = ""
@export var category: StringName = &"ground_cover"
@export var habitat_biomes: PackedStringArray = PackedStringArray()
@export var edible: bool = false
@export var toxicity: StringName = &"none"
@export var primary_resource: StringName = &""
@export var weather_behavior: StringName = &""
@export var ecological_link: StringName = &""
@export var gameplay_mechanic: StringName = &""
@export var is_ecotype_variant: bool = false
@export var parent_species_id: StringName = &""
