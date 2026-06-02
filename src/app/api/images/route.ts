import { NextRequest, NextResponse } from "next/server";

const unsplashCache = new Map<string, string>();

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name") || "景点";
  const width = parseInt(request.nextUrl.searchParams.get("w") || "800");
  const height = parseInt(request.nextUrl.searchParams.get("h") || "400");

  // Priority 1: Unsplash API (if key configured)
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey) {
    const cacheKey = `unsplash:${name}|${width}x${height}`;
    const cached = unsplashCache.get(cacheKey);
    if (cached) return NextResponse.redirect(cached);

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(`${name} china landmark`)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0) {
          const url = `${data.results[0].urls.raw}&w=${width}&h=${height}&fit=crop&auto=format`;
          unsplashCache.set(cacheKey, url);
          return NextResponse.redirect(url);
        }
      }
    } catch {}
  }

  // Priority 2: Lorem Picsum with seed — unique photo per attraction, free, no API key
  return NextResponse.redirect(`https://picsum.photos/seed/${encodeURIComponent(name)}/${width}/${height}`);
}
