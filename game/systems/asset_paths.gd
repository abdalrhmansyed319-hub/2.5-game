class_name AssetPaths
extends RefCounted
## Central production asset registry resolving Milestone 01 assets (AST-001..AST-007)
## alongside approved V8.0 Living World environmental assets & unmodified Mara artwork.
##
## Temporary placeholders live strictly under res://assets/debug_placeholders/
## and NEVER count toward production visual completion.

const ASSET_IDS: PackedStringArray = [
	"AST-001",
	"AST-002",
	"AST-003",
	"AST-004",
	"AST-005",
	"AST-006",
	"AST-007",
]

const MARA_ORIG_IDLE_PATH: String = "res://assets/characters/player/mara_original/char_idle_88x88_8x4.png"
const MARA_ORIG_WALK_PATH: String = "res://assets/characters/player/mara_original/char_walking_88x88_8x4.png"
const MARA_ORIG_RUN_PATH: String = "res://assets/characters/player/mara_original/char_running_88x88_8x4.png"

const V80_REQUIRED_PATHS: PackedStringArray = [
	"res://assets/world/living_forest/sprites/v80_living_floor_2304x1536.png",
	"res://assets/world/living_forest/sprites/living_grass_tufts_24x24_6x8.png",
	"res://assets/world/living_forest/sprites/living_critters_12x12_4x3.png",
	"res://assets/world/living_forest/sprites/sunbeams_1152x768.png",
	"res://assets/world/living_forest/sprites/biolum_halo_64x64.png",
	"res://assets/world/living_forest/data/living_ecosystem_data.json",
	"res://shaders/foliage_sway.gdshader",
	"res://shaders/puddle_ripples.gdshader",
	"res://shaders/mara_natural_occlusion.gdshader",
	MARA_ORIG_IDLE_PATH,
	MARA_ORIG_WALK_PATH,
	MARA_ORIG_RUN_PATH,
]

const V90_REQUIRED_PATHS: PackedStringArray = [
	"res://assets/world/broken_shore/v90_broken_shore_floor_2304x1536.png",
	"res://assets/world/broken_shore/broken_shore_ecosystem_data.json",
	"res://assets/world/broken_shore/broken_shore_asset_catalog.json",
	"res://assets/world/broken_shore/sprites/meridian_wreck_hull.png",
	"res://assets/world/broken_shore/sprites/meridian_interior_bay.png",
	"res://assets/world/broken_shore/sprites/meridian_debris_cowling.png",
	"res://assets/world/broken_shore/sprites/meridian_cargo_crate.png",
	"res://assets/world/broken_shore/sprites/meridian_rescue_beacon.png",
	"res://assets/world/broken_shore/sprites/basalt_cliff_monolith.png",
	"res://assets/world/broken_shore/sprites/basalt_sea_stack.png",
	"res://assets/world/broken_shore/sprites/basalt_sea_stack_med.png",
	"res://assets/world/broken_shore/sprites/coastal_boulder_cluster.png",
	"res://assets/world/broken_shore/sprites/coastal_boulder_sm.png",
	"res://assets/world/broken_shore/sprites/coastal_driftwood_log.png",
	"res://assets/world/broken_shore/sprites/coastal_salt_shrub.png",
	"res://assets/world/broken_shore/sprites/coastal_salt_shrub_sm.png",
	"res://assets/world/broken_shore/sprites/coastal_succulent.png",
	"res://assets/world/broken_shore/sprites/coastal_succulent_sm.png",
	"res://assets/world/broken_shore/animated/coastal_grass_tufts_24x24_6x8.png",
	"res://assets/world/broken_shore/animated/amber_tide_kelp_48x40_4f.png",
	"res://assets/world/broken_shore/animated/ocean_surf_foam_64x48_8f.png",
	"res://assets/world/broken_shore/animated/coastal_fauna_24x20_4x2.png",
	"res://assets/world/broken_shore/animated/coastal_fx_decals_16x16_4x3.png",
	"res://shaders/coastal_ocean.gdshader",
]


