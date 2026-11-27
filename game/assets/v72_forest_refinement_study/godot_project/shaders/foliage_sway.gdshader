shader_type canvas_item;

// Subtle, pixel-snapped organic wind sway — desynchronized per instance via uniforms
// sway_kind: 1 = fern/bush (root-anchored bottom), 2 = overhang canopy (bough-anchored top)
uniform int sway_kind = 1;
uniform float sway_amp = 1.2;
uniform float sway_speed = 0.9;
uniform float sway_phase = 0.0;
uniform float world_x = 0.0;

void vertex() {
	float gust = 0.68 + 0.32 * sin(TIME * 0.55 - world_x * 0.011);
	float base_wave = sin(TIME * sway_speed + sway_phase) * sway_amp * gust;
	float weight = 0.0;
	if (sway_kind == 1) {
		// Anchored firmly at UV.y == 1.0 (soil roots); gentle rustle at UV.y == 0.0 (frond tips)
		float t = clamp(1.0 - UV.y, 0.0, 1.0);
		float flutter = sin(TIME * (sway_speed * 2.1) + sway_phase + UV.y * 6.0) * 0.32 * sway_amp;
		weight = t * t;
		VERTEX.x += round((base_wave + flutter) * weight);
	} else if (sway_kind == 2) {
		// Anchored at upper bough (UV.y == 0.0); lazy breeze sway along lower hanging moss/leaves
		float t = clamp(UV.y, 0.0, 1.0);
		float rustle = sin(TIME * (sway_speed * 1.8) + sway_phase + UV.y * 4.5) * 0.28 * sway_amp;
		weight = 0.22 + 0.78 * t;
		VERTEX.x += round((base_wave + rustle) * weight);
	}
}
