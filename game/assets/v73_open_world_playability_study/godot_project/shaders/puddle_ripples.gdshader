shader_type canvas_item;
// VERDANT SIGNAL V7.3 — Live Staggered Dew-Drop & Explorer Footstep Water Ripples
uniform vec2 tex_size = vec2(2304.0, 1536.0);
uniform vec2 player_world_pos = vec2(1018.0, 816.0);

float ellipse_ring(vec2 p, vec2 center, vec2 radii, float thickness) {
	vec2 d = (p - center) / max(radii, vec2(1.0));
	float dist = length(d);
	return 1.0 - smoothstep(thickness * 0.4, thickness, abs(dist - 1.0));
}

void fragment() {
	vec4 base = texture(TEXTURE, UV);
	vec2 wp = UV * tex_size;
	bool is_water = (base.b > base.g + 0.05) && (base.b > base.r + 0.14);
	if (is_water) {
		vec2 pools[6];
		pools[0] = vec2(1582.0, 862.0);
		pools[1] = vec2(1742.0, 906.0);
		pools[2] = vec2(1148.0, 1038.0);
		pools[3] = vec2(1266.0, 1086.0);
		pools[4] = vec2(998.0, 744.0);
		pools[5] = vec2(544.0, 632.0);

		float periods[6];
		periods[0] = 4.1; periods[1] = 5.3; periods[2] = 4.6;
		periods[3] = 3.9; periods[4] = 5.0; periods[5] = 4.4;

		float phases[6];
		phases[0] = 0.20; phases[1] = 0.65; phases[2] = 0.10;
		phases[3] = 0.52; phases[4] = 0.80; phases[5] = 0.35;

		float ripple = 0.0;
		for (int i = 0; i < 6; i++) {
			float cyc = fract(TIME / periods[i] + phases[i]);
			if (cyc < 0.56) {
				float u = cyc / 0.56;
				float ring = ellipse_ring(wp, pools[i], vec2(2.0 + u * 12.0, 1.0 + u * 4.5), 0.18);
				ripple = max(ripple, ring * (1.0 - u) * 0.55);
			}
		}

		// Live explorer footstep water ripple when wading across shallow pools!
		float foot_dist = length((wp - player_world_pos) / vec2(22.0, 9.0));
		if (foot_dist < 1.35) {
			float fu = fract(TIME * 1.45);
			float fring = ellipse_ring(wp, player_world_pos, vec2(4.0 + fu * 16.0, 2.0 + fu * 6.0), 0.20);
			ripple = max(ripple, fring * (1.0 - fu) * 0.72);
		}
		base.rgb = mix(base.rgb, vec3(0.863, 0.976, 1.0), clamp(ripple, 0.0, 0.78));
	}
	COLOR = base;
}
