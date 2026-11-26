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
  page.on('response', async r => { if (r.url().includes('/api/') && r.request().method() !== 'GET') { let b=''; try { b = await r.text(); } catch {} reqs.push({ resp: r.status(), url: r.url(), body: b.slice(0,1500) }); } });

  const nameInput = page.locator('tbody tr input#moduleName').first();
  await nameInput.fill('Data Structures and Algorithms');
  await page.locator('tbody tr input#credit').first().fill('3');
  await page.locator('tbody tr select#grade').first().selectOption('A+');
  await page.locator('h1').first().click();
  await page.waitForTimeout(2000);
  console.log('REQS:', JSON.stringify(reqs, null, 2));
  const r = await page.evaluate(() => ({
    text: document.body.innerText.slice(0, 4000),
    rows: [...document.querySelectorAll('tbody tr')].map(tr => tr.outerHTML),
    buttons: [...document.querySelectorAll('button')].map(b => ({ text: b.innerText, cls: b.className }))
  }));
  console.log('TEXT:\n' + r.text);
  console.log('ROWS:', JSON.stringify(r.rows, null, 2));
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/module-row-filled.png', Buffer.from(shot.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
