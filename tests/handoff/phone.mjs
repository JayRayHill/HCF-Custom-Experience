import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url='file://'+new URL('../../handoff/preview.html', import.meta.url).pathname;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
const pass=[],fail=[]; const chk=(id,c,n)=>{(c?pass:fail).push(id+(n?' — '+n:''));};
await p.goto(url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(400);

/* goto() from #b5 back to the bare URL is a same-document fragment change, so
   it never fires a load event and waitUntil hangs. Reload instead. */
const toB4 = async () => {
  await p.evaluate(()=>{ try{localStorage.clear();}catch(e){} history.replaceState(null,'',location.pathname); });
  await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
  await p.locator('.tile').nth(0).click(); await p.waitForTimeout(250);
  await pickSize(1);
  await p.locator('.qtys button').nth(2).click(); await p.waitForTimeout(120);
  await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
  await p.locator('#toB2').click(); await p.waitForTimeout(300);
  await p.locator('#toB3').click(); await p.waitForTimeout(300);
  await p.evaluate(()=>{const b=[...document.querySelectorAll('.qitem button')].find(b=>/weeks|month/.test(b.textContent));if(b)b.click();});
  await p.waitForTimeout(150);
  await p.locator('#toB4').click(); await p.waitForTimeout(300);
};
const submit = async (phone) => {
  await p.fill('#f-name','Jay Hill'); await p.fill('#f-biz','Hot Cup Factory');
  await p.fill('#f-email','jay@example.com'); await p.fill('#f-phone', phone);
  await p.locator('#sendBtn').click(); await p.waitForTimeout(400);
  return p.evaluate(()=>location.hash);
};

await toB4();
chk('label says Required', (await p.textContent('#s-b4 label[for="f-phone"]')).includes('Required'));
chk('no Optional tag left on the form', await p.evaluate(()=>!document.querySelector('#s-b4 .opt')));
chk('an error slot exists', await p.evaluate(()=>!!document.querySelector('#e-phone')));

// blank is now blocked
await submit('');
chk('blank phone blocks the send', await p.evaluate(()=>location.hash)==='#b4');
chk('the phone error is shown', await p.evaluate(()=>{const e=document.querySelector('#e-phone');return !!e&&!e.hidden&&e.textContent.length>0;}));
chk('the field is marked bad', await p.evaluate(()=>document.querySelector('#f-phone').classList.contains('input--bad')));
chk('the gate counts it', (await p.textContent('#formGate')).match(/One thing missing/)!==null, await p.textContent('#formGate'));

// junk is blocked, and blocked differently from blank
await p.fill('#f-phone','12345'); await p.locator('#sendBtn').click(); await p.waitForTimeout(400);
chk('too-few digits blocked', await p.evaluate(()=>location.hash)==='#b4');
chk('and told why', (await p.textContent('#e-phone')).includes('Ten digits'), await p.textContent('#e-phone'));

// the shapes real people type all pass
for (const [label, v] of [['(480) 428-1999','(480) 428-1999'],['480.428.1999','480.428.1999'],
                          ['+1 480 428 1999','+1 480 428 1999'],['4804281999','4804281999']]) {
  await toB4();
  const h = await submit(v);
  chk('accepts '+label, h==='#b5', 'landed on '+h);
}

// and it reaches the confirmation
chk('phone is on the recap', (await p.evaluate(()=>document.body.innerText)).includes('4804281999'));
// email still validated through the same path
await toB4();
await p.fill('#f-name','Jay'); await p.fill('#f-biz','HCF'); await p.fill('#f-email','jane@'); await p.fill('#f-phone','4804281999');
await p.locator('#sendBtn').click(); await p.waitForTimeout(400);
chk('email check still fires', (await p.textContent('#e-email')).includes('email address'));

console.log('\n--- phone required ---');
pass.forEach(x=>console.log('  ✓ '+x)); fail.forEach(x=>console.log('  ✗ '+x));
console.log('\nerrors:', errs.length?errs:'none');
console.log(pass.length+'/'+(pass.length+fail.length));
await b.close();
process.exit(fail.length?1:0);
