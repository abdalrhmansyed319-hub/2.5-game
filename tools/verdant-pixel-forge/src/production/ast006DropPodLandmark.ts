/**
 * AST-006 — Crashed ICV Meridian Drop-Pod & Camp Landmark Atlas (96x64)
 * =====================================================================
 * Final Production Artwork authored natively through VERDANT PIXEL FORGE.
 *
 * Strictly obeys docs/asset-production/ASSET_REQUESTS.md v2.0 &
 * game/world/landmarks/drop_pod_clearing.gd + drop_pod_clearing.tscn:
 *   - (0, 0, 64, 48)  : Crashed ICV Meridian Drop-Pod (pivot 32, 42 -> offset 0, -18)
 *   - (64, 0, 16, 16) : Supply Crate A (pivot 8, 14 -> offset 0, -6)
 *   - (80, 0, 16, 16) : Supply Crate B (pivot 8, 14 -> offset 0, -6)
 *   - (64, 16, 32, 32): Emergency Field Camp Tent (pivot 16, 28 -> offset 0, -12)
 *   - (0, 48, 64, 16) : Scorched Impact Skid-Furrow Ground Decal (pivot 32, 8 -> offset 0, 0)
 *   - (64, 48, 32, 16): Strictly transparent unused region!
 */

import { WorldLayerCanvas, hash2i, periodicNoise } from './worldArtCore';
import type { ProjectDocument } from '../types/studio';

const LAYERS = [
  { id: 'l01_skid_and_ground', name: '01 Skid-Furrow & Crater Rim' },
  { id: 'l02_hull_and_tent', name: '02 Ceramic Hull, Tent & Crates' },
  { id: 'l03_stripes_armor', name: '03 Meridian Stripes, Heatshield & Hardware' },
  { id: 'l04_glass_glow_details', name: '04 Viewport, Lantern Glow & Beacon' },
];

