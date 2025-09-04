// src/utils/filters.ts
export function normalizeGender(g?: string) {
  if (!g) return undefined;
  const s = g.trim().toLowerCase();
  if (['men', 'male', 'm'].includes(s)) return 'Men';
  if (['women', 'female', 'w', 'f'].includes(s)) return 'Women';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function normalizeCategory(c?: string) {
  if (!c) return undefined;
  const s = c.trim().toLowerCase();
  if (['garments', 'garment', 'apparel'].includes(s)) return 'Apparel';
  if (['jewelry', 'jewelery', 'jewellery', 'accessories'].includes(s)) return 'Accessories';
  if (['footwear'].includes(s)) return 'Footwear';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
