import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(400);
const dims = async () => p.evaluate(()=>{
  const f = els => Array.from(els).map(e=>{const r=e.getBoundingClientRect();return e.innerText.replace(/\n/g,'/')+' '+Math.round(r.width)+'x'+Math.round(r.height);});
  return { sizes: f(document.querySelectorAll('.sizes button')), qtys: f(document.querySelectorAll('.qtys button')),
           hint: document.querySelector('.hintnote').textContent };
});
console.log('BEFORE any selection:'); console.log(JSON.stringify(await dims(),null,1));
await p.locator('.sizes button').nth(1).click(); await p.waitForTimeout(150);
await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(150);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(400);
await p.locator('.sizes button').nth(1).click(); await p.waitForTimeout(300);
console.log('\nAFTER adding 12 oz (chip heights must still match):');
console.log(JSON.stringify(await dims(),null,1));
console.log('aria on the on-quote chip:', await p.evaluate(()=>document.querySelectorAll('.sizes button')[1].getAttribute('aria-label')));
await p.evaluate(()=>{window.scrollTo(0,document.querySelector('.config').offsetTop-90);});
await p.waitForTimeout(300);
await p.locator('.config').screenshot({path:'shots/v3-config.png'});
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(200);
await p.locator('#s-b1 .screen-head').screenshot({path:'shots/v3-head.png'});
await p.locator('.tile').first().screenshot({path:'shots/v3-tile.png'});
console.log('errors:',errs.length?errs:'none');
await b.close();
