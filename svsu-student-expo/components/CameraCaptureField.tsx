import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, RotateCcw, ImagePlus } from 'lucide-react-native';
import { theme } from '@/lib/theme';

interface Props {
  label: string;
  facing?: 'front' | 'back';
  value: string | null;
  onCapture: (dataUri: string) => void;
  required?: boolean;
  aspectRatio?: number;
}

// Compresses via ImagePicker's built-in quality param and returns a
// `data:image/jpeg;base64,...` URI — the exact shape the backend's
// /api/profile and /api/entry routes expect (they check `startsWith('data:image')`
// before uploading to Supabase Storage via lib/supabase.ts's uploadPhoto()).
export default function CameraCaptureField({
  label,
  facing = 'back',
  value,
  onCapture,
  required,
  aspectRatio = 16 / 9,
}: Props) {
  const [busy, setBusy] = useState(false);

  const toDataUri = (asset: ImagePicker.ImagePickerAsset) => {
    const mime = asset.mimeType || 'image/jpeg';
    return `data:${mime};base64,${asset.base64}`;
  };

  const captureFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission required', 'Please allow camera access to capture this photo.');
      return;
    }
    setBusy(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        cameraType: facing === 'front' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
        base64: true,
        quality: 0.6,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        onCapture(toDataUri(result.assets[0]));
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open camera. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo library permission required', 'Please allow photo access to pick this photo.');
      return;
    }
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 0.6,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        onCapture(toDataUri(result.assets[0]));
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open gallery. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>
        {label} {required ? <Text style={{ color: theme.accent }}>*</Text> : null}
      </Text>

      {value ? (
        <View>
          <Image source={{ uri: value }} style={[styles.preview, { aspectRatio }]} />
          <TouchableOpacity style={styles.retakeBadge} onPress={captureFromCamera} disabled={busy}>
            <RotateCcw size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={captureFromCamera} disabled={busy}>
            <Camera size={20} color={theme.accent} />
            <Text style={styles.actionText}>{busy ? 'Opening...' : 'Take Photo'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={pickFromGallery} disabled={busy}>
            <ImagePlus size={20} color={theme.textMuted} />
            <Text style={styles.actionTextSecondary}>Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 2,
  },
  preview: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: theme.accent + '55',
  },
  retakeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.danger,
    padding: 8,
    borderRadius: 999,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingVertical: 18,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  actionText: {
    color: theme.accent,
    fontWeight: '800',
    fontSize: 13,
  },
  actionTextSecondary: {
    color: theme.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
});
