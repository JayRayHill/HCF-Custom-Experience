import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
const L=(...a)=>console.log(...a);
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
L('pills label empty:', await p.evaluate(()=>document.querySelector('#tabsLede').textContent));

L('\n--- orphan lid: tick a cup lid, then add ONLY a mason jar ---');
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(300);
await p.locator('.lidrow input').check(); await p.waitForTimeout(200);
await p.locator('#tabs .tab',{hasText:'Mason Jars'}).click(); await p.waitForTimeout(400);
await pickSize(0);
await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(150);
await p.locator('.lidrow input').uncheck().catch(()=>{});
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(350);
L('tally:', await p.evaluate(()=>document.querySelector('#tally').textContent));
L('pills label now:', await p.evaluate(()=>document.querySelector('#tabsLede').textContent));
await p.locator('#toB2').click(); await p.waitForTimeout(350);
L('review extras:', await p.evaluate(()=>Array.from(document.querySelectorAll('.rline--extra .nm')).map(e=>e.textContent).join('|')||'(none — correct)'));

L('\n--- now add the cup too: the lid should reappear ---');
await p.locator('#backB1').click(); await p.waitForTimeout(300);
await p.locator('#tabs .tab',{hasText:'Coffee Cups'}).click(); await p.waitForTimeout(300);
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(300);
await pickSize(1);
await p.locator('.qtys button').nth(1).click(); await p.waitForTimeout(150);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(350);
L('tally:', await p.evaluate(()=>document.querySelector('#tally').textContent));
await p.locator('#toB2').click(); await p.waitForTimeout(350);
L('review extras:', await p.evaluate(()=>Array.from(document.querySelectorAll('.rline--extra .nm')).map(e=>e.textContent).join('|')||'(none)'));

L('\n--- remove the cup: the lid must go with it ---');
const rows = p.locator('.rline:not(.rline--extra)');
const idx = await p.evaluate(()=>Array.from(document.querySelectorAll('.rline:not(.rline--extra) .nm')).findIndex(e=>e.textContent.includes('Single Wall')));
await rows.nth(idx).locator('.rm-line').click(); await p.waitForTimeout(400);
L('review extras:', await p.evaluate(()=>Array.from(document.querySelectorAll('.rline--extra .nm')).map(e=>e.textContent).join('|')||'(none — correct)'));
L('tally:', await p.evaluate(()=>document.querySelector('#tally').textContent));

L('\n--- added-pill jump to a 2-product category ---');
await p.locator('#backB1').click(); await p.waitForTimeout(300);
/* Sleeves, not jars: the jar is already on the quote and comes in one size
   now, so re-picking it is an edit, and an edit is not the moment the
   just-added panel is for. */
await p.locator('#tabs .tab',{hasText:'Coffee Sleeves'}).click(); await p.waitForTimeout(300);
await pickSize(0);
await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(150);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(350);
await p.locator('.added__pills .tab',{hasText:'Cold Cups'}).click(); await p.waitForTimeout(800);
L('tiles in view:', await p.evaluate(()=>{const t=document.querySelector('#tiles').getBoundingClientRect();return `top=${Math.round(t.top)} ${t.top>=0&&t.top<300?'YES':'no'}`;}));
L('rail × size:', await p.evaluate(()=>{const x=document.querySelector('.line .rm-btn');const r=x.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height);}));
await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
L('rail × at 390px:', await p.evaluate(()=>{const x=document.querySelector('.line .rm-btn');const r=x.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height);}));
L('\nerrors:',errs.length?errs:'none');
await b.close();
