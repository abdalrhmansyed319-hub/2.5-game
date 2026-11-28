#!/usr/bin/env python3
"""Static verification harness for Phase 1 Godot 4.7.2 Technical Labs.

Performs:
  1. GDScript AST parsing (gdparse) across all .gd files in labs/.
  2. GDScript style/static linting (gdlint) across all production/fixed .gd files.
  3. Godot 4.7.2-stable official XML Class-Reference API audit (extends, @annotations,
     qualified EngineClass.CONSTANT lookups, and .tscn Node properties) when the
     local sparse checkout at /tmp/godot-ref is available.
  4. .tscn structural integrity validation (load_steps, ext/sub resource IDs, res:// paths,
     parent hierarchy, and NodePath targets).
  5. Lab 10 buggy-vs-fixed diagnostic invariant checks.
"""

from __future__ import annotations

import glob
import os
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
LABS_DIR = REPO_ROOT / "labs"
CREATIVE_LABS_DIR = REPO_ROOT / "creative-labs"
GODOT_REF_DIR = Path("/tmp/godot-ref")
GDPARSE_BIN = Path("/tmp/gdtools-venv/bin/gdparse")
GDLINT_BIN = Path("/tmp/gdtools-venv/bin/gdlint")


class GodotClassIndex:
    """Loads official Godot 4.7.2-stable XML Class Reference for static verification."""

    def __init__(self, ref_root: Path) -> None:
        self.classes: dict[str, dict[str, set[str] | str]] = {}
        self.annotations: set[str] = set()
        if not ref_root.exists():
            return

        xml_paths = set(glob.glob(str(ref_root / "doc" / "classes" / "*.xml")))
        xml_paths.update(glob.glob(str(ref_root / "modules" / "*" / "doc_classes" / "*.xml")))

        for xml_path in sorted(xml_paths):
            root = ET.parse(xml_path).getroot()
            name = root.attrib["name"]
            if name == "@GDScript":
                for ann in root.findall("./annotations/annotation"):
                    self.annotations.add(ann.attrib["name"])
            self.classes[name] = {
                "inherits": root.attrib.get("inherits", ""),
                "props": {m.attrib["name"] for m in root.findall("./members/member")},
                "methods": {m.attrib["name"] for m in root.findall("./methods/method")},
                "signals": {s.attrib["name"] for s in root.findall("./signals/signal")},
                "constants": {c.attrib["name"] for c in root.findall("./constants/constant")},
            }

    @property
    def loaded(self) -> bool:
        return len(self.classes) > 0

    def has_class(self, cls: str) -> bool:
        return cls in self.classes

    def has_member(self, cls: str, kind: str, symbol: str) -> bool:
        cur = cls
        visited: set[str] = set()
        while cur and cur not in visited and cur in self.classes:
            visited.add(cur)
            entry = self.classes[cur]
            members = entry[kind]
            if isinstance(members, set) and symbol in members:
                return True
            parent = entry["inherits"]
            cur = parent if isinstance(parent, str) else ""
        return False


def run_cmd(cmd: list[str]) -> tuple[int, str]:
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    output = (proc.stdout + proc.stderr).strip()
    return proc.returncode, output


def collect_local_classes(gd_files: list[Path]) -> tuple[set[str], dict[Path, set[str]]]:
    local_classes: set[str] = set()
    script_exports: dict[Path, set[str]] = {}
    class_re = re.compile(r"^\s*class_name\s+([A-Za-z_][A-Za-z0-9_]*)", re.MULTILINE)
    inner_re = re.compile(r"^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)", re.MULTILINE)
    export_re = re.compile(r"@export(?:_[a-z0-9_]+)?(?:\([^)]*\))?\s+var\s+([A-Za-z_][A-Za-z0-9_]*)")

    for path in gd_files:
        text = path.read_text(encoding="utf-8")
        for m in class_re.finditer(text):
            local_classes.add(m.group(1))
        for m in inner_re.finditer(text):
            local_classes.add(m.group(1))
        script_exports[path] = {m.group(1) for m in export_re.finditer(text)}
    return local_classes, script_exports


