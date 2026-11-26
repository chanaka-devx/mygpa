const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  await page.goto('https://gpa.sarislabs.com/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 1440, height: 900 });
  // click pencil button in semester header
  const pencil = page.locator('button.text-gray-600').first();
  await pencil.click();
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const m = [...document.querySelectorAll('.fixed.inset-0')].find(e => e.className.includes('z-50'));
    return { text: m?.innerText, html: m?.outerHTML, inputs: [...(m?.querySelectorAll('input,select,button')||[])].map(e=>({tag:e.tagName,type:e.type,id:e.id,name:e.name,value:e.value,label:e.labels?.[0]?.innerText})) };
  });
  console.log(JSON.stringify(r, null, 2));
  const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/edit-semester-modal.png', Buffer.from(s.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
