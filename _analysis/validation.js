const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await client.send('Page.bringToFront');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://gpa.sarislabs.com/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const reqs = [];
  page.on('request', r => { if (r.url().includes('/api/') && r.method() !== 'GET') reqs.push({ method: r.method(), url: r.url(), postData: r.postData() }); });
  // edit first semester (Semester 1)
  await page.locator('button.text-gray-600').first().click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(1500);
  console.log('EDIT REQS:', JSON.stringify(reqs, null, 2));
  console.log('TOAST:', await page.evaluate(() => document.querySelector('.Toastify')?.innerText));
  // add modal validation
  await page.getByRole('button', { name: 'Add New Semester' }).click();
  await page.waitForTimeout(500);
  await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(500);
  let r = await page.evaluate(() => [...document.querySelectorAll('.fixed.inset-0.z-50 p.text-red-500')].map(e=>e.innerText));
  console.log('EMPTY NAME ERRORS:', r);
  await page.locator('.fixed.inset-0.z-50 #semesterName').fill('Test Sem');
  await page.locator('.fixed.inset-0.z-50 #weight').fill('11');
  await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(500);
  r = await page.evaluate(() => [...document.querySelectorAll('.fixed.inset-0.z-50 p.text-red-500')].map(e=>e.innerText));
  console.log('WEIGHT ERRORS:', r);
  const s = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync('captures/add-semester-validation.png', Buffer.from(s.data, 'base64'));
  await page.locator('.fixed.inset-0.z-50 button').first().click();
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
