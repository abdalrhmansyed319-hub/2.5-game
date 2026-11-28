class_name FieldCodex
extends RefCounted
## Unified Xenobiological Field Codex, Mystery Clues & Emergent Hypothesis Engine (V11.0).
##
## Authoritative registry of all 27 discoverable features across The Broken Shore,
## the breached ICV Meridian, and the V8.0 Living Forest Sanctuary. Enforces the
## Deliverable D 4-layer competing-hypothesis pacing: builds wonder, forensic intrigue,
## and ecological tension WITHOUT prematurely spoiling late-game planetary intelligence.

const INTERACT_RANGE_PX: float = 112.0
const SCAN_ECHO_RANGE_PX: float = 175.0
const DISTANT_HINT_RANGE_PX: float = 440.0

static var _cached_entries: Array[Dictionary] = []
static var _cached_insights: Array[Dictionary] = []


static func get_all_entries() -> Array[Dictionary]:
	if not _cached_entries.is_empty():
		return _cached_entries
	_cached_entries = [
		# --- ZONE B & B2: ICV MERIDIAN CRASH & BREACHED AFT BAY ---
		{
			"id": "meridian_hull",
			"name": "ICV Meridian Lander Hull",
			"region": "Broken Shore",
			"kind": "meridian",
			"pos": Vector2(1300.0, 2168.0),
			"radius": 136.0,
			"interior_only": false,
			"linked_id": "meridian_field_relay",
			"scan_note": "EM arc-scarring across the port hull — not atmospheric friction. Something pulsed through the landing gear.",
			"sample_note": "Logged fused ceramic residue from the hull breach. Aft cargo ramp is sprung open — interior should still hold power.",
		},
		{
			"id": "meridian_nav_console",
			"name": "ICV Meridian Nav Console",
			"region": "ICV Meridian",
			"kind": "meridian",
			"pos": Vector2(1336.0, 2142.0),
			"radius": 78.0,
			"interior_only": true,
			"linked_id": "rescue_beacon_shore",
			"scan_note": "Black-box buffer intact: descent thrusters tripped during a synchronized 43 Hz ground-wave surge.",
			"sample_note": "Recovered descent telemetry. The EM spike originated beneath the coast, not from orbit — and repeated in clean prime intervals.",
		},
		{
			"id": "meridian_supply_locker",
			"name": "Emergency Exo-Survey Locker",
			"region": "ICV Meridian",
			"kind": "meridian",
			"pos": Vector2(1272.0, 2152.0),
			"radius": 76.0,
			"interior_only": true,
			"linked_id": "",
			"scan_note": "Breathable membrane cartridges and acoustic calibration cells survived impact.",
			"sample_note": "Inventory checked: enough filter seals for inland fieldwork, but orbital uplink modules are completely cooked.",
		},
		{
			"id": "meridian_specimens",
			"name": "Bio-Containment Canister Rack",
			"region": "ICV Meridian",
			"kind": "meridian",
			"pos": Vector2(1392.0, 2166.0),
			"radius": 78.0,
			"interior_only": true,
			"linked_id": "meridian_specimen_pod",
			"scan_note": "Five stasis cylinders locked tight; one berth stands torn open from the crash deceleration.",
			"sample_note": "Sterile sample vials secured. Whatever cracked out of Bay 6 landed somewhere east of the aft ramp.",
		},
		{
			"id": "rescue_beacon_shore",
			"name": "Meridian Rescue Beacon Pod",
			"region": "Broken Shore",
			"kind": "meridian",
			"pos": Vector2(944.0, 2258.0),
			"radius": 96.0,
			"interior_only": false,
			"linked_id": "meridian_field_relay",
			"scan_note": "Cracked transponder broadcasting a weak distress ping — faintly modulated by an incoming ground harmonic.",
			"sample_note": "Beacon antenna is sheared below orbital threshold. Strangely, its receiver keeps locking onto echoes from the northern treeline.",
		},
		{
			"id": "detached_thruster",
			"name": "Sheared Retro-Thruster Cowling",
			"region": "Broken Shore",
			"kind": "meridian",
			"pos": Vector2(1054.0, 2236.0),
			"radius": 96.0,
			"interior_only": false,
			"linked_id": "",
			"scan_note": "Torn ceramic heat-tiles and fused propulsion manifold half-buried in the impact furrow.",
			"sample_note": "Engine bell tore clean off on touchdown. Sand beneath the manifold already holds tiny salt-tolerant sprouts.",
		},
		{
			"id": "meridian_field_relay",
			"name": "Meridian Field Telemetry Relay",
			"region": "Broken Shore",
			"kind": "harmonic",
			"pos": Vector2(1098.0, 2144.0),
			"radius": 96.0,
			"interior_only": false,
			"linked_id": "ancient_waymarker_stone",
			"scan_note": "Emergency uplink mast echoing a clean prime-interval hum arriving from due north.",
			"sample_note": "Logged relay spectrum: 3-beat, 5-beat, 7-beat pauses. Too regular for surf, too slow for human machinery.",
		},
		{
			"id": "meridian_specimen_pod",
			"name": "Cracked Exo-Survey Specimen Pod",
			"region": "Broken Shore",
			"kind": "organic",
			"pos": Vector2(1466.0, 2236.0),
			"radius": 94.0,
			"interior_only": false,
			"linked_id": "tidal_biolum_coral",
			"scan_note": "Shattered stasis glass venting faint turquoise pollen — coastal spore-moths keep circling the leak.",
			"sample_note": "Collected coastal condensate from the cracked seal. Native Oura-IV micro-flora colonized the nutrient gel within hours.",
		},
		# --- ZONE C: TIDEPOOL COAST & OUTER SURGE CHANNEL ---
		{
			"id": "tidepool_amber_kelp",
			"name": "Amber Tide-Kelp Colony (fl_01)",
			"region": "Broken Shore",
			"kind": "organic",
			"pos": Vector2(1762.0, 2188.0),
			"radius": 108.0,
			"interior_only": false,
			"linked_id": "tidal_biolum_coral",
			"scan_note": "Honey-gold gas bladders sway in phase with the tide — pulsing softly warmer under acoustic sweeps.",
			"sample_note": "Clipped a buoyant kelp frond. Its translucent cells hold a trace piezo-saline fluid that hums softly when flexed.",
		},
		{
			"id": "tidal_biolum_coral",
			"name": "Tidal Bioluminescent Coral Fan",
			"region": "Broken Shore",
			"kind": "harmonic",
			"pos": Vector2(1736.0, 2208.0),
			"radius": 98.0,
			"interior_only": false,
			"linked_id": "outer_surge_resonance",
			"scan_note": "Branching cyan marine polyps brightening in rhythm with the ocean swell's low-frequency undertow.",
			"sample_note": "Sampled polyp mucus: contains symbiotic luminescent algae tuned to the exact coastal swell cadence.",
		},
		{
			"id": "mirror_glasswort_cluster",
			"name": "Mirror Glasswort Spire (fl_02)",
			"region": "Broken Shore",
			"kind": "organic",
			"pos": Vector2(1848.0, 2056.0),
			"radius": 96.0,
			"interior_only": false,
			"linked_id": "",
			"scan_note": "Silica-faceted succulent acting like a miniature solar reflector — rings faintly when tapped by wind.",
			"sample_note": "Logged glasswort crystal lattice. Its quartz-like stems channel salt mist straight down into coastal sand roots.",
		},
		{
			"id": "outer_surge_resonance",
			"name": "Resonant Tidal Surge Channel",
			"region": "Hidden Trace",
			"kind": "harmonic",
			"pos": Vector2(1892.0, 2212.0),
			"radius": 96.0,
			"interior_only": false,
			"linked_id": "ancient_waymarker_stone",
			"scan_note": "Ocean swell funnels through carved piezo-basalt grooves — humming at 43 Hz, matching Meridian's crash static.",
			"sample_note": "Recorded the surge channel: even four seconds after a wave recedes, the stone lip keeps vibrating as if answered from inland.",
		},
		# --- ZONE D & E: WESTERN BASALT HEADLAND & COASTAL MEADOW (HIDDEN TRACES!) ---
		{
			"id": "basalt_headland_monolith",
			"name": "Stratified Piezo-Basalt Cliff",
			"region": "Broken Shore",
			"kind": "harmonic",
			"pos": Vector2(510.0, 1960.0),
			"radius": 112.0,
			"interior_only": false,
			"linked_id": "surveyor01_peg",
			"scan_note": "Quartz-veined volcanic strata vibrating with distant ocean swell — textbook geophysical piezo-resonance.",
			"sample_note": "Chipped a piezo-basalt flake. Natural geology explains the carrier hum... though not the deliberate pauses inside it.",
		},
		{
			"id": "surveyor01_peg",
			"name": "Weathered Titanium Survey Peg",
			"region": "Hidden Trace",
			"kind": "surveyor",
			"pos": Vector2(468.0, 2224.0),
			"radius": 88.0,
			"interior_only": false,
			"linked_id": "driftwood_tide_cache",
			"scan_note": "Non-Meridian titanium alloy wedged in the basalt lee — salt-pitted stamping reads 'SRV-01 // K.V.'.",
			"sample_note": "A Solstice survey stake at least fifteen years old. The briefing swore Oura-IV was an untouched first landing.",
		},
		{
			"id": "coastal_blight_crust",
			"name": "Ash-Grey Mineralized Root Crust",
			"region": "Hidden Trace",
			"kind": "blight",
			"pos": Vector2(478.0, 1796.0),
			"radius": 90.0,
			"interior_only": false,
			"linked_id": "sw_blight_trace",
			"scan_note": "Dampened acoustic return — inert metallic residue deadening every root capillary it touches.",
			"sample_note": "Scraped chalky grey catalyst salt off a choked coastal root. Nothing natural on Oura-IV produces this alloy signature.",
		},
		{
			"id": "driftwood_tide_cache",
			"name": "Cord-Bound Driftwood Marker",
			"region": "Hidden Trace",
			"kind": "surveyor",
			"pos": Vector2(846.0, 1742.0),
			"radius": 94.0,
			"interior_only": false,
			"linked_id": "ancient_waymarker_stone",
			"scan_note": "Hand-knotted polymer cord beside seven knife-carved tallies — spaced in unmistakable prime intervals.",
			"sample_note": "Someone sat on this coastal ridge counting tidal surges, then left a final directional notch pointing straight into the canopy.",
		},
		# --- ZONE F: INLAND GATEWAY & ECOTONE THRESHOLD ---
		{
			"id": "ancient_waymarker_stone",
			"name": "Pre-Arrival Harmonic Waymarker",
			"region": "Broken Shore",
			"kind": "harmonic",
			"pos": Vector2(1032.0, 1528.0),
			"radius": 112.0,
			"interior_only": false,
			"linked_id": "colossal_buttress",
			"scan_note": "Moss-draped monolith resonating cleanly with the northern treeline — too smooth to be wind-carved alone.",
			"sample_note": "Traced hairline quartz veins spiraling down into the soil. Every acoustic sweep sends a faint reply deep into the forest.",
		},
		{
			"id": "inland_gateway_threshold",
			"name": "Singing Canopy Inland Gateway",
			"region": "Broken Shore",
			"kind": "organic",
			"pos": Vector2(1142.0, 1470.0),
			"radius": 116.0,
			"interior_only": false,
			"linked_id": "south_basins",
			"scan_note": "Salt air gives way to cool humid moss; root webs knit shore and canopy beneath the trail.",
			"sample_note": "Soil transition logged: marine silica yields cleanly to dense, faintly conductive fungal loam heading north.",
		},
		# --- V8.0 LIVING FOREST SANCTUARY (7 APPROVED + 2 HIDDEN WESTERN DISCOVERIES) ---
		{
			"id": "south_basins",
			"name": "Mossy Rain Basin",
			"region": "Living Forest",
			"kind": "organic",
			"pos": Vector2(1144.0, 1038.0),
			"radius": 96.0,
			"interior_only": false,
			"linked_id": "colossal_buttress",
			"scan_note": "Mirror-calm rainwater pool rippled by faint sub-surface root vibrations even in dead calm.",
			"sample_note": "Water tests crisp and potable after basic filtration — rich with harmless luminous cyan micro-spores.",
		},
		{
			"id": "colossal_buttress",
			"name": "Colossal Buttress Reedwood",
			"region": "Living Forest",
			"kind": "harmonic",
			"pos": Vector2(1088.0, 796.0),
			"radius": 116.0,
			"interior_only": false,
			"linked_id": "chime_reeds",
			"scan_note": "Hollow wind-slits along the towering trunk turn every breeze into a low resonant wood-flute fifth.",
			"sample_note": "Core-bark reading: this single Reedwood's root chamber acts like a cathedral resonator across the whole clearing.",
		},
		{
			"id": "chime_reeds",
			"name": "Chime-Reed Outcrop",
			"region": "Living Forest",
			"kind": "harmonic",
			"pos": Vector2(1712.0, 774.0),
			"radius": 108.0,
			"interior_only": false,
			"linked_id": "waystone_spiral",
			"scan_note": "Clusters of glassy hollow reeds echoing Mara's scanner tones a half-second later in sympathetic harmony.",
			"sample_note": "Recorded Chime-Reed overtones — identical harmonic ratios to the frequency spike on Meridian's black-box.",
		},
		{
			"id": "clearing_pools",
			"name": "Reflective Canopy Pool",
			"region": "Living Forest",
			"kind": "organic",
			"pos": Vector2(1584.0, 866.0),
			"radius": 96.0,
			"interior_only": false,
			"linked_id": "chime_reeds",
			"scan_note": "Sunlit mineral spring where woodland butterflies gather; delicate rings form whenever nearby reeds hum.",
			"sample_note": "Logged spring chemistry: trace dissolved quartz gives the pool extraordinary acoustic clarity.",
		},
		{
			"id": "exposed_root_arch",
			"name": "Exposed Root Archway",
			"region": "Living Forest",
			"kind": "organic",
			"pos": Vector2(1118.0, 472.0),
			"radius": 104.0,
			"interior_only": false,
			"linked_id": "nw_mycelial_seam",
			"scan_note": "Intertwined aerial roots forming an acoustic tunnel — footsteps ring with wet cavern reverb underneath.",
			"sample_note": "Beneath the arch bark, fine pale fungal threads fuse roots from three separate tree species into one continuous lattice.",
		},
		{
			"id": "waystone_spiral",
			"name": "Waystone Spiral Conduit",
			"region": "Living Forest",
			"kind": "harmonic",
			"pos": Vector2(1694.0, 466.0),
			"radius": 112.0,
			"interior_only": false,
			"linked_id": "ancient_waymarker_stone",
			"scan_note": "Ancient spiral piezo-stone embraced by glowing roots — answers Mara's Acoustic Field Lens with a warm chord.",
			"sample_note": "Deep acoustic lock confirmed: the spiral isn't a machine at all — roots grew through natural piezo-stone to amplify planetary pulses.",
		},
		{
			"id": "hollow_log_fungi",
			"name": "Luminous Bracket Fungi Log",
			"region": "Living Forest",
			"kind": "organic",
			"pos": Vector2(616.0, 916.0),
			"radius": 106.0,
			"interior_only": false,
			"linked_id": "sw_blight_trace",
			"scan_note": "Fallen timber glowing warmly with shelf fungi — bioluminescence brightens noticeably toward the south-west.",
			"sample_note": "Sampled amber bracket mycelium. Its glow intensifies near stress zones, almost like a biological alarm barrier.",
		},
		{
			"id": "nw_mycelial_seam",
			"name": "Sub-Bark Luminous Mycelium",
			"region": "Hidden Trace",
			"kind": "harmonic",
			"pos": Vector2(596.0, 568.0),
			"radius": 92.0,
			"interior_only": false,
			"linked_id": "waystone_spiral",
			"scan_note": "Hair-thin turquoise filaments pulsing beneath wet bark — synchronized within 0.2s of the eastern Waystone.",
			"sample_note": "Logged luminous filament impulse. Even out here in the shaded western grove, signals travel faster than chemical diffusion allows.",
		},
		{
			"id": "sw_blight_trace",
			"name": "Choked Root-Nerve Tendril",
			"region": "Hidden Trace",
			"kind": "blight",
			"pos": Vector2(668.0, 1108.0),
			"radius": 92.0,
			"interior_only": false,
			"linked_id": "coastal_blight_crust",
			"scan_note": "Same ash-grey metallic crust from the basalt shore — dulling the scanner into brief dry static.",
			"sample_note": "The deadened root stops abruptly against a wall of bright amber bracket fungi. Whatever this blight is, the forest is fighting it.",
		},
	]
	return _cached_entries


