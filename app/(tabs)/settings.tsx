import { useEffect, useState } from 'react';
import { View, Text, Switch, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getItems } from '@/utils/storage';
import { getSettings, updateSetting, Settings } from '@/utils/settingsStorage';

export default function SettingsScreen() {
    const [settings, setSettings] = useState<Settings>({
        remindersEnabled: true,
        secureModeEnabled: false,
    });

    useEffect(() => {
        const fetch = async () => {
            const saved = await getSettings();
            setSettings(saved);
        };
        fetch();
    }, []);

    const toggle = async (key: keyof Settings) => {
        const newVal = !settings[key];
        await updateSetting(key, newVal);
        setSettings((prev) => ({ ...prev, [key]: newVal }));
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

    return (
        <View className="flex-1 bg-background px-6 pt-6 space-y-8">
            <Text className="text-text text-2xl font-bold">Settings</Text>

            <View className="flex-row justify-between items-center">
                <Text className="text-subtle text-lg">Enable Reminders</Text>
                <Switch
                    value={settings.remindersEnabled}
                    onValueChange={() => toggle('remindersEnabled')}
                    thumbColor={settings.remindersEnabled ? '#8AB4F8' : '#666'}
                    trackColor={{ true: '#5F6368', false: '#3C3D3F' }}
                />
            </View>

            <View className="flex-row justify-between items-center">
                <Text className="text-subtle text-lg">Secure Mode</Text>
                <Switch
                    value={settings.secureModeEnabled}
                    onValueChange={() => toggle('secureModeEnabled')}
                    thumbColor={settings.secureModeEnabled ? '#8AB4F8' : '#666'}
                    trackColor={{ true: '#5F6368', false: '#3C3D3F' }}
                />
            </View>

            <TouchableOpacity
                onPress={exportToCSV}
                className="bg-accent py-4 rounded-md items-center"
            >
                <Text className="text-white font-bold">Export CSV</Text>
            </TouchableOpacity>
        </View>
    );
}
