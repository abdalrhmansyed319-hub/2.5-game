/**
 * VERDANT SIGNAL — V11.0 "The Art of Immersion"
 * Deterministic 16-bit Mono 22050Hz PCM WAV Immersion Soundscape Generator
 *
 * Synthesizes 6 delicate, atmospheric, organic SFX & proximity resonance assets
 * matching Deliverable O (marimba/kalimba overtones, breathy reed-flute fifths,
 * hollow titanium interior footsteps, acoustic blight dampening, glider mimicry):
 *   1. game/audio/sfx/step_metal.wav
 *   2. game/audio/sfx/sample_confirm.wav
 *   3. game/audio/sfx/insight_discovery.wav
 *   4. game/audio/sfx/blight_static.wav
 *   5. game/audio/sfx/glider_mimic_call.wav
 *   6. game/audio/ambient/waymarker_resonance.wav (seamless loop)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const AUDIO_SFX_DIR = path.join(REPO_ROOT, 'game/audio/sfx');
const AUDIO_AMB_DIR = path.join(REPO_ROOT, 'game/audio/ambient');
const SAMPLE_RATE = 22050;

function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function writeMonoWav16(filePath: string, samples: Float32Array): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // Mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
}

/** 1. Subtle hollow metallic deck-grating footstep inside breached ICV Meridian */
function synthStepMetal(): Float32Array {
  const dur = 0.13;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  const rand = seededRand(11011);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.004);
    const thud = Math.sin(2 * Math.PI * 165 * t) * Math.exp(-t * 42) * 0.48;
    const plate1 = Math.sin(2 * Math.PI * 418 * t) * Math.exp(-t * 32) * 0.24;
    const plate2 = Math.sin(2 * Math.PI * 742 * t) * Math.exp(-t * 48) * 0.14;
    const grit = (rand() * 2 - 1) * Math.exp(-t * 75) * 0.22;
    out[i] = attack * (thud + plate1 + plate2 + grit) * 0.65;
  }
  return out;
}

/** 2. Warm rising organic marimba/glass field-sample confirmation chime */
function synthSampleConfirm(): Float32Array {
  const dur = 0.42;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  // Warm major ninth interval: D5 (587.33 Hz) -> A5 (880 Hz)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    // Note 1 at t = 0.0
    const env1 = Math.min(1, t / 0.008) * Math.exp(-t * 8.5);
    v += (Math.sin(2 * Math.PI * 587.33 * t) + 0.26 * Math.sin(2 * Math.PI * 1174.66 * t)) * env1 * 0.36;
    // Note 2 at t = 0.11
    if (t >= 0.11) {
      const t2 = t - 0.11;
      const env2 = Math.min(1, t2 / 0.01) * Math.exp(-t2 * 6.8);
      v += (Math.sin(2 * Math.PI * 880.0 * t2) + 0.22 * Math.sin(2 * Math.PI * 1760.0 * t2)) * env2 * 0.38;
    }
    out[i] = v * 0.72;
  }
  return out;
}

/** 3. Emotional 3-note harmonic wonder swell for Emergent Field Insights */
function synthInsightDiscovery(): Float32Array {
  const dur = 1.25;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  const rand = seededRand(11033);
  // Warm D4 (293.66) -> A4 (440.0) -> E5 (659.25) -> F#5 (739.99) airy flute/glass chord
  const notes = [
    { start: 0.0, freq: 293.66, amp: 0.26, decay: 2.1 },
    { start: 0.16, freq: 440.0, amp: 0.24, decay: 2.3 },
    { start: 0.34, freq: 659.25, amp: 0.22, decay: 2.5 },
    { start: 0.50, freq: 739.99, amp: 0.18, decay: 2.8 },
  ];
  let breathLp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let sum = 0;
    for (const note of notes) {
      if (t < note.start) continue;
      const nt = t - note.start;
      const atk = Math.min(1, nt / 0.045);
      const vib = 1 + 0.0025 * Math.sin(2 * Math.PI * 4.8 * nt);
      const env = atk * Math.exp(-nt * note.decay);
      sum +=
        (Math.sin(2 * Math.PI * note.freq * vib * nt) +
          0.18 * Math.sin(2 * Math.PI * note.freq * 2.0 * nt) * Math.exp(-nt * 4.0)) *
        env *
        note.amp;
    }
    breathLp = breathLp * 0.94 + (rand() * 2 - 1) * 0.06;
    const breathEnv = Math.sin(Math.min(1, t / dur) * Math.PI) * 0.06;
    const tailFade = t > dur - 0.15 ? Math.max(0, (dur - t) / 0.15) : 1;
    out[i] = (sum + breathLp * breathEnv) * tailFade * 0.85;
  }
  return out;
}

