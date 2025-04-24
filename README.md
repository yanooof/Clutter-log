# ClutterLog

A cross-platform mobile app built with Expo and React Native to log and track scattered items. Review your history, gain insights, and stay organized.

## Features

- **Add & Manage Items**: Name, category, notes, date, optional photo
- **Usage Tracker**: Item Usage check with 30-day un-checked reminders
- **Insights**: Aggregated stats and pie charts showing usage trends
- **Settings**: Export data (CSV), manage categories and locations
- **Tips (on settings screen)**: Concise modal explaining app features
- **Persistent Storage**: AsyncStorage for offline-first data

## Project Structure

```bash
.
├── app/                  # Expo Router pages & screens
├── assets/               # default icons & images
├── types/               # interface item
├── utils/                # Storage 
├── babel.config.js
├── tailwind.config.js    # NativeWind (Tailwind CSS)
├── package.json
└── README.md
```

## Non-Default Libraries

- `expo-router`
- `nativewind` (Tailwind CSS for React Native)
- `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- `@react-native-async-storage/async-storage`
- `expo-image-picker`
- `expo-file-system`
- `@react-native-community/datetimepicker`
- `@react-native-picker/picker`
- `react-native-uuid`
- `axios`

## Configuration

No additional environment variables are required. All settings are managed within the app.


