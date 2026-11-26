const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const client = await ctx.newCDPSession(page);
  await page.goto('https://gpa.sarislabs.com/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log('URL:', page.url(), 'TITLE:', await page.title());
  const r = await page.evaluate(() => ({ text: document.body.innerText.slice(0, 8000), html: document.body.innerHTML.slice(0, 2000), links: [...document.querySelectorAll('a')].map(a=>({t:a.innerText,h:a.getAttribute('href')})), buttons: [...document.querySelectorAll('button')].map(b=>b.innerText) }));
  console.log(r.text);
  fs.writeFileSync('captures/public-root-info.json', JSON.stringify(r, null, 2));
  await client.send('Page.bringToFront');
  let s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/public-root.png', Buffer.from(s.data, 'base64'));
  // unauthenticated dashboard
  await page.goto('https://gpa.sarislabs.com/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('\nDASH URL:', page.url());
  await client.send('Page.bringToFront');
  s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/public-signin.png', Buffer.from(s.data, 'base64'));
  const t = await page.evaluate(() => document.body.innerText);
  console.log('SIGNIN TEXT:', t);
  await ctx.close();
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
