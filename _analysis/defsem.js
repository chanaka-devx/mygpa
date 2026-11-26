const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  const r = await page.evaluate(() => {
    const modal = [...document.querySelectorAll('.fixed.inset-0')].find(e => e.className.includes('z-50'));
    return { modalHtml: modal?.outerHTML, modalText: modal?.innerText, table: document.querySelector('table')?.outerHTML };
  });
  fs.writeFileSync('captures/default-semester-modal.json', JSON.stringify(r, null, 2));
  console.log('MODAL:\n' + r.modalText);
  console.log('TABLE:\n' + r.table?.slice(0, 6000));
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/default-semester-modal.png', Buffer.from(shot.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
