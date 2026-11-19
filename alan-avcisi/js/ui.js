'use strict';
/* Arayüz: ekranlar, HUD, kontroller, ana döngü */
const $=s=>document.querySelector(s);
let joy=null,joyDir=null,keyDir=null,joyVec=null;const keys=[];
let settingsFrom='scrMenu';
const ICON={
  play:'<svg viewBox="0 0 24 24"><path d="M8 4.5v15l12-7.5z"/></svg>',
  next:'<svg viewBox="0 0 24 24"><path d="M5 4.5v15l9-7.5zM15 4.5h4v15h-4z"/></svg>',
  home:'<svg viewBox="0 0 24 24"><path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/></svg>',
  retry:'<svg viewBox="0 0 24 24"><path d="M12 5V1.5L7 6l5 4.5V7a5 5 0 1 1-5 5H4.5A7.5 7.5 0 1 0 12 5z"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L4.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>'
};
const DEF_SPRITE={ikiz:'ikizA'};
function bossImg(def){const im=ASSET.boss[DEF_SPRITE[def.id]||def.id];return im?im.src:null}
function ringIcon(def,emoji){
  const src=def&&bossImg(def);
  return `<div class="ring">${src?`<img src="${src}" alt="">`:`<span>${emoji||(def&&def.icon)||''}</span>`}</div>`;
}

/* ---------- Ekranlar ---------- */
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('hidden',s.id!==id));
}
function hideScreens(){show(null)}
function setInMenu(b){document.body.classList.toggle('inmenu',b)}

function showMsg({icon,iconHtml,title,html,buttons}){
  $('#msgIcon').innerHTML=iconHtml||(icon?`<div class="ring"><span>${icon}</span></div>`:'');
  $('#msgT').innerHTML=title||'';
  $('#msgP').innerHTML=html||'';
  const box=$('#msgBtns');box.innerHTML='';
  for(const b of buttons){
    const el=document.createElement('button');el.className='gbtn'+(b.ghost?' ghost':b.kind?' '+b.kind:' primary');
    el.innerHTML=(b.icon?`<span class="ic">${ICON[b.icon]}</span>`:'')+`<span class="lbl">${b.label}</span>`;
    el.addEventListener('click',()=>{ensureAudio();sfx.click();b.fn()});box.appendChild(el);
  }
  show('scrMsg');
}

/* ---------- Ana menü ---------- */
function refreshMenu(){
  const nx=nextLevelToPlay();
  $('#bPlay .lbl').textContent=nx>1?t('menu.continue',{n:nx}):t('menu.play');
  const c=clearedCount(BOSSES.length),fk=FINALS.map((f,i)=>1001+i);
  $('#mStat').innerHTML=(SAVE.hi?t('menu.best',{n:SAVE.hi})+'<br>':'')+(c?t('menu.progress',{a:c,b:BOSSES.length})+` · <span class="mStars">★ ${totalStars(BOSSES.length,fk)}/${(BOSSES.length+FINALS.length)*3}</span>`:'');
  const di=dailyInfo(),db=$('#bDaily');
  if(db){db.querySelector('.lbl').textContent=t('daily.btn');db.querySelector('.dsub').textContent=di.played?t('daily.best',{n:di.best}):dailyDef().icon+' '+t('boss.'+dailyDef().id+'.name');db.classList.toggle('played',di.played)}
}
function goMenu(){
  clearTimeout(clearTimer);
  state='menu';setInMenu(true);setupDemo();refreshMenu();show('scrMenu');
}
function setupDemo(){
  resetBoard();
  const lv=1+Math.floor(R()*BOSSES.length);
  level=lv;
  const def=bossForLevel(lv);
  enemies=[];shots=[];beams=[];sparks=[];powerups=[];fuse=null;parts=[];pops=[];
  player={x:W>>1,y:H-1,drawing:false,trail:[],sx:0,sy:0,acc:0};
  boss={def,hp:1,maxHp:1,tier:0,dead:false,timer:2,bs:10};
  try{def.setup(10,0)}catch(e){}
  for(let k=0;k<3;k++){const p=findFreeSpot(1.2);if(p)enemies.push(mkEnemy(p.x,p.y,1.1,14,false))}
  pic=genPicture(lv);
}
function menuUpdate(dt){
  clock+=dt;
  const def=boss&&boss.def;
  for(const e of enemies){
    if(def&&def.move&&def.move(e,dt))continue;
    if(Math.hypot(e.vx,e.vy)<.1)continue;
    wander(e,dt);moveEnt(e,dt);
  }
  if(def&&def.afterMove)try{def.afterMove(dt)}catch(e){}
}

