import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Send } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({ type: 'error', text1: 'Rating Required', text2: 'Please select a star rating.' });
      return;
    }

    setSubmitting(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      let rollNo = '';
      if (userStr) {
        const user = JSON.parse(userStr);
        rollNo = user.rollNo || '';
      }

      await api.post('/api/feedback', {
        rating,
        comment,
        rollNo,
        source: 'APP'
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'Feedback submitted successfully!' });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>How was your experience?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <Star 
                  size={40} 
                  color={star <= rating ? '#eab308' : theme.border} 
                  fill={star <= rating ? '#eab308' : 'transparent'} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Tell us more (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="What could we improve?"
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.submitBtn, (submitting || rating === 0) && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            <Send color="#fff" size={20} />
            <Text style={styles.submitText}>{submitting ? 'Sending...' : 'Submit Feedback'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 24,
  },
  subtitle: {
    color: theme.text,
    fontSize: 24,
    fontFamily: 'Inter-Black',
    marginBottom: 24,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  starBtn: {
    padding: 4,
  },
  label: {
    color: theme.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    color: theme.text,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    minHeight: 120,
    marginBottom: 32,
  },
  submitBtn: {
    backgroundColor: theme.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  }
});
