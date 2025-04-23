import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#202124', // theme background
                    borderTopColor: '#3C3D3F',
                    height: 58,
                },
                tabBarActiveTintColor: '#8AB4F8',
                tabBarInactiveTintColor: '#5F6368',
                tabBarLabelStyle: { fontSize: 13, fontWeight: 'bold' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Items',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="usage"
                options={{
                    title: 'Usage',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    title: 'Insights',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
