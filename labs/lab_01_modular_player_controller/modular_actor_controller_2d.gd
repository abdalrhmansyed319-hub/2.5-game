## Composition-based CharacterBody2D coordinator wiring InputSource2D + PlanarMotor2D.
## Owns zero hardcoded input polling or tuning math; delegates to injected child components.
@tool
class_name ModularActorController2D
extends CharacterBody2D

signal moved(current_velocity: Vector2, collided: bool)
signal interact_requested()

@export var input_source: InputSource2D
@export var motor: PlanarMotor2D
@export var control_enabled: bool = true


func _ready() -> void:
	if Engine.is_editor_hint():
		return
	motion_mode = CharacterBody2D.MOTION_MODE_FLOATING
	if input_source == null:
		push_error("ModularActorController2D: Missing InputSource2D dependency.")
	if motor == null:
		push_error("ModularActorController2D: Missing PlanarMotor2D dependency.")


func _physics_process(delta: float) -> void:
	if Engine.is_editor_hint():
		return
	if not control_enabled or input_source == null or motor == null:
		return

	var intent: InputIntent2D = input_source.sample_intent(delta)
	velocity = motor.compute_velocity(velocity, intent.move_axis, delta)
	var collided := move_and_slide()
	moved.emit(velocity, collided)

	if intent.interact_just_pressed:
		interact_requested.emit()


func teleport_to(target_global_position: Vector2) -> void:
	global_position = target_global_position
	velocity = Vector2.ZERO
	reset_physics_interpolation()


func _get_configuration_warnings() -> PackedStringArray:
	var warnings := PackedStringArray()
	if input_source == null:
		warnings.append("Assign an InputSource2D child node to 'input_source'.")
	if motor == null:
		warnings.append("Assign a PlanarMotor2D child node to 'motor'.")
	return warnings
