import { type RGB, type SpriteBitmap, hexToRgb } from './v90PaletteAndExtractor';

function setPx(bmp: SpriteBitmap, x: number, y: number, c: RGB, a = 255): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= bmp.w || iy < 0 || iy >= bmp.h) return;
  const o = (iy * bmp.w + ix) * 4;
  bmp.rgba[o] = c.r;
  bmp.rgba[o + 1] = c.g;
  bmp.rgba[o + 2] = c.b;
  bmp.rgba[o + 3] = a;
}

function addOutline(bmp: SpriteBitmap, x0: number, y0: number, cw: number, ch: number, ink: RGB): void {
  const snap = new Uint8Array(cw * ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      snap[y * cw + x] = bmp.rgba[((y0 + y) * bmp.w + (x0 + x)) * 4 + 3] >= 128 ? 1 : 0;
    }
  }
  for (let y = 1; y < ch - 1; y++) {
    for (let x = 1; x < cw - 1; x++) {
      if (snap[y * cw + x]) continue;
      if (
        snap[y * cw + (x - 1)] ||
        snap[y * cw + (x + 1)] ||
        snap[(y - 1) * cw + x] ||
        snap[(y + 1) * cw + x]
      ) {
        setPx(bmp, x0 + x, y0 + y, ink);
      }
    }
  }
}

