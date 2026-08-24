import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { theme } from '@/lib/theme';

interface Props {
  onVerify: (isValid: boolean) => void;
}

export default function MathCaptcha({ onVerify }: Props) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isError, setIsError] = useState(false);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setUserInput('');
    setIsError(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (val: string) => {
    setUserInput(val);
    const numeric = parseInt(val, 10);
    if (numeric === num1 + num2) {
      setIsError(false);
      onVerify(true);
    } else {
      onVerify(false);
      if (val.length >= String(num1 + num2).length) {
        setIsError(true);
      } else {
        setIsError(false);
      }
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>Human Verification</Text>
      <View style={styles.row}>
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            {num1} + {num2} = ?
          </Text>
          <TouchableOpacity onPress={generateCaptcha} style={styles.refreshBtn}>
            <RefreshCw size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
        <TextInput
          value={userInput}
          onChangeText={handleChange}
          placeholder="Ans"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          style={[styles.answerInput, isError && styles.answerInputError]}
        />
      </View>
      {isError && userInput.length > 0 && <Text style={styles.errorText}>Incorrect Answer</Text>}
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
  row: { flexDirection: 'row', gap: 12 },
  questionBox: {
    flex: 1,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    color: '#d4d4d8',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  refreshBtn: { padding: 4 },
  answerInput: {
    width: 90,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    textAlign: 'center',
    color: theme.text,
    fontWeight: '800',
    fontSize: 16,
  },
  answerInputError: {
    borderColor: theme.danger,
  },
  errorText: {
    color: theme.danger,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
});
