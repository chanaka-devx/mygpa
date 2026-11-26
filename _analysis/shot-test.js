const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  for (const opts of [{format:'png', fromSurface: false}, {format:'jpeg', quality: 70, fromSurface: false}, {format:'png', fromSurface: true, captureBeyondViewport: false}]) {
    try {
      const shot = await Promise.race([
        client.send('Page.captureScreenshot', opts),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
      ]);
      console.log('OK', JSON.stringify(opts), shot.data.length);
    } catch (e) { console.log('FAIL', JSON.stringify(opts), e.message); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
