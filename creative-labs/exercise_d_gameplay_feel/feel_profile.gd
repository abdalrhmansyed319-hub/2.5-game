class_name FeelProfile
extends Resource
## Data-driven gameplay feel tuning profile for A/B comparison (Exercise D).
## Allows toggling individual forgiveness & feedback layers without touching movement code.

@export var profile_name: String = "TunedResponsive"
@export_range(0.0, 0.25, 0.005) var coyote_time_sec: float = 0.11
@export_range(0.0, 0.25, 0.005) var jump_buffer_sec: float = 0.12
@export_range(0.2, 1.0, 0.05) var apex_gravity_scale: float = 0.55
@export_range(0.0, 120.0, 5.0) var apex_velocity_threshold: float = 45.0
@export_range(0.1, 1.0, 0.05) var jump_cut_multiplier: float = 0.45
@export_range(0.0, 8.0, 1.0) var corner_correction_px: float = 4.0
@export_range(0.0, 0.12, 0.005) var hitstop_sec: float = 0.045
@export var takeoff_stretch: Vector2 = Vector2(0.84, 1.22)
@export var landing_squash: Vector2 = Vector2(1.24, 0.78)
@export var reduced_motion: bool = false


static func create_raw_baseline() -> FeelProfile:
	var p := FeelProfile.new()
	p.profile_name = "RawBaseline"
	p.coyote_time_sec = 0.0
	p.jump_buffer_sec = 0.0
	p.apex_gravity_scale = 1.0
	p.apex_velocity_threshold = 0.0
	p.jump_cut_multiplier = 1.0
	p.corner_correction_px = 0.0
	p.hitstop_sec = 0.0
	p.takeoff_stretch = Vector2.ONE
	p.landing_squash = Vector2.ONE
	return p
