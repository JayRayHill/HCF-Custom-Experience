import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch();
for (const w of [768,900,1024,1180,1280,1440,1600,1920]) {
  const ctx=await b.newContext({viewport:{width:w,height:1000},deviceScaleFactor:1.5});
  const p=await ctx.newPage();
  await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
  const r = await p.evaluate(()=>{
    const de=document.documentElement;
    const c=document.querySelector('#s-b1').getBoundingClientRect();
    const t=document.querySelector('#tiles');
    const tile=document.querySelector('.tile').getBoundingClientRect();
    const rail=document.querySelector('.rail').getBoundingClientRect();
    const bad=[];document.querySelectorAll('main *, header *, footer *').forEach(el=>{const bb=el.getBoundingClientRect();if(bb.width>0&&bb.right>de.clientWidth+1&&getComputedStyle(el).position!=='fixed')bad.push(el.tagName);});
    return {vw:de.clientWidth, scrollW:de.scrollWidth, container:Math.round(c.width),
      cols:getComputedStyle(t).gridTemplateColumns.split(' ').length,
      tileW:Math.round(tile.width), railW:Math.round(rail.width), overflow:bad.length};
  });
  console.log(String(w).padStart(5), JSON.stringify(r));
  if (w===1600) { await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:'shots/v5-1600.png'}); }
  await ctx.close();
}
await b.close();
