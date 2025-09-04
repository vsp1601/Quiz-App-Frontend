// src/screens/SwipeScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Image, Text, useWindowDimensions, Platform } from "react-native";
import Swiper from "react-native-deck-swiper";

import FilterControls from "../components/FilterControls";
import { fetchFilters, fetchSwipeCards } from "../services/api";
import { rateProduct } from "../api/clients";
import { FilterGroup, ProductCard, Selection } from "../types";

export default function SwipeScreen() {
  const [filters, setFilters] = useState<FilterGroup[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<ProductCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const swiperRef = useRef<Swiper<ProductCard>>(null);

  // --- Dynamic card size (fill most of the screen cleanly)
  const { width, height } = useWindowDimensions();
  const PADDING = 12;                 // same as deckArea padding
  const HEADER_EST = 56;              // Filters row height
  const TABBAR_EST = Platform.OS === "ios" ? 96 : 72;  // bottom tabs + gesture bar
  const VERTICAL_MARGINS = PADDING * 2 + HEADER_EST + TABBAR_EST;
  const cardHeight = Math.max(380, Math.round(height - VERTICAL_MARGINS)); // never below 380
  const cardWidth = Math.round(width - PADDING * 2);                        // edge-to-edge inside padding

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
      const res = await fetchSwipeCards(sel);
      setItems(res.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load items");
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

  const sendRating = useCallback(async (p: ProductCard | undefined, rating: number) => {
    if (!p) return;
    const pid = typeof p.id === "string" ? parseInt(p.id as string, 10) : Number(p.id);
    if (!Number.isFinite(pid)) return;
    try {
      await rateProduct(pid, rating);
    } catch (err: any) {
      console.log("rateProduct error:", err?.message ?? err);
    }
  }, []);

  const buildDetailsLine = (card?: ProductCard) => {
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

  const renderCard = (it?: ProductCard) => {
    if (!it) {
      return (
        <View style={[styles.card, { width: cardWidth, height: cardHeight }, styles.cardEmpty]}>
          <Text style={styles.emptyText}>No more items</Text>
        </View>
      );
    }
    const details = buildDetailsLine(it);
    return (
      <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
        {it.imageUrl ? (
          <Image source={{ uri: it.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.title}>{it.title}</Text>
          </View>
        )}
        <View style={styles.detailsOverlay} pointerEvents="none">
          <Text style={styles.cardTitle} numberOfLines={2}>{it.title || " "}</Text>
          {!!details && <Text style={styles.cardMeta} numberOfLines={2}>{details}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <FilterControls groups={filters} value={selection} onChange={setSelection} />

      <View style={styles.deckArea}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
        ) : !items.length ? (
          <View style={styles.center}><Text style={styles.emptyText}>No items</Text></View>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={items}
            renderCard={renderCard}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={12}
            verticalSwipe={false}
            animateCardOpacity
            cardIndex={0}
            containerStyle={styles.swiperContainer}
            cardStyle={styles.cardBase}          // base look; size is set per-card above
            cardVerticalMargin={0}
            onSwipedRight={(idx) => sendRating(items[idx], 1.0)}
            onSwipedLeft={(idx) => sendRating(items[idx], 0.0)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111214" },

  deckArea: { flex: 1, padding: 12 },

  swiperContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // deck vertically centered
  },

  // Base card look (size is applied in renderCard)
  cardBase: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1A1C20",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  card: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1A1C20",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },

  image: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center" },

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

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#ff6b6b", fontSize: 14, textAlign: "center", paddingHorizontal: 16 },
  emptyText: { color: "#b8bcc2", fontSize: 14 },
});
