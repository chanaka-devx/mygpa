const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  // close default semester modal
  await page.locator('.fixed.inset-0.z-50 button').first().click();
  await page.waitForTimeout(500);
  const reqs = [];
  page.on('request', r => { if (r.url().includes('/api/')) reqs.push({ method: r.method(), url: r.url(), postData: r.postData() }); });
  page.on('response', async r => { if (r.url().includes('/api/')) { let b=''; try { b = await r.text(); } catch {} reqs.push({ resp: r.status(), url: r.url(), body: b.slice(0,3000) }); } });
  await page.locator('tbody tr button.bg-green-600').first().click();
  await page.waitForTimeout(2500);
  console.log('REQS:', JSON.stringify(reqs, null, 2));
  const r = await page.evaluate(() => ({ text: document.body.innerText.slice(0,4000), table: document.querySelector('table')?.outerHTML }));
  console.log('TEXT:\n' + r.text);
  fs.writeFileSync('captures/after-save-module.json', JSON.stringify(r, null, 2));
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/after-save-module.png', Buffer.from(shot.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
