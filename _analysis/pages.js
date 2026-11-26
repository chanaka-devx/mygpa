const { chromium } = require('playwright-core');
const fs = require('fs');
const outDir = 'C:/Users/HP/Documents/GitHub/GPA/_analysis/captures';

async function shot(page, client, name) {
  await client.send('Page.bringToFront');
  await new Promise(r => setTimeout(r, 400));
  const s = await Promise.race([
    client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
  ]);
  fs.writeFileSync(`${outDir}/${name}.png`, Buffer.from(s.data, 'base64'));
}

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const client = await ctx.newCDPSession(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  const pages = ['analytics', 'settings', 'help', 'feedback'];
  for (const p of pages) {
    await page.goto('https://gpa.sarislabs.com/dashboard/' + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await shot(page, client, p);
    const info = await page.evaluate(() => ({
      title: document.title,
      text: document.body.innerText,
      html: document.querySelector('.md\\:ml-64')?.outerHTML || document.body.innerHTML,
      links: [...document.querySelectorAll('a')].map(a => ({ t: a.innerText.trim(), h: a.getAttribute('href') })),
      buttons: [...document.querySelectorAll('button')].map(b => ({ t: b.innerText.trim(), cls: b.className })),
      inputs: [...document.querySelectorAll('input,select,textarea')].map(e => ({ tag: e.tagName, type: e.type, id: e.id, name: e.name, value: e.value, placeholder: e.placeholder, options: e.tagName==='SELECT'?[...e.options].map(o=>o.value+':'+o.text):undefined, cls: e.className })),
    }));
    fs.writeFileSync(`${outDir}/${p}-info.json`, JSON.stringify(info, null, 2));
    fs.writeFileSync(`${outDir}/${p}-main.html`, info.html);
    console.log(`\n===== ${p} =====\n` + info.text.slice(0, 4000));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
