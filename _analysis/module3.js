const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com')) || ctx.pages()[0];
  const client = await page.context().newCDPSession(page);
  const shot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('captures/add-module-modal-cdp.png', Buffer.from(shot.data, 'base64'));
  console.log('saved');
  const m = await page.evaluate(() => document.querySelector('.fixed.inset-0.z-50')?.outerHTML || '');
  fs.writeFileSync('captures/add-module-modal-full.html', m);
  console.log(m.slice(0, 12000));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
