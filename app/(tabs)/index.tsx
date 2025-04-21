import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { getItems } from '@/utils/storage';
import { Item } from '@/types/Item';
import {useEffect} from "react";
import {Picker} from "@react-native-picker/picker";

export default function ItemListScreen() {
    const [items, setItems] = useState<Item[]>([]);
    const router = useRouter();
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused'>('all');


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
        <Pressable
            style={styles.card}
            onPress={() => router.push(`/items/${item.id}`)} // ✅ tap to edit
        >
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.category}</Text>
            <Text>{new Date(item.dateAdded).toLocaleDateString()}</Text>
            <Text style={{ color: item.usedStatus === 'used' ? 'green' : 'red' }}>
                {item.usedStatus === 'used' ? '✔ Used' : '⏱ Unused'}
            </Text>
        </Pressable>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#1C1C1A' }}>
            {/* Filters at top */}
            <View style={{ padding: 12, backgroundColor: '#1C1C1A' }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1, backgroundColor: '#F2D0A7', borderRadius: 8 }}>
                        <Picker
                            selectedValue={filterCategory}
                            onValueChange={setFilterCategory}
                            dropdownIconColor="white"
                            style={{ color: 'white' }}
                        >
                            <Picker.Item label="All Categories" value="all" />
                            {[...new Set(allItems.map((item) => item.category))].map((cat) => (
                                <Picker.Item key={cat} label={cat} value={cat} />
                            ))}
                        </Picker>
                    </View>

                    <View style={{ flex: 1, backgroundColor: '#333', borderRadius: 8 }}>
                        <Picker
                            selectedValue={filterStatus}
                            onValueChange={setFilterStatus}
                            dropdownIconColor="white"
                            style={{ color: '#E6E4DD' }}
                        >
                            <Picker.Item label="All" value="all" />
                            <Picker.Item label="Used" value="used" />
                            <Picker.Item label="Unused" value="unused" />
                        </Picker>
                    </View>
                </View>
            </View>

            {/* Item list below filters */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/items/new')}
            >
                <Text style={{ color: '#E6E4DD', fontSize: 24 }}>＋</Text>
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#6D9773',
        padding: 12,
        marginBottom: 12,
        borderRadius: 10,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: '#D88C9A',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


