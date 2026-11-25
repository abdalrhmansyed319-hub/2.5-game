extends Control
## VERDANT SIGNAL — Pre-Production Bootstrap & Windows Environment Diagnostics.
##
## Purpose: Verify Godot version, active renderer, GPU adapter, display resolution,
## 480x270 scaling ratio, and 5-tier AudioBusLayout immediately on first Windows launch
## (resolving DDL-015 before Stage 05 Visual & Streaming Prototype coding begins).

const PROTOTYPE_SCENE_PATH: String = "res://world/rimlands_prototype.tscn"

@onready var _status_label: Label = $SafeMargin/FramePanel/ContentPad/Layout/DiagnosticsLabel


func _ready() -> void:
	GameState.set_phase(&"boot_diagnostics")
	var report: String = _build_diagnostics_report()
	_status_label.text = report
	print("\n" + report + "\n")


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var key_ev: InputEventKey = event as InputEventKey
		if key_ev.pressed and not key_ev.echo:
			if key_ev.keycode == KEY_ENTER or key_ev.keycode == KEY_SPACE:
				GameState.set_phase(&"m01_prototype")
				var err: Error = get_tree().change_scene_to_file(PROTOTYPE_SCENE_PATH)
				if err != OK:
					push_warning("Could not open Milestone 01 prototype: %d" % err)


func _build_diagnostics_report() -> String:
	var version_info: Dictionary = Engine.get_version_info()
	var version_str: String = _variant_to_display_string(version_info.get("string"), "unknown")
	var os_name: String = OS.get_name()
	var gpu_name: String = RenderingServer.get_video_adapter_name()
	var render_method: String = RenderingServer.get_current_rendering_method()
	var render_driver: String = RenderingServer.get_current_rendering_driver_name()
	var screen_size: Vector2i = DisplayServer.screen_get_size()
	var refresh_hz: float = DisplayServer.screen_get_refresh_rate()
	var window_size: Vector2i = DisplayServer.window_get_size()
	var viewport_size: Vector2i = GameState.DEFAULT_VIEWPORT_SIZE

	var scale_x: float = float(screen_size.x) / float(viewport_size.x)
	var scale_y: float = float(screen_size.y) / float(viewport_size.y)
	var missing_buses: PackedStringArray = AudioDirector.verify_bus_layout()
	var bus_status: String = "OK (%d buses)" % AudioServer.bus_count
	if not missing_buses.is_empty():
		bus_status = "MISSING: %s" % ", ".join(missing_buses)

	var placeholder_count: int = AssetPaths.get_placeholder_count()
	var total_assets: int = AssetPaths.get_total_tracked_assets()
	var art_status: String = (
		"TEMP DEBUG PLACEHOLDERS (%d/%d) — Visual Gate Pending"
		% [placeholder_count, total_assets]
		if placeholder_count > 0
		else "Production Art Loaded (0/%d placeholders)" % total_assets
	)

	var lines: PackedStringArray = PackedStringArray([
		"PROJECT   : %s — %s" % [GameState.PROJECT_TITLE, GameState.PLANET_DESIGNATION],
		"GODOT VER : %s (%s)" % [version_str, os_name],
		"RENDERER  : %s (%s)" % [render_method, render_driver],
		"GPU       : %s" % gpu_name,
		"MONITOR   : %dx%d @ %.1f Hz (480x270 scale: %.2fx / %.2fx)" % [
			screen_size.x,
			screen_size.y,
			refresh_hz,
			scale_x,
			scale_y,
		],
		"WINDOW    : %dx%d | Viewport: %dx%d | Tile: %dpx" % [
			window_size.x,
			window_size.y,
			viewport_size.x,
			viewport_size.y,
			GameState.BASE_TILE_SIZE_PX,
		],
		"AUDIO BUS : %s" % bus_status,
		"ART GATE  : %s" % art_status,
		"NEXT STEP : Press [ENTER] or [SPACE] to launch Milestone 01 Prototype",
	])
	return "\n".join(lines)


func _variant_to_display_string(value: Variant, fallback: String = "unknown") -> String:
	if value == null:
		return fallback
	var text: String = str(value)
	if text.is_empty():
		return fallback
	return text
