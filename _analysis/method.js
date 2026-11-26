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
  await page.locator('#gpa-calc-method').selectOption('credit-weighted');
  await page.waitForTimeout(2000);
  console.log('REQS:', JSON.stringify(reqs, null, 2));
  const r = await page.evaluate(() => ({
    text: document.body.innerText.slice(0, 1200),
    method: document.querySelector('#gpa-calc-method')?.value,
    badge: document.querySelector('.bg-blue-50')?.innerText,
    hint: [...document.querySelectorAll('span')].find(s=>s.innerText?.startsWith('CGPA:'))?.innerText
  }));
  console.log(JSON.stringify(r, null, 2));
  const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/method-credit-weighted.png', Buffer.from(s.data, 'base64'));
  // switch back
  await page.locator('#gpa-calc-method').selectOption('weighted-sgpa');
  await page.waitForTimeout(1500);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
