import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/lib/theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  variant = 'primary',
  style,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, variantStyles[variant], isDisabled && { opacity: 0.5 }, style]}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variant === 'ghost' && { color: theme.textMuted }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: theme.accent },
  secondary: { backgroundColor: '#27272a' },
  danger: { backgroundColor: theme.dangerSoft, borderWidth: 1, borderColor: theme.danger + '55' },
  ghost: { backgroundColor: 'transparent' },
};
