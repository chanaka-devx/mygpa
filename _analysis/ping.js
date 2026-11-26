const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  console.log('connected', page.url());
  const r = await Promise.race([
    page.evaluate(() => document.title),
    new Promise((_, rej) => setTimeout(() => rej(new Error('eval timeout')), 10000))
  ]);
  console.log('eval:', r);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
