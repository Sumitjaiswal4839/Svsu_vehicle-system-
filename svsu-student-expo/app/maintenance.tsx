import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function MaintenanceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.background, '#1a1010']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.iconContainer}>
        <Wrench size={48} color={theme.error} />
      </View>
      
      <Text style={styles.title}>System Under Maintenance</Text>
      
      <Text style={styles.description}>
        The SVSU Control Center is currently undergoing scheduled maintenance to improve reliability and security. 
        We'll be back online shortly.
      </Text>
      
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Thank you for your patience!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Black',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  badgeText: {
    color: theme.text,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  }
});
