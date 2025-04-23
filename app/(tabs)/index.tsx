import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {FlatList, Modal, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getItems } from '@/utils/storage';
import { Item } from '@/types/Item';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { getLocations } from '@/utils/locationStorage';

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
    const [allLocations, setAllLocations] = useState<string[]>([]);
    const [filterLocation, setFilterLocation] = useState<string>('all');
    const isFiltered = (
        filterCategory !== 'all' ||
        filterStatus !== 'all' ||
        filterLocation !== 'all' ||
        filterDateFrom !== null ||
        filterDateTo !== null ||
        search.trim() !== ''
    );



    useFocusEffect(
        useCallback(() => {
            const fetchItems = async () => {
                const savedItems = await getItems();
                setAllItems(savedItems);
                // Apply filters to the new list using current filter settings
                applyFilters(savedItems); // <-- pass savedItems as argument
            };
            fetchItems();
        }, [
            filterCategory,
            filterStatus,
            filterLocation,
            filterDateFrom,
            filterDateTo,
            search,
        ])
    );


    useEffect(() => {
        applyFilters();
    }, [filterLocation, filterCategory, filterStatus, filterDateFrom, filterDateTo, search]);

    const fetchLocations = async () => {
        const list = await getLocations();
        setAllLocations(list);
    };

// Call when filter modal opens
    useEffect(() => {
        if (showFilterModal) {
            fetchLocations();
        }
    }, [showFilterModal]);

// Optionally, also fetch on screen focus to always stay up to date
    useFocusEffect(
        useCallback(() => {
            fetchLocations();
        }, [])
    );


    const applyFilters = (items = allItems) => {
        let filtered = [...items];
        if (filterCategory !== 'all') {
            filtered = filtered.filter((item) => item.category === filterCategory);
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter((item) => item.usedStatus === filterStatus);
        }
        if (filterLocation !== 'all') {
            filtered = filtered.filter((item) => item.location === filterLocation);
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
            className="bg-surface p-1 rounded-m mb-4"
            onPress={() => router.push({ pathname: '/items/details', params: { id: item.id } })}
        >
            <View className="bg-surface rounded-xl px-4 py-3 mb-3">
                {/* Top row: usage icon, name, edit icon */}
                <View className="flex-row items-center justify-between mb-1">
                    {/* Usage icon (left) */}
                    <View className="mr-2">
                        {item.usedStatus === 'used' ? (
                            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                        ) : (
                            <Ionicons name="ellipse-outline" size={20} color="#F87171" />
                        )}
                    </View>
                    {/* Name, flexes in the middle */}
                    <Text className="text-text font-bold text-base flex-1">{item.name}</Text>
                    {/* Edit icon (right) */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })}
                        className="ml-2"
                    >
                        <Ionicons name="create-outline" size={22} color="#8AB4F8" />
                    </TouchableOpacity>
                </View>

                {/* Second row: category, location, date */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-subtle text-xs">
                        Category: <Text className="text-text">{item.category}</Text>
                    </Text>
                    <Text className="text-subtle text-xs">
                        Location: <Text className="text-text">{item.location}</Text>
                    </Text>
                    <Text className="text-subtle text-xs">
                        {new Date(item.dateAdded).toLocaleDateString()}
                    </Text>
                </View>
            </View>
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

                            <Text className="text-subtle mb-1">Location</Text>
                            <View className="bg-surface rounded-md mb-4">
                                <Picker
                                    selectedValue={filterLocation}
                                    onValueChange={setFilterLocation}
                                    dropdownIconColor="#8AB4F8"
                                    style={{ color: '#E8EAED' }}
                                >
                                    <Picker.Item label="All Locations" value="all" />
                                    {[...new Set(allItems.map((item) => item.location).filter(Boolean))].map((loc) => (
                                        <Picker.Item key={loc} label={loc} value={loc} />
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
                                        setFilterLocation('all');
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

            {isFiltered && (
                <View className="flex-row items-center justify-between px-1 py-2 mb-2 bg-hover rounded">
                    <Text className="text-subtle text-xs px-1">
                        Filtered view — {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} shown
                    </Text>
                    <TouchableOpacity onPress={() => {
                        setFilterCategory('all');
                        setFilterStatus('all');
                        setFilterLocation('all');
                        setFilterDateFrom(null);
                        setFilterDateTo(null);
                        setSearch('');
                    }}>
                        <Text className="text-accent text-xs font-bold px-1">Clear filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    backgroundColor: '#A1C8FF', // lighter blue
                    borderRadius: 16,
                    width: 58,
                    height: 58,
                    shadowColor: '#000',
                    shadowOpacity: 0.16,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                activeOpacity={0.85}
                onPress={() => router.push('/items/new')}
            >
                <Text style={{
                    color: '#202124', // main bg color
                    fontSize: 25,      // slightly smaller
                    fontWeight: 'bold',
                    textAlign: 'center',
                    lineHeight: 34,    // tightly fit
                    marginTop: 0,      // perfectly center
                }}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}


