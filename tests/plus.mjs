import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}});
const p=await ctx.newPage();
const pickSize = async (n) => {
  /* Sleeves and jars come in one size, so there is no size row to click. */
  if (await p.locator('.sizes button').count() === 0) return;
  await p.locator('.sizes button').nth(n).click(); await p.waitForTimeout(150);
};
await p.goto('file://'+new URL('../prototype/hcf-builder.html', import.meta.url).pathname,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(700);
await p.locator('.tile').nth(0).click(); await p.waitForTimeout(350);
await pickSize(1);
await p.locator('.qtys button').nth(0).click(); await p.waitForTimeout(120);
await p.locator('.config-foot .btn--primary').click(); await p.waitForTimeout(300);
await p.locator('#moNext').click(); await p.waitForTimeout(500);
console.log(await p.evaluate(()=>{
  const st=document.querySelector('.stepper'); const r=st.getBoundingClientRect();
  const kids=Array.from(st.children).map(c=>{const k=c.getBoundingClientRect();
    return `    ${(c.textContent||c.value||'?').trim().slice(0,7).padEnd(8)} ${Math.round(k.width)}x${Math.round(k.height)} left=${Math.round(k.left-r.left)} ${k.right>r.right+0.5?'*** CLIPPED ***':'visible'}`;});
  const main=st.closest('.rmain').getBoundingClientRect();
  const line=st.closest('.rline').getBoundingClientRect();
  const need=Array.from(st.children).reduce((a,c)=>a+c.getBoundingClientRect().width,0);
  return `viewport 375\n  .rline  ${Math.round(line.width)}px   cols=${getComputedStyle(st.closest('.rline')).gridTemplateColumns}\n`+
         `  .rmain  ${Math.round(main.width)}px\n  .stepper ${Math.round(r.width)}px (children need ${Math.round(need)}px) overflow=${getComputedStyle(st).overflow}\n`+kids.join('\n');
}));
await b.close();
