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
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Choose Default Semester' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Default Semester 3' }).click();
  await page.waitForTimeout(3000);
  console.log('REQS:', JSON.stringify(reqs, null, 2));
  const r = await page.evaluate(() => ({
    text: document.body.innerText,
    sems: [...document.querySelectorAll('h2')].map(h=>h.innerText),
    rows: [...document.querySelectorAll('tbody tr')].map(tr => ({ inputs: [...tr.querySelectorAll('input,select')].map(e=>e.value), gradeCls: tr.querySelector('select')?.className })),
    tables: document.querySelectorAll('table').length
  }));
  console.log('TEXT:\n' + r.text.slice(0, 6000));
  console.log('ROWS:', JSON.stringify(r.rows.slice(0, 12), null, 2));
  const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/default-semester-3.png', Buffer.from(s.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
