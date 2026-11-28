extends Node2D
## VERDANT SIGNAL V7.1 — Isolated Continuous Multi-Zone Forest Recomposition Study (480x270 Native)
## Connects Zone A (Dense Corridor) -> Zone B (Deep Interior) -> Zone C (Dramatic Clearing)
## Protected by .gdignore so M01 and V7.0 remain 100% untouched.

const WALK_SPEED := 78.0
const WORLD_W := 1440.0
const WORLD_H := 340.0
const VIEW_W := 480.0
const VIEW_H := 270.0

@onready var mara: CharacterBody2D = $YSortWorld/Mara
@onready var cam: Camera2D = $YSortWorld/Mara/Camera2D

func _ready() -> void:
	cam.limit_left = 0
	cam.limit_top = 24
	cam.limit_right = int(WORLD_W)
	cam.limit_bottom = int(WORLD_H)
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 6.0

func _physics_process(_delta: float) -> void:
	var dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	mara.velocity = dir * WALK_SPEED
	mara.move_and_slide()
	mara.position.x = clampf(mara.position.x, 48.0, 1392.0)
	mara.position.y = clampf(mara.position.y, 162.0, 318.0)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_1: mara.position = Vector2(256, 266) # A. Dense Forest Corridor
			KEY_2: mara.position = Vector2(734, 256) # B. Deep Forest Interior
			KEY_3: mara.position = Vector2(1202, 274) # C. Dramatic Forest Clearing
