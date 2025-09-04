// src/screens/RecommendationsScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Image,
  Text,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";

import FilterControls from "../components/FilterControls";
import { fetchFilters, fetchRecommendations } from "../services/api";
import { FilterGroup, Recommendation, Selection } from "../types";

export default function RecommendationsScreen() {
  const [filters, setFilters] = useState<FilterGroup[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ----- Dynamic card sizing to match Swipe screen -----
  const { width, height } = useWindowDimensions();
  const PADDING = 12;
  const HEADER_EST = 56; // Filters row height
  const TABBAR_EST = Platform.OS === "ios" ? 96 : 72;
  const VERTICAL_MARGINS = PADDING * 2 + HEADER_EST + TABBAR_EST;

  // show one big card per row (like swipe), with consistent height
  const cardHeight = Math.max(380, Math.round(height - VERTICAL_MARGINS));
  const cardWidth = Math.round(width - PADDING * 2);

  const loadFilters = useCallback(async () => {
    try {
      const res = await fetchFilters();
      setFilters(Array.isArray(res.groups) ? res.groups : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load filters");
    }
  }, []);

  const loadData = useCallback(async (sel: Selection) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecommendations(sel);
      setItems(res.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadFilters();
      await loadData({});
    })();
  }, [loadFilters, loadData]);

  useEffect(() => {
    if (!loading) loadData(selection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const header = useMemo(
    () => <FilterControls groups={filters} value={selection} onChange={setSelection} />,
    [filters, selection]
  );

  const buildDetailsLine = (card?: Recommendation) => {
    if (!card) return "";
    const anyCard = card as any;
    const parts = [
      anyCard.category || anyCard.masterCategory,
      anyCard.subcategory || anyCard.subCategory,
      anyCard.color || anyCard.baseColour,
      anyCard.gender,
      anyCard.season,
      anyCard.usage,
    ].filter(Boolean);
    return parts.join(" • ");
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.center}><ActivityIndicator /></View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {header}

      {error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => String(it.id ?? idx)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadData(selection);
                setRefreshing(false);
              }}
            />
          }
          renderItem={({ item }) => {
            const details = buildDetailsLine(item);
            return (
              <View
                style={[
                  styles.card,
                  { width: cardWidth, height: cardHeight },
                ]}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.cardImage, styles.placeholder]}>
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                )}

                {/* Bottom overlay just like Swipe screen */}
                <View style={styles.detailsOverlay} pointerEvents="none">
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title || " "}
                  </Text>
                  {!!details && (
                    <Text style={styles.cardMeta} numberOfLines={2}>
                      {details}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={[styles.center, { paddingVertical: 48 }]}>
              <Text style={styles.emptyText}>No recommendations</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111214" },

  listContent: {
    padding: 12,
    paddingBottom: 24,
    alignItems: "center", // center the big cards
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#ff6b6b", fontSize: 14, textAlign: "center", paddingHorizontal: 16 },
  emptyText: { color: "#b8bcc2", fontSize: 14 },

  // Match Swipe card look
  card: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1A1C20",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignSelf: "center",
  },
  cardImage: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 16, fontWeight: "700", paddingHorizontal: 12, textAlign: "center" },

  // Same bottom overlay as Swipe
  detailsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cardMeta: { color: "#D3D6DA", fontSize: 12, fontWeight: "500" },
});
