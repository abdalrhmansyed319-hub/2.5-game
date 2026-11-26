class_name PrototypeHud
extends CanvasLayer
## Minimal diagnostic & placeholder-status HUD for Milestone 01 prototype.
## Always labels active temporary debug placeholders transparently so they are
## never confused with Stage 05 final artwork.

var _show_telemetry: bool = true

@onready var _banner_label: Label = $PlaceholderBanner/BannerLabel
@onready var _telemetry_panel: PanelContainer = $TelemetryPanel
@onready var _telemetry_label: Label = $TelemetryPanel/TelemetryLabel
@onready var _controls_label: Label = $ControlsLabel


func _ready() -> void:
	_refresh_banner()
	_controls_label.text = (
		"WASD/Arrows Move | C/Ctrl Crouch | Q/RMB Lens | T Time | F3 HUD | Esc Boot"
	)


func toggle_telemetry() -> void:
	_show_telemetry = not _show_telemetry
	_telemetry_panel.visible = _show_telemetry


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
		+ "LENS SCAN: %s" % last_scan_text
	)


func _refresh_banner() -> void:
	var missing: int = AssetPaths.get_placeholder_count()
	var total: int = AssetPaths.get_total_tracked_assets()
	if missing > 0:
		_banner_label.text = (
			"TEMP DEBUG PLACEHOLDER ART (%d/%d) - VISUAL GATE PENDING REAL ART"
			% [missing, total]
		)
		return
	_banner_label.text = "PRODUCTION ART LOADED (0/%d PLACEHOLDERS)" % total
