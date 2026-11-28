## BUG 03 (INTENTIONALLY BROKEN): Mutating a shared Resource blueprint directly across instances.
## DO NOT USE IN PRODUCTION — see ../fixed/bug_03_resource_fixed.gd for root-cause fix.
class_name Bug03SharedResourceBuggy
extends Node


class SharedStatsBlueprint extends Resource:
	@export var max_hp: float = 100.0
	@export var current_hp: float = 100.0


@export var stats: SharedStatsBlueprint


func apply_damage(amount: float) -> void:
	if stats == null:
		return
	# DEFECT: ResourceLoader caches .tres resources by path.
	# Mutating stats.current_hp here silently drops HP on EVERY actor sharing this .tres!
	stats.current_hp = maxf(0.0, stats.current_hp - amount)