static func get_all_insights() -> Array[Dictionary]:
	if not _cached_insights.is_empty():
		return _cached_insights
	_cached_insights = [
		{
			"id": "insight_prime_echo",
			"title": "The Prime-Interval Echo",
			"note": "The 43 Hz surge that crippled ICV Meridian isn't random lightning — it echoes in repeating prime intervals across stone, tide, and relay.",
			"required_any_a": ["meridian_nav_console", "meridian_field_relay", "rescue_beacon_shore"],
			"required_any_b": ["outer_surge_resonance", "ancient_waymarker_stone", "basalt_headland_monolith"],
		},
		{
			"id": "insight_surveyor01",
			"title": "Unlisted Predecessors (SRV-01)",
			"note": "Solstice sent someone here years before the Meridian. Whoever drove the 'SRV-01 // K.V.' peg tracked tidal surges and headed north into the trees.",
			"required_any_a": ["surveyor01_peg"],
			"required_any_b": ["driftwood_tide_cache", "meridian_nav_console", "ancient_waymarker_stone"],
		},
		{
			"id": "insight_silent_wound",
			"title": "The Silent Metallic Wound",
			"note": "An unnatural metallic crust is creeping from the basalt coast into the canopy roots — and native fungi are actively walling it off.",
			"required_any_a": ["coastal_blight_crust"],
			"required_any_b": ["sw_blight_trace", "hollow_log_fungi"],
		},
		{
			"id": "insight_connected_chorus",
			"title": "One Continuous Resonance",
			"note": "Coast and canopy share a single living acoustic web. Every pulse I send along the shore is quietly echoed beneath the forest floor.",
			"required_any_a": ["ancient_waymarker_stone", "tidal_biolum_coral", "outer_surge_resonance"],
			"required_any_b": ["waystone_spiral", "chime_reeds", "nw_mycelial_seam"],
		},
	]
	return _cached_insights


