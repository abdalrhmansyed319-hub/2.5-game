## BUG 02 (INTENTIONALLY BROKEN): Double-delta CharacterBody2D velocity + synchronous physics flush mutation.
## DO NOT USE IN PRODUCTION — see ../fixed/bug_02_physics_fixed.gd for root-cause fix.
class_name Bug02PhysicsBuggy
extends CharacterBody2D

@export var speed: float = 240.0
@export var sensor_area: Area2D
@export var sensor_shape: CollisionShape2D


func _ready() -> void:
	if sensor_area != null:
		sensor_area.body_entered.connect(_on_sensor_body_entered)


func _physics_process(delta: float) -> void:
	var axis := Input.get_axis(&"move_left", &"move_right")
	# DEFECT 1: move_and_slide() already multiplies velocity by delta internally!
	# Multiplying by delta here scales velocity by 1/60th and makes speed tick-rate dependent.
	velocity.x = axis * speed * delta
	move_and_slide()


func _on_sensor_body_entered(_body: Node2D) -> void:
	# DEFECT 2: Mutating CollisionShape2D.disabled and Area2D.monitoring synchronously
	# inside a physics query flush callback triggers "Can't change this state while flushing queries"!
	if sensor_shape != null:
		sensor_shape.disabled = true
	if sensor_area != null:
		sensor_area.monitoring = false
