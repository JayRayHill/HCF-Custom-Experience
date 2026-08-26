import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for (const [w,label] of [[1590,'DESKTOP'],[390,'MOBILE ']]) {
  const ctx=await b.newContext({viewport:{width:w,height:1000}});
  const p=await ctx.newPage();
  await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
  await p.locator('.tile').nth(0).click(); await p.waitForTimeout(350);
  await p.locator('.sizes button').nth(1).click(); await p.waitForTimeout(120);
  await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(120);
  await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(250);
  console.log('\n=== '+label+' ('+w+'px) ===');
  console.log(await p.evaluate(()=>{
    const g=(sel,prop)=>{const e=document.querySelector(sel);if(!e)return sel+' MISSING';
      const c=getComputedStyle(e);return prop.map(x=>c[x]).join(' / ');};
    const unit=getComputedStyle(document.documentElement).getPropertyValue('--space-unit').trim();
    const rows=[
      ['--space-unit', unit],
      ['.container padding', g('.container',['paddingLeft'])],
      ['.screen-head padding', g('#s-b1 .screen-head',['paddingTop','paddingBottom'])],
      ['main padding-bottom', g('main',['paddingBottom'])],
      ['.b1-grid gap', g('.b1-grid',['gap'])],
      ['.tiles gap', g('#tiles',['gap'])],
      ['.config padding', g('.config',['padding'])],
      ['.rail-head padding', g('.rail-head',['padding'])],
      ['.eyebrow margin-btm', g('.eyebrow',['marginBottom'])],
      ['card radius', g('.config',['borderRadius'])],
      ['card shadow', g('.config',['boxShadow'])],
    ];
    return rows.map(([k,v])=>'  '+k.padEnd(22)+v).join('\n');
  }));
  await ctx.close();
}
await b.close();
