class_name V7ImmersiveWorldStudy
extends Node2D
## VERDANT SIGNAL V7.0 — Isolated Immersive World Perspective & Scale Study
##
## Strictly isolated inside `game/assets/v7_immersive_world_study/` (.gdignore).
## Does NOT modify Milestone 01, project.godot, or production assets.
##
## Architecture Demonstrated (480x270 native pixel viewport, GL Compatibility):
##   - Plane 1 & 2 (z = -20): Oblique 600x310 biome ground + horizon vista
##   - Plane 3     (z =   0): YSortWorldLayer (y_sort_enabled = true) containing
##                            Dr. Mara Lin (28x40 native) + colossal Reedwood trunks
##                            (176x268 / 188x276), swamp root arches & tall reeds,
##                            and stratified coastal cliffs with foot-base colliders
##   - Plane 3b    (z = +15): Localized occlusion silhouette rim (only visible when
##                            Mara physically stands behind an overlapping structure)
##   - Plane 5     (z = +40): Camera-edge foreground framing foliage/reeds/rocks
##                            with gentle 1.14x–1.16x foreground parallax
##
## Controls:
##   WASD / Arrows : Move Dr. Mara Lin (walk in front of & behind giant trunks!)
##   1             : Mode A — Current M01 Distant Overhead Reference
##   2             : Mode B — Immersive Dense Forest (Singing Reedwood Cathedral)
##   3             : Mode C — Immersive Living Swamp (Mire of Whispering Roots)
##   4             : Mode D — Immersive Vast Coast (Amber Coast Leviathan Shore)
##   G             : Toggle Y-Sort Baselines & Trunk Collider Debug Overlay

const VIEW_W: float = 480.0
const VIEW_H: float = 270.0
const WALK_SPEED: float = 78.0
const SPRITE_DIR: String = "res://assets/v7_immersive_world_study/sprites/"
const SHADER_PATH: String = "res://assets/v7_immersive_world_study/godot_study/v7_occlusion_silhouette.gdshader"

const MODE_ORDER: PackedStringArray = ["m01", "forest", "swamp", "coast"]

const BIOME_CONFIGS: Dictionary = {
	"forest": {
		"title": "B. DENSE FOREST - SINGING REEDWOOD CATHEDRAL",
		"ground": "forest_ground.png",
		"spawn": Vector2(300.0, 244.0),
		"cam_offset_y": -88.0,
		"bounds": Rect2(98.0, 146.0, 404.0, 148.0),
		"rim_color": Color(0.55, 0.97, 0.94, 0.72),
		"props": [
			{"tex": "reedwood_a.png", "pos": Vector2(174.0, 184.0), "col": Vector2(24.0, 10.0), "layer": "ysort"},
			{"tex": "reedwood_b.png", "pos": Vector2(428.0, 188.0), "col": Vector2(26.0, 10.0), "layer": "ysort"},
			{"tex": "reedwood_b.png", "pos": Vector2(152.0, 238.0), "col": Vector2(28.0, 13.0), "layer": "ysort"},
			{"tex": "reedwood_a.png", "pos": Vector2(446.0, 234.0), "col": Vector2(28.0, 13.0), "layer": "ysort"},
			{"tex": "fg_canopy_left.png", "pos": Vector2(-34.0, -18.0), "parallax": 1.14, "layer": "fg"},
			{"tex": "fg_canopy_right.png", "pos": Vector2(334.0, -20.0), "parallax": 1.14, "layer": "fg"},
			{"tex": "fg_canopy_bot_left.png", "pos": Vector2(-38.0, 172.0), "parallax": 1.16, "layer": "fg"},
		],
	},
	"swamp": {
		"title": "C. LIVING SWAMP - MIRE OF WHISPERING ROOTS",
		"ground": "swamp_ground.png",
		"spawn": Vector2(274.0, 224.0),
		"cam_offset_y": -86.0,
		"bounds": Rect2(108.0, 146.0, 384.0, 140.0),
		"rim_color": Color(0.62, 0.99, 0.96, 0.72),
		"props": [
			{"tex": "swamp_root_reeds.png", "pos": Vector2(134.0, 204.0), "col": Vector2(30.0, 13.0), "layer": "ysort"},
			{"tex": "swamp_root_reeds_flip.png", "pos": Vector2(462.0, 222.0), "col": Vector2(30.0, 13.0), "layer": "ysort"},
			{"tex": "fg_swamp_reeds.png", "pos": Vector2(-24.0, 158.0), "parallax": 1.15, "layer": "fg"},
			{"tex": "fg_swamp_canopy_tl.png", "pos": Vector2(-34.0, -22.0), "parallax": 1.14, "layer": "fg"},
			{"tex": "fg_swamp_canopy_tr.png", "pos": Vector2(332.0, -22.0), "parallax": 1.14, "layer": "fg"},
		],
	},
	"coast": {
		"title": "D. VAST COAST - AMBER COAST LEVIATHAN SHORE",
		"ground": "coast_ground.png",
		"spawn": Vector2(372.0, 224.0),
		"cam_offset_y": -86.0,
		"bounds": Rect2(242.0, 132.0, 244.0, 156.0),
		"rim_color": Color(1.0, 0.88, 0.58, 0.72),
		"props": [
			{"tex": "coast_monolith.png", "pos": Vector2(522.0, 196.0), "col": Vector2(42.0, 20.0), "layer": "ysort"},
			{"tex": "coast_boulder.png", "pos": Vector2(454.0, 244.0), "col": Vector2(32.0, 12.0), "layer": "ysort"},
			{"tex": "coast_boulder_fg.png", "pos": Vector2(396.0, 218.0), "parallax": 1.15, "layer": "fg"},
		],
	},
}

