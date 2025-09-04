import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FilterGroup, Selection } from "../types";

type Props = {
  groups?: FilterGroup[];
  value?: Selection;
  onChange: (next: Selection) => void;
};

/** Only these groups are shown in the popup */
const ALLOWED_KEYS = new Set(["gender", "masterCategory", "subCategory", "color"]);

export default function FilterControls({ groups, value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const selection = value ?? {};
  const safeGroups = useMemo(
    () => (Array.isArray(groups) ? groups.filter(g => ALLOWED_KEYS.has(g.key)) : []),
    [groups]
  );

  // Local draft so Cancel won’t mutate parents; Apply will
  const [draft, setDraft] = useState<Selection>({});
  useEffect(() => {
    // keep draft in sync when props.value changes externally
    setDraft(selection);
  }, [selection]);

  const selectedCount = useMemo(
    () => Object.values(selection).filter((v) => !!v).length,
    [selection]
  );

  const summary = useMemo(() => {
    // Build a compact summary like: Men • Apparel • Navy Blue
    const parts: string[] = [];
    const take = (key: string) => {
      const g = safeGroups.find((x) => x.key === key);
      const val = selection[key];
      if (!g || !val) return;
      const opt = g.options?.find((o) => o.id === val);
      parts.push(opt?.label ?? String(val));
    };
    ["gender", "masterCategory", "subCategory", "color"].forEach(take);
    return parts.join(" • ");
  }, [selection, safeGroups]);

  const setGroup = (key: string, val: string | null) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  const apply = () => {
    onChange(draft);
    setVisible(false);
  };

  const reset = () => {
    const cleared: Selection = {};
    safeGroups.forEach((g) => (cleared[g.key] = null));
    onChange(cleared);
    setDraft(cleared);
    setVisible(false);
  };

  return (
    <View style={styles.header}>
      <Pressable style={styles.filterButton} onPress={() => setVisible(true)}>
        <Text style={styles.filterButtonText}>
          Filters{selectedCount ? ` (${selectedCount})` : ""}
        </Text>
      </Pressable>

      {!!summary && <Text style={styles.summaryText} numberOfLines={1}>{summary}</Text>}

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={10}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.sheetBody}>
              {safeGroups.map((g) => {
                const selected = draft[g.key] ?? null;
                const opts = Array.isArray(g.options) ? g.options : [];
                return (
                  <View key={g.key} style={styles.groupBlock}>
                    <Text style={styles.groupLabel}>{g.label}</Text>
                    <View style={styles.rowWrap}>
                      <Chip
                        label="All"
                        selected={selected === null}
                        onPress={() => setGroup(g.key, null)}
                      />
                      {opts.map((opt) => (
                        <Chip
                          key={opt.id}
                          label={opt.label}
                          selected={selected === opt.id}
                          onPress={() =>
                            setGroup(g.key, selected === opt.id ? null : opt.id)
                          }
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Pressable style={[styles.footerBtn, styles.reset]} onPress={reset}>
                <Text style={styles.footerBtnText}>Reset</Text>
              </Pressable>
              <View style={{ width: 12 }} />
              <Pressable style={[styles.footerBtn, styles.apply]} onPress={apply}>
                <Text style={[styles.footerBtnText, styles.applyText]}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
      android_ripple={{ color: "rgba(255,255,255,0.08)" }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#111214",
  },
  filterButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  filterButtonText: { color: "#fff", fontWeight: "600" },
  summaryText: {
    marginTop: 6,
    color: "#B9BDC3",
    fontSize: 12,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0F1114",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  sheetTitle: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },
  closeText: { color: "#9AA0A6", fontSize: 18, padding: 2 },

  sheetBody: { padding: 14, rowGap: 14 },
  groupBlock: {},
  groupLabel: { color: "#AEB0B4", fontSize: 12, marginBottom: 8, fontWeight: "600" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.30)",
  },
  chipText: { color: "#E6E7EB", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#fff" },

  sheetFooter: {
    flexDirection: "row",
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reset: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "transparent",
  },
  apply: {
    backgroundColor: "#4C8BF5",
  },
  footerBtnText: { color: "#E6E7EB", fontWeight: "700" },
  applyText: { color: "#fff" },
});
