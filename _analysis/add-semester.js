const { chromium } = require('playwright-core');
const fs = require('fs');
const outDir = 'C:/Users/HP/Documents/GitHub/GPA/_analysis/captures';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com')) || ctx.pages()[0];
  await page.setViewportSize({ width: 1440, height: 900 });

  const reqs = [];
  page.on('request', r => { if (r.url().includes('/api/') || r.method() !== 'GET') reqs.push({ method: r.method(), url: r.url(), postData: r.postData() }); });
  page.on('response', async r => {
    if (r.url().includes('/api/')) {
      let body = ''; try { body = await r.text(); } catch {}
      reqs.push({ response: r.status(), url: r.url(), body: body.slice(0, 2000) });
    }
  });

  // If modal open, fill; else click add
  const dialog = page.locator('.fixed.inset-0.z-50');
  if (!(await dialog.count())) {
    await page.getByRole('button', { name: 'Add New Semester' }).click();
    await page.waitForTimeout(600);
  }
  await page.locator('#semesterName').fill('Semester 1');
  await page.locator('#weight').fill('1');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(2500);

  await page.screenshot({ path: outDir + '/dashboard-after-semester.png', fullPage: true });
  fs.writeFileSync(outDir + '/dashboard-after-semester.html', await page.content());
  const info = await page.evaluate(() => ({
    text: document.body.innerText.slice(0, 6000),
    cards: [...document.querySelectorAll('[class*="card"], .rounded-xl, .rounded-lg')].slice(0, 30).map(e => ({ cls: e.className.toString().slice(0, 200), text: e.innerText.slice(0, 200) })),
    links: [...document.querySelectorAll('a')].map(a => ({ t: a.innerText.trim(), h: a.getAttribute('href') }))
  }));
  fs.writeFileSync(outDir + '/after-semester-info.json', JSON.stringify(info, null, 2));
  console.log('REQUESTS:\n' + JSON.stringify(reqs, null, 2));
  console.log('TEXT:\n' + info.text);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
