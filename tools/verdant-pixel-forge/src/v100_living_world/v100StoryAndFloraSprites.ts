import {
  type RGB,
  type SpriteBitmap,
  hexToRgb,
} from '../v90_broken_shore/v90PaletteAndExtractor';

function createBmp(w: number, h: number): SpriteBitmap {
  return { w, h, rgba: new Uint8Array(w * h * 4) };
}

function hash2(x: number, y: number, s = 0): number {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function px(bmp: SpriteBitmap, x: number, y: number, c: RGB, a = 255): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= bmp.w || iy < 0 || iy >= bmp.h) return;
  const o = (iy * bmp.w + ix) * 4;
  bmp.rgba[o] = c.r;
  bmp.rgba[o + 1] = c.g;
  bmp.rgba[o + 2] = c.b;
  bmp.rgba[o + 3] = a;
}

function hasPx(bmp: SpriteBitmap, x: number, y: number): boolean {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || ix >= bmp.w || iy < 0 || iy >= bmp.h) return false;
  return bmp.rgba[(iy * bmp.w + ix) * 4 + 3] >= 128;
}

function fillPoly(bmp: SpriteBitmap, pts: Array<[number, number]>, c: RGB): void {
  let minY = bmp.h, maxY = 0;
  for (const [, y] of pts) {
    if (y < minY) minY = Math.floor(y);
    if (y > maxY) maxY = Math.ceil(y);
  }
  minY = Math.max(0, minY);
  maxY = Math.min(bmp.h - 1, maxY);
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[j];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k]));
      const x1 = Math.min(bmp.w - 1, Math.floor(xs[k + 1]));
      for (let x = x0; x <= x1; x++) px(bmp, x, y, c);
    }
  }
}

function drawLine(bmp: SpriteBitmap, x0: number, y0: number, x1: number, y1: number, c: RGB, thick = 1): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.6));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    if (thick <= 1) {
      px(bmp, x, y, c);
    } else {
      for (let dy = -Math.floor(thick / 2); dy <= Math.floor((thick - 1) / 2); dy++) {
        for (let dx = -Math.floor(thick / 2); dx <= Math.floor((thick - 1) / 2); dx++) {
          px(bmp, x + dx, y + dy, c);
        }
      }
    }
  }
}

/**
 * Paints an artisanal, bumpy, multi-pixel moss/foliage cluster (never a smooth oval!).
 */
function paintMossCluster(
  bmp: SpriteBitmap,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  c0: RGB,
  c1: RGB,
  c2: RGB,
  c3: RGB
): void {
  for (let dy = -ry - 2; dy <= ry + 2; dy++) {
    for (let dx = -rx - 2; dx <= rx + 2; dx++) {
      const ang = Math.atan2(dy, dx);
      const lobe = 1 + 0.24 * Math.sin(ang * 3 + seed) + 0.16 * Math.cos(ang * 5 - seed * 1.7);
      const d = Math.hypot(dx / (rx * lobe), dy / (ry * lobe));
      if (d > 1.0) continue;
      const bump = hash2(Math.floor((cx + dx) / 2), Math.floor((cy + dy) / 2), seed);
      const light = (-dx * 0.42 - dy * 0.85) / Math.max(2, Math.hypot(rx, ry)) + (bump - 0.5) * 0.48;
      const c = light > 0.42 ? c3 : light > 0.08 ? c2 : light > -0.32 ? c1 : c0;
      px(bmp, cx + dx, cy + dy, c);
    }
  }
}

/**
 * Draws a crisp, faceted angular rock block with top-left sunlight, chisel ridges,
 * stepped horizontal strata, weathered pits & dark inner fractures!
 */
