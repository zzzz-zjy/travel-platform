// scripts/crawl/sources/base.ts
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import { fetchPage } from "../utils/fetcher";

export interface RawAttraction {
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

export interface RawHotel {
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

export abstract class BaseCrawler {
  abstract readonly sourceName: string;

  abstract searchAttractions(city: string): Promise<RawAttraction[]>;
  abstract searchHotels(city: string): Promise<RawHotel[]>;

  protected async get(url: string): Promise<CheerioAPI> {
    const { html } = await fetchPage(url, { sourceName: this.sourceName });
    return cheerio.load(html);
  }

  protected parseCoord(text: string): { lat: number; lng: number } | null {
    const match = text.match(/(\d+\.\d+)\s*[,，\s]\s*(\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
  }

  protected extractNumber(text: string): number {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  protected cleanText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }
}