static func find_by_id(site_id: String) -> Dictionary:
	for entry: Dictionary in get_all_entries():
		if str(entry.get("id", "")) == site_id:
			return entry
	return {}


static func find_by_name(site_name: String) -> Dictionary:
	for entry: Dictionary in get_all_entries():
		if str(entry.get("name", "")) == site_name:
			return entry
	return {}


static func find_nearest_interactable(
	world_pos: Vector2,
	in_interior: bool,
	max_range: float = INTERACT_RANGE_PX
) -> Dictionary:
	var best: Dictionary = {}
	var best_d: float = 999999.0
	for entry: Dictionary in get_all_entries():
		var interior_only: bool = bool(entry.get("interior_only", false))
		if interior_only != in_interior:
			continue
		var pos_v: Variant = entry.get("pos", Vector2.ZERO)
		var pos: Vector2 = pos_v as Vector2 if pos_v is Vector2 else Vector2.ZERO
		var r: float = clampf(float(entry.get("radius", max_range)), 84.0, 142.0)
		var d: float = world_pos.distance_to(pos)
		if d <= r and d < best_d:
			best_d = d
			best = entry
	return best


static func find_in_scan_radius(
	world_pos: Vector2,
	in_interior: bool,
	scan_radius: float = SCAN_ECHO_RANGE_PX
) -> Array[Dictionary]:
	var results: Array[Dictionary] = []
	for entry: Dictionary in get_all_entries():
		var interior_only: bool = bool(entry.get("interior_only", false))
		if interior_only and not in_interior:
			continue
		var pos_v: Variant = entry.get("pos", Vector2.ZERO)
		var pos: Vector2 = pos_v as Vector2 if pos_v is Vector2 else Vector2.ZERO
		var site_r: float = float(entry.get("radius", 96.0))
		var eff_r: float = maxf(scan_radius, site_r)
		if world_pos.distance_to(pos) <= eff_r:
			results.append(entry)
	return results


