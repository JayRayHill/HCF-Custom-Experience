import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
const pass=[],fail=[]; const chk=(id,c,n)=>{(c?pass:fail).push(id+(n?' — '+n:''));};
const hash=()=>p.evaluate(()=>location.hash);
const vis=s=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.closest('.screen[hidden]')&&e.offsetParent!==null;},s);

// build a quote: first product, first size, first qty, add
await p.click('.tile');
await p.click('.config .sizebtn, .config [data-size]').catch(()=>{});
await p.evaluate(()=>{const b=[...document.querySelectorAll('.config button')].find(b=>/oz|Fits/.test(b.textContent));if(b)b.click();});
await p.waitForTimeout(200);
await p.evaluate(()=>{const b=[...document.querySelectorAll('.config button')].find(b=>/^[\d,]+$/.test(b.textContent.trim()));if(b)b.click();});
await p.waitForTimeout(200);
await p.evaluate(()=>{const b=[...document.querySelectorAll('.config button')].find(b=>/Add to my quote|Add /.test(b.textContent));if(b)b.click();});
await p.waitForTimeout(300);
chk('setup: a line is on the quote', await p.evaluate(()=>document.querySelectorAll('.rail-body .rline, .rail-body > *').length>0));

await p.click('#toB2'); await p.waitForTimeout(300);
chk('B2 back control is visible', await vis('#backB1'));
chk('B2 back names its destination', (await p.textContent('#backB1')).trim()==='Back to products');
await p.click('#toB3'); await p.waitForTimeout(300);
await p.evaluate(()=>{const b=[...document.querySelectorAll('.qitem button')].find(b=>/weeks|month/.test(b.textContent));if(b)b.click();});
await p.waitForTimeout(200);
await p.click('#toB4'); await p.waitForTimeout(300);
chk('B4 reached', await hash()==='#b4');

// the core fix: in-page Back pops the stack, it does not push a new entry
await p.click('#backB3'); await p.waitForTimeout(400);
chk('header Back lands on B3', await hash()==='#b3');
await p.click('#backB2'); await p.waitForTimeout(400);
chk('header Back lands on B2', await hash()==='#b2');
await p.goForward(); await p.waitForTimeout(400);
chk('browser Forward still works after in-page Back', await hash()==='#b3', 'got '+await hash());
await p.goBack(); await p.waitForTimeout(400);
chk('browser Back agrees with in-page Back', await hash()==='#b2', 'got '+await hash());
await p.goBack(); await p.waitForTimeout(400);
chk('one more Back reaches B1, not a repeat of B2', await hash()==='#b1', 'got '+await hash());

// step rail
await p.click('#toB2'); await p.waitForTimeout(300);
await p.click('#toB3'); await p.waitForTimeout(300);
const steps = await p.evaluate(()=>[...document.querySelectorAll('#stepRail .step')].map(e=>e.tagName+':'+e.dataset.state));
chk('finished steps are buttons', steps.filter(s=>s.startsWith('BUTTON')).length===2, steps.join(' '));
chk('current and future steps are not', steps.filter(s=>s.startsWith('DIV')).length===2, steps.join(' '));
chk('current step is marked for AT', await p.evaluate(()=>!!document.querySelector('#stepRail [aria-current="step"]')));
await p.evaluate(()=>document.querySelectorAll('#stepRail button.step')[0].click());
await p.waitForTimeout(400);
chk('clicking step 1 goes to B1', await hash()==='#b1', 'got '+await hash());
await p.goForward(); await p.waitForTimeout(400);
chk('step-rail jump left history intact', await hash()==='#b2', 'got '+await hash());

// tap targets
const small = await p.evaluate(()=>{
  const bad=[]; document.querySelectorAll('.backlink, #stepRail .step').forEach(e=>{
    const r=e.getBoundingClientRect(); if(r.height>0&&r.height<44) bad.push(e.className+' '+Math.round(r.height));
  }); return bad;
});
chk('back controls are at least 44px tall', small.length===0, small.join(', '));

console.log('\n--- back navigation ---');
pass.forEach(x=>console.log('  ✓ '+x)); fail.forEach(x=>console.log('  ✗ '+x));
console.log('\nerrors:', errs.length?errs:'none');
console.log(pass.length+'/'+(pass.length+fail.length));
await b.close();
process.exit(fail.length?1:0);
