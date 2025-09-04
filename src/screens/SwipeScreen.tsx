// src/screens/SwipeScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Text,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  Alert,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-deck-swiper";

import { useAuth } from "../context/AuthContext";
import FilterControls from "../components/FilterControls";
import { fetchFilters, fetchSwipeCards } from "../services/api";
import { rateProduct } from "../api/clients";
import { FilterGroup, ProductCard, Selection } from "../types";

type LoadMoreCard = { kind: "load-more" };
type Card = (ProductCard & { kind?: undefined }) | LoadMoreCard;

export default function SwipeScreen() {
  const [filters, setFilters] = useState<FilterGroup[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<ProductCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const swiperRef = useRef<Swiper<Card>>(null);
  const suppressFetchRef = useRef<boolean>(false);

  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // --- Layout / sizing so the deck doesn't get cropped ---
  const DECK_PADDING = 12;
  const estimatedTabBar = Platform.OS === "ios" ? 64 : 56;

  const cardHeight = useMemo(() => {
    const h =
      height -
      insets.top -
      insets.bottom -
      headerHeight -
      estimatedTabBar -
      DECK_PADDING * 2;
    return Math.max(360, Math.round(h));
  }, [height, insets.top, insets.bottom, headerHeight]);

  const cardWidth = useMemo(
    () => Math.round(width - DECK_PADDING * 2),
    [width]
  );

  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  }, []);

  // --- Logout: clear auth; Gate will switch to Login stack automatically ---
  const handleLogout = useCallback(async () => {
    try {
      suppressFetchRef.current = true;
      setLoading(true);
      // best-effort: even if server call fails, context logout will flip UI
      await logout();
    } catch (e: any) {
      Alert.alert("Logout", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // --- Data loaders ---
  const loadFilters = useCallback(async () => {
    if (suppressFetchRef.current) return;
    try {
      const res = await fetchFilters();
      setFilters(Array.isArray(res.groups) ? res.groups : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load filters");
    }
  }, []);

  const loadData = useCallback(
    async (sel: Selection, append: boolean = false) => {
      if (suppressFetchRef.current) return;

      if (!append) {
        setLoading(true);
        setCurrentIndex(0);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const res = await fetchSwipeCards(sel);
        if (!suppressFetchRef.current) {
          const newItems = Array.isArray(res.items) ? res.items : [];
          setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        }
      } catch (e: any) {
        if (!suppressFetchRef.current)
          setError(e?.message ?? "Failed to load items");
      } finally {
        if (!suppressFetchRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  const loadMoreItems = useCallback(async () => {
    await loadData(selection, true);
  }, [loadData, selection]);

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

  // --- Rating ---
  const sendRating = useCallback(async (p: ProductCard | undefined, rating: number) => {
    if (!p) return;
    const pid =
      typeof p.id === "string" ? parseInt(p.id as string, 10) : Number(p.id);
    if (!Number.isFinite(pid)) return;
    try {
      await rateProduct(pid, rating);
    } catch (err: any) {
      console.log("rateProduct error:", err?.message ?? err);
    }
  }, []);

  // --- Helpers ---
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

  // Cards array (add a "load more" card when near the end)
  const showLoadMoreCard = currentIndex >= Math.max(items.length - 2, 0);

  const cardsMemo: Card[] = useMemo(() => {
    if (!items.length) return [];
    return showLoadMoreCard
      ? [...items, { kind: "load-more" } as LoadMoreCard]
      : items;
  }, [items, showLoadMoreCard]);

  const handleSwipe = useCallback(
    (cardIndex: number, rating: number) => {
      const card = cardsMemo[cardIndex];
      if (card && !("kind" in card)) {
        sendRating(card, rating);
      }
      setCurrentIndex(cardIndex + 1);
    },
    [cardsMemo, sendRating]
  );

  // Key extractor (works across lib typings)
  const keyExtractor = useCallback((card: Card): string => {
    if ("kind" in card && card.kind === "load-more") return "__load_more__";
    const idVal = (card as ProductCard).id;
    if (typeof idVal === "string" || typeof idVal === "number") {
      return String(idVal);
    }
    const t = (card as ProductCard).title;
    return t ? `t:${t}` : Math.random().toString(36).slice(2);
  }, []);

  // Renderers
  const renderProductCard = useCallback(
    (it: ProductCard) => {
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
            <Text style={styles.cardTitle} numberOfLines={2}>
              {it.title || " "}
            </Text>
            {!!details && (
              <Text style={styles.cardMeta} numberOfLines={2}>
                {details}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [cardHeight, cardWidth]
  );

  const renderLoadMoreCard = useCallback(() => {
    return (
      <View
        style={[
          styles.card,
          { width: cardWidth, height: cardHeight },
          styles.cardEmpty,
        ]}
      >
        <Text style={styles.emptyText}>No more items</Text>
        <TouchableOpacity
          onPress={loadMoreItems}
          style={styles.loadMoreBtn}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.loadMoreText}>Load More</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }, [cardHeight, cardWidth, loadMoreItems, loadingMore]);

  const renderCard = useCallback(
    (it?: Card) => {
      if (!it) return null;
      if ("kind" in it && it.kind === "load-more") return renderLoadMoreCard();
      return renderProductCard(it as ProductCard);
    },
    [renderLoadMoreCard, renderProductCard]
  );

  return (
    <View style={styles.screen}>
      {/* Header row */}
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

      {/* Deck */}
      <View style={[styles.deckArea, { paddingBottom: DECK_PADDING }]}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
        ) : !cardsMemo.length ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No items available</Text>
            <TouchableOpacity onPress={() => loadData(selection)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Swiper
              ref={swiperRef}
              cards={cardsMemo}
              renderCard={renderCard}
              keyExtractor={keyExtractor as any} // handles unary/binary typings across versions
              backgroundColor="transparent"
              stackSize={3}
              stackSeparation={12}
              verticalSwipe={false}
              animateCardOpacity
              cardIndex={0}
              containerStyle={styles.swiperContainer}
              cardStyle={styles.cardBase}
              cardVerticalMargin={0}
              onSwipedRight={(idx) => handleSwipe(idx, 1.0)}
              onSwipedLeft={(idx) => handleSwipe(idx, 0.0)}
              onTapCard={(cardIndex) => {
                // optional: open details
                // console.log("Card tapped:", cardIndex);
              }}
            />

            {/* Optional bottom Load More helper */}
            {showLoadMoreCard && (
              <View style={styles.loadMoreContainer}>
                <TouchableOpacity
                  onPress={loadMoreItems}
                  style={styles.bottomLoadMoreBtn}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More Products</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
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

  deckArea: { flex: 1, paddingHorizontal: 12, paddingTop: 4 },

  swiperContainer: { flex: 1, alignItems: "center", justifyContent: "center" },

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
    padding: 24,
    gap: 16,
  },

  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
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
  emptyText: { color: "#b8bcc2", fontSize: 14, textAlign: "center", marginBottom: 8 },

  // Load More Button Styles
  loadMoreBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    minWidth: 120,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Bottom load more (optional helper)
  loadMoreContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bottomLoadMoreBtn: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    minWidth: 160,
    alignItems: "center",
  },

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