function paintCrashedDropPod(c: WorldLayerCanvas): void {
  // Region: x=0..63, y=0..47 (1px safe border inside x=1..62, y=1..46)
  const clip = { x0: 1, y0: 1, x1: 62, y1: 46 };

  // 1. Churned crater earth & scorch berm hugging lower nose/belly (y=34..45)
  c.fillEllipse('l01_skid_and_ground', 29, 40.5, 25, 5.2, 'CHR1', 210, clip);
  c.fillEllipse('l01_skid_and_ground', 26, 41.2, 19, 3.8, 'CHR0', 225, clip);
  // Upthrown warm earthen berm hugging front-left buried nose!
  c.paintShadedBlob('l01_skid_and_ground', 14, 39.5, 8.5, 3.6, ['CHR0', 'SND0', 'SND1', 'SND2', 'SND3'], 301, clip);
  c.paintShadedBlob('l01_skid_and_ground', 26, 42.5, 11.0, 2.8, ['CHR0', 'SND0', 'SND1', 'SND2'], 307, clip);
  c.paintShadedBlob('l01_skid_and_ground', 43, 39.5, 7.5, 3.0, ['CHR0', 'SND0', 'SND1', 'SND2'], 313, clip);

  // 2. Sculpted 3/4 oblique tilted conical-cylindrical orbital drop-pod fuselage!
  // Nose buried lower-left at (13, 35) -> aft retro-thruster ring raised upper-right at (51, 20)!
  const ax0 = 13.0;
  const ay0 = 35.5;
  const ax1 = 52.0;
  const ay1 = 20.5;
  const dx = ax1 - ax0;
  const dy = ay1 - ay0;
  const axisLen = Math.hypot(dx, dy);
  const ux = dx / axisLen;
  const uy = dy / axisLen;
  // Normal pointing upper-left (perpendicular to pod axis)
  const nxU = uy;
  const nyU = -ux;

  for (let y = 6; y <= 43; y++) {
    for (let x = 5; x <= 60; x++) {
      // Project (x,y) onto pod local coordinates: t in [0..1] nose->tail, r perpendicular
      const rx = x - ax0;
      const ry = y - ay0;
      const proj = rx * ux + ry * uy;
      const perp = rx * nxU + ry * nyU; // negative = upper-left dorsal roof, positive = lower-right belly
      const t = proj / axisLen;

      if (t < -0.08 || t > 1.04) continue;

      // Sculpted aerodynamic capsule radius profile along length t:
      // Rounded heatshield nose -> flared crew cabin mid-section -> tapered retro-thruster tail!
      let rad: number;
      if (t < 0) {
        const nt = Math.max(0, 1 + t / 0.08);
        rad = 6.2 * Math.sqrt(nt);
      } else if (t < 0.25) {
        rad = 6.2 + (t / 0.25) * 5.8;
      } else if (t < 0.72) {
        rad = 12.0 + Math.sin(((t - 0.25) / 0.47) * Math.PI) * 1.4;
      } else {
        const tt = (t - 0.72) / 0.32;
        rad = 12.0 * (1 - tt * 0.36);
      }

      // Slightly bury bottom-left heatshield into crater rim so it sits deeply embedded in soil!
      if (y > 41 && t < 0.35) continue;
      if (Math.abs(perp) > rad) continue;

      const nr = perp / rad; // -1 (top sunlit dorsal ridge) .. +1 (bottom shadowed hull)
      const isOutline = Math.abs(nr) > 0.90 || t < -0.05 || t > 1.00;

      // Atmospheric re-entry scorch streaks trailing from the burnt nose along underside!
      const scorchNoise = periodicNoise(x, y, 3, 8, 509);
      const isScorched = (t < 0.16 && scorchNoise > 0.22) || (nr > 0.35 && t < 0.55 && scorchNoise > 0.45);
      // Structural panel seam rings at t = 0.22, 0.56, 0.80
      const isPanelRing =
        Math.abs(t - 0.22) < 0.018 ||
        Math.abs(t - 0.56) < 0.018 ||
        Math.abs(t - 0.80) < 0.018;
      // Iconic ICV Meridian burnt-orange safety chevron stripe!
      const isMeridianStripe = t >= 0.30 && t <= 0.43 && Math.abs(nr) < 0.88;
      // Dark ablative titanium heatshield collar at nose & retro-ring at aft!
      const isHeatshield = t < 0.17;
      const isAftRing = t > 0.82;

      // Cylindrical upper-left lighting across dorsal curve (`nr` negative = sunlit!)
      const light = -nr * 0.65 - (t - 0.35) * 0.12 + (scorchNoise - 0.5) * 0.14;

      if (isOutline) {
        c.px('l02_hull_and_tent', x, y, nr < -0.2 ? 'HUL1' : 'TIT0');
        continue;
      }

      if (isHeatshield) {
        let tok = 'TIT2';
        if (light > 0.32) tok = 'TIT3';
        else if (light < -0.15) tok = 'CHR0';
        else if (light < 0.08) tok = 'TIT1';
        c.px('l03_stripes_armor', x, y, tok);
      } else if (isAftRing) {
        let tok = 'TIT2';
        if (light > 0.38) tok = 'TIT4';
        else if (light > 0.12) tok = 'TIT3';
        else if (light < -0.22) tok = 'TIT0';
        else if (light < 0.0) tok = 'TIT1';
        c.px('l03_stripes_armor', x, y, tok);
      } else if (isMeridianStripe) {
        let tok = 'ORG2';
        if (light > 0.35) tok = 'ORG3';
        else if (light < -0.18) tok = 'ORG0';
        else if (light < 0.05) tok = 'ORG1';
        if (isScorched) tok = 'ORG0';
        c.px('l03_stripes_armor', x, y, tok);
      } else {
        // Ceramic ivory-white thermal hull tiles!
        let tok = 'HUL3';
        if (isPanelRing) {
          tok = light > 0.15 ? 'HUL2' : 'HUL0';
        } else if (isScorched) {
          tok = light > 0.1 ? 'HUL1' : 'CHR1';
        } else if (light > 0.44) {
          tok = 'HUL5';
        } else if (light > 0.22) {
          tok = 'HUL4';
        } else if (light > -0.02) {
          tok = 'HUL3';
        } else if (light > -0.24) {
          tok = 'HUL2';
        } else {
          tok = 'HUL1';
        }
        c.px('l02_hull_and_tent', x, y, tok);
      }
    }
  }

  // 3. Twin Aft Retro-Thruster Nozzles protruding from upper-right tail (x=52..60, y=14..26)
  const nozzles: Array<[number, number]> = [
    [55, 16],
    [57, 23],
  ];
  for (const [nx, ny] of nozzles) {
    c.fillEllipse('l03_stripes_armor', nx, ny, 3.2, 2.5, 'TIT1', undefined, clip);
    c.fillEllipse('l03_stripes_armor', nx - 0.5, ny - 0.5, 2.4, 1.8, 'TIT3', undefined, clip);
    c.fillEllipse('l03_stripes_armor', nx + 0.8, ny + 0.3, 1.6, 1.4, 'CHR0', undefined, clip);
    c.px('l03_stripes_armor', nx - 1, ny - 2, 'TIT4');
  }

  // 4. Solid aerodynamic orange stabilizer fin (pixel-tight, zero diagonal gaps!) + Bent Telemetry Mast!
  for (let y = 10; y <= 17; y++) {
    const xStart = Math.round(48 - (y - 10) * 1.15);
    const xEnd = Math.round(52 + (y - 10) * 0.65);
    for (let x = xStart; x <= xEnd; x++) {
      if (x < 41 || x > 55) continue;
      let tok = 'ORG2';
      if (y === 10 || x === xStart) tok = 'ORG3';
      else if (x === xEnd || y === 17) tok = 'ORG0';
      else if (y > 14) tok = 'ORG1';
      c.px('l03_stripes_armor', x, y, tok);
    }
  }
  c.line('l03_stripes_armor', 42, 15, 49, 10, 'HUL4');
  // Telemetry mast rising cleanly to y=3..14 with crisp cyan-emerald live distress beacon!
  c.line('l03_stripes_armor', 39, 14, 37, 5, 'TIT2');
  c.line('l03_stripes_armor', 38, 14, 36, 5, 'TIT4');
  // Small bent parabolic dish at (35, 7)
  c.fillEllipse('l03_stripes_armor', 34.5, 7.5, 2.6, 2.0, 'HUL3', undefined, clip);
  c.px('l03_stripes_armor', 33, 6, 'HUL5');
  c.px('l03_stripes_armor', 35, 8, 'TIT1');
  // Glowing green-teal emergency telemetry beacon LED at tip (36, 4)
  c.fillEllipse('l04_glass_glow_details', 36.5, 4.5, 2.0, 2.0, 'LNS1', 120, clip);
  c.px('l04_glass_glow_details', 36, 4, 'LNS3');
  c.px('l04_glass_glow_details', 37, 4, 'LNS2');

  // 5. Recessed Armored Cockpit Viewport (upper-mid cabin) + Ajar Side Escape Hatch with warm amber cabin glow!
  // Viewport bezel (x=21..30, y=22..29)
  c.fillEllipse('l03_stripes_armor', 26, 25.5, 4.8, 3.4, 'TIT0', undefined, clip);
  c.fillEllipse('l04_glass_glow_details', 26, 25.5, 3.8, 2.6, 'GLS0', undefined, clip);
  c.fillEllipse('l04_glass_glow_details', 25.4, 24.8, 2.8, 1.9, 'GLS1', undefined, clip);
  c.line('l04_glass_glow_details', 23, 24, 26, 23, 'GLS2');
  c.px('l04_glass_glow_details', 24, 24, 'HUL5'); // crisp specular glass glint!

  // Ajar hydraulic escape hatch on lower-mid side (x=34..42, y=26..35) spilling warm amber cabin console light!
  c.fillRect('l03_stripes_armor', 34, 26, 8, 9, 'TIT0');
  c.fillRect('l04_glass_glow_details', 35, 27, 6, 7, 'CHR0');
  // Warm amber cabin diagnostic light inside doorway
  c.fillRect('l04_glass_glow_details', 36, 29, 3, 4, 'KLP3');
  c.px('l04_glass_glow_details', 37, 30, 'KLP5');
  c.px('l04_glass_glow_details', 38, 28, 'LNS2'); // tiny teal console LED inside!
  // Swung-open armored hatch door slab angled right of doorway
  c.fillRect('l03_stripes_armor', 42, 26, 3, 9, 'HUL2');
  c.line('l03_stripes_armor', 42, 26, 42, 34, 'HUL4');
  c.line('l03_stripes_armor', 44, 26, 44, 34, 'TIT0');

  // 6. Tiny coastal moss & grass blades already hugging the lower crater berm for grounded world integration!
  const tufts: Array<[number, number, string]> = [
    [11, 41, 'MOS5'], [12, 40, 'MOS6'], [19, 43, 'MOS5'], [20, 42, 'MOS7'],
    [39, 41, 'MOS5'], [40, 40, 'MOS6'], [47, 39, 'MOS4'],
  ];
  for (const [tx, ty, tok] of tufts) {
    c.px('l04_glass_glow_details', tx, ty, tok);
  }
}

