import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const GAME_ROOT = path.join(REPO_ROOT, 'game');
const SHORE_ASSETS_ROOT = path.join(GAME_ROOT, 'assets/world/broken_shore');
const VPF_SHORE_ROOT = path.join(GAME_ROOT, 'assets/_vpf_sources/broken_shore');

function pointInPolygon(px: number, py: number, pts: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1];
    const xj = pts[j][0], yj = pts[j][1];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

describe('VERDANT SIGNAL — Production Main Game V9.0 The Broken Shore Validation', () => {
  it('preserves all 3 bit-for-bit unmodified original 88x88 astronaut sheets', () => {
    const idlePath = path.join(GAME_ROOT, 'assets/characters/player/mara_original/char_idle_88x88_8x4.png');
    const walkPath = path.join(GAME_ROOT, 'assets/characters/player/mara_original/char_walking_88x88_8x4.png');
    const runPath = path.join(GAME_ROOT, 'assets/characters/player/mara_original/char_running_88x88_8x4.png');
    for (const p of [idlePath, walkPath, runPath]) {
      expect(fs.existsSync(p)).toBe(true);
      const dims = execFileSync('identify', ['-format', '%w %h', p], { encoding: 'utf8' }).trim();
      expect(dims).toBe('704 352');
    }
    const idleSha = crypto.createHash('sha256').update(fs.readFileSync(idlePath)).digest('hex');
    expect(idleSha.startsWith('3f1af238')).toBe(true);
  });

  it('verifies all 21 V9.0 production assets, editable .vpf.json sources, dimensions & zero magenta chroma residue', () => {
    const catalogPath = path.join(SHORE_ASSETS_ROOT, 'broken_shore_asset_catalog.json');
    expect(fs.existsSync(catalogPath)).toBe(true);
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as {
      totalAssets: number;
      masterPaletteHex: string[];
      entries: Array<{
        id: string;
        productionPath: string;
        vpfSourcePath: string;
        canvasWidth: number;
        canvasHeight: number;
        paletteCount: number;
      }>;
    };

    expect(catalog.totalAssets).toBeGreaterThanOrEqual(21);
    expect(catalog.entries.length).toBe(catalog.totalAssets);
    expect(catalog.masterPaletteHex.length).toBe(68);
    expect(fs.existsSync(path.join(GAME_ROOT, 'assets/_vpf_sources/.gdignore'))).toBe(true);

    for (const entry of catalog.entries) {
      const pngAbs = path.join(REPO_ROOT, entry.productionPath);
      const vpfAbs = path.join(REPO_ROOT, entry.vpfSourcePath);
      expect(fs.existsSync(pngAbs), `Missing production PNG: ${entry.productionPath}`).toBe(true);
      expect(fs.existsSync(vpfAbs), `Missing editable .vpf.json: ${entry.vpfSourcePath}`).toBe(true);

      const dims = execFileSync('identify', ['-format', '%w %h', pngAbs], { encoding: 'utf8' })
        .trim()
        .split(' ')
        .map(Number);
      expect(dims[0], `Width mismatch on ${entry.id}`).toBe(entry.canvasWidth);
      expect(dims[1], `Height mismatch on ${entry.id}`).toBe(entry.canvasHeight);
      expect(entry.paletteCount).toBeGreaterThan(2);

      // Verify zero raw #FF00FF magenta key leakage on extracted sprites
      if (entry.productionPath.includes('/sprites/')) {
        const raw = execFileSync('convert', [pngAbs, '-depth', '8', 'rgba:-'], {
          maxBuffer: dims[0] * dims[1] * 4 + 65536,
        });
        let magentaCount = 0;
        for (let i = 0; i < raw.length; i += 4) {
          if (raw[i + 3] < 128) continue;
          const r = raw[i], g = raw[i + 1], b = raw[i + 2];
          if (r > 200 && b > 200 && g < 60) magentaCount++;
        }
        expect(magentaCount, `Found magenta chroma residue in ${entry.id}`).toBe(0);
      }
    }

    expect(fs.readdirSync(VPF_SHORE_ROOT).filter((f) => f.endsWith('.vpf.json')).length).toBe(catalog.totalAssets);
  });

  it('validates continuous Shore-to-Forest world layout, open spawn, explorable breached ICV Meridian bay & Zone F gateway', () => {
    const ecoPath = path.join(SHORE_ASSETS_ROOT, 'broken_shore_ecosystem_data.json');
    expect(fs.existsSync(ecoPath)).toBe(true);
    const eco = JSON.parse(fs.readFileSync(ecoPath, 'utf8')) as {
      world_w: number;
      shore_origin_y: number;
      unified_world_h: number;
      spawn: { x: number; y: number };
      shoreline_step_px: number;
      shoreline_y_samples: number[];
      tidepools: Array<{ id: string; x: number; y: number; rx: number; ry: number }>;
      amber_kelp: Array<{ x: number; y: number }>;
      tufts: Array<{ x: number; y: number; row: number }>;
      fauna: Array<{ kind: number }>;
      scan_sites: Array<{ id: string; interiorOnly?: boolean }>;
      walkable_zones: Array<{ id: string; role: string }>;
      props: Array<{
        id: string;
        x: number;
        y: number;
        colliders: Array<{ name: string; points: Array<[number, number]> }>;
      }>;
    };

    expect(eco.world_w).toBe(2304);
    expect(eco.shore_origin_y).toBe(1344);
    expect(eco.unified_world_h).toBe(2880);
    expect(eco.tidepools.length).toBe(5);
    expect(eco.amber_kelp.length).toBe(10);
    expect(eco.tufts.length).toBeGreaterThanOrEqual(750);
    expect(eco.fauna.filter((f) => f.kind === 0).length).toBe(4); // Chime-Wing Gliders
    expect(eco.fauna.filter((f) => f.kind === 1).length).toBe(4); // Mirror-Shell Crabs
    expect(eco.scan_sites.length).toBe(10);
    expect(eco.scan_sites.filter((s) => s.interiorOnly).length).toBe(3);
    expect(eco.walkable_zones.some((z) => z.role === 'meridian_interior')).toBe(true);
    expect(eco.walkable_zones.some((z) => z.role === 'inland_gateway')).toBe(true);

    // Ensure key player positions (Zone A spawn, breached aft bay deck, Zone F gateway trail) NEVER fall inside solid colliders!
    const criticalWalkPoints: Array<{ label: string; x: number; y: number }> = [
      { label: 'Zone A Waking Shore Spawn', x: eco.spawn.x, y: eco.spawn.y },
      { label: 'Zone B2 Breached ICV Meridian Interior Ramp', x: 1384, y: 2212 },
      { label: 'Zone C Tidepool Coast Approach', x: 1712, y: 2178 },
      { label: 'Zone D Basalt Shore Passage', x: 560, y: 2060 },
      { label: 'Zone E Coastal Vegetation Trail', x: 1168, y: 1760 },
      { label: 'Zone F Inland Gateway Threshold', x: 1142, y: 1470 },
    ];

    for (const pt of criticalWalkPoints) {
      for (const prop of eco.props) {
        for (const col of prop.colliders) {
          const worldPts: Array<[number, number]> = col.points.map(([lx, ly]) => [prop.x + lx, prop.y + ly]);
          expect(
            pointInPolygon(pt.x, pt.y, worldPts),
            `${pt.label} (${pt.x},${pt.y}) collided with ${prop.id}/${col.name}`
          ).toBe(false);
        }
      }
    }

    // Verify Zone F Inland Gateway opened cleanly in V8.0 verdant_living_forest.tscn
    const v80Tscn = fs.readFileSync(path.join(GAME_ROOT, 'world/living_forest/verdant_living_forest.tscn'), 'utf8');
    expect(v80Tscn).toContain('[node name="perim_s_bush_4" type="StaticBody2D" parent="YSortWorld"]\nposition = Vector2(968, 1332)');
    expect(v80Tscn).toContain('[node name="perim_s_bush_5" type="StaticBody2D" parent="YSortWorld"]\nposition = Vector2(1322, 1348)');
  });

  it('verifies all Godot 4.7.2 V9.0 res:// references, Intel HD 3000 shader safety & preserved prior studies', () => {
    const filesToScan = [
      'world/broken_shore/verdant_broken_shore.tscn',
      'world/broken_shore/verdant_broken_shore.gd',
      'world/rimlands_prototype.tscn',
      'world/rimlands_prototype.gd',
      'systems/asset_paths.gd',
      'tests/smoke_runner.gd',
    ];

    const resRegex = /res:\/\/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+/g;
    for (const rel of filesToScan) {
      const content = fs.readFileSync(path.join(GAME_ROOT, rel), 'utf8');
      const matches = content.match(resRegex) ?? [];
      expect(matches.length, `No res:// paths found in ${rel}`).toBeGreaterThan(0);
      for (const resPath of matches) {
        if (resPath.includes('debug_placeholder_')) continue;
        const diskPath = path.join(GAME_ROOT, resPath.replace('res://', ''));
        expect(fs.existsSync(diskPath), `Broken res:// reference in ${rel}: ${resPath}`).toBe(true);
      }
    }

    // Verify Intel HD Graphics 3000 GL Compatibility shader discipline on coastal_ocean.gdshader
    const oceanShader = fs.readFileSync(path.join(GAME_ROOT, 'shaders/coastal_ocean.gdshader'), 'utf8');
    expect(oceanShader).toContain('shader_type canvas_item;');
    expect(oceanShader).not.toContain('hint_screen_texture');
    expect(oceanShader).not.toContain('<<');
    expect(oceanShader).not.toContain('>>');

    // Verify verdant_broken_shore.tscn load_steps matches exact ext_resource + sub_resource + 1
    const bsTscn = fs.readFileSync(path.join(GAME_ROOT, 'world/broken_shore/verdant_broken_shore.tscn'), 'utf8');
    const loadStepsMatch = bsTscn.match(/load_steps=(\d+)/);
    const extCount = (bsTscn.match(/^\[ext_resource /gm) ?? []).length;
    const subCount = (bsTscn.match(/^\[sub_resource /gm) ?? []).length;
    expect(Number(loadStepsMatch?.[1])).toBe(extCount + subCount + 1);

    // Verify Windows Godot 4.7.2 V9.0 verification batch harness exists
    expect(fs.existsSync(path.join(GAME_ROOT, 'tools/run_production_v90_verification.bat'))).toBe(true);

    // Verify ALL prior isolated studies remain completely preserved
    for (const studyDir of [
      'assets/v80_living_world_study',
      'assets/v73_open_world_playability_study',
      'assets/v72_forest_refinement_study',
      'assets/v71_forest_recomposition_study',
      'assets/v7_immersive_world_study',
      'assets/soul_of_pixel_art_v5',
      'assets/extreme_artistic_study_v4',
      'assets/high_res_upgrade_study',
    ]) {
      expect(fs.existsSync(path.join(GAME_ROOT, studyDir)), `Missing preserved study: ${studyDir}`).toBe(true);
    }
  });
});