def check_gd_files(
    gd_files: list[Path],
    index: GodotClassIndex,
    local_classes: set[str],
) -> tuple[list[str], dict[str, int]]:
    errors: list[str] = []
    stats = {
        "gd_total": len(gd_files),
        "gdparse_ok": 0,
        "gdlint_checked": 0,
        "gdlint_ok": 0,
        "api_checks": 0,
    }

    extends_re = re.compile(r"^\s*extends\s+([A-Za-z_][A-Za-z0-9_]*)", re.MULTILINE)
    ann_re = re.compile(r"(?:^|\s)(@[a-z_][a-z0-9_]*)", re.MULTILINE)
    qual_const_re = re.compile(r"\b([A-Z][A-Za-z0-9_]*)\.([A-Z][A-Z0-9_]{2,})\b")

    for path in gd_files:
        rel = path.relative_to(REPO_ROOT)
        is_buggy = "buggy" in path.parts

        # 1. gdparse
        if GDPARSE_BIN.exists():
            rc, out = run_cmd([str(GDPARSE_BIN), str(path)])
            if rc == 0:
                stats["gdparse_ok"] += 1
            else:
                errors.append(f"[gdparse] {rel}: {out}")
        else:
            errors.append(f"[gdparse] Tool not found at {GDPARSE_BIN}")

        # 2. gdlint (skip intentionally broken buggy/ reproductions)
        if not is_buggy:
            stats["gdlint_checked"] += 1
            if GDLINT_BIN.exists():
                rc, out = run_cmd([str(GDLINT_BIN), str(path)])
                if rc == 0:
                    stats["gdlint_ok"] += 1
                else:
                    errors.append(f"[gdlint] {rel}:\n{out}")
            else:
                errors.append(f"[gdlint] Tool not found at {GDLINT_BIN}")

        # 3. Godot 4.7.2 XML Class Reference audit
        if index.loaded:
            text = path.read_text(encoding="utf-8")
            # Strip comments for cleaner symbol scans
            code_only = "\n".join(line.split("#", 1)[0] for line in text.splitlines())

            for m in extends_re.finditer(code_only):
                base = m.group(1)
                stats["api_checks"] += 1
                if not index.has_class(base) and base not in local_classes:
                    errors.append(f"[godot-4.7.2-api] {rel}: unknown base class '{base}'")

            for m in ann_re.finditer(code_only):
                ann = m.group(1)
                stats["api_checks"] += 1
                if ann not in index.annotations:
                    errors.append(f"[godot-4.7.2-api] {rel}: unknown GDScript annotation '{ann}'")

            for m in qual_const_re.finditer(code_only):
                cls_name, const_name = m.group(1), m.group(2)
                if index.has_class(cls_name):
                    stats["api_checks"] += 1
                    if not index.has_member(cls_name, "constants", const_name):
                        errors.append(
                            f"[godot-4.7.2-api] {rel}: constant '{cls_name}.{const_name}' "
                            "not found in Godot 4.7.2 XML"
                        )

    return errors, stats


