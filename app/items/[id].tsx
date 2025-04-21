import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, Alert, Platform, Modal, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import uuid from 'react-native-uuid';

import { getItems, saveItem, updateItem, deleteItem } from '@/utils/storage';
import { getCategories, addCategory } from '@/utils/CategoryStorage';
import { Item } from '@/types/Item';

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
                    setNotes(found.notes ?? '');
                    setDateAdded(found.dateAdded);
                    setPhotoUri(found.photoUri);
                }
            }
        };
        loadItemIfEditing();
    }, [id]);

    useEffect(() => {
        const fetchCategories = async () => {
            const list = await getCategories();
            setAllCategories(list);
        };
        fetchCategories();
    }, []);

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
        if (!name || !category) {
            Alert.alert('Missing fields', 'Name and category are required.');
            return;
        }

        const item: Item = {
            id: existingItemId ?? uuid.v4().toString(),
            name,
            category,
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
                <Text className="text-text font-semibold mb-1">Category</Text>
                <View className="bg-surface rounded-md">
                    <Picker
                        selectedValue={category}
                        onValueChange={(val) => {
                            if (val === 'new') {
                                setShowCategoryModal(true);
                            } else {
                                setCategory(val);
                            }
                        }}
                        dropdownIconColor="#E8EAED"
                        style={{ color: '#E8EAED' }}
                    >
                        <Picker.Item label="Select category" value="" />
                        {allCategories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                        <Picker.Item label="+ Add new category" value="new" />
                    </Picker>
                </View>
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
                        backgroundColor: '#222',
                        padding: 20,
                        borderRadius: 10,
                        width: '80%',
                    }}>
                        <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>Enter new category</Text>
                        <TextInput
                            placeholder="e.g. Bathroom, Kitchen"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            style={{
                                backgroundColor: '#333',
                                padding: 10,
                                borderRadius: 6,
                                color: 'white',
                                marginBottom: 12,
                            }}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                            <Pressable onPress={() => setShowCategoryModal(false)}>
                                <Text style={{ color: '#aaa' }}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    if (newCategoryName.trim()) {
                                        addCategory(newCategoryName.trim());
                                        setAllCategories((prev) => [...new Set([...prev, newCategoryName.trim()])]);
                                        setCategory(newCategoryName.trim());
                                    }
                                    setShowCategoryModal(false);
                                    setNewCategoryName('');
                                }}
                            >
                                <Text style={{ color: '#F30A14', fontWeight: 'bold' }}>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

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

