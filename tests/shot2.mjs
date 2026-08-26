import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch();
async function run(tag,vp){
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2}); const p=await ctx.newPage();
  await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(700);
  await p.screenshot({path:`shots/v2-${tag}-01.png`,fullPage:tag==='d'});
  await p.locator('.tile').nth(0).click(); await p.waitForTimeout(800);
  await p.locator('.sizes button').nth(1).click(); await p.waitForTimeout(150);
  await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(150);
  await p.locator('.qtys button').nth(3).click(); await p.waitForTimeout(200);
  await p.screenshot({path:`shots/v2-${tag}-02.png`,fullPage:tag==='d'});
  await p.locator('.lidrow input').check(); await p.waitForTimeout(120);
  await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(500);
  await p.screenshot({path:`shots/v2-${tag}-03.png`,fullPage:tag==='d'});
  await p.locator('#toB2').click().catch(async()=>{await p.locator('#moNext').click();}); await p.waitForTimeout(400);
  await p.screenshot({path:`shots/v2-${tag}-04.png`,fullPage:true});
  await p.locator('#toB3').click(); await p.waitForTimeout(300);
  await p.locator('#qBlock .qitem').first().locator('.chip').first().click(); await p.waitForTimeout(400);
  await p.screenshot({path:`shots/v2-${tag}-05.png`,fullPage:true});
  await ctx.close();
}
await run('d',{width:1440,height:900});
await run('m',{width:390,height:844});
await b.close(); console.log('done');