function drawCurvedBlade(
  bmp: SpriteBitmap,
  bx: number,
  by: number,
  h: number,
  lean: number,
  cBase: RGB,
  cMid: RGB,
  cTip: RGB,
  thick = false
): void {
  const steps = Math.max(4, Math.ceil(h * 1.5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = bx + lean * t * t;
    const y = by - h * t;
    const c = t < 0.35 ? cBase : t < 0.78 ? cMid : cTip;
    setPx(bmp, x, y, c);
    if (thick && t < 0.65) {
      setPx(bmp, x + 1, y, t < 0.3 ? cBase : cMid);
    }
  }
}

/**
 * Handcrafted 6-frame x 8-species Coastal Living Grass, Kelp, Blossom & Ecotone Atlas (144x192)
 * Frames 0..3 = asynchronous ocean breeze (idle, gentle sway, strong coastal gust, flutter)
 * Frames 4..5 = player footstep compression left & right (ZERO geometric skewing!)
 */
export function buildCoastalLivingGrassAtlas(): SpriteBitmap {
  const cw = 24;
  const ch = 24;
  const bmp: SpriteBitmap = { w: cw * 6, h: ch * 8, rgba: new Uint8Array(cw * 6 * ch * 8 * 4) };

  const ink = hexToRgb('#1e0c1c');
  const g0 = hexToRgb('#162922');
  const g1 = hexToRgb('#234232');
  const g2 = hexToRgb('#335c3e');
  const g3 = hexToRgb('#497b49');
  const g4 = hexToRgb('#679c52');
  const g5 = hexToRgb('#8db95e');
  const g6 = hexToRgb('#b8d372');
  const sage = hexToRgb('#4c7b72');
  const sandTip = hexToRgb('#e0c592');
  const sandMid = hexToRgb('#ba9666');
  const amberDark = hexToRgb('#8a3524');
  const amberMid = hexToRgb('#d67831');
  const amberHi = hexToRgb('#f2b25f');
  const amberCore = hexToRgb('#fce09b');
  const tealDark = hexToRgb('#235066');
  const tealMid = hexToRgb('#58c9c8');
  const tealHi = hexToRgb('#8cf2ea');
  const ivory = hexToRgb('#eff2e5');

  const frameLeans = [0.0, 2.2, 4.8, -1.8, -6.2, 6.2];
  const frameScaleH = [1.0, 0.96, 0.85, 0.98, 0.56, 0.56];

  for (let row = 0; row < 8; row++) {
    for (let f = 0; f < 6; f++) {
      const ox = f * cw;
      const oy = row * ch;
      const cx = ox + 12;
      const by = oy + 20;
      const wind = frameLeans[f];
      const hs = frameScaleH[f];

      // Grounded shaded botanical base pad (prevents floating hairs!)
      for (let dx = -4; dx <= 4; dx++) {
        setPx(bmp, cx + dx, by, row === 5 ? amberDark : g0);
        if (Math.abs(dx) <= 3) setPx(bmp, cx + dx, by - 1, row === 5 ? amberDark : g1);
      }

      if (row === 0) {
        // Golden Wind-Bent Coastal Sea-Oats (dunes)
        const blades = [
          [-5, 8, -4.5], [-3, 12, -2.5], [-1, 14, 0.6], [1, 13, 2.2], [3, 11, 4.2], [5, 7, 5.4],
        ];
        for (const [dx, bh, bl] of blades) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind, g2, sandMid, sandTip);
          if (bh >= 11) {
            const tx = cx + dx + (bl + wind);
            const ty = by - 1 - bh * hs;
            setPx(bmp, tx, ty, ivory);
            setPx(bmp, tx + (wind >= 0 ? 1 : -1), ty + 1, sandTip);
          }
        }
      } else if (row === 1) {
        // Silvery-Sage Salt-Sedge Fans (mid-beach)
        const blades = [
          [-5, 7, -4.8], [-3, 10, -2.4], [0, 11, 0.4], [2, 10, 2.8], [5, 7, 5.2],
        ];
        for (const [dx, bh, bl] of blades) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind * 0.9, g1, sage, tealHi, true);
        }
      } else if (row === 2) {
        // Emerald Coastal Bunch-Grass (vegetation belt)
        const blades = [
          [-6, 7, -5.0], [-4, 11, -3.0], [-1, 13, -0.6], [1, 13, 1.4], [4, 10, 3.6], [6, 7, 5.4],
        ];
        for (const [dx, bh, bl] of blades) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind, g1, g3, g6, Math.abs(dx) <= 2);
        }
      } else if (row === 3) {
        // Luminous Cyan-Tipped Tide-Blossom Clump
        const blades = [[-4, 8, -3.5], [-2, 11, -1.5], [1, 12, 1.2], [4, 9, 3.8]];
        for (const [dx, bh, bl] of blades) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind * 0.85, g1, g3, g5);
        }
        const bx1 = cx - 2 + (-1.5 + wind * 0.85);
        const by1 = by - 1 - 11 * hs;
        const bx2 = cx + 2 + (1.8 + wind * 0.85);
        const by2 = by - 1 - 10 * hs;
        for (const [fx, fy] of [[bx1, by1], [bx2, by2]]) {
          setPx(bmp, fx, fy - 1, tealHi);
          setPx(bmp, fx - 1, fy, tealMid);
          setPx(bmp, fx + 1, fy, tealMid);
          setPx(bmp, fx, fy, ivory);
        }
      } else if (row === 4) {
        // Fleshy Jade-Teal Coastal Succulent Sprig
        const petals = [[-4, 6, -4.5], [-2, 9, -2.0], [0, 10, 0.3], [2, 9, 2.3], [4, 6, 4.5]];
        for (const [dx, bh, bl] of petals) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind * 0.45, tealDark, sage, tealHi, true);
          setPx(bmp, cx + dx + bl + wind * 0.45, by - 1 - bh * hs, amberHi);
        }
      } else if (row === 5) {
        // Golden Amber Tide-Kelp Ribbon Frond (swaying in shallow tidepools!)
        const ribbons = [[-4, 9, -3.2], [-1, 13, 0.8], [2, 11, 3.0], [5, 8, 4.5]];
        for (const [dx, bh, bl] of ribbons) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind * 1.05, amberDark, amberMid, amberHi, true);
        }
        // Luminous honey gas-bladders
        const gx = cx - 1 + (0.8 + wind * 1.05) * 0.8;
        const gy = by - 1 - 10 * hs;
        setPx(bmp, gx, gy, amberCore);
        setPx(bmp, gx + 1, gy, amberHi);
        setPx(bmp, gx, gy + 1, amberHi);
        setPx(bmp, gx + 3, gy + 2, amberCore);
      } else if (row === 6) {
        // Rock-Crevice Fern & Coastal Moss Wrap (embeds basalt bases!)
        const fronds = [[-6, 6, -5.5], [-3, 9, -3.0], [0, 10, 0.4], [3, 9, 3.4], [6, 6, 5.8]];
        for (const [dx, bh, bl] of fronds) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind * 0.7, g0, g2, g5, true);
        }
      } else {
        // Inland Ecotone Meadow Grass (seamlessly matches V8.0 forest floor!)
        const blades = [[-5, 8, -4.4], [-3, 12, -2.0], [0, 13, 0.4], [3, 11, 2.8], [5, 8, 4.8]];
        for (const [dx, bh, bl] of blades) {
          drawCurvedBlade(bmp, cx + dx, by - 1, bh * hs, bl + wind, g1, g4, g6, Math.abs(dx) <= 2);
        }
      }
      // Crisp micro-outline on bottom shadow edge only so tufts stay lush & soft
      setPx(bmp, cx - 3, by + 1, ink, 160);
      setPx(bmp, cx, by + 1, ink, 175);
      setPx(bmp, cx + 3, by + 1, ink, 160);
    }
  }
  return bmp;
}

