import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, KeyRound, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';
import { api, ApiError } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'verify' | 'success'>('verify');
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [rollNo, setRollNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (!rollNo || !vehicleNo || !newPassword || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<{ name: string }>('/api/auth/student/reset-password', {
        rollNo,
        vehicleNo,
        newPassword,
      });
      setStudentName(data.name);
      setStep('success');
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Connection error';
      Alert.alert('Verification failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backRow} onPress={() => router.replace('/login')}>
          <ArrowLeft size={16} color={theme.textMuted} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        {step === 'verify' ? (
          <View style={styles.card}>
            <View style={styles.headerBlock}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.3)' }]}>
                <KeyRound size={32} color="#fb923c" />
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Verify your identity using your Roll Number and Vehicle Number.
              </Text>
            </View>

            <View style={styles.infoBadge}>
              <Shield size={18} color="#60a5fa" />
              <Text style={styles.infoBadgeText}>
                This must exactly match the details you registered with, including your vehicle
                number.
              </Text>
            </View>

            <View style={{ gap: 18 }}>
              <FormField
                label="Roll Number"
                value={rollNo}
                onChangeText={setRollNo}
                placeholder="2100..."
                autoCapitalize="none"
              />
              <FormField
                label="Vehicle Number"
                value={vehicleNo}
                onChangeText={setVehicleNo}
                placeholder="HR 26 AB 1234"
                autoCapitalize="characters"
              />
              <FormField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                rightElement={
                  <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                    {showPassword ? (
                      <EyeOff size={16} color={theme.textMuted} />
                    ) : (
                      <Eye size={16} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                }
              />
              <FormField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry={!showConfirm}
                rightElement={
                  <TouchableOpacity onPress={() => setShowConfirm((s) => !s)}>
                    {showConfirm ? (
                      <EyeOff size={16} color={theme.textMuted} />
                    ) : (
                      <Eye size={16} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                }
              />

              <PrimaryButton title="Reset Password" onPress={handleSubmit} loading={loading} />
            </View>
          </View>
        ) : (
          <View style={[styles.card, { alignItems: 'center' }]}>
            <View style={styles.successBadge}>
              <CheckCircle2 size={40} color={theme.success} />
            </View>
            <Text style={styles.title}>Password Reset!</Text>
            <Text style={styles.subtitle}>
              {studentName ? `${studentName}, your` : 'Your'} password has been updated successfully.
            </Text>
            <PrimaryButton
              title="Go to Login"
              onPress={() => router.replace('/login')}
              style={{ marginTop: 24, width: '100%' }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 70, paddingBottom: 40 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 32,
    padding: 26,
  },
  headerBlock: { alignItems: 'center', marginBottom: 24, gap: 8 },
  iconBadge: {
    padding: 16,
    backgroundColor: theme.accentSoft,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 6,
  },
  title: { color: theme.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: theme.textMuted, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  infoBadge: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
  },
  infoBadgeText: { color: '#bfdbfe', fontSize: 11, flex: 1, lineHeight: 16 },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
