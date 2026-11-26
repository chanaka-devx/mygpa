const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  await page.goto('https://gpa.sarislabs.com/dashboard/analytics', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 1440, height: 900 });
  const inputs = page.locator('input[type=number]');
  console.log('number inputs', await inputs.count());
  await page.getByPlaceholder('e.g. 3.50 (max 4.0)').fill('3.8');
  await page.getByPlaceholder('e.g. 45').fill('30');
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: '+ Add Hypothetical Semester' }).click();
  await page.waitForTimeout(600);
  // fill hypothetical row credits/gpa
  const row = page.locator('table tbody tr').last();
  console.log('row text', await row.innerText());
  const rowInputs = row.locator('input');
  await rowInputs.nth(1).fill('20');
  await rowInputs.nth(2).fill('3.5');
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const main = document.querySelector('.md\\:ml-64') || document.body;
    return { text: main.innerText, target: main.querySelector('.bg-green-50, .bg-yellow-50, .bg-red-50')?.innerText, projected: main.querySelector('.bg-indigo-50')?.innerText };
  });
  console.log('TARGET RESULT:', r.target);
  console.log('PROJECTED:', r.projected);
  fs.writeFileSync('captures/analytics-whatif.json', JSON.stringify(r, null, 2));
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: 1440, height: Math.min(h, 2600) });
  await page.waitForTimeout(600);
  const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/analytics-whatif.png', Buffer.from(s.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
