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
  page.on('response', async r => { if (r.url().includes('/api/') && r.request().method() !== 'GET') { let b=''; try { b = await r.text(); } catch {} reqs.push({ resp: r.status(), url: r.url(), body: b.slice(0,3000) }); } });

  const rows = page.locator('tbody tr');
  const last = rows.last();
  await last.locator('select#grade').selectOption('B');
  await page.waitForTimeout(500);
  const btns = await last.locator('button').evaluateAll(bs => bs.map(b => b.className));
  console.log('row buttons after grade:', btns);
  const green = last.locator('button.bg-green-600');
  if (await green.count()) { await green.click(); } else { console.log('NO GREEN'); }
  await page.waitForTimeout(2500);
  console.log('REQS:', JSON.stringify(reqs, null, 2));
  const r = await page.evaluate(() => ({ text: document.body.innerText.slice(0,2500), table: document.querySelector('table')?.outerHTML }));
  console.log('TEXT:\n' + r.text);
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/after-save-module2.png', Buffer.from(shot.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
