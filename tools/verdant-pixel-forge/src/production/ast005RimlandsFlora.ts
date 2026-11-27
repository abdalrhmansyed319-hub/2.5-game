/**
 * AST-005 — Starter Rimlands Interactive Flora Sheet (64x128, 4x4 of 16x32)
 * =========================================================================
 * Final Production Artwork authored natively through VERDANT PIXEL FORGE.
 *
 * Strictly obeys docs/asset-production/ASSET_REQUESTS.md v2.0 &
 * game/world/flora/flora_prop.gd:
 *   - Cell size : 16x32 px, pivot (8, 30) -> offset (0, -14)
 *   - Row 0 (Cols 0..3): Amber Tide-Kelp 4-frame fluid wind-sway (y=3..30)
 *   - Row 1 (Cols 0..1): Mirror Glasswort crystalline salt-succulent Variants A/B (Cols 2..3 transparent)
 *   - Row 2 (Cols 0..1): Sun-Drop Bulb Day Closed (Col 0) & Night Bioluminescent Open (Col 1) (Cols 2..3 transparent)
 *   - Row 3 (Cols 0..1): Cordage Frond fibrous fern Variants A/B (Cols 2..3 transparent)
 */

import { WorldLayerCanvas } from './worldArtCore';
import type { ProjectDocument } from '../types/studio';

const LAYERS = [
  { id: 'l01_base_stems', name: '01 Holdfasts, Stems & Shadows' },
  { id: 'l02_foliage_body', name: '02 Fronds, Blades & Petals' },
  { id: 'l03_bladders_glow', name: '03 Kelp Bladders, Crystals & Bioluminescence' },
];

function paintAmberTideKelpFrame(c: WorldLayerCanvas, col: number): void {
  const ox = col * 16;
  const oy = 0;
  // Smooth 4-frame sinusoidal sea-breeze traveling wave (phase = 0, pi/2, pi, 3pi/2)
  const phase = (col / 4) * Math.PI * 2;
  const clip = { x0: ox + 1, y0: oy + 3, x1: ox + 14, y1: oy + 30 };

  // Grounded wet kelp holdfast clump at base (y=27..30, centered at x=8)
  c.fillEllipse('l01_base_stems', ox + 8, oy + 29.2, 4.0, 1.5, 'KLP0', undefined, clip);
  c.fillEllipse('l01_base_stems', ox + 7.5, oy + 28.4, 3.0, 1.2, 'KLP1', undefined, clip);
  c.px('l02_foliage_body', ox + 6, oy + 28, 'KLP2');
  c.px('l02_foliage_body', ox + 8, oy + 28, 'KLP2');

  // 3 graceful waving kelp ribbons (left mid, tall hero center, right shorter)
  const stalks: Array<{ baseX: number; topY: number; lean: number; amp: number; phaseOff: number; bladderYs: number[] }> = [
    { baseX: 6.0, topY: 10, lean: -1.4, amp: 1.5, phaseOff: -0.6, bladderYs: [18, 12] },
    { baseX: 8.0, topY: 4, lean: 0.4, amp: 1.9, phaseOff: 0.0, bladderYs: [21, 14, 7] },
    { baseX: 10.2, topY: 13, lean: 1.4, amp: 1.3, phaseOff: 0.7, bladderYs: [20, 15] },
  ];

  for (const st of stalks) {
    for (let y = 28; y >= st.topY; y--) {
      const hFrac = (28 - y) / (28 - st.topY); // 0 at root -> 1 at tip
      const sway = Math.sin(phase + st.phaseOff - hFrac * 2.2) * st.amp * (hFrac * hFrac * 0.8 + hFrac * 0.2);
      const sx = Math.round(st.baseX + st.lean * hFrac + sway);
      if (sx < 2 || sx > 13) continue;

      // Dark underside / left sunlit ribbon shading!
      const ribbonW = hFrac > 0.85 ? 0 : hFrac > 0.35 ? 1 : 1;
      const bodyTok = hFrac > 0.65 ? 'KLP3' : hFrac > 0.25 ? 'KLP2' : 'KLP1';
      c.px('l01_base_stems', ox + sx + 1, oy + y, hFrac > 0.7 ? 'KLP1' : 'KLP0');
      c.px('l02_foliage_body', ox + sx, oy + y, bodyTok);
      if (ribbonW > 0 && hFrac < 0.8) {
        // Delicate sinuous leaf-frill fluttering off the kelp rib!
        const frillSide = Math.sin(y * 0.9 + phase) > 0 ? -1 : 1;
        c.px('l02_foliage_body', ox + sx + frillSide, oy + y, frillSide < 0 ? 'KLP4' : 'KLP1');
      }

      // Luminous golden gas-bladders along the kelp rib!
      if (st.bladderYs.includes(y)) {
        const bx = sx + (st.lean <= 0 ? -1 : 1);
        c.px('l03_bladders_glow', ox + bx, oy + y, 'KLP4');
        c.px('l03_bladders_glow', ox + bx, oy + y - 1, 'KLP5');
        c.px('l03_bladders_glow', ox + bx + 1, oy + y, 'KLP1');
      }
    }
  }
}

