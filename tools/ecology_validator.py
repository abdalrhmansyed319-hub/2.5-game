#!/usr/bin/env python3
"""Ecological & Progression Database Consistency Validator (Phase 4 Studio Tool #1).

Zero-dependency Python 3.11+ validator auditing docs/concept/data/*.json:
  1. ID uniqueness & cross-reference integrity (biomes, flora, fauna, weather, progression).
  2. Biome adjacency graph symmetry & reachability from crash-landing zone.
  3. Trophic food-web spatial co-location proof (every creature shares >=1 biome with its food!).
  4. Duplicate/cosmetic-clone species detection.
  5. Progression milestone resource & discovery reachability proof.
  6. Per-biome ecological density coverage (flora, fauna, weather presence).

Usage:
  python3 tools/ecology_validator.py [--data-dir docs/concept/data] [--report out.md]
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict, deque
from pathlib import Path


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_ecology(data_dir: Path) -> tuple[list[str], list[str], dict]:
    errors: list[str] = []
    warnings: list[str] = []

    biomes_doc = load_json(data_dir / "biomes.json")
    flora_doc = load_json(data_dir / "flora.json")
    fauna_doc = load_json(data_dir / "fauna.json")
    weather_doc = load_json(data_dir / "weather.json")
    prog_doc = load_json(data_dir / "progression.json")

    biomes = {b["id"]: b for b in biomes_doc["biomes"]}
    hub_ids = {h["id"]: h for h in biomes_doc.get("linked_transition_hubs", [])}
    valid_geo_nodes = set(biomes.keys()) | set(hub_ids.keys())

    flora = {f["id"]: f for f in flora_doc["flora"]}
    fauna = {a["id"]: a for a in fauna_doc["fauna"]}
    weather = {w["id"]: w for w in weather_doc["planetary_events"]}

    # 1. Uniqueness checks
    if len(biomes) != len(biomes_doc["biomes"]):
        errors.append("Duplicate biome IDs detected in biomes.json")
    if len(flora) != len(flora_doc["flora"]):
        errors.append("Duplicate flora IDs detected in flora.json")
    if len(fauna) != len(fauna_doc["fauna"]):
        errors.append("Duplicate fauna IDs detected in fauna.json")

    # 2. Biome graph adjacency & BFS reachability from starter biome
    adj_graph: dict[str, set[str]] = defaultdict(set)
    for bid, b in biomes.items():
        for nb in b["adjacent"]:
            if nb not in valid_geo_nodes:
                errors.append(f"Biome '{bid}' references unknown adjacent node '{nb}'")
            else:
                adj_graph[bid].add(nb)
                if nb in biomes and bid not in biomes[nb]["adjacent"]:
                    errors.append(f"Asymmetric biome adjacency: '{bid}' -> '{nb}' not reciprocated")
    for hid, hub in hub_ids.items():
        for nb in hub["connects"]:
            if nb not in biomes:
                errors.append(f"Hub '{hid}' references unknown biome '{nb}'")
            else:
                adj_graph[hid].add(nb)
                adj_graph[nb].add(hid)

    start_biome = "amber_kelp_coast"
    visited: set[str] = set()
    queue: deque[str] = deque([start_biome])
    while queue:
        cur = queue.popleft()
        if cur in visited:
            continue
        visited.add(cur)
        for nxt in adj_graph[cur]:
            if nxt not in visited:
                queue.append(nxt)
    unreachable = set(biomes.keys()) - visited
    if unreachable:
        errors.append(f"Unreachable biomes from '{start_biome}': {sorted(unreachable)}")

    # 3. Resource index + Flora checks + Clone detector
    biome_flora: dict[str, list[str]] = defaultdict(list)
    resource_sources: dict[str, set[str]] = defaultdict(set)
    for bid, b in biomes.items():
        for res in b["key_resources"]:
            resource_sources[res].add(bid)

    flora_signatures: dict[tuple, str] = {}
    for fid, f in flora.items():
        for bid in f["biomes"]:
            if bid not in biomes:
                errors.append(f"Flora '{fid}' references unknown biome '{bid}'")
            else:
                biome_flora[bid].append(fid)
                resource_sources[f["resource"]].add(bid)
        sig = (tuple(sorted(f["biomes"])), f["category"], f["toxicity"], f["edible"])
        if sig in flora_signatures:
            warnings.append(
                f"Potential flora overlap: '{fid}' shares (biomes, category, toxicity, edible) with '{flora_signatures[sig]}'"
            )
        else:
            flora_signatures[sig] = fid

    # 4. Fauna biome refs + Trophic spatial co-location proof
    biome_fauna: dict[str, list[str]] = defaultdict(list)
    food_links_checked = 0
    for aid, a in fauna.items():
        a_biomes = set(a["biomes"])
        for bid in a_biomes:
            if bid not in biomes:
                errors.append(f"Fauna '{aid}' references unknown biome '{bid}'")
            else:
                biome_fauna[bid].append(aid)

        for food_id in a["diet"]:
            food_links_checked += 1
            if food_id in flora:
                food_biomes = set(flora[food_id]["biomes"])
            elif food_id in fauna:
                food_biomes = set(fauna[food_id]["biomes"])
            else:
                errors.append(f"Fauna '{aid}' diet references unknown organism '{food_id}'")
                continue
            if not (a_biomes & food_biomes):
                errors.append(
                    f"Trophic spatial mismatch: '{aid}' ({sorted(a_biomes)}) eats '{food_id}' "
                    f"({sorted(food_biomes)}) with ZERO overlapping biomes!"
                )

    # 5. Weather coverage
    biome_weather: dict[str, list[str]] = defaultdict(list)
    for wid, w in weather.items():
        for bid in w["biomes"]:
            if bid not in biomes:
                errors.append(f"Weather '{wid}' references unknown biome '{bid}'")
            else:
                biome_weather[bid].append(wid)

    for bid in biomes:
        if not biome_flora[bid]:
            errors.append(f"Biome '{bid}' has 0 flora species!")
        if not biome_fauna[bid]:
            errors.append(f"Biome '{bid}' has 0 fauna species!")
        if not biome_weather[bid]:
            warnings.append(f"Biome '{bid}' has no linked dynamic weather events.")

    # 6. Progression milestone reachability, DAG acyclicity & co-location proof
    milestones = {ms["id"]: ms for ms in prog_doc["milestones"]}
    for ms in prog_doc["milestones"]:
        mid = ms["id"]
        ms_biomes = set(ms["required_biomes"])
        for bid in ms_biomes:
            if bid not in biomes:
                errors.append(f"Milestone '{mid}' references unknown biome '{bid}'")
        if not ms.get("safe_entry_mechanism"):
            errors.append(f"Milestone '{mid}' missing explicit 'safe_entry_mechanism' (anti-deadlock requirement)")
        for pre in ms.get("prerequisites", []):
            if pre not in milestones:
                errors.append(f"Milestone '{mid}' references unknown prerequisite '{pre}'")
        for res in ms["required_resources"]:
            if res not in resource_sources:
                errors.append(f"Milestone '{mid}' requires unreachable resource '{res}'")
            elif not (resource_sources[res] & ms_biomes):
                errors.append(
                    f"Milestone '{mid}' requires resource '{res}' ({sorted(resource_sources[res])}) "
                    f"not present in its required_biomes ({sorted(ms_biomes)})!"
                )
        for disc in ms["required_discoveries"]:
            if disc in flora:
                d_biomes = set(flora[disc]["biomes"])
            elif disc in fauna:
                d_biomes = set(fauna[disc]["biomes"])
            else:
                errors.append(f"Milestone '{mid}' requires unknown discovery '{disc}'")
                continue
            if not (d_biomes & ms_biomes):
                errors.append(
                    f"Milestone '{mid}' requires discovery '{disc}' ({sorted(d_biomes)}) "
                    f"not present in its required_biomes ({sorted(ms_biomes)})!"
                )

    # Topological DAG acyclicity check (Kahn's algorithm)
    in_deg = {mid: len(ms.get("prerequisites", [])) for mid, ms in milestones.items()}
    children: dict[str, list[str]] = defaultdict(list)
    for mid, ms in milestones.items():
        for pre in ms.get("prerequisites", []):
            if pre in milestones:
                children[pre].append(mid)
    dag_q = deque([mid for mid, deg in in_deg.items() if deg == 0])
    dag_order: list[str] = []
    while dag_q:
        cur = dag_q.popleft()
        dag_order.append(cur)
        for ch in children[cur]:
            in_deg[ch] -= 1
            if in_deg[ch] == 0:
                dag_q.append(ch)
    if len(dag_order) != len(milestones):
        errors.append("Progression milestone DAG contains a circular prerequisite cycle!")

    # Relay Spine cross-check
    for node in prog_doc.get("relay_spine", []):
        nb = node.get("biome")
        nsb = node.get("sub_biome")
        nms = node.get("milestone")
        if nb not in biomes:
            errors.append(f"Relay node '{node.get('name')}' references unknown biome '{nb}'")
        elif nsb not in biomes[nb]["sub_biomes"]:
            errors.append(f"Relay node '{node.get('name')}' references unknown sub-biome '{nsb}' in '{nb}'")
        if nms not in milestones:
            errors.append(f"Relay node '{node.get('name')}' references unknown milestone '{nms}'")

    multi_biome_flora = sum(1 for f in flora.values() if len(f["biomes"]) > 1)
    multi_biome_fauna = sum(
        1 for a in fauna.values()
        if len(a["biomes"]) > 1 and "legendary" not in a["role"]
    )

    total_sub_biomes = sum(len(b["sub_biomes"]) for b in biomes.values())
    stats = {
        "core_biomes": len(biomes),
        "sub_biomes": total_sub_biomes,
        "total_environmental_identities": len(biomes) + total_sub_biomes,
        "flora_archetypes": len(flora),
        "fauna_archetypes": len(fauna),
        "multi_biome_flora": multi_biome_flora,
        "multi_biome_fauna": multi_biome_fauna,
        "weather_events": len(weather),
        "milestones": len(prog_doc["milestones"]),
        "relay_nodes": len(prog_doc.get("relay_spine", [])),
        "dag_acyclic": len(dag_order) == len(milestones),
        "trophic_links_verified": food_links_checked,
        "reachable_biomes": len(visited & set(biomes.keys())),
        "biome_coverage": {
            bid: {
                "flora": len(biome_flora[bid]),
                "fauna": len(biome_fauna[bid]),
                "weather": len(biome_weather[bid]),
            }
            for bid in biomes
        },
    }
    return errors, warnings, stats


def write_markdown_report(out_path: Path, errors: list[str], warnings: list[str], stats: dict) -> None:
    lines = [
        "# Automated Ecological & Progression Integrity Report",
        "",
        "> Generated by `tools/ecology_validator.py` from `docs/concept/data/*.json`.",
        "",
        "## Summary Metrics",
        f"- **Core Biomes**: `{stats['core_biomes']}` + **Sub-Biomes**: `{stats['sub_biomes']}` = **`{stats['total_environmental_identities']}`** named environmental identities",
        f"- **Biome Graph Reachability**: `{stats['reachable_biomes']} / {stats['core_biomes']}` reachable from crash zone (`amber_kelp_coast`)",
        f"- **Core Flora Species**: `{stats['flora_archetypes']}` (`{stats['multi_biome_flora']}` multi-biome eligible for regional ecotypes) | **Core Fauna Species**: `{stats['fauna_archetypes']}` (`{stats['multi_biome_fauna']}` non-legendary multi-biome eligible for regional ecotypes)",
        f"- **Trophic Food-Web Co-Location Links Verified**: `{stats['trophic_links_verified']}`",
        f"- **Weather Events**: `{stats['weather_events']}` | **Progression Milestones**: `{stats['milestones']}` (DAG Acyclic: `{stats['dag_acyclic']}` | Relay Nodes Verified: `{stats['relay_nodes']}`)",
        f"- **Errors**: `{len(errors)}` | **Warnings**: `{len(warnings)}`",
        "",
        "## Per-Biome Ecological Coverage",
        "",
        "| Biome ID | Flora Species | Fauna Species | Weather Hooks |",
        "| --- | ---: | ---: | ---: |",
    ]
    for bid, cov in stats["biome_coverage"].items():
        lines.append(f"| `{bid}` | {cov['flora']} | {cov['fauna']} | {cov['weather']} |")

    if warnings:
        lines.extend(["", "## Warnings"])
        lines.extend(f"- {w}" for w in warnings)
    if errors:
        lines.extend(["", "## Errors"])
        lines.extend(f"- {e}" for e in errors)

    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate game concept ecology & progression JSON databases.")
    parser.add_argument("--data-dir", default="docs/concept/data", help="Directory containing concept JSON files")
    parser.add_argument("--report", default=None, help="Optional Markdown report output path")
    args = parser.parse_args()

    errors, warnings, stats = validate_ecology(Path(args.data_dir))
    if args.report:
        write_markdown_report(Path(args.report), errors, warnings, stats)

    print("=== Ecological & Progression Database Validator ===")
    print(f"Biomes : {stats['core_biomes']} core + {stats['sub_biomes']} sub = {stats['total_environmental_identities']} identities ({stats['reachable_biomes']}/{stats['core_biomes']} reachable)")
    print(f"Species: {stats['flora_archetypes']} core flora ({stats['multi_biome_flora']} multi-biome) | {stats['fauna_archetypes']} core fauna ({stats['multi_biome_fauna']} multi-biome non-legendary) | {stats['trophic_links_verified']} trophic links verified")
    print(f"Events : {stats['weather_events']} weather events | {stats['milestones']} milestones (DAG acyclic={stats['dag_acyclic']}, {stats['relay_nodes']} relay nodes)")
    print(f"Result : {len(errors)} errors, {len(warnings)} warnings")
    for w in warnings:
        print(f"  WARN : {w}")
    for e in errors:
        print(f"  ERROR: {e}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
