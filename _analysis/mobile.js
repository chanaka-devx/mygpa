const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://gpa.sarislabs.com/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await client.send('Page.bringToFront');
  let s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/mobile-dashboard.png', Buffer.from(s.data, 'base64'));
  // open menu
  await page.locator('header button.md\\:hidden').click();
  await page.waitForTimeout(500);
  s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/mobile-menu.png', Buffer.from(s.data, 'base64'));
  const r = await page.evaluate(() => ({ text: document.body.innerText.slice(0, 3000), header: document.querySelector('header')?.outerHTML, sidebar: document.querySelector('aside, .bg-primary.fixed')?.className }));
  fs.writeFileSync('captures/mobile-info.json', JSON.stringify(r, null, 2));
  console.log(r.text);
  // analytics mobile
  await page.goto('https://gpa.sarislabs.com/dashboard/analytics', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await client.send('Page.bringToFront');
  s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/mobile-analytics.png', Buffer.from(s.data, 'base64'));
  await page.goto('https://gpa.sarislabs.com/dashboard/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/mobile-settings.png', Buffer.from(s.data, 'base64'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
