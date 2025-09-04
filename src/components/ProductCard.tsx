// src/components/ProductCard.tsx
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { Product } from '../types';

function pickTitle(p: Product) {
  return (
    p.title ||
    p.name ||
    p.product_name ||
    p.productDisplayName ||
    `#${p.id}`
  );
}

function pickImage(p: Product) {
  return p.image_url || (Array.isArray(p.images) ? p.images[0] : undefined);
}

export default function ProductCard({ product }: { product: Product }) {
  const title = useMemo(() => pickTitle(product), [product]);
  const uri = useMemo(() => pickImage(product), [product]);

  return (
    <View style={styles.frame}>
      <View style={styles.card}>
        {uri ? (
          <Image source={{ uri }} resizeMode="cover" style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.overlay} />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.badges} numberOfLines={1}>
            {product.gender ? `• ${product.gender}` : ''} {product.category ? `• ${product.category}` : ''}{' '}
            {(product.color || product.baseColour) ? `• ${product.color || product.baseColour}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const CARD_W = 340;
const CARD_H = 520;

const styles = StyleSheet.create({
  frame: {
    width: CARD_W,
    height: CARD_H,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    flex: 1,

    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: colors.cardAlt },
  overlay: { position: 'absolute', bottom: 0, height: 160, left: 0, right: 0 },
  meta: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  badges: { color: colors.textDim, marginTop: 6, fontWeight: '600' },
});
