import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, AlertTriangle, Info } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await api.get('/api/notifications');
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const getIcon = (type: string) => {
    if (type === 'ALERT') return <AlertTriangle color={theme.danger} size={24} />;
    if (type === 'WARNING') return <AlertTriangle color="#eab308" size={24} />;
    return <Info color={theme.accent} size={24} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.empty}>
            <Bell size={48} color={theme.border} />
            <Text style={styles.emptyText}>No recent notifications</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id} style={styles.card}>
              <View style={styles.iconWrap}>
                {getIcon(notif.type)}
              </View>
              <View style={styles.contentWrap}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{notif.title}</Text>
                  <Text style={styles.date}>{new Date(notif.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.message}>{notif.message}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: theme.text,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  scrollContent: {
    padding: 20,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    color: theme.textMuted,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  iconWrap: {
    marginRight: 16,
  },
  contentWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: theme.text,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  date: {
    color: theme.textMuted,
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  message: {
    color: theme.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    lineHeight: 20,
  }
});
