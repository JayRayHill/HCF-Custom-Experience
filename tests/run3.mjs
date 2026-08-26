import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = 'file://' + new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(700);
const L=(...a)=>console.log(...a);

L('--- B3/B4 at 390px ---');
L('tabs all visible?', await page.evaluate(()=>{const t=document.querySelector('#tabs'),r=t.getBoundingClientRect();return Array.from(t.children).map(c=>{const b=c.getBoundingClientRect();return c.textContent+(b.right<=r.right+1&&b.left>=r.left-1?'':' [CUT]');}).join(' | ');}));
L('step rail:', await page.evaluate(()=>{const r=document.querySelector('#stepRail'),rr=r.getBoundingClientRect();return Array.from(r.children).map(c=>{const b=c.getBoundingClientRect();return c.textContent.replace(/\s+/g,'')+(b.right>rr.right+1?' [CUT]':'');}).join(' | ');}));
L('mobar hidden at start (B6)?', await page.evaluate(()=>document.querySelector('#mobar').hidden));
L('page width:', await page.evaluate(()=>document.documentElement.scrollWidth+'/'+document.documentElement.clientWidth));

L('\n--- B1: does tapping a tile show anything now? ---');
await page.locator('.tile').nth(0).click(); await page.waitForTimeout(900);
L(await page.evaluate(()=>{const c=document.querySelector('.config'),r=c.getBoundingClientRect();const s=document.querySelector('.sizes');const sr=s?s.getBoundingClientRect():null;const bar=document.querySelector('#mobar');const fold=window.innerHeight-(bar&&!bar.hidden?bar.offsetHeight:0);
return `scrollY=${Math.round(window.scrollY)} (page moved? ${window.scrollY>0?'YES':'NO'})\nconfig top=${Math.round(r.top)} fold=${Math.round(fold)}\nSIZE chips top=${sr?Math.round(sr.top):'n/a'} → ${sr&&sr.top<fold&&sr.top>0?'VISIBLE':'not visible'}`;}));

L('\n--- B5 tap targets at 390px ---');
await page.locator('.sizes button').nth(1).click(); await page.waitForTimeout(150);
await page.locator('.qtys button').nth(2).click(); await page.waitForTimeout(150);
await page.locator('.qtys button').nth(3).click(); await page.waitForTimeout(150);
await page.locator('.lidrow input').check(); await page.waitForTimeout(150);
await page.locator('.config-foot .btn--primary').click(); await page.waitForTimeout(400);
L('mobar now?', await page.evaluate(()=>{const m=document.querySelector('#mobar');return m.hidden?'hidden':m.textContent.replace(/\s+/g,' ').trim();}));
await page.locator('#moNext').click(); await page.waitForTimeout(400);
L('review small targets:', await page.evaluate(()=>{const out=[];document.querySelectorAll('#s-b2 button, #s-b2 input').forEach(el=>{const r=el.getBoundingClientRect();if(r.width>0&&(r.width<44||r.height<44))out.push((el.textContent||el.getAttribute('aria-label')||'?').trim().slice(0,24)+' '+Math.round(r.width)+'x'+Math.round(r.height));});return out.length?out.join(' | '):'all >= 44 high';}));
L('lids in review (E2):', await page.evaluate(()=>Array.from(document.querySelectorAll('.rline--extra .nm')).map(e=>e.textContent).join(' | ')||'(none)'));

L('\n--- overflow sweep, all screens ---');
async function sweep(tag){const rows=[];for(const w of [360,390,414,480,600,768,900,1024,1180,1440]){await page.setViewportSize({width:w,height:844});await page.waitForTimeout(180);
const r=await page.evaluate(()=>{const de=document.documentElement;const bad=[];document.querySelectorAll('main *, header *, nav *, footer *').forEach(el=>{const bb=el.getBoundingClientRect();if(bb.width>0&&bb.right>de.clientWidth+1&&getComputedStyle(el).position!=='fixed')bad.push(el.tagName.toLowerCase()+'.'+String(el.className).slice(0,20));});return {vw:de.clientWidth,sw:de.scrollWidth,bad:bad.slice(0,3),n:bad.length};});
rows.push(`${String(w).padStart(4)} ${r.sw>r.vw?'OVERFLOW x'+r.n+' '+r.bad.join(','):'ok'}`);}
console.log(tag+': '+rows.join(' | '));}
await sweep('b2');
await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(200);
await page.locator('#toB3').click(); await page.waitForTimeout(300); await sweep('b3');
await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(200);
await page.locator('#qBlock .qitem').first().locator('.chip').first().click(); await page.waitForTimeout(200);
await page.locator('#toB4').click(); await page.waitForTimeout(300); await sweep('b4');
await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(200);
await page.locator('#backB3').click(); await page.waitForTimeout(200);
await page.locator('#backB2').click(); await page.waitForTimeout(200);
await page.locator('#backB1').click(); await page.waitForTimeout(300); await sweep('b1');
L('\nERRORS:', errs.length?errs:'none');
await b.close();
