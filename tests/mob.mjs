import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(700);
// double wall + a cold cup with lids
await p.locator('#tabs .tab',{hasText:'Coffee Cups'}).first().click(); await p.waitForTimeout(300);
await p.locator('.tile').nth(1).click(); await p.waitForTimeout(400);
await pickSize(0);
await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(120);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
await p.locator('#tabs .tab',{hasText:'Cold Cups'}).first().click(); await p.waitForTimeout(300);
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(300);
await pickSize(1);
await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(120);
await p.locator('.lidrow input').check(); await p.waitForTimeout(150);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
await p.locator('#moNext').click(); await p.waitForTimeout(500);
await p.screenshot({path:'shots/m1-review.png', fullPage:true});
console.log(await p.evaluate(()=>{
  const de=document.documentElement, out=[];
  const rv=document.querySelector('.review').getBoundingClientRect();
  out.push(`viewport=${de.clientWidth}  review card: left=${Math.round(rv.left)} right=${Math.round(de.clientWidth-rv.right)}`);
  const st=document.querySelector('.stepper');
  if(st){const r=st.getBoundingClientRect();const row=st.parentElement.getBoundingClientRect();
    out.push(`stepper ${Math.round(r.width)}x${Math.round(r.height)} right=${Math.round(r.right)} | row right=${Math.round(row.right)} ${r.right>row.right?'CLIPPED':'ok'}`);}
  const ex=document.querySelector('.rline--extra');
  if(ex){const r=ex.getBoundingClientRect();
    out.push(`lid row: ${Math.round(r.width)}x${Math.round(r.height)}  cols=${getComputedStyle(ex).gridTemplateColumns}`);
    out.push(`  nm width=${Math.round(ex.querySelector('.nm').getBoundingClientRect().width)}  text="${ex.querySelector('.mt').textContent}"`);}
  const over=[];document.querySelectorAll('#s-b2 *').forEach(el=>{const bb=el.getBoundingClientRect();if(bb.width>0&&bb.right>de.clientWidth+1)over.push(el.className);});
  out.push('overflowing: '+(over.length?over.slice(0,4).join(' | '):'none'));
  return out.join('\n');
}));
console.log('errors:',errs.length?errs:'none');
await b.close();