function paintFacetedRockBlock(
  bmp: SpriteBitmap,
  pts: Array<[number, number]>,
  cx: number,
  cy: number,
  topY: number,
  botY: number,
  seed: number,
  pal: [RGB, RGB, RGB, RGB, RGB, RGB]
): void {
  const mask = createBmp(bmp.w, bmp.h);
  fillPoly(mask, pts, pal[2]);
  const hSpan = Math.max(1, botY - topY);

  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      if (!hasPx(mask, x, y)) continue;
      // Check top/left exposed bevel edge for crisp sunlight highlight!
      const topAir = !hasPx(mask, x, y - 1) || !hasPx(mask, x, y - 2);
      const leftAir = !hasPx(mask, x - 1, y);
      const rightAir = !hasPx(mask, x + 1, y) || !hasPx(mask, x + 2, y);
      const botAir = !hasPx(mask, x, y + 1) || !hasPx(mask, x, y + 2);

      const ny = (y - topY) / hSpan;
      const nx = (x - cx) / 22;
      // Stepped geological strata planes
      const strata = Math.sin(y * 0.55 + Math.sin(x * 0.14 + seed) * 1.4);
      const facet = hash2(Math.floor(x / 3), Math.floor(y / 2), seed);

      let c = pal[2];
      if (topAir && nx < 0.45) {
        c = ny < 0.35 ? pal[5] : pal[4];
      } else if (botAir || (rightAir && nx > 0.25)) {
        c = pal[0];
      } else if (strata < -0.78) {
        c = pal[0]; // Horizontal basalt fracture groove!
      } else if (strata > 0.65 && nx < 0.35) {
        c = pal[4]; // Lit horizontal ledge shelf!
      } else {
        const shade = -nx * 0.52 - (ny - 0.35) * 0.42 + (facet - 0.5) * 0.32;
        if (shade > 0.34) c = pal[4];
        else if (shade > 0.08) c = pal[3];
        else if (shade > -0.22) c = pal[2];
        else if (shade > -0.48) c = pal[1];
        else c = pal[0];
      }
      if (leftAir && ny < 0.72 && strata > -0.5) c = pal[4];
      px(bmp, x, y, c);
    }
  }
}

/**
 * Selective dark outline (#1e0c1c sel-out) matching Dr. Mara Lin & V9.0 hero props cleanly.
 */
function applySelectiveOutline(bmp: SpriteBitmap, ink: RGB): void {
  const srcA = new Uint8Array(bmp.w * bmp.h);
  for (let i = 0; i < srcA.length; i++) srcA[i] = bmp.rgba[i * 4 + 3];
  for (let y = 1; y < bmp.h - 1; y++) {
    for (let x = 1; x < bmp.w - 1; x++) {
      if (srcA[y * bmp.w + x] >= 128) continue;
      const n = srcA[(y - 1) * bmp.w + x] >= 128;
      const s = srcA[(y + 1) * bmp.w + x] >= 128;
      const w = srcA[y * bmp.w + (x - 1)] >= 128;
      const e = srcA[y * bmp.w + (x + 1)] >= 128;
      if (n || s || w || e) px(bmp, x, y, ink);
    }
  }
}

// Curated V90_MASTER_HEX Swatches (100% palette-faithful!)
const P = {
  ink: hexToRgb('#1e0c1c'),
  plum: hexToRgb('#2a1b31'),
  deepBrown: hexToRgb('#46202a'),
  earthDark: hexToRgb('#534438'),
  sandDamp: hexToRgb('#826446'),
  sandMid: hexToRgb('#ba9666'),
  sandHi: hexToRgb('#e0c592'),
  hullDark: hexToRgb('#242a38'),
  hullShadow: hexToRgb('#404650'),
  hullSlate: hexToRgb('#676f75'),
  hullWarm: hexToRgb('#9d9b94'),
  hullCream: hexToRgb('#d2cdc0'),
  hullWhite: hexToRgb('#eeeadf'),
  rustDark: hexToRgb('#6e2e1d'),
  rustMid: hexToRgb('#a44522'),
  orange: hexToRgb('#d86820'),
  amber: hexToRgb('#f2b25f'),
  rock0: hexToRgb('#242a38'),
  rock1: hexToRgb('#353f4f'),
  rock2: hexToRgb('#4d5c6c'),
  rock3: hexToRgb('#6d7c89'),
  rock4: hexToRgb('#8798a2'),
  rock5: hexToRgb('#b2bec0'),
  g0: hexToRgb('#162922'),
  g1: hexToRgb('#234232'),
  g2: hexToRgb('#335c3e'),
  g3: hexToRgb('#497b49'),
  g4: hexToRgb('#679c52'),
  g5: hexToRgb('#8db95e'),
  sage0: hexToRgb('#2f5350'),
  sage1: hexToRgb('#4c7b72'),
  sage2: hexToRgb('#74a592'),
  teal0: hexToRgb('#1e4260'),
  teal1: hexToRgb('#2d768c'),
  teal2: hexToRgb('#3c949c'),
  jade: hexToRgb('#56b2a6'),
  mint: hexToRgb('#7ec7ad'),
  cyan: hexToRgb('#8cf2ea'),
  foam: hexToRgb('#eff2e5'),
};

