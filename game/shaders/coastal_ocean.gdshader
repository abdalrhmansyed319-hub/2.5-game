shader_type canvas_item;
// VERDANT SIGNAL V9.0 — Vast Alien Ocean Swell Shimmer, Tidepool Ripples & Wading Waves
// Strictly GL Compatibility / ANGLE / Intel HD Graphics 3000 safe (float-only single-pass).

uniform vec2 tex_size = vec2(2304.0, 1536.0);
uniform vec2 floor_origin_world = vec2(0.0, 1344.0);
uniform vec2 player_world_pos = vec2(748.0, 2288.0);
uniform float wind_gust = 0.0;
uniform float twilight_glow = 0.0;

float ellipse_ring(vec2 p, vec2 center, vec2 radii, float thickness) {
	vec2 d = (p - center) / max(radii, vec2(1.0));
	float dist = length(d);
	return 1.0 - smoothstep(thickness * 0.35, thickness, abs(dist - 1.0));
}

void fragment() {
	vec4 base = texture(TEXTURE, UV);
	vec2 wp = floor_origin_world + UV * tex_size;

	// Detect ocean & tidepool water pixels cleanly (cool blue/turquoise/jade tones)
	bool is_ocean_or_pool = (base.b > base.r + 0.09) && (base.g > base.r + 0.02);
	// Fixed V10.0 wet-sand detection: matches both glistening sky-wet slate-sand (#7d969c/#5f737a)
	// AND warm capillary-damp sand (#6b533c/#846648) near the shoreline!
	bool is_wet_slate = (!is_ocean_or_pool) && (base.b > base.r - 0.03) && (base.g > 0.36) && (base.r < 0.56);
	bool is_damp_foreshore = (!is_ocean_or_pool) && (wp.y > 2260.0) && (base.r > 0.36) && (base.r < 0.58) && (base.g < 0.48) && (base.b < 0.36);
	bool is_wet_sand = is_wet_slate || is_damp_foreshore;

	if (is_ocean_or_pool) {
		// Gentle horizontal rolling wave-crest shimmer moving slowly shoreward
		float wave_band = sin(wp.y * 0.11 - TIME * (1.55 + wind_gust * 0.85) + sin(wp.x * 0.018) * 2.2);
		float px_glint = step(0.87, sin(TIME * 2.4 + floor(wp.x * 0.14) * 5.3 + floor(wp.y * 0.22) * 3.7));

		// Broad soft morning sun-glint spread across coastal ocean
		float sun_col = exp(-pow((wp.x - 880.0) / 360.0, 2.0));
		float shimmer = max(0.0, wave_band * 0.11) + px_glint * (0.14 + sun_col * 0.28);

		// Tidepool calm micro-ripples & subtle bioluminescent caustic shimmer in all 5 tidepools
		vec2 pools[5];
		pools[0] = vec2(1756.0, 2196.0);
		pools[1] = vec2(1906.0, 2244.0);
		pools[2] = vec2(1848.0, 2096.0);
		pools[3] = vec2(1588.0, 2292.0);
		pools[4] = vec2(562.0, 2298.0);

		float ripple = 0.0;
		float pool_biolum = 0.0;
		for (int i = 0; i < 5; i++) {
			float fi = float(i);
			float cyc = fract(TIME / (4.0 + fi * 0.45) + fi * 0.21);
			if (cyc >= 0.10 && cyc < 0.72) {
				float u = (cyc - 0.10) / 0.62;
				float r = ellipse_ring(wp, pools[i], vec2(3.0 + u * 16.0, 1.5 + u * 6.5), 0.19);
				ripple = max(ripple, r * (1.0 - u) * 0.52);
			}
			float pd = length((wp - pools[i]) / vec2(78.0, 32.0));
			if (pd < 1.0) {
				pool_biolum = max(pool_biolum, (1.0 - pd) * (0.5 + 0.5 * sin(TIME * 1.9 + fi * 1.7)));
			}
		}

		// Live explorer wading ripples around Mara's boots when wading in surf or tidepools!
		float foot_d = length((wp - player_world_pos) / vec2(26.0, 11.0));
		if (foot_d < 1.45) {
			float fu = fract(TIME * 1.6);
			float f_ring = ellipse_ring(wp, player_world_pos, vec2(4.0 + fu * 19.0, 2.0 + fu * 7.5), 0.21);
			ripple = max(ripple, f_ring * (1.0 - fu) * 0.85);
		}

		vec3 highlight_col = mix(vec3(0.92, 0.98, 0.96), vec3(0.55, 0.96, 0.92), twilight_glow * 0.72);
		float glow_mix = clamp(shimmer * 0.45 + ripple + pool_biolum * twilight_glow * 0.24, 0.0, 0.78);
		base.rgb = mix(base.rgb, highlight_col, glow_mix);
	} else if (is_wet_sand) {
		// Subtle glossy tidal wetness sheen pulsing softly as surf recedes
		float sheen = 0.5 + 0.5 * sin(TIME * 1.25 + wp.x * 0.022 - wp.y * 0.04);
		vec3 wet_col = mix(vec3(0.76, 0.88, 0.90), vec3(0.48, 0.86, 0.88), twilight_glow * 0.55);
		base.rgb = mix(base.rgb, wet_col, sheen * (is_wet_slate ? 0.11 : 0.055));
	}

	COLOR = base;
}
