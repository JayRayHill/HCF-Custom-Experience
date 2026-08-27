import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = 'file://' + new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await page.locator('.sizes button').count() === 0) return;
  await page.locator('.sizes button').nth(n).click(); await page.waitForTimeout(150);
};
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type()==='error' && !/photos\.json|ERR_CONNECTION/.test(m.text())) errs.push('CONSOLE: '+m.text()); });
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(700);
const L = (...a) => console.log(...a);

L('tabs:', await page.evaluate(() => Array.from(document.querySelectorAll('#tabs .tab')).map(t=>t.textContent+(t.getAttribute('aria-pressed')==='true'?'*':'')).join(' | ')));
L('tiles on All:', await page.locator('#tiles .tile').count());
L('first tile:', await page.evaluate(() => document.querySelector('.tile').textContent.replace(/\s+/g,' ').trim()));
L('header buttons:', await page.evaluate(() => Array.from(document.querySelectorAll('.head-right button')).map(b=>b.textContent).join(' | ')));
L('photoBtn present?', await page.evaluate(() => !!document.querySelector('#photoBtn')));
L('empty config:', await page.evaluate(() => document.querySelector('.config').textContent.replace(/\s+/g,' ').trim().slice(0,90)));
L('tally:', await page.evaluate(() => document.querySelector('#tally').textContent));
L('mobar hidden?', await page.evaluate(() => document.querySelector('#mobar').hidden));

L('\n--- open Single Wall ---');
await page.locator('.tile').nth(0).click(); await page.waitForTimeout(400);
L('lead line:', await page.evaluate(() => document.querySelector('.ctitle .lead').textContent));
L('qty chips:', await page.evaluate(() => Array.from(document.querySelectorAll('.qtys button')).map(b=>b.textContent.replace(/\s+/g,' ').trim()).join(' | ')));
L('hint before size:', await page.evaluate(() => document.querySelector('.foothint').textContent));
L('lid row:', await page.evaluate(() => { const l=document.querySelector('.lidrow'); return l?l.textContent.trim():'NONE'; }));

await pickSize(1);
await page.locator('.qtys button').nth(2).click(); await page.waitForTimeout(200);
L('hint with ONE qty (F4):', await page.evaluate(() => document.querySelector('.foothint').textContent));
L('button:', await page.evaluate(() => document.querySelector('.config-foot .btn').textContent));
await page.locator('.qtys button').nth(3).click(); await page.waitForTimeout(200);
L('button with two:', await page.evaluate(() => document.querySelector('.config-foot .btn').textContent));
await page.locator('.qtys button').nth(1).click(); await page.waitForTimeout(200);
L('button with three (H5):', await page.evaluate(() => document.querySelector('.config-foot .btn').textContent));
await page.locator('.qtys button').nth(1).click(); await page.waitForTimeout(200);

await page.locator('.lidrow input').check(); await page.waitForTimeout(200);
await page.locator('.config-foot .btn--primary').click(); await page.waitForTimeout(400);
L('\n--- after add ---');
L('added block:', await page.evaluate(() => { const a=document.querySelector('.added'); return a?a.textContent.replace(/\s+/g,' ').trim():'NONE'; }));
L('foot after add (B2):', JSON.stringify(await page.evaluate(() => { const h=document.querySelector('.foothint'); const b=document.querySelector('.config-foot .btn'); return { hint: h?h.textContent:'(no foot at all)', button: b?b.textContent:'(no button)' }; })));
L('tally:', await page.evaluate(() => document.querySelector('#tally').textContent));
L('rail line:', await page.evaluate(() => document.querySelector('.line').textContent.replace(/\s+/g,' ').trim()));

L('\n--- D1: peek at another category and come back ---');
await pickSize(2);
await page.locator('.qtys button').nth(2).click(); await page.waitForTimeout(150);
const before = await page.evaluate(() => ({ open: document.querySelector('.ctitle h3').textContent, size: Array.from(document.querySelectorAll('.sizes button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.textContent.trim()), qty: Array.from(document.querySelectorAll('.qtys button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.textContent.split('\n')[0].trim()) }));
L('staged:', JSON.stringify(before));
const tabNames = await page.evaluate(() => Array.from(document.querySelectorAll('#tabs .tab')).map(t=>t.textContent));
const sleeveIdx = tabNames.indexOf('Coffee Sleeves');
await page.locator('#tabs .tab').nth(sleeveIdx).click(); await page.waitForTimeout(300);
L('on Sleeves — tiles hidden (E5)?', await page.evaluate(() => document.querySelector('#tiles').hidden), '| open:', await page.evaluate(() => document.querySelector('.ctitle h3').textContent));
const cupsIdx = tabNames.indexOf('Coffee Cups');
await page.locator('#tabs .tab').nth(cupsIdx).click(); await page.waitForTimeout(300);
const after = await page.evaluate(() => ({ open: (document.querySelector('.ctitle h3')||{}).textContent||'(collapsed)', size: Array.from(document.querySelectorAll('.sizes button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.textContent.trim()), qty: Array.from(document.querySelectorAll('.qtys button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.textContent.split('\n')[0].trim()) }));
L('after round-trip:', JSON.stringify(after));
L('MULTI-PRODUCT CATEGORY RESETS (intended)?', after.open === '(collapsed)' && !after.size.length && !after.qty.length ? 'YES' : 'NO — ' + JSON.stringify(after));
L('\nERRORS:', errs.length ? errs : 'none');
await b.close();