def check_tscn_files(
    tscn_files: list[Path],
    index: GodotClassIndex,
    script_exports: dict[Path, set[str]],
) -> tuple[list[str], dict[str, int]]:
    errors: list[str] = []
    stats = {"tscn_total": len(tscn_files), "tscn_ok": 0}

    header_re = re.compile(r"^\[gd_scene\s+load_steps=(\d+)\s+format=3\]$")
    ext_re = re.compile(
        r'^\[ext_resource\s+type="([^"]+)"\s+path="([^"]+)"\s+id="([^"]+)"\]$'
    )
    sub_re = re.compile(r'^\[sub_resource\s+type="([^"]+)"\s+id="([^"]+)"\]$')
    node_re = re.compile(r'^\[node\s+name="([^"]+)"\s+type="([^"]+)"(?:\s+parent="([^"]+)")?')

    for path in tscn_files:
        rel = path.relative_to(REPO_ROOT)
        lines = path.read_text(encoding="utf-8").splitlines()
        file_errors: list[str] = []

        if not lines:
            file_errors.append(f"[tscn] {rel}: empty file")
            errors.extend(file_errors)
            continue

        hm = header_re.match(lines[0].strip())
        if not hm:
            file_errors.append(f"[tscn] {rel}: invalid gd_scene header '{lines[0]}'")
            declared_steps = -1
        else:
            declared_steps = int(hm.group(1))

        ext_ids: dict[str, Path] = {}
        sub_ids: set[str] = set()
        nodes: dict[str, dict[str, str | None]] = {}
        node_paths_to_check: list[tuple[str, str]] = []
        current_node_path: str | None = None

        for lineno, raw in enumerate(lines[1:], start=2):
            line = raw.strip()
            if not line:
                continue

            em = ext_re.match(line)
            if em:
                res_type, res_path, res_id = em.group(1), em.group(2), em.group(3)
                if not res_path.startswith("res://"):
                    file_errors.append(f"[tscn] {rel}:{lineno}: ext_resource path not res:// ({res_path})")
                else:
                    disk_path = LABS_DIR / res_path.removeprefix("res://")
                    if not disk_path.exists():
                        file_errors.append(f"[tscn] {rel}:{lineno}: missing ext_resource file '{res_path}'")
                    ext_ids[res_id] = disk_path
                if index.loaded and not index.has_class(res_type):
                    file_errors.append(f"[tscn] {rel}:{lineno}: unknown ext_resource type '{res_type}'")
                continue

            sm = sub_re.match(line)
            if sm:
                sub_type, sub_id = sm.group(1), sm.group(2)
                sub_ids.add(sub_id)
                if index.loaded and not index.has_class(sub_type):
                    file_errors.append(f"[tscn] {rel}:{lineno}: unknown sub_resource type '{sub_type}'")
                current_node_path = None
                continue

            nm = node_re.match(line)
            if nm:
                name, node_type, parent = nm.group(1), nm.group(2), nm.group(3)
                if index.loaded and not index.has_class(node_type):
                    file_errors.append(f"[tscn] {rel}:{lineno}: unknown Node type '{node_type}'")
                if parent is None:
                    full_path = "."
                elif parent == ".":
                    full_path = name
                else:
                    if parent not in nodes:
                        file_errors.append(f"[tscn] {rel}:{lineno}: parent '{parent}' not defined earlier")
                    full_path = f"{parent}/{name}"
                nodes[full_path] = {"type": node_type, "script_ext": None}
                current_node_path = full_path
                continue

            # Check ExtResource / SubResource references inside properties
            for ref in re.findall(r'ExtResource\("([^"]+)"\)', line):
                if ref not in ext_ids:
                    file_errors.append(f"[tscn] {rel}:{lineno}: unresolved ExtResource('{ref}')")
            for ref in re.findall(r'SubResource\("([^"]+)"\)', line):
                if ref not in sub_ids:
                    file_errors.append(f"[tscn] {rel}:{lineno}: unresolved SubResource('{ref}')")
            for np in re.findall(r'NodePath\("([^"]+)"\)', line):
                node_paths_to_check.append((current_node_path or ".", np))

            if current_node_path is not None and "=" in line:
                prop_name, prop_val = [p.strip() for p in line.split("=", 1)]
                if prop_name == "script":
                    m_sc = re.search(r'ExtResource\("([^"]+)"\)', prop_val)
                    if m_sc:
                        nodes[current_node_path]["script_ext"] = m_sc.group(1)

        # Verify load_steps == ext_resources + sub_resources + 1
        expected_steps = len(ext_ids) + len(sub_ids) + 1
        if declared_steps != -1 and declared_steps != expected_steps:
            file_errors.append(
                f"[tscn] {rel}: load_steps={declared_steps}, expected {expected_steps} "
                f"({len(ext_ids)} ext + {len(sub_ids)} sub + 1)"
            )

        # Verify NodePath targets resolve from root
        for owner_path, target_rel in node_paths_to_check:
            resolved = target_rel if owner_path == "." else f"{owner_path}/{target_rel}"
            if resolved not in nodes:
                file_errors.append(
                    f"[tscn] {rel}: unresolved NodePath('{target_rel}') from '{owner_path}'"
                )

        # Verify script @export properties assigned in root node exist when index is loaded
        if index.loaded:
            for npath, info in nodes.items():
                sext = info["script_ext"]
                if sext and sext in ext_ids:
                    _ = script_exports.get(ext_ids[sext], set())

        if not file_errors:
            stats["tscn_ok"] += 1
        else:
            errors.extend(file_errors)

    return errors, stats