/* ---------- Oyun akışı ---------- */
function startGame(lv){
  ensureAudio();
  level=lv;lives=startLives();score=0;prevTry=null;
  setInMenu(false);
  startLevel();
}
function onLevelStart(){
  const def=boss.def,name=t('boss.'+def.id+'.name');
  let title=t('intro.title',{n:level,name}),pre='';
  if(isFinal(level)){const F=finalOf(level),gn=t('boss.'+F.b+'.name');title=t('final.title',{n:level-1000,a:name,b:gn});pre=`<b style="color:#fde047">${t('final.note',{a:name,b:gn})}</b><br>`}
  if(isDaily(level)){title=t('daily.title',{name});pre=`<b style="color:#fde047">${t('daily.note')}</b><br>`}
  showMsg({iconHtml:ringIcon(def),title,
    html:`${pre}<b style="color:#f0abfc">${t('intro.how')}</b><br>${t('boss.'+def.id+'.how')}<br><span class="small">${t('intro.skip',{g:GOAL})}</span>${prevTry&&prevTry.lv===level?`<br><b style="color:#7cc8ff">${t('retry.prev',{n:prevTry.s})}</b>`:''}`,
    buttons:[{label:t('intro.start'),icon:'play',fn:()=>{hideScreens();state='play';last=performance.now()}}]});
}
function onLevelClear(bossKilled,secret,bonus){
  const name=t('boss.'+boss.def.id+'.name');
  let html='';
  if(bossKilled)html+=t('clear.defeated',{name})+'<br>';
  if(secret)html+=`<b style="color:#fde047">${t('clear.secretBody')}</b><br>`;
  html+=t('clear.body',{p:pctNow.toFixed(1),b:bonus})+'<br>'+t('clear.pic',{name:pic.themeName});
  const conds=[t('star.clear'),t('star.noDeath'),t('star.boss')],got=[true,levelDeaths===0,bossKilled];
  html=`<div class="starRow">${got.map((g,k)=>`<span class="bigStar${g?' on':''}" style="animation-delay:${.15+k*.25}s">★</span>`).join('')}</div>`+
       `<div class="starConds">${conds.map((c,k)=>`<span class="${got[k]?'on':''}">${got[k]?'✓':'○'} ${c}</span>`).join('')}</div>`+html;
  if(got.filter(Boolean).length)setTimeout(()=>{got.forEach((g,k)=>{if(g)setTimeout(()=>{tone(660+k*220,.12,'triangle',.05);buzz(12)},150+k*250)})},0);
  if(isDaily(level)){const nb=recordDaily(score+bonus);html+=`<br><b style="color:#fde047">${t('daily.score',{n:score+bonus})}${nb?' · '+t('daily.newBest'):''}</b><br>`+t('daily.streak',{n:(SAVE.daily||{}).streak||1})}
  const btns=isDaily(level)?[{label:t('btn.menu'),icon:'home',kind:'success',fn:goMenu}]:[{label:t('btn.next'),icon:'next',kind:'success',fn:()=>{level=nextAfter(level);startLevel()}},{label:t('btn.menu'),icon:'home',ghost:true,fn:goMenu}];
  showMsg({iconHtml:bossKilled?ringIcon(boss.def,'🏆'):ringIcon(null,secret?'✨':'⭐'),title:secret?t('clear.secret'):bossKilled?t('clear.boss'):t('clear.title',{n:levelLabel()}),html,buttons:btns});
}
function onGameOver(){
  let html=t('over.body',{s:score,n:levelLabel(),h:SAVE.hi});
  if(isDaily(level)){const nb=recordDaily(score);html=t('daily.score',{n:score})+(nb?' · '+t('daily.newBest'):'')+'<br>'+t('daily.streak',{n:(SAVE.daily||{}).streak||1})}
  showMsg({icon:'💥',title:t('over.title'),html,
    buttons:[{label:t('btn.retry'),icon:'retry',fn:()=>{prevTry={lv:level,s:score};lives=startLives();score=0;startLevel()}},{label:t('btn.menu'),icon:'home',ghost:true,fn:goMenu}]});
}
function pauseGame(){
  if(state!=='play')return;
  state='paused';showPause();
}
function showPause(){
  showMsg({icon:'⏸',title:t('pause.title'),html:t('pause.body',{n:levelLabel(),p:pctNow.toFixed(1)}),
    buttons:[{label:t('btn.resume'),icon:'play',fn:()=>{hideScreens();state='play';last=performance.now()}},
             {label:t('btn.settings'),icon:'gear',ghost:true,fn:()=>openSettings('pause')},
             {label:t('btn.menu'),icon:'home',ghost:true,fn:goMenu}]});
}

