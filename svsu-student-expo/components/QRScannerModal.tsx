import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, ScanLine } from 'lucide-react-native';
import { theme } from '@/lib/theme';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      scannedRef.current = false;
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    onScanSuccess(data);
  };

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleScan}
          />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>
              Camera permission is required to scan the gate QR code.
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Scan Gate QR</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.frameWrap}>
            <View style={styles.frame} />
            <View style={styles.hintRow}>
              <ScanLine size={16} color={theme.accent} />
              <Text style={styles.hintText}>Point camera at the SVSU gate QR code</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  frameWrap: {
    alignItems: 'center',
    marginBottom: 100,
    gap: 20,
  },
  frame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: theme.accent,
    borderRadius: 32,
    alignSelf: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  hintText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 20,
  },
  permissionText: { color: '#fff', textAlign: 'center', fontSize: 14 },
  permissionBtn: {
    backgroundColor: theme.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  permissionBtnText: { color: '#fff', fontWeight: '800' },
});
