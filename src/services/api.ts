// src/services/api.ts
// Thin helpers that adapt the shared selection object to your existing client.ts APIs

import {
  getRandomProducts,
  getProducts,
  getRecommendations,
} from "../api/clients"; // <-- use your real client.ts
import { FiltersResponse, ProductCard, Recommendation, Selection } from "../types";
import { getStaticFilters } from "../data/staticFilters";

/** Use static filters (from your provided rows) */
export async function fetchFilters(): Promise<FiltersResponse> {
  return getStaticFilters();
}

/** Build params that your backend actually supports */
function toRandomParams(selection: Selection): { count: number; gender?: string; category?: string } {
  // Backend random only supports gender + category
  const gender = selection.gender ?? undefined;
  const category = selection.masterCategory ?? undefined;
  return { count: 20, gender, category };
}

function toProductsParams(selection: Selection): {
  skip?: number; limit?: number; gender?: string; category?: string; color?: string;
} {
  // Products list supports gender + category + color
  const gender = selection.gender ?? undefined;
  const category = selection.masterCategory ?? undefined;
  const color = selection.color ?? undefined;
  return { skip: 0, limit: 50, gender, category, color };
}

function toRecommendationsParams(selection: Selection): { count: number; gender?: string; category?: string } {
  // Recommendations endpoint supports gender + category
  const gender = selection.gender ?? undefined;
  const category = selection.masterCategory ?? undefined;
  return { count: 20, gender, category };
}

/** Swipe data = random products (full-screen card) */
export async function fetchSwipeCards(selection: Selection): Promise<{ items: ProductCard[] }> {
  const params = toRandomParams(selection);
  const raw = await getRandomProducts(params);

  const items: ProductCard[] = (raw ?? []).map((p: any) => ({
    id: p.id,
    title: p.name ?? p.productDisplayName ?? `#${p.id}`,
    imageUrl: p.image_url,
    brand: undefined,
    price: undefined,
  }));

  return { items };
}

/** Grid/List products (if you need it) */
export async function fetchProducts(selection: Selection): Promise<{ items: ProductCard[] }> {
  const params = toProductsParams(selection);
  const raw = await getProducts(params);

  const items: ProductCard[] = (raw ?? []).map((p: any) => ({
    id: p.id,
    title: p.name ?? p.productDisplayName ?? `#${p.id}`,
    imageUrl: p.image_url,
  }));

  return { items };
}

/** Personalized / popular fallback recommendations (requires auth) */
export async function fetchRecommendations(selection: Selection): Promise<{ items: Recommendation[] }> {
  const params = toRecommendationsParams(selection);
  // client.getRecommendations already unwraps { recommendations: [...] }
  const recs = await getRecommendations(params);

  const items: Recommendation[] = (recs ?? []).map((r: any) => ({
    id: r.product_id ?? r.id ?? r.item_id ?? Math.random().toString(),
    title: r.product_name ?? r.name ?? `#${r.product_id ?? r.id}`,
    imageUrl: r.image_url,
    score: typeof r.score === "number" ? r.score : undefined,
  }));

  return { items };
}
