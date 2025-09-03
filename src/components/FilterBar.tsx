import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { useFilters } from '../store/filters';

const genders = [undefined, 'men', 'women'] as const;
const categories = [undefined, 'garments', 'jewelry', 'cosmetics'] as const;

export default function FilterBar() {
  const { gender, category, setGender, setCategory } = useFilters();

  const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Filters</Text>
      <View style={styles.row}>
        {genders.map((g, idx) => (
          <Chip key={idx} label={g ? g : 'all'} active={gender === g} onPress={() => setGender(g as any)} />
        ))}
      </View>
      <View style={styles.row}>
        {categories.map((c, idx) => (
          <Chip key={idx} label={c ? c : 'all'} active={category === c} onPress={() => setCategory(c as any)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, backgroundColor: colors.bg },
  heading: { color: colors.textDim, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.cardAlt },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textDim },
  chipTextActive: { color: '#00331F', fontWeight: '700' }
});
