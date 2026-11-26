const { chromium } = require('playwright-core');
const fs = require('fs');
const outDir = 'C:/Users/HP/Documents/GitHub/GPA/_analysis/captures';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  for (const p of ['', 'analytics','settings']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('https://gpa.sarislabs.com/dashboard'+(p?'/'+p:''), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = Math.min(Math.max(h, 900), 2600);
    await page.setViewportSize({ width: 1440, height: vh });
    await page.waitForTimeout(700);
    await client.send('Page.bringToFront');
    const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(`${outDir}/data-${p||'dashboard'}-full.png`, Buffer.from(s.data, 'base64'));
    console.log(p||'dashboard', 'height', h, '->', vh);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