const ROCK_PAL: [RGB, RGB, RGB, RGB, RGB, RGB] = [
  P.rock0, P.rock1, P.rock2, P.rock3, P.rock4, P.rock5,
];

/**
 * 1. MERIDIAN FIELD RELAY (64x76 px) — PASS 2 ARTISANAL PIXEL CRAFT
 * Weathered isometric exo-survey telemetry unit with angled armored panels,
 * cooling louver vents, scorched blast scuffs, cracked photovoltaic wing with
 * grid cells, coiled orange EVA cables, parabolic dish & amber strobe mast!
 */
export function buildMeridianFieldRelaySprite(): SpriteBitmap {
  const b = createBmp(64, 76);

  // Coiled insulated orange/charcoal tether cables trailing naturally onto sand
  drawLine(b, 9, 66, 17, 68, P.rustDark, 2);
  drawLine(b, 17, 68, 25, 63, P.orange, 2);
  px(b, 18, 67, P.amber);
  drawLine(b, 41, 63, 49, 67, P.rustDark, 2);
  drawLine(b, 49, 67, 56, 65, P.rustMid, 1);
  px(b, 48, 66, P.orange);

  // Three articulated tripod legs gripping the sand (no flat oval shadow!)
  fillPoly(b, [[21, 56], [26, 56], [19, 66], [14, 65]], P.hullShadow);
  drawLine(b, 22, 56, 16, 65, P.hullWarm, 1);
  fillPoly(b, [[38, 55], [43, 55], [51, 64], [46, 65]], P.hullDark);
  drawLine(b, 40, 56, 47, 64, P.hullSlate, 1);
  fillPoly(b, [[29, 58], [34, 58], [34, 68], [29, 68]], P.hullShadow);
  drawLine(b, 30, 58, 30, 67, P.hullCream, 1);
  // Wide articulated hydraulic footpads
  fillPoly(b, [[12, 65], [20, 65], [19, 68], [13, 68]], P.hullSlate);
  px(b, 14, 65, P.hullCream);
  fillPoly(b, [[27, 67], [36, 67], [35, 70], [28, 70]], P.hullSlate);
  px(b, 29, 67, P.hullWhite);
  fillPoly(b, [[45, 64], [52, 64], [51, 67], [46, 67]], P.hullShadow);

  // Isometric beveled main telemetry housing (left sunlit face + right shaded side + chamfered top)
  // Top deck
  fillPoly(b, [[23, 37], [37, 34], [45, 38], [31, 41]], P.hullWhite);
  drawLine(b, 24, 37, 37, 35, P.foam, 1);
  // Sunlit front-left armored face
  fillPoly(b, [[22, 38], [31, 41], [31, 59], [22, 56]], P.hullCream);
  // Shaded front-right panel face
  fillPoly(b, [[31, 41], [45, 38], [45, 56], [31, 59]], P.hullSlate);
  // Deep shadow underside skirt
  fillPoly(b, [[22, 55], [31, 58], [45, 55], [44, 59], [31, 61], [23, 58]], P.hullDark);

  // Crisp panel seam lines, rivets & ventilation louvers
  drawLine(b, 31, 41, 31, 59, P.hullShadow, 1);
  drawLine(b, 22, 43, 31, 46, P.orange, 2);
  drawLine(b, 31, 46, 44, 43, P.rustMid, 2);
  drawLine(b, 22, 43, 30, 45, P.amber, 1);
  // Glowing recessed telemetry readout screen on sunlit panel
  fillPoly(b, [[24, 48], [29, 49], [29, 54], [24, 53]], P.hullDark);
  px(b, 25, 50, P.teal2);
  px(b, 26, 50, P.cyan);
  px(b, 27, 51, P.jade);
  px(b, 28, 51, P.cyan);
  px(b, 25, 52, P.teal1);
  // Cooling louver vents & scorch grime on shaded panel
  for (let vy = 48; vy <= 54; vy += 2) {
    drawLine(b, 34, vy, 41, vy - 1, P.hullDark, 1);
    px(b, 35, vy - 1, P.hullWarm);
  }
  // Weathered rivets & blast scuff marks
  px(b, 23, 39, P.hullWarm);
  px(b, 43, 40, P.hullDark);
  px(b, 23, 55, P.earthDark);
  px(b, 42, 54, P.deepBrown);

  // Angled cracked photovoltaic solar wing extending left-upward
  fillPoly(b, [[6, 30], [23, 37], [22, 46], [5, 39]], P.hullShadow);
  fillPoly(b, [[7, 31], [22, 37], [21, 45], [6, 38]], P.teal0);
  // Crisp solar grid cells catching morning sunlight
  for (let gx = 8; gx <= 20; gx += 4) {
    const gy = 31 + Math.round((gx - 7) * 0.42);
    drawLine(b, gx, gy, gx - 1, gy + 7, P.teal2, 1);
    px(b, gx + 1, gy + 1, P.jade);
    px(b, gx + 1, gy + 3, P.teal1);
  }
  // Top metallic bezel & jagged stress crack across panel
  drawLine(b, 6, 30, 23, 37, P.hullWhite, 1);
  drawLine(b, 12, 33, 15, 42, P.ink, 1);
  px(b, 11, 35, P.cyan);

  // Telescoping antenna mast, side receiver dish & top amber strobe
  drawLine(b, 35, 36, 36, 11, P.hullShadow, 2);
  drawLine(b, 34, 36, 35, 11, P.hullCream, 1);
  // Crossbar dipoles
  drawLine(b, 29, 17, 42, 18, P.hullSlate, 1);
  drawLine(b, 31, 13, 40, 14, P.hullWarm, 1);
  px(b, 29, 16, P.hullWhite);
  px(b, 42, 17, P.hullWhite);
  // Angled concave parabolic micro-dish (crescent shadow inside, NOT an eyeball!)
  fillPoly(b, [[38, 22], [47, 23], [48, 30], [40, 32], [37, 27]], P.hullSlate);
  fillPoly(b, [[39, 23], [46, 24], [46, 29], [40, 30]], P.hullCream);
  fillPoly(b, [[40, 24], [44, 25], [44, 28], [41, 28]], P.hullWarm);
  drawLine(b, 42, 26, 48, 25, P.hullDark, 1);
  px(b, 48, 25, P.orange);
  // Top glowing amber warning strobe lantern
  fillPoly(b, [[34, 8], [37, 8], [37, 12], [34, 12]], P.orange);
  px(b, 35, 9, P.amber);
  px(b, 35, 10, P.foam);

  // Creeping coastal lichen & moss already colonizing the lower corner!
  paintMossCluster(b, 23, 55, 4, 2, 11, P.g1, P.g2, P.g4, P.g5);
  px(b, 21, 56, P.cyan);

  applySelectiveOutline(b, P.ink);
  return b;
}

