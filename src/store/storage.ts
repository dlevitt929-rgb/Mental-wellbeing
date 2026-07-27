import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Everything the app persists lives only on-device in AsyncStorage. Nothing here is ever uploaded. */
export const localStorage = createJSONStorage(() => AsyncStorage);
