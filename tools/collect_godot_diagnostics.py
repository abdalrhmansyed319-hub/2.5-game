#!/usr/bin/env python3
"""VERDANT SIGNAL — Automated Godot 4.7.2 Error-Collection & Static Audit Tool.

Eliminates manual screenshot hunting by:
  1. Running comprehensive static structural & Godot 4.7.2 invariant checks
     across game/ (project.godot, .gd scripts, .tscn/.tres scenes, InputMap,
     physics layer masks, TileSet ordering, res:// links, placeholders).
  2. Optionally launching Godot 4.7.2 headlessly (editor import/parse + full
     scene & runtime smoke runner res://tests/smoke_runner.tscn), OR parsing
     an existing Windows Godot log file (--parse-log).
  3. Deduplicating & grouping repeated errors by root cause (e.g. collapsing
     thousands of identical per-tick errors into 1 actionable group with exact
     count, category, file/line, and sample message).
  4. Saving a clean, pasteable Markdown diagnostic report under:
       docs/quality/GODOT_DIAGNOSTIC_CAPTURE.md

Usage (Windows PowerShell / CMD):
  python tools/collect_godot_diagnostics.py --godot "C:\\path\\to\\Godot_v4.7.2-stable_win64_console.exe"
  python tools/collect_godot_diagnostics.py --parse-log "%APPDATA%\\Godot\\app_userdata\\VERDANT SIGNAL\\logs\\godot.log"
  python tools/collect_godot_diagnostics.py --static-only
"""

from __future__ import annotations

import argparse
import collections
import datetime
import os
import pathlib
import re
import shutil
import struct
import subprocess
import sys
import zlib
from typing import Any

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
GAME_ROOT = REPO_ROOT / "game"
DEFAULT_REPORT = REPO_ROOT / "docs/quality/GODOT_DIAGNOSTIC_CAPTURE.md"


