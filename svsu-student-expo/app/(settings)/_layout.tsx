import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/lib/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '900', fontSize: 16 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="faq" options={{ title: 'FAQ' }} />
    </Stack>
  );
}
