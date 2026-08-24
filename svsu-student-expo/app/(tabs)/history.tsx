import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Clock, ShieldCheck, Car } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useProfile } from '@/lib/useProfile';

export default function HistoryScreen() {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return (
      <View style={styles.loadingScreen}>
        <ShieldCheck size={48} color={theme.accent} />
        <ActivityIndicator color={theme.accent} style={{ marginTop: 16 }} />
        <Text style={styles.loadingText}>Loading Activity...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.activityHeader}>
          <Clock size={28} color={theme.accent} />
          <Text style={styles.activityTitle}>Entry Records</Text>
        </View>

        {profile.entries && profile.entries.length > 0 ? (
          <View style={{ gap: 14 }}>
            {profile.entries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View
                    style={[
                      styles.entryIcon,
                      { backgroundColor: entry.exitTime ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)' },
                    ]}
                  >
                    <Car size={20} color={entry.exitTime ? theme.success : '#3b82f6'} />
                  </View>
                  <View>
                    <Text style={styles.entryLabel}>Gate Pass Scanned</Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.entryTime).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.entryStatus, { color: entry.exitTime ? theme.success : '#3b82f6' }]}>
                    {entry.exitTime ? 'Completed' : 'Active'}
                  </Text>
                  <Text style={styles.entryTime}>
                    {new Date(entry.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Clock size={40} color={theme.textMuted} style={{ marginBottom: 12, opacity: 0.5 }} />
            <Text style={styles.emptyText}>No Activity Found</Text>
            <Text style={styles.emptySubText}>Your gate pass scans will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loadingScreen: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16 },
  scroll: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  activityTitle: { color: theme.text, fontSize: 24, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 },
  entryRow: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  entryLabel: { color: theme.text, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  entryDate: { color: theme.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginTop: 4 },
  entryStatus: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  entryTime: { color: '#52525b', fontSize: 11, fontWeight: '600', marginTop: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { color: theme.text, fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  emptySubText: { color: theme.textMuted, fontSize: 12, marginTop: 8 },
});
