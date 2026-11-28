shader_type canvas_item;

// Refined V7.2 player readability: natural 2x2 ordered leaf-gap dither showing Mara's
// actual warm expedition suit & ivory helmet cleanly behind trunks/foliage — ZERO neon cyan glow!
void fragment() {
	vec4 col = texture(TEXTURE, UV);
	if (col.a < 0.5) {
		discard;
	}
	vec2 frag_px = floor(FRAGCOORD.xy);
	int bx = int(mod(frag_px.x, 2.0));
	int by = int(mod(frag_px.y, 2.0));
	int slot = bx * 2 + by;
	float alpha = (slot == 0 || slot == 3) ? 0.60 : 0.26;
	COLOR = vec4(col.rgb, alpha);
}
