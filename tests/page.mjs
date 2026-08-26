import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1590,height:1000},deviceScaleFactor:1.5});
const p=await ctx.newPage();
await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(700);
await p.screenshot({path:'shots/v8-page.png'});
console.log(await p.evaluate(()=>{
  const r=document.querySelector('.rail').getBoundingClientRect();
  const t=document.querySelector('#tiles').getBoundingClientRect();
  return `rail ${Math.round(r.width)}x${Math.round(r.height)} top=${Math.round(r.top)} | tiles block ${Math.round(t.width)}x${Math.round(t.height)}`;
}));
await b.close();
