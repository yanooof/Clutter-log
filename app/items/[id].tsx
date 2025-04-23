import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    Modal,
    Pressable,
    FlatList
} from 'react-native';
import {useRouter, useLocalSearchParams, useFocusEffect} from 'expo-router';
import {useCallback, useEffect, useState} from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import uuid from 'react-native-uuid';

import { getItems, saveItem, updateItem, deleteItem } from '@/utils/storage';
import { getCategories, addCategory } from '@/utils/CategoryStorage';
import { Item } from '@/types/Item';
import { getLocations, addLocation } from '@/utils/locationStorage';


export default function AddEditItemScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');
    const [dateAdded, setDateAdded] = useState(new Date().toISOString());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | undefined>();
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [existingItemId, setExistingItemId] = useState<string | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [location, setLocation] = useState('');
    const [allLocations, setAllLocations] = useState<string[]>([]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');


    useEffect(() => {
        const loadItemIfEditing = async () => {
            if (id && id !== 'new') {
                const allItems = await getItems();
                const found = allItems.find((item) => item.id === id);
                if (found) {
                    setIsEditing(true);
                    setExistingItemId(found.id);
                    setName(found.name);
                    setCategory(found.category);
                    setLocation(found.location);
                    setNotes(found.notes ?? '');
                    setDateAdded(found.dateAdded);
                    setPhotoUri(found.photoUri);
                }
            }
        };
        loadItemIfEditing();
    }, [id]);

    // Function to fetch latest categories from storage
    const fetchCategories = async () => {
        const list = await getCategories();
        setAllCategories(list);
    };

    // Always fetch categories when the modal opens/closes, and on mount
    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [])
    );

    useEffect(() => {
        if (!showCategoryModal) {
            fetchCategories();
        }
    }, [showCategoryModal]);

    // When adding a new category:
    const handleAddCategory = async () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;
        if (allCategories.includes(trimmed)) {
            Alert.alert('Already exists', 'That category already exists.');
            return;
        }
        await addCategory(trimmed);
        setCategory(trimmed);
        setShowCategoryModal(false);
        setNewCategoryName('');
        await fetchCategories();
    };

    const fetchLocations = async () => {
        const list = await getLocations();
        setAllLocations(list);
    };

    useFocusEffect(
        useCallback(() => {
            fetchLocations();
        }, [])
    );

    useEffect(() => {
        if (!showLocationModal) {
            fetchLocations();
        }
    }, [showLocationModal]);

    const handleAddLocation = async () => {
        const trimmed = newLocationName.trim();
        if (!trimmed) return;
        if (allLocations.includes(trimmed)) {
            Alert.alert('Already exists', 'That location already exists.');
            return;
        }
        await addLocation(trimmed);
        setLocation(trimmed);
        setShowLocationModal(false);
        setNewLocationName('');
        await fetchLocations();
    };




    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
        });
        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name || !category || !location) {
            Alert.alert('Missing fields', 'Name, category, and location are required.');
            return;
        }

        const item: Item = {
            id: existingItemId ?? uuid.v4().toString(),
            name,
            category,
            location,
            notes,
            dateAdded,
            photoUri,
            lastChecked: undefined,
            usedStatus: 'unused',
        };

        if (isEditing) {
            await updateItem(item);
        } else {
            await saveItem(item);
        }

        router.back();
    };


    const handleDelete = async () => {
        if (!existingItemId) return;

        Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteItem(existingItemId);
                    router.back();
                },
            },
        ]);
    };

    return (
        <ScrollView className="flex-1 bg-background px-4 pt-6 space-y-4">
            <View>
                <Text className="text-text font-semibold mb-1">Name</Text>
                <TextInput
                    className="bg-surface text-text rounded-md px-3 py-2"
                    value={name}
                    onChangeText={setName}
                    placeholder="What is this item?"
                    placeholderTextColor="#9AA0A6"
                />
            </View>

            <View>
                <Text className="text-text font-semibold mb-1">Notes</Text>
                <TextInput
                    className="bg-surface text-text rounded-md px-3 py-2 h-24"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Optional notes or purpose"
                    placeholderTextColor="#9AA0A6"
                />
            </View>

            <View>
                <Text className="text-text font-semibold mb-1">Category</Text>
                <TouchableOpacity
                    className="bg-surface rounded-md px-3 py-3 mt-1 border border-border"
                    onPress={() => setShowCategoryModal(true)}
                    activeOpacity={0.7}
                >
                    <Text className={`text-text ${!category && 'text-subtle'}`}>
                        {category || 'Select category'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                transparent
                animationType="fade"
                visible={showCategoryModal}
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
                        <Text className="text-text text-lg font-bold mb-3">Select Category</Text>
                        <View style={{ maxHeight: 220 }}>
                            {allCategories.length === 0 && (
                                <Text className="text-subtle mb-4">No categories yet.</Text>
                            )}
                            <FlatList
                                data={allCategories}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className="py-3 px-3 rounded-md mb-1 bg-hover"
                                        onPress={() => {
                                            setCategory(item);
                                            setShowCategoryModal(false);
                                        }}
                                    >
                                        <Text className="text-text">{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        {/* Add new category row */}
                        <View className="flex-row items-center mt-3">
                            <TextInput
                                className="bg-surface text-text px-3 py-2 rounded flex-1 border border-border"
                                placeholder="Add new category"
                                placeholderTextColor="#9AA0A6"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                onSubmitEditing={async () => {
                                    const trimmed = newCategoryName.trim();
                                    if (!trimmed || allCategories.includes(trimmed)) return;
                                    await addCategory(trimmed);
                                    setNewCategoryName('');
                                    await fetchCategories();
                                }}
                            />
                            <Pressable
                                className="ml-3"
                                onPress={async () => {
                                    const trimmed = newCategoryName.trim();
                                    if (!trimmed || allCategories.includes(trimmed)) return;
                                    await addCategory(trimmed);
                                    setNewCategoryName('');
                                    await fetchCategories();
                                }}
                            >
                                <Text className="text-accent font-bold">Add</Text>
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

            <View>
                <Text className="text-text font-semibold mb-1">Location</Text>
                <TouchableOpacity
                    className="bg-surface rounded-md px-3 py-3 mt-1 border border-border"
                    onPress={() => setShowLocationModal(true)}
                    activeOpacity={0.7}
                >
                    <Text className={`text-text ${!location && 'text-subtle'}`}>
                        {location || 'Select location'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Location select & add modal */}
            <Modal
                transparent
                animationType="fade"
                visible={showLocationModal}
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
                        <Text className="text-text text-lg font-bold mb-3">Select Location</Text>
                        <View style={{ maxHeight: 220 }}>
                            {allLocations.length === 0 && (
                                <Text className="text-subtle mb-4">No locations yet.</Text>
                            )}
                            <FlatList
                                data={allLocations}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className="py-3 px-3 rounded-md mb-1 bg-hover"
                                        onPress={() => {
                                            setLocation(item);
                                            setShowLocationModal(false);
                                        }}
                                    >
                                        <Text className="text-text">{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        {/* Add new location row */}
                        <View className="flex-row items-center mt-3">
                            <TextInput
                                className="bg-surface text-text px-3 py-2 rounded flex-1 border border-border"
                                placeholder="Add new location"
                                placeholderTextColor="#9AA0A6"
                                value={newLocationName}
                                onChangeText={setNewLocationName}
                                onSubmitEditing={handleAddLocation}
                            />
                            <Pressable
                                className="ml-3"
                                onPress={handleAddLocation}
                            >
                                <Text className="text-accent font-bold">Add</Text>
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


            <View>
                <Text className="text-text font-semibold mb-1">Date Added</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-surface rounded-md px-3 py-3"
                >
                    <Text className="text-text">
                        {new Date(dateAdded).toLocaleDateString()}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(dateAdded)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        maximumDate={new Date()} // <--- Restricts calendar to today
                        onChange={(_, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setDateAdded(selectedDate.toISOString());
                            }
                        }}
                    />
                )}
            </View>

            <TouchableOpacity onPress={handlePickImage} className="bg-hover rounded-md py-3 items-center">
                <Text className="text-text">{photoUri ? 'Change Image' : 'Add Image'}</Text>
            </TouchableOpacity>

            {photoUri && <Image source={{ uri: photoUri }} className="w-full h-56 rounded-lg" />}

            <TouchableOpacity onPress={handleSave} className="bg-accent rounded-md py-4 items-center">
                <Text className="text-white font-bold text-base">Save Item</Text>
            </TouchableOpacity>

            {isEditing && (
                <TouchableOpacity onPress={handleDelete} className="bg-red-600 rounded-md py-4 items-center">
                    <Text className="text-white font-bold text-base">Delete Item</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

