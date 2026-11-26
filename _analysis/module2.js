const { chromium } = require('playwright-core');
const fs = require('fs');
const outDir = 'C:/Users/HP/Documents/GitHub/GPA/_analysis/captures';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com')) || ctx.pages()[0];
  await page.setViewportSize({ width: 1440, height: 900 });
  const modal = await page.evaluate(() => {
    const m = document.querySelector('.fixed.inset-0.z-50');
    if (!m) return { text: 'NO MODAL', html: '' };
    return {
      text: m.innerText,
      html: m.outerHTML.slice(0, 30000),
      fields: [...m.querySelectorAll('input,select,textarea,button')].map(e => ({ tag: e.tagName, type: e.type, id: e.id, name: e.name, value: e.value, placeholder: e.placeholder, options: e.tagName === 'SELECT' ? [...e.options].map(o => o.value + ':' + o.text) : undefined, label: e.labels?.[0]?.innerText, cls: e.className }))
    };
  });
  fs.writeFileSync(outDir + '/add-module-modal.json', JSON.stringify(modal, null, 2));
  console.log(modal.text);
  console.log(JSON.stringify(modal.fields, null, 2));
  await page.screenshot({ path: outDir + '/add-module-modal.png', fullPage: false, animations: 'disabled', timeout: 8000 }).catch(e => console.log('screenshot failed:', e.message));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
