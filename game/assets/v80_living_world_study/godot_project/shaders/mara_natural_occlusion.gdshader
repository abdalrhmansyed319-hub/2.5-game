shader_type canvas_item;
// VERDANT SIGNAL V8.0 — Natural 2x2 Ordered-Dither Foliage Peek (ZERO artificial cyan glow!)
void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	if (tex.a < 0.2) {
		discard;
	}
	int px = int(floor(FRAGCOORD.x)) & 1;
	int py = int(floor(FRAGCOORD.y)) & 1;
	int slot = (py << 1) | px;
	float alpha = (slot == 0 || slot == 3) ? 0.60 : 0.24;
	COLOR = vec4(tex.rgb, tex.a * alpha);
}
