## BUG 04 (INTENTIONALLY BROKEN): @export setter touches @onready child before _ready()
## and reaches upward with fragile get_parent().get_parent() coupling.
## DO NOT USE IN PRODUCTION — see ../fixed/bug_04_lifecycle_fixed.gd for root-cause fix.
class_name Bug04LifecycleBuggy
extends Control

@export var display_value: int = 0:
	set(value):
		display_value = value
		# DEFECT 1: During scene instantiation, @export setters execute BEFORE _ready(),
		# so _value_label is still null -> immediate runtime crash!
		_value_label.text = str(display_value)

@onready var _value_label: Label = $ValueLabel


func notify_parent_changed() -> void:
	# DEFECT 2: Fragile upward traversal breaks whenever scene hierarchy changes or runs standalone (F6).
	get_parent().get_parent().call(&"on_widget_updated", display_value)
