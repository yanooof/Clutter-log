import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getItems, updateItem } from '@/utils/storage';
import { Item } from '@/types/Item';
import { Ionicons } from '@expo/vector-icons';

export default function UsageScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
            const items = await getItems();
            const found = items.find(i => i.id === id);
            setItem(found ?? null);
        };
        fetchItem();
    }, [id]);

    const handleUsedStatus = async (status: 'used' | 'unused') => {
        if (!item) return;
        const updated: Item = {
            ...item,
            usedStatus: status,
            lastChecked: new Date().toISOString(),
        };
        await updateItem(updated);
        setItem(updated);
        Alert.alert('Updated!', `Marked as ${status === 'used' ? 'used' : 'unused'}.`);
    };

    if (!item) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-subtle">Item not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-background px-5 pt-6">
            {/* Edit Button */}
            <TouchableOpacity
                style={{ position: 'absolute', top: 30, right: 18, zIndex: 1 }}
                onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })}
            >
                <Ionicons name="create-outline" size={28} color="#8AB4F8" />
            </TouchableOpacity>

            {/* Item Details */}
            {item.photoUri && (
                <Image source={{ uri: item.photoUri }} className="w-full h-56 rounded-xl mb-5" />
            )}
            <Text className="text-text text-2xl font-bold mb-2">{item.name}</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
                <Text className="text-subtle bg-surface px-2 py-1 rounded-lg mr-2 mb-1">
                    Category: <Text className="text-text">{item.category}</Text>
                </Text>
                <Text className="text-subtle bg-surface px-2 py-1 rounded-lg mr-2 mb-1">
                    Location: <Text className="text-text">{item.location}</Text>
                </Text>
            </View>
            <Text className="text-subtle mb-2">Added: {new Date(item.dateAdded).toLocaleDateString()}</Text>
            <Text className="text-subtle mb-6">{item.notes}</Text>
            <Text className={`font-bold mb-6 ${item.usedStatus === 'used' ? 'text-green-400' : 'text-red-400'}`}>
                {item.usedStatus === 'used' ? '✔ Used in last 30 days' : '⏱ Unused'}
            </Text>

            {/* Usage Prompt */}
            <View className="bg-surface p-4 rounded-lg mt-8">
                <Text className="text-text text-lg mb-4">
                    Have you used this item in the last 30 days?
                </Text>
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        className="bg-green-600 py-2 px-5 rounded-md"
                        onPress={() => handleUsedStatus('used')}
                    >
                        <Text className="text-white font-bold">Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-red-500 py-2 px-5 rounded-md"
                        onPress={() => handleUsedStatus('unused')}
                    >
                        <Text className="text-white font-bold">No</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}


