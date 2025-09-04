import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  TouchableOpacity,
  Alert,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";

import FilterControls from "../components/FilterControls";
import { fetchFilters, fetchRecommendations } from "../services/api";
import { logout } from "../api/clients";
import { FilterGroup, Recommendation, Selection } from "../types";

export default function RecommendationsScreen() {
  const [filters, setFilters] = useState<FilterGroup[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  const suppressFetchRef = useRef<boolean>(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const { width, height } = useWindowDimensions();
  const PADDING = 12;
  const estimatedTabBar = Platform.OS === "ios" ? 64 : 56;
  const cardHeight = Math.max(
    360,
    Math.round(
      height
        - insets.top
        - insets.bottom
        - headerHeight
        - estimatedTabBar
        - PADDING * 2
    )
  );
  const cardWidth = Math.round(width - PADDING * 2);

  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  }, []);

  const safeResetToAuth = useCallback(() => {
    try {
      suppressFetchRef.current = true;
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      navigation.navigate('Login');
    }
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    try {
      suppressFetchRef.current = true;
      setLoading(true);
      
      await logout();
      safeResetToAuth();
    } catch (e: any) {
      suppressFetchRef.current = false;
      setLoading(false);
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  }, [safeResetToAuth]);

  const loadFilters = useCallback(async () => {
    if (suppressFetchRef.current) return;
    try {
      const res = await fetchFilters();
      setFilters(Array.isArray(res.groups) ? res.groups : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load filters");
    }
  }, []);

  const loadData = useCallback(async (sel: Selection) => {
    if (suppressFetchRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecommendations(sel);
      if (!suppressFetchRef.current) setItems(res.items ?? []);
    } catch (e: any) {
      if (!suppressFetchRef.current) setError(e?.message ?? "Failed to load recommendations");
    } finally {
      if (!suppressFetchRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadFilters();
      await loadData({});
    })();
    return () => {
      suppressFetchRef.current = true;
    };
  }, [loadFilters, loadData]);

  useEffect(() => {
    if (!loading) loadData(selection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const header = useMemo(
    () => (
      <View
        style={[styles.headerRow, { paddingTop: Math.max(insets.top, 8) }]}
        onLayout={onHeaderLayout}
      >
        <View style={styles.filtersWrap}>
          <FilterControls groups={filters} value={selection} onChange={setSelection} />
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          disabled={loading}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    ),
    [filters, selection, handleLogout, insets.top, onHeaderLayout, loading]
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
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            onPress={() => loadData(selection)} 
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
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
              <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.cardImage, styles.placeholder]}>
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                )}
                <View style={styles.detailsOverlay} pointerEvents="none">
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title || " "}</Text>
                  {!!details && <Text style={styles.cardMeta} numberOfLines={2}>{details}</Text>}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={[styles.center, { paddingVertical: 48 }]}>
              <Text style={styles.emptyText}>No recommendations available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111214" },

  headerRow: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filtersWrap: { flex: 1, marginRight: 8 },

  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  listContent: { 
    padding: 12, 
    paddingBottom: 24, 
    alignItems: "center",
    flexGrow: 1, // Ensures proper background fill
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#ff6b6b", fontSize: 14, textAlign: "center", paddingHorizontal: 16 },
  emptyText: { color: "#b8bcc2", fontSize: 14, textAlign: "center" },

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

  // Retry button
  retryBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});