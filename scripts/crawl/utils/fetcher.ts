// scripts/crawl/utils/fetcher.ts
import axios from "axios";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

const DELAY_MIN = 2000;
const DELAY_MAX = 5000;
const MAX_RETRIES = 3;

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
}

let requestCount = 0;
const MAX_REQUESTS_PER_SOURCE = 200;

export interface FetchResult {
  html: string;
  finalUrl: string;
}

export async function fetchPage(
  url: string,
  options?: { headers?: Record<string, string>; sourceName?: string }
): Promise<FetchResult> {
  if (requestCount >= MAX_REQUESTS_PER_SOURCE) {
    throw new Error(`Request limit (${MAX_REQUESTS_PER_SOURCE}) reached for ${options?.sourceName || "unknown"}`);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await sleep(randomDelay());
      requestCount++;
      const res = await axios.get(url, {
        headers: {
          "User-Agent": randomUA(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          ...options?.headers,
        },
        timeout: 15000,
        maxRedirects: 5,
      });
      return { html: res.data, finalUrl: res.request?.res?.responseUrl || url };
    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        const backoff = Math.pow(2, attempt + 1) * 1000;
        await sleep(backoff);
      }
    }
  }

  throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries: ${lastError?.message}`);
}

export function resetRequestCount() {
  requestCount = 0;
}
