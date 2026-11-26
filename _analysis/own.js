const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  await page.getByRole('button', { name: 'Create Your Own' }).click();
  await page.waitForTimeout(1000);
  const data = await page.evaluate(() => {
    const m = document.querySelector('.fixed.inset-0.z-50');
    return {
      text: m.innerText,
      html: m.outerHTML,
      fields: [...m.querySelectorAll('input,select,textarea,button')].map(e => ({ tag: e.tagName, type: e.type, id: e.id, name: e.name, value: e.value, placeholder: e.placeholder, options: e.tagName === 'SELECT' ? [...e.options].map(o => o.value + ':' + o.text) : undefined, label: e.labels?.[0]?.innerText, cls: e.className }))
    };
  });
  fs.writeFileSync('captures/create-own-module.json', JSON.stringify(data, null, 2));
  console.log(data.text);
  console.log(JSON.stringify(data.fields, null, 2));
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/create-own-module.png', Buffer.from(shot.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
