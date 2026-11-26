const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  const reqs = [];
  page.on('request', r => { if (r.url().includes('/api/') && r.method() !== 'GET') reqs.push({ method: r.method(), url: r.url(), postData: r.postData() }); });
  page.on('response', async r => { if (r.url().includes('/api/') && r.request().method() !== 'GET') { let b=''; try { b = await r.text(); } catch {} reqs.push({ resp: r.status(), url: r.url(), body: b.slice(0,2500) }); } });

  const modal = page.locator('.fixed.inset-0.z-50');
  await modal.locator('select#moduleName').selectOption({ label: 'Database Systems' });
  await modal.locator('button', { hasText: 'Add' }).last().click();
  await page.waitForTimeout(1200);
  const rows = page.locator('tbody tr');
  const n = await rows.count();
  console.log('rows:', n);
  const last = rows.nth(n-1);
  console.log('last row text:', await last.innerText());
  console.log('inputs:', await last.locator('input,select').evaluateAll(els => els.map(e => ({ id: e.id, val: e.value }))));
  const shot0 = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/after-add-from-list.png', Buffer.from(shot0.data, 'base64'));
  console.log('REQS after add:', JSON.stringify(reqs, null, 2));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
