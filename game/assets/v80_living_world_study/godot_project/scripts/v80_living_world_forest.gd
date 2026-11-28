extends Node2D
## VERDANT SIGNAL — V8.0 Real Godot 4.7.2 Living World Controller (GL Compatibility / Intel HD 3000)
##
## Hotkeys:
##   WASD / Arrows : 4-dir + normalized 8-dir exploration | Shift : Run
##   F3 : Toggle live Collision-Debug polygons over artwork
##   F4 : Toggle live Intel HD 3000 Performance Profiler HUD
##   F5 : Cycle Cinematic Lighting Mood (Golden Afternoon -> Misty Rose-Gold Dawn -> Shaded Twilight Forest)
##   F6 : Trigger Living Wind Gust + Leaf Shower event
##   1-8: Jump between all 8 environmental composition zones (A-H)
##   F9 : Capture native 640x360 PNG screenshot
##   CLI: godot --path game/assets/v80_living_world_study/godot_project -- --capture-proofs

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
const TEX_TUFTS: Texture2D = preload("res://sprites/living_grass_tufts_24x24_6x8.png")
const TEX_CRITTERS: Texture2D = preload("res://sprites/living_critters_12x12_4x3.png")

const MOOD_NAMES := ["AFTERNOON", "DAWN", "SHADED_FOREST"]
const GRASS_POOL_SIZE := 144

@onready var forest_floor: Sprite2D = $ForestFloor
@onready var y_sort_world: Node2D = $YSortWorld
@onready var canopy_layer: Node2D = $CanopyLayer
@onready var perimeter_canopy_layer: Node2D = $PerimeterCanopyLayer
@onready var walkable_zones_layer: Node2D = $WalkableZonesLayer
@onready var sunbeams_sprite: Sprite2D = $AtmosphericLightingLayer/SunbeamsOverlay
@onready var biolum_layer: Node2D = $AtmosphericLightingLayer/BiolumGlowLayer
@onready var critters_layer: Node2D = $EnvironmentalLifeLayer/CrittersLayer
@onready var falling_leaves: CPUParticles2D = $EnvironmentalLifeLayer/FallingLeaves
@onready var mood_modulate: CanvasModulate = $WorldMoodModulate
@onready var player: CharacterBody2D = $YSortWorld/Player
@onready var body_sprite: Sprite2D = $YSortWorld/Player/BodySprite
@onready var peek_sprite: Sprite2D = $YSortWorld/Player/OcclusionPeekSprite
@onready var cam: Camera2D = $YSortWorld/Player/MainCamera
@onready var debug_drawer: Node2D = $CollisionDebugDrawer
@onready var perf_label: Label = $HudCanvas/PerfLabel

var _dir_row: int = 2
var _anim_state: String = "idle"
var _anim_acc: float = 0.0
var _frame_col: int = 0
var _time_sec: float = 0.0
var _manual_gust_timer: float = 0.0
var _mood_idx: int = 0

var _debug_collision: bool = false
var _show_perf_hud: bool = true
var _occluders: Array[Sprite2D] = []
var _canopy_sprites: Array[Sprite2D] = []
var _sway_materials: Array[ShaderMaterial] = []
var _slow_zone_count: int = 0
var _in_arch_count: int = 0
var _solid_poly_cache: Array[Dictionary] = []
var _area_poly_cache: Array[Dictionary] = []

# Pooled frustum-culled Living Grass & Critter Systems (Intel HD 3000 friendly!)
var _tuft_data: Array = []
var _tuft_pool: Array[Sprite2D] = []
var _tuft_bends: Dictionary = {} # tuft_idx -> {"timer": float, "side": int}
var _visible_tufts_drawn: int = 0

var _critter_data: Array = []
var _critter_nodes: Array[Sprite2D] = []