/**
 * 2. MERIDIAN SPECIMEN POD (56x44 px) — PASS 2 ARTISANAL PIXEL CRAFT
 * Cracked cylindrical exo-survey stasis canister wedged into sand at an angle,
 * armored end-flanges, ribbed viewport cage, shattered glass revealing glowing
 * cyan bio-spores, and scattered field data pad & orange webbing strap.
 */
export function buildMeridianSpecimenPodSprite(): SpriteBitmap {
  const b = createBmp(56, 44);

  // Trailing torn burnt-orange cargo webbing strap
  fillPoly(b, [[6, 30], [16, 33], [15, 36], [5, 33]], P.rustMid);
  drawLine(b, 6, 30, 15, 33, P.orange, 1);
  px(b, 8, 31, P.amber);

  // Heavy cylindrical body tilted at natural crash resting angle
  for (let x = 11; x <= 44; x++) {
    const tilt = Math.round((x - 27) * 0.16);
    const isFlange = (x >= 11 && x <= 17) || (x >= 38 && x <= 44);
    const rad = isFlange ? 9 : 7;
    for (let dy = -rad; dy <= rad; dy++) {
      const y = 25 + tilt + dy;
      if (isFlange) {
        let c = P.hullCream;
        if (dy <= -6) c = P.hullWhite;
        else if (dy <= -2) c = P.hullCream;
        else if (dy <= 2) c = P.hullWarm;
        else if (dy <= 5) c = P.hullSlate;
        else c = P.hullShadow;
        // Ribbed clamp grooves & orange hazard stripe
        if (x === 14 || x === 41) c = dy > 2 ? P.rustDark : P.orange;
        if (x === 17 || x === 38) c = P.hullDark;
        px(b, x, y, c);
      } else {
        // Armored glass bio-containment chamber with bright cyan spore mist inside!
        let c = P.teal1;
        if (dy <= -6) c = P.hullSlate;
        else if (dy >= 6) c = P.hullDark;
        else if (dy <= -3) c = P.mint;
        else if (dy <= 0) c = P.cyan;
        else if (dy <= 3) c = P.jade;
        else c = P.teal0;
        px(b, x, y, c);
      }
    }
  }
  // End-cap bevel face on left flange (3D cylindrical depth!)
  fillPoly(b, [[10, 17], [13, 16], [13, 30], [10, 29]], P.hullSlate);
  px(b, 11, 21, P.hullWarm);
  px(b, 11, 24, P.hullDark);

  // Steel roll-cage struts across the glass + rivets
  for (const bx of [21, 28, 34]) {
    const tilt = Math.round((bx - 27) * 0.16);
    drawLine(b, bx, 18 + tilt, bx, 32 + tilt, P.hullDark, 1);
    drawLine(b, bx - 1, 18 + tilt, bx - 1, 27 + tilt, P.hullWarm, 1);
    px(b, bx - 1, 18 + tilt, P.hullWhite);
  }
  // Specular highlight stripe & jagged shattered glass fracture leaking spores!
  drawLine(b, 18, 21, 36, 24, P.foam, 1);
  drawLine(b, 23, 19, 26, 26, P.ink, 1);
  drawLine(b, 26, 26, 31, 23, P.ink, 1);
  // Drifting glowing bioluminescent pollen droplets escaping crack
  px(b, 25, 16, P.cyan);
  px(b, 27, 14, P.foam);
  px(b, 29, 17, P.mint);
  px(b, 22, 14, P.jade);

  // Dropped field slate & small intact specimen vial resting beside right flange
  fillPoly(b, [[42, 32], [50, 31], [51, 35], [43, 36]], P.hullCream);
  px(b, 44, 33, P.teal2);
  px(b, 46, 33, P.cyan);
  px(b, 48, 32, P.orange);

  applySelectiveOutline(b, P.ink);
  return b;
}

