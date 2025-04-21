import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, Image } from 'react-native';
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
        <View className="bg-surface p-4 rounded-xl mb-4">
            <Text className="text-text font-bold text-lg mb-1">{item.name}</Text>
            {item.photoUri && (
                <Image source={{ uri: item.photoUri }} className="w-full h-48 rounded-lg mb-3" />
            )}
            <View className="flex-row justify-between">
                <TouchableOpacity
                    className="bg-green-600 py-2 px-4 rounded-md"
                    onPress={() => handleResponse(item, 'yes')}
                >
                    <Text className="text-white font-medium">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-red-500 py-2 px-4 rounded-md"
                    onPress={() => handleResponse(item, 'no')}
                >
                    <Text className="text-white font-medium">No</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background px-4 pt-4">
            {itemsToCheck.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-subtle">No items need checking!</Text>
                </View>
            ) : (
                <FlatList
                    data={itemsToCheck}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </View>
    );
}

