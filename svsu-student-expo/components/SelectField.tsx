import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { theme } from '@/lib/theme';

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  badge?: string;
}

export default function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  required,
  icon,
  badge,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>
        {label} {required ? <Text style={{ color: theme.accent }}>*</Text> : null}
      </Text>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
        <Text style={[styles.triggerText, !selected && { color: theme.textMuted }]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <ChevronDown size={16} color={theme.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value && <Check size={16} color={theme.accent} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  triggerText: { flex: 1, color: theme.text, fontSize: 15, fontWeight: '600' },
  badge: {
    backgroundColor: theme.accentSoft,
    borderWidth: 1,
    borderColor: theme.accent + '33',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  badgeText: { color: theme.accent, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.cardSolid,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 30,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sheetTitle: { color: theme.text, fontWeight: '800', fontSize: 15 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optionText: { color: theme.text, fontSize: 14, fontWeight: '600', flex: 1 },
});
