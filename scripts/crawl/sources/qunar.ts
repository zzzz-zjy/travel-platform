// scripts/crawl/sources/qunar.ts
import { BaseCrawler, RawAttraction, RawHotel } from "./base";

export class QunarCrawler extends BaseCrawler {
  readonly sourceName = "qunar";

  async searchAttractions(city: string): Promise<RawAttraction[]> {
    const results: RawAttraction[] = [];
    const encodedCity = encodeURIComponent(city);

    try {
      const $ = await this.get(
        `https://travel.qunar.com/search/place?query=${encodedCity}`
      );

      $(".c-search-list .item").each((_, el) => {
        const $el = $(el);
        const name = this.cleanText($el.find(".tit").text());
        const desc = this.cleanText($el.find(".intro").text());
        const ratingText = this.cleanText($el.find(".score").text());
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
      console.warn(`[qunar] attraction search failed for ${city}:`, (err as Error).message);
    }

    return results.slice(0, 20);
  }

  async searchHotels(city: string): Promise<RawHotel[]> {
    const results: RawHotel[] = [];
    const encodedCity = encodeURIComponent(city);

    try {
      const $ = await this.get(
        `https://hotel.qunar.com/city/${encodedCity}`
      );

      $(".item_list .item").each((_, el) => {
        const $el = $(el);
        const name = this.cleanText($el.find(".hotelName").text());
        const priceText = this.cleanText($el.find(".price").text());
        const ratingText = this.cleanText($el.find(".score").text());
        const addr = this.cleanText($el.find(".address").text());
        const imgSrc = $el.find("img").attr("src") || "";
        const starText = this.cleanText($el.find(".starLevel").text());

        const starLevel = starText.includes("五星") ? 5 : starText.includes("四星") ? 4 : 3;

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
      console.warn(`[qunar] hotel search failed for ${city}:`, (err as Error).message);
    }

    return results.slice(0, 20);
  }
}
