/**
 * VERDANT PIXEL FORGE — AST-001 Feasibility Study Prototype 3 (64×80)
 * -------------------------------------------------------------------
 * Independently designed and sculpted specifically for 64×80 (4×5 tiles, 13.3× area of 16×24).
 * Collector/ultra-detail hero sprite feasibility study with full multi-panel spacesuit seams,
 * riveted visor bezel, braided oxygen cables, oscilloscope console, and sculpted parabolic scanner.
 * 13 editable VPF layers, strict 30-color Master Palette, zero rescaling.
 */
import type { ProjectDocument } from '../types/studio';
import { VpfSculptCanvas } from './vpfSculptTools';

export function buildMaraProto64x80(): ProjectDocument {
  const c = new VpfSculptCanvas(64, 80);

  // =========================================================================
  // 01 ANTENNA & CABLES (Telescoping whip antenna + braided breathing hose)
  // =========================================================================
  c.line('l01_antenna_cables', 15, 7, 17, 19, 'M2');
  c.line('l01_antenna_cables', 15, 7, 16, 17, 'M4');
  // Bright pearl transceiver ball tip
  c.fillEllipse('l01_antenna_cables', 14.5, 5.5, 1.5, 1.5, 'M4');
  c.px('l01_antenna_cables', 14, 5, 'M5');
  c.px('l01_antenna_cables', 15, 6, 'M2');
  // Armored stepped antenna base turret
  c.fillRect('l01_antenna_cables', 15, 17, 19, 20, 'M2');
  c.row('l01_antenna_cables', 16, 17, ['M4', 'M5', 'M2']);
  c.row('l01_antenna_cables', 15, 18, ['M4', 'M3', 'M2', 'M1', 'M0']);
  c.row('l01_antenna_cables', 15, 19, ['M3', 'M2', 'M2', 'M1', 'M0']);

  // Curved dark ribbed oxygen breathing hose arching from pack into helmet collar
  c.fillCapsule('l01_antenna_cables', 19.5, 22.8, 22.5, 27.6, 1.8, 1.5, 'B0');
  c.fillCapsule('l01_antenna_cables', 22.5, 27.6, 24.5, 29.5, 1.4, 1.3, 'B0');
  // Crisp segmented rib highlights along the curved oxygen hose!
  c.row('l01_antenna_cables', 19, 22, ['M3', 'M4']);
  c.row('l01_antenna_cables', 20, 24, ['M3', 'M2']);
  c.row('l01_antenna_cables', 21, 26, ['M3', 'M2']);
  c.row('l01_antenna_cables', 22, 28, ['M4', 'M2']);
  // Lower braided supply cable looping beneath backpack into waist manifold
  c.fillCapsule('l01_antenna_cables', 17.0, 41.0, 21.5, 44.5, 1.2, 1.0, 'B0');
  c.px('l01_antenna_cables', 18, 41, 'M2');
  c.px('l01_antenna_cables', 19, 42, 'M3');
  c.px('l01_antenna_cables', 21, 44, 'M2');

  // =========================================================================
  // 02 BACKPACK CHASSIS (Substantial beveled titanium unit + cooling louvers)
  // =========================================================================
  // Shaped cleanly above/left of bent left elbow so triangular elbow negative space pops!
  c.fillPoly(
    'l02_backpack_chassis',
    [
      [13, 20],
      [23.5, 20],
      [23.8, 37],
      [17.5, 37],
      [17.5, 42.5],
      [13, 42.5],
    ],
    'M2'
  );
  c.shadeMetalRegion('l02_backpack_chassis', 17.5, 28.0, 7.0, 12.5, { bias: 0.06 });
  // Beveled top titanium plate + structural bolts
  c.row('l02_backpack_chassis', 13, 20, ['M4', 'M5', 'M5', 'M5', 'M4', 'M4', 'M3', 'M3', 'M2', 'M2', 'M1']);
  c.row('l02_backpack_chassis', 13, 21, ['M4', 'M4', 'M4', 'M3', 'M3', 'M3', 'M2', 'M2', 'M1', 'M1', 'M1']);
  // Triple mechanical cooling louver vents & recessed service hatch
  for (const ly of [24, 27, 30]) {
    c.row('l02_backpack_chassis', 14, ly, ['M1', 'M0', 'M0', 'M0', 'M0', 'M0', 'M1']);
    c.row('l02_backpack_chassis', 14, ly + 1, ['M3', 'M3', 'M3', 'M2', 'M2', 'M2', 'M1']);
  }
  // Telemetry status LED bar on upper-right chassis face
  c.row('l02_backpack_chassis', 21, 22, ['V5', 'V3']);
  c.row('l02_backpack_chassis', 21, 23, ['V2', 'V1']);
  c.px('l02_backpack_chassis', 14, 22, 'M5'); // top-left corner bolt
  // Heavy underside base plate
  c.row('l02_backpack_chassis', 13, 40, ['M1', 'M1', 'M0', 'M0', 'M0']);
  c.row('l02_backpack_chassis', 13, 41, ['M0', 'M0', 'M0', 'M0', 'M0']);

  // =========================================================================
  // 03 OXYGEN CYLINDER (Pressurized tank + red regulator + dual steel clamps)
  // =========================================================================
  c.fillRect('l03_oxygen_cylinder', 9, 23, 13, 41, 'M2');
  c.shadeMetalRegion('l03_oxygen_cylinder', 11.0, 32.0, 2.8, 9.5, { cylindricalX: true, bias: 0.1 });
  // Red pressure regulator valve + collar nut
  c.row('l03_oxygen_cylinder', 10, 21, ['O6', 'O6', 'O6']);
  c.row('l03_oxygen_cylinder', 10, 22, ['M4', 'M5', 'M2']);
  c.row('l03_oxygen_cylinder', 9, 23, ['M4', 'M5', 'M4', 'M2', 'M1']);
  // Upper steel retention band + bolt
  c.row('l03_oxygen_cylinder', 9, 26, ['M4', 'M5', 'M3', 'M1', 'M0']);
  c.row('l03_oxygen_cylinder', 9, 27, ['M2', 'M1', 'M1', 'M0', 'M0']);
  // Bold high-visibility orange pressurized identification band (4px tall!)
  c.row('l03_oxygen_cylinder', 9, 30, ['S4', 'S5', 'S4', 'S2', 'S1']);
  c.row('l03_oxygen_cylinder', 9, 31, ['S4', 'S5', 'S3', 'S2', 'S1']);
  c.row('l03_oxygen_cylinder', 9, 32, ['S4', 'S4', 'S3', 'S2', 'S0']);
  c.row('l03_oxygen_cylinder', 9, 33, ['S3', 'S3', 'S2', 'S1', 'S0']);
  // Lower retention band & rounded heavy end-cap
  c.row('l03_oxygen_cylinder', 9, 36, ['M4', 'M5', 'M3', 'M1', 'M0']);
  c.row('l03_oxygen_cylinder', 9, 37, ['M2', 'M1', 'M1', 'M0', 'M0']);
  c.row('l03_oxygen_cylinder', 9, 40, ['M2', 'M2', 'M1', 'M1', 'M0']);
  c.row('l03_oxygen_cylinder', 10, 41, ['M1', 'M1', 'M0']);

  // =========================================================================
  // 04 FAR RIGHT ARM (Sculpted shaded arm + stitched elbow + metallic cuff)
  // =========================================================================
  c.fillCapsule('l04_back_arm_shadow', 39.5, 33.5, 43.2, 40.0, 3.8, 3.2, 'S2');
  c.fillCapsule('l04_back_arm_shadow', 43.2, 40.2, 46.2, 45.0, 3.1, 2.5, 'S2');
  c.shadeSuitRegion('l04_back_arm_shadow', 39.5, 35.5, 6.8, 9.8, {
    bias: -0.14,
    foldFn: (_x, y) => (y === 38 || y === 42 ? -0.34 : y === 39 ? 0.16 : 0),
  });
  // Quilted bicep seam & elbow crease
  c.line('l04_back_arm_shadow', 39, 38, 44, 37, 'S0');
  c.line('l04_back_arm_shadow', 39, 39, 44, 38, 'S4');
  // Brushed titanium wrist collar ring tucked cleanly along forearm-to-glove junction
  c.line('l04_back_arm_shadow', 44, 43, 47, 42, 'M3');
  c.line('l04_back_arm_shadow', 44, 44, 47, 43, 'M2');
  c.line('l04_back_arm_shadow', 45, 45, 47, 44, 'M0');
  c.applySculptedShadowEdge('l04_back_arm_shadow', 'S0', { rightEdge: true, bottomEdge: true });

  // =========================================================================
  // 05 LEGS & MULTI-PANEL SUIT FABRIC (Heroic wide 3/4 stance, sculpted folds)
  // =========================================================================
  // Left leg (front/sunlit): x=20..30, y=50..69
  c.fillPoly(
    'l05_legs_fabric_panels',
    [
      [20.2, 50],
      [30.6, 50],
      [29.5, 60],
      [28.5, 69],
      [20.6, 69],
      [19.6, 59],
    ],
    'S3'
  );
  // Right leg (wider exploratory stride, stepped back 2px for 3/4 grounding): x=33..43, y=50..67
  c.fillPoly(
    'l05_legs_fabric_panels',
    [
      [32.4, 50],
      [41.8, 50],
      [43.6, 59],
      [42.8, 67],
      [35.2, 67],
      [33.8, 58],
    ],
    'S3'
  );
  c.shadeSuitRegion('l05_legs_fabric_panels', 28.5, 58.0, 12.5, 12.0, {
    bias: 0.06,
    allowS5: false,
    foldFn: (_x, y) => {
      if (y === 55 || y === 64) return -0.34;
      if (y === 56 || y === 65) return 0.16;
      return 0;
    },
  });
  // Deep pelvic & under-belt occlusion shadow
  c.fillRect('l05_legs_fabric_panels', 29, 50, 33, 54, 'S0');
  c.row('l05_legs_fabric_panels', 20, 50, ['S1', 'S1', 'S1', 'S1', 'S1', 'S1', 'S0', 'S0', 'S0', 'S0']);
  c.row('l05_legs_fabric_panels', 34, 50, ['S0', 'S0', 'S1', 'S1', 'S1', 'S1', 'S1', 'S0']);
  // Stitched thigh panel vertical seam & organic diagonal shin drape above boots
  c.line('l05_legs_fabric_panels', 24, 51, 24, 56, 'S1');
  c.line('l05_legs_fabric_panels', 23, 51, 23, 56, 'S4');
  c.line('l05_legs_fabric_panels', 21, 64, 28, 63, 'S1');
  c.line('l05_legs_fabric_panels', 21, 65, 28, 64, 'S4');
  c.line('l05_legs_fabric_panels', 21, 66, 28, 66, 'S1');
  c.line('l05_legs_fabric_panels', 35, 63, 42, 62, 'S0');
  c.line('l05_legs_fabric_panels', 35, 64, 42, 63, 'S3');
  c.line('l05_legs_fabric_panels', 35, 65, 42, 65, 'S1');
  c.applySculptedShadowEdge('l05_legs_fabric_panels', 'S0', { rightEdge: true, bottomEdge: false });

  // =========================================================================
  // 06 ARTICULATED STRAPPED KNEEPADS & HEAVY LUGGED BOOTS
  // =========================================================================
  // Left molded knee guard (x=20..28, y=56..62)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [20.0, 56.2],
      [28.6, 56.2],
      [28.2, 62.0],
      [20.2, 62.0],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 23.2, 58.2, 5.0, 3.6, {
    xMin: 19,
    xMax: 29,
    yMin: 55,
    yMax: 63,
    bias: 0.1,
    allowB4: true,
  });
  c.row('l06_kneepads_heavy_boots', 20, 56, ['B3', 'B4', 'B4', 'B3', 'B2', 'B2', 'B1', 'B1', 'B0']);
  c.row('l06_kneepads_heavy_boots', 20, 59, ['B2', 'B1', 'B1', 'B1', 'B1', 'B0', 'B0', 'B0', 'B0']); // knee hinge line
  c.row('l06_kneepads_heavy_boots', 20, 61, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);
  c.px('l06_kneepads_heavy_boots', 21, 57, 'M4'); // knee pad side rivet

  // Right molded knee guard (x=35..43, y=56..61)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [34.8, 56.2],
      [43.2, 56.2],
      [42.8, 61.5],
      [35.2, 61.5],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 38.0, 58.0, 4.8, 3.4, {
    xMin: 34,
    xMax: 44,
    yMin: 55,
    yMax: 62,
    bias: -0.04,
  });
  c.row('l06_kneepads_heavy_boots', 35, 56, ['B2', 'B3', 'B3', 'B2', 'B1', 'B1', 'B1', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 35, 59, ['B1', 'B1', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 35, 61, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // Left heavy lug-soled exploration boot (front, sole at y=74)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [20.4, 67.2],
      [28.5, 67.2],
      [32.2, 71.0],
      [32.4, 74.4],
      [19.6, 74.4],
      [19.6, 70.4],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 24.6, 70.0, 6.8, 4.2, {
    xMin: 19,
    xMax: 33,
    yMin: 66,
    yMax: 75,
    bias: 0.08,
    allowB4: true,
  });
  // Brushed titanium ankle/instep locking clasp
  c.row('l06_kneepads_heavy_boots', 22, 69, ['M4', 'M5', 'M4', 'M2']);
  c.row('l06_kneepads_heavy_boots', 22, 70, ['M2', 'M2', 'M1', 'B0']);
  // Worn sunlit leather toe cap highlight
  c.row('l06_kneepads_heavy_boots', 27, 71, ['B3', 'B4', 'B3', 'B2']);
  c.row('l06_kneepads_heavy_boots', 28, 72, ['B2', 'B2', 'B1', 'B1']);
  // Heavy treaded lug sole (y=73..74)
  c.row('l06_kneepads_heavy_boots', 20, 73, ['B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 20, 74, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // Right heavy exploration boot (planted firmly with subtle 1px 3/4 stagger, sole at y=73!)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [35.2, 66.4],
      [43.0, 66.4],
      [46.8, 70.0],
      [47.0, 73.4],
      [34.4, 73.4],
      [34.4, 69.4],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 39.4, 69.2, 6.8, 4.2, {
    xMin: 34,
    xMax: 48,
    yMin: 66,
    yMax: 74,
    bias: -0.02,
  });
  c.row('l06_kneepads_heavy_boots', 37, 68, ['M3', 'M4', 'M3', 'M1']);
  c.row('l06_kneepads_heavy_boots', 37, 69, ['M1', 'M1', 'M0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 42, 70, ['B3', 'B2', 'B1', 'B1']);
  c.row('l06_kneepads_heavy_boots', 35, 72, ['B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0', 'B1', 'B0', 'B0', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 35, 73, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // =========================================================================
  // 07 MULTI-PANEL SUIT TORSO & BENT LEFT ARM (Quilted seams + open elbow window!)
  // =========================================================================
  c.fillPoly(
    'l07_suit_torso_arms',
    [
      [21.5, 30.5],
      [39.8, 30.5],
      [41.0, 49.5],
      [22.0, 49.5],
    ],
    'S3'
  );
  c.shadeSuitRegion('l07_suit_torso_arms', 30.0, 38.5, 11.2, 11.0, {
    xMin: 21,
    xMax: 42,
    yMin: 30,
    yMax: 50,
    bias: 0.06,
    allowS5: true,
    foldFn: (_x, y) => {
      if (y === 36 || y === 44) return -0.28;
      if (y === 37 || y === 45) return 0.14;
      return 0;
    },
  });
  // Explicit multi-panel spacesuit stitching & waist gathers
  c.row('l07_suit_torso_arms', 22, 44, ['S1', 'S1', 'S1', 'S1', 'S0', 'S0']);
  c.row('l07_suit_torso_arms', 22, 45, ['S4', 'S4', 'S4', 'S3', 'S2']);

  // Confident bent Left Arm resting on hip (puffed shoulder baffle + generous open elbow gap!)
  c.fillCapsule('l07_suit_torso_arms', 21.0, 34.0, 15.2, 42.2, 4.6, 3.6, 'S4');
  c.fillCapsule('l07_suit_torso_arms', 15.2, 42.6, 20.8, 46.8, 3.5, 2.6, 'S3');
  // Carve crisp generous triangular negative-space elbow window!
  c.fillPoly(
    'l07_suit_torso_arms',
    [
      [18.8, 39.2],
      [21.8, 38.8],
      [21.8, 44.8],
      [18.5, 43.2],
    ],
    '.'
  );
  c.shadeSuitRegion('l07_suit_torso_arms', 16.8, 38.6, 6.8, 9.2, {
    xMin: 11,
    xMax: 22,
    yMin: 30,
    yMax: 50,
    bias: 0.14,
    allowS5: true,
  });
  // Quilted bicep seam channel + warm sunlit lower baffle ridge
  c.line('l07_suit_torso_arms', 13, 39, 19, 40, 'S1');
  c.line('l07_suit_torso_arms', 13, 40, 19, 41, 'S4');
  c.line('l07_suit_torso_arms', 13, 41, 18, 42, 'S5');
  // Signature rotated 5x5 Teal Diamond Expedition Shoulder Patch!
  c.row('l07_suit_torso_arms', 16, 34, ['.', '.', 'V2']);
  c.row('l07_suit_torso_arms', 15, 35, ['.', 'V2', 'V3', 'V1']);
  c.row('l07_suit_torso_arms', 14, 36, ['V2', 'V3', 'V5', 'V2', 'V1']);
  c.row('l07_suit_torso_arms', 15, 37, ['.', 'V1', 'V3', 'V1']);
  c.row('l07_suit_torso_arms', 16, 38, ['.', '.', 'V0']);
  // Brushed titanium left wrist collar & articulated leather glove resting firmly on hip pouch
  c.line('l07_suit_torso_arms', 18, 45, 21, 44, 'M5');
  c.line('l07_suit_torso_arms', 18, 46, 22, 45, 'M3');
  c.fillPoly(
    'l07_suit_torso_arms',
    [
      [18.8, 46.2],
      [23.2, 45.6],
      [23.6, 49.0],
      [19.2, 49.2],
    ],
    'B1'
  );
  c.row('l07_suit_torso_arms', 19, 46, ['B3', 'B4', 'B2', 'B1']);
  c.row('l07_suit_torso_arms', 19, 47, ['B2', 'B2', 'B1', 'B0']);
  c.applySculptedShadowEdge('l07_suit_torso_arms', 'S0', { rightEdge: true, bottomEdge: true });

  // =========================================================================
  // 08 SURVIVAL HARNESS, UTILITY BELT & TWIN POUCHES
  // =========================================================================
  // Twin 4px wide weathered dark leather shoulder straps + stitched trim + D-rings
  c.fillRect('l08_harness_belt_pouches', 24, 31, 27, 48, 'B1');
  c.fillRect('l08_harness_belt_pouches', 37, 31, 40, 48, 'B1');
  for (let y = 31; y <= 47; y++) {
    c.px('l08_harness_belt_pouches', 24, y, y < 39 ? 'B3' : 'B2');
    c.px('l08_harness_belt_pouches', 25, y, 'B2');
    c.px('l08_harness_belt_pouches', 26, y, 'B1');
    c.px('l08_harness_belt_pouches', 27, y, 'B0');
    c.px('l08_harness_belt_pouches', 37, y, 'B2');
    c.px('l08_harness_belt_pouches', 38, y, 'B1');
    c.px('l08_harness_belt_pouches', 39, y, 'B1');
    c.px('l08_harness_belt_pouches', 40, y, 'B0');
  }
  // Brushed titanium harness D-rings / locking chest clasps
  c.row('l08_harness_belt_pouches', 24, 32, ['M4', 'M5', 'M4', 'M2']);
  c.row('l08_harness_belt_pouches', 24, 33, ['M3', 'B0', 'B0', 'M1']);
  c.row('l08_harness_belt_pouches', 24, 34, ['M3', 'M4', 'M2', 'M0']);
  c.row('l08_harness_belt_pouches', 37, 32, ['M3', 'M4', 'M3', 'M1']);
  c.row('l08_harness_belt_pouches', 37, 33, ['M2', 'B0', 'B0', 'M0']);
  c.row('l08_harness_belt_pouches', 37, 34, ['M2', 'M3', 'M1', 'M0']);

  // Heavy Utility Belt (y=47..52)
  c.fillRect('l08_harness_belt_pouches', 20, 47, 41, 51, 'B1');
  c.shadeLeatherRegion('l08_harness_belt_pouches', 29.0, 48.5, 11.5, 3.0, {
    xMin: 19,
    xMax: 42,
    yMin: 47,
    yMax: 52,
    bias: 0.05,
  });
  c.row('l08_harness_belt_pouches', 20, 47, ['B3', 'B4', 'B3', 'B3', 'B2', 'B2', 'B2', 'B2', 'B2', 'M4', 'M5', 'M5', 'M4', 'M3', 'M2', 'B1', 'B1', 'B1', 'B1', 'B0', 'B0', 'B0']);
  c.row('l08_harness_belt_pouches', 20, 51, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'M1', 'M1', 'M1', 'M0', 'M0', 'M0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);
  // Sculpted Brushed-Titanium Center Belt Buckle (6x5, x=29..34, y=47..51)
  c.row('l08_harness_belt_pouches', 29, 47, ['M4', 'M5', 'M5', 'M4', 'M3', 'M2']);
  c.row('l08_harness_belt_pouches', 29, 48, ['M4', 'M2', 'M1', 'M1', 'M2', 'M1']);
  c.row('l08_harness_belt_pouches', 29, 49, ['M4', 'M2', 'M4', 'M3', 'M2', 'M1']); // center latch pin
  c.row('l08_harness_belt_pouches', 29, 50, ['M3', 'M2', 'M2', 'M1', 'M1', 'M0']);
  c.row('l08_harness_belt_pouches', 29, 51, ['M1', 'M1', 'M1', 'M0', 'M0', 'M0']);
  // Left-hip Twin Weathered Leather Field Pouches w/ titanium snaps
  c.fillRect('l08_harness_belt_pouches', 18, 47, 23, 53, 'B1');
  c.row('l08_harness_belt_pouches', 18, 47, ['B3', 'B4', 'B4', 'B3', 'B2', 'B1']);
  c.row('l08_harness_belt_pouches', 18, 48, ['B3', 'B3', 'B2', 'B2', 'B1', 'B0']);
  c.row('l08_harness_belt_pouches', 18, 49, ['B2', 'B2', 'B1', 'B1', 'B1', 'B0']);
  c.row('l08_harness_belt_pouches', 18, 50, ['B2', 'B1', 'M4', 'M3', 'B1', 'B0']); // pouch clasp
  c.row('l08_harness_belt_pouches', 18, 51, ['B2', 'B1', 'B1', 'B1', 'B0', 'B0']);
  c.row('l08_harness_belt_pouches', 18, 52, ['B1', 'B1', 'B1', 'B0', 'B0', 'B0']);
  c.row('l08_harness_belt_pouches', 18, 53, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  c.fillRect('l08_harness_belt_pouches', 24, 47, 28, 52, 'B1');
  c.row('l08_harness_belt_pouches', 24, 47, ['B3', 'B3', 'B3', 'B2', 'B1']);
  c.row('l08_harness_belt_pouches', 24, 49, ['B2', 'M4', 'M3', 'B1', 'B0']);
  c.row('l08_harness_belt_pouches', 24, 52, ['B0', 'B0', 'B0', 'B0', 'B0']);

  // =========================================================================
  // 09 MOSS SPECIMEN VIAL (High-detail right-hip glass canister w/ living moss)
  // =========================================================================
  c.row('l09_moss_specimen_vial', 36, 48, ['M4', 'M5', 'M5', 'M4', 'M3', 'M1']); // upper titanium cap
  c.row('l09_moss_specimen_vial', 36, 49, ['M3', 'M3', 'M2', 'M2', 'M1', 'M0']);
  c.row('l09_moss_specimen_vial', 36, 50, ['V1', 'M5', 'V3', 'V2', 'V1', 'V0']); // clear top glass meniscus
  c.row('l09_moss_specimen_vial', 36, 51, ['V1', 'V5', 'O3', 'O2', 'V1', 'V0']);
  c.row('l09_moss_specimen_vial', 36, 52, ['V1', 'M5', 'O4', 'O3', 'O2', 'V0']); // glowing moss specimen!
  c.row('l09_moss_specimen_vial', 36, 53, ['V1', 'V5', 'O4', 'O4', 'O2', 'V0']);
  c.row('l09_moss_specimen_vial', 36, 54, ['V1', 'V4', 'O3', 'O3', 'O1', 'V0']);
  c.row('l09_moss_specimen_vial', 36, 55, ['V0', 'O2', 'O2', 'O1', 'O1', 'V0']);
  c.row('l09_moss_specimen_vial', 36, 56, ['M3', 'M4', 'M3', 'M2', 'M1', 'M0']); // lower titanium cap
  c.row('l09_moss_specimen_vial', 36, 57, ['M2', 'M2', 'M1', 'M1', 'M0', 'M0']);

  // =========================================================================
  // 10 CHEST TELEMETRY RIG (Bolted titanium oscilloscope console + multi-peak wave)
  // =========================================================================
  c.fillRect('l10_chest_telemetry_rig', 26, 34, 39, 44, 'M2');
  c.row('l10_chest_telemetry_rig', 26, 34, ['M4', 'M5', 'M5', 'M5', 'M4', 'M4', 'M4', 'M3', 'M3', 'M3', 'M2', 'M2', 'M2', 'M1']);
  c.row('l10_chest_telemetry_rig', 26, 35, ['M4', 'M5', 'M2', 'M2', 'M2', 'M2', 'M2', 'M2', 'M2', 'M2', 'M2', 'M2', 'M4', 'M1']);
  c.row('l10_chest_telemetry_rig', 26, 36, ['M4', 'M2', 'V0', 'V0', 'V0', 'V0', 'V0', 'V0', 'V0', 'V0', 'M1', 'M2', 'M2', 'M1']);
  c.row('l10_chest_telemetry_rig', 26, 37, ['M4', 'M2', 'V0', 'V1', 'V1', 'V2', 'V1', 'V1', 'V1', 'V0', 'M1', 'O4', 'O3', 'M1']); // green status LED
  c.row('l10_chest_telemetry_rig', 26, 38, ['M3', 'M2', 'V0', 'V1', 'V2', 'V4', 'V2', 'V1', 'V5', 'V0', 'M1', 'O3', 'O2', 'M1']);
  c.row('l10_chest_telemetry_rig', 26, 39, ['M3', 'M2', 'V0', 'V4', 'V5', 'V2', 'V4', 'V5', 'V2', 'V0', 'M1', 'M1', 'M1', 'M0']); // crisp multi-peak waveform!
  c.row('l10_chest_telemetry_rig', 26, 40, ['M3', 'M1', 'V0', 'V2', 'V1', 'V1', 'V2', 'V1', 'V1', 'V0', 'M1', 'O6', 'O6', 'M0']); // red emergency latch!
  c.row('l10_chest_telemetry_rig', 26, 41, ['M2', 'M1', 'V0', 'V1', 'V1', 'V1', 'V1', 'V1', 'V1', 'V0', 'M1', 'O6', 'S1', 'M0']);
  c.row('l10_chest_telemetry_rig', 26, 42, ['M2', 'M2', 'M1', 'M1', 'M0', 'M0', 'M0', 'M0', 'M1', 'M1', 'M1', 'M1', 'M1', 'M0']);
  c.row('l10_chest_telemetry_rig', 26, 43, ['M2', 'M3', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M2', 'M0']);
  c.row('l10_chest_telemetry_rig', 26, 44, ['M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0']);
  c.castShadow('l10_chest_telemetry_rig', 'l07_suit_torso_arms', 1, 1, 'S0');
  c.castShadow('l10_chest_telemetry_rig', 'l07_suit_torso_arms', 2, 2, 'S1');

  // =========================================================================
  // 11 HELMET SHELL & BOLTED TITANIUM COLLAR (Oversized dome + ivory stripe)
  // =========================================================================
  c.fillEllipse('l11_helmet_shell_collar', 32.4, 20.2, 10.2, 9.6, 'S3');
  c.shadeSuitRegion('l11_helmet_shell_collar', 31.2, 19.0, 10.2, 9.6, {
    bias: 0.08,
    allowS5: true,
  });
  // Crisp 4px Warm Ivory Ceramic Crown Racing Stripe + subtle recessed edge seam
  c.row('l11_helmet_shell_collar', 29, 11, ['S3', 'O5', 'O5', 'O5', 'O5', 'S2']);
  c.row('l11_helmet_shell_collar', 29, 12, ['S3', 'O5', 'O5', 'O5', 'M4', 'S2']);
  c.row('l11_helmet_shell_collar', 29, 13, ['S3', 'O5', 'O5', 'M4', 'M3', 'S2']);
  c.row('l11_helmet_shell_collar', 29, 14, ['S2', 'M4', 'M4', 'M3', 'M2', 'S1']);
  // Precision Metallic Side Ear Transducer Pod w/ upper clamp & glowing teal LED
  c.fillRect('l11_helmet_shell_collar', 21, 17, 25, 25, 'M2');
  c.row('l11_helmet_shell_collar', 21, 17, ['M4', 'M5', 'M4', 'M3', 'M1']);
  c.row('l11_helmet_shell_collar', 21, 18, ['M4', 'M4', 'M3', 'M2', 'M0']);
  c.row('l11_helmet_shell_collar', 21, 19, ['M3', 'M2', 'M1', 'M1', 'M0']);
  c.row('l11_helmet_shell_collar', 21, 20, ['M3', 'M1', 'M0', 'M0', 'M0']); // recessed transducer slot
  c.row('l11_helmet_shell_collar', 21, 21, ['M3', 'V4', 'V5', 'V3', 'M1']); // bright glowing teal LED!
  c.row('l11_helmet_shell_collar', 21, 22, ['M3', 'V3', 'V4', 'V2', 'M0']);
  c.row('l11_helmet_shell_collar', 21, 23, ['M2', 'M2', 'M1', 'M1', 'M0']);
  c.row('l11_helmet_shell_collar', 21, 24, ['M2', 'M1', 'M1', 'M0', 'S1']);
  c.row('l11_helmet_shell_collar', 22, 25, ['M1', 'M0', 'M0']);
  // Calm sculpted recessed dark chin air intake
  c.row('l11_helmet_shell_collar', 31, 27, ['M2', 'M2', 'M1', 'M1', 'M0', 'M0']);
  c.row('l11_helmet_shell_collar', 32, 28, ['M0', 'M0', 'M0', 'M0', 'S0']);
  // Heavy Bolted Brushed-Titanium Neck Lock Collar (20x4!) + Visible Ribbed Breathing Hose!
  c.fillRect('l11_helmet_shell_collar', 22, 29, 41, 32, 'M2');
  c.row('l11_helmet_shell_collar', 22, 29, ['M4', 'M5', 'M5', 'M4', 'M4', 'M4', 'M3', 'M3', 'M3', 'M3', 'M2', 'M2', 'M2', 'M2', 'M1', 'M1', 'M1', 'M1', 'M1', 'M0']);
  c.row('l11_helmet_shell_collar', 22, 30, ['M4', 'M3', 'M2', 'M4', 'M3', 'M2', 'M2', 'M3', 'M2', 'M1', 'M1', 'M2', 'M1', 'M1', 'M0', 'M1', 'M1', 'M0', 'M0', 'M0']); // locking lugs
  c.row('l11_helmet_shell_collar', 22, 31, ['M3', 'M2', 'M2', 'M2', 'M2', 'M1', 'M1', 'M1', 'M1', 'M1', 'M1', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0']);
  c.row('l11_helmet_shell_collar', 23, 32, ['M1', 'M1', 'M1', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0']);
  // Visible curved dark ribbed oxygen breathing hose arching out of upper pack into neck collar!
  c.fillCapsule('l11_helmet_shell_collar', 18.8, 25.4, 21.8, 29.4, 1.6, 1.5, 'B0');
  c.row('l11_helmet_shell_collar', 18, 24, ['M3', 'M4']);
  c.row('l11_helmet_shell_collar', 19, 26, ['M3', 'M4']);
  c.row('l11_helmet_shell_collar', 20, 28, ['M3', 'M2']);
  c.row('l11_helmet_shell_collar', 21, 29, ['M4', 'M3']);
  c.castShadow('l11_helmet_shell_collar', 'l07_suit_torso_arms', 0, 1, 'S0');
  c.castShadow('l11_helmet_shell_collar', 'l07_suit_torso_arms', 1, 2, 'S1');

  // =========================================================================
  // 12 CURVED GLASS VISOR (Riveted titanium bezel + rich 5-tone spherical glass!)
  // =========================================================================
  c.fillEllipse('l12_curved_glass_visor', 34.4, 20.6, 8.6, 6.5, 'M2');
  c.shadeMetalRegion('l12_curved_glass_visor', 32.6, 18.6, 8.6, 6.5, { bias: 0.1 });
  // Deep curved dark-teal spherical glass aperture
  c.fillEllipse('l12_curved_glass_visor', 34.6, 20.8, 7.3, 5.2, 'V0');
  // Smooth multi-band atmospheric reflection & razor-sharp curved sunlit specular slash!
  c.row('l12_curved_glass_visor', 30, 16, ['V2', 'V4', 'V5', 'M5', 'M5', 'M5', 'V5', 'V3', 'V1']);
  c.row('l12_curved_glass_visor', 29, 17, ['V4', 'M5', 'M5', 'V5', 'V4', 'V3', 'V3', 'V2', 'V1', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 28, 18, ['V5', 'M5', 'V4', 'V2', 'V2', 'V3', 'V3', 'V3', 'V2', 'V2', 'V1', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 28, 19, ['V4', 'V3', 'V2', 'V3', 'V3', 'V4', 'V3', 'V3', 'V3', 'V2', 'V2', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 28, 20, ['V2', 'V2', 'V3', 'V3', 'V3', 'V3', 'V3', 'V3', 'V2', 'V2', 'V1', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 28, 21, ['V1', 'V1', 'V2', 'V2', 'V2', 'V2', 'V2', 'V2', 'V1', 'V1', 'V0', 'V0', 'V0']);
  c.row('l12_curved_glass_visor', 28, 22, ['V1', 'V1', 'V1', 'V1', 'V1', 'V1', 'V1', 'V1', 'V0', 'V0', 'V0', 'V0', 'V0']);
  c.row('l12_curved_glass_visor', 29, 23, ['V0', 'V0', 'V0', 'V1', 'V1', 'V1', 'V1', 'V1', 'V0', 'V0', 'V0']);
  c.row('l12_curved_glass_visor', 31, 24, ['V0', 'V0', 'V1', 'V2', 'V3', 'V3', 'V2', 'V1']); // lower-right atmospheric bounce
  c.row('l12_curved_glass_visor', 32, 25, ['V0', 'V0', 'V1', 'V2', 'V1', 'V0']);
  // Precision visor bezel corner rivets
  c.px('l12_curved_glass_visor', 27, 17, 'M5');
  c.px('l12_curved_glass_visor', 27, 24, 'M3');
  c.px('l12_curved_glass_visor', 41, 17, 'M3');

  // =========================================================================
  // 13 HANDHELD ACOUSTIC FIELD SCANNER & ARTICULATED GLOVED RIGHT HAND
  // =========================================================================
  // Sculpted angled metallic scanner barrel & emitter chassis (drawn before gloved thumb wrap!)
  c.fillPoly(
    'l13_handheld_scanner',
    [
      [45.0, 41.0],
      [52.8, 36.0],
      [54.6, 40.2],
      [47.4, 43.6],
    ],
    'M2'
  );
  c.shadeMetalRegion('l13_handheld_scanner', 49.0, 39.0, 6.0, 4.6, {
    xMin: 44,
    xMax: 56,
    yMin: 35,
    yMax: 45,
    bias: 0.14,
  });
  c.row('l13_handheld_scanner', 48, 39, ['S4', 'S5', 'S4', 'S2']); // signature orange housing accent
  c.row('l13_handheld_scanner', 48, 40, ['S3', 'S3', 'S2']);
  c.row('l13_handheld_scanner', 49, 37, ['V4', 'V5']); // active teal charge indicator

  // Complete, unclipped 3/4 elliptical Parabolic Collector Dish (comfortably inside x<=60!)
  c.fillEllipse('l13_handheld_scanner', 54.4, 37.6, 4.9, 5.6, 'M2', undefined, -0.38);
  c.shadeMetalRegion('l13_handheld_scanner', 52.6, 35.8, 5.2, 5.8, {
    xMin: 49,
    xMax: 61,
    yMin: 31,
    yMax: 45,
    bias: 0.16,
  });
  // Deep concentric curved dark-teal parabolic receiver bowl + metallic acoustic receiver probe!
  c.fillEllipse('l13_handheld_scanner', 54.9, 37.8, 3.3, 4.0, 'V0', undefined, -0.38);
  c.row('l13_handheld_scanner', 53, 35, ['V3', 'V5', 'V4', 'V2']);
  c.row('l13_handheld_scanner', 52, 36, ['V4', 'V4', 'V3', 'V2', 'V1']);
  c.row('l13_handheld_scanner', 52, 37, ['V3', 'V3', 'V5', 'V3', 'V1']);
  c.row('l13_handheld_scanner', 52, 38, ['V3', 'V4', 'M5', 'V4', 'V1']); // glowing central receiver pin!
  c.row('l13_handheld_scanner', 52, 39, ['V2', 'V3', 'V4', 'V2', 'V0']);
  c.row('l13_handheld_scanner', 53, 40, ['V1', 'V2', 'V3', 'V1']);
  c.row('l13_handheld_scanner', 54, 41, ['V1', 'V2', 'V1']);
  c.row('l13_handheld_scanner', 52, 33, ['M4', 'M5', 'M5', 'M4', 'M3']);

  // Articulated weathered dark leather glove WRAPPING securely over scanner grip & lower neck!
  c.fillPoly(
    'l13_handheld_scanner',
    [
      [44.6, 41.8],
      [50.8, 41.0],
      [51.4, 47.0],
      [47.0, 48.8],
      [44.4, 45.8],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l13_handheld_scanner', 47.2, 43.8, 4.2, 4.0, {
    xMin: 43,
    xMax: 52,
    yMin: 40,
    yMax: 50,
    bias: 0.08,
    allowB4: true,
  });
  c.row('l13_handheld_scanner', 45, 41, ['B3', 'B4', 'B3', 'B1']); // thumb gripping over barrel neck!
  c.row('l13_handheld_scanner', 45, 42, ['B2', 'B3', 'B4', 'B2', 'B1', 'B0']);
  c.row('l13_handheld_scanner', 46, 44, ['B2', 'B3', 'B3', 'B1', 'B0']); // top wrapped finger
  c.row('l13_handheld_scanner', 46, 46, ['B2', 'B3', 'B2', 'B1', 'B0']); // middle wrapped finger
  c.row('l13_handheld_scanner', 47, 48, ['B1', 'B1', 'B0', 'B0']); // pistol grip base
  c.row('l13_handheld_scanner', 48, 49, ['B0', 'B0']);

  return c.toProjectDocument({
    id: 'vpf_mara_proto_64x80',
    name: 'Mara_Lin_Feasibility_Proto_64x80',
    pivot: { x: 29, y: 74 },
    styleNotes:
      'AST-001 Feasibility Study Prototype 3 (64×80 px, 4×5 tiles, 13 editable VPF layers). Independently sculpted collector-tier high-detail character prototype in VERDANT PIXEL FORGE.',
  });
}
