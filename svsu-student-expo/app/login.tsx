import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, User, Lock, ArrowRight, Eye, EyeOff, Info } from 'lucide-react-native';
import FormField from '@/components/FormField';
import MathCaptcha from '@/components/MathCaptcha';
import PrimaryButton from '@/components/PrimaryButton';
import { api, ApiError } from '@/lib/api';
import { setSessionActive } from '@/lib/auth';
import { theme } from '@/lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSubmit = async () => {
    if (!rollNo || !password) {
      Alert.alert('Missing info', 'Please enter your roll number and password.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/student/login', { rollNo, password });
      await setSessionActive(true);
      router.replace('/(tabs)');
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'System error. Please try again.';
      Alert.alert('Login failed', message);
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
        <View style={styles.card}>
          <View style={styles.headerBlock}>
            <View style={styles.iconBadge}>
              <Shield size={36} color={theme.accent} />
            </View>
            <Text style={styles.title}>Student Login</Text>
            <Text style={styles.subtitle}>Verify your identity to access Gate Pass</Text>
          </View>

          <View style={{ gap: 20 }}>
            <FormField
              label="Roll Number"
              icon={<User size={16} color={theme.textMuted} />}
              value={rollNo}
              onChangeText={setRollNo}
              placeholder="2100..."
              autoCapitalize="none"
            />

            <View>
              <View style={styles.forgotRow}>
                <Text style={styles.passwordLabel}>Secure Password</Text>
                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <FormField
                label=""
                icon={<Lock size={16} color={theme.textMuted} />}
                value={password}
                onChangeText={setPassword}
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
            </View>

            <MathCaptcha onVerify={setCaptchaOk} />

            <PrimaryButton
              title={loading ? 'Verifying...' : 'Sign In'}
              onPress={handleSubmit}
              loading={loading}
              disabled={!captchaOk}
              icon={!loading ? <ArrowRight size={18} color="#fff" /> : undefined}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have a profile yet? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showWelcome}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWelcome(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconBadge}>
                <Info size={32} color={theme.accent} />
              </View>
              <Text style={styles.modalTitle}>How it works</Text>
              <Text style={styles.modalText}>
                Welcome to the SVSU Gate Pass system. Please login with your University Roll Number and Password to access your digital gate pass, request leaves, and view your entry logs.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowWelcome(false)}
              >
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 80, paddingBottom: 40 },
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 32,
    padding: 26,
  },
  headerBlock: { alignItems: 'center', marginBottom: 30, gap: 6 },
  iconBadge: {
    padding: 16,
    backgroundColor: theme.accentSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.accent + '4d',
    marginBottom: 6,
  },
  title: { color: theme.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 2,
  },
  passwordLabel: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  forgotLink: {
    color: theme.accent,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 26 },
  footerText: { color: theme.textMuted, fontSize: 12 },
  footerLink: { color: theme.accent, fontSize: 12, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalIconBadge: {
    padding: 12,
    backgroundColor: theme.accentSoft,
    borderRadius: 20,
    marginBottom: 16,
  },
  modalTitle: { color: theme.text, fontSize: 20, fontWeight: '800', marginBottom: 12 },
  modalText: {
    color: theme.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: theme.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
