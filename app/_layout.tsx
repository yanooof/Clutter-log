import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from "expo-router";
import './globals.css';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
      <>
        <StatusBar style="light" backgroundColor="#202124" />
        <SafeAreaView className="flex-1 bg-background">
          <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="items/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="items/details"
                options={{ headerShown: false }}
            />

          </Stack>

        </SafeAreaView>
      </>
  );
}