function paintSupplyCrateA(c: WorldLayerCanvas): void {
  // Region: x=64..79, y=0..15 (pivot 8,14 -> box base at y=13..14)
  const ox = 64;
  const oy = 0;
  // Grounded drop shadow rim
  c.fillRect('l01_skid_and_ground', ox + 2, oy + 13, 12, 2, 'CHR0', 180);

  // 3/4 oblique top face (y=3..7) + front face (y=8..13)
  c.fillRect('l02_hull_and_tent', ox + 2, oy + 3, 12, 11, 'TIT0'); // crisp border
  // Sunlit metallic titanium beveled lid
  c.fillRect('l02_hull_and_tent', ox + 3, oy + 4, 10, 3, 'TIT3');
  c.line('l02_hull_and_tent', ox + 3, oy + 4, ox + 12, oy + 4, 'TIT4');
  c.line('l02_hull_and_tent', ox + 4, oy + 5, ox + 11, oy + 5, 'HUL4');
  // Front wall with Meridian burnt-orange cargo band + twin steel latches!
  c.fillRect('l02_hull_and_tent', ox + 3, oy + 8, 10, 5, 'TIT2');
  c.fillRect('l03_stripes_armor', ox + 3, oy + 9, 10, 2, 'ORG2');
  c.line('l03_stripes_armor', ox + 3, oy + 9, ox + 8, oy + 9, 'ORG3');
  c.line('l03_stripes_armor', ox + 10, oy + 10, ox + 12, oy + 10, 'ORG1');
  // Corner reinforcement bumpers & crisp chrome latches
  c.px('l03_stripes_armor', ox + 3, oy + 12, 'TIT1');
  c.px('l03_stripes_armor', ox + 12, oy + 12, 'TIT1');
  c.px('l04_glass_glow_details', ox + 5, oy + 7, 'HUL5');
  c.px('l04_glass_glow_details', ox + 10, oy + 7, 'HUL5');
  c.px('l04_glass_glow_details', ox + 5, oy + 8, 'TIT0');
  c.px('l04_glass_glow_details', ox + 10, oy + 8, 'TIT0');
}

