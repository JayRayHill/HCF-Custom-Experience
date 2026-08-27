import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../../handoff/preview.html', import.meta.url).pathname;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(700);
const txt = await p.evaluate(()=>document.body.innerText);
const pass=[], fail=[];
const chk=(id,cond,note)=>{(cond?pass:fail).push(id+(note?' — '+note:''));};

chk('A1 photo tool not reachable', !(await p.evaluate(()=>!!document.querySelector('#photoBtn'))));
chk('B6 tel: link', await p.evaluate(()=>{const a=document.querySelector('.announce .tel');return a&&a.tagName==='A'&&a.href.startsWith('tel:');}));
chk('B6 mobile hours present', await p.evaluate(()=>!!document.querySelector('.hrs-short')));
chk('B6 bar hidden at zero', await p.evaluate(()=>document.querySelector('#mobar').hidden));
chk('C1 payoff in subhead', txt.includes("we'll email your price, usually within one business day"));
chk('C4 why-no-price on b2', await p.evaluate(()=>document.querySelectorAll('.whynoprice').length>=2));
chk('C5 footer', await p.evaluate(()=>!!document.querySelector('.site-foot a[href^="tel:"]')));
chk('C5 privacy line', txt.includes('no marketing emails unless you ask') || (await p.evaluate(()=>document.querySelector('#s-b4').innerText.includes('never share your details'))));
chk('C7 hours vs same-day', await p.evaluate(()=>document.querySelector('#s-b4').innerText.includes('anything sent after Thursday comes back Monday')));
chk('E1 tabs lede (empty state)', txt.includes('EVERYTHING WE PRINT'));
  chk('no em dashes in copy', !txt.includes('\u2014'));
  chk('numeric ranges intact', txt.includes('4\u20136 weeks'));
chk('E3 note field', await p.evaluate(()=>!!document.querySelector('#qNote')));
chk('E4 sample on screen one', txt.includes('Get a free sample box first'));
chk('E5 all-products default', await p.evaluate(()=>document.querySelector('#tabs .tab').textContent==='All products'&&document.querySelector('#tabs .tab').getAttribute('aria-pressed')==='true'));
chk('E5 six tiles', (await p.locator('#tiles .tile').count())===6);
chk('F1 blurbs on every tile', (await p.locator('.tile .blurb').count())===6);
chk('H2 noun on minimum', txt.includes('5,000 cups') && txt.includes('1,029 jars') && txt.includes('5,000 sleeves'));
chk('H2 minimum on the tile', txt.includes('MINIMUM ORDER') && txt.includes('per size'));
chk('H3 plain-word lead', txt.includes('4–6 weeks') && txt.includes('from design approval') && !/\bwk\b/.test(txt));
chk('F3 cold cups merged', await p.evaluate(()=>{const t=Array.from(document.querySelectorAll('#tabs .tab')).map(x=>x.textContent);return t.includes('Cold Cups')&&!t.includes('PET Cold Cups');}));
chk('F5 sleeves reachable', await p.evaluate(()=>{
  const t=Array.from(document.querySelectorAll('#tabs .tab')).find(x=>x.textContent==='Coffee Sleeves'); t.click(); return true;}));
await p.waitForTimeout(400);
chk('C1 one sleeve size means no size step', await p.evaluate(()=>!document.querySelector('.config .sizes')));
chk('C1 and the divider goes with it', await p.evaluate(()=>!!document.querySelector('.config-fields--single')));
chk('C1 sleeve case size is 1,000', await p.evaluate(()=>document.querySelector('.hintnote').textContent.includes('cases of 1,000')));
chk('F5 8oz caveat', await p.evaluate(()=>document.querySelector('.infoline').innerText.includes('Nothing we make fits the 8 oz')));
chk('E5 single-item tile row hidden', await p.evaluate(()=>document.querySelector('#tiles').hidden));
// open a cup and check chips
await p.evaluate(()=>Array.from(document.querySelectorAll('#tabs .tab')).find(x=>x.textContent==='Coffee Cups').click());
await p.waitForTimeout(400);
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(400);
chk('F2 no week-spans on quantity chips', await p.evaluate(()=>!/WEEK|MONTH/i.test(document.querySelector('.qtys').innerText)));
chk('F2 minimum stated by the label', await p.evaluate(()=>document.querySelector('.hintnote').textContent.includes('Minimum 5,000')));
chk('F2 not-sure chip', await p.evaluate(()=>!!document.querySelector('.qty--unsure')));
chk('E2 lid checkbox', await p.evaluate(()=>!!document.querySelector('.lidrow input')));
chk('H1 case defined at point of use', await p.evaluate(()=>{
  document.querySelectorAll('.sizes button')[0].click(); return true;}) && await (async()=>{await p.waitForTimeout(200);
  return p.evaluate(()=>document.querySelector('.hintnote').textContent.includes('cases of 1,000'));})());
chk('C2 case size follows the size, not the family', await (async()=>{
  await pickSize(4);   // 20 oz single wall
  return p.evaluate(()=>document.querySelector('.hintnote').textContent.includes('cases of 500'));})());
chk('C3 savings badges on the upper tiers only', await p.evaluate(()=>{
  const b=[...document.querySelectorAll('.qtys .qty')].filter(x=>!x.classList.contains('qty--unsure'));
  const saves=b.map(x=>{const s=x.querySelector('.save');return s?s.textContent:null;});
  return saves.length===4 && saves[0]===null
    && saves[1]==='save about 17%' && saves[2]==='save about 35%' && saves[3]==='save about 43%';}));
chk('C3 no dollar figure anywhere on the chips', await p.evaluate(()=>!/[$£€]/.test(document.querySelector('.qtys').innerText)));
chk('C4 six single wall sizes', await p.evaluate(()=>document.querySelectorAll('.sizes button').length===6));
chk('F4 compare hint at one qty', await (async()=>{await pickSize(1);await p.locator('.qtys button').nth(2).click();await p.waitForTimeout(200);return p.evaluate(()=>document.querySelector('.foothint').innerText.includes("Tap another and we'll price both"));})());
chk('H5 on-quote mark keeps chips level', await (async()=>{await p.locator('.config-foot .btn--primary').click();await p.waitForTimeout(350);await pickSize(1);return p.evaluate(()=>{const h=Array.from(document.querySelectorAll('.sizes button,.qtys button')).map(e=>Math.round(e.getBoundingClientRect().height));const onq=document.querySelectorAll('.sizes .onq').length;return onq===1 && new Set(h).size===1;});})());
chk('G1 tally not a unit total', await p.evaluate(()=>{const t=document.querySelector('#tally').textContent;return /quantit(y|ies) to price/.test(t)&&!/units/.test(t);}));
console.log('PASS ('+pass.length+'):'); pass.forEach(x=>console.log('  ✓ '+x));
if(fail.length){console.log('\nFAIL ('+fail.length+'):');fail.forEach(x=>console.log('  ✗ '+x));}
console.log('\nerrors:',errs.length?errs:'none');
await b.close();
