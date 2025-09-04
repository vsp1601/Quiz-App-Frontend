// src/types.ts

/* =========================
   Core Product shape (raw)
   ========================= */

export type Product = {
  id: number;

  // Common display fields (server may use different keys)
  title?: string;
  name?: string;                 // products endpoints often return "name"
  product_name?: string;         // recommendations may use "product_name"
  productDisplayName?: string;   // raw column name

  // Categorization
  gender?: string;               // "Men" | "Women"
  category?: string;             // e.g. "Apparel", "Accessories", "Footwear"
  subcategory?: string;
  article_type?: string;
  color?: string;
  baseColour?: string;
  season?: string;
  year?: number | string;
  usage?: string;

  // Media
  image_url?: string;            // preferred image
  images?: string[];             // optional list (fallback to [0])

  // Raw / extra
  color_features?: any;
  style_features?: any;
  image_path?: string;
};


/* =========================
   Filters (UI)
   ========================= */

export type FilterOption = {
  id: string;
  label: string;
};

export type FilterGroup = {
  key: string;             // e.g., "gender", "masterCategory"
  label: string;           // e.g., "Gender"
  options: FilterOption[];
};

export type FiltersResponse = {
  groups: FilterGroup[];
};

/** Unified selection object used by both screens */
export type Selection = Record<string, string | null>;


/* =========================
   Cards (normalized for UI)
   ========================= */

export type ProductCard = {
  id: string | number;
  title: string;
  imageUrl?: string;
  brand?: string;
  price?: number;
};

export type Recommendation = ProductCard & {
  score?: number; // optional ranking/relevance if backend sends one
};


/* =========================
   API response envelopes
   ========================= */

/**
 * Some endpoints return { items: [...] }, others return { recommendations: [...] }.
 * Make both optional so the same type works everywhere.
 */
export type RecommendationResponse = {
  recommendations?: Recommendation[]; // common for /recommendations
  items?: Recommendation[];           // fallback shape
};

export type SwipeCardsResponse = {
  items: ProductCard[];
};

/** Generic paginated helper (if you need it later) */
export type Paginated<T> = {
  total?: number;
  count?: number;
  next?: string | null;
  prev?: string | null;
  items: T[];
};


/* =========================
   Small helpers (optional)
   ========================= */

/**
 * Safely unwrap an array of recommendations from a flexible response.
 * Usage: const recs = unwrapRecommendations(data);
 */
export function unwrapRecommendations(res?: RecommendationResponse): Recommendation[] {
  if (!res) return [];
  if (Array.isArray(res.recommendations)) return res.recommendations;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

