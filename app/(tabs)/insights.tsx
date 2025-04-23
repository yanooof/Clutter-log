import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
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

                const categoryCounts: { [category: string]: number } = {};
                for (const item of unused) {
                    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                }
                const sorted = Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([cat]) => cat);
                setTopUnusedCategories(sorted);

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
        <View className="flex-1 bg-background px-5 space-y-12">
            <Text className="text-text text-2xl font-bold">Usage Summary</Text>

            <View>
                <Text className="text-subtle text-lg">Used: {usedPct}%</Text>
                <Text className="text-subtle text-lg">Unused: {unusedPct}%</Text>
            </View>

            <View>
                <Text className="text-text text-xl font-semibold mb-2">Top Unused Categories</Text>
                {topUnusedCategories.length > 0 ? (
                    topUnusedCategories.map((cat, i) => (
                        <Text key={i} className="text-subtle">• {cat}</Text>
                    ))
                ) : (
                    <Text className="text-subtle">No unused items.</Text>
                )}
            </View>

            <View>
                <Text className="text-text text-xl font-semibold mb-2">Oldest Unused Item</Text>
                {oldestUnused ? (
                    <View className="bg-surface p-4 rounded-lg">
                        <Text className="text-text font-bold">{oldestUnused.name}</Text>
                        <Text className="text-subtle">Added: {new Date(oldestUnused.dateAdded).toLocaleDateString()}</Text>
                    </View>
                ) : (
                    <Text className="text-subtle">No data</Text>
                )}
            </View>
        </View>
    );
}

