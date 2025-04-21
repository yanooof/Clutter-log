import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORY_KEY = 'CLUTTERLOG_CATEGORIES';

export async function getCategories(): Promise<string[]> {
    const json = await AsyncStorage.getItem(CATEGORY_KEY);
    return json ? JSON.parse(json) : [];
}

export async function addCategory(newCategory: string): Promise<void> {
    const current = await getCategories();
    const updated = [...new Set([...current, newCategory])];
    await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(updated));
}
