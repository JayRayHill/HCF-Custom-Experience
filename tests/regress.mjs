import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await page.locator('.sizes button').count() === 0) return;
  await page.locator('.sizes button').nth(n).click(); await page.waitForTimeout(150);
};
const errs=[]; page.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
await page.goto(url,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(600);
const L=(...a)=>console.log(...a);
const build = async () => {
  await page.locator('.tile').nth(0).click(); await page.waitForTimeout(250);
  await pickSize(1);
  await page.locator('.qtys button').nth(2).click(); await page.waitForTimeout(120);
  await page.locator('.config-foot .btn--primary').click(); await page.waitForTimeout(300);
};
await build();

L('--- restore: tab + open product survive a reload ---');
await page.locator('#tabs .tab', {hasText:'Mason Jars'}).click(); await page.waitForTimeout(300);
await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(700);
L('tab after reload:', await page.evaluate(()=>Array.from(document.querySelectorAll('#tabs .tab')).filter(t=>t.getAttribute('aria-pressed')==='true').map(t=>t.textContent)[0]));
L('open after reload:', await page.evaluate(()=>{const t=document.querySelector('.ctitle h3');return t?t.textContent:'(none)';}));
L('quote survived:', await page.locator('.line').count());

L('\n--- history: back to b1 re-renders ---');
await page.locator('#toB2').click(); await page.waitForTimeout(300);
await page.goBack(); await page.waitForTimeout(400);
L('hash:', await page.evaluate(()=>location.hash), '| b1 shown:', await page.evaluate(()=>!document.querySelector('#s-b1').hidden), '| tiles:', await page.locator('#tiles .tile').count());

L('\n--- precondition: back into #b2 with an empty quote ---');
await page.locator('#toB2').click(); await page.waitForTimeout(300);
await page.locator('.rm-line').first().click(); await page.waitForTimeout(300);
L('review empty state:', await page.evaluate(()=>{const e=document.querySelector('.review-empty');return e?e.textContent.replace(/\s+/g,' ').trim().slice(0,60):'(none — navigated away?)';}));
L('still on b2?', await page.evaluate(()=>!document.querySelector('#s-b2').hidden));
await page.goBack(); await page.waitForTimeout(400);
L('after back:', await page.evaluate(()=>location.hash), '| showing:', await page.evaluate(()=>['b1','b2','b3','b4','b5'].find(s=>!document.querySelector('#s-'+s).hidden)));

L('\n--- submit is terminal ---');
await page.evaluate(()=>localStorage.clear());
await page.goto(url,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(600);
await build();
await page.locator('#toB2').click(); await page.waitForTimeout(250);
await page.locator('#toB3').click(); await page.waitForTimeout(250);
await page.locator('#qBlock .qitem').first().locator('.chip').nth(1).click(); await page.waitForTimeout(250);
await page.locator('#toB4').click(); await page.waitForTimeout(250);
await page.fill('#f-name','Sam'); await page.fill('#f-biz','Third St'); await page.fill('#f-email','s@t.co');
await page.locator('#sendBtn').click(); await page.waitForTimeout(500);
L('hash:', await page.evaluate(()=>location.hash), '| storage:', await page.evaluate(()=>localStorage.getItem('hcf-quote-builder-session-v1')));
await page.goBack(); await page.waitForTimeout(400);
L('after back — hash:', await page.evaluate(()=>location.hash), '| storage:', await page.evaluate(()=>localStorage.getItem('hcf-quote-builder-session-v1')));
L('send button:', await page.evaluate(()=>{const b=document.querySelector('#sendBtn');return b.disabled+' / '+b.textContent;}));
L('savenote:', await page.evaluate(()=>document.querySelector('#savenote').textContent));
L('\nERRORS:', errs.length?errs:'none');
await b.close();
