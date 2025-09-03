import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import colors from '../theme/colors';
import { getProduct } from '../api/clients';

export default function ProductDetailScreen({ route }: any) {
  const { id } = route.params;
  const [item, setItem] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setItem(data);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Could not load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!item) return <View style={styles.center}><Text style={{ color: colors.textDim }}>Not found</Text></View>;

  const img = item.image_url || item.images?.[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Image source={{ uri: img }} style={styles.hero} />
      <Text style={styles.title}>{item.title || 'Outfit'}</Text>
      <Text style={styles.meta}>{[item.gender, item.category, item.color].filter(Boolean).join(' • ')}</Text>
      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  hero: { width: '100%', height: 420, borderRadius: 16, backgroundColor: colors.card },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 12 },
  meta: { color: colors.textDim, marginTop: 4 },
  desc: { color: colors.text, marginTop: 12, lineHeight: 20 }
});