func _ready() -> void:
	cam.limit_left = 240
	cam.limit_right = 2064
	cam.limit_top = 200
	cam.limit_bottom = 1336
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 7.0

	for child in y_sort_world.get_children():
		if child == player:
			continue
		if child is StaticBody2D:
			var spr := child.get_node_or_null("Sprite2D") as Sprite2D
			if spr != null:
				_occluders.append(spr)
				if spr.material is ShaderMaterial:
					_sway_materials.append(spr.material as ShaderMaterial)
			for sub in child.get_children():
				if sub is CollisionPolygon2D:
					var role := String(sub.get_meta("role", "solid_trunk"))
					_solid_poly_cache.append({"node": child, "poly": sub.polygon, "role": role})
		elif child is Sprite2D:
			var s2 := child as Sprite2D
			_occluders.append(s2)
			if s2.material is ShaderMaterial:
				_sway_materials.append(s2.material as ShaderMaterial)

	for layer_node in [canopy_layer, perimeter_canopy_layer]:
		for child in layer_node.get_children():
			if child is Sprite2D:
				var s2 := child as Sprite2D
				_canopy_sprites.append(s2)
				if s2.material is ShaderMaterial:
					_sway_materials.append(s2.material as ShaderMaterial)

	for area in walkable_zones_layer.get_children():
		if area is Area2D:
			var role := String(area.get_meta("role", "slow_thicket"))
			area.body_entered.connect(_on_zone_entered.bind(role))
			area.body_exited.connect(_on_zone_exited.bind(role))
			for sub in area.get_children():
				if sub is CollisionPolygon2D:
					_area_poly_cache.append({"node": area, "poly": sub.polygon, "role": role})

	_load_living_ecosystem_json()
	_apply_mood()
	debug_drawer.draw.connect(_on_debug_draw)
	_apply_character_frame()

	if "--capture-proofs" in OS.get_cmdline_user_args():
		call_deferred("_run_automated_godot_capture")

func _load_living_ecosystem_json() -> void:
	var txt := FileAccess.get_file_as_string("res://data/living_ecosystem_data.json")
	var parsed = JSON.parse_string(txt)
	if parsed is Dictionary:
		_tuft_data = parsed.get("tufts", [])
		_critter_data = parsed.get("critters", [])

	# Pre-allocate fixed frustum-culled Sprite2D pool inside YSortWorld (zero runtime allocations!)
	for i in range(GRASS_POOL_SIZE):
		var s := Sprite2D.new()
		s.texture = TEX_TUFTS
		s.hframes = 6
		s.vframes = 8
		s.offset = Vector2(0, -9)
		s.visible = false
		y_sort_world.add_child(s)
		_tuft_pool.append(s)

	# Create lightweight animated woodland butterflies & glowing twilight moths
	for cr in _critter_data:
		var cs := Sprite2D.new()
		cs.texture = TEX_CRITTERS
		cs.hframes = 4
		cs.vframes = 3
		cs.frame_coords = Vector2i(0, int(cr["kind"]))
		critters_layer.add_child(cs)
		_critter_nodes.append(cs)

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
	_time_sec += delta
	if _manual_gust_timer > 0.0:
		_manual_gust_timer = maxf(0.0, _manual_gust_timer - delta)

	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dir == Vector2.ZERO:
		dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	var wants_run := Input.is_action_pressed("sprint") or Input.is_key_pressed(KEY_SHIFT)
	var base_speed := RUN_SPEED if wants_run else WALK_SPEED

	var terrain_mul := 0.78 if _slow_zone_count > 0 else 1.0
	var in_pool := false
	for pool in POOLS:
		var d := Vector2((player.position.x - pool.x) / pool.rx, (player.position.y - pool.y) / pool.ry).length()
		if d < 0.92:
			in_pool = true
			terrain_mul = minf(terrain_mul, 0.90)
			break

	var prev_pos := player.position
	var is_moving := false
	if dir.length_squared() > 0.001:
		var norm_dir := dir.normalized()
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
			_set_anim_state("idle")
		else:
			is_moving = true
			_set_anim_state("running" if (wants_run and actual_speed > 94.0) else "walking")
	else:
		player.velocity = Vector2.ZERO
		_set_anim_state("idle")

	var fps := RUN_FPS if _anim_state == "running" else (WALK_FPS if _anim_state == "walking" else IDLE_FPS)
	_anim_acc += delta * fps
	_frame_col = int(_anim_acc) % 8
	_apply_character_frame()
	_update_living_ecosystem(delta, is_moving)
	_update_environment_and_occlusion()

	if _debug_collision:
		debug_drawer.queue_redraw()
	if _show_perf_hud:
		_update_perf_hud(in_pool)