/* ---------- HUD ---------- */
function updateHud(){
  $('#lv').textContent=levelLabel();$('#sc').textContent=score;
  $('#lives').textContent=Math.max(0,lives);
  const p=Math.min(100,pctNow);
  $('#fill').style.width=p+'%';$('#pct').textContent=(LANG==='tr'?'%'+p.toFixed(1):p.toFixed(1)+'%')+' / '+(LANG==='tr'?'%'+GOAL:GOAL+'%');
}
let bossLast='';
function bossHud(force){
  if(!boss)return;
  const def=boss.def;
  let v=boss.dead?0:(def.bar?def.bar():boss.hp/boss.maxHp);
  const hint=boss.dead?'':(def.hint?def.hint():t('hb.hp',{a:boss.hp,b:boss.maxHp}));
  const name=def.icon+' '+up(t('boss.'+def.id+'.name'));
  const key=name+'|'+(v||0).toFixed(3)+'|'+hint;
  if(!force&&key===bossLast)return;bossLast=key;
  $('#bossName').textContent=name;$('#bossFill').style.width=(clamp01(v||0)*100)+'%';$('#bossHint').innerHTML=hint;
}
let fxLast='';
function fxHud(){
  const a=[];
  if(state!=='menu'){const v=Math.ceil(edgeShield);a.push(v>0?`<span style="color:${v<=15?'#ff6b7d':'#7cc8ff'}">🛡 ${v}</span>`:`<span style="color:#ff3b5c">🛡 ${t('fx.edgeOff')}</span>`)}
  if(effects.speed>0)a.push(`<span style="color:#ffd640">${t('fx.S')} ${Math.ceil(effects.speed)}</span>`);
  if(effects.freeze>0)a.push(`<span style="color:#5af0ff">${t('fx.F')} ${Math.ceil(effects.freeze)}</span>`);
  if(effects.shield>0)a.push(`<span style="color:#4ade80">${t('fx.K')} ${Math.ceil(effects.shield)}</span>`);
  const s=a.join('');if(s!==fxLast){$('#fx').innerHTML=s;fxLast=s}
}

/* ---------- Bölümler ---------- */
// gizli yolu olan bosslar (bölüm kartında soru işareti / altın işaret)
const SECRET_IDS=new Set(['goz','golem','kovan','ikiz','ejder','bomba','ayna','bukalemun','hortum','dev','saat','zar']);
function renderLevels(){
  const g=$('#lvGrid');g.innerHTML='';const nx=nextLevelToPlay();
  BOSSES.forEach((b,i)=>{
    const n=i+1,p=SAVE.prog[n]||{};
    const el=document.createElement('button');el.className='lv'+(p.done?' done':'')+(n===nx?' next':'');
    const src=bossImg(b);
    const st=p.stars||(p.done?(p.boss?2:1):0);
    const stars=[0,1,2].map(k=>`<i class="${k<st?'on':''}">★</i>`).join('');
    const gem=SECRET_IDS.has(b.id)?`<span class="gem${p.secret?' on':''}" title="${p.secret?t('levels.secretFound'):t('levels.secretHidden')}">${p.secret?'✦':'?'}</span>`:'';
    el.innerHTML=`<span class="no">${n}</span>${gem}${src?`<img class="th" src="${src}" alt="">`:`<span class="th">${b.icon}</span>`}<span class="nm">${t('boss.'+b.id+'.name')}</span><span class="stars">${stars}</span>`;
    el.addEventListener('click',()=>{sfx.click();startGame(n)});
    g.appendChild(el);
    const fi=FINALS.findIndex(f=>f.at===n);
    if(fi>=0){
      const F=FINALS[fi],fn=1001+fi,fp=SAVE.prog[fn]||{},fs=fp.stars||0,fe=document.createElement('button');
      fe.className='lv final'+(fp.done?' done':'');
      const ia=bossImg(BOSSES.find(b=>b.id===F.a)),ib=bossImg(BOSSES.find(b=>b.id===F.b));
      fe.innerHTML=`<span class="no">F${fi+1}</span><span class="duo">${ia?`<img src="${ia}" alt="">`:''}${ib?`<img src="${ib}" alt="">`:''}</span><span class="nm">${t('final.tile')}</span><span class="stars">${[0,1,2].map(k=>`<i class="${k<fs?'on':''}">★</i>`).join('')}</span>`;
      fe.addEventListener('click',()=>{sfx.click();startGame(fn)});g.appendChild(fe);
    }
  });
}

