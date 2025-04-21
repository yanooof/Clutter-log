import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import type { MediaType } from 'expo-image-picker';
import { saveItem } from '@/utils/storage';
import { Item } from '@/types/Item';
import uuid from 'react-native-uuid';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { getItems, updateItem } from '@/utils/storage';
import { deleteItem } from '@/utils/storage';
import { getCategories, addCategory } from '@/utils/CategoryStorage';
import { Picker } from '@react-native-picker/picker';
import { Modal, Pressable } from 'react-native';






export default function AddEditItemScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [dateAdded, setDateAdded] = useState(new Date().toISOString());
    const [photoUri, setPhotoUri] = useState<string | undefined>();
    const [showDatePicker, setShowDatePicker] = useState(false);

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
            mediaTypes: ['images'] satisfies MediaType[], // clean & typed
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
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="What is this item?" />

                <Text style={styles.label}>Category</Text>
                <View style={styles.input}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(val) => {
                            if (val === 'new') {
                                setShowCategoryModal(true); // 👈 open modal instead
                            } else {
                                setCategory(val);
                            }
                        }}
                    >
                        <Picker.Item label="Select category" value="" />
                        {allCategories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                        <Picker.Item label="+ Add new category" value="new" />
                    </Picker>
                </View>


                <Text style={styles.label}>Notes</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Optional notes or purpose"
                    multiline
                />

                <TouchableOpacity onPress={handlePickImage} style={styles.imageButton}>
                    <Text style={{ color: 'white' }}>{photoUri ? 'Change Image' : 'Add Image'}</Text>
                </TouchableOpacity>
                {photoUri && <Image source={{ uri: photoUri }} style={styles.imagePreview} />}

                <Text style={styles.label}>Date Added</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={[styles.input, { justifyContent: 'center', height: 50 }]}
                >
                    <Text style={{ color: 'white' }}>
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

                <Button title="Save Item" onPress={handleSave} color="#F30A14" />
                {isEditing && (
                    <TouchableOpacity
                        onPress={handleDelete}
                        style={[styles.imageButton, { backgroundColor: 'crimson', marginTop: 16 }]}
                    >
                        <Text style={{ color: 'white' }}>Delete Item</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>

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
        </>
    );

}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        color: 'white',
    },
    imageButton: {
        backgroundColor: '#555',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
});

