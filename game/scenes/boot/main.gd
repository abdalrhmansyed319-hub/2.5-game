extends Control
## VERDANT SIGNAL — Production Bootstrap & Windows Environment Diagnostics.
##
## Verifies Godot version, active renderer (GL Compatibility / ANGLE), GPU adapter,
## 640x360 integer scaling ratio, 5-tier AudioBusLayout, and integrated V8.0–V11.0
## Living World + Immersion + unmodified Mara assets before launching the playable world.

const PROTOTYPE_SCENE_PATH: String = "res://world/rimlands_prototype.tscn"

@onready var _status_label: Label = $SafeMargin/FramePanel/ContentPad/Layout/DiagnosticsLabel


func _ready() -> void:
	GameState.set_phase(&"boot_diagnostics")
	var report: String = _build_diagnostics_report()
	_status_label.text = report
	print("\n" + report + "\n")

	if "--capture-production-proofs" in OS.get_cmdline_user_args():
		call_deferred("_open_main_world")


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var key_ev: InputEventKey = event as InputEventKey
		if key_ev.pressed and not key_ev.echo:
			if key_ev.keycode == KEY_ENTER or key_ev.keycode == KEY_SPACE:
				_open_main_world()


func _open_main_world() -> void:
	GameState.set_phase(&"verdant_living_world")
	var err: Error = get_tree().change_scene_to_file(PROTOTYPE_SCENE_PATH)
	if err != OK:
		push_warning("Could not open VERDANT SIGNAL Living World: %d" % err)


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
	var missing_v80: PackedStringArray = AssetPaths.verify_v80_living_world_assets()
	var missing_v90: PackedStringArray = AssetPaths.verify_v90_broken_shore_assets()
	var missing_v100: PackedStringArray = AssetPaths.verify_v100_living_world_assets()
	var missing_v110: PackedStringArray = AssetPaths.verify_v110_immersion_assets()
	var art_status: String = (
		"V11 (%d/%d) + V10 (%d/%d) + V9 (%d/%d) + V8 (%d/%d) | 0/%d placeholders"
		% [
			AssetPaths.V110_REQUIRED_PATHS.size() - missing_v110.size(),
			AssetPaths.V110_REQUIRED_PATHS.size(),
			AssetPaths.V100_REQUIRED_PATHS.size() - missing_v100.size(),
			AssetPaths.V100_REQUIRED_PATHS.size(),
			AssetPaths.V90_REQUIRED_PATHS.size() - missing_v90.size(),
			AssetPaths.V90_REQUIRED_PATHS.size(),
			AssetPaths.V80_REQUIRED_PATHS.size() - missing_v80.size(),
			AssetPaths.V80_REQUIRED_PATHS.size(),
			total_assets,
		]
		if (
			placeholder_count == 0
			and missing_v80.is_empty()
			and missing_v90.is_empty()
			and missing_v100.is_empty()
			and missing_v110.is_empty()
		)
		else "WARNING: M01=%d/%d | V8=%d | V9=%d | V10=%d | V11=%d"
		% [placeholder_count, total_assets, missing_v80.size(), missing_v90.size(), missing_v100.size(), missing_v110.size()]
	)

	var lines: PackedStringArray = PackedStringArray([
		"PROJECT   : %s — %s" % [GameState.PROJECT_TITLE, GameState.PLANET_DESIGNATION],
		"GODOT VER : %s (%s)" % [version_str, os_name],
		"RENDERER  : %s (%s)" % [render_method, render_driver],
		"GPU       : %s" % gpu_name,
		"MONITOR   : %dx%d @ %.1f Hz (640x360 scale: %.2fx / %.2fx)" % [
			screen_size.x,
			screen_size.y,
			refresh_hz,
			scale_x,
			scale_y,
		],
		"WINDOW    : %dx%d | Viewport: %dx%d (Integer Pixel-Perfect)" % [
			window_size.x,
			window_size.y,
			viewport_size.x,
			viewport_size.y,
		],
		"AUDIO BUS : %s" % bus_status,
		"ART GATE  : %s" % art_status,
		"NEXT STEP : Press [ENTER] or [SPACE] to enter VERDANT SIGNAL Living World",
	])
	return "\n".join(lines)


func _variant_to_display_string(value: Variant, fallback: String = "unknown") -> String:
	if value == null:
		return fallback
	var text: String = str(value)
	if text.is_empty():
		return fallback
	return text
