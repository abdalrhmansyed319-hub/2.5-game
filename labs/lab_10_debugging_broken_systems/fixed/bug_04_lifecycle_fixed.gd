## FIX 04: Guard @onready updates with is_node_ready(), sync in _ready(), and signal upward.
class_name Bug04LifecycleFixed
extends Control

signal value_updated(new_value: int)

@export var display_value: int = 0:
	set(value):
		if display_value == value:
			return
		display_value = value
		if is_node_ready():
			_sync_label()
		value_updated.emit(display_value)

@onready var _value_label: Label = get_node_or_null(^"ValueLabel") as Label


func _ready() -> void:
	_sync_label()


func _sync_label() -> void:
	if _value_label != null:
		_value_label.text = str(display_value)