function paintMirrorGlasswort(c: WorldLayerCanvas, col: 0 | 1): void {
  const ox = col * 16;
  const oy = 32; // Row 1!
  const clip = { x0: ox + 1, y0: oy + 14, x1: ox + 14, y1: oy + 30 };

  // Grounded salty base ring
  c.fillEllipse('l01_base_stems', ox + 8, oy + 29.3, 4.6, 1.4, 'GLW0', undefined, clip);

  // Faceted angular crystal spears (upper-left crisp bright glass facet, lower-right deep sea-glass facet!)
  const spires: Array<{ x0: number; y0: number; x1: number; y1: number; hw: number }> =
    col === 0
      ? [
          { x0: 6.5, y0: 29, x1: 4.0, y1: 19, hw: 1.6 },
          { x0: 10.0, y0: 29, x1: 11.8, y1: 20, hw: 1.5 },
          { x0: 8.0, y0: 29, x1: 7.8, y1: 14, hw: 2.0 }, // tall central glass crystal spear!
        ]
      : [
          { x0: 5.5, y0: 29, x1: 3.2, y1: 21, hw: 1.5 },
          { x0: 7.5, y0: 29, x1: 6.8, y1: 16, hw: 1.7 },
          { x0: 10.0, y0: 29, x1: 10.6, y1: 15, hw: 1.9 },
          { x0: 11.8, y0: 29, x1: 13.4, y1: 22, hw: 1.3 },
        ];

  for (const sp of spires) {
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const cx = sp.x0 + (sp.x1 - sp.x0) * t;
      const cy = sp.y0 + (sp.y1 - sp.y0) * t;
      // Sharp faceted crystal taper toward apex!
      const halfW = sp.hw * (t < 0.72 ? 1.0 - t * 0.2 : (1 - t) / 0.28);
      for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) > halfW + 0.1) continue;
        const px = Math.round(cx + dx);
        const py = Math.round(cy);
        if (ox + px < clip.x0 || ox + px > clip.x1 || oy + py < clip.y0 || oy + py > clip.y1) continue;

        let tok = 'GLW2';
        if (dx < -0.25) tok = t > 0.35 ? 'GLW3' : 'GLW2';
        else if (dx > 0.45) tok = 'GLW1';
        if (Math.abs(dx) > halfW - 0.35 && dx > 0) tok = 'GLW0';
        c.px('l02_foliage_body', ox + px, oy + py, tok);
      }
      // Razor-sharp translucent crystal ridge catchlight on upper-left facet!
      if (t > 0.22 && t < 0.88) {
        const hx = Math.round(cx - halfW * 0.45);
        const hy = Math.round(cy);
        if (ox + hx >= clip.x0 && ox + hx <= clip.x1 && oy + hy >= clip.y0 && oy + hy <= clip.y1) {
          c.px('l03_bladders_glow', ox + hx, oy + hy, t > 0.58 ? 'GLW4' : 'GLW3');
        }
      }
    }
    // Bright prism apex spark
    c.px('l03_bladders_glow', ox + Math.round(sp.x1), oy + Math.round(sp.y1), 'GLW4');
  }
}

