const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const BASE = process.argv[2];
const OUT = process.argv[3];
const routes = ['', 'vector-calculus', 'laplace-transforms', 'fourier-methods', 'first-order-pdes', 'higher-order-pdes', 'papers',
  'papers?tab=frequency', 'papers?tab=bank', 'papers?tab=practice', 'papers?tab=mock', 'papers?tab=mistakes', 'papers?tab=add',
  'higher-order-pdes?topic=u5-wave', 'fourier-methods?topic=u3-ft', 'vector-calculus?tab=papers', 'first-order-pdes?tab=sources'];
(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const vp of [{ name: 'desktop', width: 1366, height: 900 }, { name: 'mobile', width: 375, height: 800 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    for (const r of routes) {
      errors.length = 0;
      await page.goto(`${BASE}/#/${r}`);
      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(300);
      const info = await page.evaluate(() => ({
        h1: document.querySelector('h1')?.textContent,
        katexErrors: document.querySelectorAll('.katex-error').length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        buttons: document.querySelectorAll('button').length,
        emptyButtons: [...document.querySelectorAll('button')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
        linksNoHref: [...document.querySelectorAll('a')].filter((a) => !a.getAttribute('href')).length,
      }));
      results.push({ vp: vp.name, r, ...info, errors: [...errors] });
      if (['', 'first-order-pdes', 'papers', 'papers?tab=bank', 'higher-order-pdes?topic=u5-wave'].includes(r)) {
        if (OUT) await page.screenshot({ path: `${OUT}/${vp.name}-${r.replace(/[?=&]/g, '_') || 'dashboard'}.png`, fullPage: false });
      }
    }
    await ctx.close();
  }
  await browser.close();
  let bad = 0;
  for (const x of results) {
    const flag = x.katexErrors || x.overflow > 1 || x.errors.length || x.emptyButtons || x.linksNoHref;
    if (flag) bad++;
    console.log(`${flag ? 'BAD ' : 'ok  '} ${x.vp.padEnd(7)} /${x.r.padEnd(32)} h1="${x.h1}" katexErr=${x.katexErrors} overflow=${x.overflow} buttons=${x.buttons} empty=${x.emptyButtons} noHref=${x.linksNoHref} ${x.errors.join(' | ')}`);
  }
  console.log(bad ? `${bad} problems` : 'all clean');
})();
