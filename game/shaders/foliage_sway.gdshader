shader_type canvas_item;
// VERDANT SIGNAL V8.0 — Gust-Responsive Desynchronized Foliage & Canopy Sway (Intel HD 3000 safe)
uniform int sway_kind = 1; // 1 = fern/bush, 2 = overhead canopy
uniform float sway_amp = 1.2;
uniform float sway_speed = 0.85;
uniform float sway_phase = 0.0;
uniform float world_x = 0.0;
uniform float gust_factor = 0.0;

void vertex() {
	float gust = 0.65 + 0.35 * sin(TIME * 0.55 - world_x * 0.009) + gust_factor * 0.95;
	// V10.0 dual-harmonic organic foliage sway so neighboring species never bend in robotic lockstep!
	float primary = sin(TIME * sway_speed + sway_phase);
	float secondary = sin(TIME * sway_speed * 2.13 + sway_phase * 1.71 + world_x * 0.015) * 0.26;
	float wave = (primary + secondary) * sway_amp * gust;
	float weight = 0.0;
	if (sway_kind == 2) {
		weight = 0.28 + 0.72 * sin(clamp(UV.y, 0.0, 1.0) * 2.67);
	} else {
		float inv_y = clamp(1.0 - UV.y, 0.0, 1.0);
		weight = inv_y * inv_y;
	}
	VERTEX.x += floor(wave * weight + 0.5);
}
