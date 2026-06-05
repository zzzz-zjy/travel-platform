// scripts/crawl/pipeline/normalizer.ts
import { RawAttraction, RawHotel } from "../sources/base";

export interface NormalizedAttraction {
  name: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  ratingCount: number;
  ticketInfo: string;
  description: string;
  images: string[];
  openHours: string;
  transportTips: string;
  source: string;
}

export interface NormalizedHotel {
  name: string;
  lat: number;
  lng: number;
  price: number;
  rating: number;
  starLevel: number;
  images: string[];
  amenities: string[];
  address: string;
  phone: string;
  source: string;
}

export function normalizeAttraction(raw: RawAttraction): NormalizedAttraction {
  return {
    name: raw.name.trim(),
    lat: raw.lat || 0,
    lng: raw.lng || 0,
    category: raw.category || "attraction",
    rating: Math.min(raw.rating || 4.0, 5.0),
    ratingCount: raw.ratingCount || 0,
    ticketInfo: raw.ticketInfo || "",
    description: raw.description || "",
    images: raw.images.filter((u) => u.startsWith("http")),
    openHours: raw.openHours || "",
    transportTips: raw.transportTips || "",
    source: raw.source,
  };
}

export function normalizeHotel(raw: RawHotel): NormalizedHotel {
  return {
    name: raw.name.trim(),
    lat: raw.lat || 0,
    lng: raw.lng || 0,
    price: raw.price || 0,
    rating: Math.min(raw.rating || 4.0, 5.0),
    starLevel: raw.starLevel || 3,
    images: raw.images.filter((u) => u.startsWith("http")),
    amenities: raw.amenities || [],
    address: raw.address || "",
    phone: raw.phone || "",
    source: raw.source,
  };
}