def run_static_checks() -> list[dict[str, str]]:
    """Run deterministic structural & Godot 4.7.2 invariant audits on game/."""
    findings: list[dict[str, str]] = []

    def add(severity: str, category: str, location: str, message: str) -> None:
        findings.append(
            {
                "severity": severity,
                "category": category,
                "location": location,
                "message": message,
            }
        )

    pg_path = GAME_ROOT / "project.godot"
    if not pg_path.exists():
        add("ERROR", "Project Config", "game/project.godot", "Missing project.godot")
        return findings
    pg_text = pg_path.read_text(encoding="utf-8")

    # 1. InputMap actions check
    defined_actions: set[str] = set()
    if "[input]" in pg_text:
        input_block = pg_text.split("[input]", 1)[1].split("\n[", 1)[0]
        defined_actions = set(re.findall(r"^([a-z0-9_]+)=\{$", input_block, re.M))

    # 2. Physics layer names check
    layer_names: dict[int, str] = {}
    for m in re.finditer(r'2d_physics/layer_(\d+)="([^"]+)"', pg_text):
        layer_names[1 << (int(m.group(1)) - 1)] = m.group(2)

    # 3. GDScript audits
    gd_files = sorted(GAME_ROOT.rglob("*.gd"))
    for gd in gd_files:
        rel = gd.relative_to(REPO_ROOT).as_posix()
        txt = gd.read_text(encoding="utf-8")
        lines = txt.splitlines()
        for ln, line in enumerate(lines, 1):
            code = line.split("#", 1)[0]
            # Check forbidden String(Variant) patterns
            if re.search(r"\bString\s*\(", code):
                add(
                    "ERROR",
                    "GDScript Type Safety",
                    f"{rel}:{ln}",
                    f"String(...) constructor call risks Godot 4.7.2 Variant rejection: {code.strip()}",
                )
            # Check Input.* action names against project.godot
            if "Input." in code or "is_action" in code:
                for am in re.finditer(r'"([a-z0-9_]+)"', code):
                    act = am.group(1)
                    if act not in defined_actions:
                        add(
                            "ERROR",
                            "InputMap Mismatch",
                            f"{rel}:{ln}",
                            f'Action "{act}" is not defined in game/project.godot [input]',
                        )
            # Check untyped array literal in typed for-loop
            if re.search(r"\bfor\s+\w+\s*:\s*\w+\s+in\s+\[", code):
                add(
                    "WARNING",
                    "GDScript Type Safety",
                    f"{rel}:{ln}",
                    f"Untyped array literal in typed for-loop: {code.strip()}",
                )

        # Check TileSetAtlasSource add_source before create_tile invariant
        if "TileSetAtlasSource" in txt and "create_tile(" in txt and "add_source(" in txt:
            idx_add = txt.find("add_source(")
            idx_build = txt.find("_build_")
            if idx_build != -1 and idx_build < idx_add:
                add(
                    "ERROR",
                    "TileSet Invariant",
                    rel,
                    "TileSetAtlasSource appears populated before ts.add_source() attaches TileSet.",
                )

    # 4. res:// reference audit
    res_re = re.compile(r"res://([A-Za-z0-9_./\-]+)")
    for ext in ("*.gd", "*.tscn", "*.tres", "project.godot"):
        for f in sorted(GAME_ROOT.rglob(ext)):
            rel_f = f.relative_to(REPO_ROOT).as_posix()
            txt = f.read_text(encoding="utf-8")
            for m in res_re.finditer(txt):
                target = m.group(1)
                if target.endswith("/"):
                    continue
                if f.name == "asset_paths.gd" and not target.startswith(
                    "assets/debug_placeholders/"
                ):
                    continue
                if not (GAME_ROOT / target).exists():
                    add(
                        "ERROR",
                        "Missing Resource",
                        rel_f,
                        f"Referenced res://{target} does not exist on disk.",
                    )

    # 5. .tscn / .tres load_steps audit
    for ext in ("*.tscn", "*.tres"):
        for f in sorted(GAME_ROOT.rglob(ext)):
            rel_f = f.relative_to(REPO_ROOT).as_posix()
            txt = f.read_text(encoding="utf-8")
            m = re.search(r"load_steps=(\d+)", txt)
            declared = int(m.group(1)) if m else 1
            ext_n = len(re.findall(r"^\[ext_resource\b", txt, re.M))
            sub_n = len(re.findall(r"^\[sub_resource\b", txt, re.M))
            expected = ext_n + sub_n + 1
            if declared != expected:
                add(
                    "ERROR",
                    "Scene/Resource Header",
                    rel_f,
                    f"load_steps={declared}, expected {expected} ({ext_n} ext + {sub_n} sub + 1).",
                )

    # 6. Physics collision bitmask sanity check on player & tree
    player_tscn = GAME_ROOT / "characters/player/player.tscn"
    if player_tscn.exists():
        pt = player_tscn.read_text(encoding="utf-8")
        m_layer = re.search(r"collision_layer\s*=\s*(\d+)", pt)
        if m_layer and layer_names.get(int(m_layer.group(1))) != "player_body":
            add(
                "ERROR",
                "Physics Layer Mismatch",
                "game/characters/player/player.tscn",
                f"Player collision_layer={m_layer.group(1)} does not map to 'player_body'.",
            )

    # 7. Placeholder PNG integrity check
    ph_dir = GAME_ROOT / "assets/debug_placeholders"
    if ph_dir.exists():
        for png in sorted(ph_dir.glob("*.png")):
            data = png.read_bytes()
            if data[:8] != b"\x89PNG\r\n\x1a\n":
                add("ERROR", "Asset Integrity", png.name, "Invalid PNG header.")
                continue
            pos = 8
            while pos < len(data):
                ln = struct.unpack("!I", data[pos : pos + 4])[0]
                tag = data[pos + 4 : pos + 8]
                payload = data[pos + 8 : pos + 8 + ln]
                crc_file = struct.unpack("!I", data[pos + 8 + ln : pos + 12 + ln])[0]
                if (zlib.crc32(tag + payload) & 0xFFFFFFFF) != crc_file:
                    add("ERROR", "Asset Integrity", png.name, f"Corrupt CRC in {tag!r}.")
                    break
                pos += 12 + ln

    return findings