var _current_mode: String = "forest"
var _facing_row: int = 1  # 0=down, 1=up, 2=right, 3=left
var _anim_t: float = 0.0
var _show_debug: bool = false
var _fg_entries: Array[Dictionary] = []
var _ysort_props: Array[Dictionary] = []
var _silhouette_mat: ShaderMaterial = null
var _world_bounds: Rect2 = Rect2(98.0, 146.0, 404.0, 148.0)

@onready var _ground_sprite: Sprite2D = $GroundSprite
@onready var _ysort_layer: Node2D = $YSortWorldLayer
@onready var _player: CharacterBody2D = $YSortWorldLayer/Player
@onready var _player_sprite: Sprite2D = $YSortWorldLayer/Player/BodySprite
@onready var _silhouette_sprite: Sprite2D = $YSortWorldLayer/Player/OcclusionSilhouetteSprite
@onready var _camera: Camera2D = $YSortWorldLayer/Player/Camera2D
@onready var _fg_layer: Node2D = $ForegroundFramingLayer
@onready var _hud_label: Label = $StudyHud/ModeLabel


func _ready() -> void:
	_setup_player_sprites()
	_load_mode("forest")


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var kev: InputEventKey = event as InputEventKey
		if not kev.pressed or kev.echo:
			return
		match kev.keycode:
			KEY_1:
				_load_mode("m01")
			KEY_2:
				_load_mode("forest")
			KEY_3:
				_load_mode("swamp")
			KEY_4:
				_load_mode("coast")
			KEY_G:
				_show_debug = not _show_debug
				queue_redraw()


func _physics_process(delta: float) -> void:
	if _current_mode == "m01":
		return
	var move_vec: Vector2 = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	_player.velocity = move_vec * WALK_SPEED
	_player.move_and_slide()
	_player.position.x = clampf(_player.position.x, _world_bounds.position.x, _world_bounds.end.x)
	_player.position.y = clampf(_player.position.y, _world_bounds.position.y, _world_bounds.end.y)

	if move_vec.length_squared() > 0.01:
		if absf(move_vec.x) > absf(move_vec.y):
			_facing_row = 2 if move_vec.x > 0.0 else 3
		else:
			_facing_row = 0 if move_vec.y >= 0.0 else 1
		_anim_t += delta * 7.5
		var col_idx: int = int(floor(_anim_t)) % 4
		_set_mara_frame(col_idx)
	else:
		_anim_t = 0.0
		_set_mara_frame(0)

	_update_foreground_parallax()
	_update_occlusion_silhouette(delta)
	if _show_debug:
		queue_redraw()


