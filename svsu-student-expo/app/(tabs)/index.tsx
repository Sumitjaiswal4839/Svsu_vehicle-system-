import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Clock, ShieldCheck, QrCode, Download, MapPin } from 'lucide-react-native';
import QRScannerModal from '@/components/QRScannerModal';
import { api, ApiError } from '@/lib/api';
import { API_BASE_URL, GATE_QR_ENTRY, GATE_QR_EXIT } from '@/lib/config';
import { theme } from '@/lib/theme';
import { useProfile } from '@/lib/useProfile';

export default function GatePassScreen() {
  const { profile, loading, reload } = useProfile();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<any>(null);

  const handleScanSuccess = async (decodedText: string) => {
    setScannerOpen(false);
    if (decodedText !== GATE_QR_ENTRY && decodedText !== GATE_QR_EXIT) {
      Alert.alert('Invalid QR', 'Please scan the official SVSU Gate QR.');
      return;
    }
    if (!profile) return;

    setProcessing(true);
    const isEntry = decodedText === GATE_QR_ENTRY;
    try {
      await api.post(isEntry ? '/api/entry' : '/api/exit', {
        profileId: profile.id,
        vehicleNo: profile.vehicleNo,
      });
      Alert.alert('Success', isEntry ? 'Entry Registered Successfully!' : 'Exit Registered Successfully!');
      await reload();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Connection error';
      Alert.alert('Action Failed', message);
    } finally {
      setProcessing(false);
    }
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    setDownloading(true);
    qrRef.current.toDataURL(async (base64: string) => {
      try {
        const fileUri = `${FileSystem.cacheDirectory}GatePass_${profile?.rollNo || 'qr'}.png`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(fileUri);
          Alert.alert('Saved', 'Gate Pass QR saved to your photos.');
        } else if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Saved', `QR saved at ${fileUri}`);
        }
      } catch (e) {
        Alert.alert('Error', 'Could not save the QR code.');
      } finally {
        setDownloading(false);
      }
    });
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingScreen}>
        <ShieldCheck size={48} color={theme.accent} />
        <ActivityIndicator color={theme.accent} style={{ marginTop: 16 }} />
        <Text style={styles.loadingText}>Verifying Security Access...</Text>
      </View>
    );
  }

  const qrValue = profile.secureQR || `${API_BASE_URL}/entry?p=${profile.id}`;

  return (
    <View style={styles.container}>
      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={styles.processingText}>Processing Entry...</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.qrCard}>
          <View style={styles.qrCardHeader}>
            <QrCode size={20} color="#fff" />
            <Text style={styles.qrCardHeaderText}>Digital Gate Pass</Text>
          </View>

          <TouchableOpacity style={styles.qrWrap} onPress={downloadQR} disabled={downloading}>
            {downloading ? (
              <ActivityIndicator color={theme.accent} />
            ) : (
              <QRCode value={qrValue} size={180} ecl="H" getRef={(ref) => (qrRef.current = ref)} />
            )}
          </TouchableOpacity>

          <Text style={styles.qrName}>{profile.name}</Text>
          <Text style={styles.qrRoll}>{profile.rollNo}</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>Security Validated</Text>
            </View>
            <View style={styles.vehicleBadge}>
              <Text style={styles.vehicleBadgeText}>{profile.vehicleNo}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.downloadHint} onPress={downloadQR} disabled={downloading}>
            <Download size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.downloadHintText}>Tap QR or here to save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MapPin size={16} color={theme.accent} />
            </View>
            <Text style={styles.statLabel}>Last Entry</Text>
            <Text style={styles.statValue}>
              {profile.entries?.[0]
                ? new Date(profile.entries[0].entryTime).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  })
                : 'No entries'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={16} color={theme.accent} />
            </View>
            <Text style={styles.statLabel}>Total Entries</Text>
            <Text style={styles.statValue}>{profile.entries?.length ?? 0} visits</Text>
          </View>
        </View>

        {/* Scan floating button (Moved to the tab for native feel, though usually it's in the tab bar. We'll add a prominent button here) */}
        <TouchableOpacity style={styles.scanBtnMain} onPress={() => setScannerOpen(true)}>
          <QrCode size={24} color="#fff" />
          <Text style={styles.scanBtnText}>Scan Gate QR</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loadingScreen: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16 },
  processingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: { color: '#fff', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 14 },
  scroll: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  qrCard: {
    backgroundColor: theme.accent,
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  qrCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 },
  qrCardHeaderText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  qrWrap: { backgroundColor: '#fff', padding: 22, borderRadius: 24, marginBottom: 26 },
  qrName: { color: '#fff', fontSize: 22, fontWeight: '900', textTransform: 'uppercase' },
  qrRoll: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 4, marginBottom: 22 },
  statusRow: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.success },
  statusText: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  vehicleBadge: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  vehicleBadgeText: { color: theme.accent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  downloadHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 },
  downloadHintText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 14, marginTop: 26 },
  statCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, alignItems: 'center', gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: theme.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { color: theme.text, fontSize: 15, fontWeight: '900' },
  scanBtnMain: {
    backgroundColor: theme.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    marginTop: 26,
    gap: 10,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
