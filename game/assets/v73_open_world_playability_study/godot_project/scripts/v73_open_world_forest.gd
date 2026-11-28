extends Node2D
## VERDANT SIGNAL — V7.3 Real Godot 4.7.2 Continuous Open-World Forest Controller
##
## Features:
##   - True 4-direction + normalized diagonal exploration across 2304x1536 continuous woodland
##   - Unmodified 88x88 supplied character artwork (Idle / Walking / Running, 4 cardinal anims;
##     note: diagonal walk/run frames are not present in supplied ZIP — hysteresis-locked cardinal
##     facing prevents flicker without fabricating missing artwork!)
##   - Blocked-wall anti-slide detection (never plays walk cycle when pushed against solid trunk/rock)
##   - Multi-shape physical CollisionPolygon2D + Area2D slow-thicket (0.78x) & walkable root arch
##   - F3 : Toggle live Collision-Debug overlay directly over artwork
##   - F4 : Toggle live Intel HD 3000 Performance Profiler HUD (FPS, frame ms, draw calls, colliders)
##   - 1-8: Jump to each environmental composition category (Hub, NW Grove, Root Arch, Waystone, Clearing, Pools, Rocks, Fallen Log)
##   - F9 : Capture native 640x360 PNG screenshot
##   - CLI: godot --path game/assets/v73_open_world_playability_study/godot_project -- --capture-proofs

const WALK_SPEED := 84.0
const RUN_SPEED := 128.0
const WALK_FPS := 9.5
const RUN_FPS := 12.5
const IDLE_FPS := 5.0

const MIN_X := 330.0
const MAX_X := 1974.0
const MIN_Y := 290.0
const MAX_Y := 1236.0

const POOLS := [
	{"x": 1584.0, "y": 866.0, "rx": 56.0, "ry": 22.0},
	{"x": 1732.0, "y": 896.0, "rx": 46.0, "ry": 18.0},
	{"x": 1144.0, "y": 1038.0, "rx": 64.0, "ry": 24.0},
	{"x": 1272.0, "y": 1084.0, "rx": 44.0, "ry": 18.0},
	{"x": 1004.0, "y": 764.0, "rx": 32.0, "ry": 13.0},
	{"x": 966.0, "y": 492.0, "rx": 34.0, "ry": 14.0},
]

const TEX_IDLE: Texture2D = preload("res://sprites/char_idle_88x88_8x4.png")
const TEX_WALK: Texture2D = preload("res://sprites/char_walking_88x88_8x4.png")
const TEX_RUN: Texture2D = preload("res://sprites/char_running_88x88_8x4.png")

@onready var forest_floor: Sprite2D = $ForestFloor
@onready var y_sort_world: Node2D = $YSortWorld
@onready var canopy_layer: Node2D = $CanopyLayer
@onready var perimeter_canopy_layer: Node2D = $PerimeterCanopyLayer
@onready var walkable_zones_layer: Node2D = $WalkableZonesLayer
@onready var player: CharacterBody2D = $YSortWorld/Player
@onready var body_sprite: Sprite2D = $YSortWorld/Player/BodySprite
@onready var peek_sprite: Sprite2D = $YSortWorld/Player/OcclusionPeekSprite
@onready var cam: Camera2D = $YSortWorld/Player/MainCamera
@onready var debug_drawer: Node2D = $CollisionDebugDrawer
@onready var perf_label: Label = $HudCanvas/PerfLabel

# Row mapping in 8x4 88x88 strips: 0=south, 1=north, 2=east, 3=west
var _dir_row: int = 2
var _anim_state: String = "idle"
var _anim_acc: float = 0.0
var _frame_col: int = 0

var _debug_collision: bool = false
var _show_perf_hud: bool = true
var _occluders: Array[Sprite2D] = []
var _canopy_sprites: Array[Sprite2D] = []
var _slow_zone_count: int = 0
var _in_arch_count: int = 0
var _solid_poly_cache: Array[Dictionary] = []
var _area_poly_cache: Array[Dictionary] = []