/**
 * Handcrafted 4-Frame Animated Amber Tide-Kelp Cluster (192x40, 48x40 per frame)
 */
export function buildAmberTideKelpSheet(): SpriteBitmap {
  const cw = 48;
  const ch = 40;
  const bmp: SpriteBitmap = { w: cw * 4, h: ch, rgba: new Uint8Array(cw * 4 * ch * 4) };
  const ink = hexToRgb('#1e0c1c');
  const rockD = hexToRgb('#242a38');
  const rockM = hexToRgb('#4d5c6c');
  const k0 = hexToRgb('#67272d');
  const k1 = hexToRgb('#a44522');
  const k2 = hexToRgb('#d67831');
  const k3 = hexToRgb('#f2b25f');
  const k4 = hexToRgb('#fce09b');
  const ivory = hexToRgb('#eff2e5');

  const sways = [0, 2.4, 0.5, -2.2];
  for (let f = 0; f < 4; f++) {
    const ox = f * cw;
    const cx = ox + 24;
    const by = 33;
    const sw = sways[f];

    // Dark rocky holdfast base
    for (let dy = -3; dy <= 2; dy++) {
      for (let dx = -10; dx <= 10; dx++) {
        if ((dx * dx) / 100 + (dy * dy) / 9 <= 1) {
          setPx(bmp, cx + dx, by + dy, dy < 0 ? rockM : rockD);
        }
      }
    }

    // 7 flowing glossy amber kelp ribbons
    const fronds = [
      [-8, 15, -7.5], [-5, 22, -4.5], [-2, 26, -1.0], [1, 25, 2.5], [4, 21, 5.5], [7, 16, 8.2], [0, 18, 0.5],
    ];
    for (const [dx, bh, bl] of fronds) {
      drawCurvedBlade(bmp, cx + dx, by - 1, bh, bl + sw, k0, k1, k2, true);
      drawCurvedBlade(bmp, cx + dx + 1, by - 1, bh - 1, bl + sw * 0.9, k1, k2, k3, false);
    }

    // 4 luminous honey-gold gas bladders cradling bright specular glints!
    const bladders = [
      [cx - 8 + sw * 0.7, by - 14, 3],
      [cx - 2 + sw * 0.9, by - 22, 4],
      [cx + 6 + sw * 0.85, by - 19, 3],
      [cx + 10 + sw * 0.6, by - 12, 3],
    ];
    for (const [bx, bby, br] of bladders) {
      for (let dy = -br; dy <= br; dy++) {
        for (let dx = -br; dx <= br; dx++) {
          const d2 = dx * dx + dy * dy;
          if (d2 <= br * br) {
            const col = d2 <= 2 && dx <= 0 && dy <= 0 ? ivory : dy < 0 ? k4 : dy === 0 ? k3 : k2;
            setPx(bmp, bx + dx, bby + dy, col);
          }
        }
      }
    }
    addOutline(bmp, ox, 0, cw, ch, ink);
  }
  return bmp;
}

