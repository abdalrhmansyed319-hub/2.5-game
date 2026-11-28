class_name PrototypeHud
extends CanvasLayer
## Immersion-First Field Exploration HUD & Optional F3 Diagnostics for VERDANT SIGNAL (V11.0).
##
## Keeps the 640x360 pixel-art world serene and unobstructed during normal exploration:
##   - Soft region arrival title whispers when entering new landmarks/biomes
##   - Contextual proximity prompt ONLY when Mara stands near a real discovery
##   - Compact translucent Field Observation / Emergent Insight cards on [Q] & [E]
##   - Toggleable Field Journal overlay ([Tab] / [J]) showing working hypothesis & notes
##   - Full developer telemetry & asset health banner preserved behind [F3]

var _show_telemetry: bool = false
var _journal_open: bool = false

var _region_timer: float = 0.0
var _region_duration: float = 3.2
var _obs_timer: float = 0.0
var _obs_duration: float = 5.8
var _queued_obs: Dictionary = {}
var _opening_hint_timer: float = 9.0
var _prompt_target_alpha: float = 0.0
var _prompt_alpha: float = 0.0

@onready var _banner_panel: PanelContainer = $PlaceholderBanner
@onready var _banner_label: Label = $PlaceholderBanner/BannerLabel
@onready var _telemetry_panel: PanelContainer = $TelemetryPanel
@onready var _telemetry_label: Label = $TelemetryPanel/TelemetryLabel
@onready var _controls_label: Label = $ControlsLabel

@onready var _region_label: Label = $RegionWhisperLabel
@onready var _obs_panel: PanelContainer = $ObservationCardPanel
@onready var _obs_header: Label = $ObservationCardPanel/ObsBox/ObsHeaderLabel
@onready var _obs_body: Label = $ObservationCardPanel/ObsBox/ObsBodyLabel
@onready var _prompt_panel: PanelContainer = $ProximityPromptPanel
@onready var _prompt_label: Label = $ProximityPromptPanel/ProximityPromptLabel
@onready var _opening_hint: Label = $OpeningWhisperLabel

@onready var _journal_overlay: PanelContainer = $FieldJournalOverlay
@onready var _journal_title: Label = $FieldJournalOverlay/JournalBox/JournalTitleLabel
@onready var _journal_hypothesis: Label = $FieldJournalOverlay/JournalBox/HypothesisLabel
@onready var _journal_body: Label = $FieldJournalOverlay/JournalBox/JournalBodyLabel


func _ready() -> void:
	_refresh_banner()
	_controls_label.text = (
		"WASD Move | Shift Run | C Crouch | Q/RMB Lens | E Sample | Tab/J Journal | 1-8 Zones | T Mood | F6 Gust | F3 Diag | F4 Col | Esc Boot"
	)
	set_telemetry_visible(false)
	_obs_panel.visible = false
	_prompt_panel.visible = false
	_journal_overlay.visible = false
	_region_label.modulate = Color(1.0, 1.0, 1.0, 0.0)


