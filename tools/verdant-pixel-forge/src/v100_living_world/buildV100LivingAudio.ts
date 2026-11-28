import * as fs from 'node:fs';
import * as path from 'node:path';

const SAMPLE_RATE = 22050;
const REPO_ROOT = path.resolve(process.cwd(), '../..');
const AUDIO_AMBIENT = path.join(REPO_ROOT, 'game/audio/ambient');
const AUDIO_SFX = path.join(REPO_ROOT, 'game/audio/sfx');

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function writeWav16Mono(filePath: string, samples: Float32Array): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const dataBytes = samples.length * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); // PCM chunk size
  buf.writeUInt16LE(1, 20); // PCM format
  buf.writeUInt16LE(1, 22); // Mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
}

/**
 * Seamlessly loops a generated ambient array by crossfading the tail into the head.
 */
function makeSeamlessLoop(raw: Float32Array, loopLen: number, fadeLen: number): Float32Array {
  const out = new Float32Array(loopLen);
  for (let i = 0; i < loopLen; i++) {
    out[i] = raw[i];
  }
  for (let i = 0; i < fadeLen; i++) {
    const t = i / fadeLen;
    const wA = Math.sin(t * Math.PI * 0.5);
    const wB = Math.cos(t * Math.PI * 0.5);
    out[i] = raw[i] * wA + raw[loopLen + i] * wB;
  }
  return out;
}

/**
 * 1. COASTAL SURF & SEA-BREEZE AMBIENCE (4.0 s seamless loop)
 * Warm filtered brown/pink ocean swell gently rolling ashore + soft salt-air hiss.
 */
function buildCoastalSurfLoop(): Float32Array {
  const loopLen = SAMPLE_RATE * 4;
  const fadeLen = Math.floor(SAMPLE_RATE * 0.45);
  const total = loopLen + fadeLen;
  const raw = new Float32Array(total);
  const rnd = mulberry32(9011);

  let lpDeep = 0;
  let lpMid = 0;
  let lpAir = 0;
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const white = rnd() * 2 - 1;
    // Rolling ocean swell envelope (two gentle overlapping wave crests per 4s cycle!)
    const swell = 0.58 + 0.34 * Math.sin(t * Math.PI * 0.5 - 0.5) + 0.14 * Math.sin(t * Math.PI * 1.0 + 0.8);
    const foam = Math.pow(Math.max(0, Math.sin(t * Math.PI * 0.5 - 0.15)), 2.2);

    lpDeep += (white - lpDeep) * 0.018;
    lpMid += (white - lpMid) * 0.085;
    lpAir += (white - lpAir) * 0.24;

    const oceanBody = lpDeep * 0.72 * swell;
    const surfWash = (lpMid - lpDeep) * (0.28 + foam * 0.36);
    const breeze = (lpAir - lpMid) * (0.06 + foam * 0.08);
    raw[i] = (oceanBody + surfWash + breeze) * 0.42;
  }
  return makeSeamlessLoop(raw, loopLen, fadeLen);
}

/**
 * 2. LIVING FOREST CANOPY & DISTANT SINGING REEDWOOD AMBIENCE (4.0 s seamless loop)
 * Soft emerald foliage breeze rustle + subtle distant ethereal reedwood harmonic drone.
 */
function buildForestCanopyLoop(): Float32Array {
  const loopLen = SAMPLE_RATE * 4;
  const fadeLen = Math.floor(SAMPLE_RATE * 0.45);
  const total = loopLen + fadeLen;
  const raw = new Float32Array(total);
  const rnd = mulberry32(8042);

  let lp1 = 0;
  let lp2 = 0;
  let hpPrev = 0;
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const white = rnd() * 2 - 1;
    const rustleEnv = 0.55 + 0.35 * Math.sin(t * Math.PI * 0.5 + 0.4) + 0.12 * Math.cos(t * Math.PI * 1.5);
    lp1 += (white - lp1) * 0.04;
    lp2 += (white - lp2) * 0.18;
    const bandLeaf = (lp2 - lp1) * 0.42 * rustleEnv;
    const shimmer = (white - hpPrev) * 0.012 * rustleEnv;
    hpPrev = white;

    // Gentle distant organic reedwood wind-chime resonance (D-minor pentatonic harmonics!)
    const chimeEnv1 = Math.exp(-Math.pow((t - 1.1) / 0.55, 2));
    const chimeEnv2 = Math.exp(-Math.pow((t - 2.9) / 0.62, 2));
    const chime =
      chimeEnv1 * (Math.sin(2 * Math.PI * 587.33 * t) * 0.032 + Math.sin(2 * Math.PI * 880.0 * t) * 0.016) +
      chimeEnv2 * (Math.sin(2 * Math.PI * 440.0 * t) * 0.028 + Math.sin(2 * Math.PI * 659.25 * t) * 0.014);

    raw[i] = (bandLeaf + shimmer + chime) * 0.38;
  }
  return makeSeamlessLoop(raw, loopLen, fadeLen);
}

