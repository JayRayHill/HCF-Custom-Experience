import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const L=(...a)=>console.log(...a);
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const snap = async (t) => {
  const s = await p.evaluate(()=>({
    size: Array.from(document.querySelectorAll('.sizes button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.querySelector('.lab').textContent),
    qty: Array.from(document.querySelectorAll('.qtys button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.querySelector('.n').textContent),
    btn: (()=>{const x=document.querySelector('.config-foot .btn');return x?x.textContent+(x.disabled?' [off]':''):'(none)';})()}));
  L(`  ${t.padEnd(34)} size=${JSON.stringify(s.size)} qty=${JSON.stringify(s.qty)}  ${s.btn}`);
};
const fresh = async () => { await p.goto(url,{waitUntil:'domcontentloaded'}); await p.evaluate(()=>localStorage.clear()); await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600); await p.locator('.tile').nth(0).click(); await p.waitForTimeout(350); };

await fresh();
L('C. edit mode must show exactly the line, not merge with staged:');
await p.locator('.sizes button').nth(2).click(); await p.waitForTimeout(150);   // 16 oz
await p.locator('.qtys button').nth(1).click(); await p.waitForTimeout(150);    // 3,000
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(350);
await snap('added 16 oz @ 3,000');
await p.locator('.sizes button').nth(1).click(); await p.waitForTimeout(200);   // 12 oz (not on quote)
await p.locator('.qtys button').nth(3).click(); await p.waitForTimeout(200);    // stage 10,000
await snap('staged 12 oz @ 10,000');
await p.locator('.sizes button').nth(2).click(); await p.waitForTimeout(250);   // back to 16 oz (on quote)
await snap('back to 16 oz -> must be 3,000 only');

await fresh();
L('\nD. quantity first, then size, then add:');
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(150);
await p.locator('.qtys button').nth(3).click(); await p.waitForTimeout(150);
await snap('two quantities, no size');
await p.locator('.sizes button').nth(0).click(); await p.waitForTimeout(200);
await snap('then 8 oz');
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(350);
L('  rail:', await p.evaluate(()=>document.querySelector('.line').textContent.replace(/\s+/g,' ').trim()));

await fresh();
L('\nE. switching product still clears (different tiers):');
await p.locator('.sizes button').nth(1).click(); await p.waitForTimeout(150);
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(150);
await snap('12 oz cup @ 5,000');
await p.locator('#tabs .tab',{hasText:'Mason Jars'}).click(); await p.waitForTimeout(400);
await snap('switched to Mason Jars');
await b.close();