/**
 * Handcrafted 8-Frame Seamless Animated Surf Foam & Rock Wave-Break Atlas
 * Row 0 (64x24 x 8f): Rolling advancing/retreating shoreline foam crest
 * Row 1 (64x24 x 8f): Breaking ocean spray & white foam collar wrapping sea stacks & coastal boulders
 */
export function buildOceanFoamAndBreakAtlas(): SpriteBitmap {
  const cw = 64;
  const ch = 24;
  const bmp: SpriteBitmap = { w: cw * 8, h: ch * 2, rgba: new Uint8Array(cw * 8 * ch * 2 * 4) };
  const foamHi = hexToRgb('#eff2e5');
  const foamMid = hexToRgb('#cfece2');
  const foamSoft = hexToRgb('#7ec7ad');
  const shallow = hexToRgb('#56b2a6');

  for (let f = 0; f < 8; f++) {
    const phase = (f / 8) * Math.PI * 2;
    const ox = f * cw;

    // Row 0: Organic lacy surf-crest wave advancing & retreating seamlessly
    const surgeY = Math.round(Math.sin(phase) * 3.2);
    for (let x = 2; x < cw - 2; x++) {
      const u = (x - 2) / (cw - 5);
      const edgeFade = Math.sin(u * Math.PI);
      if (edgeFade < 0.14) continue;
      const curve = Math.sin(u * Math.PI * 2.4 + phase) * 2.2 + Math.cos(u * Math.PI * 5.0 - phase * 0.5) * 1.1;
      const cy = 11 + surgeY + curve;
      const thick = Math.max(1, Math.round(edgeFade * (2.6 + Math.sin(phase + u * 4.0) * 0.9)));
      for (let dy = -thick; dy <= thick + 1; dy++) {
        const py = Math.round(cy + dy);
        if (py < 1 || py >= ch - 1) continue;
        // Organic lacy holes inside trailing foam
        if (dy > 0 && ((x * 7 + py * 13 + f * 3) % 5 === 0)) continue;
        const c = dy <= -thick + 1 ? foamHi : dy <= 0 ? foamMid : dy === 1 ? foamSoft : shallow;
        setPx(bmp, ox + x, py, c, dy > 1 ? 165 : 235);
      }
    }

    // Row 1: Elliptical rock-collar wave break + animated upward sea-spray droplets
    const ry = ch;
    const expand = 0.78 + 0.22 * Math.sin(phase);
    const rx = 25 * expand;
    const rry = 7.5 * expand;
    for (let a = 0; a < 96; a++) {
      const ang = (a / 96) * Math.PI * 2;
      // Stronger breaking foam on seaward (south, sin > 0) half!
      const seaward = Math.sin(ang) > -0.25 ? 1 : 0.45;
      const wobble = 1 + 0.14 * Math.sin(ang * 5 + phase);
      const px = Math.round(ox + 32 + Math.cos(ang) * rx * wobble);
      const py = Math.round(ry + 13 + Math.sin(ang) * rry * wobble);
      setPx(bmp, px, py, seaward > 0.8 ? foamHi : foamMid, 230);
      if (seaward > 0.8) {
        setPx(bmp, px, py + 1, foamSoft, 180);
      }
    }
    // Animated sea-spray droplets arcing off the seaward side of the rock!
    for (let s = 0; s < 5; s++) {
      const sp = ((f / 8) + s * 0.21) % 1;
      const sx = ox + 16 + s * 8 + Math.sin(s * 2.1) * 4;
      const sy = ry + 15 - Math.sin(sp * Math.PI) * 9.5;
      setPx(bmp, sx, sy, sp < 0.55 ? foamHi : foamMid, Math.round((1 - sp * 0.6) * 235));
    }
  }
  return bmp;
}

