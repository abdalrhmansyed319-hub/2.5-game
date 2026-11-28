## Abstract input provider contract (Godot 4.5+ @abstract).
## Swap implementations freely for human input, scripted tests, replays, or AI.
@abstract
class_name InputSource2D
extends Node


@abstract
func sample_intent(delta: float) -> InputIntent2D
