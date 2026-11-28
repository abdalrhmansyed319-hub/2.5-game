# 05 — Rendering and Shaders

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`CanvasItem.xml`, `Viewport.xml`, `Camera2D.xml`, `Camera3D.xml`, `ShaderMaterial.xml`, `AreaLight3D.xml`, official Rendering & Shading docs for 4.4–4.7).  
> **Scope**: Renderers, 2D/3D pipelines, Viewports, Cameras, lighting/shadows, materials, CanvasItem/Spatial/Visual shaders, post-processing, pixel-perfect rendering, and rendering optimization.

---

## 1. Godot 4 Rendering Backends & Driver Selection

Verified against official Godot 4.7 documentation:

| Renderer | Graphics APIs | Strengths | Target Platforms / Tradeoffs |
| --- | --- | --- | --- |
| **Forward+** | Vulkan, D3D12 *(Windows default since 4.6)*, Metal | Clustered forward lighting (many lights), SDFGI, VoxelGI, volumetric fog, full post-processing, SSR (overhauled in 4.6), HDR output *(4.7)*, `AreaLight3D` *(4.7)*, compute shaders, stencil buffer *(4.5)* | Desktop PC/console. Highest GPU feature ceiling and VRAM footprint. |
| **Mobile** | Vulkan, D3D12, Metal | Faster single-pass subpass architecture, lower memory bandwidth, overhauled Glow *(4.6)*, Vulkan subsampled foveated rendering *(4.7)* | Mobile, XR, integrated GPUs, stylized desktop games wanting high frame rates. Limits per-object light counts and drops SDFGI/volumetric fog. |
| **Compatibility** | OpenGL 3.3 / GLES 3 / WebGL 2 | Broadest hardware support, fastest startup, smallest shader overhead; gained simple SSAO & motion vectors in 4.6 | Web exports, older laptops/GPUs, pure 2D games that don't need Forward+ 3D features. |

### Pipeline Stutter Elimination (Godot 4.4–4.5+)
- **Ubershaders (4.4+)**: Godot pre-compiles fallback ubershaders at load time while specialized pipelines compile asynchronously in the background — drastically reducing first-sight shader-compilation hitches.
- **Shader Baker (4.5+)**: Pre-compiles native GPU shader bytecode at export time for supported drivers (D3D12/Metal/Vulkan pipelines), cutting first-launch stalls.

---

## 2. 2D Rendering Pipeline, CanvasItems, and Pixel-Perfect Engineering

### Draw Ordering & Batching
- Render order in 2D follows: **`CanvasLayer.layer`** -> **`z_index`** -> **tree order** (or **Y-coordinate** when `y_sort_enabled = true`).
- **2D Automatic Batching (4.4+, GPU-overhauled 1.1x–7x faster in 4.6)**:
  - Godot automatically batches consecutive `CanvasItem` draw calls sharing the same **texture**, **material/shader**, **canvas texture filter/repeat**, and **blend mode**.
  - **What breaks batching**: Interleaving different textures (solve with **texture atlases**), assigning unique unshared `ShaderMaterial` instances to every sprite (solve with **`instance uniform`** shader parameters!), toggling `Light2D` / `CanvasGroup` / `clip_children` excessively, or scattering `z_index` across unrelated sprites.
- **Godot 4.7 CanvasItem Line Drawing Note**: `CanvasItem` no longer adds extra antialiasing feather thickness to drawn lines (GH-105122); explicitly specify desired line widths.

### Pixel-Perfect & Viewport Scaling Rules
- **Texture Filtering**: Set `Project Settings > Rendering > Textures > Canvas Textures > Default Texture Filter` to `Nearest` for crisp pixel art (or override per-branch via `CanvasItem.texture_filter`).
- **Stretch Mode Settings** *(note: Godot 4.7 defaults new projects to `canvas_items` + `expand`)*:
  - **`viewport` mode**: Renders at exact logical resolution then scales up — authentic pixel-locked rotation/subpixels, ideal for strict retro pixel art (pair with `stretch/scale_mode = "integer"` when pixel-uniform scaling is mandatory).
  - **`canvas_items` mode**: Renders vector/UI/fonts crisp at native window resolution while scaling logical coordinates — ideal for HD 2D, UI-heavy games, or crisp fonts over pixel worlds (or use a `SubViewport` for the pixel-art world while keeping HUD crisp in `canvas_items`!).
- **2D Pixel Snapping**: Enable `rendering/2d/snap/snap_2d_transforms_to_pixel` (and `snap_2d_vertices_to_pixel` carefully) only when pixel-locked visuals are intended; beware subpixel camera jitter if combining pixel snap with smooth cameras (use a SubViewport subpixel-offset camera shader technique for silky-smooth pixel cameras).
- **3D Retro Crisp Scaling (4.7+)**: New **nearest-neighbor 3D viewport scaling** option renders 3D at low internal resolution with sharp PS1-style pixel edges without affecting 2D HUD sharpness.

---

## 3. Viewports, Cameras, Lighting, and Shadows

### Viewports & SubViewports
- Every `Window` and `SubViewport` owns its own 2D/3D rendering target and optional isolated `World2D`/`World3D`.
- Use `SubViewport` for: split-screen cameras, minimaps, 3D character portraits in UI, low-res pixel-art rendering inside a high-res HUD, and render-to-texture effects.
- **Cost Warning**: Every active `SubViewport` running `UPDATE_ALWAYS` performs a full extra render pass! Use `UPDATE_ONCE` or `UPDATE_WHEN_VISIBLE` for static portraits/thumbnails.