/**
 * 3. ANCIENT WAYMARKER STONE (72x92 px) — PASS 2 ARTISANAL PIXEL CRAFT
 * Craggy, stepped, angular alien piezo-basalt monolith echoing the Singing Canopy
 * Waystone Spiral — chiseled angular rock shoulders, deeply carved glowing cyan
 * spiral rune groove, lush terraced emerald moss cap, hanging biolum lichen & basal stones!
 */
export function buildAncientWaymarkerStoneSprite(): SpriteBitmap {
  const b = createBmp(72, 92);

  // Asymmetric stepped basal anchor stones (chunky angular facets — zero smooth oval!)
  paintFacetedRockBlock(
    b,
    [[14, 76], [22, 66], [34, 67], [36, 79], [23, 83], [13, 81]],
    24, 74, 66, 83, 31, ROCK_PAL
  );
  paintFacetedRockBlock(
    b,
    [[37, 68], [52, 69], [58, 76], [56, 82], [41, 83], [35, 78]],
    46, 75, 68, 83, 47, ROCK_PAL
  );

  // Main towering chiseled angular stele (irregular stepped basalt silhouette!)
  paintFacetedRockBlock(
    b,
    [
      [28, 16], [38, 13], [44, 18], [46, 28], [50, 34], [52, 52],
      [54, 68], [48, 77], [24, 78], [19, 68], [21, 50], [22, 36], [26, 25],
    ],
    35, 46, 13, 78, 19, ROCK_PAL
  );

  // Secondary jutting stepped basalt shoulder slab on left-front for 3D sculptural mass!
  paintFacetedRockBlock(
    b,
    [[19, 44], [28, 41], [30, 56], [27, 73], [18, 71], [17, 56]],
    23, 57, 41, 73, 73, ROCK_PAL
  );

  // Deeply recessed, crisp glowing cyan acoustic spiral glyph + resonant slit!
  const spiral: Array<[number, number]> = [
    [36, 39], [38, 38], [40, 39], [41, 41], [40, 44], [38, 45], [35, 45],
    [33, 43], [32, 40], [33, 36], [36, 34], [40, 34], [43, 36], [44, 40],
    [44, 45], [41, 49], [36, 50], [32, 48], [29, 44], [29, 38], [32, 32],
    [37, 30], [42, 31],
  ];
  for (let i = 0; i < spiral.length; i++) {
    const [sx, sy] = spiral[i];
    // Dark chiseled recess groove behind glowing lichen core
    px(b, sx + 1, sy + 1, P.ink);
    px(b, sx - 1, sy, P.rock0);
    px(b, sx, sy + 1, P.rock0);
  }
  for (let i = 0; i < spiral.length; i++) {
    const [sx, sy] = spiral[i];
    const c = i < 6 ? P.foam : i % 3 === 0 ? P.cyan : i % 2 === 0 ? P.jade : P.teal2;
    px(b, sx, sy, c);
  }
  // Resonant tuning channel descending below spiral
  drawLine(b, 37, 51, 37, 67, P.ink, 3);
  drawLine(b, 37, 52, 37, 65, P.teal2, 1);
  px(b, 37, 54, P.cyan);
  px(b, 37, 58, P.foam);
  px(b, 37, 62, P.mint);

  // Thick artisanal bumpy emerald moss cap cascading over crown & stepped shoulder
  paintMossCluster(b, 34, 17, 10, 5, 13, P.g0, P.g2, P.g4, P.g5);
  paintMossCluster(b, 24, 42, 6, 4, 29, P.g0, P.g2, P.g3, P.g5);
  paintMossCluster(b, 20, 74, 7, 3, 41, P.g0, P.g2, P.g4, P.g5);
  paintMossCluster(b, 49, 75, 6, 3, 53, P.g0, P.g1, P.g3, P.g4);

  // Hanging turquoise-cyan forest lichen tendrils linking visually to V8.0 canopy trees!
  drawLine(b, 26, 21, 25, 31, P.jade, 1);
  px(b, 25, 25, P.cyan);
  px(b, 25, 30, P.mint);
  drawLine(b, 44, 21, 45, 29, P.sage1, 1);
  px(b, 45, 26, P.cyan);
  // Tiny amber coastal mushrooms nestled in basal moss
  px(b, 47, 73, P.orange);
  px(b, 47, 72, P.amber);
  px(b, 51, 74, P.orange);
  px(b, 51, 73, P.amber);

  applySelectiveOutline(b, P.ink);
  return b;
}

