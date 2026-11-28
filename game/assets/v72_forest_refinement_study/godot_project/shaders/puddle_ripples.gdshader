shader_type canvas_item;

// Subtle expanding morning dew-drop ripples + Mara footstep ripples strictly on puddle water pixels
uniform vec2 tex_size = vec2(1440.0, 340.0);
uniform vec2 mara_world_pos = vec2(254.0, 266.0);

float ring_mask(vec2 px, vec2 center, float rx, float ry, float thickness) {
	vec2 d = (px - center) / vec2(max(rx, 0.5), max(ry, 0.5));
	float dist = length(d);
	return smoothstep(thickness, 0.0, abs(dist - 1.0));
}

void fragment() {
	vec4 col = texture(TEXTURE, UV);
	// Detect sky-reflecting rainwater puddle pixels (blue channel clearly exceeds green)
	bool is_puddle = (col.a > 0.5) && (col.b > col.g + 0.055) && (col.b > 0.35);
	if (is_puddle) {
		vec2 px = UV * tex_size;
		float glint = 0.0;

		// 5 staggered natural dew-drop ripples across Zones A, B, and C puddles
		vec4 p0 = vec4(222.0, 264.0, 0.15, 3.9);
		vec4 p1 = vec4(296.0, 294.0, 0.62, 4.7);
		vec4 p2 = vec4(664.0, 278.0, 0.34, 5.1);
		vec4 p3 = vec4(1128.0, 268.0, 0.81, 4.3);
		vec4 p4 = vec4(1258.0, 288.0, 0.08, 3.6);

		vec4 puddles[5] = vec4[5](p0, p1, p2, p3, p4);
		for (int i = 0; i < 5; i++) {
			float cyc = fract(TIME / puddles[i].w + puddles[i].z);
			if (cyc < 0.55) {
				float u = cyc / 0.55;
				float rx = 2.0 + u * 12.0;
				float ry = 1.0 + u * 4.5;
				glint = max(glint, ring_mask(px, puddles[i].xy, rx, ry, 0.18) * (1.0 - u) * 0.62);
			}
		}

		// Mara footstep water ripple when stepping inside any puddle
		float m_dist = length((px - mara_world_pos) / vec2(14.0, 6.0));
		if (m_dist < 1.2) {
			float mu = fract(TIME * 1.4);
			glint = max(glint, ring_mask(px, mara_world_pos - vec2(0.0, 1.0), 3.0 + mu * 8.5, 1.5 + mu * 3.2, 0.22) * (1.0 - mu) * 0.72);
		}

		// Gentle morning sky twinkle glints
		float shimmer = sin(TIME * 2.1 + floor(px.x * 0.35) * 1.9 + floor(px.y * 0.5) * 2.7);
		if (shimmer > 0.94) {
			glint = max(glint, 0.45);
		}

		vec3 ripple_tint = vec3(0.86, 0.98, 1.0);
		col.rgb = mix(col.rgb, ripple_tint, clamp(glint, 0.0, 0.75));
	}
	COLOR = col;
}
