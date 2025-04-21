import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getItems } from '@/utils/storage';
import { Item } from '@/types/Item';
import { useRouter } from 'expo-router';

export default function ItemListScreen() {
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused'>('all');
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const fetchItems = async () => {
                const savedItems = await getItems();
                setAllItems(savedItems);
                applyFilters(savedItems);
            };
            fetchItems();
        }, [])
    );

    useEffect(() => {
        applyFilters();
    }, [filterCategory, filterStatus]);

    const applyFilters = (items = allItems) => {
        let filtered = [...items];
        if (filterCategory !== 'all') {
            filtered = filtered.filter((item) => item.category === filterCategory);
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter((item) => item.usedStatus === filterStatus);
        }
        setFilteredItems(filtered);
    };

    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            className="bg-surface p-4 rounded-xl mb-4"
            onPress={() => router.push(`/items/${item.id}`)}
        >
            <Text className="text-text font-bold text-lg">{item.name}</Text>
            <Text className="text-subtle">{item.category}</Text>
            <Text className="text-subtle">{new Date(item.dateAdded).toLocaleDateString()}</Text>
            <Text className={`font-semibold ${item.usedStatus === 'used' ? 'text-green-400' : 'text-red-400'}`}>
                {item.usedStatus === 'used' ? '✔ Used' : '⏱ Unused'}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background px-4 pt-4">
            <View className="mb-4 space-y-2">
                <View className="bg-surface rounded-md">
                    <Picker
                        selectedValue={filterCategory}
                        onValueChange={(val) => setFilterCategory(val)}
                        dropdownIconColor="#E8EAED"
                        style={{ color: '#E8EAED' }}
                    >
                        <Picker.Item label="All Categories" value="all" />
                        {[...new Set(allItems.map((item) => item.category))].map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                    </Picker>
                </View>

                <View className="bg-surface rounded-md">
                    <Picker
                        selectedValue={filterStatus}
                        onValueChange={(val) => setFilterStatus(val)}
                        dropdownIconColor="#E8EAED"
                        style={{ color: '#E8EAED' }}
                    >
                        <Picker.Item label="All" value="all" />
                        <Picker.Item label="Used" value="used" />
                        <Picker.Item label="Unused" value="unused" />
                    </Picker>
                </View>
            </View>

            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-accent rounded-full items-center justify-center shadow-lg"
                activeOpacity={0.85}
                onPress={() => router.push('/items/new')}
            >
                <Text className="text-white text-2xl">＋</Text>
            </TouchableOpacity>
        </View>
    );
}