/**
 * 4. ECOTONE MOSS BOULDER (84x62 px) — PASS 2 ARTISANAL PIXEL CRAFT
 * Chunky multi-block fractured coastal-rainforest boulder formation matching V8.0's
 * mossy rock craft AND V9.0's stratified dark basalt — zero smooth oval base!
 */
export function buildEcotoneMossBoulderSprite(): SpriteBitmap {
  const b = createBmp(84, 62);

  // Back-left tall faceted basalt crag
  paintFacetedRockBlock(
    b,
    [[14, 46], [12, 31], [21, 18], [38, 16], [48, 25], [50, 48], [28, 53]],
    30, 34, 16, 53, 101, ROCK_PAL
  );
  // Front-right angular companion boulder
  paintFacetedRockBlock(
    b,
    [[44, 49], [46, 33], [57, 27], [69, 32], [72, 45], [64, 53], [48, 53]],
    58, 40, 27, 53, 203, ROCK_PAL
  );
  // Front-left wedged stepping stone
  paintFacetedRockBlock(
    b,
    [[10, 49], [16, 40], [31, 41], [35, 51], [24, 55], [12, 53]],
    22, 47, 40, 55, 307, ROCK_PAL
  );

  // Artisanal bumpy moss blankets draping naturally over sunlit top ledges!
  paintMossCluster(b, 29, 20, 13, 6, 17, P.g0, P.g2, P.g4, P.g5);
  paintMossCluster(b, 38, 28, 7, 5, 23, P.g0, P.g2, P.g3, P.g4);
  paintMossCluster(b, 57, 30, 9, 4, 37, P.g0, P.g2, P.g4, P.g5);
  paintMossCluster(b, 21, 43, 6, 3, 43, P.g1, P.g2, P.g4, P.g5);

  // Hanging cyan lichen strand & sprouting serrated coastal fernlets hugging the stone!
  drawLine(b, 43, 27, 44, 38, P.jade, 1);
  px(b, 44, 32, P.cyan);
  px(b, 44, 36, P.mint);
  // Left fern shoot
  drawLine(b, 14, 45, 7, 37, P.g2, 2);
  drawLine(b, 13, 44, 8, 37, P.g4, 1);
  px(b, 7, 36, P.g5);
  // Right fern shoot + little wildflower
  drawLine(b, 69, 46, 76, 39, P.g2, 2);
  drawLine(b, 70, 45, 75, 39, P.g4, 1);
  px(b, 76, 38, P.g5);
  px(b, 53, 27, P.amber);
  px(b, 32, 16, P.cyan);

  applySelectiveOutline(b, P.ink);
  return b;
}

/**
 * 5. COASTAL BIOLUM CORAL (48x42 px) — PASS 2 ARTISANAL PIXEL CRAFT
 * Branching staghorn & pleated sea-fan alien tidepool coral rising from a jagged
 * wet basalt holdfast, tipped with glowing cyan & warm amber bioluminescent polyps!
 */