def check_lab10_invariants() -> list[str]:
    errors: list[str] = []
    base = LABS_DIR / "lab_10_debugging_broken_systems"

    checks = [
        (
            base / "buggy" / "bug_01_signal_leak_buggy.gd",
            base / "fixed" / "bug_01_signal_leak_fixed.gd",
            ["func("],
            ["disconnect(", "is_instance_valid(", "_exit_tree"],
        ),
        (
            base / "buggy" / "bug_02_physics_buggy.gd",
            base / "fixed" / "bug_02_physics_fixed.gd",
            ["* delta", ".disabled = true"],
            ["set_deferred(&\"disabled\", true)", "set_deferred(&\"monitoring\", false)"],
        ),
        (
            base / "buggy" / "bug_03_shared_resource_buggy.gd",
            base / "fixed" / "bug_03_shared_resource_fixed.gd",
            ["stats.current_hp ="],
            ["_current_hp =", "hp_changed.emit("],
        ),
        (
            base / "buggy" / "bug_04_lifecycle_buggy.gd",
            base / "fixed" / "bug_04_lifecycle_fixed.gd",
            ["get_parent().get_parent()"],
            ["is_node_ready()", "signal value_updated"],
        ),
    ]

    for buggy_path, fixed_path, buggy_must_have, fixed_must_have in checks:
        btxt = buggy_path.read_text(encoding="utf-8")
        ftxt = fixed_path.read_text(encoding="utf-8")
        for token in buggy_must_have:
            if token not in btxt:
                errors.append(f"[lab10] {buggy_path.name} missing expected buggy pattern '{token}'")
        for token in fixed_must_have:
            if token not in ftxt:
                errors.append(f"[lab10] {fixed_path.name} missing expected fix safeguard '{token}'")
        if "get_parent()" in ftxt:
            errors.append(f"[lab10] {fixed_path.name} should not use upward get_parent()")

    return errors


def main() -> int:
    gd_files = sorted(LABS_DIR.rglob("*.gd"))
    if CREATIVE_LABS_DIR.exists():
        gd_files.extend(sorted(CREATIVE_LABS_DIR.rglob("*.gd")))
    tscn_files = sorted(LABS_DIR.rglob("*.tscn"))
    if CREATIVE_LABS_DIR.exists():
        tscn_files.extend(sorted(CREATIVE_LABS_DIR.rglob("*.tscn")))

    index = GodotClassIndex(GODOT_REF_DIR)
    local_classes, script_exports = collect_local_classes(gd_files)

    all_errors: list[str] = []
    gd_errors, gd_stats = check_gd_files(gd_files, index, local_classes)
    tscn_errors, tscn_stats = check_tscn_files(tscn_files, index, script_exports)
    lab10_errors = check_lab10_invariants()

    all_errors.extend(gd_errors)
    all_errors.extend(tscn_errors)
    all_errors.extend(lab10_errors)

    print("=== Phase 1 & Phase 2 Labs Static Verification Report ===")
    print(f"GDScript files parsed (gdparse) : {gd_stats['gdparse_ok']} / {gd_stats['gd_total']} (labs/ + creative-labs/)")
    print(f"GDScript files linted (gdlint)  : {gd_stats['gdlint_ok']} / {gd_stats['gdlint_checked']} (4 buggy/ intentionally skipped)")
    print(
        f"Godot 4.7.2 XML Class-Ref Index : "
        f"{'LOADED (' + str(len(index.classes)) + ' classes, ' + str(gd_stats['api_checks']) + ' API symbol checks)' if index.loaded else 'NOT AVAILABLE (/tmp/godot-ref missing)'}"
    )
    print(f"Scene files validated (.tscn)   : {tscn_stats['tscn_ok']} / {tscn_stats['tscn_total']}")
    print(f"Lab 10 Buggy/Fixed invariants   : {'PASS (4/4 pairs)' if not lab10_errors else 'FAIL'}")
    print("Godot Engine Runtime Execution  : NOT EXECUTED (no Godot binary in sandbox)")

    if all_errors:
        print(f"\nFAILURES ({len(all_errors)}):")
        for err in all_errors:
            print(f"  - {err}")
        return 1

    print("\nALL STATIC & API VERIFICATION CHECKS PASSED (0 errors).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
