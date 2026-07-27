export type SoundId = 'rain' | 'ocean' | 'wind' | 'fireplace' | 'brown' | 'room';

export const SOUND_SOURCES: Record<SoundId, number> = {
  rain: require('../../assets/audio/rain.wav'),
  ocean: require('../../assets/audio/ocean.wav'),
  wind: require('../../assets/audio/wind.wav'),
  fireplace: require('../../assets/audio/fireplace.wav'),
  brown: require('../../assets/audio/brown-noise.wav'),
  room: require('../../assets/audio/room-tone.wav'),
};

export const SOUND_LABELS: Record<SoundId, string> = {
  rain: 'Rain',
  ocean: 'Ocean',
  wind: 'Wind',
  fireplace: 'Fireplace',
  brown: 'Brown noise',
  room: 'Soft room',
};

/** Which ambient bed matches each visual environment, for auto-playing during a session. */
export function soundForEnvironment(id: string): SoundId {
  switch (id) {
    case 'rain':
      return 'rain';
    case 'ocean':
      return 'ocean';
    case 'fire':
      return 'fireplace';
    case 'forest':
      return 'wind';
    case 'night':
    case 'clouds':
      return 'room';
    default:
      return 'brown';
  }
}