export function buildCoastalBiolumCoralSprite(): SpriteBitmap {
  const b = createBmp(48, 42);

  // Craggy wet dark basalt holdfast stone
  paintFacetedRockBlock(
    b,
    [[11, 35], [16, 28], [32, 28], [37, 34], [32, 38], [15, 38]],
    24, 33, 28, 38, 88, ROCK_PAL
  );

  // Branching coral arms with articulated forks & translucent luminous tips
  const drawCoralBranch = (
    x0: number, y0: number, x1: number, y1: number, wBase: number, tipCol: RGB
  ): void => {
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x0 + (x1 - x0) * t + Math.sin(t * Math.PI) * ((x1 - x0) > 0 ? 1.5 : -1.5);
      const cy = y0 + (y1 - y0) * t;
      const r = Math.max(1, Math.round(wBase * (1 - t * 0.55)));
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r + 0.5) continue;
          let c = P.teal1;
          if (t > 0.78) c = tipCol;
          else if (dx < 0 || dy < 0) c = t > 0.45 ? P.jade : P.teal2;
          else c = P.teal0;
          px(b, cx + dx, cy + dy, c);
        }
      }
    }
    px(b, x1, y1 - 1, P.foam);
  };

  // Back shadowed coral forks
  drawCoralBranch(20, 31, 10, 18, 2.2, P.mint);
  drawCoralBranch(28, 31, 38, 19, 2.2, P.mint);
  drawCoralBranch(15, 24, 9, 24, 1.5, P.cyan);
  drawCoralBranch(33, 25, 40, 24, 1.5, P.cyan);
  // Central tall bifurcated bioluminescent crown!
  drawCoralBranch(24, 31, 22, 11, 2.8, P.cyan);
  drawCoralBranch(23, 21, 16, 12, 1.8, P.cyan);
  drawCoralBranch(24, 20, 31, 12, 1.8, P.cyan);
  // Foreground warm amber sea-anemone florets nestled at coral base!
  drawCoralBranch(19, 32, 15, 25, 1.8, P.amber);
  drawCoralBranch(29, 32, 33, 26, 1.8, P.amber);
  drawCoralBranch(24, 33, 24, 26, 1.8, P.amber);
  px(b, 15, 25, P.orange);
  px(b, 24, 26, P.orange);
  px(b, 33, 26, P.orange);
  px(b, 15, 24, P.amber);
  px(b, 24, 25, P.foam);
  px(b, 33, 25, P.amber);

  applySelectiveOutline(b, P.ink);
  return b;
}

/**
 * 6. COASTAL CANOPY FERN CLUMP (64x50 px) — PASS 2 ARTISANAL PIXEL CRAFT
 * Tall, airy, arching serrated pixel-art fern fronds with crisp individual pinnae,
 * dark negative-space interior gaps, and warm sunlit chartreuse tips matching V8.0 ferns!
 */