/**
 * Handcrafted 4-Frame x 2-Species Coastal Wildlife Atlas (96x40, 24x20 per cell)
 * Row 0: Chime-Wing Glider (fa_03) — graceful alien seabird gliding over ocean & cliffs
 * Row 1: Mirror-Shell Crab (fa_02) — reflective cyan-carapace coastal tidepool crab
 */
export function buildCoastalFaunaAtlas(): SpriteBitmap {
  const cw = 24;
  const ch = 20;
  const bmp: SpriteBitmap = { w: cw * 4, h: ch * 2, rgba: new Uint8Array(cw * 4 * ch * 2 * 4) };
  const ink = hexToRgb('#1e0c1c');
  const ivory = hexToRgb('#eff2e5');
  const tealHi = hexToRgb('#8cf2ea');
  const tealMid = hexToRgb('#3c949c');
  const slate = hexToRgb('#485565');
  const terra = hexToRgb('#e69242');
  const terraDark = hexToRgb('#a44522');

  // Row 0: Chime-Wing Glider (4 wing-flap frames: high, glide, downstroke, recovery)
  const wingYs = [-4, -1, 3, 0];
  for (let f = 0; f < 4; f++) {
    const ox = f * cw;
    const cx = ox + 12;
    const cy = 10;
    const wy = wingYs[f];
    // Streamlined body & terracotta tail streamer
    for (let dx = -3; dx <= 4; dx++) {
      setPx(bmp, cx + dx, cy, dx < -1 ? terra : ivory);
      if (dx >= -1 && dx <= 2) setPx(bmp, cx + dx, cy + 1, slate);
    }
    setPx(bmp, cx - 5, cy + (f % 2), terraDark);
    setPx(bmp, cx - 4, cy, terra);
    // Swept glider wings
    for (let s = 1; s <= 8; s++) {
      const yOff = Math.round((wy * s) / 8);
      const wingCol = s < 4 ? ivory : s < 7 ? tealHi : tealMid;
      setPx(bmp, cx - s, cy - 1 + yOff, wingCol);
      setPx(bmp, cx - s, cy + yOff, tealMid);
      setPx(bmp, cx + s, cy - 1 + yOff, wingCol);
      setPx(bmp, cx + s, cy + yOff, tealMid);
    }
    addOutline(bmp, ox, 0, cw, ch, ink);
  }

  // Row 1: Mirror-Shell Crab (4 sideways skittering frames!)
  for (let f = 0; f < 4; f++) {
    const ox = f * cw;
    const cx = ox + 12;
    const cy = ch + 11;
    const legLift = f % 2 === 0 ? 0 : -1;
    // Reflective domed pearl-cyan shell
    for (let dy = -3; dy <= 2; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        if ((dx * dx) / 25 + (dy * dy) / 9 <= 1) {
          const c = dx <= -1 && dy <= -1 ? ivory : dy <= 0 ? tealHi : tealMid;
          setPx(bmp, cx + dx, cy + dy, c);
        }
      }
    }
    // Expressive amber pincers
    const pOff = f === 1 || f === 3 ? -1 : 0;
    setPx(bmp, cx - 6, cy - 1 + pOff, terra);
    setPx(bmp, cx - 7, cy - 2 + pOff, terra);
    setPx(bmp, cx + 6, cy - 1 - pOff, terra);
    setPx(bmp, cx + 7, cy - 2 - pOff, terra);
    // Tiny skittering legs
    for (const lx of [-5, -3, 3, 5]) {
      const lift = ((lx < 0 ? 0 : 1) + f) % 2 === 0 ? legLift : 0;
      setPx(bmp, cx + lx, cy + 3 + lift, terraDark);
      setPx(bmp, cx + lx + (lx < 0 ? -1 : 1), cy + 4 + lift, terraDark);
    }
    addOutline(bmp, ox, ch, cw, ch, ink);
  }
  return bmp;
}

