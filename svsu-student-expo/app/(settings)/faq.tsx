import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/lib/theme';

export default function FAQScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>Find answers to common issues below.</Text>

        <View style={styles.section}>
          <Text style={styles.question}>Q: What if my QR Code doesn't scan at the gate?</Text>
          <Text style={styles.answer}>
            A: First, try turning up your phone's brightness to maximum. If it still doesn't scan, you can show the security guard your Roll Number and Vehicle Number on the Profile screen, and they can verify you manually in their Guard Panel.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>Q: Can I use this pass for a different vehicle?</Text>
          <Text style={styles.answer}>
            A: No. Your gate pass is strictly tied to the Vehicle Number you registered with. If you change your vehicle, you must update your profile by going to Settings &gt; Edit Profile Details and uploading the new RC documents.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>Q: Do I need an internet connection to use the QR?</Text>
          <Text style={styles.answer}>
            A: You can save the QR code to your phone's gallery using the "Tap QR to save" button. The saved image can be scanned offline at the gate. However, to view your History or update your profile, you will need an active internet connection.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>Q: How do I change my registered building?</Text>
          <Text style={styles.answer}>
            A: Building assignments can only be modified by the Campus Administration. Please contact the security desk or admin office with a valid reason to get your parking building re-assigned.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.question}>Q: What if I lose my phone?</Text>
          <Text style={styles.answer}>
            A: You can log into your account on a new device using your Roll Number and Password. We strongly advise resetting your password immediately if your previous device is lost.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { padding: 24, paddingBottom: 60 },
  title: { color: theme.text, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: theme.textMuted, fontSize: 13, marginBottom: 24 },
  section: { 
    marginBottom: 20, 
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  question: { color: theme.accent, fontSize: 15, fontWeight: '800', marginBottom: 10, lineHeight: 22 },
  answer: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22 },
});
