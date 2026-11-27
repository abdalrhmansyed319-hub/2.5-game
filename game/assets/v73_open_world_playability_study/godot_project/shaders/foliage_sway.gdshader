shader_type canvas_item;
// VERDANT SIGNAL V7.3 — Restrained Desynchronized Foliage & Canopy Sway (Intel HD 3000 safe)
uniform int sway_kind = 1; // 1 = fern/bush (anchored bottom), 2 = overhead canopy (soft center-drape)
uniform float sway_amp = 1.2;
uniform float sway_speed = 0.85;
uniform float sway_phase = 0.0;
uniform float world_x = 0.0;

void vertex() {
	float gust = 0.66 + 0.34 * sin(TIME * 0.55 - world_x * 0.009);
	float wave = sin(TIME * sway_speed + sway_phase) * sway_amp * gust;
	float weight = 0.0;
	if (sway_kind == 2) {
		weight = 0.28 + 0.72 * sin(clamp(UV.y, 0.0, 1.0) * 2.67);
	} else {
		float inv_y = clamp(1.0 - UV.y, 0.0, 1.0);
		weight = inv_y * inv_y;
	}
	VERTEX.x += floor(wave * weight + 0.5);
}
