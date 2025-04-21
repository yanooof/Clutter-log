import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item } from '@/types/Item';

const ITEM_KEY = 'CLUTTERLOG_ITEMS';

export async function getItems(): Promise<Item[]> {
    const json = await AsyncStorage.getItem(ITEM_KEY);
    return json ? JSON.parse(json) : [];
}

export async function saveItem(item: Item): Promise<void> {
    const items = await getItems();
    items.push(item);
    await AsyncStorage.setItem(ITEM_KEY, JSON.stringify(items));
}

export async function updateItem(updated: Item): Promise<void> {
    const items = await getItems();
    const newList = items.map(item => item.id === updated.id ? updated : item);
    await AsyncStorage.setItem(ITEM_KEY, JSON.stringify(newList));
}

export async function deleteItem(id: string): Promise<void> {
    const items = await getItems();
    const newList = items.filter(item => item.id !== id);
    await AsyncStorage.setItem(ITEM_KEY, JSON.stringify(newList));
}
