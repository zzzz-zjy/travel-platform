const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1440, height: 1920, deviceScaleFactor: 1 });

  // Load cover.html directly
  const coverPath = path.resolve(__dirname, "../public/cover.html");
  await page.goto("file://" + coverPath, { waitUntil: "networkidle0" });

  // Wait for all animations to complete (max 2s for fadeInUp sequences)
  await new Promise(r => setTimeout(r, 2500));

  // Remove the download buttons from screenshot
  await page.evaluate(() => {
    const btn = document.querySelector('div[style*="position:fixed"]');
    if (btn) btn.remove();
  });

  // Screenshot
  const outDir = path.resolve(__dirname, "../../../Desktop");
  await page.screenshot({
    path: path.join(outDir, "红途_封面.png"),
    type: "png",
    fullPage: false,
  });

  console.log("Done: " + path.join(outDir, "红途_封面.png"));
  await browser.close();
})();