function paintSunDropBulb(c: WorldLayerCanvas, isNightOpen: boolean): void {
  const ox = isNightOpen ? 16 : 0;
  const oy = 64; // Row 2!
  const clip = { x0: ox + 1, y0: oy + 14, x1: ox + 14, y1: oy + 30 };

  // Grounded rosette base shadow
  c.fillEllipse('l01_base_stems', ox + 8, oy + 29.2, 5.2, 1.5, 'CAN0', undefined, clip);

  // Curved olive-emerald basal rosette leaves cradling the central bulb!
  const leaves: Array<{ x0: number; y0: number; x1: number; y1: number; lit: boolean }> = isNightOpen
    ? [
        { x0: 7, y0: 28, x1: 2, y1: 23, lit: true },
        { x0: 6, y0: 29, x1: 3, y1: 27, lit: true },
        { x0: 9, y0: 28, x1: 14, y1: 23, lit: false },
        { x0: 10, y0: 29, x1: 13, y1: 27, lit: false },
        { x0: 8, y0: 29, x1: 8, y1: 25, lit: true },
      ]
    : [
        { x0: 7, y0: 28, x1: 3, y1: 21, lit: true },
        { x0: 6, y0: 29, x1: 3, y1: 26, lit: true },
        { x0: 9, y0: 28, x1: 13, y1: 21, lit: false },
        { x0: 10, y0: 29, x1: 13, y1: 26, lit: false },
        { x0: 8, y0: 29, x1: 8, y1: 24, lit: true },
      ];

  for (const lf of leaves) {
    const steps = 14;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const lx = lf.x0 + (lf.x1 - lf.x0) * t;
      const ly = lf.y0 + (lf.y1 - lf.y0) * t - Math.sin(t * Math.PI) * 1.4;
      const px = Math.round(lx);
      const py = Math.round(ly);
      c.px('l01_base_stems', ox + px, oy + py + 1, 'CAN1');
      c.px(
        'l02_foliage_body',
        ox + px,
        oy + py,
        isNightOpen
          ? t < 0.45
            ? 'SUN1' // warm bioluminescent spill onto inner leaves!
            : lf.lit
              ? 'CAN5'
              : 'CAN3'
          : lf.lit
            ? t > 0.55
              ? 'CAN6'
              : 'CAN4'
            : 'CAN2'
      );
    }
  }

  // Stem supporting the central Sun-Drop bulb
  c.line('l01_base_stems', ox + 8, oy + 28, ox + 8, oy + 22, 'CAN3');
  c.px('l02_foliage_body', ox + 7, oy + 25, 'CAN5');

  if (!isNightOpen) {
    // COL 0 — DAY CLOSED POD: Plump sculpted tear-shaped warm ochre/amber flower bud!
    c.paintShadedBlob(
      'l02_foliage_body',
      ox + 8,
      oy + 20.5,
      3.3,
      4.4,
      ['KLP0', 'KLP1', 'KLP2', 'KLP3', 'KLP4', 'KLP5'],
      701,
      clip
    );
    // Pointed sepal tips hugging bottom of bud
    c.px('l02_foliage_body', ox + 6, oy + 23, 'CAN4');
    c.px('l02_foliage_body', ox + 8, oy + 24, 'CAN3');
    c.px('l02_foliage_body', ox + 10, oy + 23, 'CAN2');
    // Upper-left warm sunlit bud tip
    c.px('l03_bladders_glow', ox + 7, oy + 18, 'KLP5');
    c.px('l03_bladders_glow', ox + 8, oy + 16, 'KLP4');
  } else {
    // COL 1 — NIGHT OPEN BIOLUMINESCENT BLOSSOM: Radiant golden-lime star flower!
    // Outer soft radiant bioluminescent halo (low-alpha pixel glow!)
    c.fillEllipse('l03_bladders_glow', ox + 8, oy + 19.5, 6.0, 5.4, 'SUN1', 68, clip);
    c.fillEllipse('l03_bladders_glow', ox + 8, oy + 19.5, 4.4, 4.0, 'SUN2', 120, clip);

    // 5 opened glowing golden petals arcing out from the incandescent stamen core!
    const petals: Array<[number, number]> = [
      [8, 15],
      [4, 18],
      [12, 18],
      [5, 22],
      [11, 22],
    ];
    for (const [px, py] of petals) {
      c.line('l03_bladders_glow', ox + 8, oy + 19, ox + px, oy + py, 'SUN2');
      c.px('l03_bladders_glow', ox + px, oy + py, 'SUN3');
      c.px('l03_bladders_glow', ox + Math.round((8 + px) / 2), oy + Math.round((19 + py) / 2), 'SUN3');
    }
    // Incandescent ivory-white glowing pollen heart!
    c.fillEllipse('l03_bladders_glow', ox + 8, oy + 19.2, 2.2, 2.0, 'SUN3', undefined, clip);
    c.px('l03_bladders_glow', ox + 8, oy + 19, 'SUN4');
    c.px('l03_bladders_glow', ox + 7, oy + 19, 'SUN4');
    c.px('l03_bladders_glow', ox + 8, oy + 18, 'SUN4');
  }
}

