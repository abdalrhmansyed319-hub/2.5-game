## FIX 03: Immutable Resource blueprint + isolated per-instance runtime state.
class_name Bug03SharedResourceFixed
extends Node

signal hp_changed(current_hp: float, max_hp: float)
signal depleted()


class ActorStatsBlueprint extends Resource:
	@export_range(1.0, 100000.0, 1.0) var max_hp: float = 100.0


@export var blueprint: ActorStatsBlueprint

var _current_hp: float = 100.0


func _ready() -> void:
	_current_hp = get_max_hp()


func get_max_hp() -> float:
	return blueprint.max_hp if blueprint != null else 100.0


func get_current_hp() -> float:
	return _current_hp


func apply_damage(amount: float) -> void:
	if amount <= 0.0 or _current_hp <= 0.0:
		return
	# Mutates only this instance's runtime field; shared blueprint Resource stays immutable.
	_current_hp = maxf(0.0, _current_hp - amount)
	hp_changed.emit(_current_hp, get_max_hp())
	if is_zero_approx(_current_hp):
		depleted.emit()
