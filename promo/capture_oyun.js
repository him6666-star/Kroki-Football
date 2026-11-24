const {chromium}=require('playwright');
const lang=process.argv[2],N=+process.argv[3],out='/tmp/vid/g_'+lang;require('fs').mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},locale:lang=='tr'?'tr-TR':'en-US'});const er=[];p.on('pageerror',e=>er.push(e.message));await p.route(/^https?:/,r=>r.abort());
await p.addInitScript(()=>{let q=[],T=1000;window.requestAnimationFrame=f=>{q.push(f);return q.length};window.__step=(n)=>{for(let i=0;i<n;i++){T+=1000/30;const c=q;q=[];c.forEach(f=>{try{f(T)}catch(e){}})}};Math.random=(()=>{let s=12345;return()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}})();});
await p.goto('file:///home/claude/kroki-football/www/index.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(1500);
await p.evaluate((lang)=>{ST.lang=lang;ST.touch='on';ST.gfx='high';ST.team='lion';document.documentElement.lang=lang;QS.tut=9;QS.tutAsk=1;QS.inv={s_fire:9,s_ice:9,s_ufo:9,s_spd:9,s_wall:9,s_mag:9,s_slo:9,s_aim:9};const st=document.createElement('style');st.textContent='#tc,#toast,#fs,#cb,#cm,#cp,#mt,#pz,#sps,#sk{display:none!important}';document.head.appendChild(st);menu();go(1,'medium');},lang);
await p.evaluate(()=>__step(60));
await p.evaluate(()=>{ctl[0]=null;state='play';});
const log=[];const TR={300:'skUfoBtn()',700:'skIce()',1000:'skSpd()',1150:'skFire()'};
for(let i=0;i<N;i++){
 const ev=await p.evaluate(([i,t])=>{if(t)try{eval(t)}catch(e){}__step(1);return [score[0],score[1],state,Math.round(ball.x),Math.round(ball.y),msg2t>0?1:0]},[i,TR[i]||'']);
 log.push(ev.join(','));
 await p.screenshot({path:`${out}/${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:90});
}
require('fs').writeFileSync(out+'/log.txt',log.join('\n'));console.log(lang,er.slice(0,3),log[log.length-1]);await b.close()})()