func _draw() -> void:
	if not _show_debug or _current_mode == "m01":
		return
	for p: Dictionary in _ysort_props:
		var pos: Vector2 = p["pos"] as Vector2
		var col: Vector2 = p["col"] as Vector2
		draw_line(pos + Vector2(-42.0, 0.0), pos + Vector2(42.0, 0.0), Color(0.55, 0.97, 0.94, 0.85), 1.0)
		draw_rect(Rect2(pos - Vector2(col.x, col.y + 8.0), col * 2.0), Color(1.0, 0.45, 0.25, 0.65), false, 1.0)
	draw_line(
		_player.position + Vector2(-14.0, 0.0),
		_player.position + Vector2(14.0, 0.0),
		Color(1.0, 0.85, 0.35, 0.95),
		1.0
	)


func _setup_player_sprites() -> void:
	var mara_tex: Texture2D = _load_png("mara_v7_28x40_sheet.png")
	_player_sprite.texture = mara_tex
	_player_sprite.hframes = 4
	_player_sprite.vframes = 4
	_player_sprite.centered = true
	_player_sprite.offset = Vector2(0.0, -17.0)

	_silhouette_sprite.texture = mara_tex
	_silhouette_sprite.hframes = 4
	_silhouette_sprite.vframes = 4
	_silhouette_sprite.centered = true
	_silhouette_sprite.offset = Vector2(0.0, -17.0)
	_silhouette_sprite.z_as_relative = false
	_silhouette_sprite.z_index = 15

	var shader: Shader = load(SHADER_PATH) as Shader
	if shader != null:
		_silhouette_mat = ShaderMaterial.new()
		_silhouette_mat.shader = shader
		_silhouette_sprite.material = _silhouette_mat


func _load_mode(mode_id: String) -> void:
	_current_mode = mode_id
	_clear_dynamic_nodes()

	if mode_id == "m01":
		_ground_sprite.texture = _load_png("m01_current_overhead_480x270.png")
		_ground_sprite.position = Vector2.ZERO
		_player.visible = false
		_camera.offset = Vector2.ZERO
		_camera.limit_left = 0
		_camera.limit_top = 0
		_camera.limit_right = int(VIEW_W)
		_camera.limit_bottom = int(VIEW_H)
		_player.position = Vector2(VIEW_W * 0.5, VIEW_H * 0.5)
		_hud_label.text = "A. CURRENT M01 OVERHEAD (1-4: Switch Biome | G: Sort Debug)"
		queue_redraw()
		return

	var cfg: Dictionary = BIOME_CONFIGS[mode_id] as Dictionary
	_ground_sprite.texture = _load_png(str(cfg["ground"]))
	_ground_sprite.position = Vector2.ZERO
	_player.visible = true
	_player.position = cfg["spawn"] as Vector2
	_world_bounds = cfg["bounds"] as Rect2
	_facing_row = 1 if mode_id == "forest" else (2 if mode_id == "swamp" else 3)
	_set_mara_frame(0)

	var ground_size: Vector2 = _ground_sprite.texture.get_size() if _ground_sprite.texture != null else Vector2(600.0, 310.0)
	_camera.offset = Vector2(0.0, float(cfg["cam_offset_y"]))
	_camera.limit_left = 0
	_camera.limit_top = 0
	_camera.limit_right = int(ground_size.x)
	_camera.limit_bottom = int(ground_size.y)

	if _silhouette_mat != null:
		_silhouette_mat.set_shader_parameter("rim_color", cfg["rim_color"] as Color)
		_silhouette_mat.set_shader_parameter("visibility_amount", 0.0)

	var props: Array = cfg["props"] as Array
	for raw_p: Variant in props:
		var p: Dictionary = raw_p as Dictionary
		var tex: Texture2D = _load_png(str(p["tex"]))
		if tex == null:
			continue
		if str(p["layer"]) == "ysort":
			var body := StaticBody2D.new()
			body.position = p["pos"] as Vector2
			var spr := Sprite2D.new()
			spr.texture = tex
			spr.centered = false
			spr.offset = Vector2(-tex.get_width() * 0.5, -tex.get_height())
			body.add_child(spr)

			var col_dim: Vector2 = p["col"] as Vector2
			var shape := CollisionShape2D.new()
			var rect := RectangleShape2D.new()
			rect.size = col_dim * 2.0
			shape.shape = rect
			shape.position = Vector2(0.0, -8.0)
			body.add_child(shape)

			_ysort_layer.add_child(body)
			_ysort_props.append({
				"node": body,
				"pos": body.position,
				"col": col_dim,
				"width": float(tex.get_width()),
				"height": float(tex.get_height()),
			})
		else:
			var fg_spr := Sprite2D.new()
			fg_spr.texture = tex
			fg_spr.centered = false
			var base_pos: Vector2 = p["pos"] as Vector2
			fg_spr.position = base_pos
			_fg_layer.add_child(fg_spr)
			_fg_entries.append({
				"node": fg_spr,
				"base_pos": base_pos,
				"parallax": float(p.get("parallax", 1.14)),
			})

	_hud_label.text = "%s  [1-4 Biomes | WASD Walk | G Sort Debug]" % str(cfg["title"])
	_update_foreground_parallax()
	queue_redraw()


