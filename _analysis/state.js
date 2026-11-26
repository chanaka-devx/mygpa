const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  for (const p of pages) console.log('PAGE:', p.url(), '| title:', await p.title());
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
