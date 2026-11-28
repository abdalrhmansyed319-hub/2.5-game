class_name AcousticEchoVfx
extends Node2D
## Lightweight Intel HD 3000 safe harmonic echo & discovery ping VFX (V11.0).
##
## Uses ONLY preloaded biolum_halo_64x64.png + AST-007 ground ring with zero custom
## shaders so acoustic responses across multiple resonant landmarks stay 100% GL
## Compatibility safe. Supports travel-time delay for sympathetic cross-node echoes.

const TEX_HALO: Texture2D = preload("res://assets/world/living_forest/sprites/biolum_halo_64x64.png")

var _delay_left: float = 0.0
var _elapsed: float = 0.0
var _duration: float = 0.85
var _base_color: Color = Color(0.46, 0.96, 0.92, 0.9)
var _start_scale: float = 0.35
var _end_scale: float = 1.65
var _flicker_static: bool = false

var _halo_sprite: Sprite2D = null
var _ring_sprite: Sprite2D = null


func configure_echo(
	world_pos: Vector2,
	kind: String,
	delay_sec: float = 0.0,
	scale_boost: float = 1.0
) -> void:
	global_position = world_pos
	_delay_left = maxf(0.0, delay_sec)
	_elapsed = 0.0
	_flicker_static = (kind == "blight")
	z_index = 12

	match kind:
		"meridian", "surveyor":
			_base_color = Color(1.0, 0.74, 0.34, 0.88)
			_duration = 0.82
			_start_scale = 0.32 * scale_boost
			_end_scale = 1.48 * scale_boost
		"blight":
			_base_color = Color(0.72, 0.62, 0.82, 0.78)
			_duration = 0.52
			_start_scale = 0.42 * scale_boost
			_end_scale = 0.95 * scale_boost
		"sample_burst":
			_base_color = Color(0.72, 1.0, 0.76, 0.95)
			_duration = 0.68
			_start_scale = 0.28 * scale_boost
			_end_scale = 1.38 * scale_boost
		"direction_hint":
			_base_color = Color(0.42, 0.94, 0.92, 0.56)
			_duration = 0.72
			_start_scale = 0.25 * scale_boost
			_end_scale = 0.92 * scale_boost
		_:
			# organic / harmonic
			_base_color = Color(0.46, 0.96, 0.92, 0.90)
			_duration = 0.92
			_start_scale = 0.36 * scale_boost
			_end_scale = 1.75 * scale_boost

	var add_mat := CanvasItemMaterial.new()
	add_mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD

	_halo_sprite = Sprite2D.new()
	_halo_sprite.texture = TEX_HALO
	_halo_sprite.material = add_mat
	_halo_sprite.centered = true
	_halo_sprite.visible = _delay_left <= 0.0
	add_child(_halo_sprite)

	_ring_sprite = Sprite2D.new()
	_ring_sprite.texture = AssetPaths.load_texture("AST-007")
	_ring_sprite.centered = true
	_ring_sprite.region_enabled = true
	_ring_sprite.region_rect = Rect2(0.0, 64.0, 32.0, 32.0)
	_ring_sprite.visible = _delay_left <= 0.0
	add_child(_ring_sprite)


func _process(delta: float) -> void:
	if _delay_left > 0.0:
		_delay_left -= delta
		if _delay_left <= 0.0:
			if _halo_sprite != null:
				_halo_sprite.visible = true
			if _ring_sprite != null:
				_ring_sprite.visible = true
		return

	_elapsed += delta
	if _elapsed >= _duration:
		queue_free()
		return

	var u: float = clampf(_elapsed / _duration, 0.0, 1.0)
	var ease_out: float = 1.0 - pow(1.0 - u, 2.2)
	var sc: float = lerpf(_start_scale, _end_scale, ease_out)
	var alpha: float = (1.0 - u) * _base_color.a
	if _flicker_static:
		alpha *= 0.45 + 0.55 * absf(sin(_elapsed * 54.0))

	if _halo_sprite != null:
		_halo_sprite.scale = Vector2(sc, sc * 0.68)
		_halo_sprite.modulate = Color(_base_color.r, _base_color.g, _base_color.b, alpha * 0.85)
	if _ring_sprite != null:
		var frame_idx: int = clampi(int(floor(u * 4.0)), 0, 3)
		_ring_sprite.region_rect = Rect2(float(frame_idx * 32), 64.0, 32.0, 32.0)
		var ring_sc: float = lerpf(0.85, 1.75, ease_out)
		_ring_sprite.scale = Vector2(ring_sc, ring_sc)
		_ring_sprite.modulate = Color(_base_color.r, _base_color.g, _base_color.b, alpha)
