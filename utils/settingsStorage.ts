// utils/settingsStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'CLUTTERLOG_SETTINGS';

export type Settings = {
    remindersEnabled: boolean;
    secureModeEnabled: boolean;
};

const defaultSettings: Settings = {
    remindersEnabled: true,
    secureModeEnabled: false,
};

export async function getSettings(): Promise<Settings> {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    return json ? JSON.parse(json) : defaultSettings;
}

export async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    const current = await getSettings();
    const updated = { ...current, [key]: value };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}
