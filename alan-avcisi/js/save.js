'use strict';
/* Ayarlar + ilerleme (cihazda localStorage'da tutulur) */
const SAVE_KEY='alanAvcisi.v2';
const SAVE={settings:{sfx:.8,music:true,musicVol:.5,lang:null,diff:'normal',fx:0,vib:true},prog:{},hi:0};

function loadSave(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(s){Object.assign(SAVE.settings,s.settings||{});SAVE.prog=s.prog||{};SAVE.hi=s.hi||0;SAVE.daily=s.daily||null;SAVE.seenTut=s.seenTut||(Object.keys(SAVE.prog).length?1:0)}
  }catch(e){}
  try{const old=+localStorage.getItem('alanAvcisiHi')||0;if(old>SAVE.hi)SAVE.hi=old}catch(e){}
}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(e){}}
function recordClear(lv,info){
  const p=SAVE.prog[lv]||{};
  p.done=true;p.boss=!!(p.boss||info.boss);p.secret=!!(p.secret||info.secret);
  p.best=Math.max(p.best||0,info.score||0);
  p.stars=Math.max(p.stars||0,info.stars||0);
  SAVE.prog[lv]=p;persist();
}
function totalStars(max,extra){let c=0;const ks=[];for(let i=1;i<=max;i++)ks.push(i);for(const k of extra||[])ks.push(k);for(const i of ks)if(SAVE.prog[i])c+=SAVE.prog[i].stars||(SAVE.prog[i].done?(SAVE.prog[i].boss?2:1):0);return c}
function recordScore(s){if(s>SAVE.hi){SAVE.hi=s;persist()}}
function clearedCount(max){let c=0;for(let i=1;i<=max;i++)if(SAVE.prog[i]&&SAVE.prog[i].done)c++;return c}
function nextLevelToPlay(){
  let mx=0;for(const k in SAVE.prog)if(+k<1000&&SAVE.prog[k].done)mx=Math.max(mx,+k);
  return mx+1;
}
function resetProgress(){SAVE.prog={};SAVE.hi=0;try{localStorage.removeItem('alanAvcisiHi')}catch(e){}persist()}
