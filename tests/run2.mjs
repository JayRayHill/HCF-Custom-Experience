import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = 'file://' + new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type()==='error' && !/photos\.json|ERR_CONNECTION/.test(m.text())) errs.push('CONSOLE: '+m.text()); });
await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(600);
const L=(...a)=>console.log(...a);
const T = async () => (await page.evaluate(() => Array.from(document.querySelectorAll('#tabs .tab')).map(t=>t.textContent)));

// cups
await page.locator('.tile').nth(0).click(); await page.waitForTimeout(250);
await pickSize(1);
await page.locator('.qtys button').nth(2).click(); await page.waitForTimeout(120);
await page.locator('.qtys button').nth(3).click(); await page.waitForTimeout(120);
await page.locator('.config-foot .btn--primary').click(); await page.waitForTimeout(250);
// jars — via the "anything else" pill, and use "Not sure yet"
const tabs = await T();
await page.locator('.added__pills .tab', { hasText: 'Mason Jars' }).click(); await page.waitForTimeout(300);
await pickSize(0);
await page.locator('.qtys button', { hasText: 'Not sure yet' }).click(); await page.waitForTimeout(150);
L('unsure hint:', await page.evaluate(()=>document.querySelector('.foothint').textContent));
await page.locator('.config-foot .btn--primary').click(); await page.waitForTimeout(250);
L('tally:', await page.evaluate(()=>document.querySelector('#tally').textContent));

L('\n--- D4: reopen a size already on the quote ---');
await page.locator('#tabs .tab', { hasText: 'Coffee Cups' }).first().click(); await page.waitForTimeout(250);
await page.locator('.tile').nth(0).click(); await page.waitForTimeout(300);   // categories no longer auto-open a product
await pickSize(1);
L('size chips:', await page.evaluate(()=>Array.from(document.querySelectorAll('.sizes button')).map(b=>b.textContent.replace(/\s+/g,' ').trim()).join(' | ')));
L('prefilled qtys:', await page.evaluate(()=>Array.from(document.querySelectorAll('.qtys button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.textContent.split('\n')[0].trim())));
L('buttons:', await page.evaluate(()=>Array.from(document.querySelectorAll('.config-foot .btn')).map(b=>b.textContent+(b.disabled?' [off]':'')).join(' | ')));
L('hint:', await page.evaluate(()=>document.querySelector('.foothint').textContent));
await page.locator('.qtys button').nth(1).click(); await page.waitForTimeout(200);
L('after adding 3,000 →', await page.evaluate(()=>Array.from(document.querySelectorAll('.config-foot .btn')).map(b=>b.textContent+(b.disabled?' [off]':'')).join(' | ')));
await page.locator('.config-foot .btn--primary').click(); await page.waitForTimeout(250);
L('rail:', await page.evaluate(()=>Array.from(document.querySelectorAll('.line .q')).map(e=>e.textContent.replace(/\s+/g,' ')).join(' || ')));

L('\n--- review ---');
await page.locator('#toB2').click(); await page.waitForTimeout(350);
L('continue:', await page.evaluate(()=>document.querySelector('#toB3').textContent));
L('remove controls:', await page.evaluate(()=>Array.from(document.querySelectorAll('.rline .rm-line, .rline .dropq')).map(e=>e.textContent.trim()).join(' | ')));
L('cases text:', await page.evaluate(()=>Array.from(document.querySelectorAll('.cases')).map(e=>e.textContent).join(' | ')));
L('why notes:', await page.evaluate(()=>Array.from(document.querySelectorAll('.rwhy')).map(e=>e.textContent).join(' | ') || '(none)'));
L('extras group:', await page.evaluate(()=>Array.from(document.querySelectorAll('.rline--extra .nm')).map(e=>e.textContent).join(' | ')||'(none)'));
// typeable figure
const vs = page.locator('.stepper .v');
await vs.nth(0).fill('7500'); await vs.nth(0).blur(); await page.waitForTimeout(300);
L('typed 7500 →', await page.evaluate(()=>Array.from(document.querySelectorAll('.stepper .v')).map(e=>e.value).join(' | ')));
// undo
await page.locator('.rm-line').first().click(); await page.waitForTimeout(300);
L('undo bar:', await page.evaluate(()=>{const u=document.querySelector('#undoBar');return u.hidden?'(hidden)':u.textContent.trim();}));
await page.locator('#undoBar button').click(); await page.waitForTimeout(300);
L('after undo, lines:', await page.locator('.rline').count());

L('\n--- questions ---');
await page.locator('#toB3').click(); await page.waitForTimeout(350);
L('questions:', await page.evaluate(()=>Array.from(document.querySelectorAll('#qBlock .qitem h3')).map(e=>e.textContent).join(' | ')));
await page.locator('#qBlock .qitem').first().locator('.chip').first().click(); await page.waitForTimeout(300);
L('G2 verdict:', await page.evaluate(()=>{const v=document.querySelector('.qverdict');return v?v.className+' :: '+v.textContent:'(none)';}));
await page.locator('#qBlock .qitem').first().locator('.chip').nth(2).click(); await page.waitForTimeout(300);
L('G2 after 2–3 months:', await page.evaluate(()=>{const v=document.querySelector('.qverdict');return v?v.className+' :: '+v.textContent:'(none)';}));
await page.fill('#qNote', 'Also need napkins and a 10oz if you make one.');
await page.waitForTimeout(200);

L('\n--- D2 form ---');
await page.locator('#toB4').click(); await page.waitForTimeout(300);
await page.locator('#sendBtn').click(); await page.waitForTimeout(400);
L('errors:', await page.evaluate(()=>Array.from(document.querySelectorAll('.err')).filter(e=>!e.hidden).map(e=>e.textContent).join(' | ')));
L('gate:', await page.evaluate(()=>{const g=document.querySelector('#formGate');return g.hidden?'(hidden)':g.textContent;}));
L('still on b4?', await page.evaluate(()=>!document.querySelector('#s-b4').hidden));
await page.fill('#f-name','Sam Reyes'); await page.fill('#f-biz','Third Street Coffee'); await page.fill('#f-email','sam@');
await page.locator('#sendBtn').click(); await page.waitForTimeout(400);
L('bad email:', await page.evaluate(()=>Array.from(document.querySelectorAll('.err')).filter(e=>!e.hidden).map(e=>e.textContent).join(' | ')));
await page.fill('#f-email','sam@thirdst.coffee');
await page.locator('#sendBtn').click(); await page.waitForTimeout(500);
L('\n--- confirmation ---');
L('on b5?', await page.evaluate(()=>!document.querySelector('#s-b5').hidden));
L('sentTo:', await page.evaluate(()=>document.querySelector('#sentTo').textContent));
L('steps:', await page.evaluate(()=>Array.from(document.querySelectorAll('.hiw-step h3')).map(e=>e.textContent).join(' → ')));
L('recap:', await page.evaluate(()=>Array.from(document.querySelectorAll('#recap .r')).map(e=>e.textContent.replace(/\s+/g,' ').trim()).join('\n        ')));
L('\nERRORS:', errs.length ? errs : 'none');
await b.close();
