## BUG 01 (INTENTIONALLY BROKEN): Signal lambda leak + unguarded freed Node dereference.
## DO NOT USE IN PRODUCTION — see ../fixed/bug_01_fixed.gd for root-cause fix.
class_name Bug01SignalLeakBuggy
extends Node

var cached_target: Node2D = null
var _event_emitter: Node = null


func attach_to_emitter(emitter: Node, target: Node2D) -> void:
	_event_emitter = emitter
	cached_target = target
	# DEFECT 1: Anonymous lambda connected to a longer-lived emitter is never stored or disconnected!
	# Even after this node exits the tree, the emitter retains the closure reference.
	_event_emitter.connect(&"pulse", func(strength: float) -> void:
		# DEFECT 2: Dereferences cached_target without is_instance_valid()!
		# After target.queue_free(), cached_target != null is still deceptive / throws freed-object error.
		if cached_target != null:
			cached_target.position.x += strength
	)
