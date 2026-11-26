const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  const reqs = [];
  page.on('request', r => { if (r.url().includes('/api/') && r.method() !== 'GET') reqs.push({ method: r.method(), url: r.url(), postData: r.postData() }); });

  await page.getByRole('button', { name: 'Add New Module' }).click();
  await page.waitForTimeout(700);
  const modal = page.locator('.fixed.inset-0.z-50');
  await modal.locator('select#moduleName').selectOption({ label: 'Industrial Law' });
  await modal.locator('button', { hasText: 'Add' }).last().click();
  await page.waitForTimeout(800);
  const last = page.locator('tbody tr').last();
  await last.locator('select#grade').selectOption('H-(NGPA)');
  await page.waitForTimeout(400);
  await last.locator('button.bg-green-600').click();
  await page.waitForTimeout(2500);
  console.log('REQS:', JSON.stringify(reqs, null, 2));
  const r = await page.evaluate(() => ({ text: document.body.innerText, inputs: [...document.querySelectorAll('tbody input, tbody select')].map(e => e.value) }));
  console.log('TEXT:\n' + r.text.slice(r.text.indexOf('Current GPA'), r.text.indexOf('Add New Semester')));
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/ngpa-module.png', Buffer.from(shot.data, 'base64'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
