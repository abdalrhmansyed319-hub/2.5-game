## FIX 02: Units-per-second velocity for move_and_slide() + set_deferred() for physics flush safety.
class_name Bug02PhysicsFixed
extends CharacterBody2D

@export var speed: float = 240.0
@export var acceleration: float = 1800.0
@export var sensor_area: Area2D
@export var sensor_shape: CollisionShape2D


func _ready() -> void:
	if sensor_area != null:
		sensor_area.body_entered.connect(_on_sensor_body_entered)


func _physics_process(delta: float) -> void:
	var axis := Input.get_axis(&"move_left", &"move_right")
	var target_vx := axis * speed
	# Acceleration multiplies by delta; velocity itself stays in px/sec for move_and_slide().
	velocity.x = move_toward(velocity.x, target_vx, acceleration * delta)
	move_and_slide()


func _on_sensor_body_entered(_body: Node2D) -> void:
	# Defer collision/monitoring state mutations until after the physics query flush completes.
	if sensor_shape != null and is_instance_valid(sensor_shape):
		sensor_shape.set_deferred(&"disabled", true)
	if sensor_area != null and is_instance_valid(sensor_area):
		sensor_area.set_deferred(&"monitoring", false)