export function buildCoastalCanopyFernSprite(): SpriteBitmap {
  const b = createBmp(64, 50);

  // Soft mossy base tucked tightly beneath overhanging lower fronds
  paintMossCluster(b, 32, 41, 10, 4, 61, P.g0, P.g1, P.g2, P.g3);

  // Fuller painterly scalloped fern fronds (2-3px organic leaf clusters matching V8.0 ferns!)
  const drawLushFrond = (
    dirX: number,
    reachX: number,
    riseY: number,
    droopY: number,
    cShadow: RGB,
    cMid: RGB,
    cLit: RGB,
    cHi: RGB
  ): void => {
    const steps = 15;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const fx = 32 + dirX * reachX * t;
      const fy = 40 - Math.sin(t * Math.PI * 0.70) * riseY + t * t * droopY;
      // Stem core
      px(b, fx, fy + 1, cShadow);
      px(b, fx, fy, t > 0.55 ? cLit : cMid);

      if (s >= 2 && s <= steps - 1) {
        const span = Math.max(1, Math.round((1 - Math.abs(t - 0.45) * 1.25) * 4.4));
        for (let k = 1; k <= span; k++) {
          const ux = fx - dirX * k * 0.28;
          const uy = fy - k * 0.72;
          px(b, ux, uy + 1, cShadow);
          px(b, ux, uy, t > 0.60 || k >= span - 1 ? cHi : cLit);
          if (k <= span - 1) px(b, ux + dirX, uy, cMid);
          const dx2 = fx + dirX * k * 0.18;
          const dy2 = fy + k * 0.48;
          px(b, dx2, dy2 + 1, cShadow);
          px(b, dx2, dy2, t > 0.65 ? cLit : cMid);
        }
      } else if (s === steps) {
        px(b, fx + dirX, fy, cHi);
        px(b, fx, fy - 1, cHi);
      }
    }
  };

  // Back deep shade / coastal sage fronds for silhouette height
  drawLushFrond(-1, 21, 23, 3, P.g0, P.sage0, P.sage1, P.sage2);
  drawLushFrond(1, 22, 24, 3, P.g0, P.sage0, P.sage1, P.sage2);
  drawLushFrond(-0.42, 14, 28, 1, P.g0, P.g1, P.g2, P.g4);
  drawLushFrond(0.42, 14, 29, 1, P.g0, P.g1, P.g2, P.g4);
  // Broad mid emerald spreading fronds
  drawLushFrond(-1, 26, 16, 7, P.g0, P.g1, P.g3, P.g4);
  drawLushFrond(1, 26, 15, 7, P.g0, P.g1, P.g3, P.g4);
  // Bright sunlit arching foreground fronds hugging the base cleanly
  drawLushFrond(-0.85, 22, 11, 8, P.g1, P.g2, P.g4, P.g5);
  drawLushFrond(0.85, 22, 11, 8, P.g1, P.g2, P.g4, P.g5);
  drawLushFrond(-0.22, 9, 21, 2, P.g1, P.g2, P.g4, P.g5);
  drawLushFrond(0.24, 10, 19, 2, P.g1, P.g2, P.g4, P.g5);

  // Subtle amber & biolum cyan coastal florets peeking from crown
  px(b, 29, 29, P.amber);
  px(b, 35, 27, P.cyan);

  // Deep forest green sel-out border (#162922) instead of harsh black for soft botanical integration!
  applySelectiveOutline(b, P.g0);
  return b;
}

/**
 * 7. COASTAL SPORE-MOTHS & DUNE FIREFLIES (64x32 px — 4 frames x 2 rows of 16x16 px)
 * Row 0: Iridescent Turquoise-Winged Coastal Spore-Moth (flutters near Waymarker, Ecotone & Tidepools!)
 * Row 1: Warm Sun-Amber Coastal Lantern-Moth (dances over sunlit dunes & twilight reeds!)
 */
export function buildCoastalSporeMothsAtlas(): SpriteBitmap {
  const b = createBmp(64, 32);

  for (let row = 0; row < 2; row++) {
    const isCyan = row === 0;
    const wDark = isCyan ? P.teal0 : P.rustMid;
    const wMid = isCyan ? P.jade : P.orange;
    const wHi = isCyan ? P.cyan : P.amber;
    const core = P.foam;

    for (let f = 0; f < 4; f++) {
      const ox = f * 16 + 8;
      const oy = row * 16 + 8;
      // 4-frame wingbeat cycle: 0=up, 1=mid-wide, 2=down, 3=mid-glide
      const wingSpread = f === 1 ? 5 : f === 3 ? 4 : 3;
      const wingLift = f === 0 ? -3 : f === 2 ? 2 : -1;

      // Left & right sculpted pixel wings
      for (const side of [-1, 1]) {
        for (let dx = 1; dx <= wingSpread; dx++) {
          const wx = ox + side * dx;
          const wy = oy + Math.round((dx / wingSpread) * wingLift);
          px(b, wx, wy - 1, dx === wingSpread ? wHi : wMid);
          px(b, wx, wy, dx >= wingSpread - 1 ? wHi : wMid);
          px(b, wx, wy + 1, wDark);
          if (dx === 2 && f !== 2) px(b, wx, wy - 2, wHi);
        }
        // Subtle lower hind-wing tuft
        px(b, ox + side * 2, oy + 2, wDark);
        px(b, ox + side * 1, oy + 2, wMid);
      }
      // Body & glowing bioluminescent thorax dot
      px(b, ox, oy - 1, P.ink);
      px(b, ox, oy, core);
      px(b, ox, oy + 1, wMid);
      px(b, ox, oy + 2, P.ink);
      // Tiny dark outline dots at wingtips for crisp readability against sunlit sand & emerald grass
      px(b, ox - wingSpread - 1, oy + wingLift, P.ink);
      px(b, ox + wingSpread + 1, oy + wingLift, P.ink);
    }
  }
  return b;
}
