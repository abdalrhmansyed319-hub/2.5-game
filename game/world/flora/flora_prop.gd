class_name FloraProp
extends Node2D
## Starter Rimlands flora prop matching exact AST-005 4x4 (16x32) cell grid.
##
## Species indices map directly to AST-005 rows:
##   0 = Amber Tide-Kelp (4-frame animated sway @ 4 FPS)
##   1 = Mirror Glasswort (2 static variants)
##   2 = Sun-Drop Bulb (Col 0 Open Day / Col 1 Closed Night)
##   3 = Cordage Frond (2 static variants)

const CELL_WIDTH: float = 16.0
const CELL_HEIGHT: float = 32.0
const KELP_FPS: float = 4.0
const SCAN_HIGHLIGHT_DURATION: float = 1.4

const SPECIES_NAMES: PackedStringArray = [
	"Amber Tide-Kelp",
	"Mirror Glasswort",
	"Sun-Drop Bulb",
	"Cordage Frond",
]

@export_range(0, 3) var species_row: int = 0
@export_range(0, 1) var variant_col: int = 0

var _anim_time: float = 0.0
var _is_night: bool = false
var _scan_highlight_timer: float = 0.0
var _rustle_timer: float = 0.0
var _rustle_dir: float = 1.0

@onready var _shadow_sprite: Sprite2D = $ShadowSprite
@onready var _plant_sprite: Sprite2D = $PlantSprite


func _ready() -> void:
	add_to_group("scannable_flora")
	_anim_time = fmod(absf(global_position.x * 0.07 + global_position.y * 0.11), 4.0)
	_setup_sprites()
	_refresh_region()


func _process(delta: float) -> void:
	if species_row == 0:
		_anim_time += delta
		var frame_col: int = int(floor(_anim_time * KELP_FPS)) % 4
		_plant_sprite.region_rect = Rect2(
			float(frame_col) * CELL_WIDTH,
			0.0,
			CELL_WIDTH,
			CELL_HEIGHT
		)

	if _rustle_timer > 0.0:
		_rustle_timer = maxf(0.0, _rustle_timer - delta)
		var r_frac: float = _rustle_timer / 0.45
		var sway_px: float = sin(r_frac * 15.0) * 2.0 * r_frac * _rustle_dir
		_plant_sprite.offset = Vector2(roundf(sway_px), -14.0)
	elif _plant_sprite.offset.x != 0.0:
		_plant_sprite.offset = Vector2(0.0, -14.0)

	if _scan_highlight_timer > 0.0:
		_scan_highlight_timer = maxf(0.0, _scan_highlight_timer - delta)
		var pulse: float = _scan_highlight_timer / SCAN_HIGHLIGHT_DURATION
		_plant_sprite.modulate = Color(
			1.0 + 0.35 * pulse,
			1.0 + 0.45 * pulse,
			1.0 + 0.25 * pulse,
			1.0
		)


func trigger_proximity_rustle(push_dir: float) -> void:
	if _rustle_timer > 0.22:
		return
	_rustle_dir = 1.0 if push_dir >= 0.0 else -1.0
	_rustle_timer = 0.45


func configure(species_index: int, variant_index: int, night_state: bool = false) -> void:
	species_row = clampi(species_index, 0, 3)
	variant_col = clampi(variant_index, 0, 1)
	_is_night = night_state
	if is_node_ready():
		_refresh_region()


func set_night_mode(night_enabled: bool) -> void:
	if _is_night == night_enabled:
		return
	_is_night = night_enabled
	if species_row == 2 and is_node_ready():
		_refresh_region()


func trigger_acoustic_scan_response() -> String:
	_scan_highlight_timer = SCAN_HIGHLIGHT_DURATION
	return SPECIES_NAMES[species_row]


func _setup_sprites() -> void:
	_plant_sprite.texture = AssetPaths.load_texture("AST-005")
	_plant_sprite.centered = true
	_plant_sprite.offset = Vector2(0.0, -14.0)
	_plant_sprite.region_enabled = true

	_shadow_sprite.texture = AssetPaths.load_texture("AST-007")
	_shadow_sprite.centered = true
	_shadow_sprite.offset = Vector2.ZERO
	_shadow_sprite.region_enabled = true
	_shadow_sprite.region_rect = Rect2(32.0, 0.0, 32.0, 32.0)


func _refresh_region() -> void:
	var col: int = variant_col
	if species_row == 0:
		col = 0
	elif species_row == 2:
		col = 1 if _is_night else 0
	_plant_sprite.region_rect = Rect2(
		float(col) * CELL_WIDTH,
		float(species_row) * CELL_HEIGHT,
		CELL_WIDTH,
		CELL_HEIGHT
	)
