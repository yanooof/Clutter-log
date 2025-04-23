import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {FlatList, Modal, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getItems } from '@/utils/storage';
import { Item } from '@/types/Item';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ItemListScreen() {
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const router = useRouter();
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused'>('all');
    const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
    const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);
    const [search, setSearch] = useState('');

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
    }, [filterCategory, filterStatus, filterDateFrom, filterDateTo, search]);

    const applyFilters = (items = allItems) => {
        let filtered = [...items];
        if (filterCategory !== 'all') {
            filtered = filtered.filter((item) => item.category === filterCategory);
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter((item) => item.usedStatus === filterStatus);
        }
        if (filterDateFrom) {
            filtered = filtered.filter((item) => new Date(item.dateAdded) >= filterDateFrom);
        }
        if (filterDateTo) {
            filtered = filtered.filter((item) => new Date(item.dateAdded) <= filterDateTo);
        }
        if (search.trim()) {
            const s = search.trim().toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(s) ||
                    (item.notes ?? '').toLowerCase().includes(s)
            );
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
        <View className="flex-1 bg-background px-4">
            <View className="flex-row items-center justify-between mb-4 gap-2">
                {/* Search Bar */}
                <View className="flex-1">
                    <TextInput
                        className="bg-surface text-text px-4 py-2 rounded-md"
                        placeholder="Search items or notes"
                        placeholderTextColor="#9AA0A6"
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                </View>
                {/* Filter Icon */}
                <TouchableOpacity onPress={() => setShowFilterModal(true)} className="ml-2 p-2">
                    <Ionicons name="filter-outline" size={28} color="#8AB4F8" />
                </TouchableOpacity>
                <Modal
                    visible={showFilterModal}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowFilterModal(false)}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            backgroundColor: '#292A2D',
                            padding: 22,
                            borderRadius: 16,
                            width: '90%'
                        }}>
                            <Text className="text-text text-lg font-bold mb-3">Filters</Text>

                            <Text className="text-subtle mb-1">Category</Text>
                            <View className="bg-surface rounded-md mb-4">
                                <Picker
                                    selectedValue={filterCategory}
                                    onValueChange={setFilterCategory}
                                    dropdownIconColor="#8AB4F8"
                                    style={{ color: '#E8EAED' }}
                                >
                                    <Picker.Item label="All Categories" value="all" />
                                    {[...new Set(allItems.map((item) => item.category))].map((cat) => (
                                        <Picker.Item key={cat} label={cat} value={cat} />
                                    ))}
                                </Picker>
                            </View>

                            <Text className="text-subtle mb-1">Status</Text>
                            <View className="bg-surface rounded-md mb-4">
                                <Picker
                                    selectedValue={filterStatus}
                                    onValueChange={(val) => setFilterStatus(val)}
                                    dropdownIconColor="#8AB4F8"
                                    style={{ color: '#E8EAED' }}
                                >
                                    <Picker.Item label="All" value="all" />
                                    <Picker.Item label="Used" value="used" />
                                    <Picker.Item label="Unused" value="unused" />
                                </Picker>
                            </View>

                            <Text className="text-subtle mb-1">Date Added (Range)</Text>
                            <View className="flex-row mb-2 gap-2">
                                <TouchableOpacity
                                    className="bg-hover px-4 py-2 rounded-md flex-1"
                                    onPress={() => setShowDatePicker('from')}
                                >
                                    <Text className="text-text">{filterDateFrom ? filterDateFrom.toLocaleDateString() : 'From'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-hover px-4 py-2 rounded-md flex-1"
                                    onPress={() => setShowDatePicker('to')}
                                >
                                    <Text className="text-text">{filterDateTo ? filterDateTo.toLocaleDateString() : 'To'}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Date pickers (hidden until selecting) */}
                            {showDatePicker && (
                                <DateTimePicker
                                    value={showDatePicker === 'from' ? (filterDateFrom || new Date()) : (filterDateTo || new Date())}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                    maximumDate={new Date()}
                                    onChange={(_, selectedDate) => {
                                        setShowDatePicker(null);
                                        if (selectedDate) {
                                            if (showDatePicker === 'from') setFilterDateFrom(selectedDate);
                                            if (showDatePicker === 'to') setFilterDateTo(selectedDate);
                                        }
                                    }}
                                />
                            )}

                            <View className="flex-row justify-between mt-6">
                                <TouchableOpacity
                                    className="bg-red-500 px-5 py-2 rounded-md"
                                    onPress={() => {
                                        setFilterCategory('all');
                                        setFilterStatus('all');
                                        setFilterDateFrom(null);
                                        setFilterDateTo(null);
                                        setShowFilterModal(false);
                                    }}
                                >
                                    <Text className="text-white font-bold">Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-accent px-5 py-2 rounded-md"
                                    onPress={() => setShowFilterModal(false)}
                                >
                                    <Text className="text-white font-bold">Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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


