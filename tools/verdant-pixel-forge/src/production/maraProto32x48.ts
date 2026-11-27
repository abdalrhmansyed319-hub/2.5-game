/**
 * VERDANT PIXEL FORGE — AST-001 Feasibility Study Prototype 1 (32×48)
 * -------------------------------------------------------------------
 * Independently designed and sculpted specifically for 32×48 (2×3 tiles, 4× area of 16×24).
 * Uses VERDANT PIXEL FORGE's native 13-layer editable document architecture and 30-color
 * VERDANT SIGNAL Master Palette. Zero downscaling from 128×128; zero shared scaling.
 */
import type { ProjectDocument } from '../types/studio';
import { VpfSculptCanvas } from './vpfSculptTools';

export function buildMaraProto32x48(): ProjectDocument {
  const c = new VpfSculptCanvas(32, 48);

  // =========================================================================
  // 01 ANTENNA & CABLES (Telescoping whip antenna + pearl tip + breathing hose)
  // =========================================================================
  c.line('l01_antenna_cables', 7, 4, 8, 11, 'M2');
  c.px('l01_antenna_cables', 7, 3, 'M5'); // bright pearl tip
  c.px('l01_antenna_cables', 7, 4, 'M4');
  c.px('l01_antenna_cables', 7, 6, 'M3');
  c.fillRect('l01_antenna_cables', 7, 10, 9, 12, 'M1'); // antenna collar mount
  c.px('l01_antenna_cables', 7, 10, 'M3');
  // Ribbed dark breathing cable arching from backpack into helmet collar
  c.row('l01_antenna_cables', 9, 14, ['B0', 'M2', 'B0']);
  c.row('l01_antenna_cables', 10, 15, ['M1', 'B0', 'M2']);
  c.px('l01_antenna_cables', 11, 16, 'B0');

  // =========================================================================
  // 02 BACKPACK CHASSIS (Substantial brushed-titanium housing + vents)
  // =========================================================================
  // Tucked cleanly above/left of bent elbow pocket so left arm silhouette stays crisp!
  c.fillPoly(
    'l02_backpack_chassis',
    [
      [6, 12],
      [12, 12],
      [12, 22],
      [8.5, 22],
      [8.5, 24],
      [6, 24],
    ],
    'M2'
  );
  c.shadeMetalRegion('l02_backpack_chassis', 8.5, 16.5, 4, 6.5, { bias: 0.05 });
  // Top chamfer highlight & dark mechanical louvers/latches
  c.row('l02_backpack_chassis', 6, 12, ['M4', 'M5', 'M4', 'M3', 'M2', 'M1']);
  c.row('l02_backpack_chassis', 7, 14, ['M1', 'M0', 'M0', 'M1']); // upper louver
  c.row('l02_backpack_chassis', 7, 15, ['M3', 'M3', 'M2', 'M1']);
  c.row('l02_backpack_chassis', 7, 17, ['M1', 'M0', 'M0', 'M0']); // lower louver
  c.row('l02_backpack_chassis', 6, 23, ['M1', 'M0', 'M0']); // underside shadow
  c.px('l02_backpack_chassis', 10, 13, 'V4'); // tiny telemetry status pip

  // =========================================================================
  // 03 OXYGEN CYLINDER (Pressurized vertical tank + red valve + orange band)
  // =========================================================================
  c.fillRect('l03_oxygen_cylinder', 4, 14, 6, 24, 'M2');
  c.shadeMetalRegion('l03_oxygen_cylinder', 5, 19, 1.8, 5.5, { cylindricalX: true, bias: 0.08 });
  // Red pressure regulator valve on top
  c.row('l03_oxygen_cylinder', 4, 13, ['M3', 'O6', 'M1']);
  c.px('l03_oxygen_cylinder', 5, 14, 'M4');
  // Bold orange pressurized identification band
  c.row('l03_oxygen_cylinder', 4, 18, ['S4', 'S3', 'S1']);
  c.row('l03_oxygen_cylinder', 4, 19, ['S4', 'S3', 'S1']);
  // Retaining metal straps & bottom cap
  c.row('l03_oxygen_cylinder', 4, 16, ['M4', 'M2', 'M0']);
  c.row('l03_oxygen_cylinder', 4, 21, ['M3', 'M2', 'M0']);
  c.row('l03_oxygen_cylinder', 4, 24, ['M2', 'M1', 'M0']);

  // =========================================================================
  // 04 FAR RIGHT ARM (Shaded far shoulder & forearm extending toward scanner)
  // =========================================================================
  c.fillCapsule('l04_back_arm_shadow', 20.5, 20.5, 23.0, 26.2, 2.1, 1.7, 'S2');
  c.shadeSuitRegion('l04_back_arm_shadow', 20.5, 21.5, 3.5, 5.0, { bias: -0.18 });
  // Crisp stitched bicep seam & forearm cuff
  c.row('l04_back_arm_shadow', 20, 23, ['S0', 'S1', 'S1', 'S0']);
  c.row('l04_back_arm_shadow', 21, 24, ['S3', 'S2', 'S1']);
  c.row('l04_back_arm_shadow', 22, 26, ['M2', 'M1', 'M0']); // metallic wrist cuff

  // =========================================================================
  // 05 LEGS & FABRIC PANELS (Wide 3/4 exploratory stride, stitched folds)
  // =========================================================================
  // Left leg (front/sunlit): x=10..15, y=30..41
  c.fillPoly(
    'l05_legs_fabric_panels',
    [
      [10, 30],
      [16, 30],
      [15, 36],
      [14.5, 42],
      [10.2, 42],
      [9.8, 35],
    ],
    'S3'
  );
  // Right leg (stepped slightly wider & back for contrapposto depth): x=17..22, y=30..40
  c.fillPoly(
    'l05_legs_fabric_panels',
    [
      [16.5, 30],
      [21.8, 30],
      [22.6, 36],
      [22.2, 41],
      [18.0, 41],
      [17.0, 35],
    ],
    'S3'
  );
  c.shadeSuitRegion('l05_legs_fabric_panels', 14.5, 34.5, 6.5, 7.0, {
    bias: 0.04,
    foldFn: (_x, y) => (y === 33 || y === 39 ? -0.32 : y === 34 || y === 40 ? 0.16 : 0),
  });
  // Dark crotch/inner-thigh separation & shadow under belt
  c.fillRect('l05_legs_fabric_panels', 15, 30, 17, 32, 'S0');
  c.row('l05_legs_fabric_panels', 10, 30, ['S1', 'S1', 'S1', 'S0', 'S0']);
  c.row('l05_legs_fabric_panels', 18, 30, ['S0', 'S0', 'S1', 'S1']);
  // Crisp horizontal/diagonal cloth creases above boots
  c.row('l05_legs_fabric_panels', 10, 39, ['S1', 'S1', 'S2', 'S0', 'S0']);
  c.row('l05_legs_fabric_panels', 10, 40, ['S4', 'S3', 'S2', 'S1']);
  c.row('l05_legs_fabric_panels', 18, 38, ['S1', 'S0', 'S0', 'S0']);
  c.row('l05_legs_fabric_panels', 18, 39, ['S3', 'S2', 'S1', 'S0']);
  c.applySculptedShadowEdge('l05_legs_fabric_panels', 'S0', { rightEdge: true, bottomEdge: false });

  // =========================================================================
  // 06 KNEEPADS & HEAVY TREADED BOOTS (Dark weathered leather + titanium clasps)
  // =========================================================================
  // Articulated dark-brown rubberized knee pads
  c.fillRect('l06_kneepads_heavy_boots', 10, 34, 14, 37, 'B1');
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 11.5, 35.0, 2.8, 2.2, { bias: 0.08, allowB4: true });
  c.row('l06_kneepads_heavy_boots', 10, 34, ['B3', 'B3', 'B2', 'B1', 'B0']);
  c.row('l06_kneepads_heavy_boots', 10, 37, ['B0', 'B0', 'B0', 'B0', 'B0']);

  c.fillRect('l06_kneepads_heavy_boots', 18, 34, 22, 36, 'B1');
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 19.5, 34.5, 2.6, 1.8, { bias: -0.05 });
  c.row('l06_kneepads_heavy_boots', 18, 34, ['B2', 'B2', 'B1', 'B0', 'B0']);
  c.row('l06_kneepads_heavy_boots', 18, 36, ['B0', 'B0', 'B0', 'B0', 'B0']);

  // Left heavy boot (front, sole at y=45)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [10, 41],
      [14.5, 41],
      [16.2, 43.2],
      [16.2, 45.2],
      [9.5, 45.2],
      [9.5, 43],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 12.2, 42.5, 3.6, 2.4, {
    xMin: 9,
    xMax: 16,
    yMin: 41,
    yMax: 45,
    bias: 0.08,
    allowB4: true,
  });
  c.row('l06_kneepads_heavy_boots', 11, 42, ['M4', 'M3']); // metallic boot clasp
  c.row('l06_kneepads_heavy_boots', 10, 45, ['B0', 'B0', 'B1', 'B0', 'B0', 'B0', 'B0']); // lugged sole

  // Right heavy boot (slightly further back, sole at y=44)
  c.fillPoly(
    'l06_kneepads_heavy_boots',
    [
      [18, 40],
      [22.4, 40],
      [24.2, 42.2],
      [24.2, 44.2],
      [17.6, 44.2],
      [17.6, 42],
    ],
    'B1'
  );
  c.shadeLeatherRegion('l06_kneepads_heavy_boots', 20.2, 41.5, 3.6, 2.4, {
    xMin: 17,
    xMax: 24,
    yMin: 40,
    yMax: 44,
    bias: -0.02,
  });
  c.row('l06_kneepads_heavy_boots', 19, 41, ['M3', 'M2']); // boot clasp
  c.row('l06_kneepads_heavy_boots', 18, 44, ['B0', 'B0', 'B0', 'B0', 'B0', 'B0', 'B0']);

  // =========================================================================
  // 07 SUIT TORSO & BENT LEFT ARM (Multi-panel orange suit + crisp elbow gap!)
  // =========================================================================
  // Core torso volume (x=11..21, y=18..30)
  c.fillPoly(
    'l07_suit_torso_arms',
    [
      [11, 18.5],
      [20.5, 18.5],
      [21.5, 29.5],
      [11.2, 29.5],
    ],
    'S3'
  );
  c.shadeSuitRegion('l07_suit_torso_arms', 15.5, 23.0, 6.0, 6.5, {
    xMin: 11,
    xMax: 22,
    yMin: 18,
    yMax: 30,
    bias: 0.04,
    allowS5: true,
    foldFn: (_x, y) => (y === 22 || y === 26 ? -0.25 : y === 23 || y === 27 ? 0.14 : 0),
  });

  // Left Shoulder Baffle & Bent Left Arm resting on hip (opens crisp triangular negative-space gap!)
  c.fillCapsule('l07_suit_torso_arms', 10.5, 20.0, 7.2, 25.0, 2.4, 1.9, 'S4');
  c.fillCapsule('l07_suit_torso_arms', 7.2, 25.2, 10.2, 27.6, 1.8, 1.4, 'S3');
  // Carve crisp triangular negative-space elbow window at x=10, y=24..25!
  c.erase('l07_suit_torso_arms', 10, 24);
  c.erase('l07_suit_torso_arms', 10, 25);
  c.shadeSuitRegion('l07_suit_torso_arms', 8.2, 22.8, 3.8, 5.2, {
    xMin: 5,
    xMax: 11,
    yMin: 18,
    yMax: 29,
    bias: 0.14,
    allowS5: true,
  });
  // Stitched bicep/elbow fabric seam + warm sunlit lower baffle lip
  c.row('l07_suit_torso_arms', 6, 23, ['S1', 'S1', 'S1', 'S0']);
  c.row('l07_suit_torso_arms', 6, 24, ['S4', 'S4', 'S3']);
  // Signature rotated Teal Diamond Shoulder Patch!
  c.px('l07_suit_torso_arms', 8, 20, 'V2');
  c.row('l07_suit_torso_arms', 7, 21, ['V2', 'V4', 'V1']);
  c.px('l07_suit_torso_arms', 8, 22, 'V1');
  // Left wrist cuff & insulated dark leather glove resting at hip
  c.row('l07_suit_torso_arms', 9, 27, ['M3', 'M2']);
  c.row('l07_suit_torso_arms', 9, 28, ['B2', 'B1', 'B0']);
  c.applySculptedShadowEdge('l07_suit_torso_arms', 'S0', { rightEdge: true, bottomEdge: true });

  // =========================================================================
  // 08 HARNESS, UTILITY BELT & POUCHES (Weathered dark-brown leather + metal)
  // =========================================================================
  // Twin vertical shoulder harness straps with top metallic D-ring clasps
  c.fillRect('l08_harness_belt_pouches', 12, 19, 13, 28, 'B1');
  c.fillRect('l08_harness_belt_pouches', 19, 19, 20, 28, 'B1');
  for (let y = 19; y <= 27; y++) {
    c.px('l08_harness_belt_pouches', 12, y, y < 23 ? 'B3' : 'B2');
    c.px('l08_harness_belt_pouches', 13, y, 'B1');
    c.px('l08_harness_belt_pouches', 19, y, 'B1');
    c.px('l08_harness_belt_pouches', 20, y, 'B0');
  }
  c.row('l08_harness_belt_pouches', 12, 19, ['M4', 'M2']); // left shoulder clasp
  c.row('l08_harness_belt_pouches', 19, 19, ['M3', 'M1']); // right shoulder clasp

  // Heavy utility belt + left leather pouch + brushed titanium center buckle
  c.fillRect('l08_harness_belt_pouches', 10, 28, 21, 30, 'B1');
  c.row('l08_harness_belt_pouches', 10, 28, ['B3', 'B3', 'B2', 'B2', 'B2', 'M4', 'M4', 'B1', 'B1', 'B1', 'B0', 'B0']);
  c.row('l08_harness_belt_pouches', 10, 29, ['B2', 'B3', 'B1', 'B2', 'B1', 'M3', 'M2', 'B1', 'B1', 'B0', 'B0', 'B0']);
  c.row('l08_harness_belt_pouches', 10, 30, ['B0', 'B0', 'B0', 'B0', 'B0', 'M1', 'M0', 'B0', 'B0', 'B0', 'B0', 'B0']);
  // Left-hip utility pouch volume
  c.fillRect('l08_harness_belt_pouches', 9, 28, 11, 31, 'B1');
  c.row('l08_harness_belt_pouches', 9, 28, ['B3', 'B3', 'B2']);
  c.row('l08_harness_belt_pouches', 9, 29, ['B2', 'M3', 'B1']);
  c.row('l08_harness_belt_pouches', 9, 30, ['B1', 'B1', 'B0']);
  c.row('l08_harness_belt_pouches', 9, 31, ['B0', 'B0', 'B0']);

  // =========================================================================
  // 09 MOSS SPECIMEN VIAL (Right-hip glass canister + glowing living moss!)
  // =========================================================================
  c.row('l09_moss_specimen_vial', 18, 29, ['M4', 'M3', 'M2']); // top titanium cap
  c.row('l09_moss_specimen_vial', 18, 30, ['V4', 'O4', 'V1']); // glass glint + sunlit moss
  c.row('l09_moss_specimen_vial', 18, 31, ['V3', 'O3', 'O2']); // glowing moss interior
  c.row('l09_moss_specimen_vial', 18, 32, ['V1', 'O2', 'O1']); // deep moss base
  c.row('l09_moss_specimen_vial', 18, 33, ['M3', 'M2', 'M0']); // bottom titanium cap

  // =========================================================================
  // 10 CHEST TELEMETRY RIG (Bolted titanium frame + oscilloscope waveform + LEDs)
  // =========================================================================
  c.fillRect('l10_chest_telemetry_rig', 13, 21, 19, 26, 'M2');
  c.row('l10_chest_telemetry_rig', 13, 21, ['M4', 'M5', 'M4', 'M3', 'M3', 'M2', 'M1']);
  c.row('l10_chest_telemetry_rig', 13, 22, ['M4', 'V0', 'V1', 'V1', 'V0', 'M2', 'M1']);
  c.row('l10_chest_telemetry_rig', 13, 23, ['M3', 'V1', 'V4', 'V2', 'V4', 'O3', 'M1']); // waveform + green LED
  c.row('l10_chest_telemetry_rig', 13, 24, ['M2', 'V4', 'V1', 'V5', 'V1', 'O6', 'M0']); // waveform peak + red latch!
  c.row('l10_chest_telemetry_rig', 13, 25, ['M2', 'M1', 'M1', 'M1', 'M1', 'M1', 'M0']);
  c.row('l10_chest_telemetry_rig', 13, 26, ['M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0']);
  c.castShadow('l10_chest_telemetry_rig', 'l07_suit_torso_arms', 1, 1, 'S0');

  // =========================================================================
  // 11 HELMET SHELL & COLLAR (Oversized sunlit orange dome + ivory stripe + ear pod)
  // =========================================================================
  c.fillEllipse('l11_helmet_shell_collar', 16.5, 11.8, 5.6, 5.4, 'S3');
  c.shadeSuitRegion('l11_helmet_shell_collar', 16.0, 11.2, 5.6, 5.4, {
    bias: 0.08,
    allowS5: true,
  });
  // Warm Ivory Ceramic Crown Racing Stripe (x=15..16, y=6..8)
  c.row('l11_helmet_shell_collar', 15, 6, ['O5', 'O5']);
  c.row('l11_helmet_shell_collar', 15, 7, ['O5', 'M4']);
  c.row('l11_helmet_shell_collar', 15, 8, ['M4', 'M3']);
  // Sculpted Metallic Side Ear Transducer Pod w/ Teal LED
  c.fillRect('l11_helmet_shell_collar', 10, 10, 12, 14, 'M2');
  c.row('l11_helmet_shell_collar', 10, 10, ['M4', 'M3', 'M1']);
  c.row('l11_helmet_shell_collar', 10, 11, ['M3', 'M2', 'M0']);
  c.row('l11_helmet_shell_collar', 10, 12, ['M3', 'V4', 'M1']); // teal status LED
  c.row('l11_helmet_shell_collar', 10, 13, ['M2', 'V2', 'M0']);
  c.row('l11_helmet_shell_collar', 10, 14, ['M1', 'M0', 'S1']);
  // Recessed chin intake port
  c.row('l11_helmet_shell_collar', 16, 16, ['M1', 'M0', 'M0']);
  // Heavy Bolted Titanium Neck Lock Collar + Visible Ribbed Oxygen Breathing Cable!
  c.fillRect('l11_helmet_shell_collar', 11, 17, 21, 18, 'M2');
  c.row('l11_helmet_shell_collar', 11, 17, ['M4', 'M4', 'M3', 'M3', 'M2', 'M2', 'M2', 'M1', 'M1', 'M1', 'M0']);
  c.row('l11_helmet_shell_collar', 11, 18, ['M2', 'M1', 'M1', 'M1', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0', 'M0']);
  // Ribbed dark breathing cable arching cleanly from backpack port into collar lock!
  c.row('l11_helmet_shell_collar', 9, 15, ['B0', 'M3', 'B0']);
  c.row('l11_helmet_shell_collar', 10, 16, ['B0', 'M2', 'B0']);
  c.castShadow('l11_helmet_shell_collar', 'l07_suit_torso_arms', 0, 1, 'S0');

  // =========================================================================
  // 12 CURVED GLASS VISOR (Brushed titanium bezel + deep spherical teal glass!)
  // =========================================================================
  // Smooth outer titanium visor bezel ellipse
  c.fillEllipse('l12_curved_glass_visor', 17.5, 12.1, 4.4, 3.5, 'M2');
  c.shadeMetalRegion('l12_curved_glass_visor', 16.5, 11.2, 4.4, 3.5, { bias: 0.08 });
  // Deep curved dark-teal spherical glass interior
  c.fillEllipse('l12_curved_glass_visor', 17.6, 12.2, 3.6, 2.7, 'V0');
  // Smooth arched sky-teal horizon reflection + razor-sharp upper-left cream specular slash
  c.row('l12_curved_glass_visor', 15, 10, ['V4', 'M5', 'V5', 'V3', 'V1']);
  c.row('l12_curved_glass_visor', 14, 11, ['M5', 'V5', 'V3', 'V3', 'V2', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 14, 12, ['V3', 'V2', 'V3', 'V3', 'V2', 'V1', 'V0']);
  c.row('l12_curved_glass_visor', 14, 13, ['V1', 'V1', 'V1', 'V1', 'V0', 'V0', 'V0']);
  c.row('l12_curved_glass_visor', 15, 14, ['V0', 'V0', 'V1', 'V2', 'V1']);

  // =========================================================================
  // 13 HANDHELD ACOUSTIC FIELD SCANNER & GLOVED RIGHT HAND
  // =========================================================================
  // Angled-upward metallic scanner neck & orange emitter housing (drawn first so gloved thumb wraps cleanly!)
  c.line('l13_handheld_scanner', 23, 24, 26, 22, 'M4');
  c.line('l13_handheld_scanner', 24, 25, 27, 23, 'M2');
  c.row('l13_handheld_scanner', 24, 23, ['M4', 'S4', 'S3']);
  // Complete 3/4 elliptical Parabolic Collector Dish (angled ~24° upward, zero clipping!)
  c.fillEllipse('l13_handheld_scanner', 27.6, 22.8, 2.6, 2.9, 'M2', undefined, -0.35);
  c.shadeMetalRegion('l13_handheld_scanner', 26.8, 21.8, 2.8, 3.0, {
    xMin: 24,
    xMax: 31,
    yMin: 19,
    yMax: 27,
    bias: 0.14,
  });
  c.fillEllipse('l13_handheld_scanner', 28.0, 22.9, 1.6, 1.9, 'V0', undefined, -0.35);
  c.row('l13_handheld_scanner', 27, 22, ['V4', 'V3']);
  c.row('l13_handheld_scanner', 27, 23, ['V3', 'M5', 'V1']); // glowing central acoustic pin!
  c.row('l13_handheld_scanner', 27, 24, ['V1', 'V2']);
  c.row('l13_handheld_scanner', 27, 20, ['M5', 'M4']);
  // Gloved right hand wrapping securely around the ergonomic pistol grip!
  c.fillRect('l13_handheld_scanner', 23, 25, 26, 27, 'B1');
  c.row('l13_handheld_scanner', 23, 24, ['B2', 'B3', 'B1']); // thumb gripping over barrel neck!
  c.row('l13_handheld_scanner', 23, 25, ['B2', 'B3', 'B2', 'B0']); // sunlit knuckles
  c.row('l13_handheld_scanner', 24, 26, ['B1', 'B2', 'B0']);
  c.row('l13_handheld_scanner', 24, 27, ['B1', 'B0', 'B0']);
  c.px('l13_handheld_scanner', 25, 28, 'B0'); // pistol grip base

  return c.toProjectDocument({
    id: 'vpf_mara_proto_32x48',
    name: 'Mara_Lin_Feasibility_Proto_32x48',
    pivot: { x: 15, y: 45 },
    styleNotes:
      'AST-001 Feasibility Study Prototype 1 (32×48 px, 2×3 tiles, 13 editable VPF layers). Independently crafted at native 32×48 resolution in VERDANT PIXEL FORGE.',
  });
}
