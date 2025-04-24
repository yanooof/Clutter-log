import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getItems, updateItem } from '@/utils/storage';
import { Item } from '@/types/Item';
import { Ionicons } from '@expo/vector-icons';

export default function DetailsScreen() {
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
        // No popup, just update state
    };

    if (!item) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-subtle">Item not found.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            {/* Top row: Back & Edit */}
            <View className="flex-row items-center justify-between px-4 pt-7 pb-2 bg-background z-10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-1 mr-2"
                    hitSlop={8}
                >
                    <Ionicons name="arrow-back" size={28} color="#8AB4F8" />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })}
                    className="p-1 ml-2"
                    hitSlop={8}
                >
                    <Ionicons name="create-outline" size={28} color="#8AB4F8" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                {/* Image or Placeholder */}
                <View className="w-full h-56 rounded-xl mb-4 items-center justify-center bg-hover overflow-hidden">
                    {item.photoUri ? (
                        <Image source={{ uri: item.photoUri }} className="w-full h-56 rounded-xl" />
                    ) : (
                        <Ionicons name="image-outline" size={72} color="#5F6368" />
                    )}
                </View>

                {/* Name */}
                <Text className="text-text text-2xl font-bold mb-2">{item.name}</Text>

                {/* Category, Location, Date - single line */}
                <View className="flex-row items-center flex-wrap gap-2 mb-3">
                    <Text className="text-subtle bg-surface px-2 py-1 rounded-lg mr-2 mb-1">
                        Category: <Text className="text-text">{item.category}</Text>
                    </Text>
                    <Text className="text-subtle bg-surface px-2 py-1 rounded-lg mr-2 mb-1">
                        Location: <Text className="text-text">{item.location}</Text>
                    </Text>
                    <Text className="text-subtle bg-surface px-2 py-1 rounded-lg mr-2 mb-1">
                        {new Date(item.dateAdded).toLocaleDateString()}
                    </Text>
                </View>

                {/* Notes */}
                <Text className="text-subtle font-semibold mb-1">Notes:</Text>
                <Text className={`mb-5 ${item.notes ? 'text-text' : 'text-subtle italic'}`}>
                    {item.notes || 'Unavailable'}
                </Text>

                {/* Usage status */}
                <View className="flex-row items-center mb-8">
                    <Ionicons
                        name={item.usedStatus === 'used' ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={item.usedStatus === 'used' ? "#34d399" : "#F87171"}
                        style={{ marginRight: 10 }}
                    />
                    <Text className="text-text text-base">
                        {item.usedStatus === 'used'
                            ? 'This item has been used in the past 30 days'
                            : 'This item has not been used in the past 30 days'}
                    </Text>
                </View>
            </ScrollView>

            {/* Usage Prompt Card at Bottom */}
            <View className="bg-surface px-6 py-6 rounded-t-2xl"
                  style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      elevation: 10,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: -4 },
                  }}>
                <Text className="text-text text-center text-base mb-4">
                    Have you used this item in the last 30 days?
                </Text>
                <View className="flex-row justify-center gap-5">
                    <TouchableOpacity
                        className="bg-accent px-7 py-3 rounded-lg mr-2"
                        onPress={() => handleUsedStatus('used')}
                    >
                        <Text className="text-background font-bold text-base">Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-highlight px-7 py-3 rounded-lg ml-2"
                        onPress={() => handleUsedStatus('unused')}
                    >
                        <Text className="text-background font-bold text-base">No</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}