function paintSupplyCrateB(c: WorldLayerCanvas): void {
  // Region: x=80..95, y=0..15 (pivot 8,14) — White Ceramic Bio-Specimen Case with Glowing Sample Vials!
  const ox = 80;
  const oy = 0;
  c.fillRect('l01_skid_and_ground', ox + 2, oy + 13, 12, 2, 'CHR0', 180);

  // Open angled white polymer lid tilted slightly back (y=2..6)
  c.fillRect('l02_hull_and_tent', ox + 3, oy + 2, 10, 5, 'HUL1');
  c.fillRect('l02_hull_and_tent', ox + 4, oy + 3, 8, 3, 'HUL4');
  c.line('l02_hull_and_tent', ox + 4, oy + 3, ox + 10, oy + 3, 'HUL5');

  // Lower waterproof case body (y=6..13)
  c.fillRect('l02_hull_and_tent', ox + 2, oy + 6, 12, 8, 'TIT0');
  c.fillRect('l02_hull_and_tent', ox + 3, oy + 7, 10, 6, 'HUL3');
  c.line('l02_hull_and_tent', ox + 3, oy + 7, ox + 12, oy + 7, 'HUL5');
  c.fillRect('l02_hull_and_tent', ox + 3, oy + 11, 10, 2, 'HUL2');

  // Dark interior foam cavity + twin glowing turquoise bio-sample vials peeking out!
  c.fillRect('l03_stripes_armor', ox + 4, oy + 5, 8, 2, 'CHR0');
  c.px('l04_glass_glow_details', ox + 5, oy + 5, 'LNS2');
  c.px('l04_glass_glow_details', ox + 5, oy + 6, 'LNS3');
  c.px('l04_glass_glow_details', ox + 8, oy + 5, 'KLP4');
  c.px('l04_glass_glow_details', ox + 8, oy + 6, 'KLP5');
  c.px('l04_glass_glow_details', ox + 10, oy + 5, 'LNS2');
  // Front handle & orange expedition seal
  c.fillRect('l03_stripes_armor', ox + 6, oy + 9, 4, 2, 'ORG2');
  c.px('l03_stripes_armor', ox + 6, oy + 9, 'ORG3');
}

