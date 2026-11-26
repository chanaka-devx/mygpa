const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('sarislabs.com'));
  const r = await page.evaluate(() => {
    const m = document.querySelector('.fixed.inset-0.z-50');
    const btn = [...m.querySelectorAll('button')].map(b => b.innerText);
    const anims = document.getAnimations().map(a => ({ name: a.animationName, playState: a.playState, target: a.effect?.target?.className?.toString?.().slice(0,100), iterations: a.effect?.getTiming?.().iterations }));
    return { btn, anims, scrollH: document.body.scrollHeight, vis: document.visibilityState };
  });
  console.log(JSON.stringify(r, null, 2));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
