import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { api, ApiError } from '@/lib/api';
import { setSessionActive } from '@/lib/auth';
import { theme } from '@/lib/theme';

export default function SplashGate() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const mRes = await api.get('/api/maintenance');
        if (mRes.maintenanceMode) {
          router.replace('/maintenance');
          return;
        }

        await api.get('/api/profile');
        await setSessionActive(true);
        router.replace('/(tabs)');
      } catch (e) {
        await setSessionActive(false);
        router.replace('/login');
      }
    };
    check();
  }, []);

  return (
    <View style={styles.container}>
      <ShieldCheck size={56} color={theme.accent} />
      <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
      <Text style={styles.text}>Verifying Security Access...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  text: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 16,
  },
});