def categorize_godot_message(msg: str, location: str) -> str:
    low = f"{msg} {location}".lower()
    if "inputmap" in low or "action" in low and "doesn't exist" in low:
        return "InputMap / Runtime"
    if "tileset" in low or "tiledata" in low or "tilemap" in low or "custom_data" in low or "physics.size" in low:
        return "TileSet / TileMap"
    if "gdscript" in low or "parse error" in low or "compile" in low or "script error" in low:
        return "Script Parse / GDScript"
    if "load" in low or "resource" in low or "uid" in low or "import" in low or "res://" in low:
        return "Resource Load / Import"
    if "d3d12" in low or "vulkan" in low or "opengl" in low or "angle" in low or "shader" in low:
        return "Graphics / Driver"
    if "scene" in low or "node" in low or "instantiate" in low:
        return "Scene Initialization"
    return "Runtime / Engine"


def normalize_signature(msg: str) -> str:
    s = re.sub(r"\([^)]*\d+[^)]*\)", "(<coords>)", msg)
    s = re.sub(r"\b0x[0-9a-fA-F]+\b", "<hex>", s)
    s = re.sub(r"\b\d+\.\d+\b", "<float>", s)
    s = re.sub(r"\b\d+\b", "<num>", s)
    return re.sub(r"\s+", " ", s).strip()


def parse_godot_log_text(raw_text: str) -> dict[str, Any]:
    """Parse Godot stdout/stderr/godot.log into deduplicated root-cause groups."""
    lines = raw_text.splitlines()
    error_groups: dict[tuple[str, str, str], dict[str, Any]] = {}
    warning_groups: dict[tuple[str, str, str], dict[str, Any]] = {}
    smoke_lines: list[str] = []

    err_re = re.compile(r"^\s*(USER ERROR|SCRIPT ERROR|ERROR):\s*(.*)$")
    warn_re = re.compile(r"^\s*(USER WARNING|WARNING):\s*(.*)$")
    at_re = re.compile(r"^\s*at:\s*(.*)$")

    i = 0
    total_errors = 0
    total_warnings = 0
    while i < len(lines):
        line = lines[i]
        if "[SMOKE]" in line:
            smoke_lines.append(line.strip())
        em = err_re.match(line)
        wm = warn_re.match(line)
        if em or wm:
            is_err = em is not None
            m = em if em is not None else wm
            assert m is not None
            msg = m.group(2).strip()
            loc = "(no source line)"
            if i + 1 < len(lines):
                am = at_re.match(lines[i + 1])
                if am:
                    loc = am.group(1).strip()
                    i += 1
            cat = categorize_godot_message(msg, loc)
            norm = normalize_signature(msg)
            key = (cat, loc, norm)
            bucket = error_groups if is_err else warning_groups
            if is_err:
                total_errors += 1
            else:
                total_warnings += 1
            if key not in bucket:
                bucket[key] = {
                    "category": cat,
                    "location": loc,
                    "sample": msg,
                    "count": 0,
                }
            bucket[key]["count"] += 1
        i += 1

    sorted_errors = sorted(
        error_groups.values(), key=lambda x: (-x["count"], x["category"], x["location"])
    )
    sorted_warnings = sorted(
        warning_groups.values(), key=lambda x: (-x["count"], x["category"], x["location"])
    )
    return {
        "total_errors": total_errors,
        "unique_error_groups": len(sorted_errors),
        "total_warnings": total_warnings,
        "unique_warning_groups": len(sorted_warnings),
        "errors": sorted_errors,
        "warnings": sorted_warnings,
        "smoke_lines": smoke_lines,
    }


