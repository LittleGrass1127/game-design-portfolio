const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const root = process.env.PORTFOLIO_ROOT ? path.resolve(process.env.PORTFOLIO_ROOT) : path.resolve(__dirname, '..');
const output = process.env.SMOKE_OUTPUT ? path.resolve(process.env.SMOKE_OUTPUT) : path.join(root, 'artifacts');
fs.mkdirSync(output, { recursive: true });
const games = [
  ['d20', 'demos/d20.html'], ['kaoyan', 'demos/kaoyan.html'],
  ['tuanzi', 'demos/tuanzi.html'], ['yedeng', 'prototypes/yedeng.html'],
  ['chunfeng', 'prototypes/chunfeng.html'], ['jiuying', 'prototypes/jiuying.html'],
  ['jingling', 'prototypes/jingling.html'],
];
const url = file => pathToFileURL(path.join(root, file)).href;
const results = [];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [id, file] of games) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors = [], external = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
      await page.goto(url(file), { waitUntil: 'load' });
      await page.waitForTimeout(400);
      assert.ok((await page.title()).length > 0, `${id}: missing title`);
      assert.ok(await page.locator('body').isVisible(), `${id}: body is not visible`);
      if (id === 'tuanzi') {
        await page.locator('#startButton').click();
        await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
        assert.ok(!(await page.locator('#startScreen').evaluate(node => node.classList.contains('show'))), 'tuanzi: start did not enter play');
        await page.screenshot({ path: path.join(output, 'tuanzi-playing.png') });
      } else {
        const firstButton = page.locator('button:visible:not([disabled])').first();
        if (await firstButton.count()) await firstButton.click();
        await page.waitForTimeout(200);
      }
      assert.deepEqual(errors, [], `${id}: browser errors: ${errors.join(' | ')}`);
      assert.deepEqual(external, [], `${id}: external runtime requests`);
      results.push({ id, status: 'passed', errors: errors.length, externalRequests: external.length });
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url('play.html') + '?game=tuanzi');
    await page.frameLocator('#gameFrame').locator('body').waitFor();
    assert.equal(await page.locator('.game-button').count(), games.length);
    assert.equal(await page.locator('#runMode').textContent(), '本地离线模式');
    for (const [id, file] of games) {
      await page.locator(`.game-button[data-game="${id}"]`).click();
      await page.waitForFunction(expected => document.querySelector('#gameFrame')?.getAttribute('src') === expected, file);
      assert.ok((await page.locator('#gameTitle').textContent()).length > 0);
      assert.equal(await page.locator('#downloadCurrent').getAttribute('href'), file);
    }
    await page.locator('.game-button[data-game="tuanzi"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(output, 'play-desktop.png'), fullPage: true });
    assert.deepEqual(errors, [], `launcher errors: ${errors.join(' | ')}`);
    results.push({ id: 'offline-launcher-and-7-switches', status: 'passed' });
    await page.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.goto(url('play.html') + '?game=d20');
    await mobile.waitForTimeout(500);
    assert.equal(await mobile.locator('#mobileSelect option').count(), games.length);
    await mobile.locator('#mobileSelect').selectOption('chunfeng');
    assert.ok((await mobile.locator('#gameTitle').textContent()).includes('春风'));
    const widths = await mobile.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    assert.ok(widths.content <= widths.viewport + 1, `mobile horizontal overflow: ${JSON.stringify(widths)}`);
    await mobile.screenshot({ path: path.join(output, 'play-mobile.png'), fullPage: true });
    results.push({ id: 'mobile-layout-and-select', status: 'passed', ...widths });
    await mobile.close();

    fs.writeFileSync(path.join(output, 'smoke-results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });



