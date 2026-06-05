// scripts/crawl/pipeline/merger.ts
import { NormalizedAttraction, NormalizedHotel } from "./normalizer";

function nameSimilar(a: string, b: string): boolean {
  const na = a.toLowerCase().replace(/[（(].*?[)）]/g, "").trim();
  const nb = b.toLowerCase().replace(/[（(].*?[)）]/g, "").trim();
  if (na === nb) return true;
  if (na.length > 3 && nb.length > 3 && (na.includes(nb) || nb.includes(na))) return true;
  return false;
}

export function mergeAttractions(items: NormalizedAttraction[]): NormalizedAttraction[] {
  const merged: NormalizedAttraction[] = [];

  for (const item of items) {
    const existing = merged.find(
      (m) =>
        nameSimilar(m.name, item.name) &&
        (m.lat === 0 || item.lat === 0 || Math.abs(m.lat - item.lat) < 0.005)
    );

    if (existing) {
      existing.images = [...new Set([...existing.images, ...item.images])];
      existing.source = [existing.source, item.source].filter(Boolean).join(",");
      existing.rating =
        existing.rating > 0 && item.rating > 0
          ? parseFloat(((existing.rating + item.rating) / 2).toFixed(1))
          : existing.rating || item.rating;
      existing.ratingCount = (existing.ratingCount || 0) + (item.ratingCount || 0);
      if (item.description.length > existing.description.length) {
        existing.description = item.description;
      }
      if (item.ticketInfo && !existing.ticketInfo) {
        existing.ticketInfo = item.ticketInfo;
      }
    } else {
      merged.push({ ...item });
    }
  }

  return merged;
}

export function mergeHotels(items: NormalizedHotel[]): NormalizedHotel[] {
  const merged: NormalizedHotel[] = [];

  for (const item of items) {
    const existing = merged.find(
      (m) =>
        nameSimilar(m.name, item.name) &&
        (m.lat === 0 || item.lat === 0 || Math.abs(m.lat - item.lat) < 0.005)
    );

    if (existing) {
      existing.images = [...new Set([...existing.images, ...item.images])];
      existing.source = [existing.source, item.source].filter(Boolean).join(",");
      existing.rating =
        existing.rating > 0 && item.rating > 0
          ? parseFloat(((existing.rating + item.rating) / 2).toFixed(1))
          : existing.rating || item.rating;
      if (item.price && (!existing.price || item.price < existing.price)) {
        existing.price = item.price;
      }
      existing.amenities = [...new Set([...existing.amenities, ...item.amenities])];
    } else {
      merged.push({ ...item });
    }
  }

  return merged;
}
