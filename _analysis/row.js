const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  const r = await page.evaluate(() => {
    const row = document.querySelector('tr') || document.querySelector('table')?.parentElement;
    const tables = [...document.querySelectorAll('table')].map(t => t.outerHTML);
    const buttons = [...document.querySelectorAll('button')].map(b => ({ text: b.innerText, cls: b.className, title: b.title }));
    return { tables, buttons, rowHtml: document.querySelector('tbody tr')?.outerHTML };
  });
  fs.writeFileSync('captures/module-row.json', JSON.stringify(r, null, 2));
  console.log('TABLES:', r.tables.length);
  console.log(r.rowHtml?.slice(0, 8000));
  console.log(JSON.stringify(r.buttons, null, 2));
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/module-row-edit.png', Buffer.from(shot.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
