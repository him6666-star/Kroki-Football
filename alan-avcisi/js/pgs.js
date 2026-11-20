'use strict';
/* Google Play Oyun Hizmetleri: liderlik tabloları, başarımlar, bulut kayıt.
   Sadece Android uygulamasında çalışır (Capacitor "PlayGames" eklentisi); web'de hiçbir şey yapmaz. */
const PGS_IDS={lb:{hi:'CgkIqPix5_oIEAIQAQ',daily:'CgkIqPix5_oIEAIQAg',stars:'CgkIqPix5_oIEAIQAw'},
  ach:{first:'CgkIqPix5_oIEAIQBA',boss:'CgkIqPix5_oIEAIQBQ',flawless:'CgkIqPix5_oIEAIQBg',p90:'CgkIqPix5_oIEAIQBw',secret:'CgkIqPix5_oIEAIQCA',
  secrets:'CgkIqPix5_oIEAIQCQ',half:'CgkIqPix5_oIEAIQCg',all:'CgkIqPix5_oIEAIQCw',final1:'CgkIqPix5_oIEAIQDA',finals:'CgkIqPix5_oIEAIQDQ',
  stars50:'CgkIqPix5_oIEAIQDg',stars_all:'CgkIqPix5_oIEAIQDw',daily1:'CgkIqPix5_oIEAIQEA',streak7:'CgkIqPix5_oIEAIQEQ',hard:'CgkIqPix5_oIEAIQEg',cells:'CgkIqPix5_oIEAIQEw'}};
const PG=(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.Plugins&&Capacitor.Plugins.PlayGames)||null;
let pgsOn=false,cloudReady=false,cloudT=null;
const pgCall=(fn,arg)=>{if(!PG||!pgsOn)return Promise.resolve(null);try{return PG[fn](arg||{}).catch(()=>null)}catch(e){return Promise.resolve(null)}};
const unlock=k=>pgCall('unlock',{id:PGS_IDS.ach[k]});
const steps=(k,n)=>{if(n>0)pgCall('setSteps',{id:PGS_IDS.ach[k],steps:Math.floor(n)})};
const submit=(k,v)=>{if(v>0)pgCall('submitScore',{id:PGS_IDS.lb[k],score:Math.floor(v)})};

function pgsStars(){return totalStars(BOSSES.length,FINALS.map((f,i)=>1001+i))}
// Kayıttan çıkarılabilen her şeyi gönder (eski ilerleme de sayılsın)
function pgsSync(){
  if(!pgsOn)return;
  const P=SAVE.prog,lv=Object.keys(P).filter(k=>+k<1000&&P[k].done),fin=FINALS.filter((f,i)=>P[1001+i]&&P[1001+i].done).length;
  const secrets=Object.keys(P).filter(k=>P[k].secret).map(k=>bossForLevel(+k).id).filter((v,i,a)=>a.indexOf(v)===i).length;
  if(lv.length)unlock('first');
  if(Object.keys(P).some(k=>P[k].boss))unlock('boss');
  if(Object.keys(P).some(k=>(P[k].stars||0)>=3))unlock('flawless');
  if(secrets)unlock('secret');steps('secrets',secrets);
  steps('half',Math.min(13,lv.length));steps('all',lv.length);
  if(P[1001]&&P[1001].done)unlock('final1');steps('finals',fin);
  const st=pgsStars();steps('stars50',Math.min(50,st));steps('stars_all',st);
  const hid=BOSSES.findIndex(b=>b.id==='hucre')+1;if(P[hid]&&P[hid].boss)unlock('cells');
  if(SAVE.daily){unlock('daily1');steps('streak7',Math.min(7,SAVE.daily.streak||0))}
  submit('hi',SAVE.hi);submit('stars',st);
}