func _clear_dynamic_nodes() -> void:
	for p: Dictionary in _ysort_props:
		var n: Node = p["node"] as Node
		if is_instance_valid(n):
			n.queue_free()
	_ysort_props.clear()
	for f: Dictionary in _fg_entries:
		var n: Node = f["node"] as Node
		if is_instance_valid(n):
			n.queue_free()
	_fg_entries.clear()


func _set_mara_frame(col_idx: int) -> void:
	var frame_id: int = _facing_row * 4 + col_idx
	_player_sprite.frame = frame_id
	_silhouette_sprite.frame = frame_id


func _update_foreground_parallax() -> void:
	var cam_center: Vector2 = _camera.get_screen_center_position()
	var world_center := Vector2(300.0, 155.0)
	var delta_cam: Vector2 = cam_center - world_center
	for entry: Dictionary in _fg_entries:
		var spr: Sprite2D = entry["node"] as Sprite2D
		var base_pos: Vector2 = entry["base_pos"] as Vector2
		var factor: float = float(entry["parallax"])
		var cam_top_left: Vector2 = cam_center - Vector2(VIEW_W * 0.5, VIEW_H * 0.5)
		spr.position = cam_top_left + base_pos - delta_cam * (factor - 1.0)


func _update_occlusion_silhouette(delta: float) -> void:
	if _silhouette_mat == null:
		return
	var is_behind: bool = false
	for p: Dictionary in _ysort_props:
		var pos: Vector2 = p["pos"] as Vector2
		var half_w: float = float(p["width"]) * 0.34
		var prop_h: float = float(p["height"])
		if _player.position.y < pos.y and _player.position.y > pos.y - prop_h * 0.85:
			if absf(_player.position.x - pos.x) < half_w:
				is_behind = true
				break
	var cur_val: float = float(_silhouette_mat.get_shader_parameter("visibility_amount"))
	var target: float = 1.0 if is_behind else 0.0
	_silhouette_mat.set_shader_parameter("visibility_amount", move_toward(cur_val, target, delta * 7.0))


func _load_png(filename: String) -> Texture2D:
	var img := Image.new()
	var abs_path: String = ProjectSettings.globalize_path(SPRITE_DIR + filename)
	if img.load(abs_path) != OK:
		push_warning("V7ImmersiveWorldStudy: Could not load " + abs_path)
		return null
	return ImageTexture.create_from_image(img)
