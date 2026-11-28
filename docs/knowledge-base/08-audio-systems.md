# 08 — Audio Systems

> **Verification Baseline**: Godot Engine `4.7.2-stable` (`AudioServer.xml`, `AudioStreamPlayer.xml`, `AudioStreamPlayer2D.xml`, `AudioStreamPlayer3D.xml`, `AudioStreamRandomizer.xml`, `AudioStreamInteractive.xml`, `AudioStreamPlaylist.xml`, `AudioStreamSynchronized.xml`).  
> **Scope**: Playback nodes, Audio Buses & Effects, linear vs. dB volume control, procedural variation, ambient & adaptive music, spatial audio, polyphony, and audio optimization.

---

## 1. Playback Nodes & Spatialization

| Node | Space | Use Cases |
| --- | --- | --- |
| **`AudioStreamPlayer`** | Non-positional (global stereo/surround) | Music, UI clicks/hovers, narrator/dialogue voiceover, global stingers. |
| **`AudioStreamPlayer2D`** | 2D positional (`max_distance`, `attenuation`, `panning_strength`, `area_mask`) | 2D footsteps, impacts, localized ambience, enemy vocalizations. |
| **`AudioStreamPlayer3D`** | 3D positional (inverse/logarithmic distance attenuation, `unit_size`, `max_db`, emission angle cone, Doppler tracking, `AudioListener3D`) | 3D world SFX, environmental emitters, directional engines/machinery. |

*Note*: Godot 4.7 fixed 3D audio volume calculation across multiple viewports (GH-114080) and PulseAudio disconnect latency reporting.

### Polyphony vs. Pooling
- Every `AudioStreamPlayer*` exposes **`max_polyphony: int`** (default `1`). Increasing `max_polyphony` (e.g., to `4`–`8`) lets a single player overlap rapid footsteps, gunfire, or UI ticks **without cutting off the previous tail** and without spawning extra nodes!
- Use a small local/scene **SFX Voice Pool** only when you need independent per-instance positions (`AudioStreamPlayer2D/3D` fired from distinct impact locations) or when an emitter dies while its sound tail must finish playing!
  - **Classic Pitfall**: Calling `death_sfx.play(); queue_free()` on a dying enemy immediately cuts off the death sound because freeing the parent frees the child `AudioStreamPlayer`! Either detach/pool a transient one-shot audio player in the world audio layer, or disable visuals/collision first and `queue_free()` on `death_sfx.finished`.

---

## 2. Audio Buses, Effects, and Volume Management

### Recommended Production Bus Layout (`default_bus_layout.tres`)
```text
Master (Limiter effect at end of chain to prevent digital clipping!)
├── Music        (optional LowPassFilter for pause/underwater muffling)
├── SFX          (optional Compressor / EQ)
│   ├── SFX_Combat
│   ├── SFX_World   (send/reverb bus for cave/hall spaces via Area2D/3D audio_bus_override!)
│   └── SFX_UI      (bypassed from world reverb!)
├── Ambience
└── Voice / Dialogue (sidechain or scripted ducking of Music/Ambience when active)
```

### Linear vs. Decibels (dB) Volume Rules
- Human hearing is logarithmic. UI volume sliders (`0.0` to `1.0`) operate in **linear** amplitude, whereas `AudioServer` historically operated in decibels (`-80 dB` to `0 dB`).
- Godot 4.4–4.7 provides **`AudioServer.set_bus_volume_linear(bus_idx, linear)`** and **`AudioServer.get_bus_volume_linear(bus_idx)`** (and `AudioStreamPlayer.volume_linear`) directly — or explicitly convert via `linear_to_db(clampf(linear, 0.0, 1.0))` and mute the bus when `linear <= 0.001` (`AudioServer.set_bus_mute(bus_idx, true)`).
- **Save User Settings as Linear (`0.0`–`1.0`)** in config files so slider positions map 1:1 without `-INF` JSON serialization errors!
- **Always add `AudioEffectLimiter`** on the `Master` bus to prevent harsh distortion when many SFX fire simultaneously.

