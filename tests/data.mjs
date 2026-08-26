import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1590,height:1000}});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(700);
const L=(...a)=>console.log(...a);
L('--- tiles ---');
L(await p.evaluate(()=>Array.from(document.querySelectorAll('.tile')).map(t=>{
  const n=t.querySelector('.nm').textContent;
  const v=Array.from(t.querySelectorAll('.specs__value')).map(e=>e.textContent);
  const c=Array.from(t.querySelectorAll('.specs__caption')).map(e=>e.textContent);
  const lbl=Array.from(t.querySelectorAll('.specs__label')).map(e=>e.textContent);
  return `  ${n.padEnd(24)} ${lbl[0]} ${v[0].padEnd(12)} (${c[0]})   ${lbl[1]} ${v[1].padEnd(10)} (${c[1]})`;
}).join('\n')));

L('\n--- configurator per product ---');
for (const [tab, idx] of [['Coffee Cups',0],['Coffee Cups',1],['Cold Cups',0],['Cold Cups',1],['Coffee Sleeves',null],['Mason Jars',null]]) {
  await p.locator('#tabs .tab',{hasText:tab}).first().click(); await p.waitForTimeout(300);
  if (idx!==null) { await p.locator('.tile').nth(idx).click(); await p.waitForTimeout(300); }
  L(await p.evaluate(()=>{
    const t=document.querySelector('.ctitle h3').textContent;
    const lead=document.querySelector('.ctitle .lead').textContent;
    const q=Array.from(document.querySelectorAll('.qtys button')).map(b=>b.querySelector('.n').textContent).join(' / ');
    const hint=document.querySelector('.hintnote').textContent;
    return `  ${t}\n    ${lead}\n    tiers: ${q}\n    hint: ${hint}`;
  }));
}

L('\n--- review boxes maths ---');
await p.locator('#tabs .tab',{hasText:'Mason Jars'}).first().click(); await p.waitForTimeout(300);
await pickSize(0);
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(120);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
await p.locator('#tabs .tab',{hasText:'Coffee Sleeves'}).first().click(); await p.waitForTimeout(300);
await pickSize(0);
await p.locator('.qtys button').nth(1).click(); await p.waitForTimeout(120);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
await p.locator('#toB2').click(); await p.waitForTimeout(400);
L(await p.evaluate(()=>Array.from(document.querySelectorAll('.rline:not(.rline--extra)')).map(r=>
  '  '+r.querySelector('.nm').textContent.trim()+' | '+Array.from(r.querySelectorAll('.cases')).map(c=>c.textContent).join(', ')+' | '+r.querySelector('.mt').textContent).join('\n')));
L('\n--- G2 clash with a 4-6 week jar ---');
await p.locator('#toB3').click(); await p.waitForTimeout(300);
for (const ans of ['2–3 weeks','About a month','2–3 months']) {
  await p.locator('#qBlock .qitem').first().locator('.chip',{hasText:ans}).click(); await p.waitForTimeout(300);
  L(`  ${ans.padEnd(15)} → ${await p.evaluate(()=>document.querySelector('.qverdict').textContent)}`);
}
L('\nerrors:',errs.length?errs:'none');
await b.close();
