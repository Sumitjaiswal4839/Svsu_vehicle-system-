import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  User,
  Car,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react-native';
import FormField from '@/components/FormField';
import SelectField from '@/components/SelectField';
import CameraCaptureField from '@/components/CameraCaptureField';
import PrimaryButton from '@/components/PrimaryButton';
import { api, ApiError } from '@/lib/api';
import { setSessionActive } from '@/lib/auth';
import { getAutoBuilding, BUILDING_MAP } from '@/lib/buildingLogic';
import { isValidVehicleNumber, formatVehicleNumber } from '@/lib/validation';
import { theme } from '@/lib/theme';
import type { RegisterFormData, StudentProfile } from '@/lib/types';

const FACULTIES = [
  'Skill Faculty of Engineering & Technology',
  'Skill Faculty of Applied Sciences & Humanities',
  'Skill Faculty of Management Studies & Research',
  'Skill Faculty of Agriculture',
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
  const suffix = sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th';
  return { label: `${sem}${suffix} Sem`, value: `${sem}${suffix}` };
});

const emptyForm: RegisterFormData = {
  name: '',
  course: '',
  semester: '',
  faculty: '',
  rollNo: '',
  password: '',
  vehicleNo: '',
  license: '',
  rcPhoto: '',
  idCardFront: '',
  idCardBack: '',
  profilePhoto: '',
  buildingId: '',
};

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string }>();
  const isEdit = params.edit === 'true';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState<RegisterFormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const data = await api.get<StudentProfile>('/api/profile');
        setForm({
          name: data.name,
          course: data.course,
          semester: data.semester,
          faculty: data.faculty || '',
          rollNo: data.rollNo,
          password: '',
          vehicleNo: data.vehicleNo,
          license: data.license || '',
          rcPhoto: data.rcPhoto,
          idCardFront: data.idCardFront,
          idCardBack: data.idCardBack,
          profilePhoto: data.profilePhoto || '',
          buildingId: data.buildingId || '',
        });
      } catch (e) {
        router.replace('/login');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [isEdit]);

  // Auto-assign building based on faculty/course, same as web app.
  useEffect(() => {
    if (form.faculty || form.course) {
      const bCode = getAutoBuilding(form.faculty, form.course);
      setForm((prev) => ({ ...prev, buildingId: bCode }));
    }
  }, [form.faculty, form.course]);

  const update = (patch: Partial<RegisterFormData>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    const required: (keyof RegisterFormData)[] = [
      'name',
      'rollNo',
      'vehicleNo',
      'rcPhoto',
      'idCardFront',
      'idCardBack',
      'faculty',
      'semester',
      'course',
      'profilePhoto',
      'buildingId',
    ];
    // password is only required for a brand-new registration
    const missing = required.filter((k) => !form[k]);
    if (!isEdit) {
      if (!form.password) missing.push('password');
    }
    if (missing.length > 0) {
      Alert.alert(
        'Missing information',
        'Please fill all mandatory fields including Profile Photo and Building.'
      );
      return;
    }

    if (!isValidVehicleNumber(form.vehicleNo)) {
      Alert.alert('Invalid vehicle number', 'Use format: HR 26 AB 1234');
      return;
    }

    const payload = { ...form, vehicleNo: formatVehicleNumber(form.vehicleNo) };
    // Don't send an empty password on edit (backend would hash "" otherwise)
    if (isEdit && !payload.password) {
      // @ts-expect-error - intentionally omit
      delete payload.password;
    }

    setLoading(true);
    try {
      await api.post('/api/profile', payload);
      await setSessionActive(true);
      Alert.alert('Success', `Profile ${isEdit ? 'updated' : 'saved'} successfully!`);
      router.replace(isEdit ? '/(tabs)' : '/login');
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Connection error';
      Alert.alert('Failed to save profile', message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={theme.accent} size="large" />
        <Text style={styles.loadingText}>Securing Session...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                {step === 1 && <User size={22} color={theme.accent} />}
                {step === 2 && <Car size={22} color={theme.purple} />}
                {step === 3 && <ShieldCheck size={22} color="#3b82f6" />}
              </View>
              <View>
                <Text style={styles.title}>
                  {step === 1 && (isEdit ? 'Update Profile' : 'New Registration')}
                  {step === 2 && 'Vehicle Verification'}
                  {step === 3 && 'Identity Verification'}
                </Text>
                <Text style={styles.stepText}>Step {step} of 3</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                step === 1
                  ? router.replace(isEdit ? '/(tabs)' : '/login')
                  : setStep((s) => (s - 1) as 1 | 2 | 3)
              }
            >
              <ArrowLeft size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View style={{ gap: 18 }}>
              <FormField label="Full Name" required value={form.name} onChangeText={(v) => update({ name: v })} placeholder="E.g. Sumit Bhardwaj" />

              <CameraCaptureField
                label="Profile Photo (Selfie)"
                required
                facing="front"
                aspectRatio={1}
                value={form.profilePhoto || null}
                onCapture={(uri) => update({ profilePhoto: uri })}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <FormField label="Roll Number" required value={form.rollNo} onChangeText={(v) => update({ rollNo: v })} placeholder="2100..." autoCapitalize="none" editable={!isEdit} />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Set Password"
                    required={!isEdit}
                    icon={<Lock size={16} color={theme.textMuted} />}
                    value={form.password}
                    onChangeText={(v) => update({ password: v })}
                    placeholder={isEdit ? 'Leave blank to keep' : '••••••••'}
                    secureTextEntry={!showPassword}
                    rightElement={
                      <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                        {showPassword ? <EyeOff size={16} color={theme.textMuted} /> : <Eye size={16} color={theme.textMuted} />}
                      </TouchableOpacity>
                    }
                  />
                </View>
              </View>

              <SelectField
                label="Faculty"
                required
                value={form.faculty}
                onChange={(v) => update({ faculty: v })}
                placeholder="Select Faculty"
                options={FACULTIES.map((f) => ({ label: f, value: f }))}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <FormField label="Course" required value={form.course} onChangeText={(v) => update({ course: v })} placeholder="B.Tech CS" />
                </View>
                <View style={{ flex: 1 }}>
                  <SelectField label="Semester" required value={form.semester} onChange={(v) => update({ semester: v })} placeholder="Select" options={SEMESTERS} />
                </View>
              </View>

              <SelectField
                label="Assigned Security Zone (Building)"
                required
                icon={<MapPin size={16} color={theme.accent} />}
                value={form.buildingId}
                onChange={(v) => update({ buildingId: v })}
                placeholder="Select Building"
                badge="Auto-Assigned"
                options={BUILDING_MAP.map((b) => ({ label: `${b.name} (${b.code})`, value: b.code }))}
              />
              <Text style={styles.hintText}>* Based on your Faculty/Course. You can override if incorrect.</Text>

              <PrimaryButton
                title="Continue to Vehicle Details"
                onPress={() => setStep(2)}
                icon={<ArrowRight size={18} color="#fff" />}
              />
            </View>
          )}

          {/* Step 2: Vehicle */}
          {step === 2 && (
            <View style={{ gap: 18 }}>
              <FormField
                label="Vehicle Number"
                required
                value={form.vehicleNo}
                onChangeText={(v) => update({ vehicleNo: v })}
                placeholder="HR 26 AB 1234"
                autoCapitalize="characters"
              />

              <CameraCaptureField
                label="RC Photo (Mandatory)"
                required
                facing="back"
                value={form.rcPhoto || null}
                onCapture={(uri) => update({ rcPhoto: uri })}
              />

              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" variant="secondary" onPress={() => setStep(1)} style={{ flex: 1 }} />
                <PrimaryButton
                  title="Next: ID Cards"
                  onPress={() => setStep(3)}
                  disabled={!form.rcPhoto}
                  icon={<ArrowRight size={18} color="#fff" />}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}

          {/* Step 3: ID Cards */}
          {step === 3 && (
            <View style={{ gap: 20 }}>
              <CameraCaptureField
                label="College ID Card (Front)"
                required
                facing="back"
                value={form.idCardFront || null}
                onCapture={(uri) => update({ idCardFront: uri })}
              />
              <CameraCaptureField
                label="College ID Card (Back)"
                required
                facing="back"
                value={form.idCardBack || null}
                onCapture={(uri) => update({ idCardBack: uri })}
              />

              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" variant="secondary" onPress={() => setStep(2)} style={{ flex: 1 }} />
                <PrimaryButton
                  title={loading ? 'Processing...' : 'Complete Registration'}
                  onPress={handleSave}
                  loading={loading}
                  disabled={!form.idCardFront || !form.idCardBack}
                  icon={!loading ? <ShieldCheck size={18} color="#fff" /> : undefined}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 18, paddingTop: 60, paddingBottom: 60 },
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 30,
    padding: 22,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBadge: {
    padding: 12,
    backgroundColor: theme.accentSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.accent + '4d',
  },
  title: { color: theme.text, fontSize: 19, fontWeight: '900' },
  stepText: { color: theme.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 12 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  hintText: { color: '#52525b', fontSize: 10, fontStyle: 'italic', marginLeft: 2, marginTop: -8 },
  loadingScreen: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: theme.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
});
