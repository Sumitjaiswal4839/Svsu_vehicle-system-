import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/lib/theme';

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: August 23, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Data Collection</Text>
          <Text style={styles.paragraph}>
            When you register for the SVSU Vehicle Control Center, we collect personal information including your Name, Roll Number, Course, Semester, Vehicle Number, and Faculty. We also securely collect and store image uploads of your Vehicle RC, Student ID (Front and Back), and your Profile Photo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Use of Information</Text>
          <Text style={styles.paragraph}>
            The information collected is used exclusively for verifying your identity and authorizing your vehicle's entry and exit at the university campus gates. 
          </Text>
          <Text style={styles.paragraph}>
            Entry and exit logs are recorded and maintained to ensure campus security, manage parking availability, and investigate any incidents if they occur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Data Storage & Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely on cloud servers using modern encryption standards. All uploaded documents (RC, IDs) are stored in secure buckets (e.g., Supabase Storage) accessible only to authorized university administrative and security personnel.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell or share your personal data with third-party advertisers. Your data is strictly kept within the SVSU administration and campus security teams. Information may be disclosed to law enforcement only if required by legal mandates.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Account Deletion</Text>
          <Text style={styles.paragraph}>
            You have the right to request deletion of your account and associated data. You can initiate this process from the Settings tab under "Delete Account Data". Note that this will permanently erase your gate pass history and revoke your parking access.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { padding: 24, paddingBottom: 60 },
  title: { color: theme.text, fontSize: 22, fontWeight: '900', marginBottom: 6 },
  date: { color: theme.textMuted, fontSize: 12, marginBottom: 24 },
  section: { marginBottom: 24 },
  heading: { color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  paragraph: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22, marginBottom: 12 },
});
