class_name SingingReedwoodTree
extends StaticBody2D
## Exact AST-004 split-layer Singing Reedwood tree (48x80 trunk + canopy).
##
## Both TrunkSprite and CanopySprite share origin (24, 72) -> offset (0, -32).
## CanopySprite draws above Y-sorted actors (z_index = 20, z_as_relative = false)
## and fades smoothly to 0.38 alpha when Dr. Mara Lin walks behind it.

const CELL_WIDTH: float = 48.0
const CELL_HEIGHT: float = 80.0
const FADE_ALPHA: float = 0.38
const FADE_SPEED: float = 8.0

@export_range(0, 1) var tree_variant: int = 0

var _target_canopy_alpha: float = 1.0
var _overlapping_player: PlayerController = null

@onready var _shadow_sprite: Sprite2D = $ShadowSprite
@onready var _trunk_sprite: Sprite2D = $TrunkSprite
@onready var _canopy_sprite: Sprite2D = $CanopySprite
@onready var _fade_area: Area2D = $CanopyFadeArea


func _ready() -> void:
	_apply_variant_textures()
	_fade_area.body_entered.connect(_on_fade_area_body_entered)
	_fade_area.body_exited.connect(_on_fade_area_body_exited)


func _exit_tree() -> void:
	if _overlapping_player != null and is_instance_valid(_overlapping_player):
		_overlapping_player.notify_canopy_exited()
	_overlapping_player = null


func _process(delta: float) -> void:
	var current_alpha: float = _canopy_sprite.modulate.a
	if is_equal_approx(current_alpha, _target_canopy_alpha):
		return
	var next_alpha: float = move_toward(
		current_alpha,
		_target_canopy_alpha,
		FADE_SPEED * delta
	)
	_canopy_sprite.modulate = Color(1.0, 1.0, 1.0, next_alpha)


func set_variant(variant_index: int) -> void:
	tree_variant = clampi(variant_index, 0, 1)
	if is_node_ready():
		_apply_variant_textures()


func _apply_variant_textures() -> void:
	var tree_tex: Texture2D = AssetPaths.load_texture("AST-004")
	var row_y: float = float(tree_variant) * CELL_HEIGHT

	_trunk_sprite.texture = tree_tex
	_trunk_sprite.centered = true
	_trunk_sprite.offset = Vector2(0.0, -32.0)
	_trunk_sprite.region_enabled = true
	_trunk_sprite.region_rect = Rect2(0.0, row_y, CELL_WIDTH, CELL_HEIGHT)

	_canopy_sprite.texture = tree_tex
	_canopy_sprite.centered = true
	_canopy_sprite.offset = Vector2(0.0, -32.0)
	_canopy_sprite.region_enabled = true
	_canopy_sprite.region_rect = Rect2(CELL_WIDTH, row_y, CELL_WIDTH, CELL_HEIGHT)
	_canopy_sprite.z_as_relative = false
	_canopy_sprite.z_index = 20

	_shadow_sprite.texture = AssetPaths.load_texture("AST-007")
	_shadow_sprite.centered = true
	_shadow_sprite.offset = Vector2.ZERO
	_shadow_sprite.region_enabled = true
	_shadow_sprite.region_rect = Rect2(64.0, 0.0, 32.0, 32.0)


func _on_fade_area_body_entered(body: Node2D) -> void:
	if body is PlayerController and _overlapping_player == null:
		var player: PlayerController = body as PlayerController
		_overlapping_player = player
		_target_canopy_alpha = FADE_ALPHA
		player.notify_canopy_entered()


func _on_fade_area_body_exited(body: Node2D) -> void:
	if body is PlayerController and body == _overlapping_player:
		var player: PlayerController = body as PlayerController
		_overlapping_player = null
		_target_canopy_alpha = 1.0
		player.notify_canopy_exited()