static func find_nearest_undiscovered_hint(
	world_pos: Vector2,
	in_interior: bool,
	discovered_ids: PackedStringArray,
	max_dist: float = DISTANT_HINT_RANGE_PX
) -> Dictionary:
	var best: Dictionary = {}
	var best_d: float = max_dist
	for entry: Dictionary in get_all_entries():
		var sid: String = str(entry.get("id", ""))
		if discovered_ids.has(sid):
			continue
		var interior_only: bool = bool(entry.get("interior_only", false))
		if interior_only and not in_interior:
			continue
		var pos_v: Variant = entry.get("pos", Vector2.ZERO)
		var pos: Vector2 = pos_v as Vector2 if pos_v is Vector2 else Vector2.ZERO
		var d: float = world_pos.distance_to(pos)
		if d > 85.0 and d < best_d:
			best_d = d
			best = entry
	return best


static func evaluate_new_insights(
	discovered_ids: PackedStringArray,
	unlocked_insights: PackedStringArray
) -> Array[Dictionary]:
	var newly_unlocked: Array[Dictionary] = []
	for ins: Dictionary in get_all_insights():
		var iid: String = str(ins.get("id", ""))
		if unlocked_insights.has(iid):
			continue
		var a_ok: bool = false
		var b_ok: bool = false
		var req_a: Variant = ins.get("required_any_a", [])
		var req_b: Variant = ins.get("required_any_b", [])
		if req_a is Array:
			for id_v: Variant in (req_a as Array):
				if discovered_ids.has(str(id_v)):
					a_ok = true
					break
		if req_b is Array:
			for id_v: Variant in (req_b as Array):
				if discovered_ids.has(str(id_v)):
					b_ok = true
					break
		if a_ok and b_ok:
			newly_unlocked.append(ins)
	return newly_unlocked


static func get_working_hypothesis(unlocked_insights: PackedStringArray) -> Dictionary:
	if unlocked_insights.has("insight_connected_chorus") and unlocked_insights.has("insight_silent_wound"):
		return {
			"stage": "Working Hypothesis III — Interconnected Living Network",
			"summary": "Coast and canopy form one resonant biological web — and something synthetic is wounding its roots.",
		}
	if unlocked_insights.has("insight_surveyor01"):
		return {
			"stage": "Working Hypothesis II — Pre-Arrival Expedition & Anomaly",
			"summary": "Surveyor-01 reached Oura-IV years ago. Their trail points north toward an unexplained repeating harmonic.",
		}
	if unlocked_insights.has("insight_prime_echo"):
		return {
			"stage": "Working Hypothesis I-B — Structured Piezo-Harmonic",
			"summary": "Natural coastal piezo-basalt explains the 43 Hz hum, yet its repeating prime intervals defy pure chance.",
		}
	return {
		"stage": "Working Hypothesis I — Geophysical Surge",
		"summary": "An intense coastal electromagnetic discharge downed ICV Meridian. Survey the wreck and trace the signal inland.",
	}
