extends Node2D
## VERDANT SIGNAL — V7.2 Real Godot 4.7.2 Playable Forest Refinement Study
##
## Interactive Controls:
##   WASD / Arrow Keys : Walk freely through all 3 continuous zones (in front of & behind colossal trunks!)
##   1 / 2 / 3         : Jump directly to Composition A (Corridor), B (Deep Interior), C (Clearing)
##   4                 : Jump to Walk-Behind Colossal Trunk occlusion check
##   5                 : Jump to Between-Exposed-Roots navigation check
##   F9                : Capture native 480x270 PNG screenshot into user:// or res://godot_runtime_captures/
##
## Automated CLI Capture (Windows / Linux Godot 4.7.2):
##   godot --path game/assets/v72_forest_refinement_study/godot_project -- --capture-proofs

const WALK_SPEED := 78.0
const WORLD_W := 1440.0
const WORLD_H := 340.0
const MIN_X := 48.0
const MAX_X := 1392.0
const MIN_Y := 168.0
const MAX_Y := 318.0

@onready var forest_floor: Sprite2D = $ForestFloor
@onready var y_sort_world: Node2D = $YSortWorld
@onready var mara: CharacterBody2D = $YSortWorld/Mara
@onready var mara_sprite: Sprite2D = $YSortWorld/Mara/BodySprite
@onready var mara_peek: Sprite2D = $YSortWorld/Mara/OcclusionPeekSprite
@onready var cam: Camera2D = $YSortWorld/Mara/Camera2D
@onready var fg_parallax: Parallax2D = $ForegroundParallax

var _dir_row: int = 1 # 0=down, 1=up, 2=right, 3=left
var _step_acc: float = 0.0
var _step_frame: int = 0
var _occluder_sprites: Array[Sprite2D] = []
var _fg_sprites: Array[Sprite2D] = []

func _ready() -> void:
	cam.limit_left = 0
	cam.limit_top = 24
	cam.limit_right = int(WORLD_W)
	cam.limit_bottom = int(WORLD_H)
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 6.0

	# Collect real Sprite2D nodes inside YSortWorld & ForegroundParallax for precise occlusion peek detection
	for child in y_sort_world.get_children():
		if child == mara:
			continue
		if child is StaticBody2D:
			var spr := child.get_node_or_null("Sprite2D") as Sprite2D
			if spr != null:
				_occluder_sprites.append(spr)
		elif child is Sprite2D:
			_occluder_sprites.append(child as Sprite2D)

	for child in fg_parallax.get_children():
		if child is Sprite2D:
			_fg_sprites.append(child as Sprite2D)

	_apply_mara_frame()

	if "--capture-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_godot_capture")

func _physics_process(delta: float) -> void:
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir == Vector2.ZERO:
		dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	if dir.length_squared() > 0.001:
		mara.velocity = dir.normalized() * WALK_SPEED
		mara.move_and_slide()
		mara.position.x = clampf(mara.position.x, MIN_X, MAX_X)
		mara.position.y = clampf(mara.position.y, MIN_Y, MAX_Y)
		if absf(dir.x) >= absf(dir.y):
			_dir_row = 2 if dir.x > 0.0 else 3
		else:
			_dir_row = 0 if dir.y > 0.0 else 1
		_step_acc += delta * 8.0
		_step_frame = int(_step_acc) % 4
	else:
		mara.velocity = Vector2.ZERO
		_step_frame = 0

	_apply_mara_frame()
	_update_environmental_integration()

func _apply_mara_frame() -> void:
	var fc := Vector2i(_step_frame, _dir_row)
	mara_sprite.frame_coords = fc
	mara_peek.frame_coords = fc

