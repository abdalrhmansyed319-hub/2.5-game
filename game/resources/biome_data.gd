class_name BiomeData
extends Resource
## Typed production Resource definition for a VERDANT SIGNAL Core Biome.
## Mirrors the verified schema in docs/concept/data/biomes.json.

@export var id: StringName = &""
@export var display_name: String = ""
@export var macro_region: String = ""
@export_range(1, 4, 1) var tier: int = 1
@export var elevation_stratum: StringName = &"sea_level"
@export_range(0.0, 1.0, 0.01) var moisture: float = 0.5
@export var temperature_c: float = 20.0
@export var atmosphere_hazard: StringName = &"none"
@export var sub_biomes: PackedStringArray = PackedStringArray()
@export var adjacent_biome_ids: PackedStringArray = PackedStringArray()
@export var key_resources: PackedStringArray = PackedStringArray()

@export_group("5-Band Painterly Color Script")
@export var band1_sky: Color = Color(0.788, 0.863, 0.890, 1.0)
@export var band2_bg: Color = Color(0.494, 0.604, 0.635, 1.0)
@export var band3_ground: Color = Color(0.722, 0.604, 0.424, 1.0)
@export var band4_actor: Color = Color(0.125, 0.165, 0.212, 1.0)
@export var band5_signal: Color = Color(1.0, 0.420, 0.239, 1.0)
@export var water_tint: Color = Color(0.212, 0.494, 0.541, 1.0)
