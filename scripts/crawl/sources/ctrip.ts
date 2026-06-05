// scripts/crawl/sources/ctrip.ts
import { BaseCrawler, RawAttraction, RawHotel } from "./base";

export class CtripCrawler extends BaseCrawler {
  readonly sourceName = "ctrip";

  async searchAttractions(city: string): Promise<RawAttraction[]> {
    const results: RawAttraction[] = [];
    const encodedCity = encodeURIComponent(city);

    try {
      const $ = await this.get(
        `https://you.ctrip.com/searchsite/attraction?query=${encodedCity}`
      );

      $(".list_wide_mod2 .list_mod2").each((_, el) => {
        const $el = $(el);
        const name = this.cleanText($el.find(".cn_tit").text());
        const ratingText = this.cleanText($el.find(".score").text());
        const desc = this.cleanText($el.find(".desbox").text());
        const imgSrc = $el.find("img").attr("src") || "";

        if (!name) return;

        results.push({
          name,
          lat: 0,
          lng: 0,
          category: "attraction",
          rating: this.extractNumber(ratingText),
          ratingCount: 0,
          ticketInfo: "",
          description: desc,
          images: imgSrc ? [imgSrc] : [],
          openHours: "",
          transportTips: "",
          source: this.sourceName,
        });
      });
    } catch (err) {
      console.warn(`[ctrip] attraction search failed for ${city}:`, (err as Error).message);
    }

    return results.slice(0, 20);
  }

  async searchHotels(city: string): Promise<RawHotel[]> {
    const results: RawHotel[] = [];
    const encodedCity = encodeURIComponent(city);

    try {
      const $ = await this.get(
        `https://hotels.ctrip.com/hotel/${encodedCity}`
      );

      $(".hotel_item").each((_, el) => {
        const $el = $(el);
        const name = this.cleanText($el.find(".hotel_name").text());
        const priceText = this.cleanText($el.find(".hotel_price").text());
        const ratingText = this.cleanText($el.find(".score").text());
        const addr = this.cleanText($el.find(".hotel_address").text());
        const imgSrc = $el.find("img").attr("src") || "";
        const starClass = $el.find(".star").attr("class") || "";

        const starMatch = starClass.match(/star-(\d)/);
        const starLevel = starMatch ? parseInt(starMatch[1]) : 3;

        if (!name) return;

        results.push({
          name,
          lat: 0,
          lng: 0,
          price: this.extractNumber(priceText) || 0,
          rating: this.extractNumber(ratingText),
          starLevel,
          images: imgSrc ? [imgSrc] : [],
          amenities: [],
          address: addr,
          phone: "",
          source: this.sourceName,
        });
      });
    } catch (err) {
      console.warn(`[ctrip] hotel search failed for ${city}:`, (err as Error).message);
    }

    return results.slice(0, 20);
  }
}