def find_godot_binary(explicit: str | None) -> str | None:
    if explicit:
        return explicit if pathlib.Path(explicit).exists() else None
    env_bin = os.environ.get("GODOT_BIN")
    if env_bin and pathlib.Path(env_bin).exists():
        return env_bin
    for cand in ("godot", "godot4", "Godot_v4.7.2-stable_win64_console.exe"):
        found = shutil.which(cand)
        if found:
            return found
    return None


def run_godot_command(godot_bin: str, args: list[str], timeout_s: int = 90) -> tuple[int, str]:
    cmd = [godot_bin, *args]
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_s,
        )
        return proc.returncode, proc.stdout
    except subprocess.TimeoutExpired as exc:
        partial = exc.stdout if isinstance(exc.stdout, str) else ""
        return 124, partial + f"\nERROR: Command timed out after {timeout_s}s: {' '.join(cmd)}\n"


def render_report(
    static_findings: list[dict[str, str]],
    godot_bin: str | None,
    godot_version: str,
    import_rc: int | None,
    smoke_rc: int | None,
    parsed_log: dict[str, Any] | None,
    source_note: str,
) -> str:
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    static_errs = [f for f in static_findings if f["severity"] == "ERROR"]
    static_warns = [f for f in static_findings if f["severity"] == "WARNING"]

    lines: list[str] = [
        "# VERDANT SIGNAL — Automated Godot Diagnostic Capture",
        "",
        f"- **Generated**: `{now}`",
        f"- **Capture Mode**: `{source_note}`",
        f"- **Godot Binary**: `{godot_bin or 'NOT AVAILABLE IN THIS ENVIRONMENT'}`",
        f"- **Godot Version**: `{godot_version}`",
        "",
        "## 1. Validation Levels Executed",
        "",
        f"1. **Static Validation**: `{'PASS (0 errors)' if not static_errs else f'FAIL ({len(static_errs)} errors)'}` (`{len(static_warns)}` warnings)",
        f"2. **Godot Headless Import/Parse Validation**: `{('PASS (exit 0)' if import_rc == 0 else f'EXIT {import_rc}') if import_rc is not None else 'NOT RUN (no Godot binary)'}`",
        f"3. **Godot Headless Runtime Smoke Validation**: `{('PASS (exit 0)' if smoke_rc == 0 else f'EXIT {smoke_rc}') if smoke_rc is not None else 'NOT RUN (no Godot binary)'}`",
        "4. **Actual Windows Editor & Gameplay Validation**: `Requires running in Windows Godot 4.7.2 GUI`",
        "",
        "## 2. Static Structural Audit Findings",
        "",
    ]

    if not static_findings:
        lines.append("- **0 static errors and 0 static warnings found across `game/`.**")
    else:
        lines.append("| Severity | Category | Location | Details |")
        lines.append("| :---: | --- | --- | --- |")
        for f in static_findings:
            lines.append(
                f"| {f['severity']} | {f['category']} | `{f['location']}` | {f['message']} |"
            )

    lines.extend(["", "## 3. Godot Engine / Runtime Log Summary (Grouped by Root Cause)", ""])
    if parsed_log is None:
        lines.append(
            "- No Godot runtime log captured in this run. Run on Windows via:"
        )
        lines.append(
            '  `python tools/collect_godot_diagnostics.py --godot "C:\\path\\to\\Godot_v4.7.2-stable_win64_console.exe"`'
        )
    else:
        lines.append(
            f"- **Total Raw Errors**: `{parsed_log['total_errors']}` collapsed into **`{parsed_log['unique_error_groups']}`** unique root-cause group(s)"
        )
        lines.append(
            f"- **Total Raw Warnings**: `{parsed_log['total_warnings']}` collapsed into **`{parsed_log['unique_warning_groups']}`** unique group(s)"
        )
        lines.append("")
        if parsed_log["errors"]:
            lines.append("### Grouped Errors")
            lines.append("")
            lines.append("| Count | Category | Source Location | Sample Message |")
            lines.append("| ---: | --- | --- | --- |")
            for grp in parsed_log["errors"]:
                sample = grp["sample"].replace("|", "\\|")
                loc = grp["location"].replace("|", "\\|")
                lines.append(
                    f"| {grp['count']} | {grp['category']} | `{loc}` | {sample} |"
                )
        else:
            lines.append("- **0 Godot runtime/editor errors detected.**")

        lines.append("")
        if parsed_log["warnings"]:
            lines.append("### Grouped Warnings")
            lines.append("")
            lines.append("| Count | Category | Source Location | Sample Message |")
            lines.append("| ---: | --- | --- | --- |")
            for grp in parsed_log["warnings"]:
                sample = grp["sample"].replace("|", "\\|")
                loc = grp["location"].replace("|", "\\|")
                lines.append(
                    f"| {grp['count']} | {grp['category']} | `{loc}` | {sample} |"
                )
        else:
            lines.append("- **0 Godot warnings detected.**")

        if parsed_log["smoke_lines"]:
            lines.extend(["", "### Smoke Runner Checkpoints", "", "```text"])
            lines.extend(parsed_log["smoke_lines"])
            lines.append("```")

    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Collect & group VERDANT SIGNAL Godot 4.7.2 errors without screenshots."
    )
    parser.add_argument("--godot", help="Path to Godot 4.7.2 console executable")
    parser.add_argument(
        "--parse-log",
        help="Parse an existing Godot log file (e.g. %%APPDATA%%\\Godot\\...\\godot.log)",
    )
    parser.add_argument(
        "--static-only", action="store_true", help="Run static repository audit only"
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_REPORT),
        help="Output Markdown report path (default: docs/quality/GODOT_DIAGNOSTIC_CAPTURE.md)",
    )
    args = parser.parse_args()

    static_findings = run_static_checks()
    godot_bin: str | None = None
    godot_version = "not executed"
    import_rc: int | None = None
    smoke_rc: int | None = None
    parsed_log: dict[str, Any] | None = None
    source_note = "static-only"

    if args.parse_log:
        log_path = pathlib.Path(args.parse_log)
        if not log_path.exists():
            print(f"ERROR: Log file not found: {log_path}", file=sys.stderr)
            return 2
        raw = log_path.read_text(encoding="utf-8", errors="replace")
        parsed_log = parse_godot_log_text(raw)
        source_note = f"parsed-log ({log_path.name})"
    elif not args.static_only:
        godot_bin = find_godot_binary(args.godot)
        if godot_bin:
            source_note = "headless-godot-live"
            _, ver_out = run_godot_command(godot_bin, ["--version"], timeout_s=20)
            godot_version = ver_out.strip().splitlines()[0] if ver_out.strip() else "unknown"
            import_rc, import_log = run_godot_command(
                godot_bin,
                ["--headless", "--editor", "--quit-after", "2", "--path", "game"],
                timeout_s=120,
            )
            smoke_rc, smoke_log = run_godot_command(
                godot_bin,
                ["--headless", "--path", "game", "res://tests/smoke_runner.tscn"],
                timeout_s=120,
            )
            parsed_log = parse_godot_log_text(import_log + "\n" + smoke_log)
        else:
            source_note = "static-only (Godot binary not found)"

    report_text = render_report(
        static_findings=static_findings,
        godot_bin=godot_bin,
        godot_version=godot_version,
        import_rc=import_rc,
        smoke_rc=smoke_rc,
        parsed_log=parsed_log,
        source_note=source_note,
    )
    out_path = pathlib.Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report_text, encoding="utf-8")

    print(report_text)
    print(f"Saved report to: {out_path}")

    has_static_err = any(f["severity"] == "ERROR" for f in static_findings)
    has_godot_err = parsed_log is not None and parsed_log["total_errors"] > 0
    return 1 if (has_static_err or has_godot_err or (smoke_rc not in (None, 0))) else 0


if __name__ == "__main__":
    raise SystemExit(main())
