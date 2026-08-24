import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ChevronRight, LogOut, Trash2, FileText, Shield, HelpCircle, Edit3, MessageSquare } from 'lucide-react-native';
import { api, ApiError } from '@/lib/api';
import { setSessionActive } from '@/lib/auth';
import { theme } from '@/lib/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    }
    await setSessionActive(false);
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your profile and all entry records. This cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.del('/api/profile');
              await setSessionActive(false);
              Alert.alert('Deleted', 'Account deleted successfully');
              router.replace('/login');
            } catch (e) {
              const message = e instanceof ApiError ? e.message : 'Failed to delete account';
              Alert.alert('Error', message);
            }
          }
        }
      ]
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingRow 
          icon={<Edit3 size={18} color={theme.textMuted} />} 
          label="Edit Profile Details" 
          onPress={() => router.push('/register?edit=true')} 
        />
        <SettingRow 
          icon={<MessageSquare size={18} color={theme.textMuted} />} 
          label="Send Feedback" 
          onPress={() => router.push('/(settings)/feedback')} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Info</Text>
        <SettingRow 
          icon={<FileText size={18} color={theme.textMuted} />} 
          label="Terms & Conditions" 
          onPress={() => router.push('/(settings)/terms')} 
        />
        <SettingRow 
          icon={<Shield size={18} color={theme.textMuted} />} 
          label="Privacy Policy" 
          onPress={() => router.push('/(settings)/privacy')} 
        />
        <SettingRow 
          icon={<HelpCircle size={18} color={theme.textMuted} />} 
          label="FAQ" 
          onPress={() => router.push('/(settings)/faq')} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerRow} onPress={handleLogout}>
          <LogOut size={18} color={theme.danger} />
          <Text style={styles.dangerText}>Sign Out Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
          <Trash2 size={18} color={theme.danger} />
          <Text style={styles.dangerText}>Delete Account Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SVSU Vehicle Control Center</Text>
        <Text style={styles.versionText}>Version {appVersion}</Text>
      </View>

    </ScrollView>
  );
}

function SettingRow({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {icon}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color={theme.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  section: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  dangerText: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  versionText: {
    color: theme.textMuted,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
});
