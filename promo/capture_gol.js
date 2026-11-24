const {chromium}=require('playwright');
const lang=process.argv[2],out='/tmp/vid/h_'+lang,mo='/tmp/vid/m_'+lang;const fs=require('fs');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(mo,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},locale:lang=='tr'?'tr-TR':'en-US'});const er=[];p.on('pageerror',e=>er.push(e.message));await p.route(/^https?:/,r=>r.abort());
await p.addInitScript(()=>{let q=[],T=1000;window.requestAnimationFrame=f=>{q.push(f);return q.length};window.__step=(n)=>{for(let i=0;i<n;i++){T+=1000/30;const c=q;q=[];c.forEach(f=>{try{f(T)}catch(e){}})}};});
await p.goto('file:///home/claude/kroki-football/www/index.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(1500);
await p.evaluate((lang)=>{ST.lang=lang;ST.touch='on';ST.gfx='high';ST.team='lion';document.documentElement.lang=lang;QS.tut=9;QS.tutAsk=1;QS.lv=7;QS.xp=40;QS.pts=860;QS.st=4;const st=document.createElement('style');st.textContent='#tc,#toast,#fs,#cb,#cm,#cp,#mt,#pz,#sps,#sk{display:none!important}';document.head.appendChild(st);},lang);
// menu stills
const M0=[['menu','menu()'],['team',"menu();playUI();document.querySelectorAll('.spL > *')[1].click()"],['diff','menu();playUI()'],['shop','menu();shopUI()'],['career','menu();seasonUI()'],['badges','menu();badgeUI()']];
for(const [n,c] of M0){await p.evaluate(c);await p.evaluate(()=>__step(20));await p.screenshot({path:`${mo}/${n}.jpg`,type:'jpeg',quality:92})}
// goal attempt loop
let got=false;
for(let tries=0;tries<12&&!got;tries++){
 await p.evaluate(()=>{menu();go(1,'medium');__step(40);ctl[0]=null;state='play';ko=null;restart=null});
 await p.evaluate(()=>{const s=P.filter(q=>q.t==0&&q.i>0)[2]||P[3];s.x=PX+PW-260;s.y=PY+PH/2-40;ball.x=s.x+16;ball.y=s.y;ball.vx=ball.vy=0;ball.car=s;P.filter(q=>q.t==1&&q.i>0).forEach((q,k)=>{q.x=PX+PW/2-60;q.y=PY+80+k*90})});
 for(let i=0;i<14;i++){await p.evaluate(()=>__step(1));await p.screenshot({path:`${out}/t${tries}_pre${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:90})}
 await p.evaluate(()=>{const s=ball.car||P[3];const gk=P.find(q=>q.t==1&&q.i==0);if(gk){gk.y=PY+PH/2+95}ball.car=null;kick(s,1,-0.18,1000,0)});
 const fr=[];let gi=-1;
 for(let i=0;i<220;i++){const sc=await p.evaluate(()=>{__step(1);return score[0]+score[1]});const f=`${out}/t${tries}_${String(i).padStart(4,'0')}.jpg`;await p.screenshot({path:f,type:'jpeg',quality:90});fr.push(f);if(sc>0&&gi<0)gi=i;if(gi>=0&&i-gi>=75){got=true;break}}
 if(!got)fr.forEach(f=>fs.unlinkSync(f));else fs.writeFileSync(out+'/goal.txt',tries+','+gi);
}
console.log(lang,got,er.slice(0,3));await b.close()})()
