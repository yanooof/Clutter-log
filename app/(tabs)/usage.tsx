// app/(tabs)/usage.tsx
import { View, Text, FlatList, StyleSheet, Button, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { getItems, updateItem } from '@/utils/storage';
import { Item } from '@/types/Item';

export default function UsageCheckScreen() {
    const [itemsToCheck, setItemsToCheck] = useState<Item[]>([]);

    useFocusEffect(
        useCallback(() => {
            const fetchOldItems = async () => {
                const all = await getItems();
                const now = new Date();
                const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

                const filtered = all.filter((item) => {
                    const added = new Date(item.dateAdded).getTime();
                    const lastChecked = item.lastChecked ? new Date(item.lastChecked).getTime() : 0;
                    const shouldCheck = now.getTime() - Math.max(added, lastChecked) > THIRTY_DAYS;
                    return shouldCheck;
                });

                setItemsToCheck(filtered);
            };

            fetchOldItems();
        }, [])
    );

    const handleResponse = async (item: Item, response: 'yes' | 'no') => {
        const updatedItem: Item = {
            ...item,
            usedStatus: response === 'yes' ? 'used' : 'unused',
            lastChecked: new Date().toISOString(),
        };

        await updateItem(updatedItem);
        setItemsToCheck((prev) => prev.filter((i) => i.id !== item.id));
    };

    const renderItem = ({ item }: { item: Item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.image} />}
            <View style={styles.buttonRow}>
                <Button title="Yes" onPress={() => handleResponse(item, 'yes')} />
                <Button title="No" color="crimson" onPress={() => handleResponse(item, 'no')} />
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, padding: 16 }}>
            {itemsToCheck.length === 0 ? (
                <Text style={{ color: 'gray', textAlign: 'center' }}>No items need checking!</Text>
            ) : (
                <FlatList
                    data={itemsToCheck}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ gap: 12 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#222',
        padding: 16,
        borderRadius: 12,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
        marginBottom: 8,
    },
    image: {
        height: 160,
        width: '100%',
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
