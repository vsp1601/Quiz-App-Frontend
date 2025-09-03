import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import colors from '../theme/colors';
import { getRecommendations } from '../api/clients';
import { Recommendation } from '../types';
import { useFilters } from '../store/filters';

export default function RecommendationsScreen({ navigation }: any) {
  const { gender, category } = useFilters();
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecommendations({ gender, category, count: 20 });
      setItems(data as Recommendation[]);
    } catch (e: any) {
      Alert.alert('Failed to load', e?.message || 'Could not fetch recos');
    } finally {
      setLoading(false);
    }
  }, [gender, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { id: item.id })}>
              <Image source={{ uri: item.image_url || item.images?.[0] }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.title || 'Outfit'}</Text>
                {item.explanation ? <Text style={styles.explain} numberOfLines={2}>{item.explanation}</Text> : null}
                <Text style={styles.meta} numberOfLines={1}>
                  {(item.gender ? `${item.gender} • ` : '') + (item.category || '') + (item.color ? ` • ${item.color}` : '')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          onRefresh={load}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', backgroundColor: colors.card, padding: 10, borderRadius: 12, gap: 12 },
  thumb: { width: 84, height: 84, borderRadius: 10, backgroundColor: colors.cardAlt },
  title: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  explain: { color: colors.accent, fontSize: 12, marginBottom: 6 },
  meta: { color: colors.textDim, fontSize: 12 }
});
