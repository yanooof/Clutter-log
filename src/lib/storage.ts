import AsyncStorage from '@react-native-async-storage/async-storage';
// eslint-disable-next-line import/no-unresolved
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  if (!value) return null; // no string → null
  try {
    // eslint-disable-next-line prettier/prettier
    return JSON.parse(value) as T;       // if parse works, you get T
  } catch {
    return null; // parse failed → null
  }
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.delete(key);
}

export interface ClutterItem {
  id: string;
  name: string;
  category: string;
  notes?: string;
  dateAdded: string; // ISO string
  photoUri?: string;
  lastChecked?: string; // for 30‑day check
}

const STORAGE_KEY = 'CLUTTER_ITEMS';

export async function loadItems(): Promise<ClutterItem[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function saveItems(items: ClutterItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