func _process(delta: float) -> void:
	# Smooth region arrival whisper fade-in / hold / fade-out
	if _region_timer > 0.0:
		_region_timer = maxf(0.0, _region_timer - delta)
		var elapsed: float = _region_duration - _region_timer
		var alpha: float = 1.0
		if elapsed < 0.45:
			alpha = elapsed / 0.45
		elif _region_timer < 0.85:
			alpha = _region_timer / 0.85
		_region_label.modulate = Color(1.0, 1.0, 1.0, clampf(alpha, 0.0, 1.0))
	elif _region_label.modulate.a > 0.0:
		_region_label.modulate = Color(1.0, 1.0, 1.0, 0.0)

	# Smooth Field Observation / Insight card fade (+ graceful 1-slot follow-up Insight beat)
	if _obs_timer > 0.0:
		_obs_timer = maxf(0.0, _obs_timer - delta)
		var o_elapsed: float = _obs_duration - _obs_timer
		var o_alpha: float = 1.0
		if o_elapsed < 0.22:
			o_alpha = o_elapsed / 0.22
		elif _obs_timer < 0.75:
			o_alpha = _obs_timer / 0.75
		_obs_panel.visible = not _journal_open
		_obs_panel.modulate = Color(1.0, 1.0, 1.0, clampf(o_alpha, 0.0, 1.0))
		if _obs_timer <= 0.0 and not _queued_obs.is_empty():
			var nxt: Dictionary = _queued_obs
			_queued_obs = {}
			var sfx_v: Variant = nxt.get("play_insight_sfx", false)
			if sfx_v is bool and (sfx_v as bool):
				AudioDirector.play_insight_discovery()
			var acc_v: Variant = nxt.get("accent", Color(1.0, 0.86, 0.48, 1.0))
			var acc_col: Color = acc_v as Color if acc_v is Color else Color(1.0, 0.86, 0.48, 1.0)
			show_field_observation(
				str(nxt.get("badge", "FIELD INSIGHT")),
				str(nxt.get("title", "")),
				str(nxt.get("body", "")),
				acc_col,
				float(nxt.get("duration", 7.0))
			)
	elif _obs_panel.visible:
		_obs_panel.visible = false

	# Soft contextual proximity prompt alpha easing
	var target_a: float = 0.0 if _journal_open else _prompt_target_alpha
	_prompt_alpha = move_toward(_prompt_alpha, target_a, delta * 5.2)
	_prompt_panel.visible = _prompt_alpha > 0.02
	if _prompt_panel.visible:
		_prompt_panel.modulate = Color(1.0, 1.0, 1.0, _prompt_alpha)

	# Subtle opening control whisper fades out gracefully once player settles in
	if _opening_hint_timer > 0.0:
		_opening_hint_timer = maxf(0.0, _opening_hint_timer - delta)
		var hint_alpha: float = clampf(_opening_hint_timer / 2.2, 0.0, 1.0)
		_opening_hint.visible = (not _show_telemetry) and (not _journal_open) and hint_alpha > 0.02
		_opening_hint.modulate = Color(1.0, 1.0, 1.0, hint_alpha)
	elif _opening_hint.visible:
		_opening_hint.visible = false


func toggle_telemetry() -> void:
	set_telemetry_visible(not _show_telemetry)


func set_telemetry_visible(enabled: bool) -> void:
	_show_telemetry = enabled
	_telemetry_panel.visible = _show_telemetry
	_banner_panel.visible = _show_telemetry
	_controls_label.visible = _show_telemetry
	if _show_telemetry:
		_opening_hint.visible = false


func is_journal_open() -> bool:
	return _journal_open


func toggle_field_journal() -> bool:
	set_journal_open(not _journal_open)
	return _journal_open


func set_journal_open(open_state: bool) -> void:
	_journal_open = open_state
	_journal_overlay.visible = _journal_open
	if _journal_open:
		_refresh_journal_content()
		_obs_panel.visible = false
		_prompt_panel.visible = false
		_opening_hint.visible = false


func announce_region(region_title: String) -> void:
	if region_title.is_empty():
		return
	_region_label.text = region_title
	_region_duration = 3.2
	_region_timer = _region_duration


func update_proximity_prompt(prompt_text: String) -> void:
	if prompt_text.is_empty():
		_prompt_target_alpha = 0.0
		return
	_prompt_label.text = prompt_text
	_prompt_target_alpha = 1.0


func show_field_observation(
	badge: String,
	title: String,
	body_note: String,
	accent_color: Color = Color(0.54, 0.96, 0.88, 1.0),
	duration_sec: float = 5.8
) -> void:
	_queued_obs = {}
	_obs_header.text = "%s  •  %s" % [badge, title]
	_obs_header.add_theme_color_override("font_color", accent_color)
	_obs_body.text = body_note
	_obs_duration = maxf(2.4, duration_sec)
	_obs_timer = _obs_duration
	_opening_hint_timer = minf(_opening_hint_timer, 1.4)
	if not _journal_open:
		_obs_panel.visible = true
	else:
		_refresh_journal_content()