/* ---------- Ayarlar ---------- */
function openSettings(from){
  settingsFrom=from||'scrMenu';
  const s=SAVE.settings;
  $('#sSfx').value=Math.round(s.sfx*100);
  $('#sMusVol').value=Math.round(s.musicVol*100);
  $('#sMusic').classList.toggle('on',s.music);
  $('#sVib').classList.toggle('on',s.vib!==false);
  const L=$('#sLang');L.innerHTML='';
  const sel=document.createElement('select');sel.className='langSel';
  for(const code in LANGS){const o=document.createElement('option');o.value=code;o.textContent=LANGS[code];o.selected=code===LANG;sel.appendChild(o)}
  sel.addEventListener('change',()=>{sfx.click();setLang(sel.value);openSettings(settingsFrom)});L.appendChild(sel);
  const Dg=$('#sDiff');Dg.innerHTML='';
  for(const k of['easy','normal','hard']){const b=document.createElement('button');b.textContent=t('diff.'+k);b.classList.toggle('on',(s.diff||'normal')===k);
    b.addEventListener('click',()=>{sfx.click();s.diff=k;persist();openSettings(settingsFrom)});Dg.appendChild(b)}
  $('#resetBox').classList.add('hidden');$('#resetDone').classList.add('hidden');
  show('scrSettings');
}
function setLang(code){
  LANG=code;SAVE.settings.lang=code;persist();applyI18n();refreshMenu();updateHud();bossHud(true);
  if(pic&&boss)pic=genPicture(level);
}

/* ---------- Kontroller ---------- */
const jb=$('#joyB'),jk=$('#joyK');
function placeJoy(){jb.style.left=joy.ox+'px';jb.style.top=joy.oy+'px';jk.style.left=joy.kx+'px';jk.style.top=joy.ky+'px'}
window.addEventListener('pointerdown',e=>{
  ensureAudio();
  if(e.target.closest('button,.screen,input'))return;
  joy={id:e.pointerId,ox:e.clientX,oy:e.clientY,kx:e.clientX,ky:e.clientY};
  if(state==='play'){jb.style.display=jk.style.display='block';placeJoy()}
  e.preventDefault();
},{passive:false});
window.addEventListener('pointermove',e=>{
  if(!joy||e.pointerId!==joy.id)return;
  let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),max=44;
  if(d>max){joy.ox=e.clientX-dx/d*max;joy.oy=e.clientY-dy/d*max;dx=e.clientX-joy.ox;dy=e.clientY-joy.oy}
  joy.kx=e.clientX;joy.ky=e.clientY;
  joyDir=d<10?null:(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'));
  joyVec=d<10?null:{x:dx/d,y:dy/d};
  if(state==='play')placeJoy();
  e.preventDefault();
},{passive:false});
function endJoy(e){if(!joy||e.pointerId!==joy.id)return;joy=null;joyDir=null;joyVec=null;jb.style.display=jk.style.display='none'}
window.addEventListener('pointerup',endJoy);window.addEventListener('pointercancel',endJoy);
const KM={ArrowUp:'U',ArrowDown:'D',ArrowLeft:'L',ArrowRight:'R',w:'U',s:'D',a:'L',d:'R',W:'U',S:'D',A:'L',D:'R'};
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){pauseGame();return}
  const k=KM[e.key];if(!k)return;e.preventDefault();ensureAudio();if(!keys.includes(k))keys.push(k);keyDir=keys[keys.length-1];
});
window.addEventListener('keyup',e=>{const k=KM[e.key];if(!k)return;const i=keys.indexOf(k);if(i>=0)keys.splice(i,1);keyDir=keys[keys.length-1]||null});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});

