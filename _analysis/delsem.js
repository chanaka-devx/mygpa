const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  // close edit modal
  await page.locator('.fixed.inset-0.z-50 button').first().click();
  await page.waitForTimeout(400);
  // click semester header delete (text-red-600 button)
  await page.locator('button.text-red-600').first().click();
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const ms = [...document.querySelectorAll('.fixed.inset-0')].map(e=>({cls:e.className,text:e.innerText.slice(0,500),html:e.outerHTML.slice(0,5000)}));
    return ms;
  });
  console.log(JSON.stringify(r, null, 2));
  const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/delete-semester-confirm.png', Buffer.from(s.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
