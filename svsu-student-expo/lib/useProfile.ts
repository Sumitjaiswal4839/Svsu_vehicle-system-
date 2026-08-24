import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from './api';
import { setSessionActive } from './auth';
import type { StudentProfile } from './types';

export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<StudentProfile>('/api/profile');
      setProfile(data);
    } catch (e) {
      await setSessionActive(false);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  return { profile, loading, reload: loadProfile };
}
