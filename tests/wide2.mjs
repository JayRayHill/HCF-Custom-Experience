import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:900}});
const p=await ctx.newPage();
await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
for (const w of [360,390,480,600,700,768,900,1024,1100,1180,1280,1440,1590,1920]) {
  await p.setViewportSize({width:w,height:900}); await p.waitForTimeout(160);
  const r=await p.evaluate(()=>{const de=document.documentElement;const t=document.querySelector('#tiles');
    const tile=document.querySelector('.tile');const bad=[];
    document.querySelectorAll('main *, header *, footer *').forEach(el=>{const bb=el.getBoundingClientRect();if(bb.width>0&&bb.right>de.clientWidth+1&&getComputedStyle(el).position!=='fixed')bad.push(1);});
    return {sw:de.scrollWidth,vw:de.clientWidth,cols:getComputedStyle(t).gridTemplateColumns.split(' ').length,
      tw:tile?Math.round(tile.getBoundingClientRect().width):0,over:bad.length};});
  console.log(String(w).padStart(5), `cols=${r.cols} tile=${r.tw}px  rows=${Math.ceil(6/r.cols)}  ${r.sw>r.vw?'OVERFLOW x'+r.over:'ok'}`);
}
await b.close();
