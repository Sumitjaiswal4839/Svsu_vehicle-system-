import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { theme } from '@/lib/theme';

interface Props extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  required?: boolean;
}

export default function FormField({ label, icon, rightElement, required, style, ...rest }: Props) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>
        {label} {required ? <Text style={{ color: theme.accent }}>*</Text> : null}
      </Text>
      <View style={styles.inputWrap}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <TextInput
          placeholderTextColor={theme.textMuted}
          style={[styles.input, icon ? { paddingLeft: 44 } : null, rightElement ? { paddingRight: 44 } : null, style]}
          {...rest}
        />
        {rightElement && <View style={styles.rightWrap}>{rightElement}</View>}
      </View>
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
  inputWrap: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    color: theme.text,
    fontSize: 15,
  },
  iconWrap: { position: 'absolute', left: 16, zIndex: 2 },
  rightWrap: { position: 'absolute', right: 14, zIndex: 2 },
});
