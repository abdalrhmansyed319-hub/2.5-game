/**
 * VERDANT PIXEL FORGE — AST-001 Feasibility Study Prototype 2 (48×64)
 * -------------------------------------------------------------------
 * Independently designed and sculpted specifically for 48×64 (3×4 tiles, 8× area of 16×24).
 * Matches the VERDANT SIGNAL Style Guide's measured ~50×58 native painterly figure scale
 * and Mara Lin v2's exact 3:4 heroic proportions. 13 editable VPF layers, zero rescaling.
 */
import type { ProjectDocument } from '../types/studio';
import { VpfSculptCanvas } from './vpfSculptTools';

export function buildMaraProto48x64(): ProjectDocument {
  const c = new VpfSculptCanvas(48, 64);

  // =========================================================================
  // 01 ANTENNA & CABLES (Whip antenna + armored turret + ribbed breathing hose)
  // =========================================================================
  c.line('l01_antenna_cables', 11, 5, 13, 15, 'M2');
  c.line('l01_antenna_cables', 11, 6, 12, 13, 'M3');
  // Glowing pearl tip
  c.fillRect('l01_antenna_cables', 10, 4, 11, 5, 'M4');
  c.px('l01_antenna_cables', 10, 4, 'M5');
  // Reinforced antenna mount turret
  c.fillRect('l01_antenna_cables', 12, 14, 14, 16, 'M1');
  c.row('l01_antenna_cables', 12, 14, ['M4', 'M3', 'M1']);
  c.row('l01_antenna_cables', 12, 15, ['M3', 'M2', 'M0']);
  // Curved dark ribbed oxygen hose & braided cable looping from pack into helmet neck ring
  c.fillCapsule('l01_antenna_cables', 15.0, 19.0, 17.8, 22.8, 1.3, 1.1, 'B0');
  c.px('l01_antenna_cables', 15, 18, 'M2');
  c.px('l01_antenna_cables', 16, 19, 'M3');
  c.px('l01_antenna_cables', 16, 21, 'M2');
  c.px('l01_antenna_cables', 17, 22, 'M3');
  // Lower secondary flexible supply line behind elbow
  c.line('l01_antenna_cables', 13, 32, 16, 34, 'B0');
  c.px('l01_antenna_cables', 14, 32, 'M1');

  // =========================================================================
  // 02 BACKPACK CHASSIS (Substantial brushed-titanium housing, louvers & latches)
  // =========================================================================
  // Shaped cleanly above the bent left elbow pocket so the elbow negative space stays crisp!
  c.fillPoly(
    'l02_backpack_chassis',
    [
      [10, 16],
      [18, 16],
      [18.2, 29],
      [13.5, 29],
      [13.5, 33],
      [10, 33],
    ],
    'M2'
  );
  c.shadeMetalRegion('l02_backpack_chassis', 13.5, 22.0, 5.5, 9.5, { bias: 0.06 });
  // Crisp beveled top plate & mounting bolts
  c.row('l02_backpack_chassis', 10, 16, ['M4', 'M5', 'M5', 'M4', 'M3', 'M3', 'M2', 'M1']);
  c.row('l02_backpack_chassis', 10, 17, ['M4', 'M4', 'M3', 'M3', 'M2', 'M2', 'M1', 'M1']);
  // Mechanical cooling louver vents & teal telemetry indicator
  c.row('l02_backpack_chassis', 11, 19, ['M1', 'M0', 'M0', 'M0', 'M1']);
  c.row('l02_backpack_chassis', 11, 20, ['M3', 'M3', 'M2', 'M2', 'M1']);
  c.row('l02_backpack_chassis', 11, 22, ['M1', 'M0', 'M0', 'M0', 'M1']);
  c.row('l02_backpack_chassis', 11, 23, ['M3', 'M2', 'M2', 'M1', 'M1']);
  c.px('l02_backpack_chassis', 16, 18, 'V4'); // telemetry LED
  c.px('l02_backpack_chassis', 16, 19, 'V2');
  // Lower heavy underside plate
  c.row('l02_backpack_chassis', 10, 31, ['M1', 'M1', 'M0', 'M0']);
  c.row('l02_backpack_chassis', 10, 32, ['M0', 'M0', 'M0', 'M0']);

  // =========================================================================
  // 03 OXYGEN CYLINDER (Pressurized vertical O2 cylinder + red valve + clamps)
  // =========================================================================
  c.fillRect('l03_oxygen_cylinder', 7, 19, 10, 32, 'M2');
  c.shadeMetalRegion('l03_oxygen_cylinder', 8.5, 25.5, 2.2, 7.0, { cylindricalX: true, bias: 0.1 });
  // Top rounded shoulder & red pressure regulator valve cap
  c.row('l03_oxygen_cylinder', 8, 17, ['O6', 'O6']);
  c.row('l03_oxygen_cylinder', 7, 18, ['M4', 'M5', 'M3', 'M1']);
  // Upper & lower titanium retention clamps
  c.row('l03_oxygen_cylinder', 7, 21, ['M4', 'M3', 'M1', 'M0']);
  c.row('l03_oxygen_cylinder', 7, 22, ['M1', 'M1', 'M0', 'M0']);
  // Bold orange pressurized identification band (sunlit left -> shaded right)
  c.row('l03_oxygen_cylinder', 7, 24, ['S4', 'S5', 'S3', 'S1']);
  c.row('l03_oxygen_cylinder', 7, 25, ['S4', 'S4', 'S3', 'S1']);
  c.row('l03_oxygen_cylinder', 7, 26, ['S3', 'S3', 'S2', 'S0']);
  // Lower clamp & rounded tank base
  c.row('l03_oxygen_cylinder', 7, 29, ['M4', 'M3', 'M1', 'M0']);
  c.row('l03_oxygen_cylinder', 7, 32, ['M2', 'M1', 'M1', 'M0']);
  c.row('l03_oxygen_cylinder', 8, 33, ['M1', 'M0']);

  // =========================================================================
  // 04 FAR RIGHT ARM (Clearly separated shaded arm extending toward scanner)
  // =========================================================================
  c.fillCapsule('l04_back_arm_shadow', 30.0, 27.0, 32.5, 31.8, 3.0, 2.6, 'S2');
  c.fillCapsule('l04_back_arm_shadow', 32.5, 32.0, 34.8, 35.8, 2.5, 2.1, 'S2');
  c.shadeSuitRegion('l04_back_arm_shadow', 30.0, 28.5, 5.2, 7.5, {
    bias: -0.15,
    foldFn: (_x, y) => (y === 30 || y === 33 ? -0.35 : y === 31 ? 0.16 : 0),
  });
  // Articulated elbow fabric seam + sunlit rim lip
  c.row('l04_back_arm_shadow', 29, 30, ['S0', 'S1', 'S1', 'S1', 'S0']);
  c.row('l04_back_arm_shadow', 30, 31, ['S4', 'S3', 'S2', 'S1']);
  // Brushed titanium wrist collar ring tucked cleanly along forearm-to-glove junction
  c.row('l04_back_arm_shadow', 33, 33, ['M3', 'M3', 'M2']);
  c.row('l04_back_arm_shadow', 33, 34, ['M2', 'M2', 'M1']);
  c.row('l04_back_arm_shadow', 34, 35, ['M1', 'M0']);
  c.applySculptedShadowEdge('l04_back_arm_shadow', 'S0', { rightEdge: true, bottomEdge: true });

  // =========================================================================
  // 05 LEGS & MULTI-PANEL SUIT FABRIC (Confident 3/4 wide exploratory stride)
  // =========================================================================
  // Left leg (front/sunlit): x=15..23, y=40..56
  c.fillPoly(
    'l05_legs_fabric_panels',
    [
      [15.2, 40],
      [23.2, 40],
      [22.4, 48],
      [21.6, 56],
      [15.6, 56],
      [14.8, 47],
    ],
    'S3'
  );
  // Right leg (stepped outward & slightly back for grounded contrapposto): x=25..33, y=40..55
  c.fillPoly(
    'l05_legs_fabric_panels',
    [
      [24.6, 40],
      [31.8, 40],
      [33.2, 48],
      [32.6, 55],
      [26.6, 55],
      [25.6, 47],
    ],
    'S3'
  );
  c.shadeSuitRegion('l05_legs_fabric_panels', 21.5, 46.5, 9.5, 9.5, {
    bias: 0.05,
    foldFn: (_x, y) => {
      if (y === 44 || y === 52) return -0.34;
      if (y === 45 || y === 53) return 0.16;
      return 0;
    },
  });
  // Crisp inner-thigh shadow & pelvic shadow beneath belt
  c.fillRect('l05_legs_fabric_panels', 22, 40, 25, 43, 'S0');
  c.row('l05_legs_fabric_panels', 15, 40, ['S1', 'S1', 'S1', 'S1', 'S1', 'S0', 'S0', 'S0']);
  c.row('l05_legs_fabric_panels', 26, 40, ['S0', 'S0', 'S1', 'S1', 'S1', 'S0']);
  // Sculpted diagonal fabric creases gathering above boot cuffs (not noisy stripes!)
  c.line('l05_legs_fabric_panels', 16, 52, 21, 51, 'S1');
  c.line('l05_legs_fabric_panels', 16, 53, 21, 52, 'S4');
  c.line('l05_legs_fabric_panels', 16, 54, 21, 54, 'S1');
  c.line('l05_legs_fabric_panels', 27, 51, 32, 50, 'S0');
  c.line('l05_legs_fabric_panels', 27, 52, 32, 51, 'S3');
  c.line('l05_legs_fabric_panels', 27, 53, 32, 53, 'S1');
  c.applySculptedShadowEdge('l05_legs_fabric_panels', 'S0', { rightEdge: true, bottomEdge: false });

  // =========================================================================
  // 06 ARTICULATED KNEEPADS & HEAVY TREADED BOOTS (Weathered dark rubber + clasps)
  // =========================================================================
  // Left articulated knee guard (x=15..21, y=45..49)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [15, 45.2],
      [21.6, 45.2],
      [21.2, 49.6],
      [15.2, 49.6],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 17.5, 46.8, 3.8, 2.8, {
    xMin: 14,
    xMax: 22,
    yMin: 44,
    yMax: 50,
    bias: 0.1,
    allowB4: true,
  });
  c.row('l06_kneepads_heavy_boots', 15, 45, ['B3', 'B4', 'B3', 'B2', 'B1', 'B1', 'B0']); // sunlit bevel
  c.row('l06_kneepads_heavy_boots', 15, 47, ['B2', 'B1', 'B1', 'B1', 'B0', 'B0', 'B0']); // articulation seam
  c.row('l06_kneepads_heavy_boots', 15, 49, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // Right articulated knee guard (x=26..32, y=45..49)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [26.2, 45.2],
      [32.5, 45.2],
      [32.2, 49.2],
      [26.4, 49.2],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 28.5, 46.5, 3.6, 2.6, {
    xMin: 25,
    xMax: 33,
    yMin: 44,
    yMax: 50,
    bias: -0.04,
  });
  c.row('l06_kneepads_heavy_boots', 26, 45, ['B2', 'B3', 'B2', 'B1', 'B1', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 26, 49, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // Left heavy exploration boot (front, sole at y=60)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [15.4, 54.5],
      [21.6, 54.5],
      [24.4, 57.6],
      [24.5, 60.2],
      [14.8, 60.2],
      [14.8, 57.0],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 18.6, 56.8, 5.2, 3.2, {
    xMin: 14,
    xMax: 25,
    yMin: 54,
    yMax: 61,
    bias: 0.08,
    allowB4: true,
  });
  // Metallic ankle/instep clasp & worn leather toe highlight
  c.row('l06_kneepads_heavy_boots', 17, 56, ['M4', 'M5', 'M3']);
  c.row('l06_kneepads_heavy_boots', 17, 57, ['M2', 'M1', 'B0']);
  c.row('l06_kneepads_heavy_boots', 21, 58, ['B3', 'B2', 'B1']);
  // Heavy lugged tread sole (y=59..60)
  c.row('l06_kneepads_heavy_boots', 15, 59, ['B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 15, 60, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // Right heavy exploration boot (slightly back, sole at y=59)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [26.6, 53.6],
      [32.6, 53.6],
      [35.4, 56.6],
      [35.5, 59.2],
      [26.0, 59.2],
      [26.0, 56.0],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 29.8, 55.8, 5.2, 3.2, {
    xMin: 25,
    xMax: 36,
    yMin: 53,
    yMax: 60,
    bias: -0.02,
  });
  c.row('l06_kneepads_heavy_boots', 28, 55, ['M3', 'M4', 'M2']);
  c.row('l06_kneepads_heavy_boots', 28, 56, ['M1', 'M1', 'B0']);
  c.row('l06_kneepads_heavy_boots', 26, 58, ['B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0', 'B0', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 26, 59, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // =========================================================================
  // 07 MULTI-PANEL SUIT TORSO & BENT LEFT ARM (Quilted seams + crisp elbow gap!)
  // =========================================================================
  // Core 3/4 foreshortened torso (x=16..31, y=24..40)
  c.fillPoly(
    'l07_suit_torso_arms',
    [
      [16.2, 24.5],
      [30.2, 24.5],
      [31.2, 39.5],
      [16.6, 39.5],
    ],
    'S3'
  );
  c.shadeSuitRegion('l07_suit_torso_arms', 22.8, 30.5, 8.5, 8.5, {
    xMin: 16,
    xMax: 32,
    yMin: 24,
    yMax: 40,
    bias: 0.06,
    allowS5: true,
    foldFn: (_x, y) => {
      if (y === 29 || y === 35) return -0.28;
      if (y === 30 || y === 36) return 0.14;
      return 0;
    },
  });
  // Explicit stitched horizontal panel seams across waist & chest flanks
  c.row('l07_suit_torso_arms', 17, 35, ['S1', 'S1', 'S1', 'S0', 'S0']);
  c.row('l07_suit_torso_arms', 17, 36, ['S4', 'S4', 'S3', 'S2']);

  // Confident bent Left Arm resting on hip (puffed shoulder baffle + open elbow gap!)
  c.fillCapsule('l07_suit_torso_arms', 15.8, 27.2, 11.4, 33.4, 3.6, 2.8, 'S4');
  c.fillCapsule('l07_suit_torso_arms', 11.4, 33.8, 15.6, 37.0, 2.7, 2.0, 'S3');
  // Carve crystal-clear triangular negative-space elbow window between inner arm & torso!
  c.fillPoly(
    'l07_suit_torso_arms',
    [
      [14.2, 31.5],
      [16.5, 31.2],
      [16.5, 35.6],
      [14.0, 34.4],
    ],
    '.'
  );
  c.shadeSuitRegion('l07_suit_torso_arms', 12.6, 30.8, 5.2, 7.2, {
    xMin: 8,
    xMax: 17,
    yMin: 24,
    yMax: 40,
    bias: 0.14,
    allowS5: true,
  });
  // Crisp quilted bicep/elbow panel seam (dark recessed stitch + warm sunlit lower lip!)
  c.line('l07_suit_torso_arms', 10, 31, 14, 32, 'S1');
  c.line('l07_suit_torso_arms', 10, 32, 14, 33, 'S4');
  // Signature rotated Teal Diamond Expedition Shoulder Patch (4x4!)
  c.row('l07_suit_torso_arms', 12, 27, ['.', 'V2', 'V1']);
  c.row('l07_suit_torso_arms', 11, 28, ['V2', 'V4', 'V3', 'V1']);
  c.row('l07_suit_torso_arms', 11, 29, ['V1', 'V3', 'V2', 'V0']);
  c.row('l07_suit_torso_arms', 12, 30, ['.', 'V1', 'V0']);
  // Brushed titanium left wrist collar & weathered dark leather glove resting at hip
  c.row('l07_suit_torso_arms', 14, 36, ['M4', 'M3', 'M2']);
  c.row('l07_suit_torso_arms', 14, 37, ['B3', 'B2', 'B1', 'B0']);
  c.row('l07_suit_torso_arms', 15, 38, ['B2', 'B1', 'B1', 'B0']);
  c.applySculptedShadowEdge('l07_suit_torso_arms', 'S0', { rightEdge: true, bottomEdge: true });

  // =========================================================================
  // 08 SURVIVAL HARNESS, UTILITY BELT & POUCHES (Weathered leather + D-rings)
  // =========================================================================
  // Left & Right heavy weathered leather shoulder harness straps (3px wide!)
  c.fillRect('l08_harness_belt_pouches', 18, 25, 20, 38, 'B1');
  c.fillRect('l08_harness_belt_pouches', 28, 25, 30, 38, 'B1');
  for (let y = 25; y <= 37; y++) {
    c.px('l08_harness_belt_pouches', 18, y, y < 31 ? 'B3' : 'B2');
    c.px('l08_harness_belt_pouches', 19, y, 'B2');
    c.px('l08_harness_belt_pouches', 20, y, 'B1');
    c.px('l08_harness_belt_pouches', 28, y, 'B1');
    c.px('l08_harness_belt_pouches', 29, y, 'B1');
    c.px('l08_harness_belt_pouches', 30, y, 'B0');
  }
  // Brushed titanium harness D-rings / chest buckles
  c.row('l08_harness_belt_pouches', 18, 26, ['M4', 'M5', 'M2']);
  c.row('l08_harness_belt_pouches', 18, 27, ['M2', 'B0', 'M1']);
  c.row('l08_harness_belt_pouches', 28, 26, ['M3', 'M4', 'M1']);
  c.row('l08_harness_belt_pouches', 28, 27, ['M1', 'B0', 'M0']);

  // Heavy Utility Belt (y=37..41) with gentle 3/4 contrapposto tilt
  c.fillRect('l08_harness_belt_pouches', 15, 38, 31, 41, 'B1');
  c.shadeLeatherRegion('l08_harness_belt_pouches', 22, 39, 9.0, 2.5, {
    xMin: 15,
    xMax: 32,
    yMin: 38,
    yMax: 41,
    bias: 0.04,
  });
  c.row('l08_harness_belt_pouches', 15, 38, ['B3', 'B3', 'B3', 'B2', 'B2', 'B2', 'B2', 'M4', 'M5', 'M4', 'M2', 'B1', 'B1', 'B1', 'B0', 'B0', 'B0']);
  c.row('l08_harness_belt_pouches', 15, 41, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'M1', 'M1', 'M0', 'M0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);
  // Sculpted Brushed-Titanium Center Belt Buckle (4x4, x=22..25, y=38..41)
  c.row('l08_harness_belt_pouches', 22, 38, ['M4', 'M5', 'M4', 'M2']);
  c.row('l08_harness_belt_pouches', 22, 39, ['M4', 'M2', 'M3', 'M1']);
  c.row('l08_harness_belt_pouches', 22, 40, ['M3', 'M3', 'M2', 'M1']);
  c.row('l08_harness_belt_pouches', 22, 41, ['M1', 'M1', 'M0', 'M0']);
  // Left-hip Twin Weathered Leather Pouches w/ metallic snaps
  c.fillRect('l08_harness_belt_pouches', 14, 38, 17, 42, 'B1');
  c.row('l08_harness_belt_pouches', 14, 38, ['B3', 'B4', 'B3', 'B2']);
  c.row('l08_harness_belt_pouches', 14, 39, ['B2', 'B2', 'B1', 'B1']);
  c.row('l08_harness_belt_pouches', 14, 40, ['B2', 'M4', 'B1', 'B0']); // snap stud
  c.row('l08_harness_belt_pouches', 14, 41, ['B1', 'B1', 'B1', 'B0']);
  c.row('l08_harness_belt_pouches', 14, 42, ['B0', 'B0', 'B0', 'B0']);
  c.fillRect('l08_harness_belt_pouches', 18, 38, 21, 41, 'B1');
  c.row('l08_harness_belt_pouches', 18, 38, ['B3', 'B3', 'B2', 'B1']);
  c.row('l08_harness_belt_pouches', 18, 39, ['B2', 'M3', 'B1', 'B0']);
  c.row('l08_harness_belt_pouches', 18, 41, ['B0', 'B0', 'B0', 'B0']);

  // =========================================================================
  // 09 MOSS SPECIMEN VIAL (Detailed right-hip glass canister w/ living moss!)
  // =========================================================================
  c.row('l09_moss_specimen_vial', 27, 39, ['M4', 'M5', 'M4', 'M3', 'M1']); // top titanium cap
  c.row('l09_moss_specimen_vial', 27, 40, ['M2', 'M2', 'M1', 'M1', 'M0']);
  c.row('l09_moss_specimen_vial', 27, 41, ['V1', 'V5', 'O3', 'O2', 'V0']); // glass wall + bright highlight
  c.row('l09_moss_specimen_vial', 27, 42, ['V1', 'V4', 'O4', 'O3', 'V0']); // glowing living moss core!
  c.row('l09_moss_specimen_vial', 27, 43, ['V1', 'O4', 'O3', 'O2', 'V0']);
  c.row('l09_moss_specimen_vial', 27, 44, ['V0', 'O3', 'O2', 'O1', 'V0']);
  c.row('l09_moss_specimen_vial', 27, 45, ['M3', 'M4', 'M2', 'M1', 'M0']); // bottom titanium cap
  c.row('l09_moss_specimen_vial', 27, 46, ['M1', 'M1', 'M0', 'M0', 'M0']);

  // =========================================================================
  // 10 CHEST TELEMETRY RIG (Bolted titanium console + cyan waveform + LEDs)
  // =========================================================================
  c.fillRect('l10_chest_telemetry_rig', 20, 27, 29, 34, 'M2');
  c.row('l10_chest_telemetry_rig', 20, 27, ['M4', 'M5', 'M5', 'M4', 'M4', 'M3', 'M3', 'M2', 'M2', 'M1']);
  c.row('l10_chest_telemetry_rig', 20, 28, ['M4', 'M1', 'V0', 'V0', 'V0', 'V0', 'V0', 'M2', 'M2', 'M1']);
  c.row('l10_chest_telemetry_rig', 20, 29, ['M4', 'V0', 'V1', 'V2', 'V1', 'V1', 'V0', 'M1', 'O3', 'M1']); // green LED
  c.row('l10_chest_telemetry_rig', 20, 30, ['M3', 'V0', 'V1', 'V4', 'V2', 'V5', 'V1', 'M1', 'O4', 'M1']); // signal wave peak!
  c.row('l10_chest_telemetry_rig', 20, 31, ['M3', 'V0', 'V4', 'V2', 'V4', 'V1', 'V1', 'M1', 'O6', 'M0']); // red warning latch!
  c.row('l10_chest_telemetry_rig', 20, 32, ['M2', 'V0', 'V1', 'V1', 'V1', 'V1', 'V0', 'M1', 'O6', 'M0']);
  c.row('l10_chest_telemetry_rig', 20, 33, ['M2', 'M2', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M0']);
  c.row('l10_chest_telemetry_rig', 20, 34, ['M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0']);
  // Corner mounting bolts
  c.px('l10_chest_telemetry_rig', 21, 28, 'M4');
  c.px('l10_chest_telemetry_rig', 28, 28, 'M3');
  c.castShadow('l10_chest_telemetry_rig', 'l07_suit_torso_arms', 1, 1, 'S0');

  // =========================================================================
  // 11 HELMET SHELL & NECK COLLAR (Oversized sunlit orange dome + ivory stripe)
  // =========================================================================
  c.fillEllipse('l11_helmet_shell_collar', 24.4, 15.6, 7.6, 7.3, 'S3');
  c.shadeSuitRegion('l11_helmet_shell_collar', 23.6, 14.8, 7.6, 7.3, {
    bias: 0.08,
    allowS5: true,
  });
  // Warm Ivory Ceramic Crown Racing Stripe w/ subtle recessed border
  c.row('l11_helmet_shell_collar', 22, 8, ['S3', 'O5', 'O5', 'O5', 'S2']);
  c.row('l11_helmet_shell_collar', 22, 9, ['S3', 'O5', 'O5', 'M4', 'S2']);
  c.row('l11_helmet_shell_collar', 22, 10, ['S2', 'O5', 'M4', 'M3', 'S2']);
  c.row('l11_helmet_shell_collar', 23, 11, ['M4', 'M3', 'M2']);
  // Sculpted Metallic Side Ear Transducer Pod w/ recessed bezel & glowing teal LED
  c.fillRect('l11_helmet_shell_collar', 16, 13, 19, 19, 'M2');
  c.row('l11_helmet_shell_collar', 16, 13, ['M4', 'M5', 'M3', 'M1']);
  c.row('l11_helmet_shell_collar', 16, 14, ['M4', 'M3', 'M2', 'M0']);
  c.row('l11_helmet_shell_collar', 16, 15, ['M3', 'M1', 'M1', 'M0']);
  c.row('l11_helmet_shell_collar', 16, 16, ['M3', 'V4', 'V5', 'M1']); // bright teal LED
  c.row('l11_helmet_shell_collar', 16, 17, ['M2', 'V2', 'V3', 'M0']);
  c.row('l11_helmet_shell_collar', 16, 18, ['M2', 'M1', 'M1', 'M0']);
  c.row('l11_helmet_shell_collar', 17, 19, ['M1', 'M0', 'S1']);
  // Calm sculpted dark recessed chin intake port
  c.row('l11_helmet_shell_collar', 24, 21, ['M2', 'M1', 'M0', 'M0']);
  c.row('l11_helmet_shell_collar', 24, 22, ['M0', 'M0', 'M0', 'S0']);
  // Heavy Bolted Brushed-Titanium Neck Lock Ring + Visible Ribbed Oxygen Breathing Hose!
  c.fillRect('l11_helmet_shell_collar', 17, 23, 30, 25, 'M2');
  c.row('l11_helmet_shell_collar', 17, 23, ['M4', 'M5', 'M4', 'M3', 'M3', 'M3', 'M2', 'M2', 'M2', 'M1', 'M1', 'M1', 'M1', 'M0']);
  c.row('l11_helmet_shell_collar', 17, 24, ['M3', 'M2', 'M3', 'M2', 'M1', 'M2', 'M1', 'M1', 'M1', 'M0', 'M1', 'M0', 'M0', 'M0']);
  c.row('l11_helmet_shell_collar', 17, 25, ['M1', 'M1', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0']);
  // Ribbed dark breathing hose arching visibly out of upper backpack into helmet neck ring!
  c.fillCapsule('l11_helmet_shell_collar', 14.5, 20.2, 16.8, 23.0, 1.3, 1.2, 'B0');
  c.row('l11_helmet_shell_collar', 14, 19, ['M3', 'M4']);
  c.row('l11_helmet_shell_collar', 15, 21, ['M3', 'M2']);
  c.row('l11_helmet_shell_collar', 16, 22, ['M4', 'M2']);
  c.castShadow('l11_helmet_shell_collar', 'l07_suit_torso_arms', 0, 1, 'S0');
  c.castShadow('l11_helmet_shell_collar', 'l07_suit_torso_arms', 1, 2, 'S1');

  // =========================================================================
  // 12 CURVED GLASS VISOR (Sculpted titanium bezel + spherical dark-teal glass!)
  // =========================================================================
  // Outer titanium visor bezel (elliptical 3/4 faceplate facing subtly right)
  c.fillEllipse('l12_curved_glass_visor', 25.8, 16.0, 6.4, 4.9, 'M2');
  c.shadeMetalRegion('l12_curved_glass_visor', 24.4, 14.4, 6.4, 4.9, { bias: 0.1 });
  // Deep recessed curved dark-teal glass cavity
  c.fillEllipse('l12_curved_glass_visor', 26.0, 16.2, 5.4, 3.9, 'V0');
  // Smooth curved sky-teal horizon reflection + razor-sharp upper-left specular arc!
  c.row('l12_curved_glass_visor', 23, 13, ['V3', 'V5', 'M5', 'M5', 'V5', 'V3', 'V1']);
  c.row('l12_curved_glass_visor', 22, 14, ['V5', 'M5', 'V5', 'V3', 'V3', 'V2', 'V1', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 21, 15, ['M5', 'V4', 'V2', 'V3', 'V3', 'V3', 'V2', 'V2', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 21, 16, ['V3', 'V2', 'V2', 'V3', 'V3', 'V3', 'V2', 'V1', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 21, 17, ['V1', 'V1', 'V1', 'V1', 'V2', 'V1', 'V1', 'V0', 'V0', 'V0']);
  c.row('l12_curved_glass_visor', 22, 18, ['V0', 'V0', 'V0', 'V1', 'V1', 'V1', 'V0', 'V0', 'V0']);
  c.row('l12_curved_glass_visor', 24, 19, ['V0', 'V1', 'V2', 'V3', 'V2', 'V1']); // subtle bottom-right sky bounce!

  // =========================================================================
  // 13 HANDHELD ACOUSTIC FIELD SCANNER & GLOVED RIGHT HAND
  // =========================================================================
  // Sculpted angled metallic scanner barrel & emitter chassis (drawn before gloved thumb wrap!)
  c.fillPoly(
    'l13_handheld_scanner',
    [
      [34.2, 32.0],
      [39.8, 28.8],
      [41.2, 32.0],
      [36.0, 34.0],
    ],
    'M2'
  );
  c.shadeMetalRegion('l13_handheld_scanner', 37.0, 30.6, 4.5, 3.4, {
    xMin: 33,
    xMax: 42,
    yMin: 28,
    yMax: 35,
    bias: 0.12,
  });
  c.row('l13_handheld_scanner', 36, 31, ['S4', 'S5', 'S3']); // signature orange housing accent
  c.row('l13_handheld_scanner', 36, 32, ['S3', 'S2']);

  // Complete, unclipped 3/4 elliptical Parabolic Collector Dish (comfortably inside x<=45!)
  c.fillEllipse('l13_handheld_scanner', 41.2, 30.0, 3.8, 4.2, 'M2', undefined, -0.38);
  c.shadeMetalRegion('l13_handheld_scanner', 39.8, 28.6, 4.0, 4.4, {
    xMin: 37,
    xMax: 46,
    yMin: 25,
    yMax: 36,
    bias: 0.16,
  });
  // Deep curved glowing dark-teal collector bowl + central metallic acoustic receiver pin
  c.fillEllipse('l13_handheld_scanner', 41.6, 30.1, 2.5, 3.0, 'V0', undefined, -0.38);
  c.row('l13_handheld_scanner', 40, 28, ['V3', 'V5', 'V3']);
  c.row('l13_handheld_scanner', 40, 29, ['V4', 'V3', 'V2', 'V1']);
  c.row('l13_handheld_scanner', 40, 30, ['V3', 'M5', 'V3', 'V1']); // crisp acoustic receiver pin!
  c.row('l13_handheld_scanner', 40, 31, ['V2', 'V3', 'V2', 'V0']);
  c.row('l13_handheld_scanner', 41, 32, ['V1', 'V2', 'V1']);
  c.row('l13_handheld_scanner', 39, 26, ['M4', 'M5', 'M5', 'M3']);

  // Articulated weathered dark leather glove WRAPPING around ergonomic pistol handle!
  c.fillPoly(
    'l13_handheld_scanner',
    [
      [33.8, 32.8],
      [38.6, 32.2],
      [39.2, 36.8],
      [35.4, 38.0],
      [33.6, 35.8],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l13_handheld_scanner', 35.8, 34.2, 3.2, 3.0, {
    xMin: 33,
    xMax: 40,
    yMin: 32,
    yMax: 39,
    bias: 0.08,
    allowB4: true,
  });
  // Crisp sunlit thumb & wrapped knuckle ridges firmly gripping scanner neck!
  c.row('l13_handheld_scanner', 34, 32, ['B3', 'B4', 'B2']); // thumb wrapping over barrel neck
  c.row('l13_handheld_scanner', 34, 33, ['B2', 'B3', 'B3', 'B1', 'B0']);
  c.row('l13_handheld_scanner', 35, 35, ['B2', 'B3', 'B2', 'B0']); // wrapped fingers
  c.row('l13_handheld_scanner', 36, 37, ['B1', 'B0', 'B0']); // pistol grip base
  c.px('l13_handheld_scanner', 37, 38, 'B0');

  return c.toProjectDocument({
    id: 'vpf_mara_proto_48x64',
    name: 'Mara_Lin_Feasibility_Proto_48x64',
    pivot: { x: 22, y: 60 },
    styleNotes:
      'AST-001 Feasibility Study Prototype 2 (48×64 px, 3×4 tiles, 13 editable VPF layers). Independently sculpted at native 48×64 resolution in VERDANT PIXEL FORGE matching VERDANT SIGNAL Style Guide ~50×58 figure craft.',
  });
}
