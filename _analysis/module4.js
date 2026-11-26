const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const m = await page.evaluate(() => document.querySelector('.fixed.inset-0.z-50')?.outerHTML || '');
  fs.writeFileSync('captures/add-module-modal-full.html', m);
  console.log('len', m.length);
  console.log(m.slice(0, 6000));
  const client = await ctx.newCDPSession(page);
  console.log('cdp session ok');
  const shot = await Promise.race([
    client.send('Page.captureScreenshot', { format: 'png' }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('shot timeout')), 15000))
  ]);
  fs.writeFileSync('captures/add-module-modal-cdp.png', Buffer.from(shot.data, 'base64'));
  console.log('screenshot saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
