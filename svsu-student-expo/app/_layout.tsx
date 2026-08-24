import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="maintenance" />
          <Stack.Screen name="login" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="register" />
          <Stack.Screen name="dashboard" />
        </Stack>

        {/* Global Watermark */}
        <View 
          pointerEvents="none" 
          style={[StyleSheet.absoluteFillObject, styles.watermarkContainer]}
        >
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.watermarkImage} 
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  watermarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.08, 
    zIndex: 999,
  },
  watermarkImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  }
});