func _update_living_ecosystem(delta: float, is_moving: bool) -> void:
	# Decay existing player footstep bends
	var expired: Array = []
	for k in _tuft_bends.keys():
		_tuft_bends[k]["timer"] -= delta
		if _tuft_bends[k]["timer"] <= 0.0:
			expired.append(k)
	for k in expired:
		_tuft_bends.erase(k)

	# Periodic living wind gust rhythm + manual F6 gust pulse
	var gust_wave := maxf(0.0, sin(_time_sec * 0.44 - 0.8))
	var gust_strength := maxf(_manual_gust_timer / 3.0, pow(gust_wave, 4.0))
	for sm in _sway_materials:
		sm.set_shader_parameter("gust_factor", gust_strength)
	falling_leaves.gravity = Vector2(5.0 + gust_strength * 28.0, 10.0)

	# Cloud drift breathing modulation on painterly canopy sunbeams + biolum pulse
	var cloud := 0.82 + 0.18 * sin(_time_sec * 0.28)
	var base_beam_a := 0.72 if _mood_idx == 0 else (0.82 if _mood_idx == 1 else 0.24)
	sunbeams_sprite.modulate.a = base_beam_a * cloud
	var bio_a := (0.62 if _mood_idx == 0 else (0.78 if _mood_idx == 1 else 1.0)) * (0.78 + 0.22 * sin(_time_sec * 1.45))
	biolum_layer.modulate.a = bio_a

	# Frustum-cull & animate visible Living Grass & Root-Fern Tufts in pool
	var cam_center := cam.get_screen_center_position()
	var vx0 := cam_center.x - 348.0
	var vx1 := cam_center.x + 348.0
	var vy0 := cam_center.y - 208.0
	var vy1 := cam_center.y + 208.0

	var pool_idx := 0
	for i in range(_tuft_data.size()):
		var td: Dictionary = _tuft_data[i]
		var tx: float = td["x"]
		var ty: float = td["y"]
		if tx < vx0 or tx > vx1 or ty < vy0 or ty > vy1:
			continue

		if is_moving and absf(tx - player.position.x) < 22.0 and absf(ty - player.position.y) < 15.0:
			var dist := Vector2(tx - player.position.x, (ty - player.position.y) * 1.35).length()
			if dist < 21.0:
				_tuft_bends[i] = {"timer": 0.48, "side": 1 if tx >= player.position.x else -1}

		if pool_idx >= GRASS_POOL_SIZE:
			continue
		var spr := _tuft_pool[pool_idx]
		pool_idx += 1
		spr.visible = true
		spr.position = Vector2(tx, ty)

		var f_col := 0
		if _tuft_bends.has(i) and _tuft_bends[i]["timer"] > 0.14:
			f_col = 4 if _tuft_bends[i]["side"] < 0 else 5
		else:
			var travel := sin(_time_sec * (1.35 + gust_strength * 1.1) - tx * 0.011 + ty * 0.0038)
			var local_w := (0.22 + travel * (0.46 + gust_strength * 0.72) + gust_strength * 0.48 + sin(_time_sec * 1.2 + float(td["phase"])) * 0.28) * float(td["sens"])
			if local_w > 0.88:
				f_col = 2
			elif local_w > 0.26:
				f_col = 1
			elif local_w < -0.26:
				f_col = 3
		spr.frame_coords = Vector2i(f_col, int(td["row"]))

	_visible_tufts_drawn = pool_idx
	for r in range(pool_idx, GRASS_POOL_SIZE):
		_tuft_pool[r].visible = false

	# Animate fluttering butterflies & glowing forest moths
	for ci in range(_critter_nodes.size()):
		var cr: Dictionary = _critter_data[ci]
		var cs := _critter_nodes[ci]
		var spd: float = cr["speed"]
		var ph: float = cr["phase"]
		cs.position = Vector2(
			float(cr["x"]) + cos(_time_sec * spd + ph) * float(cr["rx"]) + sin(_time_sec * 1.7 + ph) * 9.0,
			float(cr["y"]) + sin(_time_sec * spd * 1.3 + ph) * float(cr["ry"]) + cos(_time_sec * 2.8 + ph) * 5.0
		)
		cs.frame_coords = Vector2i(int(_time_sec * 9.5 + ph * 4.0) % 4, int(cr["kind"]))

