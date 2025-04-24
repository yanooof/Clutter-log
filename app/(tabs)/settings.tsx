import { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity, Modal, TextInput, Pressable, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getItems } from '@/utils/storage';
import { getCategories} from '@/utils/CategoryStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocations, addLocation, editLocation, deleteLocation } from '@/utils/locationStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';


export default function SettingsScreen() {

    // Category management
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryItems, setCategoryItems] = useState<{ [cat: string]: number }>();
    const [editCatIndex, setEditCatIndex] = useState<number | null>(null);
    const [editCatValue, setEditCatValue] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');

    // Location management
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locations, setLocations] = useState<string[]>([]);
    const [locationItems, setLocationItems] = useState<{ [loc: string]: number }>();
    const [editLocIndex, setEditLocIndex] = useState<number | null>(null);
    const [editLocValue, setEditLocValue] = useState('');
    const [newLocationName, setNewLocationName] = useState('');

    const [showTips, setShowTips] = useState(false);

    const loadCategoriesWithCounts = async () => {
        const catList = await getCategories();
        const items = await getItems();
        const catCounts: { [cat: string]: number } = {};
        catList.forEach((cat) => {
            catCounts[cat] = items.filter((item) => item.category === cat).length;
        });
        setCategories(catList);
        setCategoryItems(catCounts);
    };

    const exportToCSV = async () => {
        const items = await getItems();
        if (!items.length) return Alert.alert('No items to export');

        const header = 'Name,Category,Notes,DateAdded,UsedStatus\n';
        const rows = items.map(
            (i) =>
                `"${i.name}","${i.category}","${i.notes ?? ''}","${i.dateAdded}","${i.usedStatus}"`
        );
        const csv = header + rows.join('\n');

        const fileUri = FileSystem.documentDirectory + 'clutterlog_export.csv';
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

        if (!(await Sharing.isAvailableAsync())) {
            return Alert.alert('Sharing not supported on this device');
        }

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export ClutterLog Data',
        });
    };

    // Category Edit Logic
    const handleEditCategory = async (index: number) => {
        const oldName = categories[index];
        const trimmed = editCatValue.trim();
        if (!trimmed) return;
        if (categories.includes(trimmed)) {
            Alert.alert('Already exists', 'That category name already exists.');
            return;
        }

        // Update category list
        const newCategories = [...categories];
        newCategories[index] = trimmed;
        await AsyncStorage.setItem('CLUTTERLOG_CATEGORIES', JSON.stringify(newCategories));

        // Update all items with this category
        const items = await getItems();
        const updatedItems = items.map((item) =>
            item.category === oldName ? { ...item, category: trimmed } : item
        );
        await AsyncStorage.setItem('CLUTTERLOG_ITEMS', JSON.stringify(updatedItems));

        setEditCatIndex(null);
        setEditCatValue('');
        await loadCategoriesWithCounts();
    };

    const handleDeleteCategory = async (index: number) => {
        const catName = categories[index];
        if (categoryItems && categoryItems[catName] > 0) return;
        // Remove from categories
        const newCategories = categories.filter((_, i) => i !== index);
        await AsyncStorage.setItem('CLUTTERLOG_CATEGORIES', JSON.stringify(newCategories));
        await loadCategoriesWithCounts();
    };

    const handleAddCategory = async () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed || categories.includes(trimmed)) return;
        const newCategories = [...categories, trimmed];
        await AsyncStorage.setItem('CLUTTERLOG_CATEGORIES', JSON.stringify(newCategories));
        setNewCategoryName('');
        await loadCategoriesWithCounts();
    };

    const loadLocationsWithCounts = async () => {
        const locList = await getLocations();
        const items = await getItems();
        const locCounts: { [loc: string]: number } = {};
        locList.forEach((loc) => {
            locCounts[loc] = items.filter((item) => item.location === loc).length;
        });
        setLocations(locList);
        setLocationItems(locCounts);
    };


    const handleEditLocation = async (index: number) => {
        const oldName = locations[index];
        const trimmed = editLocValue.trim();
        if (!trimmed) return;
        if (locations.includes(trimmed)) {
            Alert.alert('Already exists', 'That location already exists.');
            return;
        }

        await editLocation(oldName, trimmed);

        // Update all items with this location
        const items = await getItems();
        const updatedItems = items.map((item) =>
            item.location === oldName ? { ...item, location: trimmed } : item
        );
        await AsyncStorage.setItem('CLUTTERLOG_ITEMS', JSON.stringify(updatedItems));

        setEditLocIndex(null);
        setEditLocValue('');
        await loadLocationsWithCounts();
    };

    const handleDeleteLocation = async (index: number) => {
        const locName = locations[index];
        if (locationItems && locationItems[locName] > 0) return;
        await deleteLocation(locName);
        await loadLocationsWithCounts();
    };

    const handleAddLocation = async () => {
        const trimmed = newLocationName.trim();
        if (!trimmed || locations.includes(trimmed)) return;
        await addLocation(trimmed);
        setNewLocationName('');
        await loadLocationsWithCounts();
    };

    useFocusEffect(
        useCallback(() => {
            loadCategoriesWithCounts();
            loadLocationsWithCounts();
        }, [])
    );


    return (
        <View className="flex-1 bg-background px-6 space-y-8">
            <Text className="text-text text-2xl font-bold text-center mb-5">Settings</Text>

            <View className="mt-2 space-y-6 mb-16">
                <TouchableOpacity
                    onPress={exportToCSV}
                    className="bg-surface py-4 rounded-md items-center border border-border"
                >
                    <Text className="text-accent font-bold">Export CSV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setShowCategoryModal(true)}
                    className="bg-surface py-4 rounded-md items-center border border-border"
                >
                    <Text className="text-accent font-bold">Manage Categories</Text>
                </TouchableOpacity>
                <Modal
                    visible={showCategoryModal}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowCategoryModal(false)}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            backgroundColor: '#292A2D',
                            padding: 22,
                            borderRadius: 16,
                            width: '90%',
                            maxHeight: '80%'
                        }}>
                            <Text className="text-text text-lg font-bold mb-3">Manage Categories</Text>
                            <FlatList
                                data={categories}
                                keyExtractor={(_, i) => i.toString()}
                                renderItem={({ item, index }) => (
                                    <View className="flex-row items-center justify-between mb-2">
                                        {editCatIndex === index ? (
                                            <>
                                                <TextInput
                                                    className="bg-surface text-text px-2 py-1 rounded mr-2 flex-1"
                                                    value={editCatValue}
                                                    onChangeText={setEditCatValue}
                                                    autoFocus
                                                    onSubmitEditing={() => handleEditCategory(index)}
                                                />
                                                <Pressable onPress={() => handleEditCategory(index)}>
                                                    <Text className="text-accent font-bold mr-3">Save</Text>
                                                </Pressable>
                                                <Pressable onPress={() => { setEditCatIndex(null); setEditCatValue(''); }}>
                                                    <Text className="text-subtle">Cancel</Text>
                                                </Pressable>
                                            </>
                                        ) : (
                                            <>
                                                <Text className="text-text flex-1">{item}</Text>
                                                <Text className="text-subtle mr-3">{categoryItems && categoryItems[item] ? `${categoryItems[item]} in use` : 'unused'}</Text>
                                                <Pressable
                                                    onPress={() => { setEditCatIndex(index); setEditCatValue(item); }}
                                                >
                                                    <Text className="text-accent font-bold mr-3">Edit</Text>
                                                </Pressable>
                                                <Pressable
                                                    disabled={categoryItems && categoryItems[item] > 0}
                                                    onPress={() => handleDeleteCategory(index)}
                                                >
                                                    <Text className={categoryItems && categoryItems[item] > 0 ? 'text-subtle' : 'text-red-400 font-bold'}>Delete</Text>
                                                </Pressable>
                                            </>
                                        )}
                                    </View>
                                )}
                            />
                            <View className="flex-row items-center mt-4">
                                <TextInput
                                    className="bg-surface text-text px-3 py-2 rounded flex-1"
                                    placeholder="Add new category"
                                    placeholderTextColor="#9AA0A6"
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    onSubmitEditing={handleAddCategory}
                                />
                                <Pressable onPress={handleAddCategory}>
                                    <Text className="text-accent font-bold ml-4">Add</Text>
                                </Pressable>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowCategoryModal(false)}
                                className="mt-6 bg-accent rounded-md py-3 items-center"
                            >
                                <Text className="text-white font-bold">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <TouchableOpacity
                    onPress={() => setShowLocationModal(true)}
                    className="bg-surface py-4 rounded-md items-center border border-border"
                >
                    <Text className="text-accent font-bold">Manage Locations</Text>
                </TouchableOpacity>
                <Modal
                    visible={showLocationModal}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowLocationModal(false)}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            backgroundColor: '#292A2D',
                            padding: 22,
                            borderRadius: 16,
                            width: '90%',
                            maxHeight: '80%'
                        }}>
                            <Text className="text-text text-lg font-bold mb-3">Manage Locations</Text>
                            <FlatList
                                data={locations}
                                keyExtractor={(_, i) => i.toString()}
                                renderItem={({ item, index }) => (
                                    <View className="flex-row items-center justify-between mb-2">
                                        {editLocIndex === index ? (
                                            <>
                                                <TextInput
                                                    className="bg-surface text-text px-2 py-1 rounded mr-2 flex-1"
                                                    value={editLocValue}
                                                    onChangeText={setEditLocValue}
                                                    autoFocus
                                                    onSubmitEditing={() => handleEditLocation(index)}
                                                />
                                                <Pressable onPress={() => handleEditLocation(index)}>
                                                    <Text className="text-accent font-bold mr-3">Save</Text>
                                                </Pressable>
                                                <Pressable onPress={() => { setEditLocIndex(null); setEditLocValue(''); }}>
                                                    <Text className="text-subtle">Cancel</Text>
                                                </Pressable>
                                            </>
                                        ) : (
                                            <>
                                                <Text className="text-text flex-1">{item}</Text>
                                                <Text className="text-subtle mr-3">{locationItems && locationItems[item] ? `${locationItems[item]} in use` : 'unused'}</Text>
                                                <Pressable
                                                    onPress={() => { setEditLocIndex(index); setEditLocValue(item); }}
                                                >
                                                    <Text className="text-accent font-bold mr-3">Edit</Text>
                                                </Pressable>
                                                <Pressable
                                                    disabled={locationItems && locationItems[item] > 0}
                                                    onPress={() => handleDeleteLocation(index)}
                                                >
                                                    <Text className={locationItems && locationItems[item] > 0 ? 'text-subtle' : 'text-red-400 font-bold'}>Delete</Text>
                                                </Pressable>
                                            </>
                                        )}
                                    </View>
                                )}
                            />
                            <View className="flex-row items-center mt-4">
                                <TextInput
                                    className="bg-surface text-text px-3 py-2 rounded flex-1"
                                    placeholder="Add new location"
                                    placeholderTextColor="#9AA0A6"
                                    value={newLocationName}
                                    onChangeText={setNewLocationName}
                                    onSubmitEditing={handleAddLocation}
                                />
                                <Pressable onPress={handleAddLocation}>
                                    <Text className="text-accent font-bold ml-4">Add</Text>
                                </Pressable>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowLocationModal(false)}
                                className="mt-6 bg-accent rounded-md py-3 items-center"
                            >
                                <Text className="text-white font-bold">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>


            {/* Tips FAB (bottom right, floating) */}
            <TouchableOpacity
                onPress={() => setShowTips(true)}
                style={{
                    position: 'absolute',
                    bottom: 25,
                    right: 25,
                    backgroundColor: '#A1C8FF',
                    borderRadius: 16,
                    width: 56,
                    height: 56,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 6,
                    zIndex: 5,
                }}
                activeOpacity={0.85}
            >
                <Ionicons name="bulb-outline" size={32} color="#202124" />
            </TouchableOpacity>

            {/* Tips Modal */}
            <Modal
                visible={showTips}
                animationType="fade"
                transparent
                onRequestClose={() => setShowTips(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: '#292A2D',
                        padding: 28,
                        borderRadius: 20,
                        width: '88%',
                        alignItems: 'center'
                    }}>
                        <Text className="text-text font-bold text-lg uppercase text-center mb-5 mt-2 tracking-wider">
                            Tips
                        </Text>
                        <View className="w-full mb-5">
                            <Text className="text-text text-base mb-2">What ClutterLog Does:</Text>
                            <View className="pl-3">
                                <Text className="text-subtle text-base mb-1">• Log items with category & location</Text>
                                <Text className="text-subtle text-base mb-1">• Add images, notes & custom tags</Text>
                                <Text className="text-subtle text-base mb-1">• Filter & search your inventory instantly</Text>
                                <Text className="text-subtle text-base mb-1">• Track what’s used or unused (last 30 days)</Text>
                                <Text className="text-subtle text-base mb-1">• View stats & export data anytime</Text>
                                <Text className="text-subtle text-base">• Edit, organize & manage from any device</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowTips(false)}
                            className="bg-accent rounded-md px-10 py-3 items-center mt-3"
                        >
                            <Text className="text-background font-bold text-base">OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

