import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { Product } from '../types';
import { resolveImageUrl } from '../api/clients'; // ✅ fix import (singular)

export default function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);

  // Prefer explicit image_url, otherwise first from images[]
  const raw = product?.image_url || product?.images?.[0];
  // Normalize localhost/relative URLs using API base
  const uri = useMemo(() => resolveImageUrl(raw), [raw]);

  return (
    <View style={styles.card}>
      {uri && !imgError ? (
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={styles.image}
          onError={() => setImgError(true)} // fallback if fetch fails
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
      />

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {product?.title || 'Outfit'}
        </Text>
        <Text style={styles.badges} numberOfLines={1}>
          {product?.gender ? `• ${product.gender} ` : ''}
          {product?.category ? `• ${product.category} ` : ''}
          {product?.color ? `• ${product.color}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    height: 520,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.cardAlt,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    height: 160,
    left: 0,
    right: 0,
  },
  meta: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  badges: {
    color: colors.textDim,
    marginTop: 6,
  },
});
