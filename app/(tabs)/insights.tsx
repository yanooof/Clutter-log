import {router, useFocusEffect} from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

    // Pie chart config
    const usedColor = '#8AB4F8';
    const unusedColor = '#3C3D3F';

    return (
        <View className="flex-1 bg-background px-5 pt-2">
            {/* Title */}
            <Text className="text-text font-extrabold text-[26px] uppercase text-center mt-5 mb-3 tracking-wider" style={{ letterSpacing: 2 }}>
                USAGE SUMMARY
            </Text>

            {/* Pie chart section */}
            <View className="items-center mb-2 mt-2">
                <View className="items-center justify-center" style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#3C3D3F', position: 'relative', marginBottom: 12 }}>
                    <View style={{
                        position: 'absolute',
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        borderWidth: 15,
                        borderColor: '#8AB4F8',
                        borderRightColor: '#3C3D3F',
                        borderBottomColor: '#3C3D3F',
                        transform: [{ rotate: `${(usedPct / 100) * 360}deg` }]
                    }} />
                    <Text className="text-text text-2xl font-bold">{usedPct}%</Text>
                </View>


                <View className="flex-row justify-center mt-3 mb-1 gap-6">
                    <View className="flex-row items-center gap-2">
                        <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: usedColor }} />
                        <Text className="text-text text-xs">Used</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: unusedColor }} />
                        <Text className="text-subtle text-xs">Unused</Text>
                    </View>
                </View>
                <Text className="text-subtle text-sm text-center mt-1">
                    % of items used in the past 30 days
                </Text>
            </View>

            {/* Top Unused Categories */}
            <Text className="text-text text-lg font-bold uppercase text-center mb-3 mt-6" style={{ letterSpacing: 1 }}>
                Top Unused Categories
            </Text>
            <View className="flex-row flex-wrap justify-center mb-6 gap-2">
                {topUnusedCategories.length > 0 ? (
                    topUnusedCategories.map((cat, i) => (
                        <View
                            key={i}
                            className="bg-surface px-4 py-2 rounded-xl mb-2 mr-2"
                            style={{ minWidth: 80, alignItems: 'center' }}
                        >
                            <Text className="text-text text-base font-semibold">{cat}</Text>
                        </View>
                    ))
                ) : (
                    <Text className="text-subtle text-center">No unused items.</Text>
                )}
            </View>

            {/* Oldest Unused Item */}
            <Text className="text-text text-lg font-bold uppercase text-center mb-3 mt-3" style={{ letterSpacing: 1 }}>
                Oldest Unused Item
            </Text>
            {oldestUnused ? (
                <TouchableOpacity
                    className="bg-surface p-4 rounded-lg mx-2 mb-2"
                    onPress={() =>
                        router.push({ pathname: '/items/details', params: { id: oldestUnused.id } })
                    }
                >
                    <Text className="text-text font-bold text-lg">{oldestUnused.name}</Text>
                    <View className="flex-row flex-wrap gap-3 mt-1">
                        <Text className="text-subtle">
                            Category: <Text className="text-text">{oldestUnused.category}</Text>
                        </Text>
                        <Text className="text-subtle">
                            Location: <Text className="text-text">{oldestUnused.location}</Text>
                        </Text>
                        <Text className="text-subtle">
                            {new Date(oldestUnused.dateAdded).toLocaleDateString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : (
                <Text className="text-subtle text-center mb-2">No data</Text>
            )}
        </View>
    );
}