func _ready() -> void:
	cam.limit_left = 240
	cam.limit_right = 2064
	cam.limit_top = 200
	cam.limit_bottom = 1336
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 7.0

	# Collect real Sprite2D occluders & collision polygons for exact debug draw + natural peek
	for child in y_sort_world.get_children():
		if child == player:
			continue
		if child is StaticBody2D:
			var spr := child.get_node_or_null("Sprite2D") as Sprite2D
			if spr != null:
				_occluders.append(spr)
			for sub in child.get_children():
				if sub is CollisionPolygon2D:
					var role := String(sub.get_meta("role", "solid_trunk"))
					_solid_poly_cache.append({"node": child, "poly": sub.polygon, "role": role})
		elif child is Sprite2D:
			_occluders.append(child as Sprite2D)

	for layer_node in [canopy_layer, perimeter_canopy_layer]:
		for child in layer_node.get_children():
			if child is Sprite2D:
				_canopy_sprites.append(child as Sprite2D)

	# Wire Area2D slow-thicket & walkable root-arch triggers
	for area in walkable_zones_layer.get_children():
		if area is Area2D:
			var role := String(area.get_meta("role", "slow_thicket"))
			area.body_entered.connect(_on_zone_entered.bind(role))
			area.body_exited.connect(_on_zone_exited.bind(role))
			for sub in area.get_children():
				if sub is CollisionPolygon2D:
					_area_poly_cache.append({"node": area, "poly": sub.polygon, "role": role})

	debug_drawer.draw.connect(_on_debug_draw)
	_apply_character_frame()

	if "--capture-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_godot_capture")

func _on_zone_entered(body: Node2D, role: String) -> void:
	if body != player:
		return
	if role == "slow_thicket":
		_slow_zone_count += 1
	elif role == "walkable_arch":
		_in_arch_count += 1

func _on_zone_exited(body: Node2D, role: String) -> void:
	if body != player:
		return
	if role == "slow_thicket":
		_slow_zone_count = maxi(0, _slow_zone_count - 1)
	elif role == "walkable_arch":
		_in_arch_count = maxi(0, _in_arch_count - 1)

func _physics_process(delta: float) -> void:
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir == Vector2.ZERO:
		dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	var wants_run := Input.is_action_pressed("sprint") or Input.is_key_pressed(KEY_SHIFT)
	var base_speed := RUN_SPEED if wants_run else WALK_SPEED

	# Terrain-aware feel: soft slow-thicket (0.78x) and shallow pool wading (0.90x)
	var terrain_mul := 0.78 if _slow_zone_count > 0 else 1.0
	var in_pool := false
	for pool in POOLS:
		var d := Vector2((player.position.x - pool.x) / pool.rx, (player.position.y - pool.y) / pool.ry).length()
		if d < 0.92:
			in_pool = true
			terrain_mul = minf(terrain_mul, 0.90)
			break

	var prev_pos := player.position
	if dir.length_squared() > 0.001:
		var norm_dir := dir.normalized()
		# Hysteresis-locked 4-cardinal facing (prevents flicker on diagonal release; zero fabricated frames!)
		if absf(norm_dir.x) > absf(norm_dir.y) * 1.12:
			_dir_row = 2 if norm_dir.x > 0.0 else 3
		elif absf(norm_dir.y) > absf(norm_dir.x) * 1.12:
			_dir_row = 0 if norm_dir.y > 0.0 else 1
		else:
			if _dir_row == 0 or _dir_row == 1:
				_dir_row = 0 if norm_dir.y >= 0.0 else 1
			else:
				_dir_row = 2 if norm_dir.x >= 0.0 else 3

		player.velocity = norm_dir * (base_speed * terrain_mul)
		player.move_and_slide()
		player.position.x = clampf(player.position.x, MIN_X, MAX_X)
		player.position.y = clampf(player.position.y, MIN_Y, MAX_Y)

		var actual_speed := player.position.distance_to(prev_pos) / maxf(delta, 0.0001)
		if actual_speed < 8.0:
			# Blocked against solid trunk/rock -> immediately stop walking animation (zero wall-sliding!)
			_set_anim_state("idle")
		else:
			_set_anim_state("running" if (wants_run and actual_speed > 94.0) else "walking")
	else:
		player.velocity = Vector2.ZERO
		_set_anim_state("idle")

	var fps := RUN_FPS if _anim_state == "running" else (WALK_FPS if _anim_state == "walking" else IDLE_FPS)
	_anim_acc += delta * fps
	_frame_col = int(_anim_acc) % 8
	_apply_character_frame()
	_update_environment_and_occlusion()

	if _debug_collision:
		debug_drawer.queue_redraw()
	if _show_perf_hud:
		_update_perf_hud(in_pool)

