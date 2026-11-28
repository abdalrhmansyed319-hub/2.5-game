# `game/tests/` — Verification Suites & Windows Performance Benchmarks

Planned Stage 05/06 tests (`docs/concept/25-vertical-slice-acceptance-criteria.md`):
- Windows Visual Prototype A/B test harness (`480×270` vs `640×360` scaling on `1080p`/`1440p`).
- Live `3×3` chunk-streaming frame-time profiler verifying `>= 60 FPS` (`p99 < 14 ms`) on target Windows hardware (`L5`).
- Data-resource loader, trophic interaction, and delta-save round-trip verification tests.
