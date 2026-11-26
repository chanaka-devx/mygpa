const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  await client.send('Emulation.setFocusEmulationEnabled', { enabled: true }).catch(()=>{});
  await new Promise(r => setTimeout(r, 1500));
  const shot = await Promise.race([
    client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
  ]);
  fs.writeFileSync('captures/add-module-modal-cdp.png', Buffer.from(shot.data, 'base64'));
  console.log('saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