func _set_anim_state(next_state: String) -> void:
	if _anim_state != next_state:
		_anim_state = next_state
		_anim_acc = 0.0
		_frame_col = 0

func _apply_character_frame() -> void:
	var tex := TEX_RUN if _anim_state == "running" else (TEX_WALK if _anim_state == "walking" else TEX_IDLE)
	if body_sprite.texture != tex:
		body_sprite.texture = tex
		peek_sprite.texture = tex
	var fc := Vector2i(_frame_col, _dir_row)
	body_sprite.frame_coords = fc
	peek_sprite.frame_coords = fc

func _update_environment_and_occlusion() -> void:
	var floor_mat := forest_floor.material as ShaderMaterial
	if floor_mat != null:
		floor_mat.set_shader_parameter("player_world_pos", player.global_position)

	# Subtle physical light integration (warm sunlit clearing vs cool ancient canopy shade)
	var dist_clear := Vector2((player.position.x - 1656.0) / 245.0, (player.position.y - 836.0) / 168.0).length()
	if dist_clear < 1.0:
		body_sprite.modulate = Color(1.03, 1.02, 0.99, 1.0)
	elif player.position.x < 760.0 and player.position.y < 680.0:
		body_sprite.modulate = Color(0.91, 0.94, 0.98, 1.0)
	else:
		body_sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

	# Detect real Y-sort trunk/arch OR overhead canopy occlusion -> toggle natural 2x2 ordered-dither peek!
	var p_rect := Rect2(player.global_position + Vector2(-15.0, -54.0), Vector2(30.0, 50.0))
	var occluded := _in_arch_count > 0
	if not occluded:
		for spr in _occluders:
			if spr.texture == null:
				continue
			var owner_n := spr.get_parent() as Node2D
			var sort_y := owner_n.global_position.y if owner_n != y_sort_world else spr.global_position.y
			if sort_y <= player.global_position.y:
				continue
			var sz := spr.texture.get_size()
			var spr_rect := Rect2(spr.global_position + spr.offset - sz * 0.34, sz * 0.68)
			if p_rect.intersects(spr_rect):
				occluded = true
				break
	if not occluded:
		for cspr in _canopy_sprites:
			if cspr.texture == null:
				continue
			var sz := cspr.texture.get_size()
			var crect := Rect2(cspr.global_position - sz * 0.36, sz * 0.72)
			if p_rect.intersects(crect):
				occluded = true
				break
	peek_sprite.visible = occluded

func _on_debug_draw() -> void:
	if not _debug_collision:
		return
	var role_colors := {
		"solid_trunk": Color(1.0, 0.29, 0.29, 0.95),
		"solid_root": Color(1.0, 0.64, 0.22, 0.95),
		"solid_rock": Color(0.30, 0.76, 1.0, 0.95),
		"solid_log": Color(1.0, 0.48, 0.25, 0.95),
		"solid_thicket": Color(0.85, 0.42, 1.0, 0.95),
		"slow_thicket": Color(0.72, 1.0, 0.29, 0.92),
		"walkable_arch": Color(0.22, 0.95, 1.0, 0.92),
	}
	for item in _solid_poly_cache:
		var node: Node2D = item["node"]
		var poly: PackedVector2Array = item["poly"]
		var col: Color = role_colors.get(item["role"], Color.RED)
		var world_pts := PackedVector2Array()
		for pt in poly:
			world_pts.append(node.global_position + pt)
		debug_drawer.draw_colored_polygon(world_pts, Color(col.r, col.g, col.b, 0.24))
		var closed := world_pts.duplicate()
		closed.append(world_pts[0])
		debug_drawer.draw_polyline(closed, col, 1.0, false)

	for item in _area_poly_cache:
		var node: Node2D = item["node"]
		var poly: PackedVector2Array = item["poly"]
		var col: Color = role_colors.get(item["role"], Color.GREEN)
		var world_pts := PackedVector2Array()
		for pt in poly:
			world_pts.append(node.global_position + pt)
		debug_drawer.draw_colored_polygon(world_pts, Color(col.r, col.g, col.b, 0.18))
		var closed := world_pts.duplicate()
		closed.append(world_pts[0])
		debug_drawer.draw_polyline(closed, col, 1.0, false)

	# Draw player's exact foot footprint ellipse
	var foot_pts := PackedVector2Array()
	for i in range(25):
		var a := (float(i) / 24.0) * TAU
		foot_pts.append(player.global_position + Vector2(cos(a) * 11.0, sin(a) * 6.0))
	debug_drawer.draw_polyline(foot_pts, Color.WHITE, 1.0, false)