/**
 * Handcrafted Coastal FX Decals Atlas (64x48, 16x16 per cell, 4 cols x 3 rows)
 * Row 0: Soft recessed sand footprints (left, right, wet deep, wind-faded)
 * Row 1: Shallow-water wade splash droplets (4 frames)
 * Row 2: Crash-site amber beacon flare & electrical spark burst (4 frames)
 */
export function buildCoastalFxDecalsAtlas(): SpriteBitmap {
  const cw = 16;
  const ch = 16;
  const bmp: SpriteBitmap = { w: cw * 4, h: ch * 3, rgba: new Uint8Array(cw * 4 * ch * 3 * 4) };
  const sandShadow = hexToRgb('#6b533c');
  const sandRim = hexToRgb('#eed9ad');
  const wetShadow = hexToRgb('#485565');
  const foamHi = hexToRgb('#eff2e5');
  const foamMid = hexToRgb('#8cf2ea');
  const amber = hexToRgb('#f2b25f');
  const spark = hexToRgb('#8cf2ea');
  const redBeacon = hexToRgb('#e69242');

  // Row 0: Soft recessed astronaut boot footprints in sand
  for (let f = 0; f < 4; f++) {
    const ox = f * cw + 8;
    const oy = 8;
    const col = f === 2 ? wetShadow : sandShadow;
    const alpha = f === 3 ? 115 : f === 2 ? 195 : 165;
    const shiftX = f === 0 ? -2 : f === 1 ? 2 : 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if ((dx * dx) / 9 + (dy * dy) / 4 <= 1) {
          setPx(bmp, ox + shiftX + dx, oy + dy, col, alpha);
        }
      }
    }
    if (f !== 3) {
      setPx(bmp, ox + shiftX - 2, oy + 2, sandRim, 130);
      setPx(bmp, ox + shiftX + 2, oy + 2, sandRim, 130);
    }
  }

  // Row 1: 4-frame shallow water wade splash
  for (let f = 0; f < 4; f++) {
    const ox = f * cw + 8;
    const oy = ch + 9;
    const r = 3 + f * 2;
    for (let a = 0; a < 20; a++) {
      const ang = (a / 20) * Math.PI * 2;
      const px = ox + Math.cos(ang) * r;
      const py = oy + Math.sin(ang) * (r * 0.48);
      setPx(bmp, px, py, f < 2 ? foamHi : foamMid, Math.max(60, 230 - f * 48));
    }
    if (f < 3) {
      setPx(bmp, ox - 3 - f, oy - 2 - f, foamHi, 220);
      setPx(bmp, ox + 3 + f, oy - 3 - f, foamHi, 220);
      setPx(bmp, ox, oy - 4 - f, foamMid, 200);
    }
  }

  // Row 2: 4-frame crash-site emergency beacon glow & electric sparks
  for (let f = 0; f < 4; f++) {
    const ox = f * cw + 8;
    const oy = ch * 2 + 8;
    const rad = f === 0 ? 2 : f === 1 ? 5 : f === 2 ? 4 : 1;
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        const d = Math.hypot(dx, dy);
        if (d <= rad) {
          const c = d < 1.5 ? foamHi : f === 2 ? spark : d < 3 ? amber : redBeacon;
          setPx(bmp, ox + dx, oy + dy, c, Math.round((1 - d / (rad + 0.5)) * 240));
        }
      }
    }
  }
  return bmp;
}
