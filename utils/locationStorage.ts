import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = 'CLUTTERLOG_LOCATIONS';

export async function getLocations(): Promise<string[]> {
    const json = await AsyncStorage.getItem(LOCATION_KEY);
    return json ? JSON.parse(json) : [];
}

export async function addLocation(newLocation: string): Promise<void> {
    const current = await getLocations();
    const updated = [...new Set([...current, newLocation])];
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(updated));
}

export async function editLocation(oldName: string, newName: string) {
    const current = await getLocations();
    const updated = current.map(loc => (loc === oldName ? newName : loc));
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(updated));
}

export async function deleteLocation(name: string) {
    const current = await getLocations();
    const updated = current.filter(loc => loc !== name);
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(updated));
}

