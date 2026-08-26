import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const L=(...a)=>console.log(...a);
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
const snap = async (tag) => {
  const s = await p.evaluate(()=>{
    const t=document.querySelector('.ctitle h3');
    const sz=Array.from(document.querySelectorAll('.sizes button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.querySelector('.lab').textContent);
    const qt=Array.from(document.querySelectorAll('.qtys button')).filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.querySelector('.n').textContent);
    return {open:t?t.textContent:'(nothing open)', size:sz, qty:qt};
  });
  L(`  ${tag.padEnd(16)} open=${s.open.padEnd(24)} size=${JSON.stringify(s.size)} qty=${JSON.stringify(s.qty)}`);
};
L('Fresh load, then open Single Wall and pick 16 oz + 5,000:');
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(300);
await pickSize(2);
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(200);
await snap('start');
for (const name of ['Cold Cups','Coffee Sleeves','Mason Jars','Coffee Cups','All products']) {
  await p.locator('#tabs .tab',{hasText:name}).first().click(); await p.waitForTimeout(400);
  await snap('→ '+name);
}
L('\nSame walk but starting fresh with NOTHING selected:');
await p.evaluate(()=>localStorage.clear());
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
for (const name of ['Coffee Cups','Cold Cups','Coffee Sleeves','Mason Jars']) {
  await p.locator('#tabs .tab',{hasText:name}).first().click(); await p.waitForTimeout(400);
  await snap('→ '+name);
}
await b.close();