function paintCordageFrond(c: WorldLayerCanvas, col: 0 | 1): void {
  const ox = col * 16;
  const oy = 96; // Row 3!
  const clip = { x0: ox + 1, y0: oy + 12, x1: ox + 14, y1: oy + 30 };

  // Root crown base at pivot (8, 30)
  c.fillEllipse('l01_base_stems', ox + 8, oy + 29.2, 3.8, 1.4, 'CAN0', undefined, clip);
  c.px('l01_base_stems', ox + 7, oy + 28, 'RED3');
  c.px('l01_base_stems', ox + 8, oy + 28, 'RED2');

  const fronds: Array<{ tipX: number; tipY: number; archY: number; lit: boolean }> =
    col === 0
      ? [
          { tipX: 2, tipY: 20, archY: -4.2, lit: true },
          { tipX: 8, tipY: 13, archY: -2.0, lit: true },
          { tipX: 14, tipY: 20, archY: -4.2, lit: false },
          { tipX: 4, tipY: 25, archY: -2.0, lit: true },
          { tipX: 12, tipY: 25, archY: -2.0, lit: false },
        ]
      : [
          { tipX: 2, tipY: 17, archY: -4.5, lit: true },
          { tipX: 6, tipY: 12, archY: -2.5, lit: true },
          { tipX: 13, tipY: 16, archY: -4.8, lit: false },
          { tipX: 14, tipY: 23, archY: -2.5, lit: false },
          { tipX: 4, tipY: 24, archY: -2.2, lit: true },
        ];

  for (const fr of fronds) {
    const steps = 18;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const fx = 8 + (fr.tipX - 8) * t;
      const fy = 28 + (fr.tipY - 28) * t + Math.sin(t * Math.PI) * fr.archY;
      const px = Math.round(fx);
      const py = Math.round(fy);
      if (ox + px < clip.x0 || ox + px > clip.x1 || oy + py < clip.y0 || oy + py > clip.y1) continue;

      // Central fibrous reed midrib with crisp deep-spruce underside shadow so fronds pop cleanly over MOS5 moss!
      c.px('l01_base_stems', ox + px, oy + py + 1, 'CAN0');
      c.px(
        'l02_foliage_body',
        ox + px,
        oy + py,
        t < 0.35 ? 'RED5' : fr.lit ? (t > 0.55 ? 'CAN8' : 'CAN6') : t > 0.65 ? 'CAN5' : 'CAN3'
      );

      // Feathered fern pinnae leaflets fanning delicately along the frond!
      if (s % 2 === 1 && t > 0.18 && t < 0.90) {
        if (oy + py - 1 >= clip.y0) c.px('l02_foliage_body', ox + px, oy + py - 1, fr.lit ? 'CAN7' : 'CAN5');
        if (oy + py + 1 <= clip.y1 - 1) c.px('l01_base_stems', ox + px, oy + py + 1, 'CAN1');
        if (ox + px - 1 >= clip.x0 && fr.tipX < 8) c.px('l02_foliage_body', ox + px - 1, oy + py - 1, 'CAN8');
        if (ox + px + 1 <= clip.x1 && fr.tipX > 8) c.px('l02_foliage_body', ox + px + 1, oy + py - 1, 'CAN6');
      }
    }
  }
}

export function buildAst005RimlandsFlora(): { canvas: WorldLayerCanvas; doc: ProjectDocument } {
  const c = new WorldLayerCanvas(64, 128, LAYERS);

  // Row 0: 4-frame Amber Tide-Kelp wind sway
  for (let col = 0; col < 4; col++) {
    paintAmberTideKelpFrame(c, col);
  }
  // Row 1: Mirror Glasswort A & B (Cols 2..3 strictly transparent!)
  paintMirrorGlasswort(c, 0);
  paintMirrorGlasswort(c, 1);
  // Row 2: Sun-Drop Bulb Day Closed & Night Glowing Open (Cols 2..3 strictly transparent!)
  paintSunDropBulb(c, false);
  paintSunDropBulb(c, true);
  // Row 3: Cordage Frond A & B (Cols 2..3 strictly transparent!)
  paintCordageFrond(c, 0);
  paintCordageFrond(c, 1);

  const doc = c.toProjectDocument({
    id: 'ast005-rimlands-flora-sheet',
    name: 'AST-005: Starter Rimlands Interactive Flora Sheet (64x128)',
    pivot: { x: 8, y: 30 },
    tileSize: 16,
    styleNotes:
      'Final production AST-005 flora sheet: Row 0 4-frame Amber Tide-Kelp wave sway, Row 1 Mirror Glasswort crystal variants A/B, Row 2 Sun-Drop Bulb Day closed & Night bioluminescent open, Row 3 Cordage Frond fern variants A/B; unused cells strictly transparent.',
  });

  return { canvas: c, doc };
}
