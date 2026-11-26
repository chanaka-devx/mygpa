const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const urls = await page.evaluate(() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.endsWith('.js')));
  fs.writeFileSync('js-urls.txt', [...new Set(urls)].join('\n'));
  console.log([...new Set(urls)].join('\n'));
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
