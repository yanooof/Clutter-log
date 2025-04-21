import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { getItems } from '@/utils/storage';
import { Item } from '@/types/Item';

export default function ItemListScreen() {
    const [items, setItems] = useState<Item[]>([]);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const fetchItems = async () => {
                const savedItems = await getItems();
                setItems(savedItems);
            };

            fetchItems();
        }, [])
    );

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
        <View style={{ flex: 1 }}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/items/new')}
            >
                <Text style={{ color: 'white', fontSize: 24 }}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#222',
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
        backgroundColor: '#F30A14',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


