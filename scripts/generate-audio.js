/**
 * Procedurally synthesizes every ambient audio loop Ebb ships with.
 * No samples, no licensed recordings — just noise synthesis, run once at dev time.
 * Usage: node scripts/generate-audio.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 24000;
const DURATION_S = 16;
const N = SAMPLE_RATE * DURATION_S;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'audio');

function writeWav(filename, floatSamples) {
  const buffer = Buffer.alloc(44 + floatSamples.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + floatSamples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(floatSamples.length * 2, 40);
  for (let i = 0; i < floatSamples.length; i++) {
    const s = Math.max(-1, Math.min(1, floatSamples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log('wrote', outPath, `${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
}

/** Seam-safe: fades the first/last `edge` samples to 0 so loop() has no click. */
function loopify(samples, edgeSeconds = 0.35) {
  const edge = Math.floor(edgeSeconds * SAMPLE_RATE);
  const out = samples.slice();
  for (let i = 0; i < edge; i++) {
    const g = i / edge;
    out[i] *= g;
    out[out.length - 1 - i] *= g;
  }
  return out;
}

function whiteNoise(n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.random() * 2 - 1;
  return out;
}

/** Classic Paul Kellet pink noise filter. */
function pinkNoise(n) {
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    out[i] = pink * 0.11;
  }
  return out;
}

/** Leaky-integrated white noise = brown/red noise. */
function brownNoise(n) {
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    out[i] = last * 3.2;
  }
  return out;
}

/** Simple one-pole lowpass, cutoff can vary sample-to-sample for wind-like movement. */
function varyingLowpass(input, cutoffFn) {
  const out = new Float32Array(input.length);
  let y = 0;
  for (let i = 0; i < input.length; i++) {
    const alpha = cutoffFn(i);
    y = y + alpha * (input[i] - y);
    out[i] = y;
  }
  return out;
}

function normalize(samples, peak = 0.85) {
  let max = 0;
  for (let i = 0; i < samples.length; i++) max = Math.max(max, Math.abs(samples[i]));
  const gain = max > 0 ? peak / max : 1;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * gain;
  return out;
}

function mix(...tracks) {
  const n = tracks[0].length;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (const t of tracks) s += t[i];
    out[i] = s;
  }
  return out;
}

function generateRain() {
  // Bright filtered noise bed + dense tiny droplet impulses.
  const bed = varyingLowpass(whiteNoise(N), () => 0.35);
  const drops = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    if (Math.random() < 0.02) {
      const len = Math.floor(SAMPLE_RATE * (0.005 + Math.random() * 0.015));
      const amp = 0.4 + Math.random() * 0.6;
      for (let j = 0; j < len && i + j < N; j++) {
        drops[i + j] += amp * (1 - j / len) * (Math.random() * 2 - 1);
      }
    }
  }
  return normalize(mix(scale(bed, 0.5), scale(drops, 0.6)), 0.8);
}

function scale(samples, g) {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * g;
  return out;
}

function generateOcean() {
  const bed = brownNoise(N);
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    const swell = 0.55 + 0.45 * Math.sin(2 * Math.PI * t * 0.09) * Math.sin(2 * Math.PI * t * 0.023 + 1.4);
    out[i] = bed[i] * Math.max(0.15, swell);
  }
  return normalize(out, 0.85);
}

function generateWind() {
  const base = whiteNoise(N);
  const out = varyingLowpass(base, (i) => {
    const t = i / SAMPLE_RATE;
    const lfo = 0.15 + 0.1 * Math.sin(2 * Math.PI * t * 0.045) + 0.05 * Math.sin(2 * Math.PI * t * 0.13 + 2);
    return Math.max(0.02, lfo);
  });
  return normalize(out, 0.8);
}

function generateFireplace() {
  const bed = scale(brownNoise(N), 0.35);
  const crackle = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    if (Math.random() < 0.006) {
      const len = Math.floor(SAMPLE_RATE * (0.01 + Math.random() * 0.03));
      const amp = 0.3 + Math.random() * 0.7;
      for (let j = 0; j < len && i + j < N; j++) {
        crackle[i + j] += amp * Math.exp(-j / (len * 0.3)) * (Math.random() * 2 - 1);
      }
    }
  }
  return normalize(mix(bed, crackle), 0.85);
}

function generateBrown() {
  return normalize(brownNoise(N), 0.8);
}

function generateRoomTone() {
  return normalize(scale(pinkNoise(N), 0.35), 0.35);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

writeWav('rain.wav', loopify(generateRain()));
writeWav('ocean.wav', loopify(generateOcean()));
writeWav('wind.wav', loopify(generateWind()));
writeWav('fireplace.wav', loopify(generateFireplace()));
writeWav('brown-noise.wav', loopify(generateBrown()));
writeWav('room-tone.wav', loopify(generateRoomTone()));

console.log('Done. All ambient audio is procedurally generated — no external samples.');
