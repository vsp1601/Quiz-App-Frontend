// src/components/Select.tsx
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import colors from '../theme/colors';

type Option = { label: string; value: string };

type Props = {
  label?: string;
  value?: string;
  options: Option[];
  onChange: (v: string) => void;
};

export default function Select({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = useMemo(() => options.find(o => o.value === value)?.label ?? 'Select', [options, value]);

  return (
    <View style={styles.container}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={styles.value}>{current}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.row, item.value === value && styles.rowActive]}
                onPress={() => { onChange(item.value); setOpen(false); }}
              >
                <Text style={[styles.rowText, item.value === value && styles.rowTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 150 },
  label: { color: colors.textDim, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#1f1f1f12',
    borderRadius: 12,
    borderWidth: 1, borderColor: '#00000010',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  value: { color: colors.text, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    position: 'absolute', left: 16, right: 16, top: '25%',
    backgroundColor: colors.card, borderRadius: 14,
    paddingVertical: 8, maxHeight: '50%',
  },
  row: { paddingHorizontal: 16, paddingVertical: 14 },
  rowActive: { backgroundColor: '#ffffff08' },
  rowText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rowTextActive: { color: colors.primary },
});
