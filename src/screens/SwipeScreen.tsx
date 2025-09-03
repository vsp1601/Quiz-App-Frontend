import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import colors from '../theme/colors';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { getRandomProducts } from '../api/clients';
import { useFilters } from '../store/filters';
import { useBulkRatings } from '../hooks/useBulkRatings';

export default function SwipeScreen() {
  const [items, setItems] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const swiperRef = useRef<Swiper<Product>>(null);
  const { gender, category } = useFilters();
  const { enqueue, flush, pendingCount } = useBulkRatings();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRandomProducts({ count: 20, gender, category });
      setItems(data as Product[]);
      setIndex(0);
    } catch (e: any) {
      Alert.alert('Failed to load', e?.message || 'Could not fetch products');
    } finally {
      setLoading(false);
    }
  }, [gender, category]);

  useEffect(() => {
    load();
  }, [load]);

  const onSwiped = (cardIndex: number, liked: boolean) => {
    const p = items[cardIndex];
    if (p) enqueue({ product_id: p.id, rating: liked ? 1 : 0 });
  };

  const onEnd = async () => {
    await flush();
    load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rate outfits</Text>
        <Text style={styles.subtitle}>{pendingCount > 0 ? `Saving ${pendingCount}…` : ' '}</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <>
          <Swiper
            ref={swiperRef}
            backgroundColor={colors.bg}
            cards={items}
            cardIndex={index}
            renderCard={(card) => card ? <ProductCard product={card} /> : <View style={{height:520}} />}
            onSwipedLeft={(i) => onSwiped(i, false)}
            onSwipedRight={(i) => onSwiped(i, true)}
            onSwipedAll={onEnd}
            stackSize={3}
            stackSeparation={14}
            disableTopSwipe
            disableBottomSwipe
            verticalSwipe={false}
            cardStyle={styles.card}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => swiperRef.current?.swipeLeft()}>
              <Text style={styles.actionText}>Dislike</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={() => swiperRef.current?.swipeRight()}>
              <Text style={[styles.actionText, { color: '#00331F' }]}>Like</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={load} style={styles.reload}><Text style={styles.reloadText}>Reload</Text></TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textDim, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { marginHorizontal: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 16 },
  actionBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999 },
  actionText: { color: '#fff', fontWeight: '800' },
  reload: { alignSelf: 'center', padding: 10, borderRadius: 8, backgroundColor: '#1f2937' },
  reloadText: { color: colors.textDim }
});
