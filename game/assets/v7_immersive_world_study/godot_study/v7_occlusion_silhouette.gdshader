shader_type canvas_item;
// VERDANT SIGNAL V7.0 — GL Compatibility / Intel HD Graphics 3000 Safe
// Localized Occlusion Readability Silhouette Shader.
// Drawn ONLY on Mara's secondary silhouette overlay sprite when behind a
// colossal trunk/reed/monolith, so solid bark stays 100% opaque while the
// player retains effortless tracking without heavy screen-reading shaders.

uniform vec4 rim_color : source_color = vec4(0.55, 0.97, 0.94, 0.72);
uniform float body_dither_alpha : hint_range(0.0, 0.6) = 0.24;
uniform float visibility_amount : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	if (tex.a < 0.5 || visibility_amount <= 0.01) {
		discard;
	}
	vec2 px = TEXTURE_PIXEL_SIZE;
	float n_a =
		texture(TEXTURE, UV + vec2(px.x, 0.0)).a +
		texture(TEXTURE, UV - vec2(px.x, 0.0)).a +
		texture(TEXTURE, UV + vec2(0.0, px.y)).a +
		texture(TEXTURE, UV - vec2(0.0, px.y)).a;
	bool is_edge = n_a < 3.5;
	vec2 frag_px = floor(FRAGCOORD.xy);
	float checker = mod(frag_px.x + frag_px.y, 2.0);
	if (is_edge) {
		COLOR = vec4(rim_color.rgb, rim_color.a * visibility_amount);
	} else if (checker < 0.5) {
		COLOR = vec4(tex.rgb, body_dither_alpha * visibility_amount);
	} else {
		discard;
	}
}