static func get_production_path(asset_id: String) -> String:
	match asset_id:
		"AST-001":
			return "res://assets/characters/player/char_mara_lin_sheet.png"
		"AST-002":
			return "res://assets/world/tilesets/env_amber_coast_ground_tileset.png"
		"AST-003":
			return "res://assets/world/tilesets/env_singing_canopy_ground_tileset.png"
		"AST-004":
			return "res://assets/world/props/prop_singing_reedwood_tree_sheet.png"
		"AST-005":
			return "res://assets/world/flora/prop_rimlands_flora_sheet.png"
		"AST-006":
			return "res://assets/world/landmarks/prop_drop_pod_landmark_sheet.png"
		"AST-007":
			return "res://assets/vfx/fx_shadows_ripples_lens_sheet.png"
		_:
			return ""


static func get_placeholder_path(asset_id: String) -> String:
	match asset_id:
		"AST-001":
			return (
				"res://assets/debug_placeholders/"
				+ "debug_placeholder_char_mara_lin_sheet.png"
			)
		"AST-002":
			return (
				"res://assets/debug_placeholders/"
				+ "debug_placeholder_env_amber_coast_ground_tileset.png"
			)
		"AST-003":
			return (
				"res://assets/debug_placeholders/"
				+ "debug_placeholder_env_singing_canopy_ground_tileset.png"
			)
		"AST-004":
			return (
				"res://assets/debug_placeholders/"
				+ "debug_placeholder_prop_singing_reedwood_tree_sheet.png"
			)
		"AST-005":
			return (
				"res://assets/debug_placeholders/"
				+ "debug_placeholder_prop_rimlands_flora_sheet.png"
			)
		"AST-006":
			return (
				"res://assets/debug_placeholders/"
				+ "debug_placeholder_prop_drop_pod_landmark_sheet.png"
			)
		"AST-007":
			return (
				"res://assets/debug_placeholders/"
				+ "debug_placeholder_fx_shadows_ripples_lens_sheet.png"
			)
		_:
			return ""


static func resolve_path(asset_id: String) -> String:
	var prod_path: String = get_production_path(asset_id)
	if not prod_path.is_empty() and ResourceLoader.exists(prod_path):
		return prod_path
	return get_placeholder_path(asset_id)


static func load_texture(asset_id: String) -> Texture2D:
	var path: String = resolve_path(asset_id)
	if path.is_empty() or not ResourceLoader.exists(path):
		return null
	var res: Resource = ResourceLoader.load(path)
	if res is Texture2D:
		return res as Texture2D
	return null


static func load_texture_path(res_path: String) -> Texture2D:
	if res_path.is_empty() or not ResourceLoader.exists(res_path):
		return null
	var res: Resource = ResourceLoader.load(res_path)
	if res is Texture2D:
		return res as Texture2D
	return null


static func verify_v80_living_world_assets() -> PackedStringArray:
	var missing: PackedStringArray = PackedStringArray()
	for res_path: String in V80_REQUIRED_PATHS:
		if not ResourceLoader.exists(res_path) and not FileAccess.file_exists(res_path):
			missing.append(res_path)
	return missing


static func verify_v90_broken_shore_assets() -> PackedStringArray:
	var missing: PackedStringArray = PackedStringArray()
	for res_path: String in V90_REQUIRED_PATHS:
		if not ResourceLoader.exists(res_path) and not FileAccess.file_exists(res_path):
			missing.append(res_path)
	return missing


static func is_using_placeholder(asset_id: String) -> bool:
	var prod_path: String = get_production_path(asset_id)
	return prod_path.is_empty() or not ResourceLoader.exists(prod_path)


static func get_placeholder_count() -> int:
	var count: int = 0
	for asset_id: String in ASSET_IDS:
		if is_using_placeholder(asset_id):
			count += 1
	return count


static func get_total_tracked_assets() -> int:
	return ASSET_IDS.size()
