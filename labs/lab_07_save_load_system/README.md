# Lab 07 — Flexible, Versioned, Atomic Save/Load System

## 1. Objective
Implement a production-grade persistence architecture featuring stable entity identity (`SaveableComponent` + `persistent_id`), safe non-executable serialization (JSON instead of untrusted `.tres`), SHA-256 HMAC integrity verification, deterministic schema migration (`v1 -> v2`), atomic crash-safe writes (`.tmp` -> `.bak` rotation -> `DirAccess.rename_absolute`), and automatic backup fallback.

## 2. Technical Approach
- Avoid `ResourceLoader.load()` on user save files because `.tres` files can embed arbitrary executable GDScript.
- Sign canonical sorted-key JSON (`JSON.stringify(payload, "", true)`) with Godot's native `HMACContext` (`HashingContext.HASH_SHA256`) so truncated or corrupted saves fail explicitly instead of half-loading broken state.
- Write to a `.tmp` file, flush/close, rotate previous `.sav` to `.bak`, and promote `.tmp` via `DirAccess.rename_absolute()` so a mid-save power loss never leaves a zero-byte primary file.
- Return structured `SaveResult` inner-class objects (`ok`, `error`, `message`, `payload`, `used_backup`) so callers handle errors cleanly without exceptions.

## 3. Architecture
```text
SceneTree Group ("saveable_component")
  └── SaveableComponent (@abstract, stable persistent_id)
            ▲ capture_state() / restore_state()
            │
        SaveSystem (RefCounted)
            ├── Signed JSON Envelope (HMAC-SHA256)
            ├── Sequential Schema Migrator (v1 -> v2 -> ...)
            └── Atomic File Pipeline (.tmp -> .bak -> .sav)
```

## 4. Implementation
- `saveable_component.gd`: `@abstract` persistence contract auto-registering into the `&"saveable_component"` group on `_enter_tree()`.
- `save_system.gd`: Full save/load/migration/HMAC/atomic-file/backup-fallback engine.

## 5. Testing Process
- **Code Written**: Complete (2 `.gd` scripts).
- **Static Verification (`tools/verify_labs.py`)**: Verified via `gdparse`, `gdlint`, and Godot `4.7.2-stable` XML Class-Ref API checks (`FileAccess`, `DirAccess.rename_absolute`, `DirAccess.remove_absolute`, `HMACContext`, `HashingContext.HASH_SHA256`, `JSON.stringify`, `JSON.parse_string`, `Time.get_unix_time_from_system`).
- **Runtime Execution in Godot**: *Not yet executed* (pending Godot 4.7+ binary; planned tests verify normal roundtrip, tampered-byte HMAC rejection + `.bak` recovery, `v1 -> v2` migration, future-version rejection `ERR_FILE_UNRECOGNIZED`, and path-traversal rejection in `_sanitize_slot_id()`).

## 6. Problems Encountered
- JSON key ordering can differ between runs if unsorted, which breaks deterministic HMAC verification when re-serializing; solved by signing the exact canonical `payload_json` string stored inside the outer envelope (`JSON.stringify(payload, "", true)`).
- Path traversal safety: raw `slot_id` inputs containing `../` or path separators must be rejected before constructing `user://saves/` paths.
- Note Godot 4.6 API update: `FileAccess.get_as_text()` removed its legacy `skip_cr` parameter; calling `file.get_as_text()` with zero arguments is clean and 4.6–4.7 compliant.

## 7. Final Result
A secure, crash-resilient, migration-ready persistence module cleanly decoupled from game-specific entities and UI.

## 8. Possible Improvements
- Move file I/O and JSON stringification for very large worlds onto a `WorkerThreadPool` task after capturing an immutable state snapshot on the main thread to guarantee zero save-hitch frames.
- Add optional ZSTD compression (`FileAccess.open_compressed(..., FileAccess.COMPRESSION_ZSTD)`) for large tile/world-delta saves.
