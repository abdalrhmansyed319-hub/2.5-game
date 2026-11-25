extends Node
## Minimal 5-Tier Audio Bus coordinator for VERDANT SIGNAL (Deliverable O).
##
## Verifies the expected audio bus layout at startup and exposes safe,
## bounded bus volume utilities for future settings/accessibility menus.

const REQUIRED_BUSES: PackedStringArray = [
	"Master",
	"Tier1_Critical",
	"Tier2_Action",
	"Tier3_World",
	"Tier4_Music",
	"Tier5_Atmosphere",
	"CaveReverb",
]


func verify_bus_layout() -> PackedStringArray:
	var missing: PackedStringArray = PackedStringArray()
	for bus_name: String in REQUIRED_BUSES:
		if AudioServer.get_bus_index(bus_name) == -1:
			missing.append(bus_name)
	return missing


func set_bus_volume_linear(bus_name: String, linear_volume: float) -> bool:
	var bus_idx: int = AudioServer.get_bus_index(bus_name)
	if bus_idx == -1:
		return false
	var clamped: float = clampf(linear_volume, 0.0, 1.0)
	AudioServer.set_bus_volume_db(bus_idx, linear_to_db(clamped))
	AudioServer.set_bus_mute(bus_idx, clamped <= 0.0001)
	return true
