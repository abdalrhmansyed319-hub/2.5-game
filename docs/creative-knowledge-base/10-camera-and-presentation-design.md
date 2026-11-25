# 10 — Camera and Presentation Design

> **Technical Bridge (Phase 1)**: Connects to [`KB-05 Rendering & Shaders`](../knowledge-base/05-rendering-and-shaders.md) (Cameras & Viewports), [`KB-03 Physics Interpolation`](../knowledge-base/03-physics-and-movement-systems.md), and [`Exercise G CameraDirector2D`](../../creative-labs/exercise_g_integrated_design/camera_director_2d.gd).  
> **Scope**: Camera physiology (Itay Keren / GDC), framing & composition, dead zones, look-ahead leading, platform snapping, room bounds & transitions, trauma-based shake, dynamic zoom, and presentation timing.

---

## 1. The Camera Is the Player's Eyes (Never Just a Child of the Player)

Slapping a raw `Camera2D` directly onto a `CharacterBody2D` with default centered lock is one of the fastest ways to make an otherwise solid game feel amateurish or nauseating:
- Every tiny vertical jump shakes the entire world up and down.
- The player sits dead-center, wasting 50% of the viewport behind them while hiding threats immediately ahead!
- Rapid turn-arounds snap the screen violently left and right.

### Vision Physiology Principles (Itay Keren, *Scroll Back*, GDC 2015)
- **Foveal Vision (Center)**: High detail, slower tracking — relies on stable framing to judge exact jump landings and attack spacing.
- **Peripheral Vision (Edges)**: Fast motion detection — excessive background camera jitter fatigues the eye and causes motion sickness.
- **Conclusion**: A great game camera **moves only when necessary**, smoothly frames **where the player is going (not where they were)**, and locks cleanly to environmental composition!

---

## 2. Core Camera Engineering & Direction Techniques

| Technique | Creative Purpose | Implementation Principles (Godot 4.7) |
| --- | --- | --- |
| **Camera Window (Dead Zone)** | Allows micro-adjustments, short hops, and pacing turns without dragging the entire world | Define an inner rect (`deadzone_size`); only shift camera target once actor crosses the boundary. |
| **Directional Look-Ahead (Lead)** | Gives 60–70% screen space in the direction of motion/aim so players spot hazards & landmarks early | Smoothly interpolate a horizontal/aim offset (`lookahead_distance`) using exponential damping (`1.0 - exp(-speed * delta)`); add a tiny direction-commit delay so micro-taps don't whip the camera! |
| **Vertical Platform Snapping** | Eliminates vertical seasickness during routine platform jumps | Keep vertical camera anchor locked on the last grounded Y elevation during normal jumps; smoothly ease to the new elevation upon landing (or immediately if falling below safety margin!). |
| **Room / Zone Bounds & Focus Anchors** | Keeps ugly off-map voids hidden and frames bespoke vistas/boss arenas intentionally | `Area2D/3D` Camera Zones overriding `limit_left/right/top/bottom`, target zoom, or blending smoothly toward a POI anchor (`boss`, `landmark`, `puzzle`). |
| **Trauma-Based Screen Shake** | Tactile impact weight without chaotic buzz | Accumulate scalar `trauma` (`0.0–1.0`), decay linearly over time, compute shake intensity as `trauma * trauma` (or `trauma^3`) driving smooth `FastNoiseLite` offset + subtle rotation on `Camera2D.offset` (never mutating follow `position`!), scaled by user accessibility setting (`0%–100%`). |
| **Dynamic Zoom** | Modulates intimacy vs. spatial awareness | Tighten slightly during close dialogue/stealth; pull back gently in wide vistas, high-speed sprints, or large multi-enemy arenas so threats never attack from off-screen! |

---

## 3. Presentation Timing, Transitions, and Player Visibility

- **Player Visibility Guarantee**:
  - In 2.5D/3D or layered 2D, never let foreground walls, roofs, or tall pillars hide the player silently — use Godot 4.5+ **stencil silhouettes** (`KB-05`), cutaway opacity fades on `CanopyOverlayLayer`, or dynamic `SpringArm3D` collision pull-in.
- **Room & Scene Transitions**:
  - Match transition pacing to rhythm: crisp 200–350 ms camera slides/crossfades for interconnected exploration rooms; intentional beat-timed fades for chapter/area transitions; **never** let enemies damage the player during a camera transition or fade-in!
- **Presentation Pacing (Beats & Breath)**:
  - When revealing a major landmark, boss, or newly opened shortcut gate, hold the camera on the subject for a clean **0.8–1.5 second** visual beat (with subtle audio swell) before smoothly returning control — ensuring the player immediately grasps the spatial consequence of their action without a text popup saying "A door opened somewhere."