---

## 3. Sound Variation & Anti-Fatigue Design

Repetitive identical SFX ("machine-gun effect") immediately makes a game sound amateurish.

### Built-In `AudioStreamRandomizer` (Zero-Code Variation!)
Verified against `AudioStreamRandomizer.xml`:
- Pack 3–6 subtle sample variants into one `AudioStreamRandomizer` `.tres` resource.
- Set `playback_mode = AudioStreamRandomizer.PLAYBACK_RANDOM_NO_REPEATS` so the same clip never plays twice consecutively.
- Add subtle pitch variation via `random_pitch` (e.g., `1.08`) or `random_pitch_semitones` (e.g., `±1.0` semitone) and subtle loudness jitter via `random_volume_offset_db` (e.g., `1.5 dB`).
- Assign probability weights (`set_stream_probability_weight()`) for rare flavor variations.

---

## 4. Ambient & Adaptive Music Systems (Godot 4.3+ Native Interactive Audio)

Godot 4.3+ includes **first-class native interactive music streams** (verified in `modules/interactive_music/doc_classes/`), removing the need to build fragile custom beat-synced crossfade engines from scratch:

1. **`AudioStreamSynchronized` (Vertical Layering / Stems)**:
   - Plays multiple stems (e.g., `base_pad`, `percussion`, `combat_brass`, `boss_choir`) in **sample-accurate phase lock**.
   - Fade individual layers dynamically via `set_sync_stream_volume(stream_idx, db)` (tweened cleanly) as gameplay tension rises or drops!
2. **`AudioStreamInteractive` (Horizontal Re-Sequencing / State Machine)**:
   - Manages named musical clips (`explore`, `tension`, `combat`, `victory`) with beat/bar-aligned transitions (`add_transition()`), configurable fade modes (`FADE_CROSS`, `FADE_OUT`, `FADE_IN`, `FADE_AUTOMATIC`), `from_time` (next beat, next bar, clip end, immediate), optional transition **filler/stinger clips**, and auto-advance!
   - Switch music states at runtime via `AudioStreamPlaybackInteractive.switch_to_clip_by_name(&"combat")`.
3. **`AudioStreamPlaylist`**:
   - Sequential or shuffled ambient/exploration playlist with crossfades (`fade_time`, `shuffle`, `loop`).

---

## 5. Audio Import Formats & Performance Optimization

| Format | Compression | CPU Decode Cost | Best For |
| --- | --- | --- | --- |
| **WAV (PCM / QOA)** | Uncompressed (or lightweight QOA) | Lowest | Short, frequent SFX (< 2–3 s): UI clicks, footsteps, hits, jumps. Trim silence and use **Mono** for positional 2D/3D SFX (spatial panning requires mono sources!). |
| **OGG Vorbis** | Lossy streaming | Moderate | Music tracks, long ambient beds, long dialogue lines. Enable `loop` in Import dock (with exact `loop_offset` for intro+loop music!). |
| **MP3** | Lossy streaming | Moderate | Acceptable alternative to OGG for music if source pipeline requires it; watch encoder padding for seamless loops. |

### Performance & Memory Hygiene
- **Force Mono** on spatialized 2D/3D SFX in the Import dock (`force/mono = true`) — cuts memory in half and fixes broken stereo panning on positional emitters.
- **Voice Budget & Distance Culling**: Don't run 100 distant `AudioStreamPlayer2D/3D` loops across the entire level; use `max_distance` and disable/pause far ambient emitters or aggregate ambience into zone-based beds.
- **Avoid Heavy Bus Effects on Idle Buses**: Godot automatically sleeps unused buses, but constantly active convolution/reverb chains with high tail counts consume audio-thread CPU — route spatial reverb through a shared send bus rather than duplicating `AudioEffectReverb` across 10 buses.
- **Web Export Note (`AudioServer.PLAYBACK_TYPE_SAMPLE` vs `STREAM`)**: Godot 4.3+ supports sample-based Web Audio playback (`playback_type`) to eliminate WebAssembly audio crackle/latency on short SFX.