/* --- Bulut kayıt: ilerlemeyi birleştir (hiçbir şey kaybolmasın) --- */
function mergeSave(c){
  if(!c||!c.prog)return false;let ch=false;
  for(const k in c.prog){const a=SAVE.prog[k]||{},b=c.prog[k],n={done:!!(a.done||b.done),boss:!!(a.boss||b.boss),secret:!!(a.secret||b.secret),best:Math.max(a.best||0,b.best||0),stars:Math.max(a.stars||0,b.stars||0)};
    if(JSON.stringify(n)!==JSON.stringify(Object.assign({done:false,boss:false,secret:false,best:0,stars:0},a)))ch=true;SAVE.prog[k]=n}
  if((c.hi||0)>SAVE.hi){SAVE.hi=c.hi;ch=true}
  if(c.daily&&(!SAVE.daily||c.daily.date>SAVE.daily.date||(c.daily.date===SAVE.daily.date&&(c.daily.best||0)>(SAVE.daily.best||0)))){SAVE.daily=Object.assign({},c.daily,{top:Math.max(c.daily.top||0,(SAVE.daily||{}).top||0)});ch=true}
  if(c.seenTut&&!SAVE.seenTut){SAVE.seenTut=1;ch=true}
  return ch;
}
function cloudSave(){
  if(!pgsOn||!cloudReady)return;clearTimeout(cloudT);
  cloudT=setTimeout(()=>pgCall('saveGame',{data:JSON.stringify({v:1,prog:SAVE.prog,hi:SAVE.hi,daily:SAVE.daily,seenTut:SAVE.seenTut,t:Date.now()}),desc:'★ '+pgsStars()}),1500);
}
async function cloudLoad(){
  const r=await pgCall('loadGame');
  try{if(r&&r.data&&mergeSave(JSON.parse(r.data))){_persist();pgsSync();if(state==="menu")refreshMenu()}}catch(e){}
  cloudReady=true;cloudSave();
}

/* --- Oyun olaylarına bağlan --- */
const _persist=persist,_recordClear=recordClear,_recordScore=recordScore,_recordDaily=recordDaily;
persist=function(){_persist();cloudSave()};
recordClear=function(lv,info){
  _recordClear(lv,info);if(!pgsOn)return;
  if(levelDeaths===0)unlock('flawless');
  if(pctNow>=90)unlock('p90');
  if(SAVE.settings.diff==='hard')unlock('hard');
  pgsSync();
};
recordScore=function(s){_recordScore(s);submit('hi',SAVE.hi)};
recordDaily=function(sc){const r=_recordDaily(sc);submit('daily',sc);if(pgsOn){unlock('daily1');steps('streak7',Math.min(7,SAVE.daily.streak||0))}return r};

/* --- Menü: kupa düğmesi --- */
function openRanks(){
  sfx.click();
  if(!pgsOn){showMsg({icon:'🏆',title:t('pgs.title'),html:t('pgs.off'),buttons:[{label:t('pgs.signin'),icon:'next',kind:'success',fn:()=>{pgsStart(true)}},{label:t('btn.menu'),icon:'home',ghost:true,fn:goMenu}]});return}
  showMsg({icon:'🏆',title:t('pgs.title'),html:'',buttons:[
    {label:t('pgs.lb'),icon:'next',kind:'success',fn:()=>{pgCall('showLeaderboards');goMenu()}},
    {label:t('pgs.ach'),icon:'next',fn:()=>{pgCall('showAchievements');goMenu()}},
    {label:t('btn.menu'),icon:'home',ghost:true,fn:goMenu}]});
}
async function pgsStart(manual){
  if(!PG)return;
  let r=null;try{r=await (manual?PG.signIn():PG.status())}catch(e){}
  pgsOn=!!(r&&r.signedIn);
  if(manual)goMenu();
  if(pgsOn){pgsSync();cloudLoad()}
}
if(PG){
  const b=document.getElementById('bRanks');if(b){b.hidden=false;b.addEventListener('click',openRanks)}
  pgsStart(false);
}