/** 4. Subtle brief dry acoustic damping / dissonant micro-static for Metallic Blight */
function synthBlightStatic(): Float32Array {
  const dur = 0.38;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  const rand = seededRand(11044);
  let hpPrev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const raw = rand() * 2 - 1;
    const hp = raw - hpPrev * 0.82;
    hpPrev = raw;
    const env = Math.min(1, t / 0.015) * Math.exp(-t * 8.2);
    // Slightly dissonant tritone beat (233 Hz + 329.6 Hz) muffled beneath dry static
    const diss =
      (Math.sin(2 * Math.PI * 233.0 * t) * 0.24 + Math.sin(2 * Math.PI * 329.6 * t) * 0.18) *
      Math.exp(-t * 9.5);
    const crackle = Math.abs(raw) > 0.88 ? raw * 0.32 : 0;
    out[i] = (hp * 0.24 + crackle + diss) * env * 0.65;
  }
  return out;
}

/** 5. Delicate distant Chime-Wing Glider flute-trill answering Mara's Acoustic Lens */
function synthGliderMimicCall(): Float32Array {
  const dur = 0.56;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Two airy rising-falling avian crystal notes
    let v = 0;
    if (t < 0.24) {
      const u = t / 0.24;
      const f = 1046.5 + Math.sin(u * Math.PI) * 210.0;
      const env = Math.sin(u * Math.PI) * Math.exp(-t * 3.0);
      v += Math.sin(2 * Math.PI * f * t) * env * 0.34;
    }
    if (t >= 0.20) {
      const t2 = t - 0.20;
      const u2 = Math.min(1, t2 / 0.34);
      const f2 = 1318.5 - u2 * 145.0 + Math.sin(t2 * 38.0) * 18.0;
      const env2 = Math.sin(u2 * Math.PI) * Math.exp(-t2 * 3.6);
      v += (Math.sin(2 * Math.PI * f2 * t2) + 0.16 * Math.sin(2 * Math.PI * f2 * 2 * t2)) * env2 * 0.30;
    }
    out[i] = v * 0.68;
  }
  return out;
}

/** 6. Seamless 2.0s ultra-gentle piezo-quartz / reedwood spatial landmark hum */
function synthWaymarkerResonance(): Float32Array {
  const dur = 2.0;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  // Exact integer cycles over 2.0s for mathematically seamless zero-click loop!
  // 146.0 Hz (292 cycles), 219.0 Hz (438 cycles — pure fifth), 438.0 Hz (876 cycles)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const breath = 0.72 + 0.28 * Math.sin(2 * Math.PI * 0.5 * t); // 1 exact cycle over 2s
    const shimmer = 0.55 + 0.45 * Math.sin(2 * Math.PI * 1.0 * t + 0.8); // 2 exact cycles over 2s
    const fundamental = Math.sin(2 * Math.PI * 146.0 * t) * 0.28;
    const fifth = Math.sin(2 * Math.PI * 219.0 * t) * 0.20 * breath;
    const glassy = Math.sin(2 * Math.PI * 438.0 * t) * 0.08 * shimmer;
    out[i] = (fundamental + fifth + glassy) * 0.52;
  }
  return out;
}

function main(): void {
  const outputs: Array<{ dir: string; file: string; data: Float32Array }> = [
    { dir: AUDIO_SFX_DIR, file: 'step_metal.wav', data: synthStepMetal() },
    { dir: AUDIO_SFX_DIR, file: 'sample_confirm.wav', data: synthSampleConfirm() },
    { dir: AUDIO_SFX_DIR, file: 'insight_discovery.wav', data: synthInsightDiscovery() },
    { dir: AUDIO_SFX_DIR, file: 'blight_static.wav', data: synthBlightStatic() },
    { dir: AUDIO_SFX_DIR, file: 'glider_mimic_call.wav', data: synthGliderMimicCall() },
    { dir: AUDIO_AMB_DIR, file: 'waymarker_resonance.wav', data: synthWaymarkerResonance() },
  ];

  for (const item of outputs) {
    const abs = path.join(item.dir, item.file);
    writeMonoWav16(abs, item.data);
    const kb = (fs.statSync(abs).size / 1024).toFixed(1);
    console.log(`Built ${path.relative(REPO_ROOT, abs)} (${kb} KB)`);
  }
}

main();
