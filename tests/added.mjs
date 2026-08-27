import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const pass=[],fail=[]; const chk=(id,c,n)=>{(c?pass:fail).push(id+(n?' — '+n:''));};
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(500);

/* The confirmation panel after an add must appear for every family, including
   the two that come in one size and therefore render no size step. */
for (const [tab, label] of [['Coffee Cups','multi-size'], ['Coffee Sleeves','one size'], ['Mason Jars','one size']]) {
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}; history.replaceState(null,'',location.pathname);});
  await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(500);
  await p.locator('#tabs .tab',{hasText:tab}).click(); await p.waitForTimeout(400);
  if (await p.locator('#tiles .tile').count()) { await p.locator('#tiles .tile').nth(0).click(); await p.waitForTimeout(300); }
  if (await p.locator('.sizes button').count()) { await p.locator('.sizes button').nth(0).click(); await p.waitForTimeout(150); }
  await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(150);
  await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(450);
  chk(`${tab} (${label}): the added panel shows`, await p.evaluate(()=>!!document.querySelector('.added')));
  chk(`${tab}: it names what was added`, await p.evaluate(()=>{
    const e=document.querySelector('.added__line'); return !!e && /^Added: /.test(e.textContent);}));
  chk(`${tab}: it offers the other categories`, await p.evaluate(()=>document.querySelectorAll('.added__pills .tab').length>0));
  /* and the one-size families still skip the size step itself */
  if (label==='one size') chk(`${tab}: still no size step`, await p.evaluate(()=>!document.querySelector('.config .sizes')));
}
console.log('\n--- the added panel, every family ---');
pass.forEach(x=>console.log('  ✓ '+x)); fail.forEach(x=>console.log('  ✗ '+x));
console.log('\nerrors:', errs.length?errs:'none');
console.log(pass.length+'/'+(pass.length+fail.length));
await b.close();
process.exit(fail.length?1:0);
