// scripts/crawl/sources/mafengwo.ts
import { BaseCrawler, RawAttraction, RawHotel } from "./base";

export class MafengwoCrawler extends BaseCrawler {
  readonly sourceName = "mafengwo";

  async searchAttractions(city: string): Promise<RawAttraction[]> {
    const results: RawAttraction[] = [];
    const encodedCity = encodeURIComponent(city);

    try {
      const $ = await this.get(
        `https://www.mafengwo.cn/search/s.php?q=${encodedCity}&t=poi`
      );

      $(".search-list .list-item").each((_, el) => {
        const $el = $(el);
        const name = this.cleanText($el.find("h4").text());
        const desc = this.cleanText($el.find(".poi-desc").text());
        const ratingText = this.cleanText($el.find(".star-score").text());
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
      console.warn(`[mafengwo] attraction search failed for ${city}:`, (err as Error).message);
    }

    return results.slice(0, 20);
  }

  async searchHotels(_city: string): Promise<RawHotel[]> {
    // Mafengwo's hotel data is limited; hotel data primarily comes from Ctrip + Qunar.
    return [];
  }
}
