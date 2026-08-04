/**
 * Procedurally synthesizes every ambient audio loop Ebb ships with.
 * No samples, no licensed recordings — just noise synthesis, run once at dev time.
 * Usage: node scripts/generate-audio.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 24000;
const DURATION_S = 48; // was 16s — long enough that the repeat period stops being consciously noticeable
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

/**
 * Seamless loop via an equal-power crossfade of the tail into the head, IN
 * PLACE — not a fade to silence at each edge.
 *
 * The old version faded the first/last `edge` samples down to zero, which
 * avoided a click at the seam but created a periodic dip in loudness right
 * at the loop point — audible as a soft "breathing"/pumping pulse once per
 * loop. For stationary noise (rain, brown noise, wind…) any two equal-length
 * chunks are statistically interchangeable, so instead we blend the true
 * tail and true head with complementary sin/cos gains: for two uncorrelated
 * signals of equal variance, sin²+cos²=1 keeps total power constant across
 * the whole crossfade — the seam has no dip and no click, and the loop
 * point becomes inaudible rather than just less audible.
 */
function loopify(samples, crossfadeSeconds = 1.2) {
  const cf = Math.min(Math.floor(crossfadeSeconds * SAMPLE_RATE), Math.floor(samples.length / 4));
  const out = samples.slice();
  const head = samples.slice(0, cf);
  const tailStart = samples.length - cf;
  for (let i = 0; i < cf; i++) {
    const theta = (i / cf) * (Math.PI / 2);
    const gOut = Math.cos(theta); // the original tail fading out
    const gIn = Math.sin(theta); // the head fading in, in its place
    out[tailStart + i] = samples[tailStart + i] * gOut + head[i] * gIn;
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

function scale(samples, g) {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * g;
  return out;
}

/** A handful of very soft, very slow low-passed swells placed at irregular
 *  (non-repeating-sounding) times — the "felt, not heard" distant weight
 *  under rain, never loud or sudden enough to startle. */
function distantSwells(n, count, ampRange) {
  const out = new Float32Array(n);
  const minGapS = DURATION_S / (count + 1);
  let cursor = minGapS * (0.4 + Math.random() * 0.3) * SAMPLE_RATE;
  for (let k = 0; k < count && cursor < n; k++) {
    const riseMs = 900 + Math.random() * 1200;
    const holdMs = 400 + Math.random() * 800;
    const fallMs = 1400 + Math.random() * 1800;
    const totalSamples = Math.floor(((riseMs + holdMs + fallMs) / 1000) * SAMPLE_RATE);
    const amp = ampRange[0] + Math.random() * (ampRange[1] - ampRange[0]);
    const riseN = Math.floor((riseMs / 1000) * SAMPLE_RATE);
    const holdN = Math.floor((holdMs / 1000) * SAMPLE_RATE);
    let y = 0;
    for (let j = 0; j < totalSamples && cursor + j < n; j++) {
      let env;
      if (j < riseN) env = j / riseN;
      else if (j < riseN + holdN) env = 1;
      else env = Math.max(0, 1 - (j - riseN - holdN) / (totalSamples - riseN - holdN));
      const white = Math.random() * 2 - 1;
      y = y + 0.01 * (white - y); // heavy lowpass — felt warmth, not a hiss
      out[cursor + j] += y * amp * env;
    }
    cursor += totalSamples + minGapS * (0.7 + Math.random() * 0.9) * SAMPLE_RATE;
  }
  return out;
}

function generateRain() {
  // Bright filtered noise bed + dense tiny droplet impulses + an occasional,
  // very soft, very low distant swell so a long session doesn't feel like
  // the exact same texture on a tight repeat.
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
  const distant = distantSwells(N, 3, [0.05, 0.09]);
  return normalize(mix(scale(bed, 0.5), scale(drops, 0.6), distant), 0.8);
}

// Both generators below deliberately pick LFO frequencies that are whole
// multiples of 1/DURATION_S. A swell envelope needs to be periodic across
// exactly one loop for the seam to be silent — otherwise the loop crossfade
// is blending two samples that are honestly at different points in the
// swell (e.g. a wave cresting into a wave trough), which sounds like a
// jump in loudness once per loop no matter how carefully the noise
// underneath it is blended. Locking the frequency to the loop length makes
// the envelope itself perfectly seamless, so the noise crossfade only has
// to do the (much easier) job of smoothing texture, not amplitude.
function generateOcean() {
  // Crossfade the raw noise bed *before* the swell envelope is applied. The
  // envelope itself is already exactly periodic (locked to the loop length),
  // so it needs no blending at all — blending it would average two different
  // points on the swell curve and reintroduce the very loudness jump this is
  // meant to remove. Only the noise texture underneath needs the crossfade.
  const bed = loopify(brownNoise(N));
  const out = new Float32Array(N);
  const f1 = 4 / DURATION_S;
  const f2 = 1 / DURATION_S;
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    const swell = 0.55 + 0.45 * Math.sin(2 * Math.PI * t * f1) * Math.sin(2 * Math.PI * t * f2 + 1.4);
    out[i] = bed[i] * Math.max(0.15, swell);
  }
  return normalize(out, 0.85);
}

function generateWind() {
  const base = whiteNoise(N);
  const f1 = 2 / DURATION_S;
  const f2 = 6 / DURATION_S;
  const out = varyingLowpass(base, (i) => {
    const t = i / SAMPLE_RATE;
    const lfo = 0.15 + 0.1 * Math.sin(2 * Math.PI * t * f1) + 0.05 * Math.sin(2 * Math.PI * t * f2 + 2);
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
writeWav('ocean.wav', generateOcean()); // already loop-crossfaded internally, before the swell envelope
writeWav('wind.wav', loopify(generateWind()));
writeWav('fireplace.wav', loopify(generateFireplace()));
writeWav('brown-noise.wav', loopify(generateBrown()));
writeWav('room-tone.wav', loopify(generateRoomTone()));

console.log('Done. All ambient audio is procedurally generated — no external samples.');
