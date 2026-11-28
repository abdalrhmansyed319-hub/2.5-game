shader_type canvas_item;
// VERDANT SIGNAL V8.0 Production — Natural 2x2 Ordered-Dither Foliage Peek
// Float-only checkerboard parity for maximum Intel HD Graphics 3000 / ANGLE compatibility.
void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	if (tex.a < 0.2) {
		discard;
	}
	float px = mod(floor(FRAGCOORD.x), 2.0);
	float py = mod(floor(FRAGCOORD.y), 2.0);
	float alpha = (abs(px - py) < 0.5) ? 0.60 : 0.24;
	COLOR = vec4(tex.rgb, tex.a * alpha);
}
