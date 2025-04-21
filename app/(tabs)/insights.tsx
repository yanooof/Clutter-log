// app/(tabs)/insights.tsx
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { getItems } from '@/utils/storage';
import { Item } from '@/types/Item';

export default function InsightsScreen() {
    const [usedCount, setUsedCount] = useState(0);
    const [unusedCount, setUnusedCount] = useState(0);
    const [topUnusedCategories, setTopUnusedCategories] = useState<string[]>([]);
    const [oldestUnused, setOldestUnused] = useState<Item | null>(null);

    useFocusEffect(
        useCallback(() => {
            const fetchStats = async () => {
                const items = await getItems();
                const used = items.filter((item) => item.usedStatus === 'used');
                const unused = items.filter((item) => item.usedStatus === 'unused');

                setUsedCount(used.length);
                setUnusedCount(unused.length);

                // Top 3 categories of unused
                const categoryCounts: { [category: string]: number } = {};
                for (const item of unused) {
                    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                }
                const sorted = Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([cat]) => cat);
                setTopUnusedCategories(sorted);

                // Oldest unused item
                const sortedUnused = [...unused].sort(
                    (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
                );
                setOldestUnused(sortedUnused[0] || null);
            };

            fetchStats();
        }, [])
    );

    const total = usedCount + unusedCount;
    const usedPct = total === 0 ? 0 : Math.round((usedCount / total) * 100);
    const unusedPct = 100 - usedPct;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Usage Summary</Text>
            <Text style={styles.stat}>Used: {usedPct}%</Text>
            <Text style={styles.stat}>Unused: {unusedPct}%</Text>

            <Text style={styles.section}>Top Unused Categories:</Text>
            {topUnusedCategories.length > 0 ? (
                topUnusedCategories.map((cat, i) => (
                    <Text key={i} style={styles.subItem}>• {cat}</Text>
                ))
            ) : (
                <Text style={styles.subItem}>No unused items yet.</Text>
            )}

            <Text style={styles.section}>Oldest Unused Item:</Text>
            {oldestUnused ? (
                <View style={styles.oldest}>
                    <Text style={styles.subItem}>{oldestUnused.name}</Text>
                    <Text style={styles.subItem}>Added: {new Date(oldestUnused.dateAdded).toLocaleDateString()}</Text>
                </View>
            ) : (
                <Text style={styles.subItem}>No data</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    stat: {
        fontSize: 18,
        color: '#ddd',
    },
    section: {
        fontSize: 20,
        marginTop: 16,
        color: 'white',
    },
    subItem: {
        fontSize: 16,
        color: '#aaa',
    },
    oldest: {
        backgroundColor: '#111',
        padding: 10,
        borderRadius: 8,
    },
});
