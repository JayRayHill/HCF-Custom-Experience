import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const L=(...a)=>console.log(...a);
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
const snap = async (t) => {
  const s = await p.evaluate(()=>({
    size: Array.from(document.querySelectorAll('.sizes button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.querySelector('.lab').textContent),
    qty: Array.from(document.querySelectorAll('.qtys button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.querySelector('.n').textContent),
    btn: (()=>{const x=document.querySelector('.config-foot .btn');return x?x.textContent+(x.disabled?' [off]':''):'(none)';})(),
    hint: (document.querySelector('.foothint')||{}).textContent||''
  }));
  L(`  ${t.padEnd(30)} size=${JSON.stringify(s.size)} qty=${JSON.stringify(s.qty)}  ${s.btn}  "${s.hint}"`);
};
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(400);
L('A. quantity first, then size:');
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(200); await snap('picked 5,000');
await pickSize(1); await snap('then picked 12 oz');

L('\nB. size, quantities, then change size:');
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(150);
await p.locator('.qtys button').nth(3).click(); await p.waitForTimeout(200); await snap('12 oz + 5,000 + 10,000');
await pickSize(2); await snap('switched to 16 oz');

L('\nC. a size already on the quote must load that line:');
await p.locator('.qtys button').nth(1).click(); await p.waitForTimeout(150);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(350);
await snap('added 16 oz at 3,000');
await pickSize(2); await snap('re-picked 16 oz (on quote)');
await b.close();
