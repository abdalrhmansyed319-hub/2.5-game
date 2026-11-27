shader_type canvas_item;

// Subtle shifting golden-chartreuse dappled morning light filtering through swaying canopy
uniform vec2 world_size = vec2(1440.0, 340.0);

void fragment() {
	vec2 px = UV * world_size;
	float d = 0.0;
	vec3 spots[5] = vec3[5](
		vec3(258.0, 256.0, 0.3),
		vec3(682.0, 266.0, 0.9),
		vec3(1182.0, 246.0, 1.1),
		vec3(1234.0, 264.0, 3.2),
		vec3(1166.0, 278.0, 4.4)
	);
	for (int i = 0; i < 5; i++) {
		vec2 c = spots[i].xy + vec2(sin(TIME * 0.72 + spots[i].z) * 3.2, cos(TIME * 0.58 + spots[i].z * 1.3) * 1.4);
		vec2 rel = (px - c) / vec2(26.0, 10.0);
		float dist = length(rel);
		if (dist < 1.0) {
			float pulse = 0.55 + 0.45 * sin(TIME * 0.88 + spots[i].z);
			d = max(d, (1.0 - dist) * pulse * 0.13);
		}
	}
	COLOR = vec4(0.89, 0.94, 0.38, d);
}
