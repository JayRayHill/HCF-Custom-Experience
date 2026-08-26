import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:1000}});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
const st = async (t)=>console.log(' ', t.padEnd(12), await p.evaluate(()=>{
  const f=document.querySelector('#railFoot'), r=document.querySelector('#railReady'), a=document.querySelector('#railAlt');
  const bg=getComputedStyle(f).backgroundColor;
  return `greyBase=${!f.hidden} bg=${bg} | ready=${!r.hidden} alt=${!a.hidden} | count=${document.querySelector('#railCount').hidden?'hidden':'shown'}`;
}));
await st('empty');
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(300);
await pickSize(1);
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(120);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(350);
await st('one line');
console.log('  sample link still wired:', await p.evaluate(()=>!!document.querySelector('#sampleRail')));
await p.locator('.line .rm-btn').click(); await p.waitForTimeout(350);
await st('back to empty');
p.on('dialog', d=>d.dismiss());
await p.locator('#sampleRail').click({timeout:3000}).catch(e=>console.log('  sample click FAILED'));
await p.waitForTimeout(300);
console.log('  errors:', errs.length?errs:'none');
await b.close();