/* ---------- Düğmeler ---------- */
$('#bDaily').addEventListener('click',()=>{sfx.click();startGame(2000)});
$('#bPlay').addEventListener('click',()=>{sfx.click();if(!SAVE.seenTut)openTut(true);else startGame(nextLevelToPlay())});
$('#bLevels').addEventListener('click',()=>{sfx.click();renderLevels();show('scrLevels')});
$('#bSettings').addEventListener('click',()=>{sfx.click();openSettings('scrMenu')});
$('#bHelp').addEventListener('click',()=>{sfx.click();openTut(false)});
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>{sfx.click();show('scrMenu')}));
$('#sBack').addEventListener('click',()=>{sfx.click();if(settingsFrom==='pause')showPause();else show('scrMenu')});
$('#pauseBtn').addEventListener('click',pauseGame);
$('#sSfx').addEventListener('input',e=>{SAVE.settings.sfx=e.target.value/100;persist();applyVolumes()});
$('#sSfx').addEventListener('change',()=>sfx.pu());
$('#sMusVol').addEventListener('input',e=>{SAVE.settings.musicVol=e.target.value/100;persist();applyVolumes()});
$('#sMusic').addEventListener('click',()=>{SAVE.settings.music=!SAVE.settings.music;persist();applyVolumes();openSettings(settingsFrom)});
$('#sVib').addEventListener('click',()=>{SAVE.settings.vib=SAVE.settings.vib===false;persist();if(SAVE.settings.vib)buzz(40);openSettings(settingsFrom)});
$('#sReset').addEventListener('click',()=>$('#resetBox').classList.remove('hidden'));
$('#sResetNo').addEventListener('click',()=>$('#resetBox').classList.add('hidden'));
$('#sResetYes').addEventListener('click',()=>{resetProgress();$('#resetBox').classList.add('hidden');$('#resetDone').classList.remove('hidden');refreshMenu()});

/* ---------- Boyut / döngü ---------- */
function resize(){
  const st=$('#stage').getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,SAVE.settings.fx>=2?1.5:2);
  cpx=Math.max(2,Math.floor(Math.min((st.width-8)/W,(st.height-8)/H)*dpr));
  cv.width=W*cpx;cv.height=H*cpx;
  cv.style.width=(cv.width/dpr)+'px';cv.style.height=(cv.height/dpr)+'px';
  if(boss)pic=genPicture(level);
}
window.addEventListener('resize',resize);
let last=performance.now();
// Telefon zorlanırsa efektleri kendiliğinden azalt
let perfT=0,perfN=0;
function lowShadows(){Object.defineProperty(ctx,'shadowBlur',{set(){},get(){return 0},configurable:true})}
function perfWatch(raw){
  if(state!=='play'||document.hidden||raw>.25)return;
  perfT+=raw;perfN++;
  if(perfT<2.5)return;
  const avg=perfT/perfN;perfT=0;perfN=0;
  if(avg>.024&&(SAVE.settings.fx||0)<2){SAVE.settings.fx=(SAVE.settings.fx||0)+1;persist();if(SAVE.settings.fx>=1)lowShadows();if(SAVE.settings.fx>=2)resize()}
}
function loop(tm){
  const raw=(tm-last)/1000,dt=Math.min(.05,raw);last=tm;
  perfWatch(raw);
  update(dt);draw(tm);
  requestAnimationFrame(loop);
}

/* ---------- Açılış ---------- */
loadSave();
LANG=SAVE.settings.lang||detectLang();
applyI18n();
if(SAVE.settings.fx>=1)lowShadows();
resize();
goMenu();
loadAssets(n=>{if(boss&&((level-1)%THEMES.length)+1===n)pic=genPicture(level)});
requestAnimationFrame(loop);