func _update_perf_hud(in_pool: bool) -> void:
	var fps := Engine.get_frames_per_second()
	var frame_ms := Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0
	var draws := int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
	var zone_note := "SLOW_THICKET(0.78x)" if _slow_zone_count > 0 else ("UNDER_ARCH" if _in_arch_count > 0 else ("SHALLOW_POOL(0.90x)" if in_pool else "OPEN_MOSS(1.0x)"))
	perf_label.text = "V7.3 GODOT 4.7.2 | %d FPS (%.1f ms) | Draws:%d | Polygons:%d | Pos:(%d,%d) | %s | %s | F3:ColDebug F4:HUD" % [
		fps, frame_ms, draws, _solid_poly_cache.size() + _area_poly_cache.size(),
		int(player.position.x), int(player.position.y), _anim_state.to_upper(), zone_note
	]

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_F3:
				_debug_collision = not _debug_collision
				debug_drawer.queue_redraw()
			KEY_F4:
				_show_perf_hud = not _show_perf_hud
				perf_label.visible = _show_perf_hud
			KEY_1: _jump_to(Vector2(1024.0, 822.0), 2)
			KEY_2: _jump_to(Vector2(586.0, 582.0), 1)
			KEY_3: _jump_to(Vector2(1118.0, 454.0), 1)
			KEY_4: _jump_to(Vector2(1656.0, 518.0), 1)
			KEY_5: _jump_to(Vector2(1618.0, 824.0), 2)
			KEY_6: _jump_to(Vector2(1146.0, 1044.0), 2)
			KEY_7: _jump_to(Vector2(654.0, 1116.0), 3)
			KEY_8: _jump_to(Vector2(632.0, 944.0), 3)
			KEY_F9:
				_save_capture("manual_v73_640x360.png")

func _jump_to(pos: Vector2, dir_row: int) -> void:
	player.position = pos
	_dir_row = dir_row
	cam.reset_smoothing()
	_apply_character_frame()
	_update_environment_and_occlusion()

func _save_capture(filename: String) -> void:
	var out_dir := ProjectSettings.globalize_path("res://godot_runtime_captures")
	DirAccess.make_dir_recursive_absolute(out_dir)
	var img := get_viewport().get_texture().get_image()
	var full_path := out_dir.path_join(filename)
	img.save_png(full_path)
	print("V7.3 Godot runtime capture saved: ", full_path, " (", img.get_width(), "x", img.get_height(), ")")

func _run_automated_godot_capture() -> void:
	_show_perf_hud = false
	perf_label.visible = false
	var shots := [
		{"name": "godot_01_woodland_hub_640x360.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "dbg": false},
		{"name": "godot_02_root_arch_640x360.png", "pos": Vector2(1118.0, 454.0), "dir": 1, "dbg": false},
		{"name": "godot_03_sunlit_clearing_640x360.png", "pos": Vector2(1618.0, 824.0), "dir": 2, "dbg": false},
		{"name": "godot_04_waystone_glade_640x360.png", "pos": Vector2(1656.0, 518.0), "dir": 1, "dbg": false},
		{"name": "godot_05_collision_debug_hub_640x360.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "dbg": true},
		{"name": "godot_06_collision_debug_arch_640x360.png", "pos": Vector2(1118.0, 454.0), "dir": 1, "dbg": true},
		{"name": "godot_07_boundary_north_640x360.png", "pos": Vector2(1118.0, 314.0), "dir": 1, "dbg": false},
		{"name": "godot_08_boundary_south_640x360.png", "pos": Vector2(1152.0, 1216.0), "dir": 0, "dbg": false},
		{"name": "godot_09_boundary_west_640x360.png", "pos": Vector2(368.0, 938.0), "dir": 3, "dbg": false},
		{"name": "godot_10_boundary_east_640x360.png", "pos": Vector2(1924.0, 758.0), "dir": 2, "dbg": false},
	]
	for s in shots:
		_debug_collision = s["dbg"]
		_jump_to(s["pos"], s["dir"])
		debug_drawer.queue_redraw()
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		_save_capture(s["name"])
	get_tree().quit(0)
