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

L('=== EDGE 1: tick a lid, never add the product ===');
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(300);
await p.locator('.lidrow input').check(); await p.waitForTimeout(250);
L('tally:', await p.evaluate(()=>document.querySelector('#tally').textContent));
L('rail lines:', await p.locator('.line').count(), '| Review enabled:', await p.evaluate(()=>!document.querySelector('#toB2').disabled));
await p.evaluate(()=>{document.querySelector('#s-b2').hidden=false;});
await p.evaluate(()=>window.__r&&0);
// force a review render via the public path
await p.evaluate(()=>{document.querySelector('#s-b2').hidden=true;});
L('   → lid is on the request with no product to attach it to?');

L('\n=== EDGE 2: an unsure line through review ===');
await p.locator('.lidrow input').uncheck(); await p.waitForTimeout(150);
await pickSize(1);
await p.locator('.qtys button',{hasText:'Not sure yet'}).click(); await p.waitForTimeout(150);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
await p.locator('#toB2').click(); await p.waitForTimeout(350);
L('review line:', await p.evaluate(()=>document.querySelector('.rline').innerText.replace(/\s+/g,' ').trim()));
L('stepper shown for unsure line:', await p.locator('.stepper').count());
await p.locator('.stepper button').last().click(); await p.waitForTimeout(300);
L('after tapping + :', await p.evaluate(()=>document.querySelector('.rline').innerText.replace(/\s+/g,' ').trim()));

L('\n=== EDGE 3: undo a lid removal ===');
await p.locator('#backB1').click(); await p.waitForTimeout(300);
await p.locator('.lidrow input').check(); await p.waitForTimeout(200);
await p.locator('#toB2').click(); await p.waitForTimeout(300);
const rms = p.locator('.rm-line');
L('remove buttons:', await rms.count());
await rms.last().click(); await p.waitForTimeout(300);
L('undo bar:', await p.evaluate(()=>{const u=document.querySelector('#undoBar');return u.hidden?'(hidden)':u.textContent.trim();}));
await p.locator('#undoBar button').click(); await p.waitForTimeout(300);
L('lid back?', await p.evaluate(()=>Array.from(document.querySelectorAll('.rline--extra .nm')).map(e=>e.textContent).join('|')||'(none)'));

L('\n=== EDGE 4: added-pill jump to a 2-product category ===');
await p.locator('#backB1').click(); await p.waitForTimeout(300);
await p.locator('#tabs .tab',{hasText:'Coffee Cups'}).click(); await p.waitForTimeout(250);
await p.locator('.tile').nth(1).click(); await p.waitForTimeout(300);
await pickSize(0);
await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(150);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
await p.locator('.added__pills .tab',{hasText:'Cold Cups'}).click(); await p.waitForTimeout(700);
L('after jumping to Cold Cups — config shows:', await p.evaluate(()=>{const t=document.querySelector('.ctitle h3');return t?t.textContent:'(empty slab)';}));
L('scrollY:', await p.evaluate(()=>Math.round(window.scrollY)), '| tiles in view:', await p.evaluate(()=>{const t=document.querySelector('#tiles').getBoundingClientRect();return t.top>=0&&t.top<window.innerHeight;}));

L('\n=== EDGE 5: rail remove tap target ===');
L(await p.evaluate(()=>{const x=document.querySelector('.line .rm-btn');if(!x)return'(no rail lines)';const r=x.getBoundingClientRect();return `rail × ${Math.round(r.width)}x${Math.round(r.height)}`;}));
L('\nerrors:',errs.length?errs:'none');
await b.close();
