const { chromium } = require('playwright-core');
const fs = require('fs');

const outDir = 'C:/Users/HP/Documents/GitHub/GPA/_analysis/captures';
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com')) || ctx.pages()[0];

  const logs = [];
  page.on('console', m => logs.push({ type: m.type(), text: m.text() }));
  page.on('request', r => { if (!/\.(png|jpg|woff2?|css|js|svg|ico)(\?|$)/.test(r.url())) logs.push({ req: r.method() + ' ' + r.url() }); });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  await page.screenshot({ path: outDir + '/dashboard-1440.png', fullPage: true });
  fs.writeFileSync(outDir + '/dashboard-1440.html', await page.content());

  const info = await page.evaluate(() => {
    const css = (el) => {
      const s = getComputedStyle(el);
      return {
        tag: el.tagName, cls: el.className?.toString?.().slice(0, 300),
        color: s.color, bg: s.backgroundColor, font: s.fontFamily, size: s.fontSize, weight: s.fontWeight,
        radius: s.borderRadius, border: s.border, padding: s.padding, margin: s.margin,
        display: s.display, position: s.position, width: s.width, height: s.height, boxShadow: s.boxShadow,
        text: (el.innerText || '').slice(0, 120)
      };
    };
    const links = [...document.querySelectorAll('a')].map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href'), cls: a.className }));
    const buttons = [...document.querySelectorAll('button')].map(b => ({ text: b.innerText.trim(), aria: b.getAttribute('aria-label'), cls: b.className }));
    const inputs = [...document.querySelectorAll('input,select,textarea')].map(i => ({ tag: i.tagName, type: i.type, name: i.name, placeholder: i.placeholder, value: i.value, cls: i.className }));
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5')].map(h => ({ tag: h.tagName, text: h.innerText.trim(), cls: h.className, ...css(h) }));
    const bodyStyles = css(document.body);
    const sidebar = document.querySelector('aside, nav, [class*=sidebar]');
    return {
      title: document.title,
      links, buttons, inputs,
      headings,
      bodyStyles,
      sidebar: sidebar ? css(sidebar) : null,
      sidebarHTML: sidebar ? sidebar.outerHTML.slice(0, 20000) : null,
      localStorage: Object.fromEntries(Object.entries(localStorage)),
      sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
      cookies: document.cookie,
      innerText: document.body.innerText.slice(0, 8000)
    };
  });

  fs.writeFileSync(outDir + '/dashboard-info.json', JSON.stringify(info, null, 2));
  fs.writeFileSync(outDir + '/dashboard-logs.json', JSON.stringify(logs, null, 2));

  console.log(JSON.stringify({ title: info.title, links: info.links.length, buttons: info.buttons.length, inputs: info.inputs.length, headings: info.headings.map(h => h.tag + ': ' + h.text), lsKeys: Object.keys(info.localStorage) }, null, 2));
  console.log('INNER TEXT:\n' + info.innerText.slice(0, 3000));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