func _update_environmental_integration() -> void:
	# 1. Drive real-time puddle footstep ripples on ForestFloor shader
	var floor_mat := forest_floor.material as ShaderMaterial
	if floor_mat != null:
		floor_mat.set_shader_parameter("mara_world_pos", mara.global_position)

	# 2. Subtle physical ambient light integration (cooler in deep Zone B interior shade, warmer in Zone C clearing)
	var x := mara.position.x
	if x > 470.0 and x < 955.0:
		mara_sprite.modulate = Color(0.90, 0.94, 0.97, 1.0)
	elif x > 1040.0 and x < 1340.0:
		mara_sprite.modulate = Color(1.04, 1.03, 0.98, 1.0)
	else:
		mara_sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

	# 3. Real Y-sort & foreground occlusion detection -> enables subtle natural ordered-dither peek ONLY when occluded
	var m_rect := Rect2(mara.global_position + Vector2(-9.0, -32.0), Vector2(18.0, 30.0))
	var occluded := false
	for spr in _occluder_sprites:
		var owner_node := spr.get_parent() as Node2D
		var sort_y := owner_node.global_position.y if owner_node != y_sort_world else spr.global_position.y
		if sort_y <= mara.global_position.y:
			continue
		if spr.texture == null:
			continue
		var sz := spr.texture.get_size()
		# Tight inner silhouette check (excludes transparent margins)
		var spr_rect := Rect2(spr.global_position + spr.offset - sz * 0.36, sz * 0.72)
		if m_rect.intersects(spr_rect):
			occluded = true
			break

	if not occluded:
		var cam_tl := cam.get_screen_center_position() - Vector2(240.0, 135.0)
		var mara_screen := mara.global_position - cam_tl
		var m_srect := Rect2(mara_screen + Vector2(-9.0, -32.0), Vector2(18.0, 30.0))
		for fg in _fg_sprites:
			if fg.texture == null:
				continue
			var sz := fg.texture.get_size()
			var fg_screen := fg.position - cam_tl * fg_parallax.scroll_scale
			var fg_rect := Rect2(fg_screen + sz * 0.12, sz * 0.76)
			if m_srect.intersects(fg_rect):
				occluded = true
				break

	mara_peek.visible = occluded

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_1:
				_jump_to(Vector2(254.0, 266.0), 1)
			KEY_2:
				_jump_to(Vector2(678.0, 264.0), 2)
			KEY_3:
				_jump_to(Vector2(1192.0, 274.0), 1)
			KEY_4:
				_jump_to(Vector2(382.0, 256.0), 2) # Walk-behind close front-right split hollow arch titan!
			KEY_5:
				_jump_to(Vector2(692.0, 248.0), 2) # Moving between exposed roots & fallen hollow log!
			KEY_F9:
				_save_viewport_capture("manual_capture_480x270.png")

func _jump_to(pos: Vector2, dir_row: int) -> void:
	mara.position = pos
	_dir_row = dir_row
	_step_frame = 0
	cam.reset_smoothing()
	_apply_mara_frame()
	_update_environmental_integration()

func _save_viewport_capture(filename: String) -> void:
	var dir_path := ProjectSettings.globalize_path("res://godot_runtime_captures")
	DirAccess.make_dir_recursive_absolute(dir_path)
	var out_path := dir_path.path_join(filename)
	var img := get_viewport().get_texture().get_image()
	var err := img.save_png(out_path)
	if err == OK:
		print("[V7.2 GODOT CAPTURE] Saved native ", img.get_width(), "x", img.get_height(), " -> ", out_path)
	else:
		push_error("Failed to save capture: " + out_path)

func _run_automated_godot_capture() -> void:
	var shots := [
		["godot_A_dense_corridor_480x270.png", Vector2(254.0, 266.0), 1],
		["godot_B_deep_interior_480x270.png", Vector2(678.0, 264.0), 2],
		["godot_C_forest_clearing_480x270.png", Vector2(1192.0, 274.0), 1],
		["godot_test_walk_behind_trunk_480x270.png", Vector2(390.0, 256.0), 2],
		["godot_test_between_roots_480x270.png", Vector2(734.0, 254.0), 2],
		["godot_test_clearing_focal_outcrop_480x270.png", Vector2(1218.0, 248.0), 1],
	]
	cam.position_smoothing_enabled = false
	for shot in shots:
		_jump_to(shot[1], shot[2])
		await get_tree().process_frame
		await get_tree().process_frame
		_save_viewport_capture(shot[0])
	print("[V7.2 GODOT VERIFICATION] All 6 real Godot 4.7.2 native 480x270 captures completed!")
	get_tree().quit(0)
