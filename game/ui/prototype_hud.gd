class_name PrototypeHud
extends CanvasLayer
## Diagnostic & Living World telemetry HUD for VERDANT SIGNAL (640x360 production layout).
## Transparently verifies production & V8.0 Living World asset status.

var _show_telemetry: bool = true

@onready var _banner_panel: PanelContainer = $PlaceholderBanner
@onready var _banner_label: Label = $PlaceholderBanner/BannerLabel
@onready var _telemetry_panel: PanelContainer = $TelemetryPanel
@onready var _telemetry_label: Label = $TelemetryPanel/TelemetryLabel
@onready var _controls_label: Label = $ControlsLabel


func _ready() -> void:
	_refresh_banner()
	_controls_label.text = (
		"WASD Move | Shift Run | C Crouch | Q/RMB Lens | E Sample | 1-8 Zones | T/F5 Mood | F6 Gust | F4 Col | Esc Boot"
	)


func toggle_telemetry() -> void:
	set_telemetry_visible(not _show_telemetry)


func set_telemetry_visible(enabled: bool) -> void:
	_show_telemetry = enabled
	_telemetry_panel.visible = _show_telemetry
	_banner_panel.visible = _show_telemetry
	_controls_label.visible = _show_telemetry


func update_telemetry(
	fps: float,
	frame_ms: float,
	adapter_name: String,
	world_status: String,
	actor_status: String,
	last_scan_text: String
) -> void:
	if not _show_telemetry:
		return
	_telemetry_label.text = (
		"FPS: %.0f (%.1f ms) | %s\n" % [fps, frame_ms, adapter_name]
		+ "%s\n%s\n" % [world_status, actor_status]
		+ "FIELD SCAN: %s" % last_scan_text
	)


func _refresh_banner() -> void:
	var missing_m01: int = AssetPaths.get_placeholder_count()
	var total_m01: int = AssetPaths.get_total_tracked_assets()
	var missing_v80: PackedStringArray = AssetPaths.verify_v80_living_world_assets()
	var missing_v90: PackedStringArray = AssetPaths.verify_v90_broken_shore_assets()
	if missing_m01 > 0 or not missing_v80.is_empty() or not missing_v90.is_empty():
		_banner_label.text = (
			"ASSET WARNING: M01 placeholders=%d/%d | V8.0 missing=%d | V9.0 missing=%d"
			% [missing_m01, total_m01, missing_v80.size(), missing_v90.size()]
		)
		return
	_banner_label.text = "VERDANT SIGNAL — V9.0 THE BROKEN SHORE + V8.0 LIVING FOREST (640x360 GL COMPATIBILITY)"