/**
 * 3. SURFACE FOOTSTEPS (sand, grass, shallow water) — short subtle tactile Foley taps!
 */
function buildFootstepSand(): Float32Array {
  const len = Math.floor(SAMPLE_RATE * 0.11);
  const out = new Float32Array(len);
  const rnd = mulberry32(1101);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const u = i / len;
    const env = Math.sin(Math.pow(u, 0.55) * Math.PI) * (1 - u * 0.45);
    const n = rnd() * 2 - 1;
    lp += (n - lp) * 0.32;
    const grit = (n - lp) * 0.45 + lp * 0.30;
    out[i] = grit * env * 0.36;
  }
  return out;
}

function buildFootstepGrass(): Float32Array {
  const len = Math.floor(SAMPLE_RATE * 0.10);
  const out = new Float32Array(len);
  const rnd = mulberry32(1202);
  let lp1 = 0;
  let lp2 = 0;
  for (let i = 0; i < len; i++) {
    const u = i / len;
    const env = Math.sin(u * Math.PI) * Math.exp(-u * 1.4);
    const n = rnd() * 2 - 1;
    lp1 += (n - lp1) * 0.09;
    lp2 += (n - lp2) * 0.28;
    out[i] = (lp2 - lp1) * env * 0.42;
  }
  return out;
}

function buildFootstepWater(): Float32Array {
  const len = Math.floor(SAMPLE_RATE * 0.16);
  const out = new Float32Array(len);
  const rnd = mulberry32(1303);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const u = i / len;
    const env = Math.sin(Math.pow(u, 0.42) * Math.PI) * Math.exp(-u * 1.8);
    const n = rnd() * 2 - 1;
    lp += (n - lp) * 0.22;
    // Soft droplet plink rising pitch inside water splash
    const drop = Math.sin(2 * Math.PI * (520 + u * 480) * t) * Math.exp(-u * 6.5) * 0.24;
    out[i] = ((n - lp) * 0.46 + drop) * env * 0.42;
  }
  return out;
}

/**
 * 4. ACOUSTIC FIELD LENS HARMONIC PULSE CHIME (0.45 s)
 */
function buildAcousticLensChime(): Float32Array {
  const len = Math.floor(SAMPLE_RATE * 0.45);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const u = i / len;
    const attack = Math.min(1, u / 0.06);
    const decay = Math.exp(-u * 4.4);
    const env = attack * decay;
    const f1 = 528.0 + u * 24.0;
    const f2 = 792.0 + u * 36.0;
    const f3 = 1056.0;
    out[i] =
      (Math.sin(2 * Math.PI * f1 * t) * 0.48 +
        Math.sin(2 * Math.PI * f2 * t) * 0.28 +
        Math.sin(2 * Math.PI * f3 * t) * 0.14) *
      env *
      0.34;
  }
  return out;
}

function main(): void {
  writeWav16Mono(path.join(AUDIO_AMBIENT, 'coastal_surf_breeze.wav'), buildCoastalSurfLoop());
  writeWav16Mono(path.join(AUDIO_AMBIENT, 'living_forest_canopy.wav'), buildForestCanopyLoop());
  writeWav16Mono(path.join(AUDIO_SFX, 'step_sand.wav'), buildFootstepSand());
  writeWav16Mono(path.join(AUDIO_SFX, 'step_grass.wav'), buildFootstepGrass());
  writeWav16Mono(path.join(AUDIO_SFX, 'step_water.wav'), buildFootstepWater());
  writeWav16Mono(path.join(AUDIO_SFX, 'acoustic_lens_chime.wav'), buildAcousticLensChime());
  console.log('Generated 6 deterministic V10.0 living world audio WAV assets!');
}

main();
