class_name GroundRingVfx
extends Sprite2D
## Lightweight 4-frame ground-plane ring VFX (AST-007 Rows 1 & 2).
## Runs on a single Sprite2D quad with zero shaders for Intel HD 3000 safety.

const CELL_SIZE: int = 32
const FRAME_COUNT: int = 4
const DEFAULT_FPS: float = 8.0

var _row_index: int = 1
var _elapsed: float = 0.0
var _fps: float = DEFAULT_FPS


func configure(vfx_row: int, world_pos: Vector2, fps: float = DEFAULT_FPS) -> void:
	_row_index = clampi(vfx_row, 1, 2)
	_fps = maxf(fps, 1.0)
	_elapsed = 0.0
	global_position = world_pos
	texture = AssetPaths.load_texture("AST-007")
	centered = true
	offset = Vector2.ZERO
	region_enabled = true
	z_index = 0
	_apply_frame(0)


func _process(delta: float) -> void:
	_elapsed += delta
	var frame_idx: int = int(floor(_elapsed * _fps))
	if frame_idx >= FRAME_COUNT:
		queue_free()
		return
	_apply_frame(frame_idx)


func _apply_frame(frame_idx: int) -> void:
	region_rect = Rect2(
		float(frame_idx * CELL_SIZE),
		float(_row_index * CELL_SIZE),
		float(CELL_SIZE),
		float(CELL_SIZE)
	)
