const { chromium } = require('playwright-core');
const fs = require('fs');
const outDir = 'C:/Users/HP/Documents/GitHub/GPA/_analysis/captures';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  for (const p of ['analytics','settings','help','feedback']) {
    await page.goto('https://gpa.sarislabs.com/dashboard/'+p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = Math.min(Math.max(h, 900), 3000);
    await page.setViewportSize({ width: 1440, height: vh });
    await page.waitForTimeout(800);
    await client.send('Page.bringToFront');
    const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(`${outDir}/${p}-full.png`, Buffer.from(s.data, 'base64'));
    console.log(p, 'height', h, '->', vh);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
