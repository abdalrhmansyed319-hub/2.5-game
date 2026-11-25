class_name DropPodClearing
extends Node2D
## Hero Landmark #1 (Drop-Pod Clearing) assembled from exact AST-006 regions.
##
## Verified AST-006 regions & centered offsets:
##   Drop-Pod:    Rect2(0, 0, 64, 48)   -> offset (0, -18)
##   Crate A:     Rect2(64, 0, 16, 16)  -> offset (0, -6)
##   Crate B:     Rect2(80, 0, 16, 16)  -> offset (0, -6)
##   Camp Tent:   Rect2(64, 16, 32, 32) -> offset (0, -12)
##   Skid Decal:  Rect2(0, 48, 64, 16)  -> offset (0, 0)

@onready var _skid_sprite: Sprite2D = $SkidDecalSprite
@onready var _pod_sprite: Sprite2D = $DropPodBody/PodSprite
@onready var _crate_a_sprite: Sprite2D = $CrateA/CrateASprite
@onready var _crate_b_sprite: Sprite2D = $CrateB/CrateBSprite
@onready var _tent_sprite: Sprite2D = $CampTentBody/TentSprite


func _ready() -> void:
	var atlas: Texture2D = AssetPaths.load_texture("AST-006")
	_configure_region(_skid_sprite, atlas, Rect2(0.0, 48.0, 64.0, 16.0), Vector2.ZERO)
	_configure_region(_pod_sprite, atlas, Rect2(0.0, 0.0, 64.0, 48.0), Vector2(0.0, -18.0))
	_configure_region(_crate_a_sprite, atlas, Rect2(64.0, 0.0, 16.0, 16.0), Vector2(0.0, -6.0))
	_configure_region(_crate_b_sprite, atlas, Rect2(80.0, 0.0, 16.0, 16.0), Vector2(0.0, -6.0))
	_configure_region(_tent_sprite, atlas, Rect2(64.0, 16.0, 32.0, 32.0), Vector2(0.0, -12.0))


func _configure_region(
	sprite: Sprite2D,
	tex: Texture2D,
	rect: Rect2,
	local_offset: Vector2
) -> void:
	sprite.texture = tex
	sprite.centered = true
	sprite.offset = local_offset
	sprite.region_enabled = true
	sprite.region_rect = rect
