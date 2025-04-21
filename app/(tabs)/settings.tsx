import { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Button, Share, Alert } from 'react-native';
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
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Enable Reminders</Text>
                <Switch value={settings.remindersEnabled} onValueChange={() => toggle('remindersEnabled')} />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Secure Mode</Text>
                <Switch value={settings.secureModeEnabled} onValueChange={() => toggle('secureModeEnabled')} />
            </View>

            <Button title="Export CSV" onPress={exportToCSV} color="#F30A14" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        gap: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        color: 'white',
    },
});

