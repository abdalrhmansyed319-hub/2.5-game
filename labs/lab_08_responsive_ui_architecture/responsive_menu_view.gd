## Responsive, controller-ready UI screen base using Godot 4.7 Control offset transforms
## for container-safe micro-animations and clean focus save/restore lifecycle.
class_name ResponsiveMenuView
extends Control

signal action_triggered(action_id: StringName)
signal close_requested()

@export var default_focus_control: Control
@export var focusable_buttons: Array[BaseButton] = []
@export var reduced_motion: bool = false
@export_range(1.0, 1.25, 0.01) var hover_scale: float = 1.05
@export_range(0.02, 0.4, 0.01) var hover_tween_duration: float = 0.09

var _previous_focus_owner: Control = null
var _button_tweens: Dictionary[int, Tween] = {}
var _bound_callbacks: Array[Dictionary] = []


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_wire_buttons()
	_configure_vertical_focus_loop()


func _exit_tree() -> void:
	_kill_all_tweens()
	_disconnect_bound_callbacks()


func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_action_pressed(&"ui_cancel"):
		close_requested.emit()
		get_viewport().set_input_as_handled()


func open_menu() -> void:
	_previous_focus_owner = get_viewport().gui_get_focus_owner()
	visible = true
	if default_focus_control != null and is_instance_valid(default_focus_control):
		default_focus_control.grab_focus()
	elif not focusable_buttons.is_empty() and is_instance_valid(focusable_buttons[0]):
		focusable_buttons[0].grab_focus()


func close_menu() -> void:
	visible = false
	if _previous_focus_owner != null and is_instance_valid(_previous_focus_owner):
		_previous_focus_owner.grab_focus()
	_previous_focus_owner = null


func _wire_buttons() -> void:
	for button in focusable_buttons:
		if button == null or not is_instance_valid(button):
			continue
		# Enable Godot 4.7 container-safe offset transforms without moving layout or mouse hitboxes.
		button.offset_transform_enabled = true
		button.offset_transform_visual_only = true
		button.offset_transform_pivot_ratio = Vector2(0.5, 0.5)

		var on_pressed := _on_button_pressed.bind(button)
		var on_enter := _on_button_highlight.bind(button, true)
		var on_exit := _on_button_highlight.bind(button, false)

		button.pressed.connect(on_pressed)
		button.mouse_entered.connect(on_enter)
		button.focus_entered.connect(on_enter)
		button.mouse_exited.connect(on_exit)
		button.focus_exited.connect(on_exit)

		_bound_callbacks.append({
			"button": button,
			"pressed": on_pressed,
			"enter": on_enter,
			"exit": on_exit,
		})


func _configure_vertical_focus_loop() -> void:
	var count := focusable_buttons.size()
	if count < 2:
		return
	for i in range(count):
		var current := focusable_buttons[i]
		var prev_btn := focusable_buttons[posmod(i - 1, count)]
		var next_btn := focusable_buttons[(i + 1) % count]
		if current == null or prev_btn == null or next_btn == null:
			continue
		current.focus_neighbor_top = current.get_path_to(prev_btn)
		current.focus_neighbor_bottom = current.get_path_to(next_btn)


func _on_button_pressed(button: BaseButton) -> void:
	var action_name := StringName(button.name)
	action_triggered.emit(action_name)


func _on_button_highlight(button: BaseButton, highlighted: bool) -> void:
	if not is_instance_valid(button):
		return
	var target_scale := Vector2(hover_scale, hover_scale) if highlighted else Vector2.ONE
	if reduced_motion:
		button.offset_transform_scale = target_scale
		return

	var key := button.get_instance_id()
	if _button_tweens.has(key):
		var existing: Tween = _button_tweens[key]
		if existing != null and existing.is_valid():
			existing.kill()

	var tween := button.create_tween()
	tween.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(button, "offset_transform_scale", target_scale, hover_tween_duration)
	_button_tweens[key] = tween


func _kill_all_tweens() -> void:
	for tween in _button_tweens.values():
		if tween != null and tween.is_valid():
			tween.kill()
	_button_tweens.clear()


func _disconnect_bound_callbacks() -> void:
	for entry in _bound_callbacks:
		var button: Variant = entry.get("button")
		if button == null or not is_instance_valid(button):
			continue
		var btn := button as BaseButton
		var on_pressed: Callable = entry["pressed"]
		var on_enter: Callable = entry["enter"]
		var on_exit: Callable = entry["exit"]
		if btn.pressed.is_connected(on_pressed):
			btn.pressed.disconnect(on_pressed)
		if btn.mouse_entered.is_connected(on_enter):
			btn.mouse_entered.disconnect(on_enter)
		if btn.focus_entered.is_connected(on_enter):
			btn.focus_entered.disconnect(on_enter)
		if btn.mouse_exited.is_connected(on_exit):
			btn.mouse_exited.disconnect(on_exit)
		if btn.focus_exited.is_connected(on_exit):
			btn.focus_exited.disconnect(on_exit)
	_bound_callbacks.clear()