func queue_field_observation(
	badge: String,
	title: String,
	body_note: String,
	accent_color: Color = Color(1.0, 0.86, 0.48, 1.0),
	duration_sec: float = 7.0,
	play_insight_sfx: bool = true
) -> void:
	if _obs_timer <= 0.1:
		if play_insight_sfx:
			AudioDirector.play_insight_discovery()
		show_field_observation(badge, title, body_note, accent_color, duration_sec)
		return
	_obs_timer = minf(_obs_timer, 2.5)
	_queued_obs = {
		"badge": badge,
		"title": title,
		"body": body_note,
		"accent": accent_color,
		"duration": duration_sec,
		"play_insight_sfx": play_insight_sfx,
	}


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


func _refresh_journal_content() -> void:
	var all_entries: Array[Dictionary] = FieldCodex.get_all_entries()
	var discovered_ids: PackedStringArray = GameState.get_discovered_ids()
	var unlocked_insights: PackedStringArray = GameState.unlocked_insight_ids
	var total_entries: int = all_entries.size()
	var total_insights: int = FieldCodex.get_all_insights().size()

	_journal_title.text = "DR. MARA LIN — OURA-IV FIELD JOURNAL   (%d/%d logged  •  %d/%d insights)" % [
		discovered_ids.size(),
		total_entries,
		unlocked_insights.size(),
		total_insights,
	]

	var hyp: Dictionary = FieldCodex.get_working_hypothesis(unlocked_insights)
	_journal_hypothesis.text = "%s\n%s" % [
		str(hyp.get("stage", "Working Hypothesis I")),
		str(hyp.get("summary", "")),
	]

	var lines: PackedStringArray = PackedStringArray()
	if not unlocked_insights.is_empty():
		lines.append("EMERGENT INSIGHTS:")
		for ins: Dictionary in FieldCodex.get_all_insights():
			var iid: String = str(ins.get("id", ""))
			if unlocked_insights.has(iid):
				lines.append("  * %s — %s" % [str(ins.get("title", "")), str(ins.get("note", ""))])
		lines.append("")

	lines.append("RECENT FIELD OBSERVATIONS:")
	if discovered_ids.is_empty():
		lines.append("  No observations recorded yet.")
		lines.append("  Hold [Q] / RMB to sweep the Acoustic Field Lens across the shore, or press [E] near landmarks and traces.")
	else:
		# Display up to 7 most recent logged entries cleanly inside 640x360 viewport
		var start_idx: int = maxi(0, discovered_ids.size() - 7)
		var idx: int = discovered_ids.size() - 1
		while idx >= start_idx:
			var sid: String = discovered_ids[idx]
			var entry: Dictionary = FieldCodex.find_by_id(sid)
			if not entry.is_empty():
				var sampled: bool = GameState.is_site_sampled(sid)
				var tag: String = "[SAMPLE]" if sampled else "[SCAN]"
				var note: String = str(entry.get("sample_note", "")) if sampled else str(entry.get("scan_note", ""))
				lines.append("  %s %s — %s" % [tag, str(entry.get("name", "")), note])
			idx -= 1

	_journal_body.text = "\n".join(lines)


func _refresh_banner() -> void:
	var missing_m01: int = AssetPaths.get_placeholder_count()
	var total_m01: int = AssetPaths.get_total_tracked_assets()
	var missing_v80: PackedStringArray = AssetPaths.verify_v80_living_world_assets()
	var missing_v90: PackedStringArray = AssetPaths.verify_v90_broken_shore_assets()
	var missing_v100: PackedStringArray = AssetPaths.verify_v100_living_world_assets()
	var missing_v110: PackedStringArray = AssetPaths.verify_v110_immersion_assets()
	if (
		missing_m01 > 0
		or not missing_v80.is_empty()
		or not missing_v90.is_empty()
		or not missing_v100.is_empty()
		or not missing_v110.is_empty()
	):
		_banner_label.text = (
			"ASSET WARNING: M01=%d/%d | V8=%d | V9=%d | V10=%d | V11=%d"
			% [missing_m01, total_m01, missing_v80.size(), missing_v90.size(), missing_v100.size(), missing_v110.size()]
		)
		return
	_banner_label.text = "VERDANT SIGNAL V11.0 — THE ART OF IMMERSION (640x360 GL COMPATIBILITY)"
