const { chromium } = require('playwright-core');
const fs = require('fs');
const outDir = 'C:/Users/HP/Documents/GitHub/GPA/_analysis/captures';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com')) || ctx.pages()[0];
  await page.setViewportSize({ width: 1440, height: 900 });

  const dumpStyles = async (label) => {
    const data = await page.evaluate(() => {
      const pick = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = getComputedStyle(el);
        return { cls: el.className?.toString?.().slice(0,500), bg: s.backgroundColor, color: s.color, font: s.fontFamily, fontSize: s.fontSize, padding: s.padding, margin: s.margin, width: s.width, height: s.height, radius: s.borderRadius, border: s.border, boxShadow: s.boxShadow, display: s.display, gridTemplateColumns: s.gridTemplateColumns, gap: s.gap, position: s.position, zIndex: s.zIndex };
      };
      const main = document.querySelector('main');
      return {
        sidebarContainer: pick('[class*="fixed"][class*="w-64"]') || pick('aside') || pick('nav')?.parentElement,
        main: main ? pick('main') : null,
        banner: pick('[class*="border-blue"]'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        htmlBg: getComputedStyle(document.documentElement).backgroundColor,
        allClasses: [...new Set([...document.querySelectorAll('div')].map(d => d.className?.toString?.()).filter(Boolean))].slice(0, 200)
      };
    });
    fs.writeFileSync(`${outDir}/styles-${label}.json`, JSON.stringify(data, null, 2));
    console.log(label, JSON.stringify(data, null, 2).slice(0, 4000));
  };

  await dumpStyles('dashboard');

  console.log('--- click Add New Semester ---');
  await page.getByRole('button', { name: 'Add New Semester' }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: outDir + '/add-semester-modal.png', fullPage: false });
  fs.writeFileSync(outDir + '/add-semester-modal.html', await page.content());
  const modalText = await page.evaluate(() => {
    const m = document.querySelector('[role="dialog"]') || document.querySelector('[class*="fixed"][class*="inset-0"]');
    return m ? m.innerText : 'NO MODAL FOUND';
  });
  console.log('MODAL TEXT:\n' + modalText);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
