const {chromium}=require('playwright');
const lang=process.argv[2],mo='/tmp/vid/m_'+lang;require('fs').mkdirSync(mo,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:960,height:540},deviceScaleFactor:2,locale:lang=='tr'?'tr-TR':'en-US'});await p.route(/^https?:/,r=>r.abort());
await p.goto('file:///home/claude/kroki-football/www/index.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(1500);
await p.evaluate((lang)=>{ST.lang=lang;ST.touch='on';ST.team='lion';document.documentElement.lang=lang;QS.tut=9;QS.tutAsk=1;QS.lv=7;QS.xp=40;QS.pts=860;QS.st=4;const st=document.createElement('style');st.textContent='#toast{display:none!important}';document.head.appendChild(st);},lang);
const M=[['menu','menu()'],['team',"menu();playUI();document.querySelectorAll('.spL > *')[1].click()"],['diff','menu();playUI()'],['shop',"menu();SHT='ball';shopUI()"],['wheel','menu();wheelUI()'],['badges','menu();badgeUI()']];
for(const [n,c] of M){await p.evaluate(c);await p.waitForTimeout(500);await p.screenshot({path:`${mo}/${n}.jpg`,type:'jpeg',quality:92})}
await b.close()})()
