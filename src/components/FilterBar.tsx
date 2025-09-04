// src/components/FilterBar.tsx
import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { FilterGroup } from "../types";

type Props = {
  groups?: FilterGroup[];                       // may arrive undefined during first render
  value?: Record<string, string | null>;        // also optional
  onChange: (next: Record<string, string | null>) => void;
  topPadding?: number;
};

export default function FilterBar({
  groups,
  value,
  onChange,
  topPadding = 8,
}: Props) {
  const selection = value ?? {};                // ensure object
  const safeGroups = Array.isArray(groups) ? groups : [];  // ensure array

  const setGroup = (groupKey: string, newVal: string | null) => {
    onChange({ ...selection, [groupKey]: newVal });
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {safeGroups.map((g) => {
        const selected = selection[g.key] ?? null;
        const opts = Array.isArray(g.options) ? g.options : [];

        return (
          <View key={g.key} style={styles.groupBlock}>
            <Text style={styles.groupLabel}>{g.label}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionsRow}
            >
              <Chip label="All" selected={selected === null} onPress={() => setGroup(g.key, null)} />
              {opts.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={selected === opt.id}
                  onPress={() => setGroup(g.key, selected === opt.id ? null : opt.id)}
                />
              ))}
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0B0B0C",
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  groupBlock: { marginBottom: 10 },
  groupLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#AEB0B4",
    marginBottom: 6,
  },
  optionsRow: { gap: 8, paddingRight: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.28)",
  },
  chipText: { color: "#E6E7EB", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#FFFFFF" },
});
