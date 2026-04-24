import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/archi/.cache/puppeteer/chrome/win64-147.0.7727.56/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const targetUrl = process.argv[2] || 'http://localhost:3000';
await page.goto(targetUrl, { waitUntil: 'networkidle2' });

// Scroll slowly to trigger IntersectionObserver on every element
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
let scrollY = 0;
while (scrollY < totalHeight) {
  scrollY += 300;
  await page.evaluate(y => window.scrollTo(0, y), scrollY);
  await new Promise(r => setTimeout(r, 250));
}
// Wait for all transitions to finish, then scroll back to top
await new Promise(r => setTimeout(r, 1500));
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 600));

const existing = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
let maxN = 0;
for (const f of existing) { const m = f.match(/^screenshot-(\d+)/); if (m) maxN = Math.max(maxN, parseInt(m[1])); }
const outPath = path.join(screenshotDir, `screenshot-${maxN+1}-scrolled.png`);

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`Screenshot saved: ${outPath}`);
