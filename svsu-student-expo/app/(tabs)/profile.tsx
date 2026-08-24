import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, MapPin, Car, CreditCard, Settings, ChevronRight, Bell } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useProfile } from '@/lib/useProfile';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return (
      <View style={styles.loadingScreen}>
        <ShieldCheck size={48} color={theme.accent} />
        <ActivityIndicator color={theme.accent} style={{ marginTop: 16 }} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Image source={{ uri: profile.profilePhoto || undefined }} style={styles.avatar} />
            <View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileRoll}>{profile.rollNo}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(settings)/notifications')} style={styles.bellBtn}>
            <Bell size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Academic Details</Text>
          <View style={{ gap: 12 }}>
            <InfoItem label="Registration" value={profile.rollNo} icon={<ShieldCheck size={16} color={theme.textMuted} />} />
            <InfoItem label="Course" value={profile.course} icon={<CreditCard size={16} color={theme.textMuted} />} />
            <InfoItem label="Building" value={profile.buildingId || 'Unassigned'} icon={<MapPin size={16} color={theme.textMuted} />} />
            <InfoItem label="Vehicle No" value={profile.vehicleNo} icon={<Car size={16} color={theme.textMuted} />} />
          </View>
        </View>

        {/* Verification Documents */}
        <View style={styles.docsCard}>
          <Text style={styles.docsTitle}>Verification Documents</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Image source={{ uri: profile.idCardFront }} style={styles.docImage} />
            <Image source={{ uri: profile.idCardBack }} style={styles.docImage} />
          </View>
        </View>

        {/* Settings Navigation */}
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => router.push('/(settings)/settings')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={styles.settingsIconWrap}>
              <Settings size={20} color={theme.accent} />
            </View>
            <View>
              <Text style={styles.settingsTitle}>Settings & Preferences</Text>
              <Text style={styles.settingsSub}>Account, Legal, Privacy</Text>
            </View>
          </View>
          <ChevronRight size={20} color={theme.textMuted} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View style={styles.infoItem}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {icon}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loadingScreen: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16 },
  scroll: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  bellBtn: {
    padding: 12,
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: theme.border, backgroundColor: theme.card },
  profileName: { color: theme.text, fontSize: 24, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 },
  profileRoll: { color: theme.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  
  card: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 28, padding: 24, marginBottom: 20 },
  cardTitle: { color: theme.text, fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: { color: theme.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  infoValue: { color: theme.text, fontSize: 14, fontWeight: '700', maxWidth: 160, textAlign: 'right' },
  
  docsCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderStyle: 'dashed', borderColor: theme.border, borderRadius: 28, padding: 24, marginBottom: 20 },
  docsTitle: { color: theme.textMuted, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  docImage: { flex: 1, aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: '#000', borderWidth: 1, borderColor: theme.border },

  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
  },
  settingsIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center' },
  settingsTitle: { color: theme.text, fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  settingsSub: { color: theme.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 },
});
