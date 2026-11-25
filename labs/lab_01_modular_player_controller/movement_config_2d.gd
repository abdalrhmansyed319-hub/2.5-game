## Immutable movement tuning profile shared safely as a read-only Resource.
class_name MovementConfig2D
extends Resource

## Maximum horizontal/planar speed in pixels per second.
@export_range(10.0, 2000.0, 1.0) var max_speed: float = 260.0
## Acceleration rate toward target velocity in pixels per second squared.
@export_range(10.0, 10000.0, 10.0) var acceleration: float = 1800.0
## Deceleration rate when input is neutral in pixels per second squared.
@export_range(10.0, 10000.0, 10.0) var friction: float = 2200.0
## Extra deceleration multiplier when reversing direction against current motion.
@export_range(1.0, 4.0, 0.05) var turn_multiplier: float = 1.6