function paintEmergencyFieldTent(c: WorldLayerCanvas): void {
  // Region: x=64..95, y=16..47 (32x32 cell, pivot 16,28 -> tent footprint sits cleanly y=20..44!)
  const ox = 64;
  const oy = 16;
  const clip = { x0: ox + 1, y0: oy + 2, x1: ox + 30, y1: oy + 30 };

  // Groundsheet mat & corner stakes with taut guy-lines!
  c.fillEllipse('l01_skid_and_ground', ox + 16, oy + 27, 13.5, 4.2, 'CHR1', 165, clip);
  c.line('l01_skid_and_ground', ox + 5, oy + 24, ox + 2, oy + 28, 'HUL2'); // left guy-line
  c.line('l01_skid_and_ground', ox + 27, oy + 24, ox + 30, oy + 28, 'HUL1'); // right guy-line
  c.px('l03_stripes_armor', ox + 2, oy + 28, 'TIT4'); // metal tent stake L
  c.px('l03_stripes_armor', ox + 30, oy + 28, 'TIT2'); // metal tent stake R

  // Sculpted 3/4 oblique geodesic dome-ridge expedition tent!
  // Warm weathered ochre-tan canvas body (`TNT0`..`TNT4`) topped with Meridian safety-orange rainfly (`ORG0`..`ORG3`)!
  for (let ly = 7; ly <= 27; ly++) {
    const t = (ly - 7) / 20; // 0 apex -> 1 ground skirt
    // Smooth aerodynamic dome arch widening gracefully to the ground!
    const halfW = Math.round(3 + Math.sin(Math.pow(t, 0.72) * (Math.PI * 0.56)) * 11.2);
    const cx = 16;

    for (let lx = cx - halfW; lx <= cx + halfW; lx++) {
      const nx = (lx - cx) / Math.max(1, halfW); // -1 left sunlit .. +1 right shaded
      const isEdge = Math.abs(lx - cx) >= halfW - 0.5 || ly === 7 || ly === 27;
      const isRainfly = ly <= 15 + Math.round(Math.abs(nx) * 2.5);
      const isRib = Math.abs(nx) < 0.09 || Math.abs(Math.abs(nx) - 0.58) < 0.08;

      if (isEdge) {
        c.px('l02_hull_and_tent', ox + lx, oy + ly, nx < 0 ? 'TNT1' : 'TNT0');
        continue;
      }

      const fold = Math.sin(nx * 5.2 + ly * 0.35) * 0.08;
      const l = -nx * 0.58 - t * 0.16 + fold;

      if (isRainfly) {
        // Burnt-orange aerodynamic geodesic rainfly hood!
        let tok = 'ORG2';
        if (isRib && ly > 8) tok = 'TIT1';
        else if (l > 0.25) tok = 'ORG3';
        else if (l < -0.22) tok = 'ORG0';
        else if (l < 0.02) tok = 'ORG1';
        c.px('l03_stripes_armor', ox + lx, oy + ly, tok);
      } else {
        // Sunlit warm canvas expedition tent walls!
        let tok = 'TNT3';
        if (isRib) tok = l > 0 ? 'TIT2' : 'TIT0';
        else if (l > 0.24) tok = 'TNT4';
        else if (l > -0.04) tok = 'TNT3';
        else if (l > -0.28) tok = 'TNT2';
        else tok = 'TNT1';
        c.px('l02_hull_and_tent', ox + lx, oy + ly, tok);
      }
    }
  }

  // Arched front tent entrance doorway (`x=11..20, y=17..27`) with rolled flap & warm golden camp lantern glow inside!
  for (let ly = 18; ly <= 27; ly++) {
    const dt = (ly - 18) / 9;
    const dw = Math.round(1.5 + Math.sin(dt * Math.PI * 0.62) * 3.8);
    for (let lx = 16 - dw; lx <= 16 + dw; lx++) {
      if (lx === 16 - dw || lx === 16 + dw || ly === 18) {
        c.px('l03_stripes_armor', ox + lx, oy + ly, 'TNT0');
      } else {
        // Warm cozy amber camp lantern light softly illuminating interior tent floor!
        const distLantern = Math.hypot(lx - 15.5, ly - 23.5);
        let tok = 'CHR0';
        if (distLantern < 1.6) tok = 'SUN3';
        else if (distLantern < 3.0) tok = 'KLP4';
        else if (distLantern < 4.5) tok = 'KLP2';
        else if (ly > 24) tok = 'SND0';
        c.px('l04_glass_glow_details', ox + lx, oy + ly, tok);
      }
    }
  }
  // Rolled-up canvas flap tied neatly to upper-left of doorway + tiny hanging lantern hook!
  c.line('l03_stripes_armor', ox + 11, oy + 19, ox + 10, oy + 25, 'TNT4');
  c.line('l03_stripes_armor', ox + 10, oy + 19, ox + 9, oy + 25, 'TNT2');
  c.px('l04_glass_glow_details', ox + 15, oy + 23, 'SUN4'); // lantern core spark!
}

