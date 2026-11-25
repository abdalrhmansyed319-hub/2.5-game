# Deliverable O — Audio Direction

> **Technical Bridge**: Realized directly via Phase 1 [`Tech KB-08 Audio Systems`](../knowledge-base/08-audio-systems.md) (Godot 4.7 Audio Buses, `AudioStreamRandomizer`, `AudioStreamSynchronized` vertical stems, `AudioStreamInteractive` beat transitions, `Area2D` `audio_bus_override` reverb zones) and Phase 2 [`Creative KB-11`](../creative-knowledge-base/11-sound-design-and-atmosphere.md).

---

## 1. Sonic Identity: *Organic Acoustic Wonder Meets Delicate Field Telemetry*
Because Oura-IV's planet-wide mystery IS **sound and harmonic resonance**, audio is not background wallpaper—**it is a primary gameplay interface and emotional soul of the game!**

- **Musical Palette**: Intimate acoustic textures blended with organic glass/wood/ceramic resonance—marimba/kalimba overtones, breathy wooden flutes (mirroring *Singing Reedwoods*), bowed glass bowls (mirroring *Quartz Peaks*), warm analog tape synths for human sci-fi nostalgia, and deep sub-bass cello drones for *The Blooming Tide*.
- **Zero Generic Bombastic Sci-Fi Brass**: Avoid loud orchestral battle marches; preserve space for **natural environmental acoustics and strategic silence**!

---

## 2. The 5-Tier Audio Mix Hierarchy (Enforced via Godot Audio Buses)

| Bus / Priority Tier | Sound Category | Dynamic Mixing & Gameplay Clarity Treatment |
| --- | --- | --- |
| **Tier 1 (Supreme)** | Storm early warnings (*Reedwood howling*), Predator threat telegraphs, Suit Envelope critical alerts, Keystone Choir calls | Cleanest frequency pocket; subtly ducks Tiers 4–5 by `4–6 dB`; unmistakable pitch/transient clarity |
| **Tier 2 (Core Action)** | **Surface-aware footsteps** (wet sand, kelp squish, hollow reedwood, basalt clack, whisper-moss silence, snow crunch), Field Lens focus/snap chimes, Sample clip, Camp tent zip | Driven by `TileData.get_custom_data("surface_type")` -> `AudioStreamRandomizer` (`PLAYBACK_RANDOM_NO_REPEATS`, `±4%` pitch variance) so zero ear fatigue over 20 hours! |
| **Tier 3 (Living World)** | Spatialized (`AudioStreamPlayer2D`, Mono-forced) autonomous wildlife calls (*Chime-Glider* mimicry, *Horn-Beast* distant bellows, *Echo-Bat* cave clicks, insect hums) | Distance-attenuated stereo panning lets players locate hidden wildlife and threats purely by ear! |
| **Tier 4 (Adaptive Score)** | Regional ambient motifs (`AudioStreamInteractive`) + vertical layers (`AudioStreamSynchronized`: Solo Exploration -> Discovery Shimmer -> Weather Tension -> Blooming Tide Harmony) | **Plays only ~40–50% of the time!** Leaves deliberate generous stretches of pure nature ambience so musical entrances trigger genuine goosebumps! |
| **Tier 5 (Atmosphere & Acoustics)** | Layered regional ambience beds (ocean surf, canopy wind, marsh bubble, cave drips, glacial creak) + `Area2D` Reverb Overrides (`CaveReverbBus`, `UnderwaterLowPassBus`) | Seamless crossfades across biome transitions; stepping inside a cavern immediately adds crisp wet stone tail to footsteps and echoes! |

---

## 3. Diegetic Bio-Acoustic Gameplay Cues (Playable Sound Design!)
- **60-Second Storm Forecast by Ear**: In the Singing Canopy and Basalt Terraces, players learn organically to recognize the hollow wood-flute harmonic shifting into an eerie dissonant minor trill—giving a full minute to spot a *Storm-Fern* or pitch camp without checking a weather menu!
- **Stealth Readability**: Walking on crisp gravel or splashing in marsh shallows plays noticeably louder transients (paired with a tiny Acoustic Lens ripple); stepping onto *Whisper-Velvet Moss* visibly and audibly silences Mara's boots to a hushed velvet brush!
- **Harmonic Relay Tuning**: Aligning Relay Nodes plays real-time consonant/dissonant intervals—locking into harmony resolves a crisp, warm resonant chord that ripples visibly across nearby bioluminescent flora!
