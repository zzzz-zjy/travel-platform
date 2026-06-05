// scripts/crawl/sources/baidu.ts
import { BaseCrawler, RawAttraction, RawHotel } from "./base";

export class BaiduCrawler extends BaseCrawler {
  readonly sourceName = "baidu";

  async searchAttractions(city: string): Promise<RawAttraction[]> {
    const results: RawAttraction[] = [];
    const query = encodeURIComponent(`${city} 热门景点 推荐`);

    try {
      const $ = await this.get(`https://www.baidu.com/s?wd=${query}`);

      // Parse search result cards
      $(".result.c-container").each((_, el) => {
        const $el = $(el);
        const title = this.cleanText($el.find("h3").text());
        const abstract = this.cleanText($el.find(".c-abstract, .c-span-last").text());
        const imgSrc = $el.find("img").attr("src") || "";

        // Filter out non-attraction results
        if (!title || title.length > 50) return;
        if (/广告|推广|酒店|民宿|客栈|门票|旅行团|攻略|游记/i.test(title)) return;

        // Try to extract rating from abstract
        const ratingMatch = abstract.match(/(\d\.?\d?)分/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;

        results.push({
          name: title,
          lat: 0,
          lng: 0,
          category: "attraction",
          rating: Math.min(rating, 5.0),
          ratingCount: 0,
          ticketInfo: "",
          description: abstract || title,
          images: imgSrc && imgSrc.startsWith("http") ? [imgSrc] : [],
          openHours: "",
          transportTips: "",
          source: this.sourceName,
        });
      });
    } catch (err) {
      console.warn(`[baidu] attraction search failed for ${city}:`, (err as Error).message);
    }

    // Also try a second query for more results
    try {
      const query2 = encodeURIComponent(`${city} 必去景点`);
      const $2 = await this.get(`https://www.baidu.com/s?wd=${query2}`);

      $2(".result.c-container").each((_, el) => {
        const $el = $2(el);
        const title = this.cleanText($el.find("h3").text());
        const abstract = this.cleanText($el.find(".c-abstract, .c-span-last").text());
        const imgSrc = $el.find("img").attr("src") || "";

        if (!title || title.length > 50) return;
        if (/广告|推广|酒店|民宿|客栈|门票|旅行团|攻略|游记/i.test(title)) return;
        // Skip duplicates from first query
        if (results.some((r) => r.name === title)) return;

        const ratingMatch = abstract.match(/(\d\.?\d?)分/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;

        results.push({
          name: title,
          lat: 0,
          lng: 0,
          category: "attraction",
          rating: Math.min(rating, 5.0),
          ratingCount: 0,
          ticketInfo: "",
          description: abstract || title,
          images: imgSrc && imgSrc.startsWith("http") ? [imgSrc] : [],
          openHours: "",
          transportTips: "",
          source: this.sourceName,
        });
      });
    } catch (err) {
      console.warn(`[baidu] second attraction search failed for ${city}:`, (err as Error).message);
    }

    return results.slice(0, 30);
  }

  async searchHotels(city: string): Promise<RawHotel[]> {
    const results: RawHotel[] = [];
    const query = encodeURIComponent(`${city} 酒店 推荐`);

    try {
      const $ = await this.get(`https://www.baidu.com/s?wd=${query}`);

      $(".result.c-container").each((_, el) => {
        const $el = $(el);
        const title = this.cleanText($el.find("h3").text());
        const abstract = this.cleanText($el.find(".c-abstract, .c-span-last").text());
        const imgSrc = $el.find("img").attr("src") || "";

        if (!title) return;
        if (/广告|推广|攻略|游记/i.test(title)) return;

        // Try to extract hotel info from abstract
        const priceMatch = abstract.match(/[¥￥](\d+)/);
        const starMatch = title.match(/([三四五])星/);
        const starLevel = starMatch ? (starMatch[1] === "五" ? 5 : starMatch[1] === "四" ? 4 : 3) : 3;

        results.push({
          name: title,
          lat: 0,
          lng: 0,
          price: priceMatch ? parseInt(priceMatch[1]) : 0,
          rating: 4.0,
          starLevel,
          images: imgSrc && imgSrc.startsWith("http") ? [imgSrc] : [],
          amenities: [],
          address: "",
          phone: "",
          source: this.sourceName,
        });
      });
    } catch (err) {
      console.warn(`[baidu] hotel search failed for ${city}:`, (err as Error).message);
    }

    return results.slice(0, 20);
  }
}