### Cameras (`Camera2D` / `Camera3D`)
- Keep camera rig logic modular (target follow, look-ahead bias, screen-shake trauma decay, room bounds clamping) separate from the player physics script.
- Apply **screen shake** via `Camera2D.offset` (NOT `position`, which fights follow/bounds logic) using decaying `trauma^2` or `trauma^3` multiplied by simplex noise rather than harsh uniform `randf()`.
- On `Camera3D`, tighten `near` (avoid `< 0.05`!) and `far` clip planes to maximize depth-buffer precision and prevent Z-fighting.

### Lighting & Shadows
- **2D Lighting (`PointLight2D`, `DirectionalLight2D`, `LightOccluder2D`)**: Each active 2D shadow-casting light adds extra draw passes over lit sprites. Keep light count bounded, use light masks (`range_item_cull_mask`), and consider additive unlit glow sprites for ambient accents.
- **3D Lighting**:
  - `DirectionalLight3D` (sun/moon), `OmniLight3D`, `SpotLight3D`, and **`AreaLight3D` (Godot 4.7+)** for soft rectangular area lighting (screens, windows, neon panels) without faking GI emissives.
  - **Global Illumination Tradeoffs**:
    - `LightmapGI` (baked): Fastest runtime performance, best static bounce quality, requires UV2 unwrap + bake time.
    - `VoxelGI`: Dynamic localized bounce lighting for medium scenes/interiors, moderate GPU cost.
    - `SDFGI`: Dynamic open-world GI (Forward+ only), desktop GPU cost + potential light leaking on thin walls.
  - Always disable shadows (`shadow_enabled = false`) on small fill/accent lights; tune shadow atlas resolution and `DirectionalLight3D` cascade splits (`max_distance`).

---

## 4. Materials & Godot Shading Language (`.gdshader`)

Godot shaders use a GLSL ES 3.0-inspired syntax with five shader types: `spatial`, `canvas_item`, `particles`, `sky`, and `fog`.

### `canvas_item` Shader Essentials
- Entry points: `vertex()`, `fragment()`, `light()`.
- Built-ins: `TEXTURE`, `UV`, `COLOR`, `SCREEN_TEXTURE` (via `uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;`), `TIME`, `TEXTURE_PIXEL_SIZE`.
- **Instance Uniforms (Batch-Friendly Per-Entity State)**:
  ```glsl
  shader_type canvas_item;
  instance uniform float flash_amount : hint_range(0.0, 1.0) = 0.0;
  instance uniform vec4 flash_color : source_color = vec4(1.0);

  void fragment() {
      vec4 tex = texture(TEXTURE, UV) * COLOR;
      COLOR = vec4(mix(tex.rgb, flash_color.rgb, flash_amount), tex.a);
  }
  ```
  All enemies can share ONE `ShaderMaterial` resource while changing `set_instance_shader_parameter(&"flash_amount", 1.0)` individually without duplicating materials!
- **Godot 4.7 Text Shader Inline Previews**: The shader editor renders live inline previews of shader expressions as you write text shaders.

### `spatial` Shader Essentials
- Entry points: `vertex()`, `fragment()`, `light()`.
- Key render modes: `blend_mix`, `cull_back`/`cull_disabled`, `depth_draw_opaque`, `unshaded`, `world_vertex_coords`, `diffuse_toon`, `specular_toon`.
- **Stencil Buffer (Godot 4.5+)**: Enables true see-through character silhouettes behind walls, portal masking, and clean non-overlapping outlines without extra viewport passes!
- **Visual Shaders vs. Text Shaders**: Visual shaders are great for artist exploration and quick prototyping; text `.gdshader` files are superior for version control (`git diff`), code review, modularity (`#include "res://shaders/common.gdshaderinc"`), and maintainability.

### Post-Processing & `WorldEnvironment`
- Prefer built-in `Environment` passes (Tonemapping — `ACES` or `AgX`, Glow/Bloom — note Godot 4.6 changed default glow blend mode to `Screen`, SSAO/SSIL, Color Adjustments, Fog) over stacking custom full-screen `BackBufferCopy` passes.
- **Godot 4.6+ Material Debanding & HDR Precision** + **Godot 4.7 HDR Display Output**: Enable debanding to eliminate gradient banding in dark/atmospheric scenes.
- Beware `hint_screen_texture` on multiple transparent nodes: each draw reading screen texture forces a screen-copy barrier unless grouped carefully under a single `BackBufferCopy` or full-screen `ColorRect` post-process pass.

---

## 5. Rendering Optimization Checklist

1. **Measure First**: Use the Visual Profiler (CPU + GPU pass timings per stage) and `Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME` / `RENDER_TOTAL_PRIMITIVES_IN_FRAME`.
2. **Reduce Draw Calls**:
   - Use **`MultiMeshInstance2D/3D`** for foliage, crowds, bullets, tiles/props (1 draw call for thousands of instances!).
   - Atlas textures and share `Material` resources; use `instance uniform` for per-object variation.
3. **Eliminate Overdraw & Fillrate Waste**:
   - Trim transparent whitespace on large 2D sprites (`MeshInstance2D` / polygon-trimmed sprites) and avoid stacking 10+ full-screen transparent particle layers.
   - Keep opaque geometry opaque (`alpha_scissor` or opaque meshes over `alpha_blend`) so early-Z rejection works in 3D.
4. **3D Culling & LOD**:
   - Enable automatic **Mesh LOD** on imported 3D assets, configure **Visibility Ranges (`visibility_range_begin/end`)**, and bake **`OccluderInstance3D`** occlusion culling for dense architectural scenes.
5. **Texture Memory**:
   - Use VRAM compression (`VRAM Compressed` / S3TC / BPTC / ETC2 / ASTC) for 3D textures; never ship uncompressed 4K RGBA8 PNGs for minor props; enable Mipmaps for 3D textures and zoomed-out 2D textures to prevent shimmering and improve GPU texture cache hit rates.
