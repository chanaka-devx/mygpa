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
  console.log('banner present before:', await page.getByText('Multiple GPA Calculation Methods Now Available!').count());
  await page.getByRole('button', { name: 'Got it' }).click();
  await page.waitForTimeout(1500);
  console.log('REQS:', JSON.stringify(reqs, null, 2));
  console.log('banner present after:', await page.getByText('Multiple GPA Calculation Methods Now Available!').count());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('banner present after reload:', await page.getByText('Multiple GPA Calculation Methods Now Available!').count());
  // restore
  const res = await page.evaluate(async () => {
    const r = await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hasSeenGpaMethodNotification: false }), credentials: 'include' });
    return { status: r.status, body: await r.text() };
  });
  console.log('restore:', JSON.stringify(res));
  // settings save
  await page.goto('https://gpa.sarislabs.com/dashboard/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const reqs2 = [];
  page.on('request', r => { if (r.url().includes('/api/') && r.method() !== 'GET') reqs2.push({ method: r.method(), url: r.url(), postData: r.postData() }); });
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(2000);
  console.log('SETTINGS REQS:', JSON.stringify(reqs2, null, 2));
  const toast = await page.evaluate(() => document.querySelector('.Toastify')?.innerText || document.body.innerText.slice(0,300));
  console.log('TOAST:', toast);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