func _apply_mood() -> void:
	if _mood_idx == 0:
		# Golden Afternoon Glade
		mood_modulate.color = Color(1.0, 1.0, 0.98, 1.0)
		sunbeams_sprite.modulate = Color(1.0, 0.95, 0.68, 0.72)
	elif _mood_idx == 1:
		# Misty Rose-Gold Dawn
		mood_modulate.color = Color(0.95, 0.92, 1.04, 1.0)
		sunbeams_sprite.modulate = Color(1.0, 0.82, 0.66, 0.82)
	else:
		# Deep Shaded Twilight Forest (Bioluminescence takes center stage!)
		mood_modulate.color = Color(0.66, 0.78, 0.94, 1.0)
		sunbeams_sprite.modulate = Color(0.68, 0.88, 0.88, 0.24)

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

	var dist_clear := Vector2((player.position.x - 1648.0) / 235.0, (player.position.y - 812.0) / 160.0).length()
	if dist_clear < 1.0:
		body_sprite.modulate = Color(1.05, 1.03, 0.98, 1.0)
	elif player.position.x < 760.0 and player.position.y < 680.0:
		body_sprite.modulate = Color(0.89, 0.93, 0.98, 1.0)
	else:
		body_sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

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

	var foot_pts := PackedVector2Array()
	for i in range(25):
		var a := (float(i) / 24.0) * TAU
		foot_pts.append(player.global_position + Vector2(cos(a) * 11.0, sin(a) * 6.0))
	debug_drawer.draw_polyline(foot_pts, Color.WHITE, 1.0, false)

func _update_perf_hud(in_pool: bool) -> void:
	var fps := Engine.get_frames_per_second()
	var frame_ms := Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0
	var draws := int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
	var zone := "THICKET(0.78x)" if _slow_zone_count > 0 else ("ARCH" if _in_arch_count > 0 else ("POOL(0.90x)" if in_pool else "GRASS(1.0x)"))
	perf_label.text = "V8.0 LIVING WORLD | %d FPS (%.1fms) | Draws:%d | Tufts:%d | Mood:%s | %s | F3:Col F5:Mood F6:Gust" % [
		fps, frame_ms, draws, _visible_tufts_drawn, MOOD_NAMES[_mood_idx], zone
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
			KEY_F5:
				_mood_idx = (_mood_idx + 1) % 3
				_apply_mood()
			KEY_F6:
				_manual_gust_timer = 3.0
			KEY_1: _jump_to(Vector2(1024.0, 822.0), 2)
			KEY_2: _jump_to(Vector2(586.0, 582.0), 1)
			KEY_3: _jump_to(Vector2(1118.0, 454.0), 1)
			KEY_4: _jump_to(Vector2(1656.0, 518.0), 1)
			KEY_5: _jump_to(Vector2(1618.0, 824.0), 2)
			KEY_6: _jump_to(Vector2(1146.0, 1044.0), 2)
			KEY_7: _jump_to(Vector2(654.0, 1116.0), 3)
			KEY_8: _jump_to(Vector2(632.0, 944.0), 3)
			KEY_F9:
				_save_capture("manual_v80_640x360.png")

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
	print("V8.0 Godot runtime capture saved: ", full_path)

func _run_automated_godot_capture() -> void:
	_show_perf_hud = false
	perf_label.visible = false
	var shots := [
		{"name": "godot_v80_01_hub_afternoon.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "mood": 0, "dbg": false},
		{"name": "godot_v80_02_root_arch_afternoon.png", "pos": Vector2(1118.0, 454.0), "dir": 1, "mood": 0, "dbg": false},
		{"name": "godot_v80_03_clearing_afternoon.png", "pos": Vector2(1618.0, 824.0), "dir": 2, "mood": 0, "dbg": false},
		{"name": "godot_v80_04_clearing_dawn.png", "pos": Vector2(1618.0, 824.0), "dir": 2, "mood": 1, "dbg": false},
		{"name": "godot_v80_05_waystone_shaded_biolum.png", "pos": Vector2(1656.0, 518.0), "dir": 1, "mood": 2, "dbg": false},
		{"name": "godot_v80_06_fallen_log_afternoon.png", "pos": Vector2(632.0, 956.0), "dir": 3, "mood": 0, "dbg": false},
		{"name": "godot_v80_07_collision_debug_hub.png", "pos": Vector2(1024.0, 822.0), "dir": 2, "mood": 0, "dbg": true},
	]
	for s in shots:
		_mood_idx = s["mood"]
		_debug_collision = s["dbg"]
		_apply_mood()
		_jump_to(s["pos"], s["dir"])
		debug_drawer.queue_redraw()
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		_save_capture(s["name"])
	get_tree().quit(0)
