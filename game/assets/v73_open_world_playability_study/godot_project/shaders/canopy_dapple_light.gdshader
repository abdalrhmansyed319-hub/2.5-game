shader_type canvas_item;
// VERDANT SIGNAL V7.3 — Subtle Shifting Canopy Sunlight Shafts (GL Compatibility safe)
uniform vec2 world_size = vec2(2304.0, 1536.0);

void fragment() {
	vec2 wp = UV * world_size;
	float drift_x = sin(TIME * 0.24) * 9.0;
	float drift_y = cos(TIME * 0.18) * 4.5;

	float g_clear = max(0.0, 1.0 - length((wp - vec2(1656.0 + drift_x, 836.0 + drift_y)) / vec2(215.0, 145.0)));
	float g_way = max(0.0, 1.0 - length((wp - vec2(1704.0 - drift_x * 0.6, 468.0 + drift_y)) / vec2(128.0, 92.0)));
	float g_pool = max(0.0, 1.0 - length((wp - vec2(1188.0 + drift_x * 0.7, 1036.0 - drift_y)) / vec2(142.0, 96.0)));
	float g_hub = max(0.0, 1.0 - length((wp - vec2(1076.0 - drift_x * 0.5, 696.0 + drift_y * 0.5)) / vec2(96.0, 72.0)));

	float pulse = 0.85 + 0.15 * sin(TIME * 0.42 + wp.x * 0.008);
	float alpha = (g_clear * g_clear * 0.11 + g_way * g_way * 0.08 + g_pool * g_pool * 0.07 + g_hub * g_hub * 0.05) * pulse;
	COLOR = vec4(1.0, 0.94, 0.58, clamp(alpha, 0.0, 0.15));
}
