class_name AssetPaths
extends RefCounted
## Central Milestone 01 asset registry resolving production artwork vs clearly
## labeled temporary debug placeholders (AST-001 through AST-007).
##
## Every production path maps 1:1 to docs/asset-production/ASSET_REQUESTS.md.
## Temporary placeholders live strictly under res://assets/debug_placeholders/
## and NEVER count toward Stage 05 Visual Prototype Gate completion.

const ASSET_IDS: PackedStringArray = [
	"AST-001",
	"AST-002",
	"AST-003",
	"AST-004",
	"AST-005",
	"AST-006",
	"AST-007",
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