function paintScorchedSkidFurrow(c: WorldLayerCanvas): void {
  // Region: x=0..63, y=48..63 (64x16 ground decal, pivot 32,8 — tapered impact gouge!)
  const ox = 0;
  const oy = 48;

  for (let ly = 1; ly < 15; ly++) {
    for (let lx = 2; lx < 62; lx++) {
      // Tapered curved re-entry skid channel: deep & wide on left impact head -> feathered tail on right!
      const t = (lx - 2) / 59; // 0 left head .. 1 right trail tail
      const centerY = 7.5 + Math.sin(t * Math.PI * 1.4) * 1.3;
      // Round BOTH left crater-entry head AND right feathered tail smoothly (zero blunt rectangular left cut!)
      const headRound = t < 0.14 ? Math.sqrt(t / 0.14) : 1.0;
      const tailFade = 1 - Math.pow(t, 1.35) * 0.72;
      const halfH = headRound * tailFade * 5.2 + Math.sin(lx * 0.45) * 0.6;
      const dy = Math.abs(ly - centerY);
      const n = periodicNoise(lx, ly, 3, 8, 977);
      const eff = dy / Math.max(1.2, halfH) + (n - 0.5) * 0.35;

      if (eff > 1.05) continue;

      if (eff < 0.42) {
        // Deep carbonized scorch trough center!
        const a = Math.round((1 - t * 0.45) * 235);
        c.px('l01_skid_and_ground', ox + lx, oy + ly, n > 0.68 ? 'CHR1' : 'CHR0', a);
      } else if (eff < 0.72) {
        // Soot-streaked upturned soil banks
        const a = Math.round((1 - t * 0.55) * 205);
        c.px('l01_skid_and_ground', ox + lx, oy + ly, ly < centerY ? 'SND1' : 'SND0', a);
      } else {
        // Softly feathered outer churned dirt rim (melts cleanly onto sand OR moss!)
        const a = Math.round((1 - t * 0.65) * 135);
        c.px('l01_skid_and_ground', ox + lx, oy + ly, ly < centerY ? 'SND2' : 'CHR1', a);
      }
    }
  }

  // Tiny scattered cooling re-entry metallic flecks & warm ash specks inside skid!
  for (let i = 0; i < 10; i++) {
    const sx = 8 + Math.floor(hash2i(i, 1, 991) * 44);
    const sy = 5 + Math.floor(hash2i(i, 2, 997) * 6);
    c.px('l04_glass_glow_details', ox + sx, oy + sy, i % 3 === 0 ? 'ORG2' : 'TIT2', 190);
  }
}

export function buildAst006DropPodLandmark(): { canvas: WorldLayerCanvas; doc: ProjectDocument } {
  const c = new WorldLayerCanvas(96, 64, LAYERS);

  paintCrashedDropPod(c);
  paintSupplyCrateA(c);
  paintSupplyCrateB(c);
  paintEmergencyFieldTent(c);
  paintScorchedSkidFurrow(c);
  // Region (64, 48, 32, 16) remains strictly transparent (alpha=0)!

  const doc = c.toProjectDocument({
    id: 'ast006-drop-pod-landmark',
    name: 'AST-006: Crashed ICV Meridian Drop-Pod & Camp Atlas (96x64)',
    pivot: { x: 32, y: 42 },
    tileSize: 16,
    styleNotes:
      'Final production AST-006 hero landmark atlas: 64x48 tilted crashed ICV Meridian drop-pod with scorched heatshield, viewport, ajar glowing hatch & comm beacon; 16x16 Supply Crates A & B; 32x32 geodesic camp tent with lantern glow; 64x16 feathered scorched skid-furrow decal; (64,48,32,16) strictly transparent.',
  });

  return { canvas: c, doc };
}
