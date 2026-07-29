import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { AppState, AppStateStatus } from 'react-native';
import { create } from 'zustand';
import { SOUND_SOURCES, SoundId } from '@/engines/soundEngine';

/**
 * The single source of truth for ambient audio in the app.
 *
 * The whole design exists to answer one question reliably at any moment:
 * "what is playing, why, and who is allowed to stop it?"
 *
 * Two decks (A/B) let us genuinely crossfade between sounds instead of
 * stopping one and starting another. Every caller identifies itself with an
 * `ownerId` — `release()` only has effect if the caller still owns playback,
 * which is what prevents a slow-to-unmount screen from killing audio that a
 * screen navigated *to* has already started (the classic "old sound survives
 * rapid navigation" bug).
 */

interface AudioManagerState {
  ownerId: string | null;
  soundId: SoundId | null;
  playing: boolean;
  muted: boolean;
}

export const useAudioManagerStore = create<AudioManagerState>(() => ({
  ownerId: null,
  soundId: null,
  playing: false,
  muted: false,
}));

let deckA: AudioPlayer | null = null;
let deckB: AudioPlayer | null = null;
let activeDeck: 'A' | 'B' = 'A';
let initialized = false;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
let baseVolume = 0;
let duckDepth = 0;
let requestSeq = 0;

function activePlayer(): AudioPlayer {
  return (activeDeck === 'A' ? deckA : deckB) as AudioPlayer;
}
function inactivePlayer(): AudioPlayer {
  return (activeDeck === 'A' ? deckB : deckA) as AudioPlayer;
}

function clearFade() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function effectiveVolume(): number {
  return useAudioManagerStore.getState().muted ? 0 : baseVolume * (1 - duckDepth);
}

function rampVolume(player: AudioPlayer, to: number, ms: number, onDone?: () => void) {
  clearFade();
  const from = player.volume ?? 0;
  if (ms <= 0) {
    player.volume = to;
    onDone?.();
    return;
  }
  const steps = Math.max(1, Math.round(ms / 50));
  let step = 0;
  fadeTimer = setInterval(() => {
    step += 1;
    const t = Math.min(1, step / steps);
    player.volume = from + (to - from) * t;
    if (t >= 1) {
      clearFade();
      onDone?.();
    }
  }, 50);
}

function handleAppStateChange(state: AppStateStatus) {
  if (!initialized) return;
  const { playing } = useAudioManagerStore.getState();
  if (!playing) return;
  if (state === 'active') {
    activePlayer().play();
  } else {
    activePlayer().pause();
  }
}

function ensureInitialized() {
  if (initialized) return;
  deckA = createAudioPlayer(null, { updateInterval: 500 });
  deckB = createAudioPlayer(null, { updateInterval: 500 });
  deckA.loop = true;
  deckB.loop = true;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => {});
  AppState.addEventListener('change', handleAppStateChange);
  initialized = true;
}

export const AudioManager = {
  /** Call once near the app root. Safe to call more than once. */
  init: ensureInitialized,

  /**
   * Claim ambient audio for `ownerId`. If something else is already playing,
   * crossfades between decks. If the same owner asks for the same sound
   * again (e.g. a re-render), it's treated as a no-op restart guard — only
   * the volume glides to the new target.
   */
  request(ownerId: string, soundId: SoundId, opts: { volume?: number; fadeMs?: number } = {}) {
    ensureInitialized();
    const mySeq = ++requestSeq;
    const { soundId: currentSound, ownerId: currentOwner } = useAudioManagerStore.getState();
    const targetVolume = opts.volume ?? 0.4;
    const fadeMs = opts.fadeMs ?? 900;

    if (currentOwner === ownerId && currentSound === soundId) {
      baseVolume = targetVolume;
      rampVolume(activePlayer(), effectiveVolume(), Math.min(fadeMs, 500));
      return;
    }

    baseVolume = targetVolume;

    if (currentSound === null) {
      const p = activePlayer();
      p.replace(SOUND_SOURCES[soundId]);
      p.volume = 0;
      p.play();
      rampVolume(p, effectiveVolume(), fadeMs);
    } else {
      const outgoing = activePlayer();
      const incoming = inactivePlayer();
      incoming.replace(SOUND_SOURCES[soundId]);
      incoming.volume = 0;
      incoming.play();

      clearFade();
      const steps = Math.max(1, Math.round(fadeMs / 50));
      const outStart = outgoing.volume ?? 0;
      const inTarget = effectiveVolume();
      let step = 0;
      fadeTimer = setInterval(() => {
        step += 1;
        const t = Math.min(1, step / steps);
        outgoing.volume = outStart * (1 - t);
        incoming.volume = inTarget * t;
        if (t >= 1) {
          clearFade();
          // Only finalize the swap if nothing newer has been requested since.
          if (mySeq === requestSeq) {
            outgoing.pause();
            activeDeck = activeDeck === 'A' ? 'B' : 'A';
          }
        }
      }, 50);
    }

    useAudioManagerStore.setState({ ownerId, soundId, playing: true });
  },

  /** Only stops playback if `ownerId` is still the current owner. */
  release(ownerId: string, fadeMs = 900) {
    const { ownerId: currentOwner } = useAudioManagerStore.getState();
    if (currentOwner !== ownerId) return;
    const mySeq = ++requestSeq;
    const p = activePlayer();
    rampVolume(p, 0, fadeMs, () => {
      if (mySeq === requestSeq) p.pause();
    });
    baseVolume = 0;
    duckDepth = 0;
    useAudioManagerStore.setState({ ownerId: null, soundId: null, playing: false });
  },

  /** Unconditional — for safety-critical entry points (e.g. Panic mode) that must always win. */
  stopAll(fadeMs = 300) {
    requestSeq += 1;
    if (deckA) rampVolume(deckA, 0, fadeMs, () => deckA?.pause());
    if (deckB) {
      const p = deckB;
      setTimeout(() => p.pause(), fadeMs + 20);
    }
    baseVolume = 0;
    duckDepth = 0;
    useAudioManagerStore.setState({ ownerId: null, soundId: null, playing: false });
  },

  /** Gently lower whatever is currently active — used while reassurance text is "speaking". */
  duckCurrent(depth = 0.55, ms = 350) {
    if (!useAudioManagerStore.getState().playing) return;
    duckDepth = depth;
    rampVolume(activePlayer(), effectiveVolume(), ms);
  },

  unduckCurrent(ms = 350) {
    if (!useAudioManagerStore.getState().playing) return;
    duckDepth = 0;
    rampVolume(activePlayer(), effectiveVolume(), ms);
  },

  setMuted(muted: boolean) {
    useAudioManagerStore.setState({ muted });
    if (!initialized) return;
    rampVolume(activePlayer(), effectiveVolume(), 250);
  },
};
